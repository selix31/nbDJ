/* ================================================= */
/* BLUEMIX DJ */
/* MIDI + AUDIO */
/* ================================================= */


/* ================================================= */
/* UTILITAIRE */
/* ================================================= */

const $ = selector => document.querySelector(selector);


/* ================================================= */
/* AUDIO */
/* ================================================= */

const audioA = $("#audioA");
const audioB = $("#audioB");


/* ================================================= */
/* ETAT DES DECKS */
/* ================================================= */

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



/* ================================================= */
/* CHARGEMENT DES MUSIQUES */
/* ================================================= */

function setupDeck(id, fileInput){

  $(fileInput).addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if(!file) return;


      const deck =
        state[id];


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


      drawWave(
        deck.wave,
        id
      );

    }
  );



  /* PLAY */

  state[id].play.addEventListener(
    "click",
    () => {

      togglePlay(id);

    }
  );

}



function togglePlay(id){

  const deck =
    state[id];


  if(deck.audio.paused){

    deck.audio.play()
      .catch(error => {

        console.warn(
          "Lecture impossible:",
          error
        );

      });

    deck.play.textContent =
      "❚❚";

  }else{

    deck.audio.pause();

    deck.play.textContent =
      "▶";

  }

}



setupDeck(
  "A",
  "#fileA"
);

setupDeck(
  "B",
  "#fileB"
);



/* ================================================= */
/* CUE */
/* ================================================= */

function cueDeck(id){

  const deck =
    state[id];


  if(
    !deck.audio.src ||
    deck.audio.readyState < 1
  ){

    return;

  }


  deck.audio.currentTime = 0;

}


$("#cueA").addEventListener(
  "click",
  () => cueDeck("A")
);


$("#cueB").addEventListener(
  "click",
  () => cueDeck("B")
);



/* ================================================= */
/* WAVEFORM */
/* ================================================= */

