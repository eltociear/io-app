import React from "react";
import { H3 } from "@pagopa/io-app-design-system";
import { WalletCardBase } from "../types";

type CardBaseProps = { children: React.ReactNode } & WalletCardBase;

const CardBaseComponent = (props: CardBaseProps) => {
  const { label } = props;
  return (
    <>
      <H3>{label}</H3>
      {props.children}
    </>
  );
};

export default CardBaseComponent;
