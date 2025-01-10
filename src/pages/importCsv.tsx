import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterSearchBar from "@/components/FilterSearchBar";
import { useRouter } from "next/router";
import cardData from "@/data/cardData";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import AttachmentIcon from "@mui/icons-material/Attachment";
import FileUploadDialog from "@/components/FileUploadDialog";
import { useTranslation } from "next-i18next";
import Loader from "@/components/Loader";
import { CoursePlannerMetaData } from "@/utils/Interfaces";
import {
  getSolutionDetails,
  getTargetedSolutions,
  getUserProjectDetails,
  getUserProjectTemplate,
  uploadCoursePlanner,
} from "@/services/coursePlanner";
import { showToastMessage } from "@/components/Toastify";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import dayjs from "dayjs";
import { Role } from "@/utils/app.constant";
import coursePlannerStore from "@/store/coursePlannerStore";
import taxonomyStore from "@/store/tanonomyStore";
import Papa from "papaparse";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LinkIcon from "@mui/icons-material/Link";
import { monthColors } from "@/utils/app.constant";

const ImportCsv = () => {
  const router = useRouter();
  const store = coursePlannerStore();
  const tstore = taxonomyStore();
  const { subject } = router.query;
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPanels, setExpandedPanels] = useState<{
    [key: string]: boolean;
  }>({
    "panel0-header": true,
    "panel1-header": true,
    "panel2-header": true,
    "panel3-header": true,
  });
  const [userProjectDetails, setUserProjectDetails] = useState([]);
  const [subTopics, setSubTopics] = useState<number>(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const setResources = taxonomyStore((state) => state.setResources);

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTargetedSolutions({
        subject: tstore?.taxonomySubject,
        class: tstore?.taxonomyGrade,
        state: localStorage.getItem("selectedState") || tstore?.state,
        board: tstore?.board,
        courseType: tstore?.taxonomyType,
        medium: tstore?.taxonomyMedium,
      });

      const courseData = response?.result?.data[0];
      let courseId = courseData._id;

      if (!courseId) {
        courseId = await fetchCourseIdFromSolution(courseData?.solutionId);
      }

      await fetchAndSetUserProjectDetails(courseId);
    } catch (error) {
      console.error("Error fetching course planner:", error);
      setLoading(false);
    }
  }, [open]);

  const fetchCourseIdFromSolution = async (
    solutionId: string
  ): Promise<string> => {
    try {
      const solutionResponse = await getSolutionDetails({
        id: solutionId,
        role: "Teacher",
      });

      const externalId = solutionResponse?.result?.externalId;

      const templateResponse = await getUserProjectTemplate({
        templateId: externalId,
        solutionId,
        role: Role.TEACHER,
      });

      const updatedResponse = await getTargetedSolutions({
        subject: tstore?.taxonomySubject,
        class: tstore?.taxonomyGrade,
        state: localStorage.getItem("selectedState") || tstore?.state,
        board: tstore?.board,
        courseType: tstore?.taxonomyType,
        medium: tstore?.taxonomyMedium,
      });
      setLoading(false);
      return updatedResponse.result.data[0]._id;
    } catch (error) {
      console.error("Error fetching solution details:", error);
      throw error;
    }
  };

  const fetchAndSetUserProjectDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const userProjectDetailsResponse = await getUserProjectDetails({
        id: courseId,
      });
      setUserProjectDetails(userProjectDetailsResponse?.result?.tasks);
      if (userProjectDetails?.length) {
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user project details:", error);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const handleBackClick = () => {
    router.back();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleDownloadCSV = () => {
    const link = document.createElement("a");
    link.href = "/Sample.csv";
    link.download = "Sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const metaData: CoursePlannerMetaData = {
        subject: tstore?.taxonomySubject,
        class: tstore?.taxonomyGrade,
        state: localStorage.getItem("selectedState") || tstore?.state,
        board: tstore?.board,
        type: tstore?.taxonomyType,
        medium: tstore?.taxonomyMedium,
      };

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          const data = results.data;

          const addTimestamp = (data: any[]) => {
            const timestamp = Date.now();

            const updatedData = data.map((item) => {
              const newItem = { ...item };

              if (newItem.externalId) {
                newItem.externalId = `${newItem.externalId}${timestamp}`;
              }
              if (newItem.parentTaskId) {
                newItem.parentTaskId = `${newItem.parentTaskId}${timestamp}`;
              }

              return newItem;
            });

            return updatedData;
          };

          const convertToFile = (updatedData: any[]) => {
            const csv = Papa.unparse(updatedData);

            const blob = new Blob([csv], { type: "text/csv" });
            const file = new File([blob], "updated_data.csv", {
              type: "text/csv",
            });

            return file;
          };

          const updatedData = addTimestamp(data);
          const csvFile = convertToFile(updatedData);

          try {
            const response = await uploadCoursePlanner(csvFile, metaData);
            

            if (
              response.result.solutionData.message ===
              "Solution created successfully"
            ) {
              showToastMessage(
                t("COURSE_PLANNER.COURSE_CREATED_SUCCESSFULLY"),
                "success"
              );
              setSelectedFile(null);
              setOpen(false);
            } else {
              setSelectedFile(null);
              showToastMessage(t("COURSE_PLANNER.COURSE_NOT_CREATED"), "error");
            }
          } catch (error) {
            console.error("Upload failed:", error);
            showToastMessage(t("COURSE_PLANNER.UPLOAD_FAILED"), "error");
          }
        },
        error: (error: any) => {
          console.error("Error parsing file:", error);
          showToastMessage(t("COURSE_PLANNER.PARSE_ERROR"), "error");
        },
      });
    }
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(
      () => {
        alert("Link copied to clipboard");
      },
      (err) => {
        console.error("Failed to copy link: ", err);
      }
    );
  };

  if (loading) {
    return <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />;
  }

  const getAbbreviatedMonth = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    const months = Array.from({ length: 12 }, (_, i) =>
      dayjs().month(i).format("MMM")
    );
    return months[date.getMonth()];
  };

  const handleResources = (subTopic: any) => {
    setResources(subTopic);
    router.push({
      pathname: "/resourceList",
    });
  };

  const totalChildren = userProjectDetails?.reduce(
    (acc: number, project: any) => {
      return acc + (project?.children?.length || 0);
    },
    0
  );

  if (totalChildren !== subTopics) {
    setSubTopics(totalChildren);
  }

  return (
    <Box sx={{ padding: isSmallScreen ? "16px" : "32px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexDirection: isSmallScreen ? "column" : "row",
          gap: isSmallScreen ? "16px" : "0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <IconButton onClick={handleBackClick}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isSmallScreen ? "h5" : "h2"}>
            {tstore.taxonomySubject}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            variant="contained"
            sx={{
              borderRadius: "8px",
              backgroundColor: "#000000",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
            onClick={handleClickOpen}
          >
            {t("COURSE_PLANNER.IMPORT_PLANNER")}
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderRadius: "8px",
              color: "#000000",
              borderColor: "#000000",
              "&:hover": {
                borderColor: "#333333",
                color: "#333333",
              },
            }}
            onClick={handleDownloadCSV}
          >
            {t("COURSE_PLANNER.DOWNLOAD_SAMPLE_CSV")}
          </Button>
          <Button
            sx={{
              borderRadius: "8px",
              color: "#000000",
              borderColor: "#000000",
              "&:hover": {
                borderColor: "#333333",
                color: "#333333",
              },
            }}
            onClick={handleCopyLink}
          >
            {/* <AttachmentIcon /> */}
          </Button>
        </Box>
      </Box>

      <Box>
        {loading ? (
          <Loader showBackdrop={true} loadingText={t("COMMON.LOADING")} />
        ) : (
          <>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
              <Typography>
                {userProjectDetails?.length} {t("COURSE_PLANNER.TOPIC")}{" "}
                <FiberManualRecordIcon
                  sx={{ fontSize: "10px", color: "#CDC5BD" }}
                />
              </Typography>
              <Typography sx={{ marginLeft: "5px" }}>
                {subTopics} {t("COURSE_PLANNER.SUBTOPICS")}{" "}
              </Typography>
            </Box>

            <Box
              mt={2}
              sx={{ border: `1px solid #FFCCCC`, p: 2, borderRadius: "5px" }}
            >
              {userProjectDetails.length > 0 ? (
                userProjectDetails.map((topic: any, index) => (
                  <Box key={topic._id} sx={{ borderRadius: "8px", mb: 2 }}>
                    <Accordion
                      expanded={expandedPanels[`panel${index}-header`] || false}
                      onChange={() =>
                        setExpandedPanels((prev) => ({
                          ...prev,
                          [`panel${index}-header`]:
                            !prev[`panel${index}-header`],
                        }))
                      }
                      sx={{
                        boxShadow: "none",
                        border: "none",
                        transition: "0.3s",
                        "&.Mui-expanded": {
                          background: "#FFF8F2",
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ArrowDropDownIcon sx={{ color: "black" }} />
                        }
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                        sx={{
                          px: "16px",
                          m: 0,
                          "&.Mui-expanded": {
                            minHeight: "48px",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Typography
                              fontWeight="500"
                              fontSize="14px"
                              color="black"
                            >
                              {`Topic ${index + 1} - ${topic.name}`}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              fontWeight="600"
                              fontSize="12px"
                              color="#7C766F"
                            >
                              {getAbbreviatedMonth(
                                topic?.metaInformation?.startDate
                              )}
                              ,{" "}
                              {getAbbreviatedMonth(
                                topic?.metaInformation?.endDate
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <Box
                        sx={{
                          background: "white",
                          fontSize: "14px",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          padding: "10px 25px 0px 25px",
                          borderRadius: "8px",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          {t("COURSE_PLANNER.SUB-TOPIC")}
                        </Box>
                        <Box sx={{ flex: 1, textAlign: "center" }}>
                          {t("COURSE_PLANNER.RESOURCES")}
                        </Box>
                        <Box sx={{ flex: 1, textAlign: "right" }}>
                          {t("COURSE_PLANNER.DURATION/MONTH")}
                        </Box>
                      </Box>

                      <AccordionDetails
                        sx={{
                          padding: "20px",
                          transition: "max-height 0.3s ease-out",
                          backgroundColor: "white",
                        }}
                      >
                        {topic.children.map((subTopic: any) => (
                          <Box
                            key={subTopic._id}
                            onClick={() => handleResources(subTopic)}
                            sx={{
                              border: `1px solid #E0E0E0`,
                              padding: "10px",
                              backgroundColor: "white",
                              marginBottom: "20px",
                              cursor: "pointer",
                            }}
                          >
                            <Box
                              sx={{
                                py: "10px",
                                px: "16px",
                                background: "white",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontWeight: 500,
                                  }}
                                >
                                  <FolderOutlinedIcon /> {subTopic.name}
                                </Box>
                                <Box
                                  sx={{
                                    flex: 1,
                                    textAlign: "center",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#7C766F",
                                  }}
                                >
                                  {`${subTopic?.learningResources?.length} ${t("COURSE_PLANNER.RESOURCES")}`}
                                </Box>
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      padding: "5px",
                                      background: (() => {
                                        const month = getAbbreviatedMonth(
                                          subTopic?.metaInformation?.startDate
                                        );
                                        return monthColors[month] || "#FFD6D6";
                                      })(),
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      color: "#4D4639",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    {getAbbreviatedMonth(
                                      subTopic?.metaInformation?.startDate
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                ))
              ) : (
                <Typography textAlign="center" color="gray">
                  {t("COMMON.NO_DATA_FOUND")}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      <FileUploadDialog
        open={open}
        onClose={handleClose}
        onFileChange={handleFileChange}
        selectedFile={selectedFile}
        onRemoveFile={handleRemoveFile}
        onUpload={handleUpload}
      />
    </Box>
  );
};

export default ImportCsv;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
