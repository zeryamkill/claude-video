#!/usr/bin/env bash
set -euo pipefail

# Claude Video Installer
# Wraps everything in main() to prevent partial execution on network failure.
#
# Remote install (from GitHub):
#   curl -fsSL https://raw.githubusercontent.com/AgriciDaniel/claude-video/main/install.sh | bash
#
# Local install (from cloned repo):
#   bash install.sh
#
# Override version:
#   CLAUDE_VIDEO_TAG=main bash install.sh

main() {
    local SKILL_DIR="$HOME/.claude/skills"
    local AGENT_DIR="$HOME/.claude/agents"
    local MAIN_SKILL="$SKILL_DIR/claude-video"
    local REPO_URL="https://github.com/AgriciDaniel/claude-video"
    # Pin to a specific release tag to prevent silent updates from main.
    # Override: CLAUDE_VIDEO_TAG=main bash install.sh
    local REPO_TAG="${CLAUDE_VIDEO_TAG:-v1.1.0}"

    echo ""
    echo "  Claude Video - AI Video Production Suite"
    echo "  ========================================="
    echo "  Version: ${REPO_TAG}"
    echo ""

    # ── Prerequisites ──────────────────────────────────────────────

    if ! command -v ffmpeg &>/dev/null; then
        echo "  x FFmpeg not found. Install with: sudo apt install ffmpeg"
        exit 1
    fi
    echo "  + FFmpeg $(ffmpeg -version 2>&1 | head -1 | grep -oP 'version \K[^ ]+')"

    if ! command -v python3 &>/dev/null; then
        echo "  x Python 3 not found"
        exit 1
    fi

    local PY_VERSION
    PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    local PY_OK
    PY_OK=$(python3 -c "import sys; print(1 if sys.version_info >= (3, 10) else 0)")
    if [ "${PY_OK}" = "0" ]; then
        echo "  x Python 3.10+ required but ${PY_VERSION} found"
        exit 1
    fi
    echo "  + Python ${PY_VERSION}"

    if ! command -v node &>/dev/null; then
        echo "  ~ Node.js not found (needed for Remotion promo pipeline)"
    else
        echo "  + Node.js $(node -v)"
    fi

    if ! command -v git &>/dev/null; then
        echo "  x Git is required but not installed"
        exit 1
    fi

    echo ""

    # ── Source resolution ──────────────────────────────────────────
    # If run from inside the repo, use local files. Otherwise clone.

    local SOURCE_DIR
    local CLEANUP=""

    if [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills/video/SKILL.md" ]; then
        SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        echo "  > Installing from local repo: ${SOURCE_DIR}"
    else
        SOURCE_DIR=$(mktemp -d)
        CLEANUP="${SOURCE_DIR}"
        trap "rm -rf ${CLEANUP}" EXIT
        echo "  > Downloading Claude Video (${REPO_TAG})..."
        git clone --depth 1 --branch "${REPO_TAG}" "${REPO_URL}" "${SOURCE_DIR}" 2>/dev/null
    fi

    echo ""

    # ── Create directories ─────────────────────────────────────────

    mkdir -p "${SKILL_DIR}" "${AGENT_DIR}" "${MAIN_SKILL}"

    # ── Install main skill ─────────────────────────────────────────

    echo "  > Installing main skill: video"
    cp "${SOURCE_DIR}/skills/video/SKILL.md" "${MAIN_SKILL}/SKILL.md"

    # ── Install scripts ────────────────────────────────────────────

    mkdir -p "${MAIN_SKILL}/scripts"
    local SCRIPT_COUNT=0
    for f in "${SOURCE_DIR}/scripts/"*.py "${SOURCE_DIR}/scripts/"*.sh; do
        [ -f "$f" ] && cp "$f" "${MAIN_SKILL}/scripts/" && SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
    done
    # Promo pipeline scripts
    if [ -d "${SOURCE_DIR}/promo-pipeline/scripts" ]; then
        for f in "${SOURCE_DIR}/promo-pipeline/scripts/"*.py; do
            [ -f "$f" ] && cp "$f" "${MAIN_SKILL}/scripts/" && SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
        done
    fi
    echo "  + Installed ${SCRIPT_COUNT} scripts"

    # ── Install references ─────────────────────────────────────────

    mkdir -p "${MAIN_SKILL}/references"
    local REF_COUNT=0
    for f in "${SOURCE_DIR}/references/"*.md; do
        [ -f "$f" ] && cp "$f" "${MAIN_SKILL}/references/" && REF_COUNT=$((REF_COUNT + 1))
    done
    # Promo pipeline references
    if [ -d "${SOURCE_DIR}/promo-pipeline/references" ]; then
        for f in "${SOURCE_DIR}/promo-pipeline/references/"*.md; do
            [ -f "$f" ] && cp "$f" "${MAIN_SKILL}/references/" && REF_COUNT=$((REF_COUNT + 1))
        done
    fi
    echo "  + Installed ${REF_COUNT} references"

    # ── Install sub-skills ─────────────────────────────────────────

    local SUB_COUNT=0
    for skill_dir in "${SOURCE_DIR}/skills/video-"*/; do
        if [ -d "$skill_dir" ]; then
            local skill_name
            skill_name=$(basename "$skill_dir")
            mkdir -p "${SKILL_DIR}/claude-${skill_name}"
            cp "${skill_dir}/SKILL.md" "${SKILL_DIR}/claude-${skill_name}/SKILL.md"
            SUB_COUNT=$((SUB_COUNT + 1))
        fi
    done
    echo "  + Installed ${SUB_COUNT} sub-skills"

    # ── Install agents ─────────────────────────────────────────────

    local AGENT_COUNT=0
    if [ -d "${SOURCE_DIR}/agents" ]; then
        for f in "${SOURCE_DIR}/agents/"*.md; do
            [ -f "$f" ] && cp "$f" "${AGENT_DIR}/" && AGENT_COUNT=$((AGENT_COUNT + 1))
        done
    fi
    echo "  + Installed ${AGENT_COUNT} agents"

    # ── Install hooks ──────────────────────────────────────────────

    if [ -d "${SOURCE_DIR}/hooks" ]; then
        mkdir -p "${MAIN_SKILL}/hooks"
        for f in "${SOURCE_DIR}/hooks/"*.py "${SOURCE_DIR}/hooks/"*.sh; do
            [ -f "$f" ] && cp "$f" "${MAIN_SKILL}/hooks/" && chmod +x "${MAIN_SKILL}/hooks/$(basename "$f")"
        done
        echo "  + Installed hooks"
    fi

    # ── Copy requirements.txt ──────────────────────────────────────

    cp "${SOURCE_DIR}/requirements.txt" "${MAIN_SKILL}/requirements.txt" 2>/dev/null || true

    # ── Install Python dependencies (venv preferred, --user fallback) ──

    echo ""
    echo "  > Installing Python dependencies..."
    local VENV_DIR="${MAIN_SKILL}/.venv"
    if python3 -m venv "${VENV_DIR}" 2>/dev/null; then
        # Install only non-GPU deps (torch must be installed separately)
        "${VENV_DIR}/bin/pip" install --quiet \
            "google-genai>=1.67.0,<2.0.0" \
            "playwright>=1.56.0,<2.0.0" \
            "Pillow>=10.0.0,<12.0.0" \
            "requests>=2.32.0,<3.0.0" \
            2>/dev/null && \
            echo "  + Core deps installed in venv at ${VENV_DIR}" || \
            echo "  ~ Venv pip install failed. Run: ${VENV_DIR}/bin/pip install -r ${MAIN_SKILL}/requirements.txt"
    else
        pip install --quiet --user \
            "google-genai>=1.67.0,<2.0.0" \
            "Pillow>=10.0.0,<12.0.0" \
            "requests>=2.32.0,<3.0.0" \
            2>/dev/null || \
        echo "  ~ Could not auto-install. Run: pip install --user -r ${MAIN_SKILL}/requirements.txt"
    fi

    # ── Optional: Playwright browsers ──────────────────────────────

    echo "  > Installing Playwright browsers (optional, for web screenshots)..."
    if [ -f "${VENV_DIR}/bin/playwright" ]; then
        "${VENV_DIR}/bin/python" -m playwright install chromium 2>/dev/null || \
        echo "  ~ Playwright install skipped. Web screenshots will not be available."
    else
        python3 -m playwright install chromium 2>/dev/null || \
        echo "  ~ Playwright install skipped."
    fi

    # ── Done ───────────────────────────────────────────────────────

    echo ""
    echo "  + Installation complete!"
    echo ""
    echo "  Usage:"
    echo "    claude"
    echo "    /video              Interactive mode"
    echo "    /video edit          Trim, cut, merge, transitions"
    echo "    /video promo         Stock footage promo videos"
    echo "    /video caption       Transcribe + animated subtitles"
    echo "    /video export        Platform-optimized export"
    echo ""
    echo "  For GPU AI features (upscale, face restore, frame interpolation):"
    echo "    pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121"
    echo "    pip install -r ${MAIN_SKILL}/requirements.txt"
    echo ""
    echo "  For Remotion promo pipeline:"
    echo "    cd <repo>/promo-pipeline && npm install"
    echo ""
    echo "  Python deps: ${MAIN_SKILL}/requirements.txt"
    echo "  To uninstall: curl -fsSL ${REPO_URL}/raw/main/uninstall.sh | bash"
    echo ""
}

main "$@"
