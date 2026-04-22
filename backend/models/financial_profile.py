from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    household_id = Column(Integer, ForeignKey("households.id"), nullable=True)

    account_type = Column(String, nullable=True)
    custodian = Column(String, nullable=True)
    client_tax_bracket = Column(String, nullable=True)
    estimated_liquid_net_worth = Column(Float, nullable=True)
    estimated_total_net_worth = Column(Float, nullable=True)
    annual_income = Column(Float, nullable=True)

    years_experience_bonds = Column(Integer, nullable=True)
    years_experience_stocks = Column(Integer, nullable=True)
    years_experience_alternatives = Column(Integer, nullable=True)
    years_experience_vas = Column(Integer, nullable=True)
    years_experience_mutual_funds = Column(Integer, nullable=True)
    years_experience_options = Column(Integer, nullable=True)
    years_experience_partnerships = Column(Integer, nullable=True)

    primary_investment_objective = Column(String, nullable=True)
    risk_tolerance = Column(String, nullable=True)
    time_horizon = Column(String, nullable=True)
    account_decision_making = Column(String, nullable=True)
    source_of_funds = Column(String, nullable=True)
    primary_use_of_funds = Column(String, nullable=True)
    liquidity_needs = Column(String, nullable=True)
    liquidity_time_horizon = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    household = relationship("Household", back_populates="financial_profiles")
