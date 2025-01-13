import DynamicForm from "@/components/DynamicForm";
import {
  GenerateSchemaAndUiSchema,
  customFields,
} from "@/components/GeneratedSchemas";
import SimpleModal from "@/components/SimpleModal";
import {
  createUser,
  getFormRead,
  updateUser,
} from "@/services/CreateUserService";
import { sendCredentialService } from "@/services/NotificationService";
import {
  firstLetterInUpperCase,
  generateUsernameAndPassword,
} from "@/utils/Helper";
import { FormData } from "@/utils/Interfaces";
import {
  FormContext,
  FormContextType,
  Role,
  RoleId,
  Status,
  TelemetryEventType,
  apiCatchingDuration,
} from "@/utils/app.constant";
import { useLocationState } from "@/utils/useLocationState";
import useSubmittedButtonStore from "@/utils/useSharedState";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme,
} from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { TENANT_ID } from "../../app.config";
import { transformArray } from "../utils/Helper";
import AreaSelection from "./AreaSelection";
import SendCredentialModal from "./SendCredentialModal";
import { showToastMessage } from "./Toastify";
import { cohortMemberList } from "@/services/UserList";
import CustomModal from "./CustomModal";
import { setConfig } from "next/config";
import { telemetryFactory } from "@/utils/telemetry";
import useNotification from "@/hooks/useNotification";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  formData?: object;
  isEditModal?: boolean;
  userId?: string;
  onSubmit: (submitValue: boolean) => void;
  userType: string;
  userName?: string;
}

