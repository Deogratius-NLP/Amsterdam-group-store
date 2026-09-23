@echo off
echo ========================================================
echo Starting Amsterdam Group Ordering System (Dev Mode)
echo ========================================================
REM Ensure Node.js is on PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Start Backend in a separate window
start "Amsterdam Backend (FastAPI)" cmd /k "cd backend && .venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"

REM Start Frontend in current window
cd frontend
cmd /c npm.cmd run dev -- --host 0.0.0.0
