"use strict";
// 취업: KSJ의 부서를 골라 지원 → 바로 합불. 떨어지면 반년 준비 후 다시.

function eduScore(){
  if(S.gradDone)return 0.12;
  if(!S.univ)return S.school==='meister'?-0.02:-0.12;
  return {top:0.18,seoul:0.1,natl:0.04,local:0,jc:-0.06}[UNIV_TIERS[S.univ.tier].k]||0;
}
function fitStats(){return {ac:S.ac,hp:S.hp,sc:S.sc,mn:S.mn,ar:S.ar,hy:S.hy,fc:S.fc,edu:eduScore()+(S.univ&&S.univ.avg?(S.univ.avg-3.2)*0.08:0),talent:S.talent||null};}
const jobP=(d,extra=0)=>clamp(deptFit(d,fitStats())+extra,0.03,0.92);

// 보여줄 부서: 잘 맞는 곳 위주 + 관심 분야 부서 + 하나는 무작위
function jobChoices(last){
  const pool=last?KDEPTS.filter(d=>['cx','ops','fnb','sales','infra'].includes(d.k)):KDEPTS;
  const sorted=pool.slice().sort((a,b)=>jobP(b)-jobP(a));
  const top=topFields(2);
  const pickD=[...sorted.slice(0,3)];
  for(const f of top){const d=sorted.find(x=>x.f[0]===f&&!pickD.includes(x));if(d)pickD.push(d);}
  if(S.talent){const d=KDEPTS.find(x=>x.f[0]===S.talent&&!pickD.includes(x));if(d)pickD.unshift(d);}
  const rest=pool.filter(d=>!pickD.includes(d));if(rest.length)pickD.push(pick(rest));
  return pickD.slice(0,6);
}
async function jobSem(){
  S.jobTry=(S.jobTry||0)+1;
  S.whenLabel='취준';S.label=S.jobTry===1?'취업 준비':`취업 준비 ${S.jobTry}번째`;
  const last=S.jobTry>3,extra=last?0.2:0;
  const list=jobChoices(last);
  let got=null;
  const ch=list.map(d=>X(`${d.name}에 지원한다`,()=>{
    if(chance(jobP(d,extra))){got=d;return pick(['최종 합격 문자가 왔다. 세 번 다시 읽었다.','합격자 명단에 이름이 있었다.','면접이 끝나고 사흘 뒤 합격 전화가 왔다.']);}
    return pick(['불합격 메일이 왔다. 첫 줄만 읽고 닫았다.','최종 면접에서 떨어졌다.','서류에서 떨어졌다. 이유는 알려주지 않았다.']);
  },`${HQS[d.hq]} · ${d.desc}`,()=>jobP(d,extra),'합격 가능성'));
  ch.wAuto=c=>{const d=list[ch.indexOf(c)];return jobP(d,extra)+0.05+(d.f.some(f=>S.fc[f]>0)?0.3:0);};
  const text=last?'몇 번을 떨어졌다. KSJ 추가 채용 공고가 났다. 여기라도 지원해볼까?':S.jobTry===1?'KSJ 신입 공채가 열렸다. 이 세계에 남은 회사는 KSJ 하나뿐이다. 어느 부서에 지원할까?':'다시 원서를 쓴다. 이번엔 어느 부서에 지원할까?';
  await resolve('KSJ 공채',text,ch,'key',S.jobTry===1?NOTES.job:null,{big:true});
  if(got){hired(got);return;}
  if(last){endFinal(null);return;}
  E({ac:2,mn:-5,hy:-3});
  addLog(pick(['자소서를 처음부터 다시 썼다.','스터디 카페 정기권을 끊었다.','면접 스터디에서 모의 면접을 열 번 봤다.','부모님이 밥은 먹고 다니냐고 물었다.']),{kind:'sys'});
}
function hired(d){
  S.job={co:'ksj',coName:'KSJ',team:d.k,teamName:d.name,hq:d.hq};
  S.label=`KSJ ${d.name} 신입`;S.whenLabel='입사';
  addLog(`KSJ ${HQS[d.hq]} ${d.name}에 합격했다. 사원증 사진이 마음에 안 들었다.`,{kind:'key'});
  if(d.f.some(f=>S.fc[f]>0))addLog(pick(['면접관이 이력서를 보더니 관련 경험을 한참 물었다.','예전에 해본 일과 닮은 업무라 낯설지 않을 것 같다.']),{kind:'sys'});
  endFinal(d);
}
function endFinal(d){
  S.phase='done';
  S.ended={kind:'v2.0 결산',text:d?`${S.age}살, KSJ ${d.name}에 입사했다.`:'취업 준비가 길어지고 있다. 이야기는 다음 버전에서 이어진다.'};
}
