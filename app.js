// ======================================================
// BlueMix DJ
// Application principale
// ======================================================


// ======================================================
// OUTILS
// ======================================================

const $ = selector => document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];


// ======================================================
// AUDIO
// ======================================================

const audioA = $("#audioA");
const audioB = $("#audioB");


// ======================================================
// ÉTAT DES DECKS
// ======================================================

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

    cuePoint: 0,

    hotCues: {},

    loopSize: 4,

    loopIn: null,

    loopOut: null

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

    cuePoint: 0,

    hotCues: {},

    loopSize: 4,

    loopIn: null,

    loopOut: null

  }

};


// ======================================================
// CHARGEMENT DES MUSIQUES
// ======================================================

function setupDeck(id, fileInput) {

  const deck = state[id];

  $(fileInput).addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (!file) return;


      if (deck.audio.src) {

        URL.revokeObjectURL(
          deck.audio.src
        );

      }


      deck.audio.src =
        URL.createObjectURL(file);


      deck.title.textContent =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        );


      deck.artist.textContent =
        "Fichier local";


      deck.audio.load();


      deck.cuePoint = 0;

      deck.hotCues = {};


      drawWave(
        deck.wave,
        id
      );

    }
  );


  // PLAY / PAUSE

  deck.play.addEventListener(
    "click",
    () => {

      togglePlay(id);

    }
  );


  // CUE

  deck.cue.addEventListener(
    "click",
    () => {

      cueDeck(id);

    }
  );


  // AUDIO EVENTS

  deck.audio.addEventListener(
    "play",
    () => {

      deck.play.textContent =
        "❚❚";

      deck.play.classList.add(
        "active"
      );

    }
  );


  deck.audio.addEventListener(
    "pause",
    () => {

      deck.play.textContent =
        "▶";

      deck.play.classList.remove(
        "active"
      );

    }
  );


  deck.audio.addEventListener(
    "ended",
    () => {

      deck.play.textContent =
        "▶";

      deck.play.classList.remove(
        "active"
      );

    }
  );


  // LOOP

  deck.audio.addEventListener(
    "timeupdate",
    () => {

      if (
        deck.loopIn !== null &&
        deck.loopOut !== null &&
        deck.audio.currentTime >= deck.loopOut
      ) {

        deck.audio.currentTime =
          deck.loopIn;

      }

    }
  );

}


// ======================================================
// PLAY / PAUSE
// ======================================================

async function togglePlay(id) {

  const deck = state[id];

  if (!deck.audio.src) {

    console.log(
      `Deck ${id}: aucun morceau chargé.`
    );

    return;

  }


  try {

    if (deck.audio.paused) {

      await deck.audio.play();

    } else {

      deck.audio.pause();

    }

  } catch (error) {

    console.error(
      "Erreur audio:",
      error
    );

  }

}


// ======================================================
// CUE
// ======================================================

function cueDeck(id) {

  const deck = state[id];

  if (!deck.audio.src) return;


  if (!deck.audio.paused) {

    deck.audio.pause();

  }


  deck.audio.currentTime =
    Math.max(
      0,
      deck.cuePoint
    );

}


// ======================================================
// INITIALISATION
// ======================================================

setupDeck(
  "A",
  "#fileA"
);

setupDeck(
  "B",
  "#fileB"
);


// ======================================================
// WAVEFORM
// ======================================================

