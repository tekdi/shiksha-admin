import { post, get } from "./RestClient";

export interface userListParam {
  limit?: number;
  //  page: number;
  filters: {
    cohortId?: any;
    role?: any;
    status?: any;
  };
  fields?: any;
  sort?: object;
  offset?: number;
  includeDisplayValues?: boolean;
}

export const userList = async ({
  limit,
  //  page,
  filters,
  sort,
  offset,
  fields,
  includeDisplayValues,
}: userListParam): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/list`;
  try {
    const response = await post(apiUrl, {
      limit,
      filters,
      sort,
      offset,
      fields,
      includeDisplayValues,
    });
    return response?.data?.result;
  } catch (error) {
    console.error("error in getting user list", error);
    throw error;
  }
};

export const cohortMemberList = async ({
  limit,
  filters,
  sort,
  offset,
  fields,
  includeDisplayValues,
}: userListParam): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohortmember/list`;
  try {
    const response = await post(apiUrl, {
      limit,
      filters,
      sort,
      offset,
      fields,
      includeDisplayValues,
    });
    return response?.data?.result;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn("No data found, returning empty result.");
      return {
        totalCount: 0,
        userDetails: [],
      }; // Return an empty result
    }
    console.error("Error in getting user list", error);
    throw error; // Re-throw other errors
  }
};

export const getUserDetailsInfo = async (
  userId?: string | string[],
  fieldValue: boolean = true
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/read/${userId}?fieldvalue=${fieldValue}`;
  try {
    const response = await get(apiUrl);
    return response?.data?.result;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};
