import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import paymentReducer, {
  PaymentsCheckoutState
} from "../../../checkout/store/reducers";
import detailsReducer, {
  PaymentsMethodDetailsState
} from "../../../details/store/reducers";
import historyReducer, {
  PaymentsHistoryState
} from "../../../history/store/reducers";
import onboardingReducer, {
  PaymentsOnboardingState
} from "../../../onboarding/store/reducers";
import legacyTransactionReducer, {
  PaymentsLegacyTransactionState
} from "../../../transaction/store/reducers";
import homeReducer, { PaymentsHomeState } from "../../../home/store/reducers";
import paymentsWalletReducer, {
  PaymentsWalletState
} from "../../../wallet/store/reducers";
import paymentsBizEventsTransactionReducer, {
  PaymentsBizEventsTransactionState
} from "../../../bizEventsTransaction/store/reducers";
import paymentsPagoPaPlatformReducer, {
  PaymentsPagoPaPlatformState
} from "./pagoPaPlatformReducer";

export type PaymentsState = {
  onboarding: PaymentsOnboardingState;
  details: PaymentsMethodDetailsState & PersistPartial;
  checkout: PaymentsCheckoutState;
  legacyTransaction: PaymentsLegacyTransactionState;
  history: PaymentsHistoryState & PersistPartial;
  home: PaymentsHomeState & PersistPartial;
  wallet: PaymentsWalletState;
  bizEventsTransaction: PaymentsBizEventsTransactionState;
  pagoPaPlatform: PaymentsPagoPaPlatformState;
};

const paymentsReducer = combineReducers({
  onboarding: onboardingReducer,
  details: detailsReducer,
  checkout: paymentReducer,
  legacyTransaction: legacyTransactionReducer,
  history: historyReducer,
  home: homeReducer,
  wallet: paymentsWalletReducer,
  bizEventsTransaction: paymentsBizEventsTransactionReducer,
  pagoPaPlatform: paymentsPagoPaPlatformReducer
});

export default paymentsReducer;
