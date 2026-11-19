# v1/index.html → v2/work.html (v2.1 회사생활). 다시 돌려도 같은 결과가 나온다.
import re
import os
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC=os.path.join(ROOT,'v1','index.html'); DST=os.path.join(ROOT,'v2','work.html')
s=open(SRC,encoding='utf-8').read()
def R(a,b,cnt=1):
    global s
    n=s.count(a)
    assert n>=1,('missing',a[:80])
    if cnt==1: assert n==1,('multi',n,a[:80])
    s=s.replace(a,b) if cnt!=1 else s.replace(a,b,1)

# ---- 머리말·시작 화면 ----
R('<title>직장생활 N분의 1</title>','<title>직장생활 N분의 1 · 회사생활</title>')
R('<small>v1.8.4 · 비공식 팬메이드</small>','<small>v2.1 · 회사생활 · 비공식 팬메이드</small>')
a=s.index('<main id="start" class="screen">'); b=s.index('</main>',a)+len('</main>')
s=s[:a]+'''<main id="start" class="screen">
  <div class="start">
    <div class="eyebrow">v2.1 · 입사부터 퇴직까지</div>
    <h1 id="stTitle">회사생활을 시작한다</h1>
    <p id="stLead"></p>
    <div class="facts" id="stFacts"></div>
    <div class="opts">
      <div>
        <div class="opt-label">한 번의 커리어에 쓸 시간</div>
        <div class="seg" id="durSeg">
          <button type="button" data-dur="30" aria-pressed="true">약 30분</button>
          <button type="button" data-dur="60" aria-pressed="false">약 1시간</button>
          <button type="button" data-dur="90" aria-pressed="false">약 1시간 30분</button>
        </div>
      </div>
      <div>
        <div class="opt-label">선택지</div>
        <div class="seg" id="autoSeg">
          <button type="button" data-auto="0" aria-pressed="true">직접 고른다</button>
          <button type="button" data-auto="1" aria-pressed="false">자동으로 지켜본다</button>
        </div>
      </div>
    </div>
    <button type="button" class="btn primary" id="btnJoin">입사 통지서 받기</button>
    <p style="margin-top:14px"><a href="index.html" id="stBack">← 0살부터 다시 태어나기</a></p>
  </div>
</main>'''+s[b:]
R('''    <aside class="panel cohort">
      <h3>같은 날 입사한 동기 · 눌러서 만나기</h3>
      <div id="cohortList"></div>
    </aside>''','''    <aside class="panel cohort">
      <h3>같은 날 입사한 동기 · 눌러서 만나기</h3>
      <div id="cohortList"></div>
      <h3 style="margin-top:14px">학교 친구 · 눌러서 만나기</h3>
      <div id="schoolList"></div>
    </aside>''')
R('<script>\n"use strict";','<script src="js/company.js"></script>\n<script>\n"use strict";') if '<script>\n"use strict";' in s else R('<script>','<script src="js/company.js"></script>\n<script>')

# ---- 화면 글자 바꾸기 (W) ----
R("  p.appendChild(document.createTextNode(text));body.appendChild(p);\n  if(opt.pick){const q=document.createElement('p');q.className='pick';q.textContent='→ '+opt.pick;body.appendChild(q);}\n  if(opt.res){const q=document.createElement('p');q.className='res';q.textContent=opt.res;body.appendChild(q);}",
  "  p.appendChild(document.createTextNode(W(text)));body.appendChild(p);\n  if(opt.pick){const q=document.createElement('p');q.className='pick';q.textContent='→ '+W(opt.pick);body.appendChild(q);}\n  if(opt.res){const q=document.createElement('p');q.className='res';q.textContent=W(opt.res);body.appendChild(q);}")
