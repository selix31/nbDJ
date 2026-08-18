// ============================================================
// BLUEMIX DJ
// app.js COMPLET
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
// CHARGEMENT DES MUSIQUES
// ============================================================

function setupDeck(id, fileInput) {

  $(fileInput).addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    const deck = state[id];

    deck.audio.src =
      URL.createObjectURL(file);

    deck.title.textContent =
      file.name.replace(/\.[^/.]+$/, "");

    deck.artist.textContent =
      "Fichier local";

    deck.audio.load();

    // On efface les anciens CUE
    cuePoints[id] = [null, null, null, null];

    drawWave(deck.wave, id);

    console.log(
      `🎵 Morceau chargé sur Deck ${id}`
    );

  });


  // PLAY / PAUSE SOURIS

  state[id].play.addEventListener("click", async () => {

    await togglePlay(id);

  });

}


// ============================================================
// PLAY / PAUSE
// ============================================================

async function togglePlay(id) {

  const deck = state[id];

  if (!deck.audio.src) {

    console.log(
      `⚠️ Aucun morceau sur Deck ${id}`
    );

    return;

  }


  try {

    if (deck.audio.paused) {

      await deck.audio.play();

      deck.play.textContent = "❚❚";

      console.log(
        `▶ PLAY Deck ${id}`
      );

    } else {

      deck.audio.pause();

      deck.play.textContent = "▶";

      console.log(
        `⏸ PAUSE Deck ${id}`
      );

    }

  } catch (error) {

    console.error(
      "Erreur lecture :",
      error
    );

  }

}


// ============================================================
// INITIALISATION DECKS
// ============================================================

setupDeck("A", "#fileA");
setupDeck("B", "#fileB");


// ============================================================
// WAVEFORM
// ============================================================

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


  // Fond

  ctx.fillStyle =
    "#04182e";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  // Couleur

  const color =
    id === "A"
      ? "#1598ff"
      : "#ff3e4d";


  // Waveform

  ctx.strokeStyle = color;

  ctx.lineWidth =
    2 * devicePixelRatio;

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

    const y =
      height / 2 +
      wave1 +
      wave2 +
      wave3;

    if (x === 0) {

      ctx.moveTo(x, y);

    } else {

      ctx.lineTo(x, y);

    }

  }

  ctx.stroke();


  // Ligne centrale

  ctx.strokeStyle =
    color + "55";

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


  // Position de lecture

  const audio =
    state[id].audio;

  if (
    audio.duration &&
    !isNaN(audio.duration)
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
// POSITION DE LECTURE SUR WAVEFORM
// ============================================================

function drawPlayPosition(
  canvas,
  position,
  color
) {

  const ctx =
    canvas.getContext("2d");

  const x =
    position *
    canvas.width;

  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth =
    2 * devicePixelRatio;

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


  // Glow

  ctx.strokeStyle =
    color;

  ctx.lineWidth =
    1 * devicePixelRatio;

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
// CLIQUER SUR LA WAVEFORM
// POUR ALLER À UN ENDROIT
// ============================================================

function setupWaveSeek(
  canvas,
  audio,
  id
) {

  canvas.addEventListener(
    "pointerdown",
    event => {

      if (
        !audio.duration ||
        isNaN(audio.duration)
      ) {

        return;

      }


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
// REDESSIN WAVEFORMS
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
// CUE
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
// ALLER AU CUE
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
// EFFET VISUEL CUE
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
        transform: "scale(1)"
      },
      {
        transform: "scale(.88)"
      },
      {
        transform: "scale(1)"
      }
    ],
    {
      duration: 180
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
// MIDI
// ============================================================

let midiAccess = null;


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


// ============================================================
// NUMARK DJ2GO2
// DECK A PLAY
// ============================================================

  if (
    channel === 1 &&
    note === 0 &&
    pressed
  ) {

    console.log(
      "▶ NUMARK PLAY A"
    );


    togglePlay("A");

    return;

  }


// ============================================================
// NUMARK DJ2GO2
// CUE A1
// channel 5 / note 1
// ============================================================

  if (
    channel === 5 &&
    note === 1 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE A1"
    );


    if (
      cuePoints.A[0] === null
    ) {

      setCue(
        "A",
        1
      );

    } else {

      goToCue(
        "A",
        1
      );

    }


    flashCue(
      "A",
      1
    );


    return;

  }


// ============================================================
// CUE A2
// channel 5 / note 2
// ============================================================

  if (
    channel === 5 &&
    note === 2 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE A2"
    );


    if (
      cuePoints.A[1] === null
    ) {

      setCue(
        "A",
        2
      );

    } else {

      goToCue(
        "A",
        2
      );

    }


    flashCue(
      "A",
      2
    );


    return;

  }


// ============================================================
// CUE A3
// ============================================================

  if (
    channel === 5 &&
    note === 3 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE A3"
    );


    if (
      cuePoints.A[2] === null
    ) {

      setCue(
        "A",
        3
      );

    } else {

      goToCue(
        "A",
        3
      );

    }


    flashCue(
      "A",
      3
    );


    return;

  }


// ============================================================
// CUE A4
// ============================================================

  if (
    channel === 5 &&
    note === 4 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE A4"
    );


    if (
      cuePoints.A[3] === null
    ) {

      setCue(
        "A",
        4
      );

    } else {

      goToCue(
        "A",
        4
      );

    }


    flashCue(
      "A",
      4
    );


    return;

  }


// ============================================================
// DECK B PLAY
// ============================================================

  if (
    channel === 2 &&
    note === 0 &&
    pressed
  ) {

    console.log(
      "▶ NUMARK PLAY B"
    );


    togglePlay("B");

    return;

  }


// ============================================================
// CUE B1
// ============================================================

  if (
    channel === 6 &&
    note === 1 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE B1"
    );


    if (
      cuePoints.B[0] === null
    ) {

      setCue(
        "B",
        1
      );

    } else {

      goToCue(
        "B",
        1
      );

    }


    flashCue(
      "B",
      1
    );


    return;

  }


// ============================================================
// CUE B2
// ============================================================

  if (
    channel === 6 &&
    note === 2 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE B2"
    );


    if (
      cuePoints.B[1] === null
    ) {

      setCue(
        "B",
        2
      );

    } else {

      goToCue(
        "B",
        2
      );

    }


    flashCue(
      "B",
      2
    );


    return;

  }


// ============================================================
// CUE B3
// ============================================================

  if (
    channel === 6 &&
    note === 3 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE B3"
    );


    if (
      cuePoints.B[2] === null
    ) {

      setCue(
        "B",
        3
      );

    } else {

      goToCue(
        "B",
        3
      );

    }


    flashCue(
      "B",
      3
    );


    return;

  }


// ============================================================
// CUE B4
// ============================================================

  if (
    channel === 6 &&
    note === 4 &&
    pressed
  ) {

    console.log(
      "🎯 NUMARK CUE B4"
    );


    if (
      cuePoints.B[3] === null
    ) {

      setCue(
        "B",
        4
      );

    } else {

      goToCue(
        "B",
        4
      );

    }


    flashCue(
      "B",
      4
    );


    return;

  }


// ============================================================
// MIDI NON MAPPÉ
// ============================================================

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

$("#midiBtn")
  .addEventListener(
    "click",
    connectMIDI
  );


// ============================================================
// HORLOGE
// ============================================================

function updateClock() {

  $("#clock")
    .textContent =
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
  "🎧 BlueMix DJ chargé"
);

console.log(
  "🎛️ MIDI prêt"
);
