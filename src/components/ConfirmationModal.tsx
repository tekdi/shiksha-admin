import { Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import * as React from "react";

interface ConfirmationModalProps {
  message: string;
  handleAction?: () => void;
  buttonNames: ButtonNames;
  handleCloseModal: () => void;
  modalOpen: boolean;
  disableDelete?: boolean; // New prop to disable the delete button
  isDynamicForm?:boolean
}

interface ButtonNames {
  primary?: string;
  secondary?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  modalOpen,
  message,
  handleAction,
  buttonNames,
  handleCloseModal,
  disableDelete = false,
  isDynamicForm=false
}) => {

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    bgcolor: "#fff",
    boxShadow: 24,
    borderRadius: "16px",
    "@media (min-width: 600px)": {
      width: "350px",
    },
  };

  return (
    <Modal
      open={modalOpen}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleCloseModal();
        }
      }}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <Box sx={style}>
        <Box sx={{ p: 3 }} id="confirmation-modal-title">
          {message}
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "end",
            gap: "8px",
            p: 2,
          }}
        >
          {buttonNames.secondary && (
            <Button
              sx={{
                color: "secondary",
                fontSize: "14px",
                fontWeight: "500",
                width: "auto",
                height: "40px",
                marginLeft: "10px",
              }}
              variant="outlined"
              onClick={handleCloseModal}
            >
              {buttonNames.secondary}
            </Button>
          )}
          {buttonNames.primary && !isDynamicForm  &&(
            <Button
              sx={{
                width: "auto",
                height: "40px",
                fontSize: "14px",
                fontWeight: "500",
              }}
              variant="contained"
              color="primary"
              onClick={() => {
                if (handleAction !== undefined) {
                  handleAction();
                  handleCloseModal();
                } else {
                  handleCloseModal();
                }
              }}
              disabled={disableDelete}
            >
              {buttonNames.primary}
            </Button>
          )}
          {buttonNames.primary && isDynamicForm  &&(
            <Button
              sx={{
                width: "auto",
                height: "40px",
                fontSize: "14px",
                fontWeight: "500",
              }}
              type="submit"
              form="dynamic-form"
              variant="contained"
              color="primary"
              
              disabled={disableDelete}
            >
              {buttonNames.primary}
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
