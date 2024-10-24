import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// @ts-ignore
const CourseEditor = dynamic(() => import("editor/Collection"), { ssr: false });

const Collection = () => {
  return <CourseEditor />;
};

export default Collection;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