R("if(opt.tag){const t=document.createElement('span');t.className='tag';t.textContent=opt.tag;p.appendChild(t);}","if(opt.tag){const t=document.createElement('span');t.className='tag';t.textContent=W(opt.tag);p.appendChild(t);}")
R("  d.innerHTML=`<b>${y}</b><span>${age()}세 · ${rankTitle(S)} · ${deptLabel(S)}</span>`;","  d.innerHTML=W(`<b>${y}</b><span>${age()}세 · ${CO.name} · ${rankTitle(S)} · ${deptLabel(S)}</span>`);")
R("    $('#mWhen').textContent=`${y}년 ${m}월 · ${deptLabel(S)}`;\n    $('#mTitle').textContent=title;$('#mText').textContent=text;",
  "    $('#mWhen').textContent=W(`${y}년 ${m}월 · ${deptLabel(S)}`);\n    $('#mTitle').textContent=W(title);$('#mText').textContent=W(text);")
R("      b.textContent=c.t;\n      const h=hintFor(title,c);","      b.textContent=W(c.t);\n      const h=hintFor(title,c);")
R("    const sp=document.createElement('span');sp.textContent=tk;\n    if(tk.includes('↑'))","    const sp=document.createElement('span');sp.textContent=W(tk);\n    if(tk.includes('↑'))")
R("  $('#pKv').innerHTML=kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');","  kv.splice(1,0,['회사',CO.name+(PRIV()&&S.rivals.length?` · 업계 ${coRank()}위`:'')+(CO.k==='st'&&S.round?` · ${['','시리즈 A','시리즈 B','시리즈 C'][S.round]}`:'')]);\n  if(S.so>0)kv.push(['스톡옵션',`약 ${fmtMoney(S.so)}원`]);\n  $('#pKv').innerHTML=W(kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join(''));")
R("  $('#cohortList').innerHTML=cohort.map(","  $('#cohortList').innerHTML=W(cohort.map(")
R("  }).join('');\n}\nfunction renderActions(){","  }).join(''));\n  renderFriends();\n}\nfunction renderActions(){")
R("  $('#pBody').innerHTML=`<div class=\"pgroup\">경영진</div>","  $('#pBody').innerHTML=W(`<div class=\"pgroup\">경영진</div>")
R("`<div class=\"pgroup\">${mine.length?'다른 팀장들':'팀장들'}</div><div class=\"pgrid\">${teams.map(card).join('')}</div>`;","`<div class=\"pgroup\">${mine.length?'다른 팀장들':'팀장들'}</div><div class=\"pgrid\">${teams.map(card).join('')}</div>`);")

# ---- 부서·직급 ----
R("  const others=IT_DEPTS.map(d=>d.k).filter(k=>k!==S.dept).sort(()=>R()-0.5).slice(0,3);","  if(IT_DEPTS.length<2||!IT_DEPTS.some(d=>d.k===S.dept)){S.deptSince=S.mi;return;}\n  const others=IT_DEPTS.map(d=>d.k).filter(k=>k!==S.dept).sort(()=>R()-0.5).slice(0,3);")
R("if(p.track==='it'&&p.rank<=4&&mi-p.deptSince>=48){","if(p.track==='it'&&p.rank<=4&&mi-p.deptSince>=48&&IT_DEPTS.length>1){")
R("if(tr.k==='it'){const d=wpick(IT_DEPTS);dept=d.k;deptP=pct(d,IT_DEPTS);}else dept=tr.k==='admin'?'mgmt':'research';","if(tr.k==='it'&&IT_DEPTS.length){const d=wpick(IT_DEPTS);dept=d.k;deptP=pct(d,IT_DEPTS);}else dept=tr.k==='admin'||!IT_DEPTS.length?'mgmt':IT_DEPTS[0].k;")
R("function deptLabel(p){\n  if(p.rank>=6&&p.type==='reg')return '원장실';\n  if(p.rank===5&&p.type==='reg')return ({it:'정보화',admin:'경영',research:'연구'})[p.track]+' 부문 실';",
  "function deptLabel(p){\n  if(p.rank>=6&&p.type==='reg')return '원장실';\n  if(p.rank===5&&p.type==='reg')return PRIV()?({it:'기술',admin:'경영'})[p.track]+' 부문':({it:'정보화',admin:'경영',research:'연구'})[p.track]+' 부문 실';")
