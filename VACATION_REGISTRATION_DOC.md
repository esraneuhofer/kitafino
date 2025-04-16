# Dokumentation: Urlaubseintragung für Eltern

## Navigation

Um zur Urlaubseintragung zu gelangen, nutzen Sie die Seitennavigation:
1.  Klicken Sie auf "Einstellungen".
2.  Wählen Sie den Menüpunkt "Urlaub / Abwesenheit".

---

Dieses Dokument beschreibt den Prozess, wie Eltern Urlaubszeiten für ihre Kinder über die Anwendung eintragen können. Der Prozess umfasst die Eingabe, Validierung, Prüfung auf Konflikte mit bestehenden Bestellungen und die Speicherung der Urlaubsdaten.

## 1. Übersicht

Die Funktionalität wird durch die `VacationParentComponent` bereitgestellt. Eltern können ein Startdatum und optional ein Enddatum für einen Urlaubszeitraum eingeben. Diese Daten werden validiert und auf Konflikte mit zukünftigen Essensbestellungen geprüft, bevor sie gespeichert werden. Bestehende Urlaubseinträge werden in einer Tabelle angezeigt und können gelöscht werden.

Eingetragene Urlaubstage werden im System ähnlich wie Schließzeiten der Einrichtung und gesetzliche Feiertage behandelt:

-   **Bei der manuellen Bestellung:** Tage, die innerhalb eines eingetragenen Urlaubszeitraums liegen, werden im Bestellkalender ausgegraut und deaktiviert. Eine manuelle Essensbestellung ist für diese Tage nicht möglich.
-   **Bei Dauerbestellungen:** Eingetragene Urlaubstage werden bei der Verarbeitung von Dauerbestellungen berücksichtigt.
-   **Ausführung von Dauerbestellungen:** Wenn eine Dauerbestellung für einen Zeitraum ausgeführt wird (z.B. wöchentlich nach Ablauf der Bestellfrist) und dieser Zeitraum sich mit eingetragenen Urlaubstagen überschneidet, wird für die betreffenden Urlaubstage **keine** Bestellung generiert.
-   **Benachrichtigung:** Der Elternteil erhält in diesem Fall (wenn eine Dauerbestellung aufgrund von Urlaubstagen nicht für alle Tage ausgeführt wird) eine Benachrichtigung per E-Mail.

## 2. Urlaub eintragen (UI - `vacation-parent.component.html`)

