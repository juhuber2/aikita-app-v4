# AI Beobachtungs-Endpoint Konfiguration

## 📍 Aktueller Endpoint

Die Beobachtung wird aktuell an folgenden Endpoint gesendet:

```
https://aikitabewebapi-114119385008.europe-west1.run.app/api/AiResultDatas/infer
```

## 🔄 Verfügbare Endpoints

### 1. `/api/AiResultDatas/infer` (Aktuell aktiv)
- **Verwendung:** Echte KI-Inferenz
- **Beschreibung:** Sendet die Beobachtung an das AI Model
- **Voraussetzung:** AI Model muss verfügbar und konfiguriert sein

### 2. `/api/AiResultDatas/infer/mock` (Alternative)
- **Verwendung:** Mock-Daten ohne AI
- **Beschreibung:** Gibt vordefinierte Testdaten zurück
- **Vorteil:** Funktioniert ohne AI Model, zum Testen der Frontend-Logik

## 🔧 Endpoint ändern

### Methode 1: Direkt im Code (master.ts)

Öffne: `src/app/services/master.ts`

```typescript
addObservation(observationData: ObservationModel): Observable<ObservationModel> {
  // Option 1: Echtes AI Model
  const endpoint = `${this.baseUrl}/AiResultDatas/infer`;
  
  // Option 2: Mock-Daten (zum Testen)
  // const endpoint = `${this.baseUrl}/AiResultDatas/infer/mock`;
  
  console.log('🤖 Sende Beobachtung an:', endpoint);
  console.log('📤 Payload:', observationData);
  return this.http.post<ObservationModel>(endpoint, observationData);
}
```

**Zum Umschalten:**
1. Kommentiere die aktuelle Zeile aus
2. Entkommentiere die gewünschte Alternative
3. Speichere die Datei

### Methode 2: Über Environment (Empfohlen für Production)

In `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://aikitabewebapi-114119385008.europe-west1.run.app',
  useAiMock: false  // true = Mock, false = Echtes AI
};
```

Dann in `master.ts`:

```typescript
addObservation(observationData: ObservationModel): Observable<ObservationModel> {
  const endpoint = environment.useAiMock 
    ? `${this.baseUrl}/AiResultDatas/infer/mock`
    : `${this.baseUrl}/AiResultDatas/infer`;
  
  console.log('🤖 Sende Beobachtung an:', endpoint);
  return this.http.post<ObservationModel>(endpoint, observationData);
}
```

## 🐛 Debugging

### Console-Logs prüfen

Wenn du "Antwort erstellen" klickst, siehst du in der Browser-Console:

1. **Master Service:**
   ```
   🤖 Sende Beobachtung an: https://aikitabewebapi-114119385008.europe-west1.run.app/api/AiResultDatas/infer
   📤 Payload: { id: 1, age: 5, observation: "..." }
   ```

2. **Bei Erfolg:**
   ```
   ✅ Antwort vom Server: { resultId: ..., preview: {...}, ... }
   ```

3. **Bei Fehler:**
   ```
   ❌ Fehler bei Beobachtung: { status: 500, message: "..." }
   ```

### Häufige Fehler

| Status | Bedeutung | Lösung |
|--------|-----------|--------|
| 0 | Keine Verbindung | Backend läuft nicht oder CORS-Problem |
| 401 | Nicht autorisiert | Zuerst einloggen (Token fehlt) |
| 404 | Nicht gefunden | Falscher Endpoint - `/AiResultDatas/infer/mock` probieren |
| 500 | Server-Fehler | AI Model nicht verfügbar oder Backend-Fehler |

## 📊 Request-Format (AKTUALISIERT!)

**Payload an Backend:**
```json
{
  "id": 1,
  "age": 4,
  "observation": "Er hilft oft beim Aufräumen, ohne dass man ihn erinnert."
}
```

**Wichtig:** Das Feld heißt jetzt `id` (nicht mehr `childID`)!

## 📨 Expected Response-Format

**Von `/api/AiResultDatas/infer`:**
```json
{
  "resultId": 123,
  "resultToken": "abc-xyz-789",
  "expiresAt": "2025-10-24T00:00:00Z",
  "preview": {
    "area": "Kognitive Entwicklung",
    "subarea": "Kreativität",
    "subsection": "Künstlerischer Ausdruck",
    "goal": "Förderung der Kreativität",
    "activity": "Malen und Zeichnen",
    "confidence": 0.95
  }
}
```

## 🧪 Testen

### 1. Mit echtem AI Model (`/AiResultDatas/infer`)
```bash
# Stelle sicher, dass:
1. Backend läuft
2. AI Model ist verfügbar
3. Du eingeloggt bist
```

### 2. Mit Mock-Daten (`/AiResultDatas/infer/mock`)
```bash
# Ändere Endpoint zu /AiResultDatas/infer/mock
# Kein AI Model benötigt
# Schnelle Antwort für Frontend-Tests
```

## 🔑 Authentifizierung

Der Token wird automatisch hinzugefügt durch `token-interceptor.ts`:
```typescript
Authorization: Bearer {token_from_sessionStorage}
```

**Wichtig:** Zuerst über Login-Seite einloggen!

## 📝 Nächste Schritte

1. ✅ Prüfe Browser-Console nach dem Klick auf "Antwort erstellen"
2. ✅ Schaue dir den Status-Code an
3. ✅ Bei 404: Probiere `/AiResultDatas/infer/mock`
4. ✅ Bei 500: Prüfe Backend-Logs
5. ✅ Bei 401: Neu einloggen

## 🔄 Änderungshistorie

**23.10.2025:**
- ✅ Endpoint geändert: `/api/ai/infer` → `/api/AiResultDatas/infer`
- ✅ Request-Format geändert: `childID` → `id`
