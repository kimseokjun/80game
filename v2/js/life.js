"use strict";
// 성장기 진행: 출생 → 유아기 → 초·중·고. 1턴 = 1년.

function makeName(g){return pick(SUR)+pick(g==='m'?GIVEN_M:GIVEN_F);}
function makeChild(){
  const fam=wpick(FAMILY),reg=wpick(REGION),sib=wpick(SIBLINGS),gen=wpick(GENDERS);
  const c={
    name:makeName(gen.k),gender:gen.k,genderName:gen.name,genderP:pct(gen,GENDERS),
    fam:fam.k,famName:fam.name,famP:pct(fam,FAMILY),famDesc:fam.desc,
    region:reg.k,regionName:reg.name,regionP:pct(reg,REGION),
    sib:sib.k,sibName:sib.name,sibP:pct(sib,SIBLINGS),
    age:0,birthY:new Date().getFullYear(),
    ac:randint(32,48)+(fam.k==='rich'?5:fam.k==='poor'?-3:0),hp:randint(42,62),sc:randint(40,60),mn:randint(55,72),
    sec:randint(3,12),dev:randint(3,12),res:randint(3,12),biz:randint(3,12),fnd:randint(3,12),
    money:0,friends:[],school:null,cert:0,seen:{},awards:[],
  };
  const born=pick(Object.keys(INTERESTS));c[born]+=10;c.bornInt=born;
  return c;
}
const famOf=()=>FAMILY.find(f=>f.k===S.fam);
const topInts=n=>Object.keys(INTERESTS).sort((a,b)=>S[b]-S[a]).slice(0,n);

/* ---------- 친구 ---------- */
function addFriend(from){
  const g=pick(['m','f']);let n,t=0;
  do{n=makeName(g);t++;}while(t<30&&(n===S.name||S.friends.some(f=>f.name===n)));
  const f={name:n,gender:g,from,int:pick(Object.keys(INTERESTS)),fr:randint(30,50),met:S.age,last:-9};
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
        ()=>{E({[f.int]:2});return `${f.name}${J(f.name,'이','가')} ${INTERESTS[f.int]} 이야기를 신나게 했다. 조금 궁금해졌다.`;},
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
      X(`${INTERESTS[f.int]} 이야기를 듣는다`,()=>{f.fr=clamp(f.fr+6,0,100);E({[f.int]:4});return `${f.name}에게 ${INTERESTS[f.int]} 이야기를 한참 들었다.`;},`친밀도↑ ${INTERESTS[f.int]}↑`),
      X('그냥 둔다',()=>null)];
    const k=await ask(f.name,`${f.from} · 친밀도 ${Math.round(f.fr)} · 요즘 ${INTERESTS[f.int]}에 관심이 많다`,ch);
    if(k<3){f.last=S.age;addLog(ch[k].f(),{tag:'친구',tagCls:'fr'});}
  }
  settings.auto=prev;busy=false;render();schedule();
}

/* ---------- 한 해 활동 ---------- */
function effHint(eff){
  return Object.entries(eff).map(([k,v])=>{const n=STATS[k]||INTERESTS[k];return n+(v>0?(v>=6?'↑↑':'↑'):'↓');}).join(' ');
}
async function yearActivity(){
  const st=stageOf(S.age).k;
  let list=ACTS[st].slice();
  if(st==='high'&&(S.school==='voc'||S.school==='meister'))list=list.filter(a=>!a.t.includes('수능')).concat(ACTS.voc);
  const allow=famOf().allow;
  const opts=list.map(a=>a.cost>allow?(a.alt?Object.assign({cost:0},a.alt):null):a).filter(Boolean);
  const shown=opts.sort(()=>R()-0.5).slice(0,5);
  const ch=shown.map(a=>X(a.t,()=>{
    E(a.eff);if(a.cert)S.cert++;if(a.money)S.money+=a.money;
    return pick(a.log);
  },effHint(a.eff)+(a.cost>0.4?' · 학원비 부담':'')));
  ch.wAuto=c=>{const a=shown[ch.indexOf(c)];let w=1;for(const k in a.eff){if(INTERESTS[k])w+=S[k]/15;if(k==='mn'&&S.mn<30&&a.eff[k]>0)w+=2;}return w;};
  const title=st==='elem'?'올해 방과후':st==='mid'?'올해 중학교 생활':'올해 고등학교 생활';
  await resolve(title,`${gradeLabel(S.age)}${J(gradeLabel(S.age),'이','가')} 됐다. 올해는 어디에 시간을 쓸까?`,ch);
}

