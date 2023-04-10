const decompteTempsEnsecondes = (temps: any) => {
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
};

export default decompteTempsEnsecondes;
