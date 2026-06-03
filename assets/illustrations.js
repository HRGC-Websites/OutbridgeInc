// Outbridge Inc — abstract animated graphics (flat, on-brand, subtle motion)
(function(){
  var INK='#0E0F1C', INDIGO='#3D3DF2', VIOLET='#6D5CF0', LIGHT='#9293F8',
      LIME='#CBFB45', WHITE='#FFFFFF';

  function svg(inner){
    return '<svg viewBox="0 0 480 420" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" class="ill">'+inner+'</svg>';
  }
  function grads(p){
    return '<defs>'+
      '<linearGradient id="'+p+'-lg" x1="0" y1="0" x2="1" y2="1">'+
        '<stop offset="0" stop-color="#4B49F5"/><stop offset="1" stop-color="#7C5BF2"/></linearGradient>'+
      '<radialGradient id="'+p+'-rg" cx="50%" cy="42%" r="60%">'+
        '<stop offset="0" stop-color="'+INDIGO+'" stop-opacity=".20"/><stop offset="1" stop-color="'+INDIGO+'" stop-opacity="0"/></radialGradient>'+
      '</defs>';
  }
  function bg(p){ return '<rect width="480" height="420" fill="url(#'+p+'-rg)"/>'; }
  function dot(x,y,r,fill,cls,d){ return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" class="'+(cls||'')+(d?' '+d:'')+'"/>'; }
  function ringDash(cx,cy,r,sw,col,op){ return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-dasharray="5 15" opacity="'+(op||0.7)+'"/>'; }

  var S = {};

  // HERO — layered gradient card, dashed orbit, drifting accents
  S.hero = svg(grads('h')+bg('h')+
    '<g class="il-spin" style="transform-origin:center">'+ringDash(240,210,156,2,LIGHT,.75)+'</g>'+
    '<circle cx="240" cy="210" r="118" fill="none" stroke="'+LIGHT+'" stroke-width="1.5" opacity=".4"/>'+
    '<g class="il-float"><rect x="156" y="128" width="168" height="168" rx="38" fill="url(#h-lg)" transform="rotate(-8 240 212)"/>'+
      '<rect x="186" y="170" width="78" height="13" rx="6.5" fill="#fff" opacity=".9"/>'+
      '<rect x="186" y="196" width="118" height="11" rx="5.5" fill="#fff" opacity=".5"/>'+
      '<rect x="186" y="216" width="96" height="11" rx="5.5" fill="#fff" opacity=".5"/>'+
      '<circle cx="196" cy="258" r="11" fill="'+LIME+'"/></g>'+
    '<g class="il-float-b d2"><rect x="312" y="120" width="58" height="58" rx="17" fill="'+LIME+'" transform="rotate(12 341 149)"/></g>'+
    '<g class="il-float d3"><rect x="118" y="278" width="64" height="64" rx="18" fill="#fff" opacity=".95"/><circle cx="150" cy="310" r="13" fill="'+INDIGO+'"/></g>'+
    dot(392,300,10,INDIGO,'il-float-b')+dot(96,120,8,LIME,'il-float','d2')+dot(404,96,6,LIGHT,'il-float')
  );

  // SUPPORT — concentric signal rings pulsing from a node
  S.support = svg(grads('su')+bg('su')+
    '<g class="il-pulse" style="transform-origin:center"><circle cx="240" cy="210" r="150" fill="none" stroke="'+LIGHT+'" stroke-width="2" opacity=".35"/></g>'+
    '<g class="il-pulse" style="transform-origin:center;animation-delay:-1.1s"><circle cx="240" cy="210" r="108" fill="none" stroke="'+INDIGO+'" stroke-width="2.5" opacity=".5"/></g>'+
    '<circle cx="240" cy="210" r="64" fill="url(#su-lg)"/>'+
    '<circle cx="240" cy="210" r="22" fill="'+LIME+'"/>'+
    dot(360,140,12,LIME,'il-float')+dot(120,150,9,INDIGO,'il-float-b','d2')+dot(360,290,9,INDIGO,'il-float')+dot(126,288,12,'#fff','il-float-b')
  );

  // VA — stacked task cards drifting
  S.va = svg(grads('va')+bg('va')+
    '<g class="il-float"><rect x="120" y="138" width="240" height="40" rx="12" fill="#fff"/><circle cx="146" cy="158" r="11" fill="'+LIME+'"/><rect x="170" y="152" width="150" height="12" rx="6" fill="'+LIGHT+'" opacity=".5"/></g>'+
    '<g class="il-float d2"><rect x="120" y="190" width="240" height="40" rx="12" fill="url(#va-lg)"/><circle cx="146" cy="210" r="11" fill="'+LIME+'"/><rect x="170" y="204" width="120" height="12" rx="6" fill="#fff" opacity=".6"/></g>'+
    '<g class="il-float d3"><rect x="120" y="242" width="240" height="40" rx="12" fill="#fff"/><circle cx="146" cy="262" r="11" fill="#D9DCF5"/><rect x="170" y="256" width="140" height="12" rx="6" fill="'+LIGHT+'" opacity=".5"/></g>'+
    '<g class="il-float-b"><rect x="330" y="96" width="56" height="56" rx="16" fill="'+LIME+'"/></g>'+
    dot(96,300,10,INDIGO,'il-float-b')+dot(392,310,8,LIGHT,'il-float')
  );

  // SALES — ascending blocks + trend arc
  S.sales = svg(grads('sa')+bg('sa')+
    '<g class="il-float">'+
      '<rect x="150" y="248" width="42" height="56" rx="10" fill="'+LIGHT+'" opacity=".6"/>'+
      '<rect x="204" y="214" width="42" height="90" rx="10" fill="'+INDIGO+'" opacity=".8"/>'+
      '<rect x="258" y="186" width="42" height="118" rx="10" fill="url(#sa-lg)"/>'+
      '<rect x="312" y="150" width="42" height="154" rx="10" fill="'+LIME+'"/>'+
    '</g>'+
    '<path d="M150 250 L225 214 L279 192 L333 150" fill="none" stroke="'+INK+'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>'+
    '<g class="il-float-b"><circle cx="345" cy="120" r="26" fill="#fff"/><text x="334" y="131" font-family="Hanken Grotesk,sans-serif" font-size="26" font-weight="800" fill="'+INDIGO+'">$</text></g>'+
    dot(110,150,9,LIME,'il-float')+dot(396,300,8,INDIGO,'il-float-b','d2')
  );

  // BPO — orbiting network nodes
  S.bpo = svg(grads('bp')+bg('bp')+
    '<circle cx="240" cy="210" r="150" fill="none" stroke="'+LIGHT+'" stroke-width="1.5" opacity=".35"/>'+
    '<circle cx="240" cy="210" r="100" fill="none" stroke="'+LIGHT+'" stroke-width="1.5" opacity=".3"/>'+
    '<circle cx="240" cy="210" r="46" fill="url(#bp-lg)"/>'+
    '<g class="il-spin" style="transform-origin:center">'+
      dot(240,60,16,LIME)+dot(390,210,13,INDIGO)+dot(240,360,13,INDIGO)+dot(90,210,16,'#fff')+
      '<circle cx="240" cy="110" r="6" fill="'+LIGHT+'"/><circle cx="340" cy="210" r="6" fill="'+LIGHT+'"/>'+
    '</g>'+
    '<g class="il-spin-r" style="transform-origin:center">'+dot(316,134,9,LIME)+dot(164,286,9,INDIGO)+'</g>'
  );

  // CONSULT — two overlapping fields + link
  S.consult = svg(grads('co')+bg('co')+
    '<g class="il-float"><circle cx="190" cy="210" r="92" fill="url(#co-lg)" opacity=".92"/></g>'+
    '<g class="il-float-b d2"><circle cx="300" cy="210" r="78" fill="'+LIME+'" opacity=".85"/></g>'+
    '<circle cx="190" cy="210" r="18" fill="#fff"/><circle cx="300" cy="210" r="16" fill="'+INK+'"/>'+
    '<path d="M208 210 H282" stroke="'+INK+'" stroke-width="3" stroke-dasharray="4 8" opacity=".5"/>'+
    dot(150,110,9,INDIGO,'il-float')+dot(360,300,9,INDIGO,'il-float-b')+dot(110,300,8,LIME,'il-float')
  );

  // STORY — cluster of circles
  S.story = svg(grads('st')+bg('st')+
    '<g class="il-float"><circle cx="200" cy="190" r="56" fill="url(#st-lg)"/></g>'+
    '<g class="il-float-b d2"><circle cx="290" cy="170" r="40" fill="'+LIME+'"/></g>'+
    '<g class="il-float d3"><circle cx="285" cy="258" r="46" fill="'+LIGHT+'"/></g>'+
    '<g class="il-float-b"><circle cx="158" cy="270" r="32" fill="#fff"/></g>'+
    dot(360,130,9,INDIGO,'il-float')+dot(120,150,8,LIME,'il-float-b')+dot(372,300,8,LIGHT,'il-float')
  );

  // SECURE — shield-ish field + protective rings
  S.secure = svg(grads('se')+bg('se')+
    '<g class="il-pulse" style="transform-origin:center"><circle cx="240" cy="212" r="142" fill="none" stroke="'+LIGHT+'" stroke-width="2" opacity=".3"/></g>'+
    '<g class="il-float"><path d="M240 110 l84 30 v68 q0 76 -84 108 q-84 -32 -84 -108 v-68 Z" fill="url(#se-lg)"/>'+
      '<path d="M240 150 l44 16 v36 q0 40 -44 58 q-44 -18 -44 -58 v-36 Z" fill="#fff" opacity=".14"/>'+
      '<path d="M214 214 l16 16 l30 -34" stroke="'+LIME+'" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'+
    dot(110,160,10,LIME,'il-float-b')+dot(372,168,8,INDIGO,'il-float')+dot(108,300,8,INDIGO,'il-float')+dot(376,300,10,'#fff','il-float-b','d2')
  );

  function build(){
    document.querySelectorAll('[data-ill]').forEach(function(el){
      var s = S[el.getAttribute('data-ill')];
      if(s){ el.innerHTML = s; el.classList.add('ill-frame'); }
    });
  }
  if(document.readyState!=='loading') build(); else document.addEventListener('DOMContentLoaded', build);
})();