/* ---------- 이벤트 ---------- */
function once(id){if(S.seen[id])return false;S.seen[id]=true;return true;}
const BABY=[
  {a:1,t:'첫걸음을 뗐다. 가족 단톡방에 영상이 올라왔다.'},
  {a:2,t:'처음으로 말을 했다. 엄마와 아빠는 서로 자기 이름이라고 우겼다.'},
  {a:4,t:'어린이집에 다니기 시작했다. 첫날 한 시간을 울었다.'},
  {a:6,t:'유치원 재롱잔치에서 맨 앞줄에 섰다.'},
  {a:7,t:'초등학교 입학 준비물을 샀다. 가방이 몸보다 컸다.'},
];
const RANDOM={
  baby:[
    ()=>once('sib')&&S.sib>0?'동생이 태어났다. 집이 시끄러워졌다.':null,
    ()=>'할머니 댁에서 여름을 보냈다.',
    ()=>(E({hp:-2}),'수족구에 걸려 일주일을 앓았다.'),
    ()=>once('move0')?'이사를 했다. 새 동네 놀이터가 더 넓었다.':null,
    ()=>(E({[pick(Object.keys(INTERESTS))]:2}),pick(['블록 장난감으로 하루 종일 탑을 쌓았다.','아빠 휴대폰을 몰래 만지다 잠금이 걸렸다.','소꿉놀이에서 늘 가게 주인을 했다.'])),
  ],
  elem:[
    ()=>once('phone')?'첫 스마트폰을 받았다.':null,
    ()=>(E({ac:2}),'받아쓰기에서 100점을 받았다.'),
    ()=>(E({sc:1}),'친구와 크게 싸웠다. 다음 날 화해했다.'),
    ()=>S.fam==='rich'?(E({mn:2}),'가족 여행으로 해외에 갔다.'):(E({mn:1}),'가족끼리 근교 계곡에 다녀왔다.'),
    ()=>S.fam==='poor'&&once('dual')?(E({mn:-1}),'부모님이 맞벌이를 시작했다. 저녁은 혼자 먹는 날이 많아졌다.'):null,
    ()=>(E({mn:-1}),'학예회에서 대사를 까먹었다.'),
  ],
  mid:[
    ()=>once('puberty')?(E({mn:-2}),'사춘기가 왔다. 방문을 닫는 날이 많아졌다.'):null,
    ()=>'중간고사 성적표를 가방 깊숙이 숨겼다.',
    ()=>once('crush')?(E({mn:1}),'첫 짝사랑이 생겼다. 고백은 하지 못했다.'):null,
    ()=>(E({sc:2}),'수학여행에서 친구들과 밤새 이야기했다.'),
  ],
  high:[
    ()=>(E({hp:-1}),'야간자율학습이 끝나면 밤 10시였다.'),
    ()=>(E({mn:-3}),'모의고사를 망쳤다. 버스에서 성적표를 다시 접었다.'),
    ()=>S.fam==='poor'?(S.money+=80,'주말마다 편의점 아르바이트를 했다.'):(E({mn:1}),'수학여행 대신 진로 체험 캠프에 갔다.'),
    ()=>(E({sc:1}),'반 단체티를 맞췄다. 디자인 투표가 세 번 열렸다.'),
  ],
};
const MANUAL={
  elem:[{id:'eng_academy',title:'영어 학원',text:'부모님이 영어 학원에 보내려고 한다.',ch:()=>[
    X('다닌다',()=>(E({ac:4,mn:-2}),'파닉스부터 다시 배웠다.'),'학업↑ 멘탈 조금↓'),
    X('싫다고 한다',()=>(E({mn:2,ac:-1}),'대신 매일 영어 동화 한 권을 읽기로 했다.'),'멘탈↑')],when:()=>S.fam!=='poor'}],
  mid:[{id:'pcbang',title:'시험 전날',text:'친구들이 PC방에 가자고 한다. 내일이 시험이다.',ch:()=>[
    X('간다',()=>(E({sc:3,ac:-3,mn:2}),'두 시간만 하기로 했는데 네 시간을 했다.'),'사교↑ 멘탈↑ 학업↓'),
    X('공부한다',()=>(E({ac:3,sc:-1}),'시험은 무난했다. 단톡방에 PC방 사진이 올라왔다.'),'학업↑ 사교 조금↓')]}],
  high:[{id:'contest',title:'대회 제안',text:()=>`선생님이 ${INTERESTS[topInts(1)[0]]} 관련 대회에 나가보라고 권했다.`,ch:()=>{const k=topInts(1)[0];return [
    X('나간다',()=>{E({[k]:6,mn:-2});if(chance(0.25+S[k]/200)){S.awards.push(INTERESTS[k]+' 대회 수상');return '입상했다. 상장이 생활기록부에 올라갔다.';}return '본선까지 갔다. 상은 받지 못했다.';},`${INTERESTS[k]}↑↑ 멘탈 조금↓`,()=>0.25+S[k]/200,'수상 가능성'),
    X('공부에 집중한다',()=>(E({ac:3}),'대회 날, 자습실에 있었다.'),'학업↑')];}}],
};
async function randomEvents(st){
  if(MANUAL[st]){
    for(const m of MANUAL[st]){
      if(S.seen[m.id]||(m.when&&!m.when())||!chance(0.35))continue;
      S.seen[m.id]=true;
      await resolve(m.title,typeof m.text==='function'?m.text():m.text,m.ch());
      return;
    }
  }
  if(chance(0.6)){
    const pool=RANDOM[st].slice().sort(()=>R()-0.5);
    for(const f of pool){const t=f();if(t){addLog(t);break;}}
  }
}

