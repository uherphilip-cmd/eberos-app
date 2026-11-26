'use strict';
window.EBEROS_EFFECT_DB={
  "meta": {
    "appVersion": "1.7.7",
    "catalogVersion": "1.0.0",
    "source": "EFFEKTE-KATALOG_V1.7.7.md",
    "rows": 227,
    "generatedAt": "2026-08-23T18:23:41.386Z"
  },
  "definitions": [
    {
      "id": "effect-5-tot",
      "name": "Tot",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "L aktuell 0; Bewegung 0; Aktionen 0; Reaktionen 0; Regeneration 0; nur Wiederbelebung entfernt den Zustand",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "*",
          "operation": "set",
          "value": 0,
          "scope": "Regeneration 0"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        },
        {
          "id": "module-4",
          "type": "flag",
          "target": "action",
          "operation": "set",
          "value": 0,
          "scope": "Aktionen 0"
        }
      ],
      "sourceLine": 75,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-sterbend",
      "name": "Sterbend",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "L aktuell 0; Bewegung 0; Aktionen 0; Reaktionen 0; am Ende jeder Runde 1 Sterbemarke; bei 3 Marken Tot",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-2",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "action",
          "operation": "set",
          "value": 0,
          "scope": "Aktionen 0"
        }
      ],
      "sourceLine": 76,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-stabilisiert",
      "name": "Stabilisiert",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "L aktuell 0; keine weiteren Sterbemarken; Bewegung/Aktionen/Reaktionen 0; endet bei L mindestens 1",
      "modules": [
        {
          "id": "module-1",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        }
      ],
      "sourceLine": 77,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-bewusstlos",
      "name": "Bewusstlos",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "WN 0; Bewegung 0; Aktionen 0; Reaktionen 0; Treffer gegen das Ziel erhalten +2 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "set",
          "value": 0,
          "scope": "WN 0"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        },
        {
          "id": "module-4",
          "type": "flag",
          "target": "action",
          "operation": "set",
          "value": 0,
          "scope": "Aktionen 0"
        },
        {
          "id": "module-5",
          "type": "difficulty",
          "target": "Treffer gegen das Ziel erhalten",
          "operation": "bonus",
          "value": 2,
          "scope": "Treffer gegen das Ziel erhalten +2 Bonus"
        }
      ],
      "sourceLine": 78,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-schlafend",
      "name": "Schlafend",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "WN 0; Bewegung 0; Aktionen 0; Reaktionen 0; natürliche L-, A- und FO-Regeneration +1 pro vollständiger Rast",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "set",
          "value": 0,
          "scope": "WN 0"
        },
        {
          "id": "module-2",
          "type": "counter-regen",
          "target": "FO",
          "operation": "add",
          "value": 1,
          "scope": "FO-Regeneration +1"
        },
        {
          "id": "module-3",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-4",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        },
        {
          "id": "module-5",
          "type": "flag",
          "target": "action",
          "operation": "set",
          "value": 0,
          "scope": "Aktionen 0"
        }
      ],
      "sourceLine": 79,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-schlafwandelnd",
      "name": "Schlafwandelnd",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "alle verwendeten Grundwerte und Fähigkeiten halbiert, abgerundet; Reaktionen 0; nur einfache Handlungen",
      "modules": [
        {
          "id": "module-1",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        }
      ],
      "sourceLine": 80,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-koma",
      "name": "Koma",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "wie Bewusstlos; kein Erwachen durch gewöhnliches Wecken; natürliche A- und FO-Regeneration +1 pro Rast, L-Regeneration 0",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "FO",
          "operation": "add",
          "value": 1,
          "scope": "FO-Regeneration +1"
        },
        {
          "id": "module-2",
          "type": "counter-regen",
          "target": "L",
          "operation": "set",
          "value": 0,
          "scope": "L-Regeneration 0"
        }
      ],
      "sourceLine": 81,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-trance",
      "name": "Trance",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "Bewegung 0; Reaktionen 0; WN −2 gegen Außenwelt; FO-Regeneration +1 je 10 Minuten; mentale Widerstände +2",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -2,
          "scope": "WN −2"
        },
        {
          "id": "module-2",
          "type": "counter-regen",
          "target": "FO",
          "operation": "add",
          "value": 1,
          "scope": "FO-Regeneration +1"
        },
        {
          "id": "module-3",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-4",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        }
      ],
      "sourceLine": 82,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-meditierend",
      "name": "Meditierend",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "Bewegung 0; Reaktionen 0; FO +1 je 10 Minuten; mentale Widerstandsproben +2; endet durch Bewegung oder Schaden",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "FO",
          "operation": "add",
          "value": 1,
          "interval": "10-minutes",
          "scope": "FO +1 je 10 Minuten"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        }
      ],
      "sourceLine": 83,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-benommen",
      "name": "Benommen",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "Reaktion 0 bis Ende des nächsten Zuges; Initiative −2; Konzentration +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -2,
          "scope": "Initiative −2"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Konzentration",
          "operation": "difficulty",
          "value": 2,
          "scope": "Konzentration +2 Erschwernis"
        }
      ],
      "sourceLine": 84,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-betaubt",
      "name": "Betäubt",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "nächste Aktion verloren; Reaktion 0; Verteidigung −2; Dauer 1 Runde",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "defense",
          "operation": "add",
          "value": -2,
          "scope": "Verteidigung −2"
        }
      ],
      "sourceLine": 85,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-stupor",
      "name": "Stupor",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "Bewegung 0; Reaktionen 0; Initiative −4; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -4,
          "scope": "Initiative −4"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        }
      ],
      "sourceLine": 86,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-handlungsunfahig",
      "name": "Handlungsunfähig",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "Bewegung 0; Aktionen 0; Reaktionen 0; Wahrnehmung bleibt unverändert",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-2",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "action",
          "operation": "set",
          "value": 0,
          "scope": "Aktionen 0"
        }
      ],
      "sourceLine": 87,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-wiederbelebt",
      "name": "Wiederbelebt",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "L wird auf 1 gesetzt; KS −2 und keine natürliche L-Regeneration für 24 Stunden",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        }
      ],
      "sourceLine": 88,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-todesgeschutzt",
      "name": "Todesgeschützt",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "einmal: würde L auf 0 sinken, bleibt L stattdessen auf 1; Effekt endet danach",
      "modules": [],
      "sourceLine": 89,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-korperlos",
      "name": "Körperlos",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "nichtmagischer körperlicher Schaden −2; Durchdringen 1 Feld nichtmagischer Materie pro Aktion; Licht/Bann/Seele ignorieren Schutz",
      "modules": [],
      "sourceLine": 90,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-beschworen",
      "name": "Beschworen",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "keine eigenen Counter; verschwindet nach Dauer der Quelle oder bei Bannung",
      "modules": [],
      "sourceLine": 91,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-5-verbannt",
      "name": "Verbannt",
      "category": "Leben und Bewusstsein",
      "section": 5,
      "mechanics": "aus der Szene entfernt; Standarddauer 3 Runden oder Dauer der Quelle",
      "modules": [],
      "sourceLine": 92,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-prellung",
      "name": "Prellung",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/10 L blockiert; passende körperliche Proben +1 Erschwernis; Heilzeit 1 Tag nach Behandlung",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.1,
          "display": "1/10",
          "scope": "1/10 L blockiert"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "passende körperliche Proben",
          "operation": "difficulty",
          "value": 1,
          "scope": "passende körperliche Proben +1 Erschwernis"
        }
      ],
      "sourceLine": 98,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-verstauchung",
      "name": "Verstauchung",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/10 L blockiert; betroffene Bewegungs-/Nutzungsproben +2 Erschwernis; Heilzeit 3 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.1,
          "display": "1/10",
          "scope": "1/10 L blockiert"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "betroffene Bewegungs-/Nutzungsproben",
          "operation": "difficulty",
          "value": 2,
          "scope": "betroffene Bewegungs-/Nutzungsproben +2 Erschwernis"
        }
      ],
      "sourceLine": 99,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-offene-wunde",
      "name": "Offene Wunde",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/10 L blockiert; zusätzlich Blutend Stufe 1; Infektionsprobe nach 24 Stunden",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.1,
          "display": "1/10",
          "scope": "1/10 L blockiert"
        }
      ],
      "sourceLine": 100,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-tiefe-wunde",
      "name": "Tiefe Wunde",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/4 L blockiert; zusätzlich Blutend Stufe 2; Körperbereich nach Tabelle; Heilzeit 7 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.25,
          "display": "1/4",
          "scope": "1/4 L blockiert"
        }
      ],
      "sourceLine": 101,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-knochenbruch",
      "name": "Knochenbruch",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/4 L blockiert; Körperbereich nach Tabelle; ohne Schiene Proben weitere +2 Erschwernis; Heilzeit 14 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.25,
          "display": "1/4",
          "scope": "1/4 L blockiert"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "ohne Schiene Proben weitere",
          "operation": "difficulty",
          "value": 2,
          "scope": "ohne Schiene Proben weitere +2 Erschwernis"
        }
      ],
      "sourceLine": 102,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-beinbruch",
      "name": "Beinbruch",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/4 L blockiert; Bewegung halbiert; Athletik/Ausweichen/Reiten +2 Erschwernis; Sprinten/Springen 0; Heilzeit 14 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.25,
          "display": "1/4",
          "scope": "1/4 L blockiert"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -50,
          "scope": "Bewegung halbiert"
        },
        {
          "id": "module-3",
          "type": "difficulty",
          "target": "Athletik/Ausweichen/Reiten",
          "operation": "difficulty",
          "value": 2,
          "scope": "Athletik/Ausweichen/Reiten +2 Erschwernis"
        }
      ],
      "sourceLine": 103,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-armbruch",
      "name": "Armbruch",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/4 L blockiert; ST des Arms −2; armgebundene Proben +2; zweihändige Handlungen 0; Heilzeit 14 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.25,
          "display": "1/4",
          "scope": "1/4 L blockiert"
        }
      ],
      "sourceLine": 104,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-rippenbruch",
      "name": "Rippenbruch",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/4 L blockiert; KS −2; A-Regeneration −1 pro Rast; Rennen +2 Erschwernis; Heilzeit 10 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.25,
          "display": "1/4",
          "scope": "1/4 L blockiert"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        },
        {
          "id": "module-3",
          "type": "counter-regen",
          "target": "A",
          "operation": "add",
          "value": -1,
          "scope": "A-Regeneration −1"
        },
        {
          "id": "module-4",
          "type": "difficulty",
          "target": "Rennen",
          "operation": "difficulty",
          "value": 2,
          "scope": "Rennen +2 Erschwernis"
        }
      ],
      "sourceLine": 105,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-gehirnerschutterung",
      "name": "Gehirnerschütterung",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/4 L blockiert; WN −2; IN −1; Initiative −3; Konzentration +2; Heilzeit 3 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.25,
          "display": "1/4",
          "scope": "1/4 L blockiert"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -2,
          "scope": "WN −2"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "IN",
          "operation": "add",
          "value": -1,
          "scope": "IN −1"
        },
        {
          "id": "module-4",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -3,
          "scope": "Initiative −3"
        }
      ],
      "sourceLine": 106,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-innere-verletzung",
      "name": "Innere Verletzung",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/3 L blockiert; KS −2; natürliche L-Regeneration 0; bei körperlicher Belastung L −1; Heilzeit 14 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.3333333333333333,
          "display": "1/3",
          "scope": "1/3 L blockiert"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        },
        {
          "id": "module-3",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "L −1"
        },
        {
          "id": "module-4",
          "type": "counter-regen",
          "target": "L",
          "operation": "set",
          "value": 0,
          "scope": "L-Regeneration 0"
        }
      ],
      "sourceLine": 107,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-schwere-verbrennung",
      "name": "Schwere Verbrennung",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/3 L blockiert; KS −1; körperliche und Konzentrationsproben +2; Infektionsprobe täglich; Heilzeit 14 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.3333333333333333,
          "display": "1/3",
          "scope": "1/3 L blockiert"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -1,
          "scope": "KS −1"
        }
      ],
      "sourceLine": 108,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-gelenk-zertrummert",
      "name": "Gelenk zertrümmert",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/3 L blockiert; betroffener Arm/Bein auf Nutzung Stufe 4; Heilzeit mindestens 30 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.3333333333333333,
          "display": "1/3",
          "scope": "1/3 L blockiert"
        }
      ],
      "sourceLine": 109,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-korperteil-unbrauchbar",
      "name": "Körperteil unbrauchbar",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/3 L blockiert; zugeordnete Funktion 0; endet erst durch besondere Behandlung",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.3333333333333333,
          "display": "1/3",
          "scope": "1/3 L blockiert"
        }
      ],
      "sourceLine": 110,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-korperteil-verloren",
      "name": "Körperteil verloren",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/2 L blockiert, bis dauerhafte Versorgung erfolgt; zugeordnete Funktion 0",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.5,
          "display": "1/2",
          "scope": "1/2 L blockiert"
        }
      ],
      "sourceLine": 111,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-kritisches-trauma",
      "name": "Kritisches Trauma",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "1/2 L blockiert; KS −3; natürliche L-Regeneration 0; pro Stunde unbehandelt L −1",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.5,
          "display": "1/2",
          "scope": "1/2 L blockiert"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -3,
          "scope": "KS −3"
        },
        {
          "id": "module-3",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "L −1"
        },
        {
          "id": "module-4",
          "type": "counter-regen",
          "target": "L",
          "operation": "set",
          "value": 0,
          "scope": "L-Regeneration 0"
        }
      ],
      "sourceLine": 112,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-blutend-stufe-1",
      "name": "Blutend Stufe 1",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "L −1 am Ende jeder dritten Runde; Verband mit 1 Aktion beendet den Effekt",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "3-rounds",
          "scope": "L −1 am Ende jeder dritten Runde"
        }
      ],
      "sourceLine": 113,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-blutend-stufe-2",
      "name": "Blutend Stufe 2",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "L −1 am Ende jeder Runde; Behandlung benötigt 1 Aktion und passende Probe mit +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "round",
          "scope": "L −1 am Ende jeder Runde"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Behandlung benötigt 1 Aktion und passende Probe mit",
          "operation": "difficulty",
          "value": 2,
          "scope": "Behandlung benötigt 1 Aktion und passende Probe mit +2 Erschwernis"
        }
      ],
      "sourceLine": 114,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-blutend-stufe-3",
      "name": "Blutend Stufe 3",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "L −2 am Ende jeder Runde; Behandlung benötigt Hilfe und Probe mit +4 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -2,
          "interval": "round",
          "scope": "L −2 am Ende jeder Runde"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Behandlung benötigt Hilfe und Probe mit",
          "operation": "difficulty",
          "value": 4,
          "scope": "Behandlung benötigt Hilfe und Probe mit +4 Erschwernis"
        }
      ],
      "sourceLine": 115,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-blutverlust",
      "name": "Blutverlust",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "KS −1; A-Maximum −1; Dauer 24 Stunden oder vollständige Rast und Behandlung",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -1,
          "scope": "KS −1"
        },
        {
          "id": "module-2",
          "type": "counter-max",
          "target": "A",
          "operation": "add",
          "value": -1,
          "scope": "A-Maximum −1"
        }
      ],
      "sourceLine": 116,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-schmerz",
      "name": "Schmerz",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "betroffene körperliche Proben und Konzentration +1 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "betroffene körperliche Proben und Konzentration",
          "operation": "difficulty",
          "value": 1,
          "scope": "betroffene körperliche Proben und Konzentration +1 Erschwernis"
        }
      ],
      "sourceLine": 117,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-starker-schmerz",
      "name": "Starker Schmerz",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "betroffene körperliche Proben und Konzentration +2; erste Reaktion jeder Szene verloren",
      "modules": [],
      "sourceLine": 118,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-phantomschmerz",
      "name": "Phantomschmerz",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "ausgewählte Handlungsart +2 Erschwernis; kein L-Verlust; Standarddauer Szene",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "ausgewählte Handlungsart",
          "operation": "difficulty",
          "value": 2,
          "scope": "ausgewählte Handlungsart +2 Erschwernis"
        }
      ],
      "sourceLine": 119,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-gelahmter-korperbereich",
      "name": "Gelähmter Körperbereich",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "zugeordnete Funktion 0; keine zusätzliche L-Blockade ohne Verletzungsquelle",
      "modules": [],
      "sourceLine": 120,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-vollstandig-gelahmt",
      "name": "Vollständig gelähmt",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "Bewegung 0; Reaktionen 0; körperliche Aktionen 0",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-2",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "action",
          "operation": "set",
          "value": 0,
          "scope": "Aktionen 0"
        }
      ],
      "sourceLine": 121,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-heilung-gehemmt",
      "name": "Heilung gehemmt",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "jede erhaltene L-Heilung −1, mindestens 0; natürliche L-Regeneration 0",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "L",
          "operation": "set",
          "value": 0,
          "scope": "L-Regeneration 0"
        }
      ],
      "sourceLine": 122,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-regenerierend",
      "name": "Regenerierend",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "L +1 am Ende jeder dritten Runde; blockierte L-Punkte bleiben unheilbar",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": 1,
          "interval": "3-rounds",
          "scope": "L +1 am Ende jeder dritten Runde"
        }
      ],
      "sourceLine": 123,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-6-in-behandlung",
      "name": "In Behandlung",
      "category": "Verletzungen",
      "section": 6,
      "mechanics": "nach jeder vollständigen Rast wird 1 blockierter L-Punkt freigegeben; nur bei versorgter Verletzung",
      "modules": [],
      "sourceLine": 124,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-brennend",
      "name": "Brennend",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "L −1 am Ende jeder Runde; Löschen benötigt 1 Aktion; Nass beendet Brennend automatisch",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "round",
          "scope": "L −1 am Ende jeder Runde"
        }
      ],
      "sourceLine": 130,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-stark-brennend",
      "name": "Stark brennend",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "L −2 am Ende jeder Runde; Löschen benötigt 2 erfolgreiche Aktionen oder Durchnässt",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -2,
          "interval": "round",
          "scope": "L −2 am Ende jeder Runde"
        }
      ],
      "sourceLine": 131,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-glimmend",
      "name": "Glimmend",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "kein sofortiger Verlust; nach erneutem Feuerkontakt Brennend; endet nach 3 Runden ohne Feuerkontakt",
      "modules": [],
      "sourceLine": 132,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-im-rauch",
      "name": "Im Rauch",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "sichtabhängige Proben +2 Erschwernis; nach 3 Runden KS-Probe mit +2, bei Misslingen Rauchvergiftung",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "sichtabhängige Proben",
          "operation": "difficulty",
          "value": 2,
          "scope": "sichtabhängige Proben +2 Erschwernis"
        }
      ],
      "sourceLine": 133,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-rauchvergiftung",
      "name": "Rauchvergiftung",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "KS −2; WN −1; A −1 am Ende jeder dritten Runde; endet nach 10 Minuten sauberer Luft",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        },
        {
          "id": "module-3",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": -1,
          "interval": "3-rounds",
          "scope": "A −1 am Ende jeder dritten Runde"
        }
      ],
      "sourceLine": 134,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-in-hitze",
      "name": "In Hitze",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "A-Regeneration 0; pro Stunde KS-Probe mit +1; Misslingen erzeugt Überhitzt",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "A",
          "operation": "set",
          "value": 0,
          "scope": "A-Regeneration 0"
        }
      ],
      "sourceLine": 135,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-uberhitzt",
      "name": "Überhitzt",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "KS −1; RF −1; A −1 pro Stunde; endet nach 1 Stunde Kühlung und Flüssigkeit",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -1,
          "scope": "KS −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -1,
          "scope": "RF −1"
        },
        {
          "id": "module-3",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": -1,
          "interval": "hour",
          "scope": "A −1 pro Stunde"
        }
      ],
      "sourceLine": 136,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-hitzschlag",
      "name": "Hitzschlag",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "KS −3; RF −2; WN −2; L −1 pro Stunde; Behandlung erforderlich",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -3,
          "scope": "KS −3"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -2,
          "scope": "RF −2"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -2,
          "scope": "WN −2"
        },
        {
          "id": "module-4",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "hour",
          "scope": "L −1 pro Stunde"
        }
      ],
      "sourceLine": 137,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-feuerresistent",
      "name": "Feuerresistent",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "Feuerschaden −2; Brennend verursacht nur alle 2 Runden L −1",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "L −1"
        }
      ],
      "sourceLine": 138,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-7-brennbare-umgebung",
      "name": "Brennbare Umgebung",
      "category": "Feuer, Rauch und Hitze",
      "section": 7,
      "mechanics": "bei offener Flamme nach 1 Runde Brennend; Feuer breitet sich pro Runde 1 Feld aus",
      "modules": [],
      "sourceLine": 139,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-nass",
      "name": "Nass",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Feuer löschen kostet keine Probe; Kälteproben +1 Erschwernis; elektrische Proben gegen Ziel +1 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Kälteproben",
          "operation": "difficulty",
          "value": 1,
          "scope": "Kälteproben +1 Erschwernis"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "elektrische Proben gegen Ziel",
          "operation": "bonus",
          "value": 1,
          "scope": "elektrische Proben gegen Ziel +1 Bonus"
        }
      ],
      "sourceLine": 145,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-durchnasst",
      "name": "Durchnässt",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Feuer endet sofort; Bewegung −25 % durch schwere Kleidung; Kälteproben +2; elektrische Proben +2 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -25,
          "scope": "Bewegung −25 %"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "elektrische Proben",
          "operation": "bonus",
          "value": 2,
          "scope": "elektrische Proben +2 Bonus"
        }
      ],
      "sourceLine": 146,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-im-wasser",
      "name": "Im Wasser",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung −25 %; Athletik & Schwimmen ohne Abzug, alle anderen körperlichen Bewegungsproben +2",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -25,
          "scope": "Bewegung −25 %"
        }
      ],
      "sourceLine": 147,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-unter-wasser",
      "name": "Unter Wasser",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung −50 %; sichtabhängige Proben +2; Atemvorrat KS Runden, danach Ertrinkend",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -50,
          "scope": "Bewegung −50 %"
        }
      ],
      "sourceLine": 148,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-von-stromung-erfasst",
      "name": "Von Strömung erfasst",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "am Ende jeder Runde 2 Felder mit Strömung bewegt; Athletik & Schwimmen mit +2 zum Entkommen",
      "modules": [],
      "sourceLine": 149,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-kalteexposition",
      "name": "Kälteexposition",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "A-Regeneration 0; jede Stunde KS-Probe mit +1, bei Nass +2, bei Durchnässt +4; Misslingen erzeugt Unterkühlt",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "A",
          "operation": "set",
          "value": 0,
          "scope": "A-Regeneration 0"
        }
      ],
      "sourceLine": 150,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-unterkuhlt",
      "name": "Unterkühlt",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "GS −1; FF −2; RF −1; A-Regeneration 0; endet nach 1 Stunde Wärme",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "GS",
          "operation": "add",
          "value": -1,
          "scope": "GS −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "FF",
          "operation": "add",
          "value": -2,
          "scope": "FF −2"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -1,
          "scope": "RF −1"
        },
        {
          "id": "module-4",
          "type": "counter-regen",
          "target": "A",
          "operation": "set",
          "value": 0,
          "scope": "A-Regeneration 0"
        }
      ],
      "sourceLine": 151,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-schwer-unterkuhlt",
      "name": "Schwer unterkühlt",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "KS −2; GS −2; FF −3; RF −2; WN −1; L −1 pro Stunde; Behandlung erforderlich",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "GS",
          "operation": "add",
          "value": -2,
          "scope": "GS −2"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "FF",
          "operation": "add",
          "value": -3,
          "scope": "FF −3"
        },
        {
          "id": "module-4",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -2,
          "scope": "RF −2"
        },
        {
          "id": "module-5",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        },
        {
          "id": "module-6",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "hour",
          "scope": "L −1 pro Stunde"
        }
      ],
      "sourceLine": 152,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-erfrierung",
      "name": "Erfrierung",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "1/10 L blockiert je betroffenem Körperbereich; Nutzung +2 Erschwernis; Heilzeit 7 Tage",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-block",
          "target": "L",
          "operation": "block",
          "value": 0.1,
          "display": "1/10",
          "scope": "1/10 L blockiert"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Nutzung",
          "operation": "difficulty",
          "value": 2,
          "scope": "Nutzung +2 Erschwernis"
        }
      ],
      "sourceLine": 153,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-gefroren",
      "name": "Gefroren",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung −25 %; FF −1; endet nach 10 Minuten Wärme",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "FF",
          "operation": "add",
          "value": -1,
          "scope": "FF −1"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -25,
          "scope": "Bewegung −25 %"
        }
      ],
      "sourceLine": 154,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-eingeeist",
      "name": "Eingeeist",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung 0; Befreiungsprobe mit +2 Erschwernis oder Eis erhält 3 Strukturpunkte",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Befreiungsprobe mit",
          "operation": "difficulty",
          "value": 2,
          "scope": "Befreiungsprobe mit +2 Erschwernis oder Eis erhält 3 Strukturpunkte"
        }
      ],
      "sourceLine": 155,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-rutschig",
      "name": "Rutschig",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "bei Bewegung über halbe Geschwindigkeit GS-Probe mit +2; Misslingen erzeugt Liegend",
      "modules": [],
      "sourceLine": 156,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-im-nebel",
      "name": "Im Nebel",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "sichtabhängige Proben ab 2 Feldern +2 Erschwernis; Sichtweite maximal 5 Felder",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "sichtabhängige Proben ab 2 Feldern",
          "operation": "difficulty",
          "value": 2,
          "scope": "sichtabhängige Proben ab 2 Feldern +2 Erschwernis"
        }
      ],
      "sourceLine": 157,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-starker-regen",
      "name": "Starker Regen",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Sicht/Fernkampf +2 Erschwernis; nach 3 Runden Nass; offene nichtmagische Flammen enden",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Sicht/Fernkampf",
          "operation": "difficulty",
          "value": 2,
          "scope": "Sicht/Fernkampf +2 Erschwernis"
        }
      ],
      "sourceLine": 158,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-schneefall",
      "name": "Schneefall",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Sicht/Fernkampf +1; Bewegung −25 %; nach 1 Stunde Kälteexposition",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -25,
          "scope": "Bewegung −25 %"
        }
      ],
      "sourceLine": 159,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-hagel",
      "name": "Hagel",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "WN und Konzentration +2; ungeschützt L −1 je 10 Minuten",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "10-minutes",
          "scope": "L −1 je 10 Minuten"
        }
      ],
      "sourceLine": 160,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-starker-wind",
      "name": "Starker Wind",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung gegen Wind −25 %; Fernkampf +2; Hören +1; Rauch/Nebel 1 Feld pro Runde versetzt",
      "modules": [],
      "sourceLine": 161,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-sturm",
      "name": "Sturm",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung −50 %; Fernkampf +4; beim Rundenbeginn GS-Probe +2 oder Liegend",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -50,
          "scope": "Bewegung −50 %"
        }
      ],
      "sourceLine": 162,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-ruckenwind",
      "name": "Rückenwind",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung in Windrichtung +25 %; effektive Fallhöhe −2 Felder",
      "modules": [],
      "sourceLine": 163,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-gegenwind",
      "name": "Gegenwind",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung gegen Wind −50 %, mindestens 1; Fernkampf +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Fernkampf",
          "operation": "difficulty",
          "value": 2,
          "scope": "Fernkampf +2 Erschwernis"
        }
      ],
      "sourceLine": 164,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-schlechte-luft",
      "name": "Schlechte Luft",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "A-Regeneration 0; alle 10 Minuten KS-Probe +2, bei Misslingen A −1",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "A −1"
        },
        {
          "id": "module-2",
          "type": "counter-regen",
          "target": "A",
          "operation": "set",
          "value": 0,
          "scope": "A-Regeneration 0"
        }
      ],
      "sourceLine": 165,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-dunne-luft",
      "name": "Dünne Luft",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "A-Kosten körperlicher Handlungen +1; stündlich KS-Probe +2 oder Benommen",
      "modules": [],
      "sourceLine": 166,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-erstickend",
      "name": "Erstickend",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "am Ende jeder Runde A −1; bei A 0 anschließend L −1 pro Runde",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "A −1"
        },
        {
          "id": "module-2",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "round",
          "scope": "L −1 pro Runde"
        }
      ],
      "sourceLine": 167,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-ertrinkend",
      "name": "Ertrinkend",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "am Ende jeder Runde A −1; bei A 0 anschließend L −1 pro Runde; Bewegungsproben zusätzlich +2",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "A −1"
        },
        {
          "id": "module-2",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "round",
          "scope": "L −1 pro Runde"
        }
      ],
      "sourceLine": 168,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-fallend",
      "name": "Fallend",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Fallhöhe wird gespeichert; Aufprall verursacht 1 L je 2 gefallene Felder, maximal 10",
      "modules": [],
      "sourceLine": 169,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-erschutterter-boden",
      "name": "Erschütterter Boden",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung −25 %; bei schneller Bewegung GS-Probe +2 oder Liegend",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -25,
          "scope": "Bewegung −25 %"
        }
      ],
      "sourceLine": 170,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-instabiler-boden",
      "name": "Instabiler Boden",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung −50 %; bei Belastung GS-Probe +2 oder Einbruch/Verschüttet",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -50,
          "scope": "Bewegung −50 %"
        }
      ],
      "sourceLine": 171,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-verschuttet",
      "name": "Verschüttet",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "Bewegung 0; Sicht 0; Erstickend nach KS Runden; Befreiungsprobe ST +4",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "ST",
          "operation": "add",
          "value": 4,
          "scope": "ST +4"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-3",
          "type": "flag",
          "target": "sight",
          "operation": "set",
          "value": 0,
          "scope": "Sicht 0"
        }
      ],
      "sourceLine": 172,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-im-dunkeln",
      "name": "Im Dunkeln",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "sichtabhängige Proben +4; ohne ungefähre Zielposition kein sichtabhängiger Angriff",
      "modules": [],
      "sourceLine": 173,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-8-gleissendes-licht",
      "name": "Gleißendes Licht",
      "category": "Wasser, Kälte, Wetter und Luft",
      "section": 8,
      "mechanics": "sichtabhängige Proben +2 für 3 Runden; misslungene KS-Probe +2 erzeugt Geblendet",
      "modules": [],
      "sourceLine": 174,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-9-leitend",
      "name": "Leitend",
      "category": "Elektrizität",
      "section": 9,
      "mechanics": "elektrischer Schaden +1; elektrische Effekte können auf ein angrenzendes leitendes Ziel springen",
      "modules": [],
      "sourceLine": 180,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-9-elektrisch-geladen",
      "name": "Elektrisch geladen",
      "category": "Elektrizität",
      "section": 9,
      "mechanics": "nächste elektrische Wirkung verursacht +2 Schaden; endet nach Auslösung oder 3 Runden",
      "modules": [],
      "sourceLine": 181,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-9-geschockt",
      "name": "Geschockt",
      "category": "Elektrizität",
      "section": 9,
      "mechanics": "Reaktion 0 bis Ende des nächsten Zuges; RF −2 für 1 Runde",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -2,
          "scope": "RF −2"
        }
      ],
      "sourceLine": 182,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-9-elektrisiert",
      "name": "Elektrisiert",
      "category": "Elektrizität",
      "section": 9,
      "mechanics": "bei Bewegung oder Metallkontakt L −1; maximal einmal pro Runde; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "L −1"
        }
      ],
      "sourceLine": 183,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-9-geerdet",
      "name": "Geerdet",
      "category": "Elektrizität",
      "section": 9,
      "mechanics": "Elektrisch geladen und Elektrisiert enden; elektrischer Schaden bis nächster Zug −2",
      "modules": [],
      "sourceLine": 184,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-9-magnetisch-festgehalten",
      "name": "Magnetisch festgehalten",
      "category": "Elektrizität",
      "section": 9,
      "mechanics": "Bewegung −50 % in Metallrüstung; metallgebundene Handlungen +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -50,
          "scope": "Bewegung −50 %"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "metallgebundene Handlungen",
          "operation": "difficulty",
          "value": 2,
          "scope": "metallgebundene Handlungen +2 Erschwernis"
        }
      ],
      "sourceLine": 185,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-9-magnetisch-entwaffnet",
      "name": "Magnetisch entwaffnet",
      "category": "Elektrizität",
      "section": 9,
      "mechanics": "ausgewählte Metallwaffe fällt 2 Felder in Richtung der Quelle; Wiederaufnahme kostet 1 Aktion",
      "modules": [],
      "sourceLine": 186,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-liegend",
      "name": "Liegend",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Aufstehen kostet halbe Bewegung; Nahkampfangriffe gegen Ziel +1 Bonus; Fernangriffe gegen Ziel +1 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Nahkampfangriffe gegen Ziel",
          "operation": "bonus",
          "value": 1,
          "scope": "Nahkampfangriffe gegen Ziel +1 Bonus"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Fernangriffe gegen Ziel",
          "operation": "difficulty",
          "value": 1,
          "scope": "Fernangriffe gegen Ziel +1 Erschwernis"
        }
      ],
      "sourceLine": 192,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-festgehalten",
      "name": "Festgehalten",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung 0; Befreiungsprobe ST oder GS mit +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Befreiungsprobe ST oder GS mit",
          "operation": "difficulty",
          "value": 2,
          "scope": "Befreiungsprobe ST oder GS mit +2 Erschwernis"
        }
      ],
      "sourceLine": 193,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-gefesselt",
      "name": "Gefesselt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung 0; körperliche Handlungen +2; Befreiungsprobe +4",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        }
      ],
      "sourceLine": 194,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-gepackt",
      "name": "Gepackt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung 0; Ausweichen +2 Erschwernis; Befreiungsprobe ST oder GS +2",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "GS",
          "operation": "add",
          "value": 2,
          "scope": "GS +2"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-3",
          "type": "difficulty",
          "target": "Ausweichen",
          "operation": "difficulty",
          "value": 2,
          "scope": "Ausweichen +2 Erschwernis"
        }
      ],
      "sourceLine": 195,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-zu-boden-gedruckt",
      "name": "Zu Boden gedrückt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung 0; Reaktion 0; Verteidigung −2; Befreiungsprobe +4",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "defense",
          "operation": "add",
          "value": -2,
          "scope": "Verteidigung −2"
        }
      ],
      "sourceLine": 196,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-verwurzelt",
      "name": "Verwurzelt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung 0; ST- oder passende Magieprobe +2 zum Befreien",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "set",
          "value": 0,
          "scope": "Bewegung 0"
        }
      ],
      "sourceLine": 197,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-versteinert",
      "name": "Versteinert",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung/Aktionen/Reaktionen 0; körperlicher Schaden −4; Regeneration 0",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "*",
          "operation": "set",
          "value": 0,
          "scope": "Regeneration 0"
        },
        {
          "id": "module-2",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        }
      ],
      "sourceLine": 198,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-verlangsamt",
      "name": "Verlangsamt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung −50 %; Initiative −2; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -50,
          "scope": "Bewegung −50 %"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -2,
          "scope": "Initiative −2"
        }
      ],
      "sourceLine": 199,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-beschleunigt",
      "name": "Beschleunigt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bewegung +50 %; Initiative +2; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": 50,
          "scope": "Bewegung +50 %"
        },
        {
          "id": "module-2",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": 2,
          "scope": "Initiative +2"
        }
      ],
      "sourceLine": 200,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-schwieriges-gelande",
      "name": "Schwieriges Gelände",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "jeder bewegte Feld kostet 2 Bewegung",
      "modules": [],
      "sourceLine": 201,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-schwebend",
      "name": "Schwebend",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Bodenhindernisse ignoriert; Bewegung maximal 3 Felder pro Aktion; Fallend bei Ende ohne Boden",
      "modules": [],
      "sourceLine": 202,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-fliegend",
      "name": "Fliegend",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Flugbewegung entspricht normaler Bewegung; Fallend bei Ende ohne Boden",
      "modules": [],
      "sourceLine": 203,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-zuruckgestossen",
      "name": "Zurückgestoßen",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "sofort 2 Felder von Quelle weg; Kollision verursacht L −1",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "L −1"
        }
      ],
      "sourceLine": 204,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-herangezogen",
      "name": "Herangezogen",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "sofort 2 Felder zur Quelle; kein direkter Schaden",
      "modules": [],
      "sourceLine": 205,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-uberrascht",
      "name": "Überrascht",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Reaktion 0; Initiative −4 bis Ende des ersten eigenen Zuges",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -4,
          "scope": "Initiative −4"
        }
      ],
      "sourceLine": 206,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-reaktion-verloren",
      "name": "Reaktion verloren",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Reaktionen 0 bis Ende des nächsten eigenen Zuges",
      "modules": [
        {
          "id": "module-1",
          "type": "flag",
          "target": "reaction",
          "operation": "set",
          "value": 0,
          "scope": "Reaktionen 0"
        }
      ],
      "sourceLine": 207,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-aktion-verloren",
      "name": "Aktion verloren",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "nächste verfügbare Aktion entfällt",
      "modules": [],
      "sourceLine": 208,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-entwaffnet",
      "name": "Entwaffnet",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Waffe fällt ins eigene oder angrenzende Feld; Aufnehmen kostet 1 Aktion",
      "modules": [],
      "sourceLine": 209,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-in-deckung",
      "name": "In Deckung",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Fernangriffe gegen Ziel +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Fernangriffe gegen Ziel",
          "operation": "difficulty",
          "value": 2,
          "scope": "Fernangriffe gegen Ziel +2 Erschwernis"
        }
      ],
      "sourceLine": 210,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-entblosst",
      "name": "Entblößt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Verteidigung −2; Verbergungsbonus 0; Dauer 1 Runde",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "defense",
          "operation": "add",
          "value": -2,
          "scope": "Verteidigung −2"
        }
      ],
      "sourceLine": 211,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-versteckt",
      "name": "Versteckt",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Entdeckungsproben gegen Ziel +2 Erschwernis; endet nach offenem Angriff",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Entdeckungsproben gegen Ziel",
          "operation": "difficulty",
          "value": 2,
          "scope": "Entdeckungsproben gegen Ziel +2 Erschwernis"
        }
      ],
      "sourceLine": 212,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-offenbart",
      "name": "Offenbart",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "Versteckt/Unsichtbar/Verkleidet unterdrückt; Dauer 3 Runden",
      "modules": [],
      "sourceLine": 213,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-bewacht",
      "name": "Bewacht",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "nächster Angriff gegen Ziel +2 Erschwernis; endet nach Auslösung",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "nächster Angriff gegen Ziel",
          "operation": "difficulty",
          "value": 2,
          "scope": "nächster Angriff gegen Ziel +2 Erschwernis"
        }
      ],
      "sourceLine": 214,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-10-markiert",
      "name": "Markiert",
      "category": "Bewegung und Kampf",
      "section": 10,
      "mechanics": "festgelegte Quelle erhält +2 auf Verfolgung oder den ersten Angriff pro Runde",
      "modules": [],
      "sourceLine": 215,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-mude",
      "name": "Müde",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "WN −1; IN −1; Initiative −2; endet nach kurzer Rast",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "IN",
          "operation": "add",
          "value": -1,
          "scope": "IN −1"
        },
        {
          "id": "module-3",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -2,
          "scope": "Initiative −2"
        }
      ],
      "sourceLine": 221,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-erschopft",
      "name": "Erschöpft",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "ST −1; KS −1; RF −1; A-Regeneration −1 pro Rast",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "ST",
          "operation": "add",
          "value": -1,
          "scope": "ST −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -1,
          "scope": "KS −1"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -1,
          "scope": "RF −1"
        },
        {
          "id": "module-4",
          "type": "counter-regen",
          "target": "A",
          "operation": "add",
          "value": -1,
          "scope": "A-Regeneration −1"
        }
      ],
      "sourceLine": 222,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-uberanstrengt",
      "name": "Überanstrengt",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "A-Regeneration 0; körperliche Proben +2; endet nach 30 Minuten Rast",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "A",
          "operation": "set",
          "value": 0,
          "scope": "A-Regeneration 0"
        }
      ],
      "sourceLine": 223,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-schlafmangel",
      "name": "Schlafmangel",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "pro fehlender Nacht WN −1, IN −1, RF −1 und FO-Regeneration −1; Maximum −3",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "IN",
          "operation": "add",
          "value": -1,
          "scope": "IN −1"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -1,
          "scope": "RF −1"
        },
        {
          "id": "module-4",
          "type": "counter-regen",
          "target": "FO",
          "operation": "add",
          "value": -1,
          "scope": "FO-Regeneration −1"
        }
      ],
      "sourceLine": 224,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-ausgeruht",
      "name": "Ausgeruht",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "A +1 und FO +1 nach Rast; erste Probe der Szene +1 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": 1,
          "interval": "manual",
          "scope": "A +1"
        },
        {
          "id": "module-2",
          "type": "counter-current",
          "target": "FO",
          "operation": "add",
          "value": 1,
          "interval": "manual",
          "scope": "FO +1 nach Rast"
        },
        {
          "id": "module-3",
          "type": "difficulty",
          "target": "erste Probe der Szene",
          "operation": "bonus",
          "value": 1,
          "scope": "erste Probe der Szene +1 Bonus"
        }
      ],
      "sourceLine": 225,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-hungrig",
      "name": "Hungrig",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "A-Regeneration −1 pro Rast; nach 24 Stunden Verhungert",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "A",
          "operation": "add",
          "value": -1,
          "scope": "A-Regeneration −1"
        }
      ],
      "sourceLine": 226,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-verhungert",
      "name": "Verhungert",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "ST −1 und KS −1 pro Tag, maximal −3; L −1 pro Tag",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "ST",
          "operation": "add",
          "value": -1,
          "scope": "ST −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -1,
          "scope": "KS −1"
        },
        {
          "id": "module-3",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "day",
          "scope": "L −1 pro Tag"
        }
      ],
      "sourceLine": 227,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-durstig",
      "name": "Durstig",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "A- und FO-Regeneration −1 pro Rast; nach 12 Stunden Dehydriert",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "FO",
          "operation": "add",
          "value": -1,
          "scope": "FO-Regeneration −1"
        }
      ],
      "sourceLine": 228,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-dehydriert",
      "name": "Dehydriert",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "KS −2; RF −1; WN −1; L −1 je 6 Stunden",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -1,
          "scope": "RF −1"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        },
        {
          "id": "module-4",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "6-hours",
          "scope": "L −1 je 6 Stunden"
        }
      ],
      "sourceLine": 229,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-gut-genahrt",
      "name": "Gut genährt",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "Hungrig/Verhungert endet; A-Regeneration +1 bei nächster Rast",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "A",
          "operation": "add",
          "value": 1,
          "scope": "A-Regeneration +1"
        }
      ],
      "sourceLine": 230,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-hydriert",
      "name": "Hydriert",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "Durstig/Dehydriert endet; FO-Regeneration +1 bei nächster Rast",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "FO",
          "operation": "add",
          "value": 1,
          "scope": "FO-Regeneration +1"
        }
      ],
      "sourceLine": 231,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-vergiftet-stufe-1",
      "name": "Vergiftet Stufe 1",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "gewählter Counter −1 je 10 Minuten; KS-Probe +1 nach jedem Verlust; 3 Erfolge beenden Gift",
      "modules": [],
      "sourceLine": 232,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-vergiftet-stufe-2",
      "name": "Vergiftet Stufe 2",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "gewählter Counter oder L −1 je 3 Runden; KS-Probe +2; 3 Erfolge beenden Gift",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "3-rounds",
          "scope": "L −1 je 3 Runden"
        }
      ],
      "sourceLine": 233,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-vergiftet-stufe-3",
      "name": "Vergiftet Stufe 3",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "L −2 je Runde; KS-Probe +4; 3 Erfolge beenden Gift",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -2,
          "interval": "round",
          "scope": "L −2 je Runde"
        }
      ],
      "sourceLine": 234,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-krank",
      "name": "Krank",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "KS −2; natürliche Regeneration −1; tägliche KS-Probe +2; 3 Erfolge beenden Krankheit",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        },
        {
          "id": "module-2",
          "type": "counter-regen",
          "target": "*",
          "operation": "add",
          "value": -1,
          "scope": "Regeneration −1"
        }
      ],
      "sourceLine": 235,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-infiziert",
      "name": "Infiziert",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "natürliche L-Regeneration 0; tägliche KS-Probe +2; Misslingen erzeugt Fieber",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "L",
          "operation": "set",
          "value": 0,
          "scope": "L-Regeneration 0"
        }
      ],
      "sourceLine": 236,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-fieber",
      "name": "Fieber",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "KS −2; WN −1; A −1 je 6 Stunden; Regeneration 0",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -2,
          "scope": "KS −2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        },
        {
          "id": "module-3",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": -1,
          "interval": "6-hours",
          "scope": "A −1 je 6 Stunden"
        },
        {
          "id": "module-4",
          "type": "counter-regen",
          "target": "*",
          "operation": "set",
          "value": 0,
          "scope": "Regeneration 0"
        }
      ],
      "sourceLine": 237,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-ubel",
      "name": "Übel",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "körperliche und Konzentrationsproben +1 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "körperliche und Konzentrationsproben",
          "operation": "difficulty",
          "value": 1,
          "scope": "körperliche und Konzentrationsproben +1 Erschwernis"
        }
      ],
      "sourceLine": 238,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-erbrechend",
      "name": "Erbrechend",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "nächste Aktion verloren; A −1; danach Übel für 1 Stunde",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "A",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "A −1"
        }
      ],
      "sourceLine": 239,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-schwindelig",
      "name": "Schwindelig",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "GS −1; RF −1; bei schneller Bewegung GS-Probe +2 oder Liegend",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "GS",
          "operation": "add",
          "value": -1,
          "scope": "GS −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -1,
          "scope": "RF −1"
        }
      ],
      "sourceLine": 240,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-betrunken-stufe-1",
      "name": "Betrunken Stufe 1",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "GS −1; RF −1; WN −1; soziale Hemmung als RP-Notiz",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "GS",
          "operation": "add",
          "value": -1,
          "scope": "GS −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -1,
          "scope": "RF −1"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        }
      ],
      "sourceLine": 241,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-betrunken-stufe-2",
      "name": "Betrunken Stufe 2",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "GS −2; RF −2; FF −1; WN −2; Bewegung −25 %",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "GS",
          "operation": "add",
          "value": -2,
          "scope": "GS −2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "RF",
          "operation": "add",
          "value": -2,
          "scope": "RF −2"
        },
        {
          "id": "module-3",
          "type": "attribute",
          "target": "FF",
          "operation": "add",
          "value": -1,
          "scope": "FF −1"
        },
        {
          "id": "module-4",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -2,
          "scope": "WN −2"
        },
        {
          "id": "module-5",
          "type": "derived",
          "target": "movement",
          "operation": "percent",
          "value": -25,
          "scope": "Bewegung −25 %"
        }
      ],
      "sourceLine": 242,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-kater",
      "name": "Kater",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "KS −1; WN −1; FO-Regeneration 0; Dauer 6 Stunden",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -1,
          "scope": "KS −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        },
        {
          "id": "module-3",
          "type": "counter-regen",
          "target": "FO",
          "operation": "set",
          "value": 0,
          "scope": "FO-Regeneration 0"
        }
      ],
      "sourceLine": 243,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-entzug",
      "name": "Entzug",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "WL −2; KS −1; Konzentration +2; Dauer nach Substanz",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WL",
          "operation": "add",
          "value": -2,
          "scope": "WL −2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": -1,
          "scope": "KS −1"
        }
      ],
      "sourceLine": 244,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-medizinisch-versorgt",
      "name": "Medizinisch versorgt",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "Blutend endet; Verletzung kann nicht weiter eskalieren; noch keine L-Blockade freigegeben",
      "modules": [],
      "sourceLine": 245,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-11-in-behandlung",
      "name": "In Behandlung",
      "category": "Versorgung und Krankheit",
      "section": 11,
      "mechanics": "pro vollständiger Rast 1 blockierter L-Punkt freigegeben",
      "modules": [],
      "sourceLine": 246,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-blind",
      "name": "Blind",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "WN für Sicht 0; sichtabhängige Angriffe und Handlungen nicht möglich",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "set",
          "value": 0,
          "scope": "WN für Sicht 0"
        },
        {
          "id": "module-2",
          "type": "flag",
          "target": "sight",
          "operation": "set",
          "value": 0,
          "scope": "Sicht 0"
        }
      ],
      "sourceLine": 252,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-geblendet",
      "name": "Geblendet",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "sichtabhängige Proben +4; Verteidigung −2; Dauer 1 Runde",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "defense",
          "operation": "add",
          "value": -2,
          "scope": "Verteidigung −2"
        }
      ],
      "sourceLine": 253,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-verschwommene-sicht",
      "name": "Verschwommene Sicht",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "WN −1; Fernkampf +2; Dauer Szene",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        }
      ],
      "sourceLine": 254,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-dunkelsicht",
      "name": "Dunkelsicht",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "Erschwernis durch Dunkelheit um 4 reduziert",
      "modules": [],
      "sourceLine": 255,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-taub",
      "name": "Taub",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "WN für Hören 0; hörabhängige Handlungen nicht möglich",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "set",
          "value": 0,
          "scope": "WN für Hören 0"
        },
        {
          "id": "module-2",
          "type": "flag",
          "target": "hearing",
          "operation": "set",
          "value": 0,
          "scope": "Hören 0"
        }
      ],
      "sourceLine": 256,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-ohrensausen",
      "name": "Ohrensausen",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "hörabhängige Proben +2; Dauer 3 Runden",
      "modules": [],
      "sourceLine": 257,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-stumm",
      "name": "Stumm",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "Sprechen und sprachgebundene Handlungen 0; Dauer der Quelle",
      "modules": [],
      "sourceLine": 258,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-sinne-gescharft",
      "name": "Sinne geschärft",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "gewählte Wahrnehmungsart +2 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "gewählte Wahrnehmungsart",
          "operation": "bonus",
          "value": 2,
          "scope": "gewählte Wahrnehmungsart +2 Bonus"
        }
      ],
      "sourceLine": 259,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-sinne-gedampft",
      "name": "Sinne gedämpft",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "gewählte Wahrnehmungsart +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "gewählte Wahrnehmungsart",
          "operation": "difficulty",
          "value": 2,
          "scope": "gewählte Wahrnehmungsart +2 Erschwernis"
        }
      ],
      "sourceLine": 260,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-sinnestauschung",
      "name": "Sinnestäuschung",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "gewählte Wahrnehmungsart +4 Erschwernis; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "gewählte Wahrnehmungsart",
          "operation": "difficulty",
          "value": 4,
          "scope": "gewählte Wahrnehmungsart +4 Erschwernis"
        }
      ],
      "sourceLine": 261,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-halluzinierend",
      "name": "Halluzinierend",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "WN −2; Orientierung und Zielerkennung +2; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -2,
          "scope": "WN −2"
        }
      ],
      "sourceLine": 262,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-unsichtbar",
      "name": "Unsichtbar",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "sichtabhängige Entdeckung/Angriffe gegen Ziel +4 Erschwernis; endet durch Offenbart",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "sichtabhängige Entdeckung/Angriffe gegen Ziel",
          "operation": "difficulty",
          "value": 4,
          "scope": "sichtabhängige Entdeckung/Angriffe gegen Ziel +4 Erschwernis"
        }
      ],
      "sourceLine": 263,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-verhullt",
      "name": "Verhüllt",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "Entdeckungsproben gegen Ziel +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Entdeckungsproben gegen Ziel",
          "operation": "difficulty",
          "value": 2,
          "scope": "Entdeckungsproben gegen Ziel +2 Erschwernis"
        }
      ],
      "sourceLine": 264,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-wahrer-blick",
      "name": "Wahrer Blick",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "Boni durch Unsichtbar, Verhüllt und Verkleidet um 4 reduziert",
      "modules": [],
      "sourceLine": 265,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-12-magisch-wahrnehmbar",
      "name": "Magisch wahrnehmbar",
      "category": "Sinne und Wahrnehmung",
      "section": 12,
      "mechanics": "Magiewahrnehmung gegen Ziel +2 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Magiewahrnehmung gegen Ziel",
          "operation": "bonus",
          "value": 2,
          "scope": "Magiewahrnehmung gegen Ziel +2 Bonus"
        }
      ],
      "sourceLine": 266,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-angstlich",
      "name": "Ängstlich",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Handlungen gegen/nahe Auslöser +2 Erschwernis; Dauer Szene",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Handlungen gegen/nahe Auslöser",
          "operation": "difficulty",
          "value": 2,
          "scope": "Handlungen gegen/nahe Auslöser +2 Erschwernis"
        }
      ],
      "sourceLine": 272,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-panisch",
      "name": "Panisch",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "muss Bewegung vom Auslöser weg nutzen; andere Handlungen +4; Dauer 3 Runden",
      "modules": [],
      "sourceLine": 273,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-terrorisiert",
      "name": "Terrorisiert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Annäherung 0; Reaktion 0; Dauer 1 Runde, danach Panisch",
      "modules": [],
      "sourceLine": 274,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-mutig",
      "name": "Mutig",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Furcht- und Einschüchterungsproben +2 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Furcht- und Einschüchterungsproben",
          "operation": "bonus",
          "value": 2,
          "scope": "Furcht- und Einschüchterungsproben +2 Bonus"
        }
      ],
      "sourceLine": 275,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-beruhigt",
      "name": "Beruhigt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Ängstlich/Panisch/Zornig um eine Stufe reduziert; aggressive Handlungen +1",
      "modules": [],
      "sourceLine": 276,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-inspiriert",
      "name": "Inspiriert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "drei Anwendungen: eine gewählte Probe erhält +2 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "drei Anwendungen: eine gewählte Probe erhält",
          "operation": "bonus",
          "value": 2,
          "scope": "drei Anwendungen: eine gewählte Probe erhält +2 Bonus"
        }
      ],
      "sourceLine": 277,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-hoffnungsfroh",
      "name": "Hoffnungsfroh",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "mentale Widerstände +1; Schutzhandlungen +1",
      "modules": [],
      "sourceLine": 278,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-verzweifelt",
      "name": "Verzweifelt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "WL −2; Initiative −2; natürliche Regeneration −1",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WL",
          "operation": "add",
          "value": -2,
          "scope": "WL −2"
        },
        {
          "id": "module-2",
          "type": "counter-regen",
          "target": "*",
          "operation": "add",
          "value": -1,
          "scope": "Regeneration −1"
        },
        {
          "id": "module-3",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -2,
          "scope": "Initiative −2"
        }
      ],
      "sourceLine": 279,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-beschamt",
      "name": "Beschämt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "CR −1; soziale Proben +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "CR",
          "operation": "add",
          "value": -1,
          "scope": "CR −1"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "soziale Proben",
          "operation": "difficulty",
          "value": 2,
          "scope": "soziale Proben +2 Erschwernis"
        }
      ],
      "sourceLine": 280,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-zornig",
      "name": "Zornig",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Nahkampfschaden +1; Verteidigung −1; soziale Proben +2",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "defense",
          "operation": "add",
          "value": -1,
          "scope": "Verteidigung −1"
        }
      ],
      "sourceLine": 281,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-rasend",
      "name": "Rasend",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "muss nächstes/festgelegtes Ziel angreifen; Verteidigung −2; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "defense",
          "operation": "add",
          "value": -2,
          "scope": "Verteidigung −2"
        }
      ],
      "sourceLine": 282,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-berserk",
      "name": "Berserk",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "ST +2; KS +1; Nahkampfschaden +2; Verteidigung −2; Konzentration 0",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "ST",
          "operation": "add",
          "value": 2,
          "scope": "ST +2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "KS",
          "operation": "add",
          "value": 1,
          "scope": "KS +1"
        },
        {
          "id": "module-3",
          "type": "derived",
          "target": "defense",
          "operation": "add",
          "value": -2,
          "scope": "Verteidigung −2"
        },
        {
          "id": "module-4",
          "type": "flag",
          "target": "concentration",
          "operation": "set",
          "value": 0,
          "scope": "Konzentration 0"
        }
      ],
      "sourceLine": 283,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-bezaubert",
      "name": "Bezaubert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "soziale Proben der Quelle +2 Bonus; WL gegen Bitten der Quelle −1",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "soziale Proben der Quelle",
          "operation": "bonus",
          "value": 2,
          "scope": "soziale Proben der Quelle +2 Bonus"
        }
      ],
      "sourceLine": 284,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-eingeschuchtert",
      "name": "Eingeschüchtert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Handlungen gegen Quelle +2 Erschwernis; Dauer Szene",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Handlungen gegen Quelle",
          "operation": "difficulty",
          "value": 2,
          "scope": "Handlungen gegen Quelle +2 Erschwernis"
        }
      ],
      "sourceLine": 285,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-misstrauisch",
      "name": "Misstrauisch",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Kooperation/Überreden +2 Erschwernis; Täuschung erkennen +1 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Kooperation/Überreden",
          "operation": "difficulty",
          "value": 2,
          "scope": "Kooperation/Überreden +2 Erschwernis"
        },
        {
          "id": "module-2",
          "type": "difficulty",
          "target": "Täuschung erkennen",
          "operation": "bonus",
          "value": 1,
          "scope": "Täuschung erkennen +1 Bonus"
        }
      ],
      "sourceLine": 286,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-paranoid",
      "name": "Paranoid",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Verbündetenhilfe 0; Freund-/Feinderkennung +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Freund-/Feinderkennung",
          "operation": "difficulty",
          "value": 2,
          "scope": "Freund-/Feinderkennung +2 Erschwernis"
        }
      ],
      "sourceLine": 287,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-verwirrt",
      "name": "Verwirrt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "zu Zugbeginn 1W3: 1 Handlung normal, 2 Ziel zufällig, 3 Aktion verloren",
      "modules": [],
      "sourceLine": 288,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-delirierend",
      "name": "Delirierend",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "WN −2; IN −2; Konzentration +4; Dauer 3 Runden",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -2,
          "scope": "WN −2"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "IN",
          "operation": "add",
          "value": -2,
          "scope": "IN −2"
        }
      ],
      "sourceLine": 289,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-fixiert",
      "name": "Fixiert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Handlungen außerhalb des Fokus +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Handlungen außerhalb des Fokus",
          "operation": "difficulty",
          "value": 2,
          "scope": "Handlungen außerhalb des Fokus +2 Erschwernis"
        }
      ],
      "sourceLine": 290,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-zwang",
      "name": "Zwang",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "festgelegte einfache Handlung muss zuerst versucht werden; WL-Probe +2 am Zugende",
      "modules": [],
      "sourceLine": 291,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-hypnotisiert",
      "name": "Hypnotisiert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Reaktion 0; Initiative −2; Störung erlaubt WL-Probe +2",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": -2,
          "scope": "Initiative −2"
        }
      ],
      "sourceLine": 292,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-beherrscht",
      "name": "Beherrscht",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Quelle bestimmt eine Aktion pro Zug; WL-Probe +4 am Zugende",
      "modules": [],
      "sourceLine": 293,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-wahrheitgebunden",
      "name": "Wahrheitgebunden",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "bewusste Lügen 0; Schweigen und Nichtwissen bleiben möglich",
      "modules": [],
      "sourceLine": 294,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-abgelenkt",
      "name": "Abgelenkt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "WN −1; Konzentration +2; Reaktion auf verborgene Gefahr 0",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WN",
          "operation": "add",
          "value": -1,
          "scope": "WN −1"
        }
      ],
      "sourceLine": 295,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-konzentriert",
      "name": "Konzentriert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "gewählte Probe +2 Bonus; jeder Schaden verlangt WL-Probe +2 oder Effekt endet",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "gewählte Probe",
          "operation": "bonus",
          "value": 2,
          "scope": "gewählte Probe +2 Bonus"
        }
      ],
      "sourceLine": 296,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-gedankengeschutzt",
      "name": "Gedankengeschützt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "mentale Widerstände +2; mentaler Schaden −2",
      "modules": [],
      "sourceLine": 297,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-erinnerung-beeintrachtigt",
      "name": "Erinnerung beeinträchtigt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "passende Wissens-/Erinnerungsproben +4 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "passende Wissens-/Erinnerungsproben",
          "operation": "difficulty",
          "value": 4,
          "scope": "passende Wissens-/Erinnerungsproben +4 Erschwernis"
        }
      ],
      "sourceLine": 298,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-identitat-gestort",
      "name": "Identität gestört",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "WL −1; CR −1; Konzentration und soziale Selbstdarstellung +2",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WL",
          "operation": "add",
          "value": -1,
          "scope": "WL −1"
        },
        {
          "id": "module-2",
          "type": "attribute",
          "target": "CR",
          "operation": "add",
          "value": -1,
          "scope": "CR −1"
        }
      ],
      "sourceLine": 299,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-traumbeeinflusst",
      "name": "Traumbeeinflusst",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Handlungen entgegen Traumthema +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Handlungen entgegen Traumthema",
          "operation": "difficulty",
          "value": 2,
          "scope": "Handlungen entgegen Traumthema +2 Erschwernis"
        }
      ],
      "sourceLine": 300,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-albtraumgeplagt",
      "name": "Albtraumgeplagt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "keine L-/A-/FO-Regeneration aus nächster Rast; nächste WL-Probe +2",
      "modules": [],
      "sourceLine": 301,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-geistverbunden",
      "name": "Geistverbunden",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "lautlose Kommunikation bis 20 Felder; keine Zahlenübertragung",
      "modules": [],
      "sourceLine": 302,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-besessen",
      "name": "Besessen",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Quelle kontrolliert eine Aktion pro 3 Runden; WL-Probe +4 verhindert Kontrolle; mentale Widerstände −2",
      "modules": [],
      "sourceLine": 303,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-seelisch-verunreinigt",
      "name": "Seelisch verunreinigt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Widerstand gegen Besessenheit/Todesmagie −2; durch Seelenwahrnehmung mit +2 erkennbar",
      "modules": [],
      "sourceLine": 304,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-seelengeschutzt",
      "name": "Seelengeschützt",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Widerstand gegen Furcht/Besessenheit/Seelenraub/Todesmagie +2",
      "modules": [],
      "sourceLine": 305,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-13-exorziert",
      "name": "Exorziert",
      "category": "Geist, Emotion und Rollenspielkontrolle",
      "section": 13,
      "mechanics": "Besessen endet; WL −1 und FO −1 für 1 Stunde",
      "modules": [
        {
          "id": "module-1",
          "type": "attribute",
          "target": "WL",
          "operation": "add",
          "value": -1,
          "scope": "WL −1"
        },
        {
          "id": "module-2",
          "type": "counter-current",
          "target": "FO",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "FO −1"
        }
      ],
      "sourceLine": 306,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-gesegnet",
      "name": "Gesegnet",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "eine festgelegte Probe oder Widerstandsart +2 Bonus; Dauer der Quelle",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "eine festgelegte Probe oder Widerstandsart",
          "operation": "bonus",
          "value": 2,
          "scope": "eine festgelegte Probe oder Widerstandsart +2 Bonus"
        }
      ],
      "sourceLine": 312,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-verflucht",
      "name": "Verflucht",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "ein festgelegter negativer Modulwert Stufe 2; Dauer bis Bannung oder Quelle endet",
      "modules": [],
      "sourceLine": 313,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-geweiht",
      "name": "Geweiht",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Widerstand gegen Finsternis/Untote/Dämonen +2; entsprechender Schaden −2",
      "modules": [],
      "sourceLine": 314,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-entweiht",
      "name": "Entweiht",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "heilige Widerstände −2; Finsternisproben gegen Ziel +2 Bonus",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Finsternisproben gegen Ziel",
          "operation": "bonus",
          "value": 2,
          "scope": "Finsternisproben gegen Ziel +2 Bonus"
        }
      ],
      "sourceLine": 315,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-magisch-geschutzt",
      "name": "Magisch geschützt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "gewählter magischer Schaden −2; passende Widerstände +2",
      "modules": [],
      "sourceLine": 316,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-magie-verstarkt",
      "name": "Magie verstärkt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "genau ein Wert: Schaden/Heilung/Schild/Dauer/Probe +2",
      "modules": [],
      "sourceLine": 317,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-magie-geschwacht",
      "name": "Magie geschwächt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "genau ein Wert: Schaden/Heilung/Schild/Dauer/Probe −2, mindestens 0",
      "modules": [],
      "sourceLine": 318,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-magie-unterdruckt",
      "name": "Magie unterdrückt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "verknüpfter Effekt hat keine Wirkung; Restdauer pausiert",
      "modules": [],
      "sourceLine": 319,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-magie-gebannt",
      "name": "Magie gebannt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "verknüpfter Effekt endet sofort",
      "modules": [],
      "sourceLine": 320,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-antimagisch-beeinflusst",
      "name": "Antimagisch beeinflusst",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Zauberproben +4 Erschwernis; neue magische Effekte Dauer maximal 1 Runde",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Zauberproben",
          "operation": "difficulty",
          "value": 4,
          "scope": "Zauberproben +4 Erschwernis"
        }
      ],
      "sourceLine": 321,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-konzentration-erforderlich",
      "name": "Konzentration erforderlich",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "bei Schaden WL-Probe +2; Misslingen beendet verknüpften Effekt",
      "modules": [],
      "sourceLine": 322,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-magisch-gebunden",
      "name": "Magisch gebunden",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Entfernung von Quelle maximal 10 Felder; Überschreitung beendet Effekt",
      "modules": [],
      "sourceLine": 323,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-kontrolliert",
      "name": "Kontrolliert",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Quelle gibt 1 einfachen Befehl pro Runde; WL-Probe +2 gegen widersprüchlichen Befehl",
      "modules": [],
      "sourceLine": 324,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-verwandelt",
      "name": "Verwandelt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "genau benannte Körperwerte werden ersetzt; keine automatische Übernahme von Wissen/Counter",
      "modules": [],
      "sourceLine": 325,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-lebensraub",
      "name": "Lebensraub",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Ziel L −1, Quelle L +1; maximal einmal pro Runde",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "L −1"
        },
        {
          "id": "module-2",
          "type": "counter-current",
          "target": "L",
          "operation": "add",
          "value": 1,
          "interval": "manual",
          "scope": "L +1"
        }
      ],
      "sourceLine": 326,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-vitalitat-geraubt",
      "name": "Vitalität geraubt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Ziel A oder FO −1, Quelle erhält denselben Counterpunkt bis normales Maximum",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-current",
          "target": "FO",
          "operation": "add",
          "value": -1,
          "interval": "manual",
          "scope": "FO −1"
        }
      ],
      "sourceLine": 327,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-regeneration-gehemmt",
      "name": "Regeneration gehemmt",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "natürliche Regeneration 0; jede andere Heilung −1",
      "modules": [
        {
          "id": "module-1",
          "type": "counter-regen",
          "target": "*",
          "operation": "set",
          "value": 0,
          "scope": "Regeneration 0"
        }
      ],
      "sourceLine": 328,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-offenbart",
      "name": "Offenbart",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Unsichtbar/Verhüllt/Verkleidet unterdrückt; Flüche/Bindungen sichtbar; Dauer 3 Runden",
      "modules": [],
      "sourceLine": 329,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-seelengebunden",
      "name": "Seelengebunden",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Schaden-/Entfernungs-/Kontrollverknüpfung nach ausgewähltem Modul; Standardreichweite 10 Felder",
      "modules": [],
      "sourceLine": 330,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-untot-kontrolliert",
      "name": "Untot kontrolliert",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "1 einfacher Befehl pro Runde; Widerstandsprobe +2 bei Selbstzerstörung",
      "modules": [],
      "sourceLine": 331,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-mutation",
      "name": "Mutation",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "ein körperlicher Grundwert +2 und ein anderer −2; Dauer der Quelle",
      "modules": [],
      "sourceLine": 332,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-14-korperliche-tarnung",
      "name": "Körperliche Tarnung",
      "category": "Allgemeine Magie und übernatürliche Zustände",
      "section": 14,
      "mechanics": "Verkleidungsproben +2; Berührung/Seelenwahrnehmung ignoriert Bonus",
      "modules": [],
      "sourceLine": 333,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-ausgerustet",
      "name": "Ausgerüstet",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "alle strukturierten Itemwerte aktiv; keine zusätzliche Zahl",
      "modules": [],
      "sourceLine": 339,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-mitgefuhrt",
      "name": "Mitgeführt",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "Gewicht aktiv; Kampf-/Rüstungsboni 0",
      "modules": [],
      "sourceLine": 340,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-eingelagert",
      "name": "Eingelagert",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "Gewicht am Charakter 0; aktive Itemeffekte 0",
      "modules": [],
      "sourceLine": 341,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-uberladen-stufe-1",
      "name": "Überladen Stufe 1",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "KS wirksam −1; Bewegung entsprechend neu berechnet",
      "modules": [],
      "sourceLine": 342,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-uberladen-stufe-2",
      "name": "Überladen Stufe 2",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "KS wirksam −2; Bewegung entsprechend neu berechnet",
      "modules": [],
      "sourceLine": 343,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-mindeststarke-unterschritten",
      "name": "Mindeststärke unterschritten",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "pro fehlendem ST-Punkt Waffen-/Rüstungsproben +1 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "pro fehlendem ST-Punkt Waffen-/Rüstungsproben",
          "operation": "difficulty",
          "value": 1,
          "scope": "pro fehlendem ST-Punkt Waffen-/Rüstungsproben +1 Erschwernis"
        }
      ],
      "sourceLine": 344,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-gegenstand-beschadigt",
      "name": "Gegenstand beschädigt",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "Schutz oder Schaden −1",
      "modules": [],
      "sourceLine": 345,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-gegenstand-schwer-beschadigt",
      "name": "Gegenstand schwer beschädigt",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "Schutz oder Schaden −2; bei 0 nicht nutzbar",
      "modules": [],
      "sourceLine": 346,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-waffe-vergiftet",
      "name": "Waffe vergiftet",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "nächster Treffer erzeugt Vergiftet Stufe 1; danach Effekt entfernt",
      "modules": [],
      "sourceLine": 347,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-gegenstand-verflucht",
      "name": "Gegenstand verflucht",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "verknüpfter Flucheffekt aktiv, solange gebunden oder bis gebannt",
      "modules": [],
      "sourceLine": 348,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-verkleidet",
      "name": "Verkleidet",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "soziale Tarnproben +2; Offenbart entfernt Bonus",
      "modules": [],
      "sourceLine": 349,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-getarnt",
      "name": "Getarnt",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "Entdeckungsproben gegen Ziel +2 Erschwernis",
      "modules": [
        {
          "id": "module-1",
          "type": "difficulty",
          "target": "Entdeckungsproben gegen Ziel",
          "operation": "difficulty",
          "value": 2,
          "scope": "Entdeckungsproben gegen Ziel +2 Erschwernis"
        }
      ],
      "sourceLine": 350,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    },
    {
      "id": "effect-15-wachsam",
      "name": "Wachsam",
      "category": "Ausrüstung und allgemeine eigene Effekte",
      "section": 15,
      "mechanics": "Überraschungsprobe +2; Initiative +1",
      "modules": [
        {
          "id": "module-1",
          "type": "derived",
          "target": "initiative",
          "operation": "add",
          "value": 1,
          "scope": "Initiative +1"
        }
      ],
      "sourceLine": 351,
      "duration": "source",
      "stacking": "defined-by-rule",
      "canonical": true
    }
  ]
};
