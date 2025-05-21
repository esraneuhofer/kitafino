# Cateringexpert App Account Deletion Documentation

## Inhaltsverzeichnis
1. [Benutzerhandbuch](#benutzerhandbuch)
2. [Technische Implementierung](#technische-implementierung)
3. [Systemanforderungen](#systemanforderungen)
4. [Prozessablauf](#prozessablauf)
5. [Betroffene Models](#betroffene-models)
6. [API-Endpunkte](#api-endpunkte)
7. [Häufige Probleme & Fehlerbehebung](#häufige-probleme--fehlerbehebung)

## Benutzerhandbuch

### So schließen Sie Ihr Konto

#### Mobile App
1. Melden Sie sich in der Cateringexpert-App an
2. Öffnen Sie das Seitennavigationsmenü
3. Tippen Sie auf "Einstellungen"
4. Tippen Sie auf "Account löschen"
5. Folgen Sie dem Bestätigungsprozess auf dem Bildschirm

#### Admin-Portal
1. Melden Sie sich im Admin-Portal an
2. Gehen Sie in der Seitennavigation auf "Eltern"
3. Wählen Sie den gewünschten Elternteil aus der Liste aus
4. In der Detailansicht des Elternteils wechseln Sie zum Tab "Account löschen"
5. Bestätigen Sie den Löschvorgang durch Klicken auf "Absenden"

*Hinweis: Der technische Ablauf der Kontolöschung ist im Admin-Portal identisch mit dem in der App. Es werden die gleichen Überprüfungen durchgeführt und die gleichen Datenänderungen vorgenommen.*

#### Webseite
*Hinweis: Webseiten-Schritte werden separat dokumentiert*

### Voraussetzungen für die Kontoschließung

Bevor Sie Ihr Konto schließen können, müssen folgende Bedingungen erfüllt sein:
1. Ihr Kontostand muss null (0 €) betragen
2. Sie dürfen keine zukünftigen Bestellungen für Ihre Kinder platziert haben

Wenn eine dieser Bedingungen nicht erfüllt ist, erhalten Sie eine Fehlermeldung mit Anweisungen, was vor dem Fortfahren behoben werden muss.

## Technische Implementierung

### Prozessablauf

Wenn ein Konto geschlossen wird, erfolgen folgende Aktionen gleichzeitig:

1. **Für Eltern-Tenant (Tenantparent-Modell)**
   - Das Feld `accountDeactivated` wird auf `true` gesetzt
   - Das Feld `dateAccountDeactivated` wird auf das aktuelle Datum/Uhrzeit gesetzt

2. **Für alle Kinder/Schüler (StudentNew-Modell)**
   - Das Feld `isActive` für alle mit dem Benutzer verbundenen Kinder wird auf `false` gesetzt
   - Das Feld `dateAccountDeactivated` für jedes Kind wird auf das aktuelle Datum/Uhrzeit gesetzt

3. **Für Benutzerkonto (Schooluser-Modell)**
   - Benutzername wird durch Anhängen des Suffix "_deactivated" geändert
   - E-Mail wird durch Anhängen des Suffix "_deactivated" geändert
   - Passwort wird auf einen zufällig generierten Wert zurückgesetzt
   - Existierender Token wird ungültig gemacht

4. **Für Kontostand (AccountSchema-Modell)**
   - Das Feld `accountDeactivated` wird auf `true` gesetzt
   - Das Feld `dateAccountDeactivated` wird auf das aktuelle Datum/Uhrzeit gesetzt

5. **Für Dauerbestellungen (PermanentOrderStudent-Modell)**
   - Alle Dauerbestellungen für sämtliche Kinder des Benutzers werden aus der Datenbank gelöscht
   - Dies betrifft alle Einträge im PermanentOrderStudent-Modell, die mit der userId des Benutzers verknüpft sind

## Systemanforderungen

Vor der Einleitung der Kontolöschung überprüft das System:
1. Kontostand ist null (currentBalance === 0)
2. Keine zukünftigen Bestellungen existieren für registrierte Kinder

## Prozessablauf

1. **Verifizierungsphase**
   - System überprüft den Kontostand
   - System überprüft auf zukünftige Bestellungen
   - Bei Nichterfüllung einer Bedingung wird eine entsprechende Fehlermeldung angezeigt

2. **Bestätigungsphase**
   - Benutzer erhält einen Bestätigungsdialog
   - Benutzer muss die Kontolöschungsabsicht ausdrücklich bestätigen

3. **Ausführungsphase**
   - Alle relevanten Models werden in einer einzigen Transaktion aktualisiert
   - Bei Fehlschlag eines Teils wird der gesamte Prozess zurückgesetzt
   - Benutzer wird ausgeloggt und zur Login-Seite weitergeleitet

4. **Nach der Löschung**
   - Daten bleiben für Prüfzwecke erhalten, werden aber deaktiviert
   - Historische Bestellungen und Transaktionen verbleiben in der Datenbank
   - Benutzer kann sich nicht mehr mit den vorherigen Anmeldedaten anmelden

## Betroffene Models

### TenantParent Model
```javascript
// Änderungen am TenantParent-Modell
{
  accountDeactivated: true,
  dateAccountDeactivated: new Date()
}
```

### Student Model
Für jeden Schüler, der mit dem Benutzer verknüpft ist:
```javascript
// Änderungen an jedem Student-Modell
{
  isActive: false,
  dateAccountDeactivated: new Date()
}
```

### SchoolUser Model
```javascript
// Änderungen am SchoolUser-Modell
{
  username: originalUsername + "_deactivated",
  email: originalEmail + "_deactivated",
  password: [zufällig generiertes neues Passwort],
  saltSecret: [neues Salt]
}
```

### AccountSchema Model
Der Kontodatensatz wird vollständig aus der Datenbank gelöscht.

### PermanentOrderStudent Model
```javascript
// Löschung aller Dauerbestellungen des Users
PermanentOrderStudent.deleteMany({ 'userId': userId });
```

## API-Endpunkte

### Edit Account Endpunkt
```
POST /editAccountTenant
```
**Autorisierung**: Erfordert JWT-Token
**Controller**: account.controller.js
**Funktion**: editAccountTenant

### Deaktivierung des Benutzer-Endpunkts
```
POST /deactivateAccount
```
**Autorisierung**: Erfordert JWT-Token
**Controller**: user.controller.js
**Funktion**: deactivateAccount

## Häufige Probleme & Fehlerbehebung

### 1. Kontolöschung schlägt aufgrund eines positiven Kontostands fehl
**Lösung**: Heben Sie alle Gelder vom Konto ab, bevor Sie versuchen, es zu schließen.

### 2. Kontolöschung schlägt aufgrund zukünftiger Bestellungen fehl
**Lösung**: Stornieren Sie alle zukünftigen Bestellungen für alle Kinder, bevor Sie versuchen, das Konto zu schließen.

### 3. Datenwiederherstellung nach Kontoschließung
**Hinweis für den Kundensupport**: Kontodaten werden in einem deaktivierten Zustand aufbewahrt. Wenn ein Kunde sein Konto innerhalb eines angemessenen Zeitraums reaktivieren möchte, kann ein manueller Prozess durch das Support-Personal eingeleitet werden.

---

## Für Entwickler und Support-Mitarbeiter

Der Kontoschließungsprozess ist so konzipiert, dass die Datenintegrität gewahrt bleibt und gleichzeitig die DSGVO-Konformität sichergestellt ist. Der Deaktivierungsansatz anstelle einer vollständigen Löschung ermöglicht:

1. Historische Verfolgung vergangener Bestellungen und Transaktionen
2. Potenzielle Kontowiederherstellung bei Bedarf
3. Aufrechterhaltung der referentiellen Integrität in der Datenbank

Daten werden nur physisch aus dem `AccountSchema`-Modell entfernt, während andere Modelle Daten in einem deaktivierten Zustand behalten.

### Zukünftige Überlegungen

1. Implementierung einer geplanten Aufgabe zur Verschiebung deaktivierter Konten in eine Archiv-Datenbank nach einem definierten Zeitraum (z.B. 36 Monate)
2. Entwicklung eines formellen Kontoreaktivierungsprozesses, falls von geschäftlichen Anforderungen benötigt
3. Erwägung der Implementierung einer "Soft-Delete"-Funktion für das AccountSchema-Modell anstelle einer physischen Löschung
