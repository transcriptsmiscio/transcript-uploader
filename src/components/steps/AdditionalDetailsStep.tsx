import React from "react";
import Stepper from "../stepper";
import Header from "../header";
import { countries } from "../../utils/lookupData";
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

export default function AdditionalDetailsStep({ form, updateForm, onNext, onBack, step }: Props) {
  return (
    <div className="max-w-2xl w-full p-8">
      <Header accent="brand-coral" />
      <Stepper step={step} steps={steps} />
      <h2 className="text-xl font-semibold mb-6 text-center text-brand-coral">TRANSCRIPT UPLOAD</h2>
      <p className="text-sm text-red-600 text-center mt-2">Please complete all items with an * before, advancing to the next step.</p>
      {/* Guidance based on Student Location and Degree Level from Step 1 */}
      {(() => {
        const studentType = (form?.studentType || "").toString();
        const degreeLevel = (form?.degreeLevel || "").toString();

        const computeNeeded = (deg: string): string => {
          if (deg === "Undergraduate") {
            return "Secondary Transcripts (A & O levels for Ugandans)";
          }
          if (deg === "Graduate Certificate" || deg === "Postgraduate Diploma") {
            return "Unofficial Undergraduate Transcript";
          }
          if (deg === "MBA" || deg === "Other Master's" || deg === "Master’s" || deg === "Masters") {
            return "Undergraduate Transcript";
          }
          if (deg === "Doctoral") {
            return "Master’s Transcript";
          }
          return "";
        };

        const needed = computeNeeded(degreeLevel);

        if (!studentType || !degreeLevel) {
          return (
            <div className="border rounded-xl p-3 mb-6 text-sm">
              Please complete your Student Location and Degree Level on Page 1 to see transcript upload guidance.
            </div>
          );
        }

        return (
          <div className="border rounded-xl p-3 mb-6 text-sm">
            <div className="text-sm font-semibold mb-1">Degree Seeking/Transcripts Needed from Your Prerequisite Program</div>
            <div>
              Prerequisite Transcript Needed: {needed ? (
                <span className="font-bold text-red-600">{needed}</span>
              ) : (
                <span>Please consult program requirements for your selected degree.</span>
              )}
            </div>
          </div>
        );
      })()}

      <form
        onSubmit={e => {
          e.preventDefault();
          onNext();
        }}
        autoComplete="off"
      >
        {/* Transcript Uploads */}
        {[1, 2].map(num => (
          <div key={num} className="flex flex-row gap-6 mb-6 w-full max-w-3xl">
            <div className="flex flex-col flex-1 min-w-[250px] max-w-md">
              <label className="font-semibold text-gray-900 mb-1">
                Transcript {num}{num === 1 && <span className="text-red-600">*</span>}
              </label>
              <FileButton
                accept=".pdf,.jpg,.jpeg,.png"
                required={num === 1}
                onFileSelected={(file) => updateForm({ [`transcript${num}`]: file })}
              />
              {form[`transcript${num}`] && (
                <span className="text-xs text-gray-500 mt-1">
                  Selected: {form[`transcript${num}`].name}
                </span>
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-[250px] max-w-md">
              <label className="font-semibold text-gray-900 mb-1">
                Transcript {num} Issuing Country{num === 1 && <span className="text-red-600">*</span>}
              </label>
              <select
              className="w-full border rounded-xl px-4 py-2 h-12"
                required={num === 1}
                value={form[`t${num}CountryCode`] || ""}
                onChange={e => {
                  const code = e.target.value;
                  const selected = countries.find(c => c.code === code);
                  updateForm({
                    [`t${num}CountryCode`]: code,
                    [`t${num}Country`]: selected ? selected.name : ""
                  });
                }}
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}({c.code})</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        
      </form>
    </div>
  );
}

