import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import ResourceCard from "../components/ResourceCard";
import taxonomyStore from "@/store/tanonomyStore";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ResourceType } from "@/utils/app.constant";
import { useTranslation } from "next-i18next";
import router from "next/router";

const ResourceList = () => {
  const [learnersPreReq, setLearnersPreReq] = useState<any[]>([]);
  const [learnersPostReq, setLearnersPostReq] = useState<any[]>([]);
  const [facilitatorsPreReq, setFacilitatorsPreReq] = useState<any[]>([]);

  const tstore = taxonomyStore();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const resources = tstore.resources;
      const fetchedLearningResources = resources.learningResources || [];
      const preReqs = fetchedLearningResources.filter(
        (item: any) => item.type === ResourceType.PREREQUISITE
      );
      const postReqs = fetchedLearningResources.filter(
        (item: any) => item.type === ResourceType.POSTREQUISITE
      );
      const facilitatorsReqs = fetchedLearningResources.filter(
        (item: any) => !item.type
      );

      setLearnersPreReq(preReqs);
      setLearnersPostReq(postReqs);
      setFacilitatorsPreReq(facilitatorsReqs);
    };

    fetchData();
  }, [tstore.resources]);

  const handleBack = () => {
    router.push(`/importCsv?subject`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h2" mb={2}>
        {tstore.taxonomyType}
      </Typography>
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <IconButton sx={{ mr: 1 }} onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>

        {/* Course Name */}
        <Typography variant="h2" fontWeight={600}>
          {tstore?.resources?.name}
        </Typography>
      </Box>

      <Box sx={{ border: "1px solid #DDDDDD", borderRadius: "10px" }} p={2}>
        <Typography variant="h4" fontWeight={500} mb={2}>
          {t("COURSE_PLANNER.LEARNERS_PREREQISITE")}
        </Typography>
        {learnersPreReq.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {learnersPreReq.map((item, index) => (
              <Grid item key={index}>
                <ResourceCard
                  title={item.name}
                  type={item.app}
                  resource={item.type}
                  identifier={item.id}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{fontStyle: 'italic'}}>
            {t("COURSE_PLANNER.NO_DATA_PRE")}
          </Typography>
        )}

        <Typography variant="h4" fontWeight={500} mb={2}>
          {t("COURSE_PLANNER.LEARNERS_POSTREQISITE")}
        </Typography>
        {learnersPostReq.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {learnersPostReq.map((item, index) => (
              <Grid item key={index}>
                <ResourceCard
                  title={item.name}
                  type={item.app}
                  resource={item.type}
                  identifier={item.id}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{fontStyle: 'italic'}}>
            {t("COURSE_PLANNER.NO_DATA_POST")}
          </Typography>
        )}

        <Typography variant="h4" fontWeight={500} mb={2}>
          {t("COURSE_PLANNER.FACILITATORS")}
        </Typography>
        {facilitatorsPreReq.length > 0 ? (
          <Grid container spacing={2}>
            {facilitatorsPreReq.map((item, index) => (
              <Grid item key={index}>
                <ResourceCard
                  title={item.name}
                  type={item.app || "Facilitator"}
                  resource="Facilitator Requisite"
                  identifier={item.id}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{fontStyle: 'italic'}}>{t("COURSE_PLANNER.NO_DATA")}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResourceList;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
