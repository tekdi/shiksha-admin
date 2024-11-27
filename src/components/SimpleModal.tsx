import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import {
  Box,
  Button,
  Divider,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { ReactNode } from "react";

interface SimpleModalProps {
  secondaryActionHandler?: () => void;
  primaryActionHandler?: () => void;
  secondaryText?: string;
  primaryText?: string;
  showFooter?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  modalTitle: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({
  open,
  onClose,
  primaryText,
  secondaryText,
  showFooter = true,
  primaryActionHandler,
  secondaryActionHandler,
  footer,
  children,
  modalTitle,
}) => {
  const theme = useTheme<any>();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const modalStyle = {
    display: "flex",
    flexDirection: "column" as const,
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isSmallScreen ? "90%" : "40%",
    maxHeight: "80vh",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: theme.shadows[5],
  };

  const titleStyle = {
    position: "sticky" as const,
    top: "0",
    backgroundColor: "#fff",
    padding: theme.spacing(2),
    zIndex: 9999,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
  };

  const contentStyle = {
    flex: 1,
    overflowY: "auto" as const,
    padding: theme.spacing(2),
  };

  const footerStyle = {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  };

  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      aria-labelledby="child-modal-title"
      aria-describedby="child-modal-description"
    >
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" sx={titleStyle}>
          <Typography
            variant="h2"
            sx={{ color: theme.palette.warning.A200 }}
            component="h2"
          >
            {modalTitle}
          </Typography>
          <CloseSharpIcon
            sx={{ cursor: "pointer" }}
            onClick={onClose}
            aria-label="Close"
          />
        </Box>
        <Divider />
        <Box sx={contentStyle}>{children}</Box>
        <Divider />
        {showFooter &&
          (footer ? (
            <Box sx={footerStyle}>{footer}</Box> // Render the custom footer content if provided
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={footerStyle}
            >
              {primaryText && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    "&.Mui-disabled": {
                      backgroundColor: theme?.palette?.primary?.main,
                    },
                    padding: theme.spacing(1),
                    fontWeight: "500",
                  }}
                  onClick={primaryActionHandler}
                >
                  {primaryText}
                </Button>
              )}
              {secondaryText && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    "&.Mui-disabled": {
                      backgroundColor: theme?.palette?.primary?.main,
                    },
                    minWidth: "84px",
                    height: "2.5rem",
                    padding: theme.spacing(1),
                    fontWeight: "500",
                    width: "100%",
                  }}
                  onClick={secondaryActionHandler}
                >
                  {secondaryText}
                </Button>
              )}
            </Box>
          ))}
      </Box>
    </Modal>
  );
};

export default SimpleModal;
