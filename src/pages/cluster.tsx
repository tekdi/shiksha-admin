import React, { useState, useEffect, useMemo } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import { useTranslation } from "next-i18next";
import {
  getStateBlockDistrictList,
  deleteOption,
  createOrUpdateOption,
} from "@/services/MasterDataService";
import Loader from "@/components/Loader";
import { AddStateModal } from "@/components/AddStateModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { showToastMessage } from "@/components/Toastify";
import { SORT, Numbers, Storage, QueryKeys } from "@/utils/app.constant";
import {
  Box,
  Chip,
  Pagination,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import PageSizeSelector from "@/components/PageSelector";
import {
  createCohort,
  getCohortList,
} from "@/services/CohortService/cohortService";
import { getUserDetailsInfo } from "@/services/UserList";
import useStore from "@/store/store";
import { useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
export interface StateDetail {
  updatedAt: any;
  createdAt: any;
  createdBy: string;
  updatedBy: string;
  label: string | undefined;
  name: string;
  value: string;
}

type cohortFilterDetails = {
  type?: string;
  status?: any;
  states?: string;
  districts?: string;
  blocks?: string;
  name?: string;
};

type Option = {
  name: string;
  value: string;
  controllingfieldfk?: string;
};

const State: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [stateData, setStateData] = useState<StateDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [addStateModalOpen, setAddStateModalOpen] = useState<boolean>(false);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<StateDetail | null>(null);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fieldId, setFieldId] = useState<string>("");
  const [sortBy, setSortBy] = useState<[string, string]>(["label", "asc"]);
  const [pageCount, setPageCount] = useState<number>(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState<number>(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState<number>(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [paginationCount, setPaginationCount] = useState<number>(Numbers.ZERO);
  const [userName, setUserName] = React.useState<string | null>("");
  const [statesProfilesData, setStatesProfilesData] = useState<any>([]);
  const [pagination, setPagination] = useState(true);
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);
  const [cohortData, setCohortData] = useState<Array<any>>([]);
  const [dataToDisplay, setDataToDisplay] = useState<Array<any>>([]);
  const setPid = useStore((state) => state.setPid);

  const columns = [
    { key: "label", title: t("MASTER.CLUSTER"), width: "160" },
    { key: "value", title: t("MASTER.CODE"), width: "160" },
    { key: "createdBy", title: t("MASTER.CREATED_BY"), width: "160" },
    { key: "updatedBy", title: t("MASTER.UPDATED_BY"), width: "160" },
    { key: "createdAt", title: t("MASTER.CREATED_AT"), width: "160" },
    { key: "updatedAt", title: t("MASTER.UPDATED_AT"), width: "160" },
    { key: "actions", title: t("MASTER.ACTIONS"), width: "160" },
  ];

  useEffect(() => {
    const fetchCohortData = async () => {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          type: "CLUSTER",
          status: ["active"]
        },
        sort: ["name", "asc"],
      };

      try {
        const response = await getCohortList(reqParams);
        setCohortData(response?.results?.cohortDetails);
        console.log(`setCohortData`, response?.results?.cohortDetails);
      } catch (error) {
        console.error("Error fetching cohort data", error);
      }
    };

    fetchCohortData();
  }, []);

  const matchedData = useMemo(() => {
    return stateData
    ?.filter((item) =>
      cohortData?.some((data) => data.name === item.label)
    );
  }, [stateData, cohortData]);

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

    console.log("totalCount@@", totalCount);
  }, [totalCount, pageLimit]);

  const handleEdit = (rowData: StateDetail) => {
    setSelectedStateForEdit(rowData);
    setAddStateModalOpen(true);
  };

  // const handleDelete = (rowData: any) => {
  //   setLoading(true);

  //   const cohortName = rowData?.name;
  //   // SetDeletedRowData
  //   setInputName(cohortName);
  //   setConfirmationModalOpen(true);
  //   if (rowData) {
  //     setSelectedRowData(rowData);
  //     const cohortId = rowData?.cohortId;
  //     setSelectedCohortId(cohortId);
  //     setLoading(false);
  //   }
  //   setLoading(false);
  // };

  const handleDelete = (rowData: StateDetail) => {
    setSelectedStateForDelete(rowData);
    setConfirmationModalOpen(true);
  };

  const handleSortChange = async (event: SelectChangeEvent) => {
    const sortOrder =
      event.target.value === "Z-A" ? SORT.DESCENDING : SORT.ASCENDING;
    setSortBy(["name", sortOrder]);
    setSelectedSort(event.target.value);
  };

  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedStateForDelete) {
      try {
        const response = await deleteOption(
          "clusters",
          selectedStateForDelete.value
        );
        console.log("response", response?.response?.status);
        if (response?.status === 200) {
          setStateData((prevStateData) =>
            prevStateData.filter(
              (state) => state.value !== selectedStateForDelete.value
            )
          );
          showToastMessage(t("COMMON.STATE_DELETED_SUCCESS"), "success");
        } else {
          showToastMessage(t("COMMON.STATE_DELETED_FAILURE"), "error");
        }
      } catch (error) {
        console.error("Error deleting state", error);
        showToastMessage(t("COMMON.STATE_DELETED_FAILURE"), "error");
      }
      handleCloseModal();
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
    selectedState: any
  ) => {
    const newState = {
      options: [{ name, value }],
    };
    try {
      if (fieldId) {
        const isUpdating = selectedState !== null;
        const response = await createOrUpdateOption(fieldId, newState);

        const queryParameters = {
          name: name,
          type: "STATE",
          status: "active",
          parentId: null,
          customFields: [],
        };

        console.log("before cohortList");

        if (!isUpdating) {
          await createCohort(queryParameters);
        }

        if (response) {
          await fetchStateData();

          const successMessage = isUpdating
            ? t("COMMON.STATE_UPDATED_SUCCESS")
            : t("COMMON.STATE_ADDED_SUCCESS");

          showToastMessage(successMessage, "success");
        } else {
          console.error("Failed to create/update state:", response);
          showToastMessage(t("COMMON.STATE_OPERATION_FAILURE"), "error");
        }
      }
    } catch (error) {
      console.error("Error creating/updating state:", error);
      showToastMessage(t("COMMON.STATE_OPERATION_FAILURE"), "error");
    }
    setAddStateModalOpen(false);
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
  };


  useEffect(() => {
    setDataToDisplay(matchedData ?? []);
  }, [matchedData]);


  const extraActions: any = [
    { name: t("COMMON.EDIT"), onClick: handleEdit, icon: EditIcon },
    { name: t("COMMON.DELETE"), onClick: handleDelete, icon: DeleteIcon },
    //{ name: t("COMMON.ADDFACILITATOR"), onClick: handleAddFacilitator, icon: EditIcon },
  ];

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

  const fetchStateData = async () => {
    try {
      setLoading(true);
      const limit = 0;
      const offset = searchKeyword ? 0 : pageOffset * limit;

      const data = {
        limit: limit,
        offset: offset,
        fieldName: "clusters",
        optionName: searchKeyword || "",
        sort: sortBy,
      };

      console.log("fetchStateData", data);

      const resp = await queryClient.fetchQuery({
        queryKey: [
          QueryKeys.GET_CLUSTER_DATA,
          data.limit,
          data.offset,
          data.fieldName,
          data.optionName,
          data.sort,
        ],
        queryFn: () => getStateBlockDistrictList(data),
      });

      // const resp = await getStateBlockDistrictList(data);

      if (resp?.result?.fieldId) {
        setFieldId(resp.result.fieldId);
        setStateData(resp?.result?.values);
        console.log("setStateData", resp?.result?.values);

        // const totalCount = resp?.result?.totalCount || 0;

        // setPaginationCount(totalCount);

        // console.log("totalCount", totalCount);

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
      } else {
        console.error("Unexpected fieldId:", resp?.result?.fieldId);
      }
    } catch (error) {
      console.error("Error fetching state data", error);
      setStateData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStateData();
  }, [searchKeyword, pageLimit, pageOffset, sortBy]);

  return (
    <>
      <ConfirmationModal
        message={t("CENTERS.SURE_DELETE_DATA", {
          data: `${selectedStateForDelete?.label}`,
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
        userType={t("MASTER.CLUSTER")}
        searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_CLUSTER")}
        showStateDropdown={false}
        handleSortChange={handleSortChange}
        showAddNew={false}
        showSort={true}
        selectedSort={selectedSort}
        showFilter={false}
        handleSearch={handleSearch}
        handleAddUserClick={handleAddStateClick}
      >
        {matchedData.length === 0 && !loading ? (
          <Box display="flex" marginLeft="40%" gap="20px">
            <Typography marginTop="10px" variant="h2">
              {t("COMMON.CLUSTER_NOT_FOUND")}
            </Typography>
          </Box>
        ) : (
          <div>
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <Loader
                  showBackdrop={false}
                  loadingText={t("COMMON.LOADING")}
                />
              </Box>
            ) : (
              <KaTableComponent
                columns={columns}
                data={(dataToDisplay)?.map((stateDetail) => ({
                  label: stateDetail.label ?? "",
                  value: stateDetail.value ?? "",
                  createdAt: stateDetail.createdAt,
                  updatedAt: stateDetail.updatedAt,
                  createdBy: stateDetail.createdBy,
                  updatedBy: stateDetail.updatedBy,
                }))}
                limit={pageLimit}
                offset={pageOffset}
                paginationEnable={paginationCount >= Numbers.FIVE}
                PagesSelector={PagesSelector}
                pagination={pagination}
                PageSizeSelector={PageSizeSelectorFunction}
                pageSizes={pageSizeArray}
                // onEdit={handleEdit}
                extraActions={extraActions}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </HeaderComponent>
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
