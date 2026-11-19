"use strict";
// 코드로 그린 프로필. 성별과 나이대에 따라 머리 모양·크기·옷이 달라진다.
function avatarSVG(gender,age,opt={}){
  const kid=age<=7,teen=age>=8&&age<=19,suit=!!opt.suit&&age>=20;
  // 나이 들수록 머리가 희어지고, 45살부터 눈가 주름이 생긴다.
  const skin='#F2D3B8',hair=age>=58?'#B9B9B9':age>=50?'#8A8A8A':age>=42?'#4E4640':'#2B2420';
  const cloth=kid?'#E8B04B':teen?'#2F5D8A':suit?'#2C3A4F':'#4A5560';
  const headR=kid?17:15,cy=kid?30:28;
  const f=gender==='f';
  const hairBack=f?`<path d="M${32-headR-3} ${cy} Q${32-headR-4} ${cy+headR+10} ${32-headR+3} ${cy+headR+8} L${32+headR-3} ${cy+headR+8} Q${32+headR+4} ${cy+headR+10} ${32+headR+3} ${cy} Z" fill="${hair}"/>`:'';
  const hairTop=f
    ?`<path d="M${32-headR-1} ${cy+2} Q32 ${cy-headR-10} ${32+headR+1} ${cy+2} Q${32+headR-4} ${cy-headR+4} 32 ${cy-headR+5} Q${32-headR+4} ${cy-headR+4} ${32-headR-1} ${cy+2} Z" fill="${hair}"/>`
    :`<path d="M${32-headR} ${cy-2} Q32 ${cy-headR-8} ${32+headR} ${cy-2} Q${32+headR-3} ${cy-headR+2} 32 ${cy-headR+3} Q${32-headR+3} ${cy-headR+2} ${32-headR} ${cy-2} Z" fill="${hair}"/>`;
  const tie=teen?`<path d="M30 ${cy+headR+6} L34 ${cy+headR+6} L32 ${cy+headR+14} Z" fill="#B23A2E"/>`
    :suit?`<path d="M26 ${cy+headR+4} L32 ${cy+headR+12} L38 ${cy+headR+4} Z" fill="#F4F4F2"/><path d="M30.5 ${cy+headR+6} L33.5 ${cy+headR+6} L32.8 ${cy+headR+18} L32 ${cy+headR+20} L31.2 ${cy+headR+18} Z" fill="${opt.tie||'#8C2F27'}"/>`:'';
  const wr=age>=45?`<path d="M${32-9} ${cy+4} l2 1.2 M${32+9} ${cy+4} l-2 1.2" stroke="#C9A58C" stroke-width="0.9" stroke-linecap="round"/>`:'';
  return `<svg viewBox="0 0 64 64" class="avatar" role="img" aria-label="${f?'여자':'남자'} ${age}살 프로필">
    ${hairBack}
    <path d="M10 64 Q12 ${cy+headR+4} 32 ${cy+headR+3} Q52 ${cy+headR+4} 54 64 Z" fill="${cloth}"/>
    ${tie}
    <circle cx="32" cy="${cy}" r="${headR}" fill="${skin}"/>
    ${hairTop}
    <circle cx="${32-5}" cy="${cy+2}" r="1.6" fill="#2B2420"/><circle cx="${32+5}" cy="${cy+2}" r="1.6" fill="#2B2420"/>
    ${wr}
    <path d="M${32-3} ${cy+7} Q32 ${cy+9} ${32+3} ${cy+7}" stroke="#9A5B45" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </svg>`;
}
