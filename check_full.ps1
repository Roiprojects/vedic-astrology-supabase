try {
    $r = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 10
    Write-Host "=== STATUS: $($r.StatusCode) ==="
    Write-Host "=== FULL HTML ==="
    Write-Host $r.Content
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
