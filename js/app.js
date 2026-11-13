/* ============================================================
   Dashain Premier League — standings webpage
   Static data (js/seed.js) · no login · updated from screenshots
   ============================================================ */
(function(){
'use strict';
var PT_RATE = 0.1; // points to money rate

/* ---------------- utils ---------------- */
function $(s, r){ return (r||document).querySelector(s); }
function esc(s){ var d=document.createElement('div'); d.textContent=(s==null?'':s); return d.innerHTML; }
function fmtPts(n){ n=Math.round(n*10)/10; return (n>0?'+':'')+n; }
function fmtMoney(pts){ var d=Math.round(pts*PT_RATE*100)/100; return (d>=0?'+':'−')+Math.abs(d).toFixed(2); }
function cls(n){ return n>0?'pos':(n<0?'neg':''); }
function toast(msg){ var t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(function(){ t.remove(); },2600); }
var ST_ICON = {s:'👁️', u:'🙈', d:'🀄', f:'🚩'};

/* ---------------- store (static seed) ---------------- */
function seedState(){
  var st = {players:[], days:[], games:[]};
  var S = window.DPL_SEED;
  st.meta = S.meta || {};
  st.players = S.players.map(function(p){ return {id:p.id,name:p.name,title:p.title,emoji:p.emoji,pattern:p.pattern||'',strength:p.strength||'',weakness:p.weakness||'',zelle:p.zelle||''}; });
  st.days = S.days.map(function(d){ return {id:d.id,label:d.label,date:d.date,note:d.note||'',settled:!!d.settled,forcePair:d.forcePair||null,settlePerRound:!!d.settlePerRound}; });
  st.couples = S.couples||[];
  st.games = S.games.map(function(g){
    return {
      id:g.id, dayId:g.dayId, name:g.name, variant:g.variant||'classic',
      date:g.date, partial:!!g.partial, note:g.note||'', settleGroup:g.settleGroup||'', playerIds:g.playerIds.slice(),
      totals: Object.assign({}, g.totals),
      rounds: g.rounds.map(function(r){
        var scores={};
        g.playerIds.forEach(function(pid,i){ scores[pid]={pts:r.s[i][0], status:r.s[i][1]}; });
        return {n:r.n, winner:r.w, scores:scores};
      })
    };
  });
  return st;
}
var state = seedState();

/* ---------------- computed ---------------- */
function pname(pid){ var p=state.players.find(function(x){return x.id===pid;}); return p?p.name:'?'; }
function pinfo(pid){ return state.players.find(function(x){return x.id===pid;})||{id:pid,name:'?',title:'',emoji:'🃏'}; }
function gameTotals(g){ return Object.assign({}, g.totals); }
function dayGames(dayId){ return state.games.filter(function(g){return g.dayId===dayId;}); }
function dayTotals(dayId){
  var t={};
  dayGames(dayId).forEach(function(g){ var gt=gameTotals(g); for(var pid in gt) t[pid]=(t[pid]||0)+gt[pid]; });
  return t;
}
function cumSeries(pid){
  var out=[{label:'Day 0', date:'Start', pts:0, v:0}], cum=0;
  state.days.forEach(function(d){ var t=dayTotals(d.id); if(t[pid]!==undefined){ cum+=t[pid]; out.push({label:d.label, date:d.note||d.date, pts:cum, v:cum*PT_RATE}); } });
  return out;
}
function fmtAxis(v){ var s=(v>0?'+':(v<0?'−':''))+Math.abs(v).toFixed(1); return s.replace(/\.0$/,''); }
function sparkSVG(series){
  if(!series.length) return '';
  var W=264,H=118,PL=6,PR=8,PT=15,PB=15;
  var vs=series.map(function(p){return p.v;});
  var mn=Math.min.apply(null,vs.concat([0])), mx=Math.max.apply(null,vs.concat([0]));
  if(mx-mn<10){ var pad=(10-(mx-mn))/2; mx+=pad; mn-=pad; }
  var n=series.length;
  function X(i){ return n===1?(PL+(W-PL-PR)/2):PL+(W-PL-PR)*i/(n-1); }
  function Y(v){ return PT+(mx-v)*(H-PT-PB)/(mx-mn); }
  function r1(x){ return Math.round(x*10)/10; }
  function pointPts(p){ return p.pts!==undefined?p.pts:Math.round(p.v/PT_RATE); }
  var pts=series.map(function(p,i){ return r1(X(i))+','+r1(Y(p.v)); });
  var line='M'+pts.join(' L');
  var zeroY=Y(0);
  var lastP=series[n-1], lastX=X(n-1), lastY=Y(lastP.v);
  var lastText=lastP.label+': '+fmtPts(pointPts(lastP))+' points';
  var s='<div class="cum-chart" tabindex="0" role="slider" aria-label="Cumulative score graph. Touch, drag, or use arrow keys to inspect each day." aria-valuemin="0" aria-valuemax="'+(n-1)+'" aria-valuenow="'+(n-1)+'" aria-valuetext="'+esc(lastText)+'">';
  s+='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Cumulative earnings graph">';
  s+='<defs><linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eec27f" stop-opacity=".20"/><stop offset="1" stop-color="#eec27f" stop-opacity=".01"/></linearGradient></defs>';
  if(n>1) s+='<path d="'+line+' L'+r1(X(n-1))+','+r1(zeroY)+' L'+r1(X(0))+','+r1(zeroY)+' Z" fill="url(#cumGrad)" stroke="none"/>';
  s+='<line x1="'+PL+'" y1="'+r1(zeroY)+'" x2="'+(W-PR)+'" y2="'+r1(zeroY)+'" stroke="rgba(244,102,112,.38)" stroke-width="1" stroke-dasharray="3 4"/>';
  if(n>1) s+='<path class="cum-line" d="'+line+'" fill="none" stroke="#eec27f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  s+='<circle cx="'+r1(X(0))+'" cy="'+r1(Y(series[0].v))+'" r="2" fill="#eec27f" opacity=".55"/>';
  s+='<circle cx="'+r1(lastX)+'" cy="'+r1(lastY)+'" r="3.2" fill="#eec27f" stroke="#3a0f18" stroke-width="1"/>';
  series.forEach(function(p,i){
    s+='<circle class="cum-data" cx="'+r1(X(i))+'" cy="'+r1(Y(p.v))+'" r="1" fill="#fff" opacity="0" pointer-events="none" data-label="'+esc(p.label)+'" data-date="'+esc(p.date||'')+'" data-pts="'+pointPts(p)+'"/>';
  });
  s+='<g class="cum-scrub" aria-hidden="true"><line class="cum-guide" x1="'+r1(lastX)+'" y1="'+PT+'" x2="'+r1(lastX)+'" y2="'+(H-PB)+'"/><circle class="cum-halo" cx="'+r1(lastX)+'" cy="'+r1(lastY)+'" r="8.5"/><circle class="cum-dot" cx="'+r1(lastX)+'" cy="'+r1(lastY)+'" r="4"/></g>';
  var lastV=lastP.v;
  s+='<text class="cum-final-label" x="'+r1(lastX)+'" y="'+r1(Math.max(9,lastY-7))+'" text-anchor="end">'+fmtAxis(lastV)+'</text>';
  var dlab=function(l){ return l.replace('Day ','D'); };
  if(n===1) s+='<text x="'+r1(X(0))+'" y="'+(H-2)+'" text-anchor="middle">'+dlab(series[0].label)+'</text>';
  else{
    s+='<text x="'+PL+'" y="'+(H-2)+'">'+dlab(series[0].label)+'</text>';
    s+='<text x="'+(W-PR)+'" y="'+(H-2)+'" text-anchor="end">'+dlab(series[n-1].label)+'</text>';
  }
  s+='</svg><div class="cum-tip" aria-hidden="true"><div class="cum-tip-day"></div><div class="cum-tip-value"></div></div></div>';
  return s;
}
function cumMoney(pts){
  var d=Math.round(pts*PT_RATE*100)/100;
  return (d<0?'−$':'+$')+Math.abs(d).toFixed(2);
}
function cumPoints(chart){
  if(chart._cumPoints) return chart._cumPoints;
  var nodes=chart.querySelectorAll('.cum-data'), out=[];
  for(var i=0;i<nodes.length;i++){
    out.push({
      label:nodes[i].getAttribute('data-label')||'',
      date:nodes[i].getAttribute('data-date')||'',
      pts:parseFloat(nodes[i].getAttribute('data-pts')||'0'),
      x:parseFloat(nodes[i].getAttribute('cx')||'0'),
      y:parseFloat(nodes[i].getAttribute('cy')||'0')
    });
  }
  chart._cumPoints=out;
  return out;
}
function setCumSelection(chart, idx, show){
  var points=cumPoints(chart);
  if(!points.length) return;
  idx=Math.max(0, Math.min(points.length-1, idx));
  var p=points[idx];
  chart._cumIndex=idx;
  var guide=chart.querySelector('.cum-guide'), halo=chart.querySelector('.cum-halo'), dot=chart.querySelector('.cum-dot');
  if(guide){ guide.setAttribute('x1',p.x); guide.setAttribute('x2',p.x); }
  if(halo){ halo.setAttribute('cx',p.x); halo.setAttribute('cy',p.y); }
  if(dot){ dot.setAttribute('cx',p.x); dot.setAttribute('cy',p.y); }
  chart.setAttribute('aria-valuenow',idx);
  chart.setAttribute('aria-valuetext',p.label+': '+fmtPts(p.pts)+' points');
  var tip=chart.querySelector('.cum-tip');
  if(tip){
    tip.querySelector('.cum-tip-day').textContent=p.label;
    tip.querySelector('.cum-tip-value').textContent=fmtPts(p.pts)+' pts';
  }
  if(show){
    chart.classList.add('cum-on');
    if(tip){
      var rect=chart.getBoundingClientRect();
      if(rect.width&&rect.height){
        var px=p.x/264*rect.width;
        var tipW=tip.offsetWidth||92;
        var half=Math.min(rect.width/2, Math.max(48,tipW/2+4));
        tip.style.left=Math.max(half, Math.min(rect.width-half, px))+'px';
        tip.style.top='-8px';
      }
    }
  } else {
    chart.classList.remove('cum-on');
  }
}
function cumIndexFromClientX(chart, clientX){
  var points=cumPoints(chart), rect=chart.getBoundingClientRect();
  if(!points.length||!rect.width) return 0;
  var x=(clientX-rect.left)/rect.width*264, best=0, bestDist=Infinity;
  points.forEach(function(p,i){ var dist=Math.abs(p.x-x); if(dist<bestDist){ bestDist=dist; best=i; } });
  return best;
}
var activeCumChart=null, activeCumPointer=null;
document.addEventListener('pointerdown',function(e){
  var chart=e.target&&e.target.closest?e.target.closest('.cum-chart'):null;
  if(!chart||!cumPoints(chart).length) return;
  if(e.button!==undefined&&e.button!==0) return;
  activeCumChart=chart; activeCumPointer=e.pointerId;
  chart.classList.add('cum-scrubbing');
  setCumSelection(chart,cumIndexFromClientX(chart,e.clientX),true);
  if(e.cancelable) e.preventDefault();
},{passive:false});
document.addEventListener('pointermove',function(e){
  if(!activeCumChart||(activeCumPointer!==null&&e.pointerId!==activeCumPointer)) return;
  setCumSelection(activeCumChart,cumIndexFromClientX(activeCumChart,e.clientX),true);
  if(e.cancelable) e.preventDefault();
},{passive:false});
function endCumScrub(e){
  if(!activeCumChart||(activeCumPointer!==null&&e.pointerId!==activeCumPointer)) return;
  var chart=activeCumChart;
  chart.classList.remove('cum-scrubbing');
  setCumSelection(chart,cumPoints(chart).length-1,false);
  activeCumChart=null; activeCumPointer=null;
}
document.addEventListener('pointerup',endCumScrub);
document.addEventListener('pointercancel',endCumScrub);
document.addEventListener('keydown',function(e){
  var chart=e.target&&e.target.closest?e.target.closest('.cum-chart'):null;
  if(!chart) return;
  var points=cumPoints(chart); if(!points.length) return;
  var idx=chart._cumIndex===undefined?points.length-1:chart._cumIndex;
  if(e.key==='ArrowLeft') idx--;
  else if(e.key==='ArrowRight') idx++;
  else if(e.key==='Home') idx=0;
  else if(e.key==='End') idx=points.length-1;
  else return;
  setCumSelection(chart,idx,true);
  e.preventDefault();
});
document.addEventListener('focusin',function(e){
  var chart=e.target&&e.target.closest?e.target.closest('.cum-chart'):null;
  if(chart&&chart!==activeCumChart) setCumSelection(chart,chart._cumIndex===undefined?cumPoints(chart).length-1:chart._cumIndex,true);
});
document.addEventListener('focusout',function(e){
  var chart=e.target&&e.target.closest?e.target.closest('.cum-chart'):null;
  if(chart&&chart!==activeCumChart) chart.classList.remove('cum-on');
});
function overallTotals(){
  var t={};
  state.games.forEach(function(g){ var gt=gameTotals(g); for(var pid in gt) t[pid]=(t[pid]||0)+gt[pid]; });
  return t;
}
function ranked(totals){
  return Object.keys(totals).map(function(pid){ return {pid:pid, pts:totals[pid]}; })
    .sort(function(a,b){ return b.pts-a.pts; });
}
/* Minimal settlement: couples settle with each other first, then debtors pay creditors, fewest transactions possible */
function paidMap(){ try{ return JSON.parse(localStorage.getItem('dpl_paid_v1')||'{}'); }catch(e){ return {}; } }
function isPaid(k){ return !!paidMap()[k]; }
function settlements(t, force){
  var bal={};
  for(var pid in t) bal[pid]=Math.round(t[pid]*10)/10;
  var out=[];
  function pay(frm,to,amt,couple){
    amt=Math.round(amt*10)/10;
    if(amt<=0) return;
    out.push({from:frm, to:to, pts:amt, couple:!!couple});
    bal[frm]=Math.round((bal[frm]+amt)*10)/10;
    bal[to]=Math.round((bal[to]-amt)*10)/10;
  }
  if(force && bal[force[0]]<0 && bal[force[1]]>0){
    pay(force[0], force[1], Math.min(-bal[force[0]], bal[force[1]]));
  }
  state.couples.forEach(function(cp){
    var a=cp[0], b=cp[1];
    if(bal[a]===undefined||bal[b]===undefined) return;
    if(bal[a]>0 && bal[b]<0) pay(b,a,Math.min(bal[a],-bal[b]),true);
    else if(bal[a]<0 && bal[b]>0) pay(a,b,Math.min(-bal[a],bal[b]),true);
  });
  var cred=[], debt=[];
  for(var p2 in bal){ if(bal[p2]>0) cred.push({pid:p2,amt:bal[p2]}); else if(bal[p2]<0) debt.push({pid:p2,amt:-bal[p2]}); }
  cred.sort(function(a,b){return b.amt-a.amt;});
  debt.sort(function(a,b){return b.amt-a.amt;});
  var ci=0, di=0;
  while(ci<cred.length && di<debt.length){
    var c=cred[ci], db=debt[di], p=Math.min(c.amt,db.amt);
    out.push({from:db.pid, to:c.pid, pts:Math.round(p*10)/10, couple:false});
    c.amt=Math.round((c.amt-p)*10)/10;
    db.amt=Math.round((db.amt-p)*10)/10;
    if(c.amt<=0) ci++;
    if(db.amt<=0) di++;
  }
  return out;
}
function dayRankMap(dayId){
  var r=ranked(dayTotals(dayId)), m={};
  r.forEach(function(e,i){ m[e.pid]=i+1; });
  return m;
}
function moveArrow(pid, dayIdx){
  if(dayIdx<=0) return '';
  var prev=dayRankMap(state.days[dayIdx-1].id), cur=dayRankMap(state.days[dayIdx].id);
  if(!prev[pid]||!cur[pid]) return '<span class="mv">new</span>';
  var d=prev[pid]-cur[pid];
  if(d>0) return '<span class="mv up">▲'+d+'</span>';
  if(d<0) return '<span class="mv dn">▼'+(-d)+'</span>';
  return '<span class="mv">–</span>';
}
function playerStats(pid){
  var s={games:0,rounds:0,crowns:0,seen:0,unseen:0,dublee:0,foul:0,best:null,worst:null,roundPts:0};
  state.games.forEach(function(g){
    if(g.playerIds.indexOf(pid)<0) return;
    s.games++;
    g.rounds.forEach(function(r){
      var sc=r.scores[pid]; if(!sc) return;
      var v=+sc.pts||0;
      s.rounds++; s.roundPts+=v;
      if(r.winner===pid) s.crowns++;
      if(sc.status==='s')s.seen++; else if(sc.status==='u')s.unseen++;
      else if(sc.status==='d')s.dublee++; else if(sc.status==='f')s.foul++;
      if(s.best===null||v>s.best) s.best=v;
      if(s.worst===null||v<s.worst) s.worst=v;
    });
  });
  var t=overallTotals(); s.total=t[pid]||0;
  s.avg = s.rounds? Math.round(s.roundPts/s.rounds*10)/10 : 0;
  var dset={};
  state.games.forEach(function(g){ if(g.playerIds.indexOf(pid)>=0) dset[g.dayId]=1; });
  s.daysPlayed=Object.keys(dset).length;
  s.dayWins=0;
  state.days.forEach(function(d){ if(dayRankMap(d.id)[pid]===1) s.dayWins++; });
  return s;
}
/* ---------------- share ---------------- */
function standingsText(){
  var t=overallTotals(), r=ranked(t), L=[];
  L.push('🪁 DASHAIN PREMIER LEAGUE — Season Standings (cumulative)');
  r.forEach(function(e,i){ L.push((i+1)+'. '+pname(e.pid)+'  '+fmtPts(e.pts)+' pts ('+fmtMoney(e.pts)+')'); });
  L.push('Happy Dashain! 🌼');
  return L.join('\n');
}
function shareText(txt){
  if(navigator.share){ navigator.share({text:txt}).catch(function(){}); return; }
  var ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta);
  ta.select(); try{ document.execCommand('copy'); toast('Copied — paste it anywhere ✓'); }catch(e){ toast('Copy failed'); }
  ta.remove();
}

/* ---------------- views ---------------- */
function tabbar(active){
  var tabs=[
    {r:'#/', i:'🏠', l:'Home'},
    {r:'#/days', i:'📅', l:'Days'},
    {r:'#/players', i:'👥', l:'Players'},
    {r:'#/versus', i:'⚔️', l:'Versus'},
    {r:'#/stats', i:'📊', l:'Stats'},
    {r:'#/timeline', i:'🪔', l:'Timeline'}
  ];
  $('#tabbar').innerHTML = tabs.map(function(t){
    var on = (t.r==='#/' && (active==='#/'||active==='#/home')) || (t.r!=='#/' && active.indexOf(t.r)===0);
    return '<button class="tab'+(on?' on':'')+'" onclick="location.hash=\''+t.r+'\'"><span class="ti">'+t.i+'</span><span>'+t.l+'</span></button>';
  }).join('');
}
function gamesPlayed(pid){
  var n=0;
  state.games.forEach(function(g){
    if(g.playerIds.indexOf(pid)<0) return;
    var maxN=0;
    g.rounds.forEach(function(r){ if(r.n>maxN) maxN=r.n; });
    n+=maxN;
  });
  return n;
}
function lbRow(e, i, mv, clickable, gamesNote){
  var p=pinfo(e.pid);
  var click = clickable===false ? '' : ' onclick="location.hash=\'#/player/'+e.pid+'\'" style="cursor:pointer"';
  return '<div class="lb"'+click+'>'+
    '<div class="rank r'+(i+1)+'">'+(i+1)+'</div>'+
    '<div class="avatar">'+p.emoji+'</div>'+
    '<div class="grow"><div class="nm">'+esc(p.name)+(gamesNote?' <span style="font-size:11px;font-weight:400;opacity:.55">('+gamesPlayed(e.pid)+' games)</span>':'')+'</div><div class="ti2">'+esc(p.title)+'</div></div>'+
    '<div class="sc"><div class="pv '+cls(e.pts)+'">'+fmtPts(e.pts)+'</div><div class="mv">'+fmtMoney(e.pts)+' '+(mv||'')+'</div></div>'+
  '</div>';
}

function vHome(){
  tabbar('#/');
  var t=overallTotals(), r=ranked(t);
  var lead=r[0]?pinfo(r[0].pid):null;
  var h='<div class="hero"><div class="hero-id"><div class="kicker">Season\'s Big Gun</div>';
  if(lead){ h+='<div class="big">'+lead.emoji+' '+esc(lead.name)+'</div><div class="hero-money '+cls(r[0].pts)+'">'+fmtMoney(r[0].pts)+'</div></div><div class="hero-graph">'+sparkSVG(cumSeries(r[0].pid))+'</div>'; }
  else h+='</div>';
  h+='</div>';
  var lastD=state.days[state.days.length-1], lr=ranked(dayTotals(lastD.id));
  if(lr.length){ var lp=pinfo(lr[0].pid);
    h+='<div class="card" onclick="location.hash=\'#/day/'+lastD.id+'\'" style="cursor:pointer"><div class="row"><div class="grow"><div class="small dim">🗓️ Last session — '+esc(lastD.label)+' <span class="dim">'+esc(lastD.note||'')+'</span></div><div style="font-weight:800;font-size:16px">Winner: '+lp.emoji+' '+esc(lp.name)+' <span class="pos">'+fmtPts(lr[0].pts)+' pts</span></div></div><div class="gold" style="font-size:20px">→</div></div></div>'; }
  var jnames=state.players.slice().sort(function(a,b){ return a.name<b.name?-1:(a.name>b.name?1:0); });
  var jopts=jnames.map(function(p){ return '<option value="'+p.id+'">'+esc(p.name)+'</option>'; }).join('');
  h+='<div class="card jpick homepick"><div class="jpick-q" style="font-size:17px">Your journey</div><select id="homeSel"><option value="">Select your name</option>'+jopts+'</select></div>';
  h+='<h3>🏆 Cumulative Leaderboard</h3>';
  var lastDay=state.days[state.days.length-1];
  var prevDay=state.days.length>1?state.days[state.days.length-2]:null;
  var curM=lastDay?dayRankMap(lastDay.id):{}, prevM=prevDay?dayRankMap(prevDay.id):{};
  r.forEach(function(e,i){
    var mv='';
    if(prevDay){ var d=(prevM[e.pid]||99)-(curM[e.pid]||99);
      if(!prevM[e.pid]) mv='<span class="mv">new</span>';
      else if(d>0) mv='<span class="mv up">▲'+d+'</span>';
      else if(d<0) mv='<span class="mv dn">▼'+(-d)+'</span>';
    }
    h+=lbRow(e,i,mv,null,true);
  });
  h+='<div class="garland">🌼 🌼 🌼</div><div class="card small mut center">Tap a player for full stats</div>';
  $('#view').innerHTML=h;
  var hs=document.getElementById('homeSel');
  if(hs) hs.addEventListener('change', function(){ if(hs.value) location.hash='#/journey/'+hs.value; });
}

function vDays(){
  tabbar('#/days');
  var h='<h2>📅 Days</h2>';
  state.days.slice().reverse().forEach(function(d){
    var t=dayTotals(d.id), r=ranked(t), g=dayGames(d.id);
    var lead=r[0];
    h+='<div class="card" onclick="location.hash=\'#/day/'+d.id+'\'" style="cursor:pointer">'+
      '<div class="row"><div class="grow"><div style="font-weight:800;font-size:17px">🗓️ '+esc(d.label)+'</div><div class="small dim">'+esc(d.note||d.date)+' · '+g.length+' rounds</div></div>'+
      '<div style="text-align:right"><div class="small dim">Day winner</div><div style="font-weight:800" class="pos">'+(lead?pinfo(lead.pid).emoji+' '+esc(pinfo(lead.pid).name)+' '+fmtPts(lead.pts):'—')+'</div></div></div>'+
      '<div class="small" style="margin-top:8px;color:var(--dim)">'+r.slice(0,5).map(function(e,i){return (i+1)+'. '+esc(pname(e.pid))+' ('+fmtPts(e.pts)+')';}).join(' · ')+(r.length>5?' …':'')+'</div>'+
    '</div>';
  });
  $('#view').innerHTML=h;
}

function vDay(id){
  tabbar('#/days');
  var d=state.days.find(function(x){return x.id===id;});
  if(!d){ location.hash='#/days'; return; }
  var di=state.days.indexOf(d);
  var t=dayTotals(id), r=ranked(t), g=dayGames(id);
  var h='<h2>🗓️ '+esc(d.label)+' <span class="small dim">'+esc(d.note||d.date)+'</span></h2>';
  h+='<h3>Standings</h3>';
  r.forEach(function(e,i){ h+=lbRow(e,i,moveArrow(e.pid,di)); });
  if(d.settled){
    var settleBlock=function(ss, title){
      ss.sort(function(a,b){return b.pts-a.pts;});
      var bh='<h3>'+title+'</h3>';
      if(!ss.length){ return bh+'<div class="small dim">All square — nobody owes anyone.</div>'; }
      ss.forEach(function(x){
        var amt=(Math.round(x.pts*PT_RATE*100)/100).toFixed(2);
        var pk=d.id+'|'+title+'|'+x.from+'>'+x.to+'|'+amt;
        var pd=isPaid(pk);
        bh+='<div class="lb"><div class="grow"><div class="nm">'+esc(pname(x.from))+' <span class="dim">→</span> '+esc(pname(x.to))+'</div></div>'+
          '<div class="sc"><div class="pv">$'+amt+'</div></div>'+
          '<button class="btn ghost" style="min-height:0;padding:8px 14px;font-size:13px" onclick="App.copyZelleFor(\''+x.to+'\')">Zelle</button>'+
          '<button class="paidbtn'+(pd?' on':'')+'" onclick="App.togglePaid(\''+pk.replace(/'/g,"\\'")+'\',this)">'+(pd?'✓ Settled':'Unsettled')+'</button></div>';
      });
      return bh;
    };
    if(d.settlePerRound){
      var grouped={}, gorder=[];
      g.forEach(function(gm){
        if(gm.settleGroup){
          if(!grouped[gm.settleGroup]){ grouped[gm.settleGroup]={t:{},n:0}; gorder.push(gm.settleGroup); }
          var gt=gameTotals(gm);
          for(var pid in gt) grouped[gm.settleGroup].t[pid]=(grouped[gm.settleGroup].t[pid]||0)+gt[pid];
          grouped[gm.settleGroup].n++;
        }
      });
      g.forEach(function(gm){
        if(!gm.settleGroup) h+=settleBlock(settlements(gameTotals(gm), null), 'Who Pays Who — '+esc(gm.name)+(gm.note?' · '+esc(gm.note):''));
      });
      gorder.forEach(function(gid){
        h+=settleBlock(settlements(grouped[gid].t, null), 'Who Pays Who — Combined ('+grouped[gid].n+' tables)');
      });
    } else {
      h+=settleBlock(settlements(t, d.forcePair), 'Who Pays Who');
    }
  }
  h+='<h3>Rounds ('+g.length+')</h3>';
  g.forEach(function(gm){
    var gt=gameTotals(gm), gr=ranked(gt), lead=gr[0];
    h+='<div class="lb" onclick="location.hash=\'#/game/'+gm.id+'\'" style="cursor:pointer">'+
      '<div class="avatar">'+(gm.variant==='murder'?'🔪':'🃏')+'</div>'+
      '<div class="grow"><div class="nm">'+esc(gm.name)+' '+(gm.variant==='murder'?'<span class="tag murder">MURDER</span>':'')+'</div><div class="ti2">'+(gm.note?esc(gm.note)+' · ':'')+gm.playerIds.length+' players · '+gm.rounds.length+' games'+(gm.partial?' · partial history':'')+'</div></div>'+
      '<div class="sc"><div class="pv pos">'+esc(pname(lead.pid))+'</div><div class="mv">'+fmtPts(lead.pts)+' pts</div></div></div>';
  });
  $('#view').innerHTML=h;
}

/* ---------------- the DPL race (Journey page) ---------------- */
var _raceTO=null;
function raceFrames(){
  var frames=[], cum={};
  state.days.forEach(function(d){
    var dt=dayTotals(d.id);
    for(var pid in dt) cum[pid]=(cum[pid]||0)+dt[pid];
    var field=Object.keys(cum).map(function(pid){ return {pid:pid, pts:cum[pid]}; });
    field.sort(function(a,b){ return b.pts-a.pts; });
    frames.push({day:d, field:field});
  });
  return frames;
}
function raceTierH(rank){ return rank<5?34:(rank<10?24:15); }
function startRace(heroPid){
  var track=document.getElementById('raceTrack');
  if(!track) return;
  var frames=raceFrames();
  var hero=heroPid? pinfo(heroPid):null;
  var debutIdx=-1, peakRank=Infinity, bestDayGain=null;
  if(heroPid){
    var prev=null;
    frames.forEach(function(f, fi){
      f.field.forEach(function(e, rank){
        if(e.pid!==heroPid) return;
        if(debutIdx<0) debutIdx=fi;
        if(rank+1<peakRank) peakRank=rank+1;
        if(prev!==null){ var gain=e.pts-prev; if(bestDayGain===null||gain>bestDayGain.gain) bestDayGain={gain:gain, day:f.day.label}; }
        prev=e.pts;
      });
    });
  }
  var els={};
  state.players.forEach(function(p){
    var el=document.createElement('div');
    el.className='racer t3'+(p.id===heroPid?' hero':'');
    el.style.opacity='0';
    el.innerHTML='<div class="rbar"></div><div class="rname">'+(p.id===heroPid?'⭐ ':'')+esc(p.name)+'<b></b></div>';
    track.appendChild(el);
    els[p.id]=el;
  });
  var idx=0, paused=false;
  var pb=document.getElementById('racePause');
  if(pb) pb.onclick=function(){
    if(paused){
      paused=false; pb.textContent='⏸';
      if(idx<frames.length) _raceTO=setTimeout(step, 1350);
    } else {
      paused=true; pb.textContent='▶';
      if(_raceTO){ clearTimeout(_raceTO); _raceTO=null; }
    }
  };
  function apply(fi){
    var f=frames[fi]; if(!f) return;
    var min=Infinity, max=-Infinity;
    f.field.forEach(function(e){ if(e.pts<min)min=e.pts; if(e.pts>max)max=e.pts; });
    var range=(max-min)||1;
    var y=0, heroRank=-1, heroPts=0;
    f.field.forEach(function(e, rank){
      var el=els[e.pid]; if(!el) return;
      var hh=raceTierH(rank);
      if(e.pid===heroPid) hh+=18;
      var x=4+((e.pts-min)/range)*92;
      el.className='racer '+(rank<5?'t1':(rank<10?'t2':'t3'))+(e.pid===heroPid?' hero':'');
      el.style.opacity=(heroPid&&e.pid!==heroPid)?'0.42':'1';
      el.style.zIndex=(e.pid===heroPid)?5:1;
      el.style.height=hh+'px';
      el.style.transform='translateY('+y+'px)';
      var bar=el.querySelector('.rbar');
      bar.style.width=x+'%';
      bar.className='rbar'+(rank===0?' lead':'');
      var nm=el.querySelector('.rname');
      nm.style.left=x+'%';
      nm.style.transform=(x<30?'translate(5px,-50%)':'translate(-100%,-50%)');
      nm.querySelector('b').textContent=fmtPts(e.pts);
      if(e.pid===heroPid){ heroRank=rank+1; heroPts=e.pts; }
      y+=hh;
    });
    track.style.height=y+'px';
    var dl=document.getElementById('raceDay'); if(dl) dl.textContent=f.day.label;
    var rd=document.getElementById('raceDate'); if(rd) rd.textContent=f.day.note||'';
    var hud=document.getElementById('raceHero');
    if(hud&&hero){
      if(heroRank>0) hud.innerHTML='⭐ '+esc(hero.name)+' &nbsp;·&nbsp; <b>#'+heroRank+'</b> &nbsp;·&nbsp; '+fmtPts(heroPts)+' pts';
      else if(debutIdx>=0) hud.innerHTML='⭐ '+esc(hero.name)+' joins on '+frames[debutIdx].day.label+'…';
    }
  }
  function step(){
    apply(idx);
    if(idx<frames.length-1){
      idx++;
      if(!paused) _raceTO=setTimeout(step, 1350);
    } else {
      var pb2=document.getElementById('racePause');
      if(pb2) pb2.style.display='none';
      var rp=document.getElementById('raceReplay');
      if(rp){ rp.style.display=''; rp.onclick=function(){ var c2=document.getElementById('raceCap'); if(c2) c2.textContent=''; var pb3=document.getElementById('racePause'); if(pb3){ pb3.style.display=''; pb3.textContent='⏸'; } paused=false; idx=0; step(); }; }
    }
  }
  step();
}

function vJourney(heroPid){
  tabbar('#/journey');
  var names=state.players.slice().sort(function(a,b){ return a.name<b.name?-1:(a.name>b.name?1:0); });
  var opts=names.map(function(p){ return '<option value="'+p.id+'">'+esc(p.name)+'</option>'; }).join('');
  var h='<h2>🧭 The Journey</h2>';
  h+='<div class="card jpick" id="jPick"><div class="jpick-q">What\'s your name?</div><div class="jpick-sub">Pick your name and watch your season race.</div><select id="jSel"><option value="">Select your name</option>'+opts+'</select></div>';
  h+='<div id="jStage" style="display:none"><div class="race card"><div class="race-head"><div class="race-day" id="raceDay">Day 1</div><div class="race-date" id="raceDate"></div><button class="race-replay" id="racePause" style="margin-left:auto">⏸</button><button class="race-replay" id="raceReplay" style="display:none;margin-left:8px">↻ Replay</button></div><div class="race-hero" id="raceHero"></div><div class="race-track" id="raceTrack"><div class="race-finish"><span>🏁</span><i>Nov 30</i></div></div><div class="race-cap" id="raceCap"></div><div class="race-change"><button class="race-replay" id="raceChange">👤 Change name</button></div></div></div>';
  $('#view').innerHTML=h;
  var sel=document.getElementById('jSel');
  sel.addEventListener('change', function(){
    if(!sel.value) return;
    document.getElementById('jPick').style.display='none';
    document.getElementById('jStage').style.display='';
    startRace(sel.value);
  });
  document.getElementById('raceChange').addEventListener('click', function(){
    if(_raceTO){ clearTimeout(_raceTO); _raceTO=null; }
    if(location.hash.indexOf('#/journey/')===0) location.hash='#/journey';
    else render();
  });
  if(heroPid && pinfo(heroPid).name!=='?'){
    sel.value=heroPid;
    document.getElementById('jPick').style.display='none';
    document.getElementById('jStage').style.display='';
    startRace(heroPid);
  }
}

function vPlayers(){
  tabbar('#/players');
  var t=overallTotals(), r=ranked(t);
  var h='<h2>👥 Players ('+r.length+')</h2><div class="pgrid">';
  r.forEach(function(e){
    var p=pinfo(e.pid);
    h+='<div class="pcard" onclick="location.hash=\'#/player/'+e.pid+'\'"><div class="em">'+p.emoji+'</div><div class="nm">'+esc(p.name)+'</div><div class="tt">'+esc(p.title)+'</div><div class="sc2 '+cls(e.pts)+'">'+fmtPts(e.pts)+' pts</div><div class="small dim">'+fmtMoney(e.pts)+'</div></div>';
  });
  h+='</div>';
  $('#view').innerHTML=h;
}

function vPlayer(pid){
  tabbar('#/players');
  var strk=0, sgn=0, _ds=state.days.slice().reverse(), _si;
  for(_si=0;_si<_ds.length;_si++){ var _dt=dayTotals(_ds[_si].id); if(_dt[pid]===undefined) break;
    var _s2=_dt[pid]>0?1:(_dt[pid]<0?-1:0); if(_s2===0) break; if(sgn===0) sgn=_s2; if(_s2!==sgn) break; strk++; }
  var streakHtml=strk>=2?'<div class="small" style="margin-top:6px">'+(sgn>0?'🔥 '+strk+'-day green streak':'🧊 '+strk+'-day red streak')+'</div>':'';
  var p=pinfo(pid); if(p.name==='?'){ location.hash='#/players'; return; }
  var s=playerStats(pid);
  var t=overallTotals(), r=ranked(t);
  var orank=r.findIndex(function(e){return e.pid===pid;})+1;
  var _cs=cumSeries(pid);
  var h='<div class="pf-hero"><div class="pf-id"><div class="em">'+p.emoji+'</div><div class="nm">'+esc(p.name)+'</div><div class="tt">'+esc(p.title)+'</div>'+
    '<div style="margin-top:8px"><span class="tag">RANK #'+orank+'</span> <span class="tag">'+fmtMoney(s.total)+'</span></div>'+streakHtml+'</div>'+
    (_cs.length?'<div class="pf-graph">'+sparkSVG(_cs)+'</div>':'')+'</div>';
  h+='<div class="tiles">'+
    tile(s.daysPlayed,'🗓️ Days')+tile(s.crowns,'👑 Crowns')+tile(s.avg,'Avg / game')+
    tile(s.best===null?'—':fmtPts(s.best),'Best game')+tile(s.worst===null?'—':fmtPts(s.worst),'Worst game')+tile(s.dayWins,'🏅 Day wins')+
  '</div>';
  var pat=pinfo(pid).pattern;
  var pp=pinfo(pid);
  if(pp.zelle) h+='<div class="card" onclick="App.copyZelle(\''+esc(pp.zelle)+'\')" style="cursor:pointer"><h3 style="margin-top:0">💳 Zelle Payment</h3><div class="small dim">tap to copy</div><div class="big" style="margin-top:6px">'+esc(pp.zelle)+'</div></div>';
  if(pat) h+='<div class="card"><h3 style="margin-top:0">🔍 The Pattern</h3><div style="font-size:14.5px;line-height:1.6">'+esc(pat)+'</div></div>';
  if(pp.strength||pp.weakness) h+='<div class="card"><h3 style="margin-top:0">💪⚖️ Strength & Weakness</h3><div style="display:flex;gap:12px;flex-wrap:wrap"><div style="flex:1;min-width:200px"><div class="small dim">💪 Strength</div><div style="font-size:14px;line-height:1.55">'+esc(pp.strength||'—')+'</div></div><div style="flex:1;min-width:200px"><div class="small dim">⚖️ Weakness</div><div style="font-size:14px;line-height:1.55">'+esc(pp.weakness||'—')+'</div></div></div></div>';
  h+='<div class="card"><h3 style="margin-top:0">🎴 Table image</h3><div class="row" style="justify-content:space-around;text-align:center">'+
    miniStat('👁️',s.seen,'Saw maal')+miniStat('🙈',s.unseen,'Blind')+miniStat('🀄',s.dublee,'Dublee')+miniStat('🚩',s.foul,'Fouls')+
  '</div></div>';
  var _cum=0, _jp=[];
  state.days.forEach(function(_d){ var _t=dayTotals(_d.id); if(_t[pid]!==undefined){ _cum+=_t[pid]; _jp.push('<span class="tag">'+esc(_d.label)+': <b class="'+cls(_cum)+'">'+fmtPts(_cum)+'</b></span>'); } });
  if(_jp.length>1) h+='<div class="card"><h3 style="margin-top:0">🧭 Season journey</h3><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">'+_jp.join('<span class="dim">→</span>')+'</div><div class="small dim" style="margin-top:6px">Cumulative total after each day played</div></div>';
  h+='<h3>📅 Day by day</h3><div class="card" style="padding:6px 12px"><table class="plain"><tr><th>Day</th><th class="num">Points</th><th class="num">Rank</th><th class="num">Move</th></tr>';
  state.days.forEach(function(d,di){
    var dt=dayTotals(d.id);
    if(dt[pid]===undefined){ h+='<tr><td>'+esc(d.label)+'</td><td class="num dim">—</td><td class="num dim">—</td><td class="num">—</td></tr>'; return; }
    h+='<tr><td>'+esc(d.label)+'</td><td class="num '+cls(dt[pid])+'"><b>'+fmtPts(dt[pid])+'</b></td><td class="num">'+dayRankMap(d.id)[pid]+'</td><td class="num">'+moveArrow(pid,di)+'</td></tr>';
  });
  h+='</table></div>';
  h+='<h3>🃏 Round history</h3>';
  var gs=state.games.filter(function(g){return g.playerIds.indexOf(pid)>=0;}).slice().reverse();
  gs.forEach(function(g){
    var gt=gameTotals(g), gr=ranked(gt), rk=gr.findIndex(function(e){return e.pid===pid;})+1;
    h+='<div class="lb" onclick="location.hash=\'#/game/'+g.id+'\'" style="cursor:pointer"><div class="rank">'+rk+'</div><div class="grow"><div class="nm">'+esc(g.name)+' <span class="small dim">'+esc(dayLabel(g.dayId))+'</span></div><div class="ti2">'+g.rounds.length+' games'+(g.variant==='murder'?' · 🔪 murder':'')+'</div></div><div class="sc"><div class="pv '+cls(gt[pid])+'">'+fmtPts(gt[pid])+'</div><div class="mv">'+fmtMoney(gt[pid])+'</div></div></div>';
  });
  $('#view').innerHTML=h;
}
function tile(v,k){ return '<div class="tile"><div class="v">'+v+'</div><div class="k">'+k+'</div></div>'; }
function miniStat(ic,v,k){ return '<div><div style="font-size:24px">'+ic+'</div><div style="font-weight:800">'+v+'</div><div class="small dim">'+k+'</div></div>'; }
function dayLabel(id){ var d=state.days.find(function(x){return x.id===id;}); return d?d.label:''; }

function roundCell(pts,status,isW){
  return '<b class="'+cls(pts)+'">'+pts+'</b><span class="cell-ic">'+(isW?'👑':'')+ST_ICON[status]+'</span>';
}
function vGame(gid){
  tabbar('#/days');
  var g=state.games.find(function(x){return x.id===gid;});
  if(!g){ location.hash='#/days'; return; }
  var gt=gameTotals(g), r=ranked(gt);
  var h='<h2>'+(g.variant==='murder'?'🔪 ':'🃏 ')+esc(g.name)+' '+(g.variant==='murder'?'<span class="tag murder">MURDER</span>':'<span class="tag">CLASSIC</span>')+'</h2>';
  h+='<div class="small dim" style="margin:-6px 2px 12px">🗓️ '+esc(dayLabel(g.dayId))+' · '+esc(g.date||'')+' · '+g.playerIds.length+' players · '+g.rounds.length+' games</div>';
  if(g.partial) h+='<div class="note">📼 Imported history — only the captured games are shown, but totals are complete.</div>';
  h+='<div class="tscroll"><table class="grid"><thead><tr><th>#</th>'+g.playerIds.map(function(pid){return '<th>'+esc(pname(pid))+'</th>';}).join('')+'</tr></thead><tbody>';
  g.rounds.forEach(function(rd){
    h+='<tr><td class="rn">'+rd.n+'</td>'+g.playerIds.map(function(pid){
      var s=rd.scores[pid]||{pts:0,status:'s'};
      return '<td>'+roundCell(s.pts,s.status,rd.winner===pid)+'</td>';
    }).join('')+'</tr>';
  });
  h+='<tr class="tot"><td class="rn">Σ</td>'+g.playerIds.map(function(pid){return '<td class="'+cls(gt[pid])+'">'+fmtPts(gt[pid])+'</td>';}).join('')+'</tr>';
  h+='<tr class="money"><td class="rn">💰</td>'+g.playerIds.map(function(pid){return '<td>'+fmtMoney(gt[pid])+'</td>';}).join('')+'</tr>';
  h+='</tbody></table></div>';
  h+='<div class="small dim" style="margin:8px 2px">👑 game winner · 👁️ saw maal · 🙈 blind · 🀄 dublee · 🚩 foul</div>';
  h+='<div class="btnrow"><button class="btn ghost" onclick="App.shareGame(\''+gid+'\')">📤 Share round</button></div>';
  $('#view').innerHTML=h;
}

function vTimeline(){
  tabbar('#/timeline');
  var h='<h2>🪔 Season Timeline</h2>';
  var start=new Date(2026,9,2), end=new Date(2026,10,30), now=new Date(); now.setHours(0,0,0,0);
  var total=Math.round((end-start)/864e5)+1, done=Math.min(total,Math.max(1,Math.floor((now-start)/864e5)+1));
  var pct=Math.round(done/total*100);
  h+='<div class="card"><div class="row"><div class="grow"><b>Season progress</b><div class="small dim">Oct 2 → Nov 30 · Day '+done+' of '+total+'</div></div><div class="gold" style="font-size:20px;font-weight:800">'+pct+'%</div></div><div class="prog"><div style="width:'+pct+'%"></div></div><div class="small dim" style="margin-top:6px">'+(total-done)+' days to the grand finale 🏁</div></div>';
  h+='<div class="tl">';
  state.days.forEach(function(d){
    var r=ranked(dayTotals(d.id)), w=r[0]?pinfo(r[0].pid):null;
    h+='<div class="tl-ev" onclick="location.hash=\'#/day/'+d.id+'\'" style="cursor:pointer"><div class="tl-date">'+(d.id==='day3'?'🔪':'🃏')+' '+esc(d.note||d.label)+'</div><div style="font-weight:800;font-size:16px;margin:2px 0">'+esc(d.label)+' — played</div>'+(w?'<div class="small">Winner: '+w.emoji+' <b>'+esc(w.name)+'</b> <span class="pos">'+fmtPts(r[0].pts)+' pts</span></div>':'')+'</div>';
  });
  h+='<div class="tl-ev"><div class="tl-date">🪔 Festival of Lights</div><div style="font-weight:800;font-size:16px;margin:2px 0">Tihar</div><div class="small dim">The league plays on through Dashain, Tihar and Chhath.</div></div>';
  h+='<div class="tl-ev"><div class="tl-date">🎆 Nov 30</div><div style="font-weight:800;font-size:16px;margin:2px 0">Grand Finale</div><div class="small dim">The season ends on November 30. Final standings, one champion. 🏆</div></div>';
  h+='</div><div class="garland">🌼 🌼 🌼</div>';
  $('#view').innerHTML=h;
}
function vStats(){
  tabbar('#/stats');
  var h='<h2>📊 League Stats</h2><div class="small dim" style="margin:-4px 0 12px">Players with more than 75 games played qualify for these titles</div>';
  var agg={};
  state.players.forEach(function(p){ agg[p.id]={crowns:0,seen:0,unseen:0,dublee:0,foul:0,rounds:0,rpts:0,best:null,worst:null,bestGame:null,bestDay:null,streak:0,streakPts:0,runLen:0,runPts:0,lstreak:0,lrunLen:0}; });
  state.games.forEach(function(g){
    var gt=gameTotals(g);
    g.playerIds.forEach(function(pid){
      if(agg[pid].bestGame===null||gt[pid]>agg[pid].bestGame) agg[pid].bestGame=gt[pid];
    });
    g.rounds.forEach(function(r){
      g.playerIds.forEach(function(pid){
        var s=r.scores[pid]; if(!s) return; var a=agg[pid]; var v=+s.pts||0;
        a.rounds++; a.rpts+=v;
        if(r.winner===pid)a.crowns++;
        if(s.status==='s')a.seen++; else if(s.status==='u')a.unseen++; else if(s.status==='d')a.dublee++; else if(s.status==='f')a.foul++;
        if(a.best===null||v>a.best)a.best=v;
        if(a.worst===null||v<a.worst)a.worst=v;
      });
    });
  });
  state.days.forEach(function(d){
    var dt={};
    state.games.forEach(function(g){ if(g.dayId!==d.id) return; var gt=gameTotals(g); for(var pid in gt) dt[pid]=(dt[pid]||0)+gt[pid]; });
    state.players.forEach(function(p){
      var v=dt[p.id]; if(v===undefined) return;
      var a=agg[p.id];
      if(a.bestDay===null||v>a.bestDay) a.bestDay=v;
      if(v>0){ a.runLen++; a.runPts+=v; if(a.runLen>a.streak||(a.runLen===a.streak&&a.runPts>a.streakPts)){ a.streak=a.runLen; a.streakPts=a.runPts; } }
      else { a.runLen=0; a.runPts=0; }
      if(v<0){ a.lrunLen++; if(a.lrunLen>a.lstreak) a.lstreak=a.lrunLen; }
      else { a.lrunLen=0; }
    });
  });
  function qual(pid){ return gamesPlayed(pid)>75; }
  state.players.forEach(function(p){
    var a=agg[p.id];
    a.crownRate=a.rounds? a.crowns/a.rounds : 0;
    a.seenRate=a.rounds? a.seen/a.rounds : 0;
  });
  function top(key){
    var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id][key]};}).filter(function(e){return e.v>0&&qual(e.pid);});
    arr.sort(function(a,b){return b.v-a.v;}); return arr[0];
  }
  function low(key){
    var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id][key]};}).filter(function(e){return e.v!==null&&qual(e.pid);});
    arr.sort(function(a,b){return a.v-b.v;}); return arr[0];
  }
  function avgTop(){
    var arr=state.players.map(function(p){var a=agg[p.id];return {pid:p.id,v:qual(p.id)&&a.rounds?Math.round(a.rpts/a.rounds*10)/10:null};}).filter(function(e){return e.v!==null;});
    arr.sort(function(a,b){return b.v-a.v;}); return arr[0];
  }
  function hi(key){
    var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id][key]};}).filter(function(e){return e.v!==null&&qual(e.pid);});
    arr.sort(function(a,b){return b.v-a.v;}); return arr[0];
  }
  var cardsA=[
    ['🌼 Sayapatri Mala','most games won', top('crowns'), function(e){return e.v+' crowns';}],
    ['👹 Mukut Samrat','games won / games played', top('crownRate'), function(e){return (e.v*100).toFixed(1)+'% win rate';}],
    ['🧲 Maal Magnet','most maal seen', top('seen'), function(e){return e.v+' seen';}],
    ['📅 Best Day','biggest single-day total', hi('bestDay'), function(e){return fmtPts(e.v)+' pts';}],
    ['🏔️ Best Round','biggest single round', hi('bestGame'), function(e){return fmtPts(e.v)+' pts';}],
    ['💥 Dashain Dhamaka','biggest single game', hi('best'), function(e){return fmtPts(e.v)+' pts';}],
    ['🎯 Sharp Shooter','best pts / game', avgTop(), function(e){return fmtPts(e.v)+' / game';}]
  ];
  var cardsB=[
    ['🚩 Foul Machine','most fouls committed', top('foul'), function(e){return e.v+' fouls';}]
  ];
  function renderCard(c){
    if(!c[2]) return; var p=pinfo(c[2].pid);
    h+='<div class="lb" onclick="location.hash=\'#/player/'+p.id+'\'" style="cursor:pointer"><div class="grow"><div class="nm">'+c[0]+'</div><div class="ti2">'+c[1]+'</div></div><div class="sc"><div class="pv gold">'+esc(p.name)+'</div><div class="mv">'+c[3](c[2])+'</div></div></div>';
  }
  cardsA.forEach(renderCard);
  cardsB.forEach(renderCard);
  var maxStreak=0;
  state.players.forEach(function(p){ if(qual(p.id)&&agg[p.id].streak>maxStreak) maxStreak=agg[p.id].streak; });
  if(maxStreak>0){
    var tied=state.players.filter(function(p){return qual(p.id)&&agg[p.id].streak===maxStreak;});
    var ot=overallTotals();
    tied.sort(function(a,b){ return (ot[b.id]||0)-(ot[a.id]||0); });
    var names=tied.map(function(p){return esc(p.name);}).join(' · ');
    h+='<div class="lb" onclick="location.hash=\'#/player/'+tied[0].id+'\'" style="cursor:pointer"><div class="grow"><div class="nm">🌲 The Evergreen</div><div class="ti2">longest run of winning days</div></div><div class="sc"><div class="pv gold" style="font-size:13px">'+names+'</div><div class="mv">'+maxStreak+' days</div></div></div>';
  }
  var maxLose=0;
  state.players.forEach(function(p){ if(qual(p.id)&&agg[p.id].lstreak>maxLose) maxLose=agg[p.id].lstreak; });
  if(maxLose>0){
    var ltied=state.players.filter(function(p){return qual(p.id)&&agg[p.id].lstreak===maxLose;});
    var ot2=overallTotals();
    ltied.sort(function(a,b){ return (ot2[b.id]||0)-(ot2[a.id]||0); });
    var lnames=ltied.map(function(p){return esc(p.name);}).join(' · ');
    h+='<div class="lb" onclick="location.hash=\'#/player/'+ltied[0].id+'\'" style="cursor:pointer"><div class="grow"><div class="nm">🌧️ The Monsoon</div><div class="ti2">longest run of losing days</div></div><div class="sc"><div class="pv gold" style="font-size:13px">'+lnames+'</div><div class="mv">'+maxLose+' days</div></div></div>';
  }
  h+='<div class="garland">🌼 🌼 🌼</div>';
  $('#view').innerHTML=h;
}

