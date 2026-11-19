"use strict";
// v2.1 회사생활: 성장 단계에서 넘어온 캐릭터와 회사 종류에 맞춰 v1 틀(work.html)을 바꾼다.
// work.html 안의 v1 코드보다 먼저 읽힌다. 함수는 호출될 때 v1 전역을 쓴다.

const COS={
  big:{k:'big',name:'대기업',ceo:'대표이사',dir:'임원',city:'회사 근처',ranks:['사원','대리','과장','차장','팀장','임원','대표이사'],sal:[5000,5800,7000,8400,10000,14000,30000],minY:[4,4,4,4,4],pBase:[0.55,0.5,0.4,0.3,0.15],work:1.25,bonus:1.6,cohortN:6,layoff:0.15,teams:['haeng','sec','ai','mgmt'],staff:'임직원 수만 명',foot:'같은 날 입사한 동기가 많다. 연봉은 높고, 일도 많다.'},
  pub:{k:'pub',name:'공기업',ceo:'원장',dir:'실장',city:'혁신도시',ranks:['주임','대리','과장','차장','팀장','실장','원장'],sal:[3700,4317,5300,6400,7400,8600,12500],minY:[4,5,5,4,4],pBase:[0.55,0.5,0.45,0.35,0.25],work:1,bonus:1,cohortN:4,layoff:0,teams:['haeng','sec','ai','mgmt'],staff:'임직원 약 500명',foot:'근무지는 지방 혁신도시 본사다. 정년까지 안정적이고, 순환보직이 있다.'},
  mid:{k:'mid',name:'중견·IT기업',ceo:'대표',dir:'본부장',city:'회사 근처',ranks:['사원','대리','과장','차장','팀장','본부장','대표'],sal:[3600,4200,5000,6000,7000,9000,15000],minY:[3,3,4,4,4],pBase:[0.6,0.55,0.45,0.35,0.2],work:1.1,bonus:1,cohortN:3,layoff:0.08,teams:['haeng','sec','mgmt'],staff:'임직원 약 300명',foot:'팀이 작아서 팀장과의 관계가 크게 작용한다.'},
  st:{k:'st',name:'스타트업',ceo:'대표',dir:'C레벨',city:'회사 근처',ranks:['매니저','시니어','리드','파트장','팀장','C레벨','대표'],sal:[3800,4500,5400,6400,7400,10000,14000],minY:[2,2,2,3,3],pBase:[0.65,0.6,0.5,0.4,0.25],work:1.35,bonus:0.5,cohortN:1,layoff:0,teams:['haeng','mgmt'],staff:'직원 약 30명',foot:'사람이 자주 바뀌고, 회사 운명이 해마다 갈린다. 대신 스톡옵션이 있다.'},
};
const TEAM_KEY={dev:'haeng',sec:'sec',res:'ai',biz:'mgmt'};
const TEAM_NAME={haeng:'개발팀',sec:'보안팀',ai:'데이터·연구팀',mgmt:'경영기획팀'};
// 경쟁사 이름은 모두 지어낸 것이다.
const RIVALS={big:['한누리전자','청람그룹'],pub:[],mid:['바른숲시스템','온빛소프트'],st:['모아핀','스프링보드랩']};

