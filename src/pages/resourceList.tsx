import React, { useEffect, useState } from "react";
import { Grid, Typography, Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import ResourceCard from "../components/ResourceCard";
import taxonomyStore from "@/store/tanonomyStore";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ResourceType } from "@/utils/app.constant";
import { useTranslation } from "next-i18next";
import router from "next/router";
import { fetchBulkContents } from "@/services/PlayerService";

const ResourceList = () => {
  const [learnersPreReq, setLearnersPreReq] = useState<any[]>([]);
  const [learnersPostReq, setLearnersPostReq] = useState<any[]>([]);
  const [facilitatorsPreReq, setFacilitatorsPreReq] = useState<any[]>([]);

  const tstore = taxonomyStore();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const resources = tstore.resources;

      const fetchedLearningResources = resources?.learningResources || [];
      if (fetchedLearningResources?.length) {
        fetchedLearningResources.forEach((resource: { id: string }) => {
          resource.id = resource.id.toLowerCase();
        });

        console.log(fetchedLearningResources);

        let contents = await fetchBulkContents(
          fetchedLearningResources?.map((item: any) => item.id)
        );

        contents = contents.map((item: any) => {
          const contentType = fetchedLearningResources?.find(
            (resource: any) => resource.id === item.identifier
          )?.type;

          return {
            ...item,
            type: contentType,
          };
        });
        console.log("contents", contents);

        const preRequisite = contents.filter(
          (item: any) => item.type === ResourceType.LEARNER_PRE_REQUISITE
        );
        const postRequisite = contents.filter(
          (item: any) => item.type === ResourceType.LEARNER_POST_REQUISITE
        );
        const facilitatorsRequisite = contents.filter(
          (item: any) => item.type === ResourceType.FACILITATOR_REQUISITE
        );

        setLearnersPreReq(preRequisite);
        setLearnersPostReq(postRequisite);
        setFacilitatorsPreReq(facilitatorsRequisite);
      }
    };

    fetchData();
  }, [tstore.resources]);

  const handleBack = () => {
    router.back();
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
              <Grid item xs={6} md={4} lg={3} key={index}>
                <ResourceCard
                  title={item.name}
                  // type={item.app}
                  resource={item.contentType}
                  appIcon={item?.appIcon}
                  identifier={item.identifier}
                  mimeType={item.mimeType}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
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
                  // type={item.app}
                  resource={item.contentType}
                  appIcon={item?.appIcon}
                  identifier={item.identifier}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
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
                  // type={item.app || "Facilitator"}
                   resource={item.contentType}
                  appIcon={item?.appIcon}
                  identifier={item.identifier}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            {t("COURSE_PLANNER.NO_DATA")}
          </Typography>
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
