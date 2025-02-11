import axios from "axios";
import { get, post } from "./RestClient";

interface LoginParams {
  username: string;
  password: string;
}

interface RefreshParams {
  refresh_token: string;
}

export const login = async ({
  username,
  password,
}: LoginParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/interface/v1/account/login`;

  try {
    const response = await axios.post(apiUrl, { username, password });
    return response?.data;
  } catch (error) {
    console.error("error in login", error);
    throw error;
  }
};

export const refresh = async ({
  refresh_token,
}: RefreshParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/interface/v1/account/auth/refresh`;
  try {
    const response = await post(apiUrl, { refresh_token });
    return response?.data;
  } catch (error) {
    console.error("error in login", error);
    throw error;
  }
};

export const logout = async (refreshToken: string): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/interface/v1/account/auth/logout`;
  try {
    const response = await post(apiUrl, { refresh_token: refreshToken });
    return response;
  } catch (error) {
    console.error("error in logout", error);
    throw error;
  }
};

export const getUserId = async (): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/interface/v1/user/auth`;
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    const response =   await axios.get(apiUrl,{headers});
    return response?.data?.result;
  } catch (error) {
    console.error("error in fetching user details", error);
    throw error;
  }
};

export const resetPassword = async (
  newPassword: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/interface/v1/user/reset-password`;
  try {
    const response = await post(apiUrl, { newPassword });
    return response?.data;
  } catch (error) {
    console.error('error in reset', error);
    throw error;
  }
};