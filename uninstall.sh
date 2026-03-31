#!/usr/bin/env bash
set -euo pipefail

# Claude Video: Uninstaller

main() {
    echo ""
    echo "  Claude Video: Uninstaller"
    echo "  ========================="
    echo ""

    local SKILL_DIR="$HOME/.claude/skills"
    local AGENT_DIR="$HOME/.claude/agents"

    # Remove main skill
    if [ -d "$SKILL_DIR/claude-video" ]; then
        rm -rf "$SKILL_DIR/claude-video"
        echo "  ✓ Removed claude-video skill"
    fi

    # Remove sub-skills
    local COUNT=0
    for d in "$SKILL_DIR"/claude-video-*/; do
        if [ -d "$d" ]; then
            rm -rf "$d"
            COUNT=$((COUNT + 1))
        fi
    done
    [ "$COUNT" -gt 0 ] && echo "  ✓ Removed $COUNT sub-skills"

    # Remove agents
    local AGENT_COUNT=0
    for f in "$AGENT_DIR"/claude-video-*.md; do
        if [ -f "$f" ]; then
            rm -f "$f"
            AGENT_COUNT=$((AGENT_COUNT + 1))
        fi
    done
    [ "$AGENT_COUNT" -gt 0 ] && echo "  ✓ Removed $AGENT_COUNT agents"

    echo ""
    echo "  ✓ Uninstall complete."
    echo ""
    echo "  Note: The promo-pipeline Remotion project (if installed separately)"
    echo "  is not removed by this script. Delete it manually if needed."
    echo ""
}

main "$@"
