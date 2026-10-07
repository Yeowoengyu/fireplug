import records from './hydrants.json' with {type:'json'};
import summary from './dataset-summary.json' with {type:'json'};
export const datasetSummary=summary;
export const hydrants=records;
export const locations=[...new Map(records.map(h=>[h.address,{name:h.address,address:h.address,lat:h.lat,lng:h.lng}])).values()];
export function distance(a,b){const r=Math.PI/180;const x=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lng-a.lng)*r/2)**2;return Math.round(6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));}
export function nearest(origin){return hydrants.map(h=>({...h,distance:distance(origin,h)})).sort((a,b)=>a.distance-b.distance).slice(0,3);}
export function recommend(items){return [...items].filter(h=>h.status==='정상').sort((a,b)=>a.distance-b.distance || (b.date||'').localeCompare(a.date||''))[0]?.id;}
