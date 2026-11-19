"use strict";
// 2단계: 고교 졸업 후 진로 → 대학(학기 단위) · 군 복무 · 대학원. 1턴 = 1학기(6개월).

const UNIV_TIERS=[
  {k:'top',name:'서울 상위권 대학',tuition:420},
  {k:'seoul',name:'인서울 대학',tuition:420},
  {k:'natl',name:'지방 거점 국립대',tuition:220},
  {k:'local',name:'지방 사립대',tuition:390},
  {k:'jc',name:'전문대',tuition:330,years:2},
];
const MAJORS=[
  {k:'cs',name:'컴퓨터공학과',jc:'컴퓨터정보과',f:'dev'},
  {k:'isec',name:'정보보호학과',jc:'사이버보안과',f:'sec'},
  {k:'stat',name:'통계학과',jc:'빅데이터과',f:'res'},
  {k:'bus',name:'경영학과',jc:'경영과',f:'biz'},
  {k:'vent',name:'창업학과',jc:'창업경영과',f:'fnd'},
  {k:'hum',name:'인문·사회계열',jc:'사회복지과',f:null},
  {k:'pe',name:'체육학과',jc:'스포츠재활과',f:null,pe:true},
];
const tierIdx=g=>g<=2?0:g<=3?1:g<=4?2:g<=6?3:4;

const UNIV_ACTS=[
  {id:'gpa',t:'학점 관리에 집중한다',eff:{ac:6,mn:-3},go:['전공 수업 맨 앞자리에 앉았다.','중간고사 전 일주일을 도서관에서 살았다.']},
  {id:'u_sec',f:'sec',t:'보안 동아리에서 CTF를 준비한다',eff:{ac:1,mn:-1},exp:'대학 보안 동아리 CTF 활동',go:['동아리 선배들과 해킹방어대회 예선을 풀었다.','웹 취약점 스터디 발표를 맡았다.']},
  {id:'u_dev',f:'dev',t:'개발 동아리에서 프로젝트를 한다',eff:{sc:2,mn:-1},exp:'개발 동아리 프로젝트',go:['학교 수강신청 도우미 앱을 만들었다.','해커톤에서 밤을 새웠다.']},
  {id:'u_res',f:'res',minSem:3,t:'학부 연구생으로 연구실에 들어간다',eff:{ac:3,mn:-2},exp:'학부 연구생',go:['랩 미팅에서 처음 발표를 했다.','교수님이 논문 한 편을 읽어오라고 했다.']},
  {id:'u_biz',f:'biz',t:'경영 학회에 들어간다',eff:{sc:3},exp:'경영 학회',go:['기업 사례 분석 발표를 준비했다.','학회 선배 소개로 현직자 멘토링을 받았다.']},
  {id:'u_fnd',f:'fnd',t:'창업 동아리에서 아이템을 만든다',eff:{sc:2,mn:-1},exp:'창업 동아리',go:['교내 창업 경진대회 본선에 올랐다.','시제품 첫 주문이 세 건 들어왔다.']},
  {id:'cafe',t:'카페 아르바이트를 한다',eff:{hp:-3,mn:-1},money:300,go:['주말마다 아침 오픈 근무를 했다.','단골손님이 이름을 외웠다.']},
  {id:'tutor',minAc:55,t:'과외를 한다',eff:{ac:1},money:400,go:['고등학생 수학 과외를 두 명 맡았다.','과외 학생 성적이 올랐다.']},
  {id:'web',f:'dev',t:'웹사이트 외주 알바를 한다',eff:{mn:-2},money:350,exp:'웹 외주 아르바이트',go:['동네 가게 홈페이지를 만들어줬다.','외주 수정 요청이 열두 번 왔다.']},
  {id:'lab',f:'res',t:'연구실 보조 알바를 한다',eff:{ac:1},money:200,exp:'연구실 보조 아르바이트',go:['설문 데이터를 엑셀로 정리했다.','실험 기자재를 관리했다.']},
  {id:'fun',t:'연애하고 실컷 논다',eff:{sc:4,mn:4,ac:-3},go:['축제 기간 내내 주점에 있었다.','동기들과 제주도 여행을 다녀왔다.']},
  {id:'gym',t:'운동에 빠진다',eff:{hp:6,mn:2},go:['학교 헬스장을 매일 갔다.','교내 축구 리그에서 우승했다.']},
  {id:'intern',f:'biz',minSem:5,t:'방학 인턴을 한다',eff:{sc:2,mn:-2},money:500,exp:'기업 방학 인턴',go:['인턴 마지막 날 팀장님이 졸업하면 연락하라고 했다.','회의록 정리를 두 달 동안 했다.']},
  {id:'exch',f:'biz',onlySem:5,t:'교환학생을 간다',eff:{mn:4,sc:3},cost:800,exp:'해외 교환학생',go:['기숙사 룸메이트와 주말마다 여행했다.','현지 수업에서 첫 발표를 영어로 했다.']},
];
const UNIV_DAILY=['신입생 MT에서 밤새 게임을 했다.','수강신청에 실패해 아침 9시 수업을 듣게 됐다.','팀플 조원 한 명이 연락이 끊겼다.','축제 때 연예인 공연을 봤다.','중간고사 기간 도서관에 자리가 없었다.','학식 가격이 500원 올랐다.','전공 교수님 연구실에 처음 찾아갔다.','과 단톡방 공지를 놓쳐서 과제를 하루 늦게 냈다.'];
const ARMY_DAILY=['첫 휴가를 나왔다. 집밥이 그렇게 맛있을 줄 몰랐다.','혹한기 훈련을 마쳤다.','후임이 들어왔다.','당직 근무를 서며 밤하늘을 봤다.','부대 체육대회에서 족구를 했다.','휴가 날짜를 세어보니 아직 멀었다.'];

