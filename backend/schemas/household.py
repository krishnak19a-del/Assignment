from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class HouseholdBase(BaseModel):
    name: str
    income: Optional[float] = None
    net_worth: Optional[float] = None
    expense_min: Optional[float] = None
    expense_max: Optional[float] = None
    tax_info: Optional[str] = None


class HouseholdCreate(HouseholdBase):
    pass


class HouseholdUpdate(BaseModel):
    name: Optional[str] = None
    income: Optional[float] = None
    net_worth: Optional[float] = None
    expense_min: Optional[float] = None
    expense_max: Optional[float] = None
    tax_info: Optional[str] = None


class HouseholdResponse(HouseholdBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== BANK DETAIL ====================

class BankDetailBase(BaseModel):
    bank_name: str
    account_number: str
    routing_number: Optional[str] = None


class BankDetailCreate(BankDetailBase):
    household_id: int


class BankDetailUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    routing_number: Optional[str] = None


class BankDetailResponse(BankDetailBase):
    id: int
    household_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Update forward references
HouseholdWithDetails.model_rebuild()