try {
    $r = Invoke-WebRequest -Uri 'http://localhost:5173/src/main.tsx' -UseBasicParsing -TimeoutSec 5
    Write-Host "main.tsx Status: $($r.StatusCode) Length: $($r.Content.Length)"
    Write-Host $r.Content.Substring(0, [Math]::Min(300, $r.Content.Length))
} catch {
    Write-Host "main.tsx ERROR: $($_.Exception.Message)"
}
Write-Host "---"
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:5173/src/App.tsx' -UseBasicParsing -TimeoutSec 5
    Write-Host "App.tsx Status: $($r.StatusCode) Length: $($r.Content.Length)"
} catch {
    Write-Host "App.tsx ERROR: $($_.Exception.Message)"
}
Write-Host "---"
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:5173/@vite/client' -UseBasicParsing -TimeoutSec 5
    Write-Host "vite/client Status: $($r.StatusCode) Length: $($r.Content.Length)"
} catch {
    Write-Host "vite/client ERROR: $($_.Exception.Message)"
}