const hint2=eff=>Object.entries(eff||{}).map(([k,v])=>STATS[k]+(v>0?'+':'−')).join(' ');
const curWhen=()=>S.phase==='school'?gradeLabel(S.age):S.whenLabel;
const famPayRate=()=>famOf().allow;

/* ---------- 고교 졸업 후 ---------- */
async function afterHigh(){
  const voc=S.school==='voc'||S.school==='meister';
  const g=voc?clamp(Math.round(9-(S.ac-15)/8),2,9):S.sat;
  const ti=tierIdx(g)+(voc?1:0),tier=UNIV_TIERS[Math.min(ti,4)];
  const peOk=S.peTrack;
  const ch=[];
  if(voc)ch.push(X('고졸 채용으로 바로 취업한다',()=>{S.route='work';return '졸업식 다음 주부터 취업 준비를 시작했다.';},S.school==='meister'?'공기업·대기업 고졸 채용에 지원할 수 있다':'지역 회사 고졸 채용에 지원할 수 있다'));
  ch.push(X(`${tier.name}에 진학한다`,()=>{S.route='univ';S.tierPick=Math.min(ti,4);return '';},`등록금 학기당 약 ${tier.tuition}만원`));
  if(peOk){const pt=UNIV_TIERS[Math.max(0,Math.min(ti,4)-(S.hp>=85?2:1))];ch.push(X(`체대 입시로 ${pt.name} 체육학과에 간다`,()=>{S.route='univ';S.tierPick=UNIV_TIERS.indexOf(pt);S.majorPick='pe';return '실기 시험에서 제자리멀리뛰기 만점을 받았다.';},'체력이 높아 열린 길'));}
  if(voc&&tier.k!=='jc')ch.push(X('전문대에 진학한다',()=>{S.route='univ';S.tierPick=4;return '동일계열 전형으로 합격했다.';},`등록금 학기당 약 ${UNIV_TIERS[4].tuition}만원 · 2년제`));
  if(!voc&&!S.retook&&g>=3)ch.push(X('재수한다',()=>{S.route='retake';return '재수학원에 등록했다. 아침 7시 셔틀을 탔다.';},'1년 더 공부한다 · 멘탈−'));
  if(!voc)ch.push(X('대학 대신 바로 취업 준비를 한다',()=>{S.route='work';return '대학 대신 일을 먼저 해보기로 했다.';}));
  ch.wAuto=c=>c.t.includes('진학')||c.t.includes('체대')?4:1;
  await resolve('졸업 후 진로',voc?'바로 일을 시작할까, 공부를 더 할까?':`수능 평균 ${g}등급. 갈 수 있는 곳이 어느 정도 정해졌다. 어떻게 할까?`,ch,'key',voc?NOTES.voc_after:NOTES.univ,{big:true});
  if(S.route==='work'){S.phase='done';endStage2('고등학교를 졸업하고 바로 취업 준비를 시작한다.');return;}
  if(S.route==='retake'){S.phase='retake';S.retakeLeft=2;S.retook=true;return;}
  await chooseMajor();
}
async function chooseMajor(){
  const tier=UNIV_TIERS[S.tierPick],jc=tier.k==='jc';
  let pick0=S.majorPick?MAJORS.find(m=>m.k===S.majorPick):null;
  if(!pick0){
    const list=MAJORS.filter(m=>!m.pe||S.peTrack);
    const ch=list.map(m=>X(jc?m.jc:m.name,()=>{pick0=m;return '';}));
    ch.wAuto=c=>{const m=list[ch.indexOf(c)];return 1+(m.f?S.fc[m.f]*1.5:0)+(m.pe?2:0);};
    await resolve('전공 선택',`${tier.name}에 원서를 낸다. 어느 학과로 갈까?`,ch,'',NOTES.major);
  }
  S.univ={tier:S.tierPick,tierName:tier.name,major:pick0.k,majorName:jc?pick0.jc:pick0.name,f:pick0.f,total:(tier.years||4)*2,sem:0,gpa:[]};
  S.phase='univ';S.whenLabel='입학';S.label='대학 입학 예정';
  addLog(`${tier.name} ${S.univ.majorName}에 합격했다.`,{kind:'key',when:S.phase==='school'?gradeLabel(S.age):'재수'});
  if(pick0.f)addExp(`${S.univ.majorName} 입학`,pick0.f);
}

