# Amsterdam Group Full Stack Development Starter
Write-Host "========================================================" -ForegroundColor Green
Write-Host " Starting Amsterdam Group Ordering System (Dev Mode)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
$env:PATH = "C:\Program Files\nodejs;$env:PATH"

# 1. Start FastAPI Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"

# 2. Start React + Vite Frontend
cd frontend
& cmd /c npm.cmd run dev -- --host 0.0.0.0
