import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";

import { Box } from "@mui/material";
import HeaderWrapper from "@/components/layouts/header/HeaderWrapper";
// @ts-ignore
const Publish = dynamic(() => import("editor/Publish"), { ssr: false });

const publish = () => {
  return (
    <>
      <HeaderWrapper />
      <Box paddingTop={"4rem"}>
        <Publish />
      </Box>
    </>
  );
};

export default publish;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
