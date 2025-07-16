import React from "react";

interface Props {
  step: number;
  stepsCount: number;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => void;
  formData: any;
  submitting?: boolean;
  isStepValid?: (currentStep: number) => boolean;
}

export default function FormNavigation({
  step,
  stepsCount,
  nextStep,
  prevStep,
  handleSubmit,
  formData,
  submitting = false,
  isStepValid,
}: Props) {
  return (
    <div className={`flex mt-8 ${step === 0 ? "justify-end" : "justify-between"}`}>
      {step > 0 && (
        <button
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
          onClick={prevStep}
          type="button"
        >
          Back
        </button>
      )}
      {step === stepsCount - 1 ? (
        <button
          className={`px-6 py-2 rounded-xl transition-colors ${
            formData.termsConditions && !submitting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          type="button"
          disabled={!formData.termsConditions || submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      ) : (
        <button
          className={`px-6 py-2 rounded-xl transition-colors ${
            isStepValid && isStepValid(step)
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={nextStep}
          type="button"
          disabled={!isStepValid || !isStepValid(step)}
        >
          Next
        </button>
      )}
    </div>
  );
}
