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
  st.players = S.players.map(function(p){ return {id:p.id,name:p.name,title:p.title,emoji:p.emoji,pattern:p.pattern||'',strength:p.strength||'',weakness:p.weakness||''}; });
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
    {r:'#/stats', i:'📊', l:'Stats'},
    {r:'#/timeline', i:'🪔', l:'Timeline'}
  ];
  $('#tabbar').innerHTML = tabs.map(function(t){
    var on = (t.r==='#/' && (active==='#/'||active==='#/home')) || (t.r!=='#/' && active.indexOf(t.r)===0);
    return '<button class="tab'+(on?' on':'')+'" onclick="location.hash=\''+t.r+'\'"><span class="ti">'+t.i+'</span><span>'+t.l+'</span></button>';
  }).join('');
}
function lbRow(e, i, mv, clickable){
  var p=pinfo(e.pid);
  var click = clickable===false ? '' : ' onclick="location.hash=\'#/player/'+e.pid+'\'" style="cursor:pointer"';
  return '<div class="lb"'+click+'>'+
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
  var lastD=state.days[state.days.length-1], lr=ranked(dayTotals(lastD.id));
  if(lr.length){ var lp=pinfo(lr[0].pid);
    h+='<div class="card" onclick="location.hash=\'#/day/'+lastD.id+'\'" style="cursor:pointer"><div class="row"><div class="grow"><div class="small dim">🗓️ Last session — '+esc(lastD.label)+' <span class="dim">'+esc(lastD.note||'')+'</span></div><div style="font-weight:800;font-size:16px">Winner: '+lp.emoji+' '+esc(lp.name)+' <span class="pos">'+fmtPts(lr[0].pts)+' pts</span></div></div><div class="gold" style="font-size:20px">→</div></div></div>'; }
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
  h+='<div class="garland">🌼 🌼 🌼</div><div class="card small mut center">Each point = 0.10 · Tap a player for full stats &amp; history<br>Updated '+esc(state.meta.updated||'')+'</div>';
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
  var strk=0, sgn=0, _ds=state.days.slice().reverse(), _si;
  for(_si=0;_si<_ds.length;_si++){ var _dt=dayTotals(_ds[_si].id); if(_dt[pid]===undefined) break;
    var _s2=_dt[pid]>0?1:(_dt[pid]<0?-1:0); if(_s2===0) break; if(sgn===0) sgn=_s2; if(_s2!==sgn) break; strk++; }
  var streakHtml=strk>=2?'<div class="small" style="margin-top:6px">'+(sgn>0?'🔥 '+strk+'-day green streak':'🧊 '+strk+'-day red streak')+'</div>':'';
  var p=pinfo(pid); if(p.name==='?'){ location.hash='#/players'; return; }
  var s=playerStats(pid);
  var t=overallTotals(), r=ranked(t);
  var orank=r.findIndex(function(e){return e.pid===pid;})+1;
  var h='<div class="pf-hero"><div class="em">'+p.emoji+'</div><div class="nm">'+esc(p.name)+'</div><div class="tt">'+esc(p.title)+'</div>'+
    '<div style="margin-top:8px"><span class="tag">RANK #'+orank+'</span> <span class="tag">'+fmtPts(s.total)+' PTS</span> <span class="tag">'+fmtMoney(s.total)+'</span></div>'+streakHtml+'</div>';
  h+='<div class="tiles">'+
    tile(s.daysPlayed,'🗓️ Days')+tile(s.crowns,'👑 Crowns')+tile(s.avg,'Avg / round')+
    tile(s.best===null?'—':fmtPts(s.best),'Best round')+tile(s.worst===null?'—':fmtPts(s.worst),'Worst round')+tile(s.dayWins,'🏅 Day wins')+
  '</div>';
  var pat=pinfo(pid).pattern;
  var pp=pinfo(pid);
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
  h+='<h3>🃏 Game history</h3>';
  var gs=state.games.filter(function(g){return g.playerIds.indexOf(pid)>=0;}).slice().reverse();
  gs.forEach(function(g){
    var gt=gameTotals(g), gr=ranked(gt), rk=gr.findIndex(function(e){return e.pid===pid;})+1;
    h+='<div class="lb" onclick="location.hash=\'#/game/'+g.id+'\'" style="cursor:pointer"><div class="rank">'+rk+'</div><div class="grow"><div class="nm">'+esc(g.name)+' <span class="small dim">'+esc(dayLabel(g.dayId))+'</span></div><div class="ti2">'+g.rounds.length+' rounds'+(g.variant==='murder'?' · 🔪 murder':'')+'</div></div><div class="sc"><div class="pv '+cls(gt[pid])+'">'+fmtPts(gt[pid])+'</div><div class="mv">'+fmtMoney(gt[pid])+'</div></div></div>';
  });
  $('#view').innerHTML=h;
  startPFX(pid);
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
  h+='<tr class="money"><td class="rn">💰</td>'+g.playerIds.map(function(pid){return '<td>'+fmtMoney(gt[pid])+'</td>';}).join('')+'</tr>';
  h+='</tbody></table></div>';
  h+='<div class="small dim" style="margin:8px 2px">👑 round winner · 👁️ saw maal · 🙈 blind · 🀄 dublee · 🚩 foul</div>';
  h+='<div class="btnrow"><button class="btn ghost" onclick="App.shareGame(\''+gid+'\')">📤 Share game</button></div>';
  $('#view').innerHTML=h;
}

