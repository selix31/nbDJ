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
    pitch: $("#pitchA")
  },

  B: {
    audio: audioB,
    title: $("#titleB"),
    artist: $("#artistB"),
    wave: $("#waveB"),
    play: $("#playB"),
    pitch: $("#pitchB")
  }

};


const waveA = $("#waveA");
const waveB = $("#waveB");


// ============================================================
// CHARGEMENT DES MUSIQUES
// ============================================================

function setupDeck(id, fileInput) {

  const deck = state[id];

  const input = $(fileInput);

  if (!input) return;


  input.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (!file) return;


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


      deck.audio.addEventListener(
        "loadedmetadata",
        () => {

          drawWave(
            deck.wave,
            id
          );

        },
        {
          once: true
        }
      );

    }
  );


  // PLAY / PAUSE AVEC LA SOURIS

  deck.play.addEventListener(
    "click",
    () => {

      toggleDeckPlay(id);

    }
  );


  // FIN DU MORCEAU

  deck.audio.addEventListener(
    "ended",
    () => {

      deck.play.textContent =
        "▶";


      drawWave(
        deck.wave,
        id
      );

    }
  );

}


setupDeck(
  "A",
  "#fileA"
);


setupDeck(
  "B",
  "#fileB"
);


// ============================================================
// PLAY / PAUSE
// ============================================================

async function toggleDeckPlay(id) {

  const deck =
    state[id];

  if (!deck) return;


  if (!deck.audio.src) {

    console.log(
      `🎵 Deck ${id}: aucune musique chargée`
    );

    return;

  }


  if (deck.audio.paused) {

    try {

      await deck.audio.play();


      deck.play.textContent =
        "❚❚";


      console.log(
        `▶ PLAY DECK ${id}`
      );

    }

    catch(error) {

      console.error(
        `Erreur lecture Deck ${id}:`,
        error
      );

    }

  }

  else {

    deck.audio.pause();


    deck.play.textContent =
      "▶";


    console.log(
      `⏸ PAUSE DECK ${id}`
    );

  }

}


// ============================================================
// WAVEFORM
// ============================================================

