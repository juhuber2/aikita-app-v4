# Child API Integration - Dokumentation

## ✅ Änderungen durchgeführt

Die Child-Ressource wurde vom Backend integriert.

### Backend-Endpoint
```
https://aikitabewebapi-114119385008.europe-west1.run.app/api/childs
```

### Datenformat (vom Backend)
```json
{
  "name": "Emma Müller",
  "birthdate": "2020-04-15T00:00:00",
  "gender": "Female",
  "groupId": 1,
  "id": 1
}
```

## 📝 Geänderte Dateien

### 1. `src/app/models/child.ts`
Das Child-Interface wurde aktualisiert:

```typescript
export interface Child {
  id: number;
  name: string;
  birthdate: string;
  gender: string;
  groupId: number;
}
```

### 2. `src/app/services/master.ts`
Die Child-CRUD-Methoden nutzen jetzt das Backend:

```typescript
// Alle Kinder abrufen
getAllChildrenMaster(): Observable<Child[]>

// Kind nach ID abrufen
getChildByIdMaster(id: number): Observable<Child>

// Neues Kind erstellen
addChildrenMaster(child: Child): Observable<Child>

// Kind aktualisieren
updateChildMaster(id: number, child: Child): Observable<Child>

// Kind löschen
deleteChildMaster(id: number): Observable<void>

// NEU: Kinder nach Gruppe filtern
getChildrenByGroupId(groupId: number): Observable<Child[]>
```

### 3. `src/app/pages/planung2/planung2.ts`
Das FormGroup wurde aktualisiert, um mit dem neuen Format zu arbeiten.

## 🚀 Verwendung in Komponenten

### Beispiel: Alle Kinder abrufen
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { Master } from '../../services/master';
import { Child } from '../../models/child';

export class MeineKomponente implements OnInit {
  childrenList: Child[] = [];
  masterService = inject(Master);

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.masterService.getAllChildrenMaster().subscribe({
      next: (children: Child[]) => {
        this.childrenList = children;
        console.log('Kinder geladen:', children);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kinder:', error);
      }
    });
  }
}
```

### Beispiel: Kinder nach Gruppe filtern
```typescript
loadChildrenByGroup(groupId: number): void {
  this.masterService.getChildrenByGroupId(groupId).subscribe({
    next: (children: Child[]) => {
      console.log(`Kinder in Gruppe ${groupId}:`, children);
    },
    error: (error) => {
      console.error('Fehler:', error);
    }
  });
}
```

### Beispiel: Neues Kind erstellen
```typescript
createChild(): void {
  const newChild: Child = {
    id: 0, // wird vom Backend generiert
    name: 'Max Mustermann',
    birthdate: '2021-01-15T00:00:00',
    gender: 'Male',
    groupId: 1
  };

  this.masterService.addChildrenMaster(newChild).subscribe({
    next: (created: Child) => {
      console.log('Kind erstellt:', created);
      this.loadChildren(); // Liste neu laden
    },
    error: (error) => {
      console.error('Fehler beim Erstellen:', error);
    }
  });
}
```

### Beispiel: Kind aktualisieren
```typescript
updateChild(child: Child): void {
  this.masterService.updateChildMaster(child.id, child).subscribe({
    next: (updated: Child) => {
      console.log('Kind aktualisiert:', updated);
    },
    error: (error) => {
      console.error('Fehler beim Aktualisieren:', error);
    }
  });
}
```

### Beispiel: Kind löschen
```typescript
deleteChild(id: number): void {
  if (confirm('Kind wirklich löschen?')) {
    this.masterService.deleteChildMaster(id).subscribe({
      next: () => {
        console.log('Kind gelöscht');
        this.loadChildren(); // Liste neu laden
      },
      error: (error) => {
        console.error('Fehler beim Löschen:', error);
      }
    });
  }
}
```

## 🔧 Backend-URL Konfiguration

Die URL ist zentral in `src/environments/environment.ts` konfiguriert:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://aikitabewebapi-114119385008.europe-west1.run.app'
};
```

Der Child-Endpoint wird automatisch zusammengebaut als: `${environment.apiUrl}/api/childs`

## 📊 Datenfelder

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | number | Eindeutige ID (vom Backend generiert) |
| `name` | string | Name des Kindes |
| `birthdate` | string | Geburtsdatum (ISO 8601 Format) |
| `gender` | string | Geschlecht ("Male", "Female", etc.) |
| `groupId` | number | ID der zugehörigen Gruppe |

## ⚠️ Wichtig

- Die ID ist jetzt `number` statt `string`
- Das Datumsformat ist ISO 8601: `"2020-04-15T00:00:00"`
- Das alte Child-Interface ist als `ChildLegacy` noch verfügbar (falls benötigt)
- Alle CRUD-Operationen benötigen Authentifizierung (Token-Interceptor)
