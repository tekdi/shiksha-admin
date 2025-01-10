import { CohortMemberList } from "@/utils/Interfaces";
import { get, post, put } from "../RestClient";
import axios from 'axios';
import { showToastMessage } from "@/components/Toastify";

export interface cohortListFilter {
  type: string;
  status: string[];
  states: string;
  districts: string;
  blocks: string;
}

export interface cohortListData {
  limit?: Number;
  offset?: Number;
  filter?: any;
  status?: any;
}
export interface UpdateCohortMemberStatusParams {
  memberStatus: string;
  statusReason?: string;
  membershipId: string | number;
}
export const getCohortList = async (data: cohortListData): Promise<any> => {
  let apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohort/search`;

  try {
    const response = await post(apiUrl, data);
    return response?.data?.result;
  } catch (error) {
    console.error("Error in Getting cohort List Details", error);
    return error;
  }
};

export const updateCohortUpdate = async (
  userId: string,
  cohortDetails: any
): Promise<any> => {
  // const { name, status, type } = cohortDetails;
  let apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohort/update/${userId}`;

  try {
    const response = await put(apiUrl, cohortDetails);
    return response?.data;
  } catch (error) {
    console.error("Error in updating cohort details", error);
    throw error;
  }
};

export const getFormRead = async (
  context: string,
  contextType: string
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/form/read?context=${context}&contextType=${contextType}`;
  try {
    let response = await get(apiUrl);
    const sortedFields = response?.data?.result.fields?.sort(
      (a: { order: string }, b: { order: string }) =>
        parseInt(a.order) - parseInt(b.order)
    );
    const formData = {
      formid: response?.data?.result?.formid,
      title: response?.data?.result?.title,
      fields: sortedFields,
    };
    return formData;
  } catch (error) {
    console.error("error in getting cohort details", error);
    // throw error;
  }
};
export const createUser = async (userData: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/create`;
  try {
    const response = await post(apiUrl, userData);
    return response?.data?.result;
  } catch (error) {
    console.error("error in getting cohort list", error);
    // throw error;
  }
};

export const createCohort = async (userData: any, t?:any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohort/create`;

  try {

    const response = await post(apiUrl, userData);
    return response?.data;
  } catch (error) {
    console.error("error in getting cohort list", error);

    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        showToastMessage(t("COMMON.ALREADY_EXIST"), "error");

   
     } 
      else
     throw error;
  }
}};

export const fetchCohortMemberList = async ({
  limit,
  offset,
  filters,
}: CohortMemberList): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohortmember/list`;
  try {
    const response = await post(apiUrl, {
      limit,
      offset,
      filters,
      // sort: ["username", "asc"],
    });
    return response?.data;
  } catch (error) {
    console.error("error in cohort member list API ", error);
    // throw error;
  }
};



export const bulkCreateCohortMembers = async (payload: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohortmember/bulkCreate`;
  try {
    const response = await post(apiUrl, payload);
    return response.data;
  } catch (error) {
    console.error('Error in bulk creating cohort members', error);
    throw error;
  }
};


export const updateCohortMemberStatus = async ({
  memberStatus,
  statusReason,
  membershipId,
}: UpdateCohortMemberStatusParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohortmember/update/${membershipId}`;
  try {
    const response = await put(apiUrl, {
      status: memberStatus,
      statusReason,
    }); 
    return response?.data;
  } catch (error) {
    console.error('error in attendance report api ', error);
    // throw error;
  }
};
