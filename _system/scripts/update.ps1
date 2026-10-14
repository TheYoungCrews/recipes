# Windows: pull the latest recipes and rebuild site\index.html (run from Task Scheduler).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
git pull --ff-only -q
python _system\scripts\build.py
