/**
 * A screen where user after login can set email address if it is
 * not present in the profile or if it is already used.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  createRef
} from "react";
import { View, Keyboard, SafeAreaView, StyleSheet, Alert } from "react-native";
import validator from "validator";
import {
  IOColors,
  Icon,
  LabelSmall,
  VSpacer,
  Alert as AlertComponent
} from "@pagopa/io-app-design-system";
import { H1 } from "../../components/core/typography/H1";
import { LabelledItem } from "../../components/LabelledItem";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { profileUpsert } from "../../store/actions/profile";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  isProfileEmailAlreadyTakenSelector,
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { withKeyboard } from "../../utils/keyboard";
import { areStringsEqual } from "../../utils/options";
import { Body } from "../../components/core/typography/Body";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { emailAcknowledged, emailInsert } from "../../store/actions/onboarding";
import { useValidatedEmailModal } from "../../hooks/useValidateEmailModal";
import { usePrevious } from "../../utils/hooks/usePrevious";

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});

const EMPTY_EMAIL = "";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "email.insert.help.title",
  body: "email.insert.help.content"
};

/**
 * A screen to allow user to insert an email address.
 */
const NewOnboardingEmailInsertScreen = () => {
  useValidatedEmailModal(true);
  const dispatch = useIODispatch();

  const viewRef = createRef<View>();

  const profile = useIOSelector(profileSelector);
  const optionEmail = useIOSelector(profileEmailSelector);
  const isProfileEmailAlreadyTaken = useIOSelector(
    isProfileEmailAlreadyTakenSelector
  );
  const prevUserProfile = usePrevious(profile);

  const isLoading = useMemo(
    () => pot.isUpdating(profile) || pot.isLoading(profile),
    [profile]
  );

  const acknowledgeEmail = useCallback(
    () => dispatch(emailAcknowledged()),
    [dispatch]
  );

  const acknowledgeEmailInsert = useCallback(
    () => dispatch(emailInsert()),
    [dispatch]
  );

  const updateEmail = useCallback(
    (email: EmailString) =>
      dispatch(
        profileUpsert.request({
          email
        })
      ),
    [dispatch]
  );
  const [areSameEmails, setAreSameEmails] = useState(false);
  const [email, setEmail] = useState(
    isProfileEmailAlreadyTaken ? optionEmail : O.some(EMPTY_EMAIL)
  );
  const isValidEmail = useCallback(
    () =>
      pipe(
        email,
        O.map(value => {
          if (
            EMPTY_EMAIL === value ||
            !validator.isEmail(value) ||
            areSameEmails
          ) {
            return undefined;
          }
          return E.isRight(EmailString.decode(value));
        }),
        O.toUndefined
      ),
    [areSameEmails, email]
  );

  useEffect(() => {
    if (prevUserProfile && pot.isUpdating(prevUserProfile)) {
      if (pot.isError(profile)) {
        // the user is trying to enter an email already in use
        if (profile.error.type === "PROFILE_EMAIL_IS_NOT_UNIQUE_ERROR") {
          Alert.alert(
            I18n.t("email.insert.alertTitle"),
            I18n.t("email.insert.alertDescription"),
            [
              {
                text: I18n.t("email.insert.alertButton"),
                style: "cancel"
              }
            ]
          );
        }
      } else if (pot.isSome(profile) && !pot.isUpdating(profile)) {
        acknowledgeEmailInsert();
        acknowledgeEmail();
        return;
      }
    }
  }, [acknowledgeEmailInsert, acknowledgeEmail, profile, prevUserProfile]);

  const continueOnPress = () => {
    Keyboard.dismiss();
    pipe(
      email,
      O.map(e => {
        updateEmail(e as EmailString);
      })
    );
  };

  const renderFooterButtons = () => {
    const continueButtonProps = {
      disabled: !isValidEmail() && !isLoading,
      onPress: continueOnPress,
      title: I18n.t("global.buttons.continue"),
      block: true,
      primary: isValidEmail()
    };

    return (
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={continueButtonProps}
      />
    );
  };

  const handleOnChangeEmailText = (value: string) => {
    setAreSameEmails(areStringsEqual(O.some(value), optionEmail, true));
    setEmail(value !== EMPTY_EMAIL ? O.some(value) : O.none);
  };

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <BaseScreenComponent
        headerTitle={I18n.t("email.newinsert.header")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <SafeAreaView style={styles.flex}>
          <Content
            testID="container-test"
            noPadded={true}
            style={styles.flex}
            scrollEnabled={false}
          >
            <View style={IOStyles.horizontalContentPadding}>
              <H1 color={"bluegreyDark"} weight={"Bold"} testID="title-test">
                {I18n.t("email.newinsert.title")}
              </H1>
              <VSpacer size={16} />
              <Body>{I18n.t("email.newinsert.subtitle")}</Body>
              {isProfileEmailAlreadyTaken && (
                <>
                  <VSpacer size={24} />
                  <AlertComponent
                    testID="alert-test"
                    viewRef={viewRef}
                    variant="info"
                    content={I18n.t("email.newinsert.alert.title", {
                      email: pipe(
                        optionEmail,
                        O.getOrElse(() => EMPTY_EMAIL)
                      )
                    })}
                  />
                </>
              )}
              <VSpacer size={24} />

              <View>
                <LabelledItem
                  label={I18n.t("email.newinsert.label")}
                  icon="email"
                  isValid={isValidEmail()}
                  overrideBorderColor={areSameEmails ? IOColors.red : undefined}
                  inputProps={{
                    returnKeyType: "done",
                    onSubmitEditing: continueOnPress,
                    autoCapitalize: "none",
                    keyboardType: "email-address",
                    defaultValue: !isProfileEmailAlreadyTaken
                      ? pipe(
                          email,
                          O.getOrElse(() => EMPTY_EMAIL)
                        )
                      : EMPTY_EMAIL,
                    onChangeText: handleOnChangeEmailText
                  }}
                  testID="TextField"
                />
                {areSameEmails && (
                  <View
                    testID="error-label"
                    style={{
                      position: "absolute",
                      bottom: -25,
                      left: 2,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center"
                    }}
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no-hide-descendants"
                  >
                    <View style={{ marginRight: 6 }}>
                      <Icon size={14} name="notice" color="red" />
                    </View>
                    <LabelSmall weight="Regular" color="red">
                      {I18n.t("email.newinsert.alert.description")}
                    </LabelSmall>
                  </View>
                )}
              </View>
            </View>
          </Content>
          {withKeyboard(renderFooterButtons())}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default NewOnboardingEmailInsertScreen;
