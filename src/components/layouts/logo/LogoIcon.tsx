import React from "react";
import { Link } from "@mui/material";
import Image from "next/image";
import LogoDark from "../../../../public/images/Logo.svg";

const LogoIcon = () => {
  return (
    <>
      <Image src={LogoDark} alt={"LogoDark"} width={200} height={200} />
    </>
  );
};

export default LogoIcon;
