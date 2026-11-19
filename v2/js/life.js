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
    age:0,birthY:new Date().getFullYear(),
    ac:randint(32,48)+(fam.k==='rich'?5:fam.k==='poor'?-3:0),hp:randint(42,62),sc:randint(40,60),mn:randint(55,72),
    money:0,friends:[],school:null,cert:0,awards:[],
    tags:{},exp:[],fc:{sec:0,dev:0,res:0,biz:0,fnd:0},cur:null,dailyUsed:{},
  };
}
const famOf=()=>FAMILY.find(f=>f.k===S.fam);
const topFields=n=>Object.keys(FIELDS).filter(k=>S.fc[k]>0).sort((a,b)=>S.fc[b]-S.fc[a]).slice(0,n);
function addExp(text,f){if(!text)return;S.exp.push({age:S.age,text,f});if(f){S.fc[f]++;pendingGain.push(`${FIELDS[f]} 경험 +1`);}}
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
        ()=>{f.fr=clamp(f.fr-8,0,100);E({mn:-1});return `${f.name}${J(f.name,'과','와')} 사소한 일로 크게 싸웠다.`;},
        ()=>{f.fr=clamp(f.fr+4,0,100);E({sc:1});return `${f.name}${J(f.name,'이','가')} 고민을 털어놓았다.`;},
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
      X('같이 논다',()=>{f.fr=clamp(f.fr+12,0,100);E({sc:2,mn:2});return `${f.name}${J(f.name,'과','와')} ${pick(['하루 종일 놀았다.','떡볶이를 먹으러 갔다.','노래방에서 목이 쉬었다.','자전거를 타고 멀리 나갔다.'])}`;},'친밀도↑ 사교↑ 멘탈↑'),
      X('같이 공부한다',()=>{f.fr=clamp(f.fr+8,0,100);E({ac:2});return `${f.name}${J(f.name,'과','와')} 도서관에서 같이 공부했다.`;},'친밀도↑ 학업↑'),
      X(`${FIELDS[f.int]} 이야기를 듣는다`,()=>{f.fr=clamp(f.fr+6,0,100);S.tags['heard_'+f.int]=1;return `${f.name}에게 ${FIELDS[f.int]} 이야기를 한참 들었다. 나도 해보고 싶어졌다.`;},`친밀도↑ · 다음 선택지에 ${FIELDS[f.int]} 관련이 열릴 수 있다`),
      X('그냥 둔다',()=>null)];
    const k=await ask(f.name,`${f.from} · 친밀도 ${Math.round(f.fr)} · 요즘 ${FIELDS[f.int]}에 관심이 많다`,ch);
    if(k<3){f.last=S.age;addLog(ch[k].f(),{tag:'친구',tagCls:'fr'});}
  }
  settings.auto=prev;busy=false;render();schedule();
}

/* ---------- 선택 ---------- */
function effHint(eff){return Object.entries(eff||{}).map(([k,v])=>STATS[k]+(v>0?(v>=6?'↑↑':'↑'):'↓')).join(' ');}
const LATER=[ELEM,MID_CLUB,HIGH_CLUB];
function unlockHint(a){
  const nx=LATER.flat().find(b=>b.need&&b.need.includes(a.id)&&b!==a);
  return nx?` · 다음에 '${nx.t.replace(/(에 든다|한다|에 다닌다)$/,'')}' 선택지가 열린다`:'';
}
function offer(list){
  const allow=famOf().allow;
  return list.filter(a=>has(a.need)&&!(a.gen&&S.school&&S.school!=='gen')&&!(a.voc&&!(S.school==='voc'||S.school==='meister')))
    .map(a=>a.cost>allow&&a.alt?a.alt:a).filter(a=>!(a.cost>allow));
}
async function choose(title,text,list,kind){
  const opts=offer(list);
  const ch=opts.map(a=>X(a.t,()=>{
    S.tags[a.id]=1;E(a.eff||{});
    if(a.exp)addExp(a.exp,a.f);
    if(a.cert)S.cert++;if(a.money)S.money+=a.money;
    S.cur=a.go?a:null;
    return a.go?pick(a.go):'';
  },[effHint(a.eff),a.f?`${FIELDS[a.f]} 경험 +1`:''].filter(Boolean).join(' · ')+unlockHint(a)));
  ch.wAuto=c=>{const a=opts[ch.indexOf(c)];return 1+(a.f?S.fc[a.f]*1.5+(S.tags['heard_'+a.f]?1:0):0)+(a.eff&&a.eff.mn>0&&S.mn<30?2:0);};
  await resolve(title,text,ch,kind);
}
function continueActivity(){
  const a=S.cur;if(!a)return;
  const half={};for(const k in a.eff||{})half[k]=Math.round(a.eff[k]/2);E(half);
  addLog(pick(a.go));
}
async function contest(level){
  const names=CONTEST[level];
  const fs=Object.keys(FIELDS).filter(k=>S.fc[k]>0||S.tags['heard_'+k]);
  const ch=fs.map(k=>{
    const p=clamp(0.15+S.fc[k]*0.12+S.ac/400,0,0.85);
    return X(`${names[k]}에 나간다`,()=>{E({mn:-2});if(chance(p)){addExp(`${names[k]} 입상`,k);S.awards.push(names[k]+' 입상');return '입상했다. 상장이 생활기록부에 올라갔다.';}addExp(`${names[k]} 참가`,k);return pick(['본선까지 갔다. 상은 받지 못했다.','예선에서 떨어졌다. 문제 유형은 알게 됐다.']);},`${FIELDS[k]} 경험 +1 멘탈 조금↓`,()=>p,'입상 가능성');
  });
  if(!fs.length)ch.push(X('교내 글짓기 대회에 나간다',()=>{if(chance(0.35)){S.awards.push('교내 글짓기 대회 입상');return '장려상을 받았다.';}return '참가상을 받았다.';},'학업 조금↑'));
  ch.push(X('대회 대신 공부에 집중한다',()=>{E({ac:3});return '대회 날, 자습실에 있었다.';},'학업↑'));
  ch.push(X('이번엔 쉰다',()=>{E({mn:3});return '주말에 푹 잤다.';},'멘탈↑'));
  ch.wAuto=c=>c.t.includes('나간다')?3:1;
  await resolve('대회',level==='mid'?'선생님이 올해 대회에 나가볼 사람을 찾는다.':'고2다. 생활기록부에 한 줄을 더 남길 기회다.',ch);
}
function daily(st){
  if(!chance(0.5))return;
  const pool=DAILY[st].filter(t=>!S.dailyUsed[t]);if(!pool.length)return;
  const t=pick(pool);S.dailyUsed[t]=1;addLog(t,{kind:'sys'});
}

