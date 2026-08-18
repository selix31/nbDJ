const $ = selector => document.querySelector(selector);

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
    pitch: $("#pitchA"),
    jog: $("#jogA")
  },

  B: {
    audio: audioB,
    title: $("#titleB"),
    artist: $("#artistB"),
    wave: $("#waveB"),
    play: $("#playB"),
    pitch: $("#pitchB"),
    jog: $("#jogB")
  }

};


// ============================================================
// CHARGEMENT DES MUSIQUES
// ============================================================

function setupDeck(id, fileInput) {

  const deck = state[id];

  $(fileInput).addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    // Nettoyage ancienne URL
    if (deck.audio.dataset.objectUrl) {
      URL.revokeObjectURL(deck.audio.dataset.objectUrl);
    }

    const url = URL.createObjectURL(file);

    deck.audio.dataset.objectUrl = url;
    deck.audio.src = url;

    deck.title.textContent =
      file.name.replace(/\.[^/.]+$/, "");

    deck.artist.textContent =
      "Fichier local";

    deck.audio.load();

    deck.audio.addEventListener(
      "loadedmetadata",
      () => {
        drawWave(deck.wave, id);
      },
      { once: true }
    );

  });


  // ==========================================================
  // PLAY / PAUSE SOURIS
  // ==========================================================

  deck.play.addEventListener("click", async () => {

    if (deck.audio.paused) {

      try {

        await deck.audio.play();

        deck.play.textContent = "❚❚";

      } catch (error) {

        console.error(
          "Impossible de démarrer la musique :",
          error
        );

      }

    } else {

      deck.audio.pause();

      deck.play.textContent = "▶";

    }

  });


  // ==========================================================
  // FIN DE MUSIQUE
  // ==========================================================

  deck.audio.addEventListener("ended", () => {

    deck.play.textContent = "▶";

    drawWave(deck.wave, id);

  });

}


