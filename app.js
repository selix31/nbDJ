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
// MIDI
// ============================

$("#midiBtn").addEventListener(
  "click",
  async()=>{

    if(!navigator.requestMIDIAccess){

      alert(
        "Le MIDI Web n'est pas disponible dans ce navigateur."
      );

      return;

    }

    try{

      const access =
        await navigator.requestMIDIAccess();

      const devices =
        [...access.inputs.values()]
        .map(
          device =>
            device.name ||
            "Contrôleur MIDI"
        );

      if(devices.length){

        alert(
          "Contrôleur MIDI détecté :\n\n" +
          devices.join("\n")
        );

      }else{

        alert(
          "Aucun contrôleur MIDI détecté."
        );

      }

    }catch(error){

      alert(
        "Permission MIDI refusée."
      );

    }

  }
);


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

setInterval(updateClock,1000);

updateClock();


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