function drawWave(canvas, id) {

  if (!canvas) return;


  const ctx =
    canvas.getContext("2d");


  const width =
    canvas.clientWidth *
    devicePixelRatio;


  const height =
    canvas.clientHeight *
    devicePixelRatio;


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
    2 * devicePixelRatio;


  ctx.beginPath();


  for (
    let x = 0;
    x < width;
    x++
  ) {

    const y =
      height / 2 +
      Math.sin(x * 0.055) *
      height * 0.16 +
      Math.sin(x * 0.013) *
      height * 0.18;


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


// ======================================================
// MIXER
// ======================================================

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


$("#masterVolume")
  .addEventListener(
    "input",
    event => {

      const value =
        Number(event.target.value);


      audioA.volume =
        Math.min(
          audioA.volume,
          value
        );

      audioB.volume =
        Math.min(
          audioB.volume,
          value
        );

    }
  );


updateMix();


// ======================================================
// PITCH
// ======================================================

function updatePitch(
  id,
  value
) {

  const deck =
    state[id];

  const pitch =
    Number(value);


  deck.audio.playbackRate =
    1 + pitch / 100;

}


$("#pitchA")
  .addEventListener(
    "input",
    event => {

      updatePitch(
        "A",
        event.target.value
      );

    }
  );


$("#pitchB")
  .addEventListener(
    "input",
    event => {

      updatePitch(
        "B",
        event.target.value
      );

    }
  );


// ======================================================
// JOG WHEELS
// ======================================================

function setupJog(
  id,
  audio
) {

  const jog =
    $(id);

  if (!jog) return;


  let touching = false;

  let lastX = 0;


  jog.addEventListener(
    "pointerdown",
    event => {

      touching = true;

      lastX =
        event.clientX;

      jog.classList.add(
        "active"
      );

      jog.setPointerCapture(
        event.pointerId
      );

    }
  );


  jog.addEventListener(
    "pointerup",
    event => {

      touching = false;

      jog.classList.remove(
        "active"
      );

      try {

        jog.releasePointerCapture(
          event.pointerId
        );

      } catch {}

    }
  );


  jog.addEventListener(
    "pointercancel",
    () => {

      touching = false;

      jog.classList.remove(
        "active"
      );

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


      if (!audio.src) return;


      audio.currentTime =
        Math.max(
          0,
          Math.min(
            audio.duration || Infinity,
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


// ======================================================
// CUE POINT
// ======================================================

audioA.addEventListener(
  "loadedmetadata",
  () => {

    state.A.cuePoint = 0;

  }
);


audioB.addEventListener(
  "loadedmetadata",
  () => {

    state.B.cuePoint = 0;

  }
);


// ======================================================
// HOT CUES
// ======================================================

$$(".cuePad").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const deckId =
          button.dataset.deck;

        const cueNumber =
          button.dataset.cue;

        setHotCue(
          deckId,
          cueNumber,
          button
        );

      }
    );

  }
);


function setHotCue(
  deckId,
  cueNumber,
  button
) {

  const deck =
    state[deckId];


  if (!deck.audio.src) return;


  const existing =
    deck.hotCues[cueNumber];


  if (
    existing !== undefined
  ) {

    deck.audio.currentTime =
      existing;

  } else {

    deck.hotCues[cueNumber] =
      deck.audio.currentTime;

  }


  button.classList.add(
    "active"
  );


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


// ======================================================
// LOOP
// ======================================================

$$(".loopPlus").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.deck;

        state[id].loopSize =
          Math.min(
            32,
            state[id].loopSize * 2
          );

        updateLoopDisplay(id);

      }
    );

  }
);


$$(".loopMinus").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.deck;

        state[id].loopSize =
          Math.max(
            1,
            state[id].loopSize / 2
          );

        updateLoopDisplay(id);

      }
    );

  }
);


function updateLoopDisplay(id) {

  $(`#loop${id}`)
    .textContent =
    state[id].loopSize;

}


$$(".loopIn").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.deck;

        const deck =
          state[id];

        deck.loopIn =
          deck.audio.currentTime;

      }
    );

  }
);


$$(".loopOut").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.deck;

        const deck =
          state[id];

        deck.loopOut =
          deck.audio.currentTime;

      }
    );

  }
);


// ======================================================
// SYNC
// ======================================================

function syncDeck(id) {

  const deck =
    state[id];

  const other =
    state[id === "A" ? "B" : "A"];


  if (!deck.audio.src) return;


  if (
    other.audio.src &&
    other.audio.playbackRate
  ) {

    deck.audio.playbackRate =
      other.audio.playbackRate;

  }

}


$("#syncA")
  .addEventListener(
    "click",
    () => syncDeck("A")
  );


$("#syncB")
  .addEventListener(
    "click",
    () => syncDeck("B")
  );


// ======================================================
// REC
// ======================================================

$("#recordBtn")
  .addEventListener(
    "click",
    () => {

      $("#recordBtn")
        .classList
        .toggle("active");

    }
  );


// ======================================================
// FX
// ======================================================

$("#filterOn")
  .addEventListener(
    "click",
    event => {

      event.target
        .classList
        .toggle("active");

    }
  );


$("#echoOn")
  .addEventListener(
    "click",
    event => {

      event.target
        .classList
        .toggle("active");

    }
  );


// ======================================================
// SAMPLER
// ======================================================

$$("[data-sampler]").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        button.classList.add(
          "active"
        );

        setTimeout(
          () => {

            button.classList.remove(
              "active"
            );

          },
          150
        );

      }
    );

  }
);


// ======================================================
// HORLOGE
// ======================================================

