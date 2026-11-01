(() => {
  const form = document.getElementById('gtsi-ad-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const get = (key) => (data.get(key) || '').toString().trim();

    const message = [
      'DEMANDE DE PUBLICITÉ — GTSI',
      '',
      `Structure : ${get('organisation')}`,
      `Activité : ${get('categorie')}`,
      `Description : ${get('description')}`,
      `Adresse : ${get('adresse')}`,
      `Téléphone : ${get('telephone')}`,
      `Durée : ${get('duree')}`,
      `Responsable : ${get('responsable') || 'À préciser'}`,
      '',
      'Je souhaite faire publier ma structure sur le site GTSI.'
    ].join('\n');

    const url = 'https://wa.me/22879828669?text=' +
      encodeURIComponent(message);

    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();
