import { Body, H6, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { View } from "react-native";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayInstrumentInitiativesList } from "../../../idpay/wallet/components/IdPayInstrumentInitiativesList";
import {
  idPayInitiativesFromInstrumentRefreshStart,
  idPayInitiativesFromInstrumentRefreshStop
} from "../../../idpay/wallet/store/actions";
import { idPayEnabledInitiativesFromInstrumentSelector } from "../../../idpay/wallet/store/reducers";

type Props = {
  paymentMethod: WalletInfo;
} & Pick<React.ComponentProps<typeof View>, "style">;

/**
 * This component enlists the different initiatives active on the payment methods
 * @param props
 * @constructor
 */
const WalletDetailsPaymentMethodInitiatives = (
  props: Props
): React.ReactElement | null => {
  const navigation = useNavigation<IOStackNavigationProp<WalletParamsList>>();
  const idWalletString = props.paymentMethod.walletId;

  const dispatch = useIODispatch();

  const startInitiativeRefreshPolling = React.useCallback(() => {
    dispatch(
      idPayInitiativesFromInstrumentRefreshStart({
        idWallet: idWalletString
      })
    );
    return () => {
      dispatch(idPayInitiativesFromInstrumentRefreshStop());
    };
  }, [idWalletString, dispatch]);

  useFocusEffect(startInitiativeRefreshPolling);

  const initiativesList = useIOSelector(
    idPayEnabledInitiativesFromInstrumentSelector
  );

  const navigateToPairableInitiativesList = () =>
    navigation.navigate(ROUTES.WALLET_IDPAY_INITIATIVE_LIST, {
      idWallet: idWalletString
    });

  return initiativesList.length > 0 ? (
    <View testID="idPayInitiativesList" style={props.style}>
      <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
        <H6 color={"grey-700"}>{I18n.t("wallet.capability.title")}</H6>
        <Body
          weight="Semibold"
          color="blue"
          onPress={navigateToPairableInitiativesList}
        >
          {I18n.t("idpay.wallet.preview.showAll")}
        </Body>
      </View>
      <VSpacer size={16} />
      <IdPayInstrumentInitiativesList
        idWallet={idWalletString}
        initiatives={initiativesList.slice(0, 3)}
      />
    </View>
  ) : null;
};

export default WalletDetailsPaymentMethodInitiatives;
