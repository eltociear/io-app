import {
  GradientScrollView,
  H3,
  HeaderFirstLevel,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { View } from "react-native";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { selectWalletCards } from "../store/selectors";
import { WalletCard } from "../types";
import { ComponentProps, componentMapper } from "../types/ComponentTypes";

const WalletPocHomeScreen = () => {
  const navigation = useIONavigation();
  const cards = useIOSelector(selectWalletCards);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderFirstLevel type="base" title="Portafoglio" />
    });
  }, [navigation]);

  const renderCardFn = (card: WalletCard) => {
    const CardComponent = componentMapper[
      card.cardType
    ] as React.ComponentType<ComponentProps>;
    return <CardComponent {...card} />;
  };

  const CategoryStack = (category: string) => {
    const categoryCards = cards.filter(c => c.category === category);
    return (
      <>
        <View style={{ borderColor: IOColors.greyLight, borderWidth: 2 }}>
          <H3 style={{ backgroundColor: IOColors.aquaUltraLight }}>
            {category}
          </H3>
          {categoryCards.map(renderCardFn)}
        </View>
        <VSpacer />
      </>
    );
  };

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Add card",
        accessibilityLabel: "Add card",
        onPress: () => undefined
      }}
    >
      {cards
        .map(c => c.category)
        .filter((value, index, self) => self.indexOf(value) === index)
        .map(CategoryStack)}
    </GradientScrollView>
  );
};

export { WalletPocHomeScreen };
