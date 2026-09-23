import type { ExpoConfig } from 'expo/config';

/**
 * ATTENTION : ces deux identifiants ne doivent pas changer.
 *
 * Ils désignent les fiches existantes sur chaque magasin. En changer un
 * créerait une nouvelle application au lieu de mettre à jour celle qui est
 * déjà publiée — et sur Play, la fiche retirée resterait retirée.
 *
 * Ils sont différents l'un de l'autre, ce qui est parfaitement normal :
 * chaque magasin a son propre espace de noms.
 *
 * `versionCode` doit être strictement supérieur au dernier publié (4).
 */
const ANDROID_PACKAGE = 'com.sliderstimer';
const IOS_BUNDLE_ID = 'com.webplayground.slidersreplica';
const VERSION = '2.0.0';
const ANDROID_VERSION_CODE = 5;
const IOS_BUILD_NUMBER = 6;

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
    bundleIdentifier: IOS_BUNDLE_ID,
    buildNumber: String(IOS_BUILD_NUMBER),
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
        /*
         * La chaîne de justification est obligatoire même si l'application
         * n'enregistre rien. Apple analyse les API référencées par les
         * bibliothèques liées, pas leur usage réel : `expo-audio` référence
         * les API micro, et une soumission sans cette clé est rejetée
         * (erreur 90683).
         */
        microphonePermission:
          "Cette application n'enregistre aucun son. Cette autorisation provient de la bibliothèque audio qui génère les bips du minuteur, et ne sera jamais demandée.",
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
