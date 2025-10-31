import React, { useState } from "react";
import { 
  EyeIcon, 
  TrashIcon, 
  XMarkIcon, 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon 
} from "@heroicons/react/24/outline";
import Header from "../header";
import Stepper from "../stepper";
import { genders, degreeLevels, studentTypes } from "../../utils/lookupData";

const steps = [
  "Personal Info",
  "ID Upload",
  "Transcript Upload",
  "Additional Documents",
  "Review & Submit",
];

interface Props {
  form: any;
  updateForm: (updates: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  step: number;
  submitting?: boolean;
  submitResult?: { error?: string; success?: string } | null;
}

export default function ReviewSubmitStep({
  form = {},
  updateForm,
  onBack,
  onSubmit,
  step,
  submitting,
  submitResult,
}: Props) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [zoom, setZoom] = useState(1);

  // Grab codes for filename logic (fall back to blank string if not provided)
  const nationalCode = form.nationalCountryCode || "";
  const studentTypeCode = studentTypes.find(s => s.name === form.studentType)?.code || "";
  const degreeLevelCode = degreeLevels.find(d => d.name === form.degreeLevel)?.code || "";
  const genderCode = genders.find(g => g.name === form.gender)?.code || "";

  // For transcripts, use the *_Country_Code fields
  const transcriptCodes = [1, 2, 3, 4].map(num => form[`t${num}CountryCode`] || "");

  // Helper: full name preview (commas between all provided parts)
  const fullName = [
    (form.lastName || "").toString().trim(),
    (form.firstName || "").toString().trim(),
    (form.middleName || "").toString().trim(),
    (form.additionalName || "").toString().trim(),
  ].filter(Boolean).join(", ");

  // Helper: expected file base
  const baseFileName = [
    form.lastName,
    form.firstName,
    degreeLevelCode,
    studentTypeCode,
  ].filter(Boolean).join("_").replace(/[^a-zA-Z0-9_\-]/g, "_");

  const transcriptFiles = [1, 2, 3, 4].map(num => ({
    file: form[`transcript${num}`],
    country: form[`t${num}Country`],
    countryCode: form[`t${num}CountryCode`] || "",
    num,
  }));

  const handlePreview = (file: File, fileName: string) => {
    setPreviewFile(file);
    setPreviewFileName(fileName);
    setZoom(1); // Reset zoom on new preview
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewFileName("");
  };

  const handleZoomIn = () => setZoom(prev => prev + 0.2);
  const handleZoomOut = () => setZoom(prev => Math.max(0.2, prev - 0.2));

  const formatLongDate = (raw: string | Date): string => {
    if (!raw) return "";
    let date: Date | null = null;

    if (raw instanceof Date) {
      date = raw;
    } else if (typeof raw === 'string') {
      const s = raw.trim();
      // Handle YYYY-MM-DD (from <input type="date">)
      const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(s);
      if (isoMatch) {
        const [y, m, d] = s.split('-').map(n => parseInt(n, 10));
        date = new Date(Date.UTC(y, m - 1, d));
      } else {
        // Try MM/DD/YYYY
        const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slash) {
          const m = parseInt(slash[1], 10);
          const d = parseInt(slash[2], 10);
          const y = parseInt(slash[3], 10);
          date = new Date(Date.UTC(y, m - 1, d));
        } else {
          // Fallback to native parsing
          const parsed = new Date(s);
          if (!isNaN(parsed.getTime())) {
            date = parsed;
          }
        }
      }
    }

    if (!date) return String(raw);
    // Use long date format (e.g., October 15, 2025)
    try {
      // dateStyle: 'long' ensures correct long format; keep UTC to avoid TZ shifts
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Header accent="brand-beige" />
      <Stepper step={step} steps={steps} />

      <h2 className="text-xl font-semibold mb-6 text-center text-brand-beige">REVIEW &amp; SUBMIT</h2>
      {submitting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-sm w-full">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-brand-beige mb-3" />
            <div className="text-base font-semibold mb-1">Submitting your application…</div>
            <div className="text-sm text-gray-600">Please wait and do not close this window.</div>
          </div>
        </div>
      )}
      {submitResult?.error && (
        <div className="border border-red-400 bg-red-50 text-red-700 rounded-xl p-3 mb-6 text-sm">
          <div className="font-bold">Submission failed</div>
          <div>{submitResult.error}</div>
        </div>
      )}
      {(() => {
        const missingNationalID = !form?.nationalID;
        const missingTranscript = !(form?.transcript1 || form?.transcript2 || form?.transcript3 || form?.transcript4);
        if (missingNationalID || missingTranscript) {
          return (
            <div className="border border-red-300 bg-red-50 text-red-700 rounded-xl p-3 mb-6 text-sm text-center">
              <div>A National ID and at least one Transcript are required before submission. Please return to the National ID Upload or Transcript Upload step to complete the required items.</div>
              {missingNationalID &&  <div className="font-bold">Missing: National ID</div>}
              {missingTranscript && <div className="font-bold">Missing: Transcript</div>}
            </div>
          );
        }
        return null;
      })()}
      <p className="text-sm text-red-600 text-center mt-2">Please complete all items with an * before, advancing to the next step.</p>

      <div className="rounded-lg p-4 mb-6 border">
        <div className="text-xl font-semibold mb-4">Personal Information</div>
        <div><strong>Full Name:</strong> {fullName || <span className="text-gray-400">N/A</span>}</div>
        <div><strong>Student Type:</strong> {form.studentType || <span className="text-gray-400">N/A</span>}</div>
        <div><strong>Degree Level:</strong> {form.degreeLevel || <span className="text-gray-400">N/A</span>}</div>
        <div><strong>Gender:</strong> {form.gender || <span className="text-gray-400">N/A</span>}</div>
        <div><strong>Birth Date:</strong> {form.birthDate ? formatLongDate(form.birthDate) : <span className="text-gray-400">N/A</span>}</div>
        <div><strong>Email:</strong> {form.personalEmail || <span className="text-gray-400">N/A</span>}</div>
      
