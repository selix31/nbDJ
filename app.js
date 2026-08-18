// ============================================================
// BLUEMIX DJ - APP.JS
// Waveform réelle + Playhead + MIDI Numark DJ2GO2
// ============================================================

const $ = selector => document.querySelector(selector);


// ============================================================
// AUDIO
// ============================================================

const audioA = $("#audioA");
const audioB = $("#audioB");


// ============================================================
// WEB AUDIO
// Utilisé uniquement pour analyser les fichiers
// ============================================================

let waveformAudioContext = null;

function getAudioContext() {

  if (!waveformAudioContext) {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return null;
    }

    waveformAudioContext =
      new AudioContext();

  }

  return waveformAudioContext;

}


// ============================================================
// ÉTAT DES DECKS
// ============================================================

const state = {

  A: {
    audio: audioA,
    title: $("#titleA"),
    artist: $("#artistA"),
    wave: $("#waveA"),
    play: $("#playA"),
    cue: $("#cueA"),
    cuePosition: 0,
    waveform: null,
    duration: 0,
    color: "#1598ff",
    glow: "#42b5ff"
  },

  B: {
    audio: audioB,
    title: $("#titleB"),
    artist: $("#artistB"),
    wave: $("#waveB"),
    play: $("#playB"),
    cue: $("#cueB"),
    cuePosition: 0,
    waveform: null,
    duration: 0,
    color: "#ff3e4d",
    glow: "#ff6b76"
  }

};


// ============================================================
// CHARGEMENT DU FICHIER AUDIO
// ============================================================

function setupDeck(id, fileSelector) {

  const input =
    $(fileSelector);

  if (!input) return;


  input.addEventListener(
    "change",
    async event => {

      const file =
        event.target.files[0];

      if (!file) return;


      const deck =
        state[id];


      // --------------------------------------------------------
      // Ancien Object URL
      // --------------------------------------------------------

      if (deck.objectURL) {

        URL.revokeObjectURL(
          deck.objectURL
        );

      }


      // --------------------------------------------------------
      // Nouveau fichier
      // --------------------------------------------------------

      deck.objectURL =
        URL.createObjectURL(file);


      deck.audio.src =
        deck.objectURL;

      deck.audio.load();


      deck.title.textContent =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        );

      deck.artist.textContent =
        "Analyse de la waveform...";


      deck.waveform =
        null;

      deck.duration =
        0;

      deck.cuePosition =
        0;


      // --------------------------------------------------------
      // Waveform réelle
      // --------------------------------------------------------

      try {

        await createRealWaveform(
          deck,
          file
        );

        deck.artist.textContent =
          "Fichier local";

        console.log(
          "🎵 Waveform créée pour Deck " +
          id
        );

      } catch (error) {

        console.error(
          "❌ Erreur waveform",
          error
        );

        deck.artist.textContent =
          "Fichier local";

        drawFallbackWave(
          deck.wave,
          id
        );

      }


      drawDeckWaveform(
        deck
      );

    }
  );


  // ==========================================================
  // PLAY / PAUSE SOURIS
  // ==========================================================

  if (state[id].play) {

    state[id].play.addEventListener(
      "click",
      () => {

        togglePlay(id);

      }
    );

  }

}


// ============================================================
// CRÉATION DE LA VRAIE WAVEFORM
// ============================================================

async function createRealWaveform(
  deck,
  file
) {

  const context =
    getAudioContext();

  if (!context) {

    throw new Error(
      "Web Audio API non disponible"
    );

  }


  const arrayBuffer =
    await file.arrayBuffer();


  const audioBuffer =
    await context.decodeAudioData(
      arrayBuffer
    );


  deck.duration =
    audioBuffer.duration;


  // Nombre de points de waveform.
  // Plus grand = plus détaillé.
  const points =
    1600;


  const data =
    new Float32Array(points);


  const channels =
    audioBuffer.numberOfChannels;


  const length =
    audioBuffer.length;


  // ----------------------------------------------------------
  // Analyse du son
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < points;
    i++
  ) {

    const start =
      Math.floor(
        i * length / points
      );

    const end =
      Math.floor(
        (i + 1) * length / points
      );


    let maximum =
      0;


    for (
      let sample = start;
      sample < end;
      sample++
    ) {

      let value =
        0;


      // Moyenne des canaux gauche/droit
      for (
        let channel = 0;
        channel < channels;
        channel++
      ) {

        value += Math.abs(
          audioBuffer
            .getChannelData(channel)
            [sample]
        );

      }


      value /=
        channels;


      if (
        value > maximum
      ) {

        maximum =
          value;

      }

    }


    // Petite amplification visuelle
    data[i] =
      Math.min(
        1,
        maximum * 1.8
      );

  }


  deck.waveform =
    data;

}


