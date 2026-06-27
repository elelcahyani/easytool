from PyPDF2 import PdfReader, PdfWriter
from pathlib import Path
from typing import List
import subprocess
import shutil
import glob
import os
import pikepdf


def _find_ghostscript() -> str | None:
    """Find Ghostscript executable on Windows or Linux."""
    # 1. Try commands already in PATH
    for cmd in ['gswin64c', 'gswin32c', 'gs']:
        try:
            result = subprocess.run([cmd, '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                return cmd
        except FileNotFoundError:
            continue

    # 2. Search common Windows installation directories
    gs_patterns = [
        r'C:\Program Files\gs\gs*\bin\gswin64c.exe',
        r'C:\Program Files\gs\gs*\bin\gswin32c.exe',
        r'C:\Program Files (x86)\gs\gs*\bin\gswin32c.exe',
    ]
    for pattern in gs_patterns:
        matches = glob.glob(pattern)
        if matches:
            # Sort descending to get the latest version
            matches.sort(reverse=True)
            return matches[0]

    return None


def merge_pdfs(input_paths: List[Path], output_path: Path):
    """Merge multiple PDF files into one"""
    writer = PdfWriter()
    for path in input_paths:
        reader = PdfReader(path)
        for page in reader.pages:
            writer.add_page(page)
    with open(output_path, 'wb') as f:
        writer.write(f)


def compress_pdf(input_path: Path, output_path: Path):
    """
    Compress PDF using Ghostscript (best quality) or pikepdf as fallback.
    If compressed output is larger than or equal to original, return original file.
    """
    original_size = input_path.stat().st_size
    gs_exe = _find_ghostscript()
    gs_success = False

    if gs_exe:
        try:
            subprocess.run(
                [
                    gs_exe,
                    '-sDEVICE=pdfwrite',
                    '-dCompatibilityLevel=1.4',
                    '-dPDFSETTINGS=/ebook',
                    '-dNOPAUSE',
                    '-dQUIET',
                    '-dBATCH',
                    f'-sOutputFile={output_path}',
                    str(input_path)
                ],
                check=True,
                capture_output=True
            )
            gs_success = True
        except (subprocess.CalledProcessError, FileNotFoundError):
            gs_success = False

    # Fallback: pikepdf (still better than PyPDF2)
    if not gs_success:
        try:
            with pikepdf.open(input_path) as pdf:
                pdf.save(
                    output_path,
                    compress_streams=True,
                    object_stream_mode=pikepdf.ObjectStreamMode.generate
                )
        except Exception:
            shutil.copy2(input_path, output_path)
            return

    # Safety check: never return a file larger than the original
    if output_path.exists() and output_path.stat().st_size >= original_size:
        shutil.copy2(input_path, output_path)


def split_pdf(input_path: Path, output_dir: Path):
    """Split PDF into individual pages"""
    reader = PdfReader(input_path)
    for i, page in enumerate(reader.pages, start=1):
        writer = PdfWriter()
        writer.add_page(page)
        out = output_dir / f"page_{i}.pdf"
        with open(out, 'wb') as f:
            writer.write(f)


def rotate_pdf(input_path: Path, output_path: Path, rotation: int):
    """Rotate all pages in PDF by specified degrees (90, 180, 270)"""
    reader = PdfReader(input_path)
    writer = PdfWriter()
    for page in reader.pages:
        page.rotate(rotation)
        writer.add_page(page)
    with open(output_path, 'wb') as f:
        writer.write(f)


def protect_pdf(input_path: Path, output_path: Path, password: str):
    """Add password protection to PDF"""
    with pikepdf.open(input_path) as pdf:
        pdf.save(output_path, encryption=pikepdf.Encryption(
            user=password,
            owner=password,
            R=6  # AES-256
        ))


def unlock_pdf(input_path: Path, output_path: Path, password: str):
    """Remove password protection from PDF"""
    try:
        with pikepdf.open(input_path, password=password) as pdf:
            pdf.save(output_path)
    except pikepdf.PasswordError:
        raise ValueError("Incorrect password")


def pdf_to_text(input_path: Path, output_path: Path):
    """Extract text from PDF"""
    reader = PdfReader(input_path)
    text_content = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        if text.strip():
            text_content.append(f"--- Page {i} ---\n{text}\n")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(text_content))
