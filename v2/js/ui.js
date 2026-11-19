"use strict";
// 화면 그리기와 버튼 연결

function bar(label,v,cls){v=Math.round(v);return `<div class="stat"><span>${label}</span><div class="track"><div class="fill${cls?' '+cls:''}${!cls&&v<25?' low':''}" style="width:${v}%"></div></div><span class="v">${v}</span></div>`;}
function render(){
  $('#pAvatar').innerHTML=avatarSVG(S.gender,S.age);
  $('#pName').textContent=S.name;
  $('#pSub').textContent=`${S.age}살 · ${S.phase&&S.phase!=='school'?S.label:(S.age>7?gradeLabel(S.age):'미취학')} · ${S.genderName}`;
  const school=S.school?HIGH_SCHOOLS.find(h=>h.k===S.school).name:'-';
  const kv=[['집',S.famName],['지역',S.regionName],['형제',S.sibName],['고등학교',S.age>=17||S.school?school:'-'],['용돈 통장',fmtMoney(S.money)+'원']];
  if(S.sat)kv.push(['수능',`평균 ${S.sat}등급`]);
  if(S.univ)kv.push(['대학',`${S.univ.tierName} ${S.univ.majorName}`]);
  if(S.army)kv.push(['군 복무',S.armyDone?`${S.army.name} 만기`:`${S.army.name} · ${S.army.left}학기 남음`]);
  if(S.job)kv.push(['직장',`${S.job.coName} ${S.job.teamName}`]);
  if(S.loan)kv.push(['학자금 대출',fmtMoney(S.loan)+'원']);
  $('#pKv').innerHTML=kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');
  $('#pStats').innerHTML=Object.entries(STATS).map(([k,n])=>bar(n,S[k])).join('');

  $('#friendList').innerHTML=S.friends.length?S.friends.map((f,i)=>`<button type="button" class="friend" data-i="${i}"><b>${f.name}</b> <span class="meta">${f.from}</span><div class="meta">요즘 ${FIELDS[f.int]}에 관심${f.last===S.age?' · 올해 만남':''}</div><div class="fr-bar"><span>친밀도 ${Math.round(f.fr)}</span><div class="track"><div class="fill int" style="width:${Math.round(f.fr)}%"></div></div></div></button>`).join(''):'<p class="empty">초등학교에 들어가면 친구가 생긴다.</p>';
  $('#barDate').textContent=`${S.birthY+S.age}년 · ${S.age}살`;
}