// ============================================================
// WAVEFORM DE SECOURS
// ============================================================

function drawFallbackWave(
  canvas,
  id
) {

  if (!canvas) return;


  const ratio =
    window.devicePixelRatio || 1;


  const width =
    canvas.clientWidth *
    ratio;


  const height =
    canvas.clientHeight *
    ratio;


  canvas.width =
    width;

  canvas.height =
    height;


  const ctx =
    canvas.getContext("2d");


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  const color =
    id === "A"
      ? "#1598ff"
      : "#ff3e4d";


  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    2 * ratio;


  ctx.beginPath();


  for (
    let x = 0;
    x < width;
    x++
  ) {

    const y =
      height / 2 +

      Math.sin(
        x * 0.055
      ) *
      height *
      0.16 +

      Math.sin(
        x * 0.013
      ) *
      height *
      0.18;


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

}


// ============================================================
// DESSIN WAVEFORM
// ============================================================

function drawDeckWaveform(
  deck
) {

  const canvas =
    deck.wave;

  if (!canvas) return;


  const ratio =
    window.devicePixelRatio || 1;


  const width =
    canvas.clientWidth *
    ratio;


  const height =
    canvas.clientHeight *
    ratio;


  if (
    width <= 0 ||
    height <= 0
  ) {

    return;

  }


  canvas.width =
    width;

  canvas.height =
    height;


  const ctx =
    canvas.getContext("2d");


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  // ----------------------------------------------------------
  // Fond
  // ----------------------------------------------------------

  const background =
    ctx.createLinearGradient(
      0,
      0,
      0,
      height
    );


  background.addColorStop(
    0,
    "#031225"
  );

  background.addColorStop(
    0.5,
    "#061c35"
  );

  background.addColorStop(
    1,
    "#031225"
  );


  ctx.fillStyle =
    background;


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  // ----------------------------------------------------------
  // Ligne centrale
  // ----------------------------------------------------------

  ctx.strokeStyle =
    "#ffffff18";

  ctx.lineWidth =
    ratio;


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


  // ----------------------------------------------------------
  // Pas encore de waveform
  // ----------------------------------------------------------

  if (
    !deck.waveform ||
    deck.waveform.length === 0
  ) {

    drawFallbackWave(
      canvas,
      deck === state.A
        ? "A"
        : "B"
    );

    return;

  }


  const waveform =
    deck.waveform;


  const center =
    height / 2;


  const maxHeight =
    height * 0.44;


  const barWidth =
    width / waveform.length;


  // ----------------------------------------------------------
  // Waveform
  // ----------------------------------------------------------

  for (
    let i = 0;
    i < waveform.length;
    i++
  ) {

    const amplitude =
      waveform[i];


    const barHeight =
      Math.max(
        2 * ratio,
        amplitude * maxHeight
      );


    const x =
      i * barWidth;


    // --------------------------------------------------------
    // Couleur selon l'intensité
    // --------------------------------------------------------

    let color;


    if (
      amplitude > 0.75
    ) {

      color =
        "#ffffff";

    } else if (
      amplitude > 0.50
    ) {

      color =
        deck.color;

    } else if (
      amplitude > 0.25
    ) {

      color =
        deck.glow;

    } else {

      color =
        deck.color + "88";

    }


    ctx.fillStyle =
      color;


    // Partie supérieure
    ctx.fillRect(
      x,
      center - barHeight,
      Math.max(
        1,
        barWidth - ratio
      ),
      barHeight
    );


    // Partie inférieure
    ctx.fillRect(
      x,
      center,
      Math.max(
        1,
        barWidth - ratio
      ),
      barHeight
    );

  }


  // ----------------------------------------------------------
  // Progression actuelle
  // ----------------------------------------------------------

  drawPlayhead(
    deck
  );

}


// ============================================================
// PLAYHEAD
// Ligne verticale indiquant où est rendu le morceau
// ============================================================

function drawPlayhead(
  deck
) {

  const canvas =
    deck.wave;


  if (!canvas) return;


  if (
    !deck.duration ||
    deck.duration <= 0
  ) {

    return;

  }


  const ratio =
    window.devicePixelRatio || 1;


  const width =
    canvas.width;


  const height =
    canvas.height;


  const progress =
    Math.max(
      0,
      Math.min(
        1,
        deck.audio.currentTime /
        deck.duration
      )
    );


  const x =
    progress * width;


  const ctx =
    canvas.getContext("2d");


  // ----------------------------------------------------------
  // Zone déjà jouée
  // ----------------------------------------------------------

  ctx.save();


  ctx.globalCompositeOperation =
    "source-atop";


  const played =
    ctx.createLinearGradient(
      0,
      0,
      width,
      0
    );


  played.addColorStop(
    0,
    deck.color + "55"
  );

  played.addColorStop(
    Math.max(
      0.001,
      progress
    ),
    deck.color + "cc"
  );

  played.addColorStop(
    Math.min(
      1,
      progress + 0.001
    ),
    deck.color + "22"
  );


  ctx.fillStyle =
    played;


  ctx.fillRect(
    0,
    0,
    x,
    height
  );


  ctx.restore();


  // ----------------------------------------------------------
  // Ligne PLAYHEAD
  // ----------------------------------------------------------

  ctx.save();


  ctx.shadowColor =
    deck.color;


  ctx.shadowBlur =
    10 * ratio;


  ctx.strokeStyle =
    "#ffffff";


  ctx.lineWidth =
    2 * ratio;


  ctx.beginPath();


  ctx.moveTo(
    x,
    0
  );

  ctx.lineTo(
    x,
    height
  );


  ctx.stroke();


  ctx.restore();


  // ----------------------------------------------------------
  // Petit triangle en haut
  // ----------------------------------------------------------

  ctx.fillStyle =
    deck.color;


  ctx.beginPath();


  ctx.moveTo(
    x - 6 * ratio,
    0
  );

  ctx.lineTo(
    x + 6 * ratio,
    0
  );

  ctx.lineTo(
    x,
    8 * ratio
  );


  ctx.closePath();

  ctx.fill();

}


// ============================================================
// ANIMATION DES WAVEFORMS
// ============================================================

function animateWaveforms() {

  drawDeckWaveform(
    state.A
  );

  drawDeckWaveform(
    state.B
  );


  requestAnimationFrame(
    animateWaveforms
  );

}


requestAnimationFrame(
  animateWaveforms
);


// ============================================================
// PLAY / PAUSE
// ============================================================

function togglePlay(id) {

  const deck =
    state[id];


  if (!deck.audio.src) {

    console.log(
      "⚠️ Aucun morceau chargé sur Deck " +
      id
    );


    showMIDIStatus(
      "⚠️ Charge un morceau sur Deck " +
      id,
      "#ff4050"
    );


    return;

  }


  // ----------------------------------------------------------
  // PAUSE
  // ----------------------------------------------------------

  if (
    !deck.audio.paused
  ) {

    deck.audio.pause();

    deck.play.textContent =
      "▶";


    console.log(
      "⏸ PAUSE Deck " +
      id
    );


    return;

  }


  // ----------------------------------------------------------
  // PLAY
  // ----------------------------------------------------------

  console.log(
    "▶ PLAY Deck " +
    id
  );


  const promise =
    deck.audio.play();


  if (
    promise &&
    typeof promise.then ===
    "function"
  ) {

    promise
      .then(
        () => {

          deck.play.textContent =
            "❚❚";


          console.log(
            "🔊 AUDIO Deck " +
            id +
            " EN LECTURE"
          );

        }
      )
      .catch(
        error => {

          deck.play.textContent =
            "▶";


          console.error(
            "❌ Erreur audio Deck " +
            id,
            error
          );


          if (
            error.name ===
            "NotAllowedError"
          ) {

            showMIDIStatus(
              "👆 Clique d'abord sur ▶ avec la souris",
              "#ff4050"
            );

          }

        }
      );

  }

}


// ============================================================
// FIN DES MORCEAUX
// ============================================================

audioA.addEventListener(
  "ended",
  () => {

    $("#playA").textContent =
      "▶";

    drawDeckWaveform(
      state.A
    );

  }
);


audioB.addEventListener(
  "ended",
  () => {

    $("#playB").textContent =
      "▶";

    drawDeckWaveform(
      state.B
    );

  }
);


// ============================================================
// INITIALISATION DES DECKS
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
// CROSSFADER
// ============================================================

function updateMix() {

  const cross =
    $("#crossfader");

  const volA =
    $("#volA");

  const volB =
    $("#volB");


  if (
    !cross ||
    !volA ||
    !volB
  ) {

    return;

  }


  const value =
    Number(
      cross.value
    );


  const volumeA =
    Math.max(
      0,
      Math.min(
        1,
        (1 - value) / 2
      )
    );


  const volumeB =
    Math.max(
      0,
      Math.min(
        1,
        (1 + value) / 2
      )
    );


  audioA.volume =
    volumeA *
    Number(
      volA.value
    );


  audioB.volume =
    volumeB *
    Number(
      volB.value
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
// PITCH A
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


// ============================================================
// PITCH B
// ============================================================

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
// JOG WHEELS SOURIS
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
        audio.paused
      ) {

        return;

      }


      audio.currentTime =
        Math.max(
          0,
          audio.currentTime +
          movement * 0.02
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
// CUE
// ============================================================

function triggerCue(id) {

  const deck =
    state[id];


  if (
    !deck.audio.src
  ) {

    return;

  }


  deck.audio.currentTime =
    deck.cuePosition || 0;


  deck.audio.pause();


  deck.play.textContent =
    "▶";


  console.log(
    "🎯 CUE Deck " +
    id
  );

}


if ($("#cueA")) {

  $("#cueA")
    .addEventListener(
      "click",
      () => {

        triggerCue("A");

      }
    );

}


if ($("#cueB")) {

  $("#cueB")
    .addEventListener(
      "click",
      () => {

        triggerCue("B");

      }
    );

}


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
          .toggle(
            "active"
          );

      }
    );

}


