import type { ExpoConfig } from 'expo/config';

/**
 * ATTENTION : `android.package` doit rester `com.sliderstimer`.
 * C'est l'identifiant de la fiche Play existante — le changer créerait
 * une nouvelle app au lieu de mettre à jour celle qui a été retirée.
 *
 * `versionCode` doit être strictement supérieur au dernier publié (4).
 */
const ANDROID_PACKAGE = 'com.sliderstimer';
const VERSION = '2.0.0';
const ANDROID_VERSION_CODE = 5;

const config: ExpoConfig = {
  name: 'Sliders Timer',
  slug: 'sliders-timer',
  version: VERSION,
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'sliderstimer',
  userInterfaceStyle: 'dark',
  backgroundColor: '#000000',
  primaryColor: '#ff2d2d',
  assetBundlePatterns: ['**/*'],

  ios: {
    // L'ancien projet utilisait le bundle id par défaut de React Native
    // (org.reactjs.native.example.*), qui n'est pas publiable sur l'App Store.
    // L'app n'a donc jamais été publiée côté iOS : on part sur un id propre.
    bundleIdentifier: ANDROID_PACKAGE,
    buildNumber: String(ANDROID_VERSION_CODE),
    supportsTablet: false,
    infoPlist: {
      UIViewControllerBasedStatusBarAppearance: false,
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: ANDROID_PACKAGE,
    versionCode: ANDROID_VERSION_CODE,
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundColor: '#000000',
    },
    predictiveBackGestureEnabled: false,
    // L'app ne fait aucun appel réseau : on ne demande aucune permission
    // au-delà de celles ajoutées par les modules (notifications).
    blockedPermissions: ['android.permission.RECORD_AUDIO'],
  },

  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          // Exigences Play Store 2026 : API 36 obligatoire depuis le 31/08/2026
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          // minSdk 24 : 21 et 22 ne reçoivent plus de mises à jour Play Services
          minSdkVersion: 24,
          // Pages mémoire 16 Ko, obligatoire depuis le 01/11/2025
          enablePageSize16KB: true,
        },
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
        image: './assets/splash-icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
      },
    ],
    [
      'expo-notifications',
      {
        color: '#ff2d2d',
        defaultChannel: 'timer',
      },
    ],
    'expo-audio',
    'react-native-audio-api',
  ],

  experiments: {
    typedRoutes: false,
  },
};

export default config;
