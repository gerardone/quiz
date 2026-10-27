/* ============================================================
   quiz.js  –  Motor del simulador de examen
   Responsabilidades:
     1. Leer parámetros desde sessionStorage (inyectados por app.js)
     2. Cargar data/quizz.json vía fetch
     3. Seleccionar aleatoriamente N preguntas sin repetición
     4. Renderizar pregunta a pregunta con feedback inmediato
     5. Mostrar pantalla de resultados con desglose de errores
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   CONSTANTES POR DEFECTO
   (Se sobreescriben con los valores de sessionStorage)
   ---------------------------------------------------------- */
const DEFAULT_QUESTIONS_PER_ATTEMPT = 20;
const DEFAULT_DATA_FILE = 'data/quizz.json';
const PASSING_THRESHOLD = 0.8; // 80 %
const LABELS = ['A', 'B', 'C', 'D'];

/* ----------------------------------------------------------
   ESTADO GLOBAL DEL QUIZ
   ---------------------------------------------------------- */
const state = {
  allQuestions:   [],   // banco completo
  questions:      [],   // subset aleatorio del intento actual
  current:        0,    // índice de la pregunta activa
  score:          0,    // aciertos acumulados
  missed:         [],   // { question, selectedIndex, correctIndex }
  answered:       false,// si la pregunta actual ya fue respondida
  totalPerAttempt: DEFAULT_QUESTIONS_PER_ATTEMPT,
  dataFile:       DEFAULT_DATA_FILE,
};

/* ----------------------------------------------------------
   UTILIDADES
   ---------------------------------------------------------- */

