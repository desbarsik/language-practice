Write-Host "Building..." -ForegroundColor Yellow
cd D:\qwen\language-practice\frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Uploading to server..." -ForegroundColor Yellow
scp -P 2222 -r D:\qwen\language-practice\frontend\dist\* root@192.168.199.222:/var/www/english-master/

if ($LASTEXITCODE -eq 0) {
    Write-Host "Done! http://192.168.199.222" -ForegroundColor Green
} else {
    Write-Host "Upload failed!" -ForegroundColor Red
}