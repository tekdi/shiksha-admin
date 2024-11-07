import { SendCredentialsRequest } from '@/utils/Interfaces';
import { post, get } from './RestClient';

export const sendCredentialService = async ({
  isQueue,
  context,
  key,
  replacements,
  email,
  push
}: SendCredentialsRequest): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/notification/send`;
  try {
    const response = await post(apiUrl, {
      isQueue,
      context,
      key,
      replacements,
      email,
      push
    });
    return response?.data;
  } catch (error) {
    console.error('error in getting Assesment List Service list', error);

    return error;
  }
};


