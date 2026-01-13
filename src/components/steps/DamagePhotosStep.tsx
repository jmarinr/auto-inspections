import React, { useState, useRef } from 'react';
import { Camera, Check, AlertTriangle, X, Sparkles, Loader2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
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
      
      const newPhoto: DamagePhoto = {
        id: `damage-${Date.now()}`,
        imageUrl: base64,
        timestamp: new Date(),
      };
      
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

  const totalDamagesDetected = damagePhotos.reduce((acc, photo) => acc + (photo.analysis?.damages.length || 0), 0);

  const overallSeverity = damagePhotos.length > 0
    ? damagePhotos.some(p => p.analysis?.overallSeverity === 'severe') ? 'severe'
      : damagePhotos.some(p => p.analysis?.overallSeverity === 'moderate') ? 'moderate'
      : damagePhotos.some(p => p.analysis?.overallSeverity === 'minor') ? 'minor'
      : 'none'
    : 'none';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--hk-primary)' }}>
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Detección de daños</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>La IA analizará cada foto automáticamente</p>
          </div>
        </div>
        
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
            <p className={`text-xl font-bold ${getSeverityColor(overallSeverity)}`}>
              {overallSeverity === 'none' ? '—' : overallSeverity === 'minor' ? '!' : overallSeverity === 'moderate' ? '!!' : '!!!'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Severidad</p>
          </div>
        </div>
      </Card>

      {/* Processing */}
      {isAnalyzing && (
        <Card>
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--hk-primary)' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Analizando daños...</p>
              <ProgressBar progress={progress} />
            </div>
          </div>
        </Card>
      )}

      {/* Latest Analysis */}
      {currentAnalysis && !isAnalyzing && damagePhotos.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--hk-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Último análisis</span>
            <Badge variant="ai">{Math.round(currentAnalysis.confidence * 100)}%</Badge>
          </div>
          
          {currentAnalysis.hasDamage ? (
            <div className="flex flex-wrap gap-2">
              {currentAnalysis.damages.map((damage, idx) => (
                <Badge key={idx} variant={damage.severity === 'severe' ? 'warning' : 'info'}>
                  <AlertTriangle className="w-3 h-3" />
                  {getDamageTypeLabel(damage.type)} - {getSeverityLabel(damage.severity)}
                </Badge>
              ))}
            </div>
          ) : (
            <Alert variant="success" icon={<Check className="w-4 h-4" />}>
              No se detectaron daños en esta imagen
            </Alert>
          )}
        </Card>
      )}

      {/* Upload Button */}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
      
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isCapturing || isAnalyzing}
        className="w-full upload-zone"
      >
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hk-primary)' }}>
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Agregar foto de daño</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Análisis automático con IA</p>
        </div>
      </button>

      {/* Damage Photos List */}
      {damagePhotos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Fotos de daños ({damagePhotos.length})
          </h3>
          {damagePhotos.map((photo) => (
            <Card key={photo.id}>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedPhoto(expandedPhoto === photo.id ? null : photo.id)}
              >
                <div className="flex items-center gap-3">
                  <img src={photo.imageUrl} alt="Daño" className="w-14 h-14 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {photo.analysis?.damages.length || 0} daño(s)
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {photo.analysis?.overallSeverity === 'none' 
                        ? 'Sin daños' 
                        : `Severidad: ${getSeverityLabel(photo.analysis?.overallSeverity || 'minor')}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={photo.analysis?.hasDamage ? 'warning' : 'success'}>
                    {Math.round((photo.analysis?.confidence || 0) * 100)}%
                  </Badge>
                  {expandedPhoto === photo.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {expandedPhoto === photo.id && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <div className="relative rounded-lg overflow-hidden mb-4">
                    <img src={photo.imageUrl} alt="Daño" className="w-full rounded-lg" />
                    {photo.analysis?.damages.map((damage, idx) => (
                      damage.boundingBox && (
                        <div
                          key={idx}
                          className="damage-marker"
                          style={{ left: `${damage.boundingBox.x * 100}%`, top: `${damage.boundingBox.y * 100}%` }}
                        >
                          {idx + 1}
                        </div>
                      )
                    ))}
                  </div>

                  {photo.analysis?.damages && photo.analysis.damages.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {photo.analysis.damages.map((damage, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: damage.severity === 'severe' ? '#ef4444' : damage.severity === 'moderate' ? '#f59e0b' : '#eab308' }}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{getDamageTypeLabel(damage.type)}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{damage.location}</p>
                            </div>
                          </div>
                          <Badge variant={damage.severity === 'severe' ? 'warning' : 'info'}>{getSeverityLabel(damage.severity)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button variant="secondary" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); handleRemovePhoto(photo.id); }} leftIcon={<X className="w-4 h-4" />}>
                    Eliminar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {damagePhotos.length === 0 && (
        <Alert variant="info" icon={<AlertTriangle className="w-4 h-4" />}>
          Sin daños visibles, puedes continuar sin fotos.
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={prevStep}>Atrás</Button>
        <Button fullWidth onClick={nextStep}>
          {damagePhotos.length > 0 ? `Continuar (${totalDamagesDetected} daños)` : 'Continuar sin daños'}
        </Button>
      </div>
    </div>
  );
};
