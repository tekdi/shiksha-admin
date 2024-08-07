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
} from "@/services/MasterDataService";
import { transformLabel } from "@/utils/Helper";
import { showToastMessage } from "@/components/Toastify";
import ConfirmationModal from "@/components/ConfirmationModal";
import Loader from "@/components/Loader";
import AddDistrictModal from "@/components/AddDistrictModal";
import { Pagination } from "@mui/material";
import PageSizeSelector from "@/components/PageSelector";
import { Numbers, SORT } from "@/utils/app.constant";

type StateDetail = {
  value: string;
  label: string;
};

type DistrictDetail = {
  updatedBy: any;
  createdBy: any;
  updatedAt: any;
  createdAt: any;
  value: string;
  label: string;
};

const District: React.FC = () => {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState("ALL"); // Default to "ALL"
  const [stateData, setStateData] = useState<StateDetail[]>([]);
  const [districtData, setDistrictData] = useState<DistrictDetail[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<StateDetail | null>(null);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<DistrictDetail | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [districtFieldId, setDistrictFieldId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [pageCount, setPageCount] = useState<number>(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState<number>(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState<number>(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10, 20, 50]);
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [searchKeyword, setSearchKeyword] = useState("");

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

  const PagesSelector = () => (
    <Box mt={3}>
      <Pagination
        color="primary"
        count={pageCount}
        page={pageOffset + 1}
        onChange={handlePaginationChange}
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

  useEffect(() => {
    const fetchStateData = async () => {
      try {
        setLoading(true);
        const data = await getStateBlockDistrictList({ fieldName: "states" });

        if (data?.result?.values) {
          setStateData(data.result.values);
          setSelectedState(data.result.values[0]?.value || "ALL");
          fetchDistrictData(data.result.values[0]?.value || "ALL");
        } else {
          setStateData([]);
        }
      } catch (error) {
        console.error("Error fetching state data:", error);
        setStateData([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchDistrictData = async (stateId: string) => {
      try {
        if (stateId === "ALL") {
          setDistrictData([]);
          return;
        }
        const limit = pageLimit;
        const offset = pageOffset * limit;

        const data = {
          limit: limit,
          offset: offset,
          controllingfieldfk: stateId,
          fieldName: "districts",
          sort: sortBy,
        };

        const districtData = await getDistrictsForState(data);
        setDistrictData(districtData.result.values || []);

        const totalCount = districtData?.result?.totalCount || 0;
        console.log("totalCount", totalCount);

        if (totalCount >= 15) {
          setPageSizeArray([5, 10, 15]);
        } else if (totalCount >= 10) {
          setPageSizeArray([5, 10]);
        } else {
          setPageSizeArray([5]);
        }

        const pageCount = Math.ceil(totalCount / limit);
        setPageCount(pageCount);
      } catch (error) {
        console.error("Error fetching district data:", error);
        setDistrictData([]);
      }
    };

    fetchStateData();
  }, [sortBy, pageLimit, pageOffset]);
  const handleStateChange = async (event: SelectChangeEvent<string>) => {
    const selectedState = event.target.value;
    setSelectedState(selectedState);

    console.log("selectedState", selectedState);

    try {
      const data = {
        controllingfieldfk: selectedState === "ALL" ? undefined : selectedState,
        fieldName: "districts",
      };

      const districtData = await getDistrictsForState(data);
      setDistrictData(districtData.result.values || []);
    } catch (error) {
      console.error("Error fetching district data", error);
    }
  };
  const handleEdit = (rowData: DistrictDetail) => {
    setModalOpen(true);
    setSelectedStateForEdit(rowData);
  };

  const handleDelete = (rowData: DistrictDetail) => {
    setSelectedStateForDelete(rowData);
    setConfirmationDialogOpen(true);
  };
  const handleSearch = (keyword: string) => {
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
        showToastMessage(t("COMMON.STATE_DELETED_SUCCESS"), "success");
      } catch (error) {
        showToastMessage(t("COMMON.STATE_DELETED_FAILURE"), "error");
      }
    }
    setConfirmationDialogOpen(false);
  };

  const handleAddDistrictSubmit = async (
    name: string,
    value: string,
    controllingField: string,
    fieldId: string,
    DistrictId?: string
  ) => {
    const newDistrict = {
      options: [
        {
          controllingField,
          name,
          value,
        },
      ],
    };

    try {
      const response = await createOrUpdateOption(
        fieldId,
        newDistrict,
        DistrictId
      );

      if (response) {
        showToastMessage("District added successfully", "success");
      } else {
        showToastMessage("Failed to create/update district", "error");
      }
    } catch (error) {
      showToastMessage("Error adding district", "error");
    }

    setModalOpen(false);
    setSelectedStateForEdit(null);
  };

  return (
    <>
      <AddDistrictModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(name, value, controllingField) =>
          handleAddDistrictSubmit(
            name,
            value,
            controllingField,
            districtFieldId,
            selectedStateForEdit?.value
          )
        }
        fieldId={districtFieldId}
        initialValues={
          selectedStateForEdit
            ? {
                controllingField: selectedStateForEdit.value,
                name: selectedStateForEdit.label,
                value: selectedStateForEdit.value,
              }
            : {}
        }
      />
      <ConfirmationModal
        modalOpen={confirmationDialogOpen}
        message={t("COMMON.ARE_YOU_SURE_DELETE")}
        handleAction={handleConfirmDelete}
        buttonNames={{
          primary: t("COMMON.DELETE"),
          secondary: t("COMMON.CANCEL"),
        }}
        handleCloseModal={() => setConfirmationDialogOpen(false)}
      />
      <HeaderComponent
        userType={t("MASTER.DISTRICTS")}
        searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_DISTRICT")}
        states={stateData.map((state) => state.value)}
        districts={districtData.map((district) => district.label)}
        selectedState={selectedState}
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
          <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />
        ) : (
          <>
            <Box display="flex" gap={2}>
              <FormControl
                variant="outlined"
                sx={{ minWidth: 220, marginTop: 2 }}
              >
                <InputLabel id="state-select-label">
                  {t("MASTER.STATE")}
                </InputLabel>
                <Select
                  labelId="state-select-label"
                  id="state-select"
                  value={selectedState}
                  onChange={handleStateChange}
                  label={t("MASTER.STATE")}
                >
                  <MenuItem value="ALL">{t("ALL")}</MenuItem>
                  {stateData.map((state) => (
                    <MenuItem key={state.value} value={state.value}>
                      {transformLabel(state.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <KaTableComponent
              columns={[
                {
                  key: "label",
                  title: t("MASTER.DISTRICT_NAMES"),
                  dataType: DataType.String,
                },
                {
                  key: "value",
                  title: t("MASTER.DISTRICT_CODE"),
                  dataType: DataType.String,
                },
                { key: "createdBy", title: t("MASTER.CREATED_BY") },
                { key: "updatedBy", title: t("MASTER.UPDATED_BY") },

                { key: "createdAt", title: t("MASTER.CREATED_AT") },
                { key: "updatedAt", title: t("MASTER.UPDATED_AT") },
                {
                  key: "actions",
                  title: t("MASTER.ACTIONS"),
                  dataType: DataType.String,
                },
              ]}
              data={districtData.map((districtDetail) => ({
                label: transformLabel(districtDetail.label),
                createdAt: districtDetail.createdAt,
                updatedAt: districtDetail.updatedAt,
                createdBy: districtDetail.createdBy,
                updatedBy: districtDetail.updatedBy,
                value: districtDetail.value,
              }))}
              limit={pageLimit}
              offset={pageOffset}
              paginationEnable={true}
              PagesSelector={PagesSelector}
              PageSizeSelector={PageSizeSelectorFunction}
              pageSizes={pageSizeArray}
              onEdit={handleEdit}
              onDelete={handleDelete}
              noDataMessage={
                districtData.length === 0 ? t("COMMON.DISTRICT_NOT_FOUND") : ""
              }
              extraActions={[]}
            />
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
