import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface FarmerFormData {
  farmer: {
    surveyNumber: string;
    name: string;
    relationship: string;
    gender: string;
    community: string;
    aadharNumber: string;
    state: string;
    district: string;
    mandal: string;
    village: string;
    panchayath: string;
    dateOfBirth: string;
    age: number;
    contactNumber: string;
  };
  bankDetails: {
    ifscCode: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    address: string;
    bankCode: string;
  };
  documents: {
    profilePicUrl: string;
    aadharDocUrl: string;
    bankDocUrl: string;
  };
  fields: Array<{
    areaHa: number;
    yieldEstimate: number;
    location: any;
    landDocumentUrl: string;
  }>;
}

interface FarmerFormState {
  // Form state
  activeTab: number;
  formData: Partial<FarmerFormData>;
  isSubmitting: boolean;
  isDirty: boolean;
  
  // Actions
  setActiveTab: (tab: number) => void;
  goToNextTab: () => void;
  goToPreviousTab: () => void;
  setFormData: (data: Partial<FarmerFormData>) => void;
  updateFormData: (path: string, value: any) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;
  resetForm: () => void;
  
  // Field management
  addField: () => void;
  removeField: (index: number) => void;
  updateField: (index: number, field: any) => void;
}

const initialFormData: Partial<FarmerFormData> = {
  farmer: {
    surveyNumber: "",
    name: "",
    relationship: "",
    gender: "",
    community: "",
    aadharNumber: "",
    state: "",
    district: "",
    mandal: "",
    village: "",
    panchayath: "",
    dateOfBirth: "",
    age: 0,
    contactNumber: "",
  },
  bankDetails: {
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    address: "",
    bankCode: "",
  },
  documents: {
    profilePicUrl: "",
    aadharDocUrl: "",
    bankDocUrl: "",
  },
  fields: [],
};

export const useFarmerFormStore = create<FarmerFormState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        activeTab: 0,
        formData: initialFormData,
        isSubmitting: false,
        isDirty: false,

        // Tab navigation
        setActiveTab: (tab: number) =>
          set((state) => {
            state.activeTab = tab;
          }),

        goToNextTab: () =>
          set((state) => {
            if (state.activeTab < 3) {
              state.activeTab += 1;
            }
          }),

        goToPreviousTab: () =>
          set((state) => {
            if (state.activeTab > 0) {
              state.activeTab -= 1;
            }
          }),

        // Form data management
        setFormData: (data: Partial<FarmerFormData>) =>
          set((state) => {
            state.formData = { ...state.formData, ...data };
            state.isDirty = true;
          }),

        updateFormData: (path: string, value: any) =>
          set((state) => {
            const keys = path.split(".");
            let current: any = state.formData;
            
            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) {
                current[keys[i]] = {};
              }
              current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            state.isDirty = true;
          }),

        setIsSubmitting: (isSubmitting: boolean) =>
          set((state) => {
            state.isSubmitting = isSubmitting;
          }),

        setIsDirty: (isDirty: boolean) =>
          set((state) => {
            state.isDirty = isDirty;
          }),

        resetForm: () =>
          set((state) => {
            state.formData = initialFormData;
            state.activeTab = 0;
            state.isDirty = false;
            state.isSubmitting = false;
          }),

        // Field management
        addField: () =>
          set((state) => {
            if (!state.formData.fields) {
              state.formData.fields = [];
            }
            state.formData.fields.push({
              areaHa: 0,
              yieldEstimate: 0,
              location: {},
              landDocumentUrl: "",
            });
            state.isDirty = true;
          }),

        removeField: (index: number) =>
          set((state) => {
            if (state.formData.fields && state.formData.fields.length > index) {
              state.formData.fields.splice(index, 1);
              state.isDirty = true;
            }
          }),

        updateField: (index: number, field: any) =>
          set((state) => {
            if (state.formData.fields && state.formData.fields.length > index) {
              state.formData.fields[index] = { ...state.formData.fields[index], ...field };
              state.isDirty = true;
            }
          }),
      })),
      {
        name: "farmer-form-store",
        partialize: (state) => ({
          formData: state.formData,
          activeTab: state.activeTab,
        }),
      }
    ),
    {
      name: "farmer-form-store",
    }
  )
);
