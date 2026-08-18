// ============================================================
// BLUEMIX DJ - APP.JS
// ============================================================


// ============================================================
// OUTIL
// ============================================================

const $ = selector => document.querySelector(selector);


// ============================================================
// AUDIO
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
    play: $("#playA"),
    cue: $("#cueA"),
    pitch: $("#pitchA"),
    cuePosition: 0
  },

  B: {
    audio: audioB,
    title: $("#titleB"),
    artist: $("#artistB"),
    wave: $("#waveB"),
    play: $("#playB"),
    cue: $("#cueB"),
    pitch: $("#pitchB"),
    cuePosition: 0
  }

};


// ============================================================
// CHARGEMENT DES MUSIQUES
// ============================================================

function setupDeck(id, fileInput) {

  const input = $(fileInput);

  if (!input) return;


  input.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    const deck = state[id];

    deck.audio.src =
      URL.createObjectURL(file);

    deck.title.textContent =
      file.name.replace(/\.[^/.]+$/, "");

    deck.artist.textContent =
      "Fichier local";

    deck.cuePosition = 0;

    deck.audio.load();

    drawWave(
      deck.wave,
      id
    );

  });


  // PLAY / PAUSE

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
// PLAY / PAUSE
// ============================================================

function togglePlay(id) {

  const deck = state[id];

  if (!deck.audio.src) {

    console.log(
      "Aucun morceau chargé sur le Deck " + id
    );

    return;

  }


  if (deck.audio.paused) {

    deck.audio.play()
      .then(() => {

        deck.play.textContent = "❚❚";

      })
      .catch(error => {

        console.error(
          "Erreur lecture Deck " + id,
          error
        );

      });

  } else {

    deck.audio.pause();

    deck.play.textContent = "▶";

  }

}


// ============================================================
// CUE
// ============================================================

function triggerCue(id) {

  const deck = state[id];

  if (!deck.audio.src) {

    console.log(
      "Aucun morceau chargé sur le Deck " + id
    );

    return;

  }

  deck.audio.currentTime =
    deck.cuePosition || 0;

  deck.audio.pause();

  deck.play.textContent = "▶";

}


// ============================================================
// BOUTONS CUE
// ============================================================

if ($("#cueA")) {

  $("#cueA").addEventListener(
    "click",
    () => {

      triggerCue("A");

    }
  );

}


if ($("#cueB")) {

  $("#cueB").addEventListener(
    "click",
    () => {

      triggerCue("B");

    }
  );

}


// ============================================================
// INITIALISATION
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
// FIN DES MORCEAUX
// ============================================================

audioA.addEventListener(
  "ended",
  () => {

    if ($("#playA")) {
      $("#playA").textContent = "▶";
    }

  }
);


