import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
  type AudioPlayer,
} from 'expo-audio';

/**
 * Clips sonores de la réplique.
 *
 * Ce sont les fichiers de la carte SD du modèle matériel, octet pour octet :
 *   slide      = 0001.mp3, le vortex (8,0 s)
 *   bip        = 0002.mp3, le bip court (0,2 s)
 *   activation = 0003.mp3, le clip d'activation (6,4 s)
 *
 * Les lecteurs sont créés une fois au démarrage, pas à la première lecture :
 * un lecteur créé et joué dans la foulée n'a pas fini de charger, et le son
 * ne sort jamais.
 */

const SOURCES = {
  slide: require('../../assets/sounds/slide.mp3'),
  bip: require('../../assets/sounds/bip.mp3'),
  activation: require('../../assets/sounds/activation.mp3'),
} as const;

export type ClipName = keyof typeof SOURCES;

/** Durées mesurées sur les fichiers, en millisecondes. */
export const CLIP_DURATION_MS: Record<ClipName, number> = {
  slide: 8020,
  bip: 216,
  activation: 6426,
};

const NAMES = Object.keys(SOURCES) as ClipName[];

let players: Partial<Record<ClipName, AudioPlayer>> = {};
let initialising: Promise<void> | null = null;

/** Un échec audio ne doit pas casser le minuteur, mais doit rester visible. */
const report = (context: string, error: unknown) => {
  if (__DEV__) {
    console.warn(`[audio] ${context}`, error);
  }
};

/**
 * Prépare la sortie audio et charge les trois clips.
 * Idempotent : les appels suivants attendent la même initialisation.
 */
export function initClips(): Promise<void> {
  if (initialising !== null) {
    return initialising;
  }

  initialising = (async () => {
    try {
      await setAudioModeAsync({
        // Le minuteur doit s'entendre même si le téléphone est en silencieux :
        // c'est un minuteur, son intérêt est de prévenir.
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'mixWithOthers',
        allowsRecording: false,
      });
      await setIsAudioActiveAsync(true);
    } catch (error) {
      report("configuration de la session audio", error);
    }

    NAMES.forEach((name) => {
      try {
        players[name] = createAudioPlayer(SOURCES[name]);
      } catch (error) {
        report(`création du lecteur « ${name} »`, error);
      }
    });
  })();

  return initialising;
}

/** Joue un clip depuis le début. */
export function playClip(name: ClipName) {
  const player = players[name];
  if (!player) {
    report(`lecteur « ${name} » indisponible`, new Error('non initialisé'));
    return;
  }
  try {
    // On ne rembobine que si le lecteur a déjà servi : un `seekTo` sur un
    // lecteur qui n'a pas fini de charger échoue silencieusement.
    if (player.currentTime > 0) {
      player.seekTo(0).catch((error) => report(`rembobinage de « ${name} »`, error));
    }
    player.play();
  } catch (error) {
    report(`lecture de « ${name} »`, error);
    delete players[name];
  }
}

/** Arrête un clip. */
export function stopClip(name: ClipName) {
  const player = players[name];
  if (!player) {
    return;
  }
  try {
    player.pause();
  } catch (error) {
    report(`arrêt de « ${name} »`, error);
    delete players[name];
  }
}

/** Arrête tous les clips. */
export function stopAllClips() {
  NAMES.forEach(stopClip);
}

/** Libère les lecteurs quand l'application se met en veille. */
export function releaseClips() {
  NAMES.forEach((name) => {
    const player = players[name];
    if (!player) {
      return;
    }
    try {
      player.remove();
    } catch (error) {
      report(`libération de « ${name} »`, error);
    }
  });
  players = {};
  initialising = null;
}