// ============================================================
// MIDI
// ============================================================

let midiAccess =
  null;

let midiInputs =
  [];

let midiConnected =
  false;


const DJ2GO2 = {

  // PLAY GAUCHE
  PLAY_A_CHANNEL: 1,
  PLAY_A_NOTE: 0,

  // PLAY DROITE
  PLAY_B_CHANNEL: 2,
  PLAY_B_NOTE: 0

};


let lastDJMessage =
  0;


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


    midiInputs =
      Array.from(
        midiAccess.inputs.values()
      );


    console.log(
      "================================"
    );


    console.log(
      "🎧 BLUEMIX DJ MIDI"
    );


    console.log(
      "Entrées MIDI :",
      midiInputs.length
    );


    if (
      midiInputs.length === 0
    ) {

      console.log(
        "❌ Aucun contrôleur MIDI"
      );


      showMIDIStatus(
        "❌ Aucun MIDI détecté",
        "#ff4050"
      );


      return;

    }


    midiInputs.forEach(
      input => {

        console.log(
          "🎧 MIDI connecté :",
          input.name
        );


        input.onmidimessage =
          handleMIDIMessage;

      }
    );


    const dj2go2 =
      midiInputs.find(
        input => {

          const name =
            (
              input.name ||
              ""
            ).toLowerCase();


          return (
            name.includes(
              "dj2go"
            ) ||
            name.includes(
              "numark"
            )
          );

        }
      );


    midiConnected =
      true;


    if (dj2go2) {

      console.log(
        "🎧 NUMARK DJ2GO2 TROUVÉE :",
        dj2go2.name
      );


      showMIDIStatus(
        "🎧 NUMARK DJ2GO2 CONNECTÉE",
        "#1598ff"
      );

    } else {

      showMIDIStatus(
        "🎧 CONTRÔLEUR MIDI CONNECTÉ",
        "#1598ff"
      );

    }


    midiAccess.onstatechange =
      event => {

        console.log(
          "MIDI STATE",
          event.port.name,
          event.port.state
        );


        if (
          event.port.type ===
          "input"
        ) {

          if (
            event.port.state ===
            "connected"
          ) {

            event.port.onmidimessage =
              handleMIDIMessage;

          }

        }

      };


  } catch (error) {

    console.error(
      "❌ Erreur MIDI",
      error
    );


    alert(
      "Impossible d'ouvrir le MIDI.\n\n" +
      error.message
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
// RÉCEPTION MIDI
// ============================================================

function handleMIDIMessage(
  event
) {

  const data =
    Array.from(
      event.data
    );


  if (
    data.length < 2
  ) {

    return;

  }


  const status =
    data[0];


  const data1 =
    data[1];


  const data2 =
    data[2] || 0;


  const type =
    status & 0xF0;


  const channel =
    (status & 0x0F) + 1;


  console.log(
    "🎧 MIDI",
    {
      status: status,
      type:
        "0x" +
        type.toString(16),
      channel: channel,
      data1: data1,
      data2: data2
    }
  );


  // ----------------------------------------------------------
  // NOTE ON
  // ----------------------------------------------------------

  if (
    type === 0x90
  ) {

    const pressed =
      data2 > 0;


    handleMIDINote(
      channel,
      data1,
      data2,
      pressed
    );


    return;

  }


  // ----------------------------------------------------------
  // NOTE OFF
  // ----------------------------------------------------------

  if (
    type === 0x80
  ) {

    handleMIDINote(
      channel,
      data1,
      data2,
      false
    );


    return;

  }


  // ----------------------------------------------------------
  // CONTROL CHANGE
  // ----------------------------------------------------------

  if (
    type === 0xB0
  ) {

    handleMIDICC(
      channel,
      data1,
      data2
    );


    return;

  }


  // ----------------------------------------------------------
  // PITCH BEND
  // ----------------------------------------------------------

  if (
    type === 0xE0
  ) {

    const value =
      data1 +
      (data2 << 7);


    handleMIDIPitch(
      channel,
      value
    );


    return;

  }

}


// ============================================================
// MIDI NOTES
// ============================================================

function handleMIDINote(
  channel,
  note,
  velocity,
  pressed
) {

  console.log(
    "🎹 NOTE",
    {
      channel,
      note,
      velocity,
      pressed
    }
  );


  // ==========================================================
  // PLAY A
  // ==========================================================

  if (
    channel ===
      DJ2GO2.PLAY_A_CHANNEL &&

    note ===
      DJ2GO2.PLAY_A_NOTE &&

    pressed === false
  ) {

    const now =
      Date.now();


    if (
      now - lastDJMessage <
      100
    ) {

      return;

    }


    lastDJMessage =
      now;


    console.log(
      "🔥 DJ2GO2 → PLAY A"
    );


    const button =
      $("#playA");


    if (!button) {

      console.error(
        "❌ #playA introuvable"
      );


      return;

    }


    button.click();


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
            "scale(.85)",
          filter:
            "brightness(2)"
        },

        {
          transform:
            "scale(1)",
          filter:
            "brightness(1)"
        }

      ],
      {
        duration: 200
      }
    );


    showMIDIStatus(
      "▶ DJ2GO2 → PLAY A",
      "#1598ff"
    );


    return;

  }


  // ==========================================================
  // PLAY B
  // ==========================================================

  if (
    channel ===
      DJ2GO2.PLAY_B_CHANNEL &&

    note ===
      DJ2GO2.PLAY_B_NOTE &&

    pressed === false
  ) {

    const now =
      Date.now();


    if (
      now - lastDJMessage <
      100
    ) {

      return;

    }


    lastDJMessage =
      now;


    console.log(
      "🔥 DJ2GO2 → PLAY B"
    );


    const button =
      $("#playB");


    if (!button) {

      console.error(
        "❌ #playB introuvable"
      );


      return;

    }


    button.click();


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
            "scale(.85)",
          filter:
            "brightness(2)"
        },

        {
          transform:
            "scale(1)",
          filter:
            "brightness(1)"
        }

      ],
      {
        duration: 200
      }
    );


    showMIDIStatus(
      "▶ DJ2GO2 → PLAY B",
      "#ff4050"
    );


    return;

  }


  // ==========================================================
  // AUTRES NOTES
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
// MIDI CC
// ============================================================

