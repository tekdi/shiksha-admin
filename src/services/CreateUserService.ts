import { get, post, patch } from "./RestClient";
import { createUserParam } from "../utils/Interfaces";
import axios from "axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { TENANT_ID } from "../../app.config";

export interface UserDetailParam {
  userData?: object;

  customFields?: any;
}
export const getFormRead = async (
  context: string,
  contextType: string
): Promise<any> => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/form/read`,
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
          headers: {
            tenantId: TENANT_ID,
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    }
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

export const updateUser = async (
  userId: string,
  { userData, customFields }: UserDetailParam
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/update/${userId}`;
  try {
    const response = await patch(apiUrl, { userData, customFields });
    return response;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};
