import BackButtonWithLabel from "@/components/common/BackButtonWithLabel";
import AddTemplateForm from "@/components/notification-templates/AddTemplateForm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, IconButton, Typography } from "@mui/material";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const CreateNotificationTemplate = () => {
  const { t } = useTranslation();
  const router = useRouter();


  return (
    <>
      {/* <Box
        sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }}
      onClick={() => router.back()}
      >
        <IconButton>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2">Add Notification Template</Typography>
      </Box> */}

      <BackButtonWithLabel label={t('NOTIFICATION.ADD_NOTIFICATION_TEMPLATE')}
 />
      <AddTemplateForm />
    </>
  );
}

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  };
}

export default CreateNotificationTemplate;