import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { cohortMemberList, userList } from "@/services/UserList";
import {
  bulkCreateCohortMembers,
  createCohort,
  updateCohortUpdate,
  assignTeacherToCohort,
  updateCohortMemberStatus,
  updateCohortMember,
} from "@/services/CohortService/cohortService";
import Loader from "@/components/Loader";
import { useTranslation } from "next-i18next";

interface User {
  userId: string;
  name: string;
  email: string;
}

interface AddTeacherModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (payload: any) => void;
  currentCohort: any;
  roleId: any;
  title?: string;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  open,
  onClose,
  onAdd,
  currentCohort,
  roleId,
  title = "Create / Update Class",
}) => {
  const { t } = useTranslation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [className, setClassName] = useState<string>("22");
  //const [createdCohortId, setCreatedCohortId] = useState<string | null>(null);
  const [fromTime, setFromTime] = useState<dayjs.Dayjs | null>(null);
  const [toTime, setToTime] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);
  // const [originalTeacherId, setOriginalTeacherId] = useState<string | null>(
  //   null
  // );
  // const [originalMembershipId, setOriginalMembershipId] = useState<
  //   string | null
  // >(null);
  //const [originalSchoolId, setOriginalSchoolId] = useState<string | null>(null);
  //const [originalClassName, setOriginalClassName] = useState<string>("");
  //const [originalTimeSlot, setOriginalTimeSlot] = useState<string | null>(null);
  //const [archivedTeachers, setArchivedTeachers] = useState<any[]>([]);

  const currentCohortId = currentCohort?.cohortId || null;
  const schoolCohortId = currentCohort?.parentId || null;
  const cohortClass = currentCohort?.name || "";
  const techerId = currentCohort?.teacherId || null;
  const slot = currentCohort?.teacherSlot || null;

  // Determine modal title based on whether we're creating or updating
  // Use provided title prop if it's not the default, otherwise compute dynamically
  const modalTitle =
    title && title !== "Create / Update Class"
      ? title
      : currentCohortId
        ? "Update Class"
        : "Create Class";
  useEffect(() => {
    if (open) {
      setLoading(true);
      const ls = localStorage.getItem("schoolClusterNames");
      const schools = ls
        ? Object.entries(JSON.parse(ls)).map(([id, school]) => ({
            label:
              (school as any).name + " (" + (school as any).clusterName + ") ",
            value: id,
            raw: school,
          }))
        : [];
      setSchools(schools || []);
      // Pre-populate fields if props are provided
      if (schoolCohortId) {
        const foundSchool = schools.find(
          (s: any) => s.value === schoolCohortId
        );
        setSelectedSchool(foundSchool || null);
      } else {
        setSelectedSchool(null);
      }
      setClassName(cohortClass || "");
      //setCreatedCohortId(null);

      // Store original values for comparison
      //setOriginalSchoolId(schoolCohortId);
      //setOriginalClassName(cohortClass || "");
      //setOriginalTimeSlot(slot || null);

      fetchUsers();
    } else {
      // Reset form when modal closes
      setSelectedUser(null);
      setFromTime(null);
      setToTime(null);
      //setCreatedCohortId(null);
      setClassName("");
      setSelectedSchool(null);
      setHasChanges(false);
      // setOriginalTeacherId(null);
      // setOriginalMembershipId(null);
      // setOriginalSchoolId(null);
      // setOriginalClassName("");
      // setOriginalTimeSlot(null);
      // setArchivedTeachers([]);
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const resp = await userList({
        limit: 0, // Get all users
        offset: 0,
        filters: {
          role: "Teacher",
          status: "active",
        },
      });
      const fetchedUsers = resp?.getUserDetails || [];
      setUsers(fetchedUsers);

      if (techerId && users.length > 0) {
        const foundTeacher = users.find((u: any) => u.userId === techerId);
        setSelectedUser(foundTeacher || null);

        // Set time slot if available
        if (slot) {
          // slot format: '09:00 AM - 12:30 PM'
          const [from, to] = slot.split(" - ");
          setFromTime(from ? dayjs(from, "hh:mm A") : null);
          setToTime(to ? dayjs(to, "hh:mm A") : null);
          // Store original time slot
          // setOriginalTimeSlot(timeSlot);
        } else {
          setFromTime(null);
          setToTime(null);
          // setOriginalTimeSlot(null);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (
    fromDate: dayjs.Dayjs | null,
    toDate: dayjs.Dayjs | null
  ): string | null => {
    if (!fromDate || !toDate) return null;
    return `${fromDate.format("hh:mm A")} - ${toDate.format("hh:mm A")}`;
  };

  // Step 1: Create/Update class (cohort) - only if school or class name changed
  // Step 2: Handle teacher changes - archive old teacher if changed, then add new teacher
  const handleClassSubmit = async () => {
    if (
      !selectedSchool ||
      !className ||
      !selectedUser ||
      !fromTime ||
      !toTime
    ) {
      return;
    }

    let cohortId = currentCohort?.cohortId || null;

    // Format time slot from fromTime and toTime
    const timeSlot = formatTimeSlot(fromTime, toTime);

    // Step 1: Update cohort only if school or class name changed
    if (currentCohort?.cohortId) {
      try {
        const cohortPayload = {
          name: className,
          type: "COHORT",
          parentId: selectedSchool.value,
        };
        const resp = await updateCohortUpdate(
          currentCohort?.cohortId,
          cohortPayload
        );
        if (resp?.responseCode !== 200) {
          console.error("Failed to update cohort");
          return;
        }
      } catch (error) {
        console.error("Failed to update cohort:", error);
        return;
      }
    } else if (!currentCohort?.cohortId) {
      // Create new cohort
      try {
        const cohortPayload = {
          name: className,
          type: "COHORT",
          parentId: selectedSchool.value,
        };
        const resp = await createCohort(cohortPayload);
        if (resp && resp.cohortId) {
          cohortId = resp.cohortId;
        } else {
          console.error("Failed to create cohort");
          return;
        }
      } catch (error) {
        console.error("Failed to create cohort:", error);
        return;
      }
    }

    // Step 2: Handle teacher changes
    try {
       // Add new teacher (or update if teacher didn't change but time slot might have)
        await assignTeacherToCohort({
          userId: selectedUser.userId,
          cohortId: cohortId,
          params: {
            slot: timeSlot,
          }
        });
      setSnackbarOpen(true);
      if (onAdd) onAdd({ userId: selectedUser.userId, cohortId: cohortId });
      onClose();
    } catch (error) {
      console.error("Failed to add/update teacher:", error);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { minHeight: 300 },
        }}
      >
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box
              width={"100%"}
              id="check"
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              minHeight={200}
              justifyContent="center"
            >
              <Loader showBackdrop={false} loadingText={"Loading..."} />
            </Box>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
            >
              {/* Step 1: School and class name */}
              <Autocomplete
                options={schools}
                getOptionLabel={(option: any) => `${option.label}`}
                value={selectedSchool}
                onChange={(
                  _event: React.SyntheticEvent,
                  newValue: any | null
                ) => {
                  setSelectedSchool(newValue);
                  setHasChanges(true);
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label="Select School"
                    variant="outlined"
                  />
                )}
                loading={loading}
                loadingText="Loading schools..."
              />
              <TextField
                label="Class Name"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value);
                  setHasChanges(true);
                }}
                variant="outlined"
              />

              {/* Step 2: Teacher and time slot, only after class is created */}
              <Autocomplete
                options={users}
                getOptionLabel={(option: User) =>
                  `${option.name} (${option.email})`
                }
                value={selectedUser}
                onChange={(
                  _event: React.SyntheticEvent,
                  newValue: User | null
                ) => {
                  setSelectedUser(newValue);
                  setHasChanges(true);
                }}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    label="Select Teacher"
                    variant="outlined"
                  />
                )}
                loading={loading}
                loadingText="Loading teachers..."
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FormControl fullWidth>
                    <DesktopTimePicker
                      label="From Time"
                      value={fromTime}
                      onChange={(newValue) => {
                        setFromTime(newValue);
                        setHasChanges(true);
                      }}
                      views={["hours", "minutes"]}
                      format="hh:mm A"
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <DesktopTimePicker
                      label="To Time"
                      value={toTime}
                      onChange={(newValue) => {
                        setToTime(newValue);
                        setHasChanges(true);
                      }}
                      minTime={fromTime || undefined}
                      views={["hours", "minutes"]}
                      format="hh:mm A"
                    />
                  </FormControl>
                </Box>
              </LocalizationProvider>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleClassSubmit}
            variant="contained"
            color="primary"
            disabled={!hasChanges || !selectedUser || !fromTime || !toTime}
          >
            {currentCohortId ? t("COMMON.UPDATE") : t("COMMON.ADD")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {currentCohortId
            ? t("COMMON.CLASS_UPDATED_SUCCESS")
            : t("COMMON.CLASS_ADDED_SUCCESS")}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddTeacherModal;
