from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    leads = relationship("Lead", back_populates="owner")
    customers = relationship("Customer", back_populates="owner")
    tickets = relationship("Ticket", back_populates="owner")
    conversations = relationship("Conversation", back_populates="owner")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    service = Column(String)
    budget = Column(Float)
    priority = Column(String, default="Medium")
    score = Column(Integer, default=50)
    status = Column(String, default="New")
    source = Column(String, default="AI Chatbot")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="leads")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    status = Column(String, default="Active")
    revenue = Column(Float, default=0.0)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="customers")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True) # FP-XXXX format
    customer_name = Column(String, index=True)
    issue = Column(Text)
    priority = Column(String, default="Medium")
    status = Column(String, default="Open")
    category = Column(String, default="General Help")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="tickets")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    messages = Column(Text)  # JSON-serialized list of messages
    extracted_info = Column(Text)  # JSON-serialized dict of extracted entities
    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="conversations")
