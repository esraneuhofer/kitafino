//import UIKit
//import Capacitor
//
//@UIApplicationMain
//class AppDelegate: UIResponder, UIApplicationDelegate {
//
//    var window: UIWindow?
//
//     func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
//          // Override point for customization after application launch.
////
////          // Ensure the window is not nil
////          guard let window = self.window else {
////              fatalError("Window is nil!")
////          }
////
////          // Instantiate the LaunchScreen storyboard
////          let storyboard = UIStoryboard(name: "LaunchScreen", bundle: nil)
////          guard let splashView = storyboard.instantiateInitialViewController()?.view else {
////              fatalError("Could not instantiate initial view controller from LaunchScreen.storyboard!")
////          }
////
////          // Add the splash view to the winqdow
////          window.addSubview(splashView)
////          window.bringSubviewToFront(splashView)
////
////          // Remove the splash view after 2 seconds
////          DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
////              splashView.removeFromSuperview()
////          }
//
//          return true
//      }
//
//    func applicationWillResignActive(_ application: UIApplication) {
//        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
//        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
//    }
//
//    func applicationDidEnterBackground(_ application: UIApplication) {
//        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
//        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
//    }
//
//    func applicationWillEnterForeground(_ application: UIApplication) {
//        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
//    }
//
//    func applicationDidBecomeActive(_ application: UIApplication) {
//        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
//    }
//
//    func applicationWillTerminate(_ application: UIApplication) {
//        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
//    }
//
//    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
//        // Called when the app was launched with a url. Feel free to add additional processing here,
//        // but if you want the App API to support tracking app url opens, make sure to keep this call
//        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
//    }
//
//    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
//        // Called when the app was launched with an activity, including Universal Links.
//        // Feel free to add additional processing here, but if you want the App API to support
//        // tracking app url opens, make sure to keep this call
//        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
//    }
//
//}

import UIKit
import Capacitor
import Firebase
import UserNotifications

@UIApplicationMain
    class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    // Setze den Badge-Count auf 0, wenn die App geöffnet wird
    func applicationDidBecomeActive(_ application: UIApplication) {
        application.applicationIconBadgeNumber = 0
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
        Messaging.messaging().token { token, error in
            if let error = error {
                NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
            } else if let token = token {
                NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: token)
            }
        }
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension AppDelegate: UNUserNotificationCenterDelegate {
    // Empfangene Notification im Vordergrund anzeigen
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Legen Sie fest, wie die Notification präsentiert wird (Banner, Sound, Badge)
        completionHandler([.alert, .badge, .sound])
    }

    // Benutzerinteraktion mit der Notification verarbeiten
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        // Verarbeiten Sie die Aktion basierend auf den Informationen in der Notification
        let userInfo = response.notification.request.content.userInfo
        print("Benutzer interagierte mit der Notification: \(userInfo)")

        completionHandler()
    }
}
