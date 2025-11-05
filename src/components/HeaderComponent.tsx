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
  Autocomplete,
  TextField,
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
import { getCohortList } from "../services/CohortService/cohortService";

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
  handleStateChange,
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
  selectedStateCode,
  selectedDistrictCode,
  handleCenterChange,
  statusValue,
  setStatusValue,
  showSchoolFilter,
  showClusterFilter = true,
}: any) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:986px)");
  const [schools, setSchools] = useState<any>([]);
  const [clusters, setClusters] = useState([]);

  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
    

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true);
        const clusterFilters = {
          limit: 0,
          offset: 0,
          filters: { type: "CLUSTER", status: ["active"] },
        };
        const resp = await getCohortList(clusterFilters);
        setClusters(resp?.results?.cohortDetails || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

  // fetch schools whenever selectedCluster changes
  useEffect(() => {
    const fetchSchools = async (parentId: string | null) => {
      try {
        setLoading(true);
        
        const schoolFilters:any = {
          limit: 0,
          offset: 0,
          filters: { type: "SCHOOL", status: ["active"],  },
        };
        if (parentId) {
          schoolFilters.filters["parentId"] = parentId;
        }
        const resp = await getCohortList(schoolFilters);
        setSchools(resp?.results?.cohortDetails || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    const parentId = selectedCluster?.cohortId || selectedCluster?.id || null;
    fetchSchools(parentId);
  }, [selectedCluster]);

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
                    <FormControl sx={{ minWidth: "220px" }}>
                      <Select
                      value={selectedSort}
                      onChange={handleSortChange}
                      displayEmpty
                      size="small"
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
                  {showClusterFilter && (
                    <FormControl sx={{ minWidth: "220px" }}>
                     <Autocomplete
                          options={clusters || []}
                          getOptionLabel={(option: any) =>
                            // cluster objects come from the API and use `name` and `cohortId`
                            // fall back to `label` or empty string to avoid NPEs
                            (option && (option.name || option.label)) || ""
                          }
                          value={selectedCluster}
                          onChange={(
                            _event: React.SyntheticEvent,
                            newValue: any | null
                          ) => {
                            setSelectedCluster(newValue);
                          }}
                          isOptionEqualToValue={(option: any, value: any) =>
                            // compare by unique id when possible
                            (option && value && (option.cohortId || option.id)) ===
                            (value && (value.cohortId || value.id))
                          }
                          renderInput={(params: any) => (
                            <TextField
                              {...params}
                              label={t("MASTER.SEARCHBAR_PLACEHOLDER_CLUSTER") || "Select Cluster"}
                              variant="outlined"
                              size="small"
                            />
                          )}
                          loading={loading}
                          loadingText="Loading clusters..."
                        />
                    </FormControl>
                  )}
                  {showSchoolFilter && (
                    <FormControl sx={{ minWidth: "220px" }}>
                      {/* Autocomplete expects an array of options; keep parent API by dispatching a synthetic event to handleSchoolChange */}
                      <Autocomplete
                        options={(schools || []).map((school: any) => ({ code: school.cohortId || school.id, label: school.name }))}
                        getOptionLabel={(option: any) => option.label || ""}
                        value={(() => {
                          const opts = (schools || []).map((school: any) => ({ code: school.cohortId || school.id, label: school.name }));
                          return opts.find((o: any) => o.code === (selectedSchool ?? "")) || null;
                        })()}
                        onChange={(_event: any, newValue: any) => {
                          const value = newValue ? newValue.code : "";
                          // keep existing handler signature
                          handleSchoolChange({ target: { value } } as any);
                        }}
                        isOptionEqualToValue={(option: any, value: any) => (option && value) ? option.code === value.code : false}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t("MASTER.SCHOOL")}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      />
                    </FormControl>
                  )}
            </Box>
            {/* )} */}
        </Box>
    </Box>
  );
};

export default HeaderComponent;