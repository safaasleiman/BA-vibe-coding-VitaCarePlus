/**
 * Zyklomatische Komplexität Analyzer
 * 
 * Formel: M = E - N + 2C
 * - N = Anzahl der Knoten (Anweisungsblöcke)
 * - E = Anzahl der Kanten (Kontrollfluss-Übergänge)
 * - C = Anzahl der verbundenen Komponenten (meist 1 pro Funktion)
 * - M = Zyklomatische Komplexität
 * 
 * Vereinfachte Formel: M = Entscheidungspunkte + 1
 * 
 * Entscheidungspunkte:
 * - if, else if
 * - for, while, do-while
 * - switch case
 * - catch
 * - && (logisches UND)
 * - || (logisches ODER)
 * - ?: (ternärer Operator)
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
 * Berechnet die zyklomatische Komplexität
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

  // Vereinfachte Berechnung: M = Entscheidungspunkte + 1
  const cyclomaticComplexity = totalDecisionPoints + 1;

  // Für die erweiterte Formel M = E - N + 2C:
  // N (Knoten) ≈ Anzahl der Anweisungen (grobe Schätzung über Semikolons und Blöcke)
  const nodes = (code.match(/;/g) || []).length + 
                (code.match(/\{/g) || []).length;
  
  // E (Kanten) = N + Entscheidungspunkte (jede Entscheidung fügt eine Kante hinzu)
  const edges = nodes + totalDecisionPoints;
  
  // C (Komponenten) = 1 für einzelne Funktion/Datei
  const components = 1;

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
