try {
    $r = Invoke-WebRequest -Uri 'http://localhost:5173/src/main.tsx' -UseBasicParsing -TimeoutSec 5
    Write-Host "main.tsx:"
    Write-Host $r.Content.Substring(0, [Math]::Min(200, $r.Content.Length))
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
}
