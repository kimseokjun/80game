"use strict";
// 진행 루프, 로그, 선택창. v1 엔진을 분리해서 가져왔다.
let S=null,settings={auto:false,pace:1};
let timer=null,speed=1,busy=false,baseMs=2600;

function E(o){
  for(const k in o){
    if(k==='money'){S.money+=o[k];continue;}
    S[k]=clamp(S[k]+o[k],0,100);
  }
}
let pendingGain=[];

/* ---------- 로그 ---------- */
let lastHeader=null;
function header(){
  const key=S.age;
  if(lastHeader===key)return;
  lastHeader=key;
  const d=document.createElement('div');d.className='year';
  d.innerHTML=`<b>${S.birthY+S.age}</b><span>${S.age}살 · ${gradeLabel(S.age)} · ${stageOf(S.age).name}</span>`;
  $('#log').appendChild(d);
}
function addLog(text,opt={}){
  header();
  const wrap=$('#logWrap'),stick=wrap.scrollHeight-wrap.scrollTop-wrap.clientHeight<80;
  const d=document.createElement('div');d.className='entry'+(opt.kind?' '+opt.kind:'');
  const body=document.createElement('div');
  const p=document.createElement('p');
  if(opt.tag){const t=document.createElement('span');t.className='tag'+(opt.tagCls?' '+opt.tagCls:'');t.textContent=opt.tag;p.appendChild(t);}
  p.appendChild(document.createTextNode(text));body.appendChild(p);
  if(opt.pick){const q=document.createElement('p');q.className='pick';q.textContent='→ '+opt.pick;body.appendChild(q);}
  if(opt.res){const q=document.createElement('p');q.className='res';q.textContent=opt.res;body.appendChild(q);}
  if(pendingGain.length){const g=document.createElement('span');g.className='gain';g.textContent=pendingGain.join(' · ');body.lastChild.appendChild(g);pendingGain=[];}
  d.innerHTML=`<div class="when">${opt.when||gradeLabel(S.age)}</div>`;d.appendChild(body);
  $('#log').appendChild(d);
  if(stick)wrap.scrollTop=wrap.scrollHeight;
}

/* ---------- 선택창 ---------- */
function renderHint(el,h){
  (h.d||'').split(' ').filter(Boolean).forEach((tk,i)=>{
    if(i)el.appendChild(document.createTextNode(' '));
    const sp=document.createElement('span');sp.textContent=tk;
    if(/^(정보보안|개발|연구|경영|창업)$/.test(tk))sp.className='in';
    else if(tk.includes('↑'))sp.className='up';else if(tk.includes('↓')||/^−.*원$/.test(tk))sp.className='dn';
    el.appendChild(sp);
  });
  if(h.p){const v=clamp(h.p(),0,1),t=v>=0.6?'높음':v>=0.35?'보통':'낮음';el.appendChild(document.createTextNode((h.d?' · ':'')+(h.pl||'성공 가능성')+' '+t));}
}
function ask(title,text,choices){
  return new Promise(res=>{
    $('#mWhen').textContent=`${S.birthY+S.age}년 · ${S.age}살 · ${gradeLabel(S.age)}`;
    $('#mTitle').textContent=title;$('#mText').textContent=text;
    const box=$('#mChoices');box.innerHTML='';
    let done=false;const finish=i=>{if(done)return;done=true;$('#modal').hidden=true;res(i);};
    choices.forEach((c,i)=>{
      const b=document.createElement('button');b.type='button';b.textContent=c.t;
      if(c.d||c.p){const s=document.createElement('small');renderHint(s,{d:c.d,p:c.p,pl:c.pl});b.appendChild(s);}
      b.addEventListener('click',()=>finish(i));box.appendChild(b);
    });
    $('#modal').hidden=false;
    if(settings.auto){
      const i=choices.wAuto?wpick(choices.map((c,j)=>({w:choices.wAuto(c),j}))).j:Math.floor(R()*choices.length);
      setTimeout(()=>box.children[i]&&box.children[i].classList.add('auto'),Math.min(700,1400/speed));
      setTimeout(()=>finish(i),Math.max(250,1800/Math.max(speed,1)));
    }else box.firstChild.focus();
  });
}
async function resolve(title,text,choices,kind){
  const i=await ask(title,text,choices);
  const res=choices[i].f();
  addLog(text,{pick:choices[i].t,res:res||'',kind:kind||''});
  return i;
}

/* ---------- 루프 ---------- */
function schedule(){
  clearTimeout(timer);
  if(!S||S.ended||speed===0)return;
  timer=setTimeout(async()=>{
    busy=true;await yearTick();busy=false;render();
    if(S.ended){showEnding();return;}
    schedule();
  },baseMs/speed);
}
