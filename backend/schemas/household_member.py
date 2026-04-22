from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional
from enum import Enum


class RelationshipType(str, Enum):
    SPOUSE = "spouse"
    PARENT = "parent"
    CHILD = "child"
    SIBLING = "sibling"
    OTHER = "other"


class HouseholdMemberBase(BaseModel):
    name: str
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    relationship: Optional[RelationshipType] = None
    address: Optional[str] = None


class HouseholdMemberCreate(HouseholdMemberBase):
    household_id: int


class HouseholdMemberUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    relationship: Optional[RelationshipType] = None
    address: Optional[str] = None


class HouseholdMemberResponse(HouseholdMemberBase):
    id: int
    household_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True