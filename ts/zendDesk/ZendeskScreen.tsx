import * as React from "react";
import { Content, Input, Item, Text, View } from "native-base";
import { Alert, StyleSheet } from "react-native";
import ZendDesk from "react-native-zendesk-v2";
import { connect } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import BaseScreenComponent from "../components/screens/BaseScreenComponent";
import ButtonDefaultOpacity from "../components/ButtonDefaultOpacity";
import { makeFontStyleObject } from "../components/core/fonts";
import { Label } from "../components/core/typography/Label";
import { GlobalState } from "../store/reducers/types";
import { profileSelector } from "../store/reducers/profile";
import { EdgeBorderComponent } from "../components/screens/EdgeBorderComponent";
import { isStringNullyOrEmpty } from "../utils/strings";

/**
 * considerazioni
 * - alcuni metodi non sono nel file di types
 * - le operazioni sono tutte sync
 * - nella init non c'è una gestione dell'errore
 */

type Props = ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  buttonStyle: {
    width: "90%"
  },
  buttonStyleRow: {
    width: "45%"
  }
});
type ZendeskConfig = {
  key: string;
  appId: string;
  clientId: string;
  url: string;
  token: string;
};
type ZendeskNameEmail = {
  name: string;
  email: string;
};
const zendeskDefaultJwtConfig: ZendeskConfig = {
  key: "6e2c01f7-cebc-4c77-b878-3ed3c749a835",
  appId: "7f23d5b0eadc5b4f2cc83df3898c6f607bad769fe053a186",
  clientId: "mobile_sdk_client_4bf774ed28b085195cc5",
  url: "https://pagopa.zendesk.com",
  token: ""
};
const zendeskDefaultAnonymousConfig: ZendeskConfig = {
  key: "6e2c01f7-cebc-4c77-b878-3ed3c749a835",
  appId: "7f23d5b0eadc5b4f2cc83df3898c6f607bad769fe053a186",
  clientId: "mobile_sdk_client_a33378642f966d8e9e11",
  url: "https://pagopa.zendesk.com",
  token: ""
};
const IBANInputStyle = makeFontStyleObject("Regular", false, "RobotoMono");

