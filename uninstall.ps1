# Claude Video: Windows PowerShell Uninstaller
# Usage: powershell -ExecutionPolicy Bypass -File uninstall.ps1

$SkillDir = Join-Path $env:USERPROFILE ".claude\skills"
$AgentDir = Join-Path $env:USERPROFILE ".claude\agents"

Write-Host ""
Write-Host "  Claude Video: Uninstaller"
Write-Host "  ========================="
Write-Host ""

# Remove main skill
$MainSkill = Join-Path $SkillDir "claude-video"
if (Test-Path $MainSkill) {
    Remove-Item -Recurse -Force $MainSkill
    Write-Host "  + Removed claude-video skill"
}

# Remove sub-skills
$Count = 0
Get-ChildItem $SkillDir -Directory -Filter "claude-video-*" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item -Recurse -Force $_.FullName
    $Count++
}
if ($Count -gt 0) { Write-Host "  + Removed $Count sub-skills" }

# Remove agents
$AgentCount = 0
Get-ChildItem $AgentDir -Filter "claude-video-*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item -Force $_.FullName
    $AgentCount++
}
if ($AgentCount -gt 0) { Write-Host "  + Removed $AgentCount agents" }

Write-Host ""
Write-Host "  + Uninstall complete."
Write-Host ""
