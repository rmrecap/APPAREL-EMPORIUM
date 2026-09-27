Add-Type -AssemblyName System.Drawing

# 1. Favicon (2048x2048 -> high-res 512x512 PNG)
$iconSrc = "public\Apparel_Emporium_app_icon_design_2K_20260927101500.jpg"
if (Test-Path $iconSrc) {
    $bmpIcon = [System.Drawing.Bitmap]::FromFile((Resolve-Path $iconSrc))
    $destFav = New-Object System.Drawing.Bitmap(512, 512)
    $gFav = [System.Drawing.Graphics]::FromImage($destFav)
    $gFav.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gFav.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gFav.DrawImage($bmpIcon, 0, 0, 512, 512)
    
    $destFav.Save("public\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $destFav.Save("public\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    if (Test-Path "public\uploads\logos") {
        $destFav.Save("public\uploads\logos\apparel-emporium-favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $gFav.Dispose()
    $destFav.Dispose()
    $bmpIcon.Dispose()
    Write-Host "Processed Favicon -> 512x512 PNG"
}

# 2. Dark Logo (2752x1536 -> Crop middle horizontal logo band)
# bounds: x: 72, y: 428, w: 2588, h: 636
$darkSrc = "public\Apparel_Emporium_logo_rendering_2K_20260927100757.jpg"
if (Test-Path $darkSrc) {
    $bmpDark = [System.Drawing.Bitmap]::FromFile((Resolve-Path $darkSrc))
    $rectDark = New-Object System.Drawing.Rectangle(72, 428, 2588, 636)
    $cropDark = $bmpDark.Clone($rectDark, $bmpDark.PixelFormat)
    
    $cropDark.Save("public\images\logo_dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
    if (Test-Path "public\uploads\logos") {
        $cropDark.Save("public\uploads\logos\apparel-emporium-logo-dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $cropDark.Dispose()
    $bmpDark.Dispose()
    Write-Host "Processed Dark Logo -> 2588x636 PNG"
}

# 3. Light Logo (2752x1536 -> Crop middle horizontal logo band)
$lightSrc = "public\Apparel_Emporium_logo_rendering_2K_20260927100748.jpg"
if (Test-Path $lightSrc) {
    $bmpLight = [System.Drawing.Bitmap]::FromFile((Resolve-Path $lightSrc))
    $rectLight = New-Object System.Drawing.Rectangle(72, 428, 2588, 636)
    $cropLight = $bmpLight.Clone($rectLight, $bmpLight.PixelFormat)
    
    $cropLight.Save("public\images\logo_light.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $cropLight.Save("public\logo.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    if (Test-Path "public\uploads\logos") {
        $cropLight.Save("public\uploads\logos\apparel-emporium-logo-light.png", [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $cropLight.Dispose()
    $bmpLight.Dispose()
    Write-Host "Processed Light Logo -> 2588x636 PNG"
}
