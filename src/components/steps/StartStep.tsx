import React, { useState } from 'react';
import { Shield, Clock, Sparkles, MessageCircle, ArrowRight, Zap, Car } from 'lucide-react';
import { Button, Input, Select, Card, ThemeToggle } from '../ui';
import { useInspectionStore } from '../../stores/inspectionStore';
import { COUNTRIES, ACCIDENT_TYPES } from '../../lib/constants';
import type { AccidentType } from '../../types';

export const StartStep: React.FC = () => {
  const { initInspection } = useInspectionStore();
  const [plateOrVin, setPlateOrVin] = useState('');
  const [country, setCountry] = useState('PA');
  const [accidentType, setAccidentType] = useState<AccidentType>('collision');
  const [policyNumber, setPolicyNumber] = useState('');

  const handleStart = () => {
    initInspection(country, accidentType);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola, necesito realizar una inspección de accidente');
    window.open(`https://wa.me/50764671392?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Header */}
      <div className="text-center py-12 px-6 relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
          }}
        />
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div 
              className="p-3 rounded-2xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Car className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 
                className="text-xl font-bold"
                style={{ 
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                HK Inspect
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>by HenkanCX</p>
            </div>
          </div>

          <h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Inspección vehicular
            <br />
            <span 
              style={{ 
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              inteligente en minutos
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
            Usa tu cámara. La IA completa el resto.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="floating-stat">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>5-10 min</span>
            </div>
            <div className="floating-stat">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>98% IA</span>
            </div>
            <div className="floating-stat">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 px-6 pb-8">
        <Card className="max-w-md mx-auto">
          {/* Policy/Claim Number (optional) */}
          <div className="mb-5">
            <Input
              label="Número de póliza o reclamo (opcional)"
              placeholder="Ej: POL-2024-001234"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
            />
          </div>

          {/* Plate or VIN */}
          <div className="mb-5">
            <Input
              label="Placa o VIN del vehículo"
              placeholder="Ej: ABC1234"
              value={plateOrVin}
              onChange={(e) => setPlateOrVin(e.target.value.toUpperCase())}
            />
          </div>

          {/* Country */}
          <div className="mb-5">
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
          <div className="mb-6">
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Tipo de siniestro
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ACCIDENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setAccidentType(type.value)}
                  className="p-3 rounded-xl transition-all duration-300 text-left"
                  style={{
                    background: accidentType === type.value 
                      ? 'var(--gradient-card)' 
                      : 'var(--bg-input)',
                    border: accidentType === type.value 
                      ? '2px solid var(--hk-magenta)' 
                      : '1px solid var(--border-color)',
                    boxShadow: accidentType === type.value 
                      ? '0 0 20px rgba(236, 72, 153, 0.2)' 
                      : 'none',
                  }}
                >
                  <span className="text-xl mr-2">{type.icon}</span>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {type.label}
                  </span>
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
            <Sparkles className="w-5 h-5" />
            Iniciar inspección IA
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
        </Card>
      </div>

      {/* Footer */}
      <div 
        className="py-6 px-6"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-center items-center gap-4 flex-wrap text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Encriptado</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span>IA avanzada</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>24/7 disponible</span>
            </div>
          </div>
          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            © 2024 HenkanCX. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
