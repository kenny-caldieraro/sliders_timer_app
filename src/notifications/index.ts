import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatSpoken } from '../timer/format';

/**
 * Notification de fin de décompte.
 *
 * Le README de la version d'origine annonçait « Receive a notification when
 * the timer reaches zero » sans que ce soit implémenté nulle part. Une
 * fonctionnalité promise et absente tombe sous la politique Play sur les
 * fonctionnalités défectueuses, donc elle existe désormais réellement.
 *
 * La notification est programmée à l'échéance côté système : elle arrive même
 * si l'application a été fermée entre-temps.
 */

const CHANNEL_ID = 'timer';

let configured = false;
let scheduledId: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Crée le canal Android et demande l'autorisation. Renvoie `false` si refusée. */
export async function ensureNotifications(): Promise<boolean> {
  if (!configured) {
    configured = true;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Fin de décompte',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#ff2d2d',
      }).catch(() => undefined);
    }
  }

  const current = await Notifications.getPermissionsAsync().catch(() => null);
  if (current?.granted) {
    return true;
  }
  if (current && !current.canAskAgain) {
    return false;
  }
  const asked = await Notifications.requestPermissionsAsync().catch(() => null);
  return asked?.granted ?? false;
}

/** Programme la notification à l'échéance donnée. */
export async function scheduleTimerEnd(deadlineAt: number, totalMs: number) {
  await cancelTimerEnd();
  if (!(await ensureNotifications())) {
    return;
  }
  const date = new Date(deadlineAt);
  if (date.getTime() <= Date.now()) {
    return;
  }

  scheduledId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Le minuteur est à zéro',
      body: `Décompte de ${formatSpoken(totalMs)} terminé.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_ID,
    },
  }).catch(() => null);
}

/** Annule la notification programmée. */
export async function cancelTimerEnd() {
  if (scheduledId === null) {
    return;
  }
  const id = scheduledId;
  scheduledId = null;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}
