# Eberos v1.8.12 – Builder-Fensteransicht für Wesen

- Bei Wesen kann zwischen Formularansicht und der echten NPC-Kartenansicht des Builders gewählt werden.
- Die Kartenansicht verwendet denselben Renderer und dieselben Karten wie ein NPC-Reiter.
- Die Vorschau ist schreibgeschützt; gespeichert wird weiterhin kontrolliert über das Wesenformular.
- Attribute, Counter, Fähigkeiten, Effekte, Geld sowie Standard- und Set-Items werden in ein NPC-kompatibles Datenmodell übertragen.
- Die gewählte Builder-Darstellung und das Kartenlayout werden bei ausdrücklichem Speichern im bestehenden stats-JSON mitgeführt.
- Freiwillig vom Spieler freigegebene NPC-Reiter behalten bei der Vorbereitung als Weltwesen ihr Kartenlayout und Profil.
- Ein versionierter Wesen-zu-NPC-Adapter steht für die spätere kontrollierte Migration ins Spielerblatt bereit.
- Keine Änderung an Datenbankschema 37 oder Regelstand 15.
