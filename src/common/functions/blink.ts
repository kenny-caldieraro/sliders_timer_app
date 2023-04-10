let toggleValue = false; // Variable pour stocker la valeur alternante
let intervalId: any; // Variable pour stocker l'ID de l'intervalle

const genererValeursBooleennes = () => {
  const maintenant = new Date();
  const secondeEnCours = maintenant.getSeconds();
  const valeur1 = secondeEnCours % 2 === 0;
  const valeur2 = secondeEnCours % 3 === 0;
  const valeur3 = secondeEnCours % 5 === 0;
  const valeur4 = secondeEnCours % 7 === 0;
  const valeur5 = toggleValue; // Nouvelle valeur alternante

  // Démarrer l'intervalle si ce n'est pas déjà fait
  if (!intervalId) {
    intervalId = setInterval(() => {
      toggleValue = !toggleValue;
    }, 333);
  }

  return [valeur1, valeur2, valeur3, valeur4, valeur5];
};

export default genererValeursBooleennes;
