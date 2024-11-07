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
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "next-i18next";
import { getDistrictsForState } from "@/services/MasterDataService";
import { getCohortList } from "@/services/CohortService/cohortService";
interface AddSchoolModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    parentClusterName: string,
    name: string,
    value: string,
    controllingField: string,
    fieldId: string,
    districtId?: string
  ) => void;
  fieldId: string;
  initialValues?: {
    name?: string;
    value?: string;
    controllingField?: string;
  };
  districtId?: string;
  validateDuplicateData: any;
}

export const AddSchoolModal: React.FC<AddSchoolModalProps> = ({
  open,
  onClose,
  onSubmit,
  fieldId,
  initialValues = {},
  districtId,
  validateDuplicateData,
}) => {
  const [formData, setFormData] = useState({
    name: initialValues.name || "",
    value: initialValues.value || "",
    controllingField: initialValues.controllingField || "",
  });
  const [parentClusterName, setparentCluster] = useState<any>();
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [clusters, setClusters] = useState<{ value: string; label: string }[]>(
    []
  );
  const { t } = useTranslation();

  useEffect(() => {
    setFormData({
      name: initialValues.name || "",
      value: initialValues.value || "",
      controllingField: initialValues.controllingField || "",
    });
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await getDistrictsForState({ fieldName: "clusters" });
        if (response.result.values) {
          setClusters(response.result.values);
          console.log("modal all districts", response.result.values);
        } else {
          console.error("Unexpected response format:", response);
          setClusters([]);
        }
      } catch (error: any) {
        console.error("Error fetching districts:", error.message);
        setClusters([]);
      }
    };

    if (open) fetchClusters();
  }, [open, formData.controllingField]);

  useEffect(() => {
    console.log("Selected Cluster:", formData.controllingField);
  }, [formData.controllingField]);

  const validateField = (
    field: keyof typeof formData,
    value: string,
    requiredMessage: string
  ) => {
    if (!value) return requiredMessage;
    // if (field !== "controllingField" && !/^[a-zA-Z0-9-_]+$/.test(value))
    // return t("COMMON.INVALID_TEXT");
    const isUnique = (fieldName: string, value: string) => {
      const exists = validateDuplicateData?.some(
        (item: any) => item[fieldName] === value
      );
      return !exists; 
    };

    if (field === "name" && !isUnique("name", value)) {
      return t("COMMON.SCHOOL_NAME_NOT_UNIQUE");
    }

    if (field === "value" && !isUnique("value", value)) {
      return t("COMMON.SCHOOL_CODE_NOT_UNIQUE");
    }

    if (field == "controllingField" && clusters.length > 0) {
      const clusterLabel = clusters.find((item) => item.value === value)?.label;
      setparentCluster(clusterLabel);
      // const reqParams = {
      //   limit: 1,
      //   offset: 0,
      //   filters: {
      //     name: clusterLabel,
      //     type: "CLUSTER",
      //   },
      // };

      //const response = await getCohortList(reqParams);

      //const cohortDetails = response?.results?.cohortDetails;

      // if (cohortDetails && cohortDetails.length > 0) {
      //   const parentCohortId = cohortDetails[0]?.cohortId;
      //   setparentCluster(parentCohortId);
      // }
      // else {
      //   return t("COMMON.COHORT NOT CREATED FOR SELECTED CLUSTER");
      // }
    }

    return null;
  };

  const handleChange =
    (field: keyof typeof formData) =>
  (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    let value = typeof e.target.value === "string" ? e.target.value : "";

    setFormData((prev) => ({ ...prev, [field]: value }));

    let errorMessage: string | null = null;

    if (field === "name") { // Removed validation- && !/^[a-zA-Z0-9-_]+$/.test(value)
      errorMessage = validateField(
        field,
        value,
        t("COMMON.SCHOOL_NAME_REQUIRED")
      );
    } else if (field === "value") {
      errorMessage = validateField(
        field,
        value,
        t("COMMON.SCHOOL_CODE_REQUIRED")
      );
    } else if (field === "controllingField") {
      errorMessage = validateField(
        field,
        value,
        t("COMMON.CLUSTER_NAME_REQUIRED")
      );
    }

    setErrors((prev) => ({
      ...prev,
      [field]: errorMessage,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField(
        "name",
        formData.name,
        t("COMMON.SCHOOL_NAME_REQUIRED")
      ),
      value: validateField(
        "value",
        formData.value,
        t("COMMON.SCHOOL_CODE_REQUIRED")
      ),
      controllingField: validateField(
        "controllingField",
        formData.controllingField,
        t("COMMON.CLUSTER_NAME_REQUIRED")
      ),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== null);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(
        parentClusterName,
        formData.name,
        formData.value,
        formData.controllingField,
        fieldId,
        districtId
      );
      setFormData({
        name: "",
        value: "",
        controllingField: "",
      });
      onClose();
    }
  };

  const isEditing = !!initialValues.name;
  const buttonText = isEditing ? t("COMMON.UPDATE") : t("COMMON.SUBMIT");
  const dialogTitle = isEditing
    ? t("COMMON.UPDATE_SCHOOL")
    : t("COMMON.ADD_SCHOOL");

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontSize: "14px" }}>{dialogTitle}</DialogTitle>
      <Divider />
      <DialogContent>
        <Select
          value={formData.controllingField}
          onChange={(e) =>
            handleChange("controllingField")(
              e as React.ChangeEvent<HTMLInputElement>
            )
          }
          fullWidth
          displayEmpty
          variant="outlined"
          margin="dense"
          error={!!errors.controllingField}
        >
          <MenuItem value="">{t("COMMON.SELECT_CLUSTER")}</MenuItem>
          {clusters.length > 0 ? (
            clusters.map((cluster) => (
              <MenuItem key={cluster.value} value={cluster.value}>
                {cluster.label}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>{t("COMMON.NO_CLUSTERS")}</MenuItem>
          )}
        </Select>
        {errors.controllingField && (
          <Typography variant="caption" color="error">
            {errors.controllingField}
          </Typography>
        )}
        <TextField
          margin="dense"
          label={t("COMMON.SCHOOL_NAME")}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange("name")}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          margin="dense"
          label={t("COMMON.SCHOOL_CODE")}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.value}
          onChange={handleChange("value")}
          error={!!errors.value}
          helperText={errors.value}
        />
        {/* <Box display="flex" alignItems="center" mt={2}>
          <InfoOutlinedIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="caption" color="textSecondary">
            {t("COMMON.CODE_NOTIFICATION")}
          </Typography>
        </Box> */}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
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
          variant="contained"
          sx={{ fontSize: "14px" }}
          color="primary"
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
