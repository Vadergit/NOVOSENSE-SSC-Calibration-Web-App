# NOVOSENSE SSC Calibration Web App · v0.5.0

[Web-App](https://vadergit.github.io/NOVOSENSE-SSC-Calibration-Web-App/) · [SSC Calibration Studio](https://vadergit.github.io/SSC-Calibration-Studio/)

Geführte Oberfläche nach ELMOS-Master: Original-Styles, Live-KPI-Kopf (ohne Chipwerte), Aufgabenkacheln und elf Schritte. Offline-Messplanung, ADC-Aussteuerung, allgemeine Druck-/Temperaturregression, Nachmessung, Ausgangsplanung, Brückenrechner, Rohdatei-Vorschau, manuelles Logging, Browserarchiv und Export. Klassische Seitennavigation und geführte Ansicht nutzen dieselbe Offline-Logik; der frühere lineare Rechner bleibt unter linear.html verfügbar.

**Experimentelle Hardware-Leseversion.** Web Serial + eigene I²C-Bridge für NSA2300 und NSA2860X, Register-Shadow, ADC/DSP-Lesen, Live und manuelle Referenzaufnahme. NSA2860X temporäre AFE-Einstellungen mit Readback. Kein permanentes Schreiben; keine Hardwarefreigabe. [Bridge-Anleitung](docs/BRIDGE.md). Quellen: [docs.html](docs.html), [UI-Master](docs/UI-MASTER.md).

Lokal: python3 -m http.server 8000. Tests: node --test tests/*.test.mjs.

Additional read-only models: NSA2302 and NSA2860. New firmware protocol NOVO-I2C-3; reflash required. No permanent programming.

Adapterauswahl für ESP32-C3, Pro Micro, EVM, CAL32 und NSA2302 EVAL; [Adapterkonzept und lokaler Dienst](docs/ADAPTERS.md). Experimentelle Originalboard-Diagnose, kein Produktionsbetrieb.

**v0.5.0 – Labortestkandidat NSA2860X**: [Testplan](docs/LAB-TEST.md), NOVO-I2C-5. Keine Produktionsfreigabe; manuelle Koeffizienten, abgesicherte RAM- und EEPROM-Testsequenz. Andere Modelle unverändert.
