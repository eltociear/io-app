import { Banner, IOVisualCostants } from "@pagopa/io-app-design-system";
import React, { createRef } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";

type SettingsDiscoveryBannerProps = {
  handleOnClose: () => void;
};

/**
 * to use in case the banner's visibility has to be handled externally
 * (see MultiBanner feature for the landing screen)
 */
export const SettingsDiscoveryBanner = ({
  handleOnClose
}: SettingsDiscoveryBannerProps) => {
  const bannerRef = createRef<View>();
  const navigation = useIONavigation();
  const handleOnPress = () => {
    navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.SETTINGS_MAIN
    });
  };
  return (
    <View style={styles.margins}>
      <Banner
        viewRef={bannerRef}
        content={I18n.t("settings.informativeBanner.content")}
        action={I18n.t("settings.informativeBanner.action")}
        pictogramName="settings"
        color="neutral"
        size="big"
        onClose={handleOnClose}
        labelClose={I18n.t("global.buttons.close")}
        onPress={handleOnPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
