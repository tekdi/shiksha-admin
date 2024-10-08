import { get, post, patch } from "./RestClient";
import { createUserParam } from "../utils/Interfaces";
import axios from "axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";

export interface UserDetailParam {
  userData?: object;

  customFields?: any;
}
export const getFormRead = async (
  context: string,
  contextType: string,
): Promise<any> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/form/read`,
      {
        params: {
          context,
          contextType,
        },
        paramsSerializer: (params) => {
          return Object.entries(params)
            ?.map(([key, value]) => `${key}=${value}`)
            .join("&");
        },
        headers: { tenantId: "ef99949b-7f3a-4a5f-806a-e67e683e38f3" },
      },
    );

    const sortedFields = response?.data?.result.fields?.sort(
      (a: { order: string }, b: { order: string }) =>
        parseInt(a.order) - parseInt(b.order),
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
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/create`;
  try {
    const response = await post(apiUrl, userData);
    return response?.data?.result;
  } catch (error) {
    console.error('error in getting cohort list', error);
    // throw error;
  }
};

export const updateUser = async (
  userId: string,
  { userData, customFields }: UserDetailParam,
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/update/${userId}`;
  try {
    const response = await patch(apiUrl, { userData, customFields });
    return response;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};