function drawWave(canvas, id) {

  if (!canvas) return;


  const audio =
    id === "A"
      ? audioA
      : audioB;


  const ctx =
    canvas.getContext("2d");


  const width =
    canvas.clientWidth;


  const height =
    canvas.clientHeight;


  if (
    !width ||
    !height
  ) {
    return;
  }


  const dpr =
    window.devicePixelRatio || 1;


  canvas.width =
    width * dpr;


  canvas.height =
    height * dpr;


  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  // ----------------------------------------------------------
  // FOND
  // ----------------------------------------------------------

  ctx.fillStyle =
    "#04182e";


  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  // ----------------------------------------------------------
  // COULEURS
  // ----------------------------------------------------------

  const color =
    id === "A"
      ? "#1598ff"
      : "#ff3e4d";


  const darkColor =
    id === "A"
      ? "#0a355c"
      : "#5a1820";


  // ----------------------------------------------------------
  // POSITION MUSIQUE
  // ----------------------------------------------------------

  let progress = 0;


  if (
    audio.duration &&
    isFinite(audio.duration)
  ) {

    progress =
      audio.currentTime /
      audio.duration;


    progress =
      Math.max(
        0,
        Math.min(
          1,
          progress
        )
      );

  }


  const positionX =
    progress * width;


  // ----------------------------------------------------------
  // WAVE
  // ----------------------------------------------------------

  for (
    let x = 0;
    x < width;
    x += 2
  ) {

    const wave1 =
      Math.sin(
        x * 0.055
      ) *
      height *
      0.16;


    const wave2 =
      Math.sin(
        x * 0.013
      ) *
      height *
      0.18;


    const wave3 =
      Math.sin(
        x * 0.11
      ) *
      height *
      0.07;


    const wave4 =
      Math.sin(
        x * 0.021
      ) *
      height *
      0.10;


    const amplitude =
      wave1 +
      wave2 +
      wave3 +
      wave4;


    const y1 =
      height / 2 -
      Math.abs(amplitude);


    const y2 =
      height / 2 +
      Math.abs(amplitude);


    ctx.strokeStyle =
      x <= positionX
        ? color
        : darkColor;


    ctx.lineWidth = 2;


    ctx.beginPath();


    ctx.moveTo(
      x,
      y1
    );


    ctx.lineTo(
      x,
      y2
    );


    ctx.stroke();

  }


  // ----------------------------------------------------------
  // LIGNE CENTRALE
  // ----------------------------------------------------------

  ctx.strokeStyle =
    "#284968";


  ctx.lineWidth = 1;


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
  // POSITION DE LECTURE
  // ----------------------------------------------------------

  if (
    audio.duration &&
    isFinite(audio.duration)
  ) {

    ctx.strokeStyle =
      color;


    ctx.lineWidth = 3;


    ctx.beginPath();


    ctx.moveTo(
      positionX,
      0
    );


    ctx.lineTo(
      positionX,
      height
    );


    ctx.stroke();


    ctx.fillStyle =
      color;


    ctx.beginPath();


    ctx.arc(
      positionX,
      height / 2,
      5,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }

}


// Première waveform

drawWave(
  waveA,
  "A"
);


drawWave(
  waveB,
  "B"
);


// ============================================================
// CLIQUER SUR LA WAVEFORM
// ============================================================

function seekWave(
  canvas,
  audio,
  id,
  clientX
) {

  if (
    !audio.duration ||
    !isFinite(audio.duration)
  ) {

    console.log(
      `🎵 Deck ${id}: aucune musique chargée`
    );

    return;

  }


  const rect =
    canvas.getBoundingClientRect();


  if (!rect.width)
    return;


  let x =
    clientX -
    rect.left;


  x =
    Math.max(
      0,
      Math.min(
        rect.width,
        x
      )
    );


  const percentage =
    x / rect.width;


  const newTime =
    percentage *
    audio.duration;


  audio.currentTime =
    newTime;


  drawWave(
    canvas,
    id
  );


  console.log(
    `🎵 Deck ${id}: ${newTime.toFixed(2)} secondes`
  );

}


// Deck A

waveA.addEventListener(
  "click",
  event => {

    seekWave(
      waveA,
      audioA,
      "A",
      event.clientX
    );

  }
);


// Deck B

waveB.addEventListener(
  "click",
  event => {

    seekWave(
      waveB,
      audioB,
      "B",
      event.clientX
    );

  }
);


// ============================================================
// TOUCH / TÉLÉPHONE
// ============================================================

waveA.addEventListener(
  "pointerdown",
  event => {

    seekWave(
      waveA,
      audioA,
      "A",
      event.clientX
    );

  }
);


waveB.addEventListener(
  "pointerdown",
  event => {

    seekWave(
      waveB,
      audioB,
      "B",
      event.clientX
    );

  }
);


// ============================================================
// SUIVI DE LA MUSIQUE
// ============================================================

audioA.addEventListener(
  "timeupdate",
  () => {

    drawWave(
      waveA,
      "A"
    );

  }
);


audioB.addEventListener(
  "timeupdate",
  () => {

    drawWave(
      waveB,
      "B"
    );

  }
);


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
  "resize",
  () => {

    drawWave(
      waveA,
      "A"
    );


    drawWave(
      waveB,
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
    event => {

      touching =
        false;


      try {

        jog.releasePointerCapture(
          event.pointerId
        );

      }

      catch(error) {}

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

      if (!touching)
        return;


      const movement =
        event.clientX -
        lastX;


      lastX =
        event.clientX;


      if (!audio.duration)
        return;


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
// CUE SOURIS
// ============================================================

function setupCue(
  selector,
  audio,
  wave,
  id
) {

  const button =
    $(selector);

  if (!button)
    return;


  button.addEventListener(
    "click",
    () => {

      if (!audio.duration)
        return;


      audio.currentTime =
        0;


      drawWave(
        wave,
        id
      );

    }
  );

}


setupCue(
  "#cueA",
  audioA,
  waveA,
  "A"
);


setupCue(
  "#cueB",
  audioB,
  waveB,
  "B"
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

let midiAccess =
  null;


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


    console.log(
      "🎹 MIDI connecté"
    );


    connectMIDIInputs();

  }

  catch(error) {

    console.error(
      "Erreur MIDI:",
      error
    );

  }

}


// ============================================================
// CONNEXION DES ENTRÉES
// ============================================================

function connectMIDIInputs() {

  if (!midiAccess)
    return;


  const inputs =
    [
      ...midiAccess.inputs.values()
    ];


  console.log(
    "🎹 Entrées MIDI:",
    inputs
  );


  inputs.forEach(
    input => {

      console.log(
        "🎧 Contrôleur:",
        input.name
      );


      input.onmidimessage =
        handleMIDIMessage;

    }
  );

}


// ============================================================
// BOUTON MIDI
// ============================================================

$("#midiBtn")
  .addEventListener(
    "click",
    async () => {

      await connectMIDI();


      if (!midiAccess)
        return;


      const inputs =
        [
          ...midiAccess.inputs.values()
        ];


      if (inputs.length) {

        alert(
          "Contrôleur MIDI détecté :\n\n" +
          inputs
            .map(
              input =>
                input.name ||
                "Contrôleur MIDI"
            )
            .join("\n")
        );

      }

      else {

        alert(
          "Aucun contrôleur MIDI détecté."
        );

      }

    }
  );


// ============================================================
// MESSAGE MIDI
// ============================================================

function handleMIDIMessage(event) {

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


  let pressed =
    false;


  // NOTE ON

  if (
    command === 0x90
  ) {

    pressed =
      velocity > 0;

  }


  // NOTE OFF

  else if (
    command === 0x80
  ) {

    pressed =
      false;

  }


  else {

    return;

  }


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


  handleMIDINote(
    channel,
    note,
    velocity,
    pressed
  );

}


// ============================================================
// HOT CUE
// ============================================================

function triggerHotCue(
  deckId,
  cueNumber
) {

  const audio =
    deckId === "A"
      ? audioA
      : audioB;


  const pads =
    document.querySelectorAll(
      deckId === "A"
        ? ".deckA .cuePad"
        : ".deckB .cuePad"
    );


  const pad =
    pads[cueNumber - 1];


  // Animation

  if (pad) {

    pad.animate(
      [
        {
          transform:
            "scale(1)",
          filter:
            "brightness(1)"
        },

        {
          transform:
            "scale(.88)",
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
        duration: 160
      }
    );

  }


  if (
    !audio.src ||
    !audio.duration
  ) {

    console.log(
      `🎹 CUE ${cueNumber} DECK ${deckId}: aucune musique chargée`
    );

    return;

  }


  // Pour l'instant :
  // CUE 1 et CUE 2 retournent au début.

  if (
    cueNumber === 1 ||
    cueNumber === 2
  ) {

    audio.currentTime =
      0;


    drawWave(
      deckId === "A"
        ? waveA
        : waveB,
      deckId
    );


    console.log(
      `🔥 HOT CUE ${cueNumber} DECK ${deckId}`
    );

  }

}


// ============================================================
// MAPPING MIDI
// ============================================================

function handleMIDINote(
  channel,
  note,
  velocity,
  pressed
) {


  // ==========================================================
  // DECK A
  // HOT CUE 1
  //
  // CANAL 5
  // NOTE 2
  // ==========================================================

  if (
    channel === 5 &&
    note === 2
  ) {

    if (pressed) {

      triggerHotCue(
        "A",
        1
      );

    }

    return;

  }


  // ==========================================================
  // DECK A
  // HOT CUE 2
  //
  // CANAL 5
  // NOTE 1
  // ==========================================================

  if (
    channel === 5 &&
    note === 1
  ) {

    if (pressed) {

      triggerHotCue(
        "A",
        2
      );

    }

    return;

  }


  // ==========================================================
  // DECK A PLAY
  //
  // CANAL 1
  // NOTE 0
  // ==========================================================

  if (
    channel === 1 &&
    note === 0
  ) {

    if (pressed) {

      toggleDeckPlay(
        "A"
      );

    }

    return;

  }


  // ==========================================================
  // DECK B PLAY
  //
  // CANAL 2
  // NOTE 0
  // ==========================================================

  if (
    channel === 2 &&
    note === 0
  ) {

    if (pressed) {

      toggleDeckPlay(
        "B"
      );

    }

    return;

  }


  // ==========================================================
  // AUTRES TOUCHES
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
// DÉTECTION MIDI AUTOMATIQUE
// ============================================================

if (
  navigator.requestMIDIAccess
) {

  navigator
    .requestMIDIAccess()
    .then(
      access => {

        midiAccess =
          access;


        connectMIDIInputs();


        midiAccess.onstatechange =
          () => {

            console.log(
              "🎹 Changement périphérique MIDI"
            );


            connectMIDIInputs();

          };

      }
    )
    .catch(
      error => {

        console.log(
          "MIDI non disponible:",
          error
        );

      }
    );

}


// ============================================================
// HOT CUES À LA SOURIS
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

  $("#clock").textContent =
    new Date().toLocaleTimeString(
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
// DÉMARRAGE
// ============================================================

console.log(
  "🎧 BlueMix DJ prêt"
);


console.log(
  "🎹 MIDI prêt"
);


console.log(
  "🔥 CUE 1 A = CANAL 5 / NOTE 2"
);


console.log(
  "🔥 CUE 2 A = CANAL 5 / NOTE 1"
);


console.log(
  "🎵 Waveform interactive prête"
);
