// ============================================================
// BLUEMIX DJ
// app.js COMPLET
// ============================================================

const $ = selector => document.querySelector(selector);


// ============================================================
// AUDIO DECKS
// ============================================================

const audioA = $("#audioA");
const audioB = $("#audioB");


// ============================================================
// ÉTAT DES DECKS
// ============================================================

const state = {

  A: {
    audio: audioA,
    title: $("#titleA"),
    artist: $("#artistA"),
    wave: $("#waveA"),
    play: $("#playA")
  },

  B: {
    audio: audioB,
    title: $("#titleB"),
    artist: $("#artistB"),
    wave: $("#waveB"),
    play: $("#playB")
  }

};


// ============================================================
// CUE POINTS
// ============================================================

const cuePoints = {

  A: [null, null, null, null],

  B: [null, null, null, null]

};


// ============================================================
// AUDIO CONTEXT POUR LE SAMPLER
// ============================================================

let samplerContext = null;


// Création du contexte audio
function getSamplerContext() {

  if (!samplerContext) {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {

      console.warn(
        "Web Audio API non disponible."
      );

      return null;

    }

    samplerContext =
      new AudioContext();

  }

  return samplerContext;

}


// Réveiller le contexte audio après interaction
async function resumeSamplerAudio() {

  const ctx =
    getSamplerContext();

  if (!ctx) return;

  try {

    if (ctx.state === "suspended") {

      await ctx.resume();

    }

  } catch (error) {

    console.warn(
      "Impossible de démarrer le sampler audio.",
      error
    );

  }

}


// Une interaction tactile/souris permet de débloquer
// le moteur audio dans les navigateurs mobiles.
document.addEventListener(
  "pointerdown",
  () => {

    resumeSamplerAudio();

  },
  {
    once: true
  }
);


// ============================================================
// CHARGEMENT DES MUSIQUES
// ============================================================

function setupDeck(id, fileInput) {

  const input =
    $(fileInput);

  if (!input) return;


  input.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (!file) return;


      const deck =
        state[id];


      // Libérer l'ancien objet si nécessaire
      if (deck.objectURL) {

        URL.revokeObjectURL(
          deck.objectURL
        );

      }


      deck.objectURL =
        URL.createObjectURL(file);


      deck.audio.src =
        deck.objectURL;


      deck.title.textContent =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        );


      deck.artist.textContent =
        "Fichier local";


      deck.audio.load();


      // Réinitialiser les CUE
      cuePoints[id] =
        [null, null, null, null];


      deck.play.textContent =
        "▶";


      drawWave(
        deck.wave,
        id
      );


      console.log(
        `🎵 Morceau chargé sur Deck ${id}`
      );

    }
  );


  // PLAY / PAUSE avec la souris
  if (state[id].play) {

    state[id].play.addEventListener(
      "click",
      async () => {

        await togglePlay(id);

      }
    );

  }

}


// ============================================================
// PLAY / PAUSE
// ============================================================

async function togglePlay(id) {

  const deck =
    state[id];


  if (!deck.audio.src) {

    console.log(
      `⚠️ Aucun morceau sur Deck ${id}`
    );

    return;

  }


  try {

    if (deck.audio.paused) {

      await deck.audio.play();

      deck.play.textContent =
        "❚❚";


      console.log(
        `▶ PLAY Deck ${id}`
      );

    } else {

      deck.audio.pause();

      deck.play.textContent =
        "▶";


      console.log(
        `⏸ PAUSE Deck ${id}`
      );

    }

  } catch (error) {

    console.error(
      `Erreur lecture Deck ${id}:`,
      error
    );

  }

}


// ============================================================
// INITIALISATION DECKS
// ============================================================

setupDeck(
  "A",
  "#fileA"
);

setupDeck(
  "B",
  "#fileB"
);


// ============================================================
// ÉVÉNEMENTS AUDIO
// ============================================================

audioA.addEventListener(
  "play",
  () => {

    if (state.A.play) {

      state.A.play.textContent =
        "❚❚";

    }

  }
);


