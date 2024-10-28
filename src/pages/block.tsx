import React, { useState, useEffect } from "react";
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
  updateCohort,
} from "@/services/MasterDataService";
import { transformLabel } from "@/utils/Helper";
import { showToastMessage } from "@/components/Toastify";
import ConfirmationModal from "@/components/ConfirmationModal";
import { AddBlockModal } from "@/components/AddBlockModal";
import PageSizeSelector from "@/components/PageSelector";
import { SORT, Status, Storage } from "@/utils/app.constant";
import { getUserDetailsInfo } from "@/services/UserList";
import {
  createCohort,
  getCohortList,
} from "@/services/CohortService/cohortService";
import { Numbers } from "@/utils/app.constant";

type StateDetail = {
  name: string | undefined;
  controllingField: string | undefined;
  block: string | undefined;
  selectedDistrict: string | undefined;
  value: string;
  label: string;
};

type DistrictDetail = {
  cohortId(cohortId: any): unknown;
  value: string;
  label: string;
};

type BlockDetail = {
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

const Block: React.FC = () => {
  const { t } = useTranslation();
  const [selectedSort, setSelectedSort] = useState<string>("Sort");
  const [selectedState, setSelectedState] = useState<string>("");
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
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editState, setEditState] = useState<StateDetail | null>(null);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [blocksFieldId, setBlocksFieldId] = useState<string>("");
  const [districtFieldId, setDistrictFieldId] = useState<string>("");
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [paginationCount, setPaginationCount] = useState<number>(0);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10, 20, 50]);
  const [stateCode, setStateCode] = useState<any>("");
  const [stateValue, setStateValue] = useState<string>("");
  const [cohortStatus, setCohortStatus] = useState<any>();
  const [cohortId, setCohortId] = useState<any>();
  const [stateFieldId, setStateFieldId] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pagination, setPagination] = useState(true);
  const [cohortBlockDetails, setCohortBlockDetails] = useState<any>([]);
  const [blocksOptionRead, setBlocksOptionRead] = useState<any>([]);
  const [blockNameArr, setBlockNameArr] = useState<any>([]);
  const [blockCodeArr, setBlockCodeArr] = useState<any>([]);

  const [districtsOptionRead, setDistrictsOptionRead] = useState<any>([]);
  const [districtCodeArr, setDistrictCodeArr] = useState<any>([]);
  const [districtNameArr, setDistrictNameArr] = useState<any>([]);
  const [cohortIdForDelete, setCohortIdForDelete] = useState<any>("");
  const [cohortIdForEdit, setCohortIdForEdit] = useState<any>();
  const [cohortIdOfDistrict, setCohortIdOfDistrict] = useState<any>();
  const [blockValueForDelete, setBlockValueForDelete] = useState<any>();
  const [countOfCenter, setCountOfCenter] = useState<number>(0);
  const [cohortIds, setCohortIds] = useState<any>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

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

  const fetchDistricts = async () => {
    try {
      const data = await getDistrictsForState({
        controllingfieldfk: stateCode || "",
        fieldName: "districts",
      });

      const districts = data?.result?.values || [];
      setDistrictsOptionRead(districts);

      const districtNameArray = districts.map((item: any) => item.label);
      setDistrictNameArr(districtNameArray);

      const districtCodeArray = districts.map((item: any) => item.value);
      setDistrictCodeArr(districtCodeArray);

      const districtFieldID = data?.result?.fieldId || "";
      setDistrictFieldId(districtFieldID);

      console.log("districtNameArray", districtNameArray);
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [stateCode]);

  const getFilteredCohortData = async () => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          name: searchKeyword,
          states: stateCode,
          type: "DISTRICT",
        },
        sort: sortBy,
      };

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
          }) => {
            const transformedName = districtDetail.name;

            const matchingDistrict = districtsOptionRead.find(
              (district: { label: string }) =>
                district.label === transformedName
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
          districtNameArr.includes(district.label)
        );
      if (filteredDistrictData.length > 0) {
        setSelectedDistrict(filteredDistrictData[0].value);
      }
      console.log("cohortIds", selectedCohortId);
      setDistrictData(filteredDistrictData);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (stateCode) {
      getFilteredCohortData();
    }
  }, [searchKeyword, pageLimit, pageOffset, stateCode]);

  const fetchBlocks = async () => {
    try {
      const response = await getBlocksForDistricts({
        controllingfieldfk: selectedDistrict || "",
        fieldName: "blocks",
      });
      console.log("selectedDistrict block", selectedDistrict);
      const blocks = response?.result?.values || [];
      setBlocksOptionRead(blocks);
      console.log("blocks", blocks);

      const blockNameArray = blocks.map((item: any) => item.label);
      setBlockNameArr(blockNameArray);

      const blockCodeArray = blocks.map((item: any) => item.value);
      setBlockCodeArr(blockCodeArray);

      const blockFieldID = response?.result?.fieldId || "";
      setBlocksFieldId(blockFieldID);
    } catch (error) {
      console.error("Error fetching blocks", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [selectedDistrict]);

  const getCohortSearchBlock = async (selectedDistrict: string) => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          name: searchKeyword,
          states: stateCode,
          districts: selectedDistrict,
          type: "BLOCK",
        },
        sort: sortBy,
      };

      const response = await getCohortList(reqParams);
      const cohortDetails = response?.results?.cohortDetails || [];

      console.log("Cohort Details:", cohortDetails);

      const filteredBlockData = cohortDetails
        .map(
          (blockDetail: {
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
            console.log("Transformed Name:", transformedName);

            const matchingBlock = blocksOptionRead.find(
              (block: BlockOption) => block.label === transformedName
            );

            console.log("Matching Block:", matchingBlock);

            return {
              name: transformedName,
              code: matchingBlock?.value ?? "",
              status: blockDetail.status,
              createdAt: blockDetail.createdAt,
              updatedAt: blockDetail.updatedAt,
              createdBy: blockDetail.createdBy,
              updatedBy: blockDetail.updatedBy,
              cohortId: blockDetail.cohortId,
            };
          }
        )
        .filter((block: { name: string }) => blockNameArr.includes(block.name));

      console.log("Filtered Block Data:", filteredBlockData);

      setBlockData(filteredBlockData);

      const totalCount = filteredBlockData.length;
      setPaginationCount(totalCount);
      setPageCount(Math.ceil(totalCount / pageLimit));
    } catch (error) {
      console.error("Error fetching and filtering cohort blocks", error);
    }
  };

  useEffect(() => {
    if (selectedDistrict) {
      getCohortSearchBlock(selectedDistrict);
    }
  }, [blockNameArr, searchKeyword, pageLimit, pageOffset, sortBy]);

  const getCohortDataCohort = async () => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          parentId: selectedCohortId, //cohort id of block
        },
      };

      const response: any = await getCohortList(reqParams);

      const activeCenters = response?.results?.cohortDetails || [];
      console.log("activeBlocks", activeCenters);

      const activeCentersCount = activeCenters.filter(
        (block: { status: string }) => block.status === "active"
      ).length;
      setCountOfCenter(activeCentersCount);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
    }
  };

  console.log("countOfCenter", countOfCenter);

  useEffect(() => {
    if (selectedDistrict) getCohortDataCohort();
  }, [selectedDistrict]);

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

    const transformedData = blockData.map((item) => ({
      ...item,
      label: transformLabels(item.label),
    }));

    return transformedData.slice(startIndex, endIndex);
  };

  const columns = [
    {
      key: "name",
      title: t("COMMON.BLOCK"),
      dataType: DataType.String,
      width: "130",
    },
    {
      key: "code",
      title: t("MASTER.CODE"),
      dataType: DataType.String,
      width: "130",
    },
    {
      key: "status",
      title: t("Status"),
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

  const handleDistrictChange = async (event: SelectChangeEvent<string>) => {
    const selectedDistrict = event.target.value;
    setSelectedDistrict(selectedDistrict);
  
    const selectedDistrictData = districtData.find(
      (district) => district.value === selectedDistrict
    );
  
    const cohortId = selectedDistrictData?.cohortId as any | null;
  
    setSelectedCohortId(cohortId);
  
    await getCohortSearchBlock(selectedDistrict);
  };
  
  console.log("selectedCohortId", selectedCohortId);
  useEffect(() => {
    if (selectedDistrict) {
      getCohortSearchBlock(selectedDistrict);
    }
  }, [
    blockNameArr,
    searchKeyword,
    pageLimit,
    pageOffset,
    selectedDistrict,
  ]);

  const handleEdit = (rowData: any) => {
    setModalOpen(true);
    const cohortIdForEDIT = rowData.cohortId;
    setCohortIdForEdit(cohortIdForEDIT);

    const initialValues: StateDetail = {
      name: rowData.name || "",
      value: rowData.code || "",
      selectedDistrict: selectedDistrict || "",
      controllingField: "",
      block: "",
      label: "",
    };
    console.log("initialValues", initialValues);
    setSelectedStateForEdit(initialValues);
  };
  const handleDelete = (rowData: BlockDetail) => {
    console.log("deleted data for row", rowData);

    setSelectedStateForDelete(rowData);
    setCohortIdForDelete(rowData.cohortId);
    setConfirmationDialogOpen(true);

    const blockValue = rowData.value;
    setBlockValueForDelete(blockValue);
  };
  console.log("cohortIdForDelete", cohortIdForDelete);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleConfirmDelete = async () => {
    if (selectedStateForDelete) {
      try {
        await deleteOption("schools", selectedStateForDelete.value);
        setStateData((prevStateData) =>
          prevStateData.filter(
            (state) => state.value !== selectedStateForDelete.value
          )
        );
        showToastMessage(t("COMMON.BLOCK_DELETED_SUCCESS"), "success");
      } catch (error) {
        console.error("Error deleting state", error);
        showToastMessage(t("COMMON.BLOCK_DELETED_FAILURE"), "error");
      }
    }
    //delete cohort
    if (cohortIdForDelete) {
      let cohortDetails = {
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
  };
  const PagesSelector = () => (
    <>
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
    </>
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
    userType: t("MASTER.BLOCKS"),
    searchPlaceHolder: t("MASTER.SEARCHBAR_PLACEHOLDER_BLOCK"),
    showFilter: false,
  };

  const handleAddNewBlock = () => {
    setEditState(null);
    setSelectedStateForEdit(null);
    setModalOpen(true);
    console.log("insdie add state clicked");
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
      options: [
        {
          controllingfieldfk: controllingField,
          name,
          value,
        },
      ],
    };
    try {
      const response = await createOrUpdateOption(blocksFieldId, newDistrict);

      if (response) {
        await fetchBlocks();
      }
    } catch (error) {
      console.error("Error adding district:", error);
    }

    const queryParameters = {
      name: name,
      type: "BLOCK",
      status: cohortStatus,
      parentId: cohortId, //cohortId of district
      customFields: [
        {
          fieldId: stateFieldId, // state fieldId
          value: [stateCode], // state code
        },

        {
          fieldId: districtFieldId, // district fieldId
          value: [controllingField], // district code
        },
      ],
    };
    try {
      const cohortCreateResponse = await createCohort(queryParameters);
      if (cohortCreateResponse) {
        await getCohortSearchBlock(selectedDistrict);
        filteredCohortOptionData();
        showToastMessage(t("COMMON.BLOCK_ADDED_SUCCESS"), "success");
      } else if (cohortCreateResponse.responseCode === 409) {
        showToastMessage(t("COMMON.BLOCK_DUPLICATION_FAILURE"), "error");
      }
    } catch (error) {
      console.error("Error creating cohort:", error);
      showToastMessage(t("COMMON.BLOCK_DUPLICATION_FAILURE"), "error");
    }
    setModalOpen(false);
    setSelectedStateForEdit(null);
  };

  const handleUpdateCohortSubmit = async (
    name: string,
    value: string,
    controllingField: string,
    DistrictId?: string,
    extraArgument?: any
  ) => {
    const newDistrict = {
      options: [
        {
          controllingfieldfk: controllingField,
          name,
          value,
        },
      ],
    };
    console.log("newDistrict", newDistrict);
    try {
      const response = await createOrUpdateOption(blocksFieldId, newDistrict);

      if (response) {
        await fetchBlocks();
      }
    } catch (error) {
      console.error("Error adding district:", error);
    }

    const queryParameters = {
      name: name,
    };

    try {
      const cohortCreateResponse = await updateCohort(
        cohortIdForEdit,
        queryParameters
      );
      if (cohortCreateResponse) {
        await getCohortSearchBlock(selectedDistrict);

        filteredCohortOptionData();
        showToastMessage(t("COMMON.BLOCK_UPDATED_SUCCESS"), "success");
      } else if (cohortCreateResponse.responseCode === 409) {
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
      <AddBlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(name: string, value: string, controllingField: string) => {
          if (selectedStateForEdit) {
            handleUpdateCohortSubmit(
              name,
              value,
              controllingField,
              blocksFieldId,
              selectedStateForEdit.value
            );
          } else {
            handleCreateCohortSubmit(
              name,
              value,
              controllingField,
              blocksFieldId
            );
          }
        }}
        fieldId={blocksFieldId}
        initialValues={
          selectedStateForEdit
            ? {
                controllingField: selectedStateForEdit.selectedDistrict,
                name: selectedStateForEdit.name,
                value: selectedStateForEdit.value,
              }
            : {}
        }
      />
      <ConfirmationModal
        modalOpen={confirmationDialogOpen}
        message={
          countOfCenter > 0
            ? t("COMMON.ARE_YOU_SURE_DELETE_BLOCK")
            : t("COMMON.NO_ACTIVE_CLASSES_DELETE")
        }
        handleAction={handleConfirmDelete}
        buttonNames={{
          primary: t("COMMON.DELETE"),
          secondary: t("COMMON.CANCEL"),
        }}
        disableDelete={countOfCenter > 0}
        handleCloseModal={() => setConfirmationDialogOpen(false)}
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
                  marginLeft: 2,
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
                  {t("MASTER.DISTRICTS")}
                </InputLabel>
                <Select
                  labelId="district-select-label"
                  id="district-select"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                >
                  {districtData.map((districtDetail) => (
                    <MenuItem
                      key={districtDetail.value}
                      value={districtDetail.value}
                    >
                      {transformLabels(districtDetail.label)}
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
              ) : blockData.length > 0 ? (
                <KaTableComponent
                  columns={columns}
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
                  noDataMessage={t("COMMON.BLOCKS_NOT_FOUND")}
                />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="20vh"
                >
                  <Typography marginTop="10px" textAlign="center">
                    {t("COMMON.BLOCKS_NOT_FOUND")}
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
