'use client';
import { useState } from "react";
import Step1PersonalInfo from "./steps/PersonalInfoStep";
import Step2DocumentUpload from "./steps/DocumentUploadStep";
import Step3ReviewSubmit from "./steps/ReviewSubmitStep";
import Step3AdditionalDetails from "./steps/AdditionalDetailsStep";
import AdditionalDocumentsStep from "./steps/AdditionalDocumentsStep";
import FormNavigation from "./steps/FormNavigation";
import SuccessStep from "./steps/SuccessStep";
import { studentTypes, degreeLevels, genders } from "../utils/lookupData";


// --- Must match backend case-sensitive keys ---
const initialFormData = {
  // Personal Info
  firstName: "",
  lastName: "",
  middleName: "",
  additionalName: "",
  studentType: "",
  degreeLevel: "",
  gender: "",
  birthDate: "",
  personalEmail: "",
  notes: "",
  termsConditions: false,
  // Additional Details (optional)
  referenceNumber: "",
  additionalComments: "",
  // Country Data (consistent naming)
  nationalCountry: "",
  nationalCountryCode: "",
  t1Country: "",
  t1CountryCode: "",
  t2Country: "",
  t2CountryCode: "",
  t3Country: "",
  t3CountryCode: "",
  t4Country: "",
  t4CountryCode: "",
  // Files (consistent naming)
  nationalID: null,
  transcript1: null,
  transcript2: null,
  transcript3: null,
  transcript4: null,
  // Additional Documents (optional)
  additionalDoc1: null,
  additionalDoc2: null,
};

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const stepsCount = 5;

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ error?: string; success?: string } | null>(null);

  const handleChange = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, stepsCount - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
  // Pre-submit guard: require National ID and at least one Transcript
  const hasNationalID = Boolean(formData.nationalID);
  const hasAnyTranscript = Boolean(formData.transcript1 || formData.transcript2 || formData.transcript3 || formData.transcript4);
  if (!hasNationalID || !hasAnyTranscript) {
    setSubmitResult({ error: "A National ID and at least one Transcript are required before submission." });
    return;
  }

  setSubmitting(true);
  setSubmitResult(null);

  // Lookup code values for studentType and degreeLevel
  const studentTypeObj = studentTypes.find(st => st.name === formData.studentType || st.code === formData.studentType);
  const degreeLevelObj = degreeLevels.find(dl => dl.name === formData.degreeLevel || dl.code === formData.degreeLevel);
  const genderObj = genders.find(g => g.name === formData.gender || g.code === formData.gender);

  const studentTypeCode = studentTypeObj ? studentTypeObj.code : formData.studentType;
  const degreeLevelCode = degreeLevelObj ? degreeLevelObj.code : formData.degreeLevel;
  const genderCode = genderObj ? genderObj.code : formData.gender;

  // Compose the base filename
  const baseFileName = [
    formData.lastName,
    formData.firstName,
    degreeLevelCode,
    studentTypeCode,
  ].join('_').replace(/\s+/g, '_').replace(/\//g, '_');

  // Compose the expected file names
  const nationalIDFilename = `${baseFileName}_${formData.nationalCountryCode}-ID`;
  const transcriptFileNames = [1,2,3,4].map(num =>
    (formData as any)[`t${num}CountryCode`]
      ? `${baseFileName}_${(formData as any)[`t${num}CountryCode`]}-T${num}`
      : ''
  );
  // Additional documents filenames (if provided)
  const additionalDocs1FileNames = (formData as any).additionalDoc1 ? `${baseFileName}-AD1` : '';
  const additionalDocs2FileNames = (formData as any).additionalDoc2 ? `${baseFileName}-AD2` : '';

  // Prepare the submission data
  const submissionData: { [key: string]: any } = { ...formData };

  // Force codes in the payload
  submissionData.gender = genderCode;
  submissionData.studentType = studentTypeCode;
  submissionData.degreeLevel = degreeLevelCode;
  // Include folder name for backend to create outer folder and store its URL in Sheets 'Folder' column
  submissionData.folder = baseFileName;
  submissionData.nationalIDFilename = nationalIDFilename;
  submissionData.transcript1Filename = transcriptFileNames[0];
  submissionData.transcript2Filename = transcriptFileNames[1];
  submissionData.additionalDocs1Filename = additionalDocs1FileNames;
  submissionData.additionalDocs2Filename = additionalDocs2FileNames;
 
  // Ensure additionalComments mirrors notes only when notes has content
  if (submissionData.notes && String(submissionData.notes).trim() !== '') {
    submissionData.additionalComments = submissionData.notes;
  }


  // Prepare the FormData
  const data = new FormData();
  // Ensure the first column in Google Sheets maps to the folder URL.
  // Backend should create the folder and overwrite this placeholder with the actual URL.
  data.append('FolderUrl', baseFileName);
  Object.entries(submissionData).forEach(([key, value]) => {
    // Only append non-empty values
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      // If it's a File, skip appending empty files
      (!(value instanceof File) || value.size > 0)
    ) {
      data.append(key, value);
    }
  });

  // Logging for debug
  for (let [k, v] of data.entries()) {
    console.log("FormData:", k, v, typeof v, v instanceof File ? v.name : '');
  }

  try {
    const response = await fetch(
      "/api/submit",
      { method: "POST", body: data }
    );
    const resultText = await response.text();

    if (!response.ok) {
      throw new Error(resultText || "Submission failed with no error message.");
    }

    setSubmitResult({ success: resultText || "Your application has been submitted successfully!" });
  } catch (err: any) {
    console.error("Submission Error:", err);
    setSubmitResult({ error: err.message || "An unexpected network error occurred." });
  } finally {
    setSubmitting(false);
  }
};



  return (
    <div className="m-10 p-10 max-w-2xl w-full border rounded-2xl">
      {submitResult?.success ? (
        <SuccessStep />
      ) : (
        <>
          {/* Step-level validation */}
          {/** Compute whether current step is valid to enable Next button */}
          {(() => {
            const isStepValid = (currentStep: number): boolean => {
              // step indices: 0..4
              if (currentStep === 0) {
                // Personal Info required fields
                return Boolean(
                  formData.firstName &&
                  formData.lastName &&
                  formData.studentType &&
                  formData.degreeLevel &&
                  formData.gender &&
                  formData.birthDate &&
                  formData.personalEmail
                );
              }
              if (currentStep === 1) {
                // ID Upload required fields
                return Boolean(formData.nationalID && formData.nationalCountryCode);
              }
              if (currentStep === 2) {
                // Transcript Upload required fields: transcript1 + t1 country
                return Boolean(formData.transcript1 && formData.t1CountryCode);
              }
              if (currentStep === 3) {
                // Additional Documents: no required fields
                return true;
              }
              // Review step - Next not shown
              return true;
            };
            const canProceed = isStepValid(step);
            return (
              <></>
            );
          })()}
          {step === 0 && (
            <Step1PersonalInfo form={formData} updateForm={handleChange} onNext={handleNext} step={1} />
          )}
          {step === 1 && (
            <Step2DocumentUpload form={formData} updateForm={handleChange} onNext={handleNext} onBack={handleBack} step={2} />
          )}
          {step === 2 && (
            <Step3AdditionalDetails form={formData} updateForm={handleChange} onNext={handleNext} onBack={handleBack} step={3} />
          )}
          {step === 3 && (
            <AdditionalDocumentsStep form={formData} updateForm={handleChange} onNext={handleNext} onBack={handleBack} step={4} />
          )}
          {step === 4 && (
            <Step3ReviewSubmit
              form={formData}
              updateForm={handleChange}
              onBack={handleBack}
              onSubmit={handleSubmit}
              step={5}
              submitting={submitting}
              submitResult={submitResult}
            />
          )}
          {/* Instruction moved to each step page under the title */}
          <FormNavigation
            step={step}
            stepsCount={stepsCount}
            nextStep={handleNext}
            prevStep={handleBack}
            handleSubmit={handleSubmit}
            formData={formData}
            submitting={submitting}
            canProceed={(function(){
              const isStepValid = (currentStep: number): boolean => {
                if (currentStep === 0) {
                  return Boolean(
                    formData.firstName &&
                    formData.lastName &&
                    formData.studentType &&
                    formData.degreeLevel &&
                    formData.gender &&
                    formData.birthDate &&
                    formData.personalEmail
                  );
                }
                if (currentStep === 1) {
                  return Boolean(formData.nationalID && formData.nationalCountryCode);
                }
                if (currentStep === 2) {
                  return Boolean(formData.transcript1 && formData.t1CountryCode);
                }
                if (currentStep === 3) {
                  return true;
                }
                return true;
              };
              return isStepValid(step);
            })()}
          />
        </>
      )}
    </div>
  );
}
