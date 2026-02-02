from pathlib import Path
import subprocess
from pdf2docx import Converter
import os

def word_to_pdf(input_path: Path, output_path: Path):
    """
    Convert DOCX to PDF using LibreOffice headless mode with optimized settings
    
    This method preserves:
    - Tables and formatting
    - Images and graphics
    - Fonts and styles
    - Page layout
    
    Requirements:
    - LibreOffice must be installed on the system
    - Ubuntu: sudo apt install libreoffice
    - Windows: Download from libreoffice.org
    """
    
    # Try different LibreOffice commands
    libreoffice_commands = [
        'libreoffice',
        'soffice',
        r'C:\Program Files\LibreOffice\program\soffice.exe',
        r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
    ]
    
    for cmd_base in libreoffice_commands:
        try:
            cmd = [
                cmd_base,
                '--headless',
                '--convert-to', 'pdf',
                '--outdir', str(output_path.parent),
                str(input_path)
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
                env={**os.environ, 'HOME': str(output_path.parent)}
            )
            
            if result.returncode == 0:
                expected_output = output_path.parent / f"{input_path.stem}.pdf"
                if expected_output.exists():
                    if expected_output != output_path:
                        expected_output.rename(output_path)
                    return
                    
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    
    raise Exception(
        "LibreOffice not found. Please install LibreOffice:\n"
        "Ubuntu: sudo apt install libreoffice\n"
        "Windows: Download from https://www.libreoffice.org/download/"
    )

def pdf_to_word(input_path: Path, output_path: Path):
    """
    Convert PDF to DOCX using multiple methods for best results
    
    Method 1: LibreOffice (best for preserving layout, tables, images)
    Method 2: pdf2docx (fallback if LibreOffice not available)
    
    This method attempts to preserve:
    - Text formatting and fonts
    - Tables structure
    - Images (embedded in document)
    - Page layout
    
    Note: 
    - Works best with text-based PDFs created from Word/Office
    - Scanned PDFs or image-based PDFs may not convert accurately
    - Complex layouts may require manual adjustment
    """
    
    # Try different LibreOffice commands
    libreoffice_commands = [
        'libreoffice',
        'soffice',
        r'C:\Program Files\LibreOffice\program\soffice.exe',
        r'C:\Program Files (x86)\LibreOffice\program\soffice.exe',
    ]
    
    for cmd_base in libreoffice_commands:
        try:
            cmd = [
                cmd_base,
                '--headless',
                '--convert-to', 'docx',
                '--outdir', str(output_path.parent),
                str(input_path)
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
                env={**os.environ, 'HOME': str(output_path.parent)}
            )
            
            if result.returncode == 0:
                expected_output = output_path.parent / f"{input_path.stem}.docx"
                if expected_output.exists():
                    if expected_output != output_path:
                        expected_output.rename(output_path)
                    return
            
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    
    # Fallback to pdf2docx
    try:
        cv = Converter(str(input_path))
        cv.convert(
            str(output_path),
            start=0,
            end=None,
            pages=None,
        )
        cv.close()
        
        if not output_path.exists():
            raise Exception("Conversion completed but output file not found")
            
    except Exception as e:
        raise Exception(
            f"PDF to Word conversion failed. "
            f"For best results with tables and images, install LibreOffice: "
            f"https://www.libreoffice.org/download/ | Error: {str(e)}"
        )
