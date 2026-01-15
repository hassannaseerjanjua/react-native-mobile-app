package com.gifteern

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import android.content.Intent
import android.content.res.Configuration
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "GifteeRN"

  override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootTheme) 
    super.onCreate(savedInstanceState) 
  }

  /**
   * Override to disable font scaling - prevents device font size from affecting the app
   */
  override fun getResources(): android.content.res.Resources {
    val res = super.getResources()
    if (res.configuration.fontScale != 1.0f) {
      val configuration = Configuration(res.configuration)
      configuration.fontScale = 1.0f
      return createConfigurationContext(configuration).resources
    }
    return res
  }

  /**
   * Handle deep links when app is already running (singleTask launch mode)
   */
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
