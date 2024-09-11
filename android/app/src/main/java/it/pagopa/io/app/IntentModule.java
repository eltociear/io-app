package it.pagopa.io.app;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.Map;
import java.util.HashMap;

public class IntentModule extends ReactContextBaseJavaModule implements ActivityEventListener {
  IntentModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactContext.addActivityEventListener(this);
    onActivityResultCallback = null;
  }

  @Nullable
  Callback onActivityResultCallback;

  @NonNull
  @Override
  public String getName() {
    return "IntentModule";
  }

  @ReactMethod
  public void launchStartActivityForResult(String packageNme, String url, Callback resultCallback) {
    Log.d(getName(), "Hello! 👋");
    Activity activity = getCurrentActivity();
    if (activity != null) {
      String appPackageName = "it.ipzs.cieid";
      String className = "it.ipzs.cieid.BaseActivity";
      Intent intent = new Intent();
      intent.setClassName(appPackageName, className);
      intent.setData(Uri.parse(url));
      intent.setAction(Intent.ACTION_VIEW);

      onActivityResultCallback = resultCallback;

      activity.startActivityForResult(intent, 0);
    } else {
      resultCallback.invoke("");
    }
  }

  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
      if (resultCode == Activity.RESULT_OK) {
          String url = data.getStringExtra("URL");
          Log.d(getName(), "Result from CieID: " + url);
          if (!TextUtils.isEmpty(url)) {
              if (onActivityResultCallback != null) {
                  onActivityResultCallback.invoke(url);
              }
          }
      }
    onActivityResultCallback = null;
  }

  @Override
  public void onNewIntent(Intent intent) {

  }
}