audioA.addEventListener(
  "pause",
  () => {

    if (state.A.play) {

      state.A.play.textContent =
        "▶";

    }

  }
);


audioB.addEventListener(
  "play",
  () => {

    if (state.B.play) {

      state.B.play.textContent =
        "❚❚";

    }

  }
);


audioB.addEventListener(
  "pause",
  () => {

    if (state.B.play) {

      state.B.play.textContent =
        "▶";

    }

  }
);


// ============================================================
// WAVEFORM
// ============================================================

function drawWave(canvas, id) {

  if (!canvas) return;


  const ctx =
    canvas.getContext("2d");


  const dpr =
    window.devicePixelRatio || 1;


  const rect =
    canvas.getBoundingClientRect();


  const width =
    Math.max(
      1,
      Math.floor(rect.width * dpr)
    );


  const height =
    Math.max(
      1,
      Math.floor(rect.height * dpr)
    );


  canvas.width =
    width;

  canvas.height =
    height;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  // Fond
  ctx.fillStyle =
    "#04182e";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  const color =
    id === "A"
      ? "#1598ff"
      : "#ff3e4d";


  // Ligne centrale
  ctx.strokeStyle =
    color + "55";

  ctx.lineWidth =
    1 * dpr;

  ctx.beginPath();

  ctx.moveTo(
    0,
    height / 2
  );

  ctx.lineTo(
    width,
    height / 2
  );

  ctx.stroke();


  // Waveform visuelle
  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    2 * dpr;

  ctx.beginPath();


  for (
    let x = 0;
    x < width;
    x++
  ) {

    const wave1 =
      Math.sin(x * 0.055) *
      height * 0.16;

    const wave2 =
      Math.sin(x * 0.013) *
      height * 0.18;

    const wave3 =
      Math.sin(x * 0.11) *
      height * 0.07;

    const wave4 =
      Math.sin(x * 0.021) *
      height * 0.10;


    const y =
      height / 2 +
      wave1 +
      wave2 +
      wave3 +
      wave4;


    if (x === 0) {

      ctx.moveTo(
        x,
        y
      );

    } else {

      ctx.lineTo(
        x,
        y
      );

    }

  }

  ctx.stroke();


  // Position actuelle
  const audio =
    state[id].audio;


  if (
    audio.duration &&
    Number.isFinite(audio.duration)
  ) {

    const position =
      audio.currentTime /
      audio.duration;


    drawPlayPosition(
      canvas,
      position,
      color
    );

  }

}


// ============================================================
// POSITION DE LECTURE
// ============================================================

function drawPlayPosition(
  canvas,
  position,
  color
) {

  const ctx =
    canvas.getContext("2d");


  const x =
    Math.max(
      0,
      Math.min(
        canvas.width,
        position * canvas.width
      )
    );


  // Ligne blanche
  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth =
    2 *
    (window.devicePixelRatio || 1);


  ctx.beginPath();

  ctx.moveTo(
    x,
    0
  );

  ctx.lineTo(
    x,
    canvas.height
  );

  ctx.stroke();


  // Glow coloré
  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    1 *
    (window.devicePixelRatio || 1);


  ctx.beginPath();

  ctx.moveTo(
    x - 2,
    0
  );

  ctx.lineTo(
    x - 2,
    canvas.height
  );

  ctx.stroke();

}


// ============================================================
// MISE À JOUR WAVEFORM
// ============================================================

audioA.addEventListener(
  "timeupdate",
  () => {

    drawWave(
      $("#waveA"),
      "A"
    );

  }
);


audioB.addEventListener(
  "timeupdate",
  () => {

    drawWave(
      $("#waveB"),
      "B"
    );

  }
);


// ============================================================
// SEEK SUR WAVEFORM
// ============================================================

