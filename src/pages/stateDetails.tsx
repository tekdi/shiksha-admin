import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Divider,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import cardData from "@/data/cardData";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import FilterSearchBar from "@/components/FilterSearchBar";
import CustomStepper from "@/components/Steper";
import { useTranslation } from "next-i18next";
import Loader from "@/components/Loader";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import coursePlannerStore from "@/store/coursePlannerStore";
import taxonomyStore from "@/store/tanonomyStore";
import { TelemetryEventType } from "@/utils/app.constant";
import { telemetryFactory } from "@/utils/telemetry";

const StateDetails = () => {
  const router = useRouter();
  const { boardId, cardId } = router.query;
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const store = coursePlannerStore();
  const tStore = taxonomyStore();
  // State management
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState("");
  const [medium, setMedium] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [card, setCard] = useState<any>(null);
  const [boards, setBoards] = useState<any>([]);
  const setBoard = taxonomyStore((state) => state.setBoard);

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        const foundCard = cardData.find((c) => c.id === cardId);
        setCard(foundCard);

        const channel = store?.boards;
        console.log(channel);

        setBoards(channel);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [cardId]);

  const handleBackClick = () => {
    router.back();
  };

  const handleBoardClick = (board: string, boardName: string) => {
    setBoard(boardName);
    localStorage.removeItem("overallCommonSubjects");
    localStorage.removeItem("selectedGrade");
    localStorage.removeItem("selectedMedium");
    localStorage.removeItem("selectedType");
    router.push({
      pathname: "/subjectDetails",
      query: { boardDetails: board, boardName: boardName },
    });
  };

  const handleCopyLink = (state: string) => {
    const link = `${window.location.origin}/course-planner/foundation/${state}`;
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

  if (loading) {
    return <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }}>
        <IconButton onClick={handleBackClick}>
          <ArrowBackIcon />
        </IconButton>

        {/* <Typography variant="h2">{card.state}</Typography> */}
        <Typography variant="h2" sx={{ ml: 1 }}>
          States
        </Typography>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}></Box>
      </Box>
      <Divider />
      <Grid spacing={2} container sx={{ marginTop: "16px", ml: 2 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, mt: 2 }}
        >
          <Typography variant="h2">Boards :</Typography>
        </Box>
        {boards.map((board: any, index: number) => (
          <Grid item xs={12} md={4} key={index}>
            <Box
              sx={{
                alignItems: "center",
                cursor: "pointer",
                border: "1px solid #0000001A",
                boxShadow: "none",
                transition: "background-color 0.3s",
                "&:hover": {
                  backgroundColor: "#EAF2FF",
                },
                marginTop: "8px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
              }}
              onClick={() => {
                handleBoardClick(board, board?.name);
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FolderOutlinedIcon />
                  <Typography variant="h6" sx={{ fontSize: "16px" }}>
                    {board?.name}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink(board?.identifier);
                  }}
                  sx={{ minWidth: "auto", padding: 0 }}
                ></Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StateDetails;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
