import IdPay, { IdPayProps } from "../components/IdPay";
import Payment, { PaymentProps } from "../components/Payment";

// Component types
// A specific Feature X card should extend the CardBaseComponent
// and add the specific props here.
export const ComponentTypes = {
  IDPAY: IdPay.name,
  PAYMENT: Payment.name
  // Add more component types here
};

// Component props type
// TODO: improve type definition
export type ComponentProps = IdPayProps | PaymentProps;

// Component mapper used
// to map the card type to the specific component
export const componentMapper = {
  [ComponentTypes.IDPAY]: IdPay,
  [ComponentTypes.PAYMENT]: Payment
  // Map other components here...
};

export type CardTypes = (typeof ComponentTypes)[keyof typeof ComponentTypes];
