import districtsJsonData from "@/app/data/districts.json";

interface DistrictEntry {
  state: string;
  stateCode: string;
  districtCode: string;
  district: string;
}

interface StateInfo {
  name: string;
  code: string;
}

interface DistrictInfo {
  name: string;
  code: string;
}

const allDistrictEntries: DistrictEntry[] = districtsJsonData.districts;

const uniqueStates: StateInfo[] = Array.from(
  new Set(allDistrictEntries.map((d) => d.state))
)
  .map((stateName) => {
    const firstEntryForState = allDistrictEntries.find(
      (d) => d.state === stateName && d.stateCode && d.stateCode.trim() !== ""
    );
    return firstEntryForState
      ? {
          name: stateName,
          code: firstEntryForState.stateCode,
        }
      : null;
  })
  .filter((state): state is StateInfo => state !== null)
  .sort((a, b) => a.name.localeCompare(b.name));

export const indianLocationData = {
  getStates: (): StateInfo[] => {
    return uniqueStates;
  },
  getDistrictsByState: (stateNameOrCode: string): DistrictInfo[] => {
    if (!stateNameOrCode) {
      return [];
    }
    return allDistrictEntries
      .filter(
        (d) =>
          (d.state === stateNameOrCode || d.stateCode === stateNameOrCode) &&
          d.districtCode &&
          d.districtCode.trim() !== ""
      )
      .map((d) => ({ name: d.district, code: d.districtCode }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
};
