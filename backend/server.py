from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Header, Query, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
import base64
import csv
import resend

from models import (
    UserRegister, UserLogin, UserResponse, TemplateCreate, TemplateResponse,
    CertificateGenerate, CertificateResponse, EventCreate, EventResponse,
    DashboardStats, VerificationResponse, BulkCertificateRequest
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

# Create the main app
app = FastAPI(title="ArkCertify API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

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

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(seconds=JWT_EXPIRATION)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

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

# ============= PDF GENERATION =============
def generate_certificate_pdf(certificate_data: dict, template_data: dict) -> bytes:
    """
    Generate a certificate PDF using ReportLab
    """
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Front page
    # Background
    if template_data.get('background_front'):
        try:
            bg_data, _ = get_object(template_data['background_front'])
            bg_img = ImageReader(BytesIO(bg_data))
            p.drawImage(bg_img, 0, 0, width=width, height=height, preserveAspectRatio=True, mask='auto')
        except:
            pass
    
    # Logo
    if template_data.get('logo_url'):
        try:
            logo_data, _ = get_object(template_data['logo_url'])
            logo_img = ImageReader(BytesIO(logo_data))
            p.drawImage(logo_img, 50, height - 100, width=100, height=80, preserveAspectRatio=True, mask='auto')
        except:
            pass
    
    # Certificate text
    p.setFont("Helvetica-Bold", 36)
    p.drawCentredString(width / 2, height - 200, "Certificate of Achievement")
    
    p.setFont("Helvetica", 24)
    p.drawCentredString(width / 2, height - 280, certificate_data.get('participant_name', ''))
    
    p.setFont("Helvetica", 16)
    p.drawCentredString(width / 2, height - 330, f"has successfully completed")
    
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredString(width / 2, height - 370, certificate_data.get('course', ''))
    
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2, height - 420, f"Institution: {certificate_data.get('institution', 'ArkCertify')}")
    p.drawCentredString(width / 2, height - 445, f"Issue Date: {certificate_data.get('issue_date', datetime.now(timezone.utc).strftime('%Y-%m-%d'))}")
    
    # QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(f"{certificate_data.get('verification_url', '')}")
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    p.drawImage(ImageReader(qr_buffer), width - 150, 50, width=100, height=100)
    
    # Certificate ID
    p.setFont("Courier", 10)
    p.drawString(50, 50, f"ID: {certificate_data.get('certificate_code', '')}")
    
    p.showPage()
    
    # Back page
    if template_data.get('background_back'):
        try:
            bg_data, _ = get_object(template_data['background_back'])
            bg_img = ImageReader(BytesIO(bg_data))
            p.drawImage(bg_img, 0, 0, width=width, height=height, preserveAspectRatio=True, mask='auto')
        except:
            pass
    
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, height - 100, "Course Details")
    
    p.setFont("Helvetica", 12)
    y_position = height - 140
    
    description = certificate_data.get('description', 'This certificate validates the completion of the specified course.')
    for line in description.split('\n'):
        p.drawString(50, y_position, line)
        y_position -= 20
    
    p.drawString(50, y_position - 20, f"Duration: {certificate_data.get('hours', 'N/A')} hours")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer.read()

# ============= EMAIL FUNCTION =============
async def send_certificate_email(recipient_email: str, recipient_name: str, certificate_data: dict, pdf_data: bytes):
    """
    Send certificate via email using Resend
    """
    try:
        # Encode PDF as base64
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0A58CA;">Congratulations, {recipient_name}!</h2>
            <p>Your certificate is ready.</p>
            <p><strong>Course:</strong> {certificate_data.get('course', '')}</p>
            <p><strong>Certificate ID:</strong> {certificate_data.get('certificate_code', '')}</p>
            <p>You can verify your certificate at: {certificate_data.get('verification_url', '')}</p>
            <p>Your certificate is attached to this email.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px;">Powered by ArkCertify</p>
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

# ============= AUTH ROUTES =============
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "plan": "FREE",
        "role": "user",
        "email_verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user.email)
    
    return UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        plan="FREE",
        role="user",
        token=token
    )

@api_router.post("/auth/login", response_model=UserResponse)
async def login(user: UserLogin):
    user_doc = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not user_doc or not verify_password(user.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc['id'], user_doc['email'])
    
    return UserResponse(
        id=user_doc['id'],
        name=user_doc['name'],
        email=user_doc['email'],
        plan=user_doc.get('plan', 'FREE'),
        role=user_doc.get('role', 'user'),
        token=token
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        name=current_user['name'],
        email=current_user['email'],
        plan=current_user.get('plan', 'FREE'),
        role=current_user.get('role', 'user'),
        token=""
    )