/** Fisher-Yates shuffle – devuelve copia mezclada */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Selecciona N elementos aleatorios sin repetición */
function sampleN(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

/** Reemplaza el contenido y clase de un elemento */
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function show(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}
function hide(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

/* ----------------------------------------------------------
   CARGA DE DATOS
   ---------------------------------------------------------- */
async function loadQuestions() {
  showScreen('screen-loading');

  try {
    const res = await fetch(state.dataFile);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0)
      throw new Error('El archivo JSON está vacío o no es un array.');

    state.allQuestions = data;
    startNewAttempt();
  } catch (err) {
    showError(err.message);
  }
}

/* ----------------------------------------------------------
   INICIAR / REINICIAR INTENTO
   ---------------------------------------------------------- */
function startNewAttempt() {
  state.questions = sampleN(state.allQuestions, state.totalPerAttempt);
  state.current   = 0;
  state.score     = 0;
  state.missed    = [];
  state.answered  = false;

  showScreen('screen-quiz');
  renderQuestion();
}

/* ----------------------------------------------------------
   RENDERIZAR PREGUNTA ACTIVA
   ---------------------------------------------------------- */
function renderQuestion() {
  const q   = state.questions[state.current];
  const num = state.current + 1;
  const tot = state.questions.length;
  const pct = Math.round(((num - 1) / tot) * 100);

  // Progreso
  setText('progress-label', `Pregunta ${num} de ${tot}`);
  setText('progress-pct', `${pct}%`);
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${pct}%`;

  // Texto de la pregunta
  const catHTML = q.categoria
    ? `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-3">
         <i class="fas fa-tag mr-1"></i>${q.categoria}
       </span>`
    : '';
  setHTML('question-text', `${catHTML}<p class="text-lg font-semibold text-slate-800 leading-snug">${q.pregunta}</p>`);

  // Opciones
  const optContainer = document.getElementById('options-container');
  if (!optContainer) return;
  optContainer.innerHTML = q.opciones.map((op, i) => `
    <button
      class="option-btn flex items-center"
      id="opt-${i}"
      onclick="handleAnswer(${i})"
      aria-label="Opción ${LABELS[i]}: ${op.replace(/"/g, '&quot;')}">
      <span class="option-label">${LABELS[i]}</span>
      <span>${op}</span>
    </button>
  `).join('');

  // Reset estado
  hide('explanation-box');
  hide('btn-next');
  state.answered = false;

  // Animación de entrada
  const card = document.getElementById('question-card');
  if (card) {
    card.classList.remove('anim-pop');
    void card.offsetWidth; // reflow
    card.classList.add('anim-pop');
  }
}

/* ----------------------------------------------------------
   MANEJAR RESPUESTA
   ---------------------------------------------------------- */
function handleAnswer(selectedIdx) {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.current];
  const correctIdx = q.respuesta_correcta;
  const isCorrect = selectedIdx === correctIdx;

  // Actualizar puntaje
  if (isCorrect) {
    state.score++;
  } else {
    state.missed.push({
      question: q,
      selectedIndex: selectedIdx,
      correctIndex: correctIdx,
    });
  }

  // Deshabilitar todos los botones
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`opt-${i}`);
    if (!btn) continue;
    btn.disabled = true;

    if (i === correctIdx) {
      btn.classList.add('correct');
    } else if (i === selectedIdx) {
      btn.classList.add('incorrect');
    } else {
      btn.style.opacity = '0.45';
    }
  }

  // Mostrar explicación
  const explBox = document.getElementById('explanation-box');
  if (explBox) {
    const cls = isCorrect ? 'correct-expl' : 'incorrect-expl';
    const icon = isCorrect
      ? '<i class="fas fa-circle-check text-green-600 text-xl flex-shrink-0"></i>'
      : '<i class="fas fa-circle-xmark text-red-600 text-xl flex-shrink-0"></i>';
    const title = isCorrect
      ? '<span class="font-bold text-green-700">¡Correcto!</span>'
      : `<span class="font-bold text-red-700">Incorrecto.</span> La respuesta correcta es <strong>${LABELS[correctIdx]}</strong>.`;

    explBox.className = `explanation-card ${cls} p-4 anim-slide`;
    explBox.innerHTML = `
      <div class="flex gap-3">
        ${icon}
        <div>
          <p class="text-sm mb-1">${title}</p>
          <p class="text-sm text-slate-700 leading-relaxed">${q.explicacion}</p>
        </div>
      </div>`;
    show('explanation-box');
  }

  // Mostrar botón "Siguiente"
  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    const isLast = state.current === state.questions.length - 1;
    btnNext.textContent = isLast ? 'Ver Resultados' : 'Siguiente';
    btnNext.innerHTML = isLast
      ? '<i class="fas fa-chart-bar mr-2"></i>Ver Resultados'
      : '<i class="fas fa-arrow-right mr-2"></i>Siguiente Pregunta';
    show('btn-next');
  }
}

/* ----------------------------------------------------------
   AVANZAR A LA SIGUIENTE PREGUNTA
   ---------------------------------------------------------- */
function nextQuestion() {
  if (state.current < state.questions.length - 1) {
    state.current++;
    renderQuestion();
    // Scroll al inicio de la tarjeta
    document.getElementById('question-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    showResults();
  }
}

/* ----------------------------------------------------------
   PANTALLA DE RESULTADOS
   ---------------------------------------------------------- */
function showResults() {
  showScreen('screen-results');

  const total  = state.questions.length;
  const score  = state.score;
  const pct    = Math.round((score / total) * 100);
  const passed = pct >= PASSING_THRESHOLD * 100;

  // Anillo de puntuación (CSS conic-gradient)
  const ring = document.getElementById('score-ring');
  if (ring) {
    const color = passed ? '#16a34a' : '#dc2626';
    ring.style.background =
      `conic-gradient(${color} ${pct * 3.6}deg, #e2e8f0 ${pct * 3.6}deg)`;
  }

  setText('score-number', `${score}/${total}`);
  setText('score-pct', `${pct}%`);

  // Badge aprobado / reprobado
  const badge = document.getElementById('result-badge');
  if (badge) {
    badge.className = `badge-pass ${passed ? 'pass' : 'fail'}`;
    badge.innerHTML = passed
      ? '<i class="fas fa-trophy"></i> ¡Aprobado!'
      : '<i class="fas fa-times-circle"></i> No aprobado';
  }

  // Mensaje motivacional
  const msg = document.getElementById('result-message');
  if (msg) {
    if (pct === 100) {
      msg.textContent = '¡Perfecto! Respondiste todas las preguntas correctamente. 🏆';
    } else if (passed) {
      msg.textContent = `¡Felicidades! Superaste el mínimo aprobatorio del ${Math.round(PASSING_THRESHOLD * 100)}%. Estás listo para el examen oficial.`;
    } else {
      msg.textContent = `Necesitas al menos ${Math.round(PASSING_THRESHOLD * 100)}% para aprobar (${Math.ceil(total * PASSING_THRESHOLD)} de ${total} aciertos). Revisa los temas fallados y vuelve a intentarlo.`;
    }
  }

  // Estadísticas rápidas
  setText('stat-correct',   score);
  setText('stat-incorrect', state.missed.length);
  setText('stat-pct',       `${pct}%`);

  // Desglose de preguntas falladas
  const missedList = document.getElementById('missed-list');
  if (missedList) {
    if (state.missed.length === 0) {
      missedList.innerHTML = `
        <div class="text-center py-8 text-green-600">
          <i class="fas fa-party-horn text-4xl mb-3"></i>
          <p class="font-semibold">¡Sin errores en este intento!</p>
        </div>`;
    } else {
      missedList.innerHTML = state.missed.map((m, idx) => `
        <div class="missed-row anim-fade" style="animation-delay:${idx * 40}ms">
          <p class="font-semibold text-slate-800 mb-1">
            <span class="text-red-500 mr-1"><i class="fas fa-circle-xmark"></i></span>
            ${m.question.pregunta}
          </p>
          <p class="text-slate-500 text-xs mb-0.5">
            Tu respuesta: <span class="font-medium text-red-600">${LABELS[m.selectedIndex]}. ${m.question.opciones[m.selectedIndex]}</span>
          </p>
          <p class="text-slate-500 text-xs mb-1">
            Correcta: <span class="font-medium text-green-700">${LABELS[m.correctIndex]}. ${m.question.opciones[m.correctIndex]}</span>
          </p>
          <p class="text-xs text-slate-600 leading-relaxed border-t border-red-100 pt-1 mt-1">
            <i class="fas fa-scale-balanced text-blue-500 mr-1"></i>${m.question.explicacion}
          </p>
        </div>
      `).join('');
    }
  }
}

/* ----------------------------------------------------------
   CONTROL DE PANTALLAS
   ---------------------------------------------------------- */
function showScreen(id) {
  ['screen-loading', 'screen-quiz', 'screen-results', 'screen-error']
    .forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.toggle('hidden', s !== id);
    });
}

function showError(msg) {
  showScreen('screen-error');
  setHTML('error-message', `
    <i class="fas fa-triangle-exclamation text-4xl text-red-500 mb-3"></i>
    <p class="font-semibold text-slate-800 mb-1">Error al cargar el examen</p>
    <p class="text-sm text-slate-500">${msg}</p>
  `);
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Leer parámetros inyectados por app.js vía sessionStorage
  const storedFile = sessionStorage.getItem('dataFile');
  const storedN    = sessionStorage.getItem('questionsPerAttempt');

  if (storedFile) state.dataFile = storedFile;
  if (storedN)    state.totalPerAttempt = parseInt(storedN, 10) || DEFAULT_QUESTIONS_PER_ATTEMPT;

  // Exponer helpers globales necesarios desde el HTML
  window.handleAnswer  = handleAnswer;
  window.nextQuestion  = nextQuestion;
  window.startNewAttempt = startNewAttempt;

  loadQuestions();
});
