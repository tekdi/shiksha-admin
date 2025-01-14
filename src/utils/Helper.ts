import FingerprintJS from "fingerprintjs2";
import { getUserDetailsInfo } from "../services/UserList";
import { Role, FormContextType, FormValues, InputTypes } from "./app.constant";
import { State } from "./Interfaces";
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

interface Value {
  value: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  cohortId?: string;
}

interface CohortDetail {
  cohortId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}
export const generateUUID = () => {
  let d = new Date().getTime();
  let d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const getUserName = async (
  userId: string,
  fieldValue: boolean = true
) => {
  try {
    const userDetails = await getUserDetailsInfo(userId, fieldValue); 
    return userDetails?.userData?.name; // Accessing the name property from userData
  } catch (error) {
    console.error("Error in fetching user name:", error);
    return null;
  }
};

export const getDeviceId = () => {
  return new Promise((resolve) => {
    FingerprintJS.get((components: any[]) => {
      const values = components?.map((component) => component.value);
      const deviceId = FingerprintJS.x64hash128(values.join(""), 31);
      resolve(deviceId);
    });
  });
};

export const generateUsernameAndPassword = (
  stateCode: string,
  role: string,
  yearOfJoining?: string
) => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // Last two digits of the current year
  const randomNum = Math.floor(10000 + Math.random() * 90000).toString(); //NOSONAR

  const rolePrefixes: Record<string, string> = {
    [FormContextType.TEACHER]: "FSC",
    [FormContextType.STUDENT]: "SC",
    [FormContextType.TEAM_LEADER]: "TLSC",
    [FormContextType.CONTENT_CREATOR]: "SCTA", //prefix is not fix till now assume this SCTA(State Content Team Associate)
  };

  if (!(role in rolePrefixes)) {
    console.warn(`Unknown role: ${role}`); // Log a warning for unknown roles
    return null; // Return null or handle as needed
  }
  const yearSuffix = yearOfJoining ? yearOfJoining?.slice(-2) : currentYear;
  const prefix = rolePrefixes[role];
  const username = `${prefix}${stateCode}${yearSuffix}${randomNum}`;

  return { username, password: randomNum };
};

