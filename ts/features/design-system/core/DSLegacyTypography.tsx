import { HStack, IOColors, VStack } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, View } from "react-native";
import { Label as LegacyLabel } from "../../../components/core/typography/Label";
import { LabelSmall as LegacyLabelSmall } from "../../../components/core/typography/LabelSmall";
import { Link as LegacyLink } from "../../../components/core/typography/Link";
import { Monospace as LegacyMonospace } from "../../../components/core/typography/Monospace";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyTypography = () => (
  <DesignSystemScreen title={"Legacy typography"}>
    <VStack space={40}>
      <LegacyLabelSmallRow />
      <LegacyLabelRow />
      <LegacyLink onPress={() => Alert.alert("onPress link!")}>Link</LegacyLink>
      <LegacyMonospace>MonoSpace</LegacyMonospace>
    </VStack>
  </DesignSystemScreen>
);

const LegacyLabelSmallRow = () => (
  <HStack space={16}>
    <LegacyLabelSmall>Label small</LegacyLabelSmall>
    <LegacyLabelSmall color={"bluegrey"}>Label small</LegacyLabelSmall>
    <LegacyLabelSmall color={"red"}>Label small</LegacyLabelSmall>
    <View style={{ backgroundColor: IOColors.bluegrey }}>
      <LegacyLabelSmall color={"white"}>Label small</LegacyLabelSmall>
    </View>
  </HStack>
);

const LegacyLabelRow = () => (
  <HStack space={16}>
    <LegacyLabel>Label</LegacyLabel>
    <LegacyLabel color={"bluegrey"}>Label</LegacyLabel>
    <View style={{ backgroundColor: IOColors.bluegrey }}>
      <LegacyLabel color={"white"}>Label</LegacyLabel>
    </View>
  </HStack>
);
