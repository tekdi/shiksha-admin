import { deleteApi, patch, post } from "./RestClient";

export interface CenterListParam {
  limit?: number;

  filters?: any;
  offset?: number;
}

// Define the interface to ensure consistency
export interface StateListParam {
  limit?: number;
  offset?: number;
  controllingfieldfk?: string;
  fieldName: string;
  optionName?: string;
  sort?: [string, string]; //
}

export const getStateBlockDistrictList = async ({
  controllingfieldfk,
  fieldName,
  limit,
  offset,
  optionName,
  sort,
}: StateListParam): Promise<any> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/fields/options/read`;

  const requestBody: StateListParam = {
    fieldName,
    limit,
    offset,
    sort,
  };
  if (controllingfieldfk) {
    requestBody.controllingfieldfk = controllingfieldfk;
  }
  if (optionName) {
    requestBody.optionName = optionName;
  }
  try {
    const response = await post(apiUrl, requestBody);
    return response?.data;
  } catch (error) {
    console.error("Error in fetching state, block, and district list", error);
    throw error;
  }
};
export const getDistrictsForState = async ({
  limit,
  offset,
  controllingfieldfk,
  fieldName,
  sort,
}: {
  limit: number;
  offset: number;
  controllingfieldfk: string | undefined;
  fieldName: string;
  optionName?: string;
  sort?: [string, string];
}): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/fields/options/read`;
  try {
    const response = await post(apiUrl, {
      limit,
      offset,
      controllingfieldfk,
      fieldName,
      sort,
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching district data", error);
    return error;
  }
};

export const getBlocksForDistricts = async ({
  controllingfieldfk,
  fieldName,
}: {
  controllingfieldfk: string;
  fieldName: string;
}): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/fields/options/read`;
  try {
    const response = await post(apiUrl, {
      controllingfieldfk,
      fieldName,
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching district data", error);
    return error;
  }
};

export const getCenterList = async ({
  filters,
  limit,
  offset,
}: CenterListParam): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohort/search`;
  try {
    const response = await post(apiUrl, {
      filters,
      limit,
      offset,
    });
    return response?.data;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};

export const deleteOption = async (
  type: "states" | "districts" | "blocks",
  option: string
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/fields/options/delete/${type}?option=${option}`;
  const requestBody = {};
  const requestHeaders = {};

  try {
    const response = await deleteApi(apiUrl, requestBody, requestHeaders);
    return response?.data;
  } catch (error) {
    console.error(`Error deleting ${type}`, error);
    return error;
  }
};

export const createOrUpdateOption = async (
  fieldId: string,
  fieldParams: { options: { name: string; value: string }[] },
  stateId?: string
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/fields/update/${fieldId}`;

  if (stateId) {
    try {
      const response = await patch(apiUrl, { fieldParams, stateId });
      return response?.data;
    } catch (error) {
      console.error("Error updating state", error);
      return error;
    }
  } else {
    try {
      const response = await patch(apiUrl, { fieldParams });
      return response?.data;
    } catch (error) {
      console.error("Error creating state", error);
      return error;
    }
  }
};