// Initialisation
setupDeck("A", "#fileA");
setupDeck("B", "#fileB");


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

  if (!width || !height) return;

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


  // ==========================================================
  // COULEURS
  // ==========================================================

  const color =
    id === "A"
      ? "#1598ff"
      : "#ff3e4d";

  const darkColor =
    id === "A"
      ? "#0b355c"
      : "#5c1820";


  // ==========================================================
  // FOND
  // ==========================================================

  ctx.fillStyle = "#04182e";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );


  // ==========================================================
  // CALCUL POSITION
  // ==========================================================

  const duration =
    audio.duration || 0;

  let progress = 0;

  if (duration > 0) {

    progress =
      audio.currentTime /
      duration;

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


  // ==========================================================
  // WAVEFORM
  // ==========================================================

  ctx.lineWidth = 2;

  for (
    let x = 0;
    x < width;
    x += 2
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


    // Partie déjà jouée
    if (x <= positionX) {

      ctx.strokeStyle =
        color;

    } else {

      ctx.strokeStyle =
        darkColor;

    }


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


  // ==========================================================
  // LIGNE CENTRALE
  // ==========================================================

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


  // ==========================================================
  // CURSEUR DE POSITION
  // ==========================================================

  if (duration > 0) {

    ctx.strokeStyle =
      color;

    ctx.lineWidth = 2;

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


    // Petit point
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


// Dessin initial
drawWave(
  $("#waveA"),
  "A"
);

drawWave(
  $("#waveB"),
  "B"
);


// ============================================================
// CLIQUER SUR LA WAVEFORM POUR CHANGER LA POSITION
// ============================================================

function setupWaveSeek(canvas, audio, id) {

  if (!canvas) return;

  canvas.style.cursor =
    "pointer";


  canvas.addEventListener(
    "click",
    event => {

      if (!audio.duration) {

        console.log(
          "Aucune musique chargée."
        );

        return;

      }


      const rect =
        canvas.getBoundingClientRect();


      const x =
        event.clientX -
        rect.left;


      let percentage =
        x / rect.width;


      percentage =
        Math.max(
          0,
          Math.min(
            1,
            percentage
          )
        );


      audio.currentTime =
        percentage *
        audio.duration;


      drawWave(
        canvas,
        id
      );


      console.log(
        `Deck ${id} : ${audio.currentTime.toFixed(2)} secondes`
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
// SUIVI DE LA MUSIQUE
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
// REDESSIN AU REDIMENSIONNEMENT
// ============================================================

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

$("#pitchA").addEventListener(
  "input",
  event => {

    audioA.playbackRate =
      1 +
      Number(
        event.target.value
      ) / 100;

  }
);


$("#pitchB").addEventListener(
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

function setupJog(id, audio) {

  const jog =
    $(id);

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
        !audio.duration
      ) return;


      // Avance même si la musique
      // est en pause
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
// CUE
// ============================================================

function setupCue(buttonId, audio) {

  const button =
    $(buttonId);

  if (!button) return;


  button.addEventListener(
    "click",
    () => {

      if (!audio.duration)
        return;


      audio.currentTime = 0;

      drawWave(
        audio === audioA
          ? $("#waveA")
          : $("#waveB"),
        audio === audioA
          ? "A"
          : "B"
      );

    }
  );

}


setupCue(
  "#cueA",
  audioA
);

setupCue(
  "#cueB",
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


// ------------------------------------------------------------
// DEMANDE D'ACCÈS MIDI
// ------------------------------------------------------------

async function connectMIDI() {

  if (!navigator.requestMIDIAccess) {

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


  } catch (error) {

    console.error(
      "Erreur MIDI :",
      error
    );


    alert(
      "Impossible d'obtenir l'accès MIDI."
    );

  }

}


// ------------------------------------------------------------
// CONNEXION DES ENTRÉES
// ------------------------------------------------------------

function connectMIDIInputs() {

  if (!midiAccess) return;


  const inputs =
    [...midiAccess.inputs.values()];


  console.log(
    "🎹 Entrées MIDI :",
    inputs
  );


  if (!inputs.length) {

    console.log(
      "🎹 Aucun contrôleur MIDI."
    );

    return;

  }


  inputs.forEach(
    input => {

      console.log(
        "🎧 Contrôleur détecté :",
        input.name
      );


      input.onmidimessage =
        handleMIDIMessage;

    }
  );

}


// ------------------------------------------------------------
// BOUTON MIDI
// ------------------------------------------------------------

$("#midiBtn")
  .addEventListener(
    "click",
    async () => {

      await connectMIDI();


      if (!midiAccess)
        return;


      const inputs =
        [...midiAccess.inputs.values()];


      if (inputs.length) {

        alert(
          "DJ2GO2 / contrôleur MIDI détecté :\n\n" +
          inputs
            .map(
              input =>
                input.name ||
                "Contrôleur MIDI"
            )
            .join("\n")
        );

      } else {

        alert(
          "Aucun contrôleur MIDI détecté."
        );

      }

    }
  );


// ============================================================
// TRAITEMENT MIDI
// ============================================================

function handleMIDIMessage(event) {

  const data =
    event.data;


  if (!data || data.length < 3)
    return;


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


  // ----------------------------------------------------------
  // NOTE ON
  // ----------------------------------------------------------

  let pressed =
    false;


  if (command === 0x90) {

    pressed =
      velocity > 0;

  }


  // ----------------------------------------------------------
  // NOTE OFF
  // ----------------------------------------------------------

  else if (command === 0x80) {

    pressed =
      false;

  }


  else {

    // Autres messages MIDI
    return;

  }


  console.log(
    "🎧 MIDI",
    {
      status,
      type:
        "0x" +
        command
          .toString(16),
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
  // Canal MIDI 1
  // PLAY = NOTE 0
  // ==========================================================

  if (
    channel === 1 &&
    note === 0
  ) {

    console.log(
      "🎵 PLAY A",
      pressed
    );


    if (pressed) {

      toggleDeckPlay(
        "A"
      );

    }

    return;

  }


  // ==========================================================
  // DECK B
  // Canal MIDI 2
  // PLAY = NOTE 0
  // ==========================================================

  if (
    channel === 2 &&
    note === 0
  ) {

    console.log(
      "🎵 PLAY B",
      pressed
    );


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
// PLAY / PAUSE MIDI
// ============================================================

async function toggleDeckPlay(id) {

  const deck =
    state[id];


  if (!deck)
    return;


  if (!deck.audio.src) {

    console.log(
      `Deck ${id} : aucune musique chargée`
    );

    return;

  }


  if (deck.audio.paused) {

    try {

      await deck.audio.play();

      deck.play.textContent =
        "❚❚";


      console.log(
        `▶ Deck ${id}`
      );

    } catch (error) {

      console.error(
        `Erreur lecture Deck ${id}:`,
        error
      );

    }

  } else {

    deck.audio.pause();

    deck.play.textContent =
      "▶";


    console.log(
      `⏸ Deck ${id}`
    );

  }

}


// ============================================================
// RECONNEXION SI LE CONTRÔLEUR MIDI EST BRANCHÉ
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


        // Si le DJ2GO2 est branché après
        // le chargement de la page
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
          "MIDI non disponible automatiquement.",
          error
        );

      }
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
  "🎧 BlueMix DJ chargé."
);

console.log(
  "🎹 MIDI prêt."
);
