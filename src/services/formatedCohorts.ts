
import {
  getCohortList,
} from "@/services/CohortService/cohortService";
import {
  CohortTypes,

} from "@/utils/app.constant";
import { getStateBlockDistrictList } from "./MasterDataService";
interface Cohort {
  name: string;
  [key: string]: any;
}

interface BlockValue {
  label: string;
  [key: string]: any;
}

interface FormattedBlocksResult {
  cohortDetails: Cohort[];
  matchedCohorts: BlockValue[];
}
export const formatedDistricts = async () => {
  const adminState = JSON.parse(
    localStorage.getItem("adminInfo") || "{}"
  ).customFields.find(
    (field: any) => field.label === "STATES"
  );;
  try {
    const reqParams = {
      limit: 0,
      offset: 0,
      filters: {
        // name: searchKeyword,
        states: adminState.code,
        type: CohortTypes.DISTRICT,
        status: ["active"]

      },
      sort: ["name", "asc"],
    };

    const response = await getCohortList(reqParams);

    const cohortDetails = response?.results?.cohortDetails || [];
    const object = {
      controllingfieldfk: adminState.code,
      fieldName: "districts",
    };

    const optionReadResponse = await getStateBlockDistrictList(object);
    //console.log(blockFieldId)
    const result = optionReadResponse?.result?.values;
    console.log(cohortDetails)
    const uniqueResults = result.reduce((acc: any, current: any) => {
      const isDuplicate = acc.some((item: any) => item.label === current.label);
      if (!isDuplicate) {
          acc.push(current);
      }
      return acc;
  }, [] as typeof result);
  
  console.log(uniqueResults);  
    const matchedCohorts = uniqueResults?.map((value: any) => {
      const cohortMatch = cohortDetails.find((cohort: any) => cohort?.name?.toLowerCase() === value?.label?.toLowerCase());
      return cohortMatch ? { ...value } : null;
    }).filter(Boolean);

   

    return matchedCohorts;

  } catch (error) {
    console.error("Error in getting District Details", error);
    return error;
  }
};



export const formatedBlocks = async (districtCode: string) => {
  const adminState = JSON.parse(
    localStorage.getItem("adminInfo") || "{}"
  ).customFields.find(
    (field: any) => field.label === "STATES"
  );
  try {
    const reqParams = {
      limit: 0,
      offset: 0,
      filters: {
        // name: searchKeyword,
        states: adminState.code,
        districts: districtCode,
        type: CohortTypes.BLOCK,
        status: ["active"],
      },
      sort: ["name", "asc"],
    };

    const response = await getCohortList(reqParams);
    const cohortDetails = response?.results?.cohortDetails || [];

    const object = {
      controllingfieldfk: districtCode,
      fieldName: "blocks",
    };
    const optionReadResponse = await getStateBlockDistrictList(object);
    const result = optionReadResponse?.result?.values;

    console.log(cohortDetails);
    console.log(result);

    const matchedCohorts = result
      ?.map((value: any) => {
        const cohortMatch = cohortDetails.find(
          (cohort: any) => cohort?.name?.toLowerCase() === value?.label?.toLowerCase()
        );
        // Include cohortId if the match is found
        return cohortMatch ? { ...value, cohortId: cohortMatch.cohortId } : null;
      })
      .filter(Boolean);


    return matchedCohorts;
  } catch (error) {
    console.log("Error in getting Channel Details", error);
    return error;
  }
};


export const formatedStates = async () => {
  // const adminState = JSON.parse(
  //   localStorage.getItem("adminInfo") || "{}"
  // ).customFields.find(
  //   (field: any) => field.label === "STATES"
  // );
  try {
    const reqParams = {
      limit: 0,
      offset: 0,
      filters: {
        // name: searchKeyword,
       
        type: CohortTypes.STATE,
        status: ["active"],
      },
      sort: ["name", "asc"],
    };

    const response = await getCohortList(reqParams);
    const cohortDetails = response?.results?.cohortDetails || [];

    const object = {
      fieldName: "states",
    };
    const optionReadResponse = await getStateBlockDistrictList(object);
    const StateFieldId=optionReadResponse?.result?.fieldId;
    localStorage.setItem("stateFieldId", StateFieldId);
    const result = optionReadResponse?.result?.values;

    console.log(cohortDetails);
    console.log(result);

    const matchedCohorts = result
      ?.map((value: any) => {
        const cohortMatch = cohortDetails.find(
          (cohort: any) => cohort?.name?.toLowerCase() === value?.label?.toLowerCase()
        );
        return cohortMatch ? { ...value, cohortId: cohortMatch.cohortId } : null;
      })
      .filter(Boolean);

    return matchedCohorts;
  } catch (error) {
    console.log("Error in getting Channel Details", error);
    return error;
  }
};