function handleMIDICC(
  channel,
  controller,
  value
) {

  console.log(
    "🎛️ MIDI CC",
    {
      channel,
      controller,
      value
    }
  );


  showMIDIStatus(
    "🎛️ MIDI CC " +
    controller +
    " = " +
    value,
    "#1598ff"
  );

}


// ============================================================
// MIDI PITCH
// ============================================================

function handleMIDIPitch(
  channel,
  value
) {

  console.log(
    "🎚️ MIDI PITCH",
    {
      channel,
      value
    }
  );

}


// ============================================================
// MESSAGE MIDI À L'ÉCRAN
// ============================================================

let midiStatusTimer =
  null;


function showMIDIStatus(
  message,
  color = "#1598ff"
) {

  let status =
    $("#midiStatus");


  if (!status) {

    status =
      document.createElement(
        "div"
      );


    status.id =
      "midiStatus";


    status.style.position =
      "fixed";


    status.style.top =
      "82px";


    status.style.right =
      "15px";


    status.style.zIndex =
      "99999";


    status.style.padding =
      "10px 15px";


    status.style.background =
      "#06162e";


    status.style.border =
      "1px solid " +
      color;


    status.style.borderRadius =
      "7px";


    status.style.color =
      "#dcecff";


    status.style.fontFamily =
      "Arial,sans-serif";


    status.style.fontSize =
      "13px";


    status.style.boxShadow =
      "0 5px 20px #0008";


    document.body.appendChild(
      status
    );

  }


  status.style.borderColor =
    color;


  status.textContent =
    message;


  status.style.display =
    "block";


  clearTimeout(
    midiStatusTimer
  );


  midiStatusTimer =
    setTimeout(
      () => {

        status.style.display =
          "none";

      },
      1800
    );

}


