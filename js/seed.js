/* DPL seed data — transcribed from the Marriage Point Calculator screenshots (Oct 3–4, 2026).
   Round format: {n: roundNo, w: winnerPlayerId, s: [[points, status]...]} aligned with game.playerIds order.
   status: 's' seen 👁, 'u' unseen 🙈, 'd' dublee 🀄, 'f' foul 🚩 */
window.DPL_SEED = {
meta: {updated: 'October 5, 2026', rate: '$0.10/pt'},
players: [
  {id:'p_ritik',  name:'Ritik',  title:'Day One Don',        emoji:'👑'},
  {id:'p_ashu',   name:'Ashu',   title:'The Banker',         emoji:'🏦'},
  {id:'p_nitesh', name:'Nitesh', title:'Mr. Consistent',     emoji:'📈'},
  {id:'p_bipin',  name:'Bipin',  title:'The Comeback King',  emoji:'🔥'},
  {id:'p_ranj',   name:'Ranj',   title:'The Yo-Yo',          emoji:'🎢'},
  {id:'p_sanka',  name:'Sanka',  title:'The Grinder',        emoji:'⚙️'},
  {id:'p_dibi',   name:'Dibi',   title:'The Survivor',       emoji:'🛟'},
  {id:'p_sumit',  name:'Sumit',  title:'The Guest Star',     emoji:'🌟'},
  {id:'p_sunil',  name:'Sunil',  title:'The Night Owl',      emoji:'🦉'},
  {id:'p_reji',   name:'Reji',   title:'Slow Starter',       emoji:'🐢'},
  {id:'p_saram',  name:'Saram',  title:'The Giver',          emoji:'🎁'},
  {id:'p_sami',   name:'Sami',   title:'The Philanthropist', emoji:'💸'},
  {id:'p_bijay',  name:'Bijay',  title:'The Sponsor',        emoji:'🤝'},
  {id:'p_vj',     name:'Vj',     title:'The Mystery',        emoji:'🎭'},
  {id:'p_shishi', name:'Shishi', title:'Trial by Fire',      emoji:'🌋'},
  {id:'p_sunira', name:'Sunira', title:'The Wildcard',       emoji:'🃏'},
  {id:'p_arun',   name:'Arun',   title:'The Quiet One',      emoji:'🤫'}
],
days: [
  {id:'day1', label:'Day 1', date:'2026-10-03', note:'Oct 3'},
  {id:'day2', label:'Day 2', date:'2026-10-04', note:'Oct 3 late night → Oct 4'},
  {id:'day3', label:'Day 3', date:'2026-10-04', note:'Oct 4 evening'}
],
games: [
/* ---------- DAY 1 ---------- */
{id:'g_d1_1', dayId:'day1', name:'Game 1', variant:'classic', date:'2026-10-03', partial:true,
 playerIds:['p_saram','p_ritik','p_dibi','p_bijay','p_nitesh'],
 totals:{p_saram:-273,p_ritik:369,p_dibi:-134,p_bijay:-303,p_nitesh:341},
 rounds:[
  {n:7,  w:'p_dibi',   s:[[-33,'u'],[-33,'u'],[75,'s'],[-33,'u'],[24,'s']]},
  {n:8,  w:'p_ritik',  s:[[-37,'u'],[148,'s'],[-37,'u'],[-37,'u'],[-37,'u']]},
  {n:9,  w:'p_ritik',  s:[[-40,'u'],[78,'s'],[-40,'u'],[-40,'u'],[42,'s']]},
  {n:10, w:'p_ritik',  s:[[-18,'s'],[47,'s'],[-18,'s'],[-18,'s'],[7,'s']]},
  {n:11, w:'p_nitesh', s:[[-7,'s'],[-24,'u'],[-24,'u'],[-24,'u'],[79,'s']]},
  {n:12, w:'p_nitesh', s:[[-44,'u'],[-12,'s'],[73,'s'],[-12,'s'],[-5,'s']]},
  {n:13, w:'p_ritik',  s:[[-56,'s'],[131,'s'],[-63,'u'],[19,'s'],[-31,'s']]},
  {n:14, w:'p_ritik',  s:[[23,'s'],[30,'s'],[-59,'u'],[-42,'s'],[48,'s']]},
  {n:15, w:'p_bijay',  s:[[-45,'s'],[-67,'u'],[-50,'s'],[47,'s'],[115,'s']]}
 ]},
{id:'g_d1_2', dayId:'day1', name:'Game 2', variant:'classic', date:'2026-10-03', partial:true,
 playerIds:['p_ashu','p_sanka','p_ranj','p_bipin','p_reji'],
 totals:{p_ashu:436,p_sanka:-136,p_ranj:157,p_bipin:-223,p_reji:-234},
 rounds:[
  {n:4,  w:'p_bipin',  s:[[20,'s'],[-27,'s'],[-27,'s'],[61,'s'],[-27,'s']]},
  {n:5,  w:'p_ashu',   s:[[6,'s'],[-6,'s'],[-38,'u'],[69,'s'],[-31,'s']]},
  {n:6,  w:'p_reji',   s:[[-32,'u'],[40,'s'],[-32,'u'],[-25,'s'],[49,'s']]},
  {n:7,  w:'p_ashu',   s:[[80,'s'],[-20,'u'],[-20,'u'],[-20,'u'],[-20,'u']]},
  {n:8,  w:'p_ranj',   s:[[-35,'u'],[-35,'u'],[140,'s'],[-35,'u'],[-35,'u']]},
  {n:9,  w:'p_ranj',   s:[[-39,'u'],[28,'s'],[47,'s'],[3,'s'],[-39,'u']]},
  {n:10, w:'p_ashu',   s:[[53,'s'],[39,'s'],[24,'s'],[-58,'u'],[-58,'u']]},
  {n:11, w:'p_ashu',   s:[[98,'s'],[-52,'u'],[58,'d'],[-52,'u'],[-52,'u']]},
  {n:12, w:'p_bipin',  s:[[-37,'u'],[-37,'u'],[-5,'s'],[49,'s'],[30,'s']]},
  {n:13, w:'p_sanka',  s:[[-15,'s'],[47,'s'],[15,'s'],[-57,'u'],[10,'s']]},
  {n:14, w:'p_ashu',   s:[[164,'s'],[-66,'s'],[-16,'s'],[-41,'s'],[-41,'s']]},
  {n:15, w:'p_ashu',   s:[[27,'s'],[-43,'s'],[-3,'s'],[-28,'s'],[47,'s']]}
 ]},
{id:'g_d1_3', dayId:'day1', name:'Murder Game', variant:'murder', date:'2026-10-03', partial:false,
 playerIds:['p_sanka','p_ritik','p_dibi','p_bijay','p_nitesh'],
 totals:{p_sanka:34,p_ritik:126,p_dibi:23,p_bijay:-80,p_nitesh:-103},
 rounds:[
  {n:1, w:'p_sanka',  s:[[50,'s'],[3,'s'],[18,'s'],[-39,'u'],[-32,'s']]},
  {n:2, w:'p_nitesh', s:[[-13,'s'],[22,'s'],[-35,'u'],[-3,'s'],[29,'s']]},
  {n:3, w:'p_dibi',   s:[[-55,'u'],[2,'s'],[134,'s'],[-33,'s'],[-48,'s']]},
  {n:4, w:'p_ritik',  s:[[-2,'s'],[117,'s'],[-44,'u'],[-27,'s'],[-44,'u']]},
  {n:5, w:'p_sanka',  s:[[54,'s'],[-18,'s'],[-50,'u'],[22,'s'],[-8,'s']]}
 ]},
/* ---------- DAY 2 ---------- */
{id:'g_d2_1', dayId:'day2', name:'Game 1', variant:'classic', date:'2026-10-04', partial:false,
 playerIds:['p_bijay','p_bipin','p_ritik','p_saram','p_nitesh'],
 totals:{p_bijay:-61,p_bipin:265,p_ritik:-114,p_saram:-191,p_nitesh:101},
 rounds:[
  {n:1,  w:'p_bipin',  s:[[54,'s'],[60,'s'],[-57,'u'],[-57,'u'],[0,'s']]},
  {n:2,  w:'p_bipin',  s:[[15,'s'],[52,'s'],[-52,'u'],[-20,'s'],[5,'s']]},
  {n:3,  w:'p_bipin',  s:[[-54,'u'],[32,'s'],[38,'s'],[-54,'u'],[38,'s']]},
  {n:4,  w:'p_saram',  s:[[6,'d'],[-37,'s'],[56,'d'],[-3,'s'],[-22,'s']]},
  {n:5,  w:'p_nitesh', s:[[-15,'s'],[-40,'s'],[-47,'u'],[-30,'s'],[132,'s']]},
  {n:6,  w:'p_bipin',  s:[[-28,'u'],[105,'s'],[-28,'u'],[-21,'s'],[-28,'u']]},
  {n:7,  w:'p_saram',  s:[[-32,'s'],[-14,'d'],[-42,'s'],[27,'s'],[61,'d']]},
  {n:8,  w:'p_bijay',  s:[[52,'s'],[-26,'u'],[-26,'u'],[26,'s'],[-26,'u']]},
  {n:9,  w:'p_bipin',  s:[[-27,'u'],[108,'s'],[-27,'u'],[-27,'u'],[-27,'u']]},
  {n:10, w:'p_ritik',  s:[[-32,'u'],[25,'s'],[71,'s'],[-32,'u'],[-32,'u']]}
 ]},
{id:'g_d2_2', dayId:'day2', name:'Game 2', variant:'classic', date:'2026-10-03', partial:true,
 playerIds:['p_ashu','p_sanka','p_ranj','p_sami','p_dibi'],
 totals:{p_ashu:360,p_sanka:37,p_ranj:-185,p_sami:-382,p_dibi:170},
 rounds:[
  {n:5,  w:'p_ashu',   s:[[61,'s'],[32,'s'],[7,'s'],[-50,'s'],[-50,'s']]},
  {n:6,  w:'p_ashu',   s:[[62,'s'],[7,'s'],[-18,'s'],[-58,'s'],[7,'s']]},
  {n:7,  w:'p_dibi',   s:[[-54,'s'],[71,'s'],[-29,'s'],[-34,'s'],[46,'s']]},
  {n:8,  w:'p_ashu',   s:[[-32,'s'],[43,'s'],[48,'s'],[-67,'s'],[8,'s']]},
  {n:9,  w:'p_ashu',   s:[[65,'s'],[-50,'s'],[-15,'s'],[-75,'s'],[75,'s']]},
  {n:10, w:'p_ashu',   s:[[80,'s'],[-20,'u'],[-20,'u'],[-20,'u'],[-20,'u']]},
  {n:11, w:'p_sami',   s:[[-39,'u'],[-7,'s'],[-22,'s'],[90,'s'],[-22,'s']]},
  {n:12, w:'p_ashu',   s:[[121,'s'],[-40,'u'],[-8,'s'],[-33,'s'],[-40,'u']]},
  {n:13, w:'p_ranj',   s:[[-40,'u'],[17,'s'],[71,'s'],[-40,'u'],[-8,'s']]},
  {n:14, w:'p_sanka',  s:[[47,'s'],[84,'s'],[-43,'s'],[-28,'s'],[-60,'u']]},
  {n:15, w:'p_dibi',   s:[[-26,'s'],[-33,'u'],[-33,'u'],[-33,'u'],[125,'s']]}
 ]},
{id:'g_d2_3', dayId:'day2', name:'Murder Game', variant:'murder', date:'2026-10-04', partial:false,
 playerIds:['p_sunil','p_bipin','p_sumit','p_bijay','p_nitesh'],
 totals:{p_sunil:-106,p_bipin:78,p_sumit:23,p_bijay:24,p_nitesh:-19},
 rounds:[
  {n:1, w:'p_bipin', s:[[-54,'u'],[75,'s'],[-22,'s'],[3,'s'],[-2,'s']]},
  {n:2, w:'p_bipin', s:[[-25,'s'],[62,'s'],[-10,'s'],[15,'s'],[-42,'u']]},
  {n:3, w:'p_bijay', s:[[-17,'f'],[-27,'u'],[5,'s'],[44,'s'],[-5,'s']]},
  {n:4, w:'p_sunil', s:[[-16,'s'],[-6,'s'],[44,'s'],[-56,'s'],[34,'s']]},
  {n:5, w:'p_bijay', s:[[6,'s'],[-26,'f'],[6,'s'],[18,'s'],[-4,'s']]}
 ]},
{id:'g_d2_4', dayId:'day2', name:'Game 3', variant:'classic', date:'2026-10-04', partial:false,
 playerIds:['p_sunil','p_bipin','p_ritik','p_saram','p_nitesh'],
 totals:{p_sunil:-45,p_bipin:81,p_ritik:-98,p_saram:71,p_nitesh:-9},
 rounds:[
  {n:1, w:'p_bipin', s:[[-57,'u'],[57,'s'],[25,'s'],[25,'s'],[-50,'s']]},
  {n:2, w:'p_sunil', s:[[61,'s'],[-42,'u'],[-42,'u'],[-42,'u'],[65,'s']]},
  {n:3, w:'p_bipin', s:[[-28,'s'],[-6,'s'],[-3,'s'],[72,'s'],[-35,'u']]},
  {n:4, w:'p_bipin', s:[[-30,'u'],[88,'s'],[-30,'u'],[-30,'u'],[2,'s']]},
  {n:5, w:'p_saram', s:[[9,'s'],[-16,'s'],[-48,'u'],[46,'s'],[9,'s']]}
 ]},
/* ---------- DAY 3 (Oct 4 evening) ---------- */
{id:'g_d3_1', dayId:'day3', name:'Game 1', variant:'classic', date:'2026-10-04', partial:false,
 playerIds:['p_bijay','p_bipin','p_saram','p_nitesh'],
 totals:{p_bijay:73,p_bipin:-15,p_saram:162,p_nitesh:-220},
 rounds:[
  {n:1, w:'p_saram', s:[[-44,'u'],[31,'s'],[57,'s'],[-44,'u']]},
  {n:2, w:'p_saram', s:[[-30,'u'],[-30,'u'],[83,'s'],[-23,'s']]},
  {n:3, w:'p_saram', s:[[-9,'s'],[-24,'u'],[57,'s'],[-24,'u']]},
  {n:4, w:'p_saram', s:[[-3,'s'],[-30,'u'],[33,'s'],[0,'d']]},
  {n:5, w:'p_bijay', s:[[50,'s'],[28,'d'],[-39,'s'],[-39,'s']]},
  {n:6, w:'p_saram', s:[[45,'s'],[-15,'s'],[2,'s'],[-32,'d']]},
  {n:7, w:'p_bijay', s:[[3,'s'],[19,'s'],[-1,'s'],[-21,'s']]},
  {n:8, w:'p_bijay', s:[[61,'s'],[6,'s'],[-30,'s'],[-37,'u']]}
 ]},
{id:'g_d3_2', dayId:'day3', name:'Murder Game', variant:'murder', date:'2026-10-04', partial:false,
 playerIds:['p_saram','p_ashu','p_vj','p_sumit','p_shishi','p_sunira'],
 totals:{p_saram:162,p_ashu:213,p_vj:-105,p_sumit:12,p_shishi:-178,p_sunira:-104},
 rounds:[
  {n:1, w:'p_ashu',   s:[[-28,'u'],[140,'s'],[-28,'u'],[-28,'u'],[-28,'u'],[-28,'u']]},
  {n:2, w:'p_sumit',  s:[[10,'s'],[-2,'s'],[-39,'u'],[109,'s'],[-39,'u'],[-39,'u']]},
  {n:3, w:'p_saram',  s:[[50,'s'],[-17,'s'],[7,'s'],[13,'s'],[1,'s'],[-54,'u']]},
  {n:4, w:'p_ashu',   s:[[93,'s'],[91,'s'],[-46,'u'],[-46,'u'],[-46,'u'],[-46,'u']]},
  {n:5, w:'p_sunira', s:[[-51,'u'],[-2,'s'],[16,'s'],[28,'s'],[-51,'u'],[60,'s']]},
  {n:6, w:'p_saram',  s:[[88,'s'],[3,'s'],[-15,'s'],[-64,'u'],[-15,'s'],[3,'s']]}
 ]},
{id:'g_d3_3', dayId:'day3', name:'Murder Game 2', variant:'murder', date:'2026-10-04', partial:false,
 playerIds:['p_saram','p_ashu','p_arun','p_sunira','p_shishi'],
 totals:{p_saram:-22,p_ashu:7,p_arun:4,p_sunira:34,p_shishi:-23},
 rounds:[
  {n:1, w:'p_saram',  s:[[53,'s'],[9,'s'],[-23,'u'],[-23,'u'],[-16,'s']]},
  {n:2, w:'p_sunira', s:[[3,'s'],[-12,'s'],[-29,'u'],[67,'s'],[-29,'u']]},
  {n:3, w:'p_ashu',   s:[[-19,'u'],[69,'s'],[-19,'u'],[-19,'u'],[-12,'s']]},
  {n:4, w:'p_sunira', s:[[-37,'u'],[-37,'u'],[80,'s'],[31,'s'],[-37,'u']]},
  {n:5, w:'p_shishi', s:[[-22,'u'],[-22,'u'],[-5,'s'],[-22,'u'],[71,'s']]}
 ]}
]};
