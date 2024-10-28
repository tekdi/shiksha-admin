import React, { useState, useEffect } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "next-i18next";
import { DataType } from "ka-table/enums";
import {
  getStateBlockDistrictList,
  getDistrictsForState,
  createOrUpdateOption,
  deleteOption,
  updateCohort,
} from "@/services/MasterDataService";
import { transformLabel } from "@/utils/Helper";
import { showToastMessage } from "@/components/Toastify";
import ConfirmationModal from "@/components/ConfirmationModal";
import Loader from "@/components/Loader";
import AddDistrictModal from "@/components/AddDistrictModal";
import { Chip, Pagination, Typography } from "@mui/material";
import PageSizeSelector from "@/components/PageSelector";
import { Numbers, SORT, Status, Storage } from "@/utils/app.constant";
import {
  createCohort,
  getCohortList,
} from "@/services/CohortService/cohortService";
import useStore from "@/store/store";
import { getUserDetailsInfo } from "@/services/UserList";
import { getCohortList as getMyCohorts } from "@/services/GetCohortList";

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
  const [districtData, setDistrictData] = useState<DistrictDetail[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<DistrictDetail | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [districtFieldId, setDistrictFieldId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [pageCount, setPageCount] = useState<number>(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState<number>(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState<number>(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10, 20, 50]);
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [paginationCount, setPaginationCount] = useState<number>(Numbers.ZERO);
  const [stateCode, setStateCode] = useState<any>();
  const [stateValue, setStateValue] = useState<string>("");
  useState<string>("");
  const [cohortStatus, setCohortStatus] = useState<any>();
  const [cohortId, setCohortId] = useState<any>();
  const [stateFieldId, setStateFieldId] = useState<string>("");
  const [pagination, setPagination] = useState(true);
  const [cohotIdForDelete, setCohortIdForDelete] = useState<any>("");

  const [districtsOptionRead, setDistrictsOptionRead] = useState<any>([]);
  const [districtCodeArr, setDistrictCodeArr] = useState<any>([]);
  const [districtNameArr, setDistrictNameArr] = useState<any>([]);
  const [cohortIdForEdit, setCohortIdForEdit] = useState<any>();
  const [districtValueForDelete, setDistrictValueForDelete] = useState<any>("");
  const [countOfBlocks, setCountOfBlocks] = useState<number>(0);
  const [cohortIdofState,setCohortIdofState] = useState<any>("");

  useEffect(() => {
    const fetchUserDetail = async () => {
      let userId: any;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          userId = localStorage.getItem(Storage.USER_ID);
        }
        const response = await getUserDetailsInfo(userId);
        console.log("response my cohorts", response);
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

// get cohort id of state
  const getStatecohorts = async () => {
    let userId: any;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        userId = localStorage.getItem(Storage.USER_ID);
      }
  
      const response: any = await getMyCohorts(userId);      
      const cohortData = response?.result?.cohortData;
      if (Array.isArray(cohortData)) {
        const stateCohort = cohortData.find(cohort => cohort.type === "STATE");
  
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
            const transformedName = districtDetail.name
            

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

      console.log("filteredDistrictData", filteredDistrictData);

      setDistrictData(filteredDistrictData);

      const totalCount = filteredDistrictData.length;
      setPaginationCount(totalCount);
      setPageCount(Math.ceil(totalCount / pageLimit));
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
      setDistrictData([]);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (stateCode) {
      getFilteredCohortData();
    }
  }, [searchKeyword, pageLimit, pageOffset, stateCode, sortBy]);

  const getBlockDataCohort = async () => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          districts: districtValueForDelete,
          type: "BLOCK",
        },
        sort: sortBy,
      };

      const response:any = await getCohortList(reqParams);
 
      const activeBlocks =  response?.results?.cohortDetails || [];
      console.log("activeBlocks", activeBlocks);

      const activeBlocksCount = activeBlocks.filter(
        (block: { status: string }) => block.status === "active"
      ).length;
      setCountOfBlocks(activeBlocksCount);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
      setDistrictData([]);
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
    console.log("updatedRowData", updatedRowData);
    setSelectedStateForEdit(updatedRowData);
  };
  const handleDelete = (rowData: DistrictDetail) => {
    setSelectedStateForDelete(rowData);
    const districtValue = rowData.value;
    setDistrictValueForDelete(districtValue);

    console.log("districtValue", districtValue);

    setCohortIdForDelete(rowData.cohortId);
    setConfirmationDialogOpen(true);
  };
  console.log("cohort id for delte", cohotIdForDelete);
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleConfirmDelete = async () => {
    if (selectedStateForDelete) {
      try {
        await deleteOption("clusters", selectedStateForDelete.value);
        setDistrictData((prev) =>
          prev.filter(
            (district) => district.value !== selectedStateForDelete.value
          )
        );
        showToastMessage(t("COMMON.DISTRICT_DELETED_SUCCESS"), "success");
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
      console.log(resp);
      if (resp?.responseCode === 200) {
        const cohort = filteredCohortOptionData()?.find(
          (item: any) => item.cohortId == cohotIdForDelete
        );
        if (cohort) {
          cohort.status = Status.ARCHIVED;
        }
        console.log(resp?.params?.successmessage);
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
      options: [
        {
          controllingfieldfk: controllingField,
          name,
          value,
        },
      ],
    };
    try {
      const response = await createOrUpdateOption(districtFieldId, newDistrict);

      if (response) {
        await fetchDistricts();
        await getFilteredCohortData();
      }
    } catch (error) {
      console.error("Error adding district:", error);
    }

    const queryParameters = {
      name: name,
      type: "DISTRICT",
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
        filteredCohortOptionData()
        showToastMessage(t("COMMON.DISTRICT_ADDED_SUCCESS"), "success");
      } else if (cohortCreateResponse.responseCode === 409) {
        showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
      }
    } catch (error) {
      console.error("Error creating cohort:", error);
      showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
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
      const response = await createOrUpdateOption(districtFieldId, newDistrict);

      if (response) {
        await fetchDistricts();
        await getFilteredCohortData();
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
        filteredCohortOptionData()
        showToastMessage(t("COMMON.DISTRICT_UPDATED_SUCCESS"), "success");
      } else if (cohortCreateResponse.responseCode === 409) {
        showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
      }
    } catch (error) {
      console.error("Error creating cohort:", error);
      showToastMessage(t("COMMON.DISTRICT_DUPLICATION_FAILURE"), "error");
    }
    setModalOpen(false);
    setSelectedStateForEdit(null);
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
  };

  const handlePaginationChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPageOffset(value - 1);
  };

  function transformLabels(label: string) {
    if (!label || typeof label !== 'string') return ''; 
    return label
      .toLowerCase() 
      .replace(/_/g, " ") 
      .replace(/\b\w/g, (char) => char.toUpperCase()); 
  }
  
  
  const filteredCohortOptionData = () => {
    const startIndex = pageOffset * pageLimit;
    const endIndex = startIndex + pageLimit;
    
    const transformedData = districtData.map(item => ({
      ...item,
      label: transformLabels(item.label) 
    }));
    
    return transformedData.slice(startIndex, endIndex);
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
        handleSearch={handleSearch}
        showFilter={false}
        handleAddUserClick={() => {
          setModalOpen(true);
          setSelectedStateForEdit(null);
        }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="20vh"
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
                columns={[
                  {
                    key: "label",
                    title: t("COMMON.DISTRICT"),
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
                    width: "130",
                  },
                  {
                    key: "updatedBy",
                    title: t("MASTER.UPDATED_BY"),
                    width: "130",
                  },
                  {
                    key: "createdAt",
                    title: t("MASTER.CREATED_AT"),
                    width: "160",
                  },
                  {
                    key: "updatedAt",
                    title: t("MASTER.UPDATED_AT"),
                    width: "160",
                  },
                  {
                    key: "actions",
                    title: t("MASTER.ACTIONS"),
                    dataType: DataType.String,
                    width: "130",
                  },
                ]}
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