/* ---------------- router ---------------- */
function render(){
  if(_raceTO){ clearTimeout(_raceTO); _raceTO=null; }
  var hsh=location.hash||'#/';
  var parts=hsh.replace(/^#\//,'').split('/');
  if(window.scrollTo) try{ window.scrollTo(0,0); }catch(e){}
  if(parts[0]===''||parts[0]==='home') return vHome();
  if(parts[0]==='days') return vDays();
  if(parts[0]==='day') return vDay(parts[1]);
  if(parts[0]==='players') return vPlayers();
  if(parts[0]==='journey') return vJourney(parts[1]);
  if(parts[0]==='player') return vPlayer(parts[1]);
  if(parts[0]==='game') return vGame(parts[1]);
  if(parts[0]==='versus') return vVersus();
  if(parts[0]==='stats') return vStats();
  if(parts[0]==='timeline') return vTimeline();
  return vHome();
}

/* ---------------- music (YouTube loop) ---------------- */
var MUSIC_VIDEO='GI153LgNrig', YT_PLAYER=null, MUSIC_ON=false;

/* Pre-load the YouTube player when the page opens (no autoplay attempt),
   so the FIRST tap on the music button plays instantly inside the tap gesture.
   (iOS blocks play() calls that happen outside a user gesture.) */
function musicInit(){
  var tag=document.createElement('script'); tag.src='https://www.youtube.com/iframe_api';
  var first=document.getElementsByTagName('script')[0]; first.parentNode.insertBefore(tag,first);
  var prev=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=function(){ if(prev)prev(); musicCreatePlayer(); };
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    if(window.YT && window.YT.Player){ clearInterval(iv); musicCreatePlayer(); }
    else if(tries>30){ clearInterval(iv); }
  },500);
}
function musicCreatePlayer(){
  if(YT_PLAYER || !(window.YT && window.YT.Player)) return;
  if(!document.getElementById('ytPlayer')) return;
  YT_PLAYER=new YT.Player('ytPlayer',{
    height:'1', width:'1', videoId:MUSIC_VIDEO,
    playerVars:{autoplay:0, loop:1, playlist:MUSIC_VIDEO, rel:0},
    events:{
      onStateChange:function(e){
        if(e.data===YT.PlayerState.PLAYING){ MUSIC_ON=true; setMusicBtn(); startFX(); }
        else if(e.data===YT.PlayerState.PAUSED || e.data===YT.PlayerState.CUED){ MUSIC_ON=false; setMusicBtn(); stopFX(); }
        else if(e.data===YT.PlayerState.ENDED){ e.target.playVideo(); } /* loop backup */
      }
    }
  });
}
function setMusicBtn(){
  var b=document.getElementById('musicBtn'); if(!b)return;
  if(MUSIC_ON){ b.innerHTML='<img src="icons/singer.jpg?v=1" alt="Sugam Pokharel — playing">'; b.classList.add('playing'); }
  else { b.textContent='🎵'; b.classList.remove('playing'); }
}

