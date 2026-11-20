"use strict";
// 성장기 진행: 출생 → 유아기 → 초·중·고. 1턴 = 1년.

function makeName(g){return pick(SUR)+pick(g==='m'?GIVEN_M:GIVEN_F);}
function makeChild(){
  const fam=wpick(FAMILY),reg=wpick(REGION),sib=wpick(SIBLINGS),gen=wpick(GENDERS);
  return {
    name:makeName(gen.k),gender:gen.k,genderName:gen.name,genderP:pct(gen,GENDERS),
    fam:fam.k,famName:fam.name,famP:pct(fam,FAMILY),famDesc:fam.desc,
    region:reg.k,regionName:reg.name,regionP:pct(reg,REGION),
    sib:sib.k,sibName:sib.name,sibP:pct(sib,SIBLINGS),
    phase:'school',loan:0,age:0,birthY:new Date().getFullYear(),
    ac:randint(32,48)+(fam.k==='rich'?6:fam.k==='poor'?-4:0),hp:randint(42,62)+(fam.k==='poor'?3:0),sc:randint(40,60)+(fam.k==='rich'?3:0),mn:randint(55,72)+(fam.k==='rich'?3:fam.k==='poor'?-3:0),
    ar:randint(35,55)+(fam.k==='rich'?2:0),hy:randint(56,70)+(fam.k==='rich'?3:fam.k==='poor'?-2:0),
    money:0,friends:[],school:null,cert:0,awards:[],
    tags:{},exp:[],fc:Object.fromEntries(Object.keys(FIELDS).map(k=>[k,0])),cur:null,dailyUsed:{},tr:{cur:0,grit:fam.k==='poor'?2:0,act:0,soc:0,lead:0,bold:0},
  };
}
const famOf=()=>FAMILY.find(f=>f.k===S.fam);
const topFields=n=>Object.keys(FIELDS).filter(k=>S.fc[k]>0).sort((a,b)=>S.fc[b]-S.fc[a]).slice(0,n);
function addExp(text,f){if(!text)return;S.exp.push({age:S.age,when:curWhen(),text,f});if(f)S.fc[f]++;}
// need: 태그 id 또는 분야 키. 하나라도 있으면 열린다. 친구에게 들은 분야도 인정
const has=need=>!need||need.some(n=>S.tags[n]||(FIELDS[n]&&(S.fc[n]>0||S.tags['heard_'+n])));

/* ---------- 친구 ---------- */
function addFriend(from){
  const g=pick(['m','f']);let n,t=0;
  do{n=makeName(g);t++;}while(t<30&&(n===S.name||S.friends.some(f=>f.name===n)));
  const f={name:n,gender:g,from,int:pick(Object.keys(FIELDS)),fr:randint(30,50),met:S.age,last:-9};
  S.friends.push(f);return f;
}
function friendYear(){
  for(const f of S.friends){
    f.fr=clamp(f.fr-2,0,100);
    if(chance(0.12)){
      const ev=pick([
        ()=>{f.fr=clamp(f.fr+6,0,100);return `${f.name}의 생일 파티에 갔다.`;},
        ()=>{f.fr=clamp(f.fr-8,0,100);return `${f.name}${J(f.name,'과','와')} 사소한 일로 크게 싸웠다.`;},
        ()=>{f.fr=clamp(f.fr+4,0,100);return `${f.name}${J(f.name,'이','가')} 고민을 털어놓았다.`;},
        ()=>{S.tags['heard_'+f.int]=1;return `${f.name}${J(f.name,'이','가')} ${FIELDS[f.int]} 이야기를 신나게 했다. 조금 궁금해졌다.`;},
      ]);
      addLog(ev(),{tag:'친구',tagCls:'fr'});
    }
  }
}
async function friendMenu(i){
  const f=S.friends[i];if(!f||S.ended||busy||!$('#modal').hidden)return;
  clearTimeout(timer);busy=true;const prev=settings.auto;settings.auto=false;
  if(f.last===S.age){await ask(f.name,`${f.from} · 친밀도 ${Math.round(f.fr)}. 올해는 이미 같이 시간을 보냈다.`,[X('닫기',()=>'')]);}
  else{
    const ch=[
      X('같이 논다',()=>{f.fr=clamp(f.fr+12,0,100);E({sc:2,mn:2});return `${f.name}${J(f.name,'과','와')} ${pick(['하루 종일 놀았다.','떡볶이를 먹으러 갔다.','노래방에서 목이 쉬었다.','자전거를 타고 멀리 나갔다.'])}`;},'사교+ 멘탈+'),
      X('같이 공부한다',()=>{f.fr=clamp(f.fr+8,0,100);E({ac:2});return `${f.name}${J(f.name,'과','와')} 도서관에서 같이 공부했다.`;},'학업+'),
      X(`${FIELDS[f.int]} 이야기를 듣는다`,()=>{f.fr=clamp(f.fr+6,0,100);S.tags['heard_'+f.int]=1;return `${f.name}에게 ${FIELDS[f.int]} 이야기를 한참 들었다. 나도 해보고 싶어졌다.`;}),
      X('그냥 둔다',()=>null)];
    const k=await ask(f.name,`${f.from} · 친밀도 ${Math.round(f.fr)} · 요즘 ${FIELDS[f.int]}에 관심이 많다`,ch);
    if(k<3){f.last=S.age;addLog(ch[k].f(),{tag:'친구',tagCls:'fr'});}
  }
  settings.auto=prev;busy=false;render();schedule();
}

