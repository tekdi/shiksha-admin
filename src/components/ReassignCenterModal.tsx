import {
  Box,
  Checkbox,
  Divider,
  InputAdornment,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import { showToastMessage } from "./Toastify";
import CustomModal from "./CustomModal";
import SearchIcon from "@mui/icons-material/Search";
import { Role, Status } from "@/utils/app.constant";
import { bulkCreateCohortMembers } from "@/services/CohortService/cohortService";
import { getCenterList } from "@/services/MasterDataService";
import { cohortMemberList, getUserDetailsInfo } from "@/services/UserList";
import { updateUser } from "@/services/CreateUserService";
import { useLocationState } from "@/utils/useLocationState";
import AreaSelection from "./AreaSelection";
import { transformArray } from "../utils/Helper";
import { firstLetterInUpperCase } from "./../utils/Helper";
import useSubmittedButtonStore from "@/utils/useSharedState";
import useNotification from "@/hooks/useNotification";

interface ReassignCohortModalProps {
  open: boolean;
  onClose: () => void;
  cohortData?: any;
  userId?: string;
  userType?: string;
  blockList?: any;
  blockName?: any;
  blockCode?: any;
  districtName?: any;
  districtCode?: any;
  cohortId?: any;
  centers: any;
}

interface Cohort {
  id?: any;
  cohortId?: string;
  name?: string;
}
type FilterDetails = {
  role: any;
  status?: any;
  districts?: any;
  states?: any;
  blocks?: any;
  name?: any;
  cohortId?: any;
};
const ReassignCenterModal: React.FC<ReassignCohortModalProps> = ({
  open,
  onClose,
  cohortData,
  userId,
  userType,
  blockList,
  blockName,
  cohortId,
  blockCode,
  districtName,
  districtCode,
  centers,
}) => {
  console.log(userId);
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const roleType = userType;
  const defaultBlock = blockName;

  const {
    states,
    districts,
    blocks,
    allCenters,
    isMobile,
    isMediumScreen,
    selectedState,
    selectedStateCode,
    selectedDistrict,
    selectedDistrictCode,
    selectedCenter,
    dynamicForm,
    selectedBlock,
    selectedBlockCode,
    handleStateChangeWrapper,
    handleDistrictChangeWrapper,
    handleBlockChangeWrapper,
    handleCenterChangeWrapper,
    selectedCenterCode,
    selectedBlockCohortId,
    blockFieldId,
    districtFieldId,
    stateFieldId,
    dynamicFormForBlock,
    stateDefaultValue,
    setSelectedBlock,
    setSelectedDistrict,
    setSelectedDistrictCode,
    setSelectedBlockCode,
  } = useLocationState(open, onClose, roleType, true);
  let cohorts: Cohort[] = allCenters?.map(
    (cohort: { cohortId: any; name: string }) => ({
      name: cohort.name,
      id: cohort.cohortId,
    })
  );

  console.log(blockCode);
  console.log(selectedBlock);
  const names = cohortData.map((item: any) => item.name);
  const setReassignButtonStatus = useSubmittedButtonStore(
    (state: any) => state.setReassignButtonStatus
  );
  const reassignButtonStatus = useSubmittedButtonStore(
    (state: any) => state.reassignButtonStatus
  );
  console.log(names);
  // const [filters, setFilters] = useState<FilterDetails>({
  //  // cohortId:selectedBlockCohortId,
  //   role: Role.TEAM_LEADER,
  //   status:[Status.ACTIVE]

  // });
  const [searchInput, setSearchInput] = useState("");
  const [reassignAlertModal, setReassignAlertModal] = useState(false);
  const [assignedTeamLeader, setAssignedTeamLeader] = useState("");
  const [selectedBlockForTL, setSelectedBlockForTL] = useState("");
  const [assignedTeamLeaderNames, setAssignedTeamLeaderNames] = useState([]);
  const [confirmButtonDisable, setConfirmButtonDisable] = useState(true);
  const [checkedConfirmation, setCheckedConfirmation] =
    useState<boolean>(false);
  const [selectedBlockCohortIdForTL, setSelectedBlockCohortIdForTL] =
    useState("");
  const [selectedTLUserID, setSelectedTLUserID] = useState(userId);

  // const [reassignOpen, setReassignOpen] = useState(false);

  //const [selectedBlockId, setselectedBlockId] = useState(blockName);

  const [checkedCenters, setCheckedCenters] = useState<string[]>([]);
  //const [checkedCenters, setCheckedCenters] = useState<string[]>([]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value.toLowerCase());
  };

  const handleClose = () => {
    setCheckedCenters([]);
    onClose();
  };

  const handleToggle = (name: string) => {
    if (userType === Role.LEARNERS) {
      setCheckedCenters([name]);
    } else {
      setCheckedCenters((prev) =>
        prev.includes(name)
          ? prev.filter((center) => center !== name)
          : [...prev, name]
      );
    }
  };

  useEffect(() => {
    if (blockName) {
      if (userType === Role.TEAM_LEADERS) setCheckedCenters([blockName]);
    }
    if (centers) {
      if (userType !== Role.TEAM_LEADERS)
        setCheckedCenters(
          centers?.split(",").map((center: any) => center.trim())
        );
    }
  }, [blockName, centers, open]);
  console.log(checkedCenters);
  console.log(centers);

  const { getNotification } = useNotification();
  const handleReassign = async () => {
    try {
      let selectedData;
      let unSelectedData: string[];
      if (userType !== Role.TEAM_LEADERS) {
        selectedData = cohorts
          .filter(
            (center) => center?.name && checkedCenters.includes(center.name)
          )
          .map((center) => center!.id);

        unSelectedData = cohorts
          .filter(
            (center) => center?.name && !checkedCenters.includes(center.name)
          )
          .map((center) => center!.id);
      } else {
        selectedData = blocks
          .filter(
            (center) => center?.value && checkedCenters.includes(center.value)
          )
          .map((center) => center!.value);

        unSelectedData = blocks
          .filter(
            (center) => center?.label && !checkedCenters.includes(center.label)
          )
          .map((center) => center!.label);
      }

      console.log(blocks);
      console.log(selectedData);

      let payload;
      if (userType !== Role.TEAM_LEADERS) {
        payload = {
          userId: [userId],
          cohortId: selectedData,
          removeCohortId:
            unSelectedData.length === 0 ? cohortId : unSelectedData,
        };

        await bulkCreateCohortMembers(payload);
        let customFields;

        
        if (selectedBlock[0] !== blockName) {
          const userDetails = await getUserDetailsInfo(userId);
          if(userType === Role.FACILITATORS){

          getNotification(selectedTLUserID, "FACILITATOR_BLOCK_UPDATE");

          console.log(selectedTLUserID ,"FACILITATOR_BLOCK_UPDATE");
          
        }
          const blockField = userDetails?.userData?.customFields.find(
            (field: any) => field.label === "BLOCKS"
          );
          console.log(checkedCenters);
          customFields = [
            {
              fieldId: blockField.fieldId,
              value: selectedBlockCode,
            },
          ];
        

          
          if (selectedDistrict[0] !== districtName) {
            const userDetails = await getUserDetailsInfo(userId);
             if(userType === Role.TEAM_LEADERS){

          getNotification(selectedTLUserID, "TL_DISTRICT_UPDATE");
        }
          
            const blockField = userDetails?.userData?.customFields.find(
              (field: any) => field.label === "BLOCKS"
            );
            customFields = [
              {
                fieldId: districtFieldId,
                value: selectedDistrictCode,
              },
              {
                fieldId: blockField.fieldId,
                value: selectedBlockCode,
              },
            ];
          }
          else {
             getNotification(selectedTLUserID, "TL_BLOCK_REASSIGNMENT");
          }
        }

        const updateObject = {
          userData: {},
          customFields: customFields,
        };
        if (userId) {
          await updateUser(userId, updateObject);
        }
        handleClose();

        showToastMessage(
          t(
            userType === Role.TEAM_LEADERS
              ? "COMMON.BLOCKS_REASSIGN_SUCCESSFULLY"
              : "COMMON.CENTERS_REASSIGN_SUCCESSFULLY"
          ),
          "success"
        );
        if( userType === Role.FACILITATORS) {
          getNotification(userId, "FACILITATOR_CENTER_REASSIGNMENT");
        }
        if(userType === Role.LEARNERS) {
          getNotification(selectedTLUserID, "LEARNER_REASSIGNMENT_NOTIFICATION");
        }
      } else {
        const reassignBlockObject = {
          limit: 0,
          offset: 0,
          filters: {
            status: ["active"],
            name: checkedCenters[0],
          },
        };

        const response = await getCenterList(reassignBlockObject);
        const cohortDetails = response?.result?.results?.cohortDetails;
        const selectedBlockCohortId = cohortDetails?.find(
          (item: any) => item?.type === "BLOCK"
        )?.cohortId;
        setSelectedBlockCohortIdForTL(selectedBlockCohortId);
        const filters: FilterDetails = {
          cohortId: selectedBlockCohortId,
          role: Role.TEAM_LEADER,
          status: [Status.ACTIVE],
        };
        console.log(filters);
        let sort = ["name", "asc"];
        let resp;
        try {
          resp = await cohortMemberList({ filters, sort });
        } catch (apiError) {
          console.log("API call failed, proceeding to else block");
          resp = null;
        }
        if (!selectedBlockCohortId) {
          showToastMessage(
            t("COMMON.COHORT_ID_NOT_FOUND", { block: checkedCenters[0] }),
            "info"
          );
          return;
        }
        if (resp?.userDetails) {
          handleClose();
          setReassignAlertModal(true);
          setAssignedTeamLeader(resp?.userDetails?.length);
          setSelectedBlockForTL(checkedCenters[0]);
          const userNames = resp?.userDetails?.map((user: any) => user.name);
          setSelectedTLUserID(userId);
          setAssignedTeamLeaderNames(userNames);
        } else {
          const previousBlockObject = {
            limit: 0,
            offset: 0,
            filters: {
              status: ["active"],
              name: blockName,
            },
          };

          const previousResponse = await getCenterList(previousBlockObject);
          const previousCohortDetails =
            previousResponse?.result?.results?.cohortDetails;
          const previousBlockId = previousCohortDetails?.find(
            (item: any) => item?.type === "BLOCK"
          )?.cohortId;

          let unSelectedBlockCohortIds: string[] = [];

          unSelectedBlockCohortIds.push(previousBlockId);
          let cohortCode = formattedBlocks
            .filter((item: any) => item.label === checkedCenters[0])
            .map((item: any) => item.value);
          let cohortIds = blocks
            .filter((item: any) => item.value !== cohortCode[0])
            .map((item: any) => item.cohortId);
          cohortIds.push(previousBlockId);
          payload = {
            userId: [userId],
            cohortId: [selectedBlockCohortId],
            removeCohortId: cohortIds,
          };

          await bulkCreateCohortMembers(payload);
          handleClose();

          const userDetails = await getUserDetailsInfo(userId);
          const blockField = userDetails?.userData?.customFields.find(
            (field: any) => field.label === "BLOCKS"
          );
          const selectedCenterCode = filteredCBlocks.find(
            (location) => location.label === checkedCenters[0]
          )?.value;
          let customFields = [
            {
              fieldId: blockField.fieldId,
              value: cohortCode,
            },
          ];
          console.log(selectedBlockCode, checkedCenters[0]);
          if (selectedDistrict[0] !== districtName) {
            customFields = [
              {
                fieldId: blockField.fieldId,
                value: selectedCenterCode,
              },
              {
                fieldId: districtFieldId,
                value: selectedDistrictCode,
              },
            ];
          }
          const updateObject = {
            userData: {},
            customFields: customFields,
          };
          if (userId) {
            await updateUser(userId, updateObject);
          }

          showToastMessage(t("COMMON.BLOCKS_REASSIGN_SUCCESSFULLY"), "success");
          reassignButtonStatus
            ? setReassignButtonStatus(false)
            : setReassignButtonStatus(true);
            getNotification(selectedTLUserID, "TL_BLOCK_REASSIGNMENT");
        }
      }
    } catch (error) {
      console.log(error);
      showToastMessage(
        t(
          userType === Role.TEAM_LEADERS
            ? "COMMON.BLOCKS_REASSIGN_FAILED"
            : "COMMON.CENTERS_REASSIGN_FAILED"
        ),
        "error"
      );
    }

    // getNotification(userId, "TL_BLOCK_REASSIGNMENT");
  };
  let filteredCohorts = cohorts?.filter((cohort) =>
    cohort?.name?.toLowerCase().includes(searchInput)
  );

  const formattedCohorts = filteredCohorts?.map((location) => ({
    ...location,
    name: location.name
      ? location.name
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      : "",
  }));

  // const filteredCBlocks = blocks?.filter((cohort: any) =>
  //   cohort.label.toLowerCase().includes(searchInput)
  // );
  let filteredCBlocks = blocks
    ?.filter((cohort: any) => cohort.label.toLowerCase().includes(searchInput))
    .map((cohort: any) => ({
      label: cohort.label,
      value: cohort.value,
    }));

const formattedBlocks = filteredCBlocks?.map(location => ({
  ...location,
  label: location.label
    ? location.label.split(' ')
        .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : ''
}));
console.log(filteredCBlocks)
console.log(formattedBlocks)

  const handleToggle2 = (centerName: string) => {
    // If the selected center is already checked, uncheck it
    if (checkedCenters.includes(centerName)) {
      setCheckedCenters([]);
    } else {
      // Otherwise, clear any previous selection and check the new one
      setCheckedCenters([centerName]);
    }
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedConfirmation(event.target.checked);
  };

  const wrappedHandleReassignAction = async () => {
    try {
      console.log(selectedTLUserID);
      // await handleDeleteAction();
      const previousBlockObject = {
        limit: 0,
        offset: 0,
        filters: {
          status: ["active"],
          name: blockName,
        },
      };

      const previousResponse = await getCenterList(previousBlockObject);
      const previousCohortDetails =
        previousResponse?.result?.results?.cohortDetails;
      const previousBlockId = previousCohortDetails?.find(
        (item: any) => item?.type === "BLOCK"
      )?.cohortId;

      let unSelectedBlockCohortIds: string[] = [];

      console.log(previousBlockId);
      unSelectedBlockCohortIds.push(previousBlockId);
      let cohortCode = formattedBlocks
        .filter((item: any) => item.label === selectedBlockForTL)
        .map((item: any) => item.value);
      let cohortIds = blocks
        .filter((item: any) => item.value !== cohortCode)
        .map((item: any) => item.cohortId);
      cohortIds.push(previousBlockId);
      const payload = {
        userId: [selectedTLUserID],
        cohortId: [selectedBlockCohortIdForTL],
        removeCohortId: cohortIds,
      };

      await bulkCreateCohortMembers(payload);
      handleClose();

      const userDetails = await getUserDetailsInfo(selectedTLUserID);
      const blockField = userDetails?.userData?.customFields.find(
        (field: any) => field.label === "BLOCKS"
      );
      const selectedCenterCode = filteredCBlocks.find(
        (location) => location.label === selectedBlockForTL
      )?.value;
      let customFields = [
        {
          fieldId: blockField.fieldId,
          value: selectedCenterCode,
        },
      ];
      if ( selectedDistrict[0] !== districtName) {
        if(userType === Role.TEAM_LEADERS){

          getNotification(selectedTLUserID, "TL_DISTRICT_UPDATE");
        }
        customFields = [
          {
            fieldId: blockField.fieldId,
            value: cohortCode,
          },
          {
            fieldId: districtFieldId,
            value: selectedDistrictCode,
          },
          
        ];
      } 
      else {
             getNotification(selectedTLUserID, "TL_BLOCK_REASSIGNMENT");
          }
      const updateObject = {
        userData: {},
        customFields: customFields,
      };
      if (selectedTLUserID) {
        await updateUser(selectedTLUserID, updateObject);
      }

      showToastMessage(t("COMMON.BLOCKS_REASSIGN_SUCCESSFULLY"), "success");
      reassignButtonStatus
        ? setReassignButtonStatus(false)
        : setReassignButtonStatus(true);
    } catch (error) {
      console.log(error);
      showToastMessage(t("COMMON.SOMETHING_WENT_WRONG"), "error");
    } finally {
      handleCloseConfirmation();
    }
  };
  const handleCancelAction = async () => {
    // await handleDeleteAction();
    handleCloseConfirmation();
  };
  const handleCloseConfirmation = () => {
    // await handleDeleteAction();
    // handleCloseConfirmation();
    setReassignAlertModal(false);
    setCheckedConfirmation(false);
    setConfirmButtonDisable(true);
  };

  useEffect(() => {
    if (checkedConfirmation) {
      setConfirmButtonDisable(false);
    } else {
      setConfirmButtonDisable(true);
    }
  }, [checkedConfirmation]);

  return (
    <>
      <CustomModal
        width="65%"
        open={open}
        handleClose={handleClose}
        title={
          userType === Role.TEAM_LEADERS
            ? t("COMMON.REASSIGN_BLOCKS")
            : t("COMMON.REASSIGN_CENTERS")
        }
        primaryBtnText={t("Reassign")}
        primaryBtnClick={handleReassign}
        primaryBtnDisabled={checkedCenters.length === 0}
      >
        <AreaSelection
          states={transformArray(states)}
          districts={transformArray(districts)}
          blocks={transformArray(blocks)}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          selectedBlock={selectedBlock}
          handleStateChangeWrapper={handleStateChangeWrapper}
          handleDistrictChangeWrapper={handleDistrictChangeWrapper}
          handleBlockChangeWrapper={handleBlockChangeWrapper}
          isMobile={true}
          isMediumScreen={isMediumScreen}
          isCenterSelection={false}
          allCenters={allCenters}
          selectedCenter={selectedCenter}
          handleCenterChangeWrapper={handleCenterChangeWrapper}
          inModal={true}
          stateDefaultValue={stateDefaultValue}
          reAssignModal={true}
          userType={userType}
          //  selectedState={selectedState}

          districtDefaultValue={districtName}
          blockDefaultValue={
            userType === Role.TEAM_LEADERS ? undefined : blockName
          }
        />
        {selectedBlock.length === 0 && userType !== Role.TEAM_LEADERS ? (
          <>
            <Typography sx={{ mt: "20px" }}>
              {t("COMMON.PLEASE_SELECT_BLOCK_LIST")}
            </Typography>
          </>
        ) : (
          <>
            {" "}
            <Box sx={{ p: 1 }}>
              <TextField
                sx={{
                  backgroundColor: theme.palette.warning["A700"],
                  borderRadius: 8,
                  "& .MuiOutlinedInput-root fieldset": { border: "none" },
                  "& .MuiOutlinedInput-input": { borderRadius: 8 },
                }}
                placeholder={
                  userType === Role.TEAM_LEADERS
                    ? t("MASTER.SEARCHBAR_PLACEHOLDER_BLOCK")
                    : t("CENTERS.SEARCHBAR_PLACEHOLDER")
                }
                value={searchInput}
                onChange={handleSearchInputChange}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ p: 3, maxHeight: "300px", overflowY: "auto" }}>
              {userType !== Role.TEAM_LEADERS ? (
                formattedCohorts && formattedCohorts.length > 0 ? (
                  formattedCohorts.map((center) => (
                    <Box key={center.id}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <span style={{ color: "black" }}>{center.name}</span>
                        <Checkbox
                          checked={
                            center?.name
                              ? checkedCenters.includes(center.name)
                              : false
                          }
                          onChange={() =>
                            center?.name && handleToggle(center.name)
                          }
                          sx={{
                            color: theme.palette.text.primary,
                            "&.Mui-checked": {
                              color: "black",
                            },
                            verticalAlign: "middle",
                            marginTop: "-10px",
                          }}
                        />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: "center", color: "gray" }}>
                    {" "}
                    {t("COMMON.NO_CENTER_AVAILABLE")}
                  </Box>
                )
              ) : formattedBlocks && formattedBlocks.length > 0 ? (
                formattedBlocks.map((center: any) => (
                  <Box key={center.value}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <span style={{ color: "black" }}>{center.label}</span>
                      <Checkbox
                        checked={checkedCenters.includes(center.label)}
                        onChange={() => handleToggle2(center.label)}
                        sx={{
                          color: theme.palette.text.primary,
                          "&.Mui-checked": {
                            color: "black",
                          },
                          verticalAlign: "middle",
                          marginTop: "-10px",
                        }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: "center", color: "gray" }}>
                  {t("COMMON.NO_BLOCK_AVAILABLE")}
                </Box>
              )}
            </Box>
          </>
        )}
      </CustomModal>
      {
        <CustomModal
          width="30%"
          open={reassignAlertModal}
          handleClose={handleCloseConfirmation}
          primaryBtnText={t("COMMON.REASSIGN")}
          primaryBtnClick={wrappedHandleReassignAction}
          primaryBtnDisabled={confirmButtonDisable}
          secondaryBtnText={t("COMMON.CANCEL")}
          secondaryBtnClick={handleCancelAction}
        >
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              width: "fit-content",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="body1"
              sx={{ marginBottom: "12px", fontWeight: "bold", color: "#333" }}
            >
              {assignedTeamLeaderNames.length > 1 ? (
                <>
                  {t("COMMON.MULTIPLE_TEAM_LEADERS_ASSIGNED", {
                    selectedBlockForTL: selectedBlockForTL,
                    assignedTeamLeader: assignedTeamLeader,
                  })}
                </>
              ) : (
                <>
                  {t("COMMON.SINGLE_TEAM_LEADERS_ASSIGNED", {
                    selectedBlockForTL: selectedBlockForTL,
                    assignedTeamLeader: assignedTeamLeader,
                  })}
                </>
              )}
            </Typography>
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "8px",
                marginBottom: "16px",
                backgroundColor: "#fff",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {assignedTeamLeaderNames.length > 1 ? (
                <>
                  {t("COMMON.ASSIGNED_TEAM_LEADERS", {
                    assignedTeamLeaderNames: assignedTeamLeaderNames[0],
                  })}
                </>
              ) : (
                <>{assignedTeamLeaderNames[0]}</>
              )}
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checkedConfirmation}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={t("COMMON.CONTINUE_ASSIGNED_TEAM_LEADER", {
                selectedBlockForTL: selectedBlockForTL,
              })}
              sx={{ marginTop: "12px", color: "#555" }}
            />
          </Box>
        </CustomModal>
      }
    </>
  );
};

export default ReassignCenterModal;
