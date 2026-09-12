(() => {
  'use strict';

  const data = {
    schemaVersion: 3,
    endpoint: 'data/leaderboards.json',
    source: {
      state: 'test',
      authority: 'pixel-test-fixture',
      label: 'TEST DATA · real usernames, fictional values',
      generatedAt: '2026-09-12T13:40:00Z'
    },
    testRoster: ['Klezee','PxlMads','Grian','MumboJumbo','Xisuma','Etho','Docm77','GeminiTay','Notch','jeb_','Dinnerbone','Technoblade'],
    testValues: {
      'blocks-mined': ['38,421,905','34,998,124','31,550,009','29,782,441','27,115,308','24,890,776','21,440,210','18,903,552','17,440,183','16,208,914','14,995,702','13,881,445'],
      money: ['4.28B','3.96B','3.51B','3.08B','2.74B','2.31B','1.98B','1.67B','1.42B','1.21B','1.03B','884M'],
      'money-earned': ['18.42B','17.05B','15.88B','14.31B','13.47B','12.09B','10.77B','9.84B','8.91B','8.06B','7.34B','6.68B'],
      'nexus-points': ['182,400','174,950','169,220','151,880','143,640','132,100','121,470','109,900','99,440','90,210','81,660','74,380'],
      level: ['100','98','96','94','91','89','86','84','82','80','78','76'],
      prestige: ['18','17','16','15','14','13','12','11','10','9','8','7'],
      legacy: ['7','7','6','6','5','5','4','4','3','3','2','2'],
      'quests-completed': ['1,248','1,196','1,142','1,091','1,038','987','941','899','861','824','788','752'],
      kills: ['286,420','274,115','259,840','247,003','231,554','219,870','204,118','192,406','181,772','171,240','161,809','152,487'],
      'boss-kills': ['1,882','1,745','1,631','1,507','1,399','1,268','1,151','1,046','952','864','783','711'],
      'island-level': ['742','716','689','661','638','612','589','561','538','516','493','471'],
      'skyblock-quests': ['438','421','405','389','374','359','343','327','311','296','281','267'],
      'raphael-kills': ['428','401','379','352','330','306','287','263','244','226','209','193'],
      'azazel-kills': ['391','372','348','327','306','284','263','244','226','209','193','178'],
      'abyss-astral-kills': ['284','269','251','236','219','203','188','174','161','149','137','126'],
      'instance-clears': ['1,104','1,047','996','941','887','834','782','731','684','641','601','564'],
      'highest-difficulty': ['10','10','9','9','8','8','7','7','6','6','5','5'],
      'fastest-clear': ['03:41.82','03:48.19','03:55.44','04:02.11','04:09.73','04:18.05','04:26.67','04:34.92','04:43.28','04:52.10','05:01.44','05:11.06'],
      'bestiary-completion': ['96.4%','94.8%','92.9%','90.6%','88.7%','86.2%','83.9%','81.5%','79.1%','76.8%','74.4%','72.1%'],
      'talisman-codex': ['100%','98.2%','96.5%','94.7%','92.9%','91.2%','89.4%','87.6%','85.9%','84.1%','82.4%','80.8%']
    },
    categories: [
      { id:'mining', label:'Mining', short:'MIN', description:'Records built through mining and resource progression.', metrics:[{ id:'blocks-mined', label:'Blocks Mined', kicker:'Lifetime mining', description:'Total blocks mined across the tracked Pixel Network progression loop.', unit:'blocks', entries:[] }] },
      { id:'economy', label:'Economy', short:'ECO', description:'Wealth and lifetime economy records.', metrics:[{ id:'money', label:'Money', kicker:'Current balance', description:'Current Money balance held by each player.', unit:'money', entries:[] },{ id:'money-earned', label:'Money Earned', kicker:'Lifetime economy', description:'Lifetime Money generated through tracked gameplay activity.', unit:'money', entries:[] },{ id:'nexus-points', label:'Nexus Points', kicker:'Endgame currency', description:'Current Nexus Points balance earned through Nexus-facing progression.', unit:'points', entries:[] }] },
      { id:'progression', label:'Progression', short:'PRO', description:'Account milestones across the main Pixel journey.', metrics:[{ id:'level', label:'Level', kicker:'Account progression', description:'Highest current account level within the main progression path.', unit:'level', entries:[] },{ id:'prestige', label:'Prestige', kicker:'Account progression', description:'Highest current Prestige reached by each account.', unit:'prestige', entries:[] },{ id:'legacy', label:'Legacy', kicker:'Account progression', description:'Highest current Legacy reached by each account.', unit:'legacy', entries:[] },{ id:'quests-completed', label:'Quests Completed', kicker:'Journey completion', description:'Total tracked quests completed across supported progression systems.', unit:'quests', entries:[] }] },
      { id:'combat', label:'Combat', short:'CMB', description:'Combat activity and total boss victories.', metrics:[{ id:'kills', label:'Kills', kicker:'Lifetime combat', description:'Total tracked kills accumulated through combat.', unit:'kills', entries:[] },{ id:'boss-kills', label:'Boss Kills', kicker:'Boss record', description:'Combined tracked boss victories across Pixel Network.', unit:'kills', entries:[] }] },
      { id:'skyblock', label:'Skyblock', short:'SKY', description:'Island progression records.', metrics:[{ id:'island-level', label:'Island Level', kicker:'Island progression', description:'Highest tracked Skyblock island level.', unit:'level', entries:[] },{ id:'skyblock-quests', label:'Skyblock Quests', kicker:'Island objectives', description:'Total tracked Skyblock quests completed.', unit:'quests', entries:[] }] },
      { id:'nexus', label:'Nexus', short:'NXS', description:'Endgame encounter and Instance records.', metrics:[{ id:'raphael-kills', label:'Raphael Kills', kicker:'Nexus encounter', description:'Tracked victories against Raphael.', unit:'kills', entries:[] },{ id:'azazel-kills', label:'Azazel Kills', kicker:'Nexus encounter', description:'Tracked victories against Azazel.', unit:'kills', entries:[] },{ id:'abyss-astral-kills', label:'Abyss / Astral Kills', kicker:'Nexus encounter', description:'Tracked victories for the Abyss / Astral encounter.', unit:'kills', entries:[] },{ id:'instance-clears', label:'Instance Clears', kicker:'Endgame completion', description:'Total completed Nexus Instances.', unit:'clears', entries:[] },{ id:'highest-difficulty', label:'Highest Difficulty', kicker:'Endgame mastery', description:'Highest verified Instance difficulty cleared.', unit:'difficulty', entries:[] },{ id:'fastest-clear', label:'Fastest Clear', kicker:'Endgame speed', description:'Fastest verified comparable Instance clear time.', unit:'time', entries:[] }] },
      { id:'collection', label:'Collection', short:'COL', description:'Completion-focused records across persistent collections.', metrics:[{ id:'bestiary-completion', label:'Bestiary Completion', kicker:'Collection progress', description:'Highest tracked Bestiary completion.', unit:'completion', entries:[] },{ id:'talisman-codex', label:'Talisman Codex', kicker:'Collection progress', description:'Highest tracked Talisman Codex completion.', unit:'completion', entries:[] }] }
    ]
  };

  window.PIXEL_LEADERBOARDS = Object.freeze(data);
})();
