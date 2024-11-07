import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import {
  fetchContent,
  getHierarchy,
  getQumlData,
} from "@/services/PlayerService";
import { PlayerConfig } from "@/utils/Interfaces";
import { Box } from "@mui/material";
import { V1PlayerConfig, V2PlayerConfig } from "../../../data/player-config";
import {
  QUESTIONSET_MIME_TYPE,
  INTERACTIVE_MIME_TYPE,
} from "../../../../config.json";

// @ts-ignore
const SunbirdPlayers = dynamic(() => import("editor/SunbirdPlayers"), {
  ssr: false,
});

let playerConfig = { config: {}, context: {}, metadata: {}, data: {} };

interface SunbirdPlayerProps {
  playerConfig: PlayerConfig;
}

const players: React.FC<SunbirdPlayerProps> = () => {
  const router = useRouter();
  const { identifier } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        if (identifier) {
          console.log("identifier on players page:", identifier);
          const data = await fetchContent(identifier);
          console.log("data", data);
          if (data.mimeType === QUESTIONSET_MIME_TYPE) {
            playerConfig = V2PlayerConfig;
            const Q1 = await getHierarchy(identifier);
            console.log("Q1", Q1?.questionset);
            const Q2 = await getQumlData(identifier);
            console.log("Q2", Q2?.questionset);
            const metadata = { ...Q1?.questionset, ...Q2?.questionset };
            playerConfig.metadata = metadata;
            console.log("playerConfig", playerConfig);
          } else if (INTERACTIVE_MIME_TYPE.includes(data?.mimeType)) {
            playerConfig = V1PlayerConfig;
            playerConfig.metadata = data;
          } else {
            playerConfig = V2PlayerConfig;
            playerConfig.metadata = data;
          }
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    loadContent();
  }, [identifier]);

  return (
    <Box>
      <Box marginTop={"1rem"}>
        {!loading ? <SunbirdPlayers player-config={playerConfig} /> : null}
      </Box>
    </Box>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ locale, params }: any) {
  const { identifier } = params;

  return {
    props: {
      identifier,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default players;
