import {
  BlockButtonProps,
  FooterWithButtons,
  H4,
  H6,
  IOColors,
  IOToast,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useContext, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import themeVariables from "../../../../theme/variables";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { withBase64Uri } from "../../../../utils/image";
import { EUCovidContext } from "../../components/EUCovidContext";
import { EuCovidCertHeader } from "../../components/EuCovidCertHeader";
import {
  FlashAnimatedComponent,
  FlashAnimationState
} from "../../components/FlashAnimatedComponent";
import { MarkdownHandleCustomLink } from "../../components/MarkdownHandleCustomLink";
import {
  navigateToEuCovidCertificateMarkdownDetailsScreen,
  navigateToEuCovidCertificateQrCodeFullScreen
} from "../../navigation/actions";
import {
  ValidCertificate,
  WithEUCovidCertificateHeaderData
} from "../../types/EUCovidCertificate";
import { captureScreenshot, screenshotOptions } from "../../utils/screenshot";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";

type Props = {
  validCertificate: ValidCertificate;
} & WithEUCovidCertificateHeaderData;

const styles = StyleSheet.create({
  qrCode: {
    // TODO: it's preferable to use the hook useWindowDimensions, but we need to upgrade react native
    width: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    height: Dimensions.get("window").width - themeVariables.contentPadding * 2,
    flex: 1
  },
  container: {
    paddingRight: 0,
    paddingLeft: 0,
    marginVertical: 20,
    height: 60,
    backgroundColor: IOColors.white
  },
  flexColumn: {
    flexDirection: "column",
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  }
});

type EuCovidCertValidComponentProps = Props & {
  markdownWebViewStyle?: StyleProp<ViewStyle>;
  messageId?: string;
};
const EuCovidCertValidComponent = (
  props: EuCovidCertValidComponentProps
): React.ReactElement => (
  <View>
    {props.validCertificate.qrCode.mimeType === "image/png" && (
      <>
        <VSpacer size={16} />
        <TouchableOpacity
          testID={"QRCode"}
          accessible={true}
          accessibilityRole={"imagebutton"}
          accessibilityLabel={I18n.t(
            "features.euCovidCertificate.valid.accessibility.qrCode"
          )}
          accessibilityHint={I18n.t(
            "features.euCovidCertificate.valid.accessibility.hint"
          )}
          onPress={() =>
            navigateToEuCovidCertificateQrCodeFullScreen({
              qrCodeContent: props.validCertificate.qrCode.content
            })
          }
        >
          <Image
            accessibilityIgnoresInvertColors
            source={{
              uri: withBase64Uri(props.validCertificate.qrCode.content, "png")
            }}
            style={styles.qrCode}
            onError={() => {
              void mixpanelTrack("EUCOVIDCERT_QRCODE_IMAGE_NOT_VALID", {
                messageId: props.messageId
              });
            }}
          />
        </TouchableOpacity>
        <VSpacer size={16} />
      </>
    )}
    {props.validCertificate.markdownInfo && (
      <View style={props.markdownWebViewStyle}>
        <MarkdownHandleCustomLink
          testID={"markdownPreview"}
          extraBodyHeight={60}
        >
          {props.validCertificate.markdownInfo}
        </MarkdownHandleCustomLink>
        <VSpacer size={16} />
      </View>
    )}
  </View>
);

const showToastError = (error: string = I18n.t("global.genericError")) =>
  IOToast.error(error);

const addBottomSheetItem = (config: {
  title: string;
  subTitle: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    onPress={config.onPress}
    style={styles.container}
  >
    <View style={styles.flexColumn}>
      <View style={styles.row}>
        <View style={IOStyles.flex}>
          <H4 color={"bluegreyDark"} weight={"Semibold"}>
            {config.title}
          </H4>
          <H6 color={"bluegrey"} weight={"Regular"}>
            {config.subTitle}
          </H6>
        </View>
        <Icon name="chevronRightListItem" size={24} color="blue" />
      </View>
    </View>
    <VSpacer size={40} />
  </Pressable>
);

type FooterProps = Props & { onSave: () => void };
const Footer = (props: FooterProps): React.ReactElement => {
  const {
    present: presentBottomSheet,
    bottomSheet,
    dismiss
  } = useLegacyIOBottomSheetModal(
    <View>
      {addBottomSheetItem({
        title: I18n.t(
          "features.euCovidCertificate.save.bottomSheet.saveAsImage.title"
        ),
        subTitle: I18n.t(
          "features.euCovidCertificate.save.bottomSheet.saveAsImage.subTitle"
        ),
        onPress: () => {
          props.onSave();
          dismiss();
        }
      })}
    </View>,
    <View style={IOStyles.flex}>
      <H4 color={"bluegreyDark"} weight={"Semibold"}>
        {I18n.t("features.euCovidCertificate.save.bottomSheet.title")}
      </H4>
      <H6 color={"bluegrey"} weight={"Regular"}>
        {I18n.t("features.euCovidCertificate.save.bottomSheet.subTitle")}
      </H6>
      <VSpacer size={32} />
    </View>,
    320
  );

  const saveButton: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      onPress: presentBottomSheet,
      label: I18n.t("global.genericSave")
    }
  };

  const markdownDetails = props.validCertificate.markdownDetails;

  return (
    <>
      {bottomSheet}
      {markdownDetails ? (
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          primary={{
            type: "Outline",
            buttonProps: {
              onPress: () =>
                navigateToEuCovidCertificateMarkdownDetailsScreen({
                  markdownDetails
                }),
              label: I18n.t("global.buttons.details")
            }
          }}
          secondary={saveButton}
        />
      ) : (
        <FooterWithButtons type="SingleButton" primary={saveButton} />
      )}
    </>
  );
};

