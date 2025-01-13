import DynamicForm from "@/components/DynamicForm";
import {
  GenerateSchemaAndUiSchema,
  customFields,
} from "@/components/GeneratedSchemas";
import { createProgram, updateProgram } from "@/services/ProgramServices";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { Box, Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import SimpleModal from "./SimpleModal";
import { dataURLToBlob, getFilenameFromDataURL } from "@/utils/Helper";
import { showToastMessage } from "./Toastify";
import { getFormRead } from "@/services/CreateUserService";
import path from "path";
interface AddProgramModalProps {
  open: boolean;
  onClose: () => void;
  isEditModal?: boolean;
  formData?: any;
  tenantId?: any;
}
const AddProgram: React.FC<AddProgramModalProps> = ({
  open,
  onClose,
  formData,
  isEditModal = false,
  tenantId,
}) => {
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
      let binaryFiles: Blob[] | undefined;

      if (data?.formData?.programImages) {
        // Assuming programImages is an array of data URLs
        binaryFiles = dataURLToBlob(data?.formData?.programImages);
      }

      const fileName =
        getFilenameFromDataURL(data?.formData?.programImages) || "image.png"; // Use the first image for the name
      delete data?.formData?.programImages;

      const formData = new FormData();
      for (const key in data?.formData) {
        if (data?.formData.hasOwnProperty(key)) {
          formData.append(key, data?.formData[key]);
        }
      }

      // Append each binary file to FormData
      if (binaryFiles) {
        binaryFiles.forEach((file, index) => {
          const currentFileName = fileName[index] || `image_${index + 1}.png`; // Unique file names
          formData.append("programImages", file, currentFileName);
        });
      }

      if (isEditModal) {
        const programData = formData;
        const response = await updateProgram(programData, tenantId);
        showToastMessage(
          t("PROGRAM_MANAGEMENT.PROGRAM_UPDATED_SUCCESS"),
          "success"
        );
      } else {
        const result = await createProgram(formData, t);
        showToastMessage(
          t("PROGRAM_MANAGEMENT.PROGRAM_CREATED_SUCCESS"),
          "success"
        );
      }

      setFetchPrograms(!fetchPrograms);
      onClose();
    } catch (error) {
      console.error("Error creating program:", error);
    }
  };
  useEffect(() => {
    const getAddUserFormData = async () => {
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
        const formFields = await getFormRead("TENANT", "TENANT");

        //    console.log(studentFormData)
        // console.log("object",response);
        if (formFields) {
          const { schema, uiSchema, formValues } = GenerateSchemaAndUiSchema(
            formFields,
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
      modalTitle={
        isEditModal
          ? t("PROGRAM_MANAGEMENT.EDIT_PROGRAM")
          : t("PROGRAM_MANAGEMENT.CREATE_PROGRAM")
      }
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
            onClick={() => {}}
          >
            {!isEditModal ? t("COMMON.CREATE") : t("COMMON.UPDATE")}
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
          console.log({ formData });
          if (formData.programImages instanceof File) {
            console.log({ formData });
            // setFile(formData.fileInput); // Update the file state when the form data changes
          }
        }}
        onError={handleError}
        // widgets={{}}
        showErrorList={true}
        customFields={customFields}
        formData={isEditModal ? formData : formValue}
      >
        {/* <CustomSubmitButton onClose={primaryActionHandler} /> */}
      </DynamicForm>
    </SimpleModal>
  );
};

export default AddProgram;
