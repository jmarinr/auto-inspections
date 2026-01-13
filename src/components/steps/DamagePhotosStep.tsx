import React, { useState, useRef } from 'react';
import { Camera, Plus, Trash2, AlertTriangle, ZoomIn } from 'lucide-react';
import { Button, Card, Alert, Badge } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { compressImage, fileToBase64 } from '../../lib/imageUtils';
import { v4 as uuidv4 } from 'uuid';
import type { VehiclePhoto } from '../../types';

export const DamagePhotosStep: React.FC = () => {
  const { inspection, addVehiclePhoto, updateVehiclePhoto, nextStep, prevStep } = useInspectionStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get damage photos (photos with angle 'damage')
  const damagePhotos = inspection.insuredVehicle?.photos.filter((p) => p.angle === 'damage') || [];

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    try {
      const compressed = await compressImage(file, { maxSizeMB: 0.8 });
      const base64 = await fileToBase64(compressed);

      const newPhoto: VehiclePhoto = {
        id: uuidv4(),
        angle: 'damage',
        label: `Daño ${damagePhotos.length + 1}`,
        description: 'Foto de daño',
        imageUrl: base64,
        timestamp: new Date(),
      };

      addVehiclePhoto('insured', newPhoto);
    } catch (error) {
      console.error('Error processing photo:', error);
    } finally {
      setIsCapturing(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    updateVehiclePhoto('insured', photoId, { imageUrl: null });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Instructions */}
      <Alert variant="warning" icon={<AlertTriangle className="w-5 h-5" />}>
        <strong>Documenta todos los daños visibles.</strong> Toma fotos de cerca de cada área 
        dañada del vehículo. Estas fotos son cruciales para el proceso de reclamo.
      </Alert>

      {/* Stats */}
      <Card padding="sm" className="flex items-center justify-between">
        <div>
          <p className="font-medium text-white">
            Fotos de daños: {damagePhotos.filter(p => p.imageUrl).length}
          </p>
          <p className="text-sm text-dark-400">
            Se recomienda al menos 3-5 fotos de cada área dañada
          </p>
        </div>
        <Badge variant={damagePhotos.filter(p => p.imageUrl).length >= 3 ? 'success' : 'warning'}>
          {damagePhotos.filter(p => p.imageUrl).length >= 3 ? 'Suficientes' : 'Agregar más'}
        </Badge>
      </Card>

      {/* Photo Grid */}
      <div>
        <h3 className="font-semibold text-white mb-4">Fotos de daños capturadas</h3>
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleAddPhoto}
          className="hidden"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Existing photos */}
          {damagePhotos.filter(p => p.imageUrl).map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-xl overflow-hidden border border-dark-600 aspect-square group"
            >
              <img
                src={photo.imageUrl!}
                alt={photo.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Actions */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingPhoto(photo.imageUrl)}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Label */}
              <div className="absolute top-2 left-2">
                <Badge variant="neutral" size="sm">{photo.label}</Badge>
              </div>
            </div>
          ))}

          {/* Add Photo Button */}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isCapturing}
            className={`
              bg-dark-800 border-2 border-dashed border-dark-500 rounded-xl aspect-square
              flex flex-col items-center justify-center gap-3
              hover:border-primary-500 hover:bg-dark-700/50 transition-all
              ${isCapturing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            `}
          >
            <div className="p-4 bg-dark-700 rounded-full">
              <Plus className="w-8 h-8 text-primary-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-dark-200">Agregar foto</p>
              <p className="text-xs text-dark-400">de daño</p>
            </div>
          </button>
        </div>
      </div>

      {/* Tips */}
      <Card>
        <h4 className="font-medium text-white mb-3">Consejos para fotos de daños:</h4>
        <ul className="space-y-2 text-sm text-dark-400">
          <li className="flex items-start gap-2">
            <Camera className="w-4 h-4 mt-0.5 text-primary-400" />
            Toma fotos desde diferentes ángulos de cada daño
          </li>
          <li className="flex items-start gap-2">
            <Camera className="w-4 h-4 mt-0.5 text-primary-400" />
            Incluye una foto general y luego acercamientos
          </li>
          <li className="flex items-start gap-2">
            <Camera className="w-4 h-4 mt-0.5 text-primary-400" />
            Documenta abolladuras, rayones, vidrios rotos, etc.
          </li>
          <li className="flex items-start gap-2">
            <Camera className="w-4 h-4 mt-0.5 text-primary-400" />
            Asegúrate de que los daños sean claramente visibles
          </li>
        </ul>
      </Card>

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 bg-dark-950/95 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <img
            src={viewingPhoto}
            alt="Vista ampliada"
            className="max-w-full max-h-full object-contain rounded-xl"
          />
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
          disabled={damagePhotos.filter(p => p.imageUrl).length < 1}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};
