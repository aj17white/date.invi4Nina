// ============================================================================
// CENTRAL CONFIGURATION OBJECT
// Photos are local files: replace assets/photos/photo-1.jpg ... photo-4.jpg
// (or edit the paths / captions below, and add more entries if you like).
// ============================================================================
const CONFIG = {
  musicUrl: "assets/music/background.mp3",
  recipientName: "Nina",
  senderName: "Your Secret Admirer",
  invitationQuestion: "Nina, would you like to go on a date with me?",
  date: "Around Dec 26 - Dec 30, whenever you are available",
  time: "10:00 AM - 5:00 PM",
  location: "In Calapan City. I'll pick you up! But we will commute",
  whatToBring: "A big cute smile",
  whatToWear: "Casual dress or whatever you feel most comfortable in!",
  dateActivity:
    "Watch a movie, grab coffee at a cafe, sing at a karaoke , snap cute photos at a photo booth, enjoy lunch, and take a relaxing walk",
  emailJs: {
    serviceId: "service_lvpneg8",
    templateId: "template_k3325zp",
    publicKey: "LAKk8OxzKL8tt94Ht",
    recipientEmail: "17aaronjamesbajo@gmail.com",
  },
  photos: [
    {
      url: "assets/photos/photo-1.jpg",
      caption: "Sweet laughter & cozy coffee dates ☕",
    },
    {
      url: "assets/photos/photo-2.jpg",
      caption: "Strolling around and making memories 🌸",
    },
    {
      url: "assets/photos/photo-3.jpg",
      caption: "Photo booth goofy faces & big smiles 📸",
    },
    {
      url: "assets/photos/photo-4.jpg",
      caption: "Late night movie & popcorn vibes 🍿",
    },
  ],
};

// ============================================================================
// CAT GIF ASSETS  (local files - just replace the files in assets/gifs/
// with your own, keeping the same names, or change the paths below)
// ============================================================================
const CAT_GIFS = {
  welcome: "assets/gifs/welcome.gif",
  letter: "assets/gifs/letter.gif",
  asking: "assets/gifs/asking.gif",
  noAttempts: [
    "assets/gifs/no-1.gif", // Confused cat
    "assets/gifs/no-2.gif", // Crying dramatic cat
    "assets/gifs/no-3.gif", // Suspicious cat
    "assets/gifs/no-4.gif", // Pleading paws cat
    "assets/gifs/no-5.gif", // Defeated cat
  ],
  noRetired: "assets/gifs/no-retired.gif",
  yesCelebration: "assets/gifs/yes-celebration.gif",
  datePlan: "assets/gifs/date-plan.gif",
  suggestionForm: "assets/gifs/suggestion-form.gif",
  finalStage: "assets/gifs/final-stage.gif",
};

// ============================================================================
// NO BUTTON ATTEMPTS CONFIG
// ============================================================================
const NO_ATTEMPTS_TEXT = [
  "Wait... are you sure? 🥺",
  "Luh. I'll give you another chance.",
  "Interesting choice. I will pretend I did not see that.",
  "Okay, hear me out. I promise the date has snacks.",
  "Final answer? The cat has already prepared its outfit.",
];

// ============================================================================
// MISSING-IMAGE PLACEHOLDER
// If a file in assets/ is missing, show a pink placeholder that tells you
// exactly which file to add.
// ============================================================================
document.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.src.startsWith("data:"))
      return;
    const file = decodeURIComponent(
      img.src
        .split("/")
        .slice(-3)
        .join("/")
        .replace(/^.*?(assets\/)/, "$1"),
    );
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">' +
      '<rect width="300" height="300" fill="#FFE4EC"/>' +
      '<text x="150" y="140" font-size="64" text-anchor="middle">🌷</text>' +
      '<text x="150" y="190" font-size="14" font-family="sans-serif" fill="#E11D48" text-anchor="middle">Add your file:</text>' +
      '<text x="150" y="212" font-size="13" font-family="monospace" fill="#BE123C" text-anchor="middle">' +
      file +
      "</text>" +
      "</svg>";
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  },
  true,
);

// ============================================================================
// STATE
// ============================================================================
let stage = 1;
let isPlayingMusic = false;
let noCount = 0;
let isNoDisabled = false;
let isYesClicked = false;
let envelopeOpen = false;

let formData = {
  dateSuggestion: "",
  timeSuggestion: "",
  locationSuggestion: "",
  activitySuggestion: "",
  additionalMessage: "",
};
let isSubmitting = false;
let formSubmitted = false;

