import React from "react";
import { Body, ButtonSolid } from "@pagopa/io-app-design-system";
import CardBaseComponent from "../../wallet-poc/components/CardBaseComponent";
import { WalletCardBase, WalletCardFeatureX } from "../../wallet-poc/types";

export type FeatureXProps = WalletCardFeatureX & WalletCardBase;

/**
 * IdPay component extended card example
 * @param props
 */
const FeatureX = (props: FeatureXProps) => (
  <CardBaseComponent {...props}>
    <Body>{props.description}</Body>
    <Body>{props.circuit}</Body>
    <ButtonSolid
      label={props.label}
      accessibilityLabel=""
      onPress={() => undefined}
    />
  </CardBaseComponent>
);

export default FeatureX;
