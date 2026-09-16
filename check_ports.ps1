$processes = Get-Process -Name node -ErrorAction SilentlyContinue
foreach ($proc in $processes) {
    $connections = Get-NetTCPConnection -OwningProcess $proc.Id -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            Write-Host "PID $($proc.Id) : Port $($conn.LocalPort)"
        }
    } else {
        Write-Host "PID $($proc.Id) : No listening ports"
    }
}
