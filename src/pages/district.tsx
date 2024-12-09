import AddDistrictModal from "@/components/AddDistrictModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import HeaderComponent from "@/components/HeaderComponent";
import Loader from "@/components/Loader";
import PageSizeSelector from "@/components/PageSelector";
import { showToastMessage } from "@/components/Toastify";
import { getDistrictTableData } from "@/data/tableColumns";
import {
  createCohort,
  getCohortList,
} from "@/services/CohortService/cohortService";
import { getCohortList as getMyCohorts } from "@/services/GetCohortList";
import {
  createOrUpdateOption,
  deleteOption,
  getDistrictsForState,
  updateCohort,
} from "@/services/MasterDataService";
import { getUserDetailsInfo } from "@/services/UserList";
import {
  CohortTypes,
  Numbers,
  QueryKeys,
  SORT,
  Status,
  Storage,
  TelemetryEventType,
} from "@/utils/app.constant";
import { transformLabel } from "@/utils/Helper";
import { Pagination, Typography, useMediaQuery } from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Theme } from "@mui/system";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useState } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { telemetryFactory } from "@/utils/telemetry";
import useStore from "@/store/store";

type StateDetail = {
  stateCode: string | undefined;
  controllingField: string | undefined;
  value: string;
  label: string;
};

type DistrictDetail = {
  status: Status;
  cohortId(cohortId: any): unknown;
  updatedBy: any;
  createdBy: any;
  updatedAt: any;
  createdAt: any;
  value: string;
  label: string;
  controllingField: string;
};