# ============= FILE UPLOAD ROUTES =============
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    try:
        ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
        file_id = str(uuid.uuid4())
        path = f"{APP_NAME}/uploads/{current_user['id']}/{file_id}.{ext}"
        
        data = await file.read()
        result = put_object(path, data, file.content_type or "application/octet-stream")
        
        file_doc = {
            "id": file_id,
            "user_id": current_user['id'],
            "storage_path": result["path"],
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size": result.get("size", len(data)),
            "is_deleted": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.files.insert_one(file_doc)
        
        return {
            "id": file_id,
            "path": result["path"],
            "filename": file.filename,
            "size": result.get("size", len(data))
        }
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.get("/files/{file_id}")
async def download_file(
    file_id: str,
    authorization: str = Header(None),
    auth: str = Query(None),
    current_user = Depends(get_current_user)
):
    file_doc = await db.files.find_one(
        {"id": file_id, "is_deleted": False},
        {"_id": 0}
    )
    
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        data, content_type = get_object(file_doc["storage_path"])
        return Response(
            content=data,
            media_type=file_doc.get("content_type", content_type)
        )
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Download failed")

# ============= TEMPLATE ROUTES =============
@api_router.post("/templates", response_model=TemplateResponse)
async def create_template(template: TemplateCreate, current_user = Depends(get_current_user)):
    template_id = str(uuid.uuid4())
    template_doc = {
        "id": template_id,
        "user_id": current_user['id'],
        "name": template.name,
        "logo_url": template.logo_url,
        "background_front": template.background_front,
        "background_back": template.background_back,
        "elements": template.elements,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.templates.insert_one(template_doc)
    
    return TemplateResponse(**template_doc)

@api_router.get("/templates")
async def get_templates(current_user = Depends(get_current_user)):
    templates = await db.templates.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).to_list(1000)
    return templates

@api_router.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str, current_user = Depends(get_current_user)):
    template = await db.templates.find_one(
        {"id": template_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return TemplateResponse(**template)

@api_router.put("/templates/{template_id}", response_model=TemplateResponse)
async def update_template(template_id: str, template: TemplateCreate, current_user = Depends(get_current_user)):
    result = await db.templates.update_one(
        {"id": template_id, "user_id": current_user['id']},
        {"$set": template.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    updated = await db.templates.find_one(
        {"id": template_id},
        {"_id": 0}
    )
    return TemplateResponse(**updated)

@api_router.delete("/templates/{template_id}")
async def delete_template(template_id: str, current_user = Depends(get_current_user)):
    result = await db.templates.delete_one(
        {"id": template_id, "user_id": current_user['id']}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return {"message": "Template deleted"}

# ============= CERTIFICATE ROUTES =============
@api_router.post("/certificates/generate", response_model=CertificateResponse)
async def generate_certificate(cert_req: CertificateGenerate, current_user = Depends(get_current_user)):
    # Get template
    template = await db.templates.find_one(
        {"id": cert_req.template_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check plan limits
    if current_user.get('plan') == 'FREE':
        # Count certificates this month
        month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        count = await db.certificates.count_documents({
            "user_id": current_user['id'],
            "created_at": {"$gte": month_start.isoformat()}
        })
        if count >= 10:
            raise HTTPException(status_code=403, detail="Free plan limit reached (10 certificates/month)")
    
    certificate_id = str(uuid.uuid4())
    certificate_code = str(uuid.uuid4())
    
    # Generate PDF
    verification_url = f"https://arkcertify.com/verify/{certificate_code}"
    
    certificate_data = {
        "certificate_code": certificate_code,
        "participant_name": cert_req.participant_name,
        "course": cert_req.course,
        "institution": cert_req.institution,
        "issue_date": cert_req.issue_date or datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        "hours": cert_req.hours,
        "description": cert_req.description,
        "verification_url": verification_url
    }
    
    pdf_data = generate_certificate_pdf(certificate_data, template)
    
    # Upload PDF to storage
    pdf_path = f"{APP_NAME}/certificates/{current_user['id']}/{certificate_id}.pdf"
    pdf_result = put_object(pdf_path, pdf_data, "application/pdf")
    
    # Save certificate to DB
    certificate_doc = {
        "id": certificate_id,
        "user_id": current_user['id'],
        "template_id": cert_req.template_id,
        "participant_name": cert_req.participant_name,
        "participant_email": cert_req.participant_email,
        "course": cert_req.course,
        "institution": cert_req.institution,
        "certificate_code": certificate_code,
        "pdf_url": pdf_result["path"],
        "issue_date": cert_req.issue_date or datetime.now(timezone.utc).strftime('%Y-%m-%d'),
        "hours": cert_req.hours,
        "description": cert_req.description,
        "status": "VALID",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.certificates.insert_one(certificate_doc)
    
    # Send email if requested
    if cert_req.send_email and cert_req.participant_email:
        await send_certificate_email(
            cert_req.participant_email,
            cert_req.participant_name,
            certificate_data,
            pdf_data
        )
    
    return CertificateResponse(**certificate_doc)

@api_router.post("/certificates/bulk")
async def bulk_generate_certificates(
    file: UploadFile = File(...),
    template_id: str = Query(...),
    send_email: bool = Query(False),
    current_user = Depends(get_current_user)
):
    # Parse CSV
    content = await file.read()
    csv_data = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(csv_data))
    
    certificates = []
    
    for row in reader:
        cert_req = CertificateGenerate(
            template_id=template_id,
            participant_name=row.get('name', ''),
            participant_email=row.get('email', ''),
            course=row.get('course', ''),
            institution=row.get('institution', 'ArkCertify'),
            hours=row.get('hours', ''),
            description=row.get('description', ''),
            send_email=send_email
        )
        
        try:
            cert = await generate_certificate(cert_req, current_user)
            certificates.append(cert)
        except Exception as e:
            logger.error(f"Failed to generate certificate for {row.get('name')}: {str(e)}")
    
    return {
        "message": f"Generated {len(certificates)} certificates",
        "certificates": certificates
    }

@api_router.get("/certificates")
async def get_certificates(current_user = Depends(get_current_user)):
    certificates = await db.certificates.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).to_list(1000)
    return certificates

@api_router.get("/certificates/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(certificate_id: str, current_user = Depends(get_current_user)):
    certificate = await db.certificates.find_one(
        {"id": certificate_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return CertificateResponse(**certificate)

@api_router.delete("/certificates/{certificate_id}")
async def delete_certificate(certificate_id: str, current_user = Depends(get_current_user)):
    result = await db.certificates.delete_one(
        {"id": certificate_id, "user_id": current_user['id']}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return {"message": "Certificate deleted"}

# ============= PUBLIC VERIFICATION ROUTE =============
@api_router.get("/verify/{certificate_code}", response_model=VerificationResponse)
async def verify_certificate(certificate_code: str):
    certificate = await db.certificates.find_one(
        {"certificate_code": certificate_code},
        {"_id": 0}
    )
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return VerificationResponse(
        certificate_code=certificate['certificate_code'],
        participant_name=certificate['participant_name'],
        course=certificate['course'],
        institution=certificate.get('institution', 'ArkCertify'),
        issue_date=certificate['issue_date'],
        status=certificate.get('status', 'VALID'),
        hours=certificate.get('hours', ''),
        description=certificate.get('description', '')
    )

# ============= EVENT ROUTES =============
@api_router.post("/events", response_model=EventResponse)
async def create_event(event: EventCreate, current_user = Depends(get_current_user)):
    event_id = str(uuid.uuid4())
    event_doc = {
        "id": event_id,
        "user_id": current_user['id'],
        "name": event.name,
        "date": event.date,
        "template_id": event.template_id,
        "status": "upcoming",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.events.insert_one(event_doc)
    return EventResponse(**event_doc)

@api_router.get("/events")
async def get_events(current_user = Depends(get_current_user)):
    events = await db.events.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).to_list(1000)
    return events

@api_router.get("/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, current_user = Depends(get_current_user)):
    event = await db.events.find_one(
        {"id": event_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse(**event)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user = Depends(get_current_user)):
    result = await db.events.delete_one(
        {"id": event_id, "user_id": current_user['id']}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event deleted"}

# ============= DASHBOARD ROUTES =============
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user = Depends(get_current_user)):
    total_certificates = await db.certificates.count_documents(
        {"user_id": current_user['id']}
    )
    
    total_templates = await db.templates.count_documents(
        {"user_id": current_user['id']}
    )
    
    total_events = await db.events.count_documents(
        {"user_id": current_user['id']}
    )
    
    # Count this month's certificates
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_certificates = await db.certificates.count_documents({
        "user_id": current_user['id'],
        "created_at": {"$gte": month_start.isoformat()}
    })
    
    return DashboardStats(
        total_certificates=total_certificates,
        total_templates=total_templates,
        total_events=total_events,
        month_certificates=month_certificates
    )

# ============= ROOT ROUTES =============
@api_router.get("/")
async def root():
    return {"message": "ArkCertify API v1.0", "status": "running"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("✓ Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
