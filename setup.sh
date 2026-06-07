#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════╗
# ║         PixelPal — One-Click Setup (Mac/Linux)       ║
# ╚══════════════════════════════════════════════════════╝
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${CYAN}▶${NC} $1"; }
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }
banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ██████╗ ██╗██╗  ██╗███████╗██╗     ██████╗  █████╗ ██╗"
  echo "  ██╔══██╗██║╚██╗██╔╝██╔════╝██║     ██╔══██╗██╔══██╗██║"
  echo "  ██████╔╝██║ ╚███╔╝ █████╗  ██║     ██████╔╝███████║██║"
  echo "  ██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║     ██╔═══╝ ██╔══██║██║"
  echo "  ██║     ██║██╔╝ ██╗███████╗███████╗██║     ██║  ██║███████╗"
  echo "  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝"
  echo -e "${NC}"
  echo -e "  ${BOLD}Your cute pixel-art desktop companion 🐾${NC}"
  echo ""
}

banner

# ── 1. Check Node ─────────────────────────────────────────────────────────────
log "Checking Node.js..."
if ! command -v node &>/dev/null; then
  warn "Node.js not found. Attempting to install via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
fi

NODE_VER=$(node -e "process.exit(parseInt(process.version.slice(1)) < 18 ? 1 : 0)" 2>/dev/null && echo ok || echo old)
if [ "$NODE_VER" = "old" ]; then
  err "Node.js 18+ required. Current: $(node --version). Please upgrade: https://nodejs.org"
fi
ok "Node.js $(node --version)"

# ── 2. Install dependencies ───────────────────────────────────────────────────
log "Installing dependencies (this downloads Electron ~100MB, please wait)..."
npm install --prefer-offline 2>&1 | grep -E "^(added|warn|error|npm error)" || true
ok "Dependencies installed"

# ── 3. Build ──────────────────────────────────────────────────────────────────
log "Building renderer (Vite)..."
npm run build:renderer 2>&1 | grep -E "(built in|error|✓)" || true
ok "Renderer built"

log "Compiling main process (TypeScript)..."
npm run build:main 2>&1 | grep -v "^$" || true
ok "Main process compiled"

# ── 4. Launch ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║   ✅  Setup complete! Launching...   ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}Your pet will appear on your desktop.${NC}"
echo -e "  ${CYAN}Right-click the pet to open Settings.${NC}"
echo -e "  ${CYAN}Check the system tray to control PixelPal.${NC}"
echo ""

npx electron .