// Audio refs
let audioCtx = null;
let isAudioPlaying = false;

// ============================================================================
// ELEMENT REFERENCES
// ============================================================================
const $ = (selector) => document.querySelector(selector);

const canvas = $("#confetti-canvas");
const musicBtn = $("#music-btn");
const musicOn = $("#music-on");
const musicOff = $("#music-off");

const envelope = $("#envelope");
const envelopeFlap = $("#envelope-flap");
const envelopeLetter = $("#envelope-letter");

const questionState = $("#question-state");
const celebrationState = $("#celebration-state");
const reactionCat = $("#reaction-cat");
const noAttemptMsg = $("#no-attempt-msg");
const noRetiredMsg = $("#no-retired-msg");
const noInitialMsg = $("#no-initial-msg");
const noBtn = $("#no-btn");

const suggestionForm = $("#suggestion-form");
const submitBtn = $("#submit-btn");
const submitSending = $("#submit-sending");
const submitIdle = $("#submit-idle");
const formSuccess = $("#form-success");

const NO_BTN_BASE_CLASS =
  "font-semibold px-6 py-3.5 rounded-2xl border transition-all text-sm sm:text-base z-10";
const NO_BTN_ACTIVE_CLASS =
  "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-sm";
const NO_BTN_DISABLED_CLASS =
  "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-60";

// ============================================================================
// PAGE / STAGE NAVIGATION
// ============================================================================
function setStage(n) {
  stage = n;
  document.querySelectorAll("main > section").forEach((section) => {
    section.hidden = section.id !== `stage-${n}`;
  });
  // Scroll to top on stage change
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================================
// Background Audio Player (MP3 File)
// ============================================================================
function getAudioElement() {
  return document.getElementById("bg-music");
}

function renderMusicButton() {
  const musicOn = document.getElementById("music-on");
  const musicOff = document.getElementById("music-off");
  const musicBtn = document.getElementById("music-btn");

  if (!musicOn || !musicOff || !musicBtn) return;

  musicOn.hidden = !isPlayingMusic;
  musicOff.hidden = isPlayingMusic;
  musicBtn.title = isPlayingMusic ? "Mute music" : "Play music";
}

function toggleMusic() {
  const bgAudio = getAudioElement();

  if (!bgAudio) {
    console.error("Audio element #bg-music was not found in the HTML!");
    return;
  }

  if (isPlayingMusic) {
    bgAudio.pause();
    isPlayingMusic = false;
    renderMusicButton();
  } else {
    bgAudio.volume = 0.5; // 50% volume
    bgAudio
      .play()
      .then(() => {
        isPlayingMusic = true;
        renderMusicButton();
      })
      .catch((err) => {
        console.warn("Audio playback error/blocked:", err);
        isPlayingMusic = false;
        renderMusicButton();
        alert(
          "Unable to play audio. Please check that 'assets/music/background.mp3' exists.",
        );
      });
  }
}

// ============================================================================
// Canvas Confetti Celebration Effect
// ============================================================================
function triggerConfetti() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = [
    "#FF69B4",
    "#FFB6C1",
    "#FF1493",
    "#DB7093",
    "#FAF0E6",
    "#FFD700",
    "#34D399",
  ];

  for (let i = 0; i < 160; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      shape: ["rect", "rect", "heart", "tulip"][Math.floor(Math.random() * 4)],
    });
  }

  let animationFrameId;

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.16; // Gravity
      p.opacity -= 0.007;
      p.rotation += p.rotationSpeed;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === "tulip") {
          // Tulip particle
          const s = p.size * 1.6;
          ctx.fillStyle = "#4CAF6A";
          ctx.fillRect(-0.5, 0, 1.5, s * 0.9);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(-s * 0.45, -s * 0.55);
          ctx.quadraticCurveTo(-s * 0.55, s * 0.1, 0, s * 0.15);
          ctx.quadraticCurveTo(s * 0.55, s * 0.1, s * 0.45, -s * 0.55);
          ctx.quadraticCurveTo(s * 0.2, -s * 0.2, 0, -s * 0.75);
          ctx.quadraticCurveTo(-s * 0.2, -s * 0.2, -s * 0.45, -s * 0.55);
          ctx.fill();
        } else {
          // Heart particle
          ctx.beginPath();
          const topCurveHeight = p.size * 0.3;
          ctx.moveTo(0, topCurveHeight);
          ctx.bezierCurveTo(0, 0, -p.size / 2, 0, -p.size / 2, topCurveHeight);
          ctx.bezierCurveTo(
            -p.size / 2,
            (p.size + topCurveHeight) / 2,
            0,
            p.size,
            0,
            p.size,
          );
          ctx.bezierCurveTo(
            0,
            p.size,
            p.size / 2,
            (p.size + topCurveHeight) / 2,
            p.size / 2,
            topCurveHeight,
          );
          ctx.bezierCurveTo(p.size / 2, 0, 0, 0, 0, topCurveHeight);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    if (alive) {
      animationFrameId = requestAnimationFrame(render);
    }
  };

  render();
}

