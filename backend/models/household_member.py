from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime


class HouseholdMember(Base):
    __tablename__ = "household_members"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"), nullable=True)

    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    ssn = Column(String, nullable=True,)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    employer = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    drivers_license_number = Column(String, nullable=True)
    drivers_license_state = Column(String, nullable=True)
    drivers_license_issue_date = Column(Date, nullable=True)
    drivers_license_expiration_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    household = relationship("Household", back_populates="members")
