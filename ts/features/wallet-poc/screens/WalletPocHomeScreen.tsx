import {
  Body,
  ButtonSolid,
  GradientScrollView,
  H2,
  H3,
  HeaderFirstLevel
} from "@pagopa/io-app-design-system";
import React from "react";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { selectWalletCards } from "../store/selectors";
import { WalletCard } from "../types";

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
        return (
          <ButtonSolid
            label={card.label}
            accessibilityLabel=""
            onPress={() => {
              card.onPress?.();
            }}
          />
        );
      case "payment":
        return <Body key={card.id}>Payment: {card.circuit}</Body>;
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
