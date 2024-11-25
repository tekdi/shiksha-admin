import SearchBar from "@/components/layouts/header/SearchBar";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Typography,
  useMediaQuery,
  Divider,
} from "@mui/material";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { QueryKeys, Role, Status, TelemetryEventType } from "@/utils/app.constant";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  getCenterList,
  getStateBlockDistrictList,
} from "../services/MasterDataService";
import AreaSelection from "./AreaSelection";
import { transformArray } from "../utils/Helper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useQueryClient } from "@tanstack/react-query";
import { formatedBlocks, formatedDistricts } from "@/services/formatedCohorts";
import { useRouter } from "next/router";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { userAgent } from "next/server";
import { telemetryFactory } from "@/utils/telemetry";

interface State {
  value: string;
  label: string;
}

interface District {
  value: string;
  label: string;
}

interface Block {
  value: string;
  label: string;
}
interface CenterProp {
  cohortId: string;
  name: string;
}
const Sort = ["A-Z", "Z-A"];

const HeaderComponent = ({
  children,
  userType,
  searchPlaceHolder,
  selectedState,
  selectedStateCode,
  selectedDistrictCode,
  selectedBlockCode,
  selectedDistrict,
  selectedBlock,
  selectedSort,
  selectedFilter,
  handleStateChange,
  handleDistrictChange,
  handleBlockChange,
  handleSortChange,
  handleFilterChange,
  showSort = true,
  showAddNew = true,
  showStateDropdown = true,
  showFilter = true,
  handleSearch,
  handleAddUserClick,
  selectedCenter,
  handleCenterChange,
  statusValue,
  shouldFetchDistricts = true,
  setStatusValue,
  setSelectedDistrictCode,
  setSelectedDistrict,
  setSelectedBlockCode,
  setSelectedBlock,
  setSelectedCenter,
  selectedCenterCode,
  setSelectedCenterCode,
  setSelectedStateCode,
}: any) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  const theme = useTheme<any>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:986px)");
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stateDefaultValue, setStateDefaultValue] = useState<string>("");
  const [allCenters, setAllCenters] = useState<CenterProp[]>([]);
  const [initialDistrict, setInitialDistrict] = useState<any>("");
  const [initialBlock, setInitialBlock] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const isArchived = useSubmittedButtonStore(
    (state: any) => state.isArchived
);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const selectedBlockStore = useSubmittedButtonStore(
    (state: any) => state.selectedBlockStore
  );
  const setSelectedBlockStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedBlockStore
  );
  const selectedDistrictStore = useSubmittedButtonStore(
    (state: any) => state.selectedDistrictStore
  );
  const setSelectedDistrictStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedDistrictStore
  );
  const selectedCenterStore = useSubmittedButtonStore(
    (state: any) => state.selectedCenterStore
  );
  const setSelectedCenterStore = useSubmittedButtonStore(
    (state: any) => state.setSelectedCenterStore
  );
  const handleStateChangeWrapper = async (
    selectedNames: string[],
    selectedCodes: string[]
  ) => {
    if (selectedNames[0] === "") {
      // if(districts.length!==0)
      // {
      //   handleDistrictChange([], []);
      //   handleBlockChange([], []);
      // }
    }
    try {
      const response = await queryClient.fetchQuery({
        queryKey: [QueryKeys.FIELD_OPTION_READ, selectedCodes[0], "districts"],
        queryFn: () =>
          getStateBlockDistrictList({
            controllingfieldfk: selectedCodes[0],
            fieldName: "districts",
          }),
      });

      // const object = {
      //   controllingfieldfk: selectedCodes[0],

      //   fieldName: "districts",
      // };
      // console.log(object);
      // const response = await getStateBlockDistrictList(object);
      const result = response?.result?.values;

      setDistricts(result);
    } catch (error) {
      console.log(error);
    }
    handleStateChange(selectedNames, selectedCodes);
  };

  const handleDistrictChangeWrapper = async (
    selected: string[],
    selectedCodes: string[]
  ) => {
    setBlocks([]);
    if (selected[0] === "") {
      handleBlockChange([], []);
    }
    try {
      const response = await queryClient.fetchQuery({
        queryKey: [QueryKeys.FIELD_OPTION_READ, selectedCodes[0], "blocks"],
        queryFn: () =>
          getStateBlockDistrictList({
            controllingfieldfk: selectedCodes[0],
            fieldName: "blocks",
          }),
      });

      // const object = {
      //   controllingfieldfk: selectedCodes[0],

      //   fieldName: "blocks",
      // };
      // const response = await getStateBlockDistrictList(object);
      const result = response?.result?.values;
      const blockResult = await formatedBlocks(selectedCodes[0]);

      setBlocks(blockResult);
    } catch (error) {
      console.log(error);
    }
    handleDistrictChange(selected, selectedCodes);

    const windowUrl = window.location.pathname;
            const cleanedUrl = windowUrl.replace(/^\//, '');
            const env = cleanedUrl.split("/")[0];


            const telemetryInteract = {
              context: {
                env: env,
                cdata: [],
              },
              edata: {
                id: 'filter-by-district:'+selected[0],
                type: TelemetryEventType.CLICK,
                subtype: '',
                pageid: cleanedUrl,
              },
            };
            telemetryFactory.interact(telemetryInteract);

  };

  const handleBlockChangeWrapper = async (
    selected: string[],
    selectedCodes: string[]
  ) => {
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
    const response = await queryClient.fetchQuery({
      queryKey: [
        QueryKeys.FIELD_OPTION_READ,
        getCentersObject.limit,
        getCentersObject.offset,
        getCentersObject.filters,
      ],
      queryFn: () => getCenterList(getCentersObject),
    });
    // const response = await getCenterList(getCentersObject);
    console.log(response?.result?.results?.cohortDetails[0].cohortId);
    // setSelectedBlockCohortId(
    //   response?.result?.results?.cohortDetails[0].cohortId
    // );
    //   const result = response?.result?.cohortDetails;
    const dataArray = response?.result?.results?.cohortDetails;

    const cohortInfo = dataArray
      ?.filter((cohort: any) => cohort.type !== "BLOCK")
      .map((item: any) => ({
        cohortId: item?.cohortId,
        name: item?.name,
      }));
    console.log(dataArray);
    setAllCenters(cohortInfo);
    handleBlockChange(selected, selectedCodes);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, '');
    const env = cleanedUrl.split("/")[0];


    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: 'filter-by-block:'+selected[0],
        type: TelemetryEventType.CLICK,
        subtype: '',
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };
  const handleCenterChangeWrapper = (
    selected: string[],
    selectedCodes: string[]
  ) => {
    handleCenterChange(selected, selectedCodes);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, '');
    const env = cleanedUrl.split("/")[0];


    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: 'filter-by-center:'+selected[0],
        type: TelemetryEventType.CLICK,
        subtype: '',
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { state, district, center } = router.query;
      console.log(router.asPath);
      const fullPath = router.asPath;

      // Extract query parameters
      const queryString = fullPath.split("?")[1]; // Get the part after '?'
      console.log(queryString);
      const params = new URLSearchParams(queryString);

      // Check if 'block' is present
      const hasBlock = params.has("block");
      const hasDistrict = params.has("district");
      const hasCenter = params.has("center");
      const hasState = params.has("state");
      try {
        const object = {
          // "limit": 20,
          // "offset": 0,
          fieldName: "states",
        };
        // const response = await getStateBlockDistrictList(object);
        // const result = response?.result?.values;
        if (typeof window !== "undefined" && window.localStorage) {
          const admin = localStorage.getItem("adminInfo");
          if (admin) {
            const stateField = JSON.parse(admin).customFields.find(
              (field: any) => field.label === "STATES"
            );
            console.log(stateField.value, stateField.code);
            if (stateField.value.includes(",")) {
              console.log("The value contains more than one item.");
              setStateDefaultValue(t("COMMON.ALL_STATES"));
            } else {
              setStateDefaultValue(stateField.value);

              const response = await queryClient.fetchQuery({
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

              // const object = {
              //   controllingfieldfk: stateField.code,

              //   fieldName: "districts",
              // };
              // console.log(object);
              // const response = await getStateBlockDistrictList(object);
              const result = response?.result?.values;
              const districtResult = await formatedDistricts();
              let blockResult;
              setDistricts(districtResult);
              if (!hasDistrict) {
                setSelectedDistrict([districtResult[0]?.label]);
                setSelectedDistrictCode(districtResult[0]?.value);
                localStorage.setItem(
                  "selectedDistrict",
                  districtResult[0]?.label
                );
                setSelectedDistrictStore(districtResult[0]?.label);
                 blockResult = await formatedBlocks(
                  districtResult[0]?.value
                );
                console.log(blockResult)
                if(blockResult?.message ==="Request failed with status code 404")
                  {
                    setBlocks([]);
                  }
                  else
                  {
                    setBlocks(blockResult);

                  }
              }
            
              if (!hasBlock && !hasDistrict && userType!==Role.CONTENT_CREATOR) {
                if (userType === Role.TEAM_LEADERS || userType==="Centers") {
                //  setSelectedBlock([t("COMMON.ALL_BLOCKS")]);
                  //setSelectedBlockCode("")
                  router.replace({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      state: stateField.code,
                      district: districtResult[0]?.value,
                    },
                  });
                } else {
                  console.log(blockResult)
                  if(blockResult?.message==="Request failed with status code 404")
                  {
                    setBlocks([]);
                  }
                  else{
                    setSelectedBlock([blockResult[0]?.label]);
                    setSelectedBlockCode(blockResult[0]?.value);
                    localStorage.setItem("selectedBlock", blockResult[0]?.label);
                    setSelectedBlockStore(blockResult[0]?.label);
  
                  }
                 
                  router.replace({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      state: stateField.code,
                      district: districtResult[0]?.value,
                      block: blockResult[0]?.value,
                    },
                  });
                }
              }
              else if(userType===Role.CONTENT_CREATOR)
              {
                router.replace({
                  pathname: router.pathname,
                  query: {
                    ...router.query,
                    state: stateField.code,
                   
                  },
                });
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
              console.log(centerResponse);
              // setSelectedBlockCohortId(
              //   response?.result?.results?.cohortDetails[0].cohortId
              // );
              //   const result = response?.result?.cohortDetails;
              const dataArray = centerResponse?.result?.results?.cohortDetails;
              console.log(dataArray);

              const cohortInfo = dataArray
                ?.filter((cohort: any) => cohort.type !== "BLOCK")
                .map((item: any) => ({
                  cohortId: item?.cohortId,
                  name: item?.name,
                }));
              setAllCenters(cohortInfo);

              console.log(dataArray);
              console.log(userType);
              if (
                !hasCenter &&
                !hasBlock &&
                !hasDistrict &&
                userType !== Role.TEAM_LEADERS && userType !== Role.CONTENT_CREATOR
              ) {
                console.log(hasCenter);
                setSelectedCenter([t("COMMON.ALL_CENTERS")]);
                //  setSelectedCenterCode([cohortInfo[0]?.cohortId])
                //   localStorage.setItem('selectedCenter',cohortInfo[0]?.name )
                //  setSelectedCenterStore(cohortInfo[0]?.name)
                router.replace({
                  pathname: router.pathname,
                  query: {
                    ...router.query,
                    state: stateField.code,
                    district: districtResult[0]?.value,
                    block: blockResult[0]?.value,
                    // center: cohortInfo[0]?.cohortId
                  },
                });
              }

              console.log(cohortInfo);
            }

            const object = [
              {
                value: stateField.code,
                label: stateField.value,
              },
            ];
            setStates(object);
          }
        }
        //  setStates(result);
        console.log(typeof states);
      } catch (error) {
        console.log(error);
      }
    };

    if (shouldFetchDistricts) {
      fetchData();
    }
  }, [shouldFetchDistricts, userType]);
  const handleChange = (event: React.SyntheticEvent, newValue: any) => {
    console.log(newValue);
    setStatusValue(newValue);
  };

  // useEffect(() => {
  //   if (districts && districts.length > 0 && !selectedDistrict.length) {
  //     const firstDistrictCode = districts?.[0].value;
  //     setInitialDistrict(firstDistrictCode);
  //     handleDistrictChangeWrapper([districts?.[0].label], [firstDistrictCode]);
  //   }
  // }, [districts, selectedDistrict, handleDistrictChangeWrapper]);

  // useEffect(() => {
  //   if (blocks && blocks.length > 0 && !selectedBlock.length) {
  //     const firstBlockCode = blocks[0].value;
  //     setInitialBlock(firstBlockCode);
  //     handleBlockChangeWrapper([blocks[0].label], [firstBlockCode]);
  //   }
  // }, [blocks, selectedBlock, handleBlockChangeWrapper]);

  useEffect(() => {
    const handleRouteparam = async() => 
    {
      const { state, district, block, center } = router.query;
      if (state) {
        setSelectedStateCode(state.toString());
      }
       console.log(district?.toString())
      if (district) {
        setSelectedDistrictCode(district.toString());
        // setSelectedDistrict([selectedDistrictStore])
        setSelectedDistrict([localStorage.getItem("selectedDistrict")]);
        if (!localStorage.getItem("selectedDistrict")) {
          setSelectedDistrict([selectedDistrictStore]);
          
        }
        try{
          const  blockResult = await formatedBlocks(
            district?.toString()
              );
              console.log(blockResult.message)
              if(blockResult.message==="Request failed with status code 404")
              {
                setBlocks([]);

              }
              else
            setBlocks(blockResult);
        }
        catch{
        //  console.log("hii")
        }
       
      }
     

      if (block ) {
        setSelectedBlockCode(block.toString());
        console.log(selectedBlockCode);
        // setSelectedBlock([selectedBlockStore])
        setSelectedBlock([localStorage.getItem("selectedBlock")]);
        if (!localStorage.getItem("selectedBlock"))
          setSelectedBlock([selectedBlockStore]);
      }
   

      if (center) {
        console.log(center);

        setSelectedCenterCode([center.toString()]);
        // setSelectedCenter([selectedCenterStore])
        setSelectedCenter([localStorage.getItem("selectedCenter")]);
        if (!localStorage.getItem("selectedCenter"))
          setSelectedCenter([selectedCenterStore]);
      }
   
      //  setInitialized(true)
    }
    handleRouteparam();
  }, [router, userType]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "8px" : "16px",
        padding: isMobile ? "8px" : "16px",
        backgroundColor: theme.palette.secondary["100"],
        borderRadius: "8px",
      }}
    >
      {!showStateDropdown && (
        <Typography variant="h1" sx={{ mt: isMobile ? "12px" : "20px" }}>
          {userType}
        </Typography>
      )}

      {showStateDropdown &&  (
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
          isMobile={isMobile}
          isMediumScreen={isMediumScreen}
          inModal={false}
          isCenterSelection={
            userType === Role.FACILITATORS || userType === Role.LEARNERS
          }
          stateDefaultValue={stateDefaultValue}
          allCenters={allCenters}
          selectedCenter={selectedCenter}
          handleCenterChangeWrapper={handleCenterChangeWrapper}
          userType={userType}
        />
      )}

      <Box
        sx={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0px 2px 6px 2px #00000026",
          paddingBottom: "0px",
          paddingTop: "20px",
        }}
      >
        {showFilter && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={statusValue}
              onChange={handleFilterChange}
              aria-label="Tabs where selection follows focus"
              selectionFollowsFocus
            >
              <Tab
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color:
                        statusValue === Status.ACTIVE
                          ? theme.palette.primary["100"]
                          : "inherit",
                    }}
                  >
                    {t("COMMON.ACTIVE")}
                  </Box>
                }
                value={Status.ACTIVE}
              />
              <Tab
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color:
                        statusValue === Status.ARCHIVED
                          ? theme.palette.primary["100"]
                          : "inherit",
                    }}
                  >
                    {t("COMMON.ARCHIVED")}
                  </Box>
                }
                value={Status.ARCHIVED}
              />
            </Tabs>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile || isMediumScreen ? "column" : "row",
            gap: isMobile || isMediumScreen ? "8px" : "5%",
            marginTop: "20px",
          }}
        >
          <Box sx={{ flex: 1, paddingLeft: "16px", paddingRight: "16px" }}>
            <SearchBar
              onSearch={handleSearch}
              placeholder={searchPlaceHolder}
            />
          </Box>
          {showAddNew  && !isArchived && (
            <Box
              display={"flex"}
              gap={1}
              alignItems={"center"}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // height: "40px",
                width: isMobile ? "93%" : "200px",
                borderRadius: "20px",
                border: "1px solid #1E1B16",
                //  mt: isMobile ? "10px" : "16px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                mr: "10px",
                ml: isMobile ? "50px" : isMediumScreen ? "10px" : undefined,
                mt: isMobile ? "10px" : isMediumScreen ? "10px" : undefined,
                '@media (max-width: 600px)': {
                  mx: "16px",
                }
              }}
            >
              <Button
                //  variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: "none",
                  fontSize: "14px",
                  color: theme.palette.primary["100"],
                }}
                onClick={handleAddUserClick}
              >
                {t("COMMON.ADD_NEW")}
              </Button>
            </Box>
          )}
        </Box>
        {/* {showAddNew && ( */}
          <Box
            sx={{
              display: "flex",

              ml: "10px",
              mt: isMobile ? "10px" : "16px",
              mb: "10px",
              gap: "15px", // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {showSort && (
              <FormControl sx={{ minWidth: "120px" }}>
                <Select
                  value={selectedSort}
                  onChange={handleSortChange}
                  displayEmpty
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                    marginLeft: "5px",
                    fontSize: "14px",
                    backgroundColor: theme.palette.secondary["100"],
                  }}
                >
                  <MenuItem value="Sort">{t("COMMON.SORT")}</MenuItem>
                  {Sort?.map((state, index) => (
                    <MenuItem value={state} key={index}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        {/* )} */}
        {children}
      </Box>
    </Box>
  );
};

export default HeaderComponent;
