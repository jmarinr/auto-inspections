import React, { useState } from 'react';
import { 
  Check, Send, Download, Share2, User, Car, Camera, MapPin, 
  FileText, AlertTriangle, Loader2, CheckCircle2 
} from 'lucide-react';
import { Button, Card, Badge, Alert, Divider } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SummaryStep: React.FC = () => {
  const { inspection, updateInspection, prevStep, setStep, resetInspection } = useInspectionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Calculate stats
  const vehiclePhotos = inspection.insuredVehicle?.photos.filter(p => p.imageUrl).length || 0;
  const damagePhotos = inspection.insuredVehicle?.photos.filter(p => p.angle === 'damage' && p.imageUrl).length || 0;
  const scenePhotos = inspection.accidentScene?.photos.length || 0;
  const totalPhotos = vehiclePhotos + scenePhotos;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Generate submission ID
      const id = `INS-${Date.now().toString(36).toUpperCase()}`;
      setSubmissionId(id);
      
      updateInspection({
        status: 'submitted',
        submittedAt: new Date(),
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error al enviar la inspección. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    alert('Generando PDF...');
    // Here you would generate and download the PDF
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Inspección de Accidente',
        text: `Mi inspección de accidente ha sido completada. ID: ${submissionId}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`Inspección completada. ID: ${submissionId}`);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleNewInspection = () => {
    resetInspection();
  };

  // Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="p-6 bg-emerald-500/20 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Inspección enviada!
        </h2>
        <p className="text-dark-300 mb-6">
          Tu inspección ha sido recibida correctamente
        </p>

        <Card className="w-full max-w-md mb-6">
          <div className="text-center">
            <p className="text-sm text-dark-400 mb-1">Número de referencia</p>
            <p className="text-2xl font-mono font-bold text-primary-400">{submissionId}</p>
          </div>
          <Divider className="my-4" />
          <p className="text-sm text-dark-400 text-center">
            Guarda este número para dar seguimiento a tu reclamo. 
            Recibirás una notificación cuando tu inspección sea procesada.
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleDownloadPDF}
            leftIcon={<Download className="w-5 h-5" />}
          >
            Descargar PDF
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleShare}
            leftIcon={<Share2 className="w-5 h-5" />}
          >
            Compartir
          </Button>
        </div>

        <Button
          variant="ghost"
          className="mt-6"
          onClick={handleNewInspection}
        >
          Iniciar nueva inspección
        </Button>
      </div>
    );
  }

  // Submitting Screen
  if (isSubmitting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Loader2 className="w-16 h-16 text-primary-400 animate-spin mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">
          Enviando inspección...
        </h2>
        <p className="text-dark-400">
          Esto puede tomar unos segundos
        </p>
      </div>
    );
  }

  // Summary Screen
  return (
    <div className="space-y-6 animate-slide-up">
      <Alert variant="info" icon={<FileText className="w-5 h-5" />}>
        Revisa que toda la información sea correcta antes de enviar. 
        Puedes editar cualquier sección haciendo clic en ella.
      </Alert>

      {/* Overview Stats */}
      <Card>
        <h3 className="font-semibold text-white mb-4">Resumen de la inspección</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-dark-900/50 rounded-lg">
            <p className="text-2xl font-bold text-primary-400">{totalPhotos}</p>
            <p className="text-xs text-dark-400">Fotos totales</p>
          </div>
          <div className="p-3 bg-dark-900/50 rounded-lg">
            <p className="text-2xl font-bold text-amber-400">{damagePhotos}</p>
            <p className="text-xs text-dark-400">Fotos de daños</p>
          </div>
          <div className="p-3 bg-dark-900/50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-400">
              {inspection.hasThirdParty ? '1' : '0'}
            </p>
            <p className="text-xs text-dark-400">Terceros</p>
          </div>
        </div>
      </Card>

      {/* Identity Section */}
      <Card 
        className="cursor-pointer hover:border-primary-500/50 transition-colors"
        onClick={() => setStep(1)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-700 rounded-lg">
              <User className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Asegurado</h4>
              <p className="text-sm text-dark-400">
                {inspection.insuredPerson?.identity.extractedData?.fullName || 'Sin nombre'}
              </p>
            </div>
          </div>
          <Badge variant={inspection.insuredPerson?.identity.validated ? 'success' : 'warning'}>
            {inspection.insuredPerson?.identity.validated ? 'Verificado' : 'Revisar'}
          </Badge>
        </div>
      </Card>

      {/* Vehicle Section */}
      <Card 
        className="cursor-pointer hover:border-primary-500/50 transition-colors"
        onClick={() => setStep(3)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-700 rounded-lg">
              <Car className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Vehículo asegurado</h4>
              <p className="text-sm text-dark-400">
                {inspection.insuredVehicle?.brand} {inspection.insuredVehicle?.model} {inspection.insuredVehicle?.year}
                {inspection.insuredVehicle?.plate && ` • ${inspection.insuredVehicle.plate}`}
              </p>
            </div>
          </div>
          <Badge variant="success">
            <Check className="w-3 h-3" />
            Completo
          </Badge>
        </div>
      </Card>

      {/* Photos Section */}
      <Card 
        className="cursor-pointer hover:border-primary-500/50 transition-colors"
        onClick={() => setStep(4)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-700 rounded-lg">
              <Camera className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Fotografías</h4>
              <p className="text-sm text-dark-400">
                {vehiclePhotos} del vehículo • {damagePhotos} de daños
              </p>
            </div>
          </div>
          <Badge variant={vehiclePhotos >= 8 ? 'success' : 'warning'}>
            {vehiclePhotos >= 8 ? 'Completo' : 'Revisar'}
          </Badge>
        </div>
        
        {/* Photo thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {inspection.insuredVehicle?.photos
            .filter(p => p.imageUrl)
            .slice(0, 6)
            .map((photo) => (
              <img
                key={photo.id}
                src={photo.imageUrl!}
                alt={photo.label}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ))}
          {totalPhotos > 6 && (
            <div className="w-16 h-16 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm text-dark-300">+{totalPhotos - 6}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Third Party Section */}
      {inspection.hasThirdParty && (
        <Card 
          className="cursor-pointer hover:border-primary-500/50 transition-colors"
          onClick={() => setStep(6)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-dark-700 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Tercero involucrado</h4>
                <p className="text-sm text-dark-400">
                  {inspection.thirdPartyVehicle?.plate || 'Sin placa'} • 
                  {inspection.thirdPartyVehicle?.brand} {inspection.thirdPartyVehicle?.model}
                </p>
              </div>
            </div>
            <Badge variant="info">Registrado</Badge>
          </div>
        </Card>
      )}

      {/* Scene Section */}
      <Card 
        className="cursor-pointer hover:border-primary-500/50 transition-colors"
        onClick={() => setStep(7)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-700 rounded-lg">
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Escena del accidente</h4>
              <p className="text-sm text-dark-400 line-clamp-1">
                {inspection.accidentScene?.location.address || 'Sin dirección'}
              </p>
            </div>
          </div>
          <Badge variant="success">
            <Check className="w-3 h-3" />
            Completo
          </Badge>
        </div>
      </Card>

      {/* Timestamp */}
      <div className="text-center text-sm text-dark-400">
        Inspección iniciada: {format(inspection.createdAt, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
      </div>

      {/* Submit Actions */}
      <div className="space-y-3">
        <Button
          fullWidth
          onClick={handleSubmit}
          leftIcon={<Send className="w-5 h-5" />}
        >
          Enviar inspección
        </Button>
        
        <Button
          variant="secondary"
          fullWidth
          onClick={prevStep}
        >
          Volver a editar
        </Button>
      </div>
    </div>
  );
};
