import React from "react";
import { Linking } from "react-native";
import { VerifyResult } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { ISSUER_URL, mapAssuranceLevel } from "../utils/mocks";
import ListItemComponent from "../../../components/screens/ListItemComponent";
import I18n from "../../../i18n";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { H4 } from "../../../components/core/typography/H4";
import { localeDateFormat } from "../../../utils/locale";
import ButtonOutline from "../../../components/ui/ButtonOutline";

/**
 * ClaimsList component props definition.
 * Contains the claims to be displayed, currenly only PID claims are supported.
 */
type ClaimsListProps = {
  decodedPid: VerifyResult;
};

/**
 * This component renders the list of claims for a credential, currenly only PID is supported with a static generation.
 * TODO: This component will be refactored to support dynamic generation of claims with schema validation.
 * @param claims - contains the claim to be displayed.
 */
const ClaimsList = ({ decodedPid }: ClaimsListProps) => {
  const expirationDate = localeDateFormat(
    new Date(),
    I18n.t("global.dateFormats.shortFormat")
  );
  const birthDate = localeDateFormat(
    new Date(decodedPid.pid.claims.birthdate),
    I18n.t("global.dateFormats.shortFormat")
  );
  return (
    <>
      <ListItemComponent
        title={I18n.t("features.itWallet.verifiableCredentials.claims.name")}
        subTitle={decodedPid.pid.claims.givenName}
        hideIcon
      />
      <ListItemComponent
        title={I18n.t("features.itWallet.verifiableCredentials.claims.surname")}
        subTitle={decodedPid.pid.claims.familyName}
        hideIcon
      />
      <ListItemComponent
        title={I18n.t(
          "features.itWallet.verifiableCredentials.claims.fiscalCode"
        )}
        subTitle={decodedPid.pid.claims.taxIdCode}
        hideIcon
      />
      <ListItemComponent
        title={I18n.t(
          "features.itWallet.verifiableCredentials.claims.birthDate"
        )}
        subTitle={birthDate}
        hideIcon
      />
      <ListItemComponent
        title={I18n.t(
          "features.itWallet.verifiableCredentials.claims.expirationDate"
        )}
        subTitle={expirationDate}
        hideIcon
      />
      <ListItemComponent
        title={I18n.t(
          "features.itWallet.verifiableCredentials.claims.securityLevel"
        )}
        subTitle={mapAssuranceLevel(decodedPid.pid.verification.assuranceLevel)}
        iconName={"info"}
        onPress={() => null}
      />
      <ListItemComponent
        title={I18n.t(
          "features.itWallet.verifiableCredentials.claims.issuedBy"
        )}
        subTitle={
          decodedPid.pid.verification.evidence[0].record.source
            .organization_name
        }
        hideIcon
      />
      <ListItemComponent
        title={I18n.t("features.itWallet.verifiableCredentials.claims.info")}
        subTitle={ISSUER_URL}
        hideIcon
        onPress={() => Linking.openURL(ISSUER_URL)}
      />
      <VSpacer />
      <H4 weight={"SemiBold"} color={"bluegreyDark"}>
        {I18n.t(
          "features.itWallet.verifiableCredentials.unrecognizedData.title"
        )}
      </H4>
      <VSpacer />
      <H4 weight={"Regular"} color={"bluegrey"}>
        {I18n.t(
          "features.itWallet.verifiableCredentials.unrecognizedData.body",
          {
            issuer:
              decodedPid.pid.verification.evidence[0].record.source
                .organization_name
          }
        )}
      </H4>
      <VSpacer />
      <ButtonOutline
        fullWidth
        accessibilityLabel="ClamListButton"
        label={I18n.t(
          "features.itWallet.verifiableCredentials.unrecognizedData.cta"
        )}
        onPress={() => null}
      />
      <VSpacer />
    </>
  );
};

export default ClaimsList;
