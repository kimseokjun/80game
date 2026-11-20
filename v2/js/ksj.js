"use strict";
// KSJ: 이 세계에 남은 단 하나의 회사. 지어낸 설정이다.
// 성장기(index.html)와 회사생활(work.html)이 같이 쓴다.

const KSJ_LORE=[
  '뉴스에서 또 회사 두 곳이 KSJ에 합쳐졌다고 했다.',
  '아빠 회사가 KSJ에 인수됐다. 아빠 명함에 KSJ 로고가 새로 찍혔다.',
  'KSJ가 마지막 남은 경쟁사를 합병했다는 속보가 나왔다. 이제 회사는 KSJ 하나뿐이라고 했다.',
  '선생님이 장래희망을 물었다. 반 아이들 절반이 "KSJ 다니기"라고 적었다.',
  'KSJ 채용 설명회 포스터가 학교 게시판에 붙었다. 부서가 스무 개가 넘었다.',
];
// 로그에 한 번씩 흘러가는 KSJ 이야기 (나이 → 문장)
const KSJ_LORE_AGE={6:0,10:1,13:2,15:3,18:4};

// 경험 분야. 화면에는 숫자로 안 보이고, 경험 건수로 판정한다.
const FIELDS={dev:'개발',sec:'정보보안',res:'연구·데이터',biz:'경영',fnd:'창업',spt:'스포츠',art:'예술·디자인',med:'미디어',ppl:'사람·서비스',fld:'현장·기술'};

const HQS={tech:'기술본부',mgmt:'경영지원본부',biz:'사업본부',crea:'크리에이티브본부',spt:'스포츠본부',life:'생활서비스본부',ops:'현장운영본부'};

