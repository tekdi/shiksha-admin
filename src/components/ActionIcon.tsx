import React from "react";
import { useTranslation } from "next-i18next";
import { Box, Typography, Tooltip, useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import deleteIcon from "../../public/images/deleteIcon.svg";
import editIcon from "../../public/images/editIcon.svg";
import cohortIcon from "../../public/images/apartment.svg";
import Restore from "../../public/images/Restore.svg";

import Image from "next/image";

interface ActionCellProps {
  onEdit?: (rowData: any) => void;
  onDelete?: (rowData: any) => void;
  reassignCohort?: (rowData: any) => void;
  reassignType?: string;
  rowData: any;
  disable?: boolean;
  userAction?: boolean;
  onActivate?: (rowData: any) => void;
}

const ActionIcon: React.FC<ActionCellProps> = ({
  rowData,
  onEdit,
  onDelete,
  reassignCohort,
  userAction = false,
  disable = false,
  reassignType,
  onActivate,
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
        // pointerEvents: disable ? "none" : "auto",
        pointerEvents: "auto",
      }}
    >
      {!disable && onEdit && (
        <Tooltip title={t("COMMON.EDIT")}>
          <Box
            onClick={() => {
              onEdit(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              // color: disable ? theme?.palette?.secondary.contrastText : "",
              color: "",
              backgroundColor: "#E3EAF0",
              p: "10px",
            }}
          >
            <Image src={editIcon} alt="" />
            {/* <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.EDIT")}
          </Typography> */}
          </Box>
        </Tooltip>
      )}
      {disable && onActivate && (
        <Tooltip title={t("CENTERS.ACTIVATE_COHORT")}>
          <Box
            onClick={() => {
              onActivate(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              // color: disable ? theme?.palette?.secondary.contrastText : "",
              color: "",
              backgroundColor: "#F8EFE7",
              p: "10px",
            }}
          >
            <Image src={Restore} alt="" />
          </Box>
        </Tooltip>
      )}

      {!disable && onDelete && (
        <Tooltip title={t("COMMON.DELETE")}>
          <Box
            onClick={() => {
              onDelete(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              // color: disable ? theme?.palette?.secondary.contrastText : "",
              color: "",
              backgroundColor: "#F8EFE7",
              p: "10px",
            }}
          >
            <Image src={deleteIcon} alt="" />
            {/* 
          <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.DELETE")}
          </Typography> */}
          </Box>
        </Tooltip>
      )}

      {userAction && (
        <Tooltip title={reassignType}>
          <Box
            onClick={() => {
              if (reassignCohort) reassignCohort(rowData);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              // color: disable ? theme?.palette?.secondary.contrastText : "",
              color: "",
              backgroundColor: "#E5E5E5",
              p: "10px",
            }}
          >
            <Image src={cohortIcon} alt="" />
            {/* 
          <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.DELETE")}
          </Typography> */}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionIcon;
