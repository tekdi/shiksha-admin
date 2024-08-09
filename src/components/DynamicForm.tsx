import useSubmittedButtonStore from "@/utils/useSharedState";
import { IChangeEvent, withTheme } from "@rjsf/core";
import { Theme as MaterialUITheme } from "@rjsf/mui";
import { RJSFSchema, RegistryFieldsType, WidgetProps } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useTranslation } from "next-i18next";
import React, { ReactNode, useEffect, useState } from "react";
import CustomRadioWidget from "./CustomRadioWidget";
import MultiSelectCheckboxes from "./MultiSelectCheckboxes";
const FormWithMaterialUI = withTheme(MaterialUITheme);

interface DynamicFormProps {
  schema: any;
  uiSchema: object;
  formData?: object;
  onSubmit: (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>,
  ) => void | Promise<void>;
  onChange: (event: IChangeEvent<any>) => void;
  onError: (errors: any) => void;
  showErrorList: boolean;
  id?: string; // Optional id prop


  widgets: {
    [key: string]: React.FC<WidgetProps<any, RJSFSchema, any>>;
  };
  customFields: {
    [key: string]: React.FC<RegistryFieldsType<any, RJSFSchema, any>>;
  };
  children?: ReactNode;
  
}

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
  
}) => {
  const { t } = useTranslation();
  const [localFormData, setLocalFormData] = useState(formData || {});
  const submittedButtonStatus = useSubmittedButtonStore((state: any) => state.submittedButtonStatus);
  const setSubmittedButtonStatus = useSubmittedButtonStore((state:any) => state.setSubmittedButtonStatus);

  const widgets: any = {
    MultiSelectCheckboxes: MultiSelectCheckboxes,
    CustomRadioWidget: CustomRadioWidget
  };

  const handleError = (errors: any) => {
    console.log("handle error1", errors);
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
    console.log("Submit button clicked");
   
    onSubmit(event, formEvent);
  };

  const handleChange = (event: IChangeEvent<any>) => {
    const cleanAndReplace = (data: any) => {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          data[key] = Array.from(
            new Set(
              data[key]
                .filter((item: any) => item !== "")
                //.map((item: any) => (item === "_lifeskills" ? "life_skills" : item))
            )
          );
        }
      }
      return data;
    };

    const cleanedFormData = cleanAndReplace(event.formData);
    console.log("Form data changed:", cleanedFormData);

    setLocalFormData(cleanedFormData); 
    // Update local form data state
    onChange({ ...event, formData: cleanedFormData });
  };

  const transformErrors = (errors: any) => {
    console.log("errors", errors);
    console.log("schema", schema);
    //if (!submitted) return [];

    return errors?.map((error: any) => {
      switch (error.name) {
        case "required": {
         // console.log(submittedButtonStatus);
          error.message = submittedButtonStatus? t("FORM_ERROR_MESSAGES.THIS_IS_REQUIRED_FIELD") : "";
          break;
        }
        case "maximum": {
          const property = error.property.substring(1);

          if (schema.properties?.[property]?.validation?.includes("numeric")) {
            error.message = t("FORM_ERROR_MESSAGES.MAX_LENGTH_DIGITS_ERROR", {
              maxLength: schema.properties?.[property]?.maxLength
            });
          }
          break;
        }
        case "minimum": {
          const property = error.property.substring(1);
          if (schema.properties?.[property]?.validation?.includes("numeric")) {
            error.message = t("FORM_ERROR_MESSAGES.MIN_LENGTH_DIGITS_ERROR", {
              minLength: schema.properties?.[property]?.minLength
            });
          }
          break;
        }
        case "pattern": {
          const pattern = error?.params?.pattern;
          console.log(pattern);
          const property = error.property.substring(1);

          switch (pattern) {
            case '^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$': {
              error.message = t(
                "FORM_ERROR_MESSAGES.NUMBER_AND_SPECIAL_CHARACTERS_NOT_ALLOWED",
              );
              break;
            }
            case "^[0-9]{10}$": {
              if (
                schema.properties?.[property]?.validation?.includes("mobile")
              ) {
                error.message = t(
                  "FORM_ERROR_MESSAGES.ENTER_VALID_MOBILE_NUMBER",
                );
              } else if (
                schema.properties?.[property]?.validation?.includes(".age")
              ) {
                error.message = t("age must be valid");
              } else {
                error.message = t(
                  "FORM_ERROR_MESSAGES.CHARACTERS_AND_SPECIAL_CHARACTERS_NOT_ALLOWED",
                );
              }
              break;
            }
            case "^d{10}$": {
              error.message = t(
                "FORM_ERROR_MESSAGES.CHARACTERS_AND_SPECIAL_CHARACTERS_NOT_ALLOWED",
              );
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
  useEffect(() => {
    setSubmittedButtonStatus(false)

  }, []);
  return (
    <div >
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
      >
                <style>{`.rjsf-default-submit { display: none !important; }`}</style>

        {children}
        
      </FormWithMaterialUI>
    </div>
  );
};

export default DynamicForm;
