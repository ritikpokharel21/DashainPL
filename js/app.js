/* ============================================================
   Dashain Premier League — standings webpage
   Static data (js/seed.js) · no login · updated from screenshots
   ============================================================ */
(function(){
'use strict';
var PT_RATE = 0.1; // $ per point

/* ---------------- utils ---------------- */
function $(s, r){ return (r||document).querySelector(s); }
function esc(s){ var d=document.createElement('div'); d.textContent=(s==null?'':s); return d.innerHTML; }
function fmtPts(n){ n=Math.round(n*10)/10; return (n>0?'+':'')+n; }
function fmtMoney(pts){ var d=Math.round(pts*PT_RATE*100)/100; return (d>=0?'+$':'−$')+Math.abs(d).toFixed(2); }
function cls(n){ return n>0?'pos':(n<0?'neg':''); }
function toast(msg){ var t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(function(){ t.remove(); },2600); }
var ST_ICON = {s:'👁️', u:'🙈', d:'🀄', f:'🚩'};

/* ---------------- store (static seed) ---------------- */
function seedState(){
  var st = {players:[], days:[], games:[]};
  var S = window.DPL_SEED;
  st.meta = S.meta || {};
  st.players = S.players.map(function(p){ return {id:p.id,name:p.name,title:p.title,emoji:p.emoji}; });
  st.days = S.days.map(function(d){ return {id:d.id,label:d.label,date:d.date,note:d.note||''}; });
  st.games = S.games.map(function(g){
    return {
      id:g.id, dayId:g.dayId, name:g.name, variant:g.variant||'classic',
      date:g.date, partial:!!g.partial, playerIds:g.playerIds.slice(),
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
function overallTotals(){
  var t={};
  state.games.forEach(function(g){ var gt=gameTotals(g); for(var pid in gt) t[pid]=(t[pid]||0)+gt[pid]; });
  return t;
}
function ranked(totals){
  return Object.keys(totals).map(function(pid){ return {pid:pid, pts:totals[pid]}; })
    .sort(function(a,b){ return b.pts-a.pts; });
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
  return s;
}
function settlePlan(totals){
  var cred=[], debt=[];
  for(var pid in totals){ var c=Math.round(totals[pid]*PT_RATE*100)/100;
    if(c>0.004) cred.push({pid:pid,amt:c}); else if(c<-0.004) debt.push({pid:pid,amt:-c}); }
  cred.sort(function(a,b){return b.amt-a.amt;}); debt.sort(function(a,b){return b.amt-a.amt;});
  var tx=[],i=0,j=0;
  while(i<debt.length&&j<cred.length){
    var a=Math.min(debt[i].amt,cred[j].amt);
    a=Math.round(a*100)/100;
    tx.push({from:debt[i].pid,to:cred[j].pid,amt:a});
    debt[i].amt=Math.round((debt[i].amt-a)*100)/100;
    cred[j].amt=Math.round((cred[j].amt-a)*100)/100;
    if(debt[i].amt<0.005)i++; if(cred[j].amt<0.005)j++;
  }
  return tx;
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
    {r:'#/stats', i:'📊', l:'Stats'},
    {r:'#/settle/all', i:'💸', l:'Settle'}
  ];
  $('#tabbar').innerHTML = tabs.map(function(t){
    var on = (t.r==='#/' && (active==='#/'||active==='#/home')) || (t.r!=='#/' && active.indexOf(t.r)===0);
    return '<button class="tab'+(on?' on':'')+'" onclick="location.hash=\''+t.r+'\'"><span class="ti">'+t.i+'</span><span>'+t.l+'</span></button>';
  }).join('');
}
function lbRow(e, i, mv, clickable){
  var p=pinfo(e.pid);
  var click = clickable===false ? '' : ' onclick="location.hash=\'#/player/'+e.pid+'\'" style="cursor:pointer"';
  return '<div class="lb'+(e.pid==='p_ritik'?' me':'')+'"'+click+'>'+
    '<div class="rank r'+(i+1)+'">'+(i+1)+'</div>'+
    '<div class="avatar">'+p.emoji+'</div>'+
    '<div class="grow"><div class="nm">'+esc(p.name)+'</div><div class="ti2">'+esc(p.title)+'</div></div>'+
    '<div class="sc"><div class="pv '+cls(e.pts)+'">'+fmtPts(e.pts)+'</div><div class="mv">'+fmtMoney(e.pts)+' '+(mv||'')+'</div></div>'+
  '</div>';
}

function vHome(){
  tabbar('#/');
  var t=overallTotals(), r=ranked(t);
  var pot=r.filter(function(e){return e.pts>0;}).reduce(function(a,e){return a+e.pts;},0);
  var lead=r[0]?pinfo(r[0].pid):null;
  var h='<div class="hero"><div class="kicker">🪁 Season Standings · Cumulative</div>';
  if(lead){ h+='<div class="big">'+lead.emoji+' '+esc(lead.name)+'</div><div class="mut">'+esc(lead.title)+' · <b class="'+cls(r[0].pts)+'">'+fmtPts(r[0].pts)+' pts</b> ('+fmtMoney(r[0].pts)+')</div>'; }
  h+='<div class="small mut" style="margin-top:8px">💰 Total money in play: <b class="gold">'+fmtMoney(pot)+'</b> · '+state.games.length+' games · '+state.days.length+' days</div></div>';
  h+='<div class="btnrow"><button class="btn ghost" onclick="App.shareStandings()">📤 Share standings</button></div>';
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
    h+=lbRow(e,i,mv);
  });
  h+='<div class="garland">🌼 🌼 🌼</div><div class="card small mut center">Each point = $0.10 · Tap a player for full stats &amp; history<br>Updated '+esc(state.meta.updated||'')+'</div>';
  $('#view').innerHTML=h;
}

function vDays(){
  tabbar('#/days');
  var h='<h2>📅 Days</h2>';
  state.days.forEach(function(d){
    var t=dayTotals(d.id), r=ranked(t), g=dayGames(d.id);
    var lead=r[0];
    h+='<div class="card" onclick="location.hash=\'#/day/'+d.id+'\'" style="cursor:pointer">'+
      '<div class="row"><div class="grow"><div style="font-weight:800;font-size:17px">🗓️ '+esc(d.label)+'</div><div class="small dim">'+esc(d.note||d.date)+' · '+g.length+' games</div></div>'+
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
  h+='<h3>Games ('+g.length+')</h3>';
  g.forEach(function(gm){
    var gt=gameTotals(gm), gr=ranked(gt), lead=gr[0];
    h+='<div class="lb" onclick="location.hash=\'#/game/'+gm.id+'\'" style="cursor:pointer">'+
      '<div class="avatar">'+(gm.variant==='murder'?'🔪':'🃏')+'</div>'+
      '<div class="grow"><div class="nm">'+esc(gm.name)+' '+(gm.variant==='murder'?'<span class="tag murder">MURDER</span>':'')+'</div><div class="ti2">'+gm.playerIds.length+' players · '+gm.rounds.length+' rounds'+(gm.partial?' · partial history':'')+'</div></div>'+
      '<div class="sc"><div class="pv pos">'+esc(pname(lead.pid))+'</div><div class="mv">'+fmtPts(lead.pts)+' pts</div></div></div>';
  });
  h+='<div class="btnrow"><button class="btn ghost" onclick="location.hash=\'#/settle/'+id+'\'">💸 Settle '+esc(d.label)+'</button></div>';
  $('#view').innerHTML=h;
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
  var p=pinfo(pid); if(p.name==='?'){ location.hash='#/players'; return; }
  var s=playerStats(pid);
  var t=overallTotals(), r=ranked(t);
  var orank=r.findIndex(function(e){return e.pid===pid;})+1;
  var h='<div class="pf-hero"><div class="em">'+p.emoji+'</div><div class="nm">'+esc(p.name)+'</div><div class="tt">'+esc(p.title)+'</div>'+
    '<div style="margin-top:8px"><span class="tag">RANK #'+orank+'</span> <span class="tag">'+fmtPts(s.total)+' PTS</span> <span class="tag">'+fmtMoney(s.total)+'</span></div></div>';
  h+='<div class="tiles">'+
    tile(s.games,'Games')+tile(s.rounds,'Rounds')+tile(s.crowns,'👑 Crowns')+
    tile(s.avg,'Avg / round')+tile(s.best===null?'—':fmtPts(s.best),'Best round')+tile(s.worst===null?'—':fmtPts(s.worst),'Worst round')+
  '</div>';
  h+='<div class="card"><h3 style="margin-top:0">🎴 Table image</h3><div class="row" style="justify-content:space-around;text-align:center">'+
    miniStat('👁️',s.seen,'Saw maal')+miniStat('🙈',s.unseen,'Blind')+miniStat('🀄',s.dublee,'Dublee')+miniStat('🚩',s.foul,'Fouls')+
  '</div></div>';
  h+='<h3>📅 Day by day</h3><div class="card" style="padding:6px 12px"><table class="plain"><tr><th>Day</th><th class="num">Points</th><th class="num">Rank</th><th class="num">Move</th></tr>';
  state.days.forEach(function(d,di){
    var dt=dayTotals(d.id);
    if(dt[pid]===undefined){ h+='<tr><td>'+esc(d.label)+'</td><td class="num dim">—</td><td class="num dim">—</td><td class="num">—</td></tr>'; return; }
    h+='<tr><td>'+esc(d.label)+'</td><td class="num '+cls(dt[pid])+'"><b>'+fmtPts(dt[pid])+'</b></td><td class="num">'+dayRankMap(d.id)[pid]+'</td><td class="num">'+moveArrow(pid,di)+'</td></tr>';
  });
  h+='</table></div>';
  h+='<h3>🃏 Game history</h3>';
  var gs=state.games.filter(function(g){return g.playerIds.indexOf(pid)>=0;}).slice().reverse();
  gs.forEach(function(g){
    var gt=gameTotals(g), gr=ranked(gt), rk=gr.findIndex(function(e){return e.pid===pid;})+1;
    h+='<div class="lb" onclick="location.hash=\'#/game/'+g.id+'\'" style="cursor:pointer"><div class="rank">'+rk+'</div><div class="grow"><div class="nm">'+esc(g.name)+' <span class="small dim">'+esc(dayLabel(g.dayId))+'</span></div><div class="ti2">'+g.rounds.length+' rounds'+(g.variant==='murder'?' · 🔪 murder':'')+'</div></div><div class="sc"><div class="pv '+cls(gt[pid])+'">'+fmtPts(gt[pid])+'</div><div class="mv">'+fmtMoney(gt[pid])+'</div></div></div>';
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
  h+='<div class="small dim" style="margin:-6px 2px 12px">🗓️ '+esc(dayLabel(g.dayId))+' · '+esc(g.date||'')+' · '+g.playerIds.length+' players · '+g.rounds.length+' rounds</div>';
  if(g.partial) h+='<div class="note">📼 Imported history — only the captured rounds are shown, but totals are complete.</div>';
  h+='<div class="tscroll"><table class="grid"><thead><tr><th>#</th>'+g.playerIds.map(function(pid){return '<th>'+esc(pname(pid))+'</th>';}).join('')+'</tr></thead><tbody>';
  g.rounds.forEach(function(rd){
    h+='<tr><td class="rn">'+rd.n+'</td>'+g.playerIds.map(function(pid){
      var s=rd.scores[pid]||{pts:0,status:'s'};
      return '<td>'+roundCell(s.pts,s.status,rd.winner===pid)+'</td>';
    }).join('')+'</tr>';
  });
  h+='<tr class="tot"><td class="rn">Σ</td>'+g.playerIds.map(function(pid){return '<td class="'+cls(gt[pid])+'">'+fmtPts(gt[pid])+'</td>';}).join('')+'</tr>';
  h+='<tr class="money"><td class="rn">$</td>'+g.playerIds.map(function(pid){return '<td>'+fmtMoney(gt[pid])+'</td>';}).join('')+'</tr>';
  h+='</tbody></table></div>';
  h+='<div class="small dim" style="margin:8px 2px">👑 round winner · 👁️ saw maal · 🙈 blind · 🀄 dublee · 🚩 foul</div>';
  h+='<div class="btnrow"><button class="btn ghost" onclick="App.shareGame(\''+gid+'\')">📤 Share game</button></div>';
  $('#view').innerHTML=h;
}

function vSettle(dayId){
  tabbar('#/settle/all');
  var totals, label;
  if(dayId==='all'){ totals=overallTotals(); label='Season (cumulative)'; }
  else{ var d=state.days.find(function(x){return x.id===dayId;}); if(!d){location.hash='#/days';return;} totals=dayTotals(dayId); label=d.label; }
  var r=ranked(totals), tx=settlePlan(totals);
  var h='<h2>💸 Settle — '+esc(label)+'</h2>';
  h+='<div class="card"><h3 style="margin-top:0">Winners (receive) 🏆</h3>';
  var win=r.filter(function(e){return e.pts>0;}), lose=r.filter(function(e){return e.pts<0;}).reverse();
  if(!win.length) h+='<div class="small dim">Nobody won — settle nothing. Play more! 🃏</div>';
  win.forEach(function(e){ var p=pinfo(e.pid); h+='<div class="kv"><span>'+p.emoji+' '+esc(p.name)+'</span><b class="pos">'+fmtMoney(e.pts)+'</b></div>'; });
  h+='<h3>Payers 💳</h3>';
  if(!lose.length) h+='<div class="small dim">No payers.</div>';
  lose.forEach(function(e){ var p=pinfo(e.pid); h+='<div class="kv"><span>'+p.emoji+' '+esc(p.name)+'</span><b class="neg">'+fmtMoney(e.pts)+'</b></div>'; });
  h+='</div>';
  if(tx.length){ h+='<h3>🤝 Pay this way (fewest transfers)</h3><div class="card">';
    tx.forEach(function(t){ h+='<div class="kv"><span>'+pinfo(t.from).emoji+' '+esc(pname(t.from))+' → '+pinfo(t.to).emoji+' '+esc(pname(t.to))+'</span><b class="gold">$'+t.amt.toFixed(2)+'</b></div>'; });
    h+='</div>';
  }
  h+='<div class="btnrow"><button class="btn ghost" onclick="App.shareSettle(\''+dayId+'\')">📤 Share settlement</button></div>';
  $('#view').innerHTML=h;
}

function vStats(){
  tabbar('#/stats');
  var h='<h2>📊 League Stats</h2>';
  var agg={};
  state.players.forEach(function(p){ agg[p.id]={crowns:0,seen:0,unseen:0,dublee:0,foul:0,rounds:0,rpts:0,best:null,worst:null,bestGame:null}; });
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
  function top(key){
    var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id][key]};}).filter(function(e){return e.v>0;});
    arr.sort(function(a,b){return b.v-a.v;}); return arr[0];
  }
  function low(key){
    var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id][key]};}).filter(function(e){return e.v!==null;});
    arr.sort(function(a,b){return a.v-b.v;}); return arr[0];
  }
  function avgTop(){
    var arr=state.players.map(function(p){var a=agg[p.id];return {pid:p.id,v:a.rounds>=10?Math.round(a.rpts/a.rounds*10)/10:null};}).filter(function(e){return e.v!==null;});
    arr.sort(function(a,b){return b.v-a.v;}); return arr[0];
  }
  var cards=[
    ['👑 Crown Collector','most rounds won', top('crowns'), function(e){return e.v+' crowns';}],
    ['👁️ Maal Seer','saw maal the most', top('seen'), function(e){return e.v+' times';}],
    ['🙈 Blind Faith','could not see maal', top('unseen'), function(e){return e.v+' times';}],
    ['🀄 Dublee Dealer','most 7-pair shows', top('dublee'), function(e){return e.v+' dublees';}],
    ['🚩 Foul Machine','most fouls', top('foul'), function(e){return e.v+' fouls';}],
    ['🚀 Biggest Round','single round high', low('best')&&(function(){var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id].best};}).filter(function(e){return e.v!==null;});arr.sort(function(a,b){return b.v-a.v;});return arr[0];})(), function(e){return fmtPts(e.v)+' pts';}],
    ['🕳️ Deepest Hole','single round low', low('worst'), function(e){return fmtPts(e.v)+' pts';}],
    ['⚡ Best Average','pts / round (10+ rounds)', avgTop(), function(e){return fmtPts(e.v)+' / round';}],
    ['💰 Biggest Game','best single game', (function(){var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id].bestGame};}).filter(function(e){return e.v!==null;});arr.sort(function(a,b){return b.v-a.v;});return arr[0];})(), function(e){return fmtPts(e.v)+' pts';}]
  ];
  cards.forEach(function(c){
    if(!c[2]) return; var p=pinfo(c[2].pid);
    h+='<div class="lb" onclick="location.hash=\'#/player/'+p.id+'\'" style="cursor:pointer"><div class="avatar">'+p.emoji+'</div><div class="grow"><div class="nm">'+c[0]+'</div><div class="ti2">'+c[1]+'</div></div><div class="sc"><div class="pv gold">'+esc(p.name)+'</div><div class="mv">'+c[3](c[2])+'</div></div></div>';
  });
  h+='<div class="garland">🌼 🌼 🌼</div>';
  $('#view').innerHTML=h;
}

