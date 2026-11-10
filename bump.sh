#!/bin/sh
# Version an allen Stellen erhöhen: ./bump.sh 255 11.11.
set -e
N="$1"; D="$2"
[ -n "$N" ] && [ -n "$D" ] || { echo "Aufruf: ./bump.sh NNN TT.MM."; exit 1; }
sed -i -E "s/cashflow-v[0-9]+/cashflow-v$N/; s/\\?v=[0-9]+/?v=$N/g" sw.js
sed -i -E "s/\\?v=[0-9]+/?v=$N/g" index.html
sed -i -E "s/APP_VER='[0-9]+ \\([^)]*\\)'/APP_VER='$N ($D)'/" js/*.js
for f in js/*.js; do node --check "$f"; done
grep -o "cashflow-v[0-9]*" sw.js | head -1; grep -o "APP_VER='[^']*'" js/*.js