        <div><strong>Additional Comments:</strong> {form.additionalComments || <span className="text-gray-400">N/A</span>}</div>
      </div>

      <div className="rounded-lg p-6 mb-6 border">
        <h3 className="text-xl font-semibold mb-4">Uploaded Documents</h3>

        {/* National ID */}
        {form.nationalID && (
          <div className="mb-4">
            <div className="font-medium">
              National ID <span className="text-sm text-gray-600">({form.nationalCountry} / {nationalCode})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-2">{form.nationalID.name}</span>
              <button
                type="button"
                onClick={() => handlePreview(form.nationalID, form.nationalID.name)}
                className="p-1 text-blue-500 hover:text-blue-700"
                aria-label="Preview National ID"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => updateForm({ nationalID: undefined, nationalCountry: "", nationalCountryCode: "" })}
                className="p-1 text-red-500 hover:text-red-700"
                aria-label="Remove National ID"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          
          </div>
        )}

        {/* Transcripts 1-4 */}
        {transcriptFiles.map(({ file, country, countryCode, num }) =>
          file ? (
            <div key={num} className="mb-4">
              <div className="font-medium">
                Transcript {num} <span className="text-sm text-gray-600">({country} / {countryCode})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="mr-2">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handlePreview(file, file.name)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  aria-label={`Preview Transcript ${num}`}
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateForm({ [`transcript${num}`]: undefined, [`t${num}Country`]: "", [`t${num}CountryCode`]: "" })}
                  className="p-1 text-red-500 hover:text-red-700"
                  aria-label={`Remove Transcript ${num}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
             {/* REMOVED expected filename<div className="text-sm text-gray-500">
               Expected filename: <span className="font-mono">{`${baseFileName}_${countryCode}-T${num}`}</span>
             </div> */}
            </div>
          ) : null
        )}

        {/* Additional Documents */}
        {(form.additionalDoc1 || form.additionalDoc2) && (
          <div className="mt-6">
            <div className="text-lg font-semibold mb-2">Additional Documents</div>
            {form.additionalDoc1 && (
              <div className="mb-3">
                <div className="font-medium">Additional Document 1</div>
                <div className="flex items-center gap-1">
                  <span className="mr-2">{form.additionalDoc1.name}</span>
                  <button
                    type="button"
                    onClick={() => handlePreview(form.additionalDoc1, form.additionalDoc1.name)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                    aria-label={`Preview Additional Document 1`}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm({ additionalDoc1: undefined })}
                    className="p-1 text-red-500 hover:text-red-700"
                    aria-label={`Remove Additional Document 1`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            {form.additionalDoc2 && (
              <div className="mb-3">
                <div className="font-medium">Additional Document 2</div>
                <div className="flex items-center gap-1">
                  <span className="mr-2">{form.additionalDoc2.name}</span>
                  <button
                    type="button"
                    onClick={() => handlePreview(form.additionalDoc2, form.additionalDoc2.name)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                    aria-label={`Preview Additional Document 2`}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm({ additionalDoc2: undefined })}
                    className="p-1 text-red-500 hover:text-red-700"
                    aria-label={`Remove Additional Document 2`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Checkbox */}
      <div className="mb-6 flex items-center">
        <input
          id="accuracy"
          type="checkbox"
          className="mr-2 accent-blue-600"
          checked={form.termsConditions || false}
          onChange={(e) => updateForm({ termsConditions: e.target.checked })}
          required
        />
        <label htmlFor="accuracy" className="text-gray-900 font-medium"><span className="text-red-600">*</span>
          I confirm that I have carefully reviewed all information entered and that it is accurate and complete to the best of my knowledge.
          <br />
          <br />
          I understand that submitting incomplete information, or documents that do not meet the stated transcript requirements, may result in delays or the rejection of my application.
          <br />
          <br />
          I also acknowledge that not all international degrees are guaranteed to be recognized as equivalent to U.S. degrees, particularly if the institution is not accredited.
        </label>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-2 pb-2 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold truncate pr-4" title={previewFileName}>
                Preview: {previewFileName}
              </h3>
              <div className="flex items-center gap-2">
                {previewFile.type.startsWith('image/') && (
                  <>
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.2}
                      className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50"
                      aria-label="Zoom out"
                    >
                      <MagnifyingGlassMinusIcon className="h-6 w-6" />
                    </button>
                    <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={handleZoomIn}
                      className="p-1 rounded-full hover:bg-gray-200"
                      aria-label="Zoom in"
                    >
                      <MagnifyingGlassPlusIcon className="h-6 w-6" />
                    </button>
                  </>
                )}
                <button
                  onClick={closePreview}
                  className="ml-4 text-gray-500 hover:text-gray-700"
                  aria-label="Close preview"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-auto">
              {previewFile.type.startsWith('image/') ? (
                <div className="p-4 flex justify-center items-center min-h-full">
                  <img
                    src={URL.createObjectURL(previewFile)}
                    alt={previewFileName}
                    className="transition-transform duration-150"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={URL.createObjectURL(previewFile)}
                  title={previewFileName}
                  className="w-full h-[75vh]"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">File preview not available for this file type.</p>
                  <a
                    href={URL.createObjectURL(previewFile)}
                    download={previewFileName}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}