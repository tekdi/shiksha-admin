import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Image from "next/image";
import appLogo from "../../public/images/Logo.svg";
import { Role, Status } from "@/utils/app.constant";
import shareIcon from "../../public/images/share_windows.svg";
import shareIconPublish from "../../public/images/share_publish.svg";

import {
  convertAllImagesToDataUrls,
  convertImageToDataURL,
  mapFields,
  firstLetterInUpperCase,
} from "@/utils/Helper";

import {
  deleteProgram,
  getProgramList,
  programSearch,
  updateProgram,
} from "@/services/ProgramServices";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { showToastMessage } from "./Toastify";
import { useTranslation } from "next-i18next";
import { getFormRead } from "@/services/CreateUserService";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import AddProgram from "./AddProgram";
import ConfirmationModal from "./ConfirmationModal";

interface ProgramCardProps {
  programId: string;
  programName: string;
  description: string;
  imageUrl: string[];
  status?: string;
  userRole?: string;
}
const images = [appLogo];

const ProgramCard: React.FC<ProgramCardProps> = ({
  programId,
  programName,
  description,
  imageUrl,
  status,
  userRole,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const fetchPrograms = useSubmittedButtonStore(
    (state: any) => state.fetchPrograms
  );
  const setFetchPrograms = useSubmittedButtonStore(
    (state: any) => state.setFetchPrograms
  );
  const { t } = useTranslation();
  const [editFormData, setEditFormData] = useState<any>([]);
  const [openAddNewProgram, setOpenAddNewProgram] =
    React.useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<any>();

  console.log("programId:", programId);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleCloseAddProgram = () => {
    setOpenAddNewProgram(false);
    // setSubmittedButtonStatus(false);
  };
  const handleMenuDelete = async () => {
    // setAnchorEl(null);
    try {
      const tenantId = programId;
      const programData = {
        status: "archived",
      };
      const response = await updateProgram(programData, tenantId);

      setFetchPrograms(!fetchPrograms);
      setAnchorEl(null);
      showToastMessage(
        t("PROGRAM_MANAGEMENT.PROGRAM_DELETED_SUCCESS"),
        "success"
      );
    } catch (e) {
      console.log(e);
      setAnchorEl(null);
    }
  };
  const fetchDataUrl = async (imageUrl: string) => {
    const response = await fetch(
      `/api/convert-image?imageUrl=${encodeURIComponent(imageUrl)}`
    );
    const data = await response.json();
    return data.dataUrl;
  };

  const handleMenuEdit = async () => {
    const programSearchObject = {
      limit: 200,
      offset: 0,
      filters: {
        tenantId: programId,

        status: ["published", "draft"],
      },
    };
    const result = await programSearch(programSearchObject);
    console.log(result?.getTenantDetails[0]);
    const formFields = await getFormRead("TENANT", "TENANT");

    // const editProgram = result?.result.find((item: any) => item.tenantId === programId);
    const formData = mapFields(formFields, result?.getTenantDetails[0]);

    if (formData?.programImages?.length > 0) {
      const updatedImages = await Promise.all(
        formData?.programImages?.map(async (imagePath: any, index: any) => {
          const response = await fetch(
            `/api/get-image-dataurl?imageUrl=${encodeURIComponent(imagePath)}`
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch Data URL for image at index ${index}`
            );
          }

          const data = await response.json();
          console.log("dataurl", data);
          return data.dataUrl;
        })
      );

      // Update the formData with the Data URLs
      formData.programImages = updatedImages;
    }
    setEditFormData(formData);
    setOpenAddNewProgram(true);
    setAnchorEl(null);
    // }
    // convertImageToDataURL(
    //   formData?.programImages[0],
    //   function (dataUrl: string) {
    //     console.log("Image as Data URL:", dataUrl);
    //   }
    // );
  };
  console.log("setEditFormData", editFormData);
  const handleCloseModel = () => {
    setModalOpen(false);
  };

  const handleStatusModal = () => {
    setSelectedMenu(2);
    setAnchorEl(null);
    setModalOpen(true);
  };
  const handleDeleteModal = () => {
    setSelectedMenu(3);
    setAnchorEl(null);
    setModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      const tenantId = programId;
      const statusValue =
        status === Status.DRAFT ? Status.PUBLISHED : Status.DRAFT;

      const programData = {
        status: statusValue,
      };
      const response = await updateProgram(programData, tenantId);

      setFetchPrograms(!fetchPrograms);
      setAnchorEl(null);
      if (statusValue === Status.DRAFT) {
        showToastMessage(t("PROGRAM_MANAGEMENT.PROGRAM_DRAFT"), "success");
      } else if (statusValue === Status.PUBLISHED) {
        showToastMessage(
          t("PROGRAM_MANAGEMENT.PROGRAM_PUBLISHED_SUCCESS"),
          "success"
        );
      }
    } catch (e) {
      console.log(e);
      setAnchorEl(null);
    }
  };
  const getMessage = () => {
    if (modalOpen)
      return selectedMenu === 2
        ? status === Status.DRAFT
          ? t("PROGRAM_MANAGEMENT.SURE_TO_PUBLISH_PROGRAM")
          : t("PROGRAM_MANAGEMENT.SURE_TO_REVERT_PROGRAM")
        : t("PROGRAM_MANAGEMENT.SURE_PROGRAM_DELETE");
    return "";
  };
  return (
    <>
      <Card
        sx={{
          width: "300px",
          height: "300px",
          borderRadius: 2,
          border: "1px solid #D0C5B4",
        }}
      >
        {/* Program Image */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h6"
              ml={2}
              mt={2}
              component="div"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                letterSpacing: "0.15px",
              }}
            >
              {firstLetterInUpperCase(programName)}
            </Typography>
            {status !== Status.ARCHIVED && (
              <Typography
                variant="h6"
                ml={2}
                component="div"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0.15px",
                  color:
                    status === Status.DRAFT
                      ? "#987100"
                      : status === Status.PUBLISHED
                        ? "#1A8825"
                        : "black",
                }}
              >
                {status === Status.DRAFT
                  ? t("PROGRAM_MANAGEMENT.DRAFT")
                  : status === Status.PUBLISHED
                    ? t("PROGRAM_MANAGEMENT.PUBLISHED")
                    : t("PROGRAM_MANAGEMENT.ARCHIVED")}
              </Typography>
            )}
          </Box>

          {/* Menu Button */}
          {status !== Status.ARCHIVED && userRole === Role.CENTRAL_ADMIN && (
            <IconButton aria-label="settings" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>
        {/* Program Content */}
        <CardContent>
          {imageUrl[0] !== "No image available" ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              loop={true}
            >
              {" "}
              {imageUrl.map((src, index) => (
                <SwiperSlide key={index}>
                  <CardMedia
                    component="img"
                    height={"150px"}
                    image={src}
                    alt={"program image"}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Image
              src={appLogo}
              alt="App Logo"
              style={{ width: "200px", height: "150px" }}
            />
          )}

          {status !== Status.ARCHIVED && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Program Name */}

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuEdit}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  {t("PROGRAM_MANAGEMENT.EDIT_PROGRAM")}
                </MenuItem>
                {status !== Status.ARCHIVED && (
                  <MenuItem onClick={handleStatusModal}>
                    <Image
                      src={
                        status === Status.DRAFT ? shareIconPublish : shareIcon
                      }
                      alt=""
                    />
                    <Typography
                      sx={{
                        ml: 1,
                        color:
                          status === Status.DRAFT
                            ? "#1A8825"
                            : status === Status.PUBLISHED
                              ? "#987100"
                              : "black",
                      }}
                    >
                      {status === Status.DRAFT
                        ? t("PROGRAM_MANAGEMENT.PUBLISHED")
                        : status === Status.PUBLISHED
                          ? t("PROGRAM_MANAGEMENT.UNPUBLISHED")
                          : t("PROGRAM_MANAGEMENT.ARCHIVED")}
                    </Typography>
                  </MenuItem>
                )}
                <MenuItem onClick={handleDeleteModal}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1, color: "red" }} />
                  <Typography color="red">
                    {" "}
                    {t("PROGRAM_MANAGEMENT.DELETE_PROGRAM")}
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Program Description */}
          <Typography
            sx={{
              mt: 1,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              textOverflow: "ellipsis",
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "0.25px",
              width: "100%", // Ensures it fits the container
            }}
          >
            {description}
          </Typography>

          {/* Program ID */}
          {/* <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: "italic" }}>
          Program ID: {programId}
        </Typography> */}
        </CardContent>
      </Card>

      <AddProgram
        open={openAddNewProgram}
        onClose={handleCloseAddProgram}
        formData={editFormData}
        isEditModal={true}
        tenantId={programId}
      />
      <ConfirmationModal
        message={getMessage()}
        handleAction={
          selectedMenu === 2 ? handleStatusChange : handleMenuDelete
        }
        buttonNames={{
          primary:
            selectedMenu === 2
              ? status === Status.DRAFT
                ? t("PROGRAM_MANAGEMENT.PUBLISHED")
                : t("PROGRAM_MANAGEMENT.DRAFT")
              : t("COMMON.DELETE"),
          secondary: t("COMMON.CANCEL"),
        }}
        handleCloseModal={handleCloseModel}
        modalOpen={modalOpen}
      />
    </>
  );
};

export default ProgramCard;
