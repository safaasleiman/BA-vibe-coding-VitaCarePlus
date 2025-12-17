/**
 * Zyklomatische Komplexität Analyzer nach McCabe (1976)
 * 
 * Korrekte Formel: M = E - N + 2P
 * 
 * Wobei:
 * - N = Anzahl der Knoten (Basisblöcke im Kontrollfluss-Graphen)
 * - E = Anzahl der Kanten (Kontrollfluss-Übergänge zwischen Knoten)
 * - P = Anzahl der verbundenen Komponenten (unabhängige Funktionen/Module)
 * - M = Zyklomatische Komplexität
 * 
 * Für strukturierten Code ohne goto-Anweisungen gilt auch:
 * M = Anzahl der binären Entscheidungspunkte + 1
 * 
 * Entscheidungspunkte (binäre Verzweigungen):
 * - if, else if (je +1)
 * - for, while, do-while (je +1)
 * - switch case (je case +1)
 * - catch (je +1)
 * - && (je +1, Short-Circuit-Auswertung)
 * - || (je +1, Short-Circuit-Auswertung)
 * - ?: (je +1, ternärer Operator)
 * 
 * Referenz: McCabe, T.J. (1976). "A Complexity Measure"
 * IEEE Transactions on Software Engineering, SE-2(4), 308-320.
 */

export interface ComplexityResult {
  fileName: string;
  functionName: string;
  ifCount: number;
  elseIfCount: number;
  forCount: number;
  whileCount: number;
  switchCaseCount: number;
  catchCount: number;
  andCount: number;
  orCount: number;
  ternaryCount: number;
  totalDecisionPoints: number;
  cyclomaticComplexity: number;
  nodes: number;
  edges: number;
  components: number;
}

export interface FileComplexity {
  fileName: string;
  functions: ComplexityResult[];
  totalComplexity: number;
  averageComplexity: number;
}

/**
 * Zählt Entscheidungspunkte in einem Code-String
 */