const ZendeskScreen = (props: Props) => {
  const [zendeskConfig, setZendeskConfig] = React.useState<ZendeskConfig>(
    zendeskDefaultJwtConfig
  );

  const [zendeskConfigName, setZendeskConfigName] = React.useState<
    "jwt" | "anon"
  >("jwt");

  const [nameAndEmail, setNameAndEmail] = React.useState<ZendeskNameEmail>({
    name: pot.getOrElse(
      pot.map(props.profile, p => p.name),
      ""
    ),
    email: pot.getOrElse(
      pot.map(props.profile, p => p.email as string),
      ""
    )
  });

  const updateZendeskConfig = <C extends ZendeskConfig, K extends keyof C>(
    prop: K,
    value: C[K]
  ) => setZendeskConfig({ ...zendeskConfig, [prop]: value });

  const updateZendeskNameEmail = <
    C extends ZendeskNameEmail,
    K extends keyof C
  >(
    prop: K,
    value: C[K]
  ) => setNameAndEmail({ ...nameAndEmail, [prop]: value });

  const initZenDesk = () => {
    ZendDesk.init({
      key: zendeskConfig.key,
      appId: zendeskConfig.appId,
      url: zendeskConfig.url,
      clientId: zendeskConfig.clientId
    });
  };

  const identifyUserWithToken = () => {
    ZendDesk.setUserIdentity({ token: zendeskConfig.token });
    Alert.alert("identificazione", "identificazione tramite JWT eseguita");
  };

  const startChat = (name: string, email: string) => {
    initZenDesk();
    ZendDesk.startChat({
      botName: "IO BOT",
      name,
      email,
      tags: ["tag1", "tag2"],
      color: "#ff0000",
      department: "PagoPA SPA"
    });
  };

  const showHelpCenter = (name: string, email: string) => {
    initZenDesk();
    ZendDesk.showHelpCenter({
      name,
      email,
      color: "#ff0000"
    });
  };

  const identifyWithNameAndEmail = (name: string, email: string) => {
    initZenDesk();
    ZendDesk.setUserIdentity({
      name,
      email
    });
    Alert.alert(
      "identificazione",
      "identificazione tramite nome ed email eseguita"
    );
  };

  const resetIdentity = () => {
    ZendDesk.resetUserIdentity();
    Alert.alert("identificazione", "reset eseguito");
  };

  return (
    <BaseScreenComponent headerTitle={"ZenDesk - ⚠️ only for test purposes"}>
      <Content>
        <View style={{ flex: 1 }}>
          <Label weight={"Regular"}>{"Configuration"}</Label>
          <View style={{ flexDirection: "row" }}>
            <ButtonDefaultOpacity
              style={styles.buttonStyleRow}
              disabled={zendeskConfigName === "jwt"}
              bordered={false}
              onPress={() => {
                setZendeskConfigName("jwt");
                setZendeskConfig(zendeskDefaultJwtConfig);
              }}
            >
              <Text>{"JWT"}</Text>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              disabled={zendeskConfigName === "anon"}
              style={[styles.buttonStyleRow, { marginLeft: 6 }]}
              bordered={false}
              onPress={() => {
                setZendeskConfigName("anon");
                setZendeskConfig(zendeskDefaultAnonymousConfig);
              }}
            >
              <Text>{"Anonymous"}</Text>
            </ButtonDefaultOpacity>
          </View>
          <View spacer={true} />
          <Label weight={"Regular"}>{"App ID"}</Label>
          <Item error={false}>
            <Input
              multiline={true}
              value={zendeskConfig.appId}
              style={IBANInputStyle}
              onChangeText={text =>
                updateZendeskConfig("appId", text.toLocaleLowerCase())
              }
            />
          </Item>
          <View spacer={true} />

          <Label weight={"Regular"}>{"Client ID"}</Label>
          <Item error={false}>
            <Input
              multiline={true}
              value={zendeskConfig.clientId}
              style={IBANInputStyle}
              onChangeText={text =>
                updateZendeskConfig("clientId", text.toLocaleLowerCase())
              }
            />
          </Item>
          <View spacer={true} />

          <Label weight={"Regular"}>{"Zendesk URL"}</Label>
          <Item error={false}>
            <Input
              multiline={true}
              value={zendeskConfig.url}
              style={IBANInputStyle}
              onChangeText={text =>
                updateZendeskConfig("url", text.toLocaleLowerCase())
              }
            />
          </Item>
          <View spacer={true} />
          <Label weight={"Regular"}>
            {
              "init MUST be done before all other actions. This action is idempotent"
            }
          </Label>
          <View spacer={true} />
          <ButtonDefaultOpacity
            style={styles.buttonStyle}
            bordered={false}
            onPress={() => {
              initZenDesk();
              Alert.alert("inizializzazione", "inizializzazione eseguita");
            }}
          >
            <Text>{"init Zendesk"}</Text>
          </ButtonDefaultOpacity>
          <View spacer={true} />
          <Item />
          <View spacer={true} />

          <Label weight={"Regular"}>{"Token"}</Label>
          <Item error={false}>
            <Input
              multiline={true}
              value={zendeskConfig.token}
              style={IBANInputStyle}
              onChangeText={text =>
                updateZendeskConfig("token", text.toLocaleLowerCase())
              }
            />
          </Item>
          <View spacer={true} />
          <ButtonDefaultOpacity
            style={styles.buttonStyle}
            bordered={false}
            disabled={isStringNullyOrEmpty(zendeskConfig.token)}
            onPress={identifyUserWithToken}
          >
            <Text>{"identify with token"}</Text>
          </ButtonDefaultOpacity>

          <View spacer={true} />
          <Item />
          <View spacer={true} />

          <Label weight={"Regular"}>{"Name"}</Label>
          <Item error={false}>
            <Input
              multiline={true}
              value={nameAndEmail.name}
              style={IBANInputStyle}
              onChangeText={text => updateZendeskNameEmail("name", text)}
            />
          </Item>
          <View spacer={true} />

          <Label weight={"Regular"}>{"Email"}</Label>
          <Item error={false}>
            <Input
              multiline={true}
              value={nameAndEmail.email}
              style={IBANInputStyle}
              onChangeText={text =>
                updateZendeskNameEmail("email", text.toLocaleLowerCase())
              }
            />
          </Item>
          <View spacer={true} />
          <ButtonDefaultOpacity
            style={styles.buttonStyle}
            bordered={false}
            onPress={() =>
              identifyWithNameAndEmail(nameAndEmail.name, nameAndEmail.email)
            }
          >
            <Text>{"identify with email and name"}</Text>
          </ButtonDefaultOpacity>

          <View spacer={true} />
          <ButtonDefaultOpacity
            style={styles.buttonStyle}
            bordered={false}
            onPress={resetIdentity}
          >
            <Text>{"reset identify"}</Text>
          </ButtonDefaultOpacity>

          <View spacer={true} />
          <Item />
          <View spacer={true} />

          <ButtonDefaultOpacity
            style={styles.buttonStyle}
            bordered={false}
            onPress={() => startChat(nameAndEmail.name, nameAndEmail.email)}
          >
            <Text>{"start chat"}</Text>
          </ButtonDefaultOpacity>

          <View spacer={true} />
          <Item />
          <View spacer={true} />

          <ButtonDefaultOpacity
            style={styles.buttonStyle}
            bordered={false}
            onPress={() =>
              showHelpCenter(nameAndEmail.name, nameAndEmail.email)
            }
          >
            <Text>{"show help center"}</Text>
          </ButtonDefaultOpacity>
        </View>
        <EdgeBorderComponent />
      </Content>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  profile: profileSelector(state)
});

export default connect(mapStateToProps)(ZendeskScreen);