function setupWaveSeek(
  canvas,
  audio,
  id
) {

  if (!canvas) return;


  canvas.addEventListener(
    "pointerdown",
    event => {

      if (
        !audio.duration ||
        !Number.isFinite(audio.duration)
      ) {

        return;

      }


      event.preventDefault();


      const rect =
        canvas.getBoundingClientRect();


      const x =
        event.clientX -
        rect.left;


      let percent =
        x / rect.width;


      percent =
        Math.max(
          0,
          Math.min(
            1,
            percent
          )
        );


      audio.currentTime =
        percent *
        audio.duration;


      drawWave(
        canvas,
        id
      );


      console.log(
        `⏩ Deck ${id} → ${audio.currentTime.toFixed(2)} sec`
      );

    }
  );

}


setupWaveSeek(
  $("#waveA"),
  audioA,
  "A"
);


setupWaveSeek(
  $("#waveB"),
  audioB,
  "B"
);


// ============================================================
// WAVEFORM INITIALE
// ============================================================

drawWave(
  $("#waveA"),
  "A"
);


drawWave(
  $("#waveB"),
  "B"
);


window.addEventListener(
  "resize",
  () => {

    drawWave(
      $("#waveA"),
      "A"
    );

    drawWave(
      $("#waveB"),
      "B"
    );

  }
);


// ============================================================
// CROSSFADER
// ============================================================

function updateMix() {

  const cross =
    Number(
      $("#crossfader").value
    );


  const volumeA =
    Math.max(
      0,
      Math.min(
        1,
        (1 - cross) / 2
      )
    );


  const volumeB =
    Math.max(
      0,
      Math.min(
        1,
        (1 + cross) / 2
      )
    );


  audioA.volume =
    volumeA *
    Number(
      $("#volA").value
    );


  audioB.volume =
    volumeB *
    Number(
      $("#volB").value
    );

}


if ($("#crossfader")) {

  $("#crossfader")
    .addEventListener(
      "input",
      updateMix
    );

}


if ($("#volA")) {

  $("#volA")
    .addEventListener(
      "input",
      updateMix
    );

}


if ($("#volB")) {

  $("#volB")
    .addEventListener(
      "input",
      updateMix
    );

}


updateMix();


// ============================================================
// PITCH
// ============================================================

if ($("#pitchA")) {

  $("#pitchA")
    .addEventListener(
      "input",
      event => {

        audioA.playbackRate =
          1 +
          Number(
            event.target.value
          ) / 100;

      }
    );

}


if ($("#pitchB")) {

  $("#pitchB")
    .addEventListener(
      "input",
      event => {

        audioB.playbackRate =
          1 +
          Number(
            event.target.value
          ) / 100;

      }
    );

}


// ============================================================
// JOG WHEELS
// ============================================================

function setupJog(
  selector,
  audio
) {

  const jog =
    $(selector);


  if (!jog) return;


  let touching =
    false;


  let lastX =
    0;


  jog.addEventListener(
    "pointerdown",
    event => {

      touching =
        true;


      lastX =
        event.clientX;


      jog.setPointerCapture(
        event.pointerId
      );

    }
  );


  jog.addEventListener(
    "pointerup",
    () => {

      touching =
        false;

    }
  );


  jog.addEventListener(
    "pointercancel",
    () => {

      touching =
        false;

    }
  );


  jog.addEventListener(
    "pointermove",
    event => {

      if (!touching) return;


      const movement =
        event.clientX -
        lastX;


      lastX =
        event.clientX;


      if (
        !audio.duration ||
        !Number.isFinite(audio.duration)
      ) {

        return;

      }


      audio.currentTime =
        Math.max(
          0,
          Math.min(
            audio.duration,
            audio.currentTime +
            movement * 0.02
          )
        );

    }
  );

}


setupJog(
  "#jogA",
  audioA
);


setupJog(
  "#jogB",
  audioB
);


// ============================================================
// REC
// ============================================================

if ($("#recordBtn")) {

  $("#recordBtn")
    .addEventListener(
      "click",
      () => {

        $("#recordBtn")
          .classList
          .toggle("active");

      }
    );

}


// ============================================================
// CUE : ENREGISTRER
// ============================================================

