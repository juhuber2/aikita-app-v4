# Backend URL Konfiguration

## Übersicht

Die Backend-URL ist jetzt zentral konfiguriert und kann an einer Stelle geändert werden.

## Konfigurationsmöglichkeiten

### 1. Docker Compose (Empfohlen für Production)

Die Backend-URL wird in der `docker-compose.yml` gesetzt:

```yaml
services:
  aikita-frontend:
    build:
      args:
        - BACKEND_URL=https://aikitabewebapi-114119385008.europe-west1.run.app
    environment:
      - BACKEND_URL=https://aikitabewebapi-114119385008.europe-west1.run.app
```

**Um die URL zu ändern:** Bearbeite die `BACKEND_URL` in der `docker-compose.yml` Datei.

### 2. Development (Lokale Entwicklung)

Für lokale Entwicklung wird die URL in `src/environments/environment.ts` gesetzt:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://aikitabewebapi-114119385008.europe-west1.run.app'
};
```

## Verwendung

### Docker Compose starten:

```bash
docker-compose up --build
```

Die App läuft dann auf: http://localhost

### Lokale Entwicklung:

```bash
npm install
npm start
```

Die App läuft dann auf: http://localhost:4200

## Wo wird die URL verwendet?

Die Backend-URL wird in folgenden Komponenten verwendet:

1. **Login Component** (`src/app/login/login-main/login-main.ts`)
   - Login-Endpoint: `${environment.apiUrl}/api/accounts/login`

2. **Master Service** (`src/app/services/master.ts`)
   - Alle API-Endpoints nutzen: `${environment.apiUrl}/api/...`
   - Areas, Subareas, Subsections, Goals, Activities
   - AI Inference und Save
   - Groups API

## Backend URL ändern

### Methode 1: Docker Compose bearbeiten

1. Öffne `docker-compose.yml`
2. Ändere beide `BACKEND_URL` Einträge (unter `args` und `environment`)
3. Rebuild und starte den Container:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Methode 2: Umgebungsvariable beim Start setzen

```bash
BACKEND_URL=https://deine-neue-url.com docker-compose up --build
```

### Methode 3: .env Datei erstellen

1. Erstelle eine `.env` Datei im Root-Verzeichnis
2. Füge hinzu:
   ```
   BACKEND_URL=https://deine-neue-url.com
   ```
3. Docker Compose liest diese Datei automatisch

## Wichtige Dateien

- `docker-compose.yml` - Zentrale Konfiguration für Docker
- `src/environments/environment.ts` - Development Konfiguration
- `src/environments/environment.prod.ts` - Production Konfiguration (mit Platzhalter)
- `Dockerfile` - Build-Konfiguration mit Runtime-Replacement
- `docker-entrypoint.sh` - Script zum Ersetzen der URL zur Laufzeit
