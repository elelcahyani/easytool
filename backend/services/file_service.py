"""
File Service - General file operations
Handles ZIP extraction, file renaming, and file metadata
"""
from pathlib import Path
import zipfile
import os
import shutil

def extract_zip(input_path: Path, output_dir: Path):
    """
    Extract ZIP file contents
    
    Args:
        input_path: Path to ZIP file
        output_dir: Directory to extract files to
    
    Raises:
        ValueError: If file is not a valid ZIP
        RuntimeError: If extraction fails or zip-slip detected
    """
    if not zipfile.is_zipfile(input_path):
        raise ValueError("File is not a valid ZIP archive")
    
    output_dir.mkdir(exist_ok=True)
    
    with zipfile.ZipFile(input_path, 'r') as zip_ref:
        # Security: Check for zip-slip vulnerability
        for member in zip_ref.namelist():
            member_path = output_dir / member
            # Resolve to absolute path and check it's within output_dir
            try:
                member_path.resolve().relative_to(output_dir.resolve())
            except ValueError:
                raise RuntimeError(f"Zip-slip attack detected: {member}")
        
        # Extract all files
        zip_ref.extractall(output_dir)

def rename_files(input_paths: list[Path], output_dir: Path, pattern: str = "file"):
    """
    Rename multiple files with a pattern
    
    Args:
        input_paths: List of file paths to rename
        output_dir: Directory to save renamed files
        pattern: Naming pattern (e.g., "file" -> file_001.ext)
    """
    output_dir.mkdir(exist_ok=True)
    
    # Sort files by name for consistent ordering
    sorted_paths = sorted(input_paths, key=lambda p: p.name)
    
    for idx, file_path in enumerate(sorted_paths, start=1):
        # Get file extension
        ext = file_path.suffix
        # Create new filename with pattern and zero-padded number
        new_name = f"{pattern}_{idx:03d}{ext}"
        output_path = output_dir / new_name
        
        # Copy file with new name
        shutil.copy2(file_path, output_path)

def get_file_info(file_path: Path) -> dict:
    """
    Get file metadata
    
    Args:
        file_path: Path to file
    
    Returns:
        Dictionary with file information
    """
    stat = file_path.stat()
    
    # Format file size
    size_bytes = stat.st_size
    if size_bytes < 1024:
        size_str = f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        size_str = f"{size_bytes / 1024:.2f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        size_str = f"{size_bytes / (1024 * 1024):.2f} MB"
    else:
        size_str = f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"
    
    return {
        'filename': file_path.name,
        'size_bytes': size_bytes,
        'size_formatted': size_str,
        'extension': file_path.suffix,
        'mime_type': get_mime_type(file_path),
    }

def get_mime_type(file_path: Path) -> str:
    """Get MIME type based on file extension"""
    mime_types = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.zip': 'application/zip',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
    }
    return mime_types.get(file_path.suffix.lower(), 'application/octet-stream')