// ============================================================================
// ENVELOPE (PAGE 1)
// ============================================================================
function renderEnvelope() {
  envelope.classList.toggle("scale-105", envelopeOpen);
  envelope.classList.toggle("hover:scale-105", !envelopeOpen);

  envelopeFlap.classList.toggle("[transform:rotateX(180deg)]", envelopeOpen);
  envelopeFlap.classList.toggle("shadow-none", envelopeOpen);
  envelopeFlap.classList.toggle("shadow-md", !envelopeOpen);

  envelopeLetter.classList.toggle("-translate-y-8", envelopeOpen);
  envelopeLetter.classList.toggle("z-30", envelopeOpen);
  envelopeLetter.classList.toggle("translate-y-2", !envelopeOpen);
}

function openEnvelope(delay) {
  envelopeOpen = true;
  renderEnvelope();
  setTimeout(() => setStage(2), delay);
}

// ============================================================================
// YES / NO (PAGE 3)
// ============================================================================
function setNoPos(pos) {
  noBtn.style.position = pos.position;
  noBtn.style.top = pos.top;
  noBtn.style.left = pos.left;
  noBtn.style.transition = pos.transition || "";
}

function renderQuestion() {
  // Cat GIF depending on interaction attempt
  reactionCat.src = isNoDisabled
    ? CAT_GIFS.noRetired
    : noCount > 0
      ? CAT_GIFS.noAttempts[noCount - 1]
      : CAT_GIFS.asking;

  // NO Attempt Dynamic Text Message
  const showAttempt = noCount > 0 && !isNoDisabled;
  noAttemptMsg.hidden = !showAttempt;
  if (showAttempt) noAttemptMsg.textContent = NO_ATTEMPTS_TEXT[noCount - 1];
  noRetiredMsg.hidden = !isNoDisabled;
  noInitialMsg.hidden = noCount !== 0;

  // NO button appearance
  noBtn.disabled = isNoDisabled;
  noBtn.className = `${NO_BTN_BASE_CLASS} ${isNoDisabled ? NO_BTN_DISABLED_CLASS : NO_BTN_ACTIVE_CLASS}`;
  noBtn.textContent = isNoDisabled ? "This button is unavailable 😿" : "No 🙈";

  // Yes / question state
  questionState.hidden = isYesClicked;
  celebrationState.hidden = !isYesClicked;
}

// NO Button Click & Runaway Positioning Logic
function handleNoClick() {
  if (noCount >= 4) {
    noCount = 5;
    isNoDisabled = true;
    setNoPos({ position: "relative", top: "0px", left: "0px" });
    renderQuestion();
    return;
  }

  noCount = noCount + 1;

  // Compute dynamic bounding offsets so button stays fully inside screen/container
  const maxOffset = 110;
  const randomX = (Math.random() - 0.5) * maxOffset * 2;
  const randomY = (Math.random() - 0.5) * maxOffset * 2;

  setNoPos({
    position: "relative",
    top: `${randomY}px`,
    left: `${randomX}px`,
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  });
  renderQuestion();
}

function handleYesClick() {
  isYesClicked = true;
  renderQuestion();
  triggerConfetti();
}

// ============================================================================
// FORM (PAGE 5)
// ============================================================================
function renderForm() {
  suggestionForm.hidden = formSubmitted;
  formSuccess.hidden = !formSubmitted;

  submitBtn.disabled = isSubmitting;
  submitSending.hidden = !isSubmitting;
  submitIdle.hidden = isSubmitting;
}

