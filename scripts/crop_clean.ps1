Add-Type -AssemblyName System.Drawing

function Crop-Image($srcPath, $x, $y, $w, $h, $destPath) {
    $src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $srcPath))
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $crop = $src.Clone($rect, $src.PixelFormat)
    $crop.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $crop.Dispose()
    $src.Dispose()
    Write-Host "Saved $destPath ($w x $h)"
}

# Tray starts around y=140. Let's make height 235 so it ends at y=375, well above any pill!
Crop-Image "public\images\3d\our_products_3d_light.png" 136 142 224 230 "public\images\3d\cluster_knit_light.jpg"
Crop-Image "public\images\3d\our_products_3d_dark.png" 136 142 224 230 "public\images\3d\cluster_knit_dark.jpg"

Crop-Image "public\images\3d\our_products_3d_light.png" 393 142 224 230 "public\images\3d\cluster_woven_light.jpg"
Crop-Image "public\images\3d\our_products_3d_dark.png" 393 142 224 230 "public\images\3d\cluster_woven_dark.jpg"

Crop-Image "public\images\3d\our_products_3d_light.png" 650 142 224 230 "public\images\3d\cluster_sweater_light.jpg"
Crop-Image "public\images\3d\our_products_3d_dark.png" 650 142 224 230 "public\images\3d\cluster_sweater_dark.jpg"
