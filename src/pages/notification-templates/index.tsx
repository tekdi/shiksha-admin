import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getNotificationTemplates } from '@/services/NotificationTemplateService';
import SearchBar from '@/components/layouts/header/SearchBar';
import { useMediaQuery, useTheme } from '@mui/material';
import TemplateTable from '@/components/notification-templates/TemplateTable';

const NotificationTemplate = () => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:986px)");

  const [searchKey, setSearchKey] = React.useState<string>(''); // search key for searching templates

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getNotificationTemplates({ context: 'TEST' });
        console.log('response', response);
      } catch (error) {
        console.error('error in fetching Notification Templates', error);
      }
    };
    fetchData();
  }, []);

  const onSearch = (keyword: string) => {
    setSearchKey(keyword);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "8px" : "16px",
        padding: isMobile ? "8px" : "16px",
        backgroundColor: theme.palette.secondary["100"],
        borderRadius: "8px",
      }}
    >
      <Typography
        mt={4}
        variant="h2"
        fontSize="20px"
        lineHeight="30px"
        fontWeight="600"
        color="black"
      >
        {t('SIDEBAR.MANAGE_NOTIFICATION')}
      </Typography>

      <Box
        sx={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0px 2px 6px 2px #00000026",
          paddingBottom: "0px",
          padding: "20px"
        }}
      >
        {/* Add search Box */
          <>
            <SearchBar placeholder={'Search Template by Title'} onSearch={onSearch} />
            <Box mt={2} >
              <TemplateTable searchKey={searchKey} />
            </Box>
          </>
        }
      </Box>
    </Box >
  );
};

export async function getStaticProps({ locale }: any) {


  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  };

}


export default NotificationTemplate;
