import { ParamListBase, RouteProp, useRoute } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";
import React from "react";
import { isGestureEnabled } from "../../../../utils/navigation";
import BoolValuePrerequisitesScreen from "../screens/BoolValuePrerequisitesScreen";
import CompletionScreen from "../screens/CompletionScreen";
import FailureScreen from "../screens/FailureScreen";
import InitiativeDetailsScreen from "../screens/InitiativeDetailsScreen";
import MultiValuePrerequisitesScreen from "../screens/MultiValuePrerequisitesScreen";
import PDNDPrerequisitesScreen from "../screens/PDNDPrerequisitesScreen";
import { IDPayOnboardingMachineProvider } from "../xstate/provider";
import { IdPayOnboardingParamsList } from "./params";
import { IdPayOnboardingRoutes } from "./routes";

const Stack = createStackNavigator<IdPayOnboardingParamsList>();

export type IdPayOnboardingNavigatorParams = {
  serviceId: string;
};

type IdPayOnboardingRouteProps = RouteProp<
  IdPayOnboardingParamsList,
  "IDPAY_ONBOARDING_MAIN"
>;

export const IDPayOnboardingNavigator = () => {
  const { params } = useRoute<IdPayOnboardingRouteProps>();

  return (
    <IDPayOnboardingMachineProvider serviceId={params.serviceId}>
      <Stack.Navigator
        initialRouteName={
          IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
        }
        headerMode={"none"}
        screenOptions={{ gestureEnabled: isGestureEnabled }}
      >
        <Stack.Screen
          name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS}
          component={InitiativeDetailsScreen}
        />
        <Stack.Screen
          name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS}
          component={BoolValuePrerequisitesScreen}
        />
        <Stack.Screen
          name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS}
          component={MultiValuePrerequisitesScreen}
        />
        <Stack.Screen
          name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE}
          component={PDNDPrerequisitesScreen}
        />
        <Stack.Screen
          name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION}
          component={CompletionScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name={IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE}
          component={FailureScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </IDPayOnboardingMachineProvider>
  );
};
export type IDPayOnboardingStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayOnboardingStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayOnboardingStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<IdPayOnboardingParamsList & ParamList, RouteName>;
