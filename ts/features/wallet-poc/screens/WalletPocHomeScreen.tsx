import {
  GradientScrollView,
  H3,
  HeaderFirstLevel
} from "@pagopa/io-app-design-system";
import React from "react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { selectWalletCards } from "../store/selectors";
import { WalletCard } from "../types";
import componentMapper from "../types/ComponentMapper";
import { IdPayProps } from "../components/IdPay";
import { PaymentProps } from "../components/Payment";

const WalletPocHomeScreen = () => {
  const navigation = useIONavigation();
  const cards = useIOSelector(selectWalletCards);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderFirstLevel type="base" title="Portafoglio" />
    });
  }, [navigation]);

  const bonusCards = cards.filter(c => c.kind === "bonus");
  const paymentCards = cards.filter(c => c.kind === "payment");

  const renderCardFn = (card: WalletCard) => {
    switch (card.kind) {
      case "bonus":
        const IdPay = componentMapper[
          card.componentType
        ] as React.ComponentType<IdPayProps>;
        return <IdPay {...card} />;
      case "payment":
        const Payment = componentMapper[
          card.componentType
        ] as React.ComponentType<PaymentProps>;
        return (
          <Payment key={card.key} label={card.label} circuit={card.circuit} />
        );
    }
  };

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Add card",
        accessibilityLabel: "Add card",
        onPress: () => undefined
      }}
    >
      <H3>Bonus</H3>
      {bonusCards.map(renderCardFn)}
      <H3>Payments</H3>
      {paymentCards.map(renderCardFn)}
    </GradientScrollView>
  );
};

export { WalletPocHomeScreen };
