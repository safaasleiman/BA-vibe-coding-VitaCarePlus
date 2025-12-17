# Zyklomatische Komplexität - Analysebericht

## Formel

**M = E - N + 2C**

| Symbol | Bedeutung | Beschreibung |
|--------|-----------|--------------|
| **N** | Knoten | Anweisungsblöcke (geschätzt über `;` und `{`) |
| **E** | Kanten | Kontrollfluss-Übergänge = N + Entscheidungspunkte |
| **C** | Komponenten | Verbundene Komponenten (1 pro Datei) |
| **M** | Komplexität | Zyklomatische Komplexität = Entscheidungspunkte + 1 |

## Entscheidungspunkte

- `if` - Bedingte Verzweigung
- `else if` - Alternative Verzweigung
- `for` - For-Schleife
- `while` - While-Schleife
- `case` - Switch-Case
- `catch` - Fehlerbehandlung
- `&&` - Logisches UND
- `||` - Logisches ODER
- `?:` - Ternärer Operator

---

## Hauptdateien Analyse

### 1. Dashboard.tsx (692 Zeilen)

| Metrik | Wert |
|--------|------|
| `if` | 27 |
| `else if` | 0 |
| `for` | 2 |
| `while` | 0 |
| `case` | 0 |
| `catch` | 4 |
| `&&` | 45 |
| `||` | 12 |
| `?:` | 38 |
| **Entscheidungspunkte** | **128** |
| **N (Knoten)** | ~580 |
| **E (Kanten)** | ~708 |
| **C (Komponenten)** | 1 |
| **M (Komplexität)** | **129** |

**Bewertung:** 🔴 Sehr Hoch - Refactoring empfohlen

---

### 2. Landing.tsx (247 Zeilen)

| Metrik | Wert |
|--------|------|
| `if` | 2 |
| `else if` | 0 |
| `for` | 0 |
| `while` | 0 |
| `case` | 0 |
| `catch` | 0 |
| `&&` | 0 |
| `||` | 0 |
| `?:` | 0 |
| **Entscheidungspunkte** | **2** |
| **N (Knoten)** | ~120 |
| **E (Kanten)** | ~122 |
| **C (Komponenten)** | 1 |
| **M (Komplexität)** | **3** |

**Bewertung:** 🟢 Niedrig - Gut testbar

---

### 3. Auth.tsx (282 Zeilen)

| Metrik | Wert |
|--------|------|
| `if` | 5 |
| `else if` | 0 |
| `for` | 0 |
| `while` | 0 |
| `case` | 0 |
| `catch` | 2 |
| `&&` | 3 |
| `||` | 2 |
| `?:` | 6 |
| **Entscheidungspunkte** | **18** |
| **N (Knoten)** | ~180 |
| **E (Kanten)** | ~198 |
| **C (Komponenten)** | 1 |
| **M (Komplexität)** | **19** |

**Bewertung:** 🟡 Moderat - Noch wartbar

---

### 4. VaccinationList.tsx (289 Zeilen)

| Metrik | Wert |
|--------|------|
| `if` | 8 |
| `else if` | 0 |
| `for` | 1 |
| `while` | 0 |
| `case` | 0 |
| `catch` | 2 |
| `&&` | 18 |
| `||` | 4 |
| `?:` | 5 |
| **Entscheidungspunkte** | **38** |
| **N (Knoten)** | ~200 |
| **E (Kanten)** | ~238 |
| **C (Komponenten)** | 1 |
| **M (Komplexität)** | **39** |

**Bewertung:** 🟠 Hoch - Schwer zu testen

---

## Zusammenfassung

| Datei | M | N | E | C | Bewertung |
|-------|---|---|---|---|-----------|
| Dashboard.tsx | 129 | 580 | 708 | 1 | 🔴 Sehr Hoch |
| VaccinationList.tsx | 39 | 200 | 238 | 1 | 🟠 Hoch |
| Auth.tsx | 19 | 180 | 198 | 1 | 🟡 Moderat |
| Landing.tsx | 3 | 120 | 122 | 1 | 🟢 Niedrig |

### Gesamtstatistik (4 Hauptdateien)

| Metrik | Wert |
|--------|------|
| **Gesamte Knoten (N)** | 1.080 |
| **Gesamte Kanten (E)** | 1.266 |
| **Komponenten (C)** | 4 |
| **Durchschnittliche Komplexität** | 47,5 |
| **Gesamtkomplexität (M)** | 190 |

---

## Bewertungsskala

| Komplexität | Bewertung | Empfehlung |
|-------------|-----------|------------|
| 1-10 | 🟢 Niedrig | Einfacher Code, gut testbar |
| 11-20 | 🟡 Moderat | Mäßig komplex, noch wartbar |
| 21-50 | 🟠 Hoch | Komplex, schwer zu testen |
| 51+ | 🔴 Sehr Hoch | Refactoring dringend empfohlen |

---

## Empfehlungen

### Dashboard.tsx (M=129)
1. **Aufteilen in kleinere Komponenten:**
   - Filter-Logik in Custom Hook auslagern (`useFilteredData`)
   - Tab-Content in separate Komponenten extrahieren
   - Reminder-Logik in eigenen Hook (`useReminders`)

2. **Conditional Rendering reduzieren:**
   - Frühzeitige Returns verwenden
   - Render-Funktionen für komplexe UI-Blöcke

### VaccinationList.tsx (M=39)
1. Filter- und Sortierlogik in Utility-Funktionen auslagern
2. Loading/Empty-States als separate Komponenten

---

## Automatische Analyse-Tools

Für zukünftige Analysen empfehle ich:

```bash
# ESLint Complexity Rule
npx eslint --rule 'complexity: ["error", 10]' src/

# Plato Report (visuell)
npx es6-plato -r -d report src/

# Code Climate CLI
codeclimate analyze src/
```

---

*Generiert am: 17. Dezember 2024*