/* ---------- 선택 ---------- */
// 분야·활동이 기질에 남기는 흔적 (화면에는 안 보이고 결산 코멘트에만 쓰인다)
const TRAIT_OF={sec:['grit','cur'],dev:['grit','cur'],res:['cur','grit'],biz:['lead','soc'],fnd:['bold','soc'],spt:['act','grit'],art:['cur','bold'],med:['soc','bold'],ppl:['soc','lead'],fld:['grit','act']};
// 대회에서 오르는 스탯: 분야마다 다르다
const CONTEST_STAT={spt:'hp',art:'ar',med:'ar',ppl:'sc',fld:'hp'};
function leaveTrait(a){
  const t=a.f?TRAIT_OF[a.f]:null;
  if(t){S.tr[t[0]]+=2;S.tr[t[1]]+=1;}
  const e=a.eff||{};if(e.hp>0)S.tr.act+=2;if(e.sc>0)S.tr.soc+=1;if(e.ac>3)S.tr.grit+=1;if(e.mn>3)S.tr.soc+=1;
}
// 모든 분야에서 골고루 섞되, 해본 분야는 하나 이상 넣는다
function offer(list,n){
  const allow=famOf().allow;
  const ok=list.filter(a=>!(a.gen&&S.school&&!isGen())&&!(a.voc&&!(S.school==='voc'||S.school==='meister')))
    .map(a=>a.cost>allow&&a.alt?Object.assign({},a,a.alt,{cost:0}):a).filter(a=>!(a.cost>allow));
  const done=ok.filter(a=>a.f&&S.fc[a.f]>0),rest=ok.filter(a=>!done.includes(a));
  const pickN=(arr,k)=>arr.slice().sort(()=>R()-0.5).slice(0,k);
  const out=pickN(done,1);
  const fieldsLeft=pickN(rest.filter(a=>a.f&&!out.some(o=>o.f===a.f)),n-2);
  out.push(...fieldsLeft);
  const general=rest.filter(a=>!a.f);out.push(...pickN(general,Math.max(1,n-out.length)));
  return out.slice(0,n).sort(()=>R()-0.5);
}
async function choose(title,text,list,note,kind){
  const opts=offer(list,6);
  const ch=opts.map(a=>X(a.t,()=>{
    S.tags[a.id]=1;E(a.eff||{});leaveTrait(a);
    if(a.exp)addExp(a.exp,a.f);
    if(a.cert)S.cert++;if(a.money)S.money+=a.money;
    S.cur=a.go?a:null;
    return a.go?pick(a.go):'';
  },S.age>=8?[hint2(a.eff),a.money?`+${a.money}만원`:''].filter(Boolean).join(' · '):''));
  ch.wAuto=c=>{const a=opts[ch.indexOf(c)];return 1+(a.f?S.fc[a.f]*1.5+(S.tags['heard_'+a.f]?1:0):0);};
  pendingGain=[];
  await resolve(title,text,ch,kind,note);
  pendingGain=[];
}
function continueActivity(){
  const a=S.cur;if(!a)return;
  const half={};for(const k in a.eff||{})half[k]=Math.round(a.eff[k]/2);E(half);
  addLog(pick(a.go));
}
async function contest(level,note){
  const names=CONTEST[level];
  const all=Object.keys(FIELDS),done=all.filter(k=>S.fc[k]>0);
  const fs=[...done.sort(()=>R()-0.5).slice(0,1),...all.filter(k=>!done.includes(k)||true).sort(()=>R()-0.5)].filter((k,i,a)=>a.indexOf(k)===i).slice(0,4);
  const ch=fs.map(k=>{
    const st=CONTEST_STAT[k]||'ac';
    const p=clamp(0.08+S.fc[k]*0.15+S[st]/400,0,0.85);
    return X(`${names[k]}에 나간다`,()=>{S.tr.bold+=1;const tr=TRAIT_OF[k];S.tr[tr[0]]+=1;const hi=level==='high';if(chance(p)){E({[st]:hi?4:3});addExp(`${names[k]} 입상`,k);S.awards.push(names[k]+' 입상');return '입상했다. 상장이 생활기록부에 올라갔다.';}addExp(`${names[k]} 참가`,k);if(chance(0.5)){E({[st]:hi?2:1});return '본선까지 갔다. 상은 받지 못했지만 준비하며 실력이 늘었다.';}return '예선에서 떨어졌다. 문제 유형은 알게 됐다.';},`입상하면 ${STATS[st]}+`,()=>p,'입상 가능성');
  });
  ch.push(X('대회 대신 공부에 집중한다',()=>{E({ac:3});S.tr.grit+=1;return '대회 날, 자습실에 있었다.';},'학업+'));
  ch.push(X('이번엔 쉰다',()=>{E({mn:3});return '주말에 푹 잤다.';},'멘탈+'));
  ch.wAuto=c=>{const k=fs.find(x=>c.t.startsWith(names[x]));return k?1+S.fc[k]*1.5:1;};
  pendingGain=[];
  await resolve('대회',level==='mid'?'선생님이 올해 대회에 나가볼 사람을 찾는다.':'고2다. 생활기록부에 한 줄을 더 남길 기회다.',ch,'',note);
  pendingGain=[];
}
// 어릴 때 고른 것이 나중에 이야기로 다시 드러난다
const ECHO={
  take:'친구 컴퓨터가 고장 나서 열어서 고쳐줬다.',make:'수행평가로 낸 작품이 교실 뒤에 걸렸다.',curious:'과학 시간에 질문을 너무 많이 해서 선생님이 웃었다.',
  shop:'반 바자회에서 계산을 도맡았다.',role:'모둠 활동에서 자연스럽게 발표를 맡았다.',active:'체육 시간마다 팀장으로 뽑혔다.',
  coding:'엑셀 수식을 반 친구들에게 알려줬다.',pc:'학교 컴퓨터실 프린터를 혼자 고쳤다.',science:'과학관 견학에서 해설사에게 질문을 세 개 했다.',
  flea:'중고거래로 산 물건을 더 비싸게 되팔았다.',president:'반 대표로 학교 회의에 나갔다.',
};
function daily(st){
  if(!chance(0.55))return;
  const echoes=Object.keys(ECHO).filter(k=>S.tags[k]&&!S.dailyUsed['e_'+k]);
  if(st!=='elem'&&echoes.length&&chance(0.4)){const k=pick(echoes);S.dailyUsed['e_'+k]=1;addLog(ECHO[k],{kind:'sys'});return;}
  const pool=DAILY[st].filter(t=>!S.dailyUsed[t]);if(!pool.length)return;
  const t=pick(pool);S.dailyUsed[t]=1;addLog(t,{kind:'sys'});
}
function teacherComment(){
  const T={cur:'궁금한 것을 끝까지 파고드는 편',grit:'한 번 잡은 일은 쉽게 놓지 않음',act:'몸을 움직이는 활동에서 활기가 넘침',soc:'친구들과 두루 잘 어울림',lead:'모둠 활동에서 자연스럽게 앞장섬',bold:'새로운 일에 겁 없이 뛰어듦'};
  const top=Object.keys(S.tr).sort((a,b)=>S.tr[b]-S.tr[a]).slice(0,2).filter(k=>S.tr[k]>0);
  return top.length?top.map(k=>T[k]).join('. ')+'.':'눈에 띄는 활동은 적었으나 성실하게 학교생활을 함.';
}