// Form Submission Handler
async function handleFormSubmit(e) {
  e.preventDefault();
  isSubmitting = true;
  renderForm();

  const isEmailJsConfigured =
    CONFIG.emailJs.serviceId !== "YOUR_SERVICE_ID" &&
    CONFIG.emailJs.templateId !== "YOUR_TEMPLATE_ID" &&
    CONFIG.emailJs.publicKey !== "YOUR_PUBLIC_KEY";

  if (isEmailJsConfigured) {
    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: CONFIG.emailJs.serviceId,
            template_id: CONFIG.emailJs.templateId,
            user_id: CONFIG.emailJs.publicKey,
            template_params: {
              to_email: CONFIG.emailJs.recipientEmail,
              from_name: CONFIG.recipientName,
              date_suggestion: formData.dateSuggestion,
              time_suggestion: formData.timeSuggestion,
              location_suggestion: formData.locationSuggestion,
              activity_suggestion: formData.activitySuggestion,
              message: formData.additionalMessage,
            },
          }),
        },
      );

      if (response.ok) {
        formSubmitted = true;
        renderForm();
      } else {
        throw new Error("EmailJS submission failed");
      }
    } catch (err) {
      console.warn("Falling back to smooth simulation:", err);
      setTimeout(() => {
        formSubmitted = true;
        renderForm();
      }, 1000);
    } finally {
      isSubmitting = false;
      renderForm();
    }
  } else {
    // Demo / fallback simulation
    setTimeout(() => {
      isSubmitting = false;
      formSubmitted = true;
      renderForm();
    }, 1200);
  }
}

// ============================================================================
// RESET (Replay)
// ============================================================================
function handleReset() {
  setStage(1);
  noCount = 0;
  setNoPos({ position: "relative", top: "0px", left: "0px" });
  isNoDisabled = false;
  isYesClicked = false;
  envelopeOpen = false;
  formSubmitted = false;
  formData = {
    dateSuggestion: "",
    timeSuggestion: "",
    locationSuggestion: "",
    activitySuggestion: "",
    additionalMessage: "",
  };
  suggestionForm.reset();

  renderEnvelope();
  renderQuestion();
  renderForm();
}

// ============================================================================
// INIT
// ============================================================================
function init() {
  // Fill text from CONFIG
  document.querySelectorAll("[data-config]").forEach((el) => {
    el.textContent = CONFIG[el.dataset.config];
  });
  $("#invitation-question").textContent = CONFIG.invitationQuestion;

  // Fill GIFs
  document.querySelectorAll("[data-gif]").forEach((img) => {
    img.src = CAT_GIFS[img.dataset.gif];
  });

  // Polaroid grid
  $("#photo-grid").innerHTML = CONFIG.photos
    .map(
      (photo) => `
    <div class="bg-[#FAF0E6] p-3 rounded-2xl border-2 border-amber-200/70 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-rotate-1 hover:scale-105 relative">
      <!-- Tape Accent -->
      <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-amber-200/60 rotate-2 rounded-sm border border-amber-300/50"></div>

      <div class="h-36 w-full overflow-hidden rounded-xl border border-amber-200 bg-gray-100 mb-2">
        <img src="${photo.url}" alt="${photo.caption}" class="w-full h-full object-cover" />
      </div>
      <div class="text-center">
        <p class="text-xs font-semibold text-gray-700">${photo.caption}</p>
      </div>
    </div>
  `,
    )
    .join("");

  // Events
  musicBtn.addEventListener("click", toggleMusic);
  envelope.addEventListener("click", () => openEnvelope(800));
  $("#open-letter-btn").addEventListener("click", () => openEnvelope(700));
  $("#ask-me-btn").addEventListener("click", () => setStage(3));
  $("#yes-btn").addEventListener("click", handleYesClick);
  noBtn.addEventListener("click", handleNoClick);
  $("#to-date-plan-btn").addEventListener("click", () => setStage(4));
  $("#to-form-btn").addEventListener("click", () => setStage(5));
  $("#to-final-btn").addEventListener("click", () => setStage(6));
  $("#replay-btn").addEventListener("click", handleReset);

  suggestionForm.addEventListener("input", (e) => {
    if (e.target.name in formData) formData[e.target.name] = e.target.value;
  });
  suggestionForm.addEventListener("submit", handleFormSubmit);

  // Initial render
  renderMusicButton();
  renderEnvelope();
  renderQuestion();
  renderForm();
  setStage(1);

  // Turn <i data-lucide="..."> placeholders into SVG icons
  if (window.lucide) lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", init);
