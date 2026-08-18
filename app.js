// ============================================================
// BLUEMIX DJ
// APP.JS
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
// ÉTAT
// ============================================================

const state = {

  A: {
    audio: audioA,
    title: $("#titleA"),
    artist: $("#artistA"),
    wave: $("#waveA"),
    play: $("#playA"),
    cue: $("#cueA"),
    cuePosition: 0
  },

  B: {
    audio: audioB,
    title: $("#titleB"),
    artist: $("#artistB"),
    wave: $("#waveB"),
    play: $("#playB"),
    cue: $("#cueB"),
    cuePosition: 0
  }

};


// ============================================================
// AUDIO AUTORISÉ PAR LE NAVIGATEUR
// ============================================================

let audioUnlocked = false;


function unlockAudio() {

  if (audioUnlocked) {
    return;
  }

  // On ne joue rien ici.
  // Le premier clic utilisateur sur un bouton audio
  // permettra au navigateur d'autoriser la lecture.

  audioUnlocked = true;

  console.log(
    "🔊 Audio utilisateur activé"
  );

}


// ============================================================
// CHARGEMENT DES MUSIQUES
// ============================================================

function setupDeck(id, fileSelector) {

  const input = $(fileSelector);

  if (!input) {
    return;
  }


  input.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (!file) {
        return;
      }


      const deck =
        state[id];


      // Libère éventuellement l'ancien fichier
      if (
        deck.objectURL
      ) {

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


      deck.cuePosition = 0;


      deck.audio.load();


      drawWave(
        deck.wave,
        id
      );


      console.log(
        "🎵 Morceau chargé Deck " +
        id +
        ": " +
        file.name
      );

    }
  );


  // PLAY / PAUSE

  if (state[id].play) {

    state[id].play.addEventListener(
      "click",
      () => {

        unlockAudio();

        togglePlay(id);

      }
    );

  }

}


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
      "⚠️ Charge un morceau sur Deck " + id,
      "#ff4050"
    );

    return;

  }


  // ----------------------------------------------------------
  // PAUSE
  // ----------------------------------------------------------

  if (!deck.audio.paused) {

    deck.audio.pause();

    deck.play.textContent =
      "▶";


    console.log(
      "⏸ PAUSE Deck " + id
    );

    return;

  }


  // ----------------------------------------------------------
  // PLAY
  // ----------------------------------------------------------

  console.log(
    "▶ PLAY Deck " + id
  );


  const promise =
    deck.audio.play();


  if (
    promise &&
    typeof promise.then === "function"
  ) {

    promise
      .then(() => {

        deck.play.textContent =
          "❚❚";


        console.log(
          "🔊 Lecture Deck " +
          id +
          " OK"
        );

      })
      .catch(error => {

        deck.play.textContent =
          "▶";


        console.error(
          "❌ Impossible de démarrer Deck " +
          id,
          error
        );


        if (
          error.name ===
          "NotAllowedError"
        ) {

          showMIDIStatus(
            "👆 Clique une fois sur ▶ avec la souris",
            "#ff4050"
          );

        } else {

          showMIDIStatus(
            "❌ Erreur audio",
            "#ff4050"
          );

        }

      });

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
// FIN DES MORCEAUX
// ============================================================

audioA.addEventListener(
  "ended",
  () => {

    if ($("#playA")) {

      $("#playA").textContent =
        "▶";

    }

  }
);


audioB.addEventListener(
  "ended",
  () => {

    if ($("#playB")) {

      $("#playB").textContent =
        "▶";

    }

  }
);


// ============================================================
// CUE
// ============================================================

function triggerCue(id) {

  const deck =
    state[id];


  if (!deck.audio.src) {

    return;

  }


  deck.audio.currentTime =
    deck.cuePosition || 0;


  deck.audio.pause();


  deck.play.textContent =
    "▶";


  console.log(
    "🎯 CUE Deck " + id
  );

}


if ($("#cueA")) {

  $("#cueA").addEventListener(
    "click",
    () => {

      unlockAudio();

      triggerCue("A");

    }
  );

}


if ($("#cueB")) {

  $("#cueB").addEventListener(
    "click",
    () => {

      unlockAudio();

      triggerCue("B");

    }
  );

}


// ============================================================
// WAVEFORM
// ============================================================

function drawWave(canvas, id) {

  if (!canvas) {
    return;
  }


  const ctx =
    canvas.getContext("2d");


  const ratio =
    window.devicePixelRatio || 1;


  const width =
    canvas.clientWidth * ratio;


  const height =
    canvas.clientHeight * ratio;


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


  if (!jog) {
    return;
  }


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

      if (!touching) {
        return;
      }


      const movement =
        event.clientX -
        lastX;


      lastX =
        event.clientX;


      if (audio.paused) {
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


// ============================================================
// DJ2GO2
//
// D'après le message réel que TU as reçu:
//
// status 128
// channel 1
// data1 0
// data2 0
//
// = NOTE OFF / CHANNEL 1 / NOTE 0
//
// ============================================================

const DJ2GO2 = {

  PLAY_A_CHANNEL: 1,

  PLAY_A_NOTE: 0

};


// ============================================================
// DERNIER MESSAGE
//
// Sert à éviter qu'un bouton qui envoie plusieurs messages
// déclenche Play/Pause deux fois.
// ============================================================

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
      "Nombre d'entrées :",
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
          "🎧 MIDI :",
          input.name
        );


        // C'est cette ligne qui reçoit
        // les boutons de la DJ2GO2.

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
  // CC
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
// NOTE MIDI
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
  // PLAY A DJ2GO2
  //
  // On utilise NOTE OFF car c'est le message réel que
  // ta planche nous a montré.
  // ==========================================================

  if (
    channel ===
      DJ2GO2.PLAY_A_CHANNEL &&

    note ===
      DJ2GO2.PLAY_A_NOTE &&

    pressed === false
  ) {


    // Petite protection anti-double déclenchement

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
      "🔥🔥 DJ2GO2 PLAY A 🔥🔥"
    );


    const button =
      $("#playA");


    if (!button) {

      console.error(
        "❌ #playA introuvable"
      );

      return;

    }


    // Déclenche exactement le même événement
    // qu'un clic de souris.

    button.click();


    // Animation du bouton

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


  // Autres boutons pour l'instant

  console.log(
    "🎹 NOTE NON PROGRAMMÉE",
    channel,
    note
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


  // Pour l'instant on ne change rien à ton interface.
  // On affiche seulement les vrais messages de la board.
  //
  // Cela permettra ensuite de mapper correctement :
  //
  // - crossfader
  // - volumes
  // - pitch
  // - EQ
  // - jog
  // - boutons
  // etc.


  showMIDIStatus(
    "🎛️ MIDI CC " +
    controller +
    " = " +
    value,
    "#1598ff"
  );

}


// ============================================================
// PITCH MIDI
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


  if (!clock) {
    return;
  }


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
  "🎧 MIDI PRÊT"
);

console.log(
  "🎧 NUMARK DJ2GO2"
);

console.log(
  "🎧 PLAY A = CHANNEL 1 / NOTE 0"
);

console.log(
  "======================================"
);