function setCue(
  deckId,
  cueNumber
) {

  const deck =
    state[deckId];


  if (!deck.audio.src) {

    console.log(
      `⚠️ Aucun morceau sur Deck ${deckId}`
    );

    return;

  }


  cuePoints[deckId][
    cueNumber - 1
  ] =
    deck.audio.currentTime;


  console.log(
    `📍 CUE ${cueNumber} Deck ${deckId} enregistré à ${deck.audio.currentTime.toFixed(2)} sec`
  );

}


// ============================================================
// CUE : ALLER AU POINT
// ============================================================

function goToCue(
  deckId,
  cueNumber
) {

  const deck =
    state[deckId];


  if (!deck.audio.src) {

    console.log(
      `⚠️ Aucun morceau sur Deck ${deckId}`
    );

    return;

  }


  const position =
    cuePoints[deckId][
      cueNumber - 1
    ];


  if (
    position === null ||
    position === undefined
  ) {

    console.log(
      `⚠️ CUE ${cueNumber} non défini sur Deck ${deckId}`
    );

    return;

  }


  deck.audio.currentTime =
    position;


  console.log(
    `🎯 CUE ${cueNumber} Deck ${deckId} → ${position.toFixed(2)} sec`
  );


  drawWave(
    deck.wave,
    deckId
  );

}


// ============================================================
// FLASH CUE
// ============================================================

function flashCue(
  deckId,
  cueNumber
) {

  const selector =
    deckId === "A"
      ? ".deckA .cuePad"
      : ".deckB .cuePad";


  const pads =
    document.querySelectorAll(
      selector
    );


  const button =
    pads[cueNumber - 1];


  if (!button) return;


  button.animate(
    [
      {
        transform:
          "scale(1)"
      },
      {
        transform:
          "scale(.88)"
      },
      {
        transform:
          "scale(1)"
      }
    ],
    {
      duration:
        180
    }
  );

}


// ============================================================
// CUE SOURIS
// ============================================================

document
  .querySelectorAll(
    ".deckA .cuePad"
  )
  .forEach(
    (button, index) => {

      button.addEventListener(
        "click",
        () => {

          const cueNumber =
            index + 1;


          if (
            cuePoints.A[index] ===
            null
          ) {

            setCue(
              "A",
              cueNumber
            );

          } else {

            goToCue(
              "A",
              cueNumber
            );

          }


          flashCue(
            "A",
            cueNumber
          );

        }
      );

    }
  );


document
  .querySelectorAll(
    ".deckB .cuePad"
  )
  .forEach(
    (button, index) => {

      button.addEventListener(
        "click",
        () => {

          const cueNumber =
            index + 1;


          if (
            cuePoints.B[index] ===
            null
          ) {

            setCue(
              "B",
              cueNumber
            );

          } else {

            goToCue(
              "B",
              cueNumber
            );

          }


          flashCue(
            "B",
            cueNumber
          );

        }
      );

    }
  );


// ============================================================
// ============================================================
// SAMPLER
// ============================================================
// ============================================================

const samplerButtons =
  document.querySelectorAll(
    ".pads button"
  );


// ============================================================
// FLASH SAMPLER
// ============================================================

function flashSampler(
  padNumber
) {

  const button =
    samplerButtons[
      padNumber - 1
    ];


  if (!button) return;


  button.animate(
    [
      {
        transform:
          "scale(1)",
        filter:
          "brightness(1)"
      },
      {
        transform:
          "scale(.90)",
        filter:
          "brightness(1.8)"
      },
      {
        transform:
          "scale(1)",
        filter:
          "brightness(1)"
      }
    ],
    {
      duration:
        160
    }
  );

}


// ============================================================
// CRÉATION D'UN OSCILLATEUR
// ============================================================

function createOscillator(
  ctx,
  type,
  frequency,
  start,
  duration,
  volume
) {

  const oscillator =
    ctx.createOscillator();


  const gain =
    ctx.createGain();


  oscillator.type =
    type;


  oscillator.frequency.setValueAtTime(
    frequency,
    start
  );


  gain.gain.setValueAtTime(
    0.0001,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.01
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );


  oscillator.connect(
    gain
  );


  gain.connect(
    ctx.destination
  );


  oscillator.start(
    start
  );


  oscillator.stop(
    start + duration + 0.03
  );

}


