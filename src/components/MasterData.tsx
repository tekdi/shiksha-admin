import React, { useState, useEffect, useMemo } from "react";
import KaTableComponent from "../components/KaTableComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Pagination, Typography, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import Loader from "@/components/Loader";
import { useQueryClient } from "@tanstack/react-query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  getDistrictsForState,
  getBlocksForDistricts,
  deleteOption,
  createOrUpdateOption,
  updateCohort,
} from "@/services/MasterDataService";
import { transformLabel } from "@/utils/Helper";
import { showToastMessage } from "@/components/Toastify";
import ConfirmationModal from "@/components/ConfirmationModal";
import { AddBlockModal } from "@/components/AddBlockModal";
import PageSizeSelector from "@/components/PageSelector";
import {
  CohortTypes,
  SORT,
  Status,
  Storage,
  Numbers,
  QueryKeys,
  TelemetryEventType,
  Role,
} from "@/utils/app.constant";
import { getUserDetailsInfo } from "@/services/UserList";
import {
  createCohort,
  getCohortList,
} from "@/services/CohortService/cohortService";
import { getBlockTableData, getDistrictTableData } from "@/data/tableColumns";
import { Theme } from "@mui/system";
import { telemetryFactory } from "@/utils/telemetry";
import useStore from "@/store/store";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { formatedStates } from "@/services/formatedCohorts";
import MultipleSelectCheckmarks from "@/components/FormControl";
import AddDistrictModal from "./AddDistrictModal";
import { getCohortList as getMyCohorts } from "@/services/GetCohortList";

type StateDetail = {
  name: string | undefined;
  controllingField: string | undefined;
  block: string | undefined;
  selectedDistrict: string | undefined;
  value: string;
  label: string;
  stateCode?: string | undefined;
  status?: Status;
  selectedState?: string | undefined;
};

type DistrictDetail = {
  cohortId(cohortId: any): unknown;
  value: string;
  label: string;
  status: Status;
  updatedBy: any;
  createdBy: any;
 
 
  controllingField: string;
};

type BlockDetail = {
  code: any;
  parentId(parentId: any): unknown;
  status: Status;
  cohortId(cohortId: any): unknown;
  updatedBy: any;
  createdBy: any;
  updatedAt: any;
  createdAt: any;
  value: string;
  label: string;
  block: string;
};

