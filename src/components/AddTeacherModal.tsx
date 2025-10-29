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
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { userList } from "@/services/UserList";
import { addCohortMember, createCohort, updateCohortUpdate, updateCohortMember } from "@/services/CohortService/cohortService";
import Loader from "@/components/Loader";
import { useTranslation } from "next-i18next";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

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
  title = "Create / Update Class"
}) => {
  const { t } = useTranslation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [className, setClassName] = useState<string>("22");
  const [createdCohortId, setCreatedCohortId] = useState<string | null>(null);
  const [fromTime, setFromTime] = useState<dayjs.Dayjs | null>(null);
  const [toTime, setToTime] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);

  const currentCohortId = currentCohort?.cohortId || null;
  const schoolCohortId = currentCohort?.parentId || null;
  const cohortClass = currentCohort?.name || "";
  const techerId = currentCohort?.teacherId || null;
  const slot = currentCohort?.teacherSlot || null;
  useEffect(() => {
    if (open) {
      setLoading(true);
      const ls = localStorage.getItem("schoolClusterNames");
      const schools = ls ? Object.entries(JSON.parse(ls)).map(([id, school]) => ({
          label: (school as any).name + " (" + (school as any).clusterName + ") ",
          value: id,
          raw: school
        })) : [];
      setSchools(schools || []);
      // Pre-populate fields if props are provided
      if (schoolCohortId) {
        const foundSchool = schools.find((s: any) => s.value === schoolCohortId);
        setSelectedSchool(foundSchool || null);
      } else {
        setSelectedSchool(null);
      }
      setClassName(cohortClass || "");
      setCreatedCohortId(null);

      fetchUsers();
    } else {
      // Reset form when modal closes
      setSelectedUser(null);
      setFromTime(null);
      setToTime(null);
      setCreatedCohortId(null);
      setClassName("");
      setSelectedSchool(null);
      setHasChanges(false);
    }
  }, [open]);
  
  const fetchUsers = async () => {
    try {
      const resp = await userList({
        limit: 0, // Get all users
        offset: 0,
       filters : {
          role: 'Teacher',
          status: 'active'
        }
      });
      setUsers(resp?.getUserDetails || []);
      setLoading(false);

      if (techerId && users.length > 0) {
        const foundTeacher = users.find((u: any) => u.userId === techerId);
        setSelectedUser(foundTeacher || null);
      } else {
        setSelectedUser(null);
      }
    
      if (slot) {
        // slot format: '09:00 AM - 12:30 PM'
        const [from, to] = slot.split(' - ');
        setFromTime(from ? dayjs(from, 'hh:mm A') : null);
        setToTime(to ? dayjs(to, 'hh:mm A') : null);
      } else {
        setFromTime(null);
        setToTime(null);
      }

    } catch (error) {
      setLoading(false);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (fromDate: dayjs.Dayjs | null, toDate: dayjs.Dayjs | null): string | null => {
    if (!fromDate || !toDate) return null;
    return `${fromDate.format('hh:mm A')} - ${toDate.format('hh:mm A')}`;
  };

  // Step 1: Create class (cohort)
  // Step 2: Add teacher to created class
  const handleClassSubmit = async () => {
    if (!selectedSchool || !className || !selectedUser || !fromTime || !toTime) {
      return;
    }
    console.log(currentCohort);
    return;
    let resp, cohortId;
    let msg = "Cohort created successfully";

    try {
      const cohortPayload = {
        name: className,
        type: "COHORT",
        parentId: selectedSchool.value,
      };
       if (currentCohort?.cohortId){
          resp = await updateCohortUpdate(currentCohort?.cohortId, cohortPayload);
          if (resp?.responseCode === 200) {
            msg  = "Cohort updated successfully";
            cohortId = currentCohort?.cohortId
          }
       }
       else {
          resp = await createCohort(cohortPayload);
          if (resp && resp.cohortId) {
            cohortId = resp.cohortId;
          }
       }
      if (cohortId) {
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Failed to create class:", error);
    }
  
    try {
      if (!cohortId) {
        console.error("Failed to create class. Cannot add teacher.");
        return;
      }
      if (currentCohort?.teacherMemberId) {
        await updateCohortMember({
          membershipId: currentCohort?.teacherMemberId,
          payload: {
            userIds: [selectedUser.userId],
            timeSlot: formatTimeSlot(fromTime, toTime)
          }
        });
      }
      const timeSlot = formatTimeSlot(fromTime, toTime);
      const payload = {
        selectAll: false,
        userIds: [selectedUser.userId],
        cohortId: cohortId,
        timeSlot
      };
      await addCohortMember(payload);
      setSnackbarOpen(true);
      if (onAdd) {
        onAdd(payload);
      }
      onClose();
    } catch (error) {
      console.error("Failed to add teacher:", error);
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
          sx: { minHeight: 300 }
        }}
      >
        <DialogTitle>{title}</DialogTitle>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>          
              {/* Step 1: School and class name */}
              <Autocomplete
                options={schools}
                getOptionLabel={(option: any) => `${option.label}`}
                value={selectedSchool}
                onChange={(_event: React.SyntheticEvent, newValue: any | null) => {
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
                onChange={e => {
                  setClassName(e.target.value);
                  setHasChanges(true);
                }}
                variant="outlined"
              />
              
              {/* Step 2: Teacher and time slot, only after class is created */}
              <Autocomplete
                options={users}
                getOptionLabel={(option: User) => `${option.name} (${option.email})`}
                value={selectedUser}
                onChange={(_event: React.SyntheticEvent, newValue: User | null) => {
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <DesktopTimePicker
                      label="From Time"
                      value={fromTime}
                      onChange={(newValue) => {
                        setFromTime(newValue);
                        setHasChanges(true);
                      }}
                      views={['hours', 'minutes']}
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
                      views={['hours', 'minutes']}
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
            {
            (currentCohortId ? t("COMMON.UPDATE") : t("COMMON.ADD")) 
            }
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
          Teacher added successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddTeacherModal;