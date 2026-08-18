// ============================================================
// BLUEMIX DJ
// app.js COMPLET
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
    jog: $("#jogA"),
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
    jog: $("#jogB"),
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
    Math.max(
      0,
      deck.cuePosition
    );


  deck.play.textContent = "▶";

}


// ============================================================
// BOUTONS CUE TACTILES
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
// FIN DES MORCEAUX
// ============================================================

audioA.addEventListener(
  "ended",
  () => {

    $("#playA").textContent = "▶";

  }
);


audioB.addEventListener(
  "ended",
  () => {

    $("#playB").textContent = "▶";

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


$("#crossfader")
  .addEventListener(
    "input",
    updateMix
  );


$("#volA")
  .addEventListener(
    "input",
    updateMix
  );


$("#volB")
  .addEventListener(
    "input",
    updateMix
  );


updateMix();


// ============================================================
// PITCH
// ============================================================

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


// ============================================================
// JOG WHEELS TACTILES
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

      if (audio.paused) return;

      const movement =
        event.clientX -
        lastX;

      lastX =
        event.clientX;

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

$("#recordBtn")
  .addEventListener(
    "click",
    () => {

      $("#recordBtn")
        .classList
        .toggle("active");

    }
  );


// ============================================================
// MIDI
// ============================================================

let midiAccess = null;

let midiInputs = [];


// ============================================================
// COMMANDES DJ2GO2 CONNUES
// ============================================================
//
// IMPORTANT
//
// Nous avons maintenant une vraie information provenant
// de TA DJ2GO2 :
//
// PLAY A
// Channel 1
// Note 0
// Note Off
//
// Le code ci-dessous utilise donc cette information.
//
// Les autres boutons sont laissés en détection MIDI
// jusqu'à ce que leurs vrais messages soient connus.
//
// ============================================================


// PLAY A trouvé avec ta DJ2GO2

const DJ2GO2_PLAY_A = {

  channel: 1,

  note: 0

};


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
      [
        ...midiAccess.inputs.values()
      ];


    if (
      midiInputs.length === 0
    ) {

      alert(
        "Aucun contrôleur MIDI détecté."
      );

      return;

    }


    console.log(
      "================================"
    );

    console.log(
      "🎧 BLUEMIX MIDI CONNECTÉ"
    );

    console.log(
      "Nombre d'entrées :",
      midiInputs.length
    );


    midiInputs.forEach(
      input => {

        console.log(
          "MIDI INPUT :",
          input.name
        );


        input.onmidimessage =
          handleMIDIMessage;

      }
    );


    console.log(
      "================================"
    );


    const dj2go =
      midiInputs.find(
        input => {

          const name =
            (
              input.name ||
              ""
            ).toLowerCase();

          return (
            name.includes("dj2go2") ||
            name.includes("dj2go")
          );

        }
      );


    if (dj2go) {

      console.log(
        "🎧 Numark DJ2GO2 trouvée :",
        dj2go.name
      );

      showMIDIStatus(
        "🎧 DJ2GO2 CONNECTÉE",
        "#1598ff"
      );

    } else {

      showMIDIStatus(
        "🎧 CONTRÔLEUR MIDI CONNECTÉ",
        "#1598ff"
      );

    }


    // Détection branchement /
    // débranchement

    midiAccess.onstatechange =
      event => {

        console.log(
          "MIDI STATE",
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
      "Erreur MIDI :",
      error
    );


    alert(
      "Erreur MIDI :\n\n" +
      error.message
    );

  }

}


// ============================================================
// BOUTON MIDI
// ============================================================

$("#midiBtn")
  .addEventListener(
    "click",
    connectMIDI
  );


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

  const channel =
    (status & 0x0F) + 1;


  // ----------------------------------------------------------
  // AFFICHAGE CONSOLE
  // ----------------------------------------------------------

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
    type === 0x90 &&
    data2 > 0
  ) {

    handleMIDINote(
      channel,
      data1,
      data2,
      true
    );

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
  // NOTE ON + VELOCITY 0
  // = NOTE OFF
  // ==========================================================

  if (
    type === 0x90 &&
    data2 === 0
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
    "NOTE",
    note,
    "pressed:",
    pressed
  );


  // ==========================================================
  // PLAY A DE TA DJ2GO2
  // ==========================================================
  //
  // Tu viens de confirmer :
  //
  // status : 128
  // type   : 0x80
  // channel: 1
  // note   : 0
  // value  : 0
  //
  // C'est donc le relâchement du PLAY A.
  //
  // ==========================================================

  if (
    !pressed &&
    channel === DJ2GO2_PLAY_A.channel &&
    note === DJ2GO2_PLAY_A.note
  ) {

    console.log(
      "================================"
    );

    console.log(
      "🎧 DJ2GO2 → PLAY A"
    );

    console.log(
      "================================"
    );


    togglePlay("A");


    flashButton(
      "#playA"
    );


    showMIDIStatus(
      "▶ PLAY A",
      "#1598ff"
    );


    return;

  }


  // ==========================================================
  // AUTRES NOTES
  // ==========================================================

  if (!pressed) {

    return;

  }


  console.log(
    "🎹 NOTE MIDI NON MAPPÉE :",
    {
      channel: channel,
      note: note,
      velocity: velocity
    }
  );


  showMIDIStatus(
    "🎹 NOTE " + note
  );

}


// ============================================================
// CONTROL CHANGE
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


  // Pour le moment on affiche le CC.
  //
  // Cela nous permettra de récupérer les vrais
  // numéros du pitch, crossfader, jog, etc.
  //
  // Aucun numéro inventé.


  showMIDIStatus(
    "🎛️ CC " +
    controller +
    " : " +
    value
  );

}


// ============================================================
// PITCH BEND
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
// SYNCHRONISATION
// ============================================================

function syncDeck(id) {

  const other =
    id === "A"
      ? "B"
      : "A";


  const source =
    state[other];

  const target =
    state[id];


  if (
    !source.audio.src
  ) {

    return;

  }


  target.audio.playbackRate =
    source.audio.playbackRate;


  const percentage =
    (
      target.audio.playbackRate -
      1
    ) * 100;


  target.pitch.value =
    Math.max(
      -10,
      Math.min(
        10,
        percentage
      )
    );

}


// ============================================================
// FLASH BOUTON
// ============================================================

function flashButton(selector) {

  const button =
    $(selector);


  if (!button) return;


  button.animate(
    [
      {
        transform: "scale(1)",
        filter: "brightness(1)"
      },

      {
        transform: "scale(.9)",
        filter: "brightness(2)"
      },

      {
        transform: "scale(1)",
        filter: "brightness(1)"
      }

    ],
    {
      duration: 180
    }
  );

}


// ============================================================
// STATUT MIDI
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


  status.innerHTML =
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
  .forEach(button => {

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

  });


// ============================================================
// HORLOGE
// ============================================================

function updateClock() {

  $("#clock").textContent =
    new Date()
      .toLocaleTimeString(
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
// MESSAGE DE DÉMARRAGE
// ============================================================

console.log(
  "========================================"
);

console.log(
  "🎧 BlueMix DJ"
);

console.log(
  "Application chargée"
);

console.log(
  "Clique sur MIDI pour connecter la DJ2GO2"
);

console.log(
  "PLAY A détecté : CH1 / NOTE 0 / NOTE OFF"
);

console.log(
  "========================================"
);
