let orte = [];
let stiftungen = [];

const bundeslaender = [
  "baden-württemberg", "bayern", "berlin", "brandenburg", "bremen", "hamburg",
  "hessen", "mecklenburg-vorpommern", "niedersachsen", "nordrhein-westfalen",
  "rheinland-pfalz", "saarland", "sachsen", "sachsen-anhalt", "schleswig-holstein", "thüringen"
];

async function ladeDaten() {
  const [orteRes, stiftungenRes] = await Promise.all([
    fetch('orte.json'),
    fetch('stiftungen.json')
  ]);
  orte = await orteRes.json();
  stiftungen = await stiftungenRes.json();
}

ladeDaten();

function sucheFoerderungen() {
  const eingabe = document.getElementById('ort').value.trim().toLowerCase();
  const ergebnisBox = document.getElementById('ergebnisse');
  ergebnisBox.innerHTML = '';

  const ortEintrag = orte.find(o => o.ort.toLowerCase() === eingabe);
  const istBundesland = bundeslaender.includes(eingabe);

  const bundesweit = stiftungen.filter(s => s.gebiet === 'bundesweit');

  if (ortEintrag) {
    const bundesland = ortEintrag.bundesland;
    const lokale = stiftungen.filter(s => s.gebiet.toLowerCase() === ortEintrag.ort.toLowerCase());
    const regionale = stiftungen.filter(s => s.gebiet.toLowerCase() === bundesland.toLowerCase());

    const info = document.createElement('p');
    info.className = 'highlight-box font-semibold';
    info.innerHTML = `Gefundene Förderungen für <strong>${ortEintrag.ort}</strong> (${bundesland}):`;
    ergebnisBox.appendChild(info);

    if (lokale.length) zeigeKategorie(`📍 Lokale Angebote (${ortEintrag.ort})`, lokale, ergebnisBox);
    if (regionale.length) zeigeKategorie(`🌿 Regionale Angebote (${bundesland})`, regionale, ergebnisBox);
    zeigeKategorie("🌐 Bundesweite Angebote", bundesweit, ergebnisBox);

  } else if (istBundesland) {
    const bundeslandName = eingabe.charAt(0).toUpperCase() + eingabe.slice(1);
    const regionale = stiftungen.filter(s => s.gebiet.toLowerCase() === eingabe);

    const info = document.createElement('p');
    info.className = 'highlight-box font-semibold';
    info.innerHTML = `Gefundene Förderungen für das Bundesland <strong>${bundeslandName}</strong>:`;
    ergebnisBox.appendChild(info);

    if (eingabe === "niedersachsen" || eingabe === "bayern") {
      if (regionale.length) zeigeKategorie(`🌿 Regionale Angebote (${bundeslandName})`, regionale, ergebnisBox);
    }
    zeigeKategorie("🌐 Bundesweite Angebote", bundesweit, ergebnisBox);

  } else {
    const hinweis = document.createElement('p');
    hinweis.className = 'highlight-box text-red-600 font-semibold';
    hinweis.innerText = 'Dieser Ort oder dieses Bundesland konnte nicht gefunden werden. Hier sind bundesweite Finanzierungsquellen:';
    ergebnisBox.appendChild(hinweis);
    zeigeKategorie("🌐 Bundesweite Angebote", bundesweit, ergebnisBox);
  }
}

function formatBeschreibung(text) {
  const zeilen = text.split('\n');
  let html = '';
  let inListe = false;

  zeilen.forEach(zeile => {
    const trimmed = zeile.trim();
    if (/^[-\u2022*]/.test(trimmed)) {
      if (!inListe) {
        html += '<ul class="list-disc pl-6 mb-2">';
        inListe = true;
      }
      html += `<li>${trimmed.replace(/^[-\u2022*]\s*/, '')}</li>`;
    } else if (trimmed === '') {
      if (inListe) {
        html += '</ul>';
        inListe = false;
      }
      html += '<br>';
    } else {
      if (inListe) {
        html += '</ul>';
        inListe = false;
      }
      html += `<p class="mb-2">${trimmed}</p>`;
    }
  });
  if (inListe) html += '</ul>';
  return html;
}

function zeigeKategorie(titel, eintraege, container) {
  const farben = {
    "Staatliche Förderung": "bg-green-100",
    "Soziallotterie": "bg-yellow-100",
    "Stiftung": "bg-blue-100"
  };

  const block = document.createElement('div');
  const titelBox = document.createElement('h2');
  titelBox.className = "text-xl font-bold highlight-box";
  titelBox.textContent = titel;
  block.appendChild(titelBox);

  eintraege.forEach(e => {
    const farbe = farben[e.typ] || 'bg-gray-100';
    const div = document.createElement('div');
    div.className = `p-4 mt-2 rounded shadow ${farbe}`;
    div.innerHTML = `
      <h3 class="font-semibold text-lg">${e.name}</h3>
      <div class="mb-2">${formatBeschreibung(e.beschreibung)}</div>
      ${e.links?.antrag ? `<a href="${e.links.antrag}" target="_blank" class="text-blue-700 underline">Antrag</a><br>` : ''}
      ${e.links?.richtlinien ? `<a href="${e.links.richtlinien}" target="_blank" class="text-blue-700 underline">Förderrichtlinien</a>` : ''}
    `;
    block.appendChild(div);
  });
  container.appendChild(block);
}