function vTimeline(){
  tabbar('#/timeline');
  var h='<h2>🪔 Season Timeline</h2>';
  var start=new Date(2026,9,2), end=new Date(2026,10,15), now=new Date();
  var total=Math.round((end-start)/864e5)+1, done=Math.min(total,Math.max(1,Math.floor((now-start)/864e5)+1));
  var pct=Math.round(done/total*100);
  h+='<div class="card"><div class="row"><div class="grow"><b>Season progress</b><div class="small dim">Oct 2 → Nov 15 · Day '+done+' of '+total+'</div></div><div class="gold" style="font-size:20px;font-weight:800">'+pct+'%</div></div><div class="prog"><div style="width:'+pct+'%"></div></div><div class="small dim" style="margin-top:6px">'+(total-done)+' days to the grand finale 🏁</div></div>';
  h+='<div class="tl">';
  state.days.forEach(function(d){
    var r=ranked(dayTotals(d.id)), w=r[0]?pinfo(r[0].pid):null;
    h+='<div class="tl-ev" onclick="location.hash=\'#/day/'+d.id+'\'" style="cursor:pointer"><div class="tl-date">'+(d.id==='day3'?'🔪':'🃏')+' '+esc(d.note||d.label)+'</div><div style="font-weight:800;font-size:16px;margin:2px 0">'+esc(d.label)+' — played</div>'+(w?'<div class="small">Winner: '+w.emoji+' <b>'+esc(w.name)+'</b> <span class="pos">'+fmtPts(r[0].pts)+' pts</span></div>':'')+'</div>';
  });
  h+='<div class="tl-ev"><div class="tl-date">🪔 Festival of Lights</div><div style="font-weight:800;font-size:16px;margin:2px 0">Tihar</div><div class="small dim">The league plays on through Dashain, Tihar and Chhath.</div></div>';
  h+='<div class="tl-ev"><div class="tl-date">🌅 Nov 15</div><div style="font-weight:800;font-size:16px;margin:2px 0">Chhath Puja — Grand Finale</div><div class="small dim">The season ends after Chhath Puja. Final standings, one champion. 🏆</div></div>';
  h+='</div><div class="garland">🌼 🌼 🌼</div>';
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
  function hi(key){
    var arr=state.players.map(function(p){return {pid:p.id,v:agg[p.id][key]};}).filter(function(e){return e.v!==null;});
    arr.sort(function(a,b){return b.v-a.v;}); return arr[0];
  }
  var cards=[
    ['🌼 Sayapatri Mala','most rounds won', top('crowns'), function(e){return e.v+' crowns';}],
    ['🧲 Maal Magnet','saw the maal the most', top('seen'), function(e){return e.v+' times';}],
    ['🚩 Foul Machine','most fouls committed', top('foul'), function(e){return e.v+' fouls';}],
    ['💥 Dashain Dhamaka','biggest single round', hi('best'), function(e){return fmtPts(e.v)+' pts';}],
    ['🎁 Generous Host','most generous single round', low('worst'), function(e){return fmtPts(e.v)+' pts';}],
    ['🎯 Sharp Shooter','best pts / round (10+ rounds)', avgTop(), function(e){return fmtPts(e.v)+' / round';}],
    ['🏔️ Sagarmatha Cap','best single game', hi('bestGame'), function(e){return fmtPts(e.v)+' pts';}]
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
  stopPFX();
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

/* ---------------- Player profile FX: per-title looping animations ---------------- */
var PFX_CV=null, PFX_CTX=null, PFX_RAF=null, PFX_LAST=0, PFX_KIND=null, PFX_P=[], PFX_T=0, PFX_W=0, PFX_H=0;
var PFX_KINDS={p_ashu:'coins',p_ritik:'tornado',p_nitesh:'graph',p_bipin:'flames',p_ranj:'yoyo',p_sanka:'gears',p_dibi:'waves',p_sumit:'stars',p_sunil:'night',p_reji:'icefire',p_saram:'phoenix',p_sami:'giving',p_bijay:'rings',p_shishi:'volcano',p_sunira:'cards',p_arun:'cash',p_sandeep:'sprout'};
function pfxR(a,b){ return a+Math.random()*(b-a); }
function pfxRR(ctx,x,y,w,h,r){ ctx.beginPath();
  if(ctx.roundRect){ ctx.roundRect(x,y,w,h,r); return; }
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function pfxSpark(ctx,s){ ctx.beginPath();
  ctx.moveTo(0,-s); ctx.quadraticCurveTo(0,0,s,0); ctx.quadraticCurveTo(0,0,0,s);
  ctx.quadraticCurveTo(0,0,-s,0); ctx.quadraticCurveTo(0,0,0,-s); ctx.fill(); }
function flameBlob(ctx,s,c){ ctx.fillStyle=c; ctx.beginPath();
  ctx.moveTo(0,-s*1.3);
  ctx.bezierCurveTo(s*0.9,-s*0.5,s*0.7,s*0.4,0,s*0.7);
  ctx.bezierCurveTo(-s*0.7,s*0.4,-s*0.9,-s*0.5,0,-s*1.3); ctx.fill(); }
function pfxGear(ctx,x,y,r,teeth,rot,c){
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.strokeStyle=c; ctx.fillStyle=c; ctx.globalAlpha=0.75;
  ctx.lineWidth=r*0.26;
  for(var i=0;i<teeth;i++){ var a=i/teeth*6.2832;
    ctx.save(); ctx.rotate(a); ctx.fillRect(r*0.82,-r*0.11,r*0.32,r*0.22); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0,0,r*0.82,0,6.2832); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,r*0.25,0,6.2832); ctx.stroke();
  ctx.restore(); }

var PFX_DRAW={
coins:function(ctx,w,h,t,dt){
  if(PFX_P.length<26&&Math.random()<0.4) PFX_P.push({x:pfxR(0,w),y:-16,s:pfxR(5,10),vy:pfxR(35,70),ph:pfxR(0,6.2832),sp:pfxR(1,2.4)});
  for(var i=PFX_P.length-1;i>=0;i--){ var p=PFX_P[i]; p.y+=p.vy*dt; p.ph+=p.sp*dt; p.x+=Math.sin(p.ph)*20*dt;
    if(p.y>h+20){ PFX_P.splice(i,1); continue; }
    ctx.save(); ctx.translate(p.x,p.y); ctx.scale(Math.abs(Math.cos(p.ph)),1); ctx.globalAlpha=0.85;
    var g=ctx.createRadialGradient(-p.s*0.3,-p.s*0.3,1,0,0,p.s);
    g.addColorStop(0,'#ffe082'); g.addColorStop(0.6,'#ffb300'); g.addColorStop(1,'#c17900');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,p.s,0,6.2832); ctx.fill();
    ctx.strokeStyle='#8d5a00'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore(); } },
tornado:function(ctx,w,h,t,dt){
  var cx=w/2;
  ctx.save();
  for(var i=0;i<16;i++){ var f=i/15, y=h*0.08+f*h*0.8, rx=10+f*w*0.30;
    ctx.globalAlpha=0.10; ctx.strokeStyle='#cfd8dc'; ctx.lineWidth=7;
    ctx.beginPath(); ctx.ellipse(cx+Math.sin(t*2.5+i*0.7)*12,y,rx,rx*0.22,0,0,6.2832); ctx.stroke(); }
  ctx.restore();
  if(PFX_P.length<20&&Math.random()<0.5) PFX_P.push({a:pfxR(0,6.2832),f:pfxR(0.15,0.95),sp:pfxR(2,4),s:pfxR(4,7)});
  PFX_P.forEach(function(p){ p.a+=p.sp*dt;
    var y=h*0.08+p.f*h*0.8, rx=10+p.f*w*0.30, x=cx+Math.cos(p.a)*rx*0.9;
    ctx.save(); ctx.translate(x,y+Math.sin(p.a)*rx*0.18); ctx.scale(Math.abs(Math.cos(p.a*2)),1); ctx.globalAlpha=0.9;
    ctx.fillStyle='#ffb300'; ctx.beginPath(); ctx.arc(0,0,p.s,0,6.2832); ctx.fill();
    ctx.strokeStyle='#8d5a00'; ctx.lineWidth=1.2; ctx.stroke(); ctx.restore(); }); },
graph:function(ctx,w,h,t,dt){
  var pts=[[0.06,0.78],[0.2,0.70],[0.34,0.72],[0.48,0.58],[0.62,0.60],[0.76,0.44],[0.9,0.36],[0.98,0.22]];
  var pr=(t*0.22)%1.15, n=pr*pts.length, drawn=0;
  ctx.save(); ctx.globalAlpha=0.9;
  var grd=ctx.createLinearGradient(0,0,w,0); grd.addColorStop(0,'#66bb6a'); grd.addColorStop(1,'#ffd54f');
  ctx.strokeStyle=grd; ctx.lineWidth=3; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.shadowColor='rgba(102,187,106,.8)'; ctx.shadowBlur=8;
  ctx.beginPath();
  for(var i=0;i<pts.length;i++){ var x=pts[i][0]*w, y=pts[i][1]*h;
    if(i===0) ctx.moveTo(x,y);
    else if(i<=n){ ctx.lineTo(x,y); drawn=i; }
    else { var f=n-(i-1), px=pts[i-1][0]*w, py=pts[i-1][1]*h;
      ctx.lineTo(px+(x-px)*f,py+(y-py)*f); break; } }
  ctx.stroke(); ctx.restore();
  ctx.save(); ctx.fillStyle='#ffd54f';
  for(var j=0;j<=drawn&&j<pts.length;j++){ ctx.globalAlpha=0.9;
    ctx.beginPath(); ctx.arc(pts[j][0]*w,pts[j][1]*h,3.5,0,6.2832); ctx.fill(); }
  ctx.restore(); },
flames:function(ctx,w,h,t,dt){
  if(PFX_P.length<30&&Math.random()<0.7) PFX_P.push({x:pfxR(w*0.15,w*0.85),y:h+10,s:pfxR(8,20),vy:pfxR(50,110),ph:pfxR(0,6.2832)});
  for(var i=PFX_P.length-1;i>=0;i--){ var p=PFX_P[i]; p.y-=p.vy*dt; p.ph+=dt*6; p.x+=Math.sin(p.ph)*30*dt;
    var life=1-(h+10-p.y)/(h+40); if(life<=0){ PFX_P.splice(i,1); continue; }
    var s=p.s*(0.4+0.6*life);
    ctx.save(); ctx.globalAlpha=0.5*life; ctx.translate(p.x,p.y);
    flameBlob(ctx,s,'rgba(229,57,53,.55)'); flameBlob(ctx,s*0.66,'rgba(255,152,0,.6)'); flameBlob(ctx,s*0.38,'rgba(255,235,59,.75)');
    ctx.restore(); } },
yoyo:function(ctx,w,h,t,dt){
  var cx=w/2, y=h*0.52+Math.sin(t*2.4)*h*0.30;
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,y-15); ctx.stroke();
  var g=ctx.createRadialGradient(cx-5,y-21,2,cx,y-15,16);
  g.addColorStop(0,'#ef9a9a'); g.addColorStop(1,'#c62828');
  ctx.globalAlpha=0.95; ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(cx,y-15,15,0,6.2832); ctx.fill();
  ctx.strokeStyle='#ffebee'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(cx,y-15,4,0,6.2832); ctx.fill();
  ctx.restore(); },
gears:function(ctx,w,h,t,dt){
  pfxGear(ctx,w*0.30,h*0.55,34,10,t*0.7,'rgba(176,190,197,.5)');
  pfxGear(ctx,w*0.62,h*0.45,24,8,-t*1.0+0.4,'rgba(144,164,174,.5)');
  pfxGear(ctx,w*0.80,h*0.62,16,8,t*1.4,'rgba(120,144,156,.45)'); },
waves:function(ctx,w,h,t,dt){
  ctx.save();
  for(var L=0;L<2;L++){ ctx.globalAlpha=0.35-L*0.12; ctx.strokeStyle=L?'#4fc3f7':'#29b6f6'; ctx.lineWidth=3;
    ctx.beginPath();
    for(var x=0;x<=w;x+=8){ var y=h*0.78+L*12+Math.sin(x*0.03+t*(1.2+L*0.5)+L*2)*8;
      if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
    ctx.stroke(); }
  var bx=w*0.5, by=h*0.60+Math.sin(t*1.6)*10;
  ctx.globalAlpha=0.95; ctx.lineWidth=11; ctx.strokeStyle='#f5f5f5';
  ctx.beginPath(); ctx.arc(bx,by,22,0,6.2832); ctx.stroke();
  ctx.strokeStyle='#e53935';
  for(var k=0;k<4;k++){ ctx.beginPath(); ctx.arc(bx,by,22,k*1.5708+0.15,k*1.5708+1.05); ctx.stroke(); }
  ctx.restore(); },
stars:function(ctx,w,h,t,dt){
  if(!PFX_P.length) for(var i=0;i<26;i++) PFX_P.push({x:pfxR(0,w),y:pfxR(0,h),s:pfxR(2,6),ph:pfxR(0,6.2832),sp:pfxR(1,3)});
  PFX_P.forEach(function(p){
    ctx.save(); ctx.translate(p.x,p.y);
    ctx.globalAlpha=0.25+0.65*Math.abs(Math.sin(t*p.sp+p.ph)); ctx.fillStyle='#fff9c4';
    pfxSpark(ctx,p.s); ctx.restore(); }); },
night:function(ctx,w,h,t,dt){
  PFX_DRAW.stars(ctx,w,h,t,dt);
  ctx.save();
  var mx=w*0.82, my=h*0.24;
  var g=ctx.createRadialGradient(mx,my,4,mx,my,34);
  g.addColorStop(0,'rgba(255,249,196,.95)'); g.addColorStop(0.35,'rgba(255,249,196,.35)'); g.addColorStop(1,'rgba(255,249,196,0)');
  ctx.globalAlpha=0.9; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(mx,my,34,0,6.2832); ctx.fill();
  ctx.fillStyle='#fff9c4'; ctx.beginPath(); ctx.arc(mx,my,11,0,6.2832); ctx.fill();
  ctx.globalAlpha=0.10; ctx.fillStyle='#b0bec5';
  var cx=((t*8)%(w+160))-80;
  ctx.beginPath(); ctx.ellipse(cx,h*0.30,60,14,0,0,6.2832); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+40,h*0.34,44,11,0,0,6.2832); ctx.fill();
  ctx.restore(); },
icefire:function(ctx,w,h,t,dt){
  if(PFX_P.length<30&&Math.random()<0.6){
    if(Math.random()<0.5) PFX_P.push({k:'s',x:pfxR(0,w*0.5),y:-12,s:pfxR(3,7),vy:pfxR(30,60),ph:pfxR(0,6.2832)});
    else PFX_P.push({k:'e',x:pfxR(w*0.5,w),y:h+12,s:pfxR(2,5),vy:pfxR(40,90),ph:pfxR(0,6.2832)}); }
  for(var i=PFX_P.length-1;i>=0;i--){ var p=PFX_P[i];
    if(p.k==='s'){ p.y+=p.vy*dt; p.x+=Math.sin(t*2+p.ph)*20*dt;
      if(p.y>h+14){ PFX_P.splice(i,1); continue; }
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.ph+t*0.5);
      ctx.globalAlpha=0.8; ctx.strokeStyle='#b3e5fc'; ctx.lineWidth=1.6;
      for(var s=0;s<3;s++){ ctx.rotate(1.0472); ctx.beginPath(); ctx.moveTo(-p.s,0); ctx.lineTo(p.s,0); ctx.stroke(); }
      ctx.restore(); }
    else { p.y-=p.vy*dt; p.x+=Math.sin(t*3+p.ph)*24*dt;
      if(p.y<-14){ PFX_P.splice(i,1); continue; }
      ctx.save(); ctx.globalAlpha=0.75; ctx.fillStyle='#ff7043';
      ctx.beginPath(); ctx.arc(p.x,p.y,p.s*(0.7+0.3*Math.sin(t*8+p.ph)),0,6.2832); ctx.fill(); ctx.restore(); } } },