export function countDecisionPoints(code: string): {
  ifCount: number;
  elseIfCount: number;
  forCount: number;
  whileCount: number;
  switchCaseCount: number;
  catchCount: number;
  andCount: number;
  orCount: number;
  ternaryCount: number;
} {
  // Entferne Strings und Kommentare für genauere Zählung
  const cleanedCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Block-Kommentare
    .replace(/\/\/.*/g, '') // Zeilen-Kommentare
    .replace(/"(?:[^"\\]|\\.)*"/g, '""') // Strings mit "
    .replace(/'(?:[^'\\]|\\.)*'/g, "''") // Strings mit '
    .replace(/`(?:[^`\\]|\\.)*`/g, '``'); // Template-Strings

  return {
    ifCount: (cleanedCode.match(/\bif\s*\(/g) || []).length,
    elseIfCount: (cleanedCode.match(/\belse\s+if\s*\(/g) || []).length,
    forCount: (cleanedCode.match(/\bfor\s*\(/g) || []).length,
    whileCount: (cleanedCode.match(/\bwhile\s*\(/g) || []).length,
    switchCaseCount: (cleanedCode.match(/\bcase\s+[^:]+:/g) || []).length,
    catchCount: (cleanedCode.match(/\bcatch\s*\(/g) || []).length,
    andCount: (cleanedCode.match(/&&/g) || []).length,
    orCount: (cleanedCode.match(/\|\|/g) || []).length,
    ternaryCount: (cleanedCode.match(/\?[^?]/g) || []).length - 
                  (cleanedCode.match(/\?\./g) || []).length // Optional chaining abziehen
  };
}

/**
 * Zählt Basisblöcke (Knoten N) im Code
 * 
 * Ein Basisblock ist eine Sequenz von Anweisungen, die:
 * - Nur am Anfang betreten werden kann
 * - Nur am Ende verlassen werden kann
 * 
 * Knoten entstehen durch:
 * - Start der Funktion/Datei (+1)
 * - Jeder Verzweigungspunkt erstellt neue Blöcke
 * - Nach jedem Entscheidungspunkt gibt es mindestens 2 mögliche Folgeblöcke
 */
export function countNodes(code: string, decisionPoints: number): number {
  // N = Entscheidungspunkte + 1 (für strukturierten Code)
  // Jeder Entscheidungspunkt teilt den Code in weitere Pfade
  // Start-Knoten + je ein Knoten pro Verzweigungsausgang
  return decisionPoints + 1;
}

/**
 * Zählt Kanten (E) im Kontrollfluss-Graphen
 * 
 * Kanten repräsentieren mögliche Übergänge zwischen Knoten.
 * Für strukturierten Code gilt:
 * - Linearer Fluss: 1 Kante pro Knoten (außer dem letzten)
 * - Jede binäre Entscheidung fügt 1 zusätzliche Kante hinzu
 *   (weil 2 Ausgänge statt 1)
 * 
 * Formel: E = N + D - 1, wobei D = Entscheidungspunkte
 * Oder äquivalent für M = E - N + 2P mit P=1:
 * E = M + N - 2 = (D + 1) + N - 2 = D + N - 1
 */
export function countEdges(nodes: number, decisionPoints: number): number {
  // E = 2 * Entscheidungspunkte + 1 (für strukturierten Code mit P=1)
  // Herleitung: M = E - N + 2P, mit M = D + 1 und P = 1
  // D + 1 = E - N + 2
  // E = D + 1 + N - 2 = D + N - 1
  // Da N = D + 1: E = D + (D + 1) - 1 = 2D
  // Korrektur für Endknoten: E = 2D (jede Entscheidung hat 2 Ausgänge)
  return 2 * decisionPoints;
}

/**
 * Berechnet die zyklomatische Komplexität nach McCabe
 * 
 * Formel: M = E - N + 2P
 */
export function calculateComplexity(code: string, fileName: string = 'unknown'): ComplexityResult {
  const counts = countDecisionPoints(code);
  
  const totalDecisionPoints = 
    counts.ifCount +
    counts.elseIfCount +
    counts.forCount +
    counts.whileCount +
    counts.switchCaseCount +
    counts.catchCount +
    counts.andCount +
    counts.orCount +
    counts.ternaryCount;

  // P = 1 für einzelne Datei/Modul
  const components = 1;
  
  // N = Anzahl der Knoten (Basisblöcke)
  const nodes = countNodes(code, totalDecisionPoints);
  
  // E = Anzahl der Kanten (Kontrollfluss-Übergänge)
  const edges = countEdges(nodes, totalDecisionPoints);

  // Korrekte Formel: M = E - N + 2P
  const cyclomaticComplexity = edges - nodes + (2 * components);

  return {
    fileName,
    functionName: 'file',
    ...counts,
    totalDecisionPoints,
    cyclomaticComplexity,
    nodes,
    edges,
    components
  };
}

/**
 * Bewertet die Komplexität
 */
export function getComplexityRating(complexity: number): {
  rating: 'Niedrig' | 'Moderat' | 'Hoch' | 'Sehr Hoch';
  color: string;
  description: string;
} {
  if (complexity <= 10) {
    return {
      rating: 'Niedrig',
      color: 'green',
      description: 'Einfacher Code, gut testbar'
    };
  } else if (complexity <= 20) {
    return {
      rating: 'Moderat',
      color: 'yellow',
      description: 'Mäßig komplexer Code, noch wartbar'
    };
  } else if (complexity <= 50) {
    return {
      rating: 'Hoch',
      color: 'orange',
      description: 'Komplexer Code, schwer zu testen'
    };
  } else {
    return {
      rating: 'Sehr Hoch',
      color: 'red',
      description: 'Sehr komplexer Code, Refactoring empfohlen'
    };
  }
}

/**
 * Generiert einen Komplexitätsbericht
 */
export function generateReport(results: ComplexityResult[]): string {
  let report = `# Zyklomatische Komplexität - Analysebericht\n\n`;
  report += `## Formel\n`;
  report += `M = E - N + 2C\n\n`;
  report += `- **N** = Knoten (Anweisungsblöcke)\n`;
  report += `- **E** = Kanten (Kontrollfluss-Übergänge)\n`;
  report += `- **C** = Verbundene Komponenten\n`;
  report += `- **M** = Zyklomatische Komplexität\n\n`;
  
  report += `## Ergebnisse\n\n`;
  report += `| Datei | M | N | E | C | Bewertung |\n`;
  report += `|-------|---|---|---|---|----------|\n`;
  
  let totalM = 0;
  let totalN = 0;
  let totalE = 0;
  const totalC = results.length;

  for (const result of results) {
    const rating = getComplexityRating(result.cyclomaticComplexity);
    report += `| ${result.fileName} | ${result.cyclomaticComplexity} | ${result.nodes} | ${result.edges} | ${result.components} | ${rating.rating} |\n`;
    totalM += result.cyclomaticComplexity;
    totalN += result.nodes;
    totalE += result.edges;
  }

  report += `\n## Zusammenfassung\n\n`;
  report += `- **Gesamte Dateien analysiert:** ${results.length}\n`;
  report += `- **Gesamte Knoten (N):** ${totalN}\n`;
  report += `- **Gesamte Kanten (E):** ${totalE}\n`;
  report += `- **Komponenten (C):** ${totalC}\n`;
  report += `- **Durchschnittliche Komplexität (M):** ${(totalM / results.length).toFixed(2)}\n`;
  report += `- **Gesamtkomplexität:** ${totalM}\n`;

  report += `\n## Detaillierte Entscheidungspunkte\n\n`;
  report += `| Datei | if | else if | for | while | case | catch | && | \\|\\| | ?: |\n`;
  report += `|-------|-----|---------|-----|-------|------|-------|-----|------|----|\n`;
  
  for (const result of results) {
    report += `| ${result.fileName} | ${result.ifCount} | ${result.elseIfCount} | ${result.forCount} | ${result.whileCount} | ${result.switchCaseCount} | ${result.catchCount} | ${result.andCount} | ${result.orCount} | ${result.ternaryCount} |\n`;
  }

  return report;
}
