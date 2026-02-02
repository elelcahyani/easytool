from PyPDF2 import PdfReader, PdfWriter
from pathlib import Path
from typing import List
import subprocess
import pikepdf

def merge_pdfs(input_paths: List[Path], output_path: Path):
    """Merge multiple PDF files into one"""
    writer = PdfWriter()
    
    for path in input_paths:
        reader = PdfReader(path)
        for page in reader.pages:
            writer.add_page(page)
    
    with open(output_path, 'wb') as output_file:
        writer.write(output_file)

def compress_pdf(input_path: Path, output_path: Path):
    """Compress PDF using Ghostscript (if available) or PyPDF2"""
    try:
        # Try Ghostscript first (better compression)
        subprocess.run([
            'gs',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/ebook',
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            f'-sOutputFile={output_path}',
            str(input_path)
        ], check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Fallback to PyPDF2
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)
        
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)

def split_pdf(input_path: Path, output_dir: Path):
    """Split PDF into individual pages"""
    reader = PdfReader(input_path)
    
    for i, page in enumerate(reader.pages, start=1):
        writer = PdfWriter()
        writer.add_page(page)
        
        output_path = output_dir / f"page_{i}.pdf"
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)

def rotate_pdf(input_path: Path, output_path: Path, rotation: int):
    """Rotate all pages in PDF by specified degrees (90, 180, 270)"""
    reader = PdfReader(input_path)
    writer = PdfWriter()
    
    for page in reader.pages:
        page.rotate(rotation)
        writer.add_page(page)
    
    with open(output_path, 'wb') as output_file:
        writer.write(output_file)

def protect_pdf(input_path: Path, output_path: Path, password: str):
    """Add password protection to PDF"""
    with pikepdf.open(input_path) as pdf:
        pdf.save(output_path, encryption=pikepdf.Encryption(
            user=password,
            owner=password,
            R=6  # AES-256 encryption
        ))

def unlock_pdf(input_path: Path, output_path: Path, password: str):
    """
    Remove password protection from PDF
    
    Args:
        input_path: Path to password-protected PDF
        output_path: Path to save unlocked PDF
        password: Password to unlock the PDF
    
    Raises:
        pikepdf.PasswordError: If password is incorrect
    """
    try:
        with pikepdf.open(input_path, password=password) as pdf:
            pdf.save(output_path)
    except pikepdf.PasswordError:
        raise ValueError("Incorrect password")

def pdf_to_text(input_path: Path, output_path: Path):
    """
    Extract text from PDF
    
    Args:
        input_path: Path to PDF file
        output_path: Path to save text file
    """
    reader = PdfReader(input_path)
    
    text_content = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        if text.strip():
            text_content.append(f"--- Page {i} ---\n{text}\n")
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(text_content))