/* ---------- 갈림길 ---------- */
async function chooseHighSchool(){
  const mp=clamp(0.2+S.ac/300+(S.fc.dev+S.fc.sec)*0.1,0,0.9);
  const ch=HIGH_SCHOOLS.filter(h=>!h.talent||h.talent===S.talent).map(h=>X(h.name,()=>{
    if(h.k==='meister'&&!chance(mp)){S.school='voc';return '마이스터고 면접에서 떨어졌다. 특성화고에 입학하기로 했다.';}
    S.school=h.k;
    if(h.talent){E(h.k==='sport'?{hp:5,ac:-3}:{ar:5,ac:-2});return h.k==='sport'?'체육고에 특기생으로 합격했다. 훈련이 수업보다 많다.':h.k==='arts'?'예술고 실기 시험에 합격했다. 화구 가방이 생겼다.':'예술고 방송영상과에 합격했다. 첫 수업에서 카메라를 받았다.';}
    return h.k==='gen'?'집 근처 일반고에 배정됐다.':h.k==='voc'?'특성화고 정보처리과에 합격했다.':'마이스터고에 합격했다. 기숙사 생활이 시작된다.';
  },h.talent?(h.k==='sport'?'체력+ 학업− · 특기자 전형':'감성+ 학업− · 실기 전형'):h.k==='gen'?'대학 진학 중심':h.k==='voc'?'실무·자격증':'취업 특화',h.k==='meister'?()=>mp:null,'합격 가능성'));
  ch.wAuto=c=>c.t.startsWith('체육고')||c.t.startsWith('예술고')?5:c.t==='일반고'?6:c.t.startsWith('마이스터')?1+(S.fc.dev+S.fc.sec):1;
  await resolve('고등학교 진학','중학교 마지막 해다. 어느 고등학교에 갈까? 일반고는 대학 진학, 특성화고는 실무와 자격증, 마이스터고는 취업에 강하다.',ch,'key',NOTES.high_school,{big:true});
}
function suneung(){
  // 학업이 기본, 시험 날 멘탈이 흔들림을 좌우한다
  const sc=S.ac+(S.mn-50)*0.15+randn()*(S.mn<40?9:6)-(S.hp<30?4:0)+(S.fam==='rich'?4:0)+(S.region==='metro'?2:0);
  return clamp(Math.round(9-(sc-20)/8),1,9);
}
function univHint(g){return g<=2?'서울 상위권 대학':g<=3?'인서울 대학':g<=4?'지방 거점 국립대':g<=6?'지방 사립대':'전문대';}

