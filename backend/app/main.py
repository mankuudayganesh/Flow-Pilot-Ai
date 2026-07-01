import os
import random
import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import engine, Base, get_db
from app.models import User, Lead, Customer, Ticket, Conversation
from app import schemas, auth, ai

# Initialize FastAPI App
app = FastAPI(title="FlowPilot AI Backend", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local development and hackathons
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schemas and seed tables on startup
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    
    # Seed a default demo user and records if database is empty
    db = next(get_db())
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            # Create a default operator
            hashed_pwd = auth.get_password_hash("password123")
            demo_user = User(
                username="operator",
                email="operator@flowpilot.ai",
                hashed_password=hashed_pwd
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Seed Leads
            leads = [
                Lead(name="Acme Corp Ltd", service="Enterprise SaaS Integration", budget=35000, priority="High", score=96, status="Active", source="AI Chatbot", user_id=demo_user.id),
                Lead(name="Global Retail Inc", service="Ecommerce Solution", budget=25000, priority="High", score=92, status="New", source="AI Chatbot", user_id=demo_user.id),
                Lead(name="Synergy Labs", service="Database Support Automation", budget=12000, priority="Medium", score=78, status="Contacted", source="AI Chatbot", user_id=demo_user.id),
                Lead(name="Beta App Corp", service="API Workflow Integration", budget=50000, priority="High", score=94, status="New", source="AI Chatbot", user_id=demo_user.id),
                Lead(name="Apex Solutions", service="Cloud Consulting Operations", budget=8000, priority="Low", score=54, status="Lost", source="Form Submission", user_id=demo_user.id),
            ]
            db.add_all(leads)

            # Seed Customers
            customers = [
                Customer(name="Acme Corp", email="contact@acme.com", phone="+1 (555) 019-2831", status="Active", revenue=35000.0, user_id=demo_user.id),
                Customer(name="Hedge Mutual Fund", email="ops@hedgemutual.com", phone="+1 (555) 024-9182", status="Active", revenue=75000.0, user_id=demo_user.id),
                Customer(name="Alice Johnson", email="alice.j@retailshop.com", phone="+1 (555) 089-1290", status="Active", revenue=25000.0, user_id=demo_user.id),
                Customer(name="Global Retail Inc", email="info@globalretail.com", phone="+1 (555) 012-4821", status="Active", revenue=22000.0, user_id=demo_user.id),
            ]
            db.add_all(customers)

            # Seed Tickets
            tickets = [
                Ticket(id="FP-4982", customer_name="Jane Doe", issue="Database crash on production server - site down!", priority="High", status="Open", category="Database Error", user_id=demo_user.id),
                Ticket(id="FP-2384", customer_name="John Smith", issue="Requesting custom API integration docs for Stripe", priority="Medium", status="In Progress", category="API Guidance", user_id=demo_user.id),
                Ticket(id="FP-8921", customer_name="Alice Johnson", issue="Billing discrepancy on invoice #INV-92839", priority="Low", status="Resolved", category="Billing Request", user_id=demo_user.id),
            ]
            db.add_all(tickets)
            db.commit()
            print("Successfully pre-seeded default demo database logs.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()


# --- Authentication Routes ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user_schema: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_schema.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    db_username = db.query(User).filter(User.username == user_schema.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username is already taken")

    hashed_password = auth.get_password_hash(user_schema.password)
    new_user = User(
        username=user_schema.username,
        email=user_schema.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Note: OAuth2PasswordRequestForm expects username field, which can contain username or email
    user = db.query(User).filter((User.username == form_data.username) | (User.email == form_data.username)).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email/username or password")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: User = Depends(auth.get_current_user)):
    return current_user


# --- AI Chat Router ---

@app.post("/api/ai/chat", response_model=schemas.ChatResponse)
async def chat_message(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    # Optional authorization to keep local demos smooth without strict logins
    token: Optional[str] = Depends(auth.oauth2_scheme)
):
    # Find current user or fall back to default demo user
    user_id = None
    if token:
        try:
            current_user = await auth.get_current_user(token, db)
            user_id = current_user.id
        except Exception:
            pass
    
    if not user_id:
        default_user = db.query(User).first()
        user_id = default_user.id if default_user else 1

    # Extract Gemini config key if defined in localstorage or environment
    # Let's perform Gemini classification
    intent, reply, extracted = await ai.analyze_message_with_ai(payload.message)

    # Automatically save database states depending on intent
    try:
        if intent == "Sales Inquiry":
            # Extract parameters
            service = extracted.get("service") or "General Web Application"
            budget = extracted.get("budget") or 25000.0
            priority = extracted.get("priority") or "Medium"
            score = extracted.get("score") or 70

            # Log Lead
            new_lead = Lead(
                name="Inquiry Lead Opportunity",
                service=service,
                budget=budget,
                priority=priority,
                score=score,
                status="New",
                source="AI Chatbot",
                user_id=user_id
            )
            db.add(new_lead)

            # Log Customer
            new_customer = Customer(
                name="Inquiry Lead Customer",
                email=f"client-{random.randint(100, 999)}@gmail.com",
                phone="+1 (555) 012-" + str(random.randint(1000, 9999)),
                status="Prospect",
                revenue=budget,
                user_id=user_id
            )
            db.add(new_customer)
            db.commit()

        elif intent == "Support Request":
            # Extract parameters
            issue = payload.message
            priority = extracted.get("priority") or "Medium"
            category = extracted.get("service") or "General Help"

            # Create Support Ticket
            new_ticket = Ticket(
                id=f"FP-{random.randint(1000, 9999)}",
                customer_name="Chat Customer User",
                issue=issue,
                priority=priority,
                status="Open",
                category=category,
                user_id=user_id
            )
            db.add(new_ticket)
            db.commit()

        # Log Conversation history
        new_conv = Conversation(
            messages=json.dumps([{"role": "user", "content": payload.message}, {"role": "assistant", "content": reply}]),
            extracted_info=json.dumps(extracted),
            status="Active",
            user_id=user_id
        )
        db.add(new_conv)
        db.commit()

    except Exception as e:
        print(f"Error logging database entries dynamically: {e}")
        db.rollback()

    return {
        "reply": reply,
        "intent": intent,
        "extracted_info": extracted
    }


# --- Leads Endpoints ---

@app.get("/api/leads", response_model=List[schemas.LeadResponse])
def get_leads(db: Session = Depends(get_db), token: Optional[str] = Depends(auth.oauth2_scheme)):
    # Simple list (returning all leads for easier hackathon sharing/visibility, fallbacks to owner user if filtered)
    return db.query(Lead).order_by(Lead.created_at.desc()).all()

@app.post("/api/leads", response_model=schemas.LeadResponse)
def create_lead(lead_schema: schemas.LeadCreate, db: Session = Depends(get_db), token: Optional[str] = Depends(auth.oauth2_scheme)):
    # Resolve user context
    user_id = None
    if token:
        try:
            payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            username = payload.get("sub")
            user = db.query(User).filter(User.username == username).first()
            user_id = user.id if user else None
        except Exception:
            pass
    if not user_id:
        user_id = 1

    new_lead = Lead(
        name=lead_schema.name,
        service=lead_schema.service,
        budget=lead_schema.budget,
        priority=lead_schema.priority,
        score=lead_schema.score,
        status=lead_schema.status,
        source=lead_schema.source,
        user_id=user_id
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead


# --- Tickets Endpoints ---

@app.get("/api/tickets", response_model=List[schemas.TicketResponse])
def get_tickets(db: Session = Depends(get_db), token: Optional[str] = Depends(auth.oauth2_scheme)):
    return db.query(Ticket).order_by(Ticket.created_at.desc()).all()

@app.put("/api/tickets/{ticket_id}/status", response_model=schemas.TicketResponse)
def update_ticket_status(ticket_id: str, status: str, db: Session = Depends(get_db), token: Optional[str] = Depends(auth.oauth2_scheme)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = status
    db.commit()
    db.refresh(ticket)
    return ticket


# --- Customers Endpoints ---

@app.get("/api/customers", response_model=List[schemas.CustomerResponse])
def get_customers(db: Session = Depends(get_db), token: Optional[str] = Depends(auth.oauth2_scheme)):
    return db.query(Customer).order_by(Customer.joined_at.desc()).all()
