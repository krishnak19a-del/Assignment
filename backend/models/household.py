from database import Base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime


class Household(Base):
    __tablename__ = "households"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship(
        "HouseholdMember", back_populates="household", cascade="all, delete-orphan"
    )
    financial_profiles = relationship(
        "FinancialProfile", back_populates="household", cascade="all, delete-orphan"
    )
    bank_details = relationship(
        "BankDetail", back_populates="household", cascade="all, delete-orphan"
    )
