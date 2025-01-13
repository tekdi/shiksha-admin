import HeaderComponent from "@/components/HeaderComponent";

import { Numbers, Role, SORT, Status } from "@/utils/app.constant";
import { transformLabel } from "@/utils/Helper";
import {
  Box,
  Container,
  SelectChangeEvent,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Theme } from "@mui/system";
import Loader from "@/components/Loader";
import useStore from "@/store/store";
import ProgramCard from "./ProgramCard";
import { getProgramList, programSearch } from "@/services/ProgramServices";
import loginImg from "../../public/images/login-image.jpg";
import AddProgram from "./AddProgram";
import useSubmittedButtonStore from "@/utils/useSharedState";

interface Program {
  tenantId: string;
  name?: string;
  domain?: string | null;
  createdAt?: string;
  updatedAt?: string;
  params?: any;
  programImages?: string[] | null;
  description?: string | null;
  status?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  role?: { roleId: string; name: string; code: string }[];
}
const ProgramList: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<[string, string]>(["name", "asc"]);
  const [selectedSort, setSelectedSort] = useState("Sort");
  const store = useStore();
  const isActiveYear = store.isActiveYearSelected;
  const [userRole, setUserRole] = useState("");
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [openAddNewProgram, setOpenAddNewProgram] =
    React.useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusValue, setStatusValue] = useState(Status.ACTIVE);
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const fetchPrograms = useSubmittedButtonStore(
    (state: any) => state.fetchPrograms
  );
  useEffect(() => {
    const storedUserData = localStorage.getItem("adminInfo");
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUserRole(userData.role);
    }
  }, []);
  useEffect(() => {
    const fetchProgramList = async () => {
      try {
        let programListObject ;
        if(statusValue===Status.ACTIVE){
          programListObject = {
            limit: 200,
            offset: 0,
          filters: {
            status: ["published", "draft"],
          },
          };
        }
        else
        {
          programListObject = {
            limit:200,
            offset: 0,
          filters: {
            status: ["archived"],
          },
          };
        }
        
        const result=await programSearch(programListObject);
        // const result = await getProgramList();
        console.log("result", result?.result);
        
        // Format the program list based on the searchKeyword
        const programSummaries = result?.getTenantDetails?.map((program: any) => ({
          name: program.name,
          domain: program.domain,
          status: program.status,
          description: program.description,
          programImages: program.programImages || ["No image available"],
          tenantId:program.tenantId
        }))
        .filter((program: any) => 
          program.name.toLowerCase().includes(searchKeyword.toLowerCase()) 
        
        );
  
        const sortedProgramSummaries = programSummaries.sort((a: any, b: any) => {
          if (selectedSort === "A-Z") {
            return a.name.localeCompare(b.name);  
          } else if (selectedSort === "Z-A") {
            return b.name.localeCompare(a.name);  
          }
          return a.name.localeCompare(b.name);
                });
        
        setPrograms(sortedProgramSummaries);
        setFilteredPrograms(sortedProgramSummaries);
      } catch (error) {
        setPrograms([])
        setFilteredPrograms([]);

        console.error("Error fetching program list:", error);
      }
    };
  
    fetchProgramList();
  }, [statusValue, fetchPrograms]);  
   
  useEffect(() => {

   const  programSummaries = programs.filter((program: any) => 
    program.name.toLowerCase().includes(searchKeyword.toLowerCase()) 
  );

  const sortedProgramSummaries = programSummaries.sort((a: any, b: any) => {
    if (selectedSort === "A-Z") {
      return a.name.localeCompare(b.name);  
    } else if (selectedSort === "Z-A") {
      return b.name.localeCompare(a.name);  
    }
    return 0;  
  });
  
  setFilteredPrograms(sortedProgramSummaries);
    
  }, [ selectedSort,  searchKeyword, programs]);  
  const handleFilterChange = async (
    event: React.SyntheticEvent,
    newValue: any
  ) => {
    setStatusValue(newValue);
  };

  const handleDelete = (rowData: any) => {};
  
  const handleSortChange = async (event: SelectChangeEvent) => {
    const sortOrder =
      event.target.value === "Z-A" ? SORT.DESCENDING : SORT.ASCENDING;
    setSortBy(["name", sortOrder]);
    setSelectedSort(event.target.value);
  };
  const handleConfirmDelete = async () => {};
  const handleSearch = (keyword: string) => {
     setSearchKeyword(keyword);
  };
  const handleAddProgramClick = () => {
    setOpenAddNewProgram(true);

  };
  const handleCloseAddProgram = () => {
    setOpenAddNewProgram(false);
   // setSubmittedButtonStatus(false);

  };
  return (
    <>
      <HeaderComponent
        userType={t("PROGRAM_MANAGEMENT.PROGRAMS")}
        searchPlaceHolder={t("PROGRAM_MANAGEMENT.SEARCH_PROGRAM")}
        showStateDropdown={false}
        handleSortChange={handleSortChange}
        showAddNew={!!isActiveYear && userRole === Role.CENTRAL_ADMIN}
        showSort={true}
        shouldFetchDistricts={false}
        selectedSort={selectedSort}
        showFilter={true}
        statusValue={statusValue}
        handleSearch={handleSearch}
        handleAddUserClick={handleAddProgramClick}
        handleDelete={handleDelete}
        handleFilterChange={handleFilterChange} 

      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
            gap: "20px",
            margin: "20px",
          }}
        >
          { filteredPrograms?.map((program: any) => (
            <ProgramCard
              programId={program.tenantId}
              programName={program.name}
              description={program.description}
              // domain={program.domain}
              status={program.status}
              imageUrl={program.programImages || loginImg}
            />
          ))}
          {filteredPrograms.length === 0 && (<Typography ml="40%">
            {t("PROGRAM_MANAGEMENT.NO_PROGRAMS_FOUND")}
          </Typography>)
          }
        </Box>
      </HeaderComponent>
      <AddProgram
            open={openAddNewProgram}
            onClose={handleCloseAddProgram}
         
          />
    </>
  );
};
export default ProgramList;