export const transformLabel = (label: string): string => {
  if (!label) {
    return label;
  }
  return label
    .toLowerCase() // Convert to lowercase to standardize
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

export const transformArray = (arr: State[]): State[] => {
  if (!arr || !Array.isArray(arr)) {
    return arr;
  }
  return arr?.map((item) => ({
    ...item,
    label: transformLabel(item.label),
  }));
};

export const firstLetterInUpperCase = (label: string): string => {
  if (!label) {
    return "";
  }

  return label
    ?.split(" ")
    ?.map((word) => word?.charAt(0).toUpperCase() + word?.slice(1))
    ?.join(" ");
};
export const capitalizeFirstLetterOfEachWordInArray = (
  arr: string[]
): string[] => {
  if (!arr) {
    return arr;
  } 
  return arr?.map((str) =>
    str?.replace(/\b[a-z]/g, (char) => char.toUpperCase())
  );
};
export const fieldTextValidation = (text: string) => {
  if (!text) {
    return false;
  }
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(text);
};

export const getCurrentYearPattern = () => {
  const currentYear = new Date().getFullYear();

  // Build the dynamic part for the current century
  let regexPart = "";
  if (currentYear >= 2000 && currentYear < 2100) {
    const lastDigit = currentYear % 10;
    const middleDigit = Math.floor((currentYear % 100) / 10);

    regexPart = `20[0-${middleDigit - 1}][0-9]|20${middleDigit}[0-${lastDigit}]`;
  }

  // Full regex covering 1900–1999, 2000 to current year
  return `^(19[0-9]{2}|${regexPart})$`;
};

export const mapFields = (formFields: any, Details: any) => {
  const initialFormData: any = {}; 

  formFields.fields.forEach((item: any) => {
    const customFieldValue = Details?.customFields?.find(
      (field: any) => field.fieldId === item.fieldId
    );

    const getValue = (data: any, field: any) => {
      if (item.default) {
        return item.default;
      }
      if (item?.isMultiSelect) {
        if (data[item.name] && item?.maxSelections > 1) {
          return [field?.value];
        } else if (item?.type === InputTypes.CHECKBOX) {
          return String(field?.value).split(",");
        } else {
          return field?.value?.toLowerCase();
        }
      } else if (item?.type === InputTypes.RADIO) {
        if (
          field?.value === FormValues?.REGULAR ||
          field?.value === FormValues?.REMOTE
        ) {
          return field?.code;
        }
        return field?.value || null;
      } else if (item?.type === InputTypes.NUMERIC) {
        return parseInt(String(field?.value));
      } else if (item?.type === InputTypes.TEXT) {
        return String(field?.value);
      } else {
        if (
          field?.value === FormValues.FEMALE ||
          field?.value === FormValues.MALE
        ) {
          return field?.value?.toLowerCase();
        }
        return field?.value?.toLowerCase();
      }
    };

    if (item.coreField) {
      if (item?.isMultiSelect) {
        if (Details[item.name] && item?.maxSelections > 1) {
          initialFormData[item.name] = [Details[item.name]];
        } else if (item?.type === "checkbox") {
          initialFormData[item.name] = String(Details[item.name]).split(",");
        } else {
          initialFormData[item.name] = Details[item.name];
        }
      } else if (item?.type === "radio") {
        initialFormData[item.name] = Details[item.name] || null;
      } else if (item?.type === "numeric") {
        initialFormData[item.name] = Number(Details[item.name]);
      } else if (item?.type === "text" && Details[item.name]) {
        initialFormData[item.name] = String(Details[item.name]);
      } else {
        if (Details[item.name]) {
          initialFormData[item.name] = Details[item.name];
        }
      }
    } else {
      const fieldValue = getValue(Details, customFieldValue);

      if (fieldValue) {
        initialFormData[item.name] = fieldValue;
      }
    }
  });
 
  return initialFormData;
};

// Helper function to get options by category
export const getOptionsByCategory = (frameworks: any, categoryCode: string) => {
  // Find the category by code
  const category = frameworks.categories.find(
    (category: any) => category.code === categoryCode
  );

  // Return the mapped terms
  return category.terms.map((term: any) => ({
    name: term.name,
    code: term.code,
    associations: term.associations,
  }));
};

interface Association {
  identifier: string;
  code: string;
  name: string;
  category: string;
  status: string;
  [key: string]: any; // To include any additional fields
}

interface DataItem {
  name: string;
  code: string;
  associations: Association[];
}
export const getAssociationsByCode = (
  data: DataItem[],
  code: string
): Association[] | [] => {
  const foundItem = data.find((item) => item.code === code);
  return foundItem ? foundItem.associations : [];
};

export const getAssociationsByName = (
  data: DataItem[],
  name: string
): Association[] | [] => {
  const foundItem = data.find((item) => item.name === name);
  return foundItem ? foundItem.associations : [];
};

export const findCommonAssociations = (data1: any[], data2: any[]) => {
  return data1
    .map((item1) => {
      const item2 = data2.find((item) => item.code === item1.code);
      if (item2) {
        const commonAssociations = item1.associations.filter((assoc1: any) =>
          item2.associations.some(
            (assoc2: any) => assoc1.identifier === assoc2.identifier
          )
        );
        return {
          name: item1.name,
          code: item1.code,
          associations: commonAssociations,
        };
      }
      return null;
    })
    .filter(Boolean);
};

export function mergeCohortDetails(
  values: Value[],
  cohortDetails: CohortDetail[]
): Value[] {
  const filteredValues = values.map((value) => ({
    value: value.value,
    label: value.label,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    createdBy: value.createdBy,
    updatedBy: value.updatedBy,
  }));

  const newValues = cohortDetails.map((cohort) => ({
    value: cohort.name,
    label: cohort.name,
    createdAt: cohort.createdAt,
    updatedAt: cohort.updatedAt,
    createdBy: cohort.createdBy,
    updatedBy: cohort.updatedBy,
    cohortId: cohort.cohortId,
  }));

  return [...filteredValues, ...newValues];
}

interface DataItem {
  name: string;
  code: string;
  associations: Association[];
}

export const normalizeData = (data: any[]): DataItem[] => {
  if (!Array.isArray(data)) {
    console.warn("Invalid data format:", data);
    return [];
  }

  return data.flatMap((item) => {
    // Handle first data structure
    if (item.boards && Array.isArray(item.boards)) {
      return item.boards.map((board: any) => ({
        name: board.name || "",
        code: board.code || "",
        associations: item.associations || [],
      }));
    }

    return {
      name: item.name || "",
      code: item.code || "",
      associations: item.associations || [],
    };
  });
};

export const getAssociationsByCodeNew = (
  data: DataItem[] = [],
  code: string
): Association[] => {
  const normalizedData = normalizeData(data);

  const foundItem = normalizedData.find((item) => item.name === code);
  return foundItem?.associations || [];
};

export const getYouTubeThumbnail = (url: string): string => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);

  if (match && match[1]) {
    const videoId = match[1];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } else {
    return "";
  }
};

