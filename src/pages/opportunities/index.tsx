"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { showToastMessage } from "@/components/Toastify";
// import Header from '@/components/Header';
import { OpportunityForm } from "@/components/opportunity-form";
import { OpportunitiesList } from "@/components/opportunities-table";
import CloseIcon from "@mui/icons-material/Close";
import { SearchInput } from "@/components/search-input";
import { OpportunityFilters } from "@/components/opportunity-filters";
import { CustomPagination } from "@/components/pagination";
import type {
  Opportunity,
  OpportunityFormData,
  OpportunityList,
} from "@/types/opportunity";
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityApplicationsReport,
} from "@/lib/api";
import { Switch, FormControlLabel } from "@mui/material";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Description, Work } from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";

export default function OpportunitiesPage() {
  const router = useRouter();
  const theme = useTheme<any>();
  const {
    page = "1",
    search = "",
    industry,
    skills,
    category,
    status = "approved",
    location,
  } = router.query;
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [selectedTab, setSelectedTab] = useState("all"); // "all" or "createdByMe"
  const [opportunities, setOpportunities] = useState<{
    items: OpportunityList[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>({
    items: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  useEffect(() => {
    loadOpportunities();
  }, [router.query, selectedTab]);

  async function loadOpportunities() {
    setIsLoading(true);
    try {
      let created_by = undefined;
      let finalStatus = status as string;

      if (selectedTab === "createdByMe") {
        created_by = localStorage.getItem("userId") || undefined;
        finalStatus = status as string;
      } else if (selectedTab === "newRequest") {
        finalStatus = "pending";
      }

      const result = await getOpportunities(search as string, Number(page), {
        category: category as string,
        skills: skills as string,
        status: finalStatus,
        location: location as string,
        created_by,
      });

      setOpportunities(result);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(data: OpportunityFormData) {
    try {
      const response = await createOpportunity(data);
      if (response.responseCode === 200) {
        showToastMessage(
          t("OPPORTUNITY.OPPORTUNITY_CREATED_SUCCESSFULLY"),
          "success"
        );
      }
      setIsDialogOpen(false);
      loadOpportunities();
    } catch (error) {
      console.error("Error creating opportunity:", error);
      showToastMessage(t("OPPORTUNITY.OPPORTUNITY_CREATION_FAILED"), "error");
    }
  }

  async function handleUpdate(data: OpportunityFormData) {
    if (!selectedOpportunity) return;
    await updateOpportunity(selectedOpportunity.id, data);
    setIsDialogOpen(false);
    setSelectedOpportunity(null);
    loadOpportunities();
  }

  async function handleDelete(opportunity: Opportunity) {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      await deleteOpportunity(opportunity.id);
      loadOpportunities();
    }
  }

  function handleSearch(term: string) {
    const query = { ...router.query, search: term, page: "1" } as {
      search?: string;
      page: string;
    };
    if (!term) delete query.search;
    router.push({
      pathname: router.pathname,
      query,
    });
  }

  function handleFilterChange(name: string, value: string) {
    const query = { ...router.query, [name]: value, page: "1" };
    if (value === "all") delete query?.[name];
    router.push({
      pathname: router.pathname,
      query,
    });
  }

  function handleClearFilters() {
    const query = { page: "1" }; // Reset to default query with page 1
    router.push({
      pathname: router.pathname,
      query,
    });
  }

  function handlePageChange(newPage: number) {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage.toString() },
    });
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Extract only the date part
  };

  function handleExportCSV() {
    if (opportunities.items.length === 0) {
      showToastMessage(t("OPPORTUNITY.NO_DATA_TO_EXPORT"), "error");
      return;
    }

    const csvData = opportunities.items.map((item) => ({
      Title: item.title ? item.title : "-",
      Description: item.description ? item.description : "-",
      WorkType: item.work_nature ? item.work_nature : "-",
      OpportunityType: item.opportunity_type ? item.opportunity_type : "-",
      Category: item.category.name ? item.category.name : "-",
      Organisation: item.company.name ? item.company.name : "-",
      Status: item.status,
      Location:
        item.location.city +
        ", " +
        item.location.state +
        ", " +
        item.location.country,
      Vacancies: item.no_of_candidates ? item.no_of_candidates : "-",
      Mapped_Youth: item.stats.mapped ? item.stats.mapped : "-",
      Hired_Youth: item.stats.hired ? item.stats.hired : "-",
      CreatedAt: item.created_at ? formatDate(item.created_at) : "-",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "opportunities.csv");
  }

  async function handleExportUserOpportunityDetails() {
    try {
      setIsExporting(true);

      // First, get the total count by fetching the first batch
      const firstResponse = await getOpportunityApplicationsReport(20, 0);

      if (firstResponse.responseCode !== 200 || !firstResponse.result?.data) {
        showToastMessage("No data available to export", "error");
        return;
      }

      const totalRecords = firstResponse.result.total || 0;
      const batchSize = 50;
      const totalBatches = Math.ceil(totalRecords / batchSize);

      // Start with the first batch data
      let allData = [...firstResponse.result.data];

      // Fetch remaining batches
      for (let batch = 1; batch < totalBatches; batch++) {
        const offset = batch * batchSize;
        const batchResponse = await getOpportunityApplicationsReport(
          batchSize,
          offset
        );

        if (batchResponse.responseCode === 200 && batchResponse.result?.data) {
          allData = [...allData, ...batchResponse.result.data];
        }
      }

      if (allData.length > 0) {
        const csvData = allData.map((item: any) => ({
          "First Name": item.firstName || "-",
          "Middle Name": item.middleName || "-",
          "Last Name": item.lastName || "-",
          Country: item.country || "-",
          County: item.county || "-",
          "Sub-County": item.subCounty || "-",
          "Email ID": item.emailId || "-",
          "Phone Number": item.phoneNumber || "-",
          AGE: item.age || "-",
          Gender: item.gender || "-",
          "Highest Education Qualification":
            item.highestEducationQualification || "-",
          "Center Name": item.centerName || "-",
          "Tvets Enrollment Number": item.tvetsEnrollmentNumber || "-",
          Courses: Array.isArray(item.courses) ? item.courses.join(", ") : "-",
          "Pass Year": item.passYear || "-",
          "Company Name": item.companyName || "-",
          Title: item.title || "-",
          Description: item.description || "-",
          "Opportunity Type": item.opportunityType || "-",
          "Experience Level": item.experienceLevel || "-",
          Salary: item.salary || "-",
          "Industry Name": item.industryName || "-",
          "Industry Location": item.industryLocation || "-",
          Status: item.status || "-",
          "DOJ (for job)": item.doj ? formatDate(item.doj) : "-",
          "Start date for attachment": item.startDateForAttachment
            ? formatDate(item.startDateForAttachment)
            : "-",
          "End date for attachment": item.endDateForAttachment
            ? formatDate(item.endDateForAttachment)
            : "-",
          Benefits: Array.isArray(item.benefits)
            ? item.benefits.join(", ")
            : "-",
          "Other Benefits": item.otherBenefits || "-",
          "Work Mode": item.workMode || "-",
          "Offer Letter Provided": item.offerLetterProvided || "-",
          "Rejection Reason": item.rejectionReason || "-",
          "Match Score": item.matchScore || "-",
          Feedback: item.feedback || "-",
          "Youth Feedback": item.youthFeedback || "-",
          "Applied Skills": Array.isArray(item.appliedSkills)
            ? item.appliedSkills.join(", ")
            : "-",
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "user-opportunity-details.csv");
        showToastMessage(
          `User-opportunity details exported successfully (${allData.length} records)`,
          "success"
        );
      } else {
        showToastMessage("No data available to export", "error");
      }
    } catch (error) {
      console.error("Error exporting user-opportunity details:", error);
      showToastMessage("Failed to export user-opportunity details", "error");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      {/* <Header /> */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h1" component="h1" mb={0}>
              {t("OPPORTUNITY.OPPORTUNITIES")}
            </Typography>
          </Box>
        </Box> */}

        {/* Tabs for All Opportunities and Created by Me */}
        {/* Tabs for All Opportunities and Created by Me */}
        <Box
          boxShadow={"0px 2px 6px 2px #00000026"}
          bgcolor={"white"}
          py={2}
          borderRadius={2}
        >
          <Box
            borderBottom={"1px solid #0000001f"}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Tabs */}
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
            >
              <Tab label={t("OPPORTUNITY.ALL_OPPORTUNITIES")} value="all" />
              <Tab label={t("OPPORTUNITY.CREATED_BY_ME")} value="createdByMe" />
              <Tab label={t("OPPORTUNITY.NEW_REQUEST")} value="newRequest" />
            </Tabs>

            {/* Export Buttons */}
            <Box sx={{ display: "flex", gap: 1, marginRight: "10px" }}>
              <button
                onClick={handleExportCSV}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                <DownloadIcon />
                {"Export CSV"}
              </button>
              <button
                onClick={handleExportUserOpportunityDetails}
                disabled={isExporting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: isExporting ? "#e0e0e0" : "#f5f5f5",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  opacity: isExporting ? 0.6 : 1,
                }}
              >
                <DownloadIcon />
                {isExporting
                  ? "Exporting..."
                  : "Export User-Opportunity Details"}
              </button>
            </Box>
          </Box>

          <Box>
            <Box p={2} borderBottom={"1px solid #0000001f"} pb={0}>
              <Box
                sx={{
                  display: { xs: "block", sm: "flex" },
                  // flexDirection: { xs: 'column', sm: 'row' }, // Column on small screens, row on md+
                  gap: 2,
                  mb: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <SearchInput
                    placeholder={t("OPPORTUNITY.SEARCH_OPPORTUNITIES")}
                    defaultValue={search as string}
                    onSearch={handleSearch}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <FormControlLabel
                      sx={{ whiteSpace: "nowrap" }}
                      label={showFilters ? "Hide Filters" : "Show Filters"}
                      control={
                        <Switch
                          checked={showFilters}
                          onChange={() => setShowFilters((prev) => !prev)}
                          color="primary"
                        />
                      }
                    />
                  </Box>
                </Box>

                <Box mb={2}>
                  <Button
                    sx={{
                      textTransform: "none",
                      fontSize: "14px",
                      color: theme.palette.primary["100"],
                      minWidth: "200px",
                      p: "8px 16px",
                      border: "1px solid #1E1B16",
                      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                    }}
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedOpportunity(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    {t("OPPORTUNITY.CREATE_NEW_OPPORTUNITY")}
                  </Button>
                </Box>
              </Box>

              {showFilters && (
                <Box>
                  <Box
                    // variant="outlined"
                    // color="secondary"
                    sx={{
                      whiteSpace: "nowrap",
                      py: "10px",
                      border: "none !important",
                      bgcolor: "transparent !important",
                      display: "flex",
                      justifyContent: "end",
                      width: "100%",
                      color: "#101828",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                    onClick={handleClearFilters}
                  >
                    {t("OPPORTUNITY.CLEAR_FILTERS")}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 2,
                      alignItems: { xs: "stretch", md: "start" },
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <OpportunityFilters
                      selectedCategory={category as string}
                      selectedSkills={skills as string}
                      selectedStatus={status as string}
                      onFilterChange={handleFilterChange}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            <Paper
              elevation={2}
              sx={{
                mb: 3,
                overflow: "hidden",
                boxShadow: "none",
                padding: "10px",
                bgcolor: "transparent",
              }}
            >
              {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <OpportunitiesList
                  data={opportunities.items}
                  onEdit={(opportunity: any) => {
                    setSelectedOpportunity(opportunity);
                    setIsDialogOpen(true);
                  }}
                  onDelete={handleDelete}
                  onView={(opportunity: any) =>
                    router.push(`/opportunities/${opportunity.id}`)
                  }
                />
              )}
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <CustomPagination
                totalPages={Math.ceil(opportunities.total / 9)}
                currentPage={opportunities.currentPage}
                onPageChange={handlePageChange}
              />
            </Box>

            <Dialog
              open={isDialogOpen}
              onClose={(e, reason) => {
                if (reason === "backdropClick") {
                  return;
                }
              }}
              fullWidth
              PaperProps={{
                sx: { maxWidth: "650px" },
              }}
            >
              <DialogTitle
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #D0C5B4",
                }}
              >
                <Typography
                  variant="h2"
                  color={"#4D4639"}
                  fontWeight={"500"}
                  component="h2"
                  mb={0}
                >
                  {selectedOpportunity
                    ? "Edit Opportunity"
                    : "Add New Opportunity"}
                </Typography>

                <CloseIcon
                  onClick={() => setIsDialogOpen(false)}
                  sx={{
                    ml: 2,
                    fontSize: "24px",
                    color: "#4D4639",
                    cursor: "pointer",
                  }}
                />
              </DialogTitle>
              <DialogContent sx={{ p: 0 }}>
                <OpportunityForm
                  initialData={selectedOpportunity || undefined}
                  onSubmit={selectedOpportunity ? handleUpdate : handleCreate}
                />
              </DialogContent>
            </Dialog>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}