/* ---------- 한 해 ---------- */
async function yearTick(){
  S.age++;
  const a=S.age,st=stageOf(a).k;
  header();
  if(a>=14&&a<=19)E({ac:1}); // 중학생부터 해마다 조금씩 공부가 쌓인다
  // 행복은 멘탈과 친구 관계를 따라 천천히 움직인다
  {const fr=S.friends.filter(f=>f.fr>=50).length;S.hy=clamp(S.hy+(60+fr*3+(S.mn-55)*0.3-S.hy)*0.15,0,100);}
  if(KSJ_LORE_AGE[a]!==undefined)addLog(KSJ_LORE[KSJ_LORE_AGE[a]],{kind:'sys',tag:'KSJ'});
  tutorYear(false);
  if(st==='baby'){
    if(DAILY.baby[a])addLog(DAILY.baby[a],{kind:'sys'});
    if(a===5)await choose('다섯 살, 좋아하는 놀이','이제 제법 혼자 놀 줄 안다. 요즘 아이는 무엇에 빠져 있을까? 고른 쪽으로 아이의 성향이 조금씩 기운다.',PLAY,NOTES.play);
    return;
  }
  if(a===8){addLog('초등학교에 입학했다.',{kind:'key'});const x=addFriend('초등학교 친구'),y=addFriend('동네 친구');addLog(`짝꿍 ${x.name}, 같은 아파트에 사는 ${y.name}${J(y.name,'과','와')} 친해졌다.`,{tag:'친구',tagCls:'fr'});}
  if(a===14){addLog('중학교에 입학했다. 교복이 조금 컸다.',{kind:'key'});S.cur=null;}
  if(a===17){
    addLog(S.school==='sport'?'체육고에 입학했다. 첫날부터 훈련복을 받았다.':S.school==='arts'||S.school==='arts_med'?'예술고에 입학했다. 실기실 냄새가 좋았다.':S.school==='gen'?'고등학교에 입학했다.':S.school==='voc'?'특성화고에 입학했다. 첫 수업은 엑셀이었다.':'마이스터고에 입학했다. 첫 주에 기숙사 점호가 있었다.',{kind:'key'});
    S.cur=null;
    const x=addFriend('고등학교 친구'),y=addFriend('고등학교 친구');addLog(`같은 반 ${x.name}, 옆 반 ${y.name}${J(y.name,'과','와')} 어울리기 시작했다.`,{tag:'친구',tagCls:'fr'});
  }
  if(a===10)await choose('초3, 방과후','수업이 끝나면 오후가 길다. 방과후에 무엇을 할까?',ELEM,NOTES.elem);
  else if(a===14)await choose('중1, 동아리','중학교 첫해다. 시험 부담이 덜한 지금, 어디에 시간을 쓸까?',MID_CLUB,NOTES.mid);
  else if(a===15)await contest('mid',NOTES.mid_contest);
  else if(a===17)await choose('고1, 동아리','고등학교 첫해다. 어떤 동아리와 활동으로 3년을 시작할까?',HIGH_CLUB,NOTES.high);
  else if(a===18)await contest('high',NOTES.high_contest);
  else continueActivity();
  daily(st);
  friendYear();
  S.mn=clamp(S.mn+(62-S.mn)*0.15,0,100);
  if(a===19)E({hp:-3,mn:-3});
  if(a===16){talentCheck();await chooseHighSchool();}
  statEvents(a);
  if(a===15||a===18)talentCheck();
  if(a===19){
    if(S.hp>=72&&['active','sports','mid_sports','h_sports'].some(k=>S.tags[k]))await peTrackAsk();
    if(isGen()){
      if(S.hp<30)addLog('수능을 앞두고 체력이 바닥났다. 감기를 달고 시험장에 갔다.',{kind:'sys'});
      S.sat=suneung();addLog(`수능을 봤다. 평균 ${S.sat}등급.${S.mn<40?' 시험장에서 손이 떨렸다.':S.mn>=70?' 긴장하지 않고 평소처럼 풀었다.':''}`,{kind:'key'});
    }
    else addLog(`졸업이 다가온다. 자격증 ${S.cert}개${S.awards.length?', 수상 '+S.awards.length+'회':''}.`,{kind:'key'});
    await afterHigh();
  }
}

