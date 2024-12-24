import HeaderComponent from "@/components/HeaderComponent";
import PageSizeSelector from "@/components/PageSelector";
import { showToastMessage } from "@/components/Toastify";
import {
  createCohort,
  getCohortList,
} from "@/services/CohortService/cohortService";
import {
  createOrUpdateOption,
  deleteOption,
  getStateBlockDistrictList,
  updateCohort,
} from "@/services/MasterDataService";
import { CohortTypes, Numbers, QueryKeys, Role, SORT, Status, TelemetryEventType } from "@/utils/app.constant";
import { transformLabel } from "@/utils/Helper";
import {
  Box,
  Pagination,
  SelectChangeEvent,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useState } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { useQueryClient } from "@tanstack/react-query";
import { getStateDataMaster } from "@/data/tableColumns";
import { Theme } from "@mui/system";
import Loader from "@/components/Loader";
import { telemetryFactory } from "@/utils/telemetry";
import { AddStateModal } from "@/components/AddStateModal";
import useStore from "@/store/store";
import ConfirmationModal from "@/components/ConfirmationModal";
export interface StateDetail {
  updatedAt: any;
  createdAt: any;
  createdBy: string;
  updatedBy: string;
  label: string | undefined;
  name: string;
  value: string;
  cohortId?: string;
}