function readHandoff(){
  try{const m=location.hash.match(/#d=(.+)$/);if(m)return JSON.parse(decodeURIComponent(m[1]));}catch(_){}
  try{const v=localStorage.getItem('n1_handoff');if(v)return JSON.parse(v);}catch(_){}
  return null;
}
const HAND=readHandoff();
let CO=HAND?COS[HAND.co]||COS.mid:null;
const PRIV=()=>CO&&CO.k!=='pub';
let WORDS=[];
function buildWords(){
  const mg=CO.k==='st'?'사업팀':'경영기획팀';
  WORDS=PRIV()?[['공공기관','회사'],['민간 IT기업','다른 IT기업'],['민간 이직','이직'],['민간 기업','다른 회사'],['다른 공기업','공기업'],['원장실',CO.ceo+'실'],['원장',CO.ceo],['실장',CO.dir],['혁신도시',CO.city],['원내','사내'],['기관','회사'],['경영평가','성과평가'],['정보화','기술'],['직렬','직무'],['공문','공지'],['경영지원팀',mg]]
    :[['경영지원팀',mg]];
}
// 화면에 나가는 글자만 회사 종류에 맞게 바꾼다. 내부 키는 그대로 둔다.
function W(t){if(t==null||!CO)return t;let s=String(t);for(const [a,b] of WORDS)s=s.split(a).join(b);return s;}

/* ---------- v1 데이터 바꾸기 ---------- */
const PUB_ONLY=['h_requests','h_thanks','h_visit','h_center_call','a_budget','a_demo','a_model','m_audit','s_leak','x_assembly','x_eval','r_brief','r_conf'];
function applyCompany(){
  if(!CO)return;
  buildWords();
  const rep=(a,b)=>a.splice(0,a.length,...b);
  rep(RANKS,CO.ranks);rep(SAL,CO.sal);rep(MIN_Y,CO.minY);rep(P_BASE,CO.pBase);
  for(const k of Object.keys(DEPTS))if(!CO.teams.includes(k))delete DEPTS[k];
  for(const k of CO.teams)DEPTS[k].name=TEAM_NAME[k];
  if(DEPTS.mgmt&&CO.k==='st')DEPTS.mgmt.name='사업팀';
  rep(IT_DEPTS,['haeng','sec','ai'].filter(k=>CO.teams.includes(k)).map(k=>({k,w:1})));
  rep(SEATS,['ceo','d:it','d:ms',...CO.teams.map(k=>'t:'+k)]);
  if(PRIV()){
    for(let i=EV.length-1;i>=0;i--)if(PUB_ONLY.includes(EV[i].id))EV.splice(i,1);
    rep(ORGS,['계열사','협력사','투자사']);
  }
  EV.push(...buildCoEv());
  Object.assign(STYLE,CO_STYLE);
  GOALS.chief.name=`${CO.ceo}까지`;GOALS.chief.hint=`${CO.dir} 이상이면 달성, ${CO.ceo}이면 완전 달성.`;
  GOALS.exit.hint='다른 회사로 옮기면 달성.';
  if(PRIV())$('#help').innerHTML=W($('#help').innerHTML);
}

/* ---------- 넘어온 캐릭터로 사람 만들기 ---------- */
function homeOf(){
  const r=HAND.region;
  if(PRIV())return r==='metro'?{home:'near',name:'서울',zone:'근거리',moved:true}:{home:'far',name:HAND.regionName,zone:'장거리',moved:true};
  return r==='metro'?{home:'metro',name:'서울',zone:'수도권',moved:false}:r==='city'?{home:'mid',name:'인근 광역시',zone:'중거리',moved:false}:{home:'near',name:'혁신도시 인근 군',zone:'근거리',moved:true};
}
function makeFromHand(){
  const p=makePerson(),h=homeOf(),team=TEAM_KEY[HAND.team]||'haeng',dept=CO.teams.includes(team)?team:CO.teams[0];
  const fit=HAND.team==='biz'?(HAND.fc.biz||0)+(HAND.fc.fnd||0):(HAND.fc[HAND.team]||0);
  Object.assign(p,{
    name:HAND.name,gender:HAND.gender==='m'?'남':'여',
    track:dept==='mgmt'?'admin':'it',trackName:dept==='mgmt'?(PRIV()?'경영':'경영사무'):(PRIV()?'기술':'정보화'),trackP:100,
    typeName:`${CO.name} 정규직`,typeP:100,type:'reg',rank:CO.k==='pub'&&HAND.univ&&!HAND.jc?1:0,
    dept,deptP:100,deptHist:[DEPTS[dept].name],
    home:h.home,homeName:h.name,homeZone:h.zone,homeP:100,moved:h.moved,
    birthMi:-(HAND.age*12+randint(0,11)),
    sk:clamp(Math.round(15+HAND.ac*0.35+fit*3+(HAND.gradDone?5:0)),15,72),rp:randint(42,52),
    sc:clamp(HAND.sc,5,95),hp:clamp(HAND.hp+8,30,92),mn:clamp(HAND.mn,20,95),
    money:Math.round((HAND.money||0)-(HAND.loan||0)),
  });
  return p;
}
function makePeer(){
  const p=makePerson();
  if(p.track==='research'||!DEPTS[p.dept]){p.track='it';p.trackName='정보화';}
  if(!DEPTS[p.dept]){const d=IT_DEPTS.length?wpick(IT_DEPTS).k:'mgmt';p.dept=d;p.deptHist=[DEPTS[d].name];}
  if(p.track==='admin'&&!DEPTS.mgmt){p.track='it';p.dept=IT_DEPTS[0].k;p.deptHist=[DEPTS[p.dept].name];}
  if(PRIV()){
    p.type='reg';p.typeName=`${CO.name} 정규직`;p.rank=0;p.contractEnd=null;
    p.birthMi=-(randint(24,30)*12+randint(0,11));
  }
  return p;
}
function companyInit(){
  S.coHist=[CO.name];S.coJoin=0;
  S.coScore=randint(45,60);
  S.rivals=RIVALS[CO.k].map(n=>({name:n,score:randint(40,68)}));
  S.round=0;S.so=0;
  S.friends=(HAND.friends||[]).slice(0,4).map(f=>{
    const r=R(),rv=S.rivals.length?pick(S.rivals).name:null;
    const at=r<0.15?{co:'same',place:'같은 회사'}:r<0.5&&rv?{co:'rival',place:rv}:{co:'other',place:pick(['공기업','은행','대기업','스타트업','대학원','프리랜서','공무원 시험 준비'])};
    return {name:f.name,from:f.from,fr:Math.round(f.fr),int:f.int,...at};
  });
}
const coRank=()=>1+S.rivals.filter(r=>r.score>S.coScore).length;
const bonusMult=()=>PRIV()?CO.bonus*clamp(1+(S.coScore-50)/80,0.5,1.6):1;

/* ---------- 회사 종류별 이벤트 ---------- */
const CO_STYLE={
  '다음 날 아침에 본다':'avoid','하나씩 고치고 이유를 묻는다':'skill','회의를 잡아 기준을 맞춘다':'social','중요한 것만 고친다':'safe',
  '개발팀장을 직접 만나 일정을 잡는다':'social','위험도를 보고서로 올린다':'safe','직접 패치 방안을 만든다':'skill',
  '원하는 대로 정리한다':'avoid','새 방향에 올라탄다':'hard','반대 의견을 정리해 낸다':'social',
};
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
  {id:'pv_ir',dept:['mgmt'],when:()=>CO.k==='st',title:'투자자 미팅',text:'투자사 미팅 자료를 내일까지 만들어야 한다.',choices:[
    X('밤새 정리한다',()=>(E({hp:-4,rp:3}),'대표가 자료를 보고 고개를 끄덕였다.')),
    X('확인된 숫자만 낸다',()=>(E({rp:1}),'숫자는 정직했다. 투자사 반응은 조용했다.'))]},
  {id:'pv_big_report',when:()=>CO.k==='big',text:'같은 보고서를 팀장, 상무, 전무 버전으로 세 번 만들었다.',auto:()=>{E({mn:-1});return '';}},
  {id:'pv_big_dispatch',when:()=>CO.k==='big'&&S.rank<=2,title:'계열사 파견',text:'계열사로 1년 파견을 가라는 제안이 왔다.',choices:[
    X('간다',()=>(E({sk:3,rp:3,hp:-2}),'새 사무실에서 명함을 다시 팠다.')),
    X('다른 팀원에게 양보한다',()=>(E({mn:1}),'동기가 대신 갔다.'))]},
  {id:'pv_mid_multi',when:()=>CO.k==='mid',text:'사람이 부족해 옆 팀 업무까지 맡았다.',auto:()=>{E({hp:-2,sk:1});return '';}},
  {id:'pv_st_pivot',when:()=>CO.k==='st',title:'피벗',text:'대표가 주력 서비스를 접고 방향을 바꾸자고 한다.',choices:[
    X('새 방향에 올라탄다',()=>(E({hp:-3,rp:3}),'두 달 만에 새 서비스를 열었다.')),
    X('반대 의견을 정리해 낸다',()=>(E({sc:1,rp:-1}),'대표는 끝까지 들었다. 결론은 바뀌지 않았다.'))]},
  {id:'pv_st_allhands',when:()=>CO.k==='st',text:'전사 미팅에서 이번 달 매출이 공개됐다. 박수가 짧았다.',auto:()=>{E({mn:-1});return '';}},
  {id:'pv_st_hire',when:()=>CO.k==='st',text:'채용이 급해 면접관을 맡았다. 일주일에 면접이 여섯 개였다.',auto:()=>{E({hp:-1,sc:1});return '';}},
];}