phoenix:function(ctx,w,h,t,dt){
  if(PFX_P.length<34&&Math.random()<0.6) PFX_P.push({x:w/2+pfxR(-40,40),y:h+10,s:pfxR(3,8),vy:pfxR(60,130),ph:pfxR(0,6.2832),hue:pfxR(15,45)});
  for(var i=PFX_P.length-1;i>=0;i--){ var p=PFX_P[i]; p.y-=p.vy*dt; p.x+=Math.sin(t*2+p.ph)*26*dt;
    var life=1-(h+10-p.y)/(h+30); if(life<=0){ PFX_P.splice(i,1); continue; }
    ctx.save(); ctx.globalAlpha=0.75*life;
    ctx.fillStyle='hsl('+p.hue+',95%,'+(55+15*Math.sin(t*6+p.ph))+'%)';
    ctx.translate(p.x,p.y); ctx.rotate(p.ph+t);
    ctx.beginPath(); ctx.ellipse(0,0,p.s,p.s*0.45,0,0,6.2832); ctx.fill(); ctx.restore(); } },
giving:function(ctx,w,h,t,dt){
  if(PFX_P.length<30&&Math.random()<0.5) PFX_P.push({a:pfxR(0,6.2832),r:6,s:pfxR(4,8),vr:pfxR(40,90),va:pfxR(-0.6,0.6)});
  PFX_P.forEach(function(p){ p.r+=p.vr*dt; p.a+=p.va*dt;
    if(p.r>Math.max(w,h)*0.6){ p.r=6; p.a=pfxR(0,6.2832); }
    var x=w/2+Math.cos(p.a)*p.r, y=h*0.35+Math.sin(p.a)*p.r*0.7;
    ctx.save(); ctx.translate(x,y); ctx.scale(Math.abs(Math.cos(p.a*3)),1); ctx.globalAlpha=0.85;
    ctx.fillStyle='#c8e6c9'; ctx.beginPath(); ctx.arc(0,0,p.s,0,6.2832); ctx.fill();
    ctx.strokeStyle='#2e7d32'; ctx.lineWidth=1.4; ctx.stroke(); ctx.restore(); }); },