export const EuCovidCertValidScreen = (props: Props): React.ReactElement => {
  const currentCert = useContext(EUCovidContext);
  const screenShotViewContainer = React.createRef<View>();
  const [flashAnimationState, setFlashAnimationState] =
    useState<FlashAnimationState>();
  const [isCapturingScreenShoot, setIsCapturingScreenShoot] = useState(false);
  React.useEffect(() => {
    if (isCapturingScreenShoot) {
      // at the end of fadeIn animation, the views inside screenShotViewContainerRef
      // will be captured in an screenshot image
      setFlashAnimationState("fadeIn");
    }
  }, [isCapturingScreenShoot]);

  const saveScreenShoot = () => {
    // it should not never happen
    if (screenShotViewContainer.current === null) {
      showToastError();
      return;
    }
    captureScreenshot(screenShotViewContainer, screenshotOptions, {
      onSuccess: () =>
        IOToast.success(I18n.t("features.euCovidCertificate.save.ok")),
      onNoPermissions: () =>
        IOToast.info(I18n.t("features.euCovidCertificate.save.noPermission")),
      onError: () => IOToast.error(I18n.t("global.genericError")),
      onEnd: () => {
        setFlashAnimationState("fadeOut");
        setIsCapturingScreenShoot(false);
      }
    });
  };
  const header = <EuCovidCertHeader {...props} />;
  return (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertValidScreen"}
      header={header}
      content={
        <View
          collapsable={false}
          ref={screenShotViewContainer}
          style={[IOStyles.flex, { backgroundColor: IOColors.white }]}
        >
          {/* add extra space (top,sides,bottom) and padding while capturing the screenshot */}
          {isCapturingScreenShoot && <VSpacer size={24} />}
          {isCapturingScreenShoot && (
            <View style={IOStyles.horizontalContentPadding}>{header}</View>
          )}
          {isCapturingScreenShoot && <VSpacer size={24} />}
          <EuCovidCertValidComponent
            messageId={currentCert?.messageId}
            {...props}
            markdownWebViewStyle={
              isCapturingScreenShoot
                ? IOStyles.horizontalContentPadding
                : undefined
            }
          />
          {isCapturingScreenShoot && <VSpacer size={24} />}
        </View>
      }
      footer={
        <>
          <Footer
            {...props}
            onSave={() => {
              void mixpanelTrack("EUCOVIDCERT_SAVE_QRCODE");
              setIsCapturingScreenShoot(true);
            }}
          />
          {/* this view must be the last one, since it must be drawn on top of all */}
          <FlashAnimatedComponent
            state={flashAnimationState}
            onFadeInCompleted={saveScreenShoot}
          />
        </>
      }
    />
  );
};
