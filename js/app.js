/* ============================================================
   app.js  –  Home / Hub de cuestionarios
   Responsabilidades:
     1. Definir el catálogo de exámenes disponibles
     2. Inyectar las tarjetas dinámicamente en el DOM
     3. Manejar navegación hacia quiz.html
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   CATÁLOGO DE EXÁMENES
   Agrega aquí futuras entradas para nuevos cuestionarios.
   ---------------------------------------------------------- */
const EXAM_CATALOG = [
  {
    id: 'morelos-automovilista',
    title: 'Examen Teórico de Conducir',
    subtitle: 'Estado de Morelos — Licencia Automovilista',
    description:
      'Simulador oficial basado en la Ley de Movilidad y Seguridad Vial del Estado de Morelos (LMSVEM). ' +
      'Abarca señalamientos, velocidades, infracciones, derechos y obligaciones del conductor.',
    dataFile: 'data/quizz.json',
    totalQuestions: 100,    // banco completo
    questionsPerAttempt: 20,
    passingScore: 80,       // porcentaje mínimo aprobatorio
    icon: 'fa-car',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tags: ['Morelos', 'Licencia Tipo A', 'Automovilista'],
    difficulty: 'Intermedio',
    difficultyColor: 'text-amber-600 bg-amber-50',
    estimatedTime: '10–15 min',
  },
  /* ── Plantilla para futuros exámenes ──────────────────────
  {
    id: 'morelos-motociclista',
    title: 'Examen Teórico de Conducir',
    subtitle: 'Estado de Morelos — Licencia Motociclista',
    description: 'Descripción del examen.',
    dataFile: 'data/quizz_moto.json',
    totalQuestions: 80,
    questionsPerAttempt: 20,
    passingScore: 80,
    icon: 'fa-motorcycle',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    tags: ['Morelos', 'Licencia Tipo M'],
    difficulty: 'Avanzado',
    difficultyColor: 'text-red-600 bg-red-50',
    estimatedTime: '10–15 min',
  },
  ───────────────────────────────────────────────────────── */
];

/* ----------------------------------------------------------
   RENDERIZADO DE TARJETAS
   ---------------------------------------------------------- */
function buildCard(exam) {
  const tagHTML = exam.tags
    .map(t => `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">${t}</span>`)
    .join(' ');

  return `
    <article class="quiz-card flex flex-col overflow-hidden anim-pop" role="article"
             aria-label="${exam.title} – ${exam.subtitle}">

      <!-- Card header -->
      <div class="hero-gradient p-6 text-white">
        <div class="flex items-start justify-between gap-3">
          <div class="${exam.iconBg} rounded-xl p-3 shadow-inner">
            <i class="fas ${exam.icon} text-2xl ${exam.iconColor}"></i>
          </div>
          <span class="badge-pass pass text-xs">
            <i class="fas fa-circle-check text-green-500"></i> Disponible
          </span>
        </div>
        <h2 class="mt-4 text-xl font-bold leading-snug">${exam.title}</h2>
        <p class="text-blue-200 text-sm font-medium mt-0.5">${exam.subtitle}</p>
      </div>

      <!-- Card body -->
      <div class="flex flex-col flex-1 p-6 gap-4">
        <p class="text-slate-600 text-sm leading-relaxed">${exam.description}</p>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-2xl font-extrabold text-blue-600">${exam.totalQuestions}</p>
            <p class="text-xs text-slate-500 mt-0.5">Preguntas<br>en banco</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-2xl font-extrabold text-indigo-600">${exam.questionsPerAttempt}</p>
            <p class="text-xs text-slate-500 mt-0.5">Por cada<br>intento</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-2xl font-extrabold text-green-600">${exam.passingScore}%</p>
            <p class="text-xs text-slate-500 mt-0.5">Mínimo<br>aprobatorio</p>
          </div>
        </div>

        <!-- Meta info -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="inline-flex items-center gap-1 ${exam.difficultyColor} rounded-full px-2.5 py-1 font-semibold">
            <i class="fas fa-signal"></i> ${exam.difficulty}
          </span>
          <span class="inline-flex items-center gap-1 text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
            <i class="fas fa-clock"></i> ${exam.estimatedTime}
          </span>
        </div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-1.5">${tagHTML}</div>

        <!-- CTA -->
        <div class="mt-auto pt-2">
          <button
            class="w-full py-3 px-6 rounded-xl font-bold text-white hero-gradient
                   hover:opacity-90 active:scale-95 transition-all duration-150
                   flex items-center justify-center gap-2 shadow-md"
            onclick="startExam('${exam.id}', '${exam.dataFile}', ${exam.questionsPerAttempt})"
            aria-label="Iniciar simulador de ${exam.title}">
            <i class="fas fa-play-circle"></i>
            Iniciar Simulador
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ----------------------------------------------------------
   RENDERIZA EL GRID COMPLETO
   ---------------------------------------------------------- */
function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  const count = document.getElementById('exam-count');

  if (!grid) return;

  if (EXAM_CATALOG.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-20 text-slate-400">
        <i class="fas fa-folder-open text-5xl mb-4"></i>
        <p class="text-lg font-medium">No hay exámenes disponibles por el momento.</p>
      </div>`;
    return;
  }

  grid.innerHTML = EXAM_CATALOG.map(buildCard).join('');
  if (count) count.textContent = EXAM_CATALOG.length;
}

/* ----------------------------------------------------------
   NAVEGACIÓN  →  quiz.html
   Guarda parámetros en sessionStorage para que quiz.js los lea.
   ---------------------------------------------------------- */
function startExam(examId, dataFile, questionsPerAttempt) {
  sessionStorage.setItem('examId', examId);
  sessionStorage.setItem('dataFile', dataFile);
  sessionStorage.setItem('questionsPerAttempt', questionsPerAttempt);
  window.location.href = 'quiz.html';
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', renderCatalog);