rings:function(ctx,w,h,t,dt){
  var cyc=(t*0.5)%1;
  for(var i=0;i<3;i++){ var f=(cyc+i/3)%1, r=f*Math.max(w,h)*0.45;
    ctx.save(); ctx.globalAlpha=0.35*(1-f); ctx.strokeStyle='#ffd54f'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(w/2,h/2,r,0,6.2832); ctx.stroke(); ctx.restore(); }
  PFX_DRAW.stars(ctx,w,h,t,dt); },
volcano:function(ctx,w,h,t,dt){
  ctx.save(); ctx.globalAlpha=0.85; ctx.fillStyle='#3e2723';
  ctx.beginPath(); ctx.moveTo(w*0.32,h); ctx.lineTo(w*0.44,h*0.62); ctx.lineTo(w*0.56,h*0.62); ctx.lineTo(w*0.68,h); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ff5722';
  ctx.beginPath(); ctx.moveTo(w*0.44,h*0.62); ctx.lineTo(w*0.5,h*0.70); ctx.lineTo(w*0.56,h*0.62); ctx.closePath(); ctx.fill();
  ctx.restore();
  if(PFX_P.length<30&&Math.random()<0.6) PFX_P.push({k:Math.random()<0.6?'l':'s',x:w*0.5+pfxR(-16,16),y:h*0.62,s:pfxR(3,7),vy:pfxR(50,120),ph:pfxR(0,6.2832)});
  for(var i=PFX_P.length-1;i>=0;i--){ var p=PFX_P[i]; p.y-=p.vy*dt;
    var life=1-(h*0.62-p.y)/(h*0.7); if(life<=0){ PFX_P.splice(i,1); continue; }
    ctx.save();
    if(p.k==='l'){ ctx.globalAlpha=0.85*life; ctx.fillStyle='#ff7043';
      ctx.beginPath(); ctx.arc(p.x+Math.sin(t*3+p.ph)*10,p.y,p.s,0,6.2832); ctx.fill(); }
    else { ctx.globalAlpha=0.25*life; ctx.fillStyle='#b0bec5';
      ctx.beginPath(); ctx.arc(p.x+Math.sin(t*2+p.ph)*16,p.y,p.s*(2-life),0,6.2832); ctx.fill(); }
    ctx.restore(); } },
