param(
  [string]$Output = "vedic-deploy.zip",
  [string]$Source = "."
)

$ErrorActionPreference = "Stop"

$excludeDirs = @(
  "node_modules",
  ".git",
  "dist",
  ".vercel",
  "android\.gradle",
  "android\app\build",
  "android\build",
  "ios\App\Pods",
  "ios\App\build",
  ".idea",
  ".vscode"
)

$tmpDir = [System.IO.Path]::GetTempPath() + "vedic-zip-tmp"
if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }
New-Item $tmpDir -ItemType Directory | Out-Null

$excludeArgs = @()
foreach ($d in $excludeDirs) { $excludeArgs += "/xd"; $excludeArgs += $d }

robocopy $Source $tmpDir /E /NFL /NDL /NJH /NJS /NC /NS @excludeArgs | Out-Null

$files = Get-ChildItem -Path $tmpDir -Recurse -File -ErrorAction SilentlyContinue

if (Test-Path $Output) { Remove-Item $Output -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($Output, 'Create')

$count = 0
foreach ($f in $files) {
  $rel = $f.FullName.Substring($tmpDir.Length).TrimStart('\', '/')
  $entry = $zip.CreateEntry($rel)
  $entryStream = $entry.Open()
  $fs = [System.IO.File]::OpenRead($f.FullName)
  $fs.CopyTo($entryStream)
  $fs.Close()
  $entryStream.Close()
  $count++
}

$zip.Dispose()
Remove-Item $tmpDir -Recurse -Force -ErrorAction SilentlyContinue

$size = (Get-Item $Output).Length / 1MB
Write-Host ""
Write-Host "Done: $Output ($([math]::Round($size, 1)) MB) - $count files"