-   **Formular:** Ein Formular (`#vacationForm`) ermöglicht die Eingabe von Urlaubsdaten.
-   **Startdatum:** Ein Datumsfeld (`<input type=\"date\" name=\"start-date\">`) für das Startdatum des Urlaubs. Dieses Feld ist **erforderlich**. Es ist an die Variable `startDate` im Component gebunden (`[(ngModel)]=\"startDate\"`).
-   **Enddatum:** Ein optionales Datumsfeld (`<input type=\"date\" name=\"end-date\">`) für das Enddatum des Urlaubs. Es ist an die Variable `endDate` im Component gebunden (`[(ngModel)]=\"endDate\"`). Wenn kein Enddatum angegeben wird, gilt der Urlaub nur für den Tag des Startdatums.
-   **Speichern-Button:** Ein Button (`<app-button>`) löst bei Klick die `addVacation()` Methode im Component aus, aber nur, wenn das Formular gültig ist (`vacationForm.form.valid`). Der Text des Buttons ist internationalisiert (z.B. \"Urlaub eintragen\").
-   **Validierungsanzeige:** Ungültige Eingaben (z.B. fehlendes Startdatum nach dem Absendeversuch) werden visuell hervorgehoben (`ngClass=\"{'invalid-input': ...}\"`) und eine Fehlermeldung (\"Bitte geben Sie ein Startdatum ein\") wird angezeigt.

## 3. Validierung (`addVacation()` in `vacation-parent.component.ts`)

Bevor ein Urlaub gespeichert wird, durchläuft er mehrere Validierungsschritte in der `addVacation()` Methode:

1.  **Startdatum vorhanden:** Prüfung, ob `startDate` ausgefüllt ist (wird bereits durch `required` im HTML sichergestellt).
2.  **Startdatum in der Zukunft:** Das `startDate` muss mindestens der morgige Tag sein. Liegt es in der Vergangenheit oder ist es der heutige Tag, wird eine Fehlermeldung angezeigt (\"Das Startdatum des Urlaub4s muss in der Zukunft liegen.\").
3.  **Enddatum in der Zukunft (optional):** Wenn ein `endDate` angegeben ist, muss dieses ebenfalls mindestens der morgige Tag sein. Andernfalls wird eine Fehlermeldung angezeigt (\"Das Enddatum des Urlaubs muss in der Zukunft liegen.\").
4.  **Startdatum vor Enddatum (optional):** Wenn ein `endDate` angegeben ist, muss das `startDate` vor oder am selben Tag wie das `endDate` liegen. Andernfalls wird eine Fehlermeldung angezeigt (\"Das Startdatum des Urlaubs muss vor dem Enddatum liegen.\").

Fehlermeldungen werden dem Benutzer über den `ToastrService` angezeigt und sind internationalisiert (`this.translate.instant(...)`).

## 4. Prüfung auf Bestellkonflikte (`checkForOrderConflicts()` in `vacation-parent.component.ts`)

-   Nach erfolgreicher Datumsvalidierung wird geprüft, ob im geplanten Urlaubszeitraum bereits Essensbestellungen existieren.
-   Dazu werden im `ngOnInit` zukünftige Bestellungen über den `OrderService` geladen (`loadFutureOrders()`).
-   Die Methode `checkForOrderConflicts(startDate, endDate)` vergleicht die Daten der zukünftigen Bestellungen (`futureOrders`) mit dem eingegebenen Urlaubszeitraum (`startDate` bis `endDate`).
-   Wenn eine oder mehrere Bestellungen im Urlaubszeitraum gefunden werden, wird der Speichervorgang abgebrochen und eine Fehlermeldung angezeigt (\"Es gibt bereits Bestellungen für den angegebenen Zeitraum. Bitte stornieren Sie diese Bestellungen, bevor Sie den Urlaub eintragen.\").

## 5. Speicherung (`addVacation()` in `vacation-parent.component.ts`)

-   Wenn alle Validierungen und die Konfliktprüfung erfolgreich sind, wird der `VacationService` aufgerufen.
-   Die Methode `vacationService.addVacation(startDate, endDate)` wird mit den validierten Daten aufgerufen, um den Urlaub im Backend zu speichern. `endDate` wird als `null` übergeben, wenn es nicht ausgefüllt wurde.
-   Während der Anfrage wird `submittingRequest` auf `true` gesetzt (z.B. um den Button zu deaktivieren).
-   **Erfolg:**
    -   Der neu erstellte Urlaub wird vom Service zurückgegeben.
    -   Er wird zur lokalen Liste `vacations` hinzugefügt (`unshift`), sodass er sofort in der Tabelle erscheint.
    -   Eine Erfolgsmeldung wird angezeigt (\"Urlaub erfolgreich eingetragen\").
    -   Die Formularfelder (`startDate`, `endDate`) und der Validierungsstatus werden zurückgesetzt.
-   **Fehler:**
    -   Eine Fehlermeldung wird angezeigt (\"Fehler beim Eintragen des Urlaubs. Bitte versuchen Sie es später erneut.\").
    -   Der Fehler wird in der Konsole protokolliert.
-   `submittingRequest` wird in jedem Fall (Erfolg oder Fehler) wieder auf `false` gesetzt (`finalize`).

*(Anmerkung: Die genaue Implementierung des `VacationService` und des Backends (`vacation.controller.js`) ist nicht bekannt, aber es wird erwartet, dass der Service eine HTTP-Anfrage an das Backend sendet, um die Daten zu speichern.)*

## 6. Anzeige bestehender Urlaube (`vacation-parent.component.html`)

-   Beim Initialisieren der Komponente (`ngOnInit` -> `initializeData` -> `loadVacations`) werden alle bestehenden Urlaube des Benutzers über `vacationService.getAllVacations()` geladen und in der `vacations` Array gespeichert.
-   Eine Tabelle zeigt die geladenen Urlaube an (`*ngFor=\"let vacation of vacations\"`).
-   Angezeigt werden das Startdatum (`vacation.vacation.vacationStart`) und das Enddatum (`vacation.vacation.vacationEnd`), formatiert als `dd.MM.yy`. Wenn kein Enddatum vorhanden ist, wird ' - ' angezeigt.
-   Die Tabelle ist paginiert (`<ngb-pagination>`), falls viele Einträge vorhanden sind.
-   Wenn keine Urlaube eingetragen sind, wird eine entsprechende Meldung angezeigt (\"Es wurden keine Einträge gefunden\").

## 7. Urlaub löschen (`deleteVacation()` in `vacation-parent.component.ts`)

-   Jeder Urlaubseintrag in der Tabelle hat einen Löschen-Button (`<app-button>`), der die `deleteVacation(vacation)` Methode mit dem entsprechenden Urlaubsobjekt aufruft.
-   Die Methode ruft `vacationService.deleteVacation(vacation._id)` auf, um den Urlaub im Backend zu löschen.
-   Während der Anfrage wird `submittingRequest` auf `true` gesetzt.
-   **Erfolg:**
    -   Die Urlaubsliste wird neu vom Server geladen (`vacationService.getAllVacations()`), um die lokale Liste `vacations` zu aktualisieren.
    -   Eine Erfolgsmeldung wird angezeigt (\"Urlaub erfolgreich gelöscht\").
-   **Fehler:**
    -   Eine Fehlermeldung wird angezeigt (`ERROR_VACATION_DELETE_FAILED`).
    -   Der Fehler wird in der Konsole protokolliert.
-   `submittingRequest` wird in jedem Fall wieder auf `false` gesetzt (`finalize`).

## 8. Abhängigkeiten

-   **Angular Core/Common/Forms:** Für die Component-Struktur, Direktiven (`*ngIf`, `*ngFor`), Formularbehandlung (`NgForm`, `ngModel`).
-   **RxJS:** Für die Handhabung asynchroner Operationen (`firstValueFrom`, `pipe`, `finalize`).
-   **`VacationService`:** Service zur Kommunikation mit dem Backend für Urlaubsdaten (Hinzufügen, Abrufen, Löschen). *(Implementierung nicht bekannt)*
-   **`OrderService`:** Service zum Abrufen von Bestelldaten für die Konfliktprüfung.
-   **`@ngx-translate/core`:** Für die Internationalisierung von Texten (Labels, Buttons, Meldungen). Benötigt eine Konfiguration und Sprachdateien (z.B. `de.json`).
-   **`ngx-toastr`:** Für die Anzeige von Benachrichtigungen (Erfolg/Fehler).
-   **`@ng-bootstrap/ng-bootstrap`:** Für UI-Komponenten wie die Paginierung (`NgbPagination`).
-   **Custom Components:** `<app-button>`, `<app-loading-page>`.
