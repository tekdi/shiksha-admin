import { SendCredentialsRequest } from '@/utils/Interfaces';
import { post, get } from './RestClient';

export const sendCredentialService = async ({
  isQueue,
  context,
  key,
  replacements,
  email,
}: SendCredentialsRequest): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/notification/send`;
  try {
    const response = await post(apiUrl, {
      isQueue,
      context,
      key,
      replacements,
      email,
    });
    return response?.data;
  } catch (error) {
    console.error('error in getting Assesment List Service list', error);

    return error;
  }
};


export const readUserId = async (
  userId?: string | string[],
  fieldValue?: boolean
): Promise<any> => {
  let apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/user/v1/read/${userId}?fieldvalue=false`;
  try {
    const response = await get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error("error in fetching user details", error);
    return error;
  }
};


export const sendNotification = async ({
  isQueue,
  context,
  key,
  push
}: SendCredentialsRequest): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/notification/send`;
  try {
    const response = await post(apiUrl, {
      isQueue,
      context,
      key,
      push
    });
    return response?.data?.result;
  } catch (error) {
    console.error('Error in sending notification', error);
    return error;
  }
};

