import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Role } from "@/utils/app.constant";

// const Login = dynamic(() => import('./Login'), { ssr: false });
// const Dashboard = dynamic(() => import('./Dashboard'), { ssr: false });

const Home: React.FC = () => {
  const { push } = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = localStorage.getItem("token");
      setLoading(false);
      if (token) {
        const storedUserData = JSON.parse(
          localStorage.getItem("adminInfo") || "{}"
        );
        if(storedUserData?.role === Role.SCTA || storedUserData?.role === Role.CCTA){
          window.location.href = "/course-planner"; 
        }
        else
        push("/centers");
      } else {
        push("/login", undefined, { locale: "en" });
      }
    }
  }, []);

  return <>{loading && <p>{t("COMMON.LOADING")}...</p>}</>;
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Home;