// ============================================================
// BRUIT
// ============================================================

function createNoise(
  ctx,
  start,
  duration,
  volume
) {

  const bufferSize =
    Math.floor(
      ctx.sampleRate *
      duration
    );


  const buffer =
    ctx.createBuffer(
      1,
      bufferSize,
      ctx.sampleRate
    );


  const data =
    buffer.getChannelData(0);


  for (
    let i = 0;
    i < bufferSize;
    i++
  ) {

    data[i] =
      Math.random() * 2 - 1;

  }


  const source =
    ctx.createBufferSource();


  source.buffer =
    buffer;


  const filter =
    ctx.createBiquadFilter();


  filter.type =
    "highpass";


  filter.frequency.value =
    500;


  const gain =
    ctx.createGain();


  gain.gain.setValueAtTime(
    0.0001,
    start
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    start + 0.005
  );


  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );


  source.connect(
    filter
  );


  filter.connect(
    gain
  );


  gain.connect(
    ctx.destination
  );


  source.start(
    start
  );

}


// ============================================================
// SONS DU SAMPLER
// ============================================================

async function playSampler(
  padNumber
) {

  await resumeSamplerAudio();


  const ctx =
    getSamplerContext();


  if (!ctx) return;


  const now =
    ctx.currentTime;


  // ----------------------------------------------------------
  // PAD 1 : AIR HORN
  // ----------------------------------------------------------

  if (padNumber === 1) {

    createOscillator(
      ctx,
      "sawtooth",
      440,
      now,
      0.45,
      0.18
    );


    createOscillator(
      ctx,
      "sawtooth",
      554,
      now,
      0.45,
      0.14
    );


    createOscillator(
      ctx,
      "square",
      659,
      now,
      0.35,
      0.08
    );

  }


  // ----------------------------------------------------------
  // PAD 2 : SIREN
  // ----------------------------------------------------------

  else if (padNumber === 2) {

    const osc =
      ctx.createOscillator();


    const gain =
      ctx.createGain();


    osc.type =
      "sawtooth";


    osc.frequency.setValueAtTime(
      450,
      now
    );


    osc.frequency.linearRampToValueAtTime(
      900,
      now + 0.45
    );


    osc.frequency.linearRampToValueAtTime(
      450,
      now + 0.9
    );


    gain.gain.setValueAtTime(
      0.0001,
      now
    );


    gain.gain.exponentialRampToValueAtTime(
      0.18,
      now + 0.02
    );


    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.95
    );


    osc.connect(
      gain
    );


    gain.connect(
      ctx.destination
    );


    osc.start(
      now
    );


    osc.stop(
      now + 1
    );

  }


  // ----------------------------------------------------------
  // PAD 3 : EXPLOSION
  // ----------------------------------------------------------

  else if (padNumber === 3) {

    createNoise(
      ctx,
      now,
      0.55,
      0.35
    );


    createOscillator(
      ctx,
      "sine",
      70,
      now,
      0.5,
      0.35
    );

  }


  // ----------------------------------------------------------
  // PAD 4 : CLAP
  // ----------------------------------------------------------

  else if (padNumber === 4) {

    createNoise(
      ctx,
      now,
      0.16,
      0.28
    );


    createNoise(
      ctx,
      now + 0.035,
      0.13,
      0.22
    );

  }


  // ----------------------------------------------------------
  // PAD 5 : KICK
  // ----------------------------------------------------------

  else if (padNumber === 5) {

    const osc =
      ctx.createOscillator();


    const gain =
      ctx.createGain();


    osc.type =
      "sine";


    osc.frequency.setValueAtTime(
      150,
      now
    );


    osc.frequency.exponentialRampToValueAtTime(
      48,
      now + 0.18
    );


    gain.gain.setValueAtTime(
      0.0001,
      now
    );


    gain.gain.exponentialRampToValueAtTime(
      0.5,
      now + 0.005
    );


    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.22
    );


    osc.connect(
      gain
    );


    gain.connect(
      ctx.destination
    );


    osc.start(
      now
    );


    osc.stop(
      now + 0.25
    );

  }


  // ----------------------------------------------------------
  // PAD 6 : SNARE
  // ----------------------------------------------------------

  else if (padNumber === 6) {

    createNoise(
      ctx,
      now,
      0.2,
      0.28
    );


    createOscillator(
      ctx,
      "triangle",
      180,
      now,
      0.12,
      0.12
    );

  }


  // ----------------------------------------------------------
  // PAD 7 : HIHAT
  // ----------------------------------------------------------

  else if (padNumber === 7) {

    createNoise(
      ctx,
      now,
      0.08,
      0.22
    );

  }


  // ----------------------------------------------------------
  // PAD 8 : VOCAL
  // ----------------------------------------------------------

  else if (padNumber === 8) {

    createOscillator(
      ctx,
      "sine",
      520,
      now,
      0.15,
      0.15
    );


    createOscillator(
      ctx,
      "sine",
      650,
      now + 0.12,
      0.18,
      0.14
    );

  }


  flashSampler(
    padNumber
  );


  console.log(
    `🔊 SAMPLER PAD ${padNumber}`
  );

}


