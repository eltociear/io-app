import {
  Alert,
  Body,
  H3,
  ListItemSwitch,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useState } from "react";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSTransitions = () => {
  const theme = useIOTheme();

  const [showComponent, setShowComponent] = useState(true);

  return (
    <DesignSystemScreen title={"Loaders"}>
      {/* Present in the main Messages screen */}
      <H3 color={theme["textHeading-default"]} weight={"SemiBold"}>
        Transitions
      </H3>

      <ListItemSwitch
        label="Show component"
        value={showComponent}
        onSwitchValueChange={setShowComponent}
      />

      {showComponent && (
        <Animated.View
          layout={Layout.duration(300)}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <Alert
            variant="error"
            content="Ut enim ad minim veniam, quis ullamco laboris nisi ut aliquid"
          />
        </Animated.View>
      )}

      <Animated.View>
        <Body>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
          suscipit diam nec velit tincidunt feugiat. Curabitur vitae leo sed
          nibh scelerisque varius quis sit amet lectus. Fusce non lorem eu augue
          aliquet ultrices vel eget sem. Mauris laoreet lobortis mi, ac luctus
          turpis porttitor vel. Vivamus sit amet erat augue. Mauris placerat
          vitae dui non commodo.
        </Body>
      </Animated.View>

      <VSpacer />
    </DesignSystemScreen>
  );
};
