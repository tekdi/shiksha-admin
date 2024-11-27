import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserTable from "@/components/UserTable";
import { useTranslation } from "next-i18next";
import { Role, FormContextType, TelemetryEventType } from "@/utils/app.constant";
import CommonUserModal from "@/components/CommonUserModal";
import useSubmittedButtonStore from "@/utils/useSharedState";
import { telemetryFactory } from "@/utils/telemetry";

const Facilitator: React.FC = () => {
  const { t } = useTranslation();
  const [openAddFacilitatorModal, setOpenAddFacilitatorModal] =
    React.useState(false);
  const [submitValue, setSubmitValue] = React.useState<boolean>(false);
  const setSubmittedButtonStatus = useSubmittedButtonStore((state:any) => state.setSubmittedButtonStatus);

  const handleOpenAddFacilitatorModal = () => {
    setOpenAddFacilitatorModal(true);
  };
  const handleModalSubmit = (value: boolean) => {
    setSubmitValue(true);
  };
  const handleCloseAddFacilitatorModal = () => {
    setSubmittedButtonStatus(false)
    setOpenAddFacilitatorModal(false);
  };

  const handleAddFaciliatorClick = () => {
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

    handleOpenAddFacilitatorModal();
  };
  return (
    <>
      <UserTable
        role={Role.TEACHER}
        userType={t("SIDEBAR.FACILITATORS")}
        searchPlaceholder={t("FACILITATORS.SEARCHBAR_PLACEHOLDER")}
        handleAddUserClick={handleAddFaciliatorClick}
        parentState={submitValue}
      />
      <CommonUserModal
        open={openAddFacilitatorModal}
        onClose={handleCloseAddFacilitatorModal}
        userType={FormContextType.TEACHER}
        onSubmit={handleModalSubmit}
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

export default Facilitator;
