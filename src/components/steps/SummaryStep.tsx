import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Check, Send, Download, Share2, User, Car, Camera, MapPin, 
  FileText, AlertTriangle, Loader2, CheckCircle2, Shield, 
  BarChart3, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button, Card, Badge, Alert, Divider, Checkbox } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SummaryStep: React.FC = () => {
  const { inspection, updateInspection, updateConsent, prevStep, setStep, resetInspection } = useInspectionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  
  // Consent state
  const [accepted, setAccepted] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  // Calculate stats
  const vehiclePhotos = inspection.insuredVehicle?.photos.filter(p => p.imageUrl).length || 0;
  const damagePhotos = inspection.insuredVehicle?.photos.filter(p => p.angle === 'damage' && p.imageUrl).length || 0;
  const scenePhotos = inspection.accidentScene?.photos.length || 0;
  const totalPhotos = vehiclePhotos + scenePhotos;

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setHasSignature(false);
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setHasSignature(true);
    }
  };

  const handleSubmit = async () => {
    if (!accepted || !hasSignature || !signatureRef.current) return;
    
    setIsSubmitting(true);
    
    try {
      // Save consent data
      const signatureData = signatureRef.current.toDataURL('image/png');
      updateConsent({
        accepted: true,
        signatureUrl: signatureData,
        timestamp: new Date(),
      });

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
        
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          ¡Inspección enviada!
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Tu inspección ha sido recibida correctamente
        </p>

        <Card className="w-full max-w-md mb-6">
          <div className="text-center">
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Número de referencia</p>
            <p className="text-2xl font-mono font-bold text-primary-400">{submissionId}</p>
          </div>
          <Divider className="my-4" />
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
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
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Enviando inspección...
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Esto puede tomar unos segundos
        </p>
      </div>
    );
  }

  // Summary Screen with Consent
  return (
    <div className="space-y-6 animate-slide-up">
      <Alert variant="info" icon={<FileText className="w-5 h-5" />}>
        Revisa la información, acepta los términos y firma para enviar.
      </Alert>

      {/* Overview Stats */}
      <Card>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Resumen de la inspección
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
            <p className="text-2xl font-bold text-primary-400">{totalPhotos}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fotos totales</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
            <p className="text-2xl font-bold text-amber-400">{damagePhotos}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fotos de daños</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
            <p className="text-2xl font-bold text-emerald-400">
              {inspection.hasThirdParty ? '1' : '0'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Terceros</p>
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
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <User className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Conductor</h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <Car className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Vehículo</h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
        onClick={() => setStep(2)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <Camera className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Fotografías</h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--bg-input)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>+{totalPhotos - 6}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Third Party Section */}
      {inspection.hasThirdParty && (
        <Card 
          className="cursor-pointer hover:border-primary-500/50 transition-colors"
          onClick={() => setStep(5)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Tercero involucrado</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
        onClick={() => setStep(6)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Escena del accidente</h4>
              <p className="text-sm line-clamp-1" style={{ color: 'var(--text-muted)' }}>
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

      {/* Consent Section */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowTerms(!showTerms)}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Términos y consentimiento
            </h3>
          </div>
          {showTerms ? (
            <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>

        {/* Collapsible Terms */}
        {showTerms && (
          <div className="mt-4 animate-fade-in">
            <div 
              className="rounded-xl p-4 mb-4 max-h-48 overflow-y-auto text-sm"
              style={{ backgroundColor: 'var(--bg-input)' }}
            >
              <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                Al enviar esta inspección, autorizas a HenkanCX a:
              </p>
              <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  Procesar las fotografías mediante inteligencia artificial
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Almacenar temporalmente la información de tu inspección
                </li>
                <li className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  Compartir el reporte con tu aseguradora
                </li>
              </ul>
              <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                Tus datos serán eliminados después de 90 días. Declaro que la información proporcionada es verídica.
              </p>
            </div>
          </div>
        )}

        {/* Checkbox */}
        <div className="mt-4">
          <Checkbox
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            label={
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                He leído y acepto los términos de uso y autorizo el procesamiento de mis datos.
              </span>
            }
          />
        </div>
      </Card>

      {/* Signature - Only show when accepted */}
      {accepted && (
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Firma digital
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSignature}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Limpiar
            </Button>
          </div>
          
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Firma para confirmar tu consentimiento
          </p>

          <div 
            className="border-2 border-dashed rounded-xl overflow-hidden bg-white"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <SignatureCanvas
              ref={signatureRef}
              onEnd={handleSignatureEnd}
              canvasProps={{
                className: 'signature-pad w-full',
                style: { width: '100%', height: '150px' },
              }}
              backgroundColor="white"
              penColor="black"
            />
          </div>

          {!hasSignature && (
            <p className="text-sm mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
              Dibuja tu firma arriba ☝️
            </p>
          )}
        </Card>
      )}

      {/* Timestamp */}
      <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Inspección iniciada: {format(inspection.createdAt, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
      </div>

      {/* Submit Actions */}
      <div className="space-y-3">
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={!accepted || !hasSignature}
          leftIcon={<Send className="w-5 h-5" />}
        >
          {!accepted ? 'Acepta los términos para continuar' : 
           !hasSignature ? 'Firma para enviar' : 
           'Enviar inspección'}
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
