import Loader from "@/components/Loader";
import coursePlannerStore from "@/store/coursePlannerStore";
import taxonomyStore from "@/store/tanonomyStore";
import {
  filterAndMapAssociations,
  findCommonAssociations,
  getAssociationsByCodeNew,
  getOptionsByCategory,
  normalizeData,
} from "@/utils/Helper";
import { TelemetryEventType } from "@/utils/app.constant";
import { telemetryFactory } from "@/utils/telemetry";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Card as MuiCard,
  Select,
  Typography
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FRAMEWORK_ID } from "../../app.config";

// Define Card interface
interface Card {
  id: number;
  state: string;
  boardsUploaded: number;
  totalBoards: number;
  boards: string[];
  subjects: string[];
}

interface FoundCard {
  id: string;
  state: string;
  boardsUploaded: number;
  totalBoards: number;
  details: string;
  boards: string[];
  subjects: string[];
}

const SubjectDetails = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { boardDetails, boardName } = router.query as {
    boardDetails?: any;
    boardName?: any;
  };
  const tStore = taxonomyStore();
  const store = coursePlannerStore();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string[]>([]);
  const [boardAssociations, setBoardAssociations] = useState<any[]>([]);
  const [medium, setMedium] = useState<any>([]);
  const [mediumOptions, setMediumOptions] = useState<any[]>([]);
  const [selectedmedium, setSelectedmedium] = useState<any>();
  const [mediumAssociations, setMediumAssociations] = useState<any[]>([]);
  const [gradeAssociations, setGradeAssociations] = useState<any[]>([]);
  const [typeAssociations, setTypeAssociations] = useState<any[]>([]);
  const [grade, setGrade] = useState<any>([]);
  const [selectedgrade, setSelectedgrade] = useState<any>();
  const [gradeOptions, setGradeOptions] = useState<any[]>([]);
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [newAssociations, setNewAssociations] = useState<any[]>([]);
  const [type, setType] = useState<any>([]);
  const [selectedtype, setSelectedtype] = useState<any>();
  const setTaxanomySubject = coursePlannerStore(
    (state) => state.setTaxanomySubject
  );
  const setTaxonomyMedium = taxonomyStore((state) => state.setTaxonomyMedium);
  const setTaxonomyGrade = taxonomyStore((state) => state.setTaxonomyGrade);
  const setTaxonomyType = taxonomyStore((state) => state.setTaxonomyType);
  const setTaxonomySubject = taxonomyStore((state) => state.setTaxonomySubject);
  const [framework, setFramework] = useState<any[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<any[]>([]);
  const setStateassociations = coursePlannerStore(
    (state) => state.setStateassociations
  );
  const setBoards = coursePlannerStore((state) => state.setBoards);

  useEffect(() => {
    const savedMedium = localStorage.getItem("selectedMedium") || "";
    const savedGrade = localStorage.getItem("selectedGrade") || "";
    const savedType = localStorage.getItem("selectedType") || "";
    setSelectedmedium(savedMedium);
    setSelectedgrade(savedGrade);
    setSelectedtype(savedType);
  }, []);

  useEffect(() => {
    const fetchTaxonomyResultsOne = async () => {
      try {
        const frameworks = store?.framedata;
        const getBoards = await getOptionsByCategory(frameworks, "board");
        const board = getBoards?.terms?.find((term: any) => term.code === boardDetails);
        setSelectedBoard(board);

        // // Get states options
        // const getStates = getOptionsByCategory(frameworks, "state");

        // const matchingState = getStates.find(
        //   (state: any) => state.name === localStorage.getItem("selectedState")
        // );

        // if (matchingState) {
        //   setStateassociations(matchingState?.associations);
        //   const getBoards = await getOptionsByCategory(frameworks, "board");
        //   if (getBoards && matchingState) {
        //     const commonBoardsNew = await getBoards
        //       .filter((item1: { code: any }) =>
        //         matchingState.associations.some(
        //           (item2: { code: any; category: string }) =>
        //             item2.code === item1.code && item2.category === "board"
        //         )
        //       )
        //       .map((item1: { name: any; code: any; associations: any }) => ({
        //         name: item1.name,
        //         code: item1.code,
        //         associations: item1.associations,
        //       }));

        //     setNewAssociations(commonBoardsNew);

        //     const commonBoards = await getBoards
        //       .filter((item1: { code: any }) =>
        //         matchingState?.associations?.some(
        //           (item2: { code: any; category: string }) =>
        //             item2.code === item1.code && item2.category === "board"
        //         )
        //       )
        //       .map((item1: { name: any; code: any; associations: any }) => ({
        //         name: item1.name,
        //         code: item1.code,
        //         associations: item1.associations,
        //       }));

        //     const stateBoardMapping = getStates.map((state: any) => {
        //       const stateAssociations = state.associations || [];
        //       const boards = getOptionsByCategory(frameworks, "board");

        //       const associatedBoards = boards
        //         .filter((board: { code: any }) =>
        //           stateAssociations.some(
        //             (assoc: { code: any; category: string }) =>
        //               assoc.code === board.code && assoc.category === "board"
        //           )
        //         )
        //         .map((board: { name: any; code: any }) => ({
        //           name: board.name,
        //           code: board.code,
        //         }));

        //       return {
        //         stateName: state.name,
        //         boards: associatedBoards,
        //         associations: stateAssociations,
        //       };
        //     });

        //     const selectedState = localStorage.getItem("selectedState");

        //     const filteredState = stateBoardMapping.filter(
        //       (state: any) => state.stateName === selectedState
        //     );

        //     // Log the result
        //     if (filteredState) {
        //       // Set the frameworks state
        //       setFramework(frameworks);
        //       setBoards(filteredState);
        //       setSelectedBoard(filteredState);
        //     } else {
        //     }
        //     //   }
        //     // }
        //   }
        // }
      } catch (error) {
        console.error("Failed to fetch cohort search results:", error);
      }
    };

    fetchTaxonomyResultsOne();
  }, []);

  useEffect(() => {
    const subjects = localStorage.getItem("overallCommonSubjects");

    if (subjects) {
      try {
        const parsedData = JSON.parse(subjects)?.sort();
        setSubject(parsedData);
      } catch (error) {
        console.error("Failed to parse subjects from localStorage:", error);
      }
    } else {
      console.log("No subjects found in localStorage.");
      setSubject([]);
    }
  }, []);

  useEffect(() => {
    const fetchFrameworkDetails = async () => {
      if (typeof boardDetails === "string") {
        try {
          const getMedium = await getOptionsByCategory(
            store?.framedata,
            "medium"
          );

          const normalizedBoards = normalizeData(store?.boards || []);
          const boardAssociations = getAssociationsByCodeNew(
            normalizedBoards,
            boardName
          );

          setBoardAssociations(boardAssociations);
          // const commonMediumInState = getMedium
          //   .filter((item1: { code: string }) =>
          //     store?.stateassociations.some(
          //       (item2: { code: string; category: string }) =>
          //         item2.code === item1.code && item2.category === "medium"
          //     )
          //   )
          //   .map(
          //     (item1: { name: string; code: string; associations: any[] }) => ({
          //       name: item1.name,
          //       code: item1.code,
          //       associations: item1.associations,
          //     })
          //   );

          const commonMediumInBoard = getMedium
            .filter((item1: { code: any }) =>
              boardAssociations.some(
                (item2: { code: any; category: string }) =>
                  item2.code === item1.code && item2.category === "medium"
              )
            )
            .map((item1: { name: any; code: any; associations: any }) => ({
              name: item1.name,
              code: item1.code,
              associations: item1.associations,
            })); 

          // const commonMediumData = findCommonAssociations(
          //   // commonMediumInState,
          //   [],
          //   commonMediumInBoard
          // );

          setMediumOptions(commonMediumInBoard);
          setMedium(commonMediumInBoard);
        } catch (err) {
          console.error("Failed to fetch framework details");
        } finally {
          setLoading(false);
        }
      } else {
        console.error("Invalid boardId");
        setLoading(false);
      }
    };

    fetchFrameworkDetails();
  }, [boardName]);

  const fetchAndSetGradeData = (medium: any) => {
    const getGrades = getOptionsByCategory(store?.framedata, "gradeLevel");
    const mediumAssociations = getAssociationsByCodeNew(mediumOptions, medium);
    setMediumAssociations(mediumAssociations);
    localStorage.setItem("mediumAssociations", JSON.stringify(mediumAssociations));

    // const commonGradeInState = filterAndMapAssociations(
    //   "gradeLevel",
    //   getGrades,
    //   store?.stateassociations,
    //   "code"
    // );
    const commonGradeInBoard = filterAndMapAssociations(
      "gradeLevel",
      getGrades,
      boardAssociations,
      "code"
    );
    const commonGradeInMedium = filterAndMapAssociations(
      "gradeLevel",
      getGrades,
      mediumAssociations,
      "code"
    );

    // const commonGradeInStateBoard = findCommonAssociations(
    //   commonGradeInState,
    //   commonGradeInBoard
    // );
    const overAllCommonGrade = findCommonAssociations(
      commonGradeInBoard,
      commonGradeInMedium
    );

    setGrade(overAllCommonGrade);
    setGradeOptions(overAllCommonGrade);
  };

  const fetchAndSetTypeData = (grade: any) => {
    const gradeAssociations = getAssociationsByCodeNew(gradeOptions, grade);
    setGradeAssociations(gradeAssociations);
    localStorage.setItem("gradeAssociations", JSON.stringify(gradeAssociations));

    const type = getOptionsByCategory(store?.framedata, "courseType");

    // const commonTypeInState = filterAndMapAssociations(
    //   "courseType",
    //   type,
    //   store?.stateassociations,
    //   "code"
    // ); 
    // const commonTypeInBoard = filterAndMapAssociations(
    //   "courseType",
    //   type,
    //   boardAssociations,
    //   "code"
    // ); 
    // const storageMediumAssociations = localStorage.getItem("mediumAssociations");
    // const localMediumAssociations = storageMediumAssociations
    //   ? JSON.parse(storageMediumAssociations)
    //   : mediumAssociations;
    // const commonTypeInMedium = filterAndMapAssociations(
    //   "courseType",
    //   type,
    //   localMediumAssociations,
    //   "code"
    // ); 
 
    // const storageGradeAssociations = localStorage.getItem("gradeAssociations");
    // const localGradeAssociations = storageMediumAssociations
    //   ? JSON.parse(storageMediumAssociations)
    //   : gradeAssociations;

    // const commonTypeInGrade = filterAndMapAssociations(
    //   "courseType",
    //   type,
    //   localGradeAssociations,
    //   "code"
    // );

    // const commonTypeData = findCommonAssociations(
    //   commonTypeInState,
    //   commonTypeInBoard
    // );
    // const commonType2Data = findCommonAssociations(
    //   commonTypeInMedium,
    //   commonTypeInGrade
    // );
    // const commonType3Data = findCommonAssociations(
    //   commonTypeData,
    //   commonType2Data
    // ); 
    setTypeOptions(type);
    setType(type);
  };

  const fetchAndSetSubData = async (type: any) => {
    try {
      // const StateName = localStorage.getItem("selectedState");
      const medium = selectedmedium;
      const grade = selectedgrade;
      const board = boardName;

      if (medium && grade && board) {
        const url = `/api/framework/v1/read/${FRAMEWORK_ID}`;
        const boardData = await fetch(url).then((res) => res.json());
        const frameworks = boardData?.result?.framework;

        // const getStates = getOptionsByCategory(frameworks, "state");
        // const matchState = getStates.find(
        //   (item: any) =>
        //     item?.name?.toLowerCase() === StateName?.toLocaleLowerCase()
        // );

        const getBoards = getOptionsByCategory(frameworks, "board");
        const matchBoard = getBoards.find((item: any) => item.name === board);
        const getMedium = getOptionsByCategory(frameworks, "medium");
        const matchMedium = getMedium.find((item: any) => item.name === medium);

        const getGrades = getOptionsByCategory(frameworks, "gradeLevel");
        const matchGrade = getGrades.find((item: any) => item.name === grade);

        const getCourseTypes = getOptionsByCategory(frameworks, "courseType");
        const courseTypes = getCourseTypes?.map((type: any) => type.name);
        // setCourseTypes(courseTypes);

        const courseTypesAssociations = getCourseTypes?.map((type: any) => {
          return {
            code: type.code,
            name: type.name,
            associations: type.associations,
          };
        });

        const courseSubjectLists = courseTypesAssociations.map(
          (courseType: any) => {
            const commonAssociations = matchGrade?.associations.filter(
              (assoc: any) =>
                // matchState?.associations.filter(
                //   (item: any) => item.code === assoc.code
                // )?.length &&
                matchBoard?.associations.filter(
                  (item: any) => item.code === assoc.code
                )?.length &&
                matchMedium?.associations.filter(
                  (item: any) => item.code === assoc.code
                )?.length 
                // &&
                // matchGrade?.associations.filter(
                //   (item: any) => item.code === assoc.code
                // )?.length
            );

            const getSubjects = getOptionsByCategory(frameworks, "subject");
            const subjectAssociations = commonAssociations?.filter(
              (assoc: any) =>
                getSubjects.map((item: any) => assoc.code === item?.code)
            );

            return {
              courseTypeName: courseType?.name,
              courseType: courseType?.code,
              subjects: subjectAssociations?.map(
                (subject: any) => subject?.name
              ),
            };
          }
        );
        const matchedCourse = courseSubjectLists.find(
          (course: any) => course.courseTypeName === type
        );

        const matchingSubjects = matchedCourse ? matchedCourse.subjects.sort() : [];

        setSubject(matchingSubjects);
        localStorage.setItem(
          "overallCommonSubjects",
          JSON.stringify(matchingSubjects)
        );
        // setSubjectLists(courseSubjectLists);
      }
    } catch (error) {
      console.error("Error fetching board data:", error);
    }
  };

  useEffect(() => {
    if (selectedmedium) {
      fetchAndSetGradeData(selectedmedium);
    }
  }, [selectedmedium]);

  useEffect(() => {
    if (selectedgrade) {
      fetchAndSetTypeData(selectedgrade);
    }
  }, [selectedgrade]);

  useEffect(() => {
    if (selectedtype) {
      fetchAndSetSubData(selectedtype);
    }
  }, [selectedtype]);

  if (loading) {
    return <Loader showBackdrop={true} loadingText="Loading" />;
  }

  const handleBackClick = () => {
    localStorage.removeItem("selectedGrade");
    localStorage.removeItem("selectedMedium");
    localStorage.removeItem("selectedType");
    localStorage.removeItem("overallCommonSubjects");
    setSubject([]);
    router.back();
  };

  const handleCardClick = (subject: string) => {
    setTaxonomySubject(subject);
    router.push(`/importCsv?subject=${encodeURIComponent(subject)}`);

    setTaxanomySubject(subject);
  };

  const handleMediumChange = (event: any) => {
    localStorage.setItem("selectedMedium", event.target.value);
    const medium = event.target.value;
    setSelectedmedium(medium);
    setTaxonomyMedium(medium);
    // setSelectedgrade([null]);
    // setSelectedtype([null]);
    // setSubject([null]);

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, "");
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: "change-medium",

        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  const handleGradeChange = (event: any) => {
    localStorage.setItem("selectedGrade", event.target.value);
    const grade = event.target.value;
    setTaxonomyGrade(grade);
    setSelectedgrade(grade);

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, "");
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: "grade_change",

        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  const handleTypeChange = (event: any) => {
    localStorage.setItem("selectedType", event.target.value);
    const type = event.target.value;
    setTaxonomyType(type);
    setSelectedtype(type);

    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, "");
    const env = cleanedUrl.split("/")[0];

    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: "change_type",

        type: TelemetryEventType.CLICK,
        subtype: "",
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);
  };

  const handleReset = () => {
    setSelectedmedium("");
    setSelectedgrade("");
    setSelectedtype("");
    setSubject([""]);
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ marginTop: "20px" }}>
        <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
          <Select
            value={selectedmedium || ""}
            onChange={handleMediumChange}
            displayEmpty
            inputProps={{ "aria-label": "Medium" }}
            sx={{
              "& .MuiSelect-select": {
                padding: "8px 16px",
                textAlign: "left",
              },
              "& fieldset": {
                border: "none",
              },
              border: "1px solid #3C3C3C",
              borderRadius: "8px",
              marginRight: "16px",
              height: 40,
              width: "100%",
            }}
          >
            <MenuItem value="">
              <Typography>{t("COURSE_PLANNER.SELECT_MEDIUM")}</Typography>
            </MenuItem>
            {medium.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
          <Select
            value={selectedgrade || ""}
            onChange={handleGradeChange}
            displayEmpty
            inputProps={{ "aria-label": "Grade" }}
            sx={{
              "& .MuiSelect-select": {
                padding: "8px 16px",
                textAlign: "left",
              },
              "& fieldset": {
                border: "none",
              },
              border: "1px solid #3C3C3C",
              borderRadius: "8px",
              marginRight: "16px",
              height: 40,
              width: "100%",
            }}
          >
            <MenuItem value="">
              <Typography>{t("COURSE_PLANNER.SELECT_GRADE")}</Typography>
            </MenuItem>
            {grade.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
          <Select
            value={selectedtype || ""}
            onChange={handleTypeChange}
            displayEmpty
            inputProps={{ "aria-label": "Type" }}
            sx={{
              "& .MuiSelect-select": {
                padding: "8px 16px",
                textAlign: "left",
              },
              "& fieldset": {
                border: "none",
              },
              border: "1px solid #3C3C3C",
              borderRadius: "8px",
              height: 40,
              width: "100%",
            }}
          >
            <MenuItem value="">
              <Typography>{t("COURSE_PLANNER.SELECT_TYPE")}</Typography>
            </MenuItem>
            {type.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
          <Button
            onClick={handleReset}
            sx={{
              height: 40,
              backgroundColor: "#4D4639",
              color: "#FFFFFF",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "black",
              },
              width: "100%",
            }}
          >
            {t("COURSE_PLANNER.CLEAR_SELECTION")}
          </Button>
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginTop: "16px",
          marginBottom: "16px",
          gap: "5px",
          width:'fit-content',
          cursor:'pointer'
        }}
        onClick={handleBackClick}
      >
        <ArrowBackIcon />

        <Typography variant="h2">{boardName}</Typography>
        <Box sx={{ width: "40px", height: "40px" }}></Box>
      </Box>
      <Divider />

      <Box sx={{ marginTop: "16px" }}>
        <Grid container spacing={2}>
          {subject && subject.length > 1 ? (
            subject?.map((subj: string, index: number) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <MuiCard
                  key={index}
                  sx={{
                    padding: "14px",
                    cursor: "pointer",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#EAF2FF",
                      transform: "scale(1.02)",
                    },
                  }}
                  onClick={() => handleCardClick(subj)}
                >
                  {/* Left Section: Folder Icon and Subject Name */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FolderOutlinedIcon sx={{ color: "#3C3C3C" }} />
                    <Typography variant="h6" noWrap>
                      {subj || "Untitled Subject"}
                    </Typography>
                  </Box>
                </MuiCard>
              </Grid>
            ))
          ) : (
            <Typography
              variant="h4"
              align="center"
              sx={{ marginTop: "24px", color: "#6B7280", mx: "16px" }}
            >
              {t("COURSE_PLANNER.SELECT_ALL_MESSSAGE")}
            </Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default SubjectDetails;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
