@echo off
echo Starting Easy Tool Backend...

REM === Setup tool dependencies PATH ===
SET FFMPEG_BIN=C:\Users\dwcel\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin
SET POPPLER_BIN=C:\Users\dwcel\AppData\Local\Microsoft\WinGet\Packages\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\poppler-25.07.0\Library\bin
SET GS_BIN=C:\Program Files\gs\gs10.04.0\bin
SET LIBREOFFICE_BIN=C:\Program Files\LibreOffice\program
SET PATH=%FFMPEG_BIN%;%POPPLER_BIN%;%GS_BIN%;%LIBREOFFICE_BIN%;%PATH%

echo [OK] FFmpeg, Poppler, Ghostscript, LibreOffice paths loaded.

cd backend
if not exist venv312 (
    echo Creating virtual environment with Python 3.12...
    py -3.12 -m venv venv312
)
call venv312\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt
echo Starting FastAPI server on http://localhost:8000
uvicorn main:app --reload
