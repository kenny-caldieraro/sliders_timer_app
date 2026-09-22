import { formatDuration, formatSpoken, splitDuration } from '../src/timer/format';
import { DAY, HOUR, MINUTE, SECOND } from '../src/timer/types';

describe('découpage des durées', () => {
  it('répartit correctement jours, heures, minutes et secondes', () => {
    const ms = 3 * DAY + 4 * HOUR + 5 * MINUTE + 6 * SECOND;
    expect(splitDuration(ms)).toEqual({ days: 3, hours: 4, minutes: 5, seconds: 6 });
  });

  it('ramène les valeurs aberrantes à zéro', () => {
    expect(splitDuration(-1)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(splitDuration(Number.NaN)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('complète les afficheurs avec des zéros', () => {
    expect(formatDuration(0)).toBe('000:00:00:00');
    expect(formatDuration(9 * SECOND)).toBe('000:00:00:09');
    expect(formatDuration(99 * DAY + 23 * HOUR)).toBe('099:23:00:00');
  });
});

describe('formulation parlée', () => {
  it("n'énonce que les unités présentes", () => {
    expect(formatSpoken(90 * SECOND)).toBe('1 minute 30 secondes');
    expect(formatSpoken(2 * HOUR)).toBe('2 heures');
  });

  it('dit « 0 seconde » plutôt que rien', () => {
    expect(formatSpoken(0)).toBe('0 seconde');
  });
});
