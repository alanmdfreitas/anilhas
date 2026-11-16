import fs from 'node:fs/promises';
import {initialState,createSession,backupJSON} from '../core.js';
const st=initialState();st.settings.startDate='2026-11-16';const s=createSession(st,'seg','2026-11-09');s.week=3;
for(const row of s.entries[0].sets)Object.assign(row,{kg:45,reps:12,done:true,rirOk:true});
s.finishedAt=s.startedAt+1;s.notes='Dados sintéticos de teste';
await fs.writeFile(new URL('backup-valid.json',import.meta.url),backupJSON(st));
st.settings.startDate='2026-10-26';
await fs.writeFile(new URL('backup-deload.json',import.meta.url),backupJSON(st));
await fs.writeFile(new URL('backup-invalid.json',import.meta.url),JSON.stringify({version:999}));
