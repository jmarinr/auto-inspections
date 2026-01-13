import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useInspectionStore } from '../../stores/inspectionStore';
import { ProgressBar } from '../ui';
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
      // Just go back to start, don't reset
      // The data is persisted in localStorage
      window.location.hash = '/';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-950/95 backdrop-blur-sm border-b border-dark-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-dark-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="font-semibold text-white">{currentStepInfo?.title}</h1>
            <p className="text-xs text-dark-400">{currentStepInfo?.subtitle}</p>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <ProgressBar progress={progress} color="primary" />
            <span className="text-xs text-dark-400 whitespace-nowrap">
              {currentStep}/{totalSteps}
            </span>
          </div>
        </div>
      </header>

      {/* Step Indicators */}
      <div className="px-4 py-3 overflow-x-auto border-b border-dark-800/50">
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
                    : 'bg-dark-800 text-dark-400 border border-dark-700'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-dark-700 text-dark-400'
                }`}>
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
      <footer className="py-4 px-6 border-t border-dark-800 text-center">
        <p className="text-xs text-dark-500">
          © 2024 HenkanCX • Tu información está protegida
        </p>
      </footer>
    </div>
  );
};