function updateClock() {

  $("#clock")
    .textContent =
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


// ======================================================
// ======================================================
// MIDI ENGINE
// ======================================================
// ======================================================

let midiAccess = null;

let midiInput = null;

let midiOutput = null;

let midiLastMessage = null;

let midiLearningAction = null;


// ======================================================
// ACTIONS MIDI DISPONIBLES
// ======================================================

const midiActions = {

  playA: {
    name: "PLAY Deck A",
    type: "button"
  },

  cueA: {
    name: "CUE Deck A",
    type: "button"
  },

  playB: {
    name: "PLAY Deck B",
    type: "button"
  },

  cueB: {
    name: "CUE Deck B",
    type: "button"
  },

  volA: {
    name: "Volume Deck A",
    type: "slider"
  },

  volB: {
    name: "Volume Deck B",
    type: "slider"
  },

  crossfader: {
    name: "Crossfader",
    type: "slider"
  },

  pitchA: {
    name: "Pitch Deck A",
    type: "slider"
  },

  pitchB: {
    name: "Pitch Deck B",
    type: "slider"
  },

  cueA1: {
    name: "Hot Cue A 1",
    type: "button"
  },

  cueA2: {
    name: "Hot Cue A 2",
    type: "button"
  },

  cueA3: {
    name: "Hot Cue A 3",
    type: "button"
  },

  cueA4: {
    name: "Hot Cue A 4",
    type: "button"
  },

  cueB1: {
    name: "Hot Cue B 1",
    type: "button"
  },

  cueB2: {
    name: "Hot Cue B 2",
    type: "button"
  },

  cueB3: {
    name: "Hot Cue B 3",
    type: "button"
  },

  cueB4: {
    name: "Hot Cue B 4",
    type: "button"
  }

};


// ======================================================
// CHARGER LE MAPPING
// ======================================================

let midiMapping =
  JSON.parse(
    localStorage.getItem(
      "BlueMixDJ_MIDI"
    ) || "{}"
  );


// ======================================================
// IDENTIFIANT MESSAGE MIDI
// ======================================================

function midiMessageId(
  type,
  channel,
  control
) {

  return [
    type,
    channel,
    control
  ].join(":");

}


// ======================================================
// CRÉER LE PANNEAU MIDI
// ======================================================

function createMidiPanel() {

  if ($(".midiPanel")) return;


  const panel =
    document.createElement("div");

  panel.className =
    "midiPanel";


  panel.innerHTML = `

    <div class="midiBox">

      <h2>🎛️ MIDI BlueMix DJ</h2>

      <div
        class="midiStatus"
        id="midiStatus"
      >
        MIDI non connecté
      </div>

      <div id="midiDevices"></div>

      <div
        class="midiMessage"
        id="midiMessage"
      >
        Appuie sur un bouton de ta planche
        pour voir son message MIDI.
      </div>

      <h3>
        MIDI LEARN
      </h3>

      <p>
        Clique sur une commande ci-dessous,
        puis bouge le bouton, fader ou jog
        correspondant sur ta planche DJ.
      </p>

      <div
        class="midiLearnGrid"
        id="midiLearnGrid"
      ></div>

      <button
        class="midiClose"
        id="midiClose"
      >
        FERMER
      </button>

    </div>

  `;


  document.body.appendChild(
    panel
  );


  $("#midiClose")
    .addEventListener(
      "click",
      closeMidiPanel
    );


  panel.addEventListener(
    "click",
    event => {

      if (
        event.target === panel
      ) {

        closeMidiPanel();

      }

    }
  );


  createMidiLearnButtons();

}


// ======================================================
// BOUTONS MIDI LEARN
// ======================================================

function createMidiLearnButtons() {

  const container =
    $("#midiLearnGrid");

  if (!container) return;


  container.innerHTML = "";


  Object.entries(
    midiActions
  ).forEach(
    ([action, info]) => {

      const button =
        document.createElement("button");


      button.className =
        "midiLearnButton";


      button.dataset.action =
        action;


      const mapping =
        midiMapping[action];


      button.innerHTML =
        `${info.name}<br>
        <small>
        ${
          mapping
            ? mappingText(mapping)
            : "Non assigné"
        }
        </small>`;


      button.addEventListener(
        "click",
        () => {

          startMidiLearn(
            action,
            button
          );

        }
      );


      container.appendChild(
        button
      );

    }
  );

}


// ======================================================
// TEXTE DU MAPPING
// ======================================================

function mappingText(
  mapping
) {

  return `Type ${mapping.type}
  / CH ${mapping.channel}
  / ${mapping.control}`;

}


// ======================================================
// MIDI LEARN
// ======================================================

function startMidiLearn(
  action,
  button
) {

  if (
    midiLearningAction
  ) {

    return;

  }


  midiLearningAction =
    action;


  button.classList.add(
    "learning"
  );


  $("#midiMessage")
    .textContent =
    `🎯 Apprentissage :
    utilise maintenant la commande
    "${midiActions[action].name}"
    sur ta planche DJ...`;

}


// ======================================================
// FIN MIDI LEARN
// ======================================================

function finishMidiLearn(
  type,
  channel,
  control
) {

  if (
    !midiLearningAction
  ) {

    return false;

  }


  midiMapping[
    midiLearningAction
  ] = {

    type,
    channel,
    control

  };


  localStorage.setItem(
    "BlueMixDJ_MIDI",
    JSON.stringify(
      midiMapping
    )
  );


  $("#midiMessage")
    .textContent =
    `✅ Commande enregistrée :
    ${midiActions[midiLearningAction].name}`;


  midiLearningAction =
    null;


  createMidiLearnButtons();


  return true;

}


// ======================================================
// OUVRIR MIDI
// ======================================================

async function initMIDI() {

  createMidiPanel();


  const panel =
    $(".midiPanel");


  panel.classList.add(
    "visible"
  );


  if (
    !navigator.requestMIDIAccess
  ) {

    $("#midiStatus")
      .textContent =
      "❌ Web MIDI n'est pas disponible dans ce navigateur.";

    return;

  }


  try {

    midiAccess =
      await navigator.requestMIDIAccess({
        sysex: false
      });


    $("#midiStatus")
      .textContent =
      "🟢 MIDI activé. Recherche des contrôleurs...";


    connectMidiInputs();

    updateMidiDevices();


    midiAccess.onstatechange =
      () => {

        connectMidiInputs();

        updateMidiDevices();

      };


  } catch (error) {

    console.error(
      "MIDI:",
      error
    );


    $("#midiStatus")
      .textContent =
      "❌ Permission MIDI refusée.";

  }

}


// ======================================================
// CONNECTER LES INPUTS
// ======================================================

function connectMidiInputs() {

  if (!midiAccess) return;


  midiInput = null;


  midiAccess.inputs.forEach(
    input => {

      console.log(
        "MIDI INPUT:",
        input.name
      );


      if (!midiInput) {

        midiInput =
          input;

      }


      input.onmidimessage =
        receiveMidi;

    }
  );


  midiAccess.outputs.forEach(
    output => {

      midiOutput =
        output;

    }
  );


  const connected =
    !!midiInput;


  $("#midiBtn")
    .classList
    .toggle(
      "connected",
      connected
    );


  if (connected) {

    $("#midiStatus")
      .textContent =
      `🟢 Connecté :
      ${midiInput.name}`;

  }

}


// ======================================================
// AFFICHER LES PÉRIPHÉRIQUES
// ======================================================

function updateMidiDevices() {

  const container =
    $("#midiDevices");


  if (!container) return;


  container.innerHTML = "";


  if (!midiAccess) return;


  midiAccess.inputs.forEach(
    input => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "midiDevice connected";


      div.innerHTML =
        `🎛️ <strong>${input.name}</strong>
        <br>
        <small>
        ${input.manufacturer || ""}
        </small>`;


      container.appendChild(
        div
      );

    }
  );


  if (
    midiAccess.inputs.size === 0
  ) {

    container.innerHTML =
      `<div class="midiDevice">
      Aucun contrôleur MIDI trouvé.
      </div>`;

  }

}


