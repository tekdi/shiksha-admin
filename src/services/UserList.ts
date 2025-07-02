import { post, get } from "./RestClient";

export interface userListParam {
  limit: number;
  //  page: number;
  filters: {
    role: string;
    status?: string;
    states?: string;
    districts?: string;
    blocks?: string;
  };
  fields?: any;
  sort?: object;
  offset: number;
}

export const userList = async ({
  limit,
  //  page,
  filters,
  sort,
  offset,
  fields,
}: userListParam): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/list`;
  try {
    const response = await post(apiUrl, {
      limit,
      filters,
      sort,
      offset,
      fields,
    });
    return response?.data?.result;
  } catch (error) {
    console.error("error in getting user list", error);
    throw error;
  }
};

export const getEligibleUsers = async ({
  cohortId,
  limit,
  offset,
  filters
}: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/eligible`;
  try {
    const response = await post(apiUrl,{
    cohortId: cohortId,
    offset,
    limit,
    filters: filters
  })
    return response?.data?.result;
  } catch (error) {
    console.error("error in getting user list", error);
    throw error;
  }
};

export const cohortMemberList = async ({
  limit,
  //  page,
  filters,
  sort,
  offset,
  fields,
}: userListParam): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohortmember/list`;
  try {
    const response = await post(apiUrl, {
      limit,
      filters,
      sort,
      offset,
      fields,
    });
    return response?.data?.result;
  } catch (error) {
    console.error("error in getting user list", error);
    throw error;
  }
};

export const getUserDetailsInfo = async (
  userId?: string | string[],
  fieldValue?: boolean,
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/read/${userId}?fieldvalue=true`;
  try {
    const response = await get(apiUrl);
    return response?.data?.result;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};
