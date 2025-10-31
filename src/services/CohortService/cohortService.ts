import { CohortMemberList } from '@/utils/Interfaces';
import { get, post, put } from '../RestClient';

export interface cohortListFilter {
  type: string;
  status: string[];
  states: string;
  districts: string;
  blocks: string;
}

export interface cohortListData {
  limit?: Number;
  offset?: Number;
  filter?: any;
  filters?: any;
}
export interface UpdateCohortMemberStatusParams {
  memberStatus: string;
  statusReason?: string;
  membershipId: string | number;
  payload?: any;
}
export const getCohortList = async (data: cohortListData): Promise<any> => {
  let apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohort/search`;
  if (!data.filters) {
    data.filters = { status: ['active'] };
  } else if (!data.filters.status) {
    data.filters.status = ['active'];
  }
  try {
    const response = await post(apiUrl, data);
    return response?.data?.result;
  } catch (error) {
    console.error('Error in Getting cohort List Details', error);
    return error;
  }
};

export const getSchoolNames = async (): Promise<Record<string, {}>> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const schoolNamesStr = localStorage.getItem('schoolClusterNames');
    if (schoolNamesStr) {
      return JSON.parse(schoolNamesStr);
    } else {
      let schoolFilters = {
        limit: 0,
        offset: 0,
        filters: { type: 'SCHOOL', status: ['active'] },
      };
      const schoolRes = await getCohortList(schoolFilters);

      let clusterFilters = {
        limit: 0,
        offset: 0,
        filters: { type: 'CLUSTER', status: ['active'] },
      };
      const clusterRes = await getCohortList(clusterFilters);

      const schoolMap: Record<
        string,
        { code: string; name: string; clusterName: string }
      > = {};
      const schools = schoolRes?.results?.cohortDetails || [];
      const clusters = clusterRes?.results?.cohortDetails || [];
      if (!schools.length || !clusters.length) return schoolMap;

      schools.forEach((school: any) => {
        const cluster = clusters.find(
          (c: any) => c.cohortId === school.parentId
        );
        schoolMap[school.cohortId] = {
          code: school.cohortId,
          name: school.name,
          clusterName: cluster.name,
        };
      });

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('schoolClusterNames', JSON.stringify(schoolMap));
      }
      return schoolMap;
    }
  }
  return {};
};

export const getClusterNames = async (): Promise<Record<string, string>> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const clusterNamesStr = localStorage.getItem('clusterNames');
    if (clusterNamesStr) {
      return JSON.parse(clusterNamesStr);
    } else {
      let data = {
        limit: 0,
        offset: 0,
        filters: { type: 'CLUSTER', status: ['active'] },
      };
      const clusters = await getCohortList(data);
      const clusterMap: Record<string, string> = {};
      clusters.forEach((school: any) => {
        clusterMap[school.cohortId] = school.name;
      });

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('clusterNames', JSON.stringify(clusterMap));
      }
      return clusterMap;
    }
  }
  return {};
};

export const updateCohortUpdate = async (
  selectedCohortId: string,
  cohortDetails: any
): Promise<any> => {
  // const { name, status, type } = cohortDetails;
  let apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohort/update/${selectedCohortId}`;

  try {
    const response = await put(apiUrl, cohortDetails);
    return response?.data;
  } catch (error) {
    console.error('Error in updating cohort details', error);
    throw error;
  }
};

export const getFormRead = async (
  context: string,
  contextType: string
): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/form/read?context=${context}&contextType=${contextType}`;
  try {
    let response = await get(apiUrl);
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
  } catch (error) {
    console.error('error in getting cohort details', error);
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
    return error;
    // throw error;
  }
};

export const createCohort = async (userData: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohort/create`;
  try {
    const response = await post(apiUrl, userData);
    return response?.data?.result;
  } catch (error) {
    console.error('Error in creating Cohort', error);
    return error;
    // throw error;
  }
};

export const fetchCohortMemberList = async ({
  limit,
  page,
  filters,
}: CohortMemberList): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohortmember/list`;
  try {
    const response = await post(apiUrl, {
      limit,
      page,
      filters,
      // sort: ["username", "asc"],
    });
    console.log('data', response?.data);
    return response?.data;
  } catch (error) {
    console.error('error in cohort member list API ', error);
    // throw error;
  }
};

export const addCohortMembers = async (payload: any): Promise<any> => {
  if (!payload.selectAll) {
    const req = {
      userId: payload.userIds,
      cohortId: [payload.cohortId],
    };
    return await bulkCreateCohortMembers(req);
  } else {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/addMembersByfilter`;
    try {
      const req = {
        filters: payload.filters,
        cohortId: payload.cohortId,
      };
      const response = await post(apiUrl, req);
      return response;
    } catch (error) {
      console.error('Error in adding cohort members', error);
      throw error;
    }
  }
};

export const bulkCreateCohortMembers = async (payload: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohortmember/bulkCreate`;
  try {
    const response = await post(apiUrl, payload);
    return response.data;
  } catch (error) {
    console.error('Error in bulk creating cohort members', error);
    throw error;
  }
};

export const addCohortMember = async ({
  cohortId,
  userId,
}: any): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohortmember/create`;
  try {
    const response = await put(apiUrl, {
      cohortId,
      userId,
    });
    return response?.data;
  } catch (error) {
    console.error('error in attendance report api ', error);
    // throw error;
  }
};

export const updateCohortMember = async ({
  membershipId,
  payload,
}: UpdateCohortMemberStatusParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohortmember/update/${membershipId}`;
  try {
    const response = await put(apiUrl, payload);
    return response?.data;
  } catch (error) {
    console.error('error in attendance report api ', error);
    // throw error;
  }
};

export const updateCohortMemberStatus = async ({
  memberStatus,
  statusReason,
  membershipId,
}: UpdateCohortMemberStatusParams): Promise<any> => {
  const apiUrl: string = `${process.env.NEXT_PUBLIC_BASE_URL}/cohortmember/update/${membershipId}`;
  try {
    const response = await put(apiUrl, {
      status: memberStatus,
      statusReason,
    });
    return response?.data;
  } catch (error) {
    console.error('error in attendance report api ', error);
    // throw error;
  }
};
