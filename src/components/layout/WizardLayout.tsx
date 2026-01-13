import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useInspectionStore } from '../../stores/inspectionStore';
import { ProgressBar, ThemeToggle } from '../ui';
import { WIZARD_STEPS } from '../../lib/constants';

interface WizardLayoutProps {
  children: React.ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({ children }) => {
  const { currentStep, prevStep } = useInspectionStore();

  // Don't show layout on start step (step 0)
  if (currentStep === 0) {
    return <>{children}</>;
  }

  const totalSteps = WIZARD_STEPS.length - 1; // Exclude start step
  const progress = (currentStep / totalSteps) * 100;
  const currentStepInfo = WIZARD_STEPS[currentStep];

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep();
    }
  };

  const handleClose = () => {
    if (confirm('¿Seguro que quieres salir? Tu progreso se guardará localmente.')) {
      window.location.hash = '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-40 backdrop-blur-sm"
        style={{ 
          backgroundColor: 'var(--bg-primary)', 
          borderBottom: '1px solid var(--border-color)' 
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentStepInfo?.title}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {currentStepInfo?.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleClose}
              className="p-2 -mr-2 transition-colors hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <ProgressBar progress={progress} color="primary" />
            <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              {currentStep}/{totalSteps}
            </span>
          </div>
        </div>
      </header>

      {/* Step Indicators */}
      <div 
        className="px-4 py-3 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex gap-2 min-w-max">
          {WIZARD_STEPS.slice(1).map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : ''
                }`}
                style={
                  !isActive && !isCompleted
                    ? { 
                        backgroundColor: 'var(--bg-input)', 
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)'
                      }
                    : undefined
                }
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : ''
                }`}
                style={
                  !isActive && !isCompleted
                    ? { backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }
                    : undefined
                }
                >
                  {isCompleted ? '✓' : stepNumber}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer 
        className="py-4 px-6 text-center"
        style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
      >
        <p className="text-xs">
          © 2024 HenkanCX • Tu información está protegida
        </p>
      </footer>
    </div>
  );
};