/* ---------------- Dashain atmosphere FX (while music plays) ---------------- */
var FX_CV=null, FX_CTX=null, FX_RAF=null, FX_LAST=0;
var FX_LEAVES=[], FX_WINDS=[], FX_WIND_T=0;
var LEAF_COLORS=['#d84315','#e65100','#ef6c00','#f9a825','#c62828','#8d6e00','#ff8f00','#a83232'];

function fxSetup(){
  if(FX_CV) return;
  FX_CV=document.createElement('canvas'); FX_CV.id='leafCanvas';
  document.body.appendChild(FX_CV); fxResize();
  window.addEventListener('resize', fxResize);
}
function fxResize(){ if(!FX_CV)return; FX_CV.width=window.innerWidth; FX_CV.height=window.innerHeight; FX_CTX=FX_CV.getContext('2d'); }

/* ---- realistic tumbling leaves ---- */
function spawnLeaf(){
  var w=FX_CV.width;
  FX_LEAVES.push({ x:Math.random()*w, y:-26, s:7+Math.random()*11,
    vy:45+Math.random()*80, sway:25+Math.random()*50, ph:Math.random()*6.28,
    sp:0.9+Math.random()*1.8, rot:Math.random()*6.28, fl:2+Math.random()*3, flp:Math.random()*6.28,
    c:LEAF_COLORS[(Math.random()*LEAF_COLORS.length)|0], a:0.55+Math.random()*0.4 });
}
function drawLeaf(l, t){
  var ctx=FX_CTX, s=l.s;
  ctx.save(); ctx.translate(l.x,l.y);
  var flutter=Math.sin(t*l.fl+l.flp);
  ctx.rotate(l.rot+flutter*0.5);
  ctx.scale(1, 0.55+0.45*Math.abs(Math.cos(t*l.fl*0.7+l.flp)));
  ctx.globalAlpha=l.a; ctx.fillStyle=l.c;
  ctx.beginPath();
  ctx.moveTo(0,-s);
  ctx.bezierCurveTo(s*0.62,-s*0.45, s*0.62,s*0.45, 0,s);
  ctx.bezierCurveTo(-s*0.62,s*0.45, -s*0.62,-s*0.45, 0,-s);
  ctx.fill();
  ctx.strokeStyle='rgba(120,50,0,.45)'; ctx.lineWidth=Math.max(1,s*0.09);
  ctx.beginPath(); ctx.moveTo(0,s); ctx.quadraticCurveTo(s*0.12,s*1.25, s*0.28,s*1.45); ctx.stroke();
  ctx.strokeStyle='rgba(255,240,200,.35)'; ctx.lineWidth=Math.max(1,s*0.06);
  ctx.beginPath(); ctx.moveTo(0,-s*0.85); ctx.lineTo(0,s*0.85); ctx.stroke();
  ctx.restore();
}

