import os
import json
from sqlalchemy.orm import Session
from fastapi import UploadFile
from models import Household, HouseholdMember, FinancialProfile, BankDetail
from datetime import datetime, date
from services import sheet_service
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)


async def process_audio_file(file: UploadFile, db: Session):
    """
    Process audio file: transcribe -> extract structured data -> save to database
    """
    import tempfile

    logger.info(f"Starting audio processing for file: {file.filename}")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
        content = await file.read()
        logger.info(f"File read. Content length: {len(content)} bytes")
        tmp.write(content)
        tmp_path = tmp.name
        logger.info(f"Temp file created at: {tmp_path}")

    try:
        with open(tmp_path, "rb") as audio_file:
            logger.info("Starting transcription...")
            transcription = await transcribe_audio(audio_file, file.filename)
            logger.info(f"Transcription completed: {transcription[:100]}...")

        logger.info("Extracting structured data...")
        structured_data = await extract_household_data(transcription)
        logger.info(f"Structured data extracted: {structured_data}")

        logger.info("Saving to database...")
        result = await save_household_data(db, structured_data)
        logger.info(f"Data saved successfully: {result}")

        return {"message": "Audio processed successfully", **result}
    except Exception as e:
        logger.error(f"Error during audio processing: {str(e)}", exc_info=True)
        raise
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
            logger.info(f"Temp file deleted: {tmp_path}")


async def transcribe_audio(file_content, filename: str | None) -> str:
    """
    Transcribe audio file using OpenAI Whisper
    """
    try:
        from openai import OpenAI

        logger.info(f"Initializing OpenAI client for transcription")
        client = OpenAI()

        logger.info(f"Sending audio file to OpenAI: {filename}")
        response = client.audio.transcriptions.create(
            model="gpt-4o-transcribe", file=(filename, file_content), language="en"
        )
        logger.info(f"Transcription successful. Text length: {len(response.text)}")
        return response.text
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        raise


async def extract_household_data(text: str) -> dict:
    """
    Use OpenAI to extract structured household data from transcription
    """
    try:
        from openai import OpenAI

        client = OpenAI()

        prompt = """You are a financial data extraction expert. 
Extract the following fields from the transcription and return ONLY valid JSON:
- household_name (string)
- first_name (string)
- last_name (string)
- account_type (string)
- custodian (string or null)
- phone (string or null)
- email (string or null)
- address (string or null)
- ssn (string or null)
- dob (date as YYYY-MM-DD or null)
- occupation (string or null)
- employer (string or null)
- client_tax_bracket (string or null)
- estimated_liquid_net_worth (number or null)
- estimated_total_net_worth (number or null)
- annual_income (number or null)
- years_experience_bonds (number or null)
- years_experience_stocks (number or null)
- years_experience_alternatives (number or null)
- years_experience_vas (number or null)
- years_experience_mutual_funds (number or null)
- years_experience_options (number or null)
- years_experience_partnerships (number or null)
- primary_investment_objective (string or null)
- risk_tolerance (string or null)
- time_horizon (string or null)
- account_decision_making (string or null)
- source_of_funds (string or null)
- primary_use_of_funds (string or null)
- liquidity_needs (string or null)
- liquidity_time_horizon (string or null)
- drivers_license_number (string or null)
- drivers_license_state (string or null)
- drivers_license_issue_date (date or null)
- drivers_license_expiration_date (date or null)
- marital_status (string or null)
- bank_name (string or null)
- bank_type (string or null)
- account_no (string or null)
- beneficiary_1_name (string or null)
- beneficiary_1 (number or null)
- beneficiary_1_dob (date or null)
- beneficiary_2_name (string or null)
- beneficiary_2 (number or null)
- beneficiary_2_dob (date or null)

Return null for fields not mentioned in the audio.
Format numbers without symbols (e.g., 1000000 not $1,000,000).
Format dates as YYYY-MM-DD."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Audio transcription:\n\n{text}"},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": f"Extraction error: {str(e)}"}


async def save_household_data(db: Session, data: dict) -> dict:
    """
    Save extracted household data to database
    """
    if "error" in data:
        return {"message": "Error in extraction", "success": False}

    household_name = (
        data.get("household_name")
        or f"{data.get('first_name', '')} {data.get('last_name', '')}".strip()
    )

    household = Household(name=household_name)
    db.add(household)
    db.flush()

    member = HouseholdMember(
        household_id=household.id,
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        date_of_birth=parse_date_str(data.get("dob")),
        ssn=data.get("ssn"),
        phone=data.get("phone"),
        email=data.get("email"),
        address=data.get("address"),
        occupation=data.get("occupation"),
        employer=data.get("employer"),
        marital_status=data.get("marital_status"),
        drivers_license_number=data.get("drivers_license_number"),
        drivers_license_state=data.get("drivers_license_state"),
        drivers_license_issue_date=parse_date_str(
            data.get("drivers_license_issue_date")
        ),
        drivers_license_expiration_date=parse_date_str(
            data.get("drivers_license_expiration_date")
        ),
    )
    db.add(member)

    financial_profile = FinancialProfile(
        household_id=household.id,
        account_type=data.get("account_type"),
        custodian=data.get("custodian"),
        client_tax_bracket=data.get("client_tax_bracket"),
        estimated_liquid_net_worth=data.get("estimated_liquid_net_worth"),
        estimated_total_net_worth=data.get("estimated_total_net_worth"),
        annual_income=data.get("annual_income"),
        years_experience_bonds=data.get("years_experience_bonds"),
        years_experience_stocks=data.get("years_experience_stocks"),
        years_experience_alternatives=data.get("years_experience_alternatives"),
        years_experience_vas=data.get("years_experience_vas"),
        years_experience_mutual_funds=data.get("years_experience_mutual_funds"),
        years_experience_options=data.get("years_experience_options"),
        years_experience_partnerships=data.get("years_experience_partnerships"),
        primary_investment_objective=data.get("primary_investment_objective"),
        risk_tolerance=data.get("risk_tolerance"),
        time_horizon=data.get("time_horizon"),
        account_decision_making=data.get("account_decision_making"),
        source_of_funds=data.get("source_of_funds"),
        primary_use_of_funds=data.get("primary_use_of_funds"),
        liquidity_needs=data.get("liquidity_needs"),
        liquidity_time_horizon=data.get("liquidity_time_horizon"),
    )
    db.add(financial_profile)

    bank_detail = BankDetail(
        household_id=household.id,
        bank_name=data.get("bank_name"),
        bank_type=data.get("bank_type"),
        account_number=data.get("account_no"),
        beneficiary_1_name=data.get("beneficiary_1_name"),
        beneficiary_1_percent=data.get("beneficiary_1"),
        beneficiary_1_dob=parse_date_str(data.get("beneficiary_1_dob")),
        beneficiary_2_name=data.get("beneficiary_2_name"),
        beneficiary_2_percent=data.get("beneficiary_2"),
        beneficiary_2_dob=parse_date_str(data.get("beneficiary_2_dob")),
    )
    db.add(bank_detail)

    db.commit()

    return {
        "message": "Household data saved successfully",
        "success": True,
        "household_id": household.id,
    }


def parse_date_str(date_str):
    """Parse date string to date object"""
    if not date_str:
        return None

    formats = ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"]

    for fmt in formats:
        try:
            return datetime.strptime(str(date_str).strip(), fmt).date()
        except:
            continue

    return None


async def clean_transcription(db: Session, text: str) -> dict:
    """
    Clean and structure raw transcription text
    """
    return await extract_household_data(text)
