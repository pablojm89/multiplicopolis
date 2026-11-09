const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,p);
  fs.readFile(f,(e,d)=>{ if(e){res.writeHead(404);res.end('404');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}); res.end(d); });
}).listen(4321,()=>console.log('serving on 4321'));
