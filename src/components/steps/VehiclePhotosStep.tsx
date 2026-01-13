import React, { useState, useRef } from 'react';
import { Camera, Check, Info, X, RotateCcw } from 'lucide-react';
import { Button, Card, Alert, Badge } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { compressImage, fileToBase64 } from '../../lib/imageUtils';
import type { VehiclePhoto } from '../../types';

interface PhotoCardProps {
  photo: VehiclePhoto;
  onClick: () => void;
  onCapture: (imageData: string) => void;
  onClear: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, onCapture, onClear }) => {
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
      <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 aspect-[4/3] group">
        <img
          src={photo.imageUrl}
          alt={photo.label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <div className="p-1 bg-emerald-500 rounded-full">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* Label */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white font-medium text-sm">{photo.label}</p>
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="ghost"
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
          bg-dark-800 border border-dark-600 rounded-xl aspect-[4/3] 
          flex flex-col items-center justify-center gap-2 p-4
          hover:border-primary-500 hover:bg-dark-700/50 transition-all
          ${isCapturing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        `}
      >
        <div className="relative">
          <div className="p-3 bg-dark-700 rounded-full">
            <Camera className="w-6 h-6 text-dark-400" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="absolute -top-1 -right-1 p-1 bg-dark-600 rounded-full hover:bg-dark-500"
          >
            <Info className="w-3 h-3 text-dark-300" />
          </button>
        </div>
        <div className="text-center">
          <p className="font-medium text-dark-200 text-sm">{photo.label}</p>
          <p className="text-xs text-dark-400">{photo.description}</p>
        </div>
        <Badge variant="neutral" size="sm">Pendiente</Badge>
      </button>
    </>
  );
};

export const VehiclePhotosStep: React.FC = () => {
  const { inspection, updateVehiclePhoto, nextStep, prevStep } = useInspectionStore();
  const [selectedPhoto, setSelectedPhoto] = useState<VehiclePhoto | null>(null);
  
  const photos = inspection.insuredVehicle?.photos || [];
  const capturedCount = photos.filter((p) => p.imageUrl).length;
  const totalPhotos = photos.length;
  const progress = Math.round((capturedCount / totalPhotos) * 100);

  const handlePhotoCapture = (photoId: string, imageData: string) => {
    updateVehiclePhoto('insured', photoId, {
      imageUrl: imageData,
      timestamp: new Date(),
    });
  };

  const handlePhotoClear = (photoId: string) => {
    updateVehiclePhoto('insured', photoId, {
      imageUrl: null,
      timestamp: undefined,
    });
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
      {/* Instructions */}
      <Alert variant="info" icon={<Camera className="w-5 h-5" />}>
        Toma 12 fotografías de tu vehículo siguiendo las indicaciones. 
        Asegúrate de tener buena iluminación y el vehículo completamente visible.
      </Alert>

      {/* Progress */}
      <Card padding="sm" className="flex items-center justify-between">
        <div>
          <p className="font-medium text-white">
            Fotos capturadas: {capturedCount} de {totalPhotos}
          </p>
          <p className="text-sm text-dark-400">
            {capturedCount === totalPhotos 
              ? '¡Todas las fotos completadas!' 
              : `Faltan ${totalPhotos - capturedCount} fotos`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-400">{progress}%</p>
        </div>
      </Card>

      {/* Exterior Photos */}
      <div>
        <h3 className="font-semibold text-white mb-4">Exterior del vehículo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {exteriorPhotos.map((photo) => (
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

      {/* Interior Photos */}
      <div>
        <h3 className="font-semibold text-white mb-4">Interior del vehículo</h3>
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
          className="fixed inset-0 bg-dark-950/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <Card className="max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedPhoto.label}</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 hover:bg-dark-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>
            <p className="text-dark-300 mb-4">{selectedPhoto.description}</p>
            <div className="bg-dark-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-dark-200 mb-2">Consejos:</h4>
              <ul className="text-sm text-dark-400 space-y-1">
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
          disabled={capturedCount < 8} // Minimum 8 photos required
        >
          {capturedCount < 8 
            ? `Faltan ${8 - capturedCount} fotos mínimas` 
            : 'Continuar a análisis IA'}
        </Button>
      </div>
    </div>
  );
};