/* ---------- 스탯이 만드는 일 ---------- */
/* ---------- 재능: 스카우터·심사위원 눈에 띈다 ---------- */
const TALENT={
  spt:{ok:()=>S.fc.spt>=2&&S.hp>=65,log:'대회장에 KSJ 스포츠단 스카우터가 와서 나를 유심히 봤다는 이야기를 들었다.'},
  art:{ok:()=>S.fc.art>=2&&S.ar>=62,log:'공모전 심사위원이 내 작품 이름을 물어봤다고 한다. 미술 선생님이 예술 쪽 진로를 진지하게 권했다.'},
  med:{ok:()=>S.fc.med>=2&&S.ar>=56&&S.sc>=55,log:'영상 공모전 심사위원이 내 영상을 칭찬했다. 방송 아카데미 관계자가 명함을 주고 갔다.'},
};
const isGen=()=>['gen','sport','arts','arts_med'].includes(S.school);
function talentCheck(){
  if(S.talent)return;
  for(const k of Object.keys(TALENT).sort((a,b)=>S.fc[b]-S.fc[a]))if(TALENT[k].ok()){S.talent=k;addLog(TALENT[k].log,{kind:'key',tag:'재능'});return;}
}
function statEvents(a){
  if(a===18&&S.sc>=70&&!S.tags.president){S.tags.president=1;S.tr.lead+=2;addLog('학생회장 선거에 나가 당선됐다.',{kind:'key'});}
  else if(a===12&&S.sc>=65&&!S.tags.president){S.tags.president=1;S.tr.lead+=1;addLog('전교 어린이회장에 뽑혔다.',{kind:'key'});}
  if(a>=12&&S.mn<30&&S.slumpY!==a-1&&S.slumpY!==a){S.slumpY=a;E({ac:-3});addLog(pick(['아무것도 하기 싫은 날이 길어졌다. 성적이 조금 떨어졌다.','시험 전날 밤 잠을 한숨도 못 잤다.','학교 가는 길이 유난히 멀게 느껴졌다.']),{kind:'sys'});}
}
async function peTrackAsk(){
  await resolve('체대 입시','체육 선생님이 따로 불렀다. 체력이 이 정도면 체대 입시를 준비해볼 만하다고 한다.',[
    X('체대 입시를 준비한다',()=>{S.peTrack=true;E({hp:4,ac:-2});return '방과 후마다 실기 학원에 다녔다.';},'체력+ 학업−'),
    X('하던 공부를 계속한다',()=>{E({ac:2});return '고맙지만 하던 대로 가기로 했다.';},'학업+')],'key',null,{big:true});
}

