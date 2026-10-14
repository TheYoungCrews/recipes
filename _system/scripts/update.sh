#!/usr/bin/env bash
# Pull the latest recipes and rebuild site/index.html (run on a schedule on the home laptop).
set -euo pipefail
cd "$(dirname "$0")/../.."
git pull --ff-only -q
python3 _system/scripts/build.py
