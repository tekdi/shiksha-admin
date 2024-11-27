import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserTable from "@/components/UserTable";
import { useTranslation } from "next-i18next";
import { Role, FormContextType, TelemetryEventType } from "@/utils/app.constant";
import CommonUserModal from "@/components/CommonUserModal";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { telemetryFactory } from "@/utils/telemetry";

const Learners: React.FC = () => {
  const { t } = useTranslation();
  const [openAddLearnerModal, setOpenAddLearnerModal] = React.useState(false);
  const [submitValue, setSubmitValue] = React.useState<boolean>(false);
  const setSubmittedButtonStatus = useSubmittedButtonStore((state:any) => state.setSubmittedButtonStatus);

  const handleOpenAddLearnerModal = () => {
    setOpenAddLearnerModal(true);
  };
  const handleModalSubmit = (value: boolean) => {
    setSubmitValue(true);
  };
  const handleCloseAddLearnerModal = () => {
    setSubmittedButtonStatus(false)
    setOpenAddLearnerModal(false);
  };
  const handleAddLearnerClick = () => {
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

    handleOpenAddLearnerModal();
  };
  return (
    <>
      <UserTable
        role={Role.STUDENT}
        userType={t("SIDEBAR.LEARNERS")}
        searchPlaceholder={t("LEARNERS.SEARCHBAR_PLACEHOLDER")}
        handleAddUserClick={handleAddLearnerClick}
        parentState={submitValue}
      />
      {/* <AddLearnerModal
              open={openAddLearnerModal}
              onClose={handleCloseAddLearnerModal}
             onSubmit={handleModalSubmit}

            /> */}
      <CommonUserModal
        open={openAddLearnerModal}
        onClose={handleCloseAddLearnerModal}
        onSubmit={handleModalSubmit}
        userType={FormContextType.STUDENT}
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

export default Learners;
