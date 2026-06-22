// ============================================================
//  AUDIO — tiny WebAudio chiptune engine (no external files)
// ============================================================
const Audio2 = {
  ctx:null, master:null, muted:false,
  current:null, timer:null, step:0, started:false,
};

// note name -> frequency
const NOTE = (()=>{
  const base={C:261.63,D:293.66,E:329.63,F:349.23,G:392.00,A:440.00,B:493.88};
  const m={};
  for(const oct of [2,3,4,5,6]) for(const n in base){ m[n+oct]= base[n]*Math.pow(2,oct-4); }
  // sharps
  const sh={ "C#":277.18,"D#":311.13,"F#":369.99,"G#":415.30,"A#":466.16 };
  for(const oct of [2,3,4,5,6]) for(const n in sh){ m[n+oct]= sh[n]*Math.pow(2,oct-4); }
  return m;
})();

// ---- songs: [melody[], bass[], tempoMs] ----
const SONGS = {
  // gentle, folksy overworld theme
  field: {
    tempo:200,
    lead:["E5","G5","A5","G5","E5","D5","C5","D5","E5","G5","A5","B5","A5","G5","E5","-",
          "D5","E5","F5","E5","D5","C5","D5","-","C5","D5","E5","C5","G4","-","C5","-"],
    bass:["C3","-","G3","-","A3","-","E3","-","F3","-","C3","-","G3","-","C3","-",
          "C3","-","G3","-","F3","-","G3","-","C3","-","E3","-","G3","-","C3","-"],
    wave:"triangle",
  },
  // brisk battle theme
  battle: {
    tempo:140,
    lead:["A4","A4","C5","E5","A5","E5","C5","E5","G4","G4","B4","D5","G5","D5","B4","D5",
          "F4","A4","C5","F5","E5","C5","A4","C5","E5","G5","B5","A5","G5","E5","C5","-"],
    bass:["A2","A2","A2","E2","F2","F2","F2","C2","G2","G2","G2","D2","C2","C2","E2","E2",
          "A2","A2","A2","E2","F2","F2","F2","C2","G2","G2","B2","C3","E2","E2","A2","-"],
    wave:"square",
  },
  // triumphant short victory sting handled separately
};

function audioStart(){
  if(Audio2.started) return;
  try{
    Audio2.ctx = new (window.AudioContext||window.webkitAudioContext)();
    Audio2.master = Audio2.ctx.createGain();
    Audio2.master.gain.value = Audio2.muted?0:0.22;
    Audio2.master.connect(Audio2.ctx.destination);
    Audio2.started=true;
  }catch(e){ /* audio unavailable */ }
}

function beep(freq, dur, wave, gain, when){
  if(!Audio2.ctx || !isFinite(freq) || freq<=0) return;
  const o=Audio2.ctx.createOscillator(), g=Audio2.ctx.createGain();
  o.type=wave; o.frequency.value=freq;
  const t=when ?? Audio2.ctx.currentTime;
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(gain,t+0.02);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(Audio2.master);
  o.start(t); o.stop(t+dur+0.02);
}

function setMusic(name){
  if(!Audio2.started) return;
  if(Audio2.current===name) return;
  Audio2.current=name; Audio2.step=0;
  if(Audio2.timer) clearInterval(Audio2.timer);
  const song=SONGS[name]; if(!song) return;
  const tick=()=>{
    if(Audio2.muted){ return; }
    const i=Audio2.step % song.lead.length;
    const lead=song.lead[i], bass=song.bass[i];
    if(lead && lead!=="-") beep(NOTE[lead], song.tempo/1000*0.9, song.wave, 0.18);
    if(bass && bass!=="-") beep(NOTE[bass], song.tempo/1000*1.4, "triangle", 0.12);
    Audio2.step++;
  };
  tick();
  Audio2.timer=setInterval(tick, song.tempo);
}

function stopMusic(){
  if(Audio2.timer) clearInterval(Audio2.timer);
  Audio2.timer=null; Audio2.current=null;
}

function victorySting(){
  if(!Audio2.ctx) return;
  const seq=["C5","E5","G5","C6"]; const t0=Audio2.ctx.currentTime;
  seq.forEach((n,i)=>beep(NOTE[n],0.18,"square",0.2,t0+i*0.12));
}

function toggleMute(){
  Audio2.muted=!Audio2.muted;
  if(Audio2.master) Audio2.master.gain.value=Audio2.muted?0:0.22;
  const b=document.getElementById("muteBtn");
  if(b) b.textContent=Audio2.muted?"🔇":"🔊";
}
