# NOVOSENSE SSC Calibration Web App · v0.3.0

[Web-App](https://vadergit.github.io/NOVOSENSE-SSC-Calibration-Web-App/) · [SSC Calibration Studio](https://vadergit.github.io/SSC-Calibration-Studio/)

Geführte Oberfläche nach ELMOS-Master: Original-Styles, Live-KPI-Kopf (ohne Chipwerte), Aufgabenkacheln und elf Schritte. Offline-Messplanung, ADC-Aussteuerung, allgemeine Druck-/Temperaturregression, Nachmessung, Ausgangsplanung, Brückenrechner, Rohdatei-Vorschau, manuelles Logging, Browserarchiv und Export. Klassischer linearer Offline-Rechner separat erreichbar.

**Keine Hardwarefreigabe.** Kein USB-, RAM-, EEPROM- oder OTP-Zugriff. Keine ELMOS-Treiber übernommen. Live-Messung und Alarmregister gesperrt. Quellen: [docs.html](docs.html), [UI-Master](docs/UI-MASTER.md).

Lokal: python3 -m http.server 8000. Tests: node --test tests/*.test.mjs.
