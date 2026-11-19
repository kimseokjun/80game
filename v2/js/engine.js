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
  const sub=S.phase&&S.phase!=='school'?phaseName():`${S.age>7?gradeLabel(S.age)+' · ':''}${stageOf(S.age).name}`;
  d.innerHTML=`<b>${S.birthY+S.age}</b><span>${S.age}살 · ${sub}</span>`;
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
  d.innerHTML=`<div class="when">${opt.when||curWhen()}</div>`;d.appendChild(body);
  $('#log').appendChild(d);
  if(stick)wrap.scrollTop=wrap.scrollHeight;
}

/* ---------- 선택창 ---------- */
function renderHint(el,c){
  (c.d||'').split(' ').filter(Boolean).forEach((tk,i)=>{
    if(i)el.appendChild(document.createTextNode(' '));
    const sp=document.createElement('span');sp.textContent=tk;
    if(/[+]/.test(tk))sp.className='up';else if(/−/.test(tk))sp.className='dn';
    el.appendChild(sp);
  });
  if(c.p){const v=clamp(c.p(),0,1),t=v>=0.6?'높음':v>=0.35?'보통':'낮음';el.appendChild(document.createTextNode((c.d?' · ':'')+(c.pl||'성공 가능성')+' '+t));}
}
function ask(title,text,choices,note,opt={}){
  return new Promise(res=>{
    render();
    $('#mWhen').textContent=`${S.birthY+S.age}년 · ${S.age}살 · ${S.phase&&S.phase!=='school'?S.label:gradeLabel(S.age)}`;
    $('#mBig').hidden=!opt.big;
    $('#mTitle').textContent=title;$('#mText').textContent=text;
    $('#mNote').hidden=!note;$('#mNote').textContent=note||'';
    const box=$('#mChoices');box.innerHTML='';
    let done=false;const finish=i=>{if(done)return;done=true;$('#modal').hidden=true;$('#mResume').hidden=true;res(i);};
    $('#mPark').hidden=settings.auto;
    choices.forEach((c,i)=>{
      const b=document.createElement('button');b.type='button';
      b.innerHTML=`<span class="num">${i+1}</span><span class="ct"></span>`;const ct=b.querySelector('.ct');ct.textContent=c.t;
      if(S.age>=8&&(c.d||c.p)){const sm=document.createElement('small');renderHint(sm,c);ct.appendChild(sm);}
      b.addEventListener('click',()=>finish(i));box.appendChild(b);
    });
    $('#mAuto').hidden=settings.auto||choices.length<2;
    $('#mAuto').onclick=()=>{settings.auto=true;$('#autoPick').checked=true;$('#mAuto').hidden=true;const i=choices.wAuto?wpick(choices.map((c,j)=>({w:choices.wAuto(c),j}))).j:Math.floor(R()*choices.length);box.children[i].classList.add('auto');setTimeout(()=>finish(i),500);};
    $('#modal').hidden=false;
    if(settings.auto){
      const i=choices.wAuto?wpick(choices.map((c,j)=>({w:choices.wAuto(c),j}))).j:Math.floor(R()*choices.length);
      setTimeout(()=>box.children[i]&&box.children[i].classList.add('auto'),Math.min(700,1400/speed));
      setTimeout(()=>finish(i),Math.max(250,1800/Math.max(speed,1)));
    }else box.firstChild.focus();
  });
}
async function resolve(title,text,choices,kind,note,opt){
  const i=await ask(title,text,choices,note,opt);
  const res=choices[i].f();
  addLog(text,{pick:choices[i].t,res:res||'',kind:kind||''});
  return i;
}

/* ---------- 루프 ---------- */
function schedule(){
  clearTimeout(timer);
  if(!S||S.ended||speed===0)return;
  timer=setTimeout(async()=>{
    busy=true;await tick();busy=false;render();
    if(S.ended){showEnding();return;}
    schedule();
  },baseMs/speed);
}

// 학교 다니는 동안은 1년, 졸업 후에는 1학기 단위
async function tick(){if(!S.phase||S.phase==='school')await yearTick();else await semTick();}
function phaseName(){return {univ:'대학생',army:'군 복무',grad:'대학원생',retake:'재수생',job:'취업 준비생'}[S.phase]||'';}

/* 잠깐 내려 두기: 선택창을 접고 로그를 본 뒤 다시 연다 */
$('#mPark').addEventListener('click',()=>{$('#modal').hidden=true;$('#mResume').hidden=false;});
$('#mResume').addEventListener('click',()=>{$('#modal').hidden=false;$('#mResume').hidden=true;});