const CommonUserModal: React.FC<UserModalProps> = ({
  open,
  onClose,
  formData,
  isEditModal = false,
  userId,
  onSubmit,
  userType,
  userName,
}) => { 
  const [schema, setSchema] = React.useState<any>();
  const [uiSchema, setUiSchema] = React.useState<any>();
  const [openModal, setOpenModal] = React.useState(false);
  const [adminInfo, setAdminInfo] = React.useState<any>();
  const [createTLAlertModal, setcreateTLAlertModal] = useState(false);
  const [confirmButtonDisable, setConfirmButtonDisable] = useState(true);
  const [checkedConfirmation, setCheckedConfirmation] =
    useState<boolean>(false);

  const messageKeyMap: Record<string, string> = {
    [FormContextType.STUDENT]: "LEARNERS.LEARNER_CREATED_SUCCESSFULLY",
    [FormContextType.TEACHER]: "FACILITATORS.FACILITATOR_CREATED_SUCCESSFULLY",
    [FormContextType.TEAM_LEADER]:
      "TEAM_LEADERS.TEAM_LEADER_CREATED_SUCCESSFULLY",
    [FormContextType.ADMIN]: "ADMIN.ADMIN_UPDATED_SUCCESSFULLY",
  };
  const delayCredentialsMessageMap: Record<string, string> = {
    [FormContextType.STUDENT]: "LEARNERS.USER_CREDENTIALS_WILL_BE_SEND_SOON",
    [FormContextType.TEACHER]:
      "FACILITATORS.USER_CREDENTIALS_WILL_BE_SEND_SOON",
    [FormContextType.TEAM_LEADER]:
      "TEAM_LEADERS.USER_CREDENTIALS_WILL_BE_SEND_SOON",
  };
  const [submitButtonEnable, setSubmitButtonEnable] =
    React.useState<boolean>(false);
  const roleType = userType;
  const { t } = useTranslation();
  const [formValue, setFormValue] = useState<any>();
  const adminInformation = useSubmittedButtonStore(
    (state: any) => state?.adminInformation
  );
  const submittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.submittedButtonStatus
  );
  const [createFacilitator, setCreateFacilitator] = React.useState(false);
  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );
  const noError = useSubmittedButtonStore((state: any) => state.noError);

  const userEnteredEmail = useSubmittedButtonStore(
    (state: any) => state.userEnteredEmail
  );
  const {
    data: teacherFormData,
    isLoading: teacherFormDataLoading,
    error: teacherFormDataErrror,
  } = useQuery<any>({
    queryKey: ["teacherFormData"],
    queryFn: () => getFormRead(FormContext.USERS, FormContextType.TEACHER),
    staleTime: apiCatchingDuration.GETREADFORM,
  });
  const {
    data: studentFormData,
    isLoading: studentFormDataLoading,
    error: studentFormDataError,
  } = useQuery<any>({
    queryKey: ["studentFormData"],
    queryFn: () => getFormRead(FormContext.USERS, FormContextType.STUDENT),
    staleTime: apiCatchingDuration.GETREADFORM,
  });
  const {
    data: teamLeaderFormData,
    isLoading: teamLeaderFormDataLoading,
    error: teamLeaderFormDataError,
  } = useQuery<any>({
    queryKey: ["teamLeaderFormData"],
    queryFn: () => getFormRead(FormContext.USERS, FormContextType.TEAM_LEADER),
    staleTime: apiCatchingDuration.GETREADFORM,
  });
  const { i18n } = useTranslation();

  const {
    data: contentCreatorFormData,
    isLoading: contentCreatorFormDataLoading,
    error: contentCreatorFormDataError,
  } = useQuery<any>({
    queryKey: ["contentCreatorFormData"],
    queryFn: () =>
      getFormRead(FormContext.USERS, FormContextType.CONTENT_CREATOR),
    staleTime: apiCatchingDuration.GETREADFORM,
  });
  // const { data:adminFormData ,isLoading: adminFormDataLoading, error :adminFormDataErrror} = useQuery<FormData>({
  //   queryKey: ["adminFormData"],
  //   queryFn: () => getFormRead(
  //     FormContext.USERS,
  //     FormContextType.ADMIN
  //     ),
  //   staleTime: apiCatchingDuration.GETREADFORM,
  // })
  const modalTitle = !isEditModal
    ? userType === FormContextType.STUDENT
      ? t("LEARNERS.NEW_LEARNER")
      : userType === FormContextType.TEACHER
        ? t("FACILITATORS.NEW_FACILITATOR")
        : userType === FormContextType.CONTENT_CREATOR
          ? t("CONTENT_CREATOR_REVIEWER.CREATE_CONTENT_CREATOR")
          : t("TEAM_LEADERS.NEW_TEAM_LEADER")
    : userType === FormContextType.STUDENT
      ? t("LEARNERS.EDIT_LEARNER")
      : userType === FormContextType.TEACHER
        ? t("FACILITATORS.EDIT_FACILITATOR")
        : userType === FormContextType.CONTENT_CREATOR
          ? t("CONTENT_CREATOR_REVIEWER.EDIT_CONTENT_REVIEWER")
          : t("TEAM_LEADERS.EDIT_TEAM_LEADER");
  const theme = useTheme<any>();
  const {
    states,
    districts,
    blocks,
    allCenters,
    isMobile,
    isMediumScreen,
    selectedState,
    selectedStateCode,
    selectedDistrict,
    selectedDistrictCode,
    selectedCenter,
    dynamicForm,
    selectedBlock,
    selectedBlockCode,
    handleStateChangeWrapper,
    handleDistrictChangeWrapper,
    handleBlockChangeWrapper,
    handleCenterChangeWrapper,
    selectedCenterCode,
    selectedBlockCohortId,
    blockFieldId,
    districtFieldId,
    stateFieldId,
    dynamicFormForBlock,
    stateDefaultValue,
    assignedTeamLeader,
    assignedTeamLeaderNames,
    selectedStateCohortId,
  } = useLocationState(open, onClose, roleType); 

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
        const response: FormData =
          userType === FormContextType.TEACHER
            ? teacherFormData
            : userType === FormContextType.STUDENT
              ? studentFormData
              : userType === FormContextType.CONTENT_CREATOR
                ? contentCreatorFormData
                : teamLeaderFormData;
     

        if (response) {
          if (userType === FormContextType.TEACHER) {
            const newResponse = {
              ...response,
              fields: response?.fields,
            };
            const { schema, uiSchema, formValues } = GenerateSchemaAndUiSchema(
              newResponse,
              t
            );
            setFormValue(formValues);
            setSchema(schema);
            setUiSchema(uiSchema); 
          } else if (userType === FormContextType.TEAM_LEADER) {
            const { schema, uiSchema, formValues } = GenerateSchemaAndUiSchema(
              response,
              t
            );
            setFormValue(formValues);
            setSchema(schema); 
            setUiSchema(uiSchema);
          } else {
            console.log("true");
            const { schema, uiSchema } = GenerateSchemaAndUiSchema(response, t);
            setSchema(schema); 
            setUiSchema(uiSchema);
          }
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    };
    getAddUserFormData();
  }, [
    userType,
    teacherFormData,
    studentFormData,
    teamLeaderFormData,
    contentCreatorFormData,
    i18n.language,
  ]);
  const { getNotification } = useNotification();
  const handleSubmit = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => { 
    const target = event?.target as HTMLFormElement;
 
 

    const formData = data.formData; 
    const schemaProperties = schema.properties;
 
    let result;
    if (formData["year of joining scp"]) {
      result = generateUsernameAndPassword(
        selectedStateCode,
        userType,
        formData["year of joining scp"]
      );
    } else {
      result = generateUsernameAndPassword(selectedStateCode, userType);
    }
    if (result !== null) {
      const { username, password } = result;

      let apiBody: any = {
        username: formData.email,
        password: password,
        tenantCohortRoleMapping: [
          {
            tenantId: TENANT_ID,
            roleId:
              userType === FormContextType.STUDENT
                ? RoleId.STUDENT
                : userType === FormContextType.TEACHER
                  ? RoleId.TEACHER
                  : userType === FormContextType.CONTENT_CREATOR
                    ? RoleId.SCTA
                    : RoleId.TEAM_LEADER,
            cohortIds:
              userType === FormContextType.TEAM_LEADER
                ? [selectedBlockCohortId]
                : userType === FormContextType.CONTENT_CREATOR
                  ? selectedStateCohortId
                  : [selectedCenterCode],
          },
        ],
        customFields: [],
      };

      Object.entries(formData).forEach(([fieldKey, fieldValue]) => { 
        const fieldSchema = schemaProperties[fieldKey];
        const fieldId = fieldSchema?.fieldId; 

        if (fieldId === null || fieldId === "null") {
          if (typeof fieldValue !== "object") {
            apiBody[fieldKey] = fieldValue;
          }
        } else {
          if (
            fieldSchema?.hasOwnProperty("isDropdown") ||
            fieldSchema?.hasOwnProperty("isCheckbox")
          ) {
            apiBody.customFields.push({
              fieldId: fieldId,
              value: Array.isArray(fieldValue) ? fieldValue : [fieldValue],
            });
          } else {
            if (fieldSchema?.checkbox && fieldSchema.type === "array") {
              if (String(fieldValue).length != 0) {
                apiBody.customFields.push({
                  fieldId: fieldId,
                  value: String(fieldValue).split(","),
                });
              }
            } else {
              if (fieldId) {
                apiBody.customFields.push({
                  fieldId: fieldId,
                  value: String(fieldValue),
                });
              }
            }
          }
        }
      });
      if (userType === FormContextType.CONTENT_CREATOR && !isEditModal) {
        apiBody.customFields.push({
          fieldId: stateFieldId,
          value: [selectedStateCode],
        });
      } else if (!isEditModal) {
        apiBody.customFields.push({
          fieldId: blockFieldId,
          value: [selectedBlockCode],
        });
        apiBody.customFields.push({
          fieldId: stateFieldId,
          value: [selectedStateCode],
        });
        apiBody.customFields.push({
          fieldId: districtFieldId,
          value: [selectedDistrictCode],
        });
      }

      try {
        if (isEditModal && userId) { 
          const userData = {
            name: apiBody?.name,
            mobile: apiBody?.mobile,
            father_name: apiBody?.father_name,
            email: apiBody?.email,
            updatedBy: localStorage.getItem("userId"),
            username: apiBody?.username,
          };

          const customFields = apiBody?.customFields; 
          const object = {
            userData: userData,
            customFields: customFields,
          };
          await updateUser(userId, object);
          const messageKey =
            userType === FormContextType.STUDENT
              ? "LEARNERS.LEARNER_UPDATED_SUCCESSFULLY"
              : userType === FormContextType.TEACHER
                ? "FACILITATORS.FACILITATOR_UPDATED_SUCCESSFULLY"
                : "TEAM_LEADERS.TEAM_LEADER_UPDATED_SUCCESSFULLY";

          showToastMessage(t(messageKey), "success");
          if (userType === FormContextType.TEAM_LEADER) {
            getNotification(userId, "TL_PROFILE_UPDATE");
          }
          if (userType === FormContextType.TEACHER) {
            getNotification(userId, "FACILITATOR_PROFILE_UPDATE");
          }
          if (userType === FormContextType.STUDENT) {
            const replacements = {
              "{learnerName}": userName,
            };
            getNotification(
              userId,
              "LEARNER_PROFILE_UPDATE_ALERT",
              replacements
            );
            getNotification(
              userId,
              "LEARNER_PROFILE_UPDATE_BY_ADMIN_TL_FC",
              replacements
            );
          }

          const windowUrl = window.location.pathname;
          const cleanedUrl = windowUrl.replace(/^\//, "");
          const env = cleanedUrl.split("/")[0];

          const telemetryInteract = {
            context: {
              env: env,
              cdata: [],
            },
            edata: {
              id: userType + "updated-successfully",
              type: TelemetryEventType.CLICK,
              subtype: "",
              pageid: cleanedUrl,
            },
          };
          telemetryFactory.interact(telemetryInteract);
        } else {
          if(apiBody?.name)
          {
            apiBody.name = apiBody?.name.trim();
          }
          if(apiBody?.father_name)
          {
            apiBody.father_name = apiBody?.father_name.trim();
          }
          const response = await createUser(apiBody); 
          if (response) {
            const messageKey = messageKeyMap[userType];

            if (userType === FormContextType.STUDENT) {
              showToastMessage(t(messageKey), "success");

              const windowUrl = window.location.pathname;
              const cleanedUrl = windowUrl.replace(/^\//, "");
              const env = cleanedUrl.split("/")[0];

              const telemetryInteract = {
                context: {
                  env: env,
                  cdata: [],
                },
                edata: {
                  id: userType + "created-successfully",
                  type: TelemetryEventType.CLICK,
                  subtype: "",
                  pageid: cleanedUrl,
                },
              };
              telemetryFactory.interact(telemetryInteract);
            }

            if (!isEditModal) {
              const isQueue = false;
              const context = "USER";
              let creatorName;
              const key =
                userType === FormContextType.STUDENT
                  ? "onLearnerCreated"
                  : userType === FormContextType.TEACHER
                    ? "onFacilitatorCreated"
                    : "onTeamLeaderCreated";

              if (typeof window !== "undefined" && window.localStorage) {
                creatorName = localStorage.getItem("name");
              }
              let replacements: { [key: string]: string };
              replacements = {}; 
              if (creatorName) {
                if (userType === FormContextType.STUDENT) {
                  replacements = {
                    "{FirstName}": firstLetterInUpperCase(creatorName),
                    "{UserName}": username,
                    "{LearnerName}": firstLetterInUpperCase(apiBody["name"]),
                    "{Password}": password,
                  };
                } else {
                  replacements = {
                    "{FirstName}": firstLetterInUpperCase(apiBody["name"]),
                    "{UserName}": formData?.email,
                    "{Password}": password,
                  };
                }
              }
              const sendTo = {
                //  receipients: [userEmail],
                receipients:
                  userType === FormContextType.STUDENT
                    ? [adminInfo?.email]
                    : [formData?.email],
              };
              if (Object.keys(replacements).length !== 0 && sendTo) {
                const response = await sendCredentialService({
                  isQueue,
                  context,
                  key,
                  replacements,
                  email: sendTo,
                });
                if (userType !== FormContextType.STUDENT) {
                  const messageKey = messageKeyMap[userType];

                  if (response?.result[0]?.data[0]?.status === "success") {
                    showToastMessage(t(messageKey), "success");
                  } else {
                    const messageKey =
                      delayCredentialsMessageMap[userType] ||
                      "TEAM_LEADERS.USER_CREDENTIALS_WILL_BE_SEND_SOON";

                    showToastMessage(t(messageKey), "success");
                  }
                }
                if (userType === FormContextType.STUDENT) {
                  if (
                    response?.result[0]?.data[0]?.status === "success" &&
                    !isEditModal
                  ) {
                    setOpenModal(true);
                  } else {
                    showToastMessage(
                      t("LEARNERS.USER_CREDENTIALS_WILL_BE_SEND_SOON"),
                      "success"
                    );
                  }
                }
              } else {
                showToastMessage(t("COMMON.SOMETHING_WENT_WRONG"), "error");
              }
            }
          } else {
            showToastMessage(t("COMMON.SOMETHING_WENT_WRONG"), "error");
          }
        }
        onSubmit(true);
        onClose();
        onCloseModal();
      } catch (error: any) {
        // onClose(); 
        if (error?.response?.data?.params?.err === "User already exist.") {
          showToastMessage(error?.response?.data?.params?.err, "error");
        } else {
          showToastMessage(t("COMMON.SOMETHING_WENT_WRONG"), "error");
        }
      }
    }
  };

  const handleChange = (event: IChangeEvent<any>) => {
    console.log("Form data changed:", event.formData);
  };
  const handleError = (errors: any) => {
    console.log("Form errors:", errors);
  };
  const handleBackAction = () => {
    setCreateFacilitator(false);
    setOpenModal(false);
  };

  const handleAction = () => {
    setTimeout(() => {
      setCreateFacilitator(true);
    });
    setOpenModal(false);
  };
  const onCloseModal = () => {
    setOpenModal(false);
  };
  useEffect(() => {
    if (!open) {
      setSubmitButtonEnable(false);
    }
    if (
      (dynamicForm && userType !== FormContextType.TEAM_LEADER) ||
      isEditModal
    ) {
      setSubmitButtonEnable(true);
    }
    if (
      (dynamicFormForBlock && userType === FormContextType.TEAM_LEADER) ||
      isEditModal
    ) {
      setSubmitButtonEnable(true);
    }
  }, [dynamicForm, dynamicFormForBlock, open]);

  const handleChangeCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedConfirmation(event.target.checked);
  };

  const wrappedHandleContinueAction = () => {
    handleCloseConfirmation();
    setOpenModal(true);
    //onClose();
  };

  const handleCancelAction = async () => {
    // await handleDeleteAction();
    handleCloseConfirmation();
    //setAssignedTeamLeaderNames([]);
  };
  const handleCloseConfirmation = () => {
    // await handleDeleteAction();
    // handleCloseConfirmation();
    setcreateTLAlertModal(false);
    setCheckedConfirmation(false);
    setConfirmButtonDisable(true);
    //  setAssignedTeamLeaderNames([]);
  };

  useEffect(() => {
    if (checkedConfirmation) {
      setConfirmButtonDisable(false);
    } else {
      setConfirmButtonDisable(true);
    }
  }, [checkedConfirmation]);
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const admin = localStorage.getItem("adminInfo");
      if (admin) setAdminInfo(JSON.parse(admin)); 
    }
  }, []);
  return (
    <>
      <SimpleModal
        open={open}
        onClose={onClose}
        showFooter={true}
        modalTitle={modalTitle}
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
              form={
                userType === FormContextType.STUDENT && !isEditModal
                  ? "dynamic-form"
                  : isEditModal
                    ? "dynamic-form"
                    : ""
              } // Add this line
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                width: "auto",
                height: "40px",
                marginLeft: "10px",
              }}
              color="primary"
              disabled={!submitButtonEnable}
              onClick={() => {
                setSubmittedButtonStatus(true); 
                if (
                  userType !== FormContextType.STUDENT &&
                  !isEditModal &&
                  noError
                ) {
                  // setOpenModal(true); 
                  if (
                    assignedTeamLeaderNames.length !== 0 &&
                    userType === FormContextType.TEAM_LEADER
                  ) {
                    setcreateTLAlertModal(true);
                    // setOpenModal(true)
                  } else {
                    //onClose();
                    setOpenModal(true);
                  }
                } 
              }}
            >
              {!isEditModal ? t("COMMON.CREATE") : t("COMMON.UPDATE")}
            </Button>
          </Box>
        }
      >
        {!isEditModal && (
          <Box
            sx={{
              marginTop: "10px",
            }}
          >
            <AreaSelection
              states={transformArray(states)}
              districts={transformArray(districts)}
              blocks={transformArray(blocks)}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedBlock={selectedBlock}
              handleStateChangeWrapper={handleStateChangeWrapper}
              handleDistrictChangeWrapper={handleDistrictChangeWrapper}
              handleBlockChangeWrapper={handleBlockChangeWrapper}
              isMobile={isMobile}
              isMediumScreen={isMediumScreen}
              isCenterSelection={
                userType !== "TEAM LEADER" &&
                userType !== FormContextType.CONTENT_CREATOR
              }
              allCenters={allCenters}
              selectedCenter={selectedCenter}
              handleCenterChangeWrapper={handleCenterChangeWrapper}
              inModal={true}
              userType={userType}
              stateDefaultValue={stateDefaultValue}
            />
          </Box>
        )}
        {formData
          ? schema &&
            uiSchema && (
              <DynamicForm
                id="dynamic-form"
                schema={schema}
                uiSchema={uiSchema}
                onSubmit={handleSubmit}
                onChange={handleChange}
                onError={handleError}
                // widgets={{}}
                showErrorList={true}
                customFields={customFields}
                formData={formData}
              >
                {/* <CustomSubmitButton onClose={primaryActionHandler} /> */}
              </DynamicForm>
            )
          : userType === FormContextType.TEAM_LEADER
            ? dynamicFormForBlock &&
              schema &&
              uiSchema && (
                <DynamicForm
                  id="dynamic-form"
                  schema={schema}
                  uiSchema={uiSchema}
                  onSubmit={handleSubmit}
                  onChange={handleChange}
                  onError={handleError}
                  // widgets={{}}
                  showErrorList={true}
                  customFields={customFields}
                  formData={formValue}
                >
                  {/* <CustomSubmitButton onClose={primaryActionHandler} /> */}
                </DynamicForm>
              )
            : dynamicForm &&
              schema &&
              uiSchema && (
                <DynamicForm
                  id="dynamic-form"
                  schema={schema}
                  uiSchema={uiSchema}
                  onSubmit={handleSubmit}
                  onChange={handleChange}
                  onError={handleError}
                  // widgets={{}}
                  showErrorList={true}
                  customFields={customFields}
                  formData={formValue}
                  key={`${i18n.language}`}
                >
                  {/* <CustomSubmitButton onClose={primaryActionHandler} /> */}
                </DynamicForm>
              )}
      </SimpleModal>
      <SendCredentialModal
        handleBackAction={handleBackAction}
        open={openModal}
        onClose={onCloseModal}
        email={
          userType !== FormContextType.STUDENT
            ? userEnteredEmail
            : adminInfo?.email
        }
        userType={
          userType === FormContextType.STUDENT
            ? Role.STUDENT
            : userType === FormContextType.TEAM_LEADER
              ? Role.TEAM_LEADER
              : Role.TEACHER
        }
      />

      <CustomModal
        width="30%"
        open={createTLAlertModal}
        handleClose={handleCloseConfirmation}
        primaryBtnText={t("COMMON.CONTINUE")}
        primaryBtnClick={wrappedHandleContinueAction}
        primaryBtnDisabled={confirmButtonDisable}
        secondaryBtnText={t("COMMON.CANCEL")}
        secondaryBtnClick={handleCancelAction}
      >
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            width: "fit-content",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="body1"
            sx={{ marginBottom: "12px", fontWeight: "bold", color: "#333" }}
          >
            {assignedTeamLeaderNames.length > 1 ? (
              <>
                {t("COMMON.MULTIPLE_TEAM_LEADERS_ASSIGNED", {
                  selectedBlockForTL: selectedBlock[0],
                  assignedTeamLeader: assignedTeamLeader,
                })}
              </>
            ) : (
              <>
                {t("COMMON.SINGLE_TEAM_LEADERS_ASSIGNED", {
                  selectedBlockForTL: selectedBlock[0],
                  assignedTeamLeader: assignedTeamLeader,
                })}
              </>
            )}
          </Typography>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px",
              marginBottom: "16px",
              backgroundColor: "#fff",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {assignedTeamLeaderNames.length > 1 ? (
              <>
                {t("COMMON.ASSIGNED_TEAM_LEADERS", {
                  assignedTeamLeaderNames: assignedTeamLeaderNames[0],
                })}
              </>
            ) : (
              <>{assignedTeamLeaderNames[0]}</>
            )}
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkedConfirmation}
                onChange={handleChangeCheckBox}
                color="primary"
              />
            }
            label={t("COMMON.CONTINUE_ASSIGNED_TEAM_LEADER", {
              selectedBlockForTL: selectedBlock[0],
            })}
            sx={{ marginTop: "12px", color: "#555" }}
          />
        </Box>
      </CustomModal>
    </>
  );
};

export default CommonUserModal;
