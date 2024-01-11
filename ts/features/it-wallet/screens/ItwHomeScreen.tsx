import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, View } from "react-native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  ButtonLink,
  ButtonSolid,
  TabNavigation,
  VSpacer,
  TabItem
} from "@pagopa/io-app-design-system";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ItwActionBanner } from "../components/ItwActionBanner";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { useIOSelector } from "../../../store/hooks";
import { ITW_ROUTES } from "../navigation/ItwRoutes";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../navigation/ItwParamsList";
import { itwLifecycleIsOperationalSelector } from "../store/reducers/itwLifecycleReducer";
import {
  itwPersistedCredentialsValuePidSelector,
  itwPersistedCredentialsValueSelector
} from "../store/reducers/itwPersistedCredentialsReducer";
import { useItwResetFlow } from "../hooks/useItwResetFlow";
import ItwCredentialCard from "../components/ItwCredentialCard";
import { CredentialType } from "../utils/itwMocksUtils";
import ItwKoView from "../components/ItwKoView";
import { StoredCredential } from "../utils/itwTypesUtils";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.contextualHelpTitle",
  body: "wallet.contextualHelpContent"
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
  const decodedPid = useIOSelector(itwPersistedCredentialsValuePidSelector);
  const credentials = useIOSelector(itwPersistedCredentialsValueSelector);
  const [selectedBadgeIdx, setSelectedBadgeIdx] = useState(0);
  const badgesLabels = [
    I18n.t("features.itWallet.homeScreen.categories.any"),
    I18n.t("features.itWallet.homeScreen.categories.itWallet"),
    I18n.t("features.itWallet.homeScreen.categories.health"),
    I18n.t("features.itWallet.homeScreen.categories.payments"),
    I18n.t("features.itWallet.homeScreen.categories.bonus")
  ];
  const pidType = CredentialType.PID;

  /**
   * Condionally navigate to the credentials catalog screen if the experimental feature flag is true.
   * Otherwise do nothing.
   */
  const onPressAddCredentials = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ISSUANCE.CREDENTIAL.CATALOG
    });
  };

  /**
   * Temporary function to navigate to the checks screen on long press of a credential.
   * TODO: remove this function the qr code scanning is implemented.
   */
  const onLongPressCredential = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL.REMOTE.INIT
    });
  };

  const ContentView = ({ pid }: { pid: StoredCredential }) => (
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
              screen: ITW_ROUTES.PRESENTATION.PID.DETAILS
            })
          }
        >
          <ItwCredentialCard
            parsedCredential={pid.parsedCredential}
            display={pid.displayData}
            type={pidType}
          />
          <VSpacer />
        </Pressable>
        {credentials
          .filter(O.isSome)
          .map(_ => _.value)
          .map((credential, idx) => (
            <Pressable
              onLongPress={onLongPressCredential}
              onPress={() =>
                navigation.navigate(ITW_ROUTES.MAIN, {
                  screen: ITW_ROUTES.PRESENTATION.CREDENTIAL.DETAILS,
                  params: {
                    credential
                  }
                })
              }
              key={`${credential.displayData.title}-${idx}`}
            >
              <ItwCredentialCard
                parsedCredential={credential.parsedCredential}
                display={credential.displayData}
                type={credential.credentialType}
              />
              <VSpacer />
            </Pressable>
          ))}
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
          <ItwKoView
            title={I18n.t("global.jserror.title")}
            pictogram="fatalError"
            action={{
              accessibilityLabel: I18n.t(
                "features.itWallet.homeScreen.reset.label"
              ),
              label: I18n.t("features.itWallet.homeScreen.reset.label"),
              onPress: () => present()
            }}
          />
        ),
        some => <ContentView pid={some} />
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
      <View>
        <TabNavigation>
          {badgesLabels.map((label, idx) => (
            <TabItem
              key={`badge-${idx}`}
              label={label}
              accessibilityLabel={label}
              onPress={() => setSelectedBadgeIdx(idx)}
            />
          ))}
        </TabNavigation>
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

export default ItwHomeScreen;
