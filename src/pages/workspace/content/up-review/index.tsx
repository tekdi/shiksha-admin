import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import HeaderWrapper from "@/components/layouts/header/HeaderWrapper";

// @ts-ignore
// const Submitted = dynamic(() => import("editor/Submitted"), { ssr: false });
const UpForReview = dynamic(() => import("editor/UpReview"), { ssr: false });

const UpReview = () => {
  return (
    <>
      <HeaderWrapper />
      <Box paddingTop={"4rem"}>
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