R("function seatLabel(k){if(k==='ceo')return '원장';if(k==='d:it')return '실장 · 정보화';if(k==='d:ms')return '실장 · 경영·연구';",
  "function seatLabel(k){if(k==='ceo')return '원장';if(k==='d:it')return PRIV()?'실장 · 기술':'실장 · 정보화';if(k==='d:ms')return PRIV()?'실장 · 경영':'실장 · 경영·연구';")
R("  if(S.rank===5)return '실장으로 승진했다. 결재 라인 맨 끝에서 두 번째가 됐다.';","  if(S.rank===5)return PRIV()?`${CO.dir}${J(CO.dir,'으로','로')} 승진했다. 결재 라인 맨 끝에서 두 번째가 됐다.`:'실장으로 승진했다. 결재 라인 맨 끝에서 두 번째가 됐다.';")
R("  let hp=d.hp+0.65+f.hp,mn=d.mn+0.75+f.mn,","  let hp=d.hp*CO.work+0.65+f.hp,mn=d.mn*CO.work+0.75+f.mn,")
R("    else{const sl=salary(S,S.mi),b=sl/12*g.r*(netPay(sl)/sl);","    else{const sl=salary(S,S.mi),b=sl/12*g.r*(netPay(sl)/sl)*bonusMult();")
R("  if(m===10&&S.leave===0){\n    if(['chwi1'","  if(m===10&&S.leave===0&&!PRIV()){\n    if(['chwi1'")
R("    vacate(k);gone=true;addLog(`${who}${J(who,'이','가')} ${pick(ORGS)} 상임이사로 영전했다. 송별회가 크게 열렸다.`+leaveReact(p),opt);",
  "    vacate(k);gone=true;addLog(PRIV()?`${who}${J(who,'이','가')} ${pick(['계열사 임원으로 옮겼다','경쟁사로 이직했다','투자사로 자리를 옮겼다'])}. 송별회가 크게 열렸다.`+leaveReact(p):`${who}${J(who,'이','가')} ${pick(ORGS)} 상임이사로 영전했다. 송별회가 크게 열렸다.`+leaveReact(p),opt);")
# 최고 자리 도전: 스타트업은 없음, 민간은 이사회 추천
R("  if(S.type==='reg'&&S.rank===5&&!S.chiefTried&&a>=52&&S.mi-S.rankSince>=24&&chance(0.04)){\n    S.chiefTried=true;\n    const t='원장 공모 공고가 났다.';",
  "  if(CO.k!=='st'&&S.type==='reg'&&S.rank===5&&!S.chiefTried&&a>=52&&S.mi-S.rankSince>=24&&chance(0.04)){\n    S.chiefTried=true;\n    const t=PRIV()?`${CO.ceo} 후보로 추천됐다. 이사회 심사가 열린다.`:'원장 공모 공고가 났다.';")
