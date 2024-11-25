import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import dynamic from "next/dynamic";

// @ts-ignore
const DiscoverContent = dynamic(() => import("editor/DiscoverContent"), { ssr: false });

const content = () => {
  return <DiscoverContent />;
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
