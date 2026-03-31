#!/usr/bin/env bash
set -euo pipefail

# Claude Video — Installer
# Installs skills, agents, scripts, and references to ~/.claude/

main() {
    local REPO_DIR
    REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    local SKILL_DIR="$HOME/.claude/skills"
    local AGENT_DIR="$HOME/.claude/agents"

    echo ""
    echo "  Claude Video — AI Video Production Suite"
    echo "  ========================================="
    echo ""

    # Check prerequisites
    if ! command -v ffmpeg &>/dev/null; then
        echo "  ✗ FFmpeg not found. Install with: sudo apt install ffmpeg"
        exit 1
    fi
    echo "  ✓ FFmpeg found"

    if ! command -v python3 &>/dev/null; then
        echo "  ✗ Python 3 not found"
        exit 1
    fi

    local PY_VERSION
    PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    echo "  ✓ Python $PY_VERSION found"

    if ! command -v node &>/dev/null; then
        echo "  ⚠ Node.js not found (needed for Remotion promo pipeline)"
    else
        echo "  ✓ Node.js $(node -v) found"
    fi

    echo ""

    # Create directories
    mkdir -p "$SKILL_DIR" "$AGENT_DIR"

    # Install main skill
    echo "  → Installing main skill: video"
    mkdir -p "$SKILL_DIR/claude-video"
    cp "$REPO_DIR/skills/video/SKILL.md" "$SKILL_DIR/claude-video/SKILL.md"

    # Install scripts
    mkdir -p "$SKILL_DIR/claude-video/scripts"
    for f in "$REPO_DIR/scripts/"*.{py,sh}; do
        [ -f "$f" ] && cp "$f" "$SKILL_DIR/claude-video/scripts/"
    done
    echo "  ✓ Installed $(ls "$REPO_DIR/scripts/"*.{py,sh} 2>/dev/null | wc -l) scripts"

    # Install references
    mkdir -p "$SKILL_DIR/claude-video/references"
    for f in "$REPO_DIR/references/"*.md; do
        [ -f "$f" ] && cp "$f" "$SKILL_DIR/claude-video/references/"
    done
    echo "  ✓ Installed $(ls "$REPO_DIR/references/"*.md 2>/dev/null | wc -l) references"

    # Install sub-skills
    local COUNT=0
    for skill_dir in "$REPO_DIR/skills/video-"*/; do
        if [ -d "$skill_dir" ]; then
            local skill_name
            skill_name=$(basename "$skill_dir")
            mkdir -p "$SKILL_DIR/claude-$skill_name"
            cp "$skill_dir/SKILL.md" "$SKILL_DIR/claude-$skill_name/SKILL.md"
            COUNT=$((COUNT + 1))
        fi
    done
    echo "  ✓ Installed $COUNT sub-skills"

    # Install agents
    local AGENT_COUNT=0
    if [ -d "$REPO_DIR/agents" ]; then
        for f in "$REPO_DIR/agents/"*.md; do
            [ -f "$f" ] && cp "$f" "$AGENT_DIR/" && AGENT_COUNT=$((AGENT_COUNT + 1))
        done
    fi
    echo "  ✓ Installed $AGENT_COUNT agents"

    # Install promo pipeline scripts (into main skill scripts dir)
    if [ -d "$REPO_DIR/promo-pipeline/scripts" ]; then
        for f in "$REPO_DIR/promo-pipeline/scripts/"*.py; do
            [ -f "$f" ] && cp "$f" "$SKILL_DIR/claude-video/scripts/"
        done
        echo "  ✓ Installed promo pipeline scripts"
    fi

    echo ""
    echo "  ✓ Installation complete!"
    echo ""
    echo "  Usage:"
    echo "    claude"
    echo "    /video              Interactive mode"
    echo "    /video edit          Trim, cut, merge, transitions"
    echo "    /video promo         Stock footage promo videos"
    echo "    /video caption       Transcribe + animated subtitles"
    echo "    /video export        Platform-optimized export"
    echo ""
    echo "  For Remotion promo pipeline:"
    echo "    cd $REPO_DIR/promo-pipeline && npm install"
    echo ""
}

main "$@"
