$urls = @(
    "http://localhost:5173/src/globals.css",
    "http://localhost:5173/src/components/layout/Navbar.tsx",
    "http://localhost:5173/src/pages/HomePage.tsx",
    "http://localhost:5173/src/lib/data/index.ts",
    "http://localhost:5173/src/App.tsx"
)
foreach ($url in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        $name = $url.Split('/')[-1]
        Write-Host "$name : OK ($($r.StatusCode), $($r.Content.Length) bytes)"
    } catch {
        $name = $url.Split('/')[-1]
        Write-Host "$name : FAIL - $($_.Exception.Message)"
    }
}
