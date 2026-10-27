<div align="center">

# 🚦 SimulaManejo

### Plataforma modular de simuladores de examen teórico de conducir

[![GitHub Pages](https://img.shields.io/badge/Demo-GitHub%20Pages-blue?logo=github)](https://TU_USUARIO.github.io/simulamanejo/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

</div>

---

## 📋 Descripción

**SimulaManejo** es una plataforma web **estática, gratuita y modular** de simuladores de examen teórico para licencias de conducir. Cada simulador presenta preguntas aleatorias del banco completo, ofrece retroalimentación inmediata con fundamento legal y evalúa al usuario con el criterio aprobatorio oficial.

> Actualmente disponible: **Examen Teórico — Estado de Morelos (Licencia Automovilista)**,  
> basado en la *Ley de Movilidad y Seguridad Vial del Estado de Morelos (LMSVEM)*.

---

## ✨ Características clave

| Característica | Detalle |
|---|---|
| 🃏 **Banco de preguntas** | 100 reactivos con cobertura de 61 categorías temáticas |
| 🔀 **Selección aleatoria** | 20 preguntas distintas en cada intento (Fisher-Yates shuffle) |
| ⚖️ **Fundamento legal** | Cada respuesta incluye la justificación legal correspondiente |
| 🟢🔴 **Feedback inmediato** | Verde / rojo + explicación visible antes de continuar |
| 📊 **Pantalla de resultados** | Puntaje, badge aprobado/reprobado y desglose de errores |
| 📱 **Diseño responsivo** | Funciona en móvil, tablet y escritorio |
| ⚡ **Sin backend** | 100 % estático — desplegable en GitHub Pages sin costo |
| 🔌 **Modular** | Agregar un nuevo examen requiere solo un JSON y una tarjeta |

---

## 🗂️ Estructura del proyecto

```
simulamanejo/
│
├── index.html          # Home: catálogo de exámenes disponibles
├── quiz.html           # Vista interactiva del simulador
├── README.md
├── .gitignore
│
├── css/
│   └── styles.css      # Animaciones, estados de botones, anillo de puntuación
│
├── js/
│   ├── app.js          # Catálogo EXAM_CATALOG + render de tarjetas
│   └── quiz.js         # Motor del examen: fetch → shuffle → feedback → resultados
│
└── data/
    └── quizz.json      # Banco de preguntas (100 reactivos, Morelos)
```

### Descripción de cada archivo

- **`index.html`** — Hub visual con tarjetas por examen. Usa Tailwind CDN y Font Awesome. No depende de frameworks.
- **`quiz.html`** — Vista del simulador. Gestiona cuatro pantallas: `loading`, `quiz`, `results` y `error`.
- **`css/styles.css`** — Estilos auxiliares: clases `.option-btn`, `.progress-bar-fill`, `.score-ring`, `.explanation-card`, `.missed-row` y animaciones CSS.
- **`js/app.js`** — Define el array `EXAM_CATALOG`. Cada entrada genera automáticamente una tarjeta en el catálogo. Al hacer clic en "Iniciar", guarda parámetros en `sessionStorage` y redirige a `quiz.html`.
- **`js/quiz.js`** — Motor completo: carga el JSON, baraja las preguntas, maneja el estado, evalúa respuestas y calcula resultados.
- **`data/quizz.json`** — Array JSON con 100 objetos. Cada reactivo tiene: `id`, `categoria`, `pregunta`, `opciones` (array de 4), `respuesta_correcta` (índice 0–3) y `explicacion`.

---

## ➕ Cómo agregar un nuevo cuestionario

### Paso 1 — Crea el archivo de preguntas

Añade un nuevo archivo en `data/`, por ejemplo `data/quizz_moto.json`, siguiendo esta estructura:

```json
[
  {
    "id": 1,
    "categoria": "Seguridad en Motocicletas",
    "pregunta": "¿Cuál es el equipo de protección obligatorio para motociclistas?",
    "opciones": [
      "Casco y guantes",
      "Solo casco homologado",
      "Casco, guantes y calzado cerrado",
      "Ninguno es obligatorio"
    ],
    "respuesta_correcta": 2,
    "explicacion": "El Art. XX de la LMSVEM establece que el motociclista debe portar casco homologado, guantes y calzado cerrado."
  }
]
```

### Paso 2 — Registra el examen en el catálogo

Abre [`js/app.js`](./js/app.js) y agrega una entrada al array `EXAM_CATALOG` (hay una plantilla comentada lista para copiar):

```javascript
const EXAM_CATALOG = [
  // ... examen existente ...
  {
    id: 'morelos-motociclista',
    title: 'Examen Teórico de Conducir',
    subtitle: 'Estado de Morelos — Licencia Motociclista',
    description: 'Simulador basado en la LMSVEM para aspirantes a licencia tipo M.',
    dataFile: 'data/quizz_moto.json',   // ← apunta al nuevo archivo
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
];
```

**¡Eso es todo!** La tarjeta aparece automáticamente en el catálogo.

---

## 💻 Ejecutar localmente

> ⚠️ El simulador usa `fetch()` para cargar el JSON, por lo que **no funciona abriendo el `.html` directamente con doble clic** (restricción CORS del navegador). Necesitas un servidor HTTP local.

### Opción A — Python (sin instalación extra)

```bash
cd /ruta/a/simulamanejo
python3 -m http.server 8080
# Abre: http://localhost:8080
```

### Opción B — Node.js / npx serve

```bash
cd /ruta/a/simulamanejo
npx serve .
# Abre la URL que indique la terminal (normalmente http://localhost:3000)
```

### Opción C — VS Code Live Server

1. Instala la extensión **Live Server** (Ritwick Dey)
2. Clic derecho en `index.html` → **Open with Live Server**
3. El navegador se abre automáticamente en `http://127.0.0.1:5500`

---

## 🚀 Despliegue en GitHub Pages

### 1. Crea el repositorio en GitHub

Ve a [github.com/new](https://github.com/new) y crea un repositorio **público** llamado `simulamanejo` (o el nombre que prefieras). **No** inicialices con README ni .gitignore.

### 2. Vincula y sube el código

Ejecuta estos comandos en tu terminal, **dentro de la carpeta del proyecto**:

```bash
# Inicializar Git (si no existe aún)
git init

# Configurar identidad (si es la primera vez)
git config user.name  "Tu Nombre"
git config user.email "tu@email.com"

# Añadir todos los archivos y hacer el commit inicial
git add .
git commit -m "feat: plataforma de simuladores y examen de conducir Morelos"

# Renombrar rama a main y conectar con GitHub
git branch -M main
git remote add origin https://github.com/TU_USUARIO/simulamanejo.git

# Primer push
git push -u origin main
```

### 3. Activa GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** → sección **Pages** (menú izquierdo)
3. En *Source* selecciona: **Deploy from a branch**
4. Branch: `main` / Folder: `/ (root)`
5. Clic en **Save**

GitHub tardará ~1–2 minutos en publicar el sitio.

### 4. Tu URL pública

```
https://TU_USUARIO.github.io/simulamanejo/
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub y `simulamanejo` con el nombre exacto del repositorio.

---

## 🔄 Flujo de trabajo para actualizaciones futuras

```bash
# Después de modificar archivos
git add .
git commit -m "feat: agrega examen motociclistas Morelos"
git push
```

GitHub Pages re-despliega automáticamente en ~1 minuto.

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Libre para uso educativo y no comercial.

---

<div align="center">
  <sub>Construido con ❤️ · Basado en la LMSVEM · Plataforma educativa sin fines de lucro</sub>
</div>
