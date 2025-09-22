# 1. Angular-App bauen
FROM node:20 AS build
WORKDIR /app

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