#!/bin/sh
# TERMIRATOR BOOT SCRIPT
# Cyberdyne Systems Model 101 Launcher

set -e

PORT="${PORT:-8000}"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

print_banner() {
    cat <<'EOF'
    ========================================
    CYBERDYNE SYSTEMS // TERMIRATOR SHELL
    Model 101 Neural Net Processor Boot
    ========================================
EOF
}

# Check for Rust toolchain
if command -v cargo >/dev/null 2>&1; then
    print_banner
    echo "    [SKYNET] Rust toolchain detected."
    echo "    [SKYNET] Building neural net processor..."
    echo ""

    # Build release binary if not already present
    if [ ! -f "target/release/termirator" ]; then
        cargo build --release
    fi

    echo "    [SKYNET] Launching on port ${PORT}..."
    echo "    [SKYNET] Access: http://localhost:${PORT}"
    echo ""
    exec ./target/release/termirator
else
    cat <<'EOF'
    [ERROR] Rust toolchain not found.

    Install Rust:
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

    Then re-run this script.

    Fallback options:
        Node:   cd backends/node && npm install && npm start

EOF
    exit 1
fi
