import React from "react";
import { H3 } from "@pagopa/io-app-design-system";
import { WalletCardBase } from "../types";

type CardBaseProps = { children: React.ReactNode } & WalletCardBase;

/**
 * A card base component
 * This should be used as a base for all the cards,
 * give a base layout and style. A specific feature card
 * should extend this component and add the specific
 * @param props
 */
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
