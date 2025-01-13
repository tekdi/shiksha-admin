import React, { useState, useEffect } from "react";
import KaTableComponent from "../components/KaTableComponent";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import HeaderComponent from "@/components/HeaderComponent";
import { useTranslation } from "next-i18next";
import {
  getStateBlockDistrictList,
  deleteOption,
  createOrUpdateOption,
  fieldSearch,
} from "@/services/MasterDataService";
import Loader from "@/components/Loader";
import { AddClassModal } from "@/components/AddClassModal";
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

export interface ClassDetail {
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
  const [classData, setClassData] = useState<ClassDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] =
    useState<boolean>(false);
  const [addClassModalOpen, setAddClassModalOpen] = useState<boolean>(false);
  const [selectedStateForDelete, setSelectedStateForDelete] =
    useState<ClassDetail | null>(null);
  const [selectedStateForEdit, setSelectedStateForEdit] =
    useState<ClassDetail | null>(null);
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
  const [confirmationModalOpen, setConfirmationModalOpen] =
    React.useState<boolean>(false);

  const setPid = useStore((state) => state.setPid);

  const columns = [
    { key: "label", title: t("MASTER.STATE"), width: "160" },
    { key: "value", title: t("MASTER.CODE"), width: "160" },
    // { key: "createdBy", title: t("MASTER.CREATED_BY"), width: "160" },
    // { key: "updatedBy", title: t("MASTER.UPDATED_BY"), width: "160" },
    // { key: "createdAt", title: t("MASTER.CREATED_AT"), width: "160" },
    // { key: "updatedAt", title: t("MASTER.UPDATED_AT"), width: "160" },
    { key: "actions", title: t("MASTER.ACTIONS"), width: "160" },
  ];

  const handleEdit = (rowData: ClassDetail) => {
    setSelectedStateForEdit(rowData);
    setAddClassModalOpen(true);
  };

  useEffect(() => {
    getClassFieldId();
  });

  const getClassFieldId = async () => {
    try {
      const response = await fieldSearch({ name: "classes" }, 1, 0);
      if (response?.result?.length) {
        const temp = response.result[0];
        const classFieldId = temp.fieldId || "";
        setFieldId(classFieldId);
      }
    } catch (error) {
      console.error("No Class field found", error);
      setLoading(false);
    }
  };

  const handleDelete = (rowData: ClassDetail) => {
    console.log("rowData", rowData);
    setSelectedStateForDelete(rowData);
    setConfirmationModalOpen(true);
  };
  const handleCloseModal = () => {
    setConfirmationModalOpen(false);
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
        const response = await deleteOption(
          "classes",
          selectedStateForDelete.value
        );
        console.log("responseClass", response);
        if (response?.status === 200) {
          setClassData((prevStateData) =>
            prevStateData.filter(
              (state) => state.value !== selectedStateForDelete.value
            )
          );
          showToastMessage(t("COMMON.CLASS_DELETED_SUCCESS"), "success");
        } else {
          showToastMessage(t("COMMON.CLASS_DELETED_FAILURE"), "error");
        }
      } catch (error) {
        console.error("Error deleting state", error);
        showToastMessage(t("COMMON.CLASS_DELETED_FAILURE"), "error");
      }
      handleCloseModal();
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleAddClassClick = () => {
    //setSelectedStateForEdit(null);
    setAddClassModalOpen(true);
  };

  const handleAddClassSubmit = async (
    name: string,
    value: string,
    selectedState?: any
  ) => {
    const newState = {
      options: [{ name, value }],
    };
    try {
      if (fieldId) {
        const isUpdating = selectedState !== null;
        const response = await createOrUpdateOption(fieldId, newState);

        if (response) {
          await fetchClassData();

          const successMessage = isUpdating
            ? t("COMMON.CLASS_UPDATED_SUCCESS")
            : t("COMMON.CLASS_ADDED_SUCCESS");

          showToastMessage(successMessage, "success");
        } else {
          console.error("Failed to create/update state:", response);
          showToastMessage(t("COMMON.CLASS_OPERATION_FAILURE"), "error");
        }
      }
    } catch (error) {
      console.error("Error creating/updating state:", error);
      showToastMessage(t("COMMON.CLASS_OPERATION_FAILURE"), "error");
    }
    setAddClassModalOpen(false);
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

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const limit = pageLimit;
      const offset = searchKeyword? 0 : pageOffset * limit;

      const data = {
        limit: limit,
        offset: offset,
        fieldName: "classes",
        optionName: searchKeyword || "",
        sort: sortBy,
      };
      const resp = await getStateBlockDistrictList(data);

      if (resp?.result?.fieldId) {
        setClassData(resp.result.values);
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
      console.error("Error fetching state data", error);
      setClassData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchClassData();
  }, [searchKeyword, pageLimit, pageOffset, sortBy]);

  return (
    <React.Fragment>
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

      <AddClassModal
        open={addClassModalOpen}
        onClose={() => setAddClassModalOpen(false)}
        onSubmit={(name: string, value: string) =>
          handleAddClassSubmit(name, value)
        }
        initialValues={{}}
      />
      <HeaderComponent
        userType={t("MASTER.CLASSES")}
        searchPlaceHolder={t("MASTER.SEARCHBAR_PLACEHOLDER_CLASS")}
        showStateDropdown={false}
        handleSortChange={handleSortChange}
        showAddNew={true}
        showSort={true}
        selectedSort={selectedSort}
        showFilter={false}
        handleSearch={handleSearch}
        handleAddUserClick={handleAddClassClick}
      >
        {classData.length === 0 && !loading ? (
          <Box display="flex" marginLeft="40%" gap="20px">
            <Typography marginTop="10px" variant="h2">
              {t("COMMON.CLASS_NOT_FOUND")}
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
                data={classData.map((stateDetail) => ({
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
                onDelete={handleDelete}
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
