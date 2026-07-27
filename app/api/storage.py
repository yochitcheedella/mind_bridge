from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import Dict
import uuid

from app.core.deps import get_current_student
from app.services.storage import upload_file

router = APIRouter(prefix="/api/storage", tags=["storage"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    student = Depends(get_current_student)
) -> Dict[str, str]:
    """
    Placeholder endpoint for students or psychologists to upload files to Supabase Storage.
    (e.g., medical certificates, profile avatars, or chat attachments)
    """
    try:
        contents = await file.read()
        # Generate a unique path for the file
        file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
        unique_filename = f"{student.id}/{uuid.uuid4()}.{file_ext}"
        
        public_url = upload_file("mindbridge-uploads", unique_filename, contents, file.content_type)
        
        return {"status": "success", "url": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
