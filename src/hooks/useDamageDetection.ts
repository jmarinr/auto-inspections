import { useState, useCallback } from 'react';

export interface DamageDetection {
  id: string;
  type: 'scratch' | 'dent' | 'crack' | 'broken' | 'paint' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  location: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DamageAnalysisResult {
  hasDamage: boolean;
  damages: DamageDetection[];
  overallSeverity: 'none' | 'minor' | 'moderate' | 'severe';
  confidence: number;
  recommendations: string[];
}

interface UseDamageDetectionResult {
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
  analyzeImage: (imageData: string) => Promise<DamageAnalysisResult>;
}

// Damage types in Spanish
const DAMAGE_TYPES: Record<DamageDetection['type'], string> = {
  scratch: 'Rayón',
  dent: 'Abolladura',
  crack: 'Grieta',
  broken: 'Rotura',
  paint: 'Daño de pintura',
  other: 'Otro daño',
};

const SEVERITY_LABELS: Record<DamageDetection['severity'], string> = {
  minor: 'Menor',
  moderate: 'Moderado',
  severe: 'Severo',
};

const LOCATIONS = [
  'Parachoques delantero',
  'Parachoques trasero',
  'Puerta delantera izquierda',
  'Puerta delantera derecha',
  'Puerta trasera izquierda',
  'Puerta trasera derecha',
  'Capó',
  'Maletero',
  'Panel lateral izquierdo',
  'Panel lateral derecho',
  'Espejo retrovisor',
  'Parabrisas',
  'Ventana lateral',
  'Faro delantero',
  'Faro trasero',
  'Llanta/Rin',
];

export function useDamageDetection(): UseDamageDetectionResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = useCallback(async (imageData: string): Promise<DamageAnalysisResult> => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate AI analysis phases
      // Phase 1: Loading image
      setProgress(10);
      await new Promise(r => setTimeout(r, 300));

      // Phase 2: Preprocessing
      setProgress(25);
      await new Promise(r => setTimeout(r, 400));

      // Phase 3: Running detection model
      setProgress(50);
      await new Promise(r => setTimeout(r, 600));

      // Phase 4: Analyzing results
      setProgress(75);
      await new Promise(r => setTimeout(r, 400));

      // Phase 5: Generating report
      setProgress(90);
      await new Promise(r => setTimeout(r, 300));

      // Analyze image characteristics to generate realistic results
      const result = await performAnalysis(imageData);

      setProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error analizando imagen';
      setError(errorMessage);
      return {
        hasDamage: false,
        damages: [],
        overallSeverity: 'none',
        confidence: 0,
        recommendations: [],
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    progress,
    error,
    analyzeImage,
  };
}

// Simulated AI analysis - In production, this would call a real ML model
async function performAnalysis(imageData: string): Promise<DamageAnalysisResult> {
  // Analyze image data to generate contextual results
  const imageSize = imageData.length;
  const hasHighVariance = imageSize > 50000; // Larger images often have more detail
  
  // Generate random but realistic damage detections
  const numDamages = hasHighVariance ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
  
  const damages: DamageDetection[] = [];
  const usedLocations = new Set<string>();
  
  for (let i = 0; i < numDamages; i++) {
    // Pick a random location that hasn't been used
    let location: string;
    do {
      location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    } while (usedLocations.has(location) && usedLocations.size < LOCATIONS.length);
    usedLocations.add(location);
    
    const types: DamageDetection['type'][] = ['scratch', 'dent', 'crack', 'paint', 'broken'];
    const severities: DamageDetection['severity'][] = ['minor', 'moderate', 'severe'];
    
    damages.push({
      id: `damage-${Date.now()}-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * (hasHighVariance ? 3 : 2))],
      location,
      confidence: 0.75 + Math.random() * 0.2,
      boundingBox: {
        x: Math.random() * 0.6 + 0.2,
        y: Math.random() * 0.6 + 0.2,
        width: Math.random() * 0.2 + 0.1,
        height: Math.random() * 0.2 + 0.1,
      },
    });
  }
  
  // Calculate overall severity
  let overallSeverity: DamageAnalysisResult['overallSeverity'] = 'none';
  if (damages.length > 0) {
    const severityScore = damages.reduce((acc, d) => {
      const scores = { minor: 1, moderate: 2, severe: 3 };
      return acc + scores[d.severity];
    }, 0) / damages.length;
    
    if (severityScore >= 2.5) overallSeverity = 'severe';
    else if (severityScore >= 1.5) overallSeverity = 'moderate';
    else overallSeverity = 'minor';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (damages.some(d => d.severity === 'severe')) {
    recommendations.push('Se recomienda evaluación presencial por un ajustador');
  }
  if (damages.some(d => d.type === 'crack' || d.type === 'broken')) {
    recommendations.push('Verificar funcionalidad de componentes afectados');
  }
  if (damages.length > 2) {
    recommendations.push('Considerar reporte de taller para cotización de reparación');
  }
  if (damages.length === 0) {
    recommendations.push('No se detectaron daños visibles en esta imagen');
  }
  
  return {
    hasDamage: damages.length > 0,
    damages,
    overallSeverity,
    confidence: damages.length > 0 ? 0.85 + Math.random() * 0.1 : 0.95,
    recommendations,
  };
}

// Export utility functions
export function getDamageTypeLabel(type: DamageDetection['type']): string {
  return DAMAGE_TYPES[type];
}

export function getSeverityLabel(severity: DamageDetection['severity']): string {
  return SEVERITY_LABELS[severity];
}

export function getSeverityColor(severity: DamageDetection['severity'] | 'none'): string {
  const colors = {
    none: 'text-emerald-400',
    minor: 'text-yellow-400',
    moderate: 'text-orange-400',
    severe: 'text-red-400',
  };
  return colors[severity];
}
