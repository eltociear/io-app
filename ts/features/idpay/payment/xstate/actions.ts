import { IOToast } from "../../../../components/Toast";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { IdPayPaymentRoutes } from "../navigation/navigator";

const createActionsImplementation = (
  navigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  dispatch: ReturnType<typeof useIODispatch>
) => {
  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

  const navigateToAuthorizationScreen = () => {
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION,
      params: {}
    });
  };

  const navigateToResultScreen = () =>
    navigation.navigate(IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IdPayPaymentRoutes.IDPAY_PAYMENT_RESULT
    });

  const showErrorToast = () =>
    IOToast.error(I18n.t("idpay.payment.authorization.error"));

  const exitAuthorization = () => {
    navigation.pop(); // TODO: (react-navigation:7.x) replace with popTo to the details screen
  };

  return {
    handleSessionExpired,
    navigateToAuthorizationScreen,
    navigateToResultScreen,
    showErrorToast,
    exitAuthorization
  };
};

export { createActionsImplementation };
