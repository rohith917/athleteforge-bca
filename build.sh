#!/usr/bin/env bash
# Render build — runs from repo ROOT (Root Directory = blank)
set -o errexit
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT/backend"
bash build.sh