#import <React/RCTBridgeDelegate.h>
#import <Expo/Expo.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h> // react-native-push-notification-ios

@interface AppDelegate : EXAppDelegateWrapper <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate> // UNUserNotificationCenterDelegate react-native-push-notification-ios

@property (nonatomic, strong) UIWindow *window;

@end