/* ---------- 갈림길 ---------- */
async function chooseHighSchool(){
  const mp=clamp(0.25+S.ac/300+Math.max(S.dev,S.sec)/250,0,0.9);
  const ch=HIGH_SCHOOLS.map(h=>X(h.name,()=>{
    if(h.k==='meister'&&!chance(mp)){S.school='voc';return '마이스터고 면접에서 떨어졌다. 특성화고에 입학하기로 했다.';}
    S.school=h.k;
    if(h.k==='meister')E({dev:4,sec:3});
    return h.k==='gen'?'집 근처 일반고에 배정됐다.':h.k==='voc'?'특성화고 정보처리과에 합격했다.':'마이스터고에 합격했다. 기숙사 생활이 시작된다.';
  },h.desc,h.k==='meister'?()=>mp:null,'합격 가능성'));
  ch.wAuto=c=>c.t==='일반고'?3:c.t.startsWith('마이스터')?1+Math.max(S.dev,S.sec)/30:1;
  await resolve('고등학교 진학','중학교 마지막 해다. 어느 고등학교에 갈까?',ch,'key');
}
async function careerTalk(){
  const ch=Object.keys(INTERESTS).map(k=>X(INTERESTS[k],()=>{E({[k]:6});S.focusInt=k;return `${INTERESTS[k]} 쪽으로 진로를 생각해보기로 했다. 관련 학과 목록을 받아 왔다.`;},`${INTERESTS[k]}↑ · 지금 ${Math.round(S[k])}`));
  ch.wAuto=c=>1+S[Object.keys(INTERESTS).find(k=>INTERESTS[k]===c.t)]/10;
  await resolve('진로 상담','담임 선생님과 진로 상담을 했다. 어느 분야에 관심이 있냐고 물었다.',ch);
}
function suneung(){
  const sc=S.ac+randn()*8+(S.fam==='rich'?4:0)+(S.region==='metro'?2:0);
  return clamp(Math.round(9-(sc-20)/8),1,9);
}
function univHint(g){return g<=2?'서울 상위권 대학':g<=4?'인서울·지방 거점 국립대':g<=6?'지방 사립대':'전문대';}

/* ---------- 한 해 ---------- */
async function yearTick(){
  S.age++;
  const st=stageOf(S.age).k;
  header();
  if(S.age>=8)S.money+=famOf().pocket*12;
  if(st==='baby'){
    const m=BABY.find(b=>b.a===S.age);if(m)addLog(m.t);
    await randomEvents('baby');
    return;
  }
  if(S.age===8){addLog('초등학교에 입학했다.',{kind:'key'});const a=addFriend('초등학교 친구'),b=addFriend('동네 친구');addLog(`짝꿍 ${a.name}, 같은 아파트에 사는 ${b.name}${J(b.name,'과','와')} 친해졌다.`,{tag:'친구',tagCls:'fr'});}
  if(S.age===14)addLog('중학교에 입학했다. 교복이 조금 컸다.',{kind:'key'});
  if(S.age===17){
    addLog(S.school==='gen'?'고등학교에 입학했다.':S.school==='voc'?'특성화고에 입학했다. 첫 수업은 엑셀이었다.':'마이스터고에 입학했다. 첫 주에 기숙사 점호가 있었다.',{kind:'key'});
    const a=addFriend('고등학교 친구'),b=addFriend('고등학교 친구');addLog(`같은 반 ${a.name}, 옆 반 ${b.name}${J(b.name,'과','와')} 어울리기 시작했다.`,{tag:'친구',tagCls:'fr'});
    await careerTalk();
  }
  await yearActivity();
  await randomEvents(st);
  friendYear();
  // 자연 변화: 멘탈은 기본으로 돌아가려 하고, 고3은 체력이 깎인다
  S.mn=clamp(S.mn+(62-S.mn)*0.15,0,100);
  if(S.age===19)E({hp:-3,mn:-3});
  if(S.age===16)await chooseHighSchool();
  if(S.age===19){
    if(S.school==='gen'){S.sat=suneung();addLog(`수능을 봤다. 평균 ${S.sat}등급. ${univHint(S.sat)}에 원서를 넣을 수 있는 성적이다.`,{kind:'key'});}
    else addLog(`졸업이 다가온다. 자격증 ${S.cert}개${S.awards.length?', 수상 '+S.awards.length+'회':''}. ${S.school==='meister'?'공기업·대기업 고졸 채용':'지역 회사 고졸 채용'}에 지원할 수 있다.`,{kind:'key'});
    S.ended={kind:'1단계 완료',text:'고등학교 졸업까지 왔다. 대학·군대·취업은 다음 단계에서 이어진다.'};
  }
}