audioB.addEventListener(
  "ended",
  () => {

    if ($("#playB")) {
      $("#playB").textContent = "▶";
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

  const ratio =
    window.devicePixelRatio || 1;

  const width =
    canvas.clientWidth * ratio;

  const height =
    canvas.clientHeight * ratio;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  ctx.strokeStyle =
    id === "A"
      ? "#1598ff"
      : "#ff3e4d";

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

      ctx.moveTo(x, y);

    } else {

      ctx.lineTo(x, y);

    }

  }

  ctx.stroke();

}


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

  const crossElement =
    $("#crossfader");

  const volAElement =
    $("#volA");

  const volBElement =
    $("#volB");

  if (
    !crossElement ||
    !volAElement ||
    !volBElement
  ) {
    return;
  }


  const cross =
    Number(
      crossElement.value
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
      volAElement.value
    );


  audioB.volume =
    volumeB *
    Number(
      volBElement.value
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

function setupJog(id, audio) {

  const jog = $(id);

  if (!jog) return;

  let touching = false;

  let lastX = 0;


  jog.addEventListener(
    "pointerdown",
    event => {

      touching = true;

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

      touching = false;

    }
  );


  jog.addEventListener(
    "pointercancel",
    () => {

      touching = false;

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


      if (audio.paused) return;


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
// MIDI
// ============================================================

let midiAccess = null;

let midiInputs = [];


// ============================================================
// DJ2GO2
//
// MESSAGE QUE TU AS DONNÉ :
//
// status  : 128
// type    : 0x80
// channel : 1
// data1   : 0
// data2   : 0
//
// Donc :
//
// NOTE OFF
// CHANNEL 1
// NOTE 0
//
// ============================================================

const DJ2GO2 = {

  playA: {
    channel: 1,
    note: 0
  }

};


// ============================================================
// CONNECTER MIDI
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
      "===================================="
    );

    console.log(
      "🎧 BLUEMIX DJ - MIDI"
    );

    console.log(
      "Entrées MIDI :",
      midiInputs.length
    );


    if (
      midiInputs.length === 0
    ) {

      console.log(
        "❌ Aucun périphérique MIDI"
      );

      showMIDIStatus(
        "❌ AUCUN MIDI",
        "#ff4050"
      );

      return;

    }


    midiInputs.forEach(
      input => {

        console.log(
          "🎧 MIDI INPUT :",
          input.name,
          input.manufacturer || ""
        );


        // IMPORTANT :
        // on branche directement
        // notre fonction de réception

        input.onmidimessage =
          handleMIDIMessage;

      }
    );


    console.log(
      "===================================="
    );


    // Recherche DJ2GO2

    const dj2go2 =
      midiInputs.find(
        input => {

          const name =
            (
              input.name ||
              ""
            ).toLowerCase();

          return (
            name.includes("dj2go") ||
            name.includes("numark")
          );

        }
      );


    if (dj2go2) {

      console.log(
        "🎧 NUMARK DJ2GO2 CONNECTÉE :",
        dj2go2.name
      );


      showMIDIStatus(
        "🎧 NUMARK DJ2GO2 CONNECTÉE",
        "#1598ff"
      );

    } else {

      showMIDIStatus(
        "🎧 MIDI CONNECTÉ",
        "#1598ff"
      );

    }


    // Détection connexion /
    // déconnexion

    midiAccess.onstatechange =
      event => {

        console.log(
          "MIDI STATE :",
          event.port.name,
          event.port.state
        );


        if (
          event.port.type === "input" &&
          event.port.state === "connected"
        ) {

          event.port.onmidimessage =
            handleMIDIMessage;

        }

      };


  } catch (error) {

    console.error(
      "❌ Erreur MIDI :",
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

function handleMIDIMessage(event) {

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


  // MIDI channel interne = 0 à 15
  // On ajoute 1 pour afficher 1 à 16.

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


  // ==========================================================
  // NOTE ON
  // ==========================================================

  if (
    type === 0x90
  ) {

    if (
      data2 > 0
    ) {

      handleMIDINote(
        channel,
        data1,
        data2,
        true
      );

    } else {

      handleMIDINote(
        channel,
        data1,
        data2,
        false
      );

    }

    return;

  }


  // ==========================================================
  // NOTE OFF
  // ==========================================================

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


  // ==========================================================
  // CONTROL CHANGE
  // ==========================================================

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


  // ==========================================================
  // PITCH BEND
  // ==========================================================

  if (
    type === 0xE0
  ) {

    const value =
      data1 |
      (data2 << 7);


    handleMIDIPitch(
      channel,
      value
    );

    return;

  }

}


// ============================================================
// NOTES MIDI
// ============================================================

function handleMIDINote(
  channel,
  note,
  velocity,
  pressed
) {

  console.log(
    "🎹 NOTE MIDI",
    {
      channel: channel,
      note: note,
      velocity: velocity,
      pressed: pressed
    }
  );


  // ==========================================================
  // PLAY A DJ2GO2
  // ==========================================================
  //
  // On utilise le NOTE OFF que tu as réellement capturé.
  //
  // channel = 1
  // note = 0
  //
  // ==========================================================

  if (
    channel === DJ2GO2.playA.channel &&
    note === DJ2GO2.playA.note &&
    pressed === false
  ) {

    console.log(
      "🔥 DJ2GO2 → PLAY A"
    );


    const playButton =
      $("#playA");


    if (!playButton) {

      console.error(
        "❌ Le bouton #playA n'existe pas"
      );

      return;

    }


    console.log(
      "✅ Bouton #playA trouvé"
    );


    // IMPORTANT :
    // on utilise le vrai clic du site.

    playButton.click();


    // Animation

    playButton.animate(
      [
        {
          transform: "scale(1)",
          filter: "brightness(1)"
        },

        {
          transform: "scale(.85)",
          filter: "brightness(2)"
        },

        {
          transform: "scale(1)",
          filter: "brightness(1)"
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
  // AUTRE NOTE
  // ==========================================================

  console.log(
    "🎹 NOTE NON MAPPÉE",
    {
      channel: channel,
      note: note,
      velocity: velocity,
      pressed: pressed
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
      channel: channel,
      controller: controller,
      value: value
    }
  );


  // Pour le moment :
  // on affiche les vrais messages.
  //
  // On ne met PAS de faux numéros.
  //
  // Cela permettra de mapper précisément :
  // - crossfader
  // - volume
  // - pitch
  // - boutons
  // - jog


  showMIDIStatus(
    "🎛️ CC " +
    controller +
    " : " +
    value
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
      channel: channel,
      value: value
    }
  );


  showMIDIStatus(
    "🎚️ PITCH"
  );

}


// ============================================================
// MESSAGE MIDI À L'ÉCRAN
// ============================================================

let midiStatusTimer = null;


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
      "1px solid " + color;

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
  .querySelectorAll(".cuePad")
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          button.animate(
            [
              {
                transform: "scale(1)"
              },

              {
                transform: "scale(.9)"
              },

              {
                transform: "scale(1)"
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

  if (!$("#clock")) return;


  $("#clock").textContent =
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
// DÉMARRAGE
// ============================================================

console.log(
  "======================================"
);

console.log(
  "🎧 BLUEMIX DJ"
);

console.log(
  "✅ JavaScript chargé"
);

console.log(
  "🎧 MIDI prêt"
);

console.log(
  "🎧 DJ2GO2 PLAY A = CH1 / NOTE 0"
);

console.log(
  "======================================"
);
