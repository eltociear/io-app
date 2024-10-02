import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { v4 as uuid } from "uuid";
import { Platform, PermissionsAndroid } from "react-native";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import NotificationsUtils from "react-native-notifications-utils";
import { isIos } from "../../../utils/platform";

export enum AuthorizationStatus {
  NotDetermined = 0,
  StatusDenied = 1,
  Authorized = 2,
  Provisional = 3
}

const isAndroid7NougatAPI24OrMore = (Platform.Version as number) >= 24;
const successfulBooleanTaskEither = () => TE.fromEither(E.right(true));

const checkPermissionAndroid = () =>
  pipe(
    isAndroid7NougatAPI24OrMore,
    B.fold(successfulBooleanTaskEither, () =>
      TE.tryCatch(
        () =>
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          ),
        E.toError
      )
    )
  );

const checkPermissioniOS = () =>
  pipe(
    () =>
      new Promise<boolean>((resolve, _) => {
        PushNotificationIOS.checkPermissions(({ authorizationStatus }) => {
          resolve(
            authorizationStatus === AuthorizationStatus.Authorized ||
              authorizationStatus === AuthorizationStatus.Provisional
          );
        });
      }),
    TE.fromTask
  );

export const checkNotificationPermissions = () =>
  pipe(
    isIos,
    B.fold(
      () => checkPermissionAndroid(),
      () => checkPermissioniOS()
    ),
    TE.getOrElse(() => T.of(false))
  )();

const requestPermissioniOS = () =>
  pipe(
    TE.tryCatch(
      () =>
        PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true
        }),
      E.toError
    ),
    TE.map(
      ({ authorizationStatus }) =>
        authorizationStatus === AuthorizationStatus.Authorized
    )
  );

const requestPermissionAndroid = () =>
  pipe(
    isAndroid7NougatAPI24OrMore,
    B.fold(successfulBooleanTaskEither, () =>
      pipe(
        TE.tryCatch(
          () =>
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            ),
          E.toError
        ),
        TE.map(
          permissionStatus =>
            permissionStatus === PermissionsAndroid.RESULTS.GRANTED
        )
      )
    )
  );

export const requestNotificationPermissions = () =>
  pipe(
    isIos,
    B.fold(
      () => requestPermissionAndroid(),
      () => requestPermissioniOS()
    ),
    TE.getOrElse(() => T.of(false))
  )();

/**
 * Remove all the local notifications related to authentication with spid.
 *
 * With the previous library version (7.3.1 - now 8.1.1), cancelLocalNotifications
 * did not work. At the moment, the "first access spid" is the only kind of
 * scheduled notification and for this reason it is safe to use
 * PushNotification.cancelAllLocalNotifications();
 * If we add more scheduled notifications, we need to investigate if
 * cancelLocalNotifications works with the new library version
 */
export const cancellAllLocalNotifications = () =>
  PushNotification.cancelAllLocalNotifications();

/**
 * This is a legacy code that was used to generate a unique Id
 * from client side. It is still used because the backend API
 * requires it as part of the URL's path but it is later not
 * used in any way.
 * When the backend API spec will remove it, it can also be
 * unlinked and deleted here
 */
export const generateInstallationId = () => `001${uuid().replace(/-/g, "")}`;

export const openSystemNotificationSettingsScreen = () =>
  NotificationsUtils.openSettings();
