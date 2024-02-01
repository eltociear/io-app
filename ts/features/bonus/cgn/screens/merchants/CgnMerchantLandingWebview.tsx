import { Route, useRoute } from "@react-navigation/core";
import I18n from "i18n-js";
import * as React from "react";
import { SafeAreaView } from "react-native";
import WebviewComponent from "../../../../../components/WebviewComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import {
  CgnDetailsParamsList,
  CgnMerchantLandingWebviewNavigationParams
} from "../../navigation/params";

type Props = {
  navigation: IOStackNavigationProp<
    CgnDetailsParamsList,
    "CGN_MERCHANTS_LANDING_WEBVIEW"
  >;
};

const CgnMerchantLandingWebview: React.FunctionComponent<Props> = (
  props: Props
) => {
  const route =
    useRoute<
      Route<
        "CGN_MERCHANTS_LANDING_WEBVIEW",
        CgnMerchantLandingWebviewNavigationParams
      >
    >();

  const landingPageUrl = route.params.landingPageUrl;
  const landingPageReferrer = route.params.landingPageReferrer;

  return (
    <BaseScreenComponent
      customRightIcon={{
        iconName: "closeLarge",
        onPress: () => props.navigation.goBack(),
        accessibilityLabel: I18n.t("global.buttons.close")
      }}
    >
      <SafeAreaView style={IOStyles.flex}>
        <WebviewComponent
          source={{
            uri: landingPageUrl as string,
            headers: {
              referer: landingPageReferrer,
              "X-PagoPa-CGN-Referer": landingPageReferrer
            }
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnMerchantLandingWebview;
