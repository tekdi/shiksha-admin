import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import HeaderWrapper from "@/components/layouts/header/HeaderWrapper";
// @ts-ignore
const Content = dynamic(() => import("editor/Content"), { ssr: false });

const content = () => {
  return (
    <>
      <HeaderWrapper />
      <Box paddingTop={"4rem"}>
        <Content />
      </Box>
    </>
  );
};

export default content;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
