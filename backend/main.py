from fastapi import FastAPI
from config import get_settings
from database import engine, Base
from routes import excel_sheet, household
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)

origins = [
    "*"
]

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

app.include_router(excel_sheet.router)
app.include_router(household.router)

@app.get("/")
def root():
    return {"message": "Welcome to FastAPI"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}