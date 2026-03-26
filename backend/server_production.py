from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Header, Query, Response, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import asyncio
import io
import requests
import qrcode
from io import BytesIO
import base64
import csv
import resend
import secrets
from playwright.async_api import async_playwright
import aiofiles
from typing import Optional

from models import (
    UserRegister, UserLogin, UserResponse, TemplateCreate, TemplateResponse,
    CertificateGenerate, CertificateResponse, EventCreate, EventResponse,
    DashboardStats, VerificationResponse, OrganizationResponse, TeamInvite,
    TeamMemberResponse, APIKeyCreate, APIKeyResponse, SubscriptionCreate,
    SubscriptionResponse, PayPalWebhook, PlanType, UserRole, SubscriptionStatus
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Resend
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = 24 * 60 * 60  # 24 hours

# Storage Config
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
APP_NAME = "arkcertify"
storage_key = None

# PayPal Config
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', '')
PAYPAL_SECRET = os.environ.get('PAYPAL_SECRET', '')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')
PAYPAL_BASE_URL = f"https://api-m.{PAYPAL_MODE}.paypal.com"

# Plan Limits
PLAN_LIMITS = {
    PlanType.FREE: 10,
    PlanType.PRO: None,  # Unlimited
    PlanType.ENTERPRISE: None  # Unlimited
}

# Create the main app
app = FastAPI(title="ArkCertify Production API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= STORAGE FUNCTIONS =============
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(
            f"{STORAGE_URL}/init",
            json={"emergent_key": EMERGENT_KEY},
            timeout=30
        )
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        raise

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ============= AUTH FUNCTIONS =============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, organization_id: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'organization_id': organization_id,
        'exp': datetime.now(timezone.utc) + timedelta(seconds=JWT_EXPIRATION)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_api_key() -> str:
    return f"ark_{secrets.token_urlsafe(32)}"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_organization(user = Depends(get_current_user)):
    org = await db.organizations.find_one({"id": user['organization_id']}, {"_id": 0})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if not api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    org = await db.organizations.find_one({"api_key": api_key}, {"_id": 0})
    if not org:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if org.get('plan') != PlanType.ENTERPRISE:
        raise HTTPException(status_code=403, detail="API access requires Enterprise plan")
    
    return org

async def check_certificate_limit(organization_id: str, plan: str):
    limit = PLAN_LIMITS.get(plan)
    if limit is None:
        return True
    
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    count = await db.certificates.count_documents({
        "organization_id": organization_id,
        "created_at": {"$gte": month_start.isoformat()}
    })
    
    if count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Certificate limit reached for {plan} plan ({limit}/month). Please upgrade."
        )
    
    return True

# ============= PDF GENERATION WITH PLAYWRIGHT =============
async def generate_certificate_pdf_playwright(certificate_data: dict, template_data: dict) -> bytes:
    """
    Generate certificate PDF using Playwright for high-quality rendering
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: A4;
                margin: 0;
            }}
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                width: 210mm;
                height: 297mm;
            }}
            .page {{
                width: 210mm;
                height: 297mm;
                position: relative;
                page-break-after: always;
            }}
            .certificate-front {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 60px;
            }}
            .certificate-title {{
                font-size: 48px;
                font-weight: bold;
                margin-bottom: 40px;
                letter-spacing: 2px;
            }}
            .participant-name {{
                font-size: 36px;
                font-weight: bold;
                margin: 30px 0;
                padding: 20px 40px;
                border-top: 3px solid white;
                border-bottom: 3px solid white;
            }}
            .course-name {{
                font-size: 28px;
                margin: 20px 0;
            }}
            .details {{
                font-size: 18px;
                margin: 10px 0;
                opacity: 0.9;
            }}
            .qr-code {{
                position: absolute;
                bottom: 40px;
                right: 40px;
                background: white;
                padding: 10px;
                border-radius: 8px;
            }}
            .cert-id {{
                position: absolute;
                bottom: 40px;
                left: 40px;
                font-size: 12px;
                font-family: monospace;
                opacity: 0.8;
            }}
            .back-page {{
                background: #f8f9fa;
                padding: 60px;
            }}
            .back-title {{
                font-size: 32px;
                color: #667eea;
                margin-bottom: 30px;
                font-weight: bold;
            }}
            .back-content {{
                font-size: 16px;
                line-height: 1.8;
                color: #333;
            }}
        </style>
    </head>
    <body>
        <!-- Front Page -->
        <div class="page certificate-front">
            <div class="certificate-title">Certificate of Achievement</div>
            <div style="font-size: 20px; margin: 20px 0;">This certifies that</div>
            <div class="participant-name">{certificate_data.get('participant_name', '')}</div>
            <div style="font-size: 20px; margin: 20px 0;">has successfully completed</div>
            <div class="course-name">{certificate_data.get('course', '')}</div>
            <div class="details">Institution: {certificate_data.get('institution', 'ArkCertify')}</div>
            {f'<div class="details">Instructor: {certificate_data.get("instructor", "")}</div>' if certificate_data.get('instructor') else ''}
            <div class="details">Issue Date: {certificate_data.get('issue_date', '')}</div>
            {f'<div class="details">Duration: {certificate_data.get("hours", "")} hours</div>' if certificate_data.get('hours') else ''}
            
            <div class="cert-id">ID: {certificate_data.get('certificate_code', '')}</div>
            <div class="qr-code">
                <img src="{certificate_data.get('qr_code_data', '')}" width="100" height="100" />
            </div>
        </div>
        
        <!-- Back Page -->
        <div class="page back-page">
            <div class="back-title">Course Details</div>
            <div class="back-content">
                <p><strong>Course:</strong> {certificate_data.get('course', '')}</p>
                <p><strong>Description:</strong></p>
                <p>{certificate_data.get('description', 'This certificate validates successful completion of the specified course.')}</p>
                <p><strong>Institution:</strong> {certificate_data.get('institution', 'ArkCertify')}</p>
                {f'<p><strong>Instructor:</strong> {certificate_data.get("instructor", "")}</p>' if certificate_data.get('instructor') else ''}
                {f'<p><strong>Duration:</strong> {certificate_data.get("hours", "")} hours</p>' if certificate_data.get('hours') else ''}
                <p><strong>Issue Date:</strong> {certificate_data.get('issue_date', '')}</p>
                <hr style="margin: 30px 0; border: none; border-top: 2px solid #667eea;"/>
                <p style="font-size: 14px; color: #666;">
                    This certificate can be verified at:<br/>
                    {certificate_data.get('verification_url', '')}
                </p>
                <p style="font-size: 12px; color: #999; margin-top: 40px;">
                    Certificate ID: {certificate_data.get('certificate_code', '')}<br/>
                    Powered by ArkCertify - Professional Certificate Automation
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html_content)
        pdf_bytes = await page.pdf(format='A4', print_background=True)
        await browser.close()
    
    return pdf_bytes

def generate_qr_code_base64(data: str) -> str:
    """Generate QR code and return as base64 data URL"""
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode()
    return f"data:image/png;base64,{img_base64}"

# ============= BACKGROUND TASKS =============
async def send_certificate_email_background(recipient_email: str, recipient_name: str, certificate_data: dict, pdf_data: bytes):
    """Background task for sending certificate emails"""
    try:
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-bottom: 20px;">Congratulations, {recipient_name}!</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">Your certificate is ready and attached to this email.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Course:</strong> {certificate_data.get('course', '')}</p>
                    <p style="margin: 5px 0;"><strong>Certificate ID:</strong> <code>{certificate_data.get('certificate_code', '')}</code></p>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                    You can verify your certificate anytime at:<br/>
                    <a href="{certificate_data.get('verification_url', '')}" style="color: #667eea;">{certificate_data.get('verification_url', '')}</a>
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;"/>
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Powered by ArkCertify - Professional Certificate Automation<br/>
                    This is an automated email. Please do not reply.
                </p>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [recipient_email],
            "subject": f"Your Certificate - {certificate_data.get('course', '')}",
            "html": html_content,
            "attachments": [{
                "filename": f"certificate_{certificate_data.get('certificate_code', 'cert')}.pdf",
                "content": pdf_base64
            }]
        }
        
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {recipient_email}: {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

# ============= PAYPAL FUNCTIONS =============
async def get_paypal_access_token():
    """Get PayPal OAuth access token"""
    try:
        auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_SECRET}".encode()).decode()
        headers = {
            "Authorization": f"Basic {auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}
        
        resp = await asyncio.to_thread(
            requests.post,
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            headers=headers,
            data=data
        )
        resp.raise_for_status()
        return resp.json()["access_token"]
    except Exception as e:
        logger.error(f"PayPal auth failed: {e}")
        raise HTTPException(status_code=500, detail="PayPal authentication failed")

# Continue com mais endpoints no próximo arquivo...
