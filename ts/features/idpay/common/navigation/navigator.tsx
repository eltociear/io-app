import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { AppParamsList } from "../../../../navigation/params/AppParamsList";
import { isGestureEnabled } from "../../../../utils/navigation";
import { IdPayBarcodeNavigator } from "../../barcode/navigation/navigator";
import { IdPayBarcodeRoutes } from "../../barcode/navigation/routes";
import { IdPayCodeNavigator } from "../../code/navigation/navigator";
import { IdPayCodeRoutes } from "../../code/navigation/routes";
import {
  IDPayConfigurationNavigator,
  IDPayConfigurationRoutes
} from "../../configuration/navigation/navigator";
import {
  IDPayDetailsRoutes,
  IDpayDetailsNavigator
} from "../../details/navigation";
import {
  IDPayOnboardingNavigator,
  IDPayOnboardingRoutes
} from "../../onboarding/navigation/navigator";
import {
  IDPayPaymentNavigator,
  IdPayPaymentRoutes
} from "../../payment/navigation/navigator";
import {
  IDPayUnsubscriptionNavigator,
  IDPayUnsubscriptionRoutes
} from "../../unsubscription/navigation/navigator";

const Stack = createStackNavigator<AppParamsList>();

const idPayFeatureNavigator = (
  <Stack.Group>
    <Stack.Screen
      name={IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN}
      component={IDPayOnboardingNavigator}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
    <Stack.Screen
      name={IDPayDetailsRoutes.IDPAY_DETAILS_MAIN}
      component={IDpayDetailsNavigator}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
    <Stack.Screen
      name={IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN}
      component={IDPayConfigurationNavigator}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
    <Stack.Screen
      name={IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN}
      component={IDPayUnsubscriptionNavigator}
      options={{ gestureEnabled: isGestureEnabled, headerShown: false }}
    />
    <Stack.Screen
      name={IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN}
      component={IDPayPaymentNavigator}
      options={{
        gestureEnabled: false,
        headerShown: false,
        presentation: "modal"
      }}
    />
    <Stack.Screen
      name={IdPayCodeRoutes.IDPAY_CODE_MAIN}
      component={IdPayCodeNavigator}
      options={{
        headerShown: false
      }}
    />
    <Stack.Screen
      name={IdPayBarcodeRoutes.IDPAY_BARCODE_MAIN}
      component={IdPayBarcodeNavigator}
      options={{
        gestureEnabled: true,
        headerShown: false,
        presentation: "modal"
      }}
    />
  </Stack.Group>
);

export { idPayFeatureNavigator };
