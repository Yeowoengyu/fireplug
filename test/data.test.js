import test from 'node:test';
import assert from 'node:assert/strict';
import {locations,hydrants,datasetSummary,nearest,recommend,distance} from '../src/data.js';
test('좌표가 확인된 소화전만 가져오고 원본 식별자 유지',()=>{assert.ok(hydrants.length>0);assert.equal(hydrants.length,datasetSummary.mapped);assert.equal(new Set(hydrants.map(h=>h.id)).size,hydrants.length);for(const h of hydrants){assert.ok(Number.isFinite(h.lat)&&Number.isFinite(h.lng));assert.ok(h.lat>35&&h.lat<36&&h.lng>128&&h.lng<129);assert.ok(['지상식소화전','지하식소화전'].includes(h.type));assert.ok(h.gisId);}});
test('등록 주소에서 가까운 3곳을 거리순으로 반환',()=>{for(const p of locations){const result=nearest(p);assert.equal(result.length,3);assert.ok(result[0].distance<=result[1].distance&&result[1].distance<=result[2].distance);assert.equal(new Set(result.map(x=>x.id)).size,3);}});
test('점검 데이터 없는 소화전을 정상으로 지정하거나 추천하지 않음',()=>{for(const h of hydrants){assert.equal(h.status,'미확인');assert.equal(h.date,undefined);assert.equal(h.pressure,undefined);}assert.equal(recommend(nearest(locations[0])),undefined);});
test('동일 좌표 거리는 0이며 거리는 대칭',()=>{assert.equal(distance(locations[0],locations[0]),0);assert.equal(distance(locations[0],locations.at(-1)),distance(locations.at(-1),locations[0]));});
