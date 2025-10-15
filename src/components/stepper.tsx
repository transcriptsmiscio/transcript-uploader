import React from "react";

interface StepperProps {
  step: number;      // current step (1-indexed)
  steps: string[];   // array of step labels
}

export default function Stepper({ step, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, idx) => (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg border ${step === idx + 1 ? "bg-brand-navy text-white" : ""}`}
            >
              {idx + 1}
            </div>
            <div
              className={`mt-2 text-xs font-medium ${step === idx + 1 ? 'text-brand-navy' : ''}`}
            >
              {label}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div className="w-12 h-1 bg-brand-beige mx-2 rounded"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
