Add-Type -AssemblyName System.Drawing

$files = @(
    "public\Apparel_Emporium_app_icon_design_2K_20260927101500.jpg",
    "public\Apparel_Emporium_logo_rendering_2K_20260927100748.jpg",
    "public\Apparel_Emporium_logo_rendering_2K_20260927100757.jpg",
    "public\favicon.png",
    "public\logo.jpg"
)

foreach ($f in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $f))
    Write-Host "$f : $($bmp.Width) x $($bmp.Height)"
    $bmp.Dispose()
}
