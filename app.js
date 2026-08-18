const $ = selector => document.querySelector(selector);

const audioA = $("#audioA");
const audioB = $("#audioB");

const state = {

  A:{
    audio:audioA,
    title:$("#titleA"),
    artist:$("#artistA"),
    wave:$("#waveA"),
    play:$("#playA")
  },

  B:{
    audio:audioB,
    title:$("#titleB"),
    artist:$("#artistB"),
    wave:$("#waveB"),
    play:$("#playB")
  }

};


// ============================
// CHARGEMENT DES MUSIQUES
// ============================

function setupDeck(id,fileInput){

  $(fileInput).addEventListener("change",event=>{

    const file = event.target.files[0];

    if(!file) return;

    const deck = state[id];

    deck.audio.src = URL.createObjectURL(file);

    deck.title.textContent =
      file.name.replace(/\.[^/.]+$/,"");

    deck.artist.textContent =
      "Fichier local";

    deck.audio.load();

    drawWave(deck.wave,id);

  });


  // PLAY / PAUSE

  state[id].play.addEventListener("click",()=>{

    const deck = state[id];

    if(deck.audio.paused){

      deck.audio.play();

      deck.play.textContent = "❚❚";

    }else{

      deck.audio.pause();

      deck.play.textContent = "▶";

    }

  });

}


// Initialisation

setupDeck("A","#fileA");
setupDeck("B","#fileB");


// ============================
// WAVEFORM
// ============================

function drawWave(canvas,id){

  const ctx = canvas.getContext("2d");

  const width =
    canvas.width =
    canvas.clientWidth *
    devicePixelRatio;

  const height =
    canvas.height =
    canvas.clientHeight *
    devicePixelRatio;

  ctx.clearRect(0,0,width,height);

  ctx.strokeStyle =
    id === "A"
      ? "#1598ff"
      : "#ff3e4d";

  ctx.lineWidth =
    2 * devicePixelRatio;

  ctx.beginPath();

  for(let x=0;x<width;x++){

    const y =
      height/2 +
      Math.sin(x*0.055) *
      height*0.16 +
      Math.sin(x*0.013) *
      height*0.18;

    ctx.lineTo(x,y);

  }

  ctx.stroke();

}


drawWave($("#waveA"),"A");
drawWave($("#waveB"),"B");

window.addEventListener(
  "resize",
  ()=>{
    drawWave($("#waveA"),"A");
    drawWave($("#waveB"),"B");
  }
);


// ============================
// CROSSFADER
// ============================

function updateMix(){

  const cross =
    Number($("#crossfader").value);

  const volumeA =
    Math.max(
      0,
      Math.min(1,(1-cross)/2)
    );

  const volumeB =
    Math.max(
      0,
      Math.min(1,(1+cross)/2)
    );

  audioA.volume =
    volumeA *
    Number($("#volA").value);

  audioB.volume =
    volumeB *
    Number($("#volB").value);

}


$("#crossfader")
  .addEventListener("input",updateMix);

$("#volA")
  .addEventListener("input",updateMix);

$("#volB")
  .addEventListener("input",updateMix);

updateMix();


// ============================
// PITCH
// ============================

$("#pitchA").addEventListener(
  "input",
  event=>{

    audioA.playbackRate =
      1 +
      Number(event.target.value)/100;

  }
);


$("#pitchB").addEventListener(
  "input",
  event=>{

    audioB.playbackRate =
      1 +
      Number(event.target.value)/100;

  }
);


// ============================
// JOG WHEELS
// ============================

