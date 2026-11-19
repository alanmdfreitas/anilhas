import {WORKOUTS,EXERCISES} from './data.js';
export const STORAGE_KEY='anilhas:v1';
export const isoDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const parseDate=s=>new Date(`${s}T12:00:00`);
export function monday(date=isoDate()){const d=parseDate(date);d.setDate(d.getDate()-((d.getDay()+6)%7));return isoDate(d);}
export function dayOffset(date,n){const d=parseDate(date);d.setDate(d.getDate()+n);return isoDate(d);}
export function cycleFor(start,date){const dayMs=s=>Date.UTC(...s.split('-').map((x,i)=>Number(x)-(i===1?1:0)));const weeks=Math.floor((dayMs(monday(date))-dayMs(monday(start)))/604800000);return {week:((Math.max(0,weeks))%4)+1,cycle:Math.floor(Math.max(0,weeks)/4)+1};}
export const setsFor=(item,week)=>week===4?Math.max(1,Math.ceil(item.sets/2)):item.sets;
export const cardioFor=(workout,week)=>Array.isArray(workout.cardioWeeks)?(workout.cardioWeeks[week-1]||workout.cardio):workout.cardio;
export function targetFor(item,id=item.id){if(id!==item.id&&['deadbug','birddog'].includes(id))return {...item,min:6,max:8};if(id!==item.id&&EXERCISES[id].unit==='seconds')return {...item,min:15,max:20};return item;}
export function initialState(){return {version:1,settings:{startDate:monday(),sound:true,vibrate:true},sessions:[],timer:null,lastBackup:null};}
export function validNumber(v,max=500){if(typeof v==='string'&&!v.trim())return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)&&n>=0&&n<=max?n:null;}
export function validateState(value){
  if(!value||value.version!==1||!value.settings||!/^\d{4}-\d{2}-\d{2}$/.test(value.settings.startDate)||isoDate(parseDate(value.settings.startDate))!==value.settings.startDate||!Array.isArray(value.sessions)||value.sessions.length>10000)throw new Error('Arquivo de backup incompatível. Use um arquivo exportado pelo Anilhas.');
  const clean={...initialState(),settings:{startDate:value.settings.startDate,sound:value.settings.sound!==false,vibrate:value.settings.vibrate!==false},lastBackup:typeof value.lastBackup==='string'?value.lastBackup:null,sessions:[],timer:null};
  const ids=new Set();
  for(const s of value.sessions){
    if(!s||typeof s.id!=='string'||ids.has(s.id)||!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||isoDate(parseDate(s.date))!==s.date||!WORKOUTS.some(w=>w.id===s.workoutId)||!Number.isInteger(s.week)||s.week<1||s.week>4||!Number.isInteger(s.cycle)||s.cycle<1||typeof s.startedAt!=='number'||!Number.isFinite(s.startedAt)||!Array.isArray(s.entries)||s.entries.length>30)throw new Error('O backup contém uma sessão inválida. Nenhum registro foi alterado.');
    ids.add(s.id);const slots=new Set();let maxSlot=-1;
    const session={id:s.id,date:s.date,workoutId:s.workoutId,week:s.week,cycle:s.cycle,startedAt:s.startedAt,finishedAt:typeof s.finishedAt==='number'&&Number.isFinite(s.finishedAt)&&s.finishedAt>=s.startedAt?s.finishedAt:null,notes:typeof s.notes==='string'?s.notes.slice(0,1000):'',entries:[]};
    const workout=WORKOUTS.find(w=>w.id===s.workoutId);
    for(const e of s.entries){const prescription=e&&Number.isInteger(e.slot)?workout.items[e.slot]:null;const allowed=prescription?[prescription.id,prescription.alt,...(prescription.legacy||[])].filter(Boolean):[],allowedSets=prescription?[setsFor(prescription,s.week),...(prescription.legacySets||[])]:[];if(!e||!prescription||slots.has(e.slot)||!EXERCISES[e.exerciseId]||!allowed.includes(e.exerciseId)||!Array.isArray(e.sets)||!allowedSets.includes(e.sets.length))throw new Error('O backup contém um exercício inválido. Nenhum registro foi alterado.');slots.add(e.slot);maxSlot=Math.max(maxSlot,e.slot);
      session.entries.push({slot:e.slot,exerciseId:e.exerciseId,sets:e.sets.map(r=>{if(!r||!(r.kg===null||typeof r.kg==='number'&&validNumber(r.kg)!==null)||!(r.reps===null||Number.isInteger(r.reps)&&validNumber(r.reps,600)!==null)||typeof r.done!=='boolean'||r.done&&(r.kg===null||!Number.isInteger(r.reps)||r.reps<1))throw new Error('O backup contém uma série inválida. Nenhum registro foi alterado.');return {kg:r.kg,reps:r.reps,done:r.done,rirOk:r.rirOk===true};})});
    }
    if(!slots.size||slots.size!==maxSlot+1||slots.size>workout.items.length)throw new Error('O backup contém uma sessão incompleta. Nenhum registro foi alterado.');
    clean.sessions.push(session);
  }
  if(value.timer&&typeof value.timer.deadline==='number'&&Number.isFinite(value.timer.deadline)&&value.timer.deadline>Date.now()-86400000&&value.timer.deadline<Date.now()+3600000&&typeof value.timer.total==='number'&&value.timer.total>0&&typeof value.timer.label==='string')clean.timer={deadline:value.timer.deadline,total:value.timer.total,label:value.timer.label.slice(0,120)};
  return clean;
}
export function previousEntry(state,id,date,excludeId){return state.sessions.filter(s=>s.date<=date&&s.id!==excludeId).sort((a,b)=>b.startedAt-a.startedAt).flatMap(s=>s.entries).find(e=>e.exerciseId===id&&e.sets.some(r=>r.done))||null;}
export function makeEntry(state,item,slot,date,week,excludeId){const last=previousEntry(state,item.id,date,excludeId);const body=['body','seconds'].includes(EXERCISES[item.id].unit);return {slot,exerciseId:item.id,sets:Array.from({length:setsFor(item,week)},(_,i)=>{const prev=last?.sets.filter(r=>r.done)[i]||last?.sets.find(r=>r.done);return {kg:body?0:(prev?.kg??null),reps:prev?.reps??item.min,done:false,rirOk:false};})};}
export function createSession(state,workoutId,date){const w=WORKOUTS.find(w=>w.id===workoutId);const cycle=cycleFor(state.settings.startDate,date);const session={id:crypto.randomUUID(),date,workoutId,...cycle,startedAt:Date.now(),finishedAt:null,notes:'',entries:w.items.map((it,i)=>makeEntry(state,it,i,date,cycle.week))};state.sessions.push(session);return session;}
export function progress(session){const sets=session?.entries.flatMap(e=>e.sets)||[];return {done:sets.filter(s=>s.done).length,total:sets.length};}
export function canProgress(entry,item,week){return week!==4&&EXERCISES[entry.exerciseId]?.unit!=='seconds'&&entry.sets.length===item.sets&&entry.sets.every(s=>s.done&&s.reps>=item.max&&s.rirOk)&&entry.sets.some(s=>s.kg>0);}
export function backupJSON(state){const data=validateState(state);data.lastBackup=new Date().toISOString();return JSON.stringify({app:'Anilhas',...data},null,2);}
