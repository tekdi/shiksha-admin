import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserTable from "@/components/UserTable";
import { useTranslation } from "next-i18next";
import { Role, FormContextType, TelemetryEventType } from "@/utils/app.constant";
import CommonUserModal from "@/components/CommonUserModal";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { telemetryFactory } from "@/utils/telemetry";

const ContentUsers: React.FC = () => {
  const { t } = useTranslation();
  const handleAddContentCreatorClick = () => {
    const windowUrl = window.location.pathname;
    const cleanedUrl = windowUrl.replace(/^\//, '');
    const env = cleanedUrl.split("/")[0];


    const telemetryInteract = {
      context: {
        env: env,
        cdata: [],
      },
      edata: {
        id: 'click-on-add-new',
        type: TelemetryEventType.CLICK,
        subtype: '',
        pageid: cleanedUrl,
      },
    };
    telemetryFactory.interact(telemetryInteract);

    handleOpenAddContentCreatorModal();
  };
  const [submitValue, setSubmitValue] = React.useState<boolean>(false);
  const setSubmittedButtonStatus = useSubmittedButtonStore((state:any) => state.setSubmittedButtonStatus);

  const [ openAddContentCreatorModal, setOpenAddContentCreatorModal] =
    React.useState(false);
  const handleOpenAddContentCreatorModal = () => {
    setOpenAddContentCreatorModal(true);
  };
  const handleModalSubmit = (value: boolean) => {
    setSubmitValue(true);
  };
  const  handleCloseAddContentCreatorModal = () => {
    setSubmittedButtonStatus(false)

    setOpenAddContentCreatorModal(false);
  };

  return (
    <>
      <UserTable
        role={Role.CONTENT_CREATOR}
        searchPlaceholder={t("CONTENT_CREATOR_REVIEWER.SEARCH_CONTENT_CREATOR")}
        userType={Role.CONTENT_CREATOR}
        handleAddUserClick={handleAddContentCreatorClick}
        parentState={submitValue}
      />

      <CommonUserModal
        open={ openAddContentCreatorModal}
        onClose={ handleCloseAddContentCreatorModal}
        onSubmit={handleModalSubmit}
        userType={FormContextType.CONTENT_CREATOR}
      />
    </>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default ContentUsers;
