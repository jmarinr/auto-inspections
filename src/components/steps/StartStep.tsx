import React, { useState } from 'react';
import { Shield, Clock, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { Button, Input, Select, Card } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { COUNTRIES, ACCIDENT_TYPES } from '../../lib/constants';
import type { AccidentType } from '../../types';

export const StartStep: React.FC = () => {
  const { initInspection } = useInspectionStore();
  const [plateOrVin, setPlateOrVin] = useState('');
  const [country, setCountry] = useState('MX');
  const [accidentType, setAccidentType] = useState<AccidentType>('collision');
  const [policyNumber, setPolicyNumber] = useState('');

  const handleStart = () => {
    initInspection(country, accidentType);
  };

  const handleWhatsApp = () => {
    // Open WhatsApp with a pre-filled message
    const message = encodeURIComponent('Hola, necesito realizar una inspección de accidente');
    window.open(`https://wa.me/+1234567890?text=${message}`, '_blank');
  };

  const handleContinue = () => {
    // Logic to continue from a saved inspection
    alert('Función de continuar inspección guardada');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Inspección de Accidentes
          <br />
          <span className="text-primary-400">en minutos</span>
        </h1>
        <p className="text-dark-300 text-lg">
          Usa tu cámara. IA completa el resto.
        </p>
      </div>

      {/* Main Form */}
      <div className="flex-1 px-6 pb-8">
        <Card className="max-w-md mx-auto">
          {/* Policy/Claim Number (optional) */}
          <div className="mb-6">
            <Input
              label="Número de póliza o reclamo (opcional)"
              placeholder="Ej: POL-2024-001234"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
            />
          </div>

          {/* Plate or VIN */}
          <div className="mb-6">
            <Input
              label="Placa o VIN del vehículo asegurado"
              placeholder={`Ej: ABC1234 o 1HGBH41JXMN109186`}
              value={plateOrVin}
              onChange={(e) => setPlateOrVin(e.target.value.toUpperCase())}
            />
          </div>

          {/* Country */}
          <div className="mb-6">
            <Select
              label="País"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              options={COUNTRIES.map((c) => ({
                value: c.code,
                label: `${c.flag} ${c.name}`,
              }))}
            />
          </div>

          {/* Accident Type */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-dark-200 mb-3">
              Tipo de siniestro
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ACCIDENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setAccidentType(type.value)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    accidentType === type.value
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-dark-600 bg-dark-800/50 text-dark-300 hover:border-dark-500'
                  }`}
                >
                  <span className="text-xl mr-2">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Button
            fullWidth
            onClick={handleStart}
            disabled={!plateOrVin}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Iniciar inspección
          </Button>

          {/* WhatsApp Option */}
          <Button
            variant="whatsapp"
            fullWidth
            className="mt-3"
            onClick={handleWhatsApp}
            leftIcon={<MessageCircle className="w-5 h-5" />}
          >
            Hacer por WhatsApp
          </Button>

          {/* Continue Saved */}
          <Button
            variant="secondary"
            fullWidth
            className="mt-3"
            onClick={handleContinue}
          >
            Continuar donde quedé
          </Button>
        </Card>
      </div>

      {/* Footer Features */}
      <div className="py-6 px-6 border-t border-dark-800">
        <div className="max-w-md mx-auto flex justify-between text-sm text-dark-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Seguro y encriptado</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>5-10 minutos</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>IA avanzada</span>
          </div>
        </div>
      </div>
    </div>
  );
};
