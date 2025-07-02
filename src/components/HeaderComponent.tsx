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
import { Role, Status } from "@/utils/app.constant";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  getCenterList,
  getStateBlockDistrictList,
} from "../services/MasterDataService";
import AreaSelection from "./AreaSelection";
import { transformArray } from "../utils/Helper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { getSchoolNames } from "../services/CohortService/cohortService";

interface School {
  code: string;
  label: string;
  clusterName: string
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
const Filter = ["Active", "InActive"];

const HeaderComponent = ({
  title,
  children,
  searchPlaceHolder,
  selectedSchool,
  selectedSort,
  selectedFilter,
  handleSchoolChange,
  handleDistrictChange,
  handleBlockChange,
  handleSortChange,
  handleFilterChange,
  showSort = true,
  showAddNew = true,
  showFilter = true,
  handleSearch,
  handleAddUserClick,
  selectedCenter,
  handleCenterChange,
  statusValue,
  setStatusValue,
  showSchoolFilter
}: any) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:986px)");
  const [schools, setSchools] = useState<any>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stateDefaultValue, setStateDefaultValue] = useState<string>("");
  const [allCenters, setAllCenters] = useState<CenterProp[]>([]);

  const [blocks, setBlocks] = useState<Block[]>([]);

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
      const object = {
        controllingfieldfk: selectedCodes[0],

        fieldName: "districts",
      };
      console.log(object);
      const response = await getStateBlockDistrictList(object);
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
      const object = {
        controllingfieldfk: selectedCodes[0],

        fieldName: "blocks",
      };
      const response = await getStateBlockDistrictList(object);
      const result = response?.result?.values;
      setBlocks(result);
    } catch (error) {
      console.log(error);
    }
    handleDistrictChange(selected, selectedCodes);
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
    const response = await getCenterList(getCentersObject);
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
  };
  const handleCenterChangeWrapper = (
    selected: string[],
    selectedCodes: string[]
  ) => {
    handleCenterChange(selected, selectedCodes);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsData = await getSchoolNames();
        // const schoolsArray: any = Object.entries(schoolsData).map(([key, value]: [string, any]) => ({
        //   code: key,
        //   label: value.name
        // }));
        setSchools(schoolsData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);
  const handleChange = (event: React.SyntheticEvent, newValue: any) => {
    console.log(newValue);
    setStatusValue(newValue);
  };

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
        <Typography variant="h1" sx={{ mt: isMobile ? "12px" : "20px" }}>
          {title}
        </Typography>
    
        <Box
            sx={{
            backgroundColor: "white",
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
                        {Status.ACTIVE_LABEL}
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
                        {Status.INACTIVE}
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
            {showAddNew && (
                <Box
                display={"flex"}
                gap={1}
                alignItems={"center"}
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    // height: "40px",
                    width: isMobile ? "70%" : "200px",
                    borderRadius: "20px",
                    border: "1px solid #1E1B16",
                    //  mt: isMobile ? "10px" : "16px",
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                    mr: "10px",
                    ml: isMobile ? "50px" : isMediumScreen ? "10px" : undefined,
                    mt: isMobile ? "10px" : isMediumScreen ? "10px" : undefined,
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
                flexDirection: "row", // Ensure row direction
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
                  {showSchoolFilter && (
                    <FormControl sx={{ minWidth: "120px" }}>
                      <Select
                        name="selectedSchool"             
                        value={selectedSchool ?? ""}
                        onChange={handleSchoolChange}
                        displayEmpty
                        style={{
                            borderRadius: "8px",
                            height: "40px",
                            marginLeft: "5px",
                            fontSize: "14px",
                            backgroundColor: theme.palette.secondary["100"],
                        }}
                        >
                        <MenuItem value="">{t("MASTER.SCHOOL")}</MenuItem>
                        {Object.entries(schools).map(([code, school]: [string, any]) => (
                          <MenuItem value={code} key={code}>
                            {school.name} ({school.clusterName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
            </Box>
            {/* )} */}
        </Box>
    </Box>
  );
};

export default HeaderComponent;