/* ---- subtle wind sketches ---- */
function spawnWind(){
  var w=FX_CV.width, h=FX_CV.height;
  FX_WINDS.push({ x:-160, y:h*(0.15+Math.random()*0.6), len:90+Math.random()*140,
    sp:130+Math.random()*110, max:0.06+Math.random()*0.05, life:0 });
}
function drawWind(wd, dt){
  var ctx=FX_CTX;
  wd.life+=dt; wd.x+=wd.sp*dt;
  var fade=Math.min(1, wd.life/1.2);
  var out=wd.x>FX_CV.width+80 ? Math.max(0, 1-(wd.x-FX_CV.width-80)/160) : 1;
  var a=wd.max*Math.min(fade,out);
  if(out<=0) return false;
  ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.6; ctx.lineCap='round';
  for(var k=0;k<3;k++){
    var yy=wd.y+k*13, xx=wd.x-k*22;
    ctx.beginPath(); ctx.moveTo(xx,yy);
    ctx.quadraticCurveTo(xx+wd.len*0.4, yy-14, xx+wd.len*0.8, yy+4);
    ctx.quadraticCurveTo(xx+wd.len, yy+10, xx+wd.len*1.15, yy+2);
    ctx.stroke();
  }
  ctx.restore();
  return true;
}

/* ---- main loop ---- */
function fxTick(ts){
  if(!FX_LAST) FX_LAST=ts;
  var dt=Math.min(0.05,(ts-FX_LAST)/1000); FX_LAST=ts;
  var w=FX_CV.width, h=FX_CV.height, t=ts/1000;
  var wind=Math.sin(t*0.5)*30+Math.sin(t*0.13)*22;
  FX_CTX.clearRect(0,0,w,h);
  if(FX_LEAVES.length<22 && Math.random()<0.35) spawnLeaf();
  for(var i=FX_LEAVES.length-1;i>=0;i--){
    var l=FX_LEAVES[i];
    l.y+=l.vy*dt; l.ph+=l.sp*dt; l.rot+=Math.sin(t*1.3+l.flp)*0.8*dt;
    l.x+=(Math.sin(l.ph)*l.sway+wind)*dt;
    if(l.y>h+30||l.x<-60||l.x>w+60){ FX_LEAVES.splice(i,1); continue; }
    drawLeaf(l,t);
  }
  FX_WIND_T-=dt;
  if(FX_WIND_T<=0){ spawnWind(); FX_WIND_T=5+Math.random()*5; }
  for(var j=FX_WINDS.length-1;j>=0;j--){ if(!drawWind(FX_WINDS[j],dt)) FX_WINDS.splice(j,1); }
  FX_RAF=requestAnimationFrame(fxTick);
}
function startFX(){
  fxSetup();
  if(!FX_RAF){ FX_LAST=0; FX_WIND_T=1; FX_RAF=requestAnimationFrame(fxTick); }
}
function stopFX(){
  if(FX_RAF){ cancelAnimationFrame(FX_RAF); FX_RAF=null; }
  FX_LEAVES=[]; FX_WINDS=[];
  if(FX_CTX&&FX_CV) FX_CTX.clearRect(0,0,FX_CV.width,FX_CV.height);
}

