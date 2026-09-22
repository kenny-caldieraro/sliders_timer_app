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
      monochromeImage: './assets/android-icon-monochrome.png',
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
    [
      'expo-audio',
      {
        /*
         * Par défaut ce greffon prépare une application de lecture média :
         * audio en arrière-plan, service de premier plan, et permission
         * micro sur Android. Un minuteur n'a besoin d'aucun des trois, et
         * demander le micro sur une réplique de minuteur est exactement le
         * genre de permission qui fait fuir un utilisateur et alerter un
         * relecteur.
         */
        enableBackgroundPlayback: false,
        enableBackgroundRecording: false,
        recordAudioAndroid: false,
        // `false` supprime la clé plutôt que d'en écrire une par défaut :
        // une justification d'accès au micro qu'on n'utilise pas est une
        // question de plus au moment de la relecture.
        microphonePermission: false,
      },
    ],
    [
      'react-native-audio-api',
      {
        /*
         * Le greffon active par défaut l'audio en arrière-plan, un service de
         * premier plan Android et FFmpeg. Le minuteur n'a besoin d'aucun des
         * trois : il ne sert qu'un oscillateur, et pose explicitement
         * `shouldPlayInBackground: false`.
         *
         * Les laisser coûte cher côté magasins. Apple rejette une application
         * qui déclare `UIBackgroundModes: audio` sans s'en servir, et depuis
         * Android 14 un service de premier plan de type `mediaPlayback` exige
         * un formulaire de justification en Play Console.
         */
        iosBackgroundMode: false,
        androidForegroundService: false,
        androidPermissions: [],
        disableFFmpeg: true,
      },
    ],
  ],

  experiments: {
    typedRoutes: false,
  },

  // Compte et projet EAS. `eas init` ne peut pas écrire dans une config
  // dynamique : ces valeurs sont donc posées à la main.
  owner: 'webplayground',
  extra: {
    eas: {
      projectId: '762e9a20-89ad-48bb-8268-23d02b7b808d',
    },
  },
};

export default config;