function setupJog(id,audio){

  const jog = $(id);

  let touching = false;
  let lastX = 0;

  jog.addEventListener(
    "pointerdown",
    event=>{

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
    ()=>{
      touching = false;
    }
  );


  jog.addEventListener(
    "pointermove",
    event=>{

      if(!touching) return;

      const movement =
        event.clientX-lastX;

      lastX =
        event.clientX;

      if(audio.paused) return;

      audio.currentTime =
        Math.max(
          0,
          audio.currentTime +
          movement*0.02
        );

    }
  );

}


setupJog("#jogA",audioA);
setupJog("#jogB",audioB);


// ============================
// REC
// ============================

$("#recordBtn").addEventListener(
  "click",
  ()=>{

    $("#recordBtn")
      .classList
      .toggle("active");

  }
);


// ============================
// MIDI DJ2GO2
// ============================

let midiAccess = null;
let midiInput = null;


// Connexion MIDI

async function connectDJ2GO2(){

  if(!navigator.requestMIDIAccess){

    alert(
      "Le MIDI Web n'est pas disponible dans ce navigateur."
    );

    return;

  }


  try{

    midiAccess =
      await navigator.requestMIDIAccess();


    const inputs =
      [...midiAccess.inputs.values()];


    if(inputs.length === 0){

      alert(
        "Aucun contrôleur MIDI détecté."
      );

      return;

    }


    console.log("MIDI disponibles :");

    inputs.forEach(input=>{

      console.log(
        input.name,
        input.id
      );

    });


    // Chercher le DJ2GO2

    midiInput =
      inputs.find(
        input =>
          (input.name || "")
            .toLowerCase()
            .includes("dj2go2")
      );


    // Certains appareils peuvent apparaître
    // sous un autre nom.

    if(!midiInput){

      midiInput =
        inputs.find(
          input =>
            (input.name || "")
              .toLowerCase()
              .includes("dj2go")
        );

    }


    // Si le DJ2GO2 n'est pas trouvé,
    // utiliser la première entrée MIDI.

    if(!midiInput){

      midiInput = inputs[0];

    }


    midiInput.onmidimessage =
      handleMIDIMessage;


    console.log(
      "================================"
    );

    console.log(
      "CONTRÔLEUR MIDI CONNECTÉ"
    );

    console.log(
      "Nom :",
      midiInput.name
    );

    console.log(
      "ID :",
      midiInput.id
    );

    console.log(
      "================================"
    );


    alert(
      "Contrôleur connecté :\n\n" +
      midiInput.name +
      "\n\n" +
      "Appuie sur un bouton de ta DJ2GO2."
    );


  }catch(error){

    console.error(
      "Erreur MIDI :",
      error
    );

    alert(
      "Impossible d'ouvrir le MIDI."
    );

  }

}


// Bouton MIDI

$("#midiBtn").addEventListener(
  "click",
  connectDJ2GO2
);


// ============================
// RÉCEPTION MIDI
// ============================

function handleMIDIMessage(event){

  const data =
    [...event.data];


  const status =
    data[0];

  const data1 =
    data[1];

  const data2 =
    data[2];


  const messageType =
    status & 0xF0;


  const channel =
    (status & 0x0F) + 1;


  console.log(
    "DJ2GO2 MIDI :",
    {
      type:messageType.toString(16),
      channel:channel,
      data1:data1,
      data2:data2
    }
  );


  // ==========================
  // NOTE ON
  // ==========================

  if(
    messageType === 0x90 &&
    data2 > 0
  ){

    console.log(
      "NOTE ON",
      "CH:",
      channel,
      "NOTE:",
      data1,
      "VALUE:",
      data2
    );

    return;

  }


  // ==========================
  // NOTE OFF
  // ==========================

  if(
    messageType === 0x80
  ){

    console.log(
      "NOTE OFF",
      "CH:",
      channel,
      "NOTE:",
      data1
    );

    return;

  }


  // ==========================
  // CONTROL CHANGE
  // ==========================

  if(
    messageType === 0xB0
  ){

    console.log(
      "CC",
      "CH:",
      channel,
      "CC:",
      data1,
      "VALUE:",
      data2
    );

    return;

  }


  // ==========================
  // PITCH BEND
  // ==========================

  if(
    messageType === 0xE0
  ){

    const value =
      data1 |
      (data2 << 7);


    console.log(
      "PITCH BEND",
      "CH:",
      channel,
      "VALUE:",
      value
    );

  }

}


// ============================
// HOT CUES
// ============================

document
.querySelectorAll(".cuePad")
.forEach(button=>{

  button.addEventListener(
    "click",
    ()=>{

      button.animate(
        [
          {transform:"scale(1)"},
          {transform:"scale(.9)"},
          {transform:"scale(1)"}
        ],
        {
          duration:150
        }
      );

    }
  );

});


// ============================
// HORLOGE
// ============================

function updateClock(){

  $("#clock").textContent =
    new Date().toLocaleTimeString(
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