# 회사 종류별 매달 처리
R("  await calendar(m);\n  if(S.ended)return;","  await calendar(m);\n  if(S.ended)return;\n  await companyMonth(m);\n  if(S.ended)return;")
# 엔딩
R("  w.innerHTML=`<div class=\"ending\">","  const life=(HAND.life||[]).map(([k,v])=>`<div class=\"row\"><span class=\"k\">${k}</span><span>${v}</span></div>`).join('');\n  const fr=(S.friends||[]).slice().sort((x,z)=>z.fr-x.fr).map(f=>`<div class=\"row\"><span class=\"k\">${f.name}</span><span>${f.from} · ${f.place} · 친밀도 ${Math.round(f.fr)}</span></div>`).join('');\n  w.innerHTML=W(`<div class=\"ending\">")
R("    <h3>같은 날 입사한 동기들</h3>\n    <div class=\"rows\">${peers}</div>","    <h3>같은 날 입사한 동기들</h3>\n    <div class=\"rows\">${peers}</div>\n    ${fr?`<h3>학교 친구들</h3><div class=\"rows\">${fr}</div>`:''}\n    <h3>입사 전까지</h3>\n    <div class=\"rows\">${life}</div>")
R("    <div id=\"fallback\"></div>\n  </div>`;","    <div id=\"fallback\"></div>\n  </div>`);")
R("<button type=\"button\" class=\"btn primary\" id=\"btnAgain\">다시 입사하기</button>","<button type=\"button\" class=\"btn primary\" id=\"btnAgain\">0살부터 다시 태어나기</button>")
R("  $('#btnAgain').addEventListener('click',()=>{w.hidden=true;$('#game').hidden=true;$('#start').hidden=false;$('#barDate').textContent='';window.scrollTo(0,0);});","  $('#btnAgain').addEventListener('click',()=>{location.href='index.html';});")
R("    ['입사',`${j.y}.${String(j.m).padStart(2,'0')} · ${ageOf(S,0)}세 · ${S.typeName}`],","    ['입사',`${j.y}.${String(j.m).padStart(2,'0')} · ${ageOf(S,0)}세 · ${S.coHist[0]} 정규직`],\n    ...(S.coHist.length>1?[['거친 회사',S.coHist.join(' → ')]]:[]),\n    ...(PRIV()&&S.rivals.length?[['업계 순위',`퇴직할 때 ${coRank()}위`]]:[]),")
R("    const txt=`[직장생활 N분의 1]\\n","    const txt=W(`[직장생활 N분의 1 v2]\\n")
R("${cohort.map(p=>`${p.name}: ${p.ended.title}, ${p.ended.kind} (${p.ended.age}세)`).join('\\n')}`;","${cohort.map(p=>`${p.name}: ${p.ended.title}, ${p.ended.kind} (${p.ended.age}세)`).join('\\n')}`);")

# ---- 시작: 넘어온 캐릭터로 ----
R("/* ---------- 시작 ---------- */","applyCompany();\n/* ---------- 시작 ---------- */")
R("  S=makePerson();Object.assign(S,{mi:0,","  if(!HAND)return;\n  S=makeFromHand();Object.assign(S,{mi:0,")
R("pendingMoney=0;S.sal0=salary(S,0);","pendingMoney=0;S.sal0=salary(S,0);companyInit();")
R("  cohort=[0,1,2,3].map(()=>makePerson());","  cohort=Array.from({length:CO.cohortN},()=>makePeer());")
R("""    ['성명',S.name,''],['나이',ageOf(S,0)+'세',''],['성별',S.gender,'50%'],
    ['직렬',S.trackName,S.trackP+'%'],['고용형태',S.typeName,S.typeP+'%'],
    ['배치 부서',DEPTS[S.dept].name,S.deptP+'%'],['연고지',`${S.homeName} (${S.homeZone})`,S.homeP+'%'],""","""    ['성명',S.name,''],['나이',ageOf(S,0)+'세',''],['성별',S.gender,''],
    ['회사',CO.name,''],['직렬',S.trackName,''],['직급',rankTitle(S),''],
    ['배치 부서',DEPTS[S.dept].name,''],['연고지',S.homeName,''],""")
