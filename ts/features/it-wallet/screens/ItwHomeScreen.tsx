import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import {
  ButtonLink,
  ButtonSolid,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ItwActionBanner } from "../components/ItwActionBanner";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BadgeButton from "../components/design/BadgeButton";
import { useIOSelector } from "../../../store/hooks";
import { ITW_ROUTES } from "../navigation/ItwRoutes";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../navigation/ItwParamsList";
import ItwErrorView from "../components/ItwErrorView";
import { cancelButtonProps } from "../utils/itwButtonsUtils";
import { itwLifecycleIsOperationalSelector } from "../store/reducers/itwLifecycleReducer";
import { itwCredentialsSelector } from "../store/reducers/itwCredentialsReducer";
import { itwDecodedPidValueSelector } from "../store/reducers/itwPidDecodeReducer";
import { useItwResetFlow } from "../hooks/useItwResetFlow";
import { itWalletExperimentalEnabled } from "../../../config";
import ItwCredentialCard from "../components/ItwCredentialCard";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.contextualHelpTitle",
  body: "wallet.contextualHelpContent"
};

export type ContentViewProps = {
  decodedPid: PidWithToken;
};

/**
 * IT-Wallet home screen which contains a top bar with categories, an activation banner and a list of wallet items based on the selected category.
 * It also a label to reset the wallet credentials and a button to add a new credential which only works if the experimental feature flag is true.
 */
const ItwHomeScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const { present, bottomSheet } = useItwResetFlow();
  const isItWalletOperational = useIOSelector(
    itwLifecycleIsOperationalSelector
  );
  const decodedPid = useIOSelector(itwDecodedPidValueSelector);
  const credentials = useIOSelector(itwCredentialsSelector);
  const [selectedBadgeIdx, setSelectedBadgeIdx] = useState(0);
  const badgesLabels = [
    I18n.t("features.itWallet.homeScreen.categories.any"),
    I18n.t("features.itWallet.homeScreen.categories.itWallet"),
    I18n.t("features.itWallet.homeScreen.categories.health"),
    I18n.t("features.itWallet.homeScreen.categories.payments"),
    I18n.t("features.itWallet.homeScreen.categories.bonus")
  ];

  /**
   * Condionally navigate to the credentials catalog screen if the experimental feature flag is true.
   * Otherwise do nothing.
   */
  const onPressAddCredentials = () => {
    if (itWalletExperimentalEnabled) {
      navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.CREDENTIALS.CATALOG
      });
    }
  };

  /**
   * Temporary function to navigate to the checks screen on long press of a credential.
   * TODO: remove this function the qr code scanning is implemented.
   */
  const onLongPressCredential = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CROSS_DEVICE.CHECKS
    });
  };

  const ContentView = ({ decodedPid }: ContentViewProps) => (
    <View
      style={{
        ...IOStyles.flex,
        justifyContent: "flex-start"
      }}
    >
      <ScrollView>
        <VSpacer />
        <Pressable
          onPress={() =>
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.PRESENTATION.PID_DETAILS
            })
          }
        >
          <ItwCredentialCard
            title={I18n.t(
              "features.itWallet.verifiableCredentials.type.digitalCredential"
            )}
            name={`${decodedPid?.pid.claims.givenName} ${decodedPid?.pid.claims.familyName}`}
            fiscalCode={decodedPid?.pid.claims.taxIdCode as string}
            textColor="white"
            backgroundImage={require("../assets/img/credentials/cards/pidFront.png")}
          />
          <VSpacer />
        </Pressable>
        {credentials.map(
          (credential, idx) =>
            O.isSome(credential) && (
              <Pressable
                onLongPress={onLongPressCredential}
                key={`${credential.value.title}-${idx}`}
              >
                <ItwCredentialCard
                  title={credential.value.title}
                  name={`${credential.value.claims.givenName} ${credential.value.claims.familyName}`}
                  fiscalCode={credential.value.claims.taxIdCode}
                  textColor={credential.value.textColor}
                  backgroundImage={credential.value.image}
                />
                <VSpacer />
              </Pressable>
            )
        )}
        <View
          style={{
            ...IOStyles.flex,
            ...IOStyles.selfCenter,
            justifyContent: "flex-end"
          }}
        >
          <View
            style={{
              ...IOStyles.flex,
              justifyContent: "flex-end"
            }}
          ></View>
        </View>
      </ScrollView>
      <View style={{ justifyContent: "flex-end" }}>
        <View style={IOStyles.selfCenter}>
          <ButtonLink
            label={I18n.t("features.itWallet.homeScreen.reset.label")}
            onPress={() => present()}
          />
        </View>
        <VSpacer />
        <ButtonSolid
          icon="add"
          onPress={onPressAddCredentials}
          label={I18n.t("features.itWallet.homeScreen.buttons.addCredential")}
          accessibilityLabel={I18n.t(
            "features.itWallet.homeScreen.buttons.addCredential"
          )}
          iconPosition="end"
          fullWidth
        />
        <VSpacer />
      </View>
    </View>
  );

  const RenderMask = () =>
    pipe(
      decodedPid,
      O.fold(
        () => (
          <ItwErrorView
            type="SingleButton"
            leftButton={cancelButtonProps(navigation.goBack)}
          />
        ),
        some => <ContentView decodedPid={some} />
      )
    );

  return (
    <TopScreenComponent
      accessibilityLabel={I18n.t("global.navigator.wallet")}
      faqCategories={["wallet"]} // temporary until faq is implemented
      contextualHelpMarkdown={contextualHelpMarkdown} // temporary until contextual help is implemented
      isSearchAvailable={{
        enabled: true,
        searchType: "Messages",
        onSearchTap: () => null
      }} // temporary until search is implemented
      isProfileAvailable={{
        enabled: true,
        onProfileTap: () =>
          navigation.getParent()?.navigate(ROUTES.PROFILE_NAVIGATOR)
      }}
      sectionTitle={I18n.t("global.navigator.wallet")}
    >
      <View style={styles.horizontalScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {badgesLabels.map((label, idx) => (
            <BadgeButton
              key={`badge-${idx}`}
              text={label}
              variant={selectedBadgeIdx === idx ? "default" : "contrast"}
              accessibilityLabel={label}
              onPress={() => setSelectedBadgeIdx(idx)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}>
        {isItWalletOperational ? (
          <View style={{ ...IOStyles.flex, justifyContent: "flex-start" }}>
            <ItwActionBanner
              title={I18n.t("features.itWallet.actionBanner.title")}
              content={I18n.t("features.itWallet.actionBanner.description")}
              action={I18n.t("features.itWallet.actionBanner.action")}
            />
          </View>
        ) : selectedBadgeIdx === 0 || selectedBadgeIdx === 1 ? (
          <RenderMask />
        ) : (
          <></>
        )}
        {bottomSheet}
      </View>
    </TopScreenComponent>
  );
};

const styles = StyleSheet.create({
  horizontalScroll: {
    marginLeft: IOVisualCostants.appMarginDefault
  }
});

export default ItwHomeScreen;
