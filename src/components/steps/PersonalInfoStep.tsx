// components/steps/PersonalInformationStep.tsx

import React from "react";
import { studentTypes, degreeLevels, genders } from "../../utils/lookupData";
import Stepper from "../stepper";
import Header from "../header";

const steps = ["Personal Info", "Document Upload", "Review & Submit"];

interface Props {
  form: any;
  updateForm: (updates: any) => void;
  onNext: () => void;
  step: number;
  showValidationMessage?: boolean;
}

const PersonalInformationStep: React.FC<Props> = ({ form, updateForm, onNext, step, showValidationMessage = false }) => {
  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    const requiredFields = [
      form.firstName,
      form.lastName,
      form.studentType,
      form.degreeLevel,
      form.gender,
      form.birthDate,
      form.personalEmail
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  };

  // Helper function to check if a specific field is valid
  const isFieldValid = (fieldValue: string) => {
    return fieldValue && fieldValue.trim() !== '';
  };

  return (
    <div className="max-w-2xl w-full p-8">
      <Header />
      <Stepper step={step} steps={steps} />
      <h2 className="text-xl font-bold mb-6 bg-green-200 text-gray-600 text-center shadow-lg">PERSONAL INFORMATION</h2>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.firstName || ""}
              onChange={e => updateForm({ firstName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                form.firstName ? (isFieldValid(form.firstName) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              required
            />
          </div>
          {/* Middle Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Middle Name</label>
            <input
              type="text"
              value={form.middleName || ""}
              onChange={e => updateForm({ middleName: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.lastName || ""}
              onChange={e => updateForm({ lastName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                form.lastName ? (isFieldValid(form.lastName) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              required
            />
          </div>
          {/* Additional Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Additional Name</label>
            <input
              type="text"
              value={form.additionalName || ""}
              onChange={e => updateForm({ additionalName: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Student Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Student Type <span className="text-red-600">*</span>
            </label>
            <select
              value={form.studentType || ""}
              onChange={e => updateForm({ studentType: e.target.value })}
              className={`w-full pr-1.5 px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                form.studentType ? (isFieldValid(form.studentType) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select...</option>
              {studentTypes.map(st => (
                <option value={st.name} key={st.code}>{st.name}</option>
              ))}
            </select>
          </div>
          {/* Degree Level */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Degree Level <span className="text-red-600">*</span>
            </label>
            <select
              value={form.degreeLevel || ""}
              onChange={e => updateForm({ degreeLevel: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                form.degreeLevel ? (isFieldValid(form.degreeLevel) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select...</option>
              {degreeLevels.map(dl => (
                <option value={dl.name} key={dl.code}>{dl.name}</option>
              ))}
            </select>
          </div>
          {/* Gender */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Gender <span className="text-red-600">*</span>
            </label>
            <select
              value={form.gender || ""}
              onChange={e => updateForm({ gender: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                form.gender ? (isFieldValid(form.gender) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select...</option>
              {genders.map(g => (
                <option value={g.name} key={g.code}>{g.name}</option>
              ))}
            </select>
          </div>
          {/* Birth Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Birth Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={form.birthDate || ""}
              onChange={e => updateForm({ birthDate: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                form.birthDate ? (isFieldValid(form.birthDate) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              required
            />
          </div>
          {/* Personal Email */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Personal Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={form.personalEmail || ""}
              onChange={e => updateForm({ personalEmail: e.target.value })}
              className={`w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                form.personalEmail ? (isFieldValid(form.personalEmail) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              required
            />
          </div>
          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Additional Notes</label>
            <textarea
              value={form.notes || ""}
              onChange={e => updateForm({ notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </div>
        </div>
        
        {/* Validation Message */}
        {showValidationMessage && !isFormValid() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please fill in all required fields marked with <span className="text-red-600">*</span> before proceeding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInformationStep; 