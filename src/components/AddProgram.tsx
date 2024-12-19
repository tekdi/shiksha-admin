import DynamicForm from "@/components/DynamicForm";
import {
  GenerateSchemaAndUiSchema,
  customFields,
} from "@/components/GeneratedSchemas";
import { createProgram } from "@/services/ProgramServices";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { Box, Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import SimpleModal from "./SimpleModal";
import { dataURLToBlob, getFilenameFromDataURL } from "@/utils/Helper";

interface AddProgramModalProps {
  open: boolean;
  onClose: () => void;
}
const AddProgram: React.FC<AddProgramModalProps> = ({ open, onClose }) => {
  const [programName, setProgramName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [formValue, setFormValue] = useState<any>();
  const [schema, setSchema] = React.useState<any>();
  const [uiSchema, setUiSchema] = React.useState<any>();

  const [programLogo, setProgramLogo] = useState<File | null>(null);
  const { t, i18n } = useTranslation();
  const fetchPrograms = useSubmittedButtonStore(
    (state: any) => state.fetchPrograms
  );
  const setFetchPrograms = useSubmittedButtonStore(
    (state: any) => state.setFetchPrograms
  );
  const handleProgramNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProgramName(event.target.value);
  };
  const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDomainName(event.target.value);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setProgramLogo(event.target.files[0]);
    }
  };

  const handleSubmit = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    // event.preventDefault();
    console.log("data?.formData", data);
    // Prepare FormData
    // const formData = new FormData(data);
    // // formData.append('name', programName);
    // // formData.append('domain', domainName);

    // // if (programLogo) {
    // //   formData.append('programImage', programLogo);
    // // }

    try {

      let binaryFile: Blob | undefined;
      if (data?.formData?.programImages) {
        binaryFile = dataURLToBlob(data?.formData?.programImages);
      }

      const fileName = getFilenameFromDataURL(data?.formData?.programImages) || 'image.png';
      delete data?.formData?.programImages;

      const formData = new FormData();
      for (const key in data?.formData) {
        formData.append(key, data?.formData[key]);
      }


      formData.append("programImages", binaryFile as Blob, fileName);

      const result = await createProgram(formData);
      setFetchPrograms(!fetchPrograms);
      onClose();
      console.log("Program created successfully:", result);
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };
  useEffect(() => {
    const getAddUserFormData = () => {
      try {
        // const response: FormData = await getFormRead(
        //   FormContext.USERS,
        //   userType
        // );
        // const response2= await getFormRead(
        //   FormContext.USERS,
        //   userType
        // );
        // console.log("sortedFields", response);
        const d: any = {
          formid: "ae7113bf-0a75-4929-bc35-696a02214022",
          title: "CREATE PROGRAM",
          fields: [
            {
              hint: null,
              name: "name",
              type: "text",
              label: "PROGRAM_NAME",
              order: "0",
              fieldId: null,
              options: [],
              pattern: "^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$",
              coreField: 1,
              dependsOn: null,
              maxLength: null,
              minLength: null,
              isEditable: true,
              isPIIField: null,
              isRequired: true,
              validation: ["string"],
              placeholder: "ENTER_PROGRAM_NAME",
              isMultiSelect: false,
              maxSelections: 0,
              sourceDetails: {},
            },
            {
              hint: null,
              name: "description",
              type: "text",
              label: "DESCRIPTION",
              order: "1",
              fieldId: null,
              options: [],
              pattern: null,
              coreField: 1,
              dependsOn: null,
              maxLength: null,
              minLength: null,
              isEditable: true,
              isPIIField: null,
              isRequired: true,
              validation: ["string"],
              placeholder: "ENTER_DESCRIPTION",
              isMultiSelect: false,
              maxSelections: 0,
              sourceDetails: {},
            },
            {
              hint: null,
              name: "programHead",
              type: "text",
              label: "PROGRAM_HEAD_NAME",
              order: "2",
              fieldId: null,
              options: [],
              pattern: "^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$",
              coreField: 1,
              dependsOn: null,
              maxLength: null,
              minLength: null,
              isEditable: true,
              isPIIField: null,
              isRequired: true,
              validation: ["string"],
              placeholder: "ENTER_PROGRAM_HEAD_NAME",
              isMultiSelect: false,
              maxSelections: 0,
              sourceDetails: {},
            },
            {
              hint: null,
              name: "programImages",
              type: "file",
              label: "PROGRAM_IMAGE",
              order: "0",
              fieldId: null,
              options: [],
              pattern: ".png, .jpg, .jpeg",
              coreField: 1,
              dependsOn: null,
              maxLength: null,
              minLength: null,
              isEditable: true,
              isPIIField: null,
              isRequired: true,
              validation: ["string"],
              placeholder: "ENTER_PROGRAM_NAME",
              isMultiSelect: false,
              maxSelections: 0,
              sourceDetails: {},
            },
          ],
        };

        //    console.log(studentFormData)
        // console.log("object",response);
        if (d) {
          const newResponse = {
            ...d,
            fields: d?.fields,
          };
          const { schema, uiSchema, formValues } = GenerateSchemaAndUiSchema(
            d,
            t
          );
          setFormValue(formValues);
          setSchema(schema);
          console.log({ schema, uiSchema });
          setUiSchema(uiSchema);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    getAddUserFormData();
  }, [i18n.language]);
  const handleChange = (event: any) => {
    console.log("Form data changed:", event?.target?.files?.[0]);
  };
  const handleError = (errors: any) => {
    console.log("Form errors:", errors);
  };
  return (
    <SimpleModal
      open={open}
      onClose={onClose}
      showFooter={true}
      modalTitle={t("PROGRAM_MANAGEMENT.CREATE_PROGRAM")}
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button
            onClick={onClose}
            sx={{
              color: "secondary",
              fontSize: "14px",
              fontWeight: "500",
              textTransform: "capitalize",
            }}
            variant="outlined"
          >
            {t("COMMON.CANCEL")}
          </Button>
          <Button
            variant="contained"
            type="submit"
            form={"dynamic-form"} // Add this line
            sx={{
              fontSize: "14px",
              fontWeight: "500",
              width: "auto",
              height: "40px",
              marginLeft: "10px",
            }}
            color="primary"
            // disabled={!submitButtonEnable}
            onClick={() => { }}
          >
            {true ? t("COMMON.CREATE") : t("COMMON.UPDATE")}
          </Button>
        </Box>
      }
    >
      <DynamicForm
        id="dynamic-form"
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleSubmit}
        // onChange={handleChange}
        onChange={({ formData }) => {
          // setFormData(formData);
          console.log({ formData })
          if (formData.programImages instanceof File) {
            console.log({ formData })
            // setFile(formData.fileInput); // Update the file state when the form data changes
          }
        }}
        onError={handleError}
        // widgets={{}}
        showErrorList={true}
        customFields={customFields}
        formData={formValue}
      >
        {/* <CustomSubmitButton onClose={primaryActionHandler} /> */}
      </DynamicForm>
    </SimpleModal>
  );
};

export default AddProgram;
