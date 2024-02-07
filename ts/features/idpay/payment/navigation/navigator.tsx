import { ParamListBase, RouteProp } from "@react-navigation/native";
import {
  StackNavigationProp,
  createStackNavigator
} from "@react-navigation/stack";
import React from "react";
import {
  IDPayPaymentAuthorizationScreen,
  IDPayPaymentAuthorizationScreenRouteParams
} from "../screens/IDPayPaymentAuthorizationScreen";
import { IDPayPaymentCodeInputScreen } from "../screens/IDPayPaymentCodeInputScreen";
import { IDPayPaymentCodeScanScreen } from "../screens/IDPayPaymentCodeScanScreen";
import { IDPayPaymentResultScreen } from "../screens/IDPayPaymentResultScreen";
import { IDPayPaymentMachineProvider } from "../xstate/provider";

export const IdPayPaymentRoutes = {
  IDPAY_PAYMENT_MAIN: "IDPAY_PAYMENT_MAIN",
  IDPAY_PAYMENT_CODE_SCAN: "IDPAY_PAYMENT_CODE_SCAN",
  IDPAY_PAYMENT_CODE_INPUT: "IDPAY_PAYMENT_CODE_INPUT",
  IDPAY_PAYMENT_AUTHORIZATION: "IDPAY_PAYMENT_AUTHORIZATION",
  IDPAY_PAYMENT_RESULT: "IDPAY_PAYMENT_RESULT"
} as const;

export type IdPayPaymentParamsList = {
  [IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN]: undefined;
  [IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT]: undefined;
  [IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION]: IDPayPaymentAuthorizationScreenRouteParams;
  [IdPayPaymentRoutes.IDPAY_PAYMENT_RESULT]: undefined;
};

const Stack = createStackNavigator<IdPayPaymentParamsList>();

export const IDPayPaymentNavigator = () => (
  <IDPayPaymentMachineProvider>
    <Stack.Navigator
      initialRouteName={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false
      }}
    >
      <Stack.Group
        screenOptions={{
          gestureEnabled: true
        }}
      >
        <Stack.Screen
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN}
          component={IDPayPaymentCodeScanScreen}
        />
        <Stack.Screen
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_CODE_INPUT}
          component={IDPayPaymentCodeInputScreen}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          gestureEnabled: false
        }}
      >
        <Stack.Screen
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION}
          component={IDPayPaymentAuthorizationScreen}
        />
        <Stack.Screen
          name={IdPayPaymentRoutes.IDPAY_PAYMENT_RESULT}
          component={IDPayPaymentResultScreen}
        />
      </Stack.Group>
    </Stack.Navigator>
  </IDPayPaymentMachineProvider>
);

export type IDPayPaymentStackNavigationRouteProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = {
  navigation: IDPayPaymentStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};

export type IDPayPaymentStackNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string
> = StackNavigationProp<IdPayPaymentParamsList & ParamList, RouteName>;