function toggleMusic(){
  if(!YT_PLAYER){ toast('Music is still loading… tap again in a second'); return; }
  if(MUSIC_ON){ YT_PLAYER.pauseVideo(); toast('Music paused'); }
  else { YT_PLAYER.playVideo(); toast('\uD83C\uDFB6 Dashain Tihar on loop'); }
}

/* ---------------- versus: 2-player head-to-head ---------------- */
var vsSel=[];
function hhData(a,b){
  var d={a:a,b:b,games:[],gwA:0,gwB:0,gt:0,ptsA:0,ptsB:0,rounds:0,rwA:0,rwB:0,rt:0,crA:0,crB:0,bestA:-1e9,bestB:-1e9};
  state.games.forEach(function(g){
    if(g.playerIds.indexOf(a)<0||g.playerIds.indexOf(b)<0) return;
    var ta=g.totals[a]||0, tb=g.totals[b]||0;
    d.games.push({g:g,ta:ta,tb:tb});
    d.ptsA+=ta; d.ptsB+=tb;
    if(ta>tb) d.gwA++; else if(tb>ta) d.gwB++; else d.gt++;
    if(ta>d.bestA) d.bestA=ta; if(tb>d.bestB) d.bestB=tb;
    g.rounds.forEach(function(r){
      var sa=r.scores[a], sb=r.scores[b]; if(!sa||!sb) return;
      d.rounds++;
      if(sa.pts>sb.pts) d.rwA++; else if(sb.pts>sa.pts) d.rwB++; else d.rt++;
      if(r.winner===a) d.crA++; else if(r.winner===b) d.crB++;
    });
  });
  return d;
}
function hhStreak(d){
  var s=0, who=null;
  for(var i=d.games.length-1;i>=0;i--){
    var w=d.games[i].ta>d.games[i].tb?'A':(d.games[i].tb>d.games[i].ta?'B':'T');
    if(w==='T') break;
    if(who===null) who=w;
    if(w!==who) break;
    s++;
  }
  return {n:s, who:who};
}
function tapeRow(label, va, vb, fmt){
  fmt=fmt||function(x){return x;};
  var ca=va>vb?'font-weight:800;color:var(--gold,#d4a017)':'';
  var cb=vb>va?'font-weight:800;color:var(--gold,#d4a017)':'';
  return '<div class="row" style="padding:7px 2px;border-bottom:1px solid rgba(128,0,0,.08)">'+
    '<div style="flex:1;text-align:left;'+ca+'">'+fmt(va)+'</div>'+
    '<div class="small dim" style="flex:1.4;text-align:center">'+label+'</div>'+
    '<div style="flex:1;text-align:right;'+cb+'">'+fmt(vb)+'</div></div>';
}
function vsH2HHtml(a,b){
  var d=hhData(a,b), pa=pinfo(a), pb=pinfo(b), h='';
  if(!d.games.length){
    return '<div class="card" style="text-align:center;padding:22px"><div style="font-size:34px;margin-bottom:8px">🪑</div>'+
      '<div style="font-weight:800">'+esc(pa.name)+' & '+esc(pb.name)+'</div>'+
      '<div class="small dim">have never shared a table.</div></div>';
  }
  var st=hhStreak(d);
  /* tale of the tape */
  h+='<div class="card" style="margin-bottom:10px"><div class="row" style="margin-bottom:6px">'+
    '<div style="flex:1;text-align:center"><div class="avatar" style="font-size:34px">'+pa.emoji+'</div><div class="nm">'+esc(pa.name)+'</div><div class="ti2">'+esc(pa.title)+'</div></div>'+
    '<div style="flex:1;text-align:center;align-self:center"><div style="font-size:26px;font-weight:800">'+d.gwA+' <span class="dim">–</span> '+d.gwB+'</div><div class="small dim">rounds won head-to-head</div></div>'+
    '<div style="flex:1;text-align:center"><div class="avatar" style="font-size:34px">'+pb.emoji+'</div><div class="nm">'+esc(pb.name)+'</div><div class="ti2">'+esc(pb.title)+'</div></div></div>';
  h+=tapeRow('Rounds together', d.games.length, d.games.length, function(x){return '<b>'+x+'</b>';});
  h+=tapeRow('Win %', d.gwA/d.games.length*100, d.gwB/d.games.length*100, function(x){return x.toFixed(0)+'%';});
  h+=tapeRow('Total points', d.ptsA, d.ptsB, fmtPts);
  h+=tapeRow('Pts / round', d.ptsA/d.games.length, d.ptsB/d.games.length, function(x){return fmtPts(Math.round(x));});
  h+=tapeRow('Games won', d.rwA, d.rwB);
  h+=tapeRow('Crowns 👑', d.crA, d.crB);
  h+=tapeRow('Best round', d.bestA, d.bestB, fmtPts);
  h+=tapeRow('Streak', st.who==='A'?st.n+'W':'—', st.who==='B'?st.n+'W':'—');
  h+='</div>';
  /* game by game */
  h+='<h3>🃏 Every round together <span class="dim small">('+d.games.length+')</span></h3>';
  d.games.slice().reverse().forEach(function(e){
    var w=e.ta>e.tb?a:(e.tb>e.ta?b:null);
    h+='<div class="lb"><div class="avatar">'+(w?a==w?pa.emoji:pb.emoji:'🤝')+'</div>'+
      '<div class="grow"><div class="nm">'+esc(e.g.name)+'</div><div class="ti2">'+esc(dayLabel(e.g.dayId))+'</div></div>'+
      '<div style="text-align:right"><span class="'+(e.ta>=e.tb?'pos':'neg')+'" style="font-weight:700">'+fmtPts(e.ta)+'</span>'+
      '<span class="dim"> – </span><span class="'+(e.tb>=e.ta?'pos':'neg')+'" style="font-weight:700">'+fmtPts(e.tb)+'</span>'+
      '<div class="ti2">'+esc(pa.name)+' – '+esc(pb.name)+'</div></div></div>';
  });
  return h;
}
function vVersus(){
  tabbar('#/versus');
  var h='<h2>⚔️ Head to Head</h2>';
  h+='<div class="small dim" style="margin-bottom:10px">Pick <b>2 players</b>. Their record from every round they played <b>together</b>.</div>';
  h+='<div class="chips" style="flex-wrap:wrap;overflow:visible;margin-bottom:12px">';
  ranked(overallTotals()).forEach(function(e){
    var pl=pinfo(e.pid);
    var on=vsSel.indexOf(pl.id)>=0;
    h+='<button class="chip'+(on?' on':'')+'" onclick="App.vsToggle(\''+pl.id+'\')">'+pl.emoji+' '+esc(pl.name)+'</button>';
  });
  h+='</div>';
  if(vsSel.length===2) h+=vsH2HHtml(vsSel[0], vsSel[1]);
  else if(vsSel.length===1) h+='<div class="small dim">Pick one more player to compare.</div>';
  if(vsSel.length) h+='<div style="margin-top:8px"><button class="btn ghost sm" onclick="App.vsClear()">Clear</button></div>';
  $('#view').innerHTML=h;
}

