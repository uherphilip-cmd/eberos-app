# Eberos v1.7.11 als App installieren

## Windows - lokale Installation

1. Das ZIP vollständig entpacken.
2. `Eberos-App-starten.cmd` doppelt anklicken.
3. Die App öffnet sich unter `http://localhost:8787` im Standardbrowser.
4. In Edge oder Chrome auf „App installieren“ klicken. Je nach Browser befindet sich die Funktion rechts in der Adresszeile oder im Browsermenü.
5. Danach lässt sich Eberos wie eine normale App über das Startmenü öffnen.

Der kleine lokale Server muss erreichbar sein, damit die installierte App gestartet werden kann. Falls er beendet wurde, einfach erneut `Eberos-App-starten.cmd` ausführen.

Mit `Eberos-App-beenden.cmd` kann der lokale Server beendet werden.

## Installation über eine Website

Den gesamten Ordner unverändert auf einem HTTPS-Webserver veröffentlichen. Anschließend `index.html` aufrufen und im Browser „App installieren“ wählen.

## Warum die direkte HTML-Datei nicht genügt

Eine Adresse, die mit `file:///` beginnt, darf aus Sicherheitsgründen keinen Service Worker registrieren. Offline-Cache und PWA-Installation funktionieren deshalb nur über HTTPS oder `localhost`.
