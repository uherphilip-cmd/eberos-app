'use strict';
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.resolve(__dirname);
const port=Number.parseInt(process.argv[2]||'4173',10);
const contentTypes={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.ico':'image/x-icon','.jpg':'image/jpeg','.jpeg':'image/jpeg','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.woff2':'font/woff2'};
const server=http.createServer((request,response)=>{
  if(request.method!=='GET'&&request.method!=='HEAD'){response.writeHead(405,{Allow:'GET, HEAD'});response.end();return}
  let pathname;
  try{pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname)}catch{response.writeHead(400);response.end('Ungültige Adresse');return}
  const relative=pathname==='/'?'eberos-charakter-builder.html':pathname.replace(/^\/+/, '');
  const file=path.resolve(root,relative);
  if(file!==root&&!file.startsWith(root+path.sep)){response.writeHead(403);response.end('Nicht erlaubt');return}
  fs.stat(file,(statError,stat)=>{
    if(statError||!stat.isFile()){response.writeHead(404);response.end('Nicht gefunden');return}
    response.setHeader('Content-Type',contentTypes[path.extname(file).toLowerCase()]||'application/octet-stream');
    response.setHeader('Cache-Control','no-cache');
    response.setHeader('X-Content-Type-Options','nosniff');
    response.writeHead(200);
    if(request.method==='HEAD'){response.end();return}
    fs.createReadStream(file).on('error',()=>response.destroy()).pipe(response);
  });
});
server.on('error',error=>{console.error(error.message);process.exitCode=1});
server.listen(port,'127.0.0.1');
