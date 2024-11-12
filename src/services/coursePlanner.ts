import { CoursePlannerMetaData, GetSolutionDetailsParams, GetTargetedSolutionsParams, GetUserProjectTemplateParams } from "@/utils/Interfaces";
import { post } from "./RestClient";
import axios from 'axios';
import { frameworkId } from "../../app.config";



export const getChannelDetails = async (): Promise<any> => {
  const apiUrl: string = `/api/framework/v1/read/${frameworkId}`;

  try {
    const response = await axios.get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('Error in getting Channel Details', error);
    return error;
  }
};

export const getFrameworkDetails = async (frameworkId: string): Promise<any> => {
  const apiUrl: string = `/api/framework/v1/read/${frameworkId}?categories=gradeLevel,medium,class,subject`;

  try {
    const response = await axios.get(apiUrl);
    return response?.data;
  } catch (error) {
    console.error('Error in getting Framework Details', error);
    return error;
  }
};

export const uploadCoursePlanner = async (file: File, metaData: CoursePlannerMetaData): Promise<any> => {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/course-planner/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metaData', JSON.stringify(metaData));
    try {
      const response = await post(apiUrl, formData, {
      });
      return response?.data;
    } catch (error) {
      console.error('Error uploading course planner', error);
      throw error;
    }
  };



  export const getTargetedSolutions = async ({
    subject,
    state,

    medium,
    class: className,
    board,
    type,
  }: GetTargetedSolutionsParams): Promise<any> => {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/solutions/targetedSolutions?type=improvementProject&currentScopeOnly=true`;
  
    const headers = {
      'X-auth-token': localStorage.getItem('token'),
      'Content-Type': 'application/json',
    };
  
    const data = {
      subject,
      state,
     
      medium,
      class: className,
      board,
      type,
    };
  
    try {
      const response = await axios.post(apiUrl, data, { headers });
      return response?.data;
    } catch (error) {
      console.error('Error in getting Targeted Solutions', error);
      return error;
    }
  };
  interface GetUserProjectDetailsParams {
    id: string;
  }
  
  export const getUserProjectDetails = async ({ id }: GetUserProjectDetailsParams): Promise<any> => {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/userProjects/details/${id}`;
  
    const headers = {
      'Authorization': localStorage.getItem('token'),
      'Content-Type': 'application/json',
      'x-auth-token': localStorage.getItem('token'),
      
    };
  
    try {
      const response = await axios.post(apiUrl, {}, { headers });
      return response?.data;
    } catch (error) {
      console.error('Error in getting User Project Details', error);
      return error;
    }
  };
  
  
  export const getSolutionDetails = async ({ id, role }: GetSolutionDetailsParams): Promise<any> => {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/solutions/details/${id}`;
  
    const headers = {
      'X-auth-token': localStorage.getItem('token'),
      'Content-Type': 'application/json',
    };
  
    const data = {
      role,
    };
  
    try {
      const response = await axios.post(apiUrl, data, { headers });
      return response?.data;
    } catch (error) {
      console.error('Error in getting Solution Details', error);
      return error;
    }
  };
  
  export const getUserProjectTemplate = async ({
    templateId,
    solutionId,
    role,
  }: GetUserProjectTemplateParams): Promise<any> => {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/userProjects/details?templateId=${templateId}&solutionId=${solutionId}`;
  
    const headers = {
      'X-auth-token': localStorage.getItem('token'),
      'Content-Type': 'application/json',
    };
  
    const data = {
      role,
    };
  
    try {
      const response = await axios.post(apiUrl, data, { headers });
      return response?.data;
    } catch (error) {
      console.error('Error in getting User Project Details', error);
      throw error;
    }
  };
  


 
 