cards:function(ctx,w,h,t,dt){
  var suits=['\u2660','\u2665','\u2663','\u2666'], cols=['#212121','#c62828','#212121','#c62828'];
  ctx.textAlign='center'; ctx.textBaseline='middle';
  for(var i=0;i<3;i++){
    var x=w*(0.3+i*0.2), y=h*0.5+Math.sin(t*1.4+i*2)*14, cw=34, ch=48;
    ctx.save(); ctx.translate(x,y); ctx.rotate(Math.sin(t+i)*0.12); ctx.scale(Math.cos(t*1.8+i*2.1),1);
    ctx.globalAlpha=0.92; ctx.fillStyle='#fafafa';
    pfxRR(ctx,-cw/2,-ch/2,cw,ch,6); ctx.fill();
    ctx.strokeStyle='#b0bec5'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle=cols[i%4]; ctx.font='bold 20px serif';
    ctx.fillText(suits[i%4],0,1);
    ctx.restore(); } },
cash:function(ctx,w,h,t,dt){
  if(PFX_P.length<16&&Math.random()<0.3) PFX_P.push({x:pfxR(0,w),y:-20,s:pfxR(0.7,1.2),vy:pfxR(25,50),ph:pfxR(0,6.2832)});
  for(var i=PFX_P.length-1;i>=0;i--){ var p=PFX_P[i]; p.y+=p.vy*dt; p.ph+=dt;
    if(p.y>h+30){ PFX_P.splice(i,1); continue; }
    ctx.save(); ctx.translate(p.x+Math.sin(p.ph)*16,p.y); ctx.rotate(Math.sin(p.ph*0.7)*0.2); ctx.scale(p.s,p.s);
    ctx.globalAlpha=0.85; ctx.fillStyle='#a5d6a7';
    pfxRR(ctx,-26,-11,52,22,3); ctx.fill();
    ctx.strokeStyle='#2e7d32'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#2e7d32'; ctx.fillRect(-5,-11,10,22);
    ctx.fillStyle='#1b5e20'; ctx.beginPath(); ctx.arc(0,0,6,0,6.2832); ctx.fill();
    ctx.restore(); }
  if(Math.random()<0.3){ ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle='#ffd54f';
    ctx.beginPath(); ctx.arc(pfxR(0,w),pfxR(0,h),1.6,0,6.2832); ctx.fill(); ctx.restore(); } },
