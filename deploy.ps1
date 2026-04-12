# deploy.ps1 — Build frontend + deploy server + frontend to server

$SERVER = "root@192.168.199.222"
$PORT = "2222"
$REMOTE_DIR = "/var/www/english-master"

Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location D:\qwen\language-practice\frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Uploading frontend to server..." -ForegroundColor Yellow
scp -P $PORT -r D:\qwen\language-practice\frontend\dist\* "$SERVER`:$REMOTE_DIR/"

Write-Host "Uploading server to server..." -ForegroundColor Yellow
scp -P $PORT D:\qwen\language-practice\server\*.* "$SERVER`:$REMOTE_DIR/server/"
scp -P $PORT D:\qwen\language-practice\server\server.js "$SERVER`:$REMOTE_DIR/server/"

Write-Host "Done! http://192.168.199.222" -ForegroundColor Green
