import MasterData from "@/components/MasterData";
import { CohortTypes } from "@/utils/app.constant";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";

const Block: React.FC = () => {
  return (
    <React.Fragment>
      <MasterData cohortType={CohortTypes.BLOCK} />
    </React.Fragment>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Block;
