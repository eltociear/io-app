import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { guardedNavigationAction } from "../../../../xstate/helpers/guardedNavigationAction";
import { refreshSessionToken } from "../../../fastLogin/store/actions/tokenRefreshActions";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IDPayOnboardingStackNavigationProp } from "../navigation/navigator";
import { IdPayOnboardingParamsList } from "../navigation/params";
import { IdPayOnboardingRoutes } from "../navigation/routes";
import { IdPayOnboardingMachineContext } from "./context";

type OnboardingMachineActions = {};

const createActionsImplementation = (
  rootNavigation: IOStackNavigationProp<AppParamsList, keyof AppParamsList>,
  onboardingNavigation: IDPayOnboardingStackNavigationProp<
    IdPayOnboardingParamsList,
    keyof IdPayOnboardingParamsList
  >,
  dispatch: ReturnType<typeof useIODispatch>
): Partial<OnboardingMachineActions> => {
  const handleSessionExpired = () => {
    dispatch(
      refreshSessionToken.request({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: true
      })
    );
  };

  const navigateToInitiativeDetailsScreen = guardedNavigationAction(
    (context: IdPayOnboardingMachineContext) => {
      if (context.serviceId === undefined) {
        throw new Error("serviceId is undefined");
      }
      onboardingNavigation.navigate(
        IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS
      );
    }
  );

  const navigateToPDNDCriteriaScreen = guardedNavigationAction(() =>
    onboardingNavigation.navigate(
      IdPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
    )
  );

  const navigateToBoolSelfDeclarationsScreen = guardedNavigationAction(() =>
    onboardingNavigation.navigate(
      IdPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
    )
  );

  const navigateToMultiSelfDeclarationsScreen = guardedNavigationAction(
    (context: IdPayOnboardingMachineContext) =>
      onboardingNavigation.navigate({
        name: IdPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS,
        key: String(context.multiConsentsPage)
      })
  );

  const navigateToCompletionScreen = () => {
    onboardingNavigation.navigate(
      IdPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
    );
  };

  const navigateToFailureScreen = () => {
    onboardingNavigation.navigate(
      IdPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE
    );
  };

  const navigateToInitiativeMonitoringScreen = (
    context: IdPayOnboardingMachineContext
  ) => {
    if (context.initiative === undefined) {
      throw new Error("initiative is undefined");
    }

    rootNavigation.replace(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
      params: {
        initiativeId: context.initiative.initiativeId
      }
    });
  };

  const exitOnboarding = () => {
    onboardingNavigation.pop();
  };

  return {
    handleSessionExpired,
    navigateToInitiativeDetailsScreen,
    navigateToPDNDCriteriaScreen,
    navigateToBoolSelfDeclarationsScreen,
    navigateToMultiSelfDeclarationsScreen,
    navigateToCompletionScreen,
    navigateToFailureScreen,
    navigateToInitiativeMonitoringScreen,
    exitOnboarding
  };
};

export { createActionsImplementation };