/* ---------- 학기 진행 ---------- */
async function semTick(){
  S.semAbs=(S.semAbs||0)+1;
  if(S.semAbs%2===1)S.age++;
  header();
  S.money+=famOf().pocket*6;
  if(S.phase==='univ')await univSem();
  else if(S.phase==='army')await armySem();
  else if(S.phase==='grad')await gradSem();
  else if(S.phase==='retake')await retakeSem();
  else if(S.phase==='job')await jobSem();
  S.mn=clamp(S.mn+(62-S.mn)*0.1,0,100);
  friendYear2();
}
function friendYear2(){if(S.semAbs%2===0)friendYear();}

async function retakeSem(){
  S.whenLabel='재수';S.label='재수생';
  S.retakeLeft--;
  E({ac:4,mn:-4});
  if(S.retakeLeft>0){addLog(pick(['모의고사 성적이 조금씩 올랐다.','독서실 칸막이에 목표 대학을 붙였다.','고등학교 친구들이 대학 이야기를 할 때 단톡방을 껐다.']));return;}
  S.sat=suneung();addLog(`두 번째 수능을 봤다. 평균 ${S.sat}등급.`,{kind:'key'});
  await afterHigh();
}

async function univSem(){
  const u=S.univ;u.sem++;
  const yr=Math.ceil(u.sem/2),s=(u.sem-1)%2+1;
  S.whenLabel=`${yr}-${s}`;S.label=`대학 ${yr}학년 ${s}학기`;
  if(u.sem===1){
    addLog(`${u.tierName} ${u.majorName} 새내기가 됐다.`,{kind:'key'});
    const x=addFriend('대학 동기'),y=addFriend('대학 동기');addLog(`과 동기 ${x.name}, ${y.name}${J(y.name,'과','와')} 친해졌다.`,{tag:'친구',tagCls:'fr'});
  }
  // 등록금: 집에서 내는 몫을 빼고 나머지는 장학금 또는 학자금 대출
  const t=UNIV_TIERS[u.tier].tuition,fam=Math.round(t*famPayRate());
  let sch=0;if(S.ac>=75&&chance(0.4))sch=Math.round(t*0.5);if(S.fam==='poor'&&chance(0.6))sch=Math.max(sch,Math.round(t*0.7));
  const loan=Math.max(0,t-fam-sch);S.loan=(S.loan||0)+loan;
  if(sch&&!S.schLogged){S.schLogged=true;addLog(`${S.fam==='poor'?'국가장학금':'성적장학금'}을 받았다. 등록금 부담이 줄었다.`,{kind:'sys'});}
  if(u.sem%2===1)await univChoice();else continueUniv();
  if(chance(0.5)){const pool=UNIV_DAILY.filter(x=>!S.dailyUsed[x]);if(pool.length){const x=pick(pool);S.dailyUsed[x]=1;addLog(x,{kind:'sys'});}}
  const g=clamp(2.0+S.ac/40+(S.cur&&S.cur.id==='gpa'?0.3:0)+randn()*0.3,1.5,4.5);u.gpa.push(g);
  // 병역: 남자는 1학년을 마치면 입대 시기를 정한다
  if(S.gender==='m'&&!S.armyDone&&!S.armyPlan&&u.sem===2)await armyTiming();
  if(S.armyPlan==='after2'&&u.sem===4&&u.sem<u.total){S.armyPlan='going';startArmy(false);return;}
  if(u.sem>=u.total){
    const avg=u.gpa.reduce((a,b)=>a+b,0)/u.gpa.length;u.avg=Math.round(avg*100)/100;
    addLog(`졸업했다. 평균 학점 ${u.avg.toFixed(2)}.`,{kind:'key'});
    if(u.total===8)await gradDecision();
    if(S.gender==='m'&&!S.armyDone){startArmy(true);return;}
    if(S.phase==='grad')return;
    endStage2('대학을 졸업했다.');
  }
}
async function univChoice(){
  const u=S.univ;
  const allow=famPayRate();
  const ok=UNIV_ACTS.filter(a=>!(a.minSem&&u.sem<a.minSem)&&!(a.onlySem&&u.sem!==a.onlySem)&&!(a.minAc&&S.ac<a.minAc)&&!(a.id==='exch'&&u.total<8));
  const exch=ok.find(a=>a.id==='exch');
  const rest=ok.filter(a=>a!==exch);
  const done=rest.filter(a=>a.f&&S.fc[a.f]>0),other=rest.filter(a=>!done.includes(a));
  const sh=arr=>arr.slice().sort(()=>R()-0.5);
  let opts=[...sh(done).slice(0,1),...sh(other.filter(a=>a.f)).slice(0,2),...sh(other.filter(a=>!a.f)).slice(0,2)];
  if(exch)opts.push(exch);
  opts=sh(opts).slice(0,6);
  const ch=opts.map(a=>{
    const cost=a.cost?(allow>=1||S.ac>=70?0:a.cost):0;
    const extra=[a.money?`+${a.money}만원`:'',cost?`−${cost}만원`:'',a.id==='exch'&&!cost?(allow>=1?'집에서 지원':'교환학생 장학금'):''].filter(Boolean).join(' ');
    return X(a.t,()=>{
      E(a.eff||{});leaveTrait(a);if(a.exp)addExp(a.exp,a.f);if(a.money)S.money+=a.money;if(cost)S.money-=cost;
      if(a.id==='exch')S.abroad=true;
      const JOB={cafe:'카페 알바',tutor:'과외',web:'웹 외주',lab:'연구실 보조',intern:'방학 인턴'};if(JOB[a.id]){S.jobs=S.jobs||[];if(!S.jobs.includes(JOB[a.id]))S.jobs.push(JOB[a.id]);}
      S.cur=a;S.goI=randint(0,a.go.length-1);return a.go[S.goI];
    },[hint2(a.eff),extra].filter(Boolean).join(' · '));
  });
  ch.wAuto=c=>{const a=opts[ch.indexOf(c)];return 1+(a.f?S.fc[a.f]*1.2:0)+(a.id==='gpa'&&S.ac<50?1:0);};
  const yr=Math.ceil(u.sem/2);
  await resolve(`${yr}학년, 이번 학기`,yr===1?'대학 첫 학기다. 시간이 생각보다 많다. 어디에 쓸까?':`${yr}학년이 됐다. 이번 학기는 어디에 시간을 쓸까?`,ch,'',yr===3&&exch?NOTES.exch:null);
}
function continueUniv(){
  const a=S.cur;if(!a)return;
  const half={};for(const k in a.eff||{})half[k]=Math.round(a.eff[k]/2);E(half);
  if(a.money&&a.id!=='intern')S.money+=a.money;
  if(a.id==='exch'){addLog('교환학생 학기를 마치고 돌아왔다.');S.cur=null;return;}
  addLog(a.go[(S.goI+1)%a.go.length]);
}

