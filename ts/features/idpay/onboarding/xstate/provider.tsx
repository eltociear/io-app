import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { InterpreterFrom, createActor } from "xstate";
import {
  idPayApiBaseUrl,
  idPayApiUatBaseUrl,
  idPayTestToken
} from "../../../../config";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { sessionInfoSelector } from "../../../../store/reducers/authentication";
import {
  isPagoPATestEnabledSelector,
  preferredLanguageSelector
} from "../../../../store/reducers/persistedPreferences";
import {
  fromLocaleToPreferredLanguage,
  getLocalePrimaryWithFallback
} from "../../../../utils/locale";
import { createIDPayClient } from "../../common/api/client";
import { IDPayOnboardingStackNavigationProp } from "../navigation/navigator";
import { IdPayOnboardingParamsList } from "../navigation/params";
import { createActionsImplementation } from "./actions";
import { createActorsImplementation } from "./actors";
import { IDPayOnboardingMachineType, idPayOnboardingMachine } from "./machine";

type OnboardingMachineContext = InterpreterFrom<IDPayOnboardingMachineType>;

const OnboardingMachineContext = React.createContext<OnboardingMachineContext>(
  {} as OnboardingMachineContext
);

type Props = {
  children: React.ReactNode;
  serviceId: string;
};

const IDPayOnboardingMachineProvider = (props: Props) => {
  const dispatch = useIODispatch();
  const rootNavigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const onboardingNavigation =
    useNavigation<
      IDPayOnboardingStackNavigationProp<IdPayOnboardingParamsList>
    >();

  const sessionInfo = useIOSelector(sessionInfoSelector);
  if (O.isNone(sessionInfo)) {
    throw new Error("Session info is undefined");
  }

  const language = pipe(
    useIOSelector(preferredLanguageSelector),
    O.getOrElse(getLocalePrimaryWithFallback),
    fromLocaleToPreferredLanguage
  );

  const isPagoPATestEnabled = useIOSelector(isPagoPATestEnabledSelector);
  const baseUrl = isPagoPATestEnabled ? idPayApiUatBaseUrl : idPayApiBaseUrl;
  const client = createIDPayClient(baseUrl);

  const { bpdToken } = sessionInfo.value;
  const token = idPayTestToken !== undefined ? idPayTestToken : bpdToken;

  const actors = createActorsImplementation(client, token, language);
  const actions = createActionsImplementation(
    rootNavigation,
    onboardingNavigation,
    dispatch
  );

  const onboardingMachine = idPayOnboardingMachine.provide({
    actions,
    actors
  });

  const onboardingMachineService = createActor(onboardingMachine, {
    input: {
      serviceId: props.serviceId
    }
  });

  return (
    <OnboardingMachineContext.Provider value={onboardingMachineService}>
      {props.children}
    </OnboardingMachineContext.Provider>
  );
};

const useOnboardingMachineService = () =>
  React.useContext(OnboardingMachineContext);

export { IDPayOnboardingMachineProvider, useOnboardingMachineService };
