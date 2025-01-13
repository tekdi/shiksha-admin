import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import React from "react";

interface CustomModalProps {
  open: boolean;
  handleClose: () => void;
  title?: string;
  subtitle?: string;
  primaryBtnText: string;
  secondaryBtnText?: string;
  primaryBtnClick?: () => void;
  secondaryBtnClick?: () => void;
  showClose?: boolean;
  backdropClose?: boolean;
  primaryBtnDisabled?: boolean;
  children: React.ReactNode;
  width?:string
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  handleClose,
  title,
  subtitle,
  primaryBtnText,
  secondaryBtnText,
  primaryBtnClick,
  secondaryBtnClick,
  showClose = true,
  backdropClose = true,
  primaryBtnDisabled = true,
  children,
  width
}) => {
  // const isSmallScreen = useMediaQuery((theme: Theme) =>
  //   theme.breakpoints.down("sm"),
  // );
  const theme = useTheme<any>();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  return (
    <Modal
      open={open}
      onClose={backdropClose ? handleClose : undefined}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isSmallScreen ? "90%" : isLargeScreen ? width : width,
          maxWidth: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography id="modal-title" variant="h1">
              {title}
            </Typography>
            {subtitle && (
              <Typography id="modal-subtitle" variant="h2">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box display="flex" justifyContent="flex-end">
            {showClose && (
              <IconButton onClick={handleClose} sx={{ ml: "auto" }}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box id="modal-description">{children}</Box>
        <Box mt={2} display="flex" justifyContent="right" gap={2}>
          {secondaryBtnText && (
            <Button onClick={secondaryBtnClick} variant="outlined">
              {secondaryBtnText}
            </Button>
          )}
          <Button
            // fullWidth
            onClick={primaryBtnClick}
            variant="contained"
            disabled={primaryBtnDisabled}
          >
            {primaryBtnText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomModal;
