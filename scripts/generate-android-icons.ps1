Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "..\resources\icon.png"
$res = Join-Path $PSScriptRoot "..\android\app\src\main\res"
$srcFull = (Resolve-Path $src).Path
$img = [System.Drawing.Image]::FromFile($srcFull)

function Save-Resized([int]$size, [string]$dest, [bool]$pad = $false) {
  $dir = Split-Path $dest
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.Clear([System.Drawing.Color]::FromArgb(255, 8, 10, 24))
  if ($pad) {
    $inset = [int]($size * 0.18)
    $g.DrawImage($img, $inset, $inset, $size - 2 * $inset, $size - 2 * $inset)
  } else {
    $g.DrawImage($img, 0, 0, $size, $size)
  }
  $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$legacy = @{ mdpi = 48; hdpi = 72; xhdpi = 96; xxhdpi = 144; xxxhdpi = 192 }
$adaptive = @{ mdpi = 108; hdpi = 162; xhdpi = 216; xxhdpi = 324; xxxhdpi = 432 }

foreach ($d in $legacy.Keys) {
  $folder = Join-Path $res "mipmap-$d"
  Save-Resized $legacy[$d] (Join-Path $folder "ic_launcher.png") $false
  Save-Resized $legacy[$d] (Join-Path $folder "ic_launcher_round.png") $false
}
foreach ($d in $adaptive.Keys) {
  $folder = Join-Path $res "mipmap-$d"
  Save-Resized $adaptive[$d] (Join-Path $folder "ic_launcher_foreground.png") $true
}

$splashSrcPath = Join-Path $PSScriptRoot "..\resources\splash.png"
$splashImg = [System.Drawing.Image]::FromFile((Resolve-Path $splashSrcPath).Path)
function Save-Splash([int]$w, [int]$h, [string]$dest) {
  $dir = Split-Path $dest
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::FromArgb(255, 8, 10, 24))
  $scale = [Math]::Max($w / $splashImg.Width, $h / $splashImg.Height)
  $nw = [int]($splashImg.Width * $scale)
  $nh = [int]($splashImg.Height * $scale)
  $x = [int](($w - $nw) / 2)
  $y = [int](($h - $nh) / 2)
  $g.DrawImage($splashImg, $x, $y, $nw, $nh)
  $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

Save-Splash 480 800 (Join-Path $res "drawable-port-mdpi\splash.png")
Save-Splash 800 480 (Join-Path $res "drawable-land-mdpi\splash.png")
Save-Splash 720 1280 (Join-Path $res "drawable-port-hdpi\splash.png")
Save-Splash 1280 720 (Join-Path $res "drawable-land-hdpi\splash.png")
Save-Splash 960 1600 (Join-Path $res "drawable-port-xhdpi\splash.png")
Save-Splash 1600 960 (Join-Path $res "drawable-land-xhdpi\splash.png")
Save-Splash 1440 2560 (Join-Path $res "drawable-port-xxhdpi\splash.png")
Save-Splash 2560 1440 (Join-Path $res "drawable-land-xxhdpi\splash.png")
Save-Splash 1920 3200 (Join-Path $res "drawable-port-xxxhdpi\splash.png")
Save-Splash 3200 1920 (Join-Path $res "drawable-land-xxxhdpi\splash.png")
Save-Splash 1080 1920 (Join-Path $res "drawable\splash.png")

$img.Dispose()
$splashImg.Dispose()
Write-Output "icons and splash generated"
