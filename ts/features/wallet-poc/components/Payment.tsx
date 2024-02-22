import React from "react";
import { H3 } from "@pagopa/io-app-design-system";

export type PaymentProps = {
  label: string;
  circuit: string;
};

const Payment = (props: PaymentProps) => (
  <H3 accessibilityLabel="">
    Payment: {props.label} - circuit: {props.circuit}
  </H3>
);

export default Payment;
