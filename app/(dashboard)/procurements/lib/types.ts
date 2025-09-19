import type { Farmer } from "../../farmers/lib/types";

// Define the procurement interface with all required properties
export interface Procurement {
  id: number;
  farmerId: number;
  crop: string;
  procuredForm: string;
  speciality: string;
  quantity: number;
  procurementNumber: string;
  date: Date;
  time: Date;
  lotNo: number;
  procuredBy: string;
  vehicleNo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  processingBatchId?: number | null;
}

export interface ProcurementWithRelations extends Procurement {
  farmer: Pick<Farmer, "name" | "village" | "panchayath" | "mandal">;
}
