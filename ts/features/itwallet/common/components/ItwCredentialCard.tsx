import {
  HStack,
  IOColors,
  makeFontStyleObject,
  Tag
} from "@pagopa/io-app-design-system";
import React from "react";
import { ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import {
  borderColorByStatus,
  getCredentialNameFromType,
  tagPropsByStatus,
  validCredentialStatuses
} from "../utils/itwCredentialUtils";
import { CredentialType } from "../utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../utils/itwStyleUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";
import { ItwDigitalVersionBadge } from "./ItwDigitalVersionBadge";

export type ItwCredentialCard = {
  credentialType: string;
  status?: ItwCredentialStatus;
  isPreview?: boolean;
};

export const ItwCredentialCard = ({
  status = "valid",
  credentialType,
  isPreview = false
}: ItwCredentialCard) => {
  const isValid = validCredentialStatuses.includes(status);
  const theme = getThemeColorByCredentialType(credentialType);
  const labelOpacity = isValid ? 1 : 0.5;

  const cardBackgroundSource =
    credentialCardBackgrounds[credentialType][isValid ? 0 : 1];
  const statusTagProps = tagPropsByStatus[status];

  return (
    <View style={isPreview && styles.previewContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <AnimatedImage
            source={cardBackgroundSource}
            style={styles.cardBackground}
          />
        </View>
        <View style={styles.header}>
          <HStack space={16}>
            <Text
              style={[
                styles.label,
                { color: theme.textColor, opacity: labelOpacity }
              ]}
            >
              {getCredentialNameFromType(credentialType, "").toUpperCase()}
            </Text>
            {statusTagProps && <Tag {...statusTagProps} />}
          </HStack>
        </View>
        <ItwDigitalVersionBadge
          credentialType={credentialType}
          isFaded={!isValid}
        />
        <View
          style={[styles.border, { borderColor: borderColorByStatus[status] }]}
        />
      </View>
    </View>
  );
};

const credentialCardBackgrounds: {
  [type: string]: [ImageSourcePropType, ImageSourcePropType];
} = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: [
    require("../../../../../img/features/itWallet/cards/dc.png"),
    require("../../../../../img/features/itWallet/cards/dc_off.png")
  ],
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: [
    require("../../../../../img/features/itWallet/cards/ts.png"),
    require("../../../../../img/features/itWallet/cards/ts_off.png")
  ],
  [CredentialType.DRIVING_LICENSE]: [
    require("../../../../../img/features/itWallet/cards/mdl.png"),
    require("../../../../../img/features/itWallet/cards/mdl_off.png")
  ]
};

const styles = StyleSheet.create({
  previewContainer: {
    aspectRatio: 9 / 2,
    overflow: "hidden"
  },
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: "hidden"
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IOColors["grey-100"]
  },
  cardBackground: { height: "100%", width: "100%" },
  border: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 2
  },
  label: {
    flex: 1,
    ...makeFontStyleObject(16, "TitilliumSansPro", 20, "Semibold")
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14
  }
});