/* ---------- 매달: 경쟁·스타트업·희망퇴직·학교 친구 ---------- */
async function companyMonth(m){
  if(!CO)return;
  const a=age();
  if(m===1&&PRIV()){
    const before=S.lastRank||coRank();
    S.coScore=clamp(S.coScore+randn()*5+(S.sk-55)*0.04+(S.rank>=4?(S.rp-50)*0.05:0),10,95);
    S.rivals.forEach(r=>r.score=clamp(r.score+randn()*5,10,95));
    const rk=coRank();S.lastRank=rk;
    if(S.rivals.length&&S.mi>0){
      const top=[{name:'우리 회사',score:S.coScore},...S.rivals].sort((x,y)=>y.score-x.score).map((x,i)=>`${i+1}위 ${x.name}`).join(', ');
      addLog(`올해 업계 순위가 나왔다. ${top}.`+(rk<before?' 순위가 올랐다. 사내 분위기가 밝다.':rk>before?' 순위가 내려갔다. 위에서 압박이 심해졌다.':''),{kind:'sys',tag:'업계'});
      if(rk>before)E({mn:-2});else if(rk<before)E({mn:2});
    }
  }
  if(PRIV()&&S.leave===0&&S.rivals.length&&chance(0.08))await rivalEvent();
  if(CO.k==='st'&&m===1&&S.mi>0){await startupYear();if(S.ended)return;}
  if(CO.layoff&&m===1&&a>=50&&S.rank<5&&S.leave===0&&chance(CO.layoff)){
    const pay=Math.round(salary(S,S.mi)*2);
    await resolve('희망퇴직',`희망퇴직 신청을 받는다는 공지가 올라왔다. 팀장이 조용히 면담을 잡았다. 위로금은 연봉의 2배라고 한다.`,[
      X('위로금을 받고 나간다',()=>{E({money:pay});endGame('희망퇴직',`희망퇴직했다. 위로금 ${fmtMoney(pay)}원을 받았다. 근속 ${tenureStr(S.mi)}.`);return '';},`+${fmtMoney(pay)}원 · 게임 종료`),
      X('버틴다',()=>(E({mn:-6,rp:-2}),'신청하지 않았다. 다음 달 자리 배치가 바뀌었다.'),'멘탈↓ 평판 조금↓')],true,'key');
    if(S.ended)return;
  }
  if(S.friends&&S.friends.length&&S.leave===0&&chance(0.035))await friendEvent();
}
async function rivalEvent(){
  const rv=pick(S.rivals),intel=S.intelUntil&&S.mi<S.intelUntil?0.12:0;
  const kind=pick(S.dept==='mgmt'?['bid','price']:['bid','launch']);
  const win=(p,good,bad)=>{if(chance(clamp(p+intel,0.05,0.9))){S.coScore=clamp(S.coScore+5,0,100);rv.score=clamp(rv.score-3,0,100);E({rp:4,mn:3});rel(boss(),4,`${rv.name}${J(rv.name,'과','와')}의 경쟁에서 이겼다`);return good;}S.coScore=clamp(S.coScore-3,0,100);rv.score=clamp(rv.score+3,0,100);E({mn:-3});return bad;};
  if(kind==='bid'){
    await resolve('수주 경쟁',`큰 고객사 사업을 두고 ${rv.name}${J(rv.name,'과','와')} 맞붙었다. 제안 발표까지 2주가 남았다.`,[
      X('제안서를 밤새 다듬는다',()=>{E({hp:-4});return win(0.35+(S.sk-50)/150+(S.hp-50)/300,'수주했다. 팀장이 회식을 잡았다.','근소한 차이로 졌다. 발표장에서 나오는 경쟁사 사람들 표정이 밝았다.');},'체력↓',()=>0.35+(S.sk-50)/150+(S.hp-50)/300+intel,'이길 가능성'),
      X('경쟁사 약점을 분석한다',()=>win(0.33+(S.sk-50)/120,'경쟁사 약점을 정확히 찔렀다. 수주했다.','분석은 맞았다. 가격에서 밀렸다.'),'역량이 중요',()=>0.33+(S.sk-50)/120+intel,'이길 가능성'),
      X('고객사 담당자를 직접 만난다',()=>win(0.3+(S.sc-50)/120,'담당자가 우리 쪽 손을 들어줬다.','미팅은 좋았다. 결정은 위에서 났다.'),'사교가 중요',()=>0.3+(S.sc-50)/120+intel,'이길 가능성')],true,'key');
  }else if(kind==='launch'){
    await resolve('신제품 경쟁',`${rv.name}에서 우리와 비슷한 서비스를 먼저 내놨다.`,[
      X('출시 일정을 당긴다',()=>{E({hp:-5});return win(0.35+(S.hp-50)/200,'한 달 당겨 냈다. 반응이 더 좋았다.','서둘러 낸 탓에 버그 기사가 났다.');},'체력↓',()=>0.35+(S.hp-50)/200+intel,'이길 가능성'),
      X('차별점을 다시 잡는다',()=>win(0.35+(S.sk-50)/140,'기능 하나를 바꿨더니 이용자가 돌아왔다.','차별점이 잘 안 보였다.'),'역량이 중요',()=>0.35+(S.sk-50)/140+intel,'이길 가능성'),
      X('그대로 간다',()=>{S.coScore=clamp(S.coScore-1,0,100);return '일정대로 냈다. 시장은 조용히 나뉘었다.';},'')],true,'key');
  }else{
    await resolve('가격 경쟁',`${rv.name}${J(rv.name,'이','가')} 가격을 20% 내렸다. 영업팀이 대응 방안을 달라고 한다.`,[
      X('따라서 내린다',()=>win(0.4,'고객은 지켰다. 이익은 줄었다.','고객도 이익도 같이 줄었다.'),'',()=>0.4+intel,'이길 가능성'),
      X('서비스 묶음으로 맞선다',()=>win(0.32+(S.sk-50)/130+(S.sc-50)/300,'묶음 상품이 먹혔다. 가격을 지켰다.','고객 절반이 넘어갔다.'),'역량·사교가 중요',()=>0.32+(S.sk-50)/130+(S.sc-50)/300+intel,'이길 가능성')],true,'key');
  }
}
async function startupYear(){
  const p=clamp(0.18+(S.coScore-50)/200,0.05,0.4);
  if(S.round<3&&S.mi-(S.roundMi??-99)>=24&&chance(p)){
    S.round++;S.roundMi=S.mi;const nm=['시리즈 A','시리즈 B','시리즈 C'][S.round-1];
    S.so+=randint(500,1500)*S.round;S.coScore=clamp(S.coScore+6,0,100);E({mn:4});
    addLog(`${nm} 투자를 받았다. 스톡옵션을 추가로 받았다. 지금 가치로 약 ${fmtMoney(S.so)}원이다.`,{kind:'key',tag:'회사'});
    return;
  }
  if(S.round>=2&&chance(0.08)){
    const v=Math.round(S.so*(1+R()*1.5));S.money+=v;E({mn:8});
    addLog(`회사가 대기업에 인수됐다. 스톡옵션을 행사해 ${fmtMoney(v)}원이 들어왔다.`,{kind:'key',tag:'회사'});
    switchCompany('big');addLog(`이제 대기업 ${DEPTS[S.dept].name} 소속이다. 직급 체계가 바뀌어 ${rankTitle(S)}${J(rankTitle(S),'이','가')} 됐다.`,{kind:'key',tag:'회사'});
    return;
  }
  const q=clamp(0.06+(S.round===0?0.05:0)-S.round*0.015+(S.coScore<40?0.08:0),0.02,0.3);
  if(chance(q)){
    S.so=0;
    await resolve('회사 폐업','대표가 전 직원을 회의실에 모았다. 다음 투자를 받지 못했다고 한다. 회사는 문을 닫는다.',[
      X('다른 회사로 재취업한다',()=>{switchCompany(chance(0.25+S.sk/300)?'mid':'st');return `${CO.name} ${DEPTS[S.dept].name}에 다시 입사했다.`;},'중견·IT기업이나 다른 스타트업'),
      X('여기서 멈춘다',()=>{endGame('회사 폐업',`다니던 스타트업이 문을 닫았다. 근속 ${tenureStr(S.mi)}.`);return '';},'게임 종료')],true,'key');
  }else if(S.round<3&&chance(0.4))addLog(pick(['투자 유치가 미뤄졌다. 대표가 런웨이가 1년 남았다고 했다.','이번 분기 목표 매출을 겨우 맞췄다.']),{kind:'sys',tag:'회사'});
}
function switchCompany(k){
  CO=COS[k];buildWords();
  const rep=(a,b)=>a.splice(0,a.length,...b);
  rep(RANKS,CO.ranks);rep(SAL,CO.sal);rep(MIN_Y,CO.minY);rep(P_BASE,CO.pBase);
  for(const t of CO.teams)if(!DEPTS[t])DEPTS[t]={haeng:{hp:-0.9,mn:-0.6,sk:0.35,rp:0.2},sec:{hp:-1.1,mn:-0.6,sk:0.4,rp:0.15},ai:{hp:-0.7,mn:-0.9,sk:0.5,rp:0.3},mgmt:{hp:-0.6,mn:-1.0,sk:0.25,rp:0.35}}[t];
  for(const t of Object.keys(DEPTS))if(!CO.teams.includes(t))delete DEPTS[t];
  for(const t of CO.teams)DEPTS[t].name=t==='mgmt'&&k==='st'?'사업팀':TEAM_NAME[t];
  rep(IT_DEPTS,['haeng','sec','ai'].filter(t=>CO.teams.includes(t)).map(t=>({k:t,w:1})));
  rep(SEATS,['ceo','d:it','d:ms',...CO.teams.map(t=>'t:'+t)]);
  if(!DEPTS[S.dept])S.dept=S.track==='admin'&&DEPTS.mgmt?'mgmt':IT_DEPTS[0].k;
  changeDept(S.dept);S.rank=Math.min(S.rank,3);S.rankSince=S.mi;S.acting=null;
  S.coHist.push(CO.name);S.coJoin=S.mi;S.round=0;S.so=0;
  S.coScore=randint(45,60);S.rivals=RIVALS[k].map(n=>({name:n,score:randint(40,68)}));
  S.people=[];syncSeats();rel(boss(),randint(3,8),'첫 출근 날 인사를 잘했다');
}

