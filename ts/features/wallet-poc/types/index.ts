import { NavigatorScreenParams } from "@react-navigation/native";
import { AppParamsList } from "../../../navigation/params/AppParamsList";

type WalletCardBase = {
  id: string;
  label: string;
  onPress?: () => void;
};

type WalletCardBonus = {
  kind: "bonus";
  amount: number;
};

type WalletCardPayment = {
  kind: "payment";
  circuit: string;
};

export type WalletCard = WalletCardBase & (WalletCardBonus | WalletCardPayment);
export type WalletCardType = WalletCard["kind"];
