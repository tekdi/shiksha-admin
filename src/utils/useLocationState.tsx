import { formatedBlocks, formatedDistricts } from "@/services/formatedCohorts";
import { cohortMemberList } from "@/services/UserList";
import { firstLetterInUpperCase } from "@/utils/Helper";
import { useMediaQuery } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import {
  getCenterList,
  getStateBlockDistrictList,
} from "../services/MasterDataService"; // Update the import path as needed
import { FormContextType, QueryKeys, Role, Status } from "./app.constant";
type FilterDetails = {
  role: any;
  status?: any;
  districts?: any;
  states?: any;
  blocks?: any;
  name?: any;
  cohortId?: any
};
interface FieldProp {
  value: string;
  label: string;
}
interface CenterProp {
  cohortId: string;
  name: string;
}
export const useLocationState = (
  open: boolean,
  onClose: () => void,
  userType?: any,
  reAssignModal?: boolean
) => {

  const [states, setStates] = useState<FieldProp[]>([]);
  const [districts, setDistricts] = useState<FieldProp[]>([]);
  const [blocks, setBlocks] = useState<FieldProp[]>([]);
  const [allCenters, setAllCenters] = useState<CenterProp[]>([]);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:986px)");
  const [selectedState, setSelectedState] = useState<string[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string[]>([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string[]>([]);
  const [dynamicForm, setDynamicForm] = useState<any>(true);
  const [dynamicFormForBlock, setdynamicFormForBlock] = useState<any>(true);

  const [selectedBlock, setSelectedBlock] = useState<string[]>([]);
  const [selectedBlockCode, setSelectedBlockCode] = useState("");
  const [selectedCenterCode, setSelectedCenterCode] = useState("");
  const [selectedBlockCohortId, setSelectedBlockCohortId] = useState("");
  const [selectedStateCohortId, setSelectedStateCohortId] = useState("");

  const [blockFieldId, setBlockFieldId] = useState("");
  const [stateFieldId, setStateFieldId] = useState("");
  const [districtFieldId, setDistrictFieldId] = useState("");
  const [stateDefaultValue, setStateDefaultValue] = useState<string>("");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [assignedTeamLeader, setAssignedTeamLeader] = useState("");
  const [assignedTeamLeaderNames, setAssignedTeamLeaderNames] = useState([]);

  const handleStateChangeWrapper = useCallback(
    async (selectedNames: string[], selectedCodes: string[]) => {
      try {
        setDistricts([]);
        setBlocks([]);
        setAllCenters([]);
        setSelectedStateCode(selectedCodes[0]);
        setSelectedBlockCohortId("");

        // const object = {
        //   controllingfieldfk: selectedCodes[0],
        //   fieldName: "districts",
        // };
        // const response = await getStateBlockDistrictList(object);
        const response = await queryClient.fetchQuery({
          queryKey: [
            QueryKeys.FIELD_OPTION_READ,
            selectedCodes[0],
            "districts",
          ],
          queryFn: () =>
            getStateBlockDistrictList({
              controllingfieldfk: selectedCodes[0],
              fieldName: "districts",
            }),
        });

        setDistrictFieldId(response?.result?.fieldId);
        const result = response?.result?.values;
        setDistricts(result);
      } catch (error) {
        console.log(error);
      }
      handleStateChange(selectedNames, selectedCodes);
    },
    [selectedStateCode]
  );

  const handleDistrictChangeWrapper = useCallback(
    async (selected: string[], selectedCodes: string[]) => {
      if (selected[0] === "") {
        handleBlockChange([], []);
      }
      try {

        //  if(!reAssignModal)
        //  {
        setBlocks([]);
        setAllCenters([]);


        setSelectedDistrictCode(selectedCodes[0]);
        setSelectedBlockCohortId("");
        const object = {
          controllingfieldfk: selectedCodes[0],
          fieldName: "blocks",
        };
        const response = await getStateBlockDistrictList(object);
        setBlockFieldId(response?.result?.fieldId);

        const result = response?.result?.values;
        const blockResult = await formatedBlocks(selectedCodes[0])
        setBlocks(blockResult);
        //setBlocks(result);
      } catch (error) {
        console.log(error);
      }
      handleDistrictChange(selected, selectedCodes);
    },
    [selectedDistrictCode]
  );

  const handleBlockChangeWrapper = useCallback(
    async (selected: string[], selectedCodes: string[]) => {
      if (selected[0] === "") {
        handleCenterChange([], []);
      }
      try {
        setAllCenters([]);

        if (
          userType === FormContextType.TEAM_LEADER ||
          userType === FormContextType.ADMIN_CENTER
        ) {
          const object = {
            limit: 0,
            offset: 0,
            filters: {
              // "type": "COHORT",
              status: ["active"],
              // "states": selectedStateCode,
              // "districts": selectedDistrictCode,
              // "blocks": selectedCodes[0]
              name: selected[0],
            },
          };
          const response = await getCenterList(object);
          const getCohortDetails = response?.result?.results?.cohortDetails;

          const blockId = getCohortDetails?.map((item: any) => {
            if (item?.type === "BLOCK") {
              return item?.cohortId;
            }
          })
          const blockCohortId = getCohortDetails?.find(
            (item: any) => item?.type === "BLOCK"
          )?.cohortId;

          if (blockCohortId) {
            setSelectedBlockCohortId(blockCohortId);
          } else {
            console.log("No Block Id found");
          }


          const filters: FilterDetails =
          {
            cohortId: blockCohortId,
            role: Role.TEAM_LEADER,
            status: [Status.ACTIVE]
          }

          const sort = ["name", "asc"]
          let resp;
          try {
            resp = await cohortMemberList({ filters, sort });
          } catch (apiError) {
            console.log("API call failed, proceeding to else block");
            resp = null;
          }
          if (resp?.userDetails) {

            // onClose();
            // setcreateTLAlertModal(true)
            setAssignedTeamLeader(resp?.userDetails?.length)
            //   setSelectedBlockForTL(selectedBlock[0])
            const userNames = resp?.userDetails?.map((user: any) => firstLetterInUpperCase(user.name));
            //setSelectedTLUserID(userId)
            setAssignedTeamLeaderNames(userNames)
          }
          else {
            setAssignedTeamLeader("");
            setAssignedTeamLeaderNames([])
          }

        } else {
          const getCentersObject = {
            limit: 0,
            offset: 0,
            filters: {
              // "type":"COHORT",
              status: ["active"],
              states: selectedStateCode,
              districts: selectedDistrictCode,
              blocks: selectedCodes[0],
              // "name": selected[0]
            },
          };
          const response = await getCenterList(getCentersObject);

          // setSelectedBlockCohortId(
          //   response?.result?.results?.cohortDetails[0].cohortId
          // );
          const blockCohortId = response?.result?.results?.cohortDetails?.find(
            (item: any) => item?.type === "BLOCK"
          )?.cohortId;

          setSelectedBlockCohortId(blockCohortId)
          //   const result = response?.result?.cohortDetails;
          const dataArray = response?.result?.results?.cohortDetails;

          const cohortInfo = dataArray
            ?.filter((cohort: any) => cohort.type !== "BLOCK")
            .map((item: any) => ({
              cohortId: item?.cohortId,
              name: item?.name,
            }));
          setAllCenters(cohortInfo);
        }

      } catch (error) {
        setAllCenters([]);

        console.log(error);
      }
      handleBlockChange(selected, selectedCodes);
    },
    [selectedBlockCode, selectedDistrictCode, selectedStateCode]
  );

  const handleCenterChangeWrapper = useCallback(
    (selected: string[], selectedCodes: string[]) => {
      handleCenterChange(selected, selectedCodes);
    },
    []
  );

  const handleStateChange = useCallback(
    (selected: string[], code: string[]) => {
      setSelectedDistrict([]);
      setSelectedBlock([]);
      setSelectedCenter([]);
      setSelectedState(selected);
      const stateCodes = code?.join(",");
      setSelectedStateCode(stateCodes);
    },
    []
  );

  const handleDistrictChange = useCallback(
    (selected: string[], code: string[]) => {
      setSelectedBlock([]);
      setSelectedCenter([]);
      setSelectedDistrict(selected);
      const districts = code?.join(",");
      setSelectedDistrictCode(districts);
    },
    []
  );

  const handleBlockChange = useCallback(
    (selected: string[], code: string[]) => {
      setSelectedCenter([]);
      setSelectedBlock(selected);
      const blocks = code?.join(",");
      setSelectedBlockCode(blocks);
      setdynamicFormForBlock(true);
    },
    []
  );

  const handleCenterChange = useCallback(
    (selected: string[], code: string[]) => {
      // handle center change logic
      setSelectedCenter(selected);
      const centers = code?.join(",");
      setSelectedCenterCode(centers);
      setDynamicForm(true);

    },
    []
  );

  useEffect(() => {
    if (!open) {
      setSelectedBlock([]);
      if (!reAssignModal)
        setSelectedDistrict([]);
      setSelectedState([]);
      setSelectedCenter([]);
      setDynamicForm(false);
      setdynamicFormForBlock(false);
    }
    else {
      setDynamicForm(true);
      setdynamicFormForBlock(true);
    }
  }, [onClose, open]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (open) {
          const response = await queryClient.fetchQuery({
            queryKey: [
              QueryKeys.FIELD_OPTION_READ,
              "states",
            ],
            queryFn: () =>
              getStateBlockDistrictList({
                fieldName: "states",
              }),
          });
          // const object = {
          //   fieldName: "states",
          // };
          // const response = await getStateBlockDistrictList(object);
          setStateFieldId(response?.result?.fieldId);

          if (typeof window !== "undefined" && window.localStorage) {
            const admin = localStorage.getItem("adminInfo");
            if (admin) {
              const stateField = JSON.parse(admin).customFields.find(
                (field: any) => field.label === "STATES"
              );


              if (!stateField.value.includes(",")) {

                const response2 = await queryClient.fetchQuery({
                  queryKey: [
                    QueryKeys.FIELD_OPTION_READ,
                    stateField.code,
                    "districts",
                  ],
                  queryFn: () =>
                    getStateBlockDistrictList({
                      controllingfieldfk: stateField.code,
                      fieldName: "districts",
                    }),
                });


                // const object2 = {
                //   controllingfieldfk: stateField.code,
                //   fieldName: "districts",
                // };
                // const response2 = await getStateBlockDistrictList(object2);
                setDistrictFieldId(response2?.result?.fieldId);
                //setStateDefaultValue(t("COMMON.ALL_STATES"))

                setStateDefaultValue(stateField.value);
                localStorage.setItem('userStateName', stateField?.value)

                setSelectedState([stateField.value]);
                const StateObject = {
                  limit: 0,
                  offset: 0,
                  filters: {
                    status: ["active"],

                    name: stateField.value,
                  },
                };
                setSelectedStateCode(stateField.code)

                const stateResponse = await getCenterList(StateObject);
                const getCohortDetails = stateResponse?.result?.results?.cohortDetails;
                const stateId = getCohortDetails?.map((item: any) => {
                  if (item?.type === "STATE") {
                    return item?.cohortId;
                  }
                })
                setSelectedStateCohortId(stateId)

                const object = {
                  controllingfieldfk: stateField.code,

                  fieldName: "districts",
                };
                const response = await getStateBlockDistrictList(object);
                const result = response?.result?.values;
                const districtResult = await formatedDistricts();

                setDistricts(districtResult);
                if (reAssignModal) {
                  const data = getStoredData();
                  setSelectedBlock([data.blocks]);
                  setSelectedDistrict([data.districtValue]);
                  setSelectedDistrictCode(data.districtCode);
                  setSelectedBlockCode(data.blockCode);
                  // if(selectedDistrict.length!==0)
                  {
                    // setSelectedDistrictCode(selectedCodes[0]);
                    // setSelectedBlockCohortId("");
                    const object = {
                      controllingfieldfk: data.districtCode,
                      fieldName: "blocks",
                    };
                    const response = await getStateBlockDistrictList(object);
                    setBlockFieldId(response?.result?.fieldId);
                    const result = response?.result?.values;
                    const blockResult = await formatedBlocks(data.districtCode)
                    setBlocks(blockResult);
                    const getCentersObject = {
                      limit: 0,
                      offset: 0,
                      filters: {
                        // "type":"COHORT",
                        status: ["active"],
                        states: stateField.code,
                        districts: data.districtCode,
                        blocks: data.blockCode
                        // "name": selected[0]
                      },
                    };
                    const centerResponse = await getCenterList(getCentersObject);

                    //   const result = response?.result?.cohortDetails;
                    const dataArray = centerResponse?.result?.results?.cohortDetails;

                    const cohortInfo = dataArray
                      ?.filter((cohort: any) => cohort.type !== "BLOCK")
                      .map((item: any) => ({
                        cohortId: item?.cohortId,
                        name: item?.name,
                      }));
                    setAllCenters(cohortInfo);
                  }
                }
                else {
                  setSelectedDistrict([districtResult[0]?.label]);
                  setSelectedDistrictCode(districtResult[0]?.value);
                  const blockResult = await formatedBlocks(
                    districtResult[0]?.value
                  );
                  if (blockResult?.message === "Request failed with status code 404") {
                    setBlocks([]);
                  }
                  else {
                    setBlocks(blockResult);
                    if (blockResult?.message === "Request failed with status code 404") {
                      setBlocks([]);
                    }
                    else {
                      setSelectedBlock([blockResult[0]?.label]);
                      setSelectedBlockCode(blockResult[0]?.value);
                      const fieldObject = {
                        controllingfieldfk: districtResult[0]?.value,
                        fieldName: "blocks",
                      };
                      const fieldResponse = await getStateBlockDistrictList(fieldObject);
                      setBlockFieldId(fieldResponse?.result?.fieldId);
                      const object = {
                        limit: 0,
                        offset: 0,
                        filters: {
                          // "type": "COHORT",
                          status: ["active"],
                          // "states": selectedStateCode,
                          // "districts": selectedDistrictCode,
                          // "blocks": selectedCodes[0]
                          name: blockResult[0]?.label,
                        },
                      };
                      const response = await getCenterList(object);
                      const getCohortDetails = response?.result?.results?.cohortDetails;
                      const blockId = getCohortDetails?.map((item: any) => {
                        if (item?.type === "BLOCK") {
                          return item?.cohortId;
                        }
                      })
                      const blockCohortId = getCohortDetails?.find(
                        (item: any) => item?.type === "BLOCK"
                      )?.cohortId;
                      if (blockCohortId) {
                        setSelectedBlockCohortId(blockCohortId);
                      } else {
                        console.log("No Block Id found");
                      }

                      const getCentersObject = {
                        limit: 0,
                        offset: 0,
                        filters: {
                          // "type":"COHORT",
                          status: ["active"],
                          states: stateField.code,
                          districts: districtResult[0]?.value,
                          blocks: blockResult[0]?.value,
                          // "name": selected[0]
                        },
                      };
                      const centerResponse = await queryClient.fetchQuery({
                        queryKey: [
                          QueryKeys.FIELD_OPTION_READ,
                          getCentersObject.limit,
                          getCentersObject.offset,
                          getCentersObject.filters,
                        ],
                        queryFn: () => getCenterList(getCentersObject),
                      });
                      // const response = await getCenterList(getCentersObject); 
                      // setSelectedBlockCohortId(
                      //   response?.result?.results?.cohortDetails[0].cohortId
                      // );
                      //   const result = response?.result?.cohortDetails;
                      const dataArray = centerResponse?.result?.results?.cohortDetails;

                      const cohortInfo = dataArray
                        ?.filter((cohort: any) => cohort.type !== "BLOCK")
                        .map((item: any) => ({
                          cohortId: item?.cohortId,
                          name: item?.name,
                        }));
                      setAllCenters(cohortInfo);
                      setSelectedCenter([cohortInfo[0]?.name]);
                      setSelectedCenterCode(cohortInfo[0]?.cohortId);



                    }

                  }
                }

              }
              else {
                setStateDefaultValue(t("COMMON.ALL_STATES"))

              }
              const object2 = [{
                value: stateField.code,
                label: stateField.value
              }]
              setStates(object2);

            }
            //  setAdminInfo(JSON.parse(admin))
          }
          // const result = response?.result?.values;

          // setStates(result);

        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [open]);
  const getStoredData = () => {
    const storedData = localStorage.getItem('reassignuserInfo');
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error('Failed to parse localStorage data:', error);
        return {}; // Return default if parsing fails
      }
    }
    return {}; // Return default if no data is found
  };
  return {
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
    dynamicFormForBlock,
    blockFieldId,
    districtFieldId,
    stateFieldId,
    handleStateChangeWrapper,
    handleDistrictChangeWrapper,
    handleBlockChangeWrapper,
    handleCenterChangeWrapper,
    selectedCenterCode,
    selectedBlockCohortId,
    stateDefaultValue,
    setSelectedBlock,
    setSelectedDistrict,
    setSelectedDistrictCode,
    setSelectedBlockCode,
    assignedTeamLeaderNames,
    assignedTeamLeader,
    selectedStateCohortId

  };
};
