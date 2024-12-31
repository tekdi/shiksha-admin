import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import HeaderWrapper from "@/components/layouts/header/HeaderWrapper";
// @ts-ignore
const Submitted = dynamic(() => import("editor/Submitted"), { ssr: false });

const submitted = () => {
  return (
    <>
      <HeaderWrapper />
      <Box paddingTop={"4rem"}>
        <Submitted />
      </Box>
    </>
  );
};

export default submitted;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
