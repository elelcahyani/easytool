@echo off
echo ========================================
echo Easy Tool - Python Environment Setup
echo ========================================
echo.

REM Check current Python version
echo Checking Python version...
python --version
echo.

REM Check if Python 3.11 or 3.12 is available
echo Checking for Python 3.11...
py -3.11 --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python 3.11 found!
    set PYTHON_CMD=py -3.11
    goto :create_venv
)

echo Python 3.11 not found. Checking for Python 3.12...
py -3.12 --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python 3.12 found!
    set PYTHON_CMD=py -3.12
    goto :create_venv
)

echo.
echo [ERROR] Python 3.11 or 3.12 not found!
echo.
echo The Remove Background feature requires Python 3.11 or 3.12
echo because onnxruntime does not support Python 3.13+ yet.
echo.
echo Please install Python 3.11 or 3.12 from:
echo https://www.python.org/downloads/
echo.
echo After installation, run this script again.
echo.
pause
exit /b 1

:create_venv
echo.
echo ========================================
echo Creating Virtual Environment
echo ========================================
echo.

cd backend

REM Remove old venv if exists
if exist venv (
    echo Removing old virtual environment...
    rmdir /s /q venv
)

REM Create new venv
echo Creating new virtual environment with %PYTHON_CMD%...
%PYTHON_CMD% -m venv venv

REM Activate venv
echo Activating virtual environment...
call venv\Scripts\activate

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo.
echo ========================================
echo Installing Dependencies
echo ========================================
echo.
echo This may take a few minutes...
echo.
pip install -r requirements.txt

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Virtual environment created successfully!
echo Python version: 
python --version
echo.
echo To activate the virtual environment:
echo   cd backend
echo   venv\Scripts\activate
echo.
echo To start the backend server:
echo   Run start-backend.bat
echo.
pause
