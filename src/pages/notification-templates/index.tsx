import SearchBar from '@/components/layouts/header/SearchBar';
import TemplateTable from '@/components/notification-templates/TemplateTable';
import { DEFAULT_TEMPLATE_CONTEXT } from '@/utils/app.constant';
import AddIcon from "@mui/icons-material/Add";
import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React from 'react';


const NotificationTemplate = () => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const router = useRouter();

  const isMobile = useMediaQuery("(max-width:600px)");
  const isMediumScreen = useMediaQuery("(max-width:986px)");

  const [searchKey, setSearchKey] = React.useState<string>(''); // search key for searching templates
  const [context, setContext] = React.useState<string>(DEFAULT_TEMPLATE_CONTEXT[0]);

  const onSearch = (keyword: string) => {
    setSearchKey(keyword);
  }


  const handleChange = (event: SelectChangeEvent<string>) => {
    console.log("Event", event.target.value);
    setContext(event.target.value);
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
        {
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile || isMediumScreen ? "column" : "row",
                gap: isMobile || isMediumScreen ? "8px" : "5%",
                marginTop: "20px",
              }}
            >
              <Box sx={{ flex: 1, paddingLeft: "16px", paddingRight: "16px" }}>
                <SearchBar placeholder={'Search Template by Title'} onSearch={onSearch} />
              </Box>
              <Box
                display={"flex"}
                gap={1}
                alignItems={"center"}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: isMobile ? "93%" : "200px",
                  borderRadius: "20px",
                  border: "1px solid #1E1B16",
                  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                  mr: "10px",
                  ml: isMobile ? "50px" : isMediumScreen ? "10px" : undefined,
                  mt: isMobile ? "10px" : isMediumScreen ? "10px" : undefined,
                  '@media (max-width: 600px)': {
                    mx: "16px",
                  }
                }}
              >
                <Button
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: "none",
                    fontSize: "14px",
                    color: theme.palette.primary["100"],
                  }}
                  onClick={() => router.push('/notification-templates/create')}
                >
                  {t("COMMON.ADD_NEW")}
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",

                ml: "10px",
                mt: isMobile ? "10px" : "16px",
                mb: "10px",
                gap: "15px", // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              {(
                <FormControl sx={{ width: '15%' }}>
                  <InputLabel id="context-select-label">        {t('NOTIFICATION.CONTEXT_TYPE')}
</InputLabel>
                  <Select
                    labelId="context-select-label"
                    id="context-select"
                    value={context}
                    label="Context Type"
                    onChange={handleChange}
                  >
                    {DEFAULT_TEMPLATE_CONTEXT.map((item: string) => {
                      return <MenuItem value={item}>{item}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              )}
            </Box>
            <Box mt={2} >
              <TemplateTable searchKey={searchKey} context={context} />
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