sprout:function(ctx,w,h,t,dt){
  var bx=w/2, by=h*0.86, cyc=(t*0.25)%1;
  ctx.save(); ctx.globalAlpha=0.9; ctx.strokeStyle='#66bb6a'; ctx.lineWidth=4; ctx.lineCap='round';
  var top=by-70*cyc, sway=Math.sin(t*1.5)*12;
  ctx.beginPath(); ctx.moveTo(bx,by);
  ctx.quadraticCurveTo(bx+sway*0.6,by-35*cyc,bx+sway,top); ctx.stroke();
  if(cyc>0.4){ var l1=(cyc-0.4)/0.6; ctx.fillStyle='#81c784';
    ctx.save(); ctx.translate(bx+sway*0.8,by-44*cyc); ctx.rotate(-0.6+sway*0.008); ctx.scale(l1,l1);
    ctx.beginPath(); ctx.ellipse(-14,0,16,8,0,0,6.2832); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(bx+sway*0.9,by-56*cyc); ctx.rotate(0.6+sway*0.008); ctx.scale(l1,l1);
    ctx.beginPath(); ctx.ellipse(14,0,16,8,0,0,6.2832); ctx.fill(); ctx.restore(); }
  ctx.restore();
  PFX_DRAW.stars(ctx,w,h,t,dt); }
};