const District: React.FC = () => {
  const { t } = useTranslation();
  const store = useStore();
  const isActiveYear = store.isActiveYearSelected;
  const [districtData, setDistrictData] = useState<DistrictDetail[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<DistrictDetail | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [districtFieldId, setDistrictFieldId] = useState<string>("b61edfc6-3787-4079-86d3-37262bf23a9e");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [pageCount, setPageCount] = useState<number>(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState<number>(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState<number>(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10, 20, 50]);
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fetchDistrict, setFetchDistrict] = useState(true);

  const [paginationCount, setPaginationCount] = useState<number>(Numbers.ZERO);
  const [stateCode, setStateCode] = useState<any>();
  const [stateValue, setStateValue] = useState<string>("");
  useState<string>("");
  const [stateFieldId, setStateFieldId] = useState<string>("");
  const [pagination, setPagination] = useState(true);
  const [cohotIdForDelete, setCohortIdForDelete] = useState<any>("");

  const [districtsOptionRead, setDistrictsOptionRead] = useState<any>([]);
  const [districtCodeArr, setDistrictCodeArr] = useState<any>([]);
  const [districtNameArr, setDistrictNameArr] = useState<any>([]);
  const [cohortIdForEdit, setCohortIdForEdit] = useState<any>();
  const [districtValueForDelete, setDistrictValueForDelete] = useState<any>("");
  const [countOfBlocks, setCountOfBlocks] = useState<number>(0);
  const [cohortIdofState, setCohortIdofState] = useState<any>("");
  const queryClient = useQueryClient();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

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

        if (statesField) {
          setStateValue(statesField.value); // state name
          setStateCode(statesField.code); // state code
          setStateFieldId(statesField?.fieldId); // field id of state
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserDetail();
  }, []);

  const fetchDistricts = async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
        queryFn: () =>
          getDistrictsForState({
            controllingfieldfk: stateCode,
            fieldName: "districts",
          }),
      });

      const districts = data?.result?.values || [];
      setDistrictsOptionRead(districts);

      const districtNameArray = districts.map((item: any) => item.label?.toLowerCase());
      setDistrictNameArr(districtNameArray);

      const districtCodeArray = districts.map((item: any) => item.value);
      setDistrictCodeArr(districtCodeArray);

      const districtFieldID = data?.result?.fieldId || "";
      setDistrictFieldId(districtFieldID);
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistrict]);
  // get cohort id of state
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
          setCohortIdofState(cohortIdOfState);
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

  const getFilteredCohortData = async () => {
    try {
      setLoading(true);

      if (!districtsOptionRead.length || !districtNameArr.length) {
        console.warn(
          "districtsOptionRead or districtNameArr is empty, waiting for data..."
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
          type: CohortTypes.DISTRICT,
          status:["active"]

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
      //     CohortTypes.DISTRICT,
      //     reqParams.sort.join(","),
      //   ],
      //   queryFn: () => getCohortList(reqParams),
      // });
      const response = await getCohortList(reqParams)
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
          }) => {
            const transformedName = districtDetail.name;

            const matchingDistrict = districtsOptionRead.find(
              (district: { label: string }) =>
                district.label?.toLowerCase() === transformedName?.toLowerCase()
            );

            return {
              label: transformedName,
              value: matchingDistrict ? matchingDistrict.value : null,
              createdAt: districtDetail.createdAt,
              updatedAt: districtDetail.updatedAt,
              createdBy: districtDetail.createdBy,
              updatedBy: districtDetail.updatedBy,
              cohortId: districtDetail?.cohortId,
            };
          }
        )
        .filter((district: { label: any }) =>
          districtNameArr.includes(district?.label?.toLowerCase())
        );

      setDistrictData(filteredDistrictData);

      const totalCount = filteredDistrictData.length;
      setPaginationCount(totalCount);
      setPageCount(Math.ceil(totalCount / pageLimit));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (districtsOptionRead.length && districtNameArr.length) {
      if (stateCode)
        getFilteredCohortData();
    }
  }, [
    searchKeyword,
    pageLimit,
    pageOffset,
    stateCode,
    sortBy,
    districtsOptionRead,
    districtNameArr,
  ]);

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

  useEffect(() => {
    if (districtValueForDelete) {
      getBlockDataCohort();
    }
  }, [districtValueForDelete]);

  const handleEdit = (rowData: DistrictDetail) => {
    setModalOpen(true);

    const cohortIdForEDIT = rowData.cohortId;
    setCohortIdForEdit(cohortIdForEDIT);

    const updatedRowData = {
      ...rowData,
      stateCode: stateCode,
      cohortId: cohortIdForEDIT,
    };
    setSelectedStateForEdit(updatedRowData);
  };
  const handleDelete = (rowData: DistrictDetail) => {
    setSelectedStateForDelete(rowData);
    const districtValue = rowData.value;
    setDistrictValueForDelete(districtValue);
    setCohortIdForDelete(rowData.cohortId);
    setConfirmationDialogOpen(true);
  };
  const handleSearch = (keyword: string) => {
    setPageOffset(Numbers.ZERO);
    setPageCount(Numbers.ONE);
    setSearchKeyword(keyword);
  };

  const handleConfirmDelete = async () => {
    if (selectedStateForDelete) {
      try {
        await deleteOption("districts", selectedStateForDelete.value);
        setDistrictData((prev) =>
          prev.filter(
            (district) => district.value !== selectedStateForDelete.value
          )
        );
        showToastMessage(t("COMMON.DISTRICT_DELETED_SUCCESS"), "success");
        const windowUrl = window.location.pathname;
        const cleanedUrl = windowUrl.replace(/^\//, '');
        const env = cleanedUrl.split("/")[0];

        const telemetryInteract = {
          context: {
            env: env,
            cdata: [],
          },
          edata: {
            id: 'delete-district-success',
            type: TelemetryEventType.CLICK,
            subtype: '',
            pageid: cleanedUrl,
          },
        };
        telemetryFactory.interact(telemetryInteract);
      } catch (error) {
        showToastMessage(t("COMMON.DISTRICT_DELETED_FAILURE"), "error");
      }
    }

    //delete cohort
    if (cohotIdForDelete) {
      let cohortDetails = {
        status: Status.ARCHIVED,
      };
      const resp = await updateCohort(cohotIdForDelete, cohortDetails);
      if (resp?.responseCode === 200) {
        const cohort = filteredCohortOptionData()?.find(
          (item: any) => item.cohortId == cohotIdForDelete
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

  //create cohort
  const handleCreateCohortSubmit = async (
    name: string,
    value: string,
    controllingField: string,
    DistrictId?: string,
    extraArgument?: any
  ) => {
    const newDistrict = {
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
      const response = await createOrUpdateOption(districtFieldId, newDistrict, t);

      if (response) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode || "", "districts"],
        });
        await fetchDistricts();
      }
      const queryParameters = {
        name: name,
        type: CohortTypes.DISTRICT,
        status: Status.ACTIVE,
        parentId: cohortIdofState,
        customFields: [
          {
            fieldId: stateFieldId,
            value: [stateCode],
          },
        ],
      };

      try {
        const cohortCreateResponse = await createCohort(queryParameters);
        if (cohortCreateResponse) {
          filteredCohortOptionData();
          showToastMessage(t("COMMON.DISTRICT_ADDED_SUCCESS"), "success");
          setFetchDistrict(!fetchDistrict);
          const windowUrl = window.location.pathname;
          const cleanedUrl = windowUrl.replace(/^\//, '');
          const env = cleanedUrl.split("/")[0];

          const telemetryInteract = {
            context: {
              env: env,
              cdata: [],
            },
            edata: {
              id: 'district-created-success',
              type: TelemetryEventType.CLICK,
              subtype: '',
              pageid: cleanedUrl,
            },
          };
          telemetryFactory.interact(telemetryInteract);
        } else if (cohortCreateResponse.responseCode === 409) {
          showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
        }
      } catch (error) {
        console.error("Error creating cohort:", error);
        showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
      }
    } catch (error) {
      console.error("Error adding district:", error);
    }


    setModalOpen(false);
    setSelectedStateForEdit(null);
  };

  //update cohort
  const handleUpdateCohortSubmit = async (
    name: string,
    value: string,
    controllingField: string,
    DistrictId?: string,
    extraArgument?: any
  ) => {
    const updatedBy = localStorage.getItem("userId")
    if (updatedBy) {
      const newDistrict = {
        isCreate: false,

        options: [
          {
            controllingfieldfk: controllingField,
            name,
            value,
            updatedBy
          },
        ],
      };

      try {
        const response = await createOrUpdateOption(districtFieldId, newDistrict, t);

        if (response) {
          setDistrictsOptionRead((prevDistricts: any[]) =>
            prevDistricts.map((district: { value: string | undefined; }) =>
              district.value === DistrictId
                ? { ...district, name, value }
                : district
            )
          );
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
          });
        }
        const queryParameters = {
          name: name,
          updatedBy: localStorage.getItem('userId'),

        };

        try {
          const cohortCreateResponse = await updateCohort(
            cohortIdForEdit,
            queryParameters
          );

          if (cohortCreateResponse) {
            queryClient.invalidateQueries({
              queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode, "districts"],
            });

            showToastMessage(t("COMMON.DISTRICT_UPDATED_SUCCESS"), "success");
            setFetchDistrict(!fetchDistrict);
            const windowUrl = window.location.pathname;
            const cleanedUrl = windowUrl.replace(/^\//, '');
            const env = cleanedUrl.split("/")[0];

            const telemetryInteract = {
              context: {
                env: env,
                cdata: [],
              },
              edata: {
                id: 'district-updated-success',
                type: TelemetryEventType.CLICK,
                subtype: '',
                pageid: cleanedUrl,
              },
            };
            telemetryFactory.interact(telemetryInteract);

          } else if (cohortCreateResponse.responseCode === 409) {
            showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
          }
        } catch (error) {
          console.error("Error creating cohort:", error);
          showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
        }


      } catch (error) {
        console.error("Error adding district:", error);
      }



      setModalOpen(false);
      setSelectedStateForEdit(null);
    }

  };

  const handleChangePageSize = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSizeArray((prev) =>
      prev.includes(newSize) ? prev : [...prev, newSize]
    );
    setPageLimit(newSize);
  };
  const handleSortChange = async (event: SelectChangeEvent) => {
    const sortOrder =
      event.target.value === "Z-A" ? SORT.DESCENDING : SORT.ASCENDING;
    setSortBy(["name", sortOrder]);
    setSelectedSort(event.target.value);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, '');
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: 'sort-by:' + event.target?.value,
        type: TelemetryEventType.CLICK,
        subtype: '',
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
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
        id: 'change-page-number:' + value,
        type: TelemetryEventType.CLICK,
        subtype: '',
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);

  };

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

    const transformedData = districtData.map((item) => ({
      ...item,
      label: transformLabels(item.label),
    }));

    return transformedData.slice(startIndex, endIndex);
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
    <>
      <AddDistrictModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(name, value, controllingField) => {
          if (selectedStateForEdit) {
            handleUpdateCohortSubmit(
              name,
              value,
              controllingField,
              districtFieldId,
              selectedStateForEdit?.value
            );
          } else {
            handleCreateCohortSubmit(
              name,
              value,
              controllingField,
              districtFieldId
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
            }
            : {}
        }
      />
      <ConfirmationModal
        modalOpen={confirmationDialogOpen}
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
        handleCloseModal={() => setConfirmationDialogOpen(false)}
      />
      <HeaderComponent
        userType={t("MASTER.DISTRICTS")}
        searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_DISTRICT")}
        showStateDropdown={false}
        handleSortChange={handleSortChange}
        showSort={true}
        selectedSort={selectedSort}
        shouldFetchDistricts={false}
        handleSearch={handleSearch}
        showFilter={false}
        showAddNew={!!isActiveYear}
        handleAddUserClick={() => {
          setModalOpen(true);
          setSelectedStateForEdit(null);
          const windowUrl = window.location.pathname;
          const cleanedUrl = windowUrl.replace(/^\//, '');
          const env = cleanedUrl.split("/")[0];


          const telemetryInteract = {
            context: {
              env: env,
              cdata: [],
            },
            edata: {
              id: 'click-on-add-new',
              type: TelemetryEventType.CLICK,
              subtype: '',
              pageid: cleanedUrl,
            },
          };
          telemetryFactory.interact(telemetryInteract);
        }}
      >
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
        ) : (
          <>
            <Box display="flex" gap={2}>
              <FormControl
                variant="outlined"
                sx={{ minWidth: 220, marginTop: 1, mb: 2, marginLeft: 2 }}
              >
                <InputLabel id="state-select-label">{stateValue}</InputLabel>
                <Select labelId="state-select-label" id="state-select" disabled>
                  <MenuItem key={stateCode} value={stateCode}>
                    {transformLabel(stateValue)}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {filteredCohortOptionData().length > 0 ? (
              <KaTableComponent
                columns={getDistrictTableData(t, isMobile)}
                data={filteredCohortOptionData()}
                limit={pageLimit}
                offset={pageOffset}
                paginationEnable={paginationCount >= Numbers.FIVE}
                PagesSelector={PagesSelector}
                PageSizeSelector={PageSizeSelectorFunction}
                pageSizes={pageSizeArray}
                pagination={pagination}
                onEdit={handleEdit}
                onDelete={handleDelete}
                extraActions={[]}
                noDataMessage={t("COMMON.DISTRICT_NOT_FOUND")}
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
                    {t("COMMON.DISTRICT_NOT_FOUND")}
                  </Typography>
                </Box>
              )
            )}
          </>
        )}
      </HeaderComponent>
    </>
  );
};

export default District;

export const getServerSideProps = async (context: any) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common", "master"])),
    },
  };
};
