import React from "react";
import Stepper from "../stepper";
import Header from "../header";
import FileButton from "../FileButton";

const steps = [
  "Personal Info",
  "ID Upload",
  "Transcript Upload",
  "Additional Documents",
  "Review & Submit",
];

type Props = {
  form: any;
  updateForm: (updates: any) => void;
  onNext: () => void;
  onBack?: () => void;
  step: number;
};

export default function AdditionalDocumentsStep({ form, updateForm, onNext, onBack, step }: Props) {
  return (
    <div className="max-w-2xl w-full p-8">
      <Header accent="brand-gold" />
      <Stepper step={step} steps={steps} />
      <h2 className="text-xl font-semibold mb-6 text-center text-brand-gold">ADDITIONAL DOCUMENTS/COMMENTS</h2>
      <p className="text-sm text-red-600 text-center mt-2">Please complete all items with an * before, advancing to the next step.</p>
      <h3 className="text-lg font-semibold mb-4 text-center text-brand-gold">Use this page to upload a Diploma, an additional transcript, or leave a comment.</h3>
      <form
        onSubmit={e => {
          e.preventDefault();
          onNext();
        }}
        autoComplete="off"
      >
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Additional Document 1 (optional)</label>
            <FileButton
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelected={(file) => updateForm({ additionalDoc1: file })}
            />
            {form.additionalDoc1 && (
              <span className="text-xs text-gray-500 mt-1 block">Selected: {form.additionalDoc1.name}</span>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Additional Document 2 (optional)</label>
            <FileButton
              accept=".pdf,.jpg,.jpeg,.png"
              onFileSelected={(file) => updateForm({ additionalDoc2: file })}
            />
            {form.additionalDoc2 && (
              <span className="text-xs text-gray-500 mt-1 block">Selected: {form.additionalDoc2.name}</span>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Additional Comments (optional)</label>
            <textarea
              value={form.additionalComments || ""}
              onChange={e => updateForm({ additionalComments: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl"
              rows={3}
            />
          </div>
        </div>

        
      </form>
    </div>
  );
}


