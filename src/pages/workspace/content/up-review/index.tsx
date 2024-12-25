import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";
import Header from "@/components/layouts/header/Header";
import { useTheme } from "@mui/material/styles";
import { Box, useMediaQuery } from "@mui/material";

// @ts-ignore
// const Submitted = dynamic(() => import("editor/Submitted"), { ssr: false });
const UpForReview = dynamic(() => import("editor/UpReview"), { ssr: false });

const UpReview = () => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const theme = useTheme();
  const lgUp = useMediaQuery(theme?.breakpoints?.up("lg"));

  return (
    <>
      <Header
        sx={{
          zIndex: -1,
          width: isSidebarOpen && lgUp ? "78%" : "100%",
          paddingLeft: isSidebarOpen && lgUp ? "265px" : "",
          backgroundColor: "#4d4639",
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
        toggleMobileSidebar={() => setMobileSidebarOpen(true)}
      />
      <Box paddingTop={"3rem"}>
        <UpForReview />
      </Box>
    </>
  );
};

export default UpReview;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
