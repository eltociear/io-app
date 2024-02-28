import FeatureX, { FeatureXProps } from "../../feature-x/components/FeatureX";
import IdPay, { IdPayProps } from "../components/IdPay";
import Payment, { PaymentProps } from "../components/Payment";

// Component types
// A specific Feature X card should extend the CardBaseComponent
// and add the specific props here.
export const ComponentTypes = {
  IDPAY: IdPay.name,
  PAYMENT: Payment.name,
  FEATUREX: FeatureX.name
  // Add more component types here
};

// Component props type
// TODO: improve type definition
export type ComponentProps = IdPayProps | PaymentProps | FeatureXProps;

// Component mapper used
// to map the card type to the specific component
export const componentMapper = {
  [ComponentTypes.IDPAY]: IdPay,
  [ComponentTypes.PAYMENT]: Payment,
  [ComponentTypes.FEATUREX]: FeatureX
  // Map other components here...
};

export type CardTypes = (typeof ComponentTypes)[keyof typeof ComponentTypes];
