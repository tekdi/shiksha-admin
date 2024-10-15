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

const Foundation = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
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
        setUserStateName(stateName || "");
      }
    };

    const getFrameworkDetails = async () => {
      if (!userStateName) return;

      try {
        const data = await getChannelDetails();
        setFramework(data?.result?.framework);
        setFramedata(data?.result?.framework);

        const getStates = await getOptionsByCategory(
          data?.result?.framework,
          "state"
        );

        const matchingState = getStates?.find(
          (state: any) => state?.name === userStateName
        );

        if (matchingState) {
          setState(matchingState?.name);
          setMatchingstate(matchingState);
          setStateassociations(matchingState?.associations);

          const getBoards = await getOptionsByCategory(
            data?.result?.framework,
            "board"
          );
          if (getBoards && matchingState) {
            const commonBoards = getBoards
              .filter((item1: { code: any }) =>
                matchingState.associations.some(
                  (item2: { code: any; category: string }) =>
                    item2.code === item1.code && item2.category === "board"
                )
              )
              .map((item1: { name: any; code: any; associations: any }) => ({
                name: item1.name,
                code: item1.code,
                associations: item1.associations,
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

    if (userStateName) {
      getFrameworkDetails();
    }
  }, [userStateName]);

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
