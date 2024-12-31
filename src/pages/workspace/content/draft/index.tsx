import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import HeaderWrapper from "@/components/layouts/header/HeaderWrapper";
// @ts-ignore
const Draft = dynamic(() => import("editor/Draft"), { ssr: false });

const draft = () => {
  return (
    <>
      <HeaderWrapper />
      <Box paddingTop={"4rem"}>
        <Draft />
      </Box>
    </>
  );
};

export default draft;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