// ============================================================
// HOT CUES
// ============================================================

document
  .querySelectorAll(
    ".cuePad"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          button.animate(
            [
              {
                transform:
                  "scale(1)"
              },

              {
                transform:
                  "scale(.9)"
              },

              {
                transform:
                  "scale(1)"
              }
            ],
            {
              duration: 150
            }
          );

        }
      );

    }
  );


// ============================================================
// HORLOGE
// ============================================================

function updateClock() {

  const clock =
    $("#clock");


  if (!clock) return;


  clock.textContent =
    new Date().toLocaleTimeString(
      "fr-CA",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

}


setInterval(
  updateClock,
  1000
);


updateClock();


// ============================================================
// REDESSIN APRÈS REDIMENSIONNEMENT
// ============================================================

window.addEventListener(
  "resize",
  () => {

    drawDeckWaveform(
      state.A
    );

    drawDeckWaveform(
      state.B
    );

  }
);


// ============================================================
// DÉMARRAGE
// ============================================================

console.log(
  "======================================"
);

console.log(
  "🎧 BLUEMIX DJ"
);

console.log(
  "✅ APP.JS CHARGÉ"
);

console.log(
  "🎵 WAVEFORM RÉELLE ACTIVÉE"
);

console.log(
  "🎧 MIDI PRÊT"
);

console.log(
  "🎧 NUMARK DJ2GO2"
);

console.log(
  "🎧 PLAY A = CHANNEL 1 / NOTE 0"
);

console.log(
  "🎧 PLAY B = CHANNEL 2 / NOTE 0"
);

console.log(
  "======================================"
);