function pfxTick(ts){
  if(!PFX_LAST) PFX_LAST=ts;
  var dt=Math.min(0.05,(ts-PFX_LAST)/1000); PFX_LAST=ts; PFX_T+=dt;
  if(!PFX_CTX) return;
  PFX_CTX.clearRect(0,0,PFX_W,PFX_H);
  PFX_DRAW[PFX_KIND](PFX_CTX,PFX_W,PFX_H,PFX_T,dt);
  PFX_RAF=requestAnimationFrame(pfxTick);
}
function startPFX(pid){
  stopPFX();
  var hero=document.querySelector('.pf-hero'); if(!hero) return;
  PFX_KIND=PFX_KINDS[pid]||'stars';
  PFX_CV=document.createElement('canvas'); PFX_CV.className='pf-fx';
  hero.insertBefore(PFX_CV, hero.firstChild);
  pfxResize(); PFX_T=0; PFX_P=[]; PFX_LAST=0;
  if(!window._pfxRs){ window._pfxRs=true; window.addEventListener('resize', pfxResize); }
  PFX_RAF=requestAnimationFrame(pfxTick);
}
function stopPFX(){
  if(PFX_RAF){ cancelAnimationFrame(PFX_RAF); PFX_RAF=null; }
  if(PFX_CV&&PFX_CV.parentNode) PFX_CV.parentNode.removeChild(PFX_CV);
  PFX_CV=null; PFX_P=[]; PFX_KIND=null;
}

/* ---------------- App API ---------------- */
var App={
go:function(r){ location.hash=r; },
toggleMusic:function(){ toggleMusic(); },
shareStandings:function(){ shareText(standingsText()); },
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
