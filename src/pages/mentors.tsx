import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserTable from "@/components/UserTable";
import { useTranslation } from "next-i18next";
import { Role, FormContextType, TelemetryEventType } from "@/utils/app.constant";
import CommonUserModal from "@/components/CommonUserModal";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { telemetryFactory } from "@/utils/telemetry";

const Mentors: React.FC = () => {
  const { t } = useTranslation();
  const [openAddMentorModal, setOpenAddMentorModal] = React.useState(false);
  const [submitValue, setSubmitValue] = React.useState<boolean>(false);
  const setSubmittedButtonStatus = useSubmittedButtonStore((state:any) => state.setSubmittedButtonStatus);

  const handleOpenAddMentorModal = () => {
    setOpenAddMentorModal(true);
  };
  const handleModalSubmit = (value: boolean) => {
    setSubmitValue(true);
  };
  const handleCloseAddMentorModal = () => {
    setSubmittedButtonStatus(false)
    setOpenAddMentorModal(false);
  };
  const handleAddMentorClick = () => {
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

    handleOpenAddMentorModal();
  };
  return (
    <>
      <UserTable
        role={Role.MENTOR}
        userType={t("SIDEBAR.MENTOR")}
        searchPlaceholder={t("MENTOR.SEARCHBAR_PLACEHOLDER")}
        handleAddUserClick={handleAddMentorClick}
        parentState={submitValue}
      />
      {/* <AddLearnerModal
              open={openAddMentorModal}
              onClose={handleCloseAddLearnerModal}
             onSubmit={handleModalSubmit}

            /> */}
      <CommonUserModal
        open={openAddMentorModal}
        onClose={handleCloseAddMentorModal}
        onSubmit={handleModalSubmit}
        userType={FormContextType.MENTOR}
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

export default Mentors;
