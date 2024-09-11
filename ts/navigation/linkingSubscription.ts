import { SessionToken } from "./../types/SessionToken";
import { Linking } from "react-native";
import { Action, Dispatch, Store } from "redux";
import { GlobalState } from "../store/reducers/types";
import { isArchivingDisabledSelector } from "../features/messages/store/reducers/archiving";
import { resetMessageArchivingAction } from "../features/messages/store/actions/archiving";
import { cieIdUrlAction, loginSuccess } from "../store/actions/authentication";
import { IdpData } from "../../definitions/content/IdpData";

export const linkingSubscription =
  (dispatch: Dispatch<Action>, store: Store<Readonly<GlobalState>>) =>
  (listener: (url: string) => void) => {
    const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
      // Message archiving/restoring hides the bottom tab bar so we must make
      // sure that either it is disabled or we manually deactivate it, otherwise
      // a deep link may initiate a navigation flow that will later deliver the
      // user to a screen where the tab bar is hidden (while it should be shown)
      const state = store.getState();
      const isArchivingDisabled = isArchivingDisabledSelector(state);
      if (!isArchivingDisabled) {
        // Auto-reset does not provide feedback to the user
        dispatch(resetMessageArchivingAction(undefined));
      }
      console.log("🥳 Linking event received", url);
      // If url has scheme iologin and a token query param, get the token and dispatch the action
      // to handle the login
      if (url.startsWith("iologincie://")) {
        const token = url.split("token=")[1] as SessionToken;
        const idp = "cieid" as keyof IdpData;
        if (token) {
          console.log("🔐 Login token extracted", token);
          dispatch(loginSuccess({ token, idp }));
        }
      }
      // if the url is of this format: iologincie:https://idserver.servizicie.interno.gov.it/idp/login/livello2mobile?value=e1s2
      // extract the part after iologincie: and dispatch the action to handle the login
      if (url.startsWith("iologincie:")) {
        const continueUrl = url.split("iologincie:")[1];
        if (continueUrl) {
          console.log("🌎 continue URL", continueUrl);
          dispatch(cieIdUrlAction(continueUrl));
        }
      }
      listener(url);
    });
    return () => {
      linkingSubscription.remove();
    };
  };
