from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class AccountType(str, Enum):
    INDIVIDUAL = "individual"
    JOINT = "joint"
    TRUST = "trust"
    RETIREMENT = "retirement"
    OTHER = "other"


class FinancialAccountBase(BaseModel):
    account_number: str
    custodian: str
    account_type: AccountType
    account_value: float
    ownership_percentage: Optional[float] = None


class FinancialAccountCreate(FinancialAccountBase):
    household_id: int


class FinancialAccountUpdate(BaseModel):
    account_number: Optional[str] = None
    custodian: Optional[str] = None
    account_type: Optional[AccountType] = None
    account_value: Optional[float] = None
    ownership_percentage: Optional[float] = None


class FinancialAccountResponse(FinancialAccountBase):
    id: int
    household_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True