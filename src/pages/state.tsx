import React, { useState, useEffect } from "react";
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
import { SORT, Numbers } from "@/utils/app.constant";
import { Box, Pagination, SelectChangeEvent } from "@mui/material";
import PageSizeSelector from "@/components/PageSelector";

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
  const [loading, setLoading] = useState<boolean>(true);
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

  const columns = [
    { key: "label", title: t("MASTER.STATE_NAMES") },
    { key: "value", title: t("MASTER.STATE_CODE") },
    { key: "createdBy", title: t("MASTER.CREATED_BY") },
    { key: "updatedBy", title: t("MASTER.UPDATED_BY") },
    { key: "createdAt", title: t("MASTER.CREATED_AT") },
    { key: "updatedAt", title: t("MASTER.UPDATED_AT") },
    { key: "actions", title: t("MASTER.ACTIONS") },
  ];

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
    stateId?: string
  ) => {
    const newState = { options: [{ name, value }] };

    try {
      if (fieldId) {
        const response = await createOrUpdateOption(fieldId, newState, stateId);
        if (response) {
          await fetchStateData(searchKeyword);
          showToastMessage(t("COMMON.STATE_ADDED_SUCCESS"), "success");
        } else {
          console.error("Failed to create/update state:", response);
        }
      }
    } catch (error) {
      console.error("Error creating/updating state:", error);
      showToastMessage(t("COMMON.STATE_ADDED_FAILURE"), "error");
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

  const fetchStateData = async (keyword = "") => {
    try {
      setLoading(true);
      const limit = pageLimit;
      const offset = pageOffset * limit;

      const data = {
        limit: limit,
        offset: offset,
        fieldName: "states",
        optionName: keyword,
        sort: sortBy,
      };

      console.log("fetchStateData", data);

      const resp = await getStateBlockDistrictList(data);

      if (resp?.result?.fieldId) {
        setFieldId(resp.result.fieldId);
        setStateData(resp.result.values);

        const totalCount = resp?.result?.totalCount || 0;
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
      } else {
        console.error("Unexpected fieldId:", resp?.result?.fieldId);
        setStateData([]);
      }
    } catch (error) {
      console.error("Error fetching state data", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStateData(searchKeyword);
  }, [searchKeyword, pageLimit, pageOffset, sortBy]);

  return (
    <HeaderComponent
      userType={t("MASTER.STATE")}
      searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_STATE")}
      showStateDropdown={false}
      handleSortChange={handleSortChange}
      showAddNew={true}
      showSort={true}
      selectedSort={selectedSort}
      showFilter={false}
      handleSearch={handleSearch}
      handleAddUserClick={handleAddStateClick}
    >
      {loading ? (
        <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />
      ) : (
        <div>
          <KaTableComponent
            columns={columns}
            data={stateData.map((stateDetail) => ({
              label: stateDetail.label ?? "",
              value: stateDetail.value,
              createdAt: stateDetail.createdAt,
              updatedAt: stateDetail.updatedAt,
              createdBy: stateDetail.createdBy,
              updatedBy: stateDetail.updatedBy,
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
              stateData.length === 0 ? t("COMMON.STATE_NOT_FOUND") : ""
            }
            extraActions={[]}
          />
          <AddStateModal
            open={addStateModalOpen}
            onClose={() => setAddStateModalOpen(false)}
            onSubmit={(name, value) =>
              handleAddStateSubmit(name, value, selectedStateForEdit?.value)
            }
            fieldId={fieldId}
            initialValues={
              selectedStateForEdit
                ? {
                    name: selectedStateForEdit.label,
                    value: selectedStateForEdit.value,
                  }
                : {}
            }
            stateId={selectedStateForEdit?.value}
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