// ============================================================
// SAMPLER SOURIS / TACTILE
// ============================================================

samplerButtons.forEach(
  (button, index) => {

    button.addEventListener(
      "pointerdown",
      async event => {

        event.preventDefault();


        const padNumber =
          index + 1;


        await playSampler(
          padNumber
        );

      }
    );

  }
);


// ============================================================
// MIDI
// ============================================================

let midiAccess =
  null;


// ============================================================
// MAPPING SAMPLER MIDI
// ============================================================

// Pour l'instant:
//
// CANAL 5
// NOTE 49
//
// = SAMPLER PAD 1
//
// On pourra ajouter les autres boutons
// lorsque tu me donneras leurs notes MIDI.

const samplerMidiMap = {

  "5:49": 1

};


// ============================================================
// MESSAGE MIDI
// ============================================================

function midiMessage(event) {

  const data =
    event.data;


  if (
    !data ||
    data.length < 3
  ) {

    return;

  }


  const status =
    data[0];


  const command =
    status & 0xF0;


  const channel =
    (status & 0x0F) + 1;


  const note =
    data[1];


  const velocity =
    data[2];


  const pressed =
    command === 0x90 &&
    velocity > 0;


  const released =
    command === 0x80 ||
    (
      command === 0x90 &&
      velocity === 0
    );


  console.log(
    "🎧 MIDI",
    {
      status,
      type:
        "0x" +
        command.toString(16),
      channel,
      note,
      velocity,
      pressed
    }
  );


  if (
    !pressed &&
    !released
  ) {

    return;

  }


  // ==========================================================
  // PLAY DECK A
  // CANAL 1 / NOTE 0
  // ==========================================================

  if (
    channel === 1 &&
    note === 0 &&
    pressed
  ) {

    console.log(
      "▶ NUMARK PLAY A"
    );


    togglePlay(
      "A"
    );


    return;

  }


  // ==========================================================
  // PLAY DECK B
  // CANAL 2 / NOTE 0
  // ==========================================================

  if (
    channel === 2 &&
    note === 0 &&
    pressed
  ) {

    console.log(
      "▶ NUMARK PLAY B"
    );


    togglePlay(
      "B"
    );


    return;

  }


  // ==========================================================
  // CUE A
  // CANAL 5 / NOTES 1-4
  // ==========================================================

  if (
    channel === 5 &&
    note >= 1 &&
    note <= 4 &&
    pressed
  ) {

    const cueNumber =
      note;


    console.log(
      `🎯 NUMARK CUE A${cueNumber}`
    );


    const index =
      cueNumber - 1;


    if (
      cuePoints.A[index] ===
      null
    ) {

      setCue(
        "A",
        cueNumber
      );

    } else {

      goToCue(
        "A",
        cueNumber
      );

    }


    flashCue(
      "A",
      cueNumber
    );


    return;

  }


  // ==========================================================
  // CUE B
  // CANAL 6 / NOTES 1-4
  // ==========================================================

  if (
    channel === 6 &&
    note >= 1 &&
    note <= 4 &&
    pressed
  ) {

    const cueNumber =
      note;


    console.log(
      `🎯 NUMARK CUE B${cueNumber}`
    );


    const index =
      cueNumber - 1;


    if (
      cuePoints.B[index] ===
      null
    ) {

      setCue(
        "B",
        cueNumber
      );

    } else {

      goToCue(
        "B",
        cueNumber
      );

    }


    flashCue(
      "B",
      cueNumber
    );


    return;

  }


  // ==========================================================
  // SAMPLER
  // CANAL 5 / NOTE 49
  // ==========================================================

  const samplerKey =
    `${channel}:${note}`;


  if (
    samplerMidiMap[
      samplerKey
    ] !== undefined &&
    pressed
  ) {

    const padNumber =
      samplerMidiMap[
        samplerKey
      ];


    console.log(
      `🔊 NUMARK SAMPLER → PAD ${padNumber}`
    );


    playSampler(
      padNumber
    );


    return;

  }


  // ==========================================================
  // NOTE NON MAPPÉE
  // ==========================================================

  console.log(
    "🎹 NOTE NON MAPPÉE",
    {
      channel,
      note,
      velocity,
      pressed
    }
  );

}


