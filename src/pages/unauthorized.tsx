import { Role } from '@/utils/app.constant';
import WarningIcon from '@mui/icons-material/Warning';
import { Link, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

const Unauthorized = () => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const router = useRouter();

  const { role } = router.query;
  return (
    <Box
      py={4}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ height: '100vh' }} // '-webkit-fill-available' can be approximated with '100vh'
    >
      <WarningIcon color="primary" sx={{ fontSize: '68px' }} />
      <Typography
        mt={4}
        variant="h2"
        fontSize="24px"
        lineHeight="30px"
        fontWeight="600"
        color="black"
      >
        {t('COMMON.ACCESS_DENIED')}
      </Typography>

      <Typography
        mt={4}
        mb={2}
        variant="subtitle2"
        fontSize="16px"
        lineHeight="16px"
        fontWeight="600"
        color={theme.palette.warning['400']}
      >
        {t('COMMON.YOU_DONT_HAVE_PERMISSION_TO_ACCESS_THIS_PAGE')}
      </Typography>

      {role ? (<Typography  sx={{ cursor: 'pointer'}}onClick={() =>{          
      localStorage.clear();
      router.push("/login");
}} color={'secondary'}>
        {t('COMMON.RETURN_TO_LOGIN')}
      </Typography>):       <Typography  sx={{ cursor: 'pointer'}} color={'secondary'} onClick={() =>{window.history.go(-2)}} >Go back</Typography>
}
    </Box>
  );
};

export async function getStaticProps({ locale}: any) {

 
    return {
      props: {
        noLayout: true,

        ...(await serverSideTranslations(locale, ['common'])),
        // Will be passed to the page component as props
      },
    };
  
}

export default Unauthorized;
