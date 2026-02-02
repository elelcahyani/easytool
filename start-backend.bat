@echo off
echo Starting Easy Tool Backend...
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
