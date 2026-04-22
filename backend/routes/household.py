from fastapi import APIRouter, File, UploadFile, Depends
from services import household_service
from services import sheet_service
from database import get_db
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/household", tags=["Excel Sheet"])

@router.post("/uploadAudio")
async def upload_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    logger.info(f"=== UPLOAD AUDIO ENDPOINT HIT ===")
    logger.info(f"File received: {file.filename}")
    logger.info(f"File content type: {file.content_type}")
    logger.info(f"File size: {file.size}")
    
    try:
        result = await household_service.process_audio_file(file, db)
        logger.info(f"Audio processing successful: {result}")
        return result
    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}", exc_info=True)
        raise



