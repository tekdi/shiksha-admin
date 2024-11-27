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

interface DynamicFormProps {
  schema: any;
  uiSchema: object;
  formData?: object;
  onSubmit: (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => void | Promise<void>;
  onChange: (event: IChangeEvent<any>) => void;
  onError: (errors: any) => void;
  showErrorList: boolean;
  id?: string; // Optional id prop

  widgets?: {
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
  const [localFormData, setLocalFormData] = useState(formData ?? {});
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
  };

  const handleError = (errors: any) => {
    if (errors.length === 0) {
      console.log("No errors");
      // You can perform any additional action here when there are no errors
    }
    console.log("handle error1");
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
              data[key].filter((item: any) => item !== "")
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
    setUserEnteredEmail(cleanedFormData?.email);
    onChange({ ...event, formData: cleanedFormData });
  };

  const transformErrors = (errors: any) => {
    const currentYearPattern = new RegExp(getCurrentYearPattern());

    console.log("errors", errors);
    errors.length === 0 ? setNoError(true) : setNoError(false);

    console.log("schema", schema);

    return errors?.map((error: any) => {
      switch (error.name) {
        case "required": {
          console.log(submittedButtonStatus);
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
        case "pattern": {
          const pattern = error?.params?.pattern;
          console.log(pattern);
          const property = error.property.substring(1);

          switch (pattern) {
            case "^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$": {
              error.message = t(
                "FORM_ERROR_MESSAGES.NUMBER_AND_SPECIAL_CHARACTERS_NOT_ALLOWED"
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
  useEffect(() => {
    // setSubmittedButtonStatus(false);
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
      >
        <style>{`.rjsf-default-submit { display: none !important; }`}</style>
        {children}
      </FormWithMaterialUI>
    </div>
  );
};

export default DynamicForm;
