import React from "react";
import { countries } from "../../utils/lookupData";
import Stepper from "../stepper";
import Header from "../header";

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

export default function DocumentUploadStep({
  form,
  updateForm,
  onNext,
  onBack,
  step,
}: Props) {
  // Utility: Required fields
  const required = { input: "border-red-300", label: "text-red-600" };

  return (
    <div className="max-w-2xl w-full p-8">
      <Header accent="brand-red" />
      <Stepper step={step} steps={steps} />
      <h2 className="text-xl font-semibold mb-6 text-center text-brand-red">ID UPLOAD</h2>
      {/* Contextual guidance based on Student Location from Step 1 */}
      {(() => {
        const st = (form?.studentType || "").toString();
        let msg = "";
        if (st === "Ugandan Student") {
          msg = "Upload your Ugandan National ID or passport. Select Uganda as the issuing country when applicable.";
        } else if (st === "International Student (Not from Uganda)") {
          msg = "Upload your passport (or national ID if accepted). Select the country that issued your document.";
        } else if (st === "United States Student") {
          msg = "Upload a government‑issued photo ID or passport. Select the issuing country for your document.";
        }
        return msg ? (
          <div className="border rounded-xl p-3 mb-6 text-sm">
            {msg}
          </div>
        ) : null;
      })()}
      <form
        onSubmit={e => {
          e.preventDefault();
          onNext();
        }}
        autoComplete="off"
      >
        {/* National ID */}
        <div className="flex flex-row gap-6 mb-6 w-full max-w-3xl">
          <div className="flex flex-col flex-1 min-w-[250px] max-w-md">
            <label className="font-semibold text-gray-900 mb-1">
              National ID or Passport <span className="text-red-600">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full border rounded-xl px-4 py-2 h-12"
              required
              value={form.nationalID ? "" : undefined}
              onChange={e => updateForm({ nationalID: e.target.files?.[0] })}
            />
            {form.nationalID && (
              <span className="text-xs text-gray-500 mt-1">
                Selected: {form.nationalID.name}
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-[250px] max-w-md">
            <label className="font-semibold text-gray-900 mb-1">
              National ID or Passport Issuing Country <span className="text-red-600">*</span>
            </label>
            <select
              className="w-full border rounded-xl px-4 py-2 h-12"
              required
              value={form.nationalCountryCode || ""}
              onChange={e => {
                const code = e.target.value;
                const selected = countries.find(c => c.code === code);
                updateForm({
                  nationalCountryCode: code,
                  nationalCountry: selected ? selected.name : ""
                });
              }}
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
        </div>
        {/* Transcripts moved to Transcript Upload (page 3) */}
        {/* Navigation (Next, Back, etc.) here if needed */}
      </form>
    </div>
  );
}
