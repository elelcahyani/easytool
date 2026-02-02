from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime, timedelta
import asyncio
import logging

from services.pdf_service import merge_pdfs, compress_pdf, split_pdf, rotate_pdf, protect_pdf
from services.image_service import (
    compress_images, images_to_pdf, pdf_to_images, 
    convert_image, resize_image
)
from services.document_service import word_to_pdf, pdf_to_word

# Import security modules
from config import (
    ALLOWED_ORIGINS,
    TEMP_DIR,
    MAX_FILE_SIZE,
    CLEANUP_INTERVAL_MINUTES,
    FILE_RETENTION_HOURS,
    PRODUCTION_MODE,
    RATE_LIMIT_ENABLED
)
from security import validate_upload_file, SecurityValidator, get_safe_filename
from middleware import SecurityHeadersMiddleware, RequestLoggingMiddleware, IPBlockingMiddleware
from rate_limiter import limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Easy Tool API",
    description="Secure file processing API",
    version="2.0.0",
    docs_url="/docs" if not PRODUCTION_MODE else None,  # Disable docs in production
    redoc_url="/redoc" if not PRODUCTION_MODE else None
)

# Add rate limiter
if RATE_LIMIT_ENABLED:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add security middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(IPBlockingMiddleware, blocked_ips=set())  # Add IPs to block here

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only allow needed methods
    allow_headers=["*"],
)

# Ensure temp directory exists
TEMP_DIR.mkdir(exist_ok=True)

# Cleanup old files
async def cleanup_old_files():
    while True:
        try:
            now = datetime.now()
            cleaned = 0
            for item in TEMP_DIR.iterdir():
                if item.is_dir():
                    created = datetime.fromtimestamp(item.stat().st_ctime)
                    if now - created > timedelta(hours=FILE_RETENTION_HOURS):
                        shutil.rmtree(item, ignore_errors=True)
                        cleaned += 1
            if cleaned > 0:
                logger.info(f"Cleaned up {cleaned} old job directories")
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        await asyncio.sleep(CLEANUP_INTERVAL_MINUTES * 60)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Easy Tool API...")
    logger.info(f"Production mode: {PRODUCTION_MODE}")
    logger.info(f"Rate limiting: {RATE_LIMIT_ENABLED}")
    asyncio.create_task(cleanup_old_files())

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Easy Tool API...")

