import * as React from "react";
import {
  GradientScrollView,
  H1,
  HeaderFirstLevel
} from "@pagopa/io-app-design-system";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../store/hooks";
import { fxRequestItem } from "../store/actions";

const FXDetailsScreen = (): React.ReactElement => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderFirstLevel type="base" title="Feature-X" />
    });
  }, [navigation]);
  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Add card",
        accessibilityLabel: "Add card",
        onPress: () => dispatch(fxRequestItem.request())
      }}
    >
      <H1>FXDetailsScreen</H1>
    </GradientScrollView>
  );
};

export default FXDetailsScreen;
