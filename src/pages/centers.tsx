import React, { ChangeEvent, useState, useEffect, useCallback } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { DataType, SortDirection } from "ka-table/enums";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import { useTranslation } from "next-i18next";
import Pagination from "@mui/material/Pagination";
import { SelectChangeEvent } from "@mui/material/Select";
import PageSizeSelector from "@/components/PageSelector";
import {
  createCohort,
  fetchCohortMemberList,
  getCohortList,
  updateCohortUpdate,
} from "@/services/CohortService/cohortService";
import {
  CohortTypes,
  FormValues,
  Numbers,
  QueryKeys,
  SORT,
  Status,
  Storage,
} from "@/utils/app.constant";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationModal from "@/components/ConfirmationModal";
import CustomModal from "@/components/CustomModal";
import {
  Box,
  Button,
  Chip,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Loader from "@/components/Loader";
import { getFormRead } from "@/services/CreateUserService";
import {
  GenerateSchemaAndUiSchema,
  customFields,
} from "@/components/GeneratedSchemas";
import { CustomField } from "@/utils/Interfaces";
import { showToastMessage } from "@/components/Toastify";
import AddNewCenters from "@/components/AddNewCenters";
import { getCenterTableData } from "@/data/tableColumns";
import { Theme } from "@mui/system";
import { adjustTime, convertTo12HourFormat, firstLetterInUpperCase, mapFields } from "@/utils/Helper";
import SimpleModal from "@/components/SimpleModal";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import DynamicForm from "@/components/DynamicForm";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { getUserDetailsInfo } from "@/services/UserList";
import { showFilters } from "../../app.config";
import { useQueryClient } from "@tanstack/react-query";

type cohortFilterDetails = {
  type?: string;
  status?: any;
  states?: string;
  districts?: string;
  blocks?: string;
  name?: string;
  activeMembers?: string;
  archivedMembers?: string;
};

interface centerData {
  name?: string;
  status?: string;
  updatedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  customFieldValues?: string;
}
interface CohortDetails {
  name?: string;
  type?: string;
  parentId?: string | null;
  customFields?: CustomField[];
  params?: any;
}

interface Option {
  value: string; 
  label: string;
}

interface CohortDetail {
  name: string; 
  [key: string]: any; 
}

const Center: React.FC = () => {
  // use hooks
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const adminInformation = useSubmittedButtonStore(
    (state: any) => state.adminInformation
  );
  const state = adminInformation?.customFields?.find(
    (item: any) => item?.label === "STATES"
  );
  const getUserStateName = state ? state.value : null;
  const stateCode = state ? state?.code : null;
  // handle states
  const [selectedState, setSelectedState] = React.useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = React.useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = React.useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [selectedFilter, setSelectedFilter] = useState("Active");
  const [cohortData, setCohortData] = useState<cohortFilterDetails[]>([]);
  const [pageSize, setPageSize] = React.useState<string | number>(10);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);
  const [confirmationModalOpenForActive, setConfirmationModalOpenForActive] =
    React.useState<boolean>(false);
  const [selectedCohortId, setSelectedCohortId] = React.useState<string>("");
  const [editModelOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [confirmButtonDisable, setConfirmButtonDisable] =
    React.useState<boolean>(false);
  const [inputName, setInputName] = React.useState<string>("");
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [userId, setUserId] = useState("");
  const [centerFormData, setCenterFormData] = React.useState<any>();
  const [schema, setSchema] = React.useState<any>();
  const [uiSchema, setUiSchema] = React.useState<any>();
  const [openAddNewCohort, setOpenAddNewCohort] =
    React.useState<boolean>(false);
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);

  const [pageCount, setPageCount] = useState(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = React.useState<number[]>([]);
  const [pagination, setPagination] = useState(true);
  const [sortBy, setSortBy] = useState(["createdAt", "asc"]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedBlockCode, setSelectedBlockCode] = useState("");
  const [formdata, setFormData] = useState<any>();
  const [totalCount, setTotalCound] = useState<number>(0);
  const [editFormData, setEditFormData] = useState<any>([]);
  const [isEditForm, setIsEditForm] = useState(false);
  const [statesInformation, setStatesInformation] = useState<any>([]);
  const [selectedRowData, setSelectedRowData] = useState<any>("");
  const setSubmittedButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setSubmittedButtonStatus
  );
  const setAdminInformation = useSubmittedButtonStore(
    (state: any) => state.setAdminInformation
  );

  const [filters, setFilters] = useState<cohortFilterDetails>({
    type: CohortTypes.COHORT,
    // states: selectedStateCode,
    status: [statusValue],
  });
  const handleCloseAddLearnerModal = () => {
    setOpenAddNewCohort(false);
  };
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const getAdminInformation = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const admin = localStorage.getItem("adminInfo");
      if (admin) {
        const stateField: any = JSON.parse(admin).customFields.find(
          (field: any) => field.label === "STATES"
        );
        console.log(stateField?.value, stateField?.code);
        const object = [
          {
            value: stateField?.code,
            label: stateField?.value,
          },
        ];

        setStatesInformation(object);
        setSelectedStateCode(object[0]?.value);

        setFilters({
          type: "COHORT",
          states: object[0]?.value,
          status: filters.status,
        });
      }
    }
  };

  // use api calls
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const userId = localStorage.getItem(Storage.USER_ID) || "";
      setUserId(userId);
    }

    // get form data for center create
    getAddCenterFormData();
    // getCohortMemberlistData();
    getAdminInformation();
  }, []);

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const limit = pageLimit;
      const offset = pageOffset * limit;
      const sort = sortBy;

      const data = {
        limit: limit,
        offset: offset,
        sort: sort,
        filters: filters,
      };
      const resp = await getCohortList(data);
      if (resp) {
        const result = await resp?.results?.cohortDetails;
        const resultData: centerData[] = [];

        const cohortIds = result?.map((item: any) => item.cohortId); // Extract cohort IDs

        // Fetch member counts for each cohort
        const memberCounts = await Promise.all(
          cohortIds?.map(async (cohortId: string) => {
            return await getCohortMemberlistData(cohortId);
          })
        );

        result?.forEach((item: any, index: number) => {
          const cohortType =
            item?.customFields?.map((field: any) =>
              firstLetterInUpperCase(field?.value)
            ) ?? "-";

          const counts = memberCounts[index] || {
            totalActiveMembers: 0,
            totalArchivedMembers: 0,
          };

          console.log("cohortType", cohortType);
          const requiredData = {
            className: item?.name,
            status: item?.status,
            updatedBy: item?.updatedBy,
            createdBy: item?.createdBy,
            createdAt: item?.createdAt,
            updatedAt: item?.updatedAt,
            cohortId: item?.cohortId,
            customFieldValues: cohortType[0] ? cohortType : "-",
            totalActiveMembers: counts?.totalActiveMembers,
            totalArchivedMembers: counts?.totalArchivedMembers,
          };
          resultData?.push(requiredData);
        });
        if (resultData) {
          setCohortData(resultData);
        }

        console.log("resultData", resultData);
        const totalCount = resp?.count;
        setTotalCound(totalCount);

        setPagination(totalCount > 10);
        setPageSizeArray(
          totalCount > 15
            ? [5, 10, 15]
            : totalCount > 10
              ? [5, 10]
              : totalCount > 5
                ? [5]
                : []
        );
        const pageCount = Math.ceil(totalCount / pageLimit);
        setPageCount(pageCount);
        // setLoading(false);
      }
    } catch (error) {
      setCohortData([]);
      setLoading(false);
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFormData = async () => {
    try {
      const res = await getFormRead("cohorts", "cohort");
      if (res && res?.fields) {
        const formDatas = res?.fields;
        setFormData(formDatas);
      } else {
        console.log("No response Data");
      }
    } catch (error) {
      showToastMessage(t("COMMON.ERROR_MESSAGE_SOMETHING_WRONG"), "error");
      console.log("Error fetching form data:", error);
    }
  };

  const getCohortMemberlistData = async (cohortId: string) => {
    const data = {
      limit: 0,
      page: 0,
      filters: {
        cohortId: cohortId,
      },
    };

    const response = await queryClient.fetchQuery({
      queryKey: [
        QueryKeys.GET_COHORT_MEMBER_LIST,
        data.limit,
        data.page,
        JSON.stringify(data.filters),
      ],
      queryFn: () => fetchCohortMemberList(data),
    });
    if (response?.result) {
      const userDetails = response.result.userDetails;
      const getActiveMembers = userDetails?.filter(
        (member: any) => member?.status === Status.ACTIVE
      );
      const totalActiveMembers = getActiveMembers?.length || 0;

      const getArchivedMembers = userDetails?.filter(
        (member: any) => member?.status === Status.ARCHIVED
      );
      const totalArchivedMembers = getArchivedMembers?.length || 0;

      return {
        totalActiveMembers,
        totalArchivedMembers,
      };
    }

    return {
      totalActiveMembers: 0,
      totalArchivedMembers: 0,
    };
  };

  const getAddCenterFormData = async () => {
    try {
      const response = await getFormRead("cohorts", "cohort");

      const reqParams = {
        limit: Numbers.ZERO,
        offset: 0,
        filters: {
          type: CohortTypes.SCHOOL,
          status: [Status.ACTIVE]
        },
        sort: ["name", "asc"],
      };

      const Schoolresponse = await getCohortList(reqParams);
      
      

      const options: Option[] = response?.fields[0]?.options || [];
      const cohortDetails: CohortDetail[] = Schoolresponse?.results?.cohortDetails || [];

      const filteredOptions: Option[] = options.filter((option: Option) =>
        cohortDetails.some((cohort: CohortDetail) => cohort.name === option.label)
      );      

      if (response) {
        response.fields[0].options = filteredOptions;

        const { schema, uiSchema } = GenerateSchemaAndUiSchema(response, t);

        setCenterFormData(response);
        setSchema(schema);
        setUiSchema(uiSchema);
      } else {
        console.log("Unexpected response format");
      }
    } catch (error) {
      showToastMessage(t("COMMON.ERROR_MESSAGE_SOMETHING_WRONG"), "error");
      console.log("Error fetching form data:", error);
    }
  };

  useEffect(() => {
    fetchUserList();
    getFormData();
  }, [pageOffset, pageLimit, sortBy, filters, filters.status]);

  // handle functions
  const handleChange = (event: SelectChangeEvent<typeof pageSize>) => {
    setPageSize(event.target.value);
    setPageLimit(Number(event.target.value));
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPageOffset(value - 1);
  };

  const PagesSelector = () => (
    <Box sx={{ display: { xs: "block" } }}>
      <Pagination
        // size="small"
        color="primary"
        count={pageCount}
        page={pageOffset + 1}
        onChange={handlePaginationChange}
        siblingCount={0}
        boundaryCount={1}
        sx={{ marginTop: "10px" }}
      />
    </Box>
  );

  const PageSizeSelectorFunction = () => (
    <Box mt={2}>
      <PageSizeSelector
        handleChange={handleChange}
        pageSize={pageSize}
        options={pageSizeArray}
      />
    </Box>
  );

  const handleStateChange = async (selected: string[], code: string[]) => {
    setSelectedDistrict([]);
    setSelectedBlock([]);
    setSelectedState(selected);

    if (selected[0] === "") {
      if (filters.status)
        setFilters({ type: "COHORT", status: filters.status });
      // else setFilters({ role: role });
    } else {
      const stateCodes = code?.join(",");
      console.log("stateCodes", stateCodes);
      setSelectedStateCode(stateCodes);
      if (filters.status)
        setFilters({
          type: "COHORT",
          states: stateCodes,
          status: filters.status,
        });
      else setFilters({ type: "COHORT", states: stateCodes });
    }

    console.log("Selected categories:", typeof code[0]);
  };

  const handleDistrictChange = (selected: string[], code: string[]) => {
    setSelectedBlock([]);
    setSelectedDistrict(selected);

    if (selected[0] === "") {
      if (filters.status) {
        setFilters({
          states: selectedStateCode,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
        });
      }
    } else {
      const districts = code?.join(",");
      setSelectedDistrictCode(districts);
      if (filters.status) {
        setFilters({
          states: selectedStateCode,
          districts: districts,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
          districts: districts,
        });
      }
    }
    console.log("Selected categories:", selected);
  };
  const handleBlockChange = (selected: string[], code: string[]) => {
    setSelectedBlock(selected);
    if (selected[0] === "") {
      if (filters.status) {
        setFilters({
          states: selectedStateCode,
          districts: selectedDistrictCode,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
          districts: selectedDistrictCode,
        });
      }
    } else {
      const blocks = code?.join(",");
      setSelectedBlockCode(blocks);
      if (filters.status) {
        setFilters({
          states: selectedStateCode,
          districts: selectedDistrictCode,
          blocks: blocks,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
          districts: selectedDistrictCode,
          blocks: blocks,
        });
      }
    }
    console.log("Selected categories:", selected);
  };

  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
  };

  const handleActionForDelete = async () => {
    if (selectedCohortId) {
      let cohortDetails = {
        status: Status.ARCHIVED,
      };
      const resp = await updateCohortUpdate(selectedCohortId, cohortDetails);
      console.log(resp);
      if (resp?.responseCode === 200) {
        showToastMessage(t("CENTERS.CLASS_DELETE_SUCCESSFULLY"), "success");
        const cohort = cohortData?.find(
          (item: any) => item.cohortId == selectedCohortId
        );
        if (cohort) {
          cohort.status = Status.ARCHIVED;
        }
        console.log(resp?.params?.successmessage);
      } else {
        console.log("Cohort Not Archived");
      }
      setSelectedCohortId("");
    } else {
      console.log("No Cohort Selected");
      setSelectedCohortId("");
    }
    fetchUserList();
  };

  const handleActionForActivate = async (rowData: any) => {
    let selectedCohortId = rowData.cohortId;
    if (selectedCohortId) {
      let cohortDetails = {
        status: Status.ACTIVE,
      };
      const resp = await updateCohortUpdate(selectedCohortId, cohortDetails);
      console.log(resp);
      if (resp?.responseCode === 200) {
        showToastMessage(t("CENTERS.CLASS_ACTIVATED_SUCCESSFULLY"), "success");
        const cohort = cohortData?.find(
          (item: any) => item.cohortId == selectedCohortId
        );
        if (cohort) {
          cohort.status = Status.ACTIVE;
        }
        console.log(resp?.params?.successmessage);
      } else {
        console.log("Cohort Not Activated");
      }
      setSelectedCohortId("");
    } else {
      console.log("No Cohort Selected");
      setSelectedCohortId("");
    }
    fetchUserList();
  };

  const handleSortChange = async (event: SelectChangeEvent) => {
    if (cohortData?.length > 0) {
      if (event.target.value === "Z-A") {
        setSortBy(["name", SORT.DESCENDING]);
      } else if (event.target.value === "A-Z") {
        setSortBy(["name", SORT.ASCENDING]);
      } else {
        setSortBy(["createdAt", SORT.ASCENDING]);
      }
      setSelectedSort(event.target.value);
    }
  };

  const handleSearch = (keyword: string) => {
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: keyword,
    }));
  };

  const handleFilterChange = async (
    event: React.SyntheticEvent,
    newValue: any
  ) => {
    setStatusValue(newValue);

    setSelectedFilter(newValue);
    setPageSize(Numbers.TEN);
    setPageLimit(Numbers.TEN);
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);

    if (newValue === Status.ACTIVE) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ACTIVE],
      }));
    } else if (newValue === Status.ARCHIVED) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ARCHIVED],
      }));
    } else if (newValue === Status.ALL_LABEL) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: "",
      }));
    } else {
      setFilters((prevFilters) => {
        const { status, ...restFilters } = prevFilters;
        return {
          ...restFilters,
        };
      });
    }
  };

  const handleEdit = async (rowData: any) => {
    setLoading(true);
    // Handle edit action here
    // setIsEditModalOpen(true);
    if (rowData) {
      const cohortId = rowData?.cohortId;
      setSelectedCohortId(cohortId);
      const cohortName = rowData?.className;
      setInputName(cohortName);

      let data = {
        filters: {
          cohortId: cohortId,
        },
        limit: Numbers.TWENTY,
        offset: 0,
      };
      const resp = await getCohortList(data);
      const formFields = await getFormRead("cohorts", "cohort");

      const cohortDetails = resp?.results?.cohortDetails?.[0] || {};
      setEditFormData(mapFields(formFields, cohortDetails));

      setLoading(false);
      setIsEditForm(true);
    }
    setLoading(false);
    setConfirmButtonDisable(false);
  };

  const handleDelete = (rowData: any) => {
    setLoading(true);

    const cohortName = rowData?.className;
    // SetDeletedRowData
    setInputName(cohortName);
    setConfirmationModalOpen(true);
    if (rowData) {
      setSelectedRowData(rowData);
      const cohortId = rowData?.cohortId;
      setSelectedCohortId(cohortId);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleActivateCohort = (rowData: any) => {
    setSelectedCohortId(rowData.cohortId);
    if (rowData.cohortId){
      handleActionForActivate(rowData);
    }  
  };

  const handleAddFacilitator = () => {
    console.log("handleAddFacilitator clicked");
  };

  // add  extra buttons
  const extraActions: any = [
    { name: t("COMMON.EDIT"), onClick: handleEdit, icon: EditIcon },
    { name: t("COMMON.DELETE"), onClick: handleDelete, icon: DeleteIcon },
    //{ name: t("COMMON.ADDFACILITATOR"), onClick: handleAddFacilitator, icon: EditIcon },
  ];

  const onCloseEditMOdel = () => {
    setIsEditModalOpen(false);
  };

  const onCloseEditForm = () => {
    setIsEditForm(false);
  };
  const handleInputName = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedName = event.target.value;
    setInputName(updatedName);
  };

  const handleChangeForm = (event: IChangeEvent<any>) => {
    console.log("Form data changed:", event.formData);
  };
  const handleError = () => {
    console.log("error");
  };

  // const handleUpdateAction = async (
  //   data: IChangeEvent<any, RJSFSchema, any>,
  //   event: React.FormEvent<any>
  // ) => {
  //   setLoading(true);
  //   const formData = data?.formData;
  //   console.log("formData", formData);
  //   const schemaProperties = schema.properties;

  //   let apiBody: any = {
  //     customFields: [],
  //   };
  //   Object.entries(formData).forEach(([fieldKey, fieldValue]) => {
  //     const fieldSchema = schemaProperties[fieldKey];
  //     const fieldId = fieldSchema?.fieldId;

  //     console.log(
  //       `FieldID: ${fieldId}, FieldValue: ${JSON.stringify(fieldSchema)}, type: ${typeof fieldValue}`
  //     );

  //     if (fieldId === null || fieldId === "null") {
  //       if (typeof fieldValue !== "object") {
  //         apiBody[fieldKey] = fieldValue;
  //       }
  //     } else {
  //       if (
  //         fieldSchema?.hasOwnProperty("isDropdown") ||
  //         fieldSchema?.hasOwnProperty("isCheckbox") ||
  //         fieldSchema?.type === "radio"
  //       ) {
  //         apiBody.customFields.push({
  //           fieldId: fieldId,
  //           value: Array.isArray(fieldValue) ? fieldValue : [fieldValue],
  //         });
  //       } else {
  //         if (fieldSchema?.checkbox && fieldSchema.type === "array") {
  //           if (String(fieldValue).length != 0) {
  //             apiBody.customFields.push({
  //               fieldId: fieldId,
  //               value: String(fieldValue).split(","),
  //             });
  //           }
  //         } else {
  //           if (fieldId) {
  //             apiBody.customFields.push({
  //               fieldId: fieldId,
  //               value: String(fieldValue),
  //             });
  //           }
  //         }
  //       }
  //     }
  //   });

  //   const customFields = apiBody?.customFields;
  //   try {
  //     setLoading(true);
  //     setConfirmButtonDisable(true);
  //     if (!selectedCohortId) {
  //       console.log("No cohort Id Selected");
  //       showToastMessage(t("CENTERS.NO_COHORT_ID_SELECTED"), "error");
  //       return;
  //     }
  //     let cohortDetails = {
  //       name: formData?.name,
  //       customFields: customFields,
  //     };
  //     const resp = await updateCohortUpdate(selectedCohortId, cohortDetails);
  //     if (resp?.responseCode === 200 || resp?.responseCode === 201) {
  //       showToastMessage(t("CENTERS.CENTER_UPDATE_SUCCESSFULLY"), "success");
  //       setLoading(false);
  //     } else {
  //       showToastMessage(t("CENTERS.CLASS_UPDATE_FAILED"), "error");
  //     }
  //   } catch (error) {
  //     console.error("Error updating cohort:", error);
  //     showToastMessage(t("CENTERS.CLASS_UPDATE_FAILED"), "error");
  //   } finally {
  //     setLoading(false);
  //     setConfirmButtonDisable(false);
  //     onCloseEditMOdel();
  //     fetchUserList();
  //     setIsEditForm(false);
  //   }
  // };


  const handleUpdateAction = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    setLoading(true);
    const formData = data?.formData;
    const schoolFieldOptions = centerFormData.fields.find(
      (item: any) => item.name === "nondependantschools"
    );
    const schoolField = schoolFieldOptions.options.find(
      (item: any) => item.value === formData.nondependantschools
    );

    const classFieldOptions = centerFormData.fields.find(
      (item: any) => item.name === "classes"
    );
    const classField = classFieldOptions.options.find(
      (item: any) => item.value === formData.classes
    );
    //const schemaProperties = schema.properties;
    const originalTime = formData.from_time;
    const timeBefore = adjustTime(originalTime, -5); // 5 minutes before
    const timeAfter = adjustTime(originalTime, 5); // 5 minutes after

    const fromTimeOption = centerFormData.fields.find(
      (item: any) => item.name === "from_time"
    );

    const schoolOption = centerFormData.fields.find(
      (item: any) => item.name === "nondependantschools"
    );
    const classOption = centerFormData.fields.find(
      (item: any) => item.name === "classes"
    );
    const toTimeOption = centerFormData.fields.find(
      (item: any) => item.name === "to_time"
    );

    const slotFieldOptions = centerFormData?.fields.find(
      (item: any) => item.name === "slots"
    );

    const slotField = slotFieldOptions?.options.find(
      (item: any) => item.value === formData?.slots
    );
    console.log("fromTimeOption", fromTimeOption);

    // Extract the field IDs dynamically
    const fromTimeFieldId = fromTimeOption?.fieldId || "";
    const toTimeFieldId = toTimeOption?.fieldId || "";
    const schoolFieldId = schoolOption?.fieldId || "";
    const classFieldId = classOption?.fieldId || "";


    const getFromTime = convertTo12HourFormat(formData?.from_time);
    const getToTime = convertTo12HourFormat(formData?.to_time);

    // Initialize the API body similar to handleSubmit
    let cohortDetails: CohortDetails = {
      name:
        schoolField.label +
        ", " +
        classField.label +
        ", " +
        getFromTime +
        " - " +
        getToTime,
      customFields: [
        {
          fieldId: fromTimeFieldId,
          value: formData.from_time,
        },
        {
          fieldId: toTimeFieldId,
          value: formData.to_time,
        },
        {
          fieldId: schoolFieldId,
          value: [schoolField.value],
        },
        {
          fieldId: classFieldId,
          value: [classField.value],
        },
      ],
      params: {
        self: {
          allowed: 1,
          allow_late_marking: 1,
          restrict_attendance_timings: 1,
          attendance_starts_at: timeBefore,
          attendance_ends_at: timeAfter,
          back_dated_attendance: 0,
          back_dated_attendance_allowed_days: 0,
          can_be_updated: 0,
          capture_geoLocation: 1,
        },
        student: {
          allowed: 1,
          allow_late_marking: 1,
          restrict_attendance_timings: 0,
          back_dated_attendance: 1,
          back_dated_attendance_allowed_days: 7,
          can_be_updated: 1,
          capture_geoLocation: 0,
        },
      },
    };

    const clusterFieldId = schema?.properties?.cluster?.fieldId;
    if (clusterFieldId && formData?.cluster) {
      cohortDetails?.customFields?.push({
        fieldId: clusterFieldId,
        value: formData.cluster,
      });
    }

    try {
      setLoading(true);
      setConfirmButtonDisable(true);
      if (!selectedCohortId) {
        console.log("No cohort Id Selected");
        showToastMessage(t("CENTERS.NO_COHORT_ID_SELECTED"), "error");
        return;
      }
      const resp = await updateCohortUpdate(selectedCohortId, cohortDetails);
      if (resp?.responseCode === 200 || resp?.responseCode === 201) {
        fetchUserList();
        showToastMessage(t("CENTERS.CLASS_UPDATE_SUCCESSFULLY"), "success");
      } else {
        showToastMessage(t("CENTERS.CLASS_UPDATE_FAILED"), "error");
      }
    } catch (error) {
      console.error("Error updating cohort:", error);
      showToastMessage(t("CENTERS.CLASS_UPDATE_FAILED"), "error");
    } finally {
      setLoading(false);
      setConfirmButtonDisable(false);
      onCloseEditMOdel();
      fetchUserList();
      setIsEditForm(false);
    }
  };

  const handleAddUserClick = () => {
    setOpenAddNewCohort(true);
    // setIsEditForm(true);
  };

  useEffect(() => {
    const fetchData = () => {
      try {
        const object = {
          // "limit": 20,
          // "offset": 0,
          fieldName: "states",
        };
        // const response = await getStateBlockDistrictList(object);
        // const result = response?.result?.values;
        if (typeof window !== "undefined" && window.localStorage) {
          const admin = localStorage.getItem("adminInfo");
          if (admin) {
            const stateField = JSON.parse(admin).customFields.find(
              (field: any) => field.label === "STATES"
            );
            console.log(stateField.value, stateField.code);
            if (!stateField.value.includes(",")) {
              setSelectedState([stateField.value]);
              setSelectedStateCode(stateField.code);
            }

            const object = [
              {
                value: stateField.code,
                label: stateField.value,
              },
            ];
            // setStates(object);
          }
        }
        //  setStates(result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // // for new changes
  // useEffect(() => {
  //   const getAddLearnerFormData = async () => {
  //     const admin = localStorage.getItem("adminInfo");
  //     if (admin) {
  //       const stateField = JSON.parse(admin)?.customFields?.find(
  //         (field: any) => field.label === "STATES"
  //       );
  //       if (!stateField?.value.includes(",")) {
  //         setStateDefaultValueForCenter(stateField?.value);
  //       } else {
  //         setStateDefaultValueForCenter(t("COMMON.ALL_STATES"));
  //       }
  //     }
  //     try {
  //       const response = await getFormRead("cohorts", "cohort");
  //       console.log("sortedFields", response);

  //       if (response) {
  //         const { schema, uiSchema } = GenerateSchemaAndUiSchema(response, t);
  //         console.log("schema", schema);
  //         console.log("uiSchema", uiSchema);
  //         setSchemaCreate(schema);
  //         setUiSchemaCreate(uiSchema);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching form data:", error);
  //     }
  //   };
  //   getAddLearnerFormData();
  // }, []);

  const handleSubmit = async (
    data: IChangeEvent<any, RJSFSchema, any>,
    event: React.FormEvent<any>
  ) => {
    const formData = data?.formData;

    console.log("formDataOf", formData);
    console.log("centerFormData", centerFormData);

    const schoolFieldOptions = centerFormData.fields.find(
      (item: any) => item.name === "nondependantschools"
    );
    const schoolField = schoolFieldOptions.options.find(
      (item: any) => item.value === formData.nondependantschools
    );

    const classFieldOptions = centerFormData.fields.find(
      (item: any) => item.name === "classes"
    );
    const classField = classFieldOptions.options.find(
      (item: any) => item.value === formData.classes
    );

    const slotFieldOptions = centerFormData?.fields.find(
      (item: any) => item.name === "slots"
    );

    const toTime = centerFormData?.fields.find(
      (item: any) => item.name === formData.to_time
    );
    const slotField = slotFieldOptions?.options.find(
      (item: any) => item.value === formData?.slots
    );
    console.log("fromTime", formData.from_time);
    console.log("toTime", formData.to_time);

    const originalTime = formData.from_time;
    const timeBefore = adjustTime(originalTime, -5); // 5 minutes before
    const timeAfter = adjustTime(originalTime, 5); // 5 minutes after

    const fromTimeOption = centerFormData.fields.find(
      (item: any) => item.name === "from_time"
    );

    const schoolOption = centerFormData.fields.find(
      (item: any) => item.name === "nondependantschools"
    );
    const classOption = centerFormData.fields.find(
      (item: any) => item.name === "classes"
    );
    const toTimeOption = centerFormData.fields.find(
      (item: any) => item.name === "to_time"
    );

    console.log("fromTimeOption", fromTimeOption);

    // Extract the field IDs dynamically
    const fromTimeFieldId = fromTimeOption?.fieldId || "";
    const toTimeFieldId = toTimeOption?.fieldId || "";
    const schoolFieldId = schoolOption?.fieldId || "";
    const classFieldId = classOption?.fieldId || "";

    console.log(
      "cohortName",
      schoolField.label,
      classField.label
      // slotField.label
    );

    const reqParams = {
      limit: 1,
      offset: 0,
      filters: {
        name: schoolField.label,
        type: "SCHOOL",
      },
    };

    const response = await getCohortList(reqParams);
    const parentCohort = response?.results?.cohortDetails[0];
    const getFromTime = convertTo12HourFormat(formData?.from_time);
    const getToTime = convertTo12HourFormat(formData?.to_time);
    // const { timePlus5, timeMinus5 } = getModifiedTimes(slotField?.label);

    const newClassCohort = {
      name:
        schoolField.label +
        ", " +
        classField.label +
        ", " +
        getFromTime +
        " - " +
        getToTime,
      type: "COHORT",
      parentId: parentCohort.cohortId,
      params: {
        self: {
          allowed: 1,
          allow_late_marking: 1,
          restrict_attendance_timings: 1,
          attendance_starts_at: timeBefore,
          attendance_ends_at: timeAfter,
          back_dated_attendance: 0,
          back_dated_attendance_allowed_days: 0,
          can_be_updated: 0,
          capture_geoLocation: 1,
        },
        student: {
          allowed: 1,
          allow_late_marking: 1,
          restrict_attendance_timings: 0,
          back_dated_attendance: 1,
          back_dated_attendance_allowed_days: 7,
          can_be_updated: 1,
          capture_geoLocation: 0,
        },
      },
      customFields: [
        {
          fieldId: fromTimeFieldId,
          value: formData.from_time,
        },
        {
          fieldId: toTimeFieldId,
          value: formData.to_time,
        },
        {
          fieldId: schoolFieldId,
          value: [schoolField.value],
        },
        {
          fieldId: classFieldId,
          value: [classField.value],
        },
      ],
    };

    const cohortData = await createCohort(newClassCohort);

    if (cohortData) {
      showToastMessage(t("CENTERS.CENTER_CREATED_SUCCESSFULLY"), "success");
      setOpenAddNewCohort(false);
      // onClose();
    } else {
      showToastMessage(t("CENTER.NOT_ABLE_CREATE_CENTER"), "error");
      setOpenAddNewCohort(false);
    }
    fetchUserList();
  };

  const convertTo24HourFormat = (time12h: any) => {
    const [time, modifier] = time12h?.split(" ");

    let [hours, minutes] = time?.split(":");
    hours = parseInt(hours, 10);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  const addMinutes = (time: any, minutesToAdd: any) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + minutesToAdd);

    const hours24 = date.getHours().toString().padStart(2, "0");
    const minutes24 = date.getMinutes().toString().padStart(2, "0");

    return `${hours24}:${minutes24}`;
  };

  const getModifiedTimes = (timeRange: any) => {
    const startTime12h = timeRange?.split(" - ")[0];
    const startTime24h = convertTo24HourFormat(startTime12h);

    const timePlus5 = addMinutes(startTime24h, 5);
    const timeMinus5 = addMinutes(startTime24h, -5);

    return {
      timePlus5,
      timeMinus5,
    };
  };

  // props to send in header
  const userProps = {
    userType: t("SIDEBAR.CENTERS"),
    searchPlaceHolder: t("CENTERS.SEARCHBAR_PLACEHOLDER"),
    selectedState: selectedState,
    selectedStateCode: selectedStateCode,
    selectedDistrict: selectedDistrict,
    selectedBlock: selectedBlock,
    selectedSort: selectedSort,
    selectedFilter: selectedFilter,
    handleStateChange: handleStateChange,
    handleDistrictChange: handleDistrictChange,
    handleBlockChange: handleBlockChange,
    handleSortChange: handleSortChange,
    handleFilterChange: handleFilterChange,
    handleSearch: handleSearch,
    showAddNew: true,
    handleAddUserClick: handleAddUserClick,
    statusValue: statusValue,
    setStatusValue: setStatusValue,
    showSort: cohortData?.length > 0,
    showStateDropdown: showFilters,
  };

  return (
    <>
      <ConfirmationModal
        message={
          selectedRowData?.totalActiveMembers > 0
            ? t("CENTERS.ARE_YOU_SURE_WANT_TO_DELETE_CLASS_HAS_ACTIVE_LEARNERS", {
                activeMembers: `${selectedRowData?.totalActiveMembers}`,
              })
            : t("CENTERS.SURE_DELETE_CLASS") + " " +
              inputName +
              " " +
              t("CENTERS.CENTER") +
              "?"
        }
        handleAction={handleActionForDelete}
        buttonNames={
          // selectedRowData?.totalActiveMembers > 0
          //   ? { secondary: t("COMMON.CANCEL") }
            // : 
            { 
              primary: t("COMMON.YES"), secondary: t("COMMON.CANCEL")
             }
        }
        handleCloseModal={handleCloseModal}
        modalOpen={confirmationModalOpen}
      />

      <HeaderComponent {...userProps}>
        {/* {console.log("cohortData",cohortData)} */}
        {loading ? (
          <Box
            width={"100%"}
            id="check"
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Loader showBackdrop={false} loadingText={t("COMMON.LOADING")} />
          </Box>
        ) : cohortData?.length > 0 ? (
          <KaTableComponent
            columns={getCenterTableData(t, isMobile)}
            data={cohortData}
            limit={pageLimit}
            offset={pageOffset}
            paginationEnable={totalCount > Numbers.TEN}
            PagesSelector={PagesSelector}
            pagination={pagination}
            PageSizeSelector={PageSizeSelectorFunction}
            pageSizes={pageSizeArray}
            extraActions={extraActions}
            showIcons={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivateCohort}
          />
        ) : (
          !loading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="20vh"
            >
              <Typography marginTop="10px" textAlign={"center"}>
                {t("COMMON.NO_CLASSES_FOUND")}
              </Typography>
            </Box>
          )
        )}

        <AddNewCenters
          open={openAddNewCohort}
          onClose={handleCloseAddLearnerModal}
          formData={formdata}
          isEditModal={true}
          userId={userId}
        />

        <SimpleModal
          open={isEditForm}
          onClose={onCloseEditForm}
          showFooter={false}
          modalTitle={t("COMMON.UPDATE_CLASSES")}
        >
          {schema && uiSchema && (
            <DynamicForm
              schema={schema}
              uiSchema={uiSchema}
              onSubmit={handleUpdateAction}
              onChange={handleChangeForm}
              onError={handleError}
              widgets={{}}
              showErrorList={true}
              customFields={customFields}
              formData={editFormData ? editFormData : ""}
              id="update-center-form"
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right", // Centers the button horizontally
                  marginTop: "20px", // Adjust margin as needed
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="submit"
                  form="update-center-form" // Add this line
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={onCloseEditForm}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  form="update-center-form" // Add this line
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                    console.log("update button was clicked");
                  }}
                >
                  {t("COMMON.UPDATE")}
                </Button>
              </Box>
            </DynamicForm>
          )}
        </SimpleModal>

        <SimpleModal
          open={openAddNewCohort}
          onClose={handleCloseAddLearnerModal}
          showFooter={false}
          modalTitle={t("CENTERS.NEW_CLASS")}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "10px",
            }}
          ></Box>
          {schema && uiSchema && (
            <DynamicForm
              schema={schema}
              uiSchema={uiSchema}
              onSubmit={handleSubmit}
              // onChange={handleChangeFormCreate}
              // onError={handleErrorCreate}
              widgets={{}}
              showErrorList={true}
              customFields={customFields}
              id="new-center-form"
              onChange={handleChangeForm}
              onError={handleError}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "right", // Centers the button horizontally
                  marginTop: "20px", // Adjust margin as needed
                }}
                gap={2}
              >
                <Button
                  variant="outlined"
                  type="submit"
                  form="new-center-form" // Add this line
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={handleCloseAddLearnerModal}
                >
                  {t("COMMON.CANCEL")}
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  form="new-center-form" // Add this line
                  sx={{
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "auto",
                    height: "40px",
                    marginLeft: "10px",
                  }}
                  onClick={() => {
                    setSubmittedButtonStatus(true);
                    console.log("Submit button was clicked");
                  }}
                >
                  {t("COMMON.CREATE")}
                </Button>
              </Box>
            </DynamicForm>
          )}
          {/* {!selectedBlockCohortId && selectedBlockCohortId !== "" && (
            <Box mt={3} textAlign={"center"}>
              <Typography color={"error"}>
                {t("COMMON.SOMETHING_WENT_WRONG")}
              </Typography>
            </Box>
          )} */}
        </SimpleModal>
      </HeaderComponent>
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Center;
