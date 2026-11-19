"use strict";
// 공용 도구: DOM, 난수, 확률 뽑기, 한국어 조사
const $=s=>document.querySelector(s);
const R=Math.random;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(R()*a.length)];
const chance=p=>R()<p;
const randint=(a,b)=>a+Math.floor(R()*(b-a+1));
function randn(){let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function wpick(items){const t=items.reduce((s,i)=>s+i.w,0);let r=R()*t;for(const i of items){r-=i.w;if(r<=0)return i;}return items[items.length-1];}
const pct=(item,arr)=>Math.round(item.w/arr.reduce((s,i)=>s+i.w,0)*1000)/10;
// 받침 유무로 조사 고르기: J('민준','이','가') → '이'
const J=(w,a,b)=>{const ch=w[w.length-1];if(/[0-9]/.test(ch))return '013678'.includes(ch)?a:b;const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c<11172&&c%28?a:b;};
const X=(t,f,d,p,pl)=>({t,f,d,p,pl});
function fmtMoney(v){const s=v<0?'-':'';v=Math.abs(v);if(v>=10000){const e=Math.floor(v/10000),r=Math.round(v%10000);return s+e+'억'+(r?' '+r.toLocaleString()+'만':'');}return s+Math.round(v).toLocaleString()+'만';}
