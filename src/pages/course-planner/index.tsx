import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import { useRouter } from "next/router";
import { getChannelDetails } from "@/services/coursePlanner";
import { getOptionsByCategory } from "@/utils/Helper";
import coursePlannerStore from "@/store/coursePlannerStore";
import taxonomyStore from "@/store/tanonomyStore";
import Loader from "@/components/Loader";
import { useTranslation } from "next-i18next";
import ProtectedRoute from "../../components/ProtectedRoute";
import { telemetryFactory } from "@/utils/telemetry";
import { TelemetryEventType } from "@/utils/app.constant";
import useStore from "@/store/store";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Foundation = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const userStore = useStore();
  const isActiveYear = userStore.isActiveYearSelected;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const store = coursePlannerStore();
  const [loading, setLoading] = useState(true);
  const [framework, setFramework] = useState<any[]>([]);
  const [userStateName, setUserStateName] = useState<any>();
  const [role, setRole] = useState<any>();
  const [stateNames, setStateNames] = useState<any[]>([]);

  const setState = taxonomyStore((state) => state.setState);
  const setMatchingstate = coursePlannerStore(
    (state) => state.setMatchingstate
  );
  const setStateassociations = coursePlannerStore(
    (state) => state.setStateassociations
  );
  const setFramedata = coursePlannerStore((state) => state.setFramedata);
  const setBoards = coursePlannerStore((state) => state.setBoards);

  useEffect(() => {
    const fetchStateName = () => {
      if (typeof window !== "undefined") {
        const stateName = localStorage.getItem("stateName");
        const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
        const userRole = adminInfo?.role;
        setRole(userRole);
        setUserStateName(stateName || "undefined");
      }
    };

    const fetchFrameworkDetails = async (stateName?: string) => {
      try {
        const data = await getChannelDetails();
        const framework = data?.result?.framework;
        setFramework(framework);
        setFramedata(framework);

        const states = await getOptionsByCategory(framework, "state");

        if (role === "Central Admin CCTA") {
          // Get all states and their names
          const stateNames = states.map((state: any) => state.name);
          setStateNames(stateNames);
          setState(stateNames); // Store all states in the store

          // Map state-to-board associations
          const stateBoardMapping = states.map((state: any) => {
            const stateAssociations = state.associations || [];
            const boards = getOptionsByCategory(framework, "board");

            // Filter boards linked to the current state
            const associatedBoards = boards
              .filter((board: { code: any }) =>
                stateAssociations.some(
                  (assoc: { code: any; category: string }) =>
                    assoc.code === board.code && assoc.category === "board"
                )
              )
              .map((board: { name: any; code: any }) => ({
                name: board.name,
                code: board.code,
              }));

            return {
              stateName: state.name,
              boards: associatedBoards,
              associations: stateAssociations, // Include associations for each state
            };
          });

          console.log("State-Board Mapping:", stateBoardMapping);

          setBoards(stateBoardMapping);

          // Optionally store associations for CCTA (can also be all states' associations)
          const allAssociations = stateBoardMapping.flatMap(
            (mapping: any) => mapping.associations
          );
          setStateassociations(allAssociations); // Set all state associations
        } else {
          const matchingState = states?.find(
            (state: any) => !stateName || state?.name === stateName
          );
          if (matchingState) {
            setState(matchingState?.name);
            setMatchingstate(matchingState);
            setStateassociations(matchingState?.associations);
            const boards = await getOptionsByCategory(framework, "board");
            if (boards) {
              const commonBoards = boards
                .filter((board: { code: any }) =>
                  matchingState.associations.some(
                    (assoc: { code: any; category: string }) =>
                      assoc.code === board.code && assoc.category === "board"
                  )
                )
                .map((board: { name: any; code: any; associations: any }) => ({
                  name: board.name,
                  code: board.code,
                  associations: board.associations,
                }));
              setBoards(commonBoards);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStateName();

    if (userStateName === undefined) {
      fetchFrameworkDetails();
    } else if (userStateName) {
      fetchFrameworkDetails(userStateName);
    }

    if (!isActiveYear) {
      router.push("/course-planner");
    }
  }, [userStateName, isActiveYear]);

  const handleCardClick = (state: string) => {
    // Navigate to the state details page
    router.push(`/stateDetails?state=${state}`);
  };

  const handleCopyLink = (state: string) => {
    const link = `${window.location.origin}/course-planner/${state}`;
    navigator.clipboard.writeText(link).then(
      () => {
        alert("Link copied to clipboard");
        const windowUrl = window.location.pathname;
        const cleanedUrl = windowUrl.replace(/^\//, "");
        const env = cleanedUrl.split("/")[0];

        const telemetryInteract = {
          context: {
            env: env,
            cdata: [],
          },
          edata: {
            id: "copy_link",
            type: TelemetryEventType.CLICK,
            subtype: "",
            pageid: cleanedUrl,
          },
        };
        telemetryFactory.interact(telemetryInteract);
      },
      (err) => {
        console.error("Failed to copy link: ", err);
      }
    );
  };

  return (
    <ProtectedRoute>
      <>
        {loading ? (
          <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />
        ) : (
          <Box sx={{ pl: "20px", mt: 5 }}>
            <Box sx={{ mb: 2 }}>
              <Typography>{t("MASTER.STATE")}</Typography>
            </Box>
            <Divider />
            <Grid container spacing={2} mt={2}>
              {/* Show either all states for Central Admin CCTA or just the matched one */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {role === "Central Admin CCTA" ? (
                  stateNames.map((stateName) => (
                    <Box
                      key={stateName}
                      sx={{
                        cursor: "pointer",
                        border: "1px solid #D0C5B4",
                        padding: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        marginLeft: "15px",
                        marginBottom: "10px",
                        marginRight: "10px",
                        width: "250px",
                        "&:hover": {
                          backgroundColor: "#D0C5B4",
                        },
                      }}
                      onClick={() => handleCardClick(stateName)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "18px",
                        }}
                      >
                        <FolderOutlinedIcon />
                        <Typography>{stateName}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(stateName);
                          }}
                          sx={{ minWidth: "auto", padding: 0 }}
                        >
                          {/* Add any icon or text for the copy link button */}
                        </Button>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      cursor: "pointer",
                      border: "1px solid #D0C5B4",
                      padding: "10px",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      marginRight: "10px",
                      width: "250px",
                      "&:hover": {
                        backgroundColor: "#D0C5B4",
                      },
                    }}
                    onClick={() => handleCardClick(store?.matchingstate?.name)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                      }}
                    >
                      <FolderOutlinedIcon />
                      <Typography>{store?.matchingstate?.name}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(store?.matchingstate?.name);
                        }}
                        sx={{ minWidth: "auto", padding: 0 }}
                      >
                        {/* Add any icon or text for the copy link button */}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Box>
        )}
      </>
    </ProtectedRoute>
  );
};

export default Foundation;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
