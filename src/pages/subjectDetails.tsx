import React, { useState, useEffect, MouseEvent } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Card as MuiCard,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Divider,
  Tooltip,
} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import cardData from "@/data/cardData";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import FilterSearchBar from "@/components/FilterSearchBar";
import Loader from "@/components/Loader";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { getFrameworkDetails } from "@/services/coursePlanner";
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
import theme from "@/components/theme/theme";
import { FRAMEWORK_ID } from "../../app.config";
import axios from "axios";

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
  const { boardDetails, boardName } = router.query as {
    boardDetails?: any;
    boardName?: any;
  };
  const tStore = taxonomyStore();
  const store = coursePlannerStore();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<Card | null>(null);
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

  // useEffect(() => {
  //   const handleBMGS = async () => {
  //     try {
  //       const StateName = "Rajasthan";
  //       const medium = "Hindi";
  //       const grade = "Grade 10";
  //       const board = "NIOS";

  //       if (StateName && medium && grade && board) {
  //         const url = `/api/framework/v1/read/${FRAMEWORK_ID}`;
  //         const boardData = await fetch(url).then((res) => res.json());
  //         const frameworks = boardData?.result?.framework;

  //         const getStates = getOptionsByCategory(frameworks, "state");
  //         const matchState = getStates.find(
  //           (item: any) =>
  //             item?.name?.toLowerCase() === StateName?.toLocaleLowerCase()
  //         );

  //         const getBoards = getOptionsByCategory(frameworks, "board");
  //         console.log("getBoards", getBoards);
  //         const matchBoard = getBoards.find((item: any) => item.name === board);
  //         console.log("matchBoard", matchBoard);
  //         const getMedium = getOptionsByCategory(frameworks, "medium");
  //         const matchMedium = getMedium.find(
  //           (item: any) => item.name === medium
  //         );

  //         const getGrades = getOptionsByCategory(frameworks, "gradeLevel");
  //         const matchGrade = getGrades.find((item: any) => item.name === grade);

  //         const getCourseTypes = getOptionsByCategory(frameworks, "courseType");
  //         const courseTypes = getCourseTypes?.map((type: any) => type.name);
  //         // setCourseTypes(courseTypes);

  //         const courseTypesAssociations = getCourseTypes?.map((type: any) => {
  //           return {
  //             code: type.code,
  //             name: type.name,
  //             associations: type.associations,
  //           };
  //         });

  //         const courseSubjectLists = courseTypesAssociations.map(
  //           (courseType: any) => {
  //             const commonAssociations = courseType?.associations.filter(
  //               (assoc: any) =>
  //                 matchState?.associations.filter(
  //                   (item: any) => item.code === assoc.code
  //                 )?.length &&
  //                 matchBoard?.associations.filter(
  //                   (item: any) => item.code === assoc.code
  //                 )?.length &&
  //                 matchMedium?.associations.filter(
  //                   (item: any) => item.code === assoc.code
  //                 )?.length &&
  //                 matchGrade?.associations.filter(
  //                   (item: any) => item.code === assoc.code
  //                 )?.length
  //             );
  //             console.log(commonAssociations);
  //             const getSubjects = getOptionsByCategory(frameworks, "subject");
  //             const subjectAssociations = commonAssociations?.filter(
  //               (assoc: any) =>
  //                 getSubjects.map((item: any) => assoc.code === item?.code)
  //             );
  //             console.log(subjectAssociations);
  //             return {
  //               courseTypeName: courseType?.name,
  //               courseType: courseType?.code,
  //               subjects: subjectAssociations?.map(
  //                 (subject: any) => subject?.name
  //               ),
  //             };
  //           }
  //         );

  //         console.log(courseSubjectLists);
  //         // setSubjectLists(courseSubjectLists);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching board data:", error);
  //     }
  //   };
  //   handleBMGS();
  // }, []);

  useEffect(() => {
    const fetchTaxonomyResultsOne = async () => {
      try {
        const url = `/api/framework/v1/read/${FRAMEWORK_ID}`;

        // Use axios to fetch data from the API
        const response = await axios.get(url);
        const boardData = response.data;

        console.log(boardData?.result?.framework);
        const frameworks = boardData?.result?.framework;

        // Get states options
        const getStates = getOptionsByCategory(frameworks, "state");

        const matchingState = getStates.find(
          (state: any) => state.name === localStorage.getItem("selectedState")
        );

        if (matchingState) {
          setStateassociations(matchingState?.associations);
          const getBoards = await getOptionsByCategory(frameworks, "board");
          if (getBoards && matchingState) {
            const commonBoardsNew = await getBoards
              .filter((item1: { code: any }) =>
                matchingState.associations.some(
                  (item2: { code: any; category: string }) =>
                    item2.code === item1.code && item2.category === "board"
                )
              )
              .map((item1: { name: any; code: any; associations: any }) => ({
                name: item1.name,
                code: item1.code,
                associations: item1.associations,
              }));

            setNewAssociations(commonBoardsNew);

            console.log("FIRST TIME API", getBoards);

            const commonBoards = await getBoards
              .filter((item1: { code: any }) =>
                matchingState?.associations?.some(
                  (item2: { code: any; category: string }) =>
                    item2.code === item1.code && item2.category === "board"
                )
              )
              .map((item1: { name: any; code: any; associations: any }) => ({
                name: item1.name,
                code: item1.code,
                associations: item1.associations,
              }));

            console.log("FIRST TIME API", commonBoards);

            const stateBoardMapping = getStates.map((state: any) => {
              const stateAssociations = state.associations || [];
              const boards = getOptionsByCategory(frameworks, "board");

              const associatedBoards = boards
                .filter((board: { code: any }) =>
                  stateAssociations.some(
                    (assoc: { code: any; category: string }) =>
                      assoc.code === board.code && assoc.category === "board"
                  )
                )
                .map((board: { name: any; code: any }) => ({
                  name: board.name,
                  code: board.code,
                }));

              return {
                stateName: state.name,
                boards: associatedBoards,
                associations: stateAssociations,
              };
            });

            console.log("State-Board Mapping:", stateBoardMapping);
            const selectedState = localStorage.getItem("selectedState");

            const filteredState = stateBoardMapping.filter(
              (state: any) => state.stateName === selectedState
            );

            // Log the result
            if (filteredState) {
              console.log("Filtered State Data:", filteredState);

              // Set the frameworks state
              setFramework(frameworks);

              // const getBoardsByName = (commonBoards: any, boardName: any) => {
              //   return commonBoards.filter(
              //     (commonBoards: any) => commonBoards.name === boardName
              //   );
              // };

              // const selectedBoard = getBoardsByName(commonBoards, boardName);
              // console.log(selectedBoard);
              setBoards(filteredState);
              setSelectedBoard(filteredState);
            } else {
              console.log("State not found in the mapping.");
            }
            //   }
            // }
          }
        }
      } catch (error) {
        console.error("Failed to fetch cohort search results:", error);
      }
    };

    fetchTaxonomyResultsOne();
  }, []);

  useEffect(() => {
    const savedMedium = localStorage.getItem("selectedMedium") || "";
    const savedGrade = localStorage.getItem("selectedGrade") || "";
    const savedType = localStorage.getItem("selectedType") || "";
    setSelectedmedium(savedMedium);
    setSelectedgrade(savedGrade);
    // setSelectedtype(savedType);
  }, []);

  useEffect(() => {
    const subjects = localStorage.getItem("overallCommonSubjects");

    if (subjects) {
      try {
        const parsedData = JSON.parse(subjects);
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
          console.log(store?.boards);

          const normalizedBoards = normalizeData(store?.boards || []);
          const boardAssociations = getAssociationsByCodeNew(
            normalizedBoards,
            boardName
          );
          console.log(boardAssociations);

          setBoardAssociations(boardAssociations);
          const commonMediumInState = getMedium
            .filter((item1: { code: string }) =>
              store?.stateassociations.some(
                (item2: { code: string; category: string }) =>
                  item2.code === item1.code && item2.category === "medium"
              )
            )
            .map(
              (item1: { name: string; code: string; associations: any[] }) => ({
                name: item1.name,
                code: item1.code,
                associations: item1.associations,
              })
            );

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
          console.log(`commonMediumInState`, commonMediumInState);
          console.log(`commonMediumInBoard`, commonMediumInBoard);

          const commonMediumData = findCommonAssociations(
            commonMediumInState,
            commonMediumInBoard
          );

          setMediumOptions(commonMediumData);
          setMedium(commonMediumData);
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

    console.log(getGrades);

    const commonGradeInState = filterAndMapAssociations(
      "gradeLevel",
      getGrades,
      store?.stateassociations,
      "code"
    );
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

    const commonGradeInStateBoard = findCommonAssociations(
      commonGradeInState,
      commonGradeInBoard
    );
    const overAllCommonGrade = findCommonAssociations(
      commonGradeInStateBoard,
      commonGradeInMedium
    );

    setGrade(overAllCommonGrade);
    setGradeOptions(overAllCommonGrade);
  };

  const fetchAndSetTypeData = (grade: any) => {
    const gradeAssociations = getAssociationsByCodeNew(gradeOptions, grade);
    setGradeAssociations(gradeAssociations);
    const type = getOptionsByCategory(store?.framedata, "courseType");
    console.log(type);

    const commonTypeInState = filterAndMapAssociations(
      "courseType",
      type,
      store?.stateassociations,
      "code"
    );
    const commonTypeInBoard = filterAndMapAssociations(
      "courseType",
      type,
      boardAssociations,
      "code"
    );
    const commonTypeInMedium = filterAndMapAssociations(
      "courseType",
      type,
      mediumAssociations,
      "code"
    );
    const commonTypeInGrade = filterAndMapAssociations(
      "courseType",
      type,
      gradeAssociations,
      "code"
    );

    const commonTypeData = findCommonAssociations(
      commonTypeInState,
      commonTypeInBoard
    );
    const commonType2Data = findCommonAssociations(
      commonTypeInMedium,
      commonTypeInGrade
    );
    const commonType3Data = findCommonAssociations(
      commonTypeData,
      commonType2Data
    );

    console.log(`commonTypeOverall`, commonType3Data);
    setTypeOptions(commonType3Data);
    setType(commonType3Data);
  };

  const fetchAndSetSubData = async (type: any) => {
    try {
      const StateName = localStorage.getItem("selectedState");
      const medium = selectedmedium;
      const grade = selectedgrade;
      const board = boardName;

      if (StateName && medium && grade && board) {
        console.log(StateName, medium, grade, board);

        const url = `/api/framework/v1/read/${FRAMEWORK_ID}`;
        const boardData = await fetch(url).then((res) => res.json());
        const frameworks = boardData?.result?.framework;

        const getStates = getOptionsByCategory(frameworks, "state");
        const matchState = getStates.find(
          (item: any) =>
            item?.name?.toLowerCase() === StateName?.toLocaleLowerCase()
        );

        const getBoards = getOptionsByCategory(frameworks, "board");
        console.log("getBoards", getBoards);
        const matchBoard = getBoards.find((item: any) => item.name === board);
        console.log("matchBoard", matchBoard);
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
            const commonAssociations = courseType?.associations.filter(
              (assoc: any) =>
                matchState?.associations.filter(
                  (item: any) => item.code === assoc.code
                )?.length &&
                matchBoard?.associations.filter(
                  (item: any) => item.code === assoc.code
                )?.length &&
                matchMedium?.associations.filter(
                  (item: any) => item.code === assoc.code
                )?.length &&
                matchGrade?.associations.filter(
                  (item: any) => item.code === assoc.code
                )?.length
            );
            console.log(commonAssociations);
            const getSubjects = getOptionsByCategory(frameworks, "subject");
            const subjectAssociations = commonAssociations?.filter(
              (assoc: any) =>
                getSubjects.map((item: any) => assoc.code === item?.code)
            );
            console.log(subjectAssociations);
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

        const matchingSubjects = matchedCourse ? matchedCourse.subjects : [];

        console.log(matchingSubjects);
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
    return <Loader showBackdrop={true} loadingText="Loading..." />;
  }

  const handleBackClick = () => {
    localStorage.removeItem("selectedGrade");
    localStorage.removeItem("selectedMedium");
    localStorage.removeItem("selectedType");
    router.back();
  };

  const handleCopyLink = (subject: any) => {};

  const handleCardClick = (subject: any) => {
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
      <Box sx={{ display: "flex", flexDirection: "row", marginTop: "20px" }}>
        <Box>
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
              width: "170px",
            }}
          >
            <MenuItem value="">
              <Typography>Select Medium</Typography>
            </MenuItem>
            {medium.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
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
              width: "170px",
            }}
          >
            <MenuItem value="">
              <Typography>Select Grade</Typography>
            </MenuItem>
            {grade.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box>
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
              width: "170px",
            }}
          >
            <MenuItem value="">
              <Typography>Select Type</Typography>
            </MenuItem>
            {type.map((item: any) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box>
          <Button
            onClick={handleReset}
            sx={{
              height: 40,
              width: "80px",
              backgroundColor: "#4D4639",
              color: "#FFFFFF",
              borderRadius: "8px",
              marginLeft: "16px",
              "&:hover": {
                backgroundColor: "black",
              },
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",

          marginTop: "16px",
          marginBottom: "16px",
        }}
      >
        <IconButton onClick={handleBackClick}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2">{boardName}</Typography>
        <Typography variant="h2" sx={{ ml: 1 }}>
          Board
        </Typography>
        <Box sx={{ width: "40px", height: "40px" }}></Box>
      </Box>
      <Divider />

      <Box sx={{ marginTop: "16px" }}>
        {subject && subject.length > 1 ? (
          subject.map((subj: any, index: number) => (
            <MuiCard
              key={index}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 1fr",
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
                marginTop: "12px",
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
          ))
        ) : (
          <Typography
            variant="h4"
            align="center"
            sx={{ marginTop: "24px", color: "#6B7280" }}
          >
            Select Medium, Grade, and Type
          </Typography>
        )}
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