/* ---------------- App API ---------------- */
var App={
go:function(r){ location.hash=r; },
toggleMusic:function(){ toggleMusic(); },
shareStandings:function(){ shareText(standingsText()); },
vsToggle:function(pid){
  var i=vsSel.indexOf(pid);
  if(i>=0) vsSel.splice(i,1);
  else { if(vsSel.length>=2){ toast('Only 2 players — head to head'); return; } vsSel.push(pid); }
  vVersus();
},
vsClear:function(){ vsSel=[]; vVersus(); },
togglePaid:function(k, el){
  var m=paidMap();
  if(m[k]) delete m[k]; else m[k]=1;
  try{ localStorage.setItem('dpl_paid_v1', JSON.stringify(m)); }catch(e){}
  var on=!!m[k];
  if(el){ el.className='paidbtn'+(on?' on':''); el.textContent=on?'\u2713 Settled':'Unsettled'; }
},
copyZelleFor:function(pid){
  var p=state.players.find(function(x){return x.id===pid;});
  if(p&&p.zelle) App.copyZelle(p.zelle); else toast('No Zelle info for this player');
},
copyZelle:function(z){
  function done(){ toast('Copied — paste it in your bank app 💳'); }
  if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(z).then(done,function(){ toast('Copy failed — long-press to copy'); }); }
  else { var ta=document.createElement('textarea'); ta.value=z; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); done(); }catch(e){ toast('Copy failed — long-press to copy'); } ta.remove(); }
},
shareGame:function(gid){
  var g=state.games.find(function(x){return x.id===gid;}); if(!g)return;
  var gt=gameTotals(g), r=ranked(gt), L=['🃏 DPL — '+g.name+' ('+dayLabel(g.dayId)+')'];
  r.forEach(function(e,i){ L.push((i+1)+'. '+pname(e.pid)+'  '+fmtPts(e.pts)+' ('+fmtMoney(e.pts)+')'); });
  shareText(L.join('\n'));
}
};
window.App=App;

/* ---------------- init ---------------- */
window.addEventListener('hashchange', render);
document.addEventListener('DOMContentLoaded', function(){ render(); musicInit(); });
})();
