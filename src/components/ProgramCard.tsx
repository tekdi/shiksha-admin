import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Image from "next/image";
import appLogo from "../../public/images/Logo.svg";
import { deleteProgram, updateProgram } from "@/services/ProgramServices";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { showToastMessage } from "./Toastify";
import { useTranslation } from "next-i18next";

interface ProgramCardProps {
  programId: string;
  programName: string;
  description: string;
  imageUrl: string;
  status?: string;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  programId,
  programName,
  description,
  imageUrl,
  status
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const fetchPrograms = useSubmittedButtonStore(
    (state: any) => state.fetchPrograms
  );
  const setFetchPrograms = useSubmittedButtonStore(
    (state: any) => state.setFetchPrograms
  );
  const { t } = useTranslation();

  console.log("programId:", programId);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleMenuDelete = async() => {
    // setAnchorEl(null);
    try{
      let tenantId=programId
      const programData={
        "status":"archived"

      }
     const response=await updateProgram(programData,tenantId);

     setFetchPrograms(!fetchPrograms)
     setAnchorEl(null);
     showToastMessage(t("PROGRAM_MANAGEMENT.PROGRAM_DELETED_SUCCESS"), "success");

    }
    catch(e)
    {
       console.log(e)
       setAnchorEl(null);

    }
  };
  return (
    <Card
      sx={{ width: "300px", height: "300px",  borderRadius: 2,  border: "1px solid #D0C5B4" }}
    >
      {/* Program Image */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography 
  variant="h6" 
  ml={2} 
  component="div"
  sx={{
    fontFamily: 'Poppins',
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '24px',
    letterSpacing: '0.15px',
  }}
>
  {programName}
</Typography>

        {/* Menu Button */}
        <IconButton aria-label="settings" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>
      {/* Program Content */}
      <CardContent>
        {imageUrl !== "No image available" ? (
          <CardMedia
            component="img"
            height={"150px"}
            image={imageUrl}
            alt={"program image"}
          />
        ) : (
          <Image
            src={appLogo}
            alt="App Logo"
            style={{ width: "200px", height: "150px" }}
          />
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Program Name */}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit Details
            </MenuItem>
            <MenuItem onClick={handleMenuDelete}>
              <DeleteIcon fontSize="small" sx={{ mr: 1, color: "red" }} />
              <Typography color="red">Delete Program</Typography>
            </MenuItem>
          </Menu>
        </Box>

        {/* Program Description */}
        <Typography
  sx={{
    mt: 1,
    overflow: "hidden", 
    textOverflow: "ellipsis",
     whiteSpace: "nowrap", 
    fontFamily: "Poppins",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.25px",
    width: "200px", 
  }}
>
  {description}
</Typography>

        {/* Program ID */}
        {/* <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: "italic" }}>
          Program ID: {programId}
        </Typography> */}
      </CardContent>
    </Card>
  );
};

export default ProgramCard;
