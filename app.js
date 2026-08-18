// ============================================================
// BLUEMIX DJ
// app.js COMPLET
// ============================================================


// ============================================================
// OUTILS
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

    return;

  }


  if (deck.audio.paused) {

    deck.audio.play()
      .then(() => {

        deck.play.textContent = "❚❚";

      })
      .catch(error => {

        console.error(
          "Impossible de lire le morceau :",
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

    return;

  }


  // Retour au dernier point CUE

  deck.audio.currentTime =
    Math.max(
      0,
      deck.cuePosition
    );


  // Si le morceau joue déjà,
  // on le laisse jouer.
  // Sinon on reste en pause.

  if (deck.audio.paused) {

    deck.play.textContent = "▶";

  }

}


// CUE tactile

if ($("#cueA")) {

  $("#cueA").addEventListener(
    "click",
    () => triggerCue("A")
  );

}


if ($("#cueB")) {

  $("#cueB").addEventListener(
    "click",
    () => triggerCue("B")
  );

}


// Initialisation

setupDeck(
  "A",
  "#fileA"
);

setupDeck(
  "B",
  "#fileB"
);


// ============================================================
// DÉTECTION DE FIN DE MORCEAU
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


  const width =
    canvas.width =
      canvas.clientWidth *
      window.devicePixelRatio;


  const height =
    canvas.height =
      canvas.clientHeight *
      window.devicePixelRatio;


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
    2 *
    window.devicePixelRatio;


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


    ctx.lineTo(
      x,
      y
    );

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
// NUMARK DJ2GO2 - NOTES
// ============================================================
//
// Les valeurs ci-dessous correspondent aux commandes
// de transport documentées pour la famille DJ2GO.
//
// Deck A:
// CUE       = 0x33 = 51
// PLAY      = 0x3B = 59
// SYNC      = 0x40 = 64
//
// Deck B:
// CUE       = 0x3C = 60
// PLAY      = 0x42 = 66
// SYNC      = 0x47 = 71
//
// ============================================================

const DJ2GO2 = {

  A: {

    CUE: 0x33,

    PLAY: 0x3B,

    SYNC: 0x40

  },


  B: {

    CUE: 0x3C,

    PLAY: 0x42,

    SYNC: 0x47

  }

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
      "MIDI CONNECTÉ"
    );

    console.log(
      "Nombre d'entrées :",
      midiInputs.length
    );


    // Connecter TOUS les ports MIDI

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
        "Numark DJ2GO2 trouvée :",
        dj2go.name
      );


      showMIDIStatus(
        "🎧 DJ2GO2 CONNECTÉE",
        "#1598ff"
      );

    } else {

      showMIDIStatus(
        "🎧 MIDI CONNECTÉ",
        "#1598ff"
      );

    }


    // Surveiller les branchements /
    // débranchements

    midiAccess.onstatechange =
      event => {

        console.log(
          "MIDI STATE:",
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
// MESSAGE MIDI
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


  console.log(
    "🎧 MIDI",
    {
      status: status,

      type:
        "0x" +
        type.toString(16),

      channel:
        channel,

      data1:
        data1,

      data2:
        data2
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
  // NOTE ON AVEC VELOCITY 0 = NOTE OFF
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


  }

}


// ============================================================
// NOTE MIDI
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


  // On agit seulement à l'appui.

  if (!pressed) {

    return;

  }


  // ==========================================================
  // DECK A - CUE
  // ==========================================================

  if (
    note === DJ2GO2.A.CUE
  ) {

    triggerCue("A");

    flashButton(
      "#cueA"
    );

    showMIDIStatus(
      "🎧 CUE A"
    );

    return;

  }


  // ==========================================================
  // DECK A - PLAY
  // ==========================================================

  if (
    note === DJ2GO2.A.PLAY
  ) {

    togglePlay("A");

    flashButton(
      "#playA"
    );

    showMIDIStatus(
      "▶ DECK A"
    );

    return;

  }


  // ==========================================================
  // DECK A - SYNC
  // ==========================================================

  if (
    note === DJ2GO2.A.SYNC
  ) {

    syncDeck("A");

    showMIDIStatus(
      "SYNC A"
    );

    return;

  }


  // ==========================================================
  // DECK B - CUE
  // ==========================================================

  if (
    note === DJ2GO2.B.CUE
  ) {

    triggerCue("B");

    flashButton(
      "#cueB"
    );

    showMIDIStatus(
      "🎧 CUE B"
    );

    return;

  }


  // ==========================================================
  // DECK B - PLAY
  // ==========================================================

  if (
    note === DJ2GO2.B.PLAY
  ) {

    togglePlay("B");

    flashButton(
      "#playB"
    );

    showMIDIStatus(
      "▶ DECK B"
    );

    return;

  }


  // ==========================================================
  // DECK B - SYNC
  // ==========================================================

  if (
    note === DJ2GO2.B.SYNC
  ) {

    syncDeck("B");

    showMIDIStatus(
      "SYNC B"
    );

    return;

  }


  // ==========================================================
  // AUTRES BOUTONS
  // ==========================================================

  console.log(
    "Bouton MIDI non mappé :",
    note
  );


  showMIDIStatus(
    "MIDI NOTE " +
    note
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
    "MIDI CC",
    {
      channel,
      controller,
      value
    }
  );


  // ----------------------------------------------------------
  // CROSSfader
  //
  // Pour l'instant on détecte le CC.
  // Si ta DJ2GO2 utilise un autre CC, la console le montrera.
  // ----------------------------------------------------------

  // Exemple générique :
  //
  // controller = numéro du CC
  // value = 0 à 127
  //
  // On ne force PAS un numéro au hasard.


  // ----------------------------------------------------------
  // AFFICHAGE
  // ----------------------------------------------------------

  showMIDIStatus(
    "🎛️ MIDI CC " +
    controller +
    "<br>Valeur " +
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
    "MIDI PITCH",
    channel,
    value
  );


  showMIDIStatus(
    "🎚️ MIDI PITCH"
  );

}


// ============================================================
// SYNC
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


  if (!source.audio.src) {

    return;

  }


  // Synchronisation simple :
  // on reprend le même playbackRate.

  target.audio.playbackRate =
    source.audio.playbackRate;


  // Mettre à jour le slider

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
// FLASH DES BOUTONS
// ============================================================

function flashButton(selector) {

  const button =
    $(selector);


  if (!button) {

    return;

  }


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
// STATUT MIDI À L'ÉCRAN
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

        if (status) {

          status.style.display =
            "none";

        }

      },
      1800
    );

}


// ============================================================
// HOT CUES TACTILES
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
// FIN
// ============================================================

console.log(
  "================================"
);

console.log(
  "BlueMix DJ chargé"
);

console.log(
  "MIDI DJ2GO2 prêt"
);

console.log(
  "================================"
);
