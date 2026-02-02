"""
Security utilities and middleware
"""
import magic
import hashlib
from fastapi import HTTPException, UploadFile
from typing import List
from pathlib import Path
import re

from config import (
    MAX_FILE_SIZE,
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES
)


class SecurityValidator:
    """Security validation utilities"""
    
    @staticmethod
    def validate_filename(filename: str) -> str:
        """
        Sanitize and validate filename to prevent path traversal attacks
        """
        if not filename:
            raise HTTPException(400, "Filename is required")
        
        # Remove path components
        filename = Path(filename).name
        
        # Remove dangerous characters
        filename = re.sub(r'[^\w\s\-\.]', '', filename)
        
        # Prevent hidden files
        if filename.startswith('.'):
            raise HTTPException(400, "Hidden files are not allowed")
        
        # Prevent empty filename
        if not filename or filename == '.':
            raise HTTPException(400, "Invalid filename")
        
        return filename
    
    @staticmethod
    def validate_file_size(file: UploadFile, max_size: int = MAX_FILE_SIZE) -> None:
        """
        Validate file size
        """
        if file.size and file.size > max_size:
            raise HTTPException(
                400,
                f"File too large. Maximum size: {max_size / 1024 / 1024:.1f}MB"
            )
    
    @staticmethod
    def validate_file_extension(filename: str, allowed_types: List[str]) -> None:
        """
        Validate file extension
        """
        ext = Path(filename).suffix.lower()
        
        allowed_exts = []
        for file_type in allowed_types:
            if file_type in ALLOWED_EXTENSIONS:
                allowed_exts.extend(ALLOWED_EXTENSIONS[file_type])
        
        if ext not in allowed_exts:
            raise HTTPException(
                400,
                f"File type not allowed. Allowed types: {', '.join(allowed_exts)}"
            )
    
    @staticmethod
    async def validate_file_content(file_path: Path, expected_types: List[str]) -> None:
        """
        Validate file content using magic bytes (MIME type detection)
        This prevents users from uploading malicious files with fake extensions
        """
        try:
            mime = magic.Magic(mime=True)
            detected_mime = mime.from_file(str(file_path))
            
            # Check if detected MIME type is in allowed list
            if detected_mime not in ALLOWED_MIME_TYPES:
                raise HTTPException(
                    400,
                    f"File content type not allowed: {detected_mime}"
                )
            
            # Additional validation for specific types
            if 'pdf' in expected_types and not detected_mime.startswith('application/pdf'):
                raise HTTPException(400, "File is not a valid PDF")
            
            if 'image' in expected_types and not detected_mime.startswith('image/'):
                raise HTTPException(400, "File is not a valid image")
            
            if 'document' in expected_types and 'word' not in detected_mime:
                raise HTTPException(400, "File is not a valid Word document")
                
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            # If magic fails, log but don't block (fallback to extension check)
            print(f"Magic validation warning: {e}")
    
    @staticmethod
    def calculate_file_hash(file_path: Path) -> str:
        """
        Calculate SHA256 hash of file for integrity checking
        """
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    @staticmethod
    def validate_password_strength(password: str) -> None:
        """
        Validate password strength for PDF protection
        """
        if len(password) < 4:
            raise HTTPException(400, "Password must be at least 4 characters")
        
        if len(password) > 128:
            raise HTTPException(400, "Password too long (max 128 characters)")
    
    @staticmethod
    def sanitize_text_input(text: str, max_length: int = 1000) -> str:
        """
        Sanitize text input to prevent XSS and injection attacks
        """
        if not text:
            return ""
        
        # Limit length
        text = text[:max_length]
        
        # Remove potentially dangerous characters
        text = re.sub(r'[<>\"\'&]', '', text)
        
        return text.strip()


async def validate_upload_file(
    file: UploadFile,
    allowed_types: List[str],
    max_size: int = MAX_FILE_SIZE
) -> str:
    """
    Complete file validation pipeline
    Returns sanitized filename
    """
    validator = SecurityValidator()
    
    # Validate filename
    safe_filename = validator.validate_filename(file.filename)
    
    # Validate file size
    validator.validate_file_size(file, max_size)
    
    # Validate extension
    validator.validate_file_extension(safe_filename, allowed_types)
    
    return safe_filename


def get_safe_filename(original_filename: str, prefix: str = "") -> str:
    """
    Generate a safe filename with optional prefix
    """
    validator = SecurityValidator()
    safe_name = validator.validate_filename(original_filename)
    
    if prefix:
        name = Path(safe_name).stem
        ext = Path(safe_name).suffix
        return f"{prefix}_{name}{ext}"
    
    return safe_name
