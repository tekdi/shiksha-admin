import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Grid,
  Divider,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import CustomStepper from "@/components/Steper";
import FilterSearchBar from "@/components/FilterSearchBar";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import ProtectedRoute from "../../components/ProtectedRoute";
import cardData from "@/data/cardData";
import Loader from "@/components/Loader";
import { getChannelDetails } from "@/services/coursePlanner";
import { getOptionsByCategory } from "@/utils/Helper";
import coursePlannerStore from "@/store/coursePlannerStore";
import taxonomyStore from "@/store/tanonomyStore";
import { telemetryFactory } from "@/utils/telemetry";
import { TelemetryEventType } from "@/utils/app.constant";
import useStore from "@/store/store";

const Foundation = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const userStore = useStore();
  const isActiveYear = userStore.isActiveYearSelected;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const store = coursePlannerStore();
  const tStore = taxonomyStore();
  // State management
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [grade, setGrade] = useState("");
  const [medium, setMedium] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectFilter, setSelectFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [framework, setFramework] = useState<any[]>([]);
  const setState = taxonomyStore((state) => state.setState);
  const setMatchingstate = coursePlannerStore(
    (state) => state.setMatchingstate
  );
  const setStateassociations = coursePlannerStore(
    (state) => state.setStateassociations
  );
  const setFramedata = coursePlannerStore((state) => state.setFramedata);
  const setBoards = coursePlannerStore((state) => state.setBoards);
  const [userStateName, setUserStateName] = useState<any>();

  useEffect(() => {
    const fetchStateName = () => {
      if (typeof window !== "undefined") {
        const stateName = localStorage.getItem("stateName");
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

  const handleCardClick = (id: any) => {
    router.push(`/stateDetails?cardId=${id}`);
  };

  const handleGradeChange = (event: any) => {
    setGrade(event.target.value);
  };

  const handleMediumChange = (event: any) => {
    setMedium(event.target.value);
  };

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const handleDropdownChange = (event: any) => {
    setSelectedOption(event.target.value);
  };

  const handleFilter = (value: string) => {
    setSelectFilter(value);
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
            <Box
              sx={{
                mb: 2,
              }}
            >
              <Typography>{t("MASTER.STATE")}</Typography>
            </Box>
            <Divider />
            <Grid container spacing={2} mt={2}>
              {!selectedCardId ? (
                cardData?.map((card: any) => (
                  <Grid item xs={12} md={4} key={card.id}>
                    {" "}
                    {/* Added item prop and key here */}
                    <Box
                      sx={{
                        cursor: "pointer",
                        border: "1px solid #D0C5B4",
                        padding: "10px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        "&:hover": {
                          backgroundColor: "#D0C5B4",
                        },
                      }}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <Box>
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
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {/* <CustomStepper completedSteps={card.boardsUploaded} />
                          <Typography
                            sx={{
                              fontSize: isSmallScreen ? "12px" : "14px",
                              color: "#7C766F",
                            }}
                          >
                            ({card.boardsUploaded}/{card.totalBoards}{" "}
                            {t("COURSE_PLANNER.BOARDS_FULLY_UPLOADED")})
                          </Typography> */}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(card.state);
                          }}
                          sx={{ minWidth: "auto", padding: 0 }}
                        ></Button>
                      </Box>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Typography>{""}</Typography>
              )}
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
