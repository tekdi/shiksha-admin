import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// @ts-ignore
const Editors = dynamic(() => import("editor/Editor"), { ssr: false });

const Editor = () => {
  return <Editors />;
};

export default Editor;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      noLayout: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