function drawWave(canvas,id){

  if(!canvas) return;


  const ctx =
    canvas.getContext("2d");


  const width =
    canvas.width =
      canvas.clientWidth *
      devicePixelRatio;


  const height =
    canvas.height =
      canvas.clientHeight *
      devicePixelRatio;


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
    devicePixelRatio;


  ctx.beginPath();


  for(
    let x = 0;
    x < width;
    x++
  ){

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



/* ================================================= */
/* CROSSFADER */
/* ================================================= */

function updateMix(){

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



/* ================================================= */
/* PITCH */
/* ================================================= */

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



/* ================================================= */
/* JOG WHEELS */
/* ================================================= */

function setupJog(
  selector,
  audio
){

  const jog =
    $(selector);


  let touching =
    false;


  let lastX =
    0;


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

      if(!touching) return;

      const movement =
        event.clientX -
        lastX;


      lastX =
        event.clientX;


      if(audio.paused)
        return;


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



/* ================================================= */
/* REC */
/* ================================================= */

$("#recordBtn").addEventListener(
  "click",
  () => {

    $("#recordBtn")
      .classList
      .toggle("active");

  }
);



/* ================================================= */
/* MIDI */
/* ================================================= */

let midiAccess = null;

let selectedMidiInput = null;

let midiLearnMode = false;

let midiLearningElement = null;


/*
   Les mappings sont sauvegardés
   dans localStorage.
*/

let midiMappings =
  JSON.parse(
    localStorage.getItem(
      "bluemixMidiMappings"
    ) || "{}"
  );



/* ================================================= */
/* OUVRIR LE PANEL MIDI */
/* ================================================= */

$("#midiBtn").addEventListener(
  "click",
  async () => {

    $("#midiPanel")
      .classList
      .remove("hidden");


    await connectMIDI();

  }
);



/* ================================================= */
/* FERMER PANEL */
/* ================================================= */

$("#closeMidi").addEventListener(
  "click",
  () => {

    $("#midiPanel")
      .classList
      .add("hidden");

  }
);



/* ================================================= */
/* CONNECTER MIDI */
/* ================================================= */

async function connectMIDI(){

  const status =
    $("#midiStatus");


  if(!navigator.requestMIDIAccess){

    status.textContent =
      "❌ Web MIDI n'est pas disponible dans ce navigateur.";

    status.className =
      "midiStatus error";

    return;

  }


  try{

    status.textContent =
      "⏳ Connexion MIDI...";


    status.className =
      "midiStatus";


    midiAccess =
      await navigator.requestMIDIAccess();


    midiAccess.onstatechange =
      handleMidiStateChange;


    updateMidiDevices();


    status.textContent =
      "🟢 MIDI disponible";


    status.className =
      "midiStatus connected";


  }catch(error){

    console.error(
      "Erreur MIDI:",
      error
    );


    status.textContent =
      "❌ Impossible d'accéder au MIDI : " +
      error.message;


    status.className =
      "midiStatus error";

  }

}



/* ================================================= */
/* LISTE DES CONTROLEURS */
/* ================================================= */

function updateMidiDevices(){

  const select =
    $("#midiDevice");


  select.innerHTML =
    `<option value="">
      Sélectionner un contrôleur
    </option>`;


  if(!midiAccess)
    return;


  const inputs =
    [...midiAccess.inputs.values()];


  inputs.forEach(
    input => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        input.id;


      option.textContent =
        input.name ||
        "Contrôleur MIDI";


      select.appendChild(
        option
      );

    }
  );


  /*
     Si une DJ2GO2 est trouvée,
     on la sélectionne automatiquement.
  */

  const dj2go =
    inputs.find(
      input =>
        (
          input.name ||
          ""
        )
        .toLowerCase()
        .includes("dj2go")
    );


  if(dj2go){

    select.value =
      dj2go.id;

    selectMidiInput(
      dj2go
    );

  }else if(inputs.length === 1){

    select.value =
      inputs[0].id;

    selectMidiInput(
      inputs[0]
    );

  }


  renderMidiMappings();

}



/* ================================================= */
/* SELECTION MIDI */
/* ================================================= */

$("#midiDevice").addEventListener(
  "change",
  event => {

    const id =
      event.target.value;


    if(!id){

      selectedMidiInput =
        null;

      return;

    }


    const input =
      midiAccess.inputs.get(id);


    if(input){

      selectMidiInput(
        input
      );

    }

  }
);



/* ================================================= */
/* BRANCHER UNE ENTREE MIDI */
/* ================================================= */

function selectMidiInput(
  input
){

  if(selectedMidiInput){

    selectedMidiInput.onmidimessage =
      null;

  }


  selectedMidiInput =
    input;


  selectedMidiInput.onmidimessage =
    handleMidiMessage;


  selectedMidiInput.open()
    .catch(
      error =>
        console.warn(
          "Ouverture MIDI:",
          error
        )
    );


  $("#midiStatus").textContent =
    "🟢 Connecté : " +
    (
      input.name ||
      "Contrôleur MIDI"
    );


  $("#midiStatus").className =
    "midiStatus connected";

}



/* ================================================= */
/* MESSAGE MIDI */
/* ================================================= */

function handleMidiMessage(
  event
){

  const data =
    Array.from(
      event.data
    );


  if(data.length < 2)
    return;


  const status =
    data[0];


  const data1 =
    data[1];


  const data2 =
    data[2] || 0;


  const command =
    status & 0xF0;


  const channel =
    (status & 0x0F) + 1;


  let type =
    "UNKNOWN";


  if(command === 0x80)
    type = "NOTE OFF";


  if(command === 0x90)
    type =
      data2 > 0
        ? "NOTE ON"
        : "NOTE OFF";


  if(command === 0xB0)
    type = "CC";


  if(command === 0xE0)
    type = "PITCH";


  /*
     Affichage du message.
  */

  const messageText =
`Type: ${type}
Canal: ${channel}
Data 1: ${data1}
Data 2: ${data2}
HEX: ${data.map(
  x =>
    x.toString(16)
      .padStart(2,"0")
).join(" ")}`;


  $("#midiLog")
    .textContent =
      messageText;


  console.log(
    "MIDI:",
    {
      type,
      channel,
      data1,
      data2,
      raw:data
    }
  );


  /*
     MIDI LEARN
  */

  if(
    midiLearnMode &&
    midiLearningElement
  ){

    learnMidi(
      midiLearningElement,
      {
        type,
        channel,
        data1
      }
    );

    return;

  }


  /*
     Utiliser le mapping existant.
  */

  executeMidiMapping(
    {
      type,
      channel,
      data1,
      data2
    }
  );

}



/* ================================================= */
/* MIDI LEARN */
/* ================================================= */

$("#midiLearn").addEventListener(
  "click",
  () => {

    midiLearnMode =
      !midiLearnMode;


    $("#midiLearn")
      .classList
      .toggle(
        "active",
        midiLearnMode
      );


    if(!midiLearnMode){

      stopMidiLearning();

      return;

    }


    alert(
      "MODE MIDI LEARN activé.\n\n" +
      "Clique maintenant sur PLAY, CUE, " +
      "le crossfader ou un autre contrôle."
    );

  }
);



/* ================================================= */
/* PREPARER UN ELEMENT AU MIDI LEARN */
/* ================================================= */

function startMidiLearning(
  element
){

  if(!midiLearnMode){

    alert(
      "Active d'abord MIDI LEARN."
    );

    return;

  }


  if(midiLearningElement){

    midiLearningElement
      .classList
      .remove(
        "midiLearningTarget"
      );

  }


  midiLearningElement =
    element;


  midiLearningElement
    .classList
    .add(
      "midiLearningTarget"
    );


  $("#midiStatus").textContent =
    "🟡 En attente d'un bouton MIDI...";

}



/* ================================================= */
/* FIN MIDI LEARN */
/* ================================================= */

function stopMidiLearning(){

  if(midiLearningElement){

    midiLearningElement
      .classList
      .remove(
        "midiLearningTarget"
      );

  }


  midiLearningElement =
    null;

}



/* ================================================= */
/* APPRENDRE UN MESSAGE */
/* ================================================= */

function learnMidi(
  element,
  midi
){

  const action =
    element.dataset.midiAction;


  if(!action){

    /*
       On donne automatiquement
       un identifiant à l'élément.
    */

    if(!element.id){

      element.id =
        "midi_" +
        Math.random()
          .toString(36)
          .substring(2,8);

    }

  }


  const key =
    action ||
    element.id;


  midiMappings[key] = {

    type:midi.type,

    channel:midi.channel,

    data1:midi.data1

  };


  localStorage.setItem(
    "bluemixMidiMappings",
    JSON.stringify(
      midiMappings
    )
  );


  element
    .classList
    .remove(
      "midiLearningTarget"
    );


  $("#midiLog").textContent +=
    "\n\n✅ MAPPING ENREGISTRÉ";


  midiLearningElement =
    null;


  renderMidiMappings();


  /*
     On garde MIDI Learn actif
     pour pouvoir apprendre plusieurs boutons.
  */

}



/* ================================================= */
/* EXECUTER UN MAPPING */
/* ================================================= */

function executeMidiMapping(
  midi
){

  for(
    const key in midiMappings
  ){

    const mapping =
      midiMappings[key];


    if(
      mapping.type !== midi.type
    )
      continue;


    if(
      mapping.channel !== midi.channel
    )
      continue;


    if(
      mapping.data1 !== midi.data1
    )
      continue;


    executeAction(
      key,
      midi.data2
    );

  }

}



/* ================================================= */
/* ACTIONS MIDI */
/* ================================================= */

function executeAction(
  action,
  value
){

  /*
     PLAY A
  */

  if(action === "playA"){

    if(value > 0){

      togglePlay("A");

    }

    return;

  }


  /*
     PLAY B
  */

  if(action === "playB"){

    if(value > 0){

      togglePlay("B");

    }

    return;

  }


  /*
     CUE A
  */

  if(action === "cueA"){

    if(value > 0){

      cueDeck("A");

    }

    return;

  }


  /*
     CUE B
  */

  if(action === "cueB"){

    if(value > 0){

      cueDeck("B");

    }

    return;

  }


  /*
     CROSSFADEUR
  */

  if(action === "crossfader"){

    const cross =
      (
        value / 127
      ) * 2 - 1;


    $("#crossfader")
      .value =
        cross;


    updateMix();


    return;

  }


  /*
     VOLUME A
  */

  if(action === "volA"){

    $("#volA").value =
      value / 127;


    updateMix();


    return;

  }


  /*
     VOLUME B
  */

  if(action === "volB"){

    $("#volB").value =
      value / 127;


    updateMix();


    return;

  }


  /*
     PITCH A
  */

  if(action === "pitchA"){

    const pitch =
      (
        value / 127
      ) * 20 - 10;


    $("#pitchA").value =
      pitch;


    audioA.playbackRate =
      1 +
      pitch / 100;


    return;

  }


  /*
     PITCH B
  */

  if(action === "pitchB"){

    const pitch =
      (
        value / 127
      ) * 20 - 10;


    $("#pitchB").value =
      pitch;


    audioB.playbackRate =
      1 +
      pitch / 100;


    return;

  }


  /*
     HOT CUES
  */

  if(
    action.startsWith("cueA")
  ){

    if(value > 0){

      flashCue(
        action
      );

    }

    return;

  }


  if(
    action.startsWith("cueB")
  ){

    if(value > 0){

      flashCue(
        action
      );

    }

    return;

  }

}



/* ================================================= */
/* FLASH CUE */
/* ================================================= */

function flashCue(
  action
){

  const button =
    document.querySelector(
      `[data-midi-action="${action}"]`
    );


  if(!button)
    return;


  button.animate(
    [
      {
        transform:"scale(1)"
      },

      {
        transform:"scale(.85)"
      },

      {
        transform:"scale(1)"
      }

    ],
    {
      duration:150
    }
  );

}



/* ================================================= */
/* CLICK → MIDI LEARN */
/* ================================================= */

document.addEventListener(
  "click",
  event => {

    if(!midiLearnMode)
      return;


    const target =
      event.target.closest(
        "button, input"
      );


    if(!target)
      return;


    /*
       Ne pas apprendre les boutons
       du panneau MIDI lui-même.
    */

    if(
      target.closest(
        "#midiPanel"
      )
    ){

      return;

    }


    /*
       Contrôles intéressants.
    */

    const allowed =
      target.matches(
        "#playA, #playB, #cueA, #cueB, " +
        "#crossfader, #volA, #volB, " +
        "#pitchA, #pitchB, .cuePad"
      );


    if(!allowed)
      return;


    event.preventDefault();


    startMidiLearning(
      target
    );

  },
  true
);



/* ================================================= */
/* EFFACER MAPPING */
/* ================================================= */

$("#midiClear").addEventListener(
  "click",
  () => {

    if(
      !confirm(
        "Effacer tous les mappings MIDI ?"
      )
    ){

      return;

    }


    midiMappings = {};


    localStorage.removeItem(
      "bluemixMidiMappings"
    );


    renderMidiMappings();


    $("#midiStatus").textContent =
      "🟢 Mapping MIDI effacé.";

  }
);



/* ================================================= */
/* AFFICHER LES MAPPINGS */
/* ================================================= */

function renderMidiMappings(){

  const container =
    $("#mappingList");


  container.innerHTML = "";


  const keys =
    Object.keys(
      midiMappings
    );


  if(!keys.length){

    container.innerHTML =
      `<div class="mappingItem">
        Aucun mapping
      </div>`;

    return;

  }


  keys.forEach(
    key => {

      const map =
        midiMappings[key];


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "mappingItem";


      item.innerHTML =
        `<span>${key}</span>
         <span>
           ${map.type}
           CH ${map.channel}
           #${map.data1}
         </span>`;


      container.appendChild(
        item
      );

    }
  );

}



renderMidiMappings();



/* ================================================= */
/* ETAT MIDI */
/* ================================================= */

function handleMidiStateChange(
  event
){

  console.log(
    "MIDI state:",
    event.port.name,
    event.port.state
  );


  updateMidiDevices();

}



$("#midiConnect").addEventListener(
  "click",
  async () => {

    await connectMIDI();

  }
);



/* ================================================= */
/* HOT CUES CLIQUE */
/* ================================================= */

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
                transform:"scale(1)"
              },

              {
                transform:"scale(.9)"
              },

              {
                transform:"scale(1)"
              }

            ],
            {
              duration:150
            }
          );

        }
      );

    }
  );



/* ================================================= */
/* HORLOGE */
/* ================================================= */

function updateClock(){

  $("#clock")
    .textContent =
      new Date()
        .toLocaleTimeString(
          "fr-CA",
          {
            hour:"2-digit",
            minute:"2-digit"
          }
        );

}


setInterval(
  updateClock,
  1000
);


updateClock();



/* ================================================= */
/* FIN */
/* ================================================= */

console.log(
  "🎧 BlueMix DJ chargé."
);