R("  if(S.type==='temp')rows.splice(4,0,['계약 기간',S.contractEnd+'개월','']);\n  $('#noticeRows').innerHTML=rows","  $('#noticeRows').innerHTML=W(rows")
R("<span class=\"p\">${p}</span></div>`).join('');\n  $('#noticeNo')","<span class=\"p\">${p}</span></div>`).join(''));\n  $('#noticeNo')")
R("  $('#noticeFoot').textContent='임직원 약 500명 중 한 명이 된다. 같은 날 입사한 동기는 4명이다. 근무지는 지방 혁신도시 본사다.';","  $('#noticeFoot').textContent=`${CO.staff} 중 한 명이 된다. 같은 날 입사한 동기는 ${CO.cohortN}명이다. ${CO.foot}`;\n  $('#goalSeg').innerHTML=W($('#goalSeg').innerHTML);")
R("  addLog(`${DEPTS[S.dept].name}(으)로 첫 출근했다. 자리에는 모니터 두 대와 사원증이 놓여 있었다.`,{kind:'key'});","  addLog(`${CO.name} ${DEPTS[S.dept].name}(으)로 첫 출근했다. 자리에는 모니터 두 대와 사원증이 놓여 있었다.`,{kind:'key'});\n  if(HAND.loan)addLog(`학자금 대출 ${fmtMoney(HAND.loan)}원을 통장에서 갚아 나가기로 했다.`,{kind:'sys'});\n  const rv=S.rivals.map(r=>r.name);if(rv.length)addLog(`업계 경쟁사는 ${rv.join(', ')}이다. 해마다 순위가 갈린다.`,{kind:'sys',tag:'업계'});")
R("  $('#goalSel').innerHTML=Object.entries(GOALS).map(([k,g])=>`<option value=\"${k}\">${g.name}</option>`).join('');","  $('#goalSel').innerHTML=W(Object.entries(GOALS).map(([k,g])=>`<option value=\"${k}\">${g.name}</option>`).join(''));")
R("  $('#goalHint').textContent=GOALS[S.goal].hint+","  $('#goalHint').textContent=W(GOALS[S.goal].hint)+(0?'':'')+")
R("$('#cohortList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-i]');if(b)peerMenu(+b.dataset.i);});","$('#cohortList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-i]');if(b)peerMenu(+b.dataset.i);});\n$('#schoolList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-f]');if(b)schoolMenu(+b.dataset.f);});\nif(HAND){\n  $('#stTitle').textContent=`${HAND.name}, ${CO.name} ${(DEPTS[TEAM_KEY[HAND.team]]||DEPTS[CO.teams[0]]).name} 입사`;\n  $('#stLead').textContent=`${HAND.age}살에 첫 직장을 얻었다. 지금까지 쌓은 학업·체력·사교·멘탈은 그대로 이어지고, 역량과 평판이 새로 생긴다. 한 달이 한 턴이다. 정년이나 퇴사까지 간다.`;\n  $('#stFacts').innerHTML=W(`<div class=\"fact\"><b>${CO.name}</b><span>회사</span></div><div class=\"fact\"><b>${CO.staff.replace('임직원 ','').replace('직원 ','')}</b><span>임직원</span></div><div class=\"fact\"><b>${fmtMoney(CO.sal[0])}</b><span>신입 초봉(원, 추정)</span></div><div class=\"fact\"><b>${CO.teams.length}개 팀</b><span>배치 가능 부서</span></div>`);\n}else{\n  $('#stTitle').textContent='먼저 태어나야 한다';\n  $('#stLead').textContent='회사생활은 0살부터 시작해 취업에 성공한 캐릭터로만 할 수 있다. 처음 화면에서 태어나 취업까지 가 보자.';\n  $('#btnJoin').hidden=true;document.querySelector('#start .opts').hidden=true;\n}")
R("  const months=Math.max(60,(60-ageOf(S,0))*12);","  const months=Math.max(60,(60-ageOf(S,0))*12);")
# ---- 동문·아는 동기 ----
R("return {seat,name:n,rel:randint(-5,5),hist:[],flat:0};}","return {seat,name:n,rel:randint(-5,5),hist:[],flat:0,alum:CO?rollAlum():false};}")
R("if(chance(refuse)){rel(p,-1,'점심 제안을 미뤘다');return `${p.name} ${ro}께 점심을 청했다. 바쁘다며 다음에 보자고 했다.`;}rel(p,6*mult,'같이 점심을 먹었다');return `${p.name} ${ro}과 점심을 먹었다. ",
  "if(chance(refuse)&&!(p.alum&&!p.alumKnown)){rel(p,-1,'점심 제안을 미뤘다');return `${p.name} ${ro}께 점심을 청했다. 바쁘다며 다음에 보자고 했다.`;}const al=alumLunch(p);rel(p,6*mult*(p.alumKnown&&!al?1.5:1),'같이 점심을 먹었다');if(al){rel(p,15,al.why);return `${p.name} ${ro}과 점심을 먹었다. ${al.text}`;}return `${p.name} ${ro}과 점심을 먹었다. ")
