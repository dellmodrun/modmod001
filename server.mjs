import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4427);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".xml":"application/xml; charset=utf-8",".txt":"text/plain; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".avif":"image/avif",".gif":"image/gif",".ico":"image/x-icon",".woff":"font/woff",".woff2":"font/woff2",".ttf":"font/ttf",".otf":"font/otf",".mp4":"video/mp4",".webm":"video/webm",".mp3":"audio/mpeg",".wav":"audio/wav",".wasm":"application/wasm",".pdf":"application/pdf"};

function resolveFile(pathname){
  const clean=decodeURIComponent(pathname).replace(/^\/+/,"");
  const target=path.resolve(root,clean);
  if(target!==root&&!target.startsWith(root+path.sep))return null;
  const candidates=[target,path.join(target,"index.html")];
  if(!path.extname(target))candidates.push(target+".html");
  for(const candidate of candidates){
    try{if(fs.statSync(candidate).isFile())return candidate}catch{}
  }
  return null;
}

async function proxyApi(request,response){
  const target=new URL(request.url,"https://www.hacktron.ai");
  const chunks=[];for await(const chunk of request)chunks.push(chunk);
  const upstream=await fetch(target,{method:request.method,headers:{"content-type":request.headers["content-type"]||"application/json","user-agent":request.headers["user-agent"]||"Mozilla/5.0"},body:["GET","HEAD"].includes(request.method)?undefined:Buffer.concat(chunks)});
  response.writeHead(upstream.status,Object.fromEntries([...upstream.headers].filter(([key])=>!["content-encoding","transfer-encoding","content-length"].includes(key))));
  response.end(Buffer.from(await upstream.arrayBuffer()));
}

const server=http.createServer(async(request,response)=>{
  try{
    const url=new URL(request.url,"http://localhost");
    if(url.pathname.startsWith("/api/"))return await proxyApi(request,response);
    if(url.pathname.startsWith("/_vercel/")){response.writeHead(204);return response.end()}
    const file=resolveFile(url.pathname);
    if(!file){response.writeHead(404,{"content-type":"text/plain; charset=utf-8"});return response.end("Not found")}
    response.writeHead(200,{"content-type":mime[path.extname(file).toLowerCase()]||"application/octet-stream","cache-control":"no-cache"});
    if(request.method==="HEAD")return response.end();
    fs.createReadStream(file).pipe(response);
  }catch(error){response.writeHead(500,{"content-type":"text/plain; charset=utf-8"});response.end(String(error?.message||error))}
});
server.listen(port,"127.0.0.1",()=>console.log(`Hacktron local mirror: http://127.0.0.1:${port}/`));
