"use strict";
// 회사생활(work.html): 이 세계에 남은 단 하나의 회사 KSJ. v1 틀을 KSJ에 맞게 바꾼다.
// work.html 안의 v1 코드보다 먼저 읽힌다. 함수는 호출될 때 v1 전역을 쓴다. 부서 정의는 js/ksj.js.

const CO={k:'ksj',name:'KSJ',ceo:'대표이사',dir:'본부장',city:'회사 근처',
  ranks:['사원','대리','과장','차장','팀장','본부장','대표이사'],sal:[4600,5300,6400,7700,9000,12000,25000],
  minY:[4,4,4,4,4],pBase:[0.55,0.5,0.42,0.32,0.18],work:1.15,bonus:1.2,cohortN:5,layoff:0.08,
  staff:'임직원 수십만 명',foot:'이 세계에 남은 회사는 KSJ 하나뿐이다. 본부 7개, 부서 21개가 있다.'};
const ATH_RANKS=['신인 선수','주전 선수','핵심 선수','베테랑','주장','코치','단장'];

function readHandoff(){
  try{const m=location.hash.match(/#d=(.+)$/);if(m)return JSON.parse(decodeURIComponent(m[1]));}catch(_){}
  try{const v=localStorage.getItem('n1_handoff');if(v)return JSON.parse(v);}catch(_){}
  return null;
}
const HAND=readHandoff();
// 성장기 로그 (0살~입사). 회사생활 로그 위에 그대로 붙인다.
const CARRY=HAND?(HAND.log||(()=>{try{return localStorage.getItem('n1_log');}catch(_){return null;}})()):null;
const eduLine=()=>HAND.univ?`${HAND.univ.tierName} ${HAND.univ.majorName}${HAND.gradDone?' · 석사':''}${HAND.gpa?` · 학점 ${HAND.gpa.toFixed(2)}`:''}`:`${HAND.school||'고등학교'} 졸업`;
const wSpeed=()=>({0:1,1:1,3:4,8:16})[HAND.speed]||1;
const PRIV=()=>true;
const WORDS=[['공공기관','회사'],['민간 IT기업','다른 회사'],['민간 이직','퇴사'],['공기업 이직','퇴사'],['동기 추천 이직','퇴사'],['민간 기업','개인 사업'],['다른 공기업','개인 사업'],
  ['원장실','대표이사실'],['원장','대표이사'],['실장','본부장'],['혁신도시','회사 근처'],['원내','사내'],['기관','회사'],['경영평가','성과평가'],['정보화','기술'],['직렬','본부'],['공문','공지'],['경영지원팀','경영기획팀']];
// 화면에 나가는 글자만 바꾼다. 내부 키는 그대로 둔다.
function W(t){if(t==null)return t;let s=String(t);for(const [a,b] of WORDS)s=s.split(a).join(b);return s;}

/* ---------- v1 데이터를 KSJ로 바꾸기 ---------- */
const PUB_ONLY=['h_requests','h_thanks','h_visit','h_center_call','a_budget','a_demo','a_model','m_audit','s_leak','x_assembly','x_eval','r_brief','r_conf','job_offer','other_pe'];
const CERTS_HQ={tech:['정보처리기사','정보보안기사','SQLP','클라우드 자격증','PMP'],mgmt:['재경관리사','공인노무사 1차','CPA 1차'],biz:['무역영어 1급','비즈니스 영어 시험','유통관리사'],
  crea:['컬러리스트기사','GTQ 1급','영상편집 자격증'],spt:['생활스포츠지도사','스포츠경영관리사'],life:['영양사','호텔서비스사','보건교육사'],ops:['물류관리사','지게차 운전기능사','산업안전기사']};
const certsFor=()=>CERTS_HQ[hqOf(S.dept)]||CERTS_HQ.tech;
function setHqDepts(){IT_DEPTS.splice(0,IT_DEPTS.length,...KDEPTS.filter(d=>d.hq===hqOf(S&&S.dept||'haeng')).map(d=>({k:d.k,w:1})));}
function applyCompany(){
  if(!HAND)return;
  const rep=(a,b)=>a.splice(0,a.length,...b);
  rep(RANKS,CO.ranks);rep(SAL,CO.sal);rep(MIN_Y,CO.minY);rep(P_BASE,CO.pBase);
  for(const k of Object.keys(DEPTS))if(!KD[k])delete DEPTS[k];
  for(const d of KDEPTS)DEPTS[d.k]={name:d.name,...d.m};
  rep(SEATS,['ceo',...Object.keys(HQS).map(h=>'d:'+h),...KDEPTS.map(d=>'t:'+d.k)]);
  setHqDepts();
  for(let i=EV.length-1;i>=0;i--)if(PUB_ONLY.includes(EV[i].id))EV.splice(i,1);
  rep(ORGS,['KSJ 해외법인','KSJ 재단','KSJ 연구원']);
  EV.push(...buildCoEv(),...(typeof buildKsjEv==='function'?buildKsjEv():[]));
  ACTIONS.push(...CO_ACTIONS);
  Object.assign(STYLE,CO_STYLE,typeof KSJ_STYLE==='object'?KSJ_STYLE:{});
  Object.assign(STAT_NAMES,{ar:'감성',hy:'행복'});
  GOALS.chief.name='대표이사까지';GOALS.chief.hint='본부장 이상이면 달성, 대표이사면 완전 달성.';
  GOALS.exit.name='원하는 부서로';GOALS.exit.hint='한 번 이상 다른 부서로 옮기면 달성.';
  GOALS.fnd={name:'사내벤처',hint:'사내벤처를 이끌면 달성, 자회사로 분사하면 완전 달성.',w:{}};
  $('#help').innerHTML=W($('#help').innerHTML);
}

/* ---------- 넘어온 캐릭터로 사람 만들기 ---------- */
function homeOf(){return HAND.region==='metro'?{home:'near',name:'서울',zone:'근거리',moved:true}:{home:'far',name:HAND.regionName,zone:'장거리',moved:true};}
function makeFromHand(){
  const p=makePerson(),h=homeOf(),dept=KD[HAND.team]?HAND.team:'haeng',d=KD[dept];
  const fit=d.f.reduce((a,f)=>a+((HAND.fc||{})[f]||0),0);
  Object.assign(p,{
    name:HAND.name,gender:HAND.gender==='m'?'남':'여',
    track:'it',trackName:HQS[d.hq],trackP:100,
    typeName:'KSJ 정규직',typeP:100,type:'reg',rank:0,
    dept,deptP:100,deptHist:[d.name],
    home:h.home,homeName:h.name,homeZone:h.zone,homeP:100,moved:h.moved,
    birthMi:-(HAND.age*12+randint(0,11)),
    sk:clamp(Math.round(15+HAND.ac*0.25+(Object.entries(d.w).reduce((a,[k,w])=>a+w*((HAND[k]??50)-50),0))*0.25+fit*3+(HAND.gradDone?5:0)),15,72),rp:randint(42,52),
    sc:clamp(HAND.sc,5,95),hp:clamp(HAND.hp+8,30,95),mn:clamp(HAND.mn,20,95),ar:clamp(HAND.ar??45,5,95),hy:clamp(HAND.hy??60,5,95),
    money:Math.round((HAND.money||0)-(HAND.loan||0)),
  });
  return p;
}
function makePeer(){
  const p=makePerson(),d=pick(KDEPTS);
  Object.assign(p,{track:'admin',trackName:HQS[d.hq],dept:d.k,deptHist:[d.name],type:'reg',typeName:'KSJ 정규직',rank:0,contractEnd:null,birthMi:-(randint(24,30)*12+randint(0,11))});
  return p;
}
function companyInit(){
  S.coHist=['KSJ'];S.hySum=0;S.hyN=0;S.flags={};S.myHq=hqOf(S.dept);
  if(S.dept==='athlete')S.coRanks=ATH_RANKS;
  setHqDepts();
  S.coScore=randint(45,60);
  S.rivals=Object.keys(HQS).filter(h=>h!==hqOf(S.dept)).map(h=>({h,name:HQS[h],score:randint(40,65)}));
  S.friends=(HAND.friends||[]).slice(0,4).map(f=>{
    const r=R(),d=pick(KDEPTS);
    const at=r<0.18?{co:'same',place:'KSJ 입사 동기'}:r<0.6?{co:'ksj',dept:d.k,place:`KSJ ${d.name}`}:{co:'other',place:pick(['대학원','프리랜서','개인 카페','공무원','유튜버','KSJ 협력 학교 교사'])};
    return {name:f.name,from:f.from,fr:Math.round(f.fr),int:f.int,...at};
  });
}
// 본부 평가 순위 (내 본부 vs 다른 본부)
const coRank=()=>1+S.rivals.filter(r=>r.score>S.coScore).length;
const bonusMult=()=>CO.bonus*clamp(1+(S.coScore-50)/80,0.5,1.6);
function rebaseHq(){
  const my=hqOf(S.dept),old=S.rivals.find(r=>r.h===my);
  if(old){S.rivals=S.rivals.filter(r=>r.h!==my);S.rivals.push({h:S.myHq,name:HQS[S.myHq],score:S.coScore});S.coScore=old.score;}
  S.myHq=my;setHqDepts();
}

/* ---------- 부서 이벤트 (개발·보안·AI·경영기획) ---------- */
function buildCoEv(){return [
  {id:'pv_outage',dept:['haeng'],title:'서비스 장애',text:'저녁 8시, 결제 화면에서 오류가 쏟아지기 시작했다. 고객 문의가 분 단위로 늘고 있다.',choices:[
    X('원인부터 찾는다',()=>(E({sk:2,rp:3,hp:-3}),'30분 만에 원인을 찾았다. 전날 바뀐 설정 하나가 문제였다.')),
    X('상황 보고부터 올린다',()=>(E({rp:1}),'보고 라인이 정리되는 사이 다른 팀원이 고쳤다.')),
    X('다음 날 아침에 본다',()=>(E({rp:-4,mn:1}),'아침에 출근하니 회의실이 꽉 차 있었다.'))]},
  {id:'pv_review',dept:['haeng'],title:'코드 리뷰',text:'새로 온 경력직이 내 코드에 코멘트를 서른 개 달았다.',choices:[
    X('하나씩 고치고 이유를 묻는다',()=>(E({sk:3,mn:-1}),'절반은 배울 게 있었다. 나머지 절반은 취향이었다.')),
    X('회의를 잡아 기준을 맞춘다',()=>(E({sc:2,rp:1}),'팀 코드 규칙 문서가 생겼다.')),
    X('중요한 것만 고친다',()=>(E({mn:1}),'다음 리뷰에도 같은 코멘트가 달렸다.'))]},
  {id:'pv_deadline',dept:['haeng'],title:'출시 일정',text:'영업팀이 고객사에 출시일을 먼저 약속했다. 개발 일정은 2주가 모자란다.',choices:[
    X('야근으로 맞춘다',()=>(E({hp:-5,rp:3}),'출시는 제때 됐다. 그 주에 커피를 스무 잔 마셨다.')),
    X('단계 오픈을 제안한다',()=>(E({rp:1,sc:1}),'핵심 기능만 먼저 열었다. 고객사는 의외로 괜찮다고 했다.')),
    X('그대로 진행하고 리스크를 문서로 남긴다',()=>(E({mn:-1}),'출시 다음 날 버그 세 개가 들어왔다. 문서 덕에 책임 소재는 분명했다.'))]},
  {id:'pv_legacy',dept:['haeng'],text:'10년 된 코드를 고치다가 주석 없는 함수 하나에 하루를 썼다.',auto:()=>{E({sk:1,mn:-1});return '';}},
  {id:'pv_ransom',dept:['sec'],title:'랜섬웨어 의심',text:'새벽, 한 직원 PC에서 파일이 한꺼번에 암호화되고 있다는 알림이 왔다.',choices:[
    X('바로 원격 접속한다',()=>(E({hp:-3,rp:4,sk:1}),'네트워크를 끊어 다른 PC로 번지는 걸 막았다.')),
    X('로그부터 전수 확인한다',()=>(E({sk:3,rp:2}),'감염 경로를 찾았다. 메일 첨부 파일이었다.')),
    X('아침에 확인한다',()=>(E({rp:-5}),'아침까지 PC 열두 대가 감염됐다.'))]},
  {id:'pv_pentest',dept:['sec'],title:'모의해킹 결과',text:'외부 모의해킹에서 고위험 취약점 세 개가 나왔다. 개발팀은 다음 분기에 고치자고 한다.',choices:[
    X('개발팀장을 직접 만나 일정을 잡는다',()=>(E({sc:2,rp:2}),'두 개는 이번 달 안에 고치기로 했다.')),
    X('위험도를 보고서로 올린다',()=>(E({rp:1}),'보고서는 결재됐다. 일정은 그대로였다.')),
    X('직접 패치 방안을 만든다',()=>(E({sk:3,hp:-2}),'패치 방안을 들고 가니 개발팀이 바로 받아줬다.'))]},
  {id:'pv_ab',dept:['ai'],title:'A/B 테스트',text:'새 추천 로직의 A/B 테스트 결과가 애매하게 나왔다. 팀장은 좋은 쪽으로 정리해 달라고 한다.',choices:[
    X('데이터를 직접 뜯어본다',()=>(E({sk:3,hp:-1}),'특정 요일에만 효과가 있었다. 그대로 보고했다.')),
    X('확인된 숫자만 낸다',()=>(E({rp:1}),'효과는 통계적으로 의미가 없다고 적었다.')),
    X('원하는 대로 정리한다',()=>(E({rp:2,mn:-2}),'보고는 통과됐다. 석 달 뒤 지표가 원래대로 돌아왔다.'))]},
  {id:'pv_model',dept:['ai'],title:'모델 성능',text:'배포한 예측 모델의 성능이 한 달 만에 떨어졌다.',choices:[
    X('원인부터 찾는다',()=>(E({sk:3,rp:2}),'입력 데이터 형식이 몰래 바뀌어 있었다.')),
    X('분석 범위를 줄인다',()=>(E({mn:1}),'핵심 지표만 다시 맞췄다.')),
    X('마감 연장을 요청한다',()=>(E({rp:-1}),'2주를 더 받았다.'))]},
  {id:'pv_dash',dept:['ai'],text:'임원 보고용 대시보드를 만들었다. 첫 질문은 그래프 색깔이었다.',auto:()=>{E({mn:-1});return '';}},
  {id:'pv_plan',dept:['mgmt'],title:'사업계획',text:'내년 사업계획 초안이 다섯 번째로 반려됐다. 숫자는 그대로인데 표현이 문제라고 한다.',choices:[
    X('팀장들을 직접 만나 의견을 듣는다',()=>(E({sc:2,rp:2}),'각 팀 숫자를 직접 맞췄다. 여섯 번째에 통과됐다.')),
    X('밤새 정리한다',()=>(E({hp:-4,rp:2}),'새벽 두 시에 최종본을 보냈다.')),
    X('작년 보고서 틀에 맞춰 낸다',()=>(E({rp:-1}),'통과는 됐다. 아무도 다시 읽지 않았다.'))]},
  {id:'pv_cost',dept:['mgmt'],title:'비용 절감',text:'위에서 부서별 비용을 10% 줄이라는 지시가 내려왔다.',choices:[
    X('규정 개정안을 직접 만든다',()=>(E({sk:2,rp:2,sc:-1}),'출장비 기준을 바꿨다. 몇몇 팀장이 불만을 말했다.')),
    X('위에서 정한 안대로 문서화한다',()=>(E({mn:-1}),'모든 팀이 똑같이 10%씩 줄였다.'))]},
];}

/* ---------- 동문·아는 동기 (이스터에그) ---------- */
// 윗사람 중 일부는 몰래 같은 학교 출신이다. 처음 같이 밥을 먹을 때 드러난다.
function rollAlum(){
  if(!HAND)return false;
  const k=HAND.univ&&HAND.univ.k;
  let p=!HAND.univ?0.06:{top:0.22,seoul:0.15,natl:0.12,local:0.08,jc:0.05}[k]||0.08;
  if(HAND.gradDone)p+=0.03;
  return chance(p);
}
function alumLunch(p){
  if(!p.alum||p.alumKnown)return null;
  p.alumKnown=true;
  const t=HAND.univ?pick(['알고 보니 같은 대학 선배였다. 학교 앞 국밥집 이야기로 한 시간을 떠들었다.','알고 보니 같은 대학 출신이었다. 그 교수님 아직 계시냐고 물었다.','같은 대학 선배라는 걸 알게 됐다. 축제 때 무대에 섰던 이야기를 들었다.'])
    :'알고 보니 같은 고등학교 선배였다. 매점 아주머니 이야기로 한참 웃었다.';
  return {text:t,why:HAND.univ?'같은 대학 후배라는 걸 알게 됐다':'같은 고등학교 후배라는 걸 알게 됐다'};
}
// 같은 회사에 들어간 학교 친구는 동기가 된다. 나머지 동기 중에도 동문·동네 친구가 섞인다.
let tieLogs=[];
function linkCohort(){
  tieLogs=[];
  const same=(S.friends||[]).filter(f=>f.co==='same');
  same.slice(0,cohort.length).forEach((f,i)=>{
    const p=cohort[i];
    p.name=f.name;p.fr=Math.max(50,f.fr);p.tie=f.from.replace(' 친구','').replace(' 동기','')+(f.from.includes('동기')?' 동기':' 친구');
    p.birthMi=S.birthMi+randint(-12,12);
    tieLogs.push(`${f.from} ${f.name}${J(f.name,'과','와')} 같은 날 입사했다. 입사식에서 서로 보고 한참 웃었다.`);
  });
  S.friends=(S.friends||[]).filter(f=>f.co!=='same');
  cohort.forEach(p=>{
    if(p.tie)return;
    if(HAND.univ&&chance(0.2)){p.tie='대학 동문';p.fr=clamp(p.fr+30,0,100);tieLogs.push(`동기 ${p.name}${J(p.name,'은','는')} 같은 대학 출신이다. 학교 다닐 때 얼굴만 알던 사이다.`);}
    else if(chance(0.15)){p.tie='동네 친구';p.fr=clamp(p.fr+25,0,100);tieLogs.push(`동기 ${p.name}${J(p.name,'은','는')} 같은 동네에서 자랐다. 어릴 때 같은 놀이터에서 놀았던 것 같다.`);}
  });
}
function cohortTieLogs(){tieLogs.forEach(t=>addLog(t,{kind:'peer',tag:'동기'}));}


/* ---------- 매달: 본부 평가·본부 경쟁·희망퇴직·친구·스카웃·사내벤처·감성·행복 ---------- */
async function companyMonth(m){
  if(!HAND)return;
  const a=age();
  monthlyFeel();
  if(m===1&&S.mi>0){
    const before=S.lastRank||coRank();
    S.coScore=clamp(S.coScore+randn()*5+(S.sk-55)*0.04+(S.rank>=4?(S.rp-50)*0.05:0),10,95);
    S.rivals.forEach(r=>r.score=clamp(r.score+randn()*5,10,95));
    const rk=coRank();S.lastRank=rk;
    const top=[{name:HQS[hqOf(S.dept)],score:S.coScore},...S.rivals].sort((x,y)=>y.score-x.score).slice(0,3).map((x,i)=>`${i+1}위 ${x.name}`).join(', ');
    addLog(`올해 본부 평가가 나왔다. ${top}. 우리 본부는 ${rk}위다.`+(rk<before?' 순위가 올랐다. 성과급 이야기가 돈다.':rk>before?' 순위가 내려갔다. 본부장 얼굴이 굳었다.':''),{kind:'sys',tag:'본부'});
    if(rk>before)E({mn:-2});else if(rk<before)E({mn:2});
  }
  if(S.leave===0&&S.mi-(S.rvMi??-99)>=24&&chance(0.025)){S.rvMi=S.mi;await hqEvent();}
  if(m===1&&S.venture){await ventureYear();if(S.ended)return;}
  if(m===1&&S.dept==='athlete'&&!S.coach&&(a>=36||(a>=32&&chance(0.35)))){await athleteRetire();if(S.ended)return;}
  if(CO.layoff&&m===1&&a>=50&&S.rank<5&&S.leave===0&&chance(CO.layoff)){
    const pay=Math.round(salary(S,S.mi)*2);
    await resolve('희망퇴직',`희망퇴직 신청을 받는다는 공지가 올라왔다. 팀장이 조용히 면담을 잡았다. 위로금은 연봉의 2배라고 한다.`,[
      X('위로금을 받고 나간다',()=>{E({money:pay});endGame('희망퇴직',`희망퇴직했다. 위로금 ${fmtMoney(pay)}원을 받았다. 근속 ${tenureStr(S.mi)}.`);return '';},`+${fmtMoney(pay)}원 · 게임 종료`),
      X('버틴다',()=>(E({mn:-6,rp:-2,hy:-3}),'신청하지 않았다. 다음 달 자리 배치가 바뀌었다.'),'멘탈↓ 평판 조금↓ 행복 조금↓')],true,'key');
    if(S.ended)return;
  }
  if(S.friends&&S.friends.length&&S.leave===0&&chance(0.035))await friendEvent();
  const hunting=S.huntUntil&&S.mi<S.huntUntil;
  if(!S.venture&&S.leave===0&&a<55&&(hunting?(S.sk>=50||S.rp>=55):(S.sk>=62||S.rp>=66))&&S.mi-(S.scoutMi??-99)>=(hunting?3:24)&&chance(hunting?0.2:0.015)){S.scoutMi=S.mi;await scoutEvent();if(S.ended)return;}
  if(!S.venture&&S.leave===0&&a>=27&&a<=48&&S.mi-(S.coFoundAsk??-99)>=36&&chance(0.006)){
    const f=(S.friends||[]).filter(x=>x.fr>=55&&x.co!=='other').concat(cohort.filter(p=>!p.ended&&p.fr>=55).map(p=>({name:p.name,from:'동기',fr:p.fr,int:pick(Object.keys(FIELDS))}))).sort((x,y)=>y.fr-x.fr)[0];
    if(f){S.coFoundAsk=S.mi;await cofoundEvent(f);}
  }
}
// 감성·행복: 매달 조금씩 움직인다
function monthlyFeel(){
  const d=KD[S.dept]||KD.haeng,crea=['design','media','mkt','pr','fnb'].includes(S.dept);
  S.ar=clamp(S.ar+(crea?0.12:-0.03)+(S.focus==='self'?0.04:0),5,100);
  if(crea)E({sk:(S.ar-50)/400});
  const fit=d.f.some(f=>(HAND.fc||{})[f]>0)?3:0;
  const kids=Math.min(S.kids||0,2);
  const target=48+(S.married?8:S.dating?5:0)+kids*4+(S.mn-50)*0.25+(['rel','health'].includes(S.focus)?4:0)+(S.money<0?-6:0)+(S.leave>0&&S.leaveType==='parental'?6:0)+fit-(S.hp<40?4:0)+(S.venture?3:0);
  S.hy=clamp(S.hy+(target-S.hy)*0.06,0,100);
  if(S.hy<30)E({mn:-0.5});else if(S.hy>70)E({mn:0.3});
  S.hySum+=S.hy;S.hyN++;
}

/* ---------- 본부끼리 경쟁 (선택 없이 역량·사교로 결과) ---------- */
const HQ_TX={
  budget:[['내년 예산 배정을 두고 {r}{와} 맞붙었다.','예산을 원하는 만큼 따냈다. 팀장이 회식을 잡았다.','예산이 30% 깎였다. 하려던 사업 두 개를 접었다.'],
          ['신규 인력 열 명을 두고 {r}{와} 줄다리기를 했다.','인력 여섯 명을 받아왔다.','인력은 {r}{으로} 갔다. 야근이 늘었다.']],
  project:[['대표이사 직속 신사업 TF 주도권을 두고 {r}{와} 경쟁했다.','우리 본부가 TF를 맡게 됐다. 본부장이 직접 칭찬했다.','TF는 {r}{으로} 넘어갔다. 우리 쪽 아이디어도 같이 넘어갔다.'],
           ['사내 혁신 공모전 결선에서 {r}{와} 붙었다.','대상을 받았다. 상금으로 팀 전체가 고기를 먹었다.','근소한 차이로 2등이었다.'],
           ['같은 고객사 건을 두고 {r}{와} 서로 자기 일이라고 주장했다.','조정 회의에서 우리 본부 일로 정리됐다.','결국 {r} 일이 됐다. 우리가 만든 자료는 넘겨줬다.']],
  talent:[['{r}에서 우리 팀 에이스에게 사내 공모 제안을 했다는 소문이 돈다.','팀원들과 이야기를 나눴다. 아무도 떠나지 않았다.','팀 선임 한 명이 {r}{으로} 옮겼다. 일이 늘었다.']],
  review:[['연말 전사 발표회에서 {r}{와} 같은 날 발표를 했다.','발표가 끝나자 박수가 길었다.','앞 순서인 {r} 발표가 너무 좋았다. 우리 발표는 묻혔다.']],
};
async function hqEvent(){
  const rv=pick(S.rivals),intel=S.intelUntil&&S.mi<S.intelUntil?0.12:0;
  const kind=pick(['budget','project','project','talent','review']);
  S.rvUsed=S.rvUsed||{};
  const all=HQ_TX[kind].map((t,i)=>({t,i})),list=all.filter(x=>!S.rvUsed[kind+x.i]);
  const it=list.length?pick(list):pick(all);S.rvUsed[kind+it.i]=1;
  const f=x=>x.replace(/\{r\}/g,rv.name).replace('{와}',J(rv.name,'과','와')).replace('{이}',J(rv.name,'이','가')).replace('{으로}',J(rv.name,'으로','로'));
  const p=clamp(0.25+(S.sk-50)/120+(S.sc-50)/200+intel,0.05,0.9);
  if(chance(p)){
    S.coScore=clamp(S.coScore+5,0,100);rv.score=clamp(rv.score-3,0,100);E({rp:4,mn:3});rel(boss(),4,`${rv.name}${J(rv.name,'과','와')}의 경쟁에서 이겼다`);
    addLog(f(it.t[0])+' '+f(it.t[1])+(intel?' 친구에게 들은 이야기가 도움이 됐다.':''),{kind:'key',tag:'본부 경쟁'});
  }else{
    S.coScore=clamp(S.coScore-3,0,100);rv.score=clamp(rv.score+3,0,100);E({rp:-3,mn:-3});
    addLog(f(it.t[0])+' '+f(it.t[2]),{kind:'key',tag:'본부 경쟁'});
  }
}

/* ---------- 학교 친구 (모두 KSJ 세계에 산다) ---------- */
async function friendEvent(){
  const f=pick(S.friends.filter(x=>x.fr>=10)||[]);if(!f)return;
  if(f.co==='ksj'){
    await resolve('친구 연락',`${f.from} ${f.name}에게서 연락이 왔다. ${f.place}에 있다. 저녁이나 먹자고 한다.`,[
      X('만나서 근황을 나눈다',()=>{f.fr=clamp(f.fr+10,0,100);E({mn:3,hy:2,money:-5});if(chance(0.5)){S.intelUntil=S.mi+12;return `${f.name}${J(f.name,'이','가')} 그 본부 분위기를 슬쩍 이야기했다. 다음 본부 경쟁 때 도움이 될 것 같다.`;}return '회사 이야기는 거의 안 했다. 옛날 이야기만 세 시간 했다.';},'친밀도↑ 멘탈↑ 행복↑ · 사내 정보를 들을 수도'),
      X('회사 이야기는 피한다',()=>{f.fr=clamp(f.fr+4,0,100);return '근황만 짧게 나눴다.';},'친밀도 조금↑'),
      X('바쁘다고 미룬다',()=>{f.fr=clamp(f.fr-6,0,100);return '다음에 보자고 답했다.';},'친밀도↓')],true,'');
  }else{
    f.fr=clamp(f.fr-1,0,100);
    addLog(`${f.from} ${f.name} 근황: ${f.place}${pick([' 일을 하며 잘 지낸다고 한다.','. 단톡방에 사진이 올라왔다.',' 일을 한다. 다음 달에 결혼한다고 한다.'])}`,{kind:'peer',tag:'친구 '+f.name});
  }
}
function renderFriends(){
  const el=$('#schoolList');if(!el)return;
  el.innerHTML=(S.friends||[]).map((f,i)=>{const w=f.lastMi!==undefined&&S.mi-f.lastMi<3;return `<button type="button" class="peer-card" data-f="${i}"><b>${f.name}</b> <span class="meta">${f.from}</span><div class="meta">${f.place}</div><div class="st">${w?`${3-(S.mi-f.lastMi)}개월 뒤에 다시 만날 수 있다`:'눌러서 만나기'}</div><div class="fr"><span>친밀도 ${Math.round(f.fr)}</span><div class="track"><div class="fill" style="width:${Math.round(f.fr)}%"></div></div></div></button>`;}).join('')||'<p class="meta">연락하는 학교 친구가 없다.</p>';
}
async function schoolMenu(i){
  const f=S.friends[i];if(!f||!S||S.ended||busy||!$('#modal').hidden)return;
  if(f.lastMi!==undefined&&S.mi-f.lastMi<3)return;
  clearTimeout(timer);busy=true;const prev=settings.auto;settings.auto=false;
  const ch=[X('밥 먹기',()=>{E({money:-5,mn:3,hy:2});f.fr=clamp(f.fr+8,0,100);return `${f.name}${J(f.name,'과','와')} 저녁을 먹었다. ${pick(['학교 다닐 때 이야기만 했다.','서로 회사 욕을 실컷 했다.','다음엔 다 같이 모이자고 했다.'])}`;},'−5만원 · 친밀도↑ 멘탈↑ 행복↑')];
  if(f.co==='ksj')ch.push(X('그 부서 이야기를 듣는다',()=>{f.fr=clamp(f.fr+3,0,100);f.told=true;if(chance(0.55)){S.intelUntil=S.mi+12;return `${f.place} 사정을 자세히 들었다. 사내 공모나 본부 경쟁 때 도움이 될 것 같다.`;}return `${f.name}${J(f.name,'은','는')} 회사 이야기는 웃으며 넘겼다.`;},'친밀도 조금↑ · 그 부서로 옮길 때 유리'));
  ch.push(X('그냥 둔다',()=>null));
  const k=await ask(f.name,`${f.from} · ${f.place} · 친밀도 ${Math.round(f.fr)}`,ch);
  if(ch[k].t!=='그냥 둔다'){f.lastMi=S.mi;addLog(ch[k].f(),{kind:'act',tag:'친구 '+f.name});}
  settings.auto=prev;busy=false;render();schedule();
}

/* ---------- 부서 이동 (사내 공모·본부 스카웃) ---------- */
function moveDept(k,o={}){
  const from=DEPTS[S.dept].name,oldSal=salary(S,S.mi);
  changeDept(k);S.deptSince=S.mi;rebaseHq();
  if(S.coRanks&&k!=='athlete'){delete S.coRanks;}
  if(k==='athlete')S.coRanks=ATH_RANKS;
  if(o.up&&S.rank<4){S.rank++;S.rankSince=S.mi;}
  S.salMul=1;const base=salary(S,S.mi);S.salMul=clamp(oldSal*(1+(o.bump||0))/base,0.85,2);
  S.moves=(S.moves||0)+1;S.trackName=HQS[hqOf(k)];
  S.people=S.people||[];syncSeats();
  addLog(`${from}에서 ${HQS[hqOf(k)]} ${DEPTS[k].name}${J(DEPTS[k].name,'으로','로')} 옮겼다.${o.why?' '+o.why:''}`,{kind:'key',tag:'부서 이동'});
  render();
}
const moveP=d=>{
  const f=(S.friends||[]).find(x=>x.co==='ksj'&&x.dept===d.k&&x.fr>=50);
  const L=seatOf('t:'+d.k);
  return clamp(deptFit(d,{ac:S.sk,hp:S.hp,sc:S.sc,mn:S.mn,ar:S.ar,fc:HAND.fc||{},edu:0})+(S.rp-50)/200+(L?L.rel/300:0)+(f?0.1:0)-(age()>=45?(age()-45)*0.02:0),0.03,0.9);
};
function scoutTargets(){
  const fc=HAND.fc||{};
  const pool=KDEPTS.filter(d=>d.k!==S.dept&&d.hq!==hqOf(S.dept)&&(d.f.some(f=>fc[f]>0)||chance(0.3)));
  return pool.length?pool:KDEPTS.filter(d=>d.k!==S.dept);
}
async function scoutEvent(){
  const d=pick(scoutTargets());
  const ref=(S.friends||[]).find(f=>f.co==='ksj'&&f.dept===d.k&&f.fr>=60);
  await resolve('본부 스카웃',`${HQS[d.hq]}에서 연락이 왔다.${ref?` ${ref.from} ${ref.name}${J(ref.name,'이','가')} 추천했다고 한다.`:''} ${d.name}에서 같이 일하자고 한다. 직급을 한 단계 올려주겠다고 한다.`,[
    X('옮긴다',()=>{moveDept(d.k,{up:true,bump:0.08,why:'본부 스카웃이었다.'});if(ref)ref.fr=clamp(ref.fr+8,0,100);return '인사 발령이 났다. 짐은 상자 두 개였다.';},'직급 한 단계↑ · 새 부서'),
    X('지금 팀장에게 말하고 남는다',()=>{if(chance(0.4+S.rp/300)){S.salMul=(S.salMul||1)*1.06;rel(boss(),3,'붙잡을 만한 사람이라고 봤다');return '팀장이 위에 이야기해 연봉을 6% 올려줬다.';}rel(boss(),-6,'다른 본부 제안을 흘렸다');E({mn:-2});return '팀장 표정이 굳었다. 이야기는 거기서 끝났다.';},'잘되면 연봉↑ · 안 되면 팀장 관계↓',()=>0.4+S.rp/300,'통할 가능성'),
    X('거절한다',()=>(E({mn:1}),'정중하게 거절했다.'),'멘탈 조금↑')],true,'key');
}
async function jobHuntFlow(){
  if(!S||S.ended)return;
  clearTimeout(timer);busy=true;const prev=settings.auto;settings.auto=false;
  const fc=HAND.fc||{};
  const list=KDEPTS.filter(d=>d.k!==S.dept).sort((a,b)=>moveP(b)-moveP(a));
  const opts=[...list.slice(0,3)];
  for(const d of list)if(opts.length<5&&!opts.includes(d)&&d.f.some(f=>fc[f]>0))opts.push(d);
  const fr=(S.friends||[]).find(f=>f.co==='ksj'&&f.told);if(fr&&KD[fr.dept]&&!opts.includes(KD[fr.dept])&&fr.dept!==S.dept)opts.push(KD[fr.dept]);
  const ch=opts.map(d=>X(`${d.name}에 지원한다`,()=>{
    if(chance(moveP(d))){moveDept(d.k,{why:'사내 공모에 붙었다.'});return '면접 결과 발표가 났다. 합격이었다.';}
    E({mn:-3});return pick(['서류에서 떨어졌다.','면접까지 갔다. 연락이 없었다.','지금 팀장이 보내주지 않았다.']);
  },`${HQS[d.hq]} · ${d.desc}`,()=>moveP(d),'합격 가능성'));
  ch.push(X('이번엔 그만둔다',()=>'공고 창을 닫았다.'));
  const i=await ask('사내 공모','사내 공모 게시판을 열었다. 어느 부서에 지원해 볼까?',ch);
  addLog('사내 공모 게시판을 훑어봤다.',{pick:ch[i].t,res:ch[i].f(),kind:'key'});
  settings.auto=prev;busy=false;render();schedule();
}

/* ---------- 스포츠단 선수 은퇴 ---------- */
async function athleteRetire(){
  await resolve('은퇴 기로',`몸이 예전 같지 않다. 감독이 다음 시즌 이야기를 하자며 불렀다.`,[
    X('코치로 남는다',()=>{S.coach=true;S.rank=Math.max(S.rank,5);S.rankSince=S.mi;E({mn:2});return '은퇴식을 했다. 다음 주부터 코치 조끼를 입었다.';},'스포츠단에 남는다'),
    X('스포츠마케팅팀으로 옮긴다',()=>{moveDept('sportsmkt',{why:'선수 생활을 마쳤다.'});E({hy:3});return '은퇴식을 했다. 이제 경기를 관중석에서 본다.';},'선수 경험을 살린다'),
    X('한 시즌 더 뛴다',()=>{E({hp:-6,mn:-2});return '재계약서에 사인했다. 무릎 보호대를 하나 더 샀다.';},'체력↓')],true,'key');
}

/* ---------- 사내벤처 ---------- */
const FND_ITEM={dev:'개발자 협업 툴',sec:'보안 진단 서비스',res:'데이터 분석 서비스',biz:'B2B 구독 서비스',fnd:'동네 상권 앱',spt:'스포츠 레슨 플랫폼',art:'디자인 굿즈 브랜드',med:'숏폼 콘텐츠 스튜디오',ppl:'상담 매칭 서비스',fld:'물류 자동화 장비'};
function found(partner,field){
  const from=S.dept;
  S.venture={item:FND_ITEM[field]||FND_ITEM.fnd,partner:partner?partner.name:null,val:3000,round:0,equity:partner?0.15:0.25,from};
  S.foundCount=(S.foundCount||0)+1;
  DEPTS.venture={name:`사내벤처 ${S.venture.item}`,hp:-1.0,mn:-0.8,sk:0.45,rp:0.3};
  if(!SEATS.includes('t:venture'))SEATS.push('t:venture');
  changeDept('venture');S.deptSince=S.mi;syncSeats();
  const L=seatOf('t:venture');if(L&&partner){L.name=partner.name;L.rel=clamp(partner.fr,0,100);L.hist=[{mi:S.mi,d:0,why:'같이 사내벤처를 차렸다'}];}
  addLog(`사내벤처 심사를 통과했다. ${partner?`${partner.from} ${partner.name}${J(partner.name,'과','와')} `:''}${S.venture.item} 팀을 꾸렸다. 사무실은 본사 지하 1층 공유 공간이다.`,{kind:'key',tag:'사내벤처'});
  render();
}
async function cofoundEvent(f){
  await resolve('사내벤처 제안',`${f.from} ${f.name}${J(f.name,'이','가')} 술자리에서 진지하게 말했다. 같이 사내벤처를 해보자고 한다. 아이템은 ${FND_ITEM[f.int]||FND_ITEM.fnd}다.`,[
    X('같이 한다',()=>{found(f,f.int);return '다음 날 사내벤처 신청서를 냈다.';},'사내벤처 시작'),
    X('지금 부서에 남는다',()=>{f.fr=clamp(f.fr-3,0,100);return `${f.name}${J(f.name,'은','는')} 아쉽다며 웃었다.`;},'친밀도 조금↓')],true,'key');
}
async function foundFlow(){
  if(!S||S.ended)return;
  clearTimeout(timer);busy=true;const prev=settings.auto;settings.auto=false;
  const fc=HAND.fc||{};
  const fields=Object.keys(FND_ITEM).sort((a,b)=>(fc[b]||0)-(fc[a]||0)).slice(0,3);
  const i=await ask('사내벤처 아이템','사내벤처 공모에 낼 아이템을 고른다.',fields.map(k=>X(FND_ITEM[k],()=>k,(fc[k]||0)>0?'해본 분야':'')).concat([X('그만둔다',()=>null)]));
  const field=i<fields.length?fields[i]:null;
  if(field){
    const fr=(S.friends||[]).filter(x=>x.co==='ksj').concat(cohort.filter(p=>!p.ended).map(p=>({name:p.name,from:'동기',fr:p.fr,int:field}))).filter(x=>x.fr>=40).sort((a,b)=>b.fr-a.fr).slice(0,3);
    const j=await ask('같이 할 사람','혼자 할까, 누구와 같이 할까?',fr.map(x=>X(`${x.from} ${x.name}${J(x.name,'과','와')} 같이 한다`,()=>x,`친밀도 ${Math.round(x.fr)}`)).concat([X('혼자 한다',()=>null,'지분은 많이, 일은 혼자')]));
    found(j<fr.length?fr[j]:null,field);
  }else addLog('사내벤처 계획서를 쓰다가 덮었다.',{kind:'sys'});
  settings.auto=prev;busy=false;render();schedule();
}
function ventureBack(why){
  const v=S.venture;S.venture=null;
  moveDept(KD[v.from]?v.from:'haeng',{why});
  SEATS.splice(SEATS.indexOf('t:venture'),1);S.people=S.people.filter(p=>p.seat!=='t:venture');delete DEPTS.venture;S.moves=Math.max(0,(S.moves||1)-1);
}
async function ventureYear(){
  const v=S.venture,fc=(HAND.fc||{}).fnd||0;
  const p=clamp(0.22+fc*0.04+(S.sk-55)/150+(S.sc-55)/200+(v.partner?0.05:0),0.05,0.6);
  if(v.round<3&&chance(p)){
    v.round++;v.val=Math.round(v.val*randint(3,5));E({mn:5,rp:3,hy:3});
    addLog(`${['사내 투자 심사','외부 투자 유치','분사 준비 심사'][v.round-1]}를 통과했다. 기업가치 ${fmtMoney(v.val)}원, 내 지분 ${Math.round(v.equity*100)}%.`,{kind:'key',tag:'사내벤처'});
    return;
  }
  if(v.round>=2&&chance(0.15)){
    const pay=Math.round(v.val*v.equity);
    await resolve('분사',`이사회가 ${v.item}의 분사를 승인했다. KSJ 자회사로 독립한다. 내 지분 가치는 약 ${fmtMoney(pay)}원이다.`,[
      X('자회사 대표가 된다',()=>{E({money:Math.round(pay*0.3)});S.exited=true;endGame('자회사 대표',`${v.item}가 KSJ 자회사로 분사했다. 대표가 됐다. 지분 일부를 팔아 ${fmtMoney(Math.round(pay*0.3))}원을 받았다.`);return '';},'게임 종료 · 지분 일부 현금화'),
      X('지분을 팔고 KSJ로 돌아온다',()=>{E({money:pay,hy:4});S.exited=true;ventureBack('분사를 마치고 원래 자리로 돌아왔다.');if(S.rank<4){S.rank++;S.rankSince=S.mi;}return `${fmtMoney(pay)}원이 통장에 들어왔다.`;},`+${fmtMoney(pay)}원 · 직급↑`)],true,'key');
    return;
  }
  const q=clamp(0.14-v.round*0.03-fc*0.01,0.03,0.3);
  if(chance(q)){
    await resolve('사내벤처 정리','사내벤처 중간 평가에서 정리 결정이 났다. 원래 부서로 돌아가야 한다.',[
      X('받아들인다',()=>{E({mn:-6,hy:-4});ventureBack('사내벤처가 정리됐다.');return '팀원들과 마지막 회식을 했다.';},'멘탈↓ 행복↓'),
      X('한 번만 더 기회를 달라고 한다',()=>{if(chance(0.35)){E({mn:-3});return '석 달 연장을 받았다. 그 사이 큰 계약 하나를 따냈다.';}E({mn:-8,rp:-3,hy:-5});ventureBack('연장 끝에 사내벤처가 정리됐다.');return '연장도 소용없었다.';},'성공하면 계속',()=>0.35,'살아날 가능성')],true,'key');
  }else addLog(pick(['이번 분기 목표를 겨우 맞췄다.','첫 고객사가 재계약을 해줬다.','사내 데모데이에서 발표했다. 대표이사가 질문을 두 개 했다.']),{kind:'sys',tag:'사내벤처'});
}
const CO_ACTIONS=[
  {k:'jobhunt',name:'사내 공모 지원',cost:0,cd:12,when:()=>!S.venture&&age()<58&&S.leave===0,why:'지금은 어렵다',run:()=>{S.huntUntil=S.mi+6;setTimeout(jobHuntFlow,0);return '사내 공모 게시판을 열었다. 한동안 다른 본부에서 연락이 올 수도 있다.';}},
  {k:'found',name:'사내벤처 지원',cost:0,cd:24,when:()=>!S.venture&&age()<52&&S.leave===0,why:'지금은 어렵다',run:()=>{setTimeout(foundFlow,0);return '사내벤처 공모 공고를 읽었다.';}},
];
const CO_STYLE={
  '다음 날 아침에 본다':'avoid','하나씩 고치고 이유를 묻는다':'skill','회의를 잡아 기준을 맞춘다':'social','중요한 것만 고친다':'safe',
  '개발팀장을 직접 만나 일정을 잡는다':'social','위험도를 보고서로 올린다':'safe','직접 패치 방안을 만든다':'skill',
  '원하는 대로 정리한다':'avoid',
};

/* ---------- 결혼: 하겠다고 고른 뒤에 예식 규모를 고른다 ---------- */
async function proposeOk(){
  if(!HAND)return true;
  if(S.weddingAt&&S.mi>=S.weddingAt)return true; // 내가 결혼 준비를 눌러 날짜를 잡은 경우
  S.propMi=S.mi;const w=pw();let ok=false;
  const yrs=Math.max(1,Math.round((S.mi-(S.datingSince||0))/12));
  await resolve('결혼 이야기',`${w}${J(w,'이','가')} 조심스럽게 결혼 이야기를 꺼냈다. 만난 지 ${yrs}년이 됐다.`,[
    X('결혼하자',()=>{ok=true;PF(6);E({mn:4});return '둘 다 한참 웃었다. 양가에 인사드릴 날을 잡았다.';},'멘탈↑ · 예식 규모를 고른다'),
    X('조금 더 생각해 보자',()=>{S.propNo=(S.propNo||0)+1;PF(-8);E({mn:-1});if(S.propNo>=3&&chance(0.5)){S.dating=false;S.propNo=0;E({mn:-8});return `${w}${J(w,'은','는')} 더 기다릴 수 없다고 했다. 헤어졌다.`;}return `${w}${J(w,'은','는')} 알겠다고 했다. 표정이 조금 굳었다.`;},(S.propNo||0)>=2?'친밀도↓ · 헤어질 수도 있다':'친밀도↓ · 1년 뒤 다시 이야기')],true,'key');
  return ok;
}

/* ---------- 연인·배우자·아이 이름 ---------- */
function newName(){let n,t=0;do{n=pick(SUR)+pick(GIVEN);t++;}while(t<30&&(n===S.name||(S.people||[]).some(p=>p.name===n)));return n;}
function kidName(){const used=(S.kidsList||[]).map(k=>k.name);let n,t=0;do{n=pick(GIVEN);t++;}while(t<30&&used.includes(n));return n;}
const kidNm=i=>{const k=(S.kidsList||[])[i];return k&&k.name?k.name:(S.kids>1?['첫째','둘째','셋째'][i]:'아이');};