/* ---------- 군 복무 ---------- */
async function armyTiming(){
  const ch=[
    X('지금 휴학하고 입대한다',()=>{S.armyPlan='now';return '입영 통지서가 나왔다.';},'일찍 다녀온다'),
    X('2학년을 마치고 입대한다',()=>{S.armyPlan='after2';return '2학년까지 다니고 가기로 했다.';}),
    X('학군단(ROTC)에 지원한다',()=>{if(chance(0.35+S.hp/300+S.ac/400)){S.armyPlan='rotc';S.rotc=true;return '학군단에 합격했다. 졸업 후 장교로 임관한다.';}S.armyPlan='after2';return '학군단 면접에서 떨어졌다. 2학년을 마치고 입대하기로 했다.';},'졸업 후 장교로 복무',()=>0.35+S.hp/300+S.ac/400,'합격 가능성'),
    X('졸업하고 입대한다',()=>{S.armyPlan='grad';return '졸업 후에 가기로 했다. 입영 연기를 신청했다.';}),
  ];
  ch.wAuto=c=>c.t.startsWith('2학년')?3:1;
  await resolve('입대 시기','1학년이 끝났다. 언제 군대에 갈까?',ch,'key',NOTES.army,{big:true});
  if(S.armyPlan==='now'){startArmy(false);S.armyPlan='going';}
}
function startArmy(post){S.pendingArmy={post};S.phase='army';S.army=null;}
async function armySem(){
  if(!S.army){
    S.whenLabel='입영';S.label='입영 대기';
    const post=S.pendingArmy.post;
    let type='army';
    if(S.rotc)type='officer';
    else{
      const iq=S.fc.dev+S.fc.sec>=2||S.school==='voc'||S.school==='meister';
      const ch=[X('육군 현역으로 간다',()=>{type='army';return '';},'18개월'),
        X('공군에 지원한다',()=>{type=chance(0.45+S.ac/300)?'air':'army';return type==='air'?'공군에 합격했다.':'공군에 떨어져 육군으로 가게 됐다.';},'21개월 · 체력+ 멘탈+',()=>0.45+S.ac/300,'합격 가능성'),
        X('카투사에 지원한다',()=>{type=chance(0.15+S.ac/300)?'katusa':'army';return type==='katusa'?'카투사에 선발됐다.':'카투사 추첨에서 떨어졌다. 육군으로 간다.';},'18개월 · 사교+',()=>0.15+S.ac/300,'선발 가능성')];
      if(iq)ch.push(X('산업기능요원으로 회사에서 복무한다',()=>{type='ind';return '병역지정업체 개발팀에 합격했다.';},'34개월 · 회사에서 일하며 복무'));
      ch.wAuto=c=>c.t.includes('산업기능')?2:c.t.startsWith('육군')?2:1;
      await resolve('복무 형태',post?'졸업을 했다. 이제 병역을 마칠 차례다.':'입영을 앞두고 있다. 어디서 복무할까?',ch,'key',NOTES.army2,{big:true});
    }
    const L={army:3,air:4,katusa:3,ind:6,officer:5}[type];
    S.army={type,left:L,total:L,post,name:{army:'육군',air:'공군',katusa:'카투사',ind:'산업기능요원',officer:'육군 장교(ROTC)'}[type]};
    addLog(type==='ind'?'산업기능요원으로 첫 출근을 했다.':type==='officer'?'소위로 임관했다.':pick(['논산 훈련소에 입소했다. 머리를 짧게 잘랐다.','훈련소 첫날 밤, 잠이 오지 않았다.']),{kind:'key'});
  }
  const a=S.army;a.left--;
  S.whenLabel=a.type==='ind'?'산업':'군';S.label=`${a.name} 복무 중`;
  E({hp:a.type==='ind'?0:3});
  if(a.type==='ind'){S.money+=900;if(a.left===a.total-1)addExp('산업기능요원 복무 (개발 업무)','dev');addLog(pick(['사내 서비스 유지보수를 맡았다.','첫 배포를 했다. 손이 떨렸다.','선배 개발자에게 코드 리뷰를 받았다.']));}
  else if(a.type==='officer'){S.tr.lead+=2;S.money+=600;addLog(pick(['소대원 서른 명을 맡았다.','중대장에게 보고서를 다시 써오라는 말을 들었다.','전역한 소대원이 감사 편지를 보냈다.']));}
  else{S.money+=250;const pool=ARMY_DAILY.filter(x=>!S.dailyUsed[x]);if(pool.length){const x=pick(pool);S.dailyUsed[x]=1;addLog(x);}}
  if(a.left===Math.floor(a.total/2)&&a.type!=='ind'){
    const ch=[X('자격증 공부를 한다',()=>{E({ac:3});S.cert++;return '전역 전에 자격증 하나를 땄다.';},'학업+'),
      X('운동을 한다',()=>{E({hp:6});return '체력 검정 특급을 받았다.';},'체력+'),
      X('전우들과 어울린다',()=>{E({sc:4,mn:2});return '전역하고도 연락할 동기들이 생겼다.';},'사교+ 멘탈+')];
    await resolve('복무 중 시간','남는 시간이 조금 생겼다. 어디에 쓸까?',ch);
  }
  if(a.left<=0){
    S.armyDone=true;S.armyName=a.name;
    addLog(`${a.name} 복무를 마쳤다.`,{kind:'key'});
    if(!a.post){S.phase='univ';S.armyPlan='done';addLog('복학 신청서를 냈다.',{kind:'sys'});}
    else if(S.gradPending){S.gradPending=false;S.phase='grad';S.grad={sem:0};}
    else endStage2('병역까지 마쳤다.');
  }
}

