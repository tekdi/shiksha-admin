import React, { MouseEvent } from "react";
import { Box, Card, Typography, Button } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import CustomStepper from "@/components/Steper";
import { useTranslation } from "next-i18next";
interface CardItemProps {
  card: {
    id: number;
    state: string;
    boardsUploaded: number;
    totalBoards: number;
    boards: string[];
  };
  onClick: () => void;
  onCopyLink: (e: MouseEvent<HTMLButtonElement>) => void;
  selected: boolean;
}

const CardItem: React.FC<CardItemProps> = ({
  card,
  onClick,
  onCopyLink,
  selected,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        padding: "14px",
        cursor: "pointer",
        border: "1px solid #0000001A",
        boxShadow: "none",
        transition: "background-color 0.3s",
        backgroundColor: selected ? "#EAF2FF" : "inherit",
        "&:hover": {
          backgroundColor: "#EAF2FF",
        },
        marginTop: "8px",
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <FolderOutlinedIcon />
        <Typography variant="h6">{card.state}</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <CustomStepper completedSteps={card.boardsUploaded} />
        <Typography sx={{ fontSize: "14px" }}>
          {card.boardsUploaded} / {card.totalBoards}{" "}
          {t("COURSE_PLANNER.BOARDS_FULLY_UPLOADED")}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onCopyLink(e);
          }}
          sx={{ minWidth: "auto", padding: 0 }}
        >
          <InsertLinkOutlinedIcon />
        </Button>
      </Box>
    </Card>
  );
};

export default CardItem;
