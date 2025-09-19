import type { Procurement, Farmer } from "@ankeny/chaya-prisma-package/client";

export interface ProcurementWithRelations extends Procurement {
  farmer: Pick<Farmer, "name" | "village" | "panchayath" | "mandal">;
}
