import React, { useState, useEffect, useMemo } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { DataType } from "ka-table/enums";
import HeaderComponent from "@/components/HeaderComponent";
import { Chip, Pagination, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import Loader from "@/components/Loader";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  getStateBlockDistrictList,
  getDistrictsForState,
  getBlocksForDistricts,
  deleteOption,
  createOrUpdateOption,
  fieldSearch,
} from "@/services/MasterDataService";
import { transformLabel } from "@/utils/Helper";
import { showToastMessage } from "@/components/Toastify";
import ConfirmationModal from "@/components/ConfirmationModal";
import { AddSchoolModal } from "@/components/AddSchoolModal";
import PageSizeSelector from "@/components/PageSelector";
import { QueryKeys, SORT, Storage } from "@/utils/app.constant";
import { getUserDetailsInfo } from "@/services/UserList";
import {
  createCohort,
  getCohortList,
} from "@/services/CohortService/cohortService";
import { Numbers } from "@/utils/app.constant";
import { useQueryClient } from "@tanstack/react-query";

type StateDetail = {
  block: string | undefined;
  selectedDistrict: string | undefined;
  value: string;
  label: string;
};

type DistrictDetail = {
  value: string;
  label: string;
};

type BlockDetail = {
  updatedBy: any;
  createdBy: any;
  updatedAt: any;
  createdAt: any;
  value: string;
  label: string;
  block: string;
};