/* ---------------- router ---------------- */
function render(){
  var hsh=location.hash||'#/';
  var parts=hsh.replace(/^#\//,'').split('/');
  if(window.scrollTo) try{ window.scrollTo(0,0); }catch(e){}
  if(parts[0]===''||parts[0]==='home') return vHome();
  if(parts[0]==='days') return vDays();
  if(parts[0]==='day') return vDay(parts[1]);
  if(parts[0]==='players') return vPlayers();
  if(parts[0]==='player') return vPlayer(parts[1]);
  if(parts[0]==='game') return vGame(parts[1]);
  if(parts[0]==='stats') return vStats();
  if(parts[0]==='settle') return vSettle(parts[1]);
  return vHome();
}

/* ---------------- App API ---------------- */
var App={
go:function(r){ location.hash=r; },
shareStandings:function(){ shareText(standingsText()); },
shareGame:function(gid){
  var g=state.games.find(function(x){return x.id===gid;}); if(!g)return;
  var gt=gameTotals(g), r=ranked(gt), L=['🃏 DPL — '+g.name+' ('+dayLabel(g.dayId)+')'];
  r.forEach(function(e,i){ L.push((i+1)+'. '+pname(e.pid)+'  '+fmtPts(e.pts)+' ('+fmtMoney(e.pts)+')'); });
  shareText(L.join('\n'));
},
shareSettle:function(dayId){
  var totals,label;
  if(dayId==='all'){ totals=overallTotals(); label='Season (cumulative)'; }
  else{ totals=dayTotals(dayId); label=dayLabel(dayId); }
  var tx=settlePlan(totals), L=['💸 DPL Settlement — '+label];
  tx.forEach(function(t){ L.push(pname(t.from)+' → '+pname(t.to)+': $'+t.amt.toFixed(2)); });
  if(!tx.length) L.push('Nothing to settle 🎉');
  shareText(L.join('\n'));
}
};
window.App=App;

/* ---------------- init ---------------- */
window.addEventListener('hashchange', render);
document.addEventListener('DOMContentLoaded', function(){ render(); });
})();
