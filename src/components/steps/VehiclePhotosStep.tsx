import React, { useState, useRef } from 'react';
import { Camera, Check, Info, X, RotateCcw, Sparkles, Loader2, Car, Zap } from 'lucide-react';
import { Button, Card, Alert, Badge, ProgressBar } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { useVehicleOCR } from '../../hooks/useVehicleOCR';
import { compressImage, fileToBase64 } from '../../lib/imageUtils';
import type { VehiclePhoto } from '../../types';

interface PhotoCardProps {
  photo: VehiclePhoto;
  onClick: () => void;
  onCapture: (imageData: string) => void;
  onClear: () => void;
  isPlatePhoto?: boolean;
  plateDetected?: string | null;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ 
  photo, onClick, onCapture, onClear, isPlatePhoto, plateDetected 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    try {
      const compressed = await compressImage(file, { maxSizeMB: 0.8 });
      const base64 = await fileToBase64(compressed);
      onCapture(base64);
    } catch (error) {
      console.error('Error processing photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  if (photo.imageUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 aspect-[4/3] group">
        <img
          src={photo.imageUrl}
          alt={photo.label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* AI Badge for plate photo */}
        {isPlatePhoto && plateDetected && (
          <div className="absolute top-2 left-2">
            <Badge variant="ai" className="text-xs">
              <Zap className="w-3 h-3" />
              {plateDetected}
            </Badge>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <div className="p-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* Label */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white font-medium text-sm drop-shadow-lg">{photo.label}</p>
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Retomar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
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
        disabled={isCapturing}
        className={`
          rounded-2xl aspect-[4/3] 
          flex flex-col items-center justify-center gap-2 p-4
          transition-all duration-300
          ${isCapturing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
        style={{
          background: 'var(--gradient-card)',
          border: '2px dashed var(--border-light)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--hk-magenta)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(236, 72, 153, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-light)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div className="relative">
          <div 
            className="p-3 rounded-full"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Camera className="w-6 h-6 text-white" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="absolute -top-1 -right-1 p-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--bg-card-solid)' }}
          >
            <Info className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="text-center">
          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{photo.label}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{photo.description}</p>
        </div>
        {isPlatePhoto && (
          <Badge variant="ai" className="text-xs">
            <Sparkles className="w-3 h-3" />
            OCR Auto
          </Badge>
        )}
      </button>
    </>
  );
};

export const VehiclePhotosStep: React.FC = () => {
  const { inspection, updateVehiclePhoto, updateInsuredVehicle, nextStep, prevStep } = useInspectionStore();
  const { isProcessing: isOCRProcessing, progress: ocrProgress, extractPlate } = useVehicleOCR();
  const [selectedPhoto, setSelectedPhoto] = useState<VehiclePhoto | null>(null);
  const [detectedPlate, setDetectedPlate] = useState<string | null>(
    inspection.insuredVehicle?.plate || null
  );
  const [ocrComplete, setOcrComplete] = useState(false);
  
  const photos = inspection.insuredVehicle?.photos || [];
  const capturedCount = photos.filter((p) => p.imageUrl).length;
  const totalPhotos = photos.length;
  const progress = Math.round((capturedCount / totalPhotos) * 100);

  const handlePhotoCapture = async (photoId: string, imageData: string) => {
    updateVehiclePhoto('insured', photoId, {
      imageUrl: imageData,
      timestamp: new Date(),
    });

    // Auto-run OCR on plate photo (rear view)
    const photo = photos.find(p => p.id === photoId);
    if (photo?.angle === 'rear' && !detectedPlate) {
      try {
        const result = await extractPlate(imageData, inspection.country);
        if (result.plate) {
          setDetectedPlate(result.plate);
          setOcrComplete(true);
          // Save to vehicle data
          updateInsuredVehicle({ plate: result.plate });
        }
      } catch (error) {
        console.error('OCR error:', error);
      }
    }
  };

  const handlePhotoClear = (photoId: string) => {
    updateVehiclePhoto('insured', photoId, {
      imageUrl: null,
      timestamp: undefined,
    });
    
    // Clear plate if clearing rear photo
    const photo = photos.find(p => p.id === photoId);
    if (photo?.angle === 'rear') {
      setDetectedPlate(null);
      setOcrComplete(false);
    }
  };

  const handleShowInfo = (photo: VehiclePhoto) => {
    setSelectedPhoto(photo);
  };

  // Group photos by category
  const exteriorPhotos = photos.filter((p) => 
    ['front', 'front_45_left', 'left', 'rear_45_left', 'rear', 'rear_45_right', 'right', 'front_45_right'].includes(p.angle)
  );
  const interiorPhotos = photos.filter((p) => 
    ['dashboard', 'interior_front', 'interior_rear', 'trunk'].includes(p.angle)
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* AI Header Card */}
      <div className="ai-detection-box">
        <div className="ai-detection-content">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="p-2 rounded-xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Captura inteligente de vehículo
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                La IA extraerá automáticamente la placa
              </p>
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card">
              <p className="stat-value">{capturedCount}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fotos</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">{progress}%</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Progreso</p>
            </div>
            <div className="stat-card">
              <p className={`text-2xl font-bold ${detectedPlate ? 'text-emerald-400' : 'text-amber-400'}`}>
                {detectedPlate ? '✓' : '—'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Placa</p>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Processing State */}
      {isOCRProcessing && (
        <Card className="animate-pulse-glow">
          <div className="flex items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Detectando placa con IA...
              </p>
              <ProgressBar progress={ocrProgress} color="primary" />
            </div>
          </div>
        </Card>
      )}

      {/* Plate Detected Success */}
      {detectedPlate && ocrComplete && !isOCRProcessing && (
        <Alert variant="success" icon={<Sparkles className="w-5 h-5" />}>
          <div>
            <span className="font-semibold">¡Placa detectada! </span>
            <span className="font-mono text-lg">{detectedPlate}</span>
          </div>
        </Alert>
      )}

      {/* Exterior Photos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Exterior del vehículo
          </h3>
          <Badge variant={exteriorPhotos.filter(p => p.imageUrl).length >= 6 ? 'success' : 'warning'}>
            {exteriorPhotos.filter(p => p.imageUrl).length}/{exteriorPhotos.length}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {exteriorPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => handleShowInfo(photo)}
              onCapture={(data) => handlePhotoCapture(photo.id, data)}
              onClear={() => handlePhotoClear(photo.id)}
              isPlatePhoto={photo.angle === 'rear'}
              plateDetected={photo.angle === 'rear' ? detectedPlate : null}
            />
          ))}
        </div>
      </div>

      {/* Interior Photos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Interior del vehículo
          </h3>
          <Badge variant={interiorPhotos.filter(p => p.imageUrl).length >= 2 ? 'success' : 'warning'}>
            {interiorPhotos.filter(p => p.imageUrl).length}/{interiorPhotos.length}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {interiorPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => handleShowInfo(photo)}
              onCapture={(data) => handlePhotoCapture(photo.id, data)}
              onClear={() => handlePhotoClear(photo.id)}
            />
          ))}
        </div>
      </div>

      {/* Photo Info Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(15, 10, 31, 0.95)' }}
          onClick={() => setSelectedPhoto(null)}
        >
          <Card className="max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedPhoto.label}
              </h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {selectedPhoto.description}
            </p>
            <div 
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--bg-input)' }}
            >
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Consejos:
              </h4>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>• Asegúrate de que el vehículo esté bien iluminado</li>
                <li>• Mantén la cámara estable</li>
                <li>• Incluye todo el área indicada en la foto</li>
                <li>• Evita reflejos y sombras</li>
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={prevStep}>
          Atrás
        </Button>
        <Button
          fullWidth
          onClick={nextStep}
          disabled={capturedCount < 8}
          leftIcon={capturedCount >= 8 ? <Sparkles className="w-5 h-5" /> : undefined}
        >
          {capturedCount < 8 
            ? `Faltan ${8 - capturedCount} fotos mínimas` 
            : 'Continuar'}
        </Button>
      </div>
    </div>
  );
};
