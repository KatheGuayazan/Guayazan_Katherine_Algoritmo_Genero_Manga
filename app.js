// =====================
// 1) Géneros de manga
// =====================

const generos = [
  "Romance",
  "Slice of Life",
  "Terror",
  "Fantasía",
  "Mechas",
  "Shonen",
  "Seinen",
  "Shoujo",
  "Josei"
];

// =====================
// 2) Perfiles
// =====================

const segmentos = {
  N: "Lectores nuevos",
  J: "Adolescentes",
  A: "Adultos",
  E: "Busca emoción / acción",
  R: "Busca romance",
  M: "Busca historias maduras"
};

// =====================
// 3) Contextos
// =====================

const contextos = {
  I: "¿Qué género recomiendas para INICIARSE en el manga?",
  E: "¿Qué género recomiendas para EMOCIONARSE?",
  P: "¿Qué género recomiendas para historias PROFUNDAS?"
};

// =====================
// 4) Elo
// =====================

const RATING_INICIAL = 1000;
const K = 32;
const STORAGE_KEY = "mangamash_state_v1";

// =====================
// 5) Estado
// =====================

function defaultState() {
  const buckets = {};
  for (const s of Object.keys(segmentos)) {
    for (const c of Object.keys(contextos)) {
      const key = `${s}__${c}`;
      buckets[key] = {};
      generos.forEach(g => buckets[key][g] = RATING_INICIAL);
    }
  }
  return { buckets };
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// =====================
// 6) Elo functions
// =====================

function expectedScore(ra, rb) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

function updateElo(bucket, a, b, winner) {
  const ra = bucket[a];
  const rb = bucket[b];

  const ea = expectedScore(ra, rb);
  const eb = expectedScore(rb, ra);

  const sa = winner === "A" ? 1 : 0;
  const sb = winner === "B" ? 1 : 0;

  bucket[a] = ra + K * (sa - ea);
  bucket[b] = rb + K * (sb - eb);
}

// =====================
// 7) UI
// =====================

const segmentSelect = document.getElementById("segmentSelect");
const contextSelect = document.getElementById("contextSelect");
const labelA = document.getElementById("labelA");
const labelB = document.getElementById("labelB");
const questionEl = document.getElementById("question");
const topBox = document.getElementById("topBox");

let currentA, currentB;

function fillSelect(el, obj) {
  for (const k in obj) {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = obj[k];
    el.appendChild(opt);
  }
}

fillSelect(segmentSelect, segmentos);
fillSelect(contextSelect, contextos);

function newDuel() {
  currentA = generos[Math.floor(Math.random() * generos.length)];
  do {
    currentB = generos[Math.floor(Math.random() * generos.length)];
  } while (currentA === currentB);

  labelA.textContent = currentA;
  labelB.textContent = currentB;
  questionEl.textContent = contextos[contextSelect.value];
}

function vote(winner) {
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  updateElo(state.buckets[key], currentA, currentB, winner);
  saveState();
  renderTop();
  newDuel();
}

function renderTop() {
  const key = `${segmentSelect.value}__${contextSelect.value}`;
  const ranking = Object.entries(state.buckets[key])
    .map(([g, r]) => ({ g, r }))
    .sort((a, b) => b.r - a.r);

  topBox.innerHTML = ranking.map((x, i) => `
    <div class="toprow">
      <div><b>${i + 1}.</b> ${x.g}</div>
      <div>${x.r.toFixed(1)}</div>
    </div>
  `).join("");
}

document.getElementById("btnA").onclick = () => vote("A");
document.getElementById("btnB").onclick = () => vote("B");
document.getElementById("btnNewPair").onclick = newDuel;
document.getElementById("btnShowTop").onclick = renderTop;

document.getElementById("btnReset").onclick = () => {
  if (confirm("¿Reiniciar ranking?")) {
    state = defaultState();
    saveState();
    renderTop();
    newDuel();
  }
};

newDuel();
renderTop();
