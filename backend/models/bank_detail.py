from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Date
from sqlalchemy.orm import relationship
from datetime import datetime


class BankDetail(Base):
    __tablename__ = "bank_details"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"), nullable=True)

    bank_name = Column(String, nullable=True)
    bank_type = Column(String, nullable=True)
    account_number = Column(String, nullable=True, unique=True)

    beneficiary_1_name = Column(String, nullable=True)
    beneficiary_1_percent = Column(Float, nullable=True)
    beneficiary_1_dob = Column(Date, nullable=True)

    beneficiary_2_name = Column(String, nullable=True)
    beneficiary_2_percent = Column(Float, nullable=True)
    beneficiary_2_dob = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    household = relationship("Household", back_populates="bank_details")
