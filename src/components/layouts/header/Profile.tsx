import CommonUserModal from "@/components/CommonUserModal";
import { FormContextType, Role, TelemetryEventType } from "@/utils/app.constant";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FeatherIcon from "feather-icons-react";
import { useTranslation } from "next-i18next";
import React, { useEffect } from "react";

import { getFormRead } from "@/services/CreateUserService";
import { getUserDetailsInfo } from "@/services/UserList";
import { Storage } from "@/utils/app.constant";
import { firstLetterInUpperCase } from "@/utils/Helper";
import useSubmittedButtonStore from "@/utils/useSharedState";
import LogoutIcon from "@mui/icons-material/Logout";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIcon from "@mui/icons-material/Phone";
import { Box, Button, Divider, Menu, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { telemetryFactory } from "@/utils/telemetry";
import EditIcon from '@mui/icons-material/Edit';
const Profile = () => {
  const [anchorEl4, setAnchorEl4] = React.useState<null | HTMLElement>(null);
  const [profileClick, setProfileClick] = React.useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [userName, setUserName] = React.useState<string | null>("");
  const [userId, setUserId] = React.useState<string>("");
  const [adminInfo, setAdminInfo] = React.useState<any>();

  const [formdata, setFormData] = React.useState<any>();
  const adminInformation = useSubmittedButtonStore(
    (state: any) => state?.adminInformation
  );
  
  const [submitValue, setSubmitValue] = React.useState<boolean>(false);

  const { t } = useTranslation();
  const setAdminInformation = useSubmittedButtonStore(
    (state: any) => state.setAdminInformation
  );
  const router = useRouter();

  const handleClick4 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl4(event.currentTarget);
    setProfileClick(true);
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, '');
    const env = cleanedUrl.split("/")[0];


    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: 'click-on-profile',
        type: TelemetryEventType.CLICK,
        subtype: '',
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  const handleClose4 = () => {
    setAnchorEl4(null);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("token");
    }
    router.push("/logout");
  };

  const mapFields = (formFields: any, response: any) => {
    const initialFormData: any = {};
    formFields.fields.forEach((item: any) => {
      const userData = response?.userData;
      const customFieldValue = userData?.customFields?.find(
        (field: any) => field.fieldId === item.fieldId
      );

      const getValue = (data: any, field: any) => {
        
        if (item.default) {
          return item.default;
        }
        if (item?.isMultiSelect) {
          if (data[item.name] && item?.maxSelections > 1) {
            return [field?.value];
          } else if (item?.type === "checkbox") {
             

            return String(field?.value).split(",");
          } else {
            return field?.value?.toLowerCase();
          }
        } else {
          if (item?.type === "numeric") {
            return parseInt(String(field?.value));
          } else if (item?.type === "text") {
            return String(field?.value);
          } else {
            if (field?.value === "FEMALE" || field?.value === "MALE") {
              
              return field?.value?.toLowerCase();
            }
             
            return field?.value?.toLowerCase();
          }
        }
      };

      if (item.coreField) {
        if (item?.isMultiSelect) {
          if (userData[item.name] && item?.maxSelections > 1) {
            initialFormData[item.name] = [userData[item.name]];
          } else if (item?.type === "checkbox") {
             

            initialFormData[item.name] = String(userData[item.name]).split(",");
          } else {
            initialFormData[item.name] = userData[item.name];
          }
        } else if (item?.type === "numeric") {
           
          initialFormData[item.name] = Number(userData[item.name]);
        } else if (item?.type === "text" && userData[item.name]) {
          initialFormData[item.name] = String(userData[item.name]);
        } else {
           
          if (userData[item.name]) {
            initialFormData[item.name] = userData[item.name];
          }
        }
      } else {
        const fieldValue = getValue(userData, customFieldValue);

        if (fieldValue) {
          initialFormData[item.name] = fieldValue;
        }
      }
    });

     
    return initialFormData;
  };
  const handleEditClick = async (rowData: any) => {
    handleClose4();
    if (submitValue) {
      setSubmitValue(false);
    } 
    try {
      const fieldValue = true;
      const response = await getUserDetailsInfo(
        adminInformation?.userId,
        fieldValue
      );
    

      let formFields;
      if (Role.STUDENT === adminInformation?.role) {
        formFields = await getFormRead("USERS", "STUDENT");
        setFormData(mapFields(formFields, response));
         
      } else if (Role.TEACHER === adminInformation?.role) {
        

        formFields = await getFormRead("USERS", "TEACHER");
        setFormData(mapFields(formFields, response));
      } else if (Role.TEAM_LEADER === adminInformation?.role) {
        formFields = await getFormRead("USERS", "TEAM LEADER");
        setFormData(mapFields(formFields, response));
      } else {
        formFields = await getFormRead("USERS", "ADMIN");
        setFormData(mapFields(formFields, response));
      }
      handleOpenEditModal();

     
    } catch (error) {
      console.log(error);
    }
  };

  const getUserName = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const name = localStorage.getItem(Storage.NAME);
      setUserName(name);
    }
  };
  const handleCloseAddLearnerModal = () => {
    setOpenEditModal(false);
  };
  const handleOpenEditModal = () => {
    setOpenEditModal(true);
  };

  useEffect(() => {
    getUserName();
  }, [formdata]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const admin = localStorage.getItem("adminInfo");
      if (admin && admin !== "undefined") setAdminInfo(JSON?.parse(admin)||{});
    }
  }, []);

  const handleModalSubmit = (value: boolean) => {
    submitValue ? setSubmitValue(false) : setSubmitValue(true);
  };
  const userType = (() => {
    switch (adminInfo?.role) {
      case Role.STUDENT:
        return FormContextType.STUDENT;
      case Role.TEACHER:
        return FormContextType.TEACHER;
      case Role.ADMIN:
        return FormContextType.ADMIN;
      default:
        return FormContextType.TEAM_LEADER;
    }
  })();

  const handleEditPassword = () => {
    handleClose4(); // Close the menu first
    router.push('/edit-password'); // Then navigate to the edit password page
  };


  return (
    <>
      <Button
        aria-label="menu"
        color="inherit"
        aria-controls="profile-menu"
        aria-haspopup="true"
        onClick={handleClick4}
        sx={{
          border: "none",
          paddingLeft: "0px !important",
          paddingRight: "0px !important",
          '@media (max-width: 600px)': {
            minWidth: "0px !important",
          }
        }}
      >
        <Box display="flex" alignItems="center" color="white">
          <AccountCircleIcon />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              // ml: 1,
              '@media (max-width: 600px)': {
                display: 'none'
              }
            }}
          >
            <Typography
              variant="body1"
              fontWeight="400"
              sx={{
                ml: 1,
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "16px",
                whiteSpace: "nowrap",
              }}
            >
              {t("COMMON.HI", { name: firstLetterInUpperCase(userName ?? "") })}
            </Typography>

            <FeatherIcon icon="chevron-down" size="20" />
          </Box>
        </Box>
      </Button>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl4}
        open={Boolean(anchorEl4)}
        onClose={handleClose4}
        sx={{
          paddingTop: "0px",
          //backgroundColor: "#F8EFE7",
        }}
        PaperProps={{
          sx: {
            // width: "500px",
            minWidth: "320px",
            borderRadius: "12px",
          },
        }}
        MenuListProps={{
          sx: {
            paddingTop: "50px !important",
            paddingBottom: "0px !important",
          },
        }}
      >
        {/* <Box
          sx={{ backgroundColor: "#F8EFE7", height: "56px", width: "100%" }}
        ></Box> */}
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "-25px" }}
        >
          <Box
            sx={{
              backgroundColor: "#78590C",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              color="white"
              sx={{ fontWeight: "bold", fontSize: "18px" }}
            >
              {adminInfo?.name &&
                `${adminInfo.name.split(" ")[0][0]}${adminInfo.name.split(" ").slice(-1)[0][0]}`}
            </Typography>


          </Box>
        </Box>

        <Box
          sx={{
            position: "relative",
            // marginTop:"10px",
            // borderRadius: "10px",
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              marginBottom: "15px",
              marginTop: "10px",
              textAlign: "center",
              px: "20px",
              fontSize: "16px",
            }}
          >
            {adminInfo?.name}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: "20px",
              textAlign: "center",
              px: "20px",
              color: "#7C766F",
              fontSize: "14px",
            }}
          >
            {adminInfo?.role}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              px: "20px",
            }}
          >
            <PhoneIcon sx={{ marginRight: "10px" }} />
            <Typography variant="body1" sx={{ fontSize: "14px" }}>
              {adminInfo?.mobile}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              px: "20px",
            }}
          >
            <MailIcon sx={{ marginRight: "10px" }} />
            <Typography variant="body1" sx={{ fontSize: "14px" }}>
              {adminInfo?.email}
            </Typography>
          </Box>

          <Divider sx={{ color: "#D0C5B4" }} />
          <Box sx={{ px: "20px", display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center", '@media (max-width: 434px)': { flexDirection: 'column', justifyContent: 'center', alignItems: 'center'   }  }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleEditPassword}
              sx={{
                fontSize: "16px",
                backgroundColor: "white",
                border: "0.6px solid #1E1B16",
                my: "20px",
                width: "408px",
                '@media (max-width: 434px)': { width: '100%' }

              }}
              endIcon={<EditIcon />}
            >
              {t('LOGIN_PAGE.RESET_PASSWORD')}
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{
                fontSize: "16px",
                backgroundColor: "#FDBE16",
                border: "0.6px solid #1E1B16",
                my: "20px",
                '@media (max-width: 434px)': { my: '0px', mb:'20px' }
              }}
              endIcon={<LogoutIcon />}
            >
              {t("COMMON.LOGOUT")}
            </Button>

          </Box>
        </Box>
      </Menu>
      {openEditModal && (
        <CommonUserModal
          open={openEditModal}
          onClose={handleCloseAddLearnerModal}
          formData={formdata}
          isEditModal={true}
          userId={userId}
          onSubmit={handleModalSubmit}
          userType={userType}
        />
      )}
    </>
  );
};

export default Profile;
