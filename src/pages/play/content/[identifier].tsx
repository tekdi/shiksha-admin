import {
  fetchContent,
  getHierarchy,
  getQumlData,
} from "@/services/PlayerService";
import { PlayerConfig } from "@/utils/Interfaces";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  INTERACTIVE_MIME_TYPE,
  QUESTIONSET_MIME_TYPE,
} from "../../../../config.json";
import { V1PlayerConfig, V2PlayerConfig } from "../../../data/player-config";
import Loader from "@/components/Loader";
import { useTranslation } from "react-i18next";
import useStore from "@/store/store";

// @ts-ignore
const SunbirdPlayers = dynamic(() => import("editor/SunbirdPlayers"), {
  ssr: false,
});

let playerConfig: PlayerConfig;

interface SunbirdPlayerProps {
  playerConfig: PlayerConfig;
}

const Players: React.FC<SunbirdPlayerProps> = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { identifier } = router.query;
  const [loading, setLoading] = useState(true);
  const store = useStore();
  const isActiveYear = store.isActiveYearSelected;

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
    !isActiveYear && router.push("/centers");
  }, [identifier, isActiveYear]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }} onClick={() => router.back()}>
        <IconButton>
          <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
          >
            {t("COMMON.BACK")}
          </Typography>
      </Box>
      {loading && (
        <Box
          width={"100%"}
          id="check"
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          mt={"5rem"}
        >
          <Loader showBackdrop={false} />
        </Box>
      )}
      <Box marginTop={"1rem"}>
        <Typography color={'#024f9d'} sx={{padding: '0 0 4px 4px', fontWeight: 'bold'}}>{playerConfig?.metadata?.name}</Typography>
        {!loading ? <SunbirdPlayers player-config={playerConfig} /> : null}
      </Box>

      {/* <Box mt={2}>
        <Typography variant="h4">{t('COMMON.DESCRIPTION')}</Typography>
      </Box> */}

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

export default Players;
