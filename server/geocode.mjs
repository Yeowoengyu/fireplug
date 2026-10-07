import https from 'node:https';
import {HttpsProxyAgent} from 'https-proxy-agent';
const cache=new Map();
const proxy=process.env.HTTPS_PROXY||process.env.https_proxy;
const agent=proxy?new HttpsProxyAgent(proxy):undefined;
function requestAddress(query,key){
 return new Promise((resolve,reject)=>{
  const url=new URL('https://dapi.kakao.com/v2/local/search/address.json');url.searchParams.set('query',query);url.searchParams.set('analyze_type','exact');url.searchParams.set('size','10');
  const request=https.get(url,{agent,headers:{Authorization:`KakaoAK ${key}`}},response=>{
   let body='';response.setEncoding('utf8');response.on('data',part=>{body+=part;if(body.length>1000000){response.destroy();reject(new Error('response-too-large'));}});
   response.on('end',()=>{if(response.statusCode!==200){reject(new Error(`upstream-${response.statusCode}`));return;}try{resolve(JSON.parse(body).documents||[]);}catch{reject(new Error('invalid-response'));}});
   response.on('error',()=>reject(new Error('network-error')));
  });request.setTimeout(15000,()=>request.destroy(new Error('timeout')));request.on('error',()=>reject(new Error('network-error')));
 });
}
export async function geocodeMiddleware(req,res,next){
 const url=new URL(req.url,'http://internal');if(url.pathname!=='/api/geocode'){next();return;}
 const send=(status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));};
 if(req.method!=='GET'){send(405,{message:'GET 요청만 지원합니다.'});return;}
 let query=(url.searchParams.get('address')||'').trim().replace(/\s+/g,' ');
 if(query.length<3||query.length>200){send(400,{message:'상세 도로명주소 또는 지번주소를 입력해 주세요.'});return;}
 const key=process.env.KAKAO_REST_API_KEY?.trim();if(!key){send(503,{message:'서버 주소 검색 키가 설정되지 않았습니다. 등록된 엑셀 주소는 계속 검색할 수 있습니다.'});return;}
 if(!query.startsWith('대구'))query=query.startsWith('서구 ')?'대구 '+query:'대구 서구 '+query;
 if(cache.has(query)){send(200,{locations:cache.get(query)});return;}
 try{
  const docs=await requestAddress(query,key);
  const locations=docs.filter(d=>['ROAD_ADDR','REGION_ADDR'].includes(d.address_type)&&d.address?.region_1depth_name==='대구'&&d.address?.region_2depth_name==='서구').map(d=>({name:d.address_name,address:d.address_name,lat:Number(d.y),lng:Number(d.x)})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
  const unique=[...new Map(locations.map(p=>[p.address,p])).values()];
  if(cache.size>=500)cache.delete(cache.keys().next().value);cache.set(query,unique);
  send(200,{locations:unique});
 }catch(error){
  const authentication=['upstream-401','upstream-403'].includes(error.message);
  send(authentication?503:502,{message:authentication?'카카오 주소 검색 인증 또는 앱 권한을 확인해 주세요.':'주소 검색 서비스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.'});
 }
}
