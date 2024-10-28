import React, { useState, useEffect } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import { useTranslation } from "next-i18next";
import {
  getStateBlockDistrictList,
  deleteOption,
  createOrUpdateOption,
  fieldSearch
} from "@/services/MasterDataService";
import Loader from "@/components/Loader";
import { AddSlotModal } from "@/components/AddSlotModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { showToastMessage } from "@/components/Toastify";
import { SORT, Numbers, Storage } from "@/utils/app.constant";
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

export interface slotDetail {
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
  const [slotData, setSlotData] = useState<slotDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [addSlotModalOpen, setAddSlotModalOpen] = useState<boolean>(false);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<slotDetail | null>(null);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<slotDetail | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fieldId, setFieldId] = useState<string>("");
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [pageCount, setPageCount] = useState<number>(Numbers.ONE);
  const [pageOffset, setPageOffset] = useState<number>(Numbers.ZERO);
  const [pageLimit, setPageLimit] = useState<number>(Numbers.TEN);
  const [pageSizeArray, setPageSizeArray] = useState<number[]>([5, 10]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const [paginationCount, setPaginationCount] = useState<number>(Numbers.ZERO);
  const [userName, setUserName] = React.useState<string | null>("");
  const [statesProfilesData, setStatesProfilesData] = useState<any>([]);
  const [pagination, setPagination] = useState(true);

  const setPid = useStore((state) => state.setPid);

  const columns = [
    { key: "label", title: t("MASTER.SLOT"), width: "160" },
    { key: "value", title: t("MASTER.CODE"), width: "160" },
    { key: "createdBy", title: t("MASTER.CREATED_BY"), width: "160" },
    { key: "updatedBy", title: t("MASTER.UPDATED_BY"), width: "160" },
    { key: "createdAt", title: t("MASTER.CREATED_AT"), width: "160" },
    { key: "updatedAt", title: t("MASTER.UPDATED_AT"), width: "160" },
    // { key: "actions", title: t("MASTER.ACTIONS"), width: "160" },
  ];

  const handleEdit = (rowData: slotDetail) => {
    setSelectedStateForEdit(rowData);
    setAddSlotModalOpen(true);
  };

  const handleDelete = (rowData: slotDetail) => {
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
        await deleteOption("classes", selectedStateForDelete.value);
        setSlotData((prevStateData) =>
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

  const handleAddSlotClick = () => {
    //setSelectedStateForEdit(null);
    setAddSlotModalOpen(true);
  };

  const handleAddSlotSubmit = async (
    name: string,
    value: string,
  ) => {
    const newState = {
      options: [{ name, value }],
    };
    try {
      if (fieldId) {
        const isUpdating = 0 //selectedState !== null;
        const response = await createOrUpdateOption(fieldId, newState);

        if (response) {
          await fetchSlotData();

          const successMessage = isUpdating
            ? t("COMMON.SLOT_UPDATED_SUCCESS")
            : t("COMMON.SLOT_ADDED_SUCCESS");

          showToastMessage(successMessage, "success");
        } else {
          console.error("Failed to create/update state:", response);
          showToastMessage(t("COMMON.SLOT_OPERATION_FAILURE"), "error");
        }
      }
    } catch (error) {
      console.error("Error creating/updating slot:", error);
      showToastMessage(t("COMMON.SLOT_OPERATION_FAILURE"), "error");
    }
    setAddSlotModalOpen(false);
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

  useEffect(() => {
    getSlotFieldId();
  });

  const getSlotFieldId = async () => {
    try {
      const response = await fieldSearch({name: "slots"}, 1, 0);
      if (response?.result?.length) {
        const temp = response.result[0]
        const slotFieldId = temp.fieldId || "";
        setFieldId(slotFieldId);
      }
    } catch (error) {
      console.error("No School field found", error);
      setLoading(false);
    }
  };

  const fetchSlotData = async () => {
    try {
      setLoading(true);
      const limit = pageLimit;
      const offset = pageOffset * limit;

      const data = {
        limit: limit,
        offset: offset,
        fieldName: "slots",
        optionName: searchKeyword || "",
        sort: sortBy,
      };
      const resp = await getStateBlockDistrictList(data);
      if (resp?.result?.fieldId) {
        setSlotData(resp.result.values);
        const totalCount = resp?.result?.totalCount || 0;
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

        setPageCount(Math.ceil(totalCount / limit));
      } else {
        console.error("Unexpected fieldId:", resp?.result?.fieldId);
      }
    } catch (error) {
      console.error("Error fetching slot data", error);
      setSlotData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSlotData();
  }, [searchKeyword,pageLimit, pageOffset, sortBy]);

  return (
    <React.Fragment>
      <AddSlotModal
        open={addSlotModalOpen}
        onClose={() => setAddSlotModalOpen(false)}
        onSubmit={(name: string, value: string) =>
          handleAddSlotSubmit(name, value)
        }
        initialValues={{}}
      />
    <HeaderComponent
      userType={t("MASTER.SLOTS")}
      searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_SLOT")}
      showStateDropdown={false}
      handleSortChange={handleSortChange}
      showAddNew={true}
      showSort={true}
      selectedSort={selectedSort}
      showFilter={false}
      handleSearch={handleSearch}
      handleAddUserClick={handleAddSlotClick}
    >
      {slotData.length === 0 && !loading ? (
        <Box display="flex" marginLeft="40%" gap="20px">
          <Typography marginTop="10px" variant="h2">
            {t("COMMON.STATE_NOT_FOUND")}
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
              <Loader showBackdrop={false} loadingText={t("COMMON.LOADING")} />
            </Box>
          ) : (
            <KaTableComponent
              columns={columns}
              data={slotData.map((stateDetail) => ({
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
              onEdit={handleEdit}
              extraActions={[]}
            />
          )}
        </div>
      )}
    </HeaderComponent>
    </React.Fragment>
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
