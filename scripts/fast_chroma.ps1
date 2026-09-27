$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class FastChroma {
    public static void ProcessGreen(string srcPath, string destPath) {
        using (Bitmap src = new Bitmap(srcPath)) {
            Bitmap bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp)) {
                g.DrawImage(src, 0, 0, src.Width, src.Height);
            }
            BitmapData data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(data.Stride) * bmp.Height;
            byte[] rgbValues = new byte[bytes];
            Marshal.Copy(data.Scan0, rgbValues, 0, bytes);

            for (int i = 0; i < bytes; i += 4) {
                byte b = rgbValues[i];
                byte g = rgbValues[i + 1];
                byte r = rgbValues[i + 2];

                int maxRB = Math.Max((int)r, (int)b);
                int diff = (int)g - maxRB;
                if (diff > 30 && g > 80) {
                    rgbValues[i + 3] = 0;
                } else if (diff > 8 && g > 65) {
                    float t = (diff - 8f) / 22f;
                    byte alpha = (byte)Math.Max(0, Math.Min(255, (int)(255 * (1f - t))));
                    rgbValues[i + 3] = alpha;
                    rgbValues[i + 1] = (byte)Math.Min((int)g, maxRB + 5);
                } else {
                    if (g > maxRB && maxRB > 40) {
                        rgbValues[i + 1] = (byte)maxRB;
                    }
                    rgbValues[i + 3] = 255;
                }
            }

            Marshal.Copy(rgbValues, 0, data.Scan0, bytes);
            bmp.UnlockBits(data);
            bmp.Save(destPath, ImageFormat.Png);
            bmp.Dispose();
        }
    }

    public static void ProcessMagenta(string srcPath, string destPath) {
        using (Bitmap src = new Bitmap(srcPath)) {
            Bitmap bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp)) {
                g.DrawImage(src, 0, 0, src.Width, src.Height);
            }
            BitmapData data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int bytes = Math.Abs(data.Stride) * bmp.Height;
            byte[] rgbValues = new byte[bytes];
            Marshal.Copy(data.Scan0, rgbValues, 0, bytes);

            for (int i = 0; i < bytes; i += 4) {
                byte b = rgbValues[i];
                byte g = rgbValues[i + 1];
                byte r = rgbValues[i + 2];

                int minRB = Math.Min((int)r, (int)b);
                int diff = minRB - (int)g;
                if (diff > 30 && minRB > 85) {
                    rgbValues[i + 3] = 0;
                } else if (diff > 8 && minRB > 65) {
                    float t = (diff - 8f) / 22f;
                    byte alpha = (byte)Math.Max(0, Math.Min(255, (int)(255 * (1f - t))));
                    rgbValues[i + 3] = alpha;
                    rgbValues[i] = (byte)Math.Min((int)b, (int)g + 10);
                    rgbValues[i + 2] = (byte)Math.Min((int)r, (int)g + 10);
                } else {
                    if (minRB > (int)g * 1.2 && g > 40) {
                        rgbValues[i] = (byte)Math.Min((int)b, (int)g + 15);
                        rgbValues[i + 2] = (byte)Math.Min((int)r, (int)g + 15);
                    }
                    rgbValues[i + 3] = 255;
                }
            }

            Marshal.Copy(rgbValues, 0, data.Scan0, bytes);
            bmp.UnlockBits(data);
            bmp.Save(destPath, ImageFormat.Png);
            bmp.Dispose();
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -ReferencedAssemblies System.Drawing

$brainDir = "C:\Users\DELL\.gemini\antigravity-ide\brain\ab7c7402-f82e-43c1-add9-faef2a06dc8b"

$ownFile = Get-ChildItem -Path $brainDir -Filter "val_ownership_3d_*.jpg" | Select-Object -First 1
$excFile = Get-ChildItem -Path $brainDir -Filter "val_excellence_3d_*.jpg" | Select-Object -First 1
$socFile = Get-ChildItem -Path $brainDir -Filter "val_social_3d_*.jpg" | Select-Object -First 1

Write-Host "Found Ownership: $($ownFile.FullName)"
Write-Host "Found Excellence: $($excFile.FullName)"
Write-Host "Found Social: $($socFile.FullName)"

# Output paths
$ownLight = "public\images\3d\emblem_ownership_light.png"
$ownDark = "public\images\3d\emblem_ownership_dark.png"
$excLight = "public\images\3d\emblem_excellence_light.png"
$excDark = "public\images\3d\emblem_excellence_dark.png"
$socLight = "public\images\3d\emblem_social_light.png"
$socDark = "public\images\3d\emblem_social_dark.png"

[FastChroma]::ProcessGreen($ownFile.FullName, (Resolve-Path -Path "public\images\3d" | Join-Path -ChildPath "emblem_ownership_dark.png"))
Copy-Item $ownDark $ownLight -Force
Write-Host "Saved Ownership Transparent 3D PNG!"

[FastChroma]::ProcessGreen($excFile.FullName, (Resolve-Path -Path "public\images\3d" | Join-Path -ChildPath "emblem_excellence_dark.png"))
Copy-Item $excDark $excLight -Force
Write-Host "Saved Excellence Transparent 3D PNG!"

[FastChroma]::ProcessMagenta($socFile.FullName, (Resolve-Path -Path "public\images\3d" | Join-Path -ChildPath "emblem_social_dark.png"))
Copy-Item $socDark $socLight -Force
Write-Host "Saved Social Responsibility Transparent 3D PNG!"

Write-Host "=== SUCCESS: ALL 3D EMBLEMS PROCESSED WITH 100% TRANSPARENCY ==="