/* ---------- 대학원 ---------- */
async function gradDecision(){
  const p=clamp(0.2+S.ac/200+S.fc.res*0.1,0,0.9);
  let go=false;
  await resolve('대학원','졸업을 앞두고 있다. 공부를 더 할까, 일을 시작할까?',[
    X('대학원 석사에 진학한다',()=>{if(chance(p)){go=true;return '지도교수님 연구실에 합격했다.';}return '연구실 면접에서 떨어졌다. 취업 준비를 하기로 했다.';},'2년 · 연구 경력',()=>p,'합격 가능성'),
    X('취업 준비를 시작한다',()=>'자기소개서 첫 줄을 쓰는 데 하루가 걸렸다.')],'key',NOTES.grad,{big:true});
  if(go){if(S.gender==='m'&&!S.armyDone)S.gradPending=true;else{S.phase='grad';S.grad={sem:0};}}
}
async function gradSem(){
  const g=S.grad;g.sem++;
  S.whenLabel=`석${Math.ceil(g.sem/2)}`;S.label=`대학원 석사 ${g.sem}학기`;
  if(g.sem===1){
    addLog('대학원에 입학했다. 연구실 자리를 배정받았다.',{kind:'key'});
    const ch=[X('논문에 집중한다',()=>{E({ac:4,mn:-3});addExp('석사 논문 연구','res');S.gradFocus='paper';return '학회 투고 마감을 맞췄다.';},'학업+ 멘탈−'),
      X('산학 프로젝트에 참여한다',()=>{E({sc:2});addExp('산학 협력 프로젝트',S.univ.f||'dev');S.money+=600;S.gradFocus='proj';return '기업과 회의를 매주 했다.';},'사교+ · +600만원'),
      X('조교를 하며 등록금을 번다',()=>{E({mn:-1});S.money+=400;S.gradFocus='ta';return '학부생 과제를 채점했다.';},'멘탈− · +400만원')];
    await resolve('대학원 생활','연구실 생활이 시작됐다. 어디에 무게를 둘까?',ch);
  }else addLog(pick(['랩 미팅에서 교수님 질문에 대답을 못 했다.','실험이 또 실패했다. 다시 돌렸다.','첫 논문이 학회에 채택됐다.','연구실 회식이 새벽까지 이어졌다.']));
  if(g.sem>=4){S.gradDone=true;addLog('석사 학위를 받았다.',{kind:'key'});endStage2('대학원까지 마쳤다.');}
}

function endStage2(text){S.phase='job';S.jobTry=0;S.stage2Text=text;}
