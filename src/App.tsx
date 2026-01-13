import React from 'react';
import { useInspectionStore } from './stores/inspectionStore';
import { WizardLayout } from './components/layout';
import {
  StartStep,
  IdentityStep,
  ConsentStep,
  VehicleDataStep,
  VehiclePhotosStep,
  DamagePhotosStep,
  ThirdPartyStep,
  SceneStep,
  SummaryStep,
} from './components/steps';

const App: React.FC = () => {
  const { currentStep } = useInspectionStore();

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StartStep />;
      case 1:
        return <IdentityStep />;
      case 2:
        return <ConsentStep />;
      case 3:
        return <VehicleDataStep />;
      case 4:
        return <VehiclePhotosStep />;
      case 5:
        return <DamagePhotosStep />;
      case 6:
        return <ThirdPartyStep />;
      case 7:
        return <SceneStep />;
      case 8:
        return <SummaryStep />;
      default:
        return <StartStep />;
    }
  };

  return (
    <WizardLayout>
      {renderStep()}
    </WizardLayout>
  );
};

export default App;