R("+(p.award?' <span class=\"ptag good\">표창</span>':'');","+(p.award?' <span class=\"ptag good\">표창</span>':'')+(p.alumKnown?' <span class=\"ptag good\">동문</span>':'');")
R("<b>${p.name}</b> <span class=\"meta\">${ageOf(p,p.ended?p.ended.mi:S.mi)}세</span>","<b>${p.name}</b> <span class=\"meta\">${ageOf(p,p.ended?p.ended.mi:S.mi)}세</span>${p.tie?` <span class=\"ptag\">${p.tie}</span>`:''}")
R("  cohort=Array.from({length:CO.cohortN},()=>makePeer());","  cohort=Array.from({length:CO.cohortN},()=>makePeer());linkCohort();")
R("  addLog(`같은 날 입사한 동기는 ${cohort.map(p=>p.name).join(', ')}이다.`,{kind:'sys'});","  addLog(`같은 날 입사한 동기는 ${cohort.map(p=>p.name).join(', ')}이다.`,{kind:'sys'});\n  cohortTieLogs();")
# ---- 성장기에서 바로 이어지기 ----
R("const Y0=NOW.getFullYear(), M0=NOW.getMonth()+1;","const Y0=HAND?HAND.birthY+HAND.age:NOW.getFullYear(), M0=HAND?3:NOW.getMonth()+1;")
R("if(rv.length)addLog(`업계 경쟁사는 ${rv.join(', ')}이다.","if(rv.length)addLog(`경쟁사는 ${rv.join(', ')}이다.")
R("  $('#log').innerHTML='';lastYearHeader=null;","  $('#log').innerHTML=CARRY||'';lastYearHeader=null;")
R("  speed=1;[...$('#gameCtrl').querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',b.dataset.speed==='1'?'true':'false'));","  speed=HAND&&HAND.auto?wSpeed():1;[...$('#gameCtrl').querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed',+b.dataset.speed===speed?'true':'false'));\n  if(CARRY){const w=$('#logWrap');w.scrollTop=w.scrollHeight;}")
R("  if(S.so>0)kv.push(['스톡옵션',`약 ${fmtMoney(S.so)}원`]);","  if(S.so>0)kv.push(['스톡옵션',`약 ${fmtMoney(S.so)}원`]);\n  kv.splice(2,0,['학력',eduLine()]);if(HAND.army)kv.splice(3,0,['병역',HAND.army==='미필'?'미필 · 입대 예정':HAND.army]);")
AUTO='''
if(HAND&&HAND.auto){
  settings.auto=!!HAND.autoPick;settings.dur=({0.6:20,1:30,1.6:60})[HAND.pace]||30;
  [...$('#autoSeg').children].forEach(b=>b.setAttribute('aria-pressed',(b.dataset.auto==='1')===settings.auto?'true':'false'));
  $('#start').hidden=true;
  $('#btnJoin').click();$('#btnFirstDay').click();
}
'''
R('</script>\n</body>',AUTO+'</script>\n</body>')
open(DST,'w',encoding='utf-8').write(s)
print('ok',len(s))
