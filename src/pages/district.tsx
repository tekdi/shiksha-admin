import MasterData from "@/components/MasterData";
import { CohortTypes } from "@/utils/app.constant";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const District: React.FC = () => {
  return <MasterData cohortType={CohortTypes.DISTRICT} />;
};

export default District;

export const getServerSideProps = async (context: any) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common", "master"])),
    },
  };
};
