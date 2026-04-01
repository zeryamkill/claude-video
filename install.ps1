# Claude Video: Windows PowerShell Installer
# Usage: powershell -ExecutionPolicy Bypass -File install.ps1
#
# Remote install:
#   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/AgriciDaniel/claude-video/main/install.ps1" -OutFile install.ps1; .\install.ps1
#
# Override version:
#   $env:CLAUDE_VIDEO_TAG = "main"; .\install.ps1

$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/AgriciDaniel/claude-video"
$RepoTag = if ($env:CLAUDE_VIDEO_TAG) { $env:CLAUDE_VIDEO_TAG } else { "v1.1.0" }

$SkillDir = Join-Path $env:USERPROFILE ".claude\skills"
$AgentDir = Join-Path $env:USERPROFILE ".claude\agents"
$MainSkill = Join-Path $SkillDir "claude-video"

Write-Host ""
Write-Host "  Claude Video - AI Video Production Suite"
Write-Host "  ========================================="
Write-Host "  Version: $RepoTag"
Write-Host ""

# --- Prerequisites ---

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "  X FFmpeg not found. Download from https://ffmpeg.org/download.html"
    exit 1
}
Write-Host "  + FFmpeg found"

$PythonCmd = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" }
             elseif (Get-Command python -ErrorAction SilentlyContinue) { "python" }
             else { $null }
if (-not $PythonCmd) {
    Write-Host "  X Python 3 not found"
    exit 1
}
$PyVersion = & $PythonCmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
Write-Host "  + Python $PyVersion"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "  X Git is required but not installed"
    exit 1
}

# --- Source resolution ---

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceDir = $null
$TempDir = $null

if (Test-Path (Join-Path $ScriptDir "skills\video\SKILL.md")) {
    $SourceDir = $ScriptDir
    Write-Host "  > Installing from local repo: $SourceDir"
} else {
    $TempDir = Join-Path $env:TEMP "claude-video-install-$(Get-Random)"
    Write-Host "  > Downloading Claude Video ($RepoTag)..."
    git clone --depth 1 --branch $RepoTag $RepoUrl $TempDir 2>$null
    $SourceDir = $TempDir
}

Write-Host ""

# --- Create directories ---

New-Item -ItemType Directory -Force -Path $SkillDir | Out-Null
New-Item -ItemType Directory -Force -Path $AgentDir | Out-Null
New-Item -ItemType Directory -Force -Path $MainSkill | Out-Null

# --- Install main skill ---

Write-Host "  > Installing main skill: video"
Copy-Item (Join-Path $SourceDir "skills\video\SKILL.md") (Join-Path $MainSkill "SKILL.md")

# --- Install scripts ---

$ScriptsDir = Join-Path $MainSkill "scripts"
New-Item -ItemType Directory -Force -Path $ScriptsDir | Out-Null
$ScriptCount = 0
Get-ChildItem (Join-Path $SourceDir "scripts") -File -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName -Destination $ScriptsDir
    $ScriptCount++
}
# Promo pipeline scripts
$PromoScripts = Join-Path $SourceDir "promo-pipeline\scripts"
if (Test-Path $PromoScripts) {
    Get-ChildItem $PromoScripts -Filter "*.py" | ForEach-Object {
        Copy-Item $_.FullName -Destination $ScriptsDir
        $ScriptCount++
    }
}
Write-Host "  + Installed $ScriptCount scripts"

# --- Install references ---

$RefsDir = Join-Path $MainSkill "references"
New-Item -ItemType Directory -Force -Path $RefsDir | Out-Null
$RefCount = 0
Get-ChildItem (Join-Path $SourceDir "references") -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName -Destination $RefsDir
    $RefCount++
}
$PromoRefs = Join-Path $SourceDir "promo-pipeline\references"
if (Test-Path $PromoRefs) {
    Get-ChildItem $PromoRefs -Filter "*.md" | ForEach-Object {
        Copy-Item $_.FullName -Destination $RefsDir
        $RefCount++
    }
}
Write-Host "  + Installed $RefCount references"

# --- Install sub-skills ---

$SubCount = 0
Get-ChildItem (Join-Path $SourceDir "skills") -Directory | Where-Object { $_.Name -like "video-*" } | ForEach-Object {
    $DestDir = Join-Path $SkillDir "claude-$($_.Name)"
    New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
    Copy-Item (Join-Path $_.FullName "SKILL.md") (Join-Path $DestDir "SKILL.md")
    $SubCount++
}
Write-Host "  + Installed $SubCount sub-skills"

# --- Install agents ---

$AgentCount = 0
Get-ChildItem (Join-Path $SourceDir "agents") -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $AgentDir $_.Name)
    $AgentCount++
}
Write-Host "  + Installed $AgentCount agents"

# --- Install hooks ---

$HooksSource = Join-Path $SourceDir "hooks"
if (Test-Path $HooksSource) {
    $HooksDir = Join-Path $MainSkill "hooks"
    New-Item -ItemType Directory -Force -Path $HooksDir | Out-Null
    Get-ChildItem $HooksSource -File | ForEach-Object {
        Copy-Item $_.FullName -Destination $HooksDir
    }
    Write-Host "  + Installed hooks"
}

# --- Copy requirements.txt ---

$ReqFile = Join-Path $SourceDir "requirements.txt"
if (Test-Path $ReqFile) {
    Copy-Item $ReqFile (Join-Path $MainSkill "requirements.txt")
}

# --- Install Python dependencies ---

Write-Host ""
Write-Host "  > Installing Python dependencies..."
$VenvDir = Join-Path $MainSkill ".venv"
try {
    & $PythonCmd -m venv $VenvDir 2>$null
    $PipCmd = Join-Path $VenvDir "Scripts\pip.exe"
    & $PipCmd install --quiet `
        "google-genai>=1.67.0,<2.0.0" `
        "playwright>=1.56.0,<2.0.0" `
        "Pillow>=10.0.0,<12.0.0" `
        "requests>=2.32.0,<3.0.0" `
        2>$null
    Write-Host "  + Core deps installed in venv at $VenvDir"
} catch {
    Write-Host "  ~ Venv install failed. Run: pip install -r $(Join-Path $MainSkill 'requirements.txt')"
}

# --- Cleanup temp dir ---

if ($TempDir -and (Test-Path $TempDir)) {
    Remove-Item -Recurse -Force $TempDir
}

# --- Done ---

Write-Host ""
Write-Host "  + Installation complete!"
Write-Host ""
Write-Host "  Usage:"
Write-Host "    claude"
Write-Host "    /video              Interactive mode"
Write-Host "    /video edit          Trim, cut, merge, transitions"
Write-Host "    /video promo         Stock footage promo videos"
Write-Host "    /video caption       Transcribe + animated subtitles"
Write-Host "    /video export        Platform-optimized export"
Write-Host ""
Write-Host "  For GPU AI features:"
Write-Host "    pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121"
Write-Host "    pip install -r $(Join-Path $MainSkill 'requirements.txt')"
Write-Host ""
