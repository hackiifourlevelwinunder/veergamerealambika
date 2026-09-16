const http=require('http'),fs=require('fs'),crypto=require('crypto'),url=require('url');
const PORT=Number(process.env.PORT)||3000,HOST='0.0.0.0',PASS=process.env.ADMIN_PASSWORD||'jay@0099',BASE=__dirname,FILE=__dirname+'/data.runtime.json';
const DEF={settings:{appName:'AMBIKA HACK',logoUrl:'https://cdn.phototourl.com/free/2026-09-05-e7988a19-dd93-4d34-8c85-a7f55d287064.jpg',registerUrl:'https://www.veergame37.com/#/register?invitationCode=91156122519',rechargeUrl:'https://www.veergame37.com/#/wallet/recharge',referralCode:'91156122519',telegramSupport:'https://t.me/queenambika122',telegramUsername:'@queenambika122',broadcastMessage:'',previewLossCount:1,minRecharge:500},users:[],keys:[]};
let db;try{db=JSON.parse(fs.readFileSync(FILE,'utf8'));}catch(e){db=DEF;fs.writeFileSync(FILE,JSON.stringify(db,null,2));}
const save=()=>fs.writeFileSync(FILE,JSON.stringify(db,null,2));
const tokens=new Map();
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));};
const body=req=>new Promise((resolve,reject)=>{let s='';req.on('data',c=>{s+=c;if(s.length>1000000)req.destroy();});req.on('end',()=>{try{resolve(s?JSON.parse(s):{});}catch(e){reject(e);}});});
const isAdmin=req=>{const t=(req.headers.authorization||'').replace(/^Bearer\s+/,'');return tokens.has(t)&&tokens.get(t)>Date.now();};
const server=http.createServer(async(req,res)=>{
 const u=url.parse(req.url,true);
 if(req.method==='GET'&&u.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return fs.createReadStream(BASE+'/index.html').on('error',()=>send(res,500,{success:false,message:'index.html unavailable'})).pipe(res);}
 if(req.method==='GET'&&u.pathname==='/api/settings')return send(res,200,db.settings);
 if(req.method==='GET'&&u.pathname==='/health')return send(res,200,{ok:true});
 if(req.method==='POST'&&u.pathname==='/api/auth'){
  try{const b=await body(req);
   if(b.action==='get_all_data')return send(res,200,{success:true,...db});
   if(b.action==='validate_uid'){const x=db.users.find(v=>String(v.uid)===String(b.uid));if(!x)return send(res,200,{success:false,msg:'UID not authorized'});if(x.status!=='active')return send(res,200,{success:false,msg:'UID disabled'});return send(res,200,{success:true,...x,expiresAt:x.expiresAt||null,remainingText:'Active Access',registerUrl:db.settings.registerUrl,rechargeUrl:db.settings.rechargeUrl});}
   if(b.action==='validate_key'){const k=db.keys.find(v=>String(v.key).toUpperCase()===String(b.key).toUpperCase());if(!k||k.status!=='active')return send(res,200,{success:false,msg:'Invalid VIP key'});return send(res,200,{success:true,...k,expiresAt:k.expiresAt||null});}
   return send(res,400,{success:false,msg:'Unsupported action'});
  }catch(e){return send(res,400,{success:false,msg:'Bad request'});}
 }
 if(req.method==='POST'&&u.pathname==='/api/admin/login'){const b=await body(req);if(String(b.password)===String(PASS)){const t=crypto.randomBytes(24).toString('hex');tokens.set(t,Date.now()+86400000);return send(res,200,{success:true,token:t});}return send(res,401,{success:false,message:'Invalid password'});}
 if(u.pathname.startsWith('/api/admin/')&&!isAdmin(req))return send(res,401,{success:false,message:'Unauthorized'});
 if(req.method==='GET'&&u.pathname==='/api/admin/data')return send(res,200,db);
 if(req.method==='POST'&&u.pathname==='/api/admin/settings'){const b=await body(req);db.settings={...db.settings,...b};save();return send(res,200,{success:true,settings:db.settings});}
 if(req.method==='POST'&&u.pathname==='/api/admin/uids'){const b=await body(req);const uid=String(b.uid||'').trim();if(!uid)return send(res,400,{message:'UID required'});if(db.users.some(x=>String(x.uid)===uid))return send(res,409,{message:'UID already exists'});db.users.push({uid,plan:b.plan||'VIP',todayRecharge:Number(b.todayRecharge||0),status:b.status==='disabled'?'disabled':'active',expiresAt:b.expiresAt||'',hwid:'',notes:b.notes||''});save();return send(res,200,{success:true});}
 if(u.pathname.startsWith('/api/admin/uids/')){const uid=decodeURIComponent(u.pathname.slice('/api/admin/uids/'.length));const x=db.users.find(v=>String(v.uid)===uid);if(!x)return send(res,404,{message:'UID not found'});if(req.method==='PATCH'){const b=await body(req);if(b.toggle)x.status=x.status==='active'?'disabled':'active';if(b.resetHwid)x.hwid='';save();return send(res,200,{success:true,user:x});}if(req.method==='DELETE'){db.users=db.users.filter(v=>String(v.uid)!==uid);save();return send(res,200,{success:true});}}
 if(req.method==='DELETE'&&u.pathname.startsWith('/api/admin/keys/')){const key=decodeURIComponent(u.pathname.slice('/api/admin/keys/'.length));db.keys=db.keys.filter(v=>String(v.key)!==key);save();return send(res,200,{success:true});}
 res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end('Not found');
});
server.listen(PORT,HOST,()=>console.log('AMBIKA HACK server listening on '+HOST+':'+PORT));