/* ---------- 학교 친구 ---------- */
async function friendEvent(){
  const f=pick(S.friends.filter(x=>x.fr>=10)||[]);if(!f)return;
  if(f.co==='rival'){
    await resolve('친구 연락',`${f.from} ${f.name}에게서 연락이 왔다. 경쟁사 ${f.place}에 다닌다. 저녁이나 먹자고 한다.`,[
      X('만나서 근황을 나눈다',()=>{f.fr=clamp(f.fr+10,0,100);E({mn:3,money:-5});if(chance(0.5)){S.intelUntil=S.mi+12;return `${f.name}${J(f.name,'이','가')} ${f.place} 분위기를 슬쩍 이야기했다. 다음 경쟁 때 도움이 될 것 같다.`;}return '회사 이야기는 거의 안 했다. 옛날 이야기만 세 시간 했다.';},'친밀도↑ 멘탈↑ · 업계 정보를 들을 수도'),
      X('회사 이야기는 피한다',()=>{f.fr=clamp(f.fr+4,0,100);return '근황만 짧게 나눴다.';},'친밀도 조금↑'),
      X('바쁘다고 미룬다',()=>{f.fr=clamp(f.fr-6,0,100);return '다음에 보자고 답했다.';},'친밀도↓')],true,'');
  }else if(f.co==='same'){
    f.fr=clamp(f.fr+6,0,100);E({sc:1,rp:1});
    addLog(`같은 회사 다른 팀에 있는 ${f.from} ${f.name}${J(f.name,'과','와')} 점심을 먹었다. 그 팀 사정을 들었다.`,{kind:'peer',tag:'친구 '+f.name});
  }else{
    f.fr=clamp(f.fr-1,0,100);
    addLog(`${f.from} ${f.name} 근황: ${f.place}${pick(['에서 잘 지낸다고 한다.','에 있다. 단톡방에 사진이 올라왔다.','에 다닌다. 다음 달에 결혼한다고 한다.'])}`,{kind:'peer',tag:'친구 '+f.name});
  }
}
function renderFriends(){
  const el=$('#schoolList');if(!el)return;
  el.innerHTML=(S.friends||[]).map((f,i)=>{const w=f.lastMi!==undefined&&S.mi-f.lastMi<3;return `<button type="button" class="peer-card" data-f="${i}"><b>${f.name}</b> <span class="meta">${f.from}</span><div class="meta">${f.place}${f.co==='rival'?' · 경쟁사':''}</div><div class="st">${w?`${3-(S.mi-f.lastMi)}개월 뒤에 다시 만날 수 있다`:'눌러서 만나기'}</div><div class="fr"><span>친밀도 ${Math.round(f.fr)}</span><div class="track"><div class="fill" style="width:${Math.round(f.fr)}%"></div></div></div></button>`;}).join('')||'<p class="meta">연락하는 학교 친구가 없다.</p>';
}
async function schoolMenu(i){
  const f=S.friends[i];if(!f||!S||S.ended||busy||!$('#modal').hidden)return;
  if(f.lastMi!==undefined&&S.mi-f.lastMi<3)return;
  clearTimeout(timer);busy=true;const prev=settings.auto;settings.auto=false;
  const ch=[X('밥 먹기',()=>{E({money:-5,mn:3});f.fr=clamp(f.fr+8,0,100);return `${f.name}${J(f.name,'과','와')} 저녁을 먹었다. ${pick(['학교 다닐 때 이야기만 했다.','서로 회사 욕을 실컷 했다.','다음엔 다 같이 모이자고 했다.'])}`;},'−5만원 · 친밀도↑ 멘탈↑')];
  if(f.co==='rival')ch.push(X('업계 이야기를 듣는다',()=>{f.fr=clamp(f.fr+3,0,100);if(chance(0.55)){S.intelUntil=S.mi+12;return `${f.place}에서 준비 중인 사업 이야기를 들었다. 다음 경쟁 때 도움이 될 것 같다.`;}return `${f.name}${J(f.name,'은','는')} 회사 이야기는 웃으며 넘겼다.`;},'친밀도 조금↑ · 경쟁에서 유리해질 수도'));
  ch.push(X('그냥 둔다',()=>null));
  const k=await ask(f.name,`${f.from} · ${f.place} · 친밀도 ${Math.round(f.fr)}`,ch);
  if(ch[k].t!=='그냥 둔다'){f.lastMi=S.mi;addLog(ch[k].f(),{kind:'act',tag:'친구 '+f.name});}
  settings.auto=prev;busy=false;render();schedule();
}
