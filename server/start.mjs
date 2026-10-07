import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {geocodeMiddleware} from './geocode.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
async function serve(req,res){
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://internal').pathname);}catch{res.writeHead(400);res.end();return;}
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  await stat(file);
 }catch{
  if(pathname.startsWith('/api/')){res.writeHead(404);res.end();return;}
  file=path.join(root,'index.html');
 }
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
 if(req.method==='HEAD'){res.end();return;}
 const stream=createReadStream(file);stream.on('error',()=>{if(!res.headersSent)res.writeHead(404);res.end();});stream.pipe(res);
}
const port=Number(process.env.PORT||5173);
http.createServer((req,res)=>{geocodeMiddleware(req,res,()=>{serve(req,res).catch(()=>{if(!res.headersSent)res.writeHead(500);res.end();});});}).listen(port,'0.0.0.0',()=>console.log(`FIREPLUG server listening on port ${port}`));
