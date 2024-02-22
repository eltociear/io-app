import IdPay from "../components/IdPay";
import Payment from "../components/Payment";
import ComponentTypes from "./ComponentTypes";

const componentMapper = {
  [ComponentTypes.IDPAY]: IdPay,
  [ComponentTypes.PAYMENT]: Payment
  // Map other components here...
};

export default componentMapper;
