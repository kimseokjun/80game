"use strict";
// 화면 그리기와 버튼 연결

function bar(label,v,cls){v=Math.round(v);return `<div class="stat"><span>${label}</span><div class="track"><div class="fill${cls?' '+cls:''}${!cls&&v<25?' low':''}" style="width:${v}%"></div></div><span class="v">${v}</span></div>`;}
function render(){
  $('#pAvatar').innerHTML=avatarSVG(S.gender,S.age);
  $('#pName').textContent=S.name;
  $('#pSub').textContent=`${S.age}살 · ${gradeLabel(S.age)} · ${S.genderName}`;
  const school=S.school?HIGH_SCHOOLS.find(h=>h.k===S.school).name:'-';
  const kv=[['집',S.famName],['지역',S.regionName],['형제',S.sibName],['고등학교',S.age>=17||S.school?school:'-'],['용돈 통장',fmtMoney(S.money)+'원']];
  if(S.cert)kv.push(['자격증',S.cert+'개']);
  if(S.awards.length)kv.push(['수상',S.awards.join(', ')]);
  if(S.sat)kv.push(['수능',`평균 ${S.sat}등급`]);
  $('#pKv').innerHTML=kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');
  $('#pStats').innerHTML=Object.entries(STATS).map(([k,n])=>bar(n,S[k])).join('');
  $('#pInts').innerHTML=Object.entries(INTERESTS).map(([k,n])=>bar(n,S[k],'int')).join('');
  $('#friendList').innerHTML=S.friends.length?S.friends.map((f,i)=>`<button type="button" class="friend" data-i="${i}"><b>${f.name}</b> <span class="meta">${f.from}</span><div class="meta">관심: ${INTERESTS[f.int]}${f.last===S.age?' · 올해 만남':''}</div><div class="fr-bar"><span>친밀도 ${Math.round(f.fr)}</span><div class="track"><div class="fill int" style="width:${Math.round(f.fr)}%"></div></div></div></button>`).join(''):'<p class="empty">초등학교에 들어가면 친구가 생긴다.</p>';
  $('#barDate').textContent=`${S.birthY+S.age}년 · ${S.age}살`;
}

function showEnding(){
  clearTimeout(timer);
  const ints=topInts(2).map(k=>`${INTERESTS[k]} ${Math.round(S[k])}`).join(', ');
  const best=S.friends.slice().sort((a,b)=>b.fr-a.fr)[0];
  const rows=[
    ['출생',`${S.birthY}년 · ${S.famName} · ${S.regionName} · ${S.sibName}`],
    ['고등학교',HIGH_SCHOOLS.find(h=>h.k===S.school)?.name||'-'],
    [S.school==='gen'?'수능':'자격증',S.school==='gen'?`평균 ${S.sat}등급 (${univHint(S.sat)})`:`${S.cert}개`],
    ['관심 분야',ints],
    ['성장 스탯',Object.entries(STATS).map(([k,n])=>`${n} ${Math.round(S[k])}`).join(' · ')],
    ['가장 친한 친구',best?`${best.name} (${best.from}, 친밀도 ${Math.round(best.fr)})`:'-'],
  ];
  if(S.awards.length)rows.push(['수상',S.awards.join(', ')]);
  $('#endingWrap').innerHTML=`<div class="ending"><div class="mono" style="font-size:12px;color:var(--muted)">생활기록부 · 1단계</div><h2>${S.name}</h2><p class="lead">${S.ended.text}</p>
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
  const rows=[['성명',S.name,''],['성별',S.genderName,S.genderP+'%'],['태어난 집',S.famName,S.famP+'%'],['지역',S.regionName,S.regionP+'%'],['형제',S.sibName,S.sibP+'%'],['타고난 관심',INTERESTS[S.bornInt],'20%']];
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
