# NOVOSENSE SSC Calibration Web App · v0.2.0

[Web-App](https://vadergit.github.io/NOVOSENSE-SSC-Calibration-Web-App/) · [SSC Calibration Studio](https://vadergit.github.io/SSC-Calibration-Studio/)

Offline-Laborversion. Standard: geführte Ansicht nach ELMOS-Ablauf; klassische lineare Ansicht weiterhin verfügbar. Messkonzept 2–4 Druckpunkte und 1–3 Temperaturbedingungen, manuelle oder synthetische Rohwerte, generisches Polynom, unabhängige Offline-Prüfung mit Abweichungsgrafik und Toleranz, AFE-Aussteuerungsrechner, JSON/CSV und Druckbericht. Separate NSA2300-2P1T-Gleichung ohne Registerkodierung.

**Keine Hardwarefreigabe.** Kein Schreiben in RAM, EEPROM oder OTP. Die generische Regression ist kein Ersatz für Herstellerkoeffizienten. Öffentliche Quellen und Freigabekriterien: [docs.html](docs.html). Private Bibliotheksdateien wurden nicht veröffentlicht.

Lokal: `python3 -m http.server 8000 --bind 127.0.0.1`; Browser: http://127.0.0.1:8000/. Tests: `node --test tests/*.test.mjs`. URL-Parameter `model` bleibt kompatibel mit dem Studio.