function showEnding(){
  clearTimeout(timer);
  const ints=Object.keys(FIELDS).filter(k=>S.fc[k]).sort((a,b)=>S.fc[b]-S.fc[a]).map(k=>`${FIELDS[k]} ${S.fc[k]}건`).join(', ')||'없음';
  const best=S.friends.slice().sort((a,b)=>b.fr-a.fr)[0];
  const rows=[
    ['출생',`${S.birthY}년 · ${S.famName} · ${S.regionName} · ${S.sibName}`],
    ['고등학교',HIGH_SCHOOLS.find(h=>h.k===S.school)?.name||'-'],
    [S.school==='gen'?'수능':'자격증',S.school==='gen'?`평균 ${S.sat}등급 (${univHint(S.sat)})`:`${S.cert}개`],
    ['행동특성 및 종합의견',teacherComment()],
    ['성장 스탯',Object.entries(STATS).map(([k,n])=>`${n} ${Math.round(S[k])}`).join(' · ')],
    ['창의적 체험활동',S.exp.map(e=>`${e.when||gradeLabel(e.age)} ${e.text}`).join(' / ')||'-'],
    ['분야별 경험',ints],
    ['가장 친한 친구',best?`${best.name} (${best.from}, 친밀도 ${Math.round(best.fr)})`:'-'],
  ];
  if(S.awards.length)rows.push(['수상',S.awards.join(', ')]);
  if(S.ended.kind!=='1단계 완료'){
    const edu=S.gradDone?'대학원 석사':S.univ?`${S.univ.tierName} 졸업`:`${HIGH_SCHOOLS.find(h=>h.k===S.school).name} 졸업`;
    const side=S.jobs||[];
    const r2=[['첫 직장',S.job?`${S.job.coName} · ${S.job.teamName}`:'취업 준비 중'],['취업 준비',S.jobTry>1?`${S.jobTry}번째 지원에서 ${S.job?'합격':'멈춤'}`:'첫 지원에 합격'],['최종 학력',edu]];
    if(S.univ)r2.push(['학과',S.univ.majorName],['평균 학점',S.univ.avg?S.univ.avg.toFixed(2)+' / 4.5':'-']);
    if(S.gender==='m')r2.push(['군 복무',S.armyDone?S.armyName+' 만기':'입사 후 입대 예정']);
    if(S.abroad)r2.push(['해외 경험','교환학생']);
    if(side.length)r2.push(['알바 · 인턴',side.join(', ')]);
    r2.push(['학자금 대출',S.loan?fmtMoney(S.loan)+'원':'없음'],['통장',fmtMoney(S.money)+'원']);
    rows.splice(1,0,...r2);
  }
  $('#endingWrap').innerHTML=`<div class="ending"><div class="mono" style="font-size:12px;color:var(--muted)">${S.ended.kind==='v2.0 결산'?'인생 기록 · 0살부터 첫 직장까지':'생활기록부 · 1단계'}</div><h2>${S.name}</h2><p class="lead">${S.ended.text}</p>
    <div>${rows.map(([k,v])=>`<div class="row"><span class="k">${k}</span><span>${v}</span></div>`).join('')}</div>
    <div class="acts"><button type="button" class="btn primary" id="btnAgain">다시 태어나기</button></div></div>`;
  $('#endingWrap').hidden=false;$('#gameCtrl').hidden=true;window.scrollTo({top:0,behavior:'smooth'});
  $('#btnAgain').addEventListener('click',()=>{$('#endingWrap').hidden=true;$('#game').hidden=true;$('#start').hidden=false;$('#barDate').textContent='';});
}

/* ---------- 시작 ---------- */
function segBind(id,attr,cb){$(id).addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;[...$(id).children].forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));cb(b.dataset[attr]);});}
segBind('#paceSeg','pace',v=>settings.pace=+v);
segBind('#autoSeg','auto',v=>settings.auto=v==='1');

$('#btnBorn').addEventListener('click',()=>{
  S=makeChild();
  const rows=[['성명',S.name,''],['성별',S.genderName,S.genderP+'%'],['태어난 집',S.famName,S.famP+'%'],['지역',S.regionName,S.regionP+'%'],['형제',S.sibName,S.sibP+'%']];
  $('#nAvatar').innerHTML=avatarSVG(S.gender,0);
  $('#noticeRows').innerHTML=rows.map(([k,v,p],i)=>`<div class="row" style="animation-delay:${i*90}ms"><span class="k">${k}</span><span>${v}</span><span class="p">${p}</span></div>`).join('');
  $('#noticeNo').textContent=`${S.birthY}년 · 출생신고 제${randint(1000,9999)}호`;
  $('#noticeFoot').textContent=FAMILY.find(f=>f.k===S.fam).desc;
  $('#start').hidden=true;$('#notice').hidden=false;window.scrollTo(0,0);
});
$('#btnStart').addEventListener('click',()=>{
  $('#notice').hidden=true;$('#game').hidden=false;$('#gameCtrl').hidden=false;
  $('#log').innerHTML='';lastHeader=null;
  baseMs=2600*settings.pace;speed=1;
  [...$('#gameCtrl').querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',b.dataset.speed==='1'?'true':'false'));
  $('#autoPick').checked=settings.auto;
  addLog(`${S.birthY}년, ${S.regionName}의 ${S.famName}에서 태어났다.`,{kind:'key',when:'0살'});
  render();schedule();
});
$('#gameCtrl').addEventListener('click',ev=>{const b=ev.target.closest('button[data-speed]');if(!b)return;speed=+b.dataset.speed;[...$('#gameCtrl').querySelectorAll('button')].forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));if(!busy)schedule();});
$('#autoPick').addEventListener('change',e=>{settings.auto=e.target.checked;});
$('#friendList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-i]');if(b)friendMenu(+b.dataset.i);});
