#!/bin/sh

# Ersetze __BACKEND_URL__ in den JavaScript-Dateien durch die echte BACKEND_URL
echo "Replacing BACKEND_URL with: $BACKEND_URL"

# Finde alle JavaScript-Dateien und ersetze den Platzhalter
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" {} \;

# Starte nginx
exec "$@"