const Block: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedSort, setSelectedSort] = useState<string>("Sort");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCluster, setSelectedCluster] = useState<string>("");
  const [stateData, setStateData] = useState<StateDetail[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [districtData, setClustersData] = useState<DistrictDetail[]>([]);
  const [matchedClusters, setMatchedClusters] = useState<DistrictDetail[]>([]);
  const [blockData, setBlockData] = useState<BlockDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageOffset, setPageOffset] = useState<number>(0);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [pageCount, setPageCount] = useState<number>(1);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<BlockDetail | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editState, setEditState] = useState<StateDetail | null>(null);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [schoolFieldId, setSchoolsFieldId] = useState<string>("");
  const [clusterFieldId, setClusterFieldId] = useState<string>("");
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [paginationCount, setPaginationCount] = useState<number>(0);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10, 20, 50]);
  const [stateCode, setStateCode] = useState<any>([]);
  const [stateValue, setStateValue] = useState<string>("");
  const [cohortStatus, setCohortStatus] = useState<any>();
  const [cohortId, setCohortId] = useState<any>();
  const [stateFieldId, setStateFieldId] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pagination, setPagination] = useState(true);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);
    const [cohortData, setCohortData] = useState<Array<any>>([]);
    const [dataToDisplay, setDataToDisplay] = useState<Array<any>>([]);

    const fetchCohortData = async (type: string) => {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          type: type,
          status: ["active"]
        },
        sort: ["name", "asc"],
      };
    
      try {
        const response = await getCohortList(reqParams);
        setCohortData(response?.results?.cohortDetails);
        console.log(`setCohortData`, response?.results?.cohortDetails);
        console.log('type', type);
        return response?.results?.cohortDetails || [];
      } catch (error) {
        console.error("Error fetching cohort data", error);
        return [];
      }
    };
    
    useEffect(() => {
      fetchCohortData("SCHOOL");
    }, []);
    
    const matchedData: any = useMemo(() => {
      return blockData?.filter((item) =>
        cohortData?.some((data) => data.name === item.label)
      );
    }, [blockData, cohortData]);
    
    const totalCount = matchedData?.length || 0;
    
    useEffect(() => {
      setPaginationCount(totalCount);
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
      setPageCount(Math.ceil(totalCount / pageLimit));
    
      console.log("totalCount", totalCount);
    }, [totalCount, pageLimit]);
    
    useEffect(() => {
      const fetchUserDetail = async () => {
        let userId: any;
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            userId = localStorage.getItem(Storage.USER_ID);
          }
          const response = await getUserDetailsInfo(userId);
    
          console.log("profile api is triggered", response.userData.customFields);
    
          const statesField = response.userData.customFields.find(
            (field: { label: string }) => field.label === "STATES"
          );
    
          console.log("stateField", statesField);
    
          if (statesField) {
            setStateValue(statesField.value);
            setStateCode(statesField.code);
            setStateFieldId(statesField?.fieldId);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchUserDetail();
    }, []);
    
    useEffect(() => {
      const fetchClusters = async () => {
        try {
          const data = await getStateBlockDistrictList({
            fieldName: "clusters",
          });
    
          const clusters = data?.result?.values || [];
          setClustersData(clusters);
    
          const clusterFieldId = data?.result?.fieldId || "";
          setClusterFieldId(clusterFieldId);
    
          if (clusters.length > 0) {
            const cohortSearchResp = await fetchCohortData("CLUSTER");
            const matchedClusters = clusters.filter((item: { label: any }) =>
              cohortSearchResp.some((data: { name: any }) => data.name === item.label)
            );
            setMatchedClusters(matchedClusters);
          }
        } catch (error) {
          console.error("Error fetching clusters", error);
        }
      };
    
      fetchClusters();
    }, [stateCode]);
    
  

  const getCohortSearchBlock = async () => {
    const limit = 300;
    const offset = pageOffset * limit;
    const reqParams = {
      limit: limit,
      offset: offset,
      filters: {
        name: selectedCluster,
        type: "CLUSTER",
        status: ["active"]
      },
    };

    const response = await queryClient.fetchQuery({
      queryKey: [
        QueryKeys.GET_COHORT_LIST,
        reqParams.limit,
        reqParams.offset,
        reqParams.filters,
      ],
      queryFn: () => getCohortList(reqParams),
    });

    // const response = await getCohortList(reqParams);

    const cohortDetails = response?.results?.cohortDetails;

    if (cohortDetails && cohortDetails.length > 0) {
      const firstCohort = cohortDetails[0];
      const cohortID = firstCohort?.cohortId;
      const cohortSTATUS = firstCohort?.status;

      setCohortId(cohortID);
      setCohortStatus(cohortSTATUS);
    } else {
      console.error("No cohort details available.");
    }
  };

  useEffect(() => {
    getSchoolFieldId();
  });

  const getSchoolFieldId = async () => {
    try {
      const response = await fieldSearch(
        {
          name: "schools",
        },
        1,
        0
      );
      if (response?.result?.length) {
        const temp = response?.result?.[0];
        const schoolFieldId = temp.fieldId || "";
        setSchoolsFieldId(schoolFieldId);
      }
    } catch (error) {
      console.error("No School field found", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getCohortSearchBlock();
  }, [selectedCluster]);

  const fetchSchools = async (clusterId: string) => {
    console.log("clusterId", clusterId);
    setLoading(true);
    try {
      const limit = 300;
      const offset = pageOffset * limit;

      // const response = await getBlocksForDistricts({
      //   limit: limit,
      //   offset: offset,
      //   controllingfieldfk: selectedCluster || "",
      //   fieldName: "schools",
      //   optionName: searchKeyword || "",
      //   sort: sortBy,
      // });

      const data = {
        limit: limit,
        offset: offset,
        controllingfieldfk: selectedCluster || "",
        fieldName: "schools",
        optionName: searchKeyword || "",
        sort: sortBy,
      };

      const response = await queryClient.fetchQuery({
        queryKey: [
          QueryKeys.GET_SCHOOLS_DATA,
          data.limit,
          data.offset,
          data.controllingfieldfk,
          data.fieldName,
          data.optionName,
          data.sort,
        ],
        queryFn: () => getBlocksForDistricts(data),
      });

      console.log("block response", response);
      setBlockData(response?.result?.values || []);


      //const schoolFieldId = response?.result?.fieldId || "";

      //console.log("setSchoolsFieldId", schoolFieldId);
      //setSchoolsFieldId(schoolFieldId);

      // const totalCount = response?.result?.totalCount || 0;
      // setPaginationCount(totalCount);

      // setPagination(totalCount > 10);
      // setPageSizeArray(
      //   totalCount > 15
      //     ? [5, 10, 15]
      //     : totalCount > 10
      //       ? [5, 10]
      //       : totalCount > 5
      //         ? [5]
      //         : []
      // );

      // setPageCount(Math.ceil(totalCount / limit));
    } catch (error) {
      console.error("Error fetching blocks", error);
      setBlockData([]);
    } finally {
      setLoading(false);
    }
  };
  console.log("blockData2", blockData);
  useEffect(() => {
    fetchSchools(selectedCluster);
  }, [searchKeyword, selectedCluster, sortBy, pageLimit]);

  const columns = [
    {
      key: "block",
      title: t("MASTER.SCHOOL"),
      dataType: DataType.String,
      width: "130",
    },
    {
      key: "value",
      title: t("MASTER.CODE"),
      dataType: DataType.String,
      width: "130",
    },
    {
      key: "createdBy",
      title: t("MASTER.CREATED_BY"),
      dataType: DataType.String,
      width: "160",
    },
    {
      key: "updatedBy",
      title: t("MASTER.UPDATED_BY"),
      dataType: DataType.String,
      width: "160",
    },

    {
      key: "createdAt",
      title: t("MASTER.CREATED_AT"),
      dataType: DataType.String,
      width: "130",
    },
    {
      key: "updatedAt",
      title: t("MASTER.UPDATED_AT"),
      dataType: DataType.String,
      width: "130",
    },
    {
      key: "actions",
      title: t("MASTER.ACTIONS"),
      dataType: DataType.String,
      width: "130",
    },
  ];

  const handleSortChange = async (event: SelectChangeEvent) => {
    const sortOrder =
      event.target.value === "Z-A" ? SORT.DESCENDING : SORT.ASCENDING;
    setSortBy(["name", sortOrder]);
    setSelectedSort(event.target.value);
  };

  const handleStateChange = async (event: SelectChangeEvent<string>) => {
    const selectedState = event.target.value;
    setSelectedState(selectedState);
  };

  const handleClusterChange = async (event: SelectChangeEvent<string>) => {
    const selectedCluster = event.target.value;
    setSelectedCluster(selectedCluster);
  };

  const handleEdit = (rowData: any) => {
    setModalOpen(true);
    const updatedRowData = {
      ...rowData,
      selectedDistrict: selectedCluster,
    };

    console.log("updatedRowData", updatedRowData);

    setSelectedStateForEdit(updatedRowData);
  };

  const handleDelete = (rowData: BlockDetail) => {
    console.log("deleted data for row", rowData);
    setSelectedStateForDelete(rowData);
    setConfirmationModalOpen(true);
    // setConfirmationDialogOpen(true);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedStateForDelete) {
      try {
        const response = await deleteOption(
          "schools",
          selectedStateForDelete.value
        );
        console.log("response", response?.response?.status);
        if (response?.status === 200) {
          setBlockData((prevStateData) =>
            prevStateData.filter(
              (state) => state.value !== selectedStateForDelete.value
            )
          );
          showToastMessage(t("COMMON.SCHOOL_DELETED_SUCCESS"), "success");
        } else {
          showToastMessage(t("COMMON.SCHOOL_DELETED_FAILURE"), "error");
        }
      } catch (error) {
        console.error("Error deleting state", error);
        showToastMessage(t("COMMON.SCHOOL_DELETED_FAILURE"), "error");
      }
      handleCloseModal();
    }
  };

  const handleChangePageSize = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSizeArray((prev) =>
      prev.includes(newSize) ? prev : [...prev, newSize]
    );
    setPageLimit(newSize);
  };

  function getPaginatedData<T>(data: T[], page: number, itemsPerPage: number): T[] {
    // Calculate the start and end indexes based on the current page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Return the slice of the data array for the current page
    return data.slice(startIndex, endIndex);
  }

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPageOffset(value - 1);
    const extractedData = getPaginatedData(matchedData, value, pageLimit);
    setDataToDisplay(extractedData)
    console.log('****', extractedData)
  };

  useEffect(() => {
    setDataToDisplay(matchedData ?? []);
    console.log('matchedData!!!!', matchedData.length)
  }, [matchedData]);

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
        pageSize={pageLimit}
        options={pageSizeArray}
      />
    </Box>
  );

  const userProps = {
    selectedFilter,
    showStateDropdown: false,
    userType: t("MASTER.SCHOOLS"),
    searchPlaceHolder: t("MASTER.SEARCHBAR_PLACEHOLDER_SCHOOL"),
    showFilter: false,
    showSort: true,
  };

  const handleAddNewBlock = () => {
    setEditState(null);
    setSelectedStateForEdit(null);
    setModalOpen(true);
    console.log("insdie add state clicked");
  };

  const handleAddSchoolSubmit = async (
    parentClusterName: string,
    name: string,
    value: string,
    controllingField: string,
    blocksFieldId: string
  ) => {
    const reqParams = {
      limit: 1,
      offset: 0,
      filters: {
        name: parentClusterName,
        type: "CLUSTER",
      },
    };

    const response = await queryClient.fetchQuery({
      queryKey: [
        QueryKeys.GET_COHORT_LIST,
        reqParams.limit,
        reqParams.offset,
        reqParams.filters,
      ],
      queryFn: () => getCohortList(reqParams),
    });

    // const response = await getCohortList(reqParams);

    const cohortDetails = response?.results?.cohortDetails;
    let parentCohortId = "";
    if (cohortDetails && cohortDetails.length > 0) {
      parentCohortId = cohortDetails[0]?.cohortId;
      setCohortId(parentCohortId);
    } else {
      showToastMessage(
        t("COMMON.COHORT NOT CREATED FOR SELECTED CLUSTER"),
        "error"
      );
      return false;
    }

    const newSchool = {
      options: [
        {
          controllingfieldfk: controllingField,
          label: name,
          name,
          value,
        },
      ],
    };
    console.log("Submitting newSchool:", newSchool);

    try {
      const response = await createOrUpdateOption(blocksFieldId, newSchool);

      console.log("submit response district", response);

      if (response) {
        await fetchSchools(blocksFieldId || "");
      }
    } catch (error) {
      console.error("Error adding block:", error);
    }

    const queryParameters = {
      name: name,
      type: "SCHOOL",
      status: cohortStatus,
      parentId: parentCohortId,
      customFields: [
        {
          fieldId: clusterFieldId, // district fieldId
          value: [controllingField], // district code
        },
      ],
    };

    const cohortList = await createCohort(queryParameters);
    try {
      if (cohortList) {
        showToastMessage(t("COMMON.BLOCK_UPDATED_SUCCESS"), "success");
      } else if (cohortList.responseCode === 409) {
        showToastMessage(t("COMMON.BLOCK_DUPLICATION_FAILURE"), "error");
      }
    } catch (error) {
      console.error("Error creating cohort:", error);
      showToastMessage(t("COMMON.BLOCK_DUPLICATION_FAILURE"), "error");
    }
    setModalOpen(false);
    setSelectedStateForEdit(null);
  };

  return (
    <React.Fragment>
      <AddSchoolModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(
          parentClusterName: string,
          name: string,
          value: string,
          controllingField: string
        ) =>
          handleAddSchoolSubmit(
            parentClusterName,
            name,
            value,
            controllingField,
            schoolFieldId
          )
        }
        fieldId={schoolFieldId}
        initialValues={
          selectedStateForEdit
            ? {
                controllingField: selectedStateForEdit.selectedDistrict,
                name: selectedStateForEdit.block,
                value: selectedStateForEdit.value,
              }
            : {}
        }
        validateDuplicateData={blockData}
      />

      <ConfirmationModal
        message={t("CENTERS.SURE_DELETE_DATA", {
          data: `${selectedStateForDelete?.block}`,
        })}
        handleAction={handleConfirmDelete}
        buttonNames={{
          primary: t("COMMON.YES"),
          secondary: t("COMMON.CANCEL"),
        }}
        handleCloseModal={handleCloseModal}
        modalOpen={confirmationModalOpen}
      />

      <HeaderComponent
        {...userProps}
        handleAddUserClick={handleAddNewBlock}
        handleSearch={handleSearch}
        selectedSort={selectedSort}
        handleSortChange={handleSortChange}
        showSort={true}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="20vh"
          >
            <Loader showBackdrop={false} loadingText="Loading..." />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                marginTop: 2,
                "@media (max-width: 580px)": {
                  width: "100%",
                  flexDirection: "column",
                },
              }}
            >
              <FormControl
                sx={{
                  width: "25%",
                  "@media (max-width: 580px)": {
                    width: "100%",
                  },
                }}
              >
                <InputLabel
                  sx={{ backgroundColor: "white", padding: "2px 8px" }}
                  id="district-select-label"
                >
                  {t("MASTER.CLUSTERS")}
                </InputLabel>
                <Select
                  labelId="district-select-label"
                  id="district-select"
                  value={selectedCluster}
                  onChange={handleClusterChange}
                >
                  {matchedClusters?.map((districtDetail) => (
                    <MenuItem
                      key={districtDetail.value}
                      value={districtDetail.value}
                    >
                      {transformLabel(districtDetail.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ marginTop: 2 }}>
              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="20vh"
                >
                  <Loader showBackdrop={false} loadingText="Loading..." />
                </Box>
              ) : matchedData?.length > 0 ? (
                <KaTableComponent
                  columns={columns}
                  data={dataToDisplay?.map((block) => ({
                    block: transformLabel(block.label),
                    createdAt: block.createdAt,
                    updatedAt: block.updatedAt,
                    createdBy: block.createdBy,
                    updatedBy: block.updatedBy,
                    value: block.value,
                  }))}
                  limit={pageLimit}
                  offset={pageOffset}
                  paginationEnable={paginationCount >= Numbers.FIVE}
                  PagesSelector={PagesSelector}
                  PageSizeSelector={PageSizeSelectorFunction}
                  pageSizes={pageSizeArray}
                  // onEdit={handleEdit}
                  pagination={pagination}
                  onDelete={handleDelete}
                  extraActions={[]}
                  noDataMessage={
                    matchedData.length === 0 ? t("COMMON.SCHOOLS_NOT_FOUND") : ""
                  }
                />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="20vh"
                >
                  <Typography marginTop="10px" textAlign="center">
                    {t("COMMON.SCHOOLS_NOT_FOUND")}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </HeaderComponent>
    </React.Fragment>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Block;
