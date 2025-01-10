import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Link,
  Box,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getContentHierarchy } from '@/services/coursePlanner';
import { useRouter } from 'next/router';
import Loader from '@/components/Loader';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ResourceCard from '@/components/ResourceCard';

const RecursiveAccordion = ({ data }: { data: any[] }) => {
  const router = useRouter();

  const renderAccordion = (nodes: any[], level = 0) => {
    const resourceNodes = nodes.filter(node => node.contentType === 'Resource');
    const nonResourceNodes = nodes.filter(node => node.contentType !== 'Resource');

    return (
      <>
        {resourceNodes.length > 0 && (
          <Grid container spacing={2} sx={{ marginBottom: '16px' }}>
            {resourceNodes.map((node, index) => (
              <Grid item xs={6} md={4} lg={3} key={`${node.name}-${index}`}>
                <ResourceCard
                  title={node?.name}
                  resource={node?.resourceType}
                  identifier={node?.identifier}
                  mimeType={node?.mimeType}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {nonResourceNodes.map((node, index) => (
          <Box key={`${node.name}-${index}`} sx={{ marginBottom: '16px' }}>
            {level === 0 ? (
              <>
                <Typography
                  variant="h1"
                  sx={{
                    marginBottom: '0.75rem',
                    fontWeight: 'bold', 
                    borderBottom: '1px solid #ddd',
                    paddingLeft: '4px',
                    padding:'16px'
                  }}
                >
                  {node.name}
                </Typography>
                {node.children && renderAccordion(node.children, level + 1)}
              </>
            ) : (
                <Accordion sx={{
                  marginLeft: `${(level - 1) * 0.2}px`,
                  boxShadow:
                    level !== 1
                      ? '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
                      : 'unset',
                }}>
                  <AccordionSummary sx={{
                    '&.MuiAccordionSummary-root': {
                      backgroundColor: level === 1 ? '#F1E7D9' : '#fff',
                      borderBottom: '1px solid #D0C5B4',
                    },
                  }} expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1"
                      fontWeight={500}
                      sx={{ color: '#1F1B13', fontWeight: 500, fontSize: '14px' }}>
                    {node?.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{padding:'20px'}}>
                  {node?.children && renderAccordion(node?.children, level + 1)}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        ))}
      </>
    );
  };

  return <Box>{renderAccordion(data)}</Box>;
};


export default function CourseHierarchy() {
  const router = useRouter();
  const [doId, setDoId] = useState<string | null>(null);
  const [courseHierarchyData, setCourseHierarchyData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (router.query.identifier) {
      setDoId(router.query.identifier as string);
    }
  }, [router.query.identifier]);

  useEffect(() => {
    const fetchCohortHierarchy = async (doId: string): Promise<any> => {
      try {
        const hierarchyResponse = await getContentHierarchy({
          doId,
        });
        setLoading(true);
        const hierarchyData = hierarchyResponse?.data?.result?.content;
        setCourseHierarchyData([hierarchyData]);

         

        return hierarchyResponse;
      } catch (error) {
        console.error('Error fetching solution details:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    if (typeof doId === 'string') {
      fetchCohortHierarchy(doId);
    }
  }, [doId]);

  if (loading) {
    return (
      <Loader showBackdrop={true} loadingText="Loading" />
    );
  }

  return <RecursiveAccordion data={courseHierarchyData} />;
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ locale, params }: any) {
  const { identifier } = params;

  return {
    props: {
      identifier,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}