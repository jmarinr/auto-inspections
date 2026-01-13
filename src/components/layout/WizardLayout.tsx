import React from 'react';
import { ChevronLeft, X, Sparkles } from 'lucide-react';
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

  const totalSteps = WIZARD_STEPS.length - 1;
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
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ 
          backgroundColor: 'rgba(15, 10, 31, 0.8)', 
          borderBottom: '1px solid var(--border-color)' 
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl transition-all hover:bg-white/10"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <h1 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {currentStepInfo?.title}
              </h1>
              {(currentStep === 1 || currentStep === 2 || currentStep === 4) && (
                <span className="badge-ai text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  IA
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {currentStepInfo?.subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={handleClose}
              className="p-2 -mr-2 rounded-xl transition-all hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar progress={progress} color="primary" />
            </div>
            <span 
              className="text-xs font-medium whitespace-nowrap px-2 py-1 rounded-lg"
              style={{ 
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)' 
              }}
            >
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
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-sm 
                  transition-all duration-300
                  ${isActive ? 'shadow-lg shadow-primary-500/30' : ''}
                `}
                style={
                  isActive
                    ? { 
                        background: 'var(--gradient-primary)',
                        color: 'white',
                      }
                    : isCompleted
                    ? { 
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#6ee7b7',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }
                    : { 
                        backgroundColor: 'var(--bg-input)', 
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)'
                      }
                }
              >
                <span 
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center 
                    text-xs font-bold
                  `}
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(255,255,255,0.3)' }
                      : isCompleted
                      ? { backgroundColor: 'rgba(16, 185, 129, 0.3)' }
                      : { backgroundColor: 'var(--border-color)' }
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
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Powered by</span>
          <span 
            className="font-semibold px-2 py-0.5 rounded"
            style={{ 
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            HenkanCX
          </span>
          <span>• Tu información está protegida</span>
        </div>
      </footer>
    </div>
  );
};