/* ---------- 행동: 부모님께 과외 부탁 ---------- */
const TUTOR_P={rich:0.85,mid:0.55,poor:0.25};
const canTutor=()=>S&&!S.ended&&((S.phase==='school'&&S.age>=14)||S.phase==='retake');
async function tutorAction(){
  if(!canTutor()||busy||!$('#modal').hidden)return;
  clearTimeout(timer);busy=true;const prev=settings.auto;settings.auto=false;
  if(S.tutor){
    const k=await ask('과외 그만두기',`과외를 받은 지 ${S.tutorYears||1}년째다. 그만둘까?`,[X('그만둔다',()=>'','멘탈+'),X('계속 받는다',()=>'')]);
    if(k===0){S.tutor=false;E({mn:3});addLog('과외를 그만뒀다. 저녁 시간이 생겼다.',{kind:'sys'});}
  }else{
    const p=TUTOR_P[S.fam];
    const k=await ask('부모님께 과외 부탁하기','저녁을 먹다가 말을 꺼내본다. 성적을 올리고 싶으니 과외를 시켜달라고.',[
      X('진지하게 부탁한다',()=>'','받아들여지면 매년 학업+ 멘탈−',()=>p,'허락 가능성'),
      X('다음에 말한다',()=>'')]);
    if(k===0){
      S.tutorAsked=S.age;
      if(chance(p)){S.tutor=true;addLog(S.fam==='poor'?'엄마가 한참 생각하더니 해보자고 했다. 다음 주부터 과외 선생님이 온다.':pick(['아빠가 바로 과외 선생님을 알아봤다.','엄마가 학원 대신 과외를 해보자고 했다.']),{kind:'key'});}
      else{E({mn:-2});addLog(pick(['아빠가 통장을 보더니 고개를 저었다.','엄마가 지금은 어렵다고, 내년에 다시 얘기하자고 했다.','인강으로 해보면 안 되겠냐는 답이 돌아왔다.']),{kind:'sys'});}
    }
  }
  settings.auto=prev;busy=false;render();schedule();
}
function tutorYear(half){
  if(!S.tutor)return;
  E(half?{ac:2}:{ac:4,mn:-1});S.tutorYears=(S.tutorYears||0)+(half?0.5:1);
  if(S.fam==='poor'&&chance(0.3)&&!S.dailyUsed.tutorPoor){S.dailyUsed.tutorPoor=1;addLog('엄마가 부업을 하나 더 시작했다.',{kind:'sys'});}
  else if(chance(0.25))addLog(pick(['과외 선생님이 오답 노트를 만들어 오라고 했다.','과외 숙제를 하느라 새벽 1시에 잤다.','과외 선생님 덕에 수학 점수가 올랐다.']),{kind:'sys'});
}
