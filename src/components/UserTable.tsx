import DeleteUserModal from "@/components/DeleteUserModal";
import HeaderComponent from "@/components/HeaderComponent";
import PageSizeSelector from "@/components/PageSelector";
import { FormContextType, SORT, Status } from "@/utils/app.constant";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { DataType, SortDirection } from "ka-table/enums";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import glass from "../../public/images/empty_hourglass.svg";
import KaTableComponent from "../components/KaTableComponent";
import Loader from "../components/Loader";
import { deleteUser } from "../services/DeleteUser";
import { getCohortList } from "../services/GetCohortList";
import {
  userList,
  getUserDetailsInfo,
  cohortMemberList,
} from "../services/UserList";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Role, apiCatchingDuration } from "@/utils/app.constant";
import { getFormRead } from "@/services/CreateUserService";
import { showToastMessage } from "./Toastify";
import { capitalizeFirstLetterOfEachWordInArray } from "../utils/Helper";
import { getUserTableColumns, getTLTableColumns,getTeacherColumns } from "@/data/tableColumns";
import { TablePagination, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/system";
import CommonUserModal from "./CommonUserModal";
import { useQuery } from "@tanstack/react-query";
import { showFilters } from "../../app.config";
import ReassignCenterModal from "./ReassignCenterModal";
import {
  getCenterList,
  getStateBlockDistrictList,
} from "@/services/MasterDataService";
import { updateCohortMemberStatus } from "@/services/CohortService/cohortService";
type UserDetails = {
  userId: any;
  username: any;
  name: any;
  role: any;
  mobile: any;
  centers?: any;
  Programs?: any;
  age?: any;
  state?: any;
  district?: any;
  blocks?: any;
  stateCode?: any;
  districtCode?: any;
  blockCode?: any;
  centerMembershipIdList?: any;
  blockMembershipIdList?: any;
};
type FilterDetails = {
  role: any;
  status?: any;
  districts?: any;
  states?: any;
  blocks?: any;
  name?: any;
  cohortId?: any;
};
interface CenterProp {
  cohortId: string;
  name: string;
}
interface Cohort {
  cohortId: string;
  name: string;
  parentId: string | null;
  type: string;
  customField: any[];
  cohortMemberStatus?: string;
  cohortMembershipId?: string;
}
interface UserTableProps {
  role: string;
  userType: string;
  searchPlaceholder: string;
  handleAddUserClick: any;
  parentState?: boolean;
}
interface FieldProp {
  value: string;
  label: string;
}
const UserTable: React.FC<UserTableProps> = ({
  role,
  userType,
  searchPlaceholder,
  handleAddUserClick,
  parentState,
}) => {
  console.log(userType);
  const [selectedState, setSelectedState] = React.useState<string[]>([]);
  const [blockMembershipIdList, setBlockMembershipIdList] = React.useState<
    string[]
  >([]);
  const [centerMembershipIdList, setCenterMembershipIdList] = React.useState<
    string[]
  >([]);

  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<string[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedBlock, setSelectedBlock] = React.useState<string[]>([]);
  const [selectedBlockCode, setSelectedBlockCode] = useState("");
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [pageOffset, setPageOffset] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [pageSizeArray, setPageSizeArray] = React.useState<number[]>([]);
  const [data, setData] = useState<UserDetails[]>([]);
  const [cohortsFetched, setCohortsFetched] = useState(false);
  const { t } = useTranslation();
  const [pageSize, setPageSize] = React.useState<string | number>("10");
  const [sortBy, setSortBy] = useState(["createdAt", "asc"]);
  const [sortByForCohortMemberList, setsortByForCohortMemberList] = useState([
    "name",
    SORT.ASCENDING,
  ]);
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);
  const [pageCount, setPageCount] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReassignCohortModalOpen, setIsReassignCohortModalOpen] =
    useState(false);
  const [centers, setCenters] = useState<CenterProp[]>([]);
  const [userName, setUserName] = useState("");
  const [blocks, setBlocks] = useState<FieldProp[]>([]);
  const [userCohort, setUserCohorts] = useState("");

  const [selectedUserId, setSelectedUserId] = useState("");
  const [block, setBlock] = useState("");

  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [deleteUserState, setDeleteUserState] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string[]>([]);
  const [enableCenterFilter, setEnableCenterFilter] = useState<boolean>(false);

  const isMobile: boolean = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const [confirmButtonDisable, setConfirmButtonDisable] = useState(true);
  const [pagination, setPagination] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [formdata, setFormData] = useState<any>();

  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [openAddLearnerModal, setOpenAddLearnerModal] = React.useState(false);
  const [userId, setUserId] = useState();
  const [submitValue, setSubmitValue] = useState<boolean>(false);
  const [previousCenters, setPreviousCenters] = useState<string[]>([]);
  const {
    data: teacherFormData,
    isLoading: teacherFormDataLoading,
    error: teacherFormDataErrror,
  } = useQuery<any[]>({
    queryKey: ["teacherFormData"],
    queryFn: () => Promise.resolve([]),
    staleTime: apiCatchingDuration.GETREADFORM,
    enabled: false,
  });
  const {
    data: studentFormData,
    isLoading: studentFormDataLoading,
    error: studentFormDataErrror,
  } = useQuery<any[]>({
    queryKey: ["studentFormData"],
    queryFn: () => Promise.resolve([]),
    staleTime: apiCatchingDuration.GETREADFORM,
    enabled: false,
  });
  const {
    data: teamLeaderFormData,
    isLoading: teamLeaderFormDataLoading,
    error: teamLeaderFormDataErrror,
  } = useQuery<any[]>({
    queryKey: ["teamLeaderFormData"],
    queryFn: () => Promise.resolve([]),
    staleTime: apiCatchingDuration.GETREADFORM,
    enabled: false,
  });
  const handleOpenAddLearnerModal = () => {
    setOpenAddLearnerModal(true);
  };
  const handleModalSubmit = (value: boolean) => {
    console.log("true");
    submitValue ? setSubmitValue(false) : setSubmitValue(true);
  };
  const handleCloseAddLearnerModal = () => {
    setOpenAddLearnerModal(false);
  };
  const handleAddLearnerClick = () => {
    handleOpenAddLearnerModal();
  };
  const [openAddFacilitatorModal, setOpenAddFacilitatorModal] =
    React.useState(false);
  const handleOpenAddFacilitatorModal = () => {
    setOpenAddFacilitatorModal(true);
  };

  const handleCloseAddFacilitatorModal = () => {
    setOpenAddFacilitatorModal(false);
  };

  const [openAddTeamLeaderModal, setOpenAddTeamLeaderModal] =
    React.useState(false);
  const handleOpenAddTeamLeaderModal = () => {
    setOpenAddTeamLeaderModal(true);
  };

  const handleCloseAddTeamLeaderModal = () => {
    setOpenAddTeamLeaderModal(false);
  };

  const [filters, setFilters] = useState<FilterDetails>({
    role: role,
    status: [statusValue],
  });

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
    <>
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
    </>
  );

  const PageSizeSelectorFunction = () => (
    <PageSizeSelector
      handleChange={handleChange}
      pageSize={pageSize}
      options={pageSizeArray}
    />
  );
  const handleStateChange = async (selected: string[], code: string[]) => {
    setEnableCenterFilter(false);
    setSelectedDistrict([]);
    setSelectedBlock([]);

    setSelectedState(selected);
    console.log(selected[0]);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_STATES")) {
      if (filters.status) setFilters({ status: [filters.status], role: role });
      else setFilters({ role: role });
    } else {
      const stateCodes = code?.join(",");
      setSelectedStateCode(stateCodes);
      if (filters.status)
        setFilters({
          states: stateCodes,
          role: role,
          status: filters.status,
        });
      else setFilters({ states: stateCodes, role: role });
    }

    console.log("Selected categories:", typeof code[0]);
  };
  const handleFilterChange = async (
    event: React.SyntheticEvent,
    newValue: any
  ) => {
    setStatusValue(newValue);
    console.log(newValue);
    setSelectedFilter(newValue);
    if (newValue === Status.ACTIVE) {
      console.log(true);
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ACTIVE],
      }));
    } else if (newValue === Status.ARCHIVED) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        status: [Status.ARCHIVED],
      }));
    } else {
      setFilters((prevFilters) => {
        const { status, ...restFilters } = prevFilters;
        return {
          ...restFilters,
        };
      });
    }
    console.log(filters);
  };

  const handleDistrictChange = (selected: string[], code: string[]) => {
    setEnableCenterFilter(false);

    setSelectedBlock([]);
    setSelectedDistrict(selected);

    if (selected[0] === "" || selected[0] === t("COMMON.ALL_DISTRICTS")) {
      if (filters.status) {
        setFilters({
          states: selectedStateCode,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
          role: role,
        });
      }
    } else {
      const districts = code?.join(",");
      setSelectedDistrictCode(districts);
      if (filters.status) {
        setFilters({
          states: selectedStateCode,
          districts: districts,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
          districts: districts,
          role: role,
        });
      }
    }
    console.log("Selected categories:", selected);
  };
  const handleBlockChange = (selected: string[], code: string[]) => {
    setEnableCenterFilter(false);

    setSelectedBlock(selected);
    if (selected[0] === "" || selected[0] === t("COMMON.ALL_BLOCKS")) {
      if (filters.status) {
        setFilters({
          states: selectedStateCode,
          districts: selectedDistrictCode,
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
          districts: selectedDistrictCode,
          role: role,
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
          role: role,
          status: filters.status,
        });
      } else {
        setFilters({
          states: selectedStateCode,
          districts: selectedDistrictCode,
          blocks: blocks,
          role: role,
        });
      }
    }
    console.log("Selected categories:", selected);
  };
  const handleCenterChange = async (selected: string[], code: string[]) => {
    setSelectedCenter(selected);

    setEnableCenterFilter(true);
    setFilters({
      // states: selectedStateCode,
      // districts: selectedDistrictCode,
      // blocks: blocks,
      cohortId: code[0],
      role: role,
      status: [statusValue],
    });
  };
  const handleSortChange = async (event: SelectChangeEvent) => {
    // let sort;
    console.log(enableCenterFilter);
    if (event.target?.value === "Z-A") {
      enableCenterFilter
        ? setsortByForCohortMemberList(["name", SORT.DESCENDING])
        : setSortBy(["name", SORT.DESCENDING]);
    } else if (event.target?.value === "A-Z") {
      enableCenterFilter
        ? setsortByForCohortMemberList(["name", SORT.ASCENDING])
        : setSortBy(["name", SORT.ASCENDING]);
    } else {
      enableCenterFilter
        ? setsortByForCohortMemberList(["name", SORT.ASCENDING])
        : setSortBy(["createdAt", SORT.ASCENDING]);
    }

    setSelectedSort(event.target?.value as string);
  };
 const mapFields = (formFields: any, response: any) => {
    let initialFormData: any = {};
    formFields.fields.forEach((item: any) => {
      const userData = response?.userData;
      const customFieldValue = userData?.customFields?.find(
        (field: any) => field.fieldId === item.fieldId
      );
      const getValue = (data: any, field: any) => {
        if (item.default) {
          return item.default;
        }
        if (item?.isMultiSelect) {
          if (data[item.name] && item?.maxSelections > 1) {
            return [field?.value];
          } else if (item?.type === "checkbox") {
            return String(field?.code).split(",");
          } else {
            return field?.code?.toLowerCase();
          }
        } else {
          if (item?.type === "numeric") {
            return parseInt(String(field?.value));
          } else if (item?.type === "text") {
            return String(field?.value);
          } else {
            if (field?.value === "FEMALE" || field?.value === "MALE") {
              return field?.value?.toLowerCase();
            }
            return field?.value?.toLowerCase();
          }
        }
      };
      if (item.coreField) {
        if (item?.isMultiSelect) {
          if (userData[item.name] && item?.maxSelections > 1) {
            initialFormData[item.name] = [userData[item.name]];
          } else if (item?.type === "checkbox") {
            initialFormData[item.name] = String(userData[item.name]).split(",");
          } else {
            initialFormData[item.name] = userData[item.name];
          }
        } else if (item?.type === "numeric") {
          initialFormData[item.name] = Number(userData[item.name]);
        } else if (item?.type === "text" && userData[item.name]) {
          initialFormData[item.name] = String(userData[item.name]);
        } else {
          if (userData[item.name]) {
            initialFormData[item.name] = userData[item.name];
          }
        }
      } else {
        const fieldValue = getValue(userData, customFieldValue);
        if (fieldValue) {
          initialFormData[item.name] = fieldValue;
        }
      }
    });
    return initialFormData;
  };
 
  const handleEdit = async (rowData: any) => {
    if (submitValue) {
      setSubmitValue(false);
    }
    console.log("Edit row:", rowData);

    try {
      const userId = rowData.userId;
      setUserId(userId);
      const fieldValue = true;
      const response = await getUserDetailsInfo(userId, fieldValue);
      console.log(role);

      let formFields;
      if (Role.STUDENT === role) {
        //  formFields = await getFormRead("USERS", "STUDENT");
        setFormData(mapFields(studentFormData, response));
        console.log("mapped formdata", formdata);
      } else if (Role.TEACHER === role) {
        // formFields = await getFormRead("USERS", "TEACHER");

        setFormData(mapFields(teacherFormData, response));
        //  handleOpenAddFacilitatorModal();
      } else if (Role.TEAM_LEADER === role) {
        formFields = await getFormRead("USERS", "TEAM LEADER");
        setFormData(mapFields(teamLeaderFormData, response));
        // handleOpenAddTeamLeaderModal();
      }
      handleOpenAddLearnerModal();

      console.log("response", response);
      console.log("formFields", formFields);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (rowData: any) => {
    setIsDeleteModalOpen(true);
    console.log(rowData);
    setUserName(rowData?.name);
    console.log(userName);

    setBlockMembershipIdList(rowData.blockMembershipIdList);
    setCenterMembershipIdList(rowData.centerMembershipIdList);
    setSelectedUserId(rowData.userId);
    if (userType === Role.TEAM_LEADERS) {
      setUserCohorts(rowData.blocks);
      console.log(userCohort);
    } else {
      setUserCohorts(rowData.centers);
    }
    //const userData="";

    console.log("Delete row:", rowData.userId);
  };

  const handleReassignCohort = async (rowData: any) => {
    // setIsDeleteModalOpen(true);
    console.log("rowData", rowData);
    setSelectedUserId(rowData.userId);
    setBlock(rowData.blocks);
    setIsReassignCohortModalOpen(true);

    if (rowData?.centers) {
      setPreviousCenters(rowData?.centers);
    }
    //const userData="";
    try {
      console.log(userType, Role.TEAM_LEADER);
      if (userType !== "Team Leaders") {
        const getCentersObject = {
          limit: 0,
          offset: 0,
          filters: {
            type: "COHORT",
            status: ["active"],
            states: rowData.stateCode,
            districts: rowData.districtCode,
            blocks: rowData.blockCode,
            // "name": selected[0]
          },
        };
        const response = await getCenterList(getCentersObject);
        const dataArray = response?.result?.results?.cohortDetails;

        const cohortInfo = dataArray
          ?.filter((cohort: any) => cohort.type !== "BLOCK")
          .map((item: any) => ({
            cohortId: item?.cohortId,
            name: item?.name,
          }));
        console.log("cohortInfo", cohortInfo);
        setCenters(cohortInfo);
      } else {
        const object = {
          controllingfieldfk: rowData.districtCode,
          fieldName: "blocks",
        };
        const response = await getStateBlockDistrictList(object);
        //console.log(blockFieldId)
        const result = response?.result?.values;
        console.log(result);
        setBlocks(result);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  const handleSearch = (keyword: string) => {
    //  console.log(filters)
    setFilters((prevFilters) => ({
      ...prevFilters,
      name: keyword,
    }));
    setPageOffset(0)
  };

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const fields = ["age", "districts", "states", "blocks", "gender"];
      let limit = pageLimit;
      let offset = pageOffset * limit;
      // const filters = { role: role , status:"active"};
      const sort = sortBy;
      console.log("filters", filters);
      // if (filters.name) {
      //   offset = 0;
      // }
      let resp;
      if (enableCenterFilter) {
        resp = await cohortMemberList({
          limit,
          filters,
          sort,
          offset,
          // fields,
        });
      } else {
        resp = await userList({
          limit,
          filters,
          // sort,
          //  fields
          offset,
        });
      }
      console.log(resp?.getUserDetails);
      const result = enableCenterFilter
        ? resp?.userDetails
        : resp?.getUserDetails;
      console.log(result);
      console.log(resp?.totalCount);
      if (resp?.totalCount >= 15) {
        setPagination(true);

        setPageSizeArray([5, 10, 15]);
      } else if (resp?.totalCount >= 10) {
        setPagination(true);

        // setPageSize(resp?.totalCount);
        setPageSizeArray([5, 10]);
      } else if (resp?.totalCount > 5) {
        setPagination(false);

        setPageSizeArray([5]);
      } else if (resp?.totalCount <= 5) {
        setPagination(false);
        // setPageSize(resp?.totalCount);
        //PageSizeSelectorFunction();
      }

      setPageCount(Math.ceil(resp?.totalCount / pageLimit));
      console.log(result);
      let finalResult;
      if (enableCenterFilter) {
        finalResult = result?.map((user: any) => {
          const ageField = user?.customField?.find(
            (field: any) => field?.fieldname === "AGE"
          );
          const genderField = user?.customField?.find(
            (field: any) => field?.fieldname === "GENDER"
          );
          const blockField = user?.customField?.find(
            (field: any) => field?.fieldname === "BLOCKS"
          );
          const districtField = user?.customField?.find(
            (field: any) => field?.fieldname === "DISTRICTS"
          );
          const stateField = user?.customField?.find(
            (field: any) => field?.fieldname === "STATES"
          );
          return {
            userId: user?.userId,
            username: user?.username,
            status: user?.status,
            name:
              user?.name?.charAt(0).toUpperCase() +
              user?.name?.slice(1).toLowerCase(),
            role: user.role,
            //  gender: user.gender,
            mobile: user.mobile === "NaN" ? "-" : user.mobile,
            age: ageField ? ageField?.fieldvalues : "-",
            district: districtField
              ? districtField?.fieldvalues + " , " + blockField?.fieldvalues
              : "-",
            state: stateField ? stateField?.fieldvalues : "-",
            blocks: blockField ? blockField?.fieldvalues : "-",
            gender: genderField
              ? genderField.fieldvalues?.charAt(0)?.toUpperCase() +
                genderField.fieldvalues.slice(1).toLowerCase()
              : "-",
            //  createdAt: user?.createdAt,
            //  updatedAt: user?.updatedAt,
            createdBy: user?.createdBy,
            updatedBy: user?.updatedBy,
            // // centers: null,
            // Programs: null,
          };
        });
      } else {
        finalResult = result?.map((user: any) => {
          const ageField = user?.customFields?.find(
            (field: any) => field?.label === "AGE"
          );
          const genderField = user?.customFields?.find(
            (field: any) => field?.label === "GENDER"
          );
          const blockField = user?.customFields?.find(
            (field: any) => field?.label === "BLOCKS"
          );
          const districtField = user?.customFields?.find(
            (field: any) => field?.label === "DISTRICTS"
          );
          const stateField = user?.customFields?.find(
            (field: any) => field?.label === "STATES"
          );

          return {
            userId: user.userId,
            username: user.username,
            status: user.status,
            name:
              user.name.charAt(0).toUpperCase() +
              user.name.slice(1).toLowerCase(),
            role: user.role,
            //  gender: user.gender,
            mobile: user.mobile === "NaN" || null ? "-" : user.mobile,
            age: ageField ? ageField.value : "-",
            district: districtField
              ? districtField.value + " , " + blockField.value
              : "-",
            state: stateField ? stateField.value : "-",
            blocks: blockField ? blockField.value : "-",
            gender: genderField
              ? genderField.value?.charAt(0)?.toUpperCase() +
                genderField.value.slice(1).toLowerCase()
              : "-",
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            createdBy: user.createdBy,
            updatedBy: user.updatedBy,
            stateCode: stateField?.code,
            districtCode: districtField?.code,
            blockCode: blockField?.code,
            // centers: null,
            // Programs: null,
          };
        });
      }
      console.log(finalResult);

      if (filters?.name) {
        const prioritizedResult = finalResult.sort((a: any, b: any) => {
          const aStartsWith = a.name.toLowerCase().startsWith(filters?.name);
          const bStartsWith = b.name.toLowerCase().startsWith(filters?.name);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return 0;
        });

        setData(prioritizedResult);
      } else {
        setData(finalResult);
      }

      setLoading(false);
      setCohortsFetched(false);
    } catch (error: any) {
      setLoading(false);

      if (error?.response && error?.response.status === 404) {
        setData([]);
        //showToastMessage("No data found", "info");
      }

      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, [
    pageOffset,
    submitValue,
    pageLimit,
    sortBy,
    filters,
    parentState,
    deleteUserState,
    // sortByForCohortMemberList,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (data.length === 0 || cohortsFetched) {
          return;
        }
        const newData = await Promise.all(
          data?.map(async (user) => {
            const response = await getCohortList(user.userId);
            // const cohortNames = response?.result?.cohortData?.map(
            //   (cohort: Cohort) => cohort.name,
            // );
            const cohortNames = response?.result?.cohortData
              ?.filter(
                (cohort: Cohort) =>
                  cohort.type !== "BLOCK" &&
                  cohort?.cohortMemberStatus !== "archived"
              ) // Filter out cohorts with type 'block'
              .map((cohort: Cohort) => cohort.name);
            const centerMembershipIdList = response?.result?.cohortData
              ?.filter(
                (cohort: Cohort) =>
                  cohort.type !== "BLOCK" &&
                  cohort?.cohortMemberStatus !== "archived"
              ) // Filter out cohorts with type 'block'
              .map((cohort: Cohort) => cohort.cohortMembershipId);
            const blockMembershipIdList = response?.result?.cohortData
              ?.filter(
                (cohort: Cohort) =>
                  cohort.type === "BLOCK" &&
                  cohort?.cohortMemberStatus !== "archived"
              ) // Filter out cohorts with type 'block'
              .map((cohort: Cohort) => cohort.cohortMembershipId);
            //  const cohortMembershipId=response?.result?.cohortData?.cohortMembershipId;
            console.log(blockMembershipIdList);
            console.log(centerMembershipIdList);

            let finalArray;
            if (cohortNames?.length >= 1) {
              // finalArray = capitalizeFirstLetterOfEachWordInArray(cohortNames);
              finalArray = cohortNames;
            }
            //   const finalArray=capitalizeFirstLetterOfEachWordInArray(cohortNames)
            // console.log(finalArray)
            return {
              ...user,
              centerMembershipIdList: centerMembershipIdList,
              blockMembershipIdList: blockMembershipIdList,

              // centers: finalArray ? finalArray?.join(" , ") : "-",
              centers: finalArray,
            };
          })
        );
        setData(newData);
        setCohortsFetched(true);
      } catch (error: any) {
        console.log(error);
      }
    };

    fetchData();
  }, [data, cohortsFetched]);

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
              setFilters({
                states: stateField.code,
                role: role,
                status: [statusValue],
              });
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

  const handleCloseDeleteModal = () => {
    setSelectedReason("");
    setOtherReason("");
    setIsDeleteModalOpen(false);
    setConfirmButtonDisable(true);
  };
  const handleCloseReassignModal = () => {
    // setSelectedReason("");
    // setOtherReason("");
    setIsReassignCohortModalOpen(false);
    setSelectedUserId("");
    setBlock("");
    setPreviousCenters([]);
    // fetchUserList();
    // setConfirmButtonDisable(true);
  };

  const handleDeleteUser = async (category: string) => {
    try {
      console.log(selectedUserId);
      const userId = selectedUserId;
      const userData = {
        userData: {
          reason: selectedReason,
          status: "archived",
        },
      };
      const cohortDeletionResponse = await deleteUser(userId, userData);
      if (cohortDeletionResponse) {
        deleteUserState ? setDeleteUserState(false) : setDeleteUserState(true);
      }
      console.log(blockMembershipIdList);
      if (userType === Role.TEAM_LEADERS && blockMembershipIdList.length > 0) {
        blockMembershipIdList.forEach(async (item) => {
          const memberStatus = Status.ARCHIVED;
          const statusReason = selectedReason;
          const membershipId = item;

          const response = await updateCohortMemberStatus({
            memberStatus,
            statusReason,
            membershipId,
          });
        });
      } else {
        centerMembershipIdList.forEach(async (item) => {
          const memberStatus = Status.ARCHIVED;
          const statusReason = selectedReason;
          const membershipId = item;

          const response = await updateCohortMemberStatus({
            memberStatus,
            statusReason,
            membershipId,
          });
        });
      }

      console.log(centerMembershipIdList);

      // const response = await deleteUser(userId, userData);
      //   const memberStatus = Status.ARCHIVED;
      //   const statusReason = selectedReason;
      //   const membershipId = "";

      //   const teacherResponse = await updateCohortMemberStatus({
      //     memberStatus,
      //     statusReason,
      //     membershipId,
      //   });

      handleCloseDeleteModal();
      showToastMessage(t("COMMON.USER_DELETE_SUCCSSFULLY"), "success");
    } catch (error) {
      console.log("error while deleting entry", error);
    }
  };

  const extraActions: any = [
    { name: "Edit", onClick: handleEdit, icon: EditIcon },
    { name: "Delete", onClick: handleDelete, icon: DeleteIcon },
  ];
  const noUserFoundJSX = (
    <Box display="flex" marginLeft="40%" gap="20px">
      {/* <Image src={glass} alt="" /> */}
      <PersonSearchIcon fontSize="large" />
      <Typography marginTop="10px" variant="h2">
        {t("COMMON.NO_USER_FOUND")}
      </Typography>
    </Box>
  );
  const userProps = {
    userType: userType,
    searchPlaceHolder: searchPlaceholder,
    selectedState: selectedState,
    selectedDistrict: selectedDistrict,
    selectedBlock: selectedBlock,
    selectedSort: selectedSort,
    statusValue: statusValue,
    setStatusValue: setStatusValue,
    handleStateChange: handleStateChange,
    handleDistrictChange: handleDistrictChange,
    handleBlockChange: handleBlockChange,
    handleSortChange: handleSortChange,
    selectedFilter: selectedFilter,
    handleFilterChange: handleFilterChange,
    handleSearch: handleSearch,
    handleAddUserClick: handleAddUserClick,
    selectedBlockCode: selectedBlockCode,
    selectedDistrictCode: selectedDistrictCode,
    selectedStateCode: selectedStateCode,
    handleCenterChange: handleCenterChange,
    selectedCenter: selectedCenter,
    showStateDropdown: showFilters,
    showAddNew: true,
  };

  return (
    <HeaderComponent {...userProps}>
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
      ) : data?.length !== 0 && loading === false ? (
        <KaTableComponent
         columns={
            role === Role.TEAM_LEADER
              ? getTLTableColumns(t, isMobile)
              : role === Role.TEACHER
              ? getTeacherColumns(t, isMobile)
              : getUserTableColumns(t, isMobile)
          }
          reassignCohort={handleReassignCohort}
          data={data}
          limit={pageLimit}
          offset={pageOffset}
          PagesSelector={PagesSelector}
          PageSizeSelector={PageSizeSelectorFunction}
          pageSizes={pageSizeArray}
          extraActions={extraActions}
          showIcons={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={pagination}
          // reassignCohort={reassignCohort}
          noDataMessage={data?.length === 0 ? t("COMMON.NO_USER_FOUND") : ""}
          reassignType={
            userType === Role.TEAM_LEADERS
              ? t("COMMON.REASSIGN_BLOCKS")
              : t("COMMON.REASSIGN_CLASSES")
          }
        />
      ) : (
        loading === false &&
        data.length === 0 && (
          <Box display="flex" marginLeft="40%" gap="20px">
            {/* <Image src={glass} alt="" /> */}
            <PersonSearchIcon fontSize="large" />
            <Typography marginTop="10px" variant="h2">
              {t("COMMON.NO_USER_FOUND")}
            </Typography>
          </Box>

          // <KaTableComponent
          //   columns={
          //     role === Role.TEAM_LEADER
          //       ? getTLTableColumns(t, isMobile)
          //       : getUserTableColumns(t, isMobile)
          //   }
          //   data={data}
          //   limit={pageLimit}
          //   offset={pageOffset}
          //   PagesSelector={PagesSelector}
          //   PageSizeSelector={PageSizeSelectorFunction}
          //   pageSizes={pageSizeArray}
          //   extraActions={extraActions}
          //   showIcons={true}
          //   onEdit={handleEdit}
          //   onDelete={handleDelete}
          //   pagination={false}
          //   noDataMessage={data.length === 0 ? noUserFoundJSX : ""}
          // />
        )
      )}

      <DeleteUserModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        selectedValue={selectedReason}
        setSelectedValue={setSelectedReason}
        handleDeleteAction={handleDeleteUser}
        otherReason={otherReason}
        setOtherReason={setOtherReason}
        confirmButtonDisable={confirmButtonDisable}
        setConfirmButtonDisable={setConfirmButtonDisable}
        centers={userCohort}
        userId={selectedUserId}
        userName={userName}
      />
      <ReassignCenterModal
        open={isReassignCohortModalOpen}
        onClose={handleCloseReassignModal}
        userType={userType}
        cohortData={centers}
        blocks={blocks}
        userId={selectedUserId}
        blockName={block}
        previousCenters={previousCenters}
        fetchUserList={fetchUserList}
      />

      <CommonUserModal
        open={openAddLearnerModal}
        onClose={handleCloseAddLearnerModal}
        formData={formdata}
        isEditModal={true}
        userId={userId}
        onSubmit={handleModalSubmit}
        userType={
          userType === Role.LEARNERS
            ? FormContextType.STUDENT
            : userType === Role.FACILITATORS
              ? FormContextType.TEACHER
              : FormContextType.TEAM_LEADER
        }
      />
    </HeaderComponent>
  );
};

export default UserTable;
