import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Clips sonores de la réplique.
 *
 * Ce sont les fichiers de la carte SD du modèle matériel, octet pour octet :
 *   slide      = 0001.mp3, le vortex (8,0 s)
 *   bip        = 0002.mp3, le bip court (0,2 s)
 *   activation = 0003.mp3, le clip d'activation (6,4 s)
 *
 * Les lecteurs sont créés une fois et réutilisés. L'ancienne version rejouait
 * `play()` sur le même objet cinquante fois par seconde sans jamais l'arrêter,
 * ce qui saturait le pool audio d'Android.
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

let players: Partial<Record<ClipName, AudioPlayer>> = {};
let ready = false;

/** Prépare la sortie audio. À appeler une fois au démarrage. */
export async function initClips() {
  if (ready) {
    return;
  }
  ready = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
    });
  } catch {
    // Le mode audio n'a pas pu être appliqué : on joue quand même.
  }
}

const playerFor = (name: ClipName): AudioPlayer | null => {
  const existing = players[name];
  if (existing) {
    return existing;
  }
  try {
    const player = createAudioPlayer(SOURCES[name]);
    players[name] = player;
    return player;
  } catch {
    return null;
  }
};

/** Joue un clip depuis le début. */
export function playClip(name: ClipName) {
  const player = playerFor(name);
  if (!player) {
    return;
  }
  try {
    player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // Lecteur invalidé : il sera recréé au prochain appel.
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
    player.seekTo(0).catch(() => undefined);
  } catch {
    delete players[name];
  }
}

/** Arrête tous les clips. */
export function stopAllClips() {
  (Object.keys(players) as ClipName[]).forEach(stopClip);
}

/** Libère les lecteurs quand l'application se met en veille. */
export function releaseClips() {
  (Object.values(players) as AudioPlayer[]).forEach((player) => {
    try {
      player.remove();
    } catch {
      // Déjà libéré.
    }
  });
  players = {};
}
