import type {
  ProcessingStageStatus as PrismaProcessingStageStatus,
} from "@ankeny/chaya-prisma-package/client";
import type { Farmer } from "../../farmers/lib/types";
import type { Procurement } from "../../procurements/lib/types";

// Define local interfaces based on Prisma schema
export interface ProcessingBatch {
  id: number;
  batchCode: string;
  crop: string;
  lotNo: number;
  initialBatchQuantity: number;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
  farmerId?: number | null;
}

export interface ProcessingStage {
  id: number;
  processingBatchId: number;
  processingCount: number;
  processMethod: string;
  initialQuantity: number;
  quantityAfterProcess?: number | null;
  dateOfProcessing: Date;
  dateOfCompletion?: Date | null;
  doneBy: string;
  status: PrismaProcessingStageStatus;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Drying {
  id: number;
  processingStageId: number;
  day: number;
  temperature: number;
  humidity: number;
  pH: number;
  moisturePercentage: number;
  currentQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: number;
  processingBatchId: number;
  processingStageId: number;
  quantitySold: number;
  dateOfSale: Date;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  isActive: boolean;
  isEnabled: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ExtendedProcessingStageStatus =
  | PrismaProcessingStageStatus
  | "SOLD_OUT"
  | "NO_STAGES";

export interface ProcessingBatchWithSummary
  extends Omit<ProcessingBatch, "processingStages" | "procurements" | "sales"> {
  latestStageSummary: {
    id: number;
    processingCount: number;
    status: ExtendedProcessingStageStatus;
    processMethod: string;
    dateOfProcessing: Date;
    doneBy: string;
    initialQuantity: number;
    quantityAfterProcess: number | null;
    lastDryingQuantity: number | null;
  } | null;
  totalQuantitySoldFromBatch: number;
  netAvailableQuantity: number;
}

export type SaleSummaryForStage = Pick<
  Sale,
  "id" | "quantitySold" | "dateOfSale"
>;

export interface ProcessingStageWithDetails extends ProcessingStage {
  dryingEntries: Drying[];
  sales: SaleSummaryForStage[]; // Add sales here
}

export interface SaleWithStageInfo extends Sale {
  processingStage: Pick<ProcessingStage, "processingCount">;
}

export interface ProcessingBatchWithDetails extends ProcessingBatch {
  procurements: (Procurement & {
    farmer: Pick<User, "name"> & { village?: string };
  })[];
  processingStages: ProcessingStageWithDetails[]; // Use the updated type here
  sales: SaleWithStageInfo[]; // Overall sales for the batch, with stage info
  createdBy: Pick<User, "id" | "name">;
  totalQuantitySoldFromBatch: number;
  netAvailableQuantity: number; // Net available from the latest stage
  latestStageSummary: {
    id: number;
    processingCount: number;
    status: ExtendedProcessingStageStatus;
    processMethod: string;
    dateOfProcessing: Date;
    doneBy: string;
    initialQuantity: number;
    quantityAfterProcess: number | null;
    lastDryingQuantity: number | null;
  } | null;
}
