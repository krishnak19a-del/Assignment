from fastapi import APIRouter, File, UploadFile, Depends
from services import sheet_service, household_service
from database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/excel", tags=["Excel Sheet"])


@router.post("/upload")
async def upload_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    data = sheet_service.parse_excel(file)
    if "data" in data:
        result = sheet_service.process_excel_data(db, data["data"])
        return result
    return data


@router.get("/list")
async def list_all(db: Session = Depends(get_db)):
    households = sheet_service.list_households(db)
    return {
        "message": "List all households retrieved successfully",
        "households": households,
    }


@router.get("/{id}")
async def get_specific(id: int, db: Session = Depends(get_db)):
    household = sheet_service.get_household_by_id(db, id)
    if household:
        return {
            "message": f"Household with ID {id} retrieved successfully",
            "household": household,
        }


@router.get("/insights/data")
async def get_insights(db: Session = Depends(get_db)):
    insights = sheet_service.get_insights(db)
    return {"message": "Insights retrieved successfully", "insights": insights}
