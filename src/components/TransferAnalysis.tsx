import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ANALYSIS_STEPS = [
  'Checked the strength of your first 11',
  'Looking at your bench depth',
  'Checking your captain choice',
  'Analysing your team balance',
  'Looking for differentials',
];

const STEP_DURATION = 1800; // ms per step

interface TransferAnalysisProps {
  onComplete: () => void;
}

export default function TransferAnalysis({ onComplete }: TransferAnalysisProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= ANALYSIS_STEPS.length) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }

    setStepProgress(0);
    const progressInterval = setInterval(() => {
      setStepProgress(prev => Math.min(prev + 3, 100));
    }, STEP_DURATION / 35);

    const stepTimer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, STEP_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimer);
    };
  }, [currentStep, onComplete]);

  const completedSteps = currentStep;
  const totalSteps = ANALYSIS_STEPS.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Progress dots */}
      <div className="flex items-center gap-0 mb-6">
        {ANALYSIS_STEPS.map((_, i) => (
          <React.Fragment key={i}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                i < completedSteps
                  ? 'bg-primary border-primary text-primary-foreground'
                  : i === currentStep
                  ? 'border-primary text-primary bg-transparent'
                  : 'border-muted-foreground/30 text-transparent'
              }`}
            >
              {i < completedSteps ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            {i < ANALYSIS_STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 transition-all duration-500 ${
                  i < completedSteps ? 'bg-primary' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-display font-bold text-foreground mb-1">
        Analysing your team
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        This may take up to 10 seconds
      </p>

      {/* Steps list */}
      <div className="w-full max-w-md bg-muted/40 rounded-xl p-5 space-y-1">
        {ANALYSIS_STEPS.map((step, i) => {
          const isComplete = i < completedSteps;
          const isActive = i === currentStep;
          const isPending = i > currentStep;

          return (
            <div key={i} className="py-3">
              <div className="flex items-center gap-3 mb-2">
                {isComplete && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isComplete
                      ? 'text-foreground'
                      : isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {step}
                </span>
              </div>
              <div className="w-full h-[3px] rounded-full bg-muted-foreground/10 overflow-hidden">
                {isComplete ? (
                  <div className="h-full w-full bg-primary rounded-full" />
                ) : isActive ? (
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-100"
                    style={{ width: `${stepProgress}%` }}
                  />
                ) : (
                  <div className="h-full w-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
