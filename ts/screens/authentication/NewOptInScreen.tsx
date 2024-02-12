import React from "react";
import { Dimensions, View } from "react-native";
import {
  Badge,
  ContentWrapper,
  FeatureInfo,
  GradientScrollView,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useStore } from "react-redux";
import { Route, useRoute } from "@react-navigation/native";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import ROUTES from "../../navigation/routes";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import I18n from "../../i18n";
import { setFastLoginOptIn } from "../../features/fastLogin/store/actions/optInActions";
import { useIODispatch } from "../../store/hooks";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import {
  trackLoginSessionOptIn,
  trackLoginSessionOptIn30,
  trackLoginSessionOptIn365,
  trackLoginSessionOptInInfo
} from "../../features/fastLogin/analytics/optinAnalytics";
import { useSecuritySuggestionsBottomSheet } from "../../hooks/useSecuritySuggestionBottomSheet";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.opt_in.contextualHelpTitle",
  body: "authentication.opt_in.contextualHelpContent"
};

export const MIN_HEIGHT_TO_SHOW_FULL_RENDER = 820;

export type ChosenIdentifier = {
  identifier: "SPID" | "CIE";
};

const NewOptInScreen = () => {
  const dispatch = useIODispatch();
  const {
    securitySuggestionBottomSheet,
    presentSecuritySuggestionBottomSheet
  } = useSecuritySuggestionsBottomSheet();
  const { identifier } =
    useRoute<Route<"AUTHENTICATION_OPT_IN", ChosenIdentifier>>().params;
  const navigation = useIONavigation();
  const store = useStore();

  useOnFirstRender(() => {
    trackLoginSessionOptIn();
  });

  const navigateToIdpPage = (isLV: boolean) => {
    if (isLV) {
      void trackLoginSessionOptIn365(store.getState());
    } else {
      void trackLoginSessionOptIn30(store.getState());
    }
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen:
        identifier === "CIE"
          ? ROUTES.CIE_PIN_SCREEN
          : ROUTES.AUTHENTICATION_IDP_SELECTION
    });
    dispatch(setFastLoginOptIn({ enabled: isLV }));
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <GradientScrollView
        testID="container-test"
        primaryActionProps={{
          label: I18n.t("authentication.opt_in.button_accept_lv"),
          accessibilityLabel: I18n.t("authentication.opt_in.button_accept_lv"),
          onPress: () => navigateToIdpPage(true),
          testID: "accept-button-test"
        }}
        secondaryActionProps={{
          label: I18n.t("authentication.opt_in.button_decline_lv"),
          accessibilityLabel: I18n.t("authentication.opt_in.button_decline_lv"),
          onPress: () => navigateToIdpPage(false),
          testID: "decline-button-test"
        }}
      >
        <ContentWrapper>
          {/* 
          if the device height is > 820 then the pictogram will be visible, 
          otherwise it will not be visible
          */}
          {Dimensions.get("screen").height > MIN_HEIGHT_TO_SHOW_FULL_RENDER && (
            <View style={IOStyles.selfCenter} testID="pictogram-test">
              <Pictogram name="passcode" size={120} />
            </View>
          )}
          <VSpacer size={24} />
          <View style={IOStyles.selfCenter}>
            <Badge
              text={I18n.t("authentication.opt_in.news")}
              variant="info"
              testID="badge-test"
            />
          </View>
          <VSpacer size={24} />
          <H3
            style={{ textAlign: "center", alignItems: "center" }}
            testID="title-test"
          >
            {I18n.t("authentication.opt_in.title")}
          </H3>
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="identityCheck"
            body={I18n.t("authentication.opt_in.identity_check")}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="passcode"
            body={I18n.t("authentication.opt_in.passcode")}
          />
          <VSpacer size={24} />
          <FeatureInfo
            pictogramName="notification"
            body={I18n.t("authentication.opt_in.notification")}
            actionLabel={I18n.t("authentication.opt_in.security_suggests")}
            actionOnPress={() => {
              trackLoginSessionOptInInfo();
              return presentSecuritySuggestionBottomSheet();
            }}
          />
        </ContentWrapper>
        {securitySuggestionBottomSheet}
      </GradientScrollView>
    </BaseScreenComponent>
  );
};

export default NewOptInScreen;
