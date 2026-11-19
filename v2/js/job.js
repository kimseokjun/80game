"use strict";
// 취업: 지원 → 바로 합불. 떨어지면 반년 준비 후 다시. 붙으면 팀 배치 후 v2.0 결산.

const COMPANIES=[
  {k:'big',name:'대기업',base:-0.5,teams:['dev','sec','res','biz'],pref:3,desc:'연봉이 높고 문이 좁다'},
  {k:'pub',name:'공기업',base:-0.42,teams:['dev','sec','res','biz'],pref:2.6,desc:'안정적이다'},
  {k:'mid',name:'중견·IT기업',base:-0.18,teams:['dev','sec','biz'],pref:1.8,desc:'경험을 많이 본다'},
  {k:'st',name:'스타트업',base:0.12,teams:['dev','biz'],pref:1,desc:'들어가기 쉽지만 불안정하다'},
];
const TEAMS={dev:'개발팀',sec:'보안팀',res:'데이터·연구팀',biz:'경영기획팀'};
const teamName=(co,t)=>co.k==='st'&&t==='biz'?'사업팀':TEAMS[t];

function eduBonus(co){
  if(S.gradDone)return 0.1;
  if(!S.univ)return co.k==='pub'&&S.school==='meister'?0.12:co.k==='st'?0:-0.15;
  return {top:0.2,seoul:0.12,natl:0.05,local:0,jc:-0.08}[UNIV_TIERS[S.univ.tier].k];
}
function jobP(co,extra=0){
  // 면접에서는 사교도 본다
  let p=co.base+S.ac/100+eduBonus(co)+(S.sc-50)*0.004+extra;
  if(S.univ&&S.univ.avg)p+=(S.univ.avg-3.2)*0.1;
  const best=Math.max(...co.teams.map(t=>S.fc[t]));p+=Math.min(0.1,best*0.03);
  if(co.k==='st')p+=Math.min(0.15,S.fc.fnd*0.05);
  return clamp(p,0.03,0.92);
}

async function jobSem(){
  S.jobTry=(S.jobTry||0)+1;
  S.whenLabel='취준';S.label=S.jobTry===1?'취업 준비':`취업 준비 ${S.jobTry}번째`;
  const last=S.jobTry>3;
  const list=last?COMPANIES.filter(c=>c.k==='mid'||c.k==='st'):COMPANIES;
  const extra=last?0.2:0;
  let got=null;
  const ch=list.map(co=>X(`${co.name}에 지원한다`,()=>{
    if(chance(jobP(co,extra))){got=co;return pick(['최종 합격 문자가 왔다. 세 번 다시 읽었다.','합격자 명단에 이름이 있었다.','면접이 끝나고 사흘 뒤 합격 전화가 왔다.']);}
    return pick(['불합격 메일이 왔다. 첫 줄만 읽고 닫았다.','최종 면접에서 떨어졌다.','서류에서 떨어졌다. 이유는 알려주지 않았다.']);
  },co.desc,()=>jobP(co,extra),'합격 가능성'));
  ch.wAuto=c=>{const co=list[ch.indexOf(c)];return jobP(co,extra)*co.pref+0.05;};
  const text=last?'몇 번을 떨어졌다. 아는 선배가 자리 하나를 소개해줬다. 여기라도 지원해볼까?':S.jobTry===1?'이제 첫 직장을 정할 차례다. 어디에 지원할까?':'다시 원서를 쓴다. 이번엔 어디에 지원할까?';
  await resolve('취업',text,ch,'key',S.jobTry===1?NOTES.job:null,{big:true});
  if(got){hired(got);return;}
  if(last){endFinal(null);return;}
  E({ac:3,mn:-5});
  addLog(pick(['자소서를 처음부터 다시 썼다.','스터디 카페 정기권을 끊었다.','면접 스터디에서 모의 면접을 열 번 봤다.','부모님이 밥은 먹고 다니냐고 물었다.']),{kind:'sys'});
}

function hired(co){
  // 숨은 경험과 학과가 팀을 정한다
  const w=co.teams.map(t=>{
    let v=1+S.fc[t]*2+(S.univ&&S.univ.f===t?3:0);
    if(co.k==='st'&&t==='biz')v+=S.fc.fnd*2;
    // 팀이 없는 분야 경험은 가까운 팀으로 간다
    if(t==='dev'&&!co.teams.includes('sec'))v+=S.fc.sec*2+(S.univ&&S.univ.f==='sec'?3:0);
    if(t==='dev'&&!co.teams.includes('res'))v+=S.fc.res;
    if(t==='biz'&&!co.teams.includes('res'))v+=S.fc.res;
    return {t,w:v};
  });
  const team=wpick(w).t;
  S.job={co:co.k,coName:co.name,team,teamName:teamName(co,team)};
  S.label=`${co.name} 신입사원`;S.whenLabel='입사';
  addLog(`${co.name} ${S.job.teamName}에 배치됐다. 사원증 사진이 마음에 안 들었다.`,{kind:'key'});
  if(S.fc[team]>0)addLog(pick(['팀장님이 이력서를 보더니 관련 경험이 있어서 이 팀으로 받았다고 했다.','예전에 해본 일이라 첫 업무가 낯설지 않았다.']),{kind:'sys'});
  endFinal(co);
}
function endFinal(co){
  S.phase='done';
  S.ended={kind:'v2.0 결산',text:co?`${S.age}살, ${co.name} ${S.job.teamName}에 입사했다. 아래 버튼을 누르면 회사생활이 이어진다.`:'취업 준비가 길어지고 있다. 이야기는 다음 버전에서 이어진다.'};
}
