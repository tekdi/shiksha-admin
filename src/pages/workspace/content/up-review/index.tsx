import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";

// @ts-ignore
// const Submitted = dynamic(() => import("editor/Submitted"), { ssr: false });
const UpForReview = dynamic(() => import("editor/UpReview"), { ssr: false });

const UpReview = () => {
  return <UpForReview />;
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
