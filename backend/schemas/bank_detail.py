from pydantic import BaseModel
from datetime import datetime
from typing import Optional


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