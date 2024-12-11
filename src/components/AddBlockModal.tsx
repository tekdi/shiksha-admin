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
import { useQueryClient } from "@tanstack/react-query";
import { CohortTypes, QueryKeys } from "@/utils/app.constant";

interface AddBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    value: string,
    controllingField: string,
    cohortId: string,
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
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  open,
  onClose,
  onSubmit,
  fieldId,
  initialValues = {},
  districtId,
}) => {
  const [formData, setFormData] = useState({
    name: initialValues.name || "",
    value: initialValues.value || "",
    controllingField: initialValues.controllingField || "",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [districts, setDistricts] = useState<
    { value: string; label: string; cohortId: string | null }[]
  >([]);

  const [districtsOptionRead, setDistrictsOptionRead] = useState<any>([]);
  const [districtCodeArr, setDistrictCodeArr] = useState<any>([]);
  const [districtNameArr, setDistrictNameArr] = useState<any>([]);
  const [cohortIdAddNewDropdown, setCohortIdAddNewDropdown] = useState<any>("");
  const [stateCode, setStateCode] = useState<any>("");
  const [stateName, setStateName] = useState<any>("");

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUserData = JSON.parse(
      localStorage.getItem("adminInfo") || "{}"
    );
    const stateCodes = storedUserData?.customFields[0]?.code;
    const stateNames = storedUserData?.customFields[0]?.value;
    setStateCode(stateCodes);
    setStateName(stateNames);
  }, [open]);

  useEffect(() => {
    setFormData({
      name: initialValues.name || "",
      value: initialValues.value || "",
      controllingField: initialValues.controllingField || "",
    });

    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    if (formData.controllingField) {
      const selectedDistrict = districts.find(
        (district) => district.value === formData.controllingField
      );
      setCohortIdAddNewDropdown(selectedDistrict?.cohortId || null);
    }
  }, [formData.controllingField, districts]);

  const fetchDistricts = async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: [QueryKeys.FIELD_OPTION_READ, stateCode || "", "districts"],
        queryFn: () =>
          getDistrictsForState({
            controllingfieldfk: stateCode || "",
            fieldName: "districts",
          }),
      });

      const districts = data?.result?.values || [];
      setDistrictsOptionRead(districts);

      const districtNameArray = districts.map((item: any) => item?.label?.toLowerCase());
      setDistrictNameArr(districtNameArray);

      const districtCodeArray = districts.map((item: any) => item.value);
      setDistrictCodeArr(districtCodeArray);
    } catch (error) {
      console.error("Error fetching districts", error);
    }
  };

  useEffect(() => {
    if (open) fetchDistricts();
  }, [open, formData.controllingField]);

  const getFilteredCohortData = async () => {
    try {
      const reqParams = {
        limit: 0,
        offset: 0,
        filters: {
          states: stateCode,
          type: CohortTypes.DISTRICT,
        },
      };

      const response = await queryClient.fetchQuery({
        queryKey: [
          QueryKeys.FIELD_OPTION_READ,
          reqParams.limit,
          reqParams.offset,
          CohortTypes.DISTRICT,
        ],
        queryFn: () => getCohortList(reqParams),
      });

      const cohortDetails = response?.results?.cohortDetails || [];

      const filteredDistrictData = cohortDetails
        .map(
          (districtDetail: {
            cohortId: any;
            name: string;
            createdAt: any;
            updatedAt: any;
            createdBy: any;
            updatedBy: any;
          }) => {
            const transformedName = districtDetail.name;

            const matchingDistrict = districtsOptionRead.find(
              (district: { label: string }) =>
                district?.label?.toLowerCase() === transformedName?.toLowerCase()
            );
            return {
              label: transformedName,
              value: matchingDistrict ? matchingDistrict.value : null,
              createdAt: districtDetail.createdAt,
              updatedAt: districtDetail.updatedAt,
              createdBy: districtDetail.createdBy,
              updatedBy: districtDetail.updatedBy,
              cohortId: districtDetail?.cohortId,
            };
          }
        )
        .filter((district: { label: any }) =>
          districtNameArr.includes(district?.label?.toLowerCase())
        );
      setDistricts(filteredDistrictData);
    } catch (error) {
      console.error("Error fetching and filtering cohort districts", error);
    }
  };
  useEffect(() => {
    if (open) getFilteredCohortData();
  }, [open, districtNameArr]);

  function transformLabels(label: string) {
    if (!label || typeof label !== "string") return "";
    return label
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const validateField = (
    field: keyof typeof formData,
    value: string,
    requiredMessage: string
  ) => {
    if (!value) return null;

    if (field !== "controllingField" && !/^[a-zA-Z\s]+$/.test(value)) {
      return t("COMMON.INVALID_TEXT");
    }

    const isUnique = (fieldName: string, value: string) => {
      return true;
    };

    if (field === "name" && !isUnique("name", value)) {
      return t("COMMON.BLOCK_NAME_NOT_UNIQUE");
    }

    if (field === "value" && !isUnique("value", value)) {
      return t("COMMON.BLOCK_CODE_NOT_UNIQUE");
    }

    return null;
  };

  const handleChange =
    (field: keyof typeof formData) =>
    async (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      let value = typeof e.target.value === "string" ? e.target.value : "";

      if (field === "value") {
        value = value.toUpperCase().slice(0, 3);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));

      let errorMessage: string | null = validateField(field, value, "");

      setErrors((prev) => ({
        ...prev,
        [field]: errorMessage,
      }));
    };

  const validateForm = () => {
    const newErrors = {
      name:
        validateField("name", formData.name, t("COMMON.BLOCK_NAME_REQUIRED")) ||
        (!formData.name ? t("COMMON.BLOCK_NAME_REQUIRED") : null),
      value:
        validateField(
          "value",
          formData.value,
          t("COMMON.BLOCK_CODE_REQUIRED")
        ) || (!formData.value ? t("COMMON.BLOCK_CODE_REQUIRED") : null),
      controllingField:
        validateField(
          "controllingField",
          formData.controllingField,
          t("COMMON.DISTRICT_NAME_REQUIRED")
        ) ||
        (!formData.controllingField
          ? t("COMMON.DISTRICT_NAME_REQUIRED")
          : null),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== null);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const currentCohortId: any = cohortIdAddNewDropdown;

      onSubmit(
        formData.name,
        formData.value,
        formData.controllingField,
        currentCohortId,
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
    ? t("COMMON.UPDATE_BLOCK")
    : t("COMMON.ADD_BLOCK");

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
    >
      <DialogTitle sx={{ fontSize: "14px" }}>{dialogTitle}</DialogTitle>
      <Divider />
      <DialogContent>
        {!(formData.controllingField === "All") && (
          <Select
            value={formData.controllingField}
            onChange={(e) =>
              handleChange("controllingField")(
                e as React.ChangeEvent<HTMLInputElement>
              )
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 400,
                },
              },
            }}
            fullWidth
            displayEmpty
            variant="outlined"
            margin="dense"
            disabled={isEditing}
          >
            <MenuItem value="">{t("COMMON.SELECT_DISTRICT")}</MenuItem>
            {districts.length > 0 ? (
              districts.map((district: any) => (
                <MenuItem key={district.value} value={district.value}>
                  {transformLabels(district.label)}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>{t("COMMON.NO_DISTRICTS")}</MenuItem>
            )}
          </Select>
        )}
        {errors.controllingField && (
          <Typography variant="caption" color="error">
            {errors.controllingField}
          </Typography>
        )}
        <TextField
          margin="dense"
          label={t("COMMON.BLOCK_NAME")}
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
          label={t("COMMON.BLOCK_CODE")}
          type="text"
          fullWidth
          variant="outlined"
          value={formData.value}
          onChange={handleChange("value")}
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