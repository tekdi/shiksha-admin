import { patch, put } from "./RestClient";

export interface UpdateCohortMemberStatusParams {
  memberStatus?: string;
  statusReason?: string;
  membershipId: string | number;
  dynamicBody?: Record<string, any>;
}

export const deleteUser = async (
  userId: string,
  userData: object
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/update/${userId}`;
  try {
    const response = await patch(apiUrl, userData);
    return response?.data;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};

export const updateCohortMember = async ({
  memberStatus,
  statusReason,
  membershipId,
  dynamicBody = {},
}: UpdateCohortMemberStatusParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/cohortmember/update/${membershipId}`;

  // Utility to stringify only the values of the customFields
  const prepareCustomFields = (customFields: any[]): any[] => {
    return customFields.map((field) => {
      if (field && field.value !== undefined) {
        return {
          ...field,
          value:
            typeof field.value === "object"
              ? JSON.stringify(field.value)
              : field.value,
        };
      }
      return field;
    });
  };

  // Build the request body dynamically
  const requestBody = {
    ...(memberStatus && { status: memberStatus }),
    ...(statusReason && { statusReason }),
    ...Object.entries(dynamicBody).reduce(
      (acc, [key, value]) => {
        acc[key] =
          typeof value === "object" && value !== null
            ? JSON.stringify(value)
            : value;
        return acc;
      },
      {} as Record<string, any>
    ),
    // Only stringify the `value` field of customFields if needed
    ...(dynamicBody?.customFields && {
      customFields: prepareCustomFields(dynamicBody.customFields),
    }),
  };

  try {
    const response = await put(apiUrl, requestBody);
    return response?.data;
  } catch (error) {
    console.error("error in attendance report api ", error);
    // throw error;
  }
};
