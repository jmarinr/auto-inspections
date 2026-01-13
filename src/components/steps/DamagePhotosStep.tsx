import React, { useState, useRef } from 'react';
import { 
  Camera, Check, AlertTriangle, X, Sparkles, Loader2, 
  Zap, ShieldAlert, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Button, Card, Alert, Badge, ProgressBar } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { useDamageDetection, getDamageTypeLabel, getSeverityLabel, getSeverityColor } from '../../hooks/useDamageDetection';
import { compressImage, fileToBase64 } from '../../lib/imageUtils';
import type { DamageAnalysisResult } from '../../hooks/useDamageDetection';

interface DamagePhoto {
  id: string;
  imageUrl: string;
  timestamp: Date;
  analysis?: DamageAnalysisResult;
}

export const DamagePhotosStep: React.FC = () => {
  const { nextStep, prevStep } = useInspectionStore();
  const { isAnalyzing, progress, analyzeImage } = useDamageDetection();
  
  const [damagePhotos, setDamagePhotos] = useState<DamagePhoto[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<DamageAnalysisResult | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    try {
      const compressed = await compressImage(file, { maxSizeMB: 0.8 });
      const base64 = await fileToBase64(compressed);
      
      // Create new photo entry
      const newPhoto: DamagePhoto = {
        id: `damage-${Date.now()}`,
        imageUrl: base64,
        timestamp: new Date(),
      };
      
      // Run AI analysis
      const analysis = await analyzeImage(base64);
      newPhoto.analysis = analysis;
      setCurrentAnalysis(analysis);
      
      setDamagePhotos(prev => [...prev, newPhoto]);
    } catch (error) {
      console.error('Error processing photo:', error);
    } finally {
      setIsCapturing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setDamagePhotos(prev => prev.filter(p => p.id !== photoId));
    if (expandedPhoto === photoId) setExpandedPhoto(null);
  };

  const totalDamagesDetected = damagePhotos.reduce(
    (acc, photo) => acc + (photo.analysis?.damages.length || 0), 
    0
  );

  const overallSeverity = damagePhotos.length > 0
    ? damagePhotos.some(p => p.analysis?.overallSeverity === 'severe') ? 'severe'
      : damagePhotos.some(p => p.analysis?.overallSeverity === 'moderate') ? 'moderate'
      : damagePhotos.some(p => p.analysis?.overallSeverity === 'minor') ? 'minor'
      : 'none'
    : 'none';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* AI Analysis Header */}
      <div className="ai-detection-box">
        <div className="ai-detection-content">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-2 rounded-xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Detección de daños con IA
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Toma fotos de los daños para análisis automático
              </p>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card">
              <p className="stat-value">{damagePhotos.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fotos</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">{totalDamagesDetected}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daños</p>
            </div>
            <div className="stat-card">
              <p className={`text-2xl font-bold ${getSeverityColor(overallSeverity)}`}>
                {overallSeverity === 'none' ? '—' : 
                 overallSeverity === 'minor' ? '!' :
                 overallSeverity === 'moderate' ? '!!' : '!!!'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Severidad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isAnalyzing && (
        <Card className="animate-pulse-glow">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
              <Zap className="w-4 h-4 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Analizando imagen con IA...
              </p>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                Detectando daños, rayones y abolladuras
              </p>
              <ProgressBar progress={progress} color="primary" />
            </div>
          </div>
        </Card>
      )}

      {/* Latest Analysis Result */}
      {currentAnalysis && !isAnalyzing && damagePhotos.length > 0 && (
        <Card className="border-primary-500/50 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Último análisis IA
            </h4>
            <Badge variant="ai">
              {Math.round(currentAnalysis.confidence * 100)}% confianza
            </Badge>
          </div>
          
          {currentAnalysis.hasDamage ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {currentAnalysis.damages.map((damage, idx) => (
                  <Badge 
                    key={idx} 
                    variant={damage.severity === 'severe' ? 'warning' : 
                             damage.severity === 'moderate' ? 'warning' : 'info'}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {getDamageTypeLabel(damage.type)} - {getSeverityLabel(damage.severity)}
                  </Badge>
                ))}
              </div>
              {currentAnalysis.recommendations.length > 0 && (
                <div 
                  className="rounded-lg p-3 text-sm"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Recomendaciones:
                  </p>
                  <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                    {currentAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Alert variant="success" icon={<Check className="w-5 h-5" />}>
              No se detectaron daños visibles en esta imagen
            </Alert>
          )}
        </Card>
      )}

      {/* Capture Button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isCapturing || isAnalyzing}
        className="w-full upload-zone"
        style={{ minHeight: '140px' }}
      >
        <div 
          className="p-4 rounded-full"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Camera className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Agregar foto de daño
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            La IA analizará automáticamente el daño
          </p>
        </div>
        <Badge variant="ai">
          <Sparkles className="w-3 h-3" />
          Análisis automático
        </Badge>
      </button>

      {/* Captured Damage Photos */}
      {damagePhotos.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Fotos de daños ({damagePhotos.length})
          </h3>
          <div className="space-y-4">
            {damagePhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                {/* Photo Header */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedPhoto(expandedPhoto === photo.id ? null : photo.id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={photo.imageUrl}
                      alt="Daño"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {photo.analysis?.damages.length || 0} daño(s) detectado(s)
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Severidad: {photo.analysis?.overallSeverity === 'none' 
                          ? 'Ninguna' 
                          : getSeverityLabel(photo.analysis?.overallSeverity || 'minor')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      photo.analysis?.overallSeverity === 'severe' ? 'warning' :
                      photo.analysis?.overallSeverity === 'moderate' ? 'warning' : 
                      photo.analysis?.hasDamage ? 'info' : 'success'
                    }>
                      {Math.round((photo.analysis?.confidence || 0) * 100)}%
                    </Badge>
                    {expandedPhoto === photo.id ? (
                      <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPhoto === photo.id && (
                  <div className="mt-4 pt-4 animate-fade-in" style={{ borderTop: '1px solid var(--border-color)' }}>
                    {/* Full Image with damage markers */}
                    <div className="relative rounded-xl overflow-hidden mb-4">
                      <img
                        src={photo.imageUrl}
                        alt="Daño"
                        className="w-full rounded-xl"
                      />
                      {/* Damage markers overlay */}
                      {photo.analysis?.damages.map((damage, idx) => (
                        damage.boundingBox && (
                          <div
                            key={idx}
                            className="damage-marker"
                            style={{
                              left: `${damage.boundingBox.x * 100}%`,
                              top: `${damage.boundingBox.y * 100}%`,
                            }}
                            title={`${getDamageTypeLabel(damage.type)}: ${damage.location}`}
                          >
                            {idx + 1}
                          </div>
                        )
                      ))}
                    </div>

                    {/* Damage List */}
                    {photo.analysis?.damages && photo.analysis.damages.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {photo.analysis.damages.map((damage, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--bg-input)' }}
                          >
                            <div className="flex items-center gap-3">
                              <span 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: 
                                  damage.severity === 'severe' ? '#ef4444' :
                                  damage.severity === 'moderate' ? '#f59e0b' : '#eab308'
                                }}
                              >
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                  {getDamageTypeLabel(damage.type)}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                  {damage.location}
                                </p>
                              </div>
                            </div>
                            <Badge variant={
                              damage.severity === 'severe' ? 'warning' :
                              damage.severity === 'moderate' ? 'warning' : 'info'
                            }>
                              {getSeverityLabel(damage.severity)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Remove button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(photo.id);
                      }}
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Eliminar foto
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No damage option */}
      {damagePhotos.length === 0 && (
        <Alert variant="info" icon={<AlertTriangle className="w-5 h-5" />}>
          Si no hay daños visibles, puedes continuar sin agregar fotos de daños.
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={prevStep}>
          Atrás
        </Button>
        <Button
          fullWidth
          onClick={nextStep}
          leftIcon={<Sparkles className="w-5 h-5" />}
        >
          {damagePhotos.length > 0 
            ? `Continuar (${totalDamagesDetected} daños)` 
            : 'Continuar sin daños'}
        </Button>
      </div>
    </div>
  );
};