/* ---------- 갈림길 ---------- */
async function chooseHighSchool(){
  const mp=clamp(0.2+S.ac/300+(S.fc.dev+S.fc.sec)*0.1,0,0.9);
  const ch=HIGH_SCHOOLS.map(h=>X(h.name,()=>{
    if(h.k==='meister'&&!chance(mp)){S.school='voc';return '마이스터고 면접에서 떨어졌다. 특성화고에 입학하기로 했다.';}
    S.school=h.k;
    return h.k==='gen'?'집 근처 일반고에 배정됐다.':h.k==='voc'?'특성화고 정보처리과에 합격했다.':'마이스터고에 합격했다. 기숙사 생활이 시작된다.';
  },h.desc,h.k==='meister'?()=>mp:null,'합격 가능성'));
  ch.wAuto=c=>c.t==='일반고'?3:c.t.startsWith('마이스터')?1+(S.fc.dev+S.fc.sec):1;
  await resolve('고등학교 진학','중학교 마지막 해다. 어느 고등학교에 갈까?',ch,'key');
}
function suneung(){
  const sc=S.ac+randn()*8+(S.fam==='rich'?4:0)+(S.region==='metro'?2:0);
  return clamp(Math.round(9-(sc-20)/8),1,9);
}
function univHint(g){return g<=2?'서울 상위권 대학':g<=4?'인서울·지방 거점 국립대':g<=6?'지방 사립대':'전문대';}

/* ---------- 한 해 ---------- */
async function yearTick(){
  S.age++;
  const a=S.age,st=stageOf(a).k;
  header();
  if(a>=8)S.money+=famOf().pocket*12;
  if(st==='baby'){
    if(DAILY.baby[a])addLog(DAILY.baby[a],{kind:'sys'});
    if(a===5)await choose('뭐 하고 놀까','다섯 살이 됐다. 요즘 제일 좋아하는 놀이는?',PLAY);
    return;
  }
  if(a===8){addLog('초등학교에 입학했다.',{kind:'key'});const x=addFriend('초등학교 친구'),y=addFriend('동네 친구');addLog(`짝꿍 ${x.name}, 같은 아파트에 사는 ${y.name}${J(y.name,'과','와')} 친해졌다.`,{tag:'친구',tagCls:'fr'});}
  if(a===14){addLog('중학교에 입학했다. 교복이 조금 컸다.',{kind:'key'});S.cur=null;}
  if(a===17){
    addLog(S.school==='gen'?'고등학교에 입학했다.':S.school==='voc'?'특성화고에 입학했다. 첫 수업은 엑셀이었다.':'마이스터고에 입학했다. 첫 주에 기숙사 점호가 있었다.',{kind:'key'});
    S.cur=null;
    const x=addFriend('고등학교 친구'),y=addFriend('고등학교 친구');addLog(`같은 반 ${x.name}, 옆 반 ${y.name}${J(y.name,'과','와')} 어울리기 시작했다.`,{tag:'친구',tagCls:'fr'});
  }
  if(a===10)await choose('방과후 활동','초3이 됐다. 방과후에 뭘 할까?',ELEM);
  else if(a===14)await choose('중학교 동아리','중학교 첫해다. 어떤 활동을 할까?',MID_CLUB);
  else if(a===15)await contest('mid');
  else if(a===17)await choose('고등학교 동아리','고1이 됐다. 어떤 동아리·활동을 할까?',HIGH_CLUB);
  else if(a===18)await contest('high');
  else continueActivity();
  daily(st);
  friendYear();
  S.mn=clamp(S.mn+(62-S.mn)*0.15,0,100);
  if(a===19)E({hp:-3,mn:-3});
  if(a===16)await chooseHighSchool();
  if(a===19){
    if(S.school==='gen'){S.sat=suneung();addLog(`수능을 봤다. 평균 ${S.sat}등급. ${univHint(S.sat)}에 원서를 넣을 수 있는 성적이다.`,{kind:'key'});}
    else addLog(`졸업이 다가온다. 자격증 ${S.cert}개${S.awards.length?', 수상 '+S.awards.length+'회':''}. ${S.school==='meister'?'공기업·대기업 고졸 채용':'지역 회사 고졸 채용'}에 지원할 수 있다.`,{kind:'key'});
    S.ended={kind:'1단계 완료',text:'고등학교 졸업까지 왔다. 대학·군대·취업은 다음 단계에서 이어진다.'};
  }
}
