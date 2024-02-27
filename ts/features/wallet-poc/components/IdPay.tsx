import React from "react";
import { Body, ButtonSolid } from "@pagopa/io-app-design-system";
import { WalletCardBase, WalletCardBonus } from "../types";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { IDPayDetailsRoutes } from "../../idpay/details/navigation";
import CardBaseComponent from "./CardBaseComponent";

export type IdPayProps = WalletCardBonus & WalletCardBase;

/**
 * IdPay component extended card example
 * @param props
 */
const IdPay = (props: IdPayProps) => {
  const navigation = useIONavigation();
  return (
    <CardBaseComponent {...props}>
      <Body>{props.amount}</Body>
      <Body>{props.initiativeId}</Body>
      <ButtonSolid
        label={props.label}
        accessibilityLabel=""
        onPress={() =>
          navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
            screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
            params: {
              initiativeId: props.initiativeId
            }
          })
        }
      />
    </CardBaseComponent>
  );
};

export default IdPay;