@app.get("/")
def read_root():
    return {
        "message": "Easy Tool API",
        "status": "running",
        "version": "2.0.0",
        "production": PRODUCTION_MODE
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/merge-pdf")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def merge_pdf_endpoint(request: Request, files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, "Need at least 2 PDF files")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        # Save uploaded files
        input_paths = []
        for file in files:
            if file.size and file.size > MAX_FILE_SIZE:
                raise HTTPException(400, f"File {file.filename} too large")
            
            path = job_dir / file.filename
            with open(path, "wb") as f:
                content = await file.read()
                f.write(content)
            input_paths.append(path)
        
        # Merge
        output_path = job_dir / "merged.pdf"
        merge_pdfs(input_paths, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="merged.pdf"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/compress-pdf")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def compress_pdf_endpoint(request: Request, files: List[UploadFile] = File(...)):
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_path = job_dir / "compressed.pdf"
        compress_pdf(input_path, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="compressed.pdf"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/split-pdf")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def split_pdf_endpoint(request: Request, files: List[UploadFile] = File(...)):
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_dir = job_dir / "split"
        output_dir.mkdir()
        split_pdf(input_path, output_dir)
        
        # Create zip
        shutil.make_archive(str(job_dir / "split"), 'zip', output_dir)
        
        return FileResponse(
            job_dir / "split.zip",
            media_type="application/zip",
            filename="split.zip"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/compress-image")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def compress_image_endpoint(request: Request, files: List[UploadFile] = File(...)):
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_paths = []
        for file in files:
            path = job_dir / file.filename
            with open(path, "wb") as f:
                content = await file.read()
                f.write(content)
            input_paths.append(path)
        
        output_dir = job_dir / "compressed"
        output_dir.mkdir()
        compress_images(input_paths, output_dir)
        
        if len(files) == 1:
            compressed_file = list(output_dir.iterdir())[0]
            return FileResponse(
                compressed_file,
                media_type="image/jpeg",
                filename=compressed_file.name
            )
        else:
            shutil.make_archive(str(job_dir / "compressed"), 'zip', output_dir)
            return FileResponse(
                job_dir / "compressed.zip",
                media_type="application/zip",
                filename="compressed.zip"
            )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/image-to-pdf")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def image_to_pdf_endpoint(request: Request, files: List[UploadFile] = File(...)):
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_paths = []
        for file in files:
            path = job_dir / file.filename
            with open(path, "wb") as f:
                content = await file.read()
                f.write(content)
            input_paths.append(path)
        
        output_path = job_dir / "output.pdf"
        images_to_pdf(input_paths, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="images.pdf"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))


@app.post("/api/pdf-to-image")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_to_image_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    format: str = Form("PNG")
):
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        # Validate format
        if format.upper() not in ['PNG', 'JPG', 'JPEG']:
            raise HTTPException(400, "Format must be PNG or JPG")
        
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_dir = job_dir / "images"
        output_dir.mkdir()
        pdf_to_images(input_path, output_dir, format.upper())
        
        # Create zip
        shutil.make_archive(str(job_dir / "images"), 'zip', output_dir)
        
        return FileResponse(
            job_dir / "images.zip",
            media_type="application/zip",
            filename="pdf_images.zip"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/image-convert")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def image_convert_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    format: str = Form("PNG")
):
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        # Validate format
        if format.upper() not in ['PNG', 'JPG', 'JPEG']:
            raise HTTPException(400, "Format must be PNG or JPG")
        
        output_dir = job_dir / "converted"
        output_dir.mkdir()
        
        for file in files:
            input_path = job_dir / file.filename
            with open(input_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            output_filename = f"{Path(file.filename).stem}.{format.lower()}"
            output_path = output_dir / output_filename
            convert_image(input_path, output_path, format)
        
        if len(files) == 1:
            converted_file = list(output_dir.iterdir())[0]
            return FileResponse(
                converted_file,
                media_type=f"image/{format.lower()}",
                filename=converted_file.name
            )
        else:
            shutil.make_archive(str(job_dir / "converted"), 'zip', output_dir)
            return FileResponse(
                job_dir / "converted.zip",
                media_type="application/zip",
                filename="converted_images.zip"
            )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/image-resize")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def image_resize_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    maintain_aspect: bool = Form(True)
):
    if not width and not height:
        raise HTTPException(400, "Provide at least width or height")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        output_dir = job_dir / "resized"
        output_dir.mkdir()
        
        for file in files:
            input_path = job_dir / file.filename
            with open(input_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            output_path = output_dir / f"resized_{file.filename}"
            resize_image(input_path, output_path, width, height, maintain_aspect)
        
        if len(files) == 1:
            resized_file = list(output_dir.iterdir())[0]
            return FileResponse(
                resized_file,
                media_type="image/jpeg",
                filename=resized_file.name
            )
        else:
            shutil.make_archive(str(job_dir / "resized"), 'zip', output_dir)
            return FileResponse(
                job_dir / "resized.zip",
                media_type="application/zip",
                filename="resized_images.zip"
            )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/pdf-rotate")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_rotate_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    rotation: int = Form(90)
):
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    if rotation not in [90, 180, 270]:
        raise HTTPException(400, "Rotation must be 90, 180, or 270 degrees")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_path = job_dir / "rotated.pdf"
        rotate_pdf(input_path, output_path, rotation)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="rotated.pdf"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/pdf-protect")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_protect_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    password: str = Form(...)
):
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    if not password or len(password) < 4:
        raise HTTPException(400, "Password must be at least 4 characters")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_path = job_dir / "protected.pdf"
        protect_pdf(input_path, output_path, password)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="protected.pdf"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))


@app.post("/api/word-to-pdf")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def word_to_pdf_endpoint(request: Request, files: List[UploadFile] = File(...)):
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 DOCX file")
    
    file = files[0]
    
    # Validate file extension
    if not file.filename.lower().endswith(('.docx', '.doc')):
        raise HTTPException(400, "File must be DOCX or DOC format")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        # Save uploaded file
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(400, f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB")
            f.write(content)
        
        # Convert to PDF
        output_path = job_dir / "converted.pdf"
        word_to_pdf(input_path, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=f"{Path(file.filename).stem}.pdf"
        )
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/pdf-to-word")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_to_word_endpoint(request: Request, files: List[UploadFile] = File(...)):
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    file = files[0]
    
    # Validate file extension
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "File must be PDF format")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        # Save uploaded file
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(400, f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB")
            f.write(content)
        
        # Convert to DOCX
        output_path = job_dir / "converted.docx"
        pdf_to_word(input_path, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{Path(file.filename).stem}.docx"
        )
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))


# ============================================
# NEW TOOLS - 14 Additional Endpoints
# ============================================

