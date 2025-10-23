# CORS & Authentifizierungs-Problem Debugging

## ✅ Problem behoben!

### 🔧 Was wurde geändert:

**Token-Interceptor** (`src/app/login/interceptor/token-interceptor.ts`):

**VORHER (Falsch):**
```typescript
setHeaders: { Authorization: `Bearer ${token}` }
```

**NACHHER (Korrekt):**
```typescript
setHeaders: { 'X-Session-Token': token }
```

### 🎯 Warum der Fehler aufgetreten ist:

**HTTP Status 0 "Unknown Error"** = CORS-Problem oder Netzwerkfehler

**Ursachen:**
1. ❌ **Falscher Header:** Backend erwartet `X-Session-Token`, aber wir haben `Authorization: Bearer` gesendet
2. ⚠️ **CORS-Preflight:** Browser blockiert Request wegen unbekanntem Header
3. 🔒 **Backend lehnt ab:** Ohne korrekten Header wird Request abgelehnt

### 📋 Was das Backend erwartet:

**Header:**
```
X-Session-Token: {sessionToken}
```

**NICHT:**
```
Authorization: Bearer {sessionToken}
```

### 🧪 So testest du es:

#### 1. **Stelle sicher, dass du eingeloggt bist:**

```typescript
// In Browser Console (F12):
sessionStorage.getItem('angularToken')
// Sollte einen Token zurückgeben, z.B.: "abc123xyz..."
```

#### 2. **Navigiere zur Planung2-Seite (Beobachtung)**

#### 3. **Öffne Browser DevTools (F12) → Console**

Du solltest sehen:
```
🔑 Token vorhanden: true
🔑 Token (erste 20 Zeichen): abc123xyz...
🔑 Token hinzugefügt: abc123xyz...
Loading children from URL: https://aikitabewebapi-114119385008.europe-west1.run.app/api/childs
✅ Server antwortet erfolgreich: [...]
📊 Anzahl der Kinder: 40
👶 Erstes Kind als Beispiel: {name: "Emma Müller", ...}
```

#### 4. **Öffne Network Tab (F12 → Network)**

Klicke auf den Request zu `/api/childs` und prüfe:

**Request Headers:**
```
X-Session-Token: {dein-token}
```

**Response:**
```json
[
  {
    "name": "Emma Müller",
    "birthdate": "2020-04-15T00:00:00",
    "gender": "Female",
    "groupId": 1,
    "id": 1
  },
  ...
]
```

### 🔍 Debugging-Checkliste:

| Schritt | Was prüfen | Erwartetes Ergebnis |
|---------|-----------|---------------------|
| 1. Login | SessionStorage hat Token | `sessionStorage.getItem('angularToken')` ≠ null |
| 2. Interceptor | Token wird hinzugefügt | Console: "🔑 Token hinzugefügt" |
| 3. Request Header | X-Session-Token vorhanden | Network Tab → Headers |
| 4. Response | Status 200, JSON mit Kindern | Console: "✅ Server antwortet" |

### ❌ Häufige Fehler:

#### **Status 0 - Unknown Error**
```
Ursache: CORS-Problem oder falscher Header
Lösung: ✅ Bereits behoben - X-Session-Token wird jetzt korrekt gesendet
```

#### **Status 401 - Unauthorized**
```
Ursache: Kein Token oder ungültiger Token
Lösung: 
1. Über Login-Seite einloggen
2. sessionStorage.getItem('angularToken') prüfen
3. Token könnte abgelaufen sein → neu einloggen
```

#### **Status 404 - Not Found**
```
Ursache: Endpoint existiert nicht
Lösung: URL prüfen - sollte sein:
https://aikitabewebapi-114119385008.europe-west1.run.app/api/childs
```

### 🛠️ Backend-Anforderungen (für Info):

Das Backend muss folgende CORS-Headers senden:

```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Headers: Content-Type, X-Session-Token
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### 📊 Erwartete Daten vom Backend:

**Endpoint:** `GET /api/childs`

**Header:**
```
X-Session-Token: {sessionToken}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Emma Müller",
    "birthdate": "2020-04-15T00:00:00",
    "gender": "Female",
    "groupId": 1
  }
]
```

### 🎉 Nach der Korrektur:

1. ✅ Token wird als `X-Session-Token` gesendet (nicht mehr `Authorization`)
2. ✅ CORS-Problem sollte behoben sein
3. ✅ Kinder werden korrekt geladen
4. ✅ Detaillierte Fehlerbehandlung mit hilfreichen Hinweisen

### 📝 Nächste Schritte:

1. **Neu laden:** Browser-Seite neu laden (Strg+F5)
2. **Login:** Falls noch nicht eingeloggt, zuerst einloggen
3. **Testen:** Zur Beobachtung-Seite navigieren
4. **Console prüfen:** Sollte jetzt erfolgreich laden

### 🔑 Session-Token Info:

- **Gespeichert in:** `sessionStorage.angularToken`
- **Gesendet als:** `X-Session-Token` Header
- **Bei jedem Request:** Automatisch durch Interceptor hinzugefügt
- **Gültigkeit:** Prüfe Backend-Dokumentation für Ablaufzeit