const State: React.FC = () => {
  const { t } = useTranslation();
  const [stateData, setStateData] = useState<StateDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cohortIdForDelete, setCohortIdForDelete] = useState<any>("");

  const [addStateModalOpen, setAddStateModalOpen] = useState<boolean>(false);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<StateDetail | null>(null);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fieldId, setFieldId] = useState<string>("6469c3ac-8c46-49d7-852a-00f9589737c5");
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [pageCount, setPageCount] = useState<number>(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState<number>(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState<number>(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [paginationCount, setPaginationCount] = useState<number>(Numbers.ZERO);
  const [pagination, setPagination] = useState(true);
  const [stateDataOption, setStateDataOptinon] = useState<any>([]);
  const [stateCodArrray, setStateCodeArr] = useState<any>([]);
  const [stateNameArray, setStateNameArr] = useState<any>([]);
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = React.useState<string | number>(10);
  const store = useStore();
  const isActiveYear = store.isActiveYearSelected;
  const [userRole, setUserRole] = useState("");
  const [cohortIdForEdit, setCohortIdForEdit] = useState<any>();
  const [stateValueForDelete, setStateValueForDelete] = useState<any>("");

  const [countOfDistricts, setCountOfDistricts] = useState<number>(0);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
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
  const fetchStateData = async () => {
    console.log("here we are")
    try {
      const limit = pageLimit;
      const offset = pageOffset * limit;
      const data = {
      //  limit: limit,
      //  offset: offset,
        fieldName: "states",
        optionName: searchKeyword || "",
        sort: sortBy,
      };

      // const resp = await queryClient.fetchQuery({
      //   queryKey: [QueryKeys.GET_STATE_COHORT_LIST],
      //   queryFn: () => getStateBlockDistrictList(data),
      // });
      const resp=await getStateBlockDistrictList(data)
      const states = resp?.result?.values || [];
      setStateDataOptinon(states);
      const stateNameArra = states.map((item: any) => item.label.toLowerCase());
      setStateNameArr(stateNameArra);
      const stateCodeArra = states.map((item: any) => item.value);
      setStateCodeArr(stateCodeArra);
      if (resp?.result?.fieldId) {
        setFieldId(resp.result.fieldId);
      } else {
        console.error("Unexpected fieldId:", resp?.result?.fieldId);
      }
    } catch (error) {
      console.error("Error fetching state data", error);
    }
  };

  useEffect(() => {
    fetchStateData();
  }, [pageOffset]);
  const filteredCohortOptionData = () => {
    const startIndex = pageOffset * pageLimit;
    const endIndex = startIndex + pageLimit;
    let transformedData;
        transformedData = stateData?.map((item) => ({
      ...item,
      label:(item.label),
    }));
    return transformedData.slice(startIndex, endIndex);
  };
  const getStatecohorts = async () => {
    try {
      setLoading(true);
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          name: searchKeyword,
          type: "STATE",
          status:["active"]

        },
        sort: sortBy,
      };

      const response = await queryClient.fetchQuery({
        queryKey: [
          QueryKeys.FIELD_OPTION_READ,          
          "STATE",
          searchKeyword
        ],
        queryFn: () => getCohortList(reqParams),
      });

      const statecohortDetails = response?.results?.cohortDetails || [];
      const filteredStateData = statecohortDetails
        .map((stateDetail: any) => {
          const transformedName = transformLabel(stateDetail.name);
          const matchingState = stateDataOption.find(
            (state: { label: string }) => state?.label?.toLowerCase() === transformedName?.toLowerCase()
          );
          return {
            label: transformedName,
            value: matchingState ? matchingState.value : null,
            createdAt: stateDetail.createdAt,
            updatedAt: stateDetail.updatedAt,
            createdBy: stateDetail.createdBy,
            updatedBy: stateDetail.updatedBy,
            cohortId: stateDetail.cohortId,
          };
        })
        .filter((state: { label: any }) =>
          stateNameArray.includes(state?.label?.toLowerCase())
        );
      setStateData(filteredStateData);
      const totalCount = filteredStateData.length;
      console.log("totalCount", totalCount);
      setPaginationCount(totalCount);
      setPageCount(Math.ceil(totalCount / pageLimit));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching and filtering cohort states", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stateDataOption.length > 0 && stateNameArray.length > 0) {
      getStatecohorts();
    }
  }, [
    stateDataOption,
    stateNameArray,
    searchKeyword,
    pageLimit,
    pageOffset,
    sortBy,
  ]);

  // const handleEdit = (rowData: StateDetail) => {
  //   setSelectedStateForEdit(rowData);
  //   setAddStateModalOpen(true);
  // };
  const handleEdit = (rowData: any) => {
    console.log("rowData", rowData)
   setSelectedStateForEdit(rowData);
    setAddStateModalOpen(true);
    const cohortIdForEDIT = rowData.cohortId;
    setCohortIdForEdit(cohortIdForEDIT);
    let updatedRowData;
  
      updatedRowData = {
        ...rowData,
        cohortId: cohortIdForEDIT,
      };
      setSelectedStateForEdit(updatedRowData);

    
   
    
  };
  const handleDelete = (rowData: StateDetail) => {
    setSelectedStateForDelete(rowData);
    setCohortIdForDelete(rowData?.cohortId);
    setConfirmationDialogOpen(true);
    console.log("Delete row:", rowData.value);
    setStateValueForDelete(rowData.value);
  };
  const handleSortChange = async (event: SelectChangeEvent) => {
    const sortOrder =
      event.target.value === "Z-A" ? SORT.DESCENDING : SORT.ASCENDING;
    setSortBy(["name", sortOrder]);
    setSelectedSort(event.target.value);
  };
  const handleConfirmDelete = async () => {
    if (selectedStateForDelete) {
      try {
        await deleteOption("states", selectedStateForDelete.value);
        setStateData((prevStateData) =>
          prevStateData.filter(
            (state) => state.value !== selectedStateForDelete.value
          )
        );
        if (cohortIdForDelete) {
          let cohortDetails = {
            status: Status.ARCHIVED,
          };
          const resp = await updateCohort(cohortIdForDelete, cohortDetails);
          if (resp?.responseCode === 200) {
            const cohort = filteredCohortOptionData()?.find(
              (item: any) => item.cohortId == cohortIdForDelete
            );
          //   if (cohort) {
          //     cohort?.status = Status.ARCHIVED;
          //   }
          // } else {
          //   console.log("Cohort Not Archived");
          // }
            }
          setCohortIdForDelete("");
        } else {
          console.log("No Cohort Selected");
          setCohortIdForDelete("");
        }
        showToastMessage(t("COMMON.STATE_DELETED_SUCCESS"), "success");
      } catch (error) {
        console.error("Error deleting state", error);
        showToastMessage(t("COMMON.STATE_DELETED_FAILURE"), "error");
      }
      setConfirmationDialogOpen(false);
    }
  };
  const getDistrictDataCohort = async () => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          states: stateValueForDelete,
          type: CohortTypes.DISTRICT,
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

      const activeDistricts = response?.results?.cohortDetails || [];

      const activeDistrictsCount = activeDistricts.filter(
        (block: { status: string }) => block.status === "active"
      ).length;
      setCountOfDistricts(activeDistrictsCount);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
      setLoading(false);
    }
  };
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };
  const handleAddStateClick = () => {
    setSelectedStateForEdit(null);
    setAddStateModalOpen(true);
  };
  const handleAddStateSubmit = async (
    name: string,
    value: string,
  //  selectedState: any
  ) => {
    const newState = {
      options: [{ name, value }],
    };
    const newEntity = {
      isCreate: true,
      options: [
        {
          name,
          value,
        },
      ],
    };
    try {
      if (fieldId) {
      //  const isUpdating = selectedState !== null;
        const response = await createOrUpdateOption(fieldId, newEntity, t);
        const queryParameters = {
          name: name,
          type: CohortTypes.STATE,
          status: Status.ACTIVE,
         
        };
        const cohortCreateResponse = await createCohort(queryParameters);
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GET_COHORT_MEMBER_LIST],
        });
        queryClient.invalidateQueries({
          queryKey: [
            QueryKeys.FIELD_OPTION_READ,          
          "STATE",
          searchKeyword
        ],
        });
        fetchStateData();

      }
    } catch (error) {
      console.error("Error creating/updating state:", error);
      showToastMessage(t("COMMON.STATE_OPERATION_FAILURE"), "error");
    }
    setAddStateModalOpen(false);
  };

  const handleUpdateCohortSubmit = async (
  //  type: string,
    name: string,
    value: string,
   // controllingField: string,
  ) => {
    const updatedBy = localStorage.getItem("userId");
    if (!updatedBy) return;

    // const fieldId = type === "block" ? blocksFieldId : districtFieldId;
    // const successMessage =
    //   type === "block"
    //     ? "COMMON.BLOCK_UPDATED_SUCCESS"
    //     : "COMMON.DISTRICT_UPDATED_SUCCESS";
    // const duplicationMessage =
    //   type === "block"
    //     ? "COMMON.BLOCK_DUPLICATION_FAILURE"
    //     : "COMMON.STATE_DUPLICATION_FAILURE";
    // const telemetryId =
    //   type === "block" ? "block-update-success" : "district-updated-success";

    const newEntity = {
      isCreate: false,
      options: [
        {
         // controllingfieldfk: controllingField,
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
        // if (type === "block") {
        //   filteredCohortOptionData();
        // }
        // queryClient.invalidateQueries({
        //   queryKey: [
        //     QueryKeys.FIELD_OPTION_READ,
        //     stateCode,
        //     type === "block" ? "blocks" : "districts",
        //   ],
        // });
        // else if(type === "district") {
        //   queryClient.invalidateQueries({
        //     queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
        //   });
        //   fetchDistricts();
        // }
      

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
            // if (type === "block") {
            //   await fetchBlocks();
            //   await getCohortSearchBlock(selectedDistrict);
            // }


            showToastMessage(t("COMMON.STATE_UPDATED_SUCCESS"), "success");
 queryClient.invalidateQueries({
          queryKey: [QueryKeys.GET_COHORT_MEMBER_LIST],
        });
        queryClient.invalidateQueries({
          queryKey: [
            QueryKeys.FIELD_OPTION_READ,          
          "STATE",
          searchKeyword
        ],
        });
        fetchStateData();
           
          } else if (cohortCreateResponse.responseCode === 409) {
            showToastMessage(t("COMMON.STATE_DUPLICATION_FAILURE"), "error");
          }
        } catch (error) {
          console.error(`Error updating cohort for :`, error);
          showToastMessage(t("COMMON.STATE_DUPLICATION_FAILURE"), "error");
        }
      }
    } catch (error) {
      console.error(`Error adding:`, error);
    } finally {
      setAddStateModalOpen(false);
      setSelectedStateForEdit(null);
    }
  };
  const handleChangePageSize = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSizeArray((prev) =>
      prev.includes(newSize) ? prev : [...prev, newSize]
    );
    setPageLimit(newSize);

    setPageSize(event.target.value);
    setPageLimit(Number(event.target.value));
  };
  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPageOffset(value - 1);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, '');
    const env = cleanedUrl.split("/")[0];


    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: 'change-page-number:'+value,
        type: TelemetryEventType.CLICK,
        subtype: '',
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
  useEffect(() => {
    if (stateValueForDelete) {
      getDistrictDataCohort();
    }
  }, [stateValueForDelete]);
  return (
    <>
     <HeaderComponent
      userType={t("MASTER.STATE")}
      searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_STATE")}
      showStateDropdown={false}
      handleSortChange={handleSortChange}
      showAddNew={ !!isActiveYear && userRole === Role.CENTRAL_ADMIN}
      showSort={true}
      shouldFetchDistricts={false}
      selectedSort={selectedSort}
      showFilter={false}
      handleSearch={handleSearch}
      handleAddUserClick={handleAddStateClick}
      handleDelete={handleDelete}
    >
      {loading ? (
        <Box
          width={"100%"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          <Loader showBackdrop={false} loadingText={t("COMMON.LOADING")} />
        </Box>
      ) : (
        <div style={{ marginTop: "40px" }}>
          {stateData.length > 0 ? (
            <KaTableComponent
              columns={getStateDataMaster(t, isMobile)}
              data={filteredCohortOptionData()}
              limit={pageLimit}
              offset={pageOffset}
              paginationEnable={paginationCount >= Numbers.FIVE}
              PagesSelector={PagesSelector}
              pagination={pagination}
              PageSizeSelector={PageSizeSelectorFunction}
              pageSizes={pageSizeArray}
              onEdit={handleEdit}
              extraActions={[]}
              onDelete={handleDelete}
            />
          ) : (
            !loading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="20vh"
              >
                <Typography marginTop="10px" textAlign="center">
                  {t("COMMON.STATE_NOT_FOUND")}
                </Typography>
              </Box>
            )
          )}
        </div>
      )}
    </HeaderComponent>
    
    <AddStateModal
        open={addStateModalOpen}
        onClose={() => setAddStateModalOpen(false)}
        onSubmit={(name, value, controllingField) => {
          if (selectedStateForEdit) {
            handleUpdateCohortSubmit(
              name?.toLowerCase(),
              value,
              // districtFieldId,
              // selectedStateForEdit?.value
            );
          } else {
            handleAddStateSubmit(
              name?.toLowerCase(),
              value,
            );
          }
        }}
        fieldId={""}
        initialValues={
          selectedStateForEdit
            ? {
                name: selectedStateForEdit.label,
                value: selectedStateForEdit.value,
              }
            : {}
        }
      />
       <ConfirmationModal
        modalOpen={confirmationDialogOpen}
        message={
          countOfDistricts > 0
            ? t("COMMON.ARE_YOU_SURE_DELETE_STATE", {
              district: `${countOfDistricts}`,
            })
            : t("COMMON.NO_ACTIVE_BLOCKS_DELETE")
        }
        handleAction={handleConfirmDelete}
        buttonNames={{
          primary: t("COMMON.DELETE"),
          secondary: t("COMMON.CANCEL"),
        }}
        disableDelete={countOfDistricts > 0}
        handleCloseModal={() => setConfirmationDialogOpen(false)}
      />
    </>
   
  );
};
export default State;
export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "master"])),
    },
  };
};