interface BlockOption {
  label: string;
  value: any;
}
interface State {
  value: string;
  label: string;
  cohortId?:any
}
interface MasterDataProps {
  cohortType: any;
}
const MasterData: React.FC<MasterDataProps> = ({ cohortType }) => {
  const { t } = useTranslation();
  const store = useStore();
  const isActiveYear = store.isActiveYearSelected;
  const [selectedSort, setSelectedSort] = useState<string>("Sort");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrictLabel, setSelectedDistrictLabel] = useState<string>("");

  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [stateData, setStateData] = useState<StateDetail[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [districtData, setDistrictData] = useState<DistrictDetail[]>([]);
  const [blockData, setBlockData] = useState<BlockDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageOffset, setPageOffset] = useState<number>(0);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [pageCount, setPageCount] = useState<number>(1);

  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<BlockDetail | null>(null);

  const [selectedDistrictStateForDelete, setSelectedDistrictStateForDelete] =
  useState<DistrictDetail | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
    const [confirmationDistrictDialogOpen, setDistrictConfirmationDialogOpen] =
    useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [districtModalOpen, setDistrictModalOpen] = useState<boolean>(false);
  const [fetchDistrict, setFetchDistrict] = useState(true);
  const [countOfBlocks, setCountOfBlocks] = useState<number>(0);

  const [editState, setEditState] = useState<StateDetail | null>(null);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [blocksFieldId, setBlocksFieldId] = useState<string>(
    "4aab68ae-8382-43aa-a45a-e9b239319857"
  );
  const [districtFieldId, setDistrictFieldId] = useState<string>("b61edfc6-3787-4079-86d3-37262bf23a9e");
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [paginationCount, setPaginationCount] = useState<number>(0);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10, 20, 50]);
  const [stateCode, setStateCode] = useState<any>("");
  const [stateValue, setStateValue] = useState<string>("");
  const [stateFieldId, setStateFieldId] = useState<string>(
    "6469c3ac-8c46-49d7-852a-00f9589737c5"
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pagination, setPagination] = useState(true);
  const [blocksOptionRead, setBlocksOptionRead] = useState<any>([]);
  const [blockNameArr, setBlockNameArr] = useState<any>([]);
  const [blockCodeArr, setBlockCodeArr] = useState<any>([]);
  const [userRole, setUserRole] = useState("");
  const [cohortIdOfState, setCohortIdOfState] = useState<any>("");

  const [districtsOptionRead, setDistrictsOptionRead] = useState<any>([]);
  const [districtCodeArr, setDistrictCodeArr] = useState<any>([]);
  const [districtNameArr, setDistrictNameArr] = useState<any>([]);
  const [cohortIdForDelete, setCohortIdForDelete] = useState<any>("");
  const [cohortIdForEdit, setCohortIdForEdit] = useState<any>();
  const [blockValueForDelete, setBlockValueForDelete] = useState<any>();
  const [countOfCenter, setCountOfCenter] = useState<number>(0);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [parentIdBlock, setParentIdBlock] = useState<string | null>(null);
  const [showAllBlocks, setShowAllBlocks] = useState("All");
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);
  const [pageSize, setPageSize] = React.useState<string | number>(10);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const queryClient = useQueryClient();
  const [states, setStates] = useState<State[]>([]);
  const [defaultStates, setDefaultStates] = useState<any>();
  const [districtValueForDelete, setDistrictValueForDelete] = useState<any>("");

  const isArchived = useSubmittedButtonStore((state: any) => state.isArchived);
  const setIsArchived = useSubmittedButtonStore(
    (state: any) => state.setIsArchived
  );
 
  const [filters, setFilters] = useState({
    name: searchKeyword,
    states: stateCode,
    districts: selectedDistrict,
    type: CohortTypes.BLOCK,
    status: statusValue
  });
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  useEffect(() => {
    const storedUserData = localStorage.getItem("adminInfo");
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUserRole(userData.role);
    }
  }, []); 
  useEffect(() => {
    const fetchUserDetail = async () => {
      let userId: any;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          userId = localStorage.getItem(Storage.USER_ID);
        }

        const response = await queryClient.fetchQuery({
          queryKey: [QueryKeys.USER_READ, userId, true],
          queryFn: () => getUserDetailsInfo(userId, true),
        });

        const statesField = response.userData.customFields.find(
          (field: { label: string }) => field.label === "STATES"
        );
        if (userRole === Role.CENTRAL_ADMIN) {
          const result = await formatedStates();
          setStates(result);
          setStateCode(result[0]?.value);
          // if(stateParentId!=="")
         // setStateParentId(result[0]?.cohortId);
         setSelectedState(result[0]?.label);
          setDefaultStates(result[0]);
        } else if (statesField) {
          setStateValue(statesField.value);
          setStateCode(statesField.code);
          setStateFieldId(statesField?.fieldId);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserDetail();
  }, [userRole]);

  const fetchDistricts = async () => {
    try {

if (stateCode) {
        // const data = await queryClient.fetchQuery({
        //   queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
        //   queryFn: () =>
        //     getDistrictsForState({
        //       controllingfieldfk: stateCode,
        //       fieldName: "districts",
        //     }),
        // });
        const data=await getDistrictsForState({
          controllingfieldfk: stateCode,
          fieldName: "districts",
        })
        const districts = data?.result?.values || [];
        setDistrictsOptionRead(districts);

        const districtNameArray = districts.map((item: any) =>
          item.label?.toLowerCase()
        );
        setDistrictNameArr(districtNameArray);

        const districtCodeArray = districts.map((item: any) => item.value);
        setDistrictCodeArr(districtCodeArray);

        const districtFieldID = data?.result?.fieldId || "";
        setDistrictFieldId(districtFieldID);
      }
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [stateCode]);

  const getFilteredCohortData = async () => {
    try {
      setLoading(true);
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          name: searchKeyword,
          states: stateCode,
          type: CohortTypes.DISTRICT,
          status: ["active"],
        },
        sort: sortBy,
      };

      // const response = await queryClient.fetchQuery({
      //   queryKey: [
      //     QueryKeys.FIELD_OPTION_READ,
      //     reqParams.limit,
      //     reqParams.offset,
      //     searchKeyword || "",
      //     CohortTypes.DISTRICT,
      //     reqParams.sort.join(","),
      //   ],
      //   queryFn: () => getCohortList(reqParams),
      // });
      const response = await getCohortList(reqParams);
      const cohortDetails = response?.results?.cohortDetails || []; 
      const filteredDistrictData = cohortDetails
        .map(
          (districtDetail: {
            cohortId: any;
            name: string;
            createdAt: any;
            updatedAt: any;
            createdBy: any;
            updatedBy: any;
            status: any;
          }) => {
            const transformedName = districtDetail.name;

            const matchingDistrict = districtsOptionRead.find(
              (district: { label: string }) =>
                district?.label?.toLowerCase() ===
                transformedName?.toLowerCase()
            );
            return {
              label: transformedName,
              value: matchingDistrict ? matchingDistrict.value : null,
              createdAt: districtDetail.createdAt,
              updatedAt: districtDetail.updatedAt,
              createdBy: districtDetail.createdBy,
              updatedBy: districtDetail.updatedBy,
              cohortId: districtDetail?.cohortId,
              status: districtDetail?.status,
            };
          }
        )
        .filter((district: { label: any }) =>
          districtNameArr.includes(district.label?.toLowerCase())
        );
      if (isFirstVisit) {
        if (
          filteredDistrictData.length > 0 &&
          selectedDistrict !== t("COMMON.ALL") 
        ) {
          setSelectedDistrict(filteredDistrictData[0].value);
          setSelectedDistrictLabel(filteredDistrictData[0].label);

        }
        setIsFirstVisit(false);
      }
      setDistrictData(filteredDistrictData);
      const totalCount = filteredDistrictData.length;
      setPaginationCount(totalCount);
      setPageCount(Math.ceil(totalCount / pageLimit)); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
    } finally {
      setLoading(false);
    }
  };

  const dependencyArray = useMemo(() => {
    const baseDeps = [isFirstVisit, stateCode, districtsOptionRead, statusValue];
    if (CohortTypes.DISTRICT === cohortType) {
      baseDeps.push(searchKeyword, sortBy);
    }
    return baseDeps;
  }, [isFirstVisit, searchKeyword, stateCode, districtsOptionRead, statusValue,sortBy]);
  
  useEffect(() => {
    if (stateCode) {
      getFilteredCohortData();
    }
  }, dependencyArray);


  useEffect(() => {
    if (selectedDistrict === "" && districtData?.length !== 0) {
      setSelectedDistrict(districtData[0]?.value);
      setSelectedDistrictLabel(districtData[0]?.label);
    }
     else if (districtData?.length !== 0 ) {

      setSelectedDistrict(districtData[0]?.value);
      setSelectedDistrictLabel(districtData[0]?.label);

    }
  }, [districtData]);

  useEffect(() => {
    if (districtData[0]?.value && isFirstVisit) {
      setSelectedDistrict(districtData[0]?.value);
      setSelectedDistrictLabel(districtData[0]?.label);

      setIsFirstVisit(false);
    }
  }, [districtData]);
  const fetchBlocks = async () => {
    try {
      // const response = await queryClient.fetchQuery({
      //   queryKey: [
      //     QueryKeys.FIELD_OPTION_READ,
      //     selectedDistrict === t("COMMON.ALL") ? "" : selectedDistrict,
      //     "blocks",
      //   ],
      //   queryFn: () =>
      //     getBlocksForDistricts({
      //       controllingfieldfk:
      //         selectedDistrict === t("COMMON.ALL") ? "" : selectedDistrict,
      //       fieldName: "blocks",
      //     }),
      // });

      const response = await getBlocksForDistricts({
        controllingfieldfk:
          selectedDistrict === t("COMMON.ALL") ? "" : selectedDistrict,
        fieldName: "blocks",
      });
      const blocks = response?.result?.values || [];
      setBlocksOptionRead(blocks);

      const blockNameArray = blocks.map((item: any) =>
        item.label?.toLowerCase()
      );
      setBlockNameArr(blockNameArray);

      const blockCodeArray = blocks.map((item: any) => item.value);
      setBlockCodeArr(blockCodeArray);

      const blockFieldID =
        response?.result?.fieldId || "4aab68ae-8382-43aa-a45a-e9b239319857";
      setBlocksFieldId(blockFieldID);
    } catch (error) {
      console.error("Error fetching blocks", error);
    }
  };

  useEffect(() => {
    if(cohortType === CohortTypes.BLOCK) {
      fetchBlocks();

    }
  }, [selectedDistrict, statusValue]);
  const getBlockDataCohort = async () => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          districts: districtValueForDelete,
          type: CohortTypes.BLOCK,
        },
        sort: sortBy,
      };
      // const response = await queryClient.fetchQuery({
      //   queryKey: [
      //     QueryKeys.FIELD_OPTION_READ,
      //     reqParams.limit,
      //     reqParams.offset,
      //     reqParams.filters.districts || "",
      //     CohortTypes.BLOCK,
      //     reqParams.sort.join(","),
      //   ],
      //   queryFn: () => getCohortList(reqParams),
      // });
      const response = await getCohortList(reqParams)

      const activeBlocks = response?.results?.cohortDetails || [];

      const activeBlocksCount = activeBlocks.filter(
        (block: { status: string }) => block.status === "active"
      ).length;
      setCountOfBlocks(activeBlocksCount);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
      setLoading(false);
    }
  };
  const getCohortSearchBlock = async (selectedDistrict: string) => {
    try {
      setLoading(true);
      if (!blocksOptionRead.length || !blockNameArr.length) {
        console.warn(
          "blocksOptionRead or blockNameArr is empty, waiting for data..."
        );
        setLoading(false);
        return;
      }

      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          name: searchKeyword,
          states: stateCode,
          districts:selectedDistrict === t("COMMON.ALL") ? "" : selectedDistrict,
          type: CohortTypes.BLOCK,
          status: [statusValue],
        },
        sort: sortBy,
      };

      // const response = await queryClient.fetchQuery({
      //   queryKey: [
      //     QueryKeys.FIELD_OPTION_READ,
      //     reqParams.limit,
      //     reqParams.offset,
      //     searchKeyword || "",
      //     stateCode,
      //     reqParams.filters.districts,
      //     CohortTypes.BLOCK,
      //     reqParams.sort.join(","),
      //   ],
      //   queryFn: () => getCohortList(reqParams),
      // });
      const response = await getCohortList(reqParams);

      const cohortDetails = response?.results?.cohortDetails || [];
      const filteredBlockData = cohortDetails
        .map(
          (blockDetail: {
            parentId: any;
            cohortId: any;
            name: string;
            code: string;
            createdAt: any;
            updatedAt: any;
            createdBy: any;
            updatedBy: any;
            status: string;
          }) => {
            const transformedName = blockDetail.name;

            const matchingBlock = blocksOptionRead.find(
              (block: BlockOption) =>
                block?.label?.toLowerCase() === transformedName?.toLowerCase()
            );

            return {
              name: transformedName,
              code: matchingBlock?.value ?? "",
              status: blockDetail.status,
              createdAt: blockDetail.createdAt,
              updatedAt: blockDetail.updatedAt,
              createdBy: blockDetail.createdBy,
              updatedBy: blockDetail.updatedBy,
              cohortId: blockDetail.cohortId,
              parentId: blockDetail.parentId,
            };
          }
        )
        .filter((block: { name: string }) =>
          blockNameArr.includes(block.name?.toLowerCase())
        ); 
      setBlockData(filteredBlockData);
      setShowAllBlocks(filteredBlockData);

      const totalCount = filteredBlockData.length;
      setPaginationCount(totalCount);
      setPageCount(Math.ceil(totalCount / pageLimit));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching and filtering cohort blocks", error);
      setLoading(false);
    }
  };

  useEffect(() => {

    if (selectedDistrict && CohortTypes.BLOCK === cohortType) {


      getCohortSearchBlock(selectedDistrict);
    }
  }, [
    filters,
     searchKeyword,
    // pageLimit,
    // pageOffset,
    sortBy,
    blocksOptionRead,
    blockNameArr,
  ]);

  const getCohortDataCohort = async () => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          blocks: parentIdBlock, //cohort id of block
        },
      };

      const response: any = await getCohortList(reqParams);

      const activeCenters = response?.results?.cohortDetails || [];

      const activeCentersCount = activeCenters.filter(
        (block: { status: string }) => block.status === "active"
      ).length;
      setCountOfCenter(activeCentersCount);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
    }
  };

  useEffect(() => {
    if (parentIdBlock) {
      getCohortDataCohort();
    }
  }, [parentIdBlock]);

  function transformLabels(label: string) {
    if (!label || typeof label !== "string") return "";
    return label
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const filteredCohortOptionData = () => {
    const startIndex = pageOffset * pageLimit;
    const endIndex = startIndex + pageLimit;
    let transformedData;
    if (cohortType === CohortTypes.BLOCK) {
      transformedData = blockData?.map((item) => ({
        ...item,
        label: transformLabels(item.label),
      }));
      return transformedData.slice(startIndex, endIndex);
    } else if (cohortType === CohortTypes.DISTRICT) {
      transformedData = districtData.map((item) => ({
        ...item,
        label: transformLabels(item.label),
      })); 
      return transformedData.slice(startIndex, endIndex);
    } else {
      transformedData = blockData?.map((item) => ({
        ...item,
        label: transformLabels(item.label),
      }));
      return transformedData.slice(startIndex, endIndex);
    }
    transformedData = blockData?.map((item) => ({
      ...item,
      label: transformLabels(item.label),
    }));
    return transformedData.slice(startIndex, endIndex);
  };

  const handleSortChange = async (event: SelectChangeEvent) => {
    const sortOrder =
      event.target.value === "Z-A" ? SORT.DESCENDING : SORT.ASCENDING;
    setSortBy(["name", sortOrder]);
    setSelectedSort(event.target.value);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, "");
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: "sort-by:" + event.target?.value,
        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  const handleStateChange = async (event: SelectChangeEvent<string>) => {
    const selectedState = event.target.value;
    setSelectedState(selectedState);
  };

  const handleDistrictChange = async (event: SelectChangeEvent<string>) => {
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);

    const selectedDistrict = event.target.value;
    setSelectedDistrict(selectedDistrict);
    setShowAllBlocks("");

    const selectedDistrictData = districtData.find(
      (district) => district.value === selectedDistrict
    ); 
setSelectedDistrictLabel(selectedDistrictData?.label||"");

    const cohortId = selectedDistrictData?.cohortId as any | null;

    setSelectedCohortId(cohortId);
    if (selectedDistrict) {
      await getCohortSearchBlock(selectedDistrict);
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
        id: "filter-by-district:" + event.target.value,
        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };
  const getStatecohorts = async () => {
    let userId: any;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        userId = localStorage.getItem(Storage.USER_ID);
      }

      const response = await queryClient.fetchQuery({
        queryKey: [QueryKeys.MY_COHORTS, userId],
        queryFn: () => getMyCohorts(userId),
      });

      const cohortData = response?.result?.cohortData;
      if (Array.isArray(cohortData)) {
        const stateCohort = cohortData.find(
          (cohort) => cohort.type === "STATE"
        );

        if (stateCohort) {
          const cohortIdOfState = stateCohort.cohortId;
          setCohortIdOfState(cohortIdOfState);
        } else {
          console.error("No STATE type cohort found");
        }
      } else {
        console.error("cohortData is not an array or is undefined");
      }
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatecohorts();
  }, []);
  useEffect(() => {
    if (selectedDistrict && cohortType === CohortTypes.BLOCK) {
      getCohortSearchBlock(selectedDistrict);
    }
  }, [blockNameArr, searchKeyword, pageLimit, pageOffset, selectedDistrict]);

  const handleEdit = (rowData: any) => { 
   cohortType === CohortTypes.BLOCK? setModalOpen(true): setDistrictModalOpen(true);
    const cohortIdForEDIT = rowData.cohortId;
    setCohortIdForEdit(cohortIdForEDIT);
    let updatedRowData;
    if(cohortType === CohortTypes.DISTRICT){
      updatedRowData = {
        ...rowData,
        name: rowData.name || "",
        value: rowData.value || "",
        stateCode: stateCode,
        cohortId: cohortIdForEDIT,
        selectedState: selectedState || "All",
      };
    }
    else
    {
      updatedRowData = {
        ...rowData,

      name: rowData.name || "",
      value: rowData.code || "",
      selectedDistrict: selectedDistrictLabel || "All",
      selectedState: selectedState || "All",

      controllingField: selectedDistrict,
      block: "",
      label: "",
    };    }
    
    setSelectedStateForEdit(updatedRowData);
  };
  useEffect(() => {
    if (districtValueForDelete) {
      getBlockDataCohort();
    }
  }, [districtValueForDelete]);
  const handleDelete = (rowData: BlockDetail) => {
    setSelectedStateForDelete(rowData);
    setCohortIdForDelete(rowData.cohortId);
    setConfirmationDialogOpen(true);

    setParentIdBlock(rowData.code as any | null);
    const blockValue = rowData.value;
    setBlockValueForDelete(blockValue);
  };
  const handleDeleteDistrict = (rowData: DistrictDetail) => {
    setSelectedDistrictStateForDelete(rowData);
    const districtValue = rowData.value;
    setDistrictValueForDelete(districtValue);
    setCohortIdForDelete(rowData.cohortId);
    setDistrictConfirmationDialogOpen(true);
  };

  const handleSearch = (keyword: string) => {
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);
    setSearchKeyword(keyword);
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
      setFilters((prevFilters: any) => ({
        ...prevFilters,
        status: [Status.ACTIVE],
      }));
      setIsArchived(false);
    } else if (newValue === Status.ARCHIVED) {
      setFilters((prevFilters: any) => ({
        ...prevFilters,
        status: [Status.ARCHIVED],
      }));
      setIsArchived(true);
    } else if (newValue === Status.ALL_LABEL) {
      setFilters((prevFilters: any) => ({
        ...prevFilters,
        status: "",
      }));
      setIsArchived(false);
    } else {
      setFilters((prevFilters: any) => {
        const { status, ...restFilters } = prevFilters;
        return {
          ...restFilters,
        };
      });
      setIsArchived(false);
    }

    await queryClient.invalidateQueries({
      queryKey: [QueryKeys.FIELD_OPTION_READ],
    });
    // const reqParams = {
    //   limit: 0,
    //   offset: 0,
    //   filters: {
    //     name: searchKeyword,
    //     states: stateCode,
    //     type: CohortTypes.DISTRICT,
    //     status: [newValue],
    //   },
    //   sort: sortBy,
    // };
    // queryClient.fetchQuery({
    //   queryKey: [QueryKeys.FIELD_OPTION_READ, newValue],
    //   queryFn: () => getCohortList(reqParams),
    // });
  //  getFilteredCohortData();

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, "");
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: "changed-tab-to:" + newValue,
        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  const handleConfirmDelete = async () => {
     {
      try {
        if (selectedStateForDelete) {
        await deleteOption("blocks", selectedStateForDelete.value);
        setStateData((prevStateData) =>
          prevStateData.filter(
            (state) => state.value !== selectedStateForDelete.value
          )
        );
        

        if (cohortType === CohortTypes.BLOCK) {
          showToastMessage(t("COMMON.BLOCK_DELETED_SUCCESS"), "success")
          filteredCohortOptionData();
          fetchBlocks();
        }
      }
      else if(selectedDistrictStateForDelete)
      {await deleteOption("districts", selectedDistrictStateForDelete.value);
      setDistrictData((prev) =>
        prev.filter(
          (district) => district.value !== selectedDistrictStateForDelete.value
        )
      );
         if(cohortType === CohortTypes.DISTRICT) {
          showToastMessage(t("COMMON.DISTRICT_DELETED_SUCCESS"), "success")
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
          });
          fetchDistricts();
        }
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
            id: "block-deletion-success",
            type: TelemetryEventType.CLICK,
            subtype: "",
            pageid: cleanedUrl,
          },
        };
        telemetryFactory.interact(telemetryInteract);
      } catch (error) {
        console.error("Error deleting state", error);
        showToastMessage(t("Unable to delete"), "error");
      }
    }
    //delete cohort
    if (cohortIdForDelete) {
      const cohortDetails = {
        status: Status.ARCHIVED,
      };
      const resp = await updateCohort(cohortIdForDelete, cohortDetails);
      if (resp?.responseCode === 200) {
        const cohort = filteredCohortOptionData()?.find(
          (item: any) => item.cohortId == cohortIdForDelete
        );
        if (cohort) {
          cohort.status = Status.ARCHIVED;
        }
      } else {
        console.log("Cohort Not Archived");
      }
      setCohortIdForDelete("");
    } else {
      console.log("No Cohort Selected");
      setCohortIdForDelete("");
    }

    setConfirmationDialogOpen(false);
  };

  const handleChangePageSize = (event: SelectChangeEvent<typeof pageSize>) => {
    setPageSize(event.target.value);
    setPageLimit(Number(event.target.value));
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPageOffset(value - 1);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, "");
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: "change-page-number:" + value,
        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };
  const PagesSelector = () => (
    <Box sx={{ display: { xs: "block" } }}>
      <Pagination
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
        handleChange={handleChangePageSize}
        pageSize={pageSize}
        options={pageSizeArray}
      />
    </Box>
  );

  const handleAddNewBlock = () => {
    setEditState(null);
    setSelectedStateForEdit(null);
    setModalOpen(true);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, "");
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: "click-on-add-new",
        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  //create cohort
  const handleCreateCohortSubmit = async (
    type: string,
    name: string,
    value: string,
    controllingField: string,
    cohortId?: string,
    stateParentId?: string,
    stateCodeForCreate?: string
   
  ) => { 

    const fieldId = type === "block" ? blocksFieldId : districtFieldId;
    const toastSuccessMessage =
      type === "block"
        ? t("COMMON.BLOCK_ADDED_SUCCESS")
        : t("COMMON.DISTRICT_UPDATED_SUCCESS");
    const toastErrorMessage =
      type === "block"
        ? t("COMMON.BLOCK_DUPLICATION_FAILURE")
        : t("COMMON.DISTRICT_DUPLICATION_FAILURE");

    const newEntity = {
      isCreate: true,
      options: [
        {
          controllingfieldfk: controllingField,
          name,
          value,
        },
      ],
    };

    try {
      const response = await createOrUpdateOption(fieldId, newEntity, t);

      if (response && type === "block") {
         fetchBlocks();
      } else if (response && type === "district") {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode , "districts"],
        });
         fetchDistricts();
      }
      let queryParameters;
      if (type === "block") {
        queryParameters = {
          name: name,
          type: CohortTypes.BLOCK,
          status: Status.ACTIVE,
          parentId: cohortId || "",
          customFields: [
            {
              fieldId: stateFieldId, // state fieldId
              value: [stateCodeForCreate], // state code
            },

            {
              fieldId: districtFieldId, // district fieldId
              value: [controllingField], // district code
            },
          ],
        };
      } else if (type === "district") {
        queryParameters = {
          name: name,
          type: CohortTypes.DISTRICT,
          status: Status.ACTIVE,
          parentId: stateParentId? stateParentId[0]:"",
          customFields: [
            {
              fieldId: localStorage.getItem("stateFieldId") || stateFieldId,
              value: [controllingField],
            },
          ],
        };
      }

      try {
        const cohortCreateResponse = await createCohort(queryParameters);
        if (cohortCreateResponse) {
          filteredCohortOptionData();
          showToastMessage(t(toastSuccessMessage), "success");
        } else if (cohortCreateResponse.responseCode === 409) {
          showToastMessage(t(toastErrorMessage), "error");
        }
      } catch (error) {
        console.error("Error creating cohort:", error);
        showToastMessage(t(toastErrorMessage), "error");
      }
    } catch (error) {
      console.error("Error adding district:", error);
    }

    setModalOpen(false);
    setSelectedStateForEdit(null);
  };

   const handleUpdateCohortSubmit = async (
    type: string,
    name: string,
    value: string,
    controllingField: string,
    entityId?: string
  ) => {
    const updatedBy = localStorage.getItem("userId");
    if (!updatedBy) return;

    const fieldId = type === "block" ? blocksFieldId : districtFieldId;
    const successMessage =
      type === "block"
        ? "COMMON.BLOCK_UPDATED_SUCCESS"
        : "COMMON.DISTRICT_UPDATED_SUCCESS";
    const duplicationMessage =
      type === "block"
        ? "COMMON.BLOCK_DUPLICATION_FAILURE"
        : "COMMON.DISTRICT_DUPLICATION_FAILURE";
    const telemetryId =
      type === "block" ? "block-update-success" : "district-updated-success";

    const newEntity = {
      isCreate: false,
      options: [
        {
          controllingfieldfk: controllingField,
          name,
          value,
          updatedBy,
        },
      ],
    };

    try {
      // Create or update entity
      const response = await createOrUpdateOption(fieldId, newEntity, t);
      if (response) {
        if (type === "block") {
          filteredCohortOptionData();
        }
        // queryClient.invalidateQueries({
        //   queryKey: [
        //     QueryKeys.FIELD_OPTION_READ,
        //     stateCode,
        //     type === "block" ? "blocks" : "districts",
        //   ],
        // });
        else if(type === "district") {
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
          });
          fetchDistricts();
        }
      

        const queryParameters = {
          name: name,
          updatedBy: localStorage.getItem("userId"),
        };

        try {
          const cohortCreateResponse = await updateCohort(
            cohortIdForEdit,
            queryParameters
          );
          if (cohortCreateResponse) {
            if (type === "block") {
              await fetchBlocks();
              await getCohortSearchBlock(selectedDistrict);
            }

            showToastMessage(t(successMessage), "success");

            // Handle telemetry
            const windowUrl = window.location.pathname;
            const cleanedUrl = windowUrl.replace(/^\//, "");
            const env = cleanedUrl.split("/")[0];

            const telemetryInteract = {
              context: {
                env: env,
                cdata: [],
              },
              edata: {
                id: telemetryId,
                type: TelemetryEventType.CLICK,
                subtype: "",
                pageid: cleanedUrl,
              },
            };
            telemetryFactory.interact(telemetryInteract);
          } else if (cohortCreateResponse.responseCode === 409) {
            showToastMessage(t(duplicationMessage), "error");
          }
        } catch (error) {
          console.error(`Error updating cohort for ${type}:`, error);
          showToastMessage(t(duplicationMessage), "error");
        }
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
    } finally {
      setModalOpen(false);
      setSelectedStateForEdit(null);
    }
  };

  const handleStateChangeWrapper = async (
    selectedNames: string[],
    selectedCodes: string[],
    cohortIdOfState?: string
  ) => {
    try {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
      });
      setBlockData([]); 
      // setStateParentId(cohortIdOfState);
      if(selectedCodes[0]!==stateCode)
      setDistrictData([]);
      // setSelectedNames(selectedNames);
      setStateCode(selectedCodes[0]);
      setSelectedState(selectedNames[0]);
    } catch (error) {
      console.log(error);
    }
  };
  const blockUserProps = {
    selectedFilter,
    handleSearch: handleSearch,
    showStateDropdown: false,
    userType: t("MASTER.BLOCKS"),
    searchPlaceHolder: t("MASTER.SEARCHBAR_PLACEHOLDER_BLOCK"),
    showFilter: true,
    showSort: true,
    showAddNew: !!isActiveYear && userRole === Role.CENTRAL_ADMIN,
    statusValue: statusValue,
    setStatusValue: setStatusValue,
    handleFilterChange: handleFilterChange,
    selectedSort: selectedSort,
    shouldFetchDistricts: false,
    handleSortChange: handleSortChange,
    handleAddUserClick: handleAddNewBlock,
  };
  const districtUserProps = {
    handleSearch: handleSearch,
    showStateDropdown: false,
    userType: t("MASTER.DISTRICTS"),
    searchPlaceHolder: t("MASTER.SEARCHBAR_PLACEHOLDER_DISTRICT"),
    showFilter: false,
    showSort: true,
    selectedSort: selectedSort,
    shouldFetchDistricts: false,
    handleSortChange: handleSortChange,
    showAddNew: !!isActiveYear && userRole === Role.CENTRAL_ADMIN,
    handleAddUserClick: () => {
      setDistrictModalOpen(true);
      setSelectedStateForEdit(null);
      const windowUrl = window.location.pathname;
      const cleanedUrl = windowUrl.replace(/^\//, "");
      const env = cleanedUrl.split("/")[0];

      const telemetryInteract = {
        context: {
          env: env,
          cdata: [],
        },
        edata: {
          id: "click-on-add-new",
          type: TelemetryEventType.CLICK,
          subtype: "",
          pageid: cleanedUrl,
        },
      };
      telemetryFactory.interact(telemetryInteract);
    },
  };

  return (
    <React.Fragment>
      <AddBlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(
          name: string,
          value: string,
          controllingField: string,
          cohortId?: string,
          fieldId?: string,
          districtId?: string,
          stateCode?: string
        ) => { 
          if (selectedStateForEdit) {
            handleUpdateCohortSubmit(
              "block",
              name?.toLowerCase(),
              value,
              controllingField
              // blocksFieldId,
              // selectedStateForEdit.value
            );
          } else {
            handleCreateCohortSubmit(
              "block",
              name?.toLowerCase(),
              value,
              controllingField,
              cohortId,
              blocksFieldId,
              stateCode
            );
          }
        }}
        fieldId={blocksFieldId}
        initialValues={
          selectedStateForEdit
            ? {
                name: selectedStateForEdit.name,
                value: selectedStateForEdit.value,
                controllingField: selectedStateForEdit.controllingField,
               controllingFieldLabel: selectedStateForEdit.selectedDistrict,
               stateLabel:selectedStateForEdit.selectedState
              }
            : {}
        }
      />

      <AddDistrictModal
        open={districtModalOpen}
        onClose={() => setDistrictModalOpen(false)}
        onSubmit={(name, value, controllingField, cohortId,stateParentId) => {
          if (selectedStateForEdit) {
            handleUpdateCohortSubmit(
              "district",
              name?.toLowerCase(),
              value,
              controllingField,
              
              stateParentId
              // districtFieldId,
              // selectedStateForEdit?.value
            );
          } else {
            handleCreateCohortSubmit(
              "district",
              name?.toLowerCase(),
              value,
              controllingField,
              cohortId,
              stateParentId
            );
          }
        }}
        fieldId={districtFieldId}
        initialValues={
          selectedStateForEdit
            ? {
                name: selectedStateForEdit.label,
                value: selectedStateForEdit.value,
                controllingField: selectedStateForEdit.stateCode,
                controllingFieldLabel: selectedStateForEdit.selectedState,
              }
            : {}
        }
      />
      <ConfirmationModal
        modalOpen={confirmationDialogOpen}
        message={
          countOfCenter > 0
            ? t("COMMON.ARE_YOU_SURE_DELETE_BLOCK", {
                centerCount: `${countOfCenter}`,
              })
            : t("COMMON.NO_ACTIVE_CENTERS_DELETE")
        }
        handleAction={handleConfirmDelete}
        buttonNames={{
          primary: t("COMMON.DELETE"),
          secondary: t("COMMON.CANCEL"),
        }}
        disableDelete={countOfCenter > 0}
        handleCloseModal={() => setConfirmationDialogOpen(false)}
      />
   <ConfirmationModal
        modalOpen={confirmationDistrictDialogOpen}
        message={
          countOfBlocks > 0
            ? t("COMMON.ARE_YOU_SURE_DELETE", {
              block: `${countOfBlocks}`,
            })
            : t("COMMON.NO_ACTIVE_BLOCKS_DELETE")
        }
        handleAction={handleConfirmDelete}
        buttonNames={{
          primary: t("COMMON.DELETE"),
          secondary: t("COMMON.CANCEL"),
        }}
        disableDelete={countOfBlocks > 0}
        handleCloseModal={() => setDistrictConfirmationDialogOpen(false)}
      />




      <HeaderComponent
        {...(cohortType === CohortTypes.BLOCK
          ? blockUserProps
          : districtUserProps)}
      >
        {loading ? (
          <Box
            width={"100%"}
            id="check"
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Loader showBackdrop={false} loadingText="Loading" />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                marginTop: 2,
                marginLeft: 2,
                "@media (max-width: 580px)": {
                  width: "90%",
                  flexDirection: "column",
                },
              }}
            >
              {userRole === Role.CENTRAL_ADMIN ? (
                <MultipleSelectCheckmarks
                  names={states?.map(
                    (state) =>
                      state.label?.toLowerCase().charAt(0).toUpperCase() +
                      state.label?.toLowerCase().slice(1)
                  )}
                  codes={states?.map((state) => state.value)}
                  cohortIds={states?.map((state) => state.cohortId)}

                  tagName={t("FACILITATORS.STATE")}
                  selectedCategories={[selectedState]}
                  onCategoryChange={handleStateChangeWrapper}
                  disabled={stateValue ? true : false}
                  // overall={!inModal}
                  width="200px"
                  defaultValue={defaultStates?.label}
                />
              ) : userRole !== "" && cohortType === CohortTypes.BLOCK ? (
                <FormControl
                  sx={{
                    width: "25%",
                    // marginLeft: 2,
                    "@media (max-width: 580px)": {
                      width: "100%",
                    },
                  }}
                >
                  <Select
                    labelId="state-select-label"
                    id="state-select"
                    value={stateCode}
                    onChange={handleStateChange}
                    disabled
                  >
                    <MenuItem key={stateCode} value={stateCode}>
                      {transformLabel(stateValue)}
                    </MenuItem>
                  </Select>
                </FormControl>
              ) : (
                CohortTypes.DISTRICT && (
                  <FormControl variant="outlined" sx={{ minWidth: 220 }}>
                    <InputLabel id="state-select-label">
                      {stateValue}
                    </InputLabel>
                    <Select
                      labelId="state-select-label"
                      id="state-select"
                      disabled
                    >
                      <MenuItem key={stateCode} value={stateCode}>
                        {transformLabel(stateValue)}
                      </MenuItem>
                    </Select>
                  </FormControl>
                )
              )}

              {cohortType === CohortTypes.BLOCK && (
                <FormControl
                  sx={{
                    width: "25%",
                    "@media (max-width: 580px)": {
                      width: "100%",
                      marginLeft: 2,
                    },
                  }}
                >
                  <InputLabel
                    sx={{ backgroundColor: "white", padding: "2px 8px" }}
                    id="district-select-label"
                  >
                    {t("MASTER.DISTRICTS")}
                  </InputLabel>
                  <Select
                    labelId="district-select-label"
                    id="district-select"
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 400,
                        },
                      },
                    }}
                  >
                    <MenuItem value={t("COMMON.ALL")}>
                      {t("COMMON.ALL")}
                    </MenuItem>
                    {districtData.map((districtDetail) => (
                      <MenuItem
                        key={districtDetail.value}
                        value={districtDetail.value}
                        sx={{
                          height: "40px",
                        }}
                      >
                        {transformLabels(districtDetail.label)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            <Box sx={{ marginTop: 2 }}>
              {filteredCohortOptionData().length > 0 ? (
                cohortType === CohortTypes.BLOCK ? (
                  <KaTableComponent
                    columns={getBlockTableData(t, isMobile, isArchived)}
                    data={filteredCohortOptionData()}
                    limit={pageLimit}
                    offset={pageOffset}
                    paginationEnable={paginationCount >= Numbers.FIVE}
                    PagesSelector={PagesSelector}
                    PageSizeSelector={PageSizeSelectorFunction}
                    pageSizes={pageSizeArray}
                    onEdit={handleEdit}
                    pagination={pagination}
                    onDelete={handleDelete}
                    extraActions={[]}
                  />
                ) : (
                  cohortType === CohortTypes.DISTRICT && (
                    <KaTableComponent
                      columns={getDistrictTableData(t, isMobile, isArchived)}
                      data={filteredCohortOptionData()}
                      limit={pageLimit}
                      offset={pageOffset}
                      paginationEnable={paginationCount >= Numbers.FIVE}
                      PagesSelector={PagesSelector}
                      PageSizeSelector={PageSizeSelectorFunction}
                      pageSizes={pageSizeArray}
                      pagination={pagination}
                      onEdit={handleEdit}
                      onDelete={handleDeleteDistrict}
                      extraActions={[]}
                      // noDataMessage={t("COMMON.DISTRICT_NOT_FOUND")}
                    />
                  )
                )
              ) : !loading && filteredCohortOptionData().length === 0 ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="20vh"
                >
                  <Typography marginTop="10px" textAlign="center">
                    {cohortType=== CohortTypes.BLOCK
                      ? t("COMMON.BLOCKS_NOT_FOUND")
                      : t("COMMON.DISTRICT_NOT_FOUND")}
                  </Typography>
                </Box>
              ) : null}
            </Box>
            
          </>
        )}
      </HeaderComponent>
    </React.Fragment>
  );
};
export default MasterData;
