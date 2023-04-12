import React from 'react';
import Sound from 'react-native-sound';

const bip = require('../../assets/sounds/bip.mp3');

const bipSound = new Sound(bip, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
});

let toggleValue = false;
let intervalId: any;
let intervalId2: any;
let count = 0;
let increment = 1;

const genererValeursBooleennes = () => {
  const maintenant = new Date();
  const secondeEnCours = maintenant.getSeconds();
  const valeur1 = secondeEnCours % 2 === 0;
  const valeur2 = secondeEnCours % 3 === 0;
  const valeur3 = secondeEnCours % 5 === 0;
  const valeur4 = secondeEnCours % 7 === 0;
  const valeur5 = toggleValue;

  if (!intervalId) {
    intervalId = setInterval(() => {
      toggleValue = !toggleValue;
    }, 333);

    intervalId2 = setInterval(() => {
      if (count === 10) {
        increment = -1;
      } else if (count === 0) {
        increment = 1;
      }
      count += increment;
    }, 20);
  }

  const valeur6: any = count;

  return [valeur1, valeur2, valeur3, valeur4, valeur5, valeur6];
};

const countingDownConverter = (temps: number, mode: string) => {
  if (mode === 'countdown') {
    // Vérifier que le temps est un nombre positif
    if (typeof temps !== 'number' || temps < 0) {
      return {
        days: '000',
        hours: '00',
        minutes: '00',
        seconds: '00',
        state: true,
      };
    }

    // Calculer les days, hours, minutes et secondes
    const days = Math.floor(temps / 86400);
    temps %= 86400;
    const hours = Math.floor(temps / 3600);
    temps %= 3600;
    const minutes = Math.floor(temps / 60);
    const seconds = temps % 60;

    // Ajout de zéro initial pour les nombres à simple décimal
    const formatNombre = (nombre: any) => {
      return nombre < 10 ? `0${nombre}` : `${nombre}`;
    };

    const formatdays = (days: any) => {
      if (days < 10) {
        return `00${days}`;
      } else if (days < 100) {
        return `0${days}`;
      } else {
        return `${days}`;
      }
    };

    // Retourner un objet avec les valeurs décomptées
    return {
      days: formatdays(days),
      hours: formatNombre(hours),
      minutes: formatNombre(minutes),
      seconds: formatNombre(seconds),
      state: true,
    };
  } else if (mode === 'init') {
    switch (temps) {
      case 1:
        // genser
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: 'GE',
          minutes: 'n5',
          seconds: 'Er',
        };
      case 2:
        // bug
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: 'Eu',
          minutes: 'r0',
          seconds: 'n0',
        };
      case 3:
        // caluri
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: 'Ca',
          minutes: 'lu',
          seconds: 'ri',
        };
      case 4:
        // bug
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: 'Eu',
          minutes: 'r0',
          seconds: 'n0',
        };
      case 5:
        // bug
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: 'Eu',
          minutes: 'r0',
          seconds: 'n0',
        };
      case 6:
        // caluri
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: 'Ca',
          minutes: 'lu',
          seconds: 'ri',
        };
      case 7:
        // kenny
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: 'he',
          minutes: 'nn',
          seconds: 'Y-',
        };
      case 8:
        // clear
        bipSound.play().setVolume(0.2);
        return {
          days: '000',
          hours: '11',
          minutes: '11',
          seconds: '11',
        };
      case 9:
        return {
          days: '000',
          hours: ' 1',
          minutes: '11',
          seconds: '1 ',
        };
      case 10:
        return {
          days: '000',
          hours: '  ',
          minutes: '11',
          seconds: '  ',
        };
      case 11:
        return {
          days: '000',
          hours: '  ',
          minutes: '  ',
          seconds: '  ',
        };
      default:
        return {
          days: '000',
          hours: '00',
          minutes: '00',
          seconds: '00',
        };
    }
  } else if (mode === 'clear') {
    switch (temps) {
      case 0:
        return {
          days: '000',
          hours: '00',
          minutes: '00',
          seconds: '00',
        };
      case 1:
        return {
          days: ' 0 ',
          hours: ' 0',
          minutes: '00',
          seconds: '0 ',
        };
      case 2:
        return {
          days: '   ',
          hours: '  ',
          minutes: '00',
          seconds: '  ',
        };
      case 3:
        return {
          days: '   ',
          hours: '  ',
          minutes: '  ',
          seconds: '  ',
        };
      default:
        return {
          days: '000',
          hours: '00',
          minutes: '00',
          seconds: '00',
        };
    }
  } else {
    return {
      days: '000',
      hours: '00',
      minutes: '00',
      seconds: '00',
    };
  }
};

export {genererValeursBooleennes, countingDownConverter};
