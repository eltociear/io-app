export type WalletCardBase = {
  key: string;
  label: string;
  componentType: string;
};

export type WalletCardBonus = {
  kind: "bonus";
  amount: number;
  initiativeId: string;
};

type WalletCardPayment = {
  kind: "payment";
  circuit: string;
};

export type WalletCard = WalletCardBase & (WalletCardBonus | WalletCardPayment);
export type WalletCardType = WalletCard["kind"];
