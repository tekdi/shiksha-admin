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
import { getUserDetailsInfo } from "@/services/UserList";
import { QueryKeys, Role, Storage } from "@/utils/app.constant";
import { useQueryClient } from "@tanstack/react-query";
import { formatedStates } from "@/services/formatedCohorts";
import MultipleSelectCheckmarks from "./FormControl";

interface AddDistrictBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    value: string,
    controllingField: string,
    fieldId: string,
   // districtId?: string,
    stateParentId?: string
  ) => void;
  fieldId: string;
  initialValues?: {
    name?: string;
    value?: string;
    controllingField?: string;
    controllingFieldLabel?: string;
  };
  districtId?: string;
}
interface State {
  value: string;
  label: string;
  cohortId?: any;
}
const AddDistrictModal: React.FC<AddDistrictBlockModalProps> = ({
  open,
  onClose,
  onSubmit,
  fieldId,
  initialValues = {},
  districtId,
  
}) => {
  const [formData, setFormData] = useState({
    name: initialValues?.name ?? "",
    value: initialValues?.value ?? "",
    controllingField: initialValues?.controllingField ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [stateCode, setStateCode] = useState<string>("");
  const [stateValue, setStateValue] = useState<string>("");
  const [states, setStates] = useState<State[]>([]);
  const [defaultStates, setDefaultStates] = useState<any>();
  const [userRole, setUserRole] = useState("");
  const [selectedState, setSelectedState] = React.useState<string[]>([]);
  const [fetchDistrict, setFetchDistrict] = useState(true);
  const [stateParentId, setStateParentId] = useState<any>("");

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  useEffect(() => {
    const storedUserData=localStorage.getItem("adminInfo")
    if(storedUserData){
      const userData = JSON.parse(storedUserData);
      setUserRole(userData.role);
    }
  }, []);
  useEffect(() => {
    const fetchUserDetail = async () => {
      let userId: any;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          userId = localStorage.getItem(Storage.USER_ID);
        }
        const response = await queryClient.fetchQuery({
          queryKey: [QueryKeys.USER_READ, userId, true],
          queryFn: () => getUserDetailsInfo(userId, true),
        });
        const statesField = response.userData.customFields.find(
          (field: { label: string }) => field.label === "STATES"
        );
        const storedUserData=localStorage.getItem("adminInfo")
        let userData;
        if(storedUserData){
           userData = JSON.parse(storedUserData);
        }
       
            if(userData?.role===Role.CENTRAL_ADMIN)
       {

        const result= await formatedStates();
         console.log("result", result)
         setStates(result)
         setStateCode(result[0]?.value);
         setStateParentId(result[0]?.cohortId);
         setSelectedState(result[0]?.label);
         setDefaultStates(result[0]);
         setFormData((prev) => ({
          ...prev,
          controllingField: result[0]?.value,
        }));
       }
       else if (statesField) {
          setStateValue(statesField.value);
          setStateCode(statesField.code);
          setFormData((prev) => ({
            ...prev,
            controllingField: statesField.code,
          }));
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (open) {
      fetchUserDetail();
    }
  }, [open, userRole]);

  useEffect(() => {
    setFormData({
      name: initialValues.name ?? "",
      value: initialValues.value ?? "",
      controllingField: initialValues.controllingField ?? stateCode,
    });
    setErrors({});
  }, [initialValues, stateCode]);

  const isValidName = (input: string) =>
    /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(input);

  const isValidCode = (input: string) => /^[A-Z]{1,3}$/.test(input);

  const handleChange = (field: string, value: string) => {
    if (field === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }

    if (field === "value" && value.length > 3) {
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors: { name?: string; value?: string } = {};

    if (!formData.name) {
      newErrors.name = t("COMMON.DISTRICT_NAME_REQUIRED");
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
      onSubmit(
        formData.name,
        formData.value,
        formData.controllingField || stateCode,
        fieldId,
        //districtId,
        stateParentId
      );
      setFormData({
        name: "",
        value: "",
        controllingField: "",
      });
      onClose();
    }
  };
  const handleStateChangeWrapper = async (
    selectedNames: string[],
    selectedCodes: string[],
    cohortIdOfState?: string

  ) => {
    try {
       // setSelectedNames(selectedNames);
        setStateCode(selectedCodes[0]);
        setSelectedState(selectedNames);
        setFormData((prev) => ({
          ...prev,
          controllingField: selectedCodes[0],
        }));
        setStateParentId(cohortIdOfState);
        console.log("cohortIdOfState",cohortIdOfState);
    }
     catch (error) {
      console.log(error);
    }
  };
  const isEditing = !!initialValues.name;
  const isEditCode = !!initialValues.value;
  const buttonText = isEditing ? t("COMMON.UPDATE") : t("COMMON.SUBMIT");
  const dialogTitle = isEditing
    ? t("COMMON.UPDATE_DISTRICT")
    : t("COMMON.ADD_DISTRICT");

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

        {userRole===Role.CENTRAL_ADMIN?(<>
          <MultipleSelectCheckmarks
              names={states?.map(
                (state) =>
                  state.label?.toLowerCase().charAt(0).toUpperCase() +
                  state.label?.toLowerCase().slice(1)
              )}
              codes={states?.map((state) => state.value)}
              tagName={t("FACILITATORS.STATE")}
              selectedCategories={initialValues.controllingFieldLabel ? [initialValues.controllingFieldLabel] : selectedState}
              onCategoryChange={handleStateChangeWrapper}
              cohortIds={states?.map((state) => state.cohortId)}

              disabled={isEditing}
              // overall={!inModal}
             width="293px"
              defaultValue={defaultStates?.label}
            />
        </>):(<Select
          value={formData.controllingField || stateCode}
          onChange={(e) => handleChange("controllingField", e.target.value)}
          fullWidth
          displayEmpty
          variant="outlined"
          margin="dense"
          error={!!errors.controllingField}
          disabled
        >
          <MenuItem key={stateCode} value={stateCode}>
            {stateValue}
          </MenuItem>
        </Select>)}

        {errors.controllingField && (
          <Typography variant="caption" color="error">
            {errors.controllingField}
          </Typography>
        )}
        <TextField
          margin="dense"
          label={t("COMMON.DISTRICT_NAME")}
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
          label={t("COMMON.DISTRICT_CODE")}
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

export default AddDistrictModal;
