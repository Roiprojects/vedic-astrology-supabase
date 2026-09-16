try {
    $r = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 5
    Write-Host "Status: $($r.StatusCode)"
    Write-Host "Content length: $($r.Content.Length)"
    Write-Host "First 500 chars:"
    Write-Host $r.Content.Substring(0, [Math]::Min(500, $r.Content.Length))
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
}
