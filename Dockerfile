# 1. Angular-App bauen
FROM node:20 AS build
WORKDIR /app

# Build Argument für Backend URL
#ARG BACKEND_URL=https://aikitabewebapi-114119385008.europe-west1.run.app

# Dependencies installieren
COPY package*.json ./
RUN npm install

# Source-Code kopieren und Build ausführen
COPY . .
RUN npx ng build --configuration production

# 2. Nginx als Webserver
FROM nginx:alpine

# Angular Build in Nginx-Ordner kopieren
COPY --from=build /app/dist/aikita-app-v4/browser /usr/share/nginx/html

# Nginx Config überschreiben
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script zum Ersetzen der Umgebungsvariable zur Laufzeit
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Umgebungsvariable für Runtime
ENV BACKEND_URL=${BACKEND_URL}

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]