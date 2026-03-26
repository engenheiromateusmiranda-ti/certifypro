from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    role: str
    token: str = ""

class TemplateCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    background_front: Optional[str] = None
    background_back: Optional[str] = None
    elements: Optional[Any] = None

class TemplateResponse(BaseModel):
    id: str
    user_id: str
    name: str
    logo_url: Optional[str] = None
    background_front: Optional[str] = None
    background_back: Optional[str] = None
    elements: Optional[Any] = None
    created_at: str

class CertificateGenerate(BaseModel):
    template_id: str
    participant_name: str
    participant_email: Optional[str] = None
    course: str
    institution: str = "ArkCertify"
    issue_date: Optional[str] = None
    hours: Optional[str] = None
    description: Optional[str] = None
    send_email: bool = False

class CertificateResponse(BaseModel):
    id: str
    user_id: str
    template_id: str
    participant_name: str
    participant_email: Optional[str] = None
    course: str
    institution: str
    certificate_code: str
    pdf_url: str
    issue_date: str
    hours: Optional[str] = None
    description: Optional[str] = None
    status: str
    created_at: str

class BulkCertificateRequest(BaseModel):
    template_id: str
    send_email: bool = False

class EventCreate(BaseModel):
    name: str
    date: str
    template_id: str

class EventResponse(BaseModel):
    id: str
    user_id: str
    name: str
    date: str
    template_id: str
    status: str
    created_at: str

class DashboardStats(BaseModel):
    total_certificates: int
    total_templates: int
    total_events: int
    month_certificates: int

class VerificationResponse(BaseModel):
    certificate_code: str
    participant_name: str
    course: str
    institution: str
    issue_date: str
    status: str
    hours: Optional[str] = None
    description: Optional[str] = None
