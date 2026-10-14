# Windows: pull the latest recipes and rebuild site\index.html (run from Task Scheduler).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
git pull --ff-only -q
python scripts\build.py
