import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserTable from "@/components/UserTable";
import { useTranslation } from "next-i18next";
import { Role, FormContextType } from "@/utils/app.constant";
import CommonUserModal from "@/components/CommonUserModal";
import useSubmittedButtonStore from "@/utils/useSharedState";

const Faciliator: React.FC = () => {
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
    handleOpenAddFacilitatorModal();
  };
  return (
    <>
      <UserTable
        role={Role.TRAINER}
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

export default Faciliator;