// 부서. f: 관련 경험 분야, w: 합격에 보는 스탯 비중, base: 문 넓이, m: 회사생활 중 매달 스탯 변화
const KDEPTS=[
  {k:'haeng',name:'개발팀',hq:'tech',f:['dev'],w:{ac:0.5,mn:0.3,sc:0.2},base:-0.05,m:{hp:-0.9,mn:-0.6,sk:0.35,rp:0.2},desc:'서비스를 만든다'},
  {k:'sec',name:'정보보안팀',hq:'tech',f:['sec'],w:{ac:0.5,mn:0.5},base:-0.05,m:{hp:-1.1,mn:-0.6,sk:0.4,rp:0.15},desc:'회사를 지킨다'},
  {k:'ai',name:'AI연구소',hq:'tech',f:['res','dev'],w:{ac:1},base:-0.25,m:{hp:-0.7,mn:-0.9,sk:0.5,rp:0.3},desc:'학업이 특히 중요하다'},
  {k:'data',name:'데이터분석팀',hq:'tech',f:['res'],w:{ac:0.7,mn:0.2,ar:0.1},base:-0.1,m:{hp:-0.6,mn:-0.8,sk:0.4,rp:0.25},desc:'숫자에서 답을 찾는다'},
  {k:'infra',name:'인프라운영팀',hq:'tech',f:['dev','sec','fld'],w:{hp:0.4,mn:0.4,ac:0.2},base:0.05,m:{hp:-1.2,mn:-0.7,sk:0.3,rp:0.15},desc:'새벽 장애도 받는다'},
  {k:'mgmt',name:'경영기획팀',hq:'mgmt',f:['biz'],w:{ac:0.6,sc:0.4},base:-0.15,m:{hp:-0.6,mn:-1.0,sk:0.25,rp:0.35},desc:'회사의 큰 그림을 그린다'},
  {k:'fin',name:'재무팀',hq:'mgmt',f:['biz'],w:{ac:0.8,mn:0.2},base:-0.1,m:{hp:-0.6,mn:-0.9,sk:0.3,rp:0.25},desc:'돈의 흐름을 본다'},
  {k:'hr',name:'인사팀',hq:'mgmt',f:['ppl','biz'],w:{sc:0.6,mn:0.2,ac:0.2},base:-0.05,m:{hp:-0.5,mn:-1.1,sk:0.2,rp:0.4},desc:'사람을 뽑고 키운다'},
  {k:'legal',name:'법무팀',hq:'mgmt',f:['biz','res'],w:{ac:1},base:-0.25,m:{hp:-0.6,mn:-0.9,sk:0.4,rp:0.3},desc:'학업이 특히 중요하다'},
  {k:'sales',name:'영업팀',hq:'biz',f:['biz','ppl','fnd'],w:{sc:0.7,hp:0.3},base:0.1,m:{hp:-0.9,mn:-1.0,sk:0.25,rp:0.45},desc:'사교가 무기다'},
  {k:'mkt',name:'마케팅팀',hq:'biz',f:['biz','med','art'],w:{ar:0.4,sc:0.4,ac:0.2},base:-0.05,m:{hp:-0.6,mn:-0.9,sk:0.3,rp:0.35},desc:'감성과 사교를 본다'},
  {k:'global',name:'해외사업팀',hq:'biz',f:['biz'],w:{ac:0.5,sc:0.5},base:-0.15,m:{hp:-1.0,mn:-0.8,sk:0.35,rp:0.35},desc:'출장이 많다'},
  {k:'cx',name:'고객경험팀',hq:'biz',f:['ppl'],w:{sc:0.5,mn:0.5},base:0.15,m:{hp:-0.5,mn:-1.3,sk:0.25,rp:0.3},desc:'고객의 목소리를 듣는다'},
  {k:'design',name:'디자인팀',hq:'crea',f:['art'],w:{ar:1},base:-0.05,m:{hp:-0.6,mn:-0.8,sk:0.4,rp:0.25},desc:'감성이 특히 중요하다'},
  {k:'media',name:'콘텐츠·영상팀',hq:'crea',f:['med','art'],w:{ar:0.6,sc:0.4},base:-0.05,m:{hp:-0.8,mn:-0.8,sk:0.35,rp:0.3},desc:'영상과 이야기를 만든다'},
  {k:'pr',name:'홍보팀',hq:'crea',f:['med','ppl'],w:{sc:0.6,ar:0.2,ac:0.2},base:-0.1,m:{hp:-0.6,mn:-1.0,sk:0.25,rp:0.45},desc:'회사의 얼굴이다'},
  {k:'athlete',name:'프로스포츠단',hq:'spt',f:['spt'],w:{hp:1},base:-0.3,m:{hp:-0.4,mn:-0.7,sk:0.4,rp:0.35},desc:'선수로 뛴다. 체력이 전부다'},
  {k:'sportsmkt',name:'스포츠마케팅팀',hq:'spt',f:['spt','biz'],w:{sc:0.5,hp:0.3,ac:0.2},base:-0.05,m:{hp:-0.7,mn:-0.8,sk:0.3,rp:0.35},desc:'경기와 팬을 잇는다'},
  {k:'health',name:'헬스케어팀',hq:'life',f:['ppl','res'],w:{ac:0.6,mn:0.4},base:-0.15,m:{hp:-0.8,mn:-0.9,sk:0.35,rp:0.3},desc:'임직원 건강을 맡는다'},
  {k:'fnb',name:'식음료·호텔팀',hq:'life',f:['fld','ppl'],w:{sc:0.4,hp:0.4,ar:0.2},base:0.15,m:{hp:-1.0,mn:-0.8,sk:0.25,rp:0.3},desc:'맛과 서비스를 만든다'},
  {k:'ops',name:'생산·물류팀',hq:'ops',f:['fld'],w:{hp:0.6,mn:0.4},base:0.2,m:{hp:-1.3,mn:-0.6,sk:0.25,rp:0.2},desc:'체력과 멘탈이 버틴다'},
];
const KD=Object.fromEntries(KDEPTS.map(d=>[d.k,d]));
const hqOf=k=>k==='venture'?'biz':(KD[k]||KD.haeng).hq;
// 부서 합격 가능성: 그 부서가 보는 스탯 + 관련 경험 + 학력(학업을 보는 부서만) + 면접(사교)
function deptFit(d,st){
  let p=d.base+0.45;
  for(const [k,w] of Object.entries(d.w))p+=w*((st[k]??50)-55)/45;
  const ex=d.f.reduce((a,f)=>a+(st.fc&&st.fc[f]||0),0);p+=Math.min(0.3,ex*0.06);
  p+=(st.edu||0)*((d.w.ac||0)*1.5);
  p+=((st.sc??50)-50)*0.002;
  if(st.talent&&d.f.includes(st.talent))p+=0.2;
  return Math.max(0.03,Math.min(0.92,p));
}
