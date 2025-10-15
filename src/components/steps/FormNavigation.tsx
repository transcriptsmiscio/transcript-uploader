import React from "react";

interface Props {
  step: number;
  stepsCount: number;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => void;
  formData: any;
  submitting?: boolean;
  canProceed?: boolean;
}

export default function FormNavigation({
  step,
  stepsCount,
  nextStep,
  prevStep,
  handleSubmit,
  formData,
  submitting = false,
  canProceed = true,
}: Props) {
  return (
    <div className={`flex mt-8 ${step === 0 ? "justify-end" : "justify-between"}`}>
      {step > 0 && (
        <button
          className="px-6 py-2 border rounded-xl text-brand-navy"
          onClick={prevStep}
          type="button"
        >
          Back
        </button>
      )}
      {step === stepsCount - 1 ? (
        <button
          className={`px-6 py-2 border rounded-xl ${
            !formData.termsConditions || submitting
              ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-70"
              : "bg-brand-navy text-white cursor-pointer"
          }`}
          onClick={handleSubmit}
          type="button"
          disabled={!formData.termsConditions || submitting}
          aria-disabled={!formData.termsConditions || submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      ) : (
        <button
          className={`px-6 py-2 border rounded-xl ${
            canProceed
              ? "bg-brand-navy text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-70"
          }`}
          onClick={nextStep}
          type="button"
          disabled={!canProceed}
          aria-disabled={!canProceed}
        >
          Next
        </button>
      )}
    </div>
  );
}