// ============================================================
// CONNEXION MIDI
// ============================================================

async function connectMIDI() {

  if (
    !navigator.requestMIDIAccess
  ) {

    alert(
      "Le MIDI Web n'est pas disponible dans ce navigateur."
    );

    return;

  }


  try {

    midiAccess =
      await navigator.requestMIDIAccess();


    const inputs =
      [
        ...midiAccess.inputs.values()
      ];


    if (
      inputs.length === 0
    ) {

      alert(
        "Aucun contrôleur MIDI détecté."
      );

      return;

    }


    let numarkFound =
      false;


    inputs.forEach(
      input => {

        console.log(
          "🎧 MIDI connecté :",
          input.name
        );


        if (
          input.name &&
          input.name
            .toLowerCase()
            .includes("numark")
        ) {

          numarkFound =
            true;


          console.log(
            "🎛️ Numark DJ2GO2 détectée :",
            input.name
          );

        }


        input.onmidimessage =
          midiMessage;

      }
    );


    if (numarkFound) {

      alert(
        "🎛️ Numark DJ2GO2 connectée !"
      );

    } else {

      alert(
        "🎹 Contrôleur MIDI connecté."
      );

    }


    midiAccess.onstatechange =
      event => {

        console.log(
          "🔌 MIDI :",
          event.port.name,
          event.port.state
        );


        // Si la planche est reconnectée,
        // on remet automatiquement le listener.
        if (
          event.port.type ===
          "input" &&
          event.port.state ===
          "connected"
        ) {

          event.port.onmidimessage =
            midiMessage;

        }

      };


  } catch (error) {

    console.error(
      "Erreur MIDI :",
      error
    );


    alert(
      "Impossible d'accéder au contrôleur MIDI."
    );

  }

}


// ============================================================
// BOUTON MIDI
// ============================================================

if ($("#midiBtn")) {

  $("#midiBtn")
    .addEventListener(
      "click",
      connectMIDI
    );

}


// ============================================================
// HORLOGE
// ============================================================

function updateClock() {

  const clock =
    $("#clock");


  if (!clock) return;


  clock.textContent =
    new Date()
      .toLocaleTimeString(
        "fr-CA",
        {
          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      );

}


setInterval(
  updateClock,
  1000
);


updateClock();


// ============================================================
// LOG FINAL
// ============================================================

console.log(
  "🎧 BlueMix DJ chargé"
);

console.log(
  "🎛️ MIDI prêt"
);

console.log(
  "🔊 Sampler prêt"
);

console.log(
  "🎹 Sampler MIDI : canal 5 / note 49 → PAD 1"
);
