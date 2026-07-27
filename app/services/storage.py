import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    SUPABASE_ENABLED = True
else:
    supabase = None
    SUPABASE_ENABLED = False


def upload_file(bucket_name: str, file_path: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> str:
    """
    Uploads a file to a Supabase Storage bucket.
    Returns the public URL of the uploaded file.
    """
    if not SUPABASE_ENABLED:
        print(f"[MOCK SUPABASE] Uploading file to bucket '{bucket_name}': {file_path}")
        return f"mock_url_for_{file_path}"
    
    try:
        res = supabase.storage.from_(bucket_name).upload(
            file_path,
            file_bytes,
            {"content-type": content_type}
        )
        # Assuming the bucket is public, generate a public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
        return public_url
    except Exception as e:
        print(f"Error uploading file to Supabase: {e}")
        return ""


def download_file(bucket_name: str, file_path: str) -> bytes:
    """
    Downloads a file from a Supabase Storage bucket.
    """
    if not SUPABASE_ENABLED:
        return b"mock file content"
        
    try:
        res = supabase.storage.from_(bucket_name).download(file_path)
        return res
    except Exception as e:
        print(f"Error downloading file from Supabase: {e}")
        return b""