// ======================================================
// RECEVOIR MIDI
// ======================================================

function receiveMidi(
  event
) {

  const data =
    event.data;


  if (!data || data.length < 2) {
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


  midiLastMessage = {

    type,

    channel,

    control: data1,

    value: data2

  };


  console.log(
    "🎹 MIDI",
    midiLastMessage
  );


  if ($("#midiMessage")) {

    $("#midiMessage")
      .textContent =
      `MIDI reçu →
      Type: 0x${type
        .toString(16)
        .toUpperCase()}
      | Canal: ${channel}
      | Contrôle: ${data1}
      | Valeur: ${data2}`;

  }


  // MIDI LEARN

  if (
    midiLearningAction
  ) {

    finishMidiLearn(
      type,
      channel,
      data1
    );

    return;

  }


  // EXÉCUTION

  executeMidiCommand(
    type,
    channel,
    data1,
    data2
  );

}


// ======================================================
// EXÉCUTER UNE COMMANDE MIDI
// ======================================================

function executeMidiCommand(
  type,
  channel,
  control,
  value
) {

  Object.entries(
    midiMapping
  ).forEach(
    ([action, mapping]) => {

      if (
        mapping.type !== type ||
        mapping.channel !== channel ||
        mapping.control !== control
      ) {

        return;

      }


      const actionInfo =
        midiActions[action];


      if (!actionInfo) return;


      if (
        actionInfo.type === "button"
      ) {

        if (
          type === 0x90 &&
          value === 0
        ) {

          return;

        }


        if (
          type === 0x80
        ) {

          return;

        }


        executeMidiButton(
          action
        );

      }


      if (
        actionInfo.type === "slider"
      ) {

        const normalized =
          value / 127;


        executeMidiSlider(
          action,
          normalized
        );

      }

    }
  );

}


// ======================================================
// BOUTONS MIDI
// ======================================================

function executeMidiButton(
  action
) {

  switch (action) {

    case "playA":

      togglePlay("A");

      break;


    case "cueA":

      cueDeck("A");

      break;


    case "playB":

      togglePlay("B");

      break;


    case "cueB":

      cueDeck("B");

      break;


    case "cueA1":

      triggerHotCue(
        "A",
        "1"
      );

      break;


    case "cueA2":

      triggerHotCue(
        "A",
        "2"
      );

      break;


    case "cueA3":

      triggerHotCue(
        "A",
        "3"
      );

      break;


    case "cueA4":

      triggerHotCue(
        "A",
        "4"
      );

      break;


    case "cueB1":

      triggerHotCue(
        "B",
        "1"
      );

      break;


    case "cueB2":

      triggerHotCue(
        "B",
        "2"
      );

      break;


    case "cueB3":

      triggerHotCue(
        "B",
        "3"
      );

      break;


    case "cueB4":

      triggerHotCue(
        "B",
        "4"
      );

      break;

  }

}


// ======================================================
// HOT CUE MIDI
// ======================================================

function triggerHotCue(
  deckId,
  cueNumber
) {

  const deck =
    state[deckId];


  if (!deck.audio.src) {
    return;
  }


  if (
    deck.hotCues[cueNumber] === undefined
  ) {

    deck.hotCues[cueNumber] =
      deck.audio.currentTime;

  }


  deck.audio.currentTime =
    deck.hotCues[cueNumber];

}


// ======================================================
// SLIDERS MIDI
// ======================================================

function executeMidiSlider(
  action,
  value
) {

  switch (action) {

    case "volA":

      $("#volA").value =
        value;

      updateMix();

      break;


    case "volB":

      $("#volB").value =
        value;

      updateMix();

      break;


    case "crossfader":

      $("#crossfader").value =
        value * 2 - 1;

      updateMix();

      break;


    case "pitchA": {

      const pitch =
        value * 20 - 10;


      $("#pitchA").value =
        pitch;


      updatePitch(
        "A",
        pitch
      );

      break;

    }


    case "pitchB": {

      const pitch =
        value * 20 - 10;


      $("#pitchB").value =
        pitch;


      updatePitch(
        "B",
        pitch
      );

      break;

    }

  }

}


// ======================================================
// BOUTON MIDI
// ======================================================

$("#midiBtn")
  .addEventListener(
    "click",
    () => {

      initMIDI();

    }
  );


// ======================================================
// CLAVIER - RACCOURCIS
// ======================================================

document.addEventListener(
  "keydown",
  event => {

    if (
      event.target.tagName ===
      "INPUT"
    ) {

      return;

    }


    switch (
      event.key.toLowerCase()
    ) {

      case "q":

        togglePlay("A");

        break;


      case "a":

        cueDeck("A");

        break;


      case "p":

        togglePlay("B");

        break;


      case "l":

        cueDeck("B");

        break;

    }

  }
);


// ======================================================
// NETTOYAGE DES OBJECT URL
// ======================================================

window.addEventListener(
  "beforeunload",
  () => {

    if (audioA.src) {

      URL.revokeObjectURL(
        audioA.src
      );

    }


    if (audioB.src) {

      URL.revokeObjectURL(
        audioB.src
      );

    }

  }
);


// ======================================================
// BLUE MIX DJ PRÊT
// ======================================================

console.log(
  "🎧 BlueMix DJ prêt."
);

console.log(
  "🎹 Clique sur MIDI pour connecter ta planche."
);
