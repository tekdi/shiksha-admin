import useSubmittedButtonStore from "@/utils/useSharedState";
import { IChangeEvent, withTheme } from "@rjsf/core";
import { Theme as MaterialUITheme } from "@rjsf/mui";
import { RJSFSchema, RegistryFieldsType, WidgetProps } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useTranslation } from "next-i18next";
import React, { ReactNode, useEffect, useState } from "react";
import CustomRadioWidget from "./form/CustomRadioWidget";
import MultiSelectCheckboxes from "./form/MultiSelectCheckboxes";
import MultiSelectDropdown from "./form/MultiSelectDropdown";
const FormWithMaterialUI = withTheme(MaterialUITheme);
import { getCurrentYearPattern } from "@/utils/Helper";
import CustomNumberWidget from './CustomNumberWidget';
import CustomImageWidget from "./form/CustomImageWidget";
import {DynamicFormProps} from '../utils/Interfaces'
import UsernameWithSuggestions from "./form/UsernameWithSuggestions";
import { userNameExist } from "@/services/UserList";
import { FormContextType } from "@/utils/app.constant";
import { customValidation } from "./FormValidation";


const DynamicForm: React.FC<DynamicFormProps> = ({
  id,
  schema,
  uiSchema,
  formData,
  onSubmit,
  onChange,
  onError,
  customFields,
  children,
  isProgramFields=false,
  role,
  isEdit=false
}) => {
  const { t } = useTranslation();
  const [localFormData, setLocalFormData] = useState(formData ?? {});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [changedFormData, setChangedFormData] = useState( {});
  const [isGetUserName, setIsGetUserName] = useState<boolean>(false);
  const [storedSuggestions, setStoredSuggestions] = useState<string[]>([]);
   const submittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.submittedButtonStatus
  );
  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );
  const setUserEnteredEmail = useSubmittedButtonStore(
    (state: any) => state.setUserEnteredEmail
  );
  const setNoError = useSubmittedButtonStore((state: any) => state.setNoError);

  const widgets: any = {
    MultiSelectDropdown: MultiSelectDropdown,
    MultiSelectCheckboxes: MultiSelectCheckboxes,
    CustomRadioWidget: CustomRadioWidget,
    CustomNumberWidget: CustomNumberWidget,
    files: CustomImageWidget,
    UsernameWithSuggestions: UsernameWithSuggestions as React.FC<
    WidgetProps<any, RJSFSchema, any>
  >,

  };

  const handleError = (errors: any) => {
    if (errors.length === 0) { 
      // You can perform any additional action here when there are no errors
    } 
    if (errors.length > 0) {
      const property = errors[0].property?.replace(/^root\./, "");
      const errorField = document.querySelector(
        `[name$="${property}"]`
      ) as HTMLElement;

      if (errorField) {
        errorField.focus();
      } else {
        const fallbackField = document.getElementById(property) as HTMLElement;
        if (fallbackField) {
          fallbackField.focus();
        }
      }
    }
    onError(errors);
  };

  const handleSubmit = (
    event: IChangeEvent<any, RJSFSchema, any>,
    formEvent: React.FormEvent<any>
  ) => {
    if(isProgramFields)
    {
      event.formData=changedFormData

    }

    onSubmit(event, formEvent);
  };
  function getDifferences(obj1: any, obj2: any): any {
    const differences: any = {};

    for (const key in obj1) {
        if (obj1[key] !== obj2[key]) {
            differences[key] = obj1[key];
        }
    }

    for (const key in obj2) {
        if (!(key in obj1)) {
            differences[key] = obj2[key];
        }
    }

    return differences;
}

  const handleChange = async(event: IChangeEvent<any>) => {
    console.log("event.formData",event.formData);
     if(formData)
    {    const differences = getDifferences(event?.formData, formData);
      setChangedFormData(differences)
    }
     const cleanAndReplace = (data: any) => {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          data[key] = Array.from(
            new Set(
              data[key].filter((item: any) => item !== "")
              //.map((item: any) => (item === "_lifeskills" ? "life_skills" : item))
            )
          );
        }
      }
      return data;
    };

    const cleanedFormData = cleanAndReplace(event.formData);
  

    setLocalFormData(cleanedFormData);
    setUserEnteredEmail(cleanedFormData?.email);
    if (event.formData?.username !== formData?.username && (formData?.username||formData?.username==="")) {
      if (event.formData?.username !== '') {
        setIsGetUserName(false);
        setSuggestions([]);
      } else setSuggestions(storedSuggestions);
    }
    onChange({ ...event, formData: cleanedFormData });
  };


  const handleUsernameBlur = async (username: string) => {
   
    if (username && formData?.firstName && formData?.lastName  && role === FormContextType.STUDENT &&  !isGetUserName) {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: username,
      }
      await validateUsername(userData)     
    }
  };
  const handleFirstLastNameBlur = async (lastName: string) => {
    if (lastName && !isEdit && role === FormContextType.STUDENT &&  !isGetUserName) {
      try {
        // console.log('Username onblur called' ,formData);
        if(formData?.firstName && formData?.lastName){
          if( role === FormContextType.STUDENT){
            setLocalFormData((prev: any) => ({
              ...prev,
              username: formData.username ? formData.username :`${formData.firstName}${formData.lastName}`.toLowerCase(),
            }));
            const userData = {
              firstName: formData.firstName,
              lastName: formData.lastName,
              username: formData.username ? formData.username: `${formData.firstName}${formData.lastName}`.toLowerCase(),
            }
            await validateUsername(userData)  
           
          }
        }
      } catch (error) {
        setSuggestions([]);

        console.error('Error validating username:', error);
      }
    }
  };

  const handleSuggestionSelect = (selectedUsername: string) => {
 if( role === FormContextType.STUDENT)
       setLocalFormData((prev: any) => ({
        ...prev,
        username: selectedUsername,
      }));
      setIsGetUserName(true)
    setSuggestions([]);
  };


  const transformErrors = (errors: any) => {
    const currentYearPattern = new RegExp(getCurrentYearPattern());

    console.log("errors", errors);
    errors.length === 0 ? setNoError(true) : setNoError(false);

 

    return errors?.map((error: any) => {
      console.log("error.name", error.name)
      switch (error.name) {
        case "required": { 
          error.message = submittedButtonStatus
            ? t("FORM_ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD")
            : "";
          break;
        }
        case "maximum": {
          const property = error.property.substring(1);

          if (schema.properties?.[property]?.validation?.includes("numeric")) {
            if (property === "age") {
              error.message = t(
                "FORM_ERROR_MESSAGES.MAX_LENGTH_DIGITS_ERROR_AGE",
                {
                  maxLength: schema.properties?.[property]?.maxLength,
                }
              );
            }
          }
          break;
        }
        case "minimum": {
          const property = error.property.substring(1);
          if (schema.properties?.[property]?.validation?.includes("numeric")) {
            error.message = t("FORM_ERROR_MESSAGES.MIN_LENGTH_DIGITS_ERROR", {
              minLength: schema.properties?.[property]?.minLength,
            });

            if (property === "age") {
              error.message = t(
                "FORM_ERROR_MESSAGES.MIN_LENGTH_DIGITS_ERROR_AGE",
                {
                  minLength: schema.properties?.[property]?.minLength,
                }
              );
              //  error.message = `Age should be greater than or equal to ${error?.params?.limit}`
            }
          }
          break;
        }
        // case "dob": {
        //   const property = error.property.substring(1);
        //   console.log("property",property)
        //   const currentDate = new Date();
        //   if(localFormData?.dob)
        //   {
        //     console.log("localFormData?.dob",localFormData?.dob)
        //     const dobDate = new Date(localFormData?.dob);
        //     currentDate.setHours(0, 0, 0, 0);
        //     dobDate.setHours(0, 0, 0, 0);
        
        //     if (dobDate >= currentDate) {
        //       error.message = t("FORM_ERROR_MESSAGES.DATE_CANNOT_BE_TODAY")
        //     }

        //   }
        //   // if (localFormData[property] === today) {
        //   //   error.message = t("FORM_ERROR_MESSAGES.DATE_CANNOT_BE_TODAY");
        //   // }
        //   break;
        // }
        case "pattern": {
          const pattern = error?.params?.pattern; 
          const property = error.property.substring(1);

          switch (pattern) {
            case "^(?=.*[a-zA-Z])[a-zA-Z ]+$": {
              error.message = t(
                "FORM_ERROR_MESSAGES.NUMBER_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
              );
              break;
            }
            case "^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$": {
              error.message = t(
                "FORM_ERROR_MESSAGES.NUMBER_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
              );
              break;
            }
            case "^[a-zA-Z0-9.@]+$": {
              error.message = t(
                "FORM_ERROR_MESSAGES.SPACE_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
              );
              break;
            }
            case "^[0-9]{10}$": {
              if (
                schema.properties?.[property]?.validation?.includes("mobile")
              ) {
                error.message = t(
                  "FORM_ERROR_MESSAGES.ENTER_VALID_MOBILE_NUMBER"
                );
              } else if (
                schema.properties?.[property]?.validation?.includes(".age")
              ) {
                error.message = t("age must be valid");
              } else {
                error.message = t(
                  "FORM_ERROR_MESSAGES.CHARACTERS_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
                );
              }
              break;
            }
            case "^d{10}$": {
              error.message = t(
                "FORM_ERROR_MESSAGES.CHARACTERS_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
              );
              break;
            }
            
            default: {
              const validRange = currentYearPattern.test(pattern);
              if (!validRange) {
                error.message = t("FORM_ERROR_MESSAGES.ENTER_VALID_YEAR");
              }
              break;
            }
          }
          break;
        }
        case "minLength": {
          const property = error.property.substring(1);
          if (schema.properties?.[property]?.validation?.includes("numeric")) {
            error.message = t("FORM_ERROR_MESSAGES.MIN_LENGTH_DIGITS_ERROR", {
              minLength: schema.properties?.[property]?.minLength,
            });
          }
          break;
        }
        case "maxLength": {
          const property = error.property.substring(1);
          if (schema.properties?.[property]?.validation?.includes("numeric")) {
            error.message = t("FORM_ERROR_MESSAGES.MAX_LENGTH_DIGITS_ERROR", {
              maxLength: schema.properties?.[property]?.maxLength,
            });
          }
          break;
        }
        case "format": {
          const format = error?.params?.format;
          switch (format) {
            case "email": {
              error.message = t("FORM_ERROR_MESSAGES.ENTER_VALID_EMAIL");
            }
          }
        }
      }

      return error;
    });
  };
  const validateUsername = async (userData: { firstName: string; lastName: string; username: string }) => {
    try {
      if (suggestions.length === 0) {
        const response = await userNameExist(userData);
        setSuggestions([response?.suggestedUsername]);
        setStoredSuggestions([response?.suggestedUsername]);
        setIsGetUserName(false);
      }
     
    } catch (error) {
      setIsGetUserName(true);
     setSuggestions([]);
      console.error('Error validating username:', error);
    }
  };
  
 useEffect(() => {
   
    const updatedFormData = Object.fromEntries(
      Object.entries(localFormData)?.map(([key, value]) => [key, value === "undefined" ? "" : value])
    ); 
    setLocalFormData(updatedFormData);
  }, []);
  return (
    <div>
      <FormWithMaterialUI
        schema={schema}
        uiSchema={uiSchema}
        formData={localFormData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        validator={validator}
        liveValidate
        showErrorList={false}
        widgets={widgets}
        noHtml5Validate
        onError={handleError}
        transformErrors={transformErrors}
        fields={customFields}
        id={id}
        customValidate={customValidation(schema, t)}

        formContext={{
          suggestions,
          onSuggestionSelect: handleSuggestionSelect,
        }}
        onBlur={(field, value) => {
          if (field === 'username') {
            handleUsernameBlur(value);
          }
          if (field === 'root_lastName' || field === 'root_firstName') {
           handleFirstLastNameBlur(value);
          }
        }}
      >
        <style>{`.rjsf-default-submit { display: none !important; }`}</style>
        {children}
      </FormWithMaterialUI>
    </div>
  );
};

export default DynamicForm;
