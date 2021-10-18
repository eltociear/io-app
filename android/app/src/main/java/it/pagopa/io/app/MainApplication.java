package it.pagopa.io.app;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.instabug.reactlibrary.RNInstabugReactnativePackage;
import it.ipzs.cieidsdk.native_bridge.CiePackage;
import com.saranshmalik.rnzendeskchat.RNZendeskChatPackage;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;
import com.reactnativecommunity.art.ARTPackage;

import com.facebook.react.PackageList;

import android.app.Application;
import android.content.Context;
import com.facebook.react.ReactInstanceManager;
import java.lang.reflect.InvocationTargetException;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {


  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }

    @Override
    protected List<ReactPackage> getPackages() {
      List<ReactPackage> packages = new PackageList(this).getPackages();
      packages.add(new RNPermissionsPackage());
      packages.add(new CiePackage());
      packages.add(new RNZendeskChatPackage());
      packages.add(new ARTPackage());
      return packages;
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {

    super.onCreate();
    new RNInstabugReactnativePackage
      .Builder(BuildConfig.INSTABUG_TOKEN, MainApplication.this)
      .setInvocationEvent("none")
      .setPrimaryColor("#0073E6").build();
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }


   /**
    * Loads Flipper in React Native templates. Call this in the onCreate method with something like
    * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    *
    * @param context
    * @param reactInstanceManager
    */
   private static void initializeFlipper(
       Context context, ReactInstanceManager reactInstanceManager) {
     if (BuildConfig.DEBUG) {
       try {
         /*
          We use reflection here to pick up the class that initializes Flipper,
         since Flipper library is not available in release mode
         */
         Class<?> aClass = Class.forName("it.pagopa.io.app.ReactNativeFlipper");
         aClass
           .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
           .invoke(null, context, reactInstanceManager);
       } catch (ClassNotFoundException e) {
         e.printStackTrace();
       } catch (NoSuchMethodException e) {
         e.printStackTrace();
       } catch (IllegalAccessException e) {
         e.printStackTrace();
       } catch (InvocationTargetException e) {
         e.printStackTrace();
       }
     }
   }

}
