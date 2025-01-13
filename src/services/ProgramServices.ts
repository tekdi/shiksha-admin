import { showToastMessage } from "@/components/Toastify";
import { get, patch, deleteApi } from "./RestClient";
import { post } from "./RestClient";
import axios from "axios";
export interface programListData {
  limit?: Number;
  offset?: Number;
  filters?: any;
}
export const getProgramList = async (
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/tenant/read`;
  try {
    const response = await get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};

export const createProgram = async (programData: FormData,   t?:any
  ): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/tenant/create`;
  try {
    const headers = {
      'Content-Type': 'multipart/form-data' 
    };
    const response = await post(apiUrl, programData, 
      headers
     
    );
    return response?.data?.result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        showToastMessage(t("PROGRAM_MANAGEMENT.PROGRAM_ALREADY_EXISTS"), "error");
     } 
    }
    console.error("Error in creating user", error);
    throw error;
  }
};

export const updateProgram = async (programData: any, tenantId: string): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/tenant/update/${tenantId}`;
  try {
   
    const response = await patch(apiUrl, programData, 
     
    );
    return response?.data?.result;
  } catch (error) {
    console.error("Error in creating user", error);
    throw error;
  }
};
export const deleteProgram = async ( tenantId: string): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/tenant/delete/${tenantId}`;
  try {
   
    const response = await deleteApi(apiUrl);
    return response?.data?.result;
  } catch (error) {
    console.error("Error in creating user", error);
    throw error;
  }
};

export const programSearch = async (data: programListData): Promise<any> => {
  let apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/tenant/search`;

  try {
    const response = await post(apiUrl, data);
    return response?.data?.result;
  } catch (error) {
    console.error("Error in Getting cohort List Details", error);
    return error;
  }
};