export const filterAndMapAssociations = (
  category: string,
  options: any[],
  associationsList?: any[],
  codeKey: string = "code"
) => {
  if (!Array.isArray(options)) {
    console.error("Options is not an array:", options);
    return [];
  }

  if (!associationsList || associationsList.length === 0) {
    return [];
  }

  return options
    ?.filter((option) => {
      const optionCode = option[codeKey];

      return associationsList.some(
        (assoc) => assoc[codeKey] === optionCode && assoc.category === category
      );
    })
    .map((option) => ({
      name: option.name,
      code: option.code,
      associations: option.associations || [],
    }));
};


export const dataURLToBlob = (dataURLs: string[]): Blob[] => {
  return dataURLs.map((dataURL) => { 
    const [header, base64Data] = dataURL.split(",");
    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch) {
      throw new Error("Invalid data URL format");
    }
    const mimeType = mimeTypeMatch[1]; 
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mimeType });
  });
};



export const getFilenameFromDataURL = (dataURLs: string[]): (string | null)[] => {
  return dataURLs?.map((dataURL) => {
    // Check if the dataURL has a custom filename parameter
    const matches = dataURL.match(/filename=([^;&]+)/); // Look for `filename` in the query
    if (matches && matches[1]) {
      return decodeURIComponent(matches[1]);
    }

    return null;
  });
};
const convertImageUrlToDataUrl = async (imageUrl: string): Promise<string> => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image URL to Data URL:', error);
    throw new Error('Failed to convert image to data URL');
  }
};

export default async ({req, res}: any) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const dataUrl = await convertImageUrlToDataUrl(imageUrl);
    res.status(200).json({ dataUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to convert image' });
  }
};

export const convertAllImagesToDataUrls = async (imageUrls: string[]) => {
  const dataUrls: string[] = [];

  for (const imageUrl of imageUrls) {
    const dataUrl = await convertImageUrlToDataUrl(imageUrl);
    dataUrls.push(dataUrl);
  }

  return dataUrls;
};


export function convertImageToDataURL(imagePath: string, callback: any) {
  // Fetch the image as a blob
  fetch(imagePath)
      .then(response => response.blob())
      .then(blob => {
          // Create a FileReader to convert the blob into a Data URL
          const reader = new FileReader();
          
          reader.onloadend = function() {
              // This is the Data URL of the image
              const dataUrl = reader.result;
              callback(dataUrl);  // Call the callback with the Data URL
          };
          
          // Read the blob as a Data URL
          reader.readAsDataURL(blob);
      })
      .catch(error => console.error("Error converting image:", error));
}
