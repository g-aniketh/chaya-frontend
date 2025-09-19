import {
  BankDetails,
  FarmerDocuments,
  Field,
  User,
  Gender,
  Relationship,
} from "@ankeny/chaya-prisma-package/client";

// Define Farmer interface with all required properties
export interface Farmer {
  id: number;
  surveyNumber: string;
  name: string;
  relationship: Relationship;
  gender: Gender;
  community: string;
  aadharNumber: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  panchayath: string;
  dateOfBirth: Date;
  age: number;
  contactNumber: string;
  isActive: boolean;
  createdById: number;
  updatedById: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarmerWithRelations extends Farmer {
  bankDetails?: BankDetails | null;
  documents?: FarmerDocuments | null;
  fields?: Field[];
  createdBy?: Pick<User, "name">;
}
