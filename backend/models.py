from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

class PlanType(str, Enum):
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "ENTERPRISE"

class SubscriptionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    PENDING = "PENDING"

# Auth Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    organization_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    organization_id: str
    role: str
    token: str = ""

# Organization Models
class OrganizationCreate(BaseModel):
    name: str
    plan: PlanType = PlanType.FREE

class OrganizationResponse(BaseModel):
    id: str
    name: str
    plan: PlanType
    subscription_status: SubscriptionStatus
    api_key: Optional[str] = None
    certificates_this_month: int
    created_at: str

# Team Models
class TeamInvite(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.MEMBER

class TeamMemberResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    joined_at: str

# Subscription Models
class SubscriptionCreate(BaseModel):
    plan: PlanType
    paypal_subscription_id: Optional[str] = None

class SubscriptionResponse(BaseModel):
    id: str
    organization_id: str
    plan: PlanType
    status: SubscriptionStatus
    paypal_subscription_id: Optional[str] = None
    current_period_start: str
    current_period_end: str
    created_at: str

# Template Models
class TemplateElement(BaseModel):
    id: str
    type: str  # text, image, qr
    x: float
    y: float
    width: float
    height: float
    content: Optional[str] = None
    fontSize: Optional[int] = None
    fontFamily: Optional[str] = None
    color: Optional[str] = None
    rotation: Optional[float] = 0
    zIndex: Optional[int] = 0

class TemplateCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    background_front: Optional[str] = None
    background_back: Optional[str] = None
    elements: Optional[List[TemplateElement]] = []

class TemplateResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    logo_url: Optional[str] = None
    background_front: Optional[str] = None
    background_back: Optional[str] = None
    elements: Optional[List[TemplateElement]] = []
    created_at: str

# Certificate Models
class CertificateGenerate(BaseModel):
    template_id: str
    participant_name: str
    participant_email: Optional[str] = None
    course: str
    institution: Optional[str] = None
    instructor: Optional[str] = None
    issue_date: Optional[str] = None
    hours: Optional[str] = None
    description: Optional[str] = None
    send_email: bool = False

class CertificateResponse(BaseModel):
    id: str
    organization_id: str
    template_id: str
    participant_name: str
    participant_email: Optional[str] = None
    course: str
    institution: Optional[str] = None
    instructor: Optional[str] = None
    certificate_code: str
    pdf_url: str
    issue_date: str
    hours: Optional[str] = None
    description: Optional[str] = None
    status: str
    verification_count: int = 0
    created_at: str

class BulkCertificateRequest(BaseModel):
    template_id: str
    send_email: bool = False

# Event Models
class EventCreate(BaseModel):
    name: str
    date: str
    template_id: str

class EventResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    date: str
    template_id: str
    status: str
    created_at: str

# API Key Models
class APIKeyCreate(BaseModel):
    name: str

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key: str
    created_at: str

# Dashboard Models
class DashboardStats(BaseModel):
    total_certificates: int
    total_templates: int
    total_events: int
    month_certificates: int
    total_verifications: int
    team_members: int
    plan: str
    certificates_limit: Optional[int] = None

# Verification Models
class VerificationResponse(BaseModel):
    certificate_code: str
    participant_name: str
    course: str
    institution: Optional[str] = None
    instructor: Optional[str] = None
    issue_date: str
    status: str
    organization_name: str
    hours: Optional[str] = None
    description: Optional[str] = None
    verified_at: str

# PayPal Webhook
class PayPalWebhook(BaseModel):
    event_type: str
    resource: Dict[str, Any]
