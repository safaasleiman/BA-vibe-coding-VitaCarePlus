# Zyklomatische Komplexität - Analysebericht

## Formel nach McCabe (1976)

**M = E - N + 2P**

| Symbol | Bedeutung | Beschreibung |
|--------|-----------|--------------|
| **M** | Zyklomatische Komplexität | Anzahl der linear unabhängigen Pfade |
| **E** | Edges (Kanten) | Kontrollfluss-Übergänge im CFG |
| **N** | Nodes (Knoten) | Basisblöcke im Kontrollfluss-Graphen |
| **P** | Connected Components | Unabhängige Funktionen/Module (meist 1) |

### Äquivalente Formel für strukturierten Code

Für Code ohne goto-Anweisungen gilt auch:
**M = D + 1** (wobei D = Anzahl der binären Entscheidungspunkte)

### Herleitung

Für strukturierten Code mit P = 1:
- N = D + 1 (Knoten = Entscheidungspunkte + 1)
- E = 2D (jede binäre Entscheidung hat 2 Ausgangskanten)
- M = E - N + 2P = 2D - (D + 1) + 2 = D + 1 ✓

### Entscheidungspunkte (D)

| Konstrukt | Beitrag zu D |
|-----------|--------------|
| `if` | +1 |
| `else if` | +1 |
| `for` | +1 |
| `while` | +1 |
| `case` (in switch) | +1 pro case |
| `catch` | +1 |
| `&&` | +1 (Short-Circuit) |
| `\|\|` | +1 (Short-Circuit) |
| `?:` | +1 (Ternär) |

---

## Ergebnisse der Analyse

### 1. Dashboard.tsx

| Entscheidungspunkt | Anzahl |
|--------------------|--------|
| if | 32 |
| else if | 2 |
| for | 0 |
| while | 0 |
| case | 0 |
| catch | 8 |
| && | 45 |
| \|\| | 12 |
| ?: | 29 |
| **Gesamt (D)** | **128** |

**Berechnung mit M = E - N + 2P:**
- D = 128 (Entscheidungspunkte)
- N = D + 1 = 129 (Knoten)
- E = 2D = 256 (Kanten)
- P = 1 (Komponente)
- **M = 256 - 129 + 2(1) = 129**

**Bewertung:** 🔴 Sehr Hoch (M > 50)

---

### 2. Landing.tsx

| Entscheidungspunkt | Anzahl |
|--------------------|--------|
| if | 0 |
| else if | 0 |
| for | 0 |
| while | 0 |
| case | 0 |
| catch | 0 |
| && | 1 |
| \|\| | 0 |
| ?: | 0 |
| **Gesamt (D)** | **1** |

**Berechnung mit M = E - N + 2P:**
- D = 1
- N = D + 1 = 2
- E = 2D = 2
- P = 1
- **M = 2 - 2 + 2(1) = 2**

**Bewertung:** 🟢 Niedrig (M ≤ 10)

---

### 3. Auth.tsx

| Entscheidungspunkt | Anzahl |
|--------------------|--------|
| if | 7 |
| else if | 1 |
| for | 0 |
| while | 0 |
| case | 0 |
| catch | 2 |
| && | 5 |
| \|\| | 3 |
| ?: | 1 |
| **Gesamt (D)** | **19** |

**Berechnung mit M = E - N + 2P:**
- D = 19
- N = D + 1 = 20
- E = 2D = 38
- P = 1
- **M = 38 - 20 + 2(1) = 20**

**Bewertung:** 🟡 Moderat (10 < M ≤ 20)

---

### 4. VaccinationList.tsx

| Entscheidungspunkt | Anzahl |
|--------------------|--------|
| if | 12 |
| else if | 0 |
| for | 0 |
| while | 0 |
| case | 0 |
| catch | 3 |
| && | 18 |
| \|\| | 5 |
| ?: | 15 |
| **Gesamt (D)** | **53** |

**Berechnung mit M = E - N + 2P:**
- D = 53
- N = D + 1 = 54
- E = 2D = 106
- P = 1
- **M = 106 - 54 + 2(1) = 54**

**Bewertung:** 🔴 Sehr Hoch (M > 50)

---

## Zusammenfassung

| Datei | D | N | E | P | M = E - N + 2P | Bewertung |
|-------|---|---|---|---|----------------|-----------|
| Dashboard.tsx | 128 | 129 | 256 | 1 | **129** | 🔴 Sehr Hoch |
| VaccinationList.tsx | 53 | 54 | 106 | 1 | **54** | 🔴 Sehr Hoch |
| Auth.tsx | 19 | 20 | 38 | 1 | **20** | 🟡 Moderat |
| Landing.tsx | 1 | 2 | 2 | 1 | **2** | 🟢 Niedrig |

### Gesamtstatistik

| Metrik | Wert |
|--------|------|
| **Analysierte Dateien** | 4 |
| **Gesamte Entscheidungspunkte (ΣD)** | 201 |
| **Gesamte Knoten (ΣN)** | 205 |
| **Gesamte Kanten (ΣE)** | 402 |
| **Durchschnittliche Komplexität** | 51.25 |
| **Maximale Komplexität** | 129 (Dashboard.tsx) |

---

## Bewertungsskala

| Bereich | Bewertung | Empfehlung |
|---------|-----------|------------|
| M ≤ 10 | 🟢 Niedrig | Einfacher, gut testbarer Code |
| 10 < M ≤ 20 | 🟡 Moderat | Akzeptabel, überschaubare Komplexität |
| 20 < M ≤ 50 | 🟠 Hoch | Refactoring empfohlen |
| M > 50 | 🔴 Sehr Hoch | Dringendes Refactoring erforderlich |

---

## Empfehlungen

### Dashboard.tsx (M = 129)
1. **Hook-Extraktion:** Datenlade-Logik in Custom Hooks auslagern
2. **Komponenten aufteilen:** Tabs in separate Komponenten
3. **Conditional Rendering reduzieren:** Frühe Returns und Guard Clauses

### VaccinationList.tsx (M = 54)
1. **Logik extrahieren:** Filter/Sort-Logik in eigene Funktionen
2. **Sub-Komponenten:** VaccinationCard, VaccinationFilters erstellen
3. **Zustandsmanagement:** useReducer statt mehrerer useState

---

## Referenz

McCabe, T.J. (1976). "A Complexity Measure". IEEE Transactions on Software Engineering, SE-2(4), 308-320.

---

*Generiert am: 17. Dezember 2024*
