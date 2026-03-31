# Claude Video: Windows PowerShell Installer
# Usage: powershell -ExecutionPolicy Bypass -File install.ps1

$ErrorActionPreference = "Stop"

$SkillDir = Join-Path $env:USERPROFILE ".claude\skills"
$AgentDir = Join-Path $env:USERPROFILE ".claude\agents"
$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  Claude Video: AI Video Production Suite"
Write-Host "  ========================================="
Write-Host ""

# Check FFmpeg
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "  X FFmpeg not found. Download from https://ffmpeg.org/download.html"
    exit 1
}
Write-Host "  + FFmpeg found"

# Check Python
if (-not (Get-Command python3 -ErrorAction SilentlyContinue) -and -not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "  X Python 3 not found"
    exit 1
}
Write-Host "  + Python found"

# Create directories
New-Item -ItemType Directory -Force -Path $SkillDir | Out-Null
New-Item -ItemType Directory -Force -Path $AgentDir | Out-Null

# Install main skill
$MainSkill = Join-Path $SkillDir "claude-video"
New-Item -ItemType Directory -Force -Path $MainSkill | Out-Null
Copy-Item (Join-Path $RepoDir "skills\video\SKILL.md") (Join-Path $MainSkill "SKILL.md")

# Install scripts
$ScriptsDir = Join-Path $MainSkill "scripts"
New-Item -ItemType Directory -Force -Path $ScriptsDir | Out-Null
Get-ChildItem (Join-Path $RepoDir "scripts") -File | Copy-Item -Destination $ScriptsDir
Write-Host "  + Installed scripts"

# Install references
$RefsDir = Join-Path $MainSkill "references"
New-Item -ItemType Directory -Force -Path $RefsDir | Out-Null
Get-ChildItem (Join-Path $RepoDir "references") -Filter "*.md" | Copy-Item -Destination $RefsDir
Write-Host "  + Installed references"

# Install sub-skills
$Count = 0
Get-ChildItem (Join-Path $RepoDir "skills") -Directory | Where-Object { $_.Name -like "video-*" } | ForEach-Object {
    $DestDir = Join-Path $SkillDir "claude-$($_.Name)"
    New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
    Copy-Item (Join-Path $_.FullName "SKILL.md") (Join-Path $DestDir "SKILL.md")
    $Count++
}
Write-Host "  + Installed $Count sub-skills"

# Install agents
$AgentCount = 0
Get-ChildItem (Join-Path $RepoDir "agents") -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $AgentDir $_.Name)
    $AgentCount++
}
Write-Host "  + Installed $AgentCount agents"

# Install promo pipeline scripts
$PromoScripts = Join-Path $RepoDir "promo-pipeline\scripts"
if (Test-Path $PromoScripts) {
    Get-ChildItem $PromoScripts -Filter "*.py" | Copy-Item -Destination $ScriptsDir
    Write-Host "  + Installed promo pipeline scripts"
}

Write-Host ""
Write-Host "  + Installation complete!"
Write-Host ""
Write-Host "  Usage: claude -> /video"
Write-Host ""
