from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Common Configuration for ORM mapping (supports both Pydantic v1 and v2)
class ConfigBase(BaseModel):
    class Config:
        orm_mode = True
        from_attributes = True

# Authentication
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(ConfigBase):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Leads
class LeadCreate(BaseModel):
    name: str
    service: str
    budget: float
    priority: str = "Medium"
    score: int = 50
    status: str = "New"
    source: str = "AI Chatbot"

class LeadResponse(ConfigBase):
    id: int
    name: str
    service: str
    budget: float
    priority: str
    score: int
    status: str
    source: str
    created_at: datetime
    user_id: Optional[int] = None

# Customers
class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    status: str = "Active"
    revenue: float = 0.0

class CustomerResponse(ConfigBase):
    id: int
    name: str
    email: EmailStr
    phone: str
    status: str
    revenue: float
    joined_at: datetime
    user_id: Optional[int] = None

# Tickets
class TicketCreate(BaseModel):
    id: str
    customer_name: str
    issue: str
    priority: str = "Medium"
    status: str = "Open"
    category: str = "General Help"

class TicketResponse(ConfigBase):
    id: str
    customer_name: str
    issue: str
    priority: str
    status: str
    category: str
    created_at: datetime
    user_id: Optional[int] = None

# Conversations
class ConversationCreate(BaseModel):
    messages: str
    extracted_info: str
    status: str = "Active"

class ConversationResponse(ConfigBase):
    id: int
    messages: str
    extracted_info: str
    status: str
    created_at: datetime
    user_id: Optional[int] = None

# Chat request / responses
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    intent: str
    extracted_info: Optional[Dict[str, Any]] = None
