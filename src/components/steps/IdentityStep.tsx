import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, User, CreditCard, Calendar, Loader2 } from 'lucide-react';
import { Button, Card, Badge, ProgressBar, ImageUploader, Alert } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { useOCR } from '../../hooks/useOCR';
import { COUNTRIES } from '../../lib/constants';

export const IdentityStep: React.FC = () => {
  const { inspection, updateInsuredIdentity, nextStep, prevStep } = useInspectionStore();
  const { isProcessing, progress, error: ocrError, extractIdData } = useOCR();
  
  const [frontImage, setFrontImage] = useState<string | null>(
    inspection.insuredPerson?.identity.frontImage || null
  );
  const [backImage, setBackImage] = useState<string | null>(
    inspection.insuredPerson?.identity.backImage || null
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);

  const country = COUNTRIES.find((c) => c.code === inspection.country);
  const identityData = inspection.insuredPerson?.identity;

  // Auto-extract data when both images are uploaded
  useEffect(() => {
    const extractData = async () => {
      if (frontImage && backImage && !extractionComplete && !isExtracting) {
        setIsExtracting(true);
        try {
          const result = await extractIdData(frontImage, backImage, inspection.country);
          
          updateInsuredIdentity({
            frontImage,
            backImage,
            extractedData: result.data,
            confidence: result.confidence,
            validated: result.confidence >= 0.7,
          });
          
          setExtractionComplete(true);
        } catch (err) {
          console.error('Error extracting data:', err);
        } finally {
          setIsExtracting(false);
        }
      }
    };

    extractData();
  }, [frontImage, backImage]);

  const handleFrontImage = (imageData: string) => {
    setFrontImage(imageData);
    setExtractionComplete(false);
  };

  const handleBackImage = (imageData: string) => {
    setBackImage(imageData);
    setExtractionComplete(false);
  };

  const handleContinue = () => {
    nextStep();
  };

  const confidencePercent = Math.round((identityData?.confidence || 0) * 100);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Instructions Alert */}
      <Alert variant="info" icon={<CreditCard className="w-5 h-5" />}>
        Sube una foto de tu <strong>{country?.idDocumentName || 'documento de identidad'}</strong> (frente y reverso).
        La información se extraerá automáticamente.
      </Alert>

      {/* Upload Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Front ID */}
        <Card>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-400" />
            Frente del documento
          </h3>
          <ImageUploader
            onImageCapture={handleFrontImage}
            previewImage={frontImage}
            label="Foto frontal"
            description={`${country?.idDocumentName || 'Documento'} - lado del frente`}
            disabled={isProcessing || isExtracting}
          />
        </Card>

        {/* Back ID */}
        <Card>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-400" />
            Reverso del documento
          </h3>
          <ImageUploader
            onImageCapture={handleBackImage}
            previewImage={backImage}
            label="Foto reverso"
            description={`${country?.idDocumentName || 'Documento'} - lado de atrás`}
            disabled={isProcessing || isExtracting}
          />
        </Card>
      </div>

      {/* Processing State */}
      {(isProcessing || isExtracting) && (
        <Card className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Procesando documento...
          </h3>
          <p className="text-dark-400 mb-4">
            Extrayendo información con IA
          </p>
          <ProgressBar progress={progress} showLabel color="primary" />
        </Card>
      )}

      {/* Extracted Data Display */}
      {extractionComplete && identityData?.extractedData && (
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                identityData.validated ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Documento procesado con éxito
                </h3>
                <p className="text-sm text-dark-400">
                  Verifica que la información sea correcta
                </p>
              </div>
            </div>
            <Badge variant={confidencePercent >= 80 ? 'success' : 'warning'}>
              Confianza: {confidencePercent}%
            </Badge>
          </div>

          {/* Extracted Fields */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-dark-300">Datos detectados:</h4>
            <div className="flex flex-wrap gap-3">
              {identityData.extractedData.fullName && (
                <Badge variant="info">
                  <User className="w-3 h-3" />
                  Nombre: {identityData.extractedData.fullName}
                </Badge>
              )}
              {identityData.extractedData.idNumber && (
                <Badge variant="info">
                  <CreditCard className="w-3 h-3" />
                  ID: {identityData.extractedData.idNumber}
                </Badge>
              )}
              {identityData.extractedData.expiryDate && (
                <Badge variant="info">
                  <Calendar className="w-3 h-3" />
                  Vence: {identityData.extractedData.expiryDate}
                </Badge>
              )}
            </div>
          </div>

          {/* Low confidence warning */}
          {confidencePercent < 80 && (
            <Alert variant="warning" icon={<AlertCircle className="w-5 h-5" />} className="mt-4">
              La precisión de la extracción es baja. Por favor verifica los datos manualmente
              o intenta tomar una foto más clara del documento.
            </Alert>
          )}
        </Card>
      )}

      {/* OCR Error */}
      {ocrError && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          Error al procesar el documento: {ocrError}
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="secondary" onClick={prevStep}>
          Atrás
        </Button>
        <Button
          fullWidth
          onClick={handleContinue}
          disabled={!frontImage || !backImage || isProcessing || isExtracting}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};
