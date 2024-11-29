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
} from "@/services/MasterDataService";
import { Numbers, QueryKeys, SORT, TelemetryEventType } from "@/utils/app.constant";
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

export interface StateDetail {
  updatedAt: any;
  createdAt: any;
  createdBy: string;
  updatedBy: string;
  label: string | undefined;
  name: string;
  value: string;
}

const State: React.FC = () => {
  const { t } = useTranslation();
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

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const fetchStateData = async () => {
    try {
      const limit = pageLimit;
      const offset = pageOffset * limit;
      const data = {
        limit: limit,
        offset: offset,
        fieldName: "states",
        optionName: searchKeyword || "",
        sort: sortBy,
      };

      const resp = await queryClient.fetchQuery({
        queryKey: [
          QueryKeys.FIELD_OPTION_READ,
          data.limit,
          data.offset,
          data.fieldName,
          data.optionName,
          data.sort.join(","),
        ],
        queryFn: () => getStateBlockDistrictList(data),
      });

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
  }, []);

  const getStatecohorts = async () => {
    try {
      setLoading(true);
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          name: searchKeyword,
          type: "STATE",
        },
        sort: sortBy,
      };

      const response = await queryClient.fetchQuery({
        queryKey: [
          QueryKeys.FIELD_OPTION_READ,
          reqParams.limit,
          reqParams.offset,
          searchKeyword || "",
          "STATE",
          reqParams.sort.join(","),
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
          stateNameArray.includes(state.label)
        );
      setStateData(filteredStateData);
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

  const handleEdit = (rowData: StateDetail) => {
    setSelectedStateForEdit(rowData);
    setAddStateModalOpen(true);
  };
  const handleDelete = (rowData: StateDetail) => {
    setSelectedStateForDelete(rowData);
    setConfirmationDialogOpen(true);
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
        showToastMessage(t("COMMON.STATE_DELETED_SUCCESS"), "success");
      } catch (error) {
        console.error("Error deleting state", error);
        showToastMessage(t("COMMON.STATE_DELETED_FAILURE"), "error");
      }
      setConfirmationDialogOpen(false);
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
        pageSize={pageLimit}
        options={pageSizeArray}
      />
    </Box>
  );
  return (
    <HeaderComponent
      userType={t("MASTER.STATE")}
      searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_STATE")}
      showStateDropdown={false}
      handleSortChange={handleSortChange}
      showAddNew={false}
      showSort={true}
      shouldFetchDistricts={false}
      selectedSort={selectedSort}
      showFilter={false}
      handleSearch={handleSearch}
      handleAddUserClick={handleAddStateClick}
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
              data={stateData}
              limit={pageLimit}
              offset={pageOffset}
              paginationEnable={paginationCount >= Numbers.FIVE}
              PagesSelector={PagesSelector}
              pagination={pagination}
              PageSizeSelector={PageSizeSelectorFunction}
              pageSizes={pageSizeArray}
              onEdit={handleEdit}
              extraActions={[]}
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
