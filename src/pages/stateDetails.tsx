import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Grid, Divider } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import coursePlannerStore from "@/store/coursePlannerStore";
import taxonomyStore from "@/store/tanonomyStore";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const StateDetails = () => {
  const router = useRouter();
  const { state } = router.query;
  const store = coursePlannerStore();
  const setBoard = taxonomyStore((state) => state.setBoard);

  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<any>([]);

  useEffect(() => {
    const fetchBoards = () => {
      let boardsData = [];
      if (
        Array.isArray(store?.boards) &&
        store.boards.some((item: any) => item.stateName)
      ) {
        const stateData = store.boards.find(
          (item: any) => item.stateName === state
        );
        boardsData = stateData?.boards || [];
      }
      // Handle the single-state format
      else if (
        Array.isArray(store?.boards) &&
        store.boards.some((item: any) => item.name)
      ) {
        const boardData = store.boards.find((item: any) => item.name === state);
        boardsData = boardData ? [boardData] : [];
      }

      setBoards(boardsData);
      setLoading(false);
    };

    if (state) {
      fetchBoards();
    }
  }, [state, store.boards]);

  const handleBackClick = () => {
    router.back();
  };

  const handleBoardClick = (boardCode: string, boardName: string) => {
    setBoard(boardName);
    localStorage.removeItem("overallCommonSubjects");
    localStorage.removeItem("selectedGrade");
    localStorage.removeItem("selectedMedium");
    localStorage.removeItem("selectedType");
    router.push({
      pathname: "/subjectDetails",
      query: { boardDetails: boardCode, boardName: boardName },
    });
  };

  if (loading) {
    return <Loader showBackdrop={true} loadingText="Loading..." />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }}>
        <IconButton onClick={handleBackClick}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" sx={{ ml: 1 }}>
          {state || "States"}
        </Typography>
      </Box>
      <Divider />
      <Grid container spacing={2} sx={{ marginTop: "16px", ml: 2 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, mt: 2 }}
        >
          <Typography variant="h2">Boards:</Typography>
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
                handleBoardClick(board.code, board.name);
                console.log(board);
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
                    {board.name}
                  </Typography>
                </Box>
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
