import { useEffect } from "react";
import { useRouter } from "next/router";
import { logout } from "../services/LoginService";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";

function Logout() {
  const router = useRouter();
  const { t, ready } = useTranslation();
  useEffect(() => {
    const userLogout = async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          await logout(refreshToken);
        }
      } catch (error) {
        console.log(error);
      }
    };
    userLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("adminInfo");



    router.replace("/login");
  }, []);

  return <Loader showBackdrop={true} loadingText={ready ? t("COMMON.LOADING") : "Loading"} />;
}

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Logout;
