try {
    $r = Invoke-WebRequest -Uri 'http://localhost:5173/assets/index-Cl5DBT-F.js' -UseBasicParsing -TimeoutSec 10
    Write-Host "JS bundle: Status=$($r.StatusCode) Size=$($r.Content.Length)"
    # Look for error patterns
    if ($r.Content -match "error|Error|ERROR|crash|undefined is not") {
        Write-Host "WARNING: Possible error patterns found in JS"
    } else {
        Write-Host "JS content looks clean"
    }
} catch {
    Write-Host "JS FAIL: $($_.Exception.Message)"
}
