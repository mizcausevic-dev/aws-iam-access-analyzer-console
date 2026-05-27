$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

Add-Type -AssemblyName System.Drawing

function New-ProofImage {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle,
        [string[]]$Bullets
    )

    $bitmap = New-Object System.Drawing.Bitmap 1600, 1000
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::FromArgb(7, 10, 15))

    $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 18, 32))
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 139))
    $altAccentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 199, 255))
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(233, 243, 255))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(171, 186, 201))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(42, 111, 88), 2)

    $graphics.FillRectangle($panelBrush, 48, 48, 1504, 904)
    $graphics.DrawRectangle($borderPen, 48, 48, 1504, 904)

    $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleFont = New-Object System.Drawing.Font("Georgia", 34, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 18)
    $bulletFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

    $graphics.DrawString("AWS IAM Access Analyzer Console", $eyebrowFont, $accentBrush, 92, 92)
    $graphics.DrawString($Title, $titleFont, $textBrush, 92, 142)
    $graphics.DrawString($Subtitle, $bodyFont, $mutedBrush, 92, 214)

    $y = 320
    foreach ($bullet in $Bullets) {
        $graphics.DrawString("•", $bulletFont, $altAccentBrush, 108, $y)
        $graphics.DrawString($bullet, $bodyFont, $textBrush, 138, $y + 2)
        $y += 82
    }

    $graphics.DrawString("Synthetic proof render for README packaging.", $bodyFont, $mutedBrush, 92, 880)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofImage -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Title "Overview proof" `
    -Subtitle "Public access, cross-account trust, disabled analyzers, and stale findings in one AWS operator surface." `
    -Bullets @(
        "Public bucket and KMS posture are raised before audit-time surprises hit.",
        "Cross-account trust gaps stay visible instead of buried in exported findings.",
        "Analyzer coverage and perimeter cleanup map directly into a remediation packet."
    )

New-ProofImage -Path (Join-Path $screenshots "02-analyzer-lane-proof.png") `
    -Title "Analyzer lane" `
    -Subtitle "Every lane keeps owner, trust focus, status, and next action visible." `
    -Bullets @(
        "Perimeter, vendor trust, and coverage lanes stay separated cleanly.",
        "Disabled analyzer coverage remains obvious.",
        "Public-access cleanup paths are easy to scan."
    )

New-ProofImage -Path (Join-Path $screenshots "03-finding-risks-proof.png") `
    -Title "Finding risks" `
    -Subtitle "Findings map severity, owner, subject, principal, and the exact rule that fired." `
    -Bullets @(
        "High-severity public access findings surface first.",
        "Owner mapping keeps IAM and cloud-security accountability explicit.",
        "The lane is grounded in Access Analyzer exports."
    )

New-ProofImage -Path (Join-Path $screenshots "04-remediation-posture-proof.png") `
    -Title "Remediation posture" `
    -Subtitle "Packets tie completeness, blocker, owner, and cleanup timing together." `
    -Bullets @(
        "Perimeter exposure, trust hardening, and analyzer coverage stay readable.",
        "Red/yellow/green review posture is easy to scan.",
        "The system is shaped for real AWS cloud-security proof."
    )
