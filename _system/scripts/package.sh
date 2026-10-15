#!/usr/bin/env bash
# Build the site and copy it to a friendly filename for AirDrop / iCloud Drive.
# Usage: _system/scripts/package.sh [dest_dir]   (default: ../share next to the repo)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="${1:-$ROOT/../share}"
python3 "$ROOT/_system/scripts/build.py"
mkdir -p "$DEST"
cp "$ROOT/site/index.html" "$DEST/Recipes.html"
# Dish photos sit next to the page (Recipes.html loads them from ./photos/)
mkdir -p "$DEST/photos" && cp -R "$ROOT/site/photos/." "$DEST/photos/"
echo "packaged $DEST/Recipes.html ($(date '+%Y-%m-%d %H:%M'))"
