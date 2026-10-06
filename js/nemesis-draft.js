/* ============================================================
   DPL addition draft — Nemesis board + Milestones (NOT wired in yet)
   Paste into js/app.js inside the IIFE, then call renderNemesis()
   from vStats() and renderNemesisCard(pid) from vPlayer().
   Everything is computed at runtime from window.DPL_SEED,
   so future screenshot transcriptions never overwrite it.
   ============================================================ */

/* ---------------- head-to-head ---------------- */
function headToHead(){
  var pairs={}; // "a|b" (sorted) -> {a,b,net,rounds}
  state.games.forEach(function(g){
    g.rounds.forEach(function(r){
      var ids=g.playerIds;
      for(var i=0;i<ids.length;i++) for(var j=i+1;j<ids.length;j++){
        var a=ids[i], b=ids[j], ab=[a,b].sort();
        var key=ab.join('|');
        var pa=+((r.scores[a]||{}).pts||0), pb=+((r.scores[b]||{}).pts||0);
        if(!pairs[key]) pairs[key]={a:ab[0], b:ab[1], net:0, rounds:0};
        var p=pairs[key];
        p.net += (p.a===a ? pa-pb : pb-pa);
        p.rounds++;
      }
    });
  });
  var res={};
  state.players.forEach(function(pl){ res[pl.id]=[]; });
  Object.keys(pairs).forEach(function(k){
    var p=pairs[k];
    res[p.a].push({opp:p.b, net:p.net, rounds:p.rounds});
    res[p.b].push({opp:p.a, net:-p.net, rounds:p.rounds});
  });
  var out={};
  state.players.forEach(function(pl){
    var rows=res[pl.id].slice().sort(function(x,y){return x.net-y.net;});
    out[pl.id]={ nemesis:rows[0]||null, best:rows[rows.length-1]||null, rows:rows };
  });
  return out;
}

/* ---------------- in-game comebacks (full games only) ---------------- */
function inGameComebacks(){
  var res=[];
  state.games.forEach(function(g){
    if(g.partial) return; // untranscribed early rounds would skew this
    var cum={}, mn={};
    g.rounds.forEach(function(r){
      g.playerIds.forEach(function(pid){
        var v=+((r.scores[pid]||{}).pts||0);
        cum[pid]=(cum[pid]||0)+v;
        mn[pid]=Math.min(mn[pid]===undefined?1e9:mn[pid], cum[pid]);
      });
    });
    g.playerIds.forEach(function(pid){
      res.push({pid:pid, game:g, swing:(cum[pid]||0)-(mn[pid]||0), low:mn[pid], fin:cum[pid]||0});
    });
  });
  return res.sort(function(a,b){return b.swing-a.swing;});
}

/* ---------------- milestones from declared totals ---------------- */
function milestones(){
  var t=overallTotals(), r=ranked(t), m=[];
  if(r[0] && r[0].pts>=1000)
    m.push({ic:'🏆', txt:pinfo(r[0].pid).name+' enters the 1,000 Club', sub:fmtPts(r[0].pts)+' pts — first in DPL history'});
  // biggest single day ever (declared day totals)
  var bd=null;
  state.days.forEach(function(d){
    ranked(dayTotals(d.id)).forEach(function(e){ if(!bd||e.pts>bd.pts) bd={pid:e.pid,pts:e.pts,day:d.label}; });
  });
  if(bd) m.push({ic:'🌪️', txt:'Biggest day ever — '+pname(bd.pid)+' '+fmtPts(bd.pts), sub:bd.day});
  var cbs=inGameComebacks();
  if(cbs[0]) m.push({ic:'💥', txt:'Biggest in-game comeback — '+pname(cbs[0].pid)+' +'+cbs[0].swing, sub:cbs[0].low+' → '+cbs[0].fin+' in '+cbs[0].game.name+' ('+dayLabel(cbs[0].game.dayId)+')'});
  var last=r[r.length-1];
  if(last) m.push({ic:'🥄', txt:'Deepest hole — '+pname(last.pid)+' '+fmtPts(last.pts), sub:'the wooden spoon race is on'});
  return m;
}

/* ---------------- render: nemesis board (add to vStats) ---------------- */
function renderNemesis(){
  var hh=headToHead(), h='<h3>😈 Nemesis Board</h3><div class="small dim" style="margin:-4px 2px 10px">Head-to-head across every round shared — who owns whom</div>';
  state.players.forEach(function(p){
    var d=hh[p.id]; if(!d.nemesis) return;
    var nm=d.nemesis, b=d.best;
    var opp=pinfo(nm.opp);
    var left = nm.net<0
      ? '<div class="ti2">😈 owned by <b>'+esc(opp.name)+'</b> <span class="neg">'+fmtPts(nm.net)+'</span> · '+nm.rounds+' rounds</div>'
      : '<div class="ti2">😈 <b>Untouchable</b> — nobody owns '+esc(p.name)+(nm.opp?' (closest: '+esc(opp.name)+' at '+fmtPts(nm.net)+')':'')+'</div>';
    var right = b && b.net>0
      ? '<div class="ti2">🎯 owns <b>'+esc(pname(b.opp))+'</b> <span class="pos">'+fmtPts(b.net)+'</span> · '+b.rounds+' rounds</div>' : '';
    h+='<div class="lb" onclick="location.hash=\'#/player/'+p.id+'\'" style="cursor:pointer">'+
      '<div class="avatar">'+p.emoji+'</div><div class="grow"><div class="nm">'+esc(p.name)+'</div>'+left+right+'</div></div>';
  });
  return h;
}

/* ---------------- render: milestones strip (add to vStats or vHome) ---------------- */
function renderMilestones(){
  var m=milestones(), h='<h3>⭐ Milestones</h3>';
  m.forEach(function(x){
    h+='<div class="card"><div class="row"><div style="font-size:26px">'+x.ic+'</div><div class="grow"><div style="font-weight:800;font-size:15px">'+x.txt+'</div><div class="small dim">'+x.sub+'</div></div></div></div>';
  });
  return h;
}

/* ---------------- render: per-player nemesis card (add to vPlayer) ---------------- */
function renderNemesisCard(pid){
  var d=headToHead()[pid]; if(!d||!d.nemesis) return '';
  var nm=d.nemesis, b=d.best, opp=pinfo(nm.opp);
  var line = nm.net<0
    ? '😈 <b>Nemesis:</b> '+opp.emoji+' '+esc(opp.name)+' — <span class="neg">'+fmtPts(nm.net)+'</span> head-to-head over '+nm.rounds+' rounds'
    : '😈 <b>No nemesis.</b> Nobody has a winning record against you — closest is '+esc(opp.name)+' ('+fmtPts(nm.net)+').';
  var line2 = (b && b.net>0)
    ? '<br>🎯 <b>Favorite matchup:</b> '+esc(pname(b.opp))+' — <span class="pos">'+fmtPts(b.net)+'</span> over '+b.rounds+' rounds' : '';
  return '<div class="card"><h3 style="margin-top:0">😈 Head-to-head</h3><div style="font-size:14px;line-height:1.7">'+line+line2+'</div></div>';
}