@app.post("/api/pdf-unlock")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_unlock_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    password: str = Form(...)
):
    """Unlock password-protected PDF"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    if not password:
        raise HTTPException(400, "Password is required")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_path = job_dir / "unlocked.pdf"
        
        from services.pdf_service import unlock_pdf
        unlock_pdf(input_path, output_path, password)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="unlocked.pdf"
        )
    except ValueError as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(400, str(e))
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/pdf-to-jpg")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_to_jpg_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    quality: str = Form("medium")
):
    """Convert PDF pages to JPG images"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Set DPI based on quality
        dpi_map = {'low': 100, 'medium': 150, 'high': 300}
        dpi = dpi_map.get(quality.lower(), 150)
        
        output_dir = job_dir / "images"
        output_dir.mkdir()
        
        from services.image_service import pdf_to_images
        pdf_to_images(input_path, output_dir, 'JPEG', dpi)
        
        # Create zip
        shutil.make_archive(str(job_dir / "images"), 'zip', output_dir)
        
        return FileResponse(
            job_dir / "images.zip",
            media_type="application/zip",
            filename="pdf_to_jpg.zip"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/jpg-to-pdf")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def jpg_to_pdf_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    page_size: str = Form("A4"),
    orientation: str = Form("portrait")
):
    """Convert JPG/PNG images to PDF"""
    if len(files) < 1:
        raise HTTPException(400, "Upload at least 1 image file")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_paths = []
        for file in files:
            path = job_dir / file.filename
            with open(path, "wb") as f:
                content = await file.read()
                f.write(content)
            input_paths.append(path)
        
        output_path = job_dir / "output.pdf"
        
        from services.image_service import images_to_pdf
        images_to_pdf(input_paths, output_path)
        
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="images_to_pdf.pdf"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/pdf-extract-images")
@limiter.limit("5/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_extract_images_endpoint(request: Request, files: List[UploadFile] = File(...)):
    """Extract embedded images from PDF"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_dir = job_dir / "extracted"
        output_dir.mkdir()
        
        from services.image_service import extract_images_from_pdf
        extracted = extract_images_from_pdf(input_path, output_dir)
        
        if not extracted:
            raise HTTPException(400, "No images found in PDF")
        
        # Create zip
        shutil.make_archive(str(job_dir / "extracted"), 'zip', output_dir)
        
        return FileResponse(
            job_dir / "extracted.zip",
            media_type="application/zip",
            filename="extracted_images.zip"
        )
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/pdf-to-text")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def pdf_to_text_endpoint(request: Request, files: List[UploadFile] = File(...)):
    """Extract text from PDF"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 PDF file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_path = job_dir / "extracted_text.txt"
        
        from services.pdf_service import pdf_to_text
        pdf_to_text(input_path, output_path)
        
        return FileResponse(
            output_path,
            media_type="text/plain",
            filename="extracted_text.txt"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/image-crop")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def image_crop_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    left: int = Form(...),
    top: int = Form(...),
    right: int = Form(...),
    bottom: int = Form(...)
):
    """Crop image to specified coordinates"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 image file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_path = job_dir / f"cropped_{file.filename}"
        
        from services.image_service import crop_image
        crop_image(input_path, output_path, left, top, right, bottom)
        
        return FileResponse(
            output_path,
            media_type="image/jpeg",
            filename=output_path.name
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/image-watermark")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def image_watermark_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    watermark_text: Optional[str] = Form(None),
    position: str = Form("bottom-right"),
    opacity: int = Form(128)
):
    """Add text watermark to image"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 image file")
    
    if not watermark_text:
        raise HTTPException(400, "Watermark text is required")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_path = job_dir / f"watermarked_{file.filename}"
        
        from services.image_service import add_watermark
        add_watermark(input_path, output_path, watermark_text=watermark_text,
                     position=position, opacity=opacity)
        
        return FileResponse(
            output_path,
            media_type="image/png",
            filename=output_path.name
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/image-remove-background")
@limiter.limit("3/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def image_remove_background_endpoint(request: Request, files: List[UploadFile] = File(...)):
    """Remove background from image (requires rembg library)"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 image file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        # Check if rembg is installed
        try:
            from rembg import remove
        except ImportError:
            raise HTTPException(
                501,
                "Background removal feature requires 'rembg' library. "
                "Install with: pip install rembg"
            )
        
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Remove background
        with open(input_path, 'rb') as i:
            input_data = i.read()
            output_data = remove(input_data)
        
        output_path = job_dir / f"no_bg_{Path(file.filename).stem}.png"
        with open(output_path, 'wb') as o:
            o.write(output_data)
        
        return FileResponse(
            output_path,
            media_type="image/png",
            filename=output_path.name
        )
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/audio-convert")
@limiter.limit("3/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def audio_convert_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    format: str = Form("mp3")
):
    """Convert audio between formats (MP3, WAV, OGG)"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 audio file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_filename = f"{Path(file.filename).stem}.{format.lower()}"
        output_path = job_dir / output_filename
        
        from services.media_service import convert_audio
        convert_audio(input_path, output_path, format)
        
        mime_types = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg'
        }
        
        return FileResponse(
            output_path,
            media_type=mime_types.get(format.lower(), 'audio/mpeg'),
            filename=output_filename
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/video-to-audio")
@limiter.limit("3/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def video_to_audio_endpoint(request: Request, files: List[UploadFile] = File(...)):
    """Extract audio from video as MP3"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 video file")
    
    file = files[0]
    
    # Validate file type
    allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    if file.content_type and file.content_type not in allowed_types:
        # Still allow if content_type is not set or unknown
        if file.content_type and not file.content_type.startswith('video/'):
            raise HTTPException(400, f"Invalid file type. Please upload a video file.")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(400, f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB")
            f.write(content)
        
        print(f"Processing video: {file.filename} ({len(content)} bytes)")
        
        output_filename = f"{Path(file.filename).stem}.mp3"
        output_path = job_dir / output_filename
        
        from services.media_service import video_to_audio
        video_to_audio(input_path, output_path)
        
        # Verify output file
        if not output_path.exists():
            raise HTTPException(500, "Conversion failed: Output file not created")
        
        output_size = output_path.stat().st_size
        print(f"Conversion successful: {output_filename} ({output_size} bytes)")
        
        if output_size == 0:
            raise HTTPException(500, "Conversion failed: Output file is empty")
        
        return FileResponse(
            output_path,
            media_type="audio/mpeg",
            filename=output_filename
        )
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        print(f"Error converting video to audio: {str(e)}")
        raise HTTPException(500, str(e))

@app.post("/api/video-compress")
@limiter.limit("2/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def video_compress_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    quality: str = Form("medium")
):
    """Compress video file"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 video file")
    
    if quality.lower() not in ['low', 'medium', 'high']:
        raise HTTPException(400, "Quality must be low, medium, or high")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        output_filename = f"compressed_{file.filename}"
        output_path = job_dir / output_filename
        
        from services.media_service import compress_video
        compress_video(input_path, output_path, quality)
        
        return FileResponse(
            output_path,
            media_type="video/mp4",
            filename=output_filename
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/zip-create")
@limiter.limit("10/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def zip_create_endpoint(request: Request, files: List[UploadFile] = File(...)):
    """Create ZIP archive from multiple files"""
    if len(files) < 1:
        raise HTTPException(400, "Upload at least 1 file to compress")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        # Save all uploaded files
        files_dir = job_dir / "files"
        files_dir.mkdir()
        
        for file in files:
            file_path = files_dir / file.filename
            with open(file_path, "wb") as f:
                content = await file.read()
                if len(content) > MAX_FILE_SIZE:
                    raise HTTPException(400, f"File {file.filename} too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB")
                f.write(content)
        
        # Create ZIP archive
        output_zip = job_dir / "archive"
        shutil.make_archive(str(output_zip), 'zip', files_dir)
        
        return FileResponse(
            job_dir / "archive.zip",
            media_type="application/zip",
            filename="compressed_files.zip"
        )
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/file-rename")
@limiter.limit("20/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def file_rename_endpoint(request: Request, 
    files: List[UploadFile] = File(...),
    pattern: str = Form("file")
):
    """Rename multiple files with pattern"""
    if len(files) < 1:
        raise HTTPException(400, "Upload at least 1 file")
    
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_paths = []
        for file in files:
            path = job_dir / file.filename
            with open(path, "wb") as f:
                content = await file.read()
                f.write(content)
            input_paths.append(path)
        
        output_dir = job_dir / "renamed"
        output_dir.mkdir()
        
        from services.file_service import rename_files
        rename_files(input_paths, output_dir, pattern)
        
        # Create zip
        shutil.make_archive(str(job_dir / "renamed"), 'zip', output_dir)
        
        return FileResponse(
            job_dir / "renamed.zip",
            media_type="application/zip",
            filename="renamed_files.zip"
        )
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))

@app.post("/api/file-info")
@limiter.limit("20/minute") if RATE_LIMIT_ENABLED else lambda x: x
async def file_info_endpoint(request: Request, files: List[UploadFile] = File(...)):
    """Get file metadata and information"""
    if len(files) != 1:
        raise HTTPException(400, "Upload exactly 1 file")
    
    file = files[0]
    job_id = str(uuid.uuid4())
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir()
    
    try:
        input_path = job_dir / file.filename
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        from services.file_service import get_file_info
        info = get_file_info(input_path)
        
        # Cleanup
        shutil.rmtree(job_dir, ignore_errors=True)
        
        return info
    except Exception as e:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(500, str(e))
