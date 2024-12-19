import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "next-i18next";

interface AddStateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    value: string,
    fieldId: string,
    stateId?: string
  ) => void;
  fieldId: string;
  initialValues?: {
    name?: string;
    value?: string;
  };
  stateId?: string;
}

export const AddStateModal: React.FC<AddStateModalProps> = ({
  open,
  onClose,
  onSubmit,
  fieldId,
  initialValues = {},
  stateId,
}) => {
  const [formData, setFormData] = useState({
    name: initialValues.name || "",
    value: initialValues.value || "",
  });
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});
  const { t } = useTranslation();

  useEffect(() => {
    setFormData({
      name: initialValues.name || "",
      value: initialValues.value || "",
    });
    setErrors({});
  }, [open, initialValues]);

  const isValidName = (input: string) =>
    /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(input);

  const isValidCode = (input: string) => /^[A-Z]{1,3}$/.test(input);
  const isEditing = !!initialValues.name;

  const handleChange = (field: string, value: string) => {
    if (field === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }

    if (field === "value" && value.length > 3) {
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (value === "") {
      setErrors((prev) => ({
        ...prev,
        [field]: t(
          field === "name"
            ? "COMMON.STATE_NAME_REQUIRED"
            : "COMMON.CODE_REQUIRED"
        ),
      }));
    } else if (field === "name" && !isValidName(value.trim())) {
      setErrors((prev) => ({ ...prev, [field]: t("COMMON.INVALID_INPUT") }));
    } else if (field === "value" && !isValidCode(value)) {
      setErrors((prev) => ({ ...prev, [field]: t("COMMON.INVALID_TEXT") }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; value?: string } = {};

    if (!formData.name) {
      newErrors.name = t("COMMON.STATE_NAME_REQUIRED");
    } else if (!isValidName(formData.name.trim())) {
      newErrors.name = t("COMMON.INVALID_TEXT");
    }

    if (!formData.value) {
      newErrors.value = t("COMMON.CODE_REQUIRED");
    } else if (!isValidCode(formData.value)) {
      newErrors.value = t("COMMON.INVALID_TEXT");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData.name, formData.value, fieldId, stateId);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
    >
      <DialogTitle sx={{ fontSize: "14px" }}>
        {stateId ? t("COMMON.UPDATE_STATE") : t("COMMON.ADD_STATE")}
      </DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t("COMMON.STATE_NAME")}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          margin="dense"
          label={t("COMMON.ADD_STATE_CODE")}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.value}
          onChange={(e) => handleChange("value", e.target.value.toUpperCase())}
          error={!!errors.value}
          helperText={errors.value}
          disabled={isEditing}

        />
        <Box display="flex" alignItems="center" mt={2}>
          <InfoOutlinedIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="caption" color="textSecondary">
            {t("COMMON.CODE_NOTIFICATION")}
          </Typography>
        </Box>
      </DialogContent>
      <Divider />

      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            border: "none",
            color: "secondary",
            fontSize: "14px",
            fontWeight: "500",
            "&:hover": {
              border: "none",
              backgroundColor: "transparent",
            },
          }}
          variant="outlined"
        >
          {t("COMMON.CANCEL")}
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            width: "auto",
            height: "40px",
            fontSize: "14px",
            fontWeight: "500",
          }}
          variant="contained"
          color="primary"
        >
          {stateId ? t("COMMON.UPDATE") : t("COMMON.SUBMIT")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
