/* Character-independent lore. No guide sections, route order, or progress belong here.
   Narrative text is provided in English and Simplified Chinese.
   Quest IDs on beats identify in-game tellings, never narrative order. */
(function (root) {
  'use strict';
  const L = (en, zh = '') => ({ en, zh });
  const sources = {
    'ul-chain': { title: L('Lescovar Incident quest chain', '莱斯科瓦事件任务链'), url: 'https://warcraft.wiki.gg/wiki/Lescovar_Incident_quest_chain', note: L('Each quest of The Unsent Letter, from VanCleef’s letter to the audience in the Keep.', '《未寄出的信》的每个任务，从范克里夫的信到要塞中的觐见。') },
    'ul-onyxia': { title: L('Onyxia', '奥妮克希亚'), url: 'https://warcraft.wiki.gg/wiki/Onyxia', note: L('Onyxia as Lady Katrana Prestor, the Stonemasons’ quarrel, and the king’s abduction.', '化身卡特拉娜·普瑞斯托的奥妮克希亚、石匠之争与国王被掳。') },
    'md-start': { title: L('The Missing Diplomat', '失踪的使节'), url: 'https://www.wowhead.com/classic/quest=1274', note: L('The chain’s quest text, from Bishop DeLavey to Jaina Proudmoore (Wowhead Classic, quests 1274 to 1267).', '这条任务链的任务文本，从德拉维主教到吉安娜·普罗德摩尔（Wowhead 经典旧世，任务 1274 至 1267）。') },
    questiedb: { title: L('QuestieDB', 'QuestieDB'), url: 'https://github.com/Questie/QuestieDB', note: L('Quest links, names, and representative locations for the picked Forever quest chains.', '提供无限服精选任务链的任务关联、名称和代表性地点。') },
    'hy-forever': { title: L('Mount Hyjal in Forever', '无限服的海加尔山'), url: 'https://www.wowhead.com/forever/zone=616/mount-hyjal', note: L('The zone and its Forever inhabitants and quests.', '无限服这一区域的居民和任务。') },
    'hy-zones': { title: L('Forever’s new zones', '无限服的新区域'), url: 'https://www.wowhead.com/forever/guide/zones-maps-locations-rewards', note: L('The aftermath at Hyjal, and Shen’dralas’s ties to the centaur and Dire Maul.', '海加尔山战后的局势，以及辛德拉与半人马和厄运之槌的关系。') },
    'hy-ashes': { title: L('Ashes of the Legion Ascent', '军团高地的灰烬'), url: 'https://www.wowhead.com/forever/quest=92335/ashes-of-the-legion-ascent', note: L('How Azgalor’s remains are used and where they were left after the battle.', '阿兹加洛的遗骸在战后留在何处，以及灰烬的用途。') },
    'rg-forever': { title: L('Riverglades in Forever', '无限服的河林'), url: 'https://www.wowhead.com/forever/zone=16591/riverglades', note: L('The zone, its settlements, and their quests.', '这一区域及其聚落与任务。') },
    'rg-settlements': { title: L('Riverglades settlements and factions', '河林的聚落与阵营'), url: 'https://www.wowhead.com/forever/guide/riverglades-zone-overview', note: L('Farholde Keep, the Horde outpost, and the Steamwheedle shipping route.', '法霍德要塞、部落哨所与热砂港集团的航线。') },
    'rg-farm': { title: L('A farm after the Twilight attack', '暮光之锤袭击后的农庄'), url: 'https://www.wowhead.com/forever/quest=94858/all-thats-left', note: L('A farmer recounts the Twilight’s Hammer’s attack.', '一位农夫回忆暮光之锤的袭击。') },
    'rg-stronghold': { title: L('Krol’dok Stronghold', '克罗多克要塞'), url: 'https://wow.blizzard.cn/news/24301455/index.html', note: L('Blizzard’s account of the ogre raids and the stronghold.', '暴雪对食人魔劫掠与要塞的介绍。') },
    'sd-forever': { title: L('Shen’dralas in Forever', '无限服的辛德拉'), url: 'https://www.wowhead.com/forever/zone=16651/shendralas', note: L('The zone and its quests, inhabitants, and objects.', '这一区域的任务、居民与物件。') },
    'sd-pylons': { title: L('Strange Pylons', '奇怪的水晶塔'), url: 'https://www.wowhead.com/forever/quest=92914/strange-pylons', note: L('The failing pylons, the elementals that guard them, and the brighter crystal inside the temple.', '逐渐失去力量的水晶塔、守护它们的元素生物，以及神殿内仍然明亮的水晶。') },
    'sd-magister': { title: L('Meeting the Magister', '会见魔导师'), url: 'https://www.wowhead.com/forever/quest=93394/meeting-the-magister', note: L('Kirandis explains what the restored pylons mean for the temple’s inhabitants.', '基兰迪斯说明修复水晶塔对神殿居民意味着什么。') },
    'forever-new-zones': { title: L('Blizzard’s Forever launch overview', '暴雪的《魔兽世界》：“无限”上线介绍'), url: 'https://wow.blizzard.cn/news/24315820/index.html', note: L('The new zones, their premises, and their Simplified Chinese names.', '新区域的故事背景及简体中文名称。') },
    'arthas-history': { title: L('The Lich King Triumphant', '巫妖王的胜利'), url: 'https://warcraft.wiki.gg/wiki/The_Lich_King_Triumphant', note: L('Classic in-game history of the plague, Stratholme and Lordaeron’s fall.', '经典旧世的游戏内史料，记述瘟疫、斯坦索姆与洛丹伦的陷落。') },
    'portal-history': { title: L('The Dark Portal and the Fall of Stormwind', '黑暗之门和暴风城的陷落'), url: 'https://warcraft.wiki.gg/wiki/The_Dark_Portal_and_the_Fall_of_Stormwind', note: L('Classic in-game history of the pact that opens the portal.', '经典旧世游戏内史料，记述促成黑暗之门开启的交易。') },
    'hakkar-history': { title: L('The Twin Empires', '双子帝国'), url: 'https://warcraft.wiki.gg/wiki/The_Twin_Empires', note: L('Classic in-game history of the old troll empires and the Gurubashi legacy.', '经典旧世游戏内史料，记述古代巨魔帝国及古拉巴什的历史背景。') },
    'hakkar-wrath': { title: L('Wrath of Soulflayer', '夺灵者的愤怒'), url: 'https://warcraft.wiki.gg/wiki/Wrath_of_Soulflayer', note: L('Classic in-game history of Hakkar and the exile of the Atal’ai.', '经典旧世游戏内史料，记述哈卡与阿塔莱流亡的经过。') },
    'horde-exodus': { title: L('Exodus of the Horde', '部落的远征'), url: 'https://warcraft.wiki.gg/wiki/Exodus_of_the_Horde', note: L('Warcraft III’s account of Thrall’s departure for Kalimdor.', '《魔兽争霸III》中萨尔率部前往卡利姆多的故事。') },
    'al-classic': { title: L('Alterac Mountains in Classic', '经典旧世的奥特兰克山脉'), url: 'https://www.wowhead.com/classic/zone=36/alterac-mountains', note: L('The ogre-held ruins, Strahnbrad and Dalaran’s barrier.', '食人魔占据的废墟、斯坦恩布莱德和达拉然的屏障。') },
    'al-kingdom': { title: L('Alterac’s kingdom', '奥特兰克王国'), url: 'https://warcraft.wiki.gg/wiki/Alterac_(kingdom)', note: L('Perenolde’s betrayal and the rise of the Syndicate.', '匹瑞诺德的背叛与辛迪加的崛起。') },
    'al-plans': { title: L('Foreboding Plans', '预备行动计划'), url: 'https://www.wowhead.com/classic/quest=510/foreboding-plans', note: L('Maleb’s discovery of the Syndicate’s papers.', '马雷布查出辛迪加文件的经过。') },
    'al-rings': { title: L('Noble Deaths', '贵族之死'), url: 'https://www.wowhead.com/classic/quest=512/noble-deaths', note: L('The signet rings and the lords who once betrayed the Alliance.', '印戒，以及曾经背叛联盟的贵族。') },
    'ar-classic': { title: L('Arathi Highlands in Classic', '经典旧世的阿拉希高地'), url: 'https://warcraft.wiki.gg/wiki/Arathi_Highlands_(original)', note: L('Stromgarde, the internment camp and the opposing footholds.', '激流堡、兽人囚营及双方的据点。') },
    'ar-badges': { title: L('Stromgarde Badges', '激流堡徽章'), url: 'https://www.wowhead.com/classic/quest=682/stromgarde-badges', note: L('Captain Nials’s campaign against the Syndicate inside Stromgarde.', '尼艾丝队长在激流堡城内对抗辛迪加的行动。') },
    'ar-call': { title: L('Call to Arms', '短兵相接'), url: 'https://www.wowhead.com/classic/quest=677/call-to-arms', note: L('Drum Fel identifies the threat to Hammerfall.', '德拉姆·费尔查明了落锤镇面临的威胁。') },
    'ar-lords': { title: L('Call to Arms', '短兵相接'), url: 'https://www.wowhead.com/classic/quest=679/call-to-arms', note: L('The ogre leaders are traced to Stromgarde.', '袭击的食人魔首领藏身激流堡。') },
    'ba-classic': { title: L('Badlands in Classic', '经典旧世的荒芜之地'), url: 'https://www.wowhead.com/classic/zone=3/badlands', note: L('The original outpost, terrain, dragon ravine and excavation.', '旧世的前哨、地貌、龙群峡谷与挖掘场。') },
    'ba-lost': { title: L('The Lost Dwarves', '失踪的矮人'), url: 'https://www.wowhead.com/classic/quest=2398/the-lost-dwarves', note: L('The League’s missing party inside Uldaman.', '探险者协会滞留在奥达曼的队伍。') },
    'ba-discs': { title: L('The Platinum Discs', '白金圆盘'), url: 'https://www.wowhead.com/classic/quest=2278/the-platinum-discs', note: L('The watcher’s account and a copy of the discs.', '看守者的讲述与圆盘的抄本。') },
    'bl-classic': { title: L('Blasted Lands in Classic', '经典旧世的诅咒之地'), url: 'https://www.wowhead.com/classic/zone=4/blasted-lands', note: L('Nethergarde, the portal crater and the Tainted Scar.', '守望堡、黑暗之门所在的巨坑和腐烂之痕。') },
    'bl-grace': { title: L('Fall From Grace', '失落的荣耀'), url: 'https://www.wowhead.com/classic/quest=2784/fall-from-grace', note: L('The fallen officer’s account of his command.', '阵亡军官对部下遭遇的讲述。') },
    'bl-stones': { title: L('The Stones That Bind Us', '禁锢我们的石头'), url: 'https://www.wowhead.com/classic/quest=2681/the-stones-that-bind-us', note: L('The binding stones and the names of the servants held by them.', '禁锢之石，以及被它束缚的仆从。') },
    'bl-demon': { title: L('You Are Rakh’likh, Demon', '恶魔拉瑟莱克'), url: 'https://www.wowhead.com/classic/quest=3628/you-are-rakhlikh-demon', note: L('The confrontation on the rise above the Blasted Lands.', '诅咒之地高台上的最后对决。') },
    'ti-classic': { title: L('Tirisfal Glades in Classic', '经典旧世的提瑞斯法林地'), url: 'https://www.wowhead.com/classic/zone=85/tirisfal-glades', note: L('Deathknell, Brill and the Scarlet holdings around Lordaeron.', '丧钟镇、布瑞尔与洛丹伦周围血色十字军的据点。') },
    'ti-awakening': { title: L('Rude Awakening', '突然醒来'), url: 'https://www.wowhead.com/classic/quest=363/rude-awakening', note: L('The first welcome in Deathknell.', '丧钟镇给予新苏醒亡灵的第一次接引。') },
    'ti-scarlet': { title: L('At War With The Scarlet Crusade', '与血色十字军的战争'), url: 'https://www.wowhead.com/classic/quest=370/at-war-with-the-scarlet-crusade', note: L('The Deathguard’s account of Scarlet operations near Brill.', '亡灵卫兵讲述血色十字军在布瑞尔附近的活动。') },
    'ti-plague': { title: L('A New Plague', '新的瘟疫'), url: 'https://www.wowhead.com/classic/quest=367/a-new-plague', note: L('Johaan’s initial account of the apothecaries’ project.', '约翰首次说明药剂师们的计划。') },
    'sp-classic': { title: L('Silverpine Forest in Classic', '经典旧世的银松森林'), url: 'https://www.wowhead.com/classic/zone=130/silverpine-forest', note: L('The Sepulcher, Pyrewood and the closed road to Gilneas.', '瑟伯切尔、焚木村和封闭的吉尔尼斯道路。') },
    'sp-shackles': { title: L('Arugal’s Folly', '阿鲁高的愚行'), url: 'https://www.wowhead.com/classic/quest=99/arugals-folly', note: L('Dawnweaver describes the nightly change in Pyrewood.', '道恩维沃描述焚木村每夜的变化。') },
    'sp-keep': { title: L('Arugal Must Die', '除掉阿鲁高'), url: 'https://www.wowhead.com/classic/quest=1014/arugal-must-die', note: L('Hadrec’s account of Arugal and the stronghold.', '哈德瑞克对阿鲁高和要塞的讲述。') },
    'wp-classic': { title: L('Western Plaguelands in Classic', '经典旧世的西瘟疫之地'), url: 'https://www.wowhead.com/classic/zone=28/western-plaguelands', note: L('The cauldron farms, Andorhal, Caer Darrow and Hearthglen.', '架着瘟疫之锅的农场、安多哈尔、凯尔达隆与壁炉谷。') },
    'wp-cauldrons': { title: L('The Scourge Cauldrons', '瘟疫之锅'), url: 'https://www.wowhead.com/classic/quest=5215/the-scourge-cauldrons', note: L('The Argent Dawn’s inquiry into the Scourge’s use of the farms.', '银色黎明调查天灾军团如何利用农场。') },
    'wp-felstone': { title: L('Target: Felstone Field', '目标：费尔斯通农场'), url: 'https://www.wowhead.com/classic/quest=5216/target-felstone-field', note: L('The cauldron lord and the sample from the farm.', '农场里的护锅领主和样本。') },
    'wp-araj': { title: L('Alas, Andorhal', '啊，安多哈尔！'), url: 'https://www.wowhead.com/classic/quest=211/alas-andorhal', note: L('The confrontation with Araj in the old grain town.', '在昔日粮镇与阿拉基的对抗。') },
    'wp-order': { title: L('In Dreams', '在梦中'), url: 'https://www.wowhead.com/classic/quest=5944/in-dreams', note: L('The end of Taelan’s journey and Tirion’s response.', '泰兰旅程的结局与提里奥的回应。') },
    'ep-classic': { title: L('Eastern Plaguelands in Classic', '经典旧世的东瘟疫之地'), url: 'https://www.wowhead.com/classic/zone=139/eastern-plaguelands', note: L('The chapel, ruined towns and Scarlet fortress in the original zone.', '旧世的礼拜堂、城镇废墟与血色要塞。') },
    'ep-doll': { title: L('Pamela’s Doll', '帕米拉的洋娃娃'), url: 'https://www.wowhead.com/classic/quest=5149/pamelas-doll', note: L('Pamela’s account of her life among the ruins.', '帕米拉讲述自己在废墟中的生活。') },
    'ep-battle': { title: L('The Battle of Darrowshire', '达隆郡的战斗'), url: 'https://www.wowhead.com/classic/quest=5721/the-battle-of-darrowshire', note: L('The recovered relics permit the battle to be seen again.', '找回的遗物让昔日战斗得以重现。') },
    'ep-redpath': { title: L('Return to Chromie', '返回克罗米身边'), url: 'https://www.wowhead.com/classic/quest=5941/return-to-chromie', note: L('The aftermath of the battle and Redpath’s release.', '战斗的余波与雷德帕斯的解脱。') },
    'ep-family': { title: L('Of Forgotten Memories', '遗忘的记忆'), url: 'https://www.wowhead.com/classic/quest=5781/of-forgotten-memories', note: L('Tirion’s effort to reach his son through reminders of their past.', '提里奥试图借往事唤醒儿子的记忆。') },
    'hi-classic': { title: L('Hillsbrad Foothills in Classic', '经典旧世的希尔斯布莱德丘陵'), url: 'https://warcraft.wiki.gg/wiki/Hillsbrad_Foothills_(Classic)', note: L('Southshore, Tarren Mill and the intact farms and estates.', '南海镇、塔伦米尔和尚未毁去的农场与庄园。') },
    'hi-fields': { title: L('Battle of Hillsbrad', '希尔斯布莱德之战'), url: 'https://www.wowhead.com/classic/quest=527/battle-of-hillsbrad', note: L('Darthalia’s orders against the farming community.', '达萨利亚下令袭击农庄。') },
    'hi-elixir': { title: L('Elixir of Pain', '痛苦药剂'), url: 'https://www.wowhead.com/classic/quest=502/elixir-of-pain', note: L('Lydon’s trial of the elixir on Stanley.', '林度恩用斯坦雷试验药剂。') },
    'ht-classic': { title: L('The Hinterlands in Classic', '经典旧世的辛特兰'), url: 'https://www.wowhead.com/classic/zone=47/the-hinterlands', note: L('The Wildhammer and troll settlements of the original highlands.', '旧世高地上的蛮锤和巨魔聚落。') },
    'ht-elder': { title: L('Kidnapped Elder Torntusk!', '断齿长者被绑架了！'), url: 'https://www.wowhead.com/classic/quest=7845/kidnapped-elder-torntusk', note: L('The Revantusk elder held in Jintha’Alor.', '被关押在辛萨罗的恶齿长者。') },
    'ht-sharpbeak': { title: L('Saving Sharpbeak', '拯救沙普比克'), url: 'https://www.wowhead.com/classic/quest=2994/saving-sharpbeak', note: L('The gryphon held at the top of Jintha’Alor.', '被关在辛萨罗高处的狮鹫。') },
    'sg-classic': { title: L('Searing Gorge in Classic', '经典旧世的灼热峡谷'), url: 'https://www.wowhead.com/classic/zone=51/searing-gorge', note: L('The Cauldron, the Slag Pit and the independent smiths at Thorium Point.', '大熔炉、熔渣之池与瑟银哨塔独立的铁匠。') },
    'sg-brotherhood': { title: L('Gaining Acceptance', '获得信任'), url: 'https://www.wowhead.com/classic/quest=7737/gaining-acceptance', note: L('Burninate’s materials and the Brotherhood’s standing.', '博恩奈特所需的材料与瑟银兄弟会的态度。') },
    'sg-flame': { title: L('The Flawless Flame', '无瑕之焰'), url: 'https://www.wowhead.com/classic/quest=3442/the-flawless-flame', note: L('Kalaran’s search for a flame.', '卡拉然寻找火种的经过。') },
    'sg-ablaze': { title: L('Set Them Ablaze!', '放火烧他们！'), url: 'https://www.wowhead.com/classic/quest=3463/set-them-ablaze', note: L('Kalaran’s torch is used against the Dark Iron watchtowers.', '卡拉然的火炬被用来对付黑铁哨塔。') },
    'sg-shaft': { title: L('Forging the Shaft', '铸造火炬杆'), url: 'https://www.wowhead.com/classic/quest=3443/forging-the-shaft', note: L('Dark Iron material for the torch.', '打造火炬所需的黑铁材料。') },
    'sg-reveal': { title: L('Kalaran’s disguise', '卡拉然的伪装'), url: 'https://warcraft.wiki.gg/wiki/Kalaran', note: L('The end of the Classic torch chain reveals the drake’s identity.', '经典旧世火炬任务线的结尾揭示了这头龙的身份。') },
    'bs-classic': { title: L('Burning Steppes in Classic', '经典旧世的燃烧平原'), url: 'https://www.wowhead.com/classic/zone=46/burning-steppes', note: L('The old ruins, Blackrock Mountain and the outposts on the plain.', '昔日废墟、黑石山与平原上的据点。') },
    'bs-lair': { title: L('Blackwing Lair', '黑翼之巢'), url: 'https://warcraft.wiki.gg/wiki/Blackwing_Lair', note: L('The original raid’s ruler and experiments.', '原版团队副本中的统治者及其实验。') },
    'bs-menace': { title: L('Dragonkin Menace', '黑龙的威胁'), url: 'https://www.wowhead.com/classic/quest=4182/dragonkin-menace', note: L('The report by Helendis Riverhorn at Morgan’s Vigil.', '摩根的岗哨中赫林迪斯·河角的报告。') },
    'bs-true': { title: L('The True Masters', '真正的主人'), url: 'https://www.wowhead.com/classic/quest=4183/the-true-masters', note: L('The report reaches Solomon in Lakeshire.', '报告送到了湖畔镇的所罗门手中。') },
    'bs-marshal': { title: L('Marshal Windsor', '温德索尔元帅'), url: 'https://www.wowhead.com/classic/quest=4241/marshal-windsor', note: L('The search for the missing marshal leads into Blackrock Depths.', '寻找失踪元帅的行动通往黑石深渊。') },
    'bs-note': { title: L('A Crumpled Up Note', '弄皱的便笺'), url: 'https://www.wowhead.com/classic/quest=4264/a-crumpled-up-note', note: L('The evidence that gives the investigation new life.', '让调查得以继续的证据。') },
    'bs-jail': { title: L('Jail Break!', '冲破牢笼！'), url: 'https://www.wowhead.com/classic/quest=4322/jail-break', note: L('Windsor finally leaves the Dark Iron prison.', '温德索尔终于离开黑铁矮人的监狱。') },
    'bs-rend': { title: L('Oculus Illusions', '黑龙幻象'), url: 'https://www.wowhead.com/classic/quest=6569/oculus-illusions', note: L('The tale of the Blackrock claim to the Horde leadership.', '黑石氏族争夺部落领导权的故事。') },
    'bs-orders': { title: L('Blackhand’s Command', '黑手的命令'), url: 'https://www.wowhead.com/classic/quest=7761/blackhands-command', note: L('The orb and the hidden way to Blackwing Lair.', '宝珠和通往黑翼之巢的隐秘道路。') },
    'dw-classic': { title: L('Deadwind Pass in Classic', '经典旧世的逆风小径'), url: 'https://warcraft.wiki.gg/wiki/Deadwind_Pass_(Classic)', note: L('The pass, its ogres and the closed tower above the deserted village.', '小径、食人魔，以及废弃村庄上方大门紧闭的高塔。') },
    'dw-guardian': { title: L('The Last Guardian', '最后的守护者'), url: 'https://warcraft.wiki.gg/wiki/The_Last_Guardian_(History_of_Warcraft)', note: L('Classic in-game history of Sargeras’s influence on Medivh.', '经典旧世游戏内史料，记述萨格拉斯对麦迪文的影响。') },
    'dw-staff': { title: L('Atiesh, Greatstaff of the Guardian', '埃提耶什，守护者的传说之杖'), url: 'https://www.wowhead.com/classic/item=22589/atiesh-greatstaff-of-the-guardian', note: L('The restored staff and its portal to Karazhan.', '修复后的法杖与通往卡拉赞的传送门。') },
    'dw-cleansing': { title: L('Atiesh, the Befouled Greatstaff', '埃提耶什，被玷污的传说之杖'), url: 'https://www.wowhead.com/classic/quest=9251/atiesh-the-befouled-greatstaff', note: L('The quest to cleanse the Guardian’s staff.', '净化守护者法杖的任务。') },
    'sv-classic': { title: L('Stranglethorn Vale in Classic', '经典旧世的荆棘谷'), url: 'https://warcraft.wiki.gg/wiki/Stranglethorn_Vale_(Classic)', note: L('The undivided jungle, its ports and old troll settlements.', '尚未分割的丛林、港口与巨魔旧聚落。') },
    'sv-pirates': { title: L('The Bloodsail Buccaneers', '血帆海盗'), url: 'https://www.wowhead.com/classic/quest=597/the-bloodsail-buccaneers', note: L('Fleet plans recovered near Booty Bay.', '在藏宝海湾附近缴获的海盗舰队计划。') },
    'sv-heart': { title: L('The Heart of Hakkar', '哈卡之心'), url: 'https://www.wowhead.com/classic/quest=8183/the-heart-of-hakkar', note: L('Molthor recognizes the remains brought back to Yojamba Isle.', '莫托尔认出带回尤亚姆巴岛的遗骸。') },
    'ss-classic': { title: L('Swamp of Sorrows in Classic', '经典旧世的悲伤沼泽'), url: 'https://warcraft.wiki.gg/wiki/Swamp_of_Sorrows_(Classic)', note: L('Stonard, the Pool of Tears and the original sunken temple.', '斯通纳德、泪水之池与旧世的沉没神庙。') },
    'ss-temple': { title: L('Into The Temple of Atal’Hakkar', '进入阿塔哈卡神庙'), url: 'https://www.wowhead.com/classic/quest=1475/into-the-temple-of-atalhakkar', note: L('The Explorers’ League seeks the tablets in the submerged temple.', '探险者协会寻找水下神庙里的石板。') },
    'ss-avatar': { title: L('The God Hakkar', '神灵哈卡'), url: 'https://www.wowhead.com/classic/quest=3528/the-god-hakkar', note: L('The invocation of Hakkar’s avatar in the temple.', '在神庙召唤哈卡化身。') },
    'uc-classic': { title: L('Undercity and its quarters', '幽暗城及其城区'), url: 'https://warcraft.wiki.gg/wiki/Undercity_(original)', note: L('The underground city, its founding and the original rulers.', '地下城市的创建、布局和最初的统治者。') },
    'uc-report': { title: L('Battle of Hillsbrad', '希尔斯布莱德之战'), url: 'https://www.wowhead.com/classic/quest=550/battle-of-hillsbrad', note: L('Darthalia forwards her report to Varimathras.', '达萨利亚把战报送给瓦里玛萨斯。') },
    'uc-allies': { title: L('Forsaken Aid', '被遗忘者的援助'), url: 'https://www.wowhead.com/classic/quest=1064/forsaken-aid', note: L('Magatha arranges contact with Apothecary Zamah.', '玛加萨安排与药剂师扎玛联络。') },
    'horde-founding': { title: L('The Founding of Durotar', '杜隆塔尔的建立'), url: 'https://warcraft.wiki.gg/wiki/The_Founding_of_Durotar', note: L('The Warcraft III campaign about the settlers and the Theramore conflict.', '《魔兽争霸III》中关于定居者与塞拉摩冲突的战役。') },
    'mount-hyjal': { title: L('The Battle of Mount Hyjal', '海加尔山之战'), url: 'https://warcraft.wiki.gg/wiki/The_Battle_of_Mount_Hyjal_(History_of_Warcraft)', note: L('Original manual account of the fighting at Nordrassil.', '原版手册对诺达希尔之战的记述。') },
    'dt-classic': { title: L('Durotar in Classic', '经典旧世的杜隆塔尔'), url: 'https://www.wowhead.com/classic/zone=14/durotar', note: L('The coast and settlement of the orcs and Darkspear in Classic.', '经典旧世时期兽人与暗矛居住的海岸和聚落。') },
    'dt-isles': { title: L('Zalazane', '扎拉赞'), url: 'https://www.wowhead.com/classic/quest=826/zalazane', note: L('Gadrin’s account of the witch doctor’s hold on the islands.', '加德林讲述巫医如何控制岛屿。') },
    'dt-tiragarde': { title: L('Vanquish the Betrayers', '背信弃义的人类'), url: 'https://www.wowhead.com/classic/quest=784/vanquish-the-betrayers', note: L('Gar’Thok’s account of the troops still in the keep.', '加索克讲述仍驻守在城堡里的士兵。') },
    'dt-skull': { title: L('Skull Rock', '骷髅石'), url: 'https://www.wowhead.com/classic/quest=827/skull-rock', note: L('Margoz points to the cultists in the cave.', '玛高兹指出洞穴中的邪教徒。') },
    'mg-classic': { title: L('Mulgore in Classic', '经典旧世的莫高雷'), url: 'https://www.wowhead.com/classic/zone=215/mulgore', note: L('The bluffs, hunting grounds and lowland settlements.', '高崖、猎场和低地聚落。') },
    'mg-rites': { title: L('Rites of the Earthmother', '大地母亲仪祭'), url: 'https://www.wowhead.com/classic/quest=755/rites-of-the-earthmother', note: L('The rites are explained at Camp Narache.', '纳拉其营地对仪祭的说明。') },
    'mg-hunt': { title: L('The Hunt Begins', '开始狩猎'), url: 'https://www.wowhead.com/classic/quest=747/the-hunt-begins', note: L('The first hunt brings food and pelts to Camp Narache.', '初次狩猎为纳拉其营地带来食物和兽皮。') },
    'mg-venture': { title: L('The Venture Co.', '风险投资公司'), url: 'https://www.wowhead.com/classic/quest=764/the-venture-co', note: L('Morin speaks about the mining operation in the hills.', '摩林谈及山丘里的采矿活动。') },
    'br-classic': { title: L('The Barrens in Classic', '经典旧世的贫瘠之地'), url: 'https://warcraft.wiki.gg/wiki/Barrens_(Classic)', note: L('The undivided plains and the settlements on the inland roads.', '尚未分割的草原及内陆道路沿线的聚落。') },
    'br-oases': { title: L('Altered Beings', '变异的生物'), url: 'https://www.wowhead.com/classic/quest=880/altered-beings', note: L('Tonga compares the effects of the power at the oases.', '图加比较绿洲中的力量造成的影响。') },
    'br-naralex': { title: L('Hamuul Runetotem', '哈缪尔·符文图腾'), url: 'https://www.wowhead.com/classic/quest=1489/hamuul-runetotem', note: L('The druids’ concern over what happened to the expedition.', '德鲁伊对考察队遭遇的关切。') },
    'br-nightmare': { title: L('In Nightmares', '在噩梦中'), url: 'https://www.wowhead.com/classic/quest=3369/in-nightmares', note: L('The shard left after the attempt to wake Naralex.', '尝试唤醒纳拉雷克斯之后留下的碎片。') },
    'br-pirates': { title: L('Southsea Freebooters', '南海海盗'), url: 'https://www.wowhead.com/classic/quest=887/southsea-freebooters', note: L('Gazlowe speaks about the pirates operating near Ratchet.', '加兹鲁维谈到在棘齿城附近活动的海盗。') },
    'te-classic': { title: L('Teldrassil in Classic', '经典旧世的泰达希尔'), url: 'https://www.wowhead.com/classic/zone=141/teldrassil', note: L('The new tree, its bough settlements, and its port to the mainland.', '新树、枝干间的聚落及通往大陆的港口。') },
    'te-moss': { title: L('Timberling Sprouts', '林精的新芽'), url: 'https://www.wowhead.com/classic/quest=919/timberling-sprouts', note: L('Denalan’s work with the creatures at Lake Al’Ameth.', '德纳兰对奥拉密斯湖畔生灵的研究。') },
    'te-oracle': { title: L('Crown of the Earth', '大地之冠'), url: 'https://www.wowhead.com/classic/quest=934/crown-of-the-earth', note: L('The moonwell at the Oracle Glade.', '神谕林地的月亮井。') },
    'te-crown': { title: L('Crown of the Earth', '大地之冠'), url: 'https://www.wowhead.com/classic/quest=935/crown-of-the-earth', note: L('The collected water goes to Darnassus and the druids explain their concern for the tree.', '收集的井水送往达纳苏斯，德鲁伊说出对新树的担忧。') },
    'tn-classic': { title: L('Thousand Needles in Classic', '经典旧世的千针石林'), url: 'https://warcraft.wiki.gg/wiki/Thousand_Needles_(Classic)', note: L('The original dry canyon and salt-flat raceway.', '原本干燥的峡谷和盐滩上的赛道。') },
    'tn-centaur': { title: L('Pacify the Centaur', '平息半人马'), url: 'https://www.wowhead.com/classic/quest=4841/pacify-the-centaur', note: L('The watch at Freewind and the local centaur raids.', '乱风岗的守军与当地半人马的袭击。') },
    'tn-faith': { title: L('Test of Faith', '信仰的试炼'), url: 'https://www.wowhead.com/classic/quest=1149/test-of-faith', note: L('Dorn’s trial on the cliffs.', '多恩在峭壁上安排的试炼。') },
    'tn-shells': { title: L('Hardened Shells', '硬化龟壳'), url: 'https://www.wowhead.com/classic/quest=1105/hardened-shells', note: L('Wizzle’s proposal for a racing part.', '维兹尔对赛车零件的构想。') },
    'de-classic': { title: L('Desolace in Classic', '经典旧世的凄凉之地'), url: 'https://warcraft.wiki.gg/wiki/Desolace_storyline_(Classic)', note: L('The outposts, clan rivalry and Maraudon stories.', '前哨、部族纷争与玛拉顿的故事。') },
    'de-magram': { title: L('Magram Alliance', '玛格拉姆部族'), url: 'https://www.wowhead.com/classic/quest=1367/magram-alliance', note: L('Terms for an alliance with the Magram.', '与玛格拉姆结盟的条件。') },
    'de-gelkis': { title: L('Gelkis Alliance', '吉尔吉斯部族'), url: 'https://www.wowhead.com/classic/quest=1368/gelkis-alliance', note: L('Terms for an alliance with the Gelkis.', '与吉尔吉斯结盟的条件。') },
    'de-scepter': { title: L('Legends of Maraudon', '玛拉顿的传说'), url: 'https://www.wowhead.com/classic/quest=7044/legends-of-maraudon', note: L('Cavindra’s account of the scepter and Celebras.', '凯雯德拉讲述节杖和塞雷布拉斯的经历。') },
    'de-seed': { title: L('Seed of Life', '生命之种'), url: 'https://www.wowhead.com/classic/quest=7066/seed-of-life', note: L('Zaetar entrusts a seed to Remulos in Moonglade.', '扎尔塔托人把种子送给月光林地的雷姆洛斯。') },
    'fe-classic': { title: L('Feralas in Classic', '经典旧世的菲拉斯'), url: 'https://www.wowhead.com/classic/zone=357/feralas', note: L('The island fortress, the tauren camp and the old forest city.', '岛上要塞、牛头人营地与林中古城。') },
    'fe-dire': { title: L('Dire Maul in Classic', '经典旧世的厄运之槌'), url: 'https://warcraft.wiki.gg/wiki/Dire_Maul_(Classic)', note: L('The history of Eldre’Thalas and its divided ruins.', '埃雷萨拉斯的历史，以及被各方分占的废墟。') },
    'fe-naga': { title: L('The Ruins of Solarsal', '索兰萨尔废墟'), url: 'https://www.wowhead.com/classic/quest=2866/the-ruins-of-solarsal', note: L('The Sentinels’ investigation of the nearby naga.', '哨兵调查在附近现身的纳迦。') },
    'fe-ogres': { title: L('Unfinished Gordok Business', '戈多克食人魔的事务'), url: 'https://www.wowhead.com/classic/quest=7703/unfinished-gordok-business', note: L('The position a new Gordok king holds among the ogres.', '戈多克新王在食人魔中的地位。') },
    'fe-prince': { title: L('The Treasure of the Shen’dralar', '辛德拉的宝藏'), url: 'https://www.wowhead.com/classic/quest=7462/the-treasure-of-the-shendralar', note: L('The confrontation at the heart of the ruined city.', '古城深处的对抗。') },
    'dm-classic': { title: L('Dustwallow Marsh in Classic', '经典旧世的尘泥沼泽'), url: 'https://www.wowhead.com/classic/zone=15/dustwallow-marsh', note: L('Theramore, Brackenwall Village and the original marsh settlements.', '塞拉摩、蕨墙村及旧世沼泽中的聚落。') },
    'dm-inn': { title: L('Shady Rest Inn', '树荫旅店'), url: 'https://warcraft.wiki.gg/wiki/Shady_Rest_Inn', note: L('Use the clues present in the original game.', '查阅原版游戏留下的线索。') },
    'dm-hoofprints': { title: L('Suspicious Hoofprints', '可疑的蹄印'), url: 'https://www.wowhead.com/classic/quest=1268/suspicious-hoofprints', note: L('Tracks left near the burned inn.', '烧毁的旅店附近留下的踪迹。') },
    'dm-amulet': { title: L('Drakefire Amulet', '龙火护符'), url: 'https://www.wowhead.com/classic/quest=6502/drakefire-amulet', note: L('The old path to confronting the black brood.', '对抗黑龙后裔的旧世故事。') },
    'ta-classic': { title: L('Tanaris in Classic', '经典旧世的塔纳利斯'), url: 'https://www.wowhead.com/classic/zone=440/tanaris', note: L('The inland town, coast, Sandfury city and Caverns of Time.', '内陆城镇、海岸、沙怒巨魔城市与时光之穴。') },
    'ta-pirates': { title: L('Southsea Shakedown', '南海复仇'), url: 'https://www.wowhead.com/classic/quest=8366/southsea-shakedown', note: L('The pirates threatening Steamwheedle Port.', '威胁热砂港的南海海盗。') },
    'ta-scarab': { title: L('Scarab Shells', '甲虫的壳'), url: 'https://www.wowhead.com/classic/quest=2865/scarab-shells', note: L('Tran’rek’s concern about the scarab shells.', '特兰雷克关心的甲虫壳。') },
    'ta-spirits': { title: L('Screecher Spirits', '尖啸者的灵魂'), url: 'https://www.wowhead.com/classic/quest=3520/screecher-spirits', note: L('Yeh’kinya begins investigating the history of Hakkar.', '叶基亚着手调查哈卡的历史。') },
    'ta-egg': { title: L('The Ancient Egg', '远古之卵'), url: 'https://www.wowhead.com/classic/quest=4787/the-ancient-egg', note: L('The object sought in Jintha’Alor.', '在辛萨罗寻找的物件。') },
    'az-classic': { title: L('Azshara in Classic', '经典旧世的艾萨拉'), url: 'https://www.wowhead.com/classic/zone=16/azshara', note: L('Eldarath, Valormok and the original coastline.', '埃达拉斯、瓦罗莫克与旧世海岸线。') },
    'az-tablets': { title: L('Stealing Knowledge', '搜索知识'), url: 'https://www.wowhead.com/classic/quest=3517/stealing-knowledge', note: L('Jediga’s interest in the tablets at Eldarath.', '杰迪加对埃达拉斯石板的兴趣。') },
    'az-water': { title: L('Poisoned Water', '被囚禁的水元素'), url: 'https://www.wowhead.com/classic/quest=6804/poisoned-water', note: L('The Duke’s work against corrupted elementals.', '公爵对付受腐化元素生物的行动。') },
    'az-core': { title: L('Eye of the Emberseer', '艾博希尔之眼'), url: 'https://www.wowhead.com/classic/quest=6821/eye-of-the-emberseer', note: L('Hydraxis’s pursuit of servants of the Firelord.', '海达克西斯追查炎魔之王的仆从。') },
    'fw-classic': { title: L('Felwood in Classic', '经典旧世的费伍德森林'), url: 'https://warcraft.wiki.gg/wiki/Felwood_(Classic)', note: L('The corruption and the settlements that endure along the road.', '道路沿线的腐化及仍然存续的聚落。') },
    'fw-cleansing': { title: L('Cleansing Felwood', '净化费伍德'), url: 'https://www.wowhead.com/classic/quest=4101/cleansing-felwood', note: L('The druids’ method of studying and treating corruption.', '德鲁伊研究和处理腐化的方法。') },
    'fw-timbermaw': { title: L('Timbermaw Ally', '木喉熊怪的盟友'), url: 'https://www.wowhead.com/classic/quest=8460/timbermaw-ally', note: L('Grazle’s request and the fighting with the Deadwood.', '格拉兹的请求和对死木熊怪的战事。') },
    'ug-classic': { title: L('Un’Goro Crater in Classic', '经典旧世的安戈洛环形山'), url: 'https://www.wowhead.com/classic/zone=490/ungoro-crater', note: L('The basin, northern camp and landscape around the pylons.', '盆地、北方营地及水晶塔周围的地貌。') },
    'ug-crystals': { title: L('Crystals of Power', '能量水晶'), url: 'https://www.wowhead.com/classic/quest=4284/crystals-of-power', note: L('Collie begins her experiments on the crystals.', '科琳开始对水晶做实验。') },
    'ug-pylon': { title: L('The Eastern Pylon', '东部水晶塔'), url: 'https://www.wowhead.com/classic/quest=4287/the-eastern-pylon', note: L('One of the standing structures examined for Collie.', '科琳要查验的其中一座塔。') },
    'mo-classic': { title: L('Moonglade in Classic', '经典旧世的月光林地'), url: 'https://www.wowhead.com/classic/zone=493/moonglade', note: L('The lake, Nighthaven and the shared sanctuary.', '艾露恩湖、永夜港及双方共享的圣地。') },
    'mo-tyrant': { title: L('Eranikus, Tyrant of the Dream', '伊兰尼库斯，梦境之暴君'), url: 'https://www.wowhead.com/classic/quest=8733/eranikus-tyrant-of-the-dream', note: L('The keeper’s plan for the corrupted dragon.', '守护者为受腐化巨龙制定的计划。') },
    'mo-redemption': { title: L('The Nightmare Manifests', '噩梦显现'), url: 'https://www.wowhead.com/classic/quest=8736/the-nightmare-manifests', note: L('What happens to Eranikus and Nighthaven when the Nightmare enters the grove.', '梦魇进入林地后，伊兰尼库斯和永夜港的遭遇。') },
    'si-classic': { title: L('Silithus in Classic', '经典旧世的希利苏斯'), url: 'https://www.wowhead.com/classic/zone=1377/silithus', note: L('The hives, Cenarion Hold and the Scarab Wall.', '异种虫巢、塞纳里奥要塞与甲虫之墙。') },
    'si-memory': { title: L('A Pawn on the Eternal Board', '往日的回忆'), url: 'https://www.wowhead.com/classic/quest=8519/a-pawn-on-the-eternal-board', note: L('The in-game vision of the first war and the closing of the gates.', '游戏中重现第一场战争与大门封闭的幻象。') },
    'si-hives': { title: L('Securing the Supply Lines', '保护补给线'), url: 'https://www.wowhead.com/classic/quest=8280/securing-the-supply-lines', note: L('The growing threat to the Cenarion supply lines.', '塞纳里奥补给线日益严重的威胁。') },
    'si-gong': { title: L('Bang a Gong!', '敲响甲虫之锣！'), url: 'https://www.wowhead.com/classic/quest=8743/bang-a-gong', note: L('The scepter opens the way back into Ahn’Qiraj.', '权杖开启重返安其拉的通道。') },
    'si-war-effort': { title: L('Ahn’Qiraj War Effort', '安其拉战争物资'), url: 'https://warcraft.wiki.gg/wiki/Ahn%27Qiraj_War_Effort', note: L('Both factions’ preparations in the original gate event.', '原版开门事件中两大阵营的准备工作。') },
    'wi-classic': { title: L('Winterspring in Classic', '经典旧世的冬泉谷'), url: 'https://www.wowhead.com/classic/zone=618/winterspring', note: L('The forest, the hot springs, the furbolgs and the goblin town.', '森林、温泉、熊怪与地精城镇。') },
    'wi-winterfall': { title: L('Winterfall Activity', '冬泉熊怪的活动'), url: 'https://www.wowhead.com/classic/quest=8464/winterfall-activity', note: L('Salfa’s warning about the Winterfall.', '萨尔法对冬泉熊怪的警告。') },
    'wi-threat': { title: L('Threat of the Winterfall', '冬泉熊怪的威胁'), url: 'https://www.wowhead.com/classic/quest=5082/threat-of-the-winterfall', note: L('Donova’s independent concern about the furbolgs.', '多诺瓦对熊怪的忧虑。') },
    'wi-firewater': { title: L('Winterfall Firewater', '冬泉火酒'), url: 'https://www.wowhead.com/classic/quest=5083/winterfall-firewater', note: L('A flask points Donova toward a new line of inquiry.', '一瓶酒给多诺瓦提供了新的调查线索。') },
    'wi-corruption': { title: L('Falling to Corruption', '堕落熊怪'), url: 'https://www.wowhead.com/classic/quest=5084/falling-to-corruption', note: L('The trail leads to the Deadwood in Felwood.', '线索延伸到费伍德森林的死木熊怪。') },
    'wi-finkle': { title: L('Finkle Einhorn, At Your Service!', '芬克·恩霍尔，为您效劳！'), url: 'https://www.wowhead.com/classic/quest=5047/finkle-einhorn-at-your-service', note: L('The unusual meeting in Blackrock Spire and its connection to Everlook.', '黑石塔中的奇遇，以及它和永望镇的联系。') },
    'or-classic': { title: L('Orgrimmar in Classic', '经典旧世的奥格瑞玛'), url: 'https://www.wowhead.com/classic/zone=1637/orgrimmar', note: L('The original districts, leaders and entrance to Ragefire Chasm.', '原版城区、领袖与怒焰裂谷入口。') },
    'or-hidden': { title: L('Hidden Enemies', '隐藏的敌人'), url: 'https://www.wowhead.com/classic/quest=5726/hidden-enemies', note: L('Thrall’s investigation begins with the cult’s insignia.', '萨尔从邪教徽记着手调查。') },
    'or-leaders': { title: L('Hidden Enemies', '隐藏的敌人'), url: 'https://www.wowhead.com/classic/quest=5728/hidden-enemies', note: L('Thrall names the Searing Blade and the leaders beneath the city.', '萨尔说出灼刃及其城下首领的身份。') },
    'or-tale': { title: L('What the Wind Carries', '风吹来的消息'), url: 'https://www.wowhead.com/classic/quest=6566/what-the-wind-carries', note: L('Thrall tells his account of the old Horde and the crossing.', '萨尔回顾旧部落与渡海的经过。') },
    'tb-classic': { title: L('Thunder Bluff and its rises', '雷霆崖及各处高地'), url: 'https://warcraft.wiki.gg/wiki/Thunder_Bluff_(original)', note: L('The original town, its bridges and its districts.', '原版城市、桥梁与城区。') },
    'tb-tarren': { title: L('Journey to Tarren Mill', '塔伦米尔之旅'), url: 'https://www.wowhead.com/classic/quest=1065/journey-to-tarren-mill', note: L('Zamah reaches out to the apothecary at Tarren Mill.', '扎玛联系塔伦米尔的药剂师。') },
    'da-classic': { title: L('Darnassus in Classic', '经典旧世的达纳苏斯'), url: 'https://www.wowhead.com/classic/zone=1657/darnassus', note: L('The original districts and the roles of Tyrande and Fandral.', '原版城区，以及泰兰德和范达尔各自的职责。') },
    'da-grain': { title: L('Morrowgrain Research', '晨光麦研究'), url: 'https://www.wowhead.com/classic/quest=3781/morrowgrain-research', note: L('Fandral’s account of the cultivation experiments.', '范达尔讲述栽培试验的经过。') },
    'da-temple': { title: L('Reception from Tyrande', '泰兰德的接待'), url: 'https://www.wowhead.com/classic/quest=1081/reception-from-tyrande', note: L('Sentinel Thenysil summons a visitor from Ashenvale to Darnassus.', '灰谷的哨兵塞恩希尔引荐一名来客前往达纳苏斯。') },
    history: { title: L('War of the Three Hammers — in-game history', '三锤之战（游戏内史料）'), url: 'https://warcraft.wiki.gg/wiki/War_of_the_Three_Hammers_(book)', note: L('Classic historical account; later retail developments are outside this atlas.', '记录的是经典旧世的历史，正式服后续情节超出本图志的范围。') },
    clans: { title: L('War of the Three Hammers — historical overview', '三锤之战（历史概述）'), url: 'https://warcraft.wiki.gg/wiki/War_of_the_Three_Hammers', note: L('Cross-check for the two phases of the war and the fate of Grim Batol.', '用于核对战争的两个阶段及格瑞姆巴托的结局。') },
    manual: { title: L('World of Warcraft — original manual', '《魔兽世界》原版手册'), url: 'https://assets.blz-contentstack.com/v3/assets/blt3452e3b114fab0cd/blt2e9295db02a222fc/6025bcbb6968b53d529edb2a/media_manual_classic_enUS.pdf', note: L('Gnome exile, Gnomeregan, and the starting world.', '侏儒的流亡、诺莫瑞根，以及游戏初期的世界。') },
    defias: { title: L('Defias Brotherhood — Classic history', '迪菲亚兄弟会（经典旧世历史）'), url: 'https://warcraft.wiki.gg/wiki/Defias_Brotherhood', note: L('Use the original World of Warcraft period, not Vanessa’s later Brotherhood.', '采用《魔兽世界》原版时期的背景，时间早于凡妮莎领导兄弟会的时期。') },
    trail: { title: L('The Defias Brotherhood — quest chain', '迪菲亚兄弟会（任务线）'), url: 'https://warcraft.wiki.gg/wiki/Defias_Brotherhood_quest_chain', note: L('The investigation from Westfall to the Deadmines.', '从西部荒野追查到死亡矿井的过程。') },
    letter: { title: L('The Unsent Letter — quest text', '未寄出的信（任务文本）'), url: 'https://www.wowhead.com/classic/quest=373/the-unsent-letter', note: L('VanCleef’s letter and the lead to Baros Alexston.', '范克里夫的信，以及指向巴隆斯·阿历克斯顿的线索。') },
    attack: { title: L('The Attack! — quest text', '伏击！（任务文本）'), url: 'https://www.wowhead.com/classic/quest=434/the-attack', note: L('Lescovar, Marzon, and the Stormwind conclusion.', '莱斯科瓦、马尔松，以及暴风城调查的结局。') },
    darkshore: { title: L('Darkshore — Classic zone', '黑海岸（经典旧世区域）'), url: 'https://warcraft.wiki.gg/wiki/Darkshore_(Classic)', note: L('The intact Auberdine coast, before the Cataclysm.', '大灾变前尚未受损的奥伯丁海岸。') },
    asterion: { title: L('Bashal’Aran — quest text', '巴莎兰（任务文本）'), url: 'https://www.wowhead.com/classic/quest=954/bashalaran', note: L('Asterion’s bondage and the seal that holds him.', '阿斯特利安遭到囚禁的经过，以及束缚他的封印。') },
    anaya: { title: L('For Love Eternal — quest text', '永志不渝（任务文本）'), url: 'https://www.wowhead.com/classic/quest=963/for-love-eternal', note: L('Cerellean Whiteclaw and Anaya Dawnrunner.', '塞瑞利恩·白爪与安娜雅·晨路。') },
    blackwood: { title: L('The Blackwood Corrupted — quest text', '黑木熊怪的堕落（任务文本）'), url: 'https://www.wowhead.com/classic/quest=4763/the-blackwood-corrupted', note: L('The cleansing ritual and Xabraxxis.', '净化仪式与萨巴克希斯。') },
    crystal: { title: L('As Water Cascades — quest text', '清洗水晶（任务文本）'), url: 'https://www.wowhead.com/classic/quest=4812/as-water-cascades', note: L('Moonwell water, the red crystal, and a suspected link to Felwood.', '月亮井的水、红色水晶，以及它与费伍德森林可能存在的联系。') },
    glaive: { title: L('The Master’s Glaive — quest text', '主宰之剑（任务文本）'), url: 'https://www.wowhead.com/classic/quest=944/the-masters-glaive', note: L('Onu’s investigation of the cult at the ancient battlefield.', '安努在古战场对邪教徒展开的调查。') },
    deeps: { title: L('Knowledge in the Deeps — quest text', '深渊中的知识（任务文本）'), url: 'https://www.wowhead.com/classic/quest=971/knowledge-in-the-deeps', note: L('Gerrig Bonegrip’s request for the Lorgalis Manuscript.', '葛利·硬骨寻找洛迦里斯手稿的委托。') },
    'swelling-forces': { title: L('Swelling Forces — Forever quest', '壮大的敌军（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=98013/swelling-forces', note: L('Arbal’s warning about the naga in the ruins of Mathystra.', '阿尔巴尔对玛塞斯特拉废墟内纳迦的警告。') },
    farsen: { title: L('Farsen’s Watch — Forever quest', '法森的守望（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=96392/farsens-watch', note: L('Forever addition, distinct from the original Classic history.', '无限服新增内容，有别于经典旧世原有历史。') },
    incursion: { title: L('Old Ironforge Incursion — Forever quest text', '旧铁炉堡入侵（无限服任务文本）'), url: 'https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion', note: L('Farsen’s request and Magni’s response to the raid.', '法森的请求，以及麦格尼对袭击的应对。') },
    thanes: { title: L('Hall of Thanes — Forever dungeon guide', '领主大厅（无限服地下城攻略）'), url: 'https://www.warcrafttavern.com/forever/guides/hall-of-thanes/', note: L('Dungeon setting and encounters; the treaty’s full historical meaning is left open.', '副本背景和首领战。条约在历史上的完整意义仍有待考证。') },
    loch: { title: L('Loch Modan — Classic zone', '洛克莫丹（经典旧世区域）'), url: 'https://warcraft.wiki.gg/wiki/Loch_Modan_(Classic)', note: L('The intact loch, its settlements and its outlying camps.', '尚未受损的湖泊、周边聚落与外围营地。') },
    'stonewrought-dam': { title: L('Stonewrought Dam — history', '巨石水坝（历史）'), url: 'https://warcraft.wiki.gg/wiki/Stonewrought_Dam', note: L('Franclorn Forgewright’s dam and the sabotage it faces in Classic.', '弗兰克罗恩·铸铁修建的大坝，以及它在经典旧世面临的破坏行动。') },
    'loch-troggs': { title: L('In Defense of the King’s Lands', '保卫国王的领土'), url: 'https://www.wowhead.com/classic/quest=224/in-defense-of-the-kings-lands', note: L('The Stonesplinter threat to Khaz Modan.', '碎石穴居人对卡兹莫丹的威胁。') },
    'loch-dam': { title: L('A Dark Threat Looms', '水坝危机'), url: 'https://www.wowhead.com/classic/quest=161/a-dark-threat-looms', note: L('Hinderweir’s evidence and the explosives expert at Dun Modr.', '辛德维尔发现的证据，以及丹莫德的爆破专家。') },
    'loch-dig': { title: L('Ironband’s Excavation', '铁环挖掘场'), url: 'https://www.wowhead.com/classic/quest=436/ironbands-excavation', note: L('The ruins east of the loch and the missing supplies.', '湖东的遗迹与失踪的补给。') },
    'loch-powder': { title: L('Protecting the Shipment', '护送货物'), url: 'https://www.wowhead.com/classic/quest=309/protecting-the-shipment', note: L('Miran’s blastpowder shipment and the ambush at the dig.', '米兰运送的火药和挖掘场的伏击。') },
    'loch-silver': { title: L('Silver of the Waves — Forever quest', '浪中银光（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=86614/silver-of-the-waves', note: L('A lost hair clip in the loch’s fishing debris.', '湖中垂钓所得的杂物里有一枚遗失的发夹。') },
    ironforge: { title: L('Ironforge — city history and districts', '铁炉堡（城市历史与城区）'), url: 'https://warcraft.wiki.gg/wiki/Ironforge', note: L('The mountain capital, Tinker Town and the Deeprun Tram. Use the original city and government for this era.', '山中都城、侏儒区和矿道地铁。以当时的城市格局和政权为准。') },
    'ironforge-league': { title: L('Report to Ironforge', '向铁炉堡报告'), url: 'https://www.wowhead.com/classic/quest=301/report-to-ironforge', note: L('The Explorers’ League supplies work in the field.', '探险者协会为野外考察提供物资。') },
    'gnome-dungeon': { title: L('Gnomeregan — Classic dungeon', '诺莫瑞根（经典旧世地下城）'), url: 'https://www.wowhead.com/classic/zone=721/gnomeregan', note: L('The irradiated city, its inhabitants and its surviving machinery.', '受辐射污染的城市、城中居民和尚存的机器。') },
    'gnome-betrayal': { title: L('The Grand Betrayal', '大叛徒'), url: 'https://www.wowhead.com/classic/quest=2929/the-grand-betrayal', note: L('Mekkatorque’s account of his former adviser and the fight to reclaim the city.', '梅卡托克讲述昔日顾问的背叛与夺回城市的战斗。') },
    'gnome-data': { title: L('Data Rescue', '抢救数据'), url: 'https://www.wowhead.com/classic/quest=2930/data-rescue', note: L('Master Mechanic Castpipe’s effort to recover records from the city.', '大机械师卡斯派普设法从城中取回记录。') },
    'gnome-shoni': { title: L('Underground Assault', '地底突袭'), url: 'https://www.wowhead.com/classic/quest=2040/underground-assault', note: L('Shoni’s request for the Gnoam Sprecklesprocket from the Deadmines.', '舒尼委托冒险者从死亡矿井取回小型高能发动机。') },
    elwynn: { title: L('Elwynn Forest — Classic zone', '艾尔文森林（经典旧世区域）'), url: 'https://warcraft.wiki.gg/wiki/Elwynn_Forest_(Classic)', note: L('Northshire, Goldshire, Eastvale and Defias holdings in the forest.', '北郡、闪金镇、东谷和迪菲亚兄弟会在森林里的据点。') },
    'elwynn-mines': { title: L('The Fargodeep Mine', '法戈第矿洞'), url: 'https://www.wowhead.com/classic/quest=62/the-fargodeep-mine', note: L('Dughan’s report on the kobolds and his concern for local patrols.', '杜汉对狗头人的报告，以及他对当地巡逻队的担忧。') },
    'elwynn-guards': { title: L('Find the Lost Guards', '失踪的卫兵'), url: 'https://www.wowhead.com/classic/quest=37/find-the-lost-guards', note: L('Guard Thomas’s search for Rolf and Malakai.', '卫兵托马斯寻找罗尔夫与马拉凯的经过。') },
    'elwynn-collector': { title: L('Manhunt', '猎杀收货人'), url: 'https://www.wowhead.com/classic/quest=147/manhunt', note: L('Morgan, the mines and the Stonemasons’ Guild ring.', '摩根、矿洞与石工协会的戒指。') },
    'elwynn-lovers': { title: L('Young Lovers', '年轻的恋人'), url: 'https://www.wowhead.com/classic/quest=106/young-lovers', note: L('Maybell Maclure and Tommy Joe Stonefield’s family feud.', '梅贝尔·马科伦和托米·乔·斯通菲尔德两家的宿怨。') },
    'elwynn-river': { title: L('Downstream — Forever quest', '顺流而下（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=91733/downstream', note: L('The wagon accident and the supplies lost in the river.', '马车事故与落入河中的补给。') },
    redridge: { title: L('Redridge Mountains — Classic zone', '赤脊山（经典旧世区域）'), url: 'https://warcraft.wiki.gg/wiki/Redridge_Mountains_(original)', note: L('Lakeshire, Lake Everstill, Stonewatch and the approaches to the Burning Steppes.', '湖畔镇、止水湖、石堡，以及通往燃烧平原的道路。') },
    'redridge-aid': { title: L('Messenger to Stormwind', '送往暴风城的信'), url: 'https://www.wowhead.com/classic/quest=120/messenger-to-stormwind', note: L('Solomon’s appeal and General Marcus Jonathan’s promise of support.', '所罗门求援，马库斯·乔纳森将军承诺提供支援。') },
    'redridge-westfall': { title: L('Messenger to Westfall', '送往西部荒野的信'), url: 'https://www.wowhead.com/classic/quest=143/messenger-to-westfall', note: L('Solomon’s appeal to the People’s Militia.', '所罗门向人民军求援。') },
    'redridge-darkshire': { title: L('Messenger to Darkshire', '送往夜色镇的信'), url: 'https://www.wowhead.com/classic/quest=146/messenger-to-darkshire', note: L('Lord Ebonlocke’s answer and the reason Darkshire formed its own watch.', '埃伯洛克公爵的答复，以及夜色镇组建守夜人的原因。') },
    'redridge-orcs': { title: L('Blackrock Menace', '黑石氏族的威胁'), url: 'https://www.wowhead.com/classic/quest=20/blackrock-menace', note: L('Marshal Marris on the Blackrock forces threatening Lakeshire.', '治安官马瑞斯谈及威胁湖畔镇的黑石势力。') },
    'redridge-mage': { title: L('Morganth', '莫甘斯'), url: 'https://www.wowhead.com/classic/quest=249/morganth', note: L('Theocritus of Elwynn and his rival at the Tower of Ilgalar.', '艾尔文森林的塞欧克瑞图斯及其在伊尔加拉之塔的对手。') },
    'redridge-gnolls': { title: L('Wanted: Lieutenant Fangore', '通缉：范高雷中尉'), url: 'https://www.wowhead.com/classic/quest=180/wanted-lieutenant-fangore', note: L('Fangore leads the Shadowhide under Morganth.', '范高雷受莫甘斯指使，统领暗皮豺狼人。') },
    'redridge-trade': { title: L('Shipping Label — Forever quest', '货运标签（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=98247/shipping-label', note: L('The Azeroth Commerce Authority’s trade hub at Three Corners.', '艾泽拉斯贸易局设在三角路口的贸易枢纽。') },
    duskwood: { title: L('Duskwood — Classic zone', '暮色森林（经典旧世区域）'), url: 'https://warcraft.wiki.gg/wiki/Duskwood_(Classic)', note: L('The old forest, Darkshire, Raven Hill and the Twilight Grove.', '古老的森林、夜色镇、乌鸦岭与黎明森林。') },
    'dusk-watch': { title: L('The Night Watch', '守夜人'), url: 'https://www.wowhead.com/classic/quest=56/the-night-watch', note: L('Althea Ebonlocke and the defense of Darkshire.', '阿尔泰娅·埃伯洛克与夜色镇的防御。') },
    'dusk-embalmer': { title: L('Bride of the Embalmer', '藏尸者的妻子'), url: 'https://www.wowhead.com/classic/quest=253/bride-of-the-embalmer', note: L('Eliza, the translated letter and Abercrombie’s threat to Darkshire.', '伊莉莎、译出的信，以及亚伯克隆比对夜色镇的威胁。') },
    'dusk-morbent': { title: L('Morbent Fel', '摩本特·费尔'), url: 'https://www.wowhead.com/classic/quest=55/morbent-fel', note: L('Sven Yorgen and the weapon that strips away the necromancer’s protection.', '斯温·约根与解除死灵法师防护的武器。') },
    'dusk-lightforge': { title: L('Lightforge Ingots', '光铸铁锭'), url: 'https://www.wowhead.com/classic/quest=526/lightforge-ingots', note: L('The Lightforge metal scattered along the Wetlands coast.', '散落在湿地海岸的光铸金属。') },
    'dusk-ladimore': { title: L('The Story of Morgan Ladimore — in-game account', '摩根·拉迪莫尔的故事（游戏内记载）'), url: 'https://warcraft.wiki.gg/wiki/The_Story_of_Morgan_Ladimore', note: L('Morgan’s return to his family and the history of Mor’Ladim.', '摩根返乡寻找家人的经过，以及摩拉迪姆的来历。') },
    'dusk-ring': { title: L('A Daughter’s Love', '女儿的爱'), url: 'https://www.wowhead.com/classic/quest=231/a-daughters-love', note: L('Sarah Ladimore’s ring and the request to take it to her father’s grave.', '莎拉·拉迪莫尔托人把自己的戒指放到父亲墓前。') },
    'dusk-ring-forever': { title: L('A Daughter’s Love — Forever quest', '女儿的爱（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=231/a-daughters-love', note: L('The same story with a Ladimore heirloom added to the rewards.', '故事相同，奖励增加了一件拉迪莫尔家的传家宝。') },
    'dusk-stalvan': { title: L('The Legend of Stalvan', '斯塔文的传说'), url: 'https://www.wowhead.com/classic/quest=98/the-legend-of-stalvan', note: L('The final reckoning at Manor Mistmantle.', '在密斯特曼托庄园的最终对决。') },
    'dusk-scythe': { title: L('The Scythe of Elune', '月神的镰刀'), url: 'https://www.wowhead.com/classic/quest=1043/the-scythe-of-elune', note: L('The Classic investigation from Ashenvale to Roland’s Doom.', '经典旧世时期从灰谷追查到罗兰之墓的调查。') },
    'scythe-history': { title: L('Scythe of Elune — Classic account', '月神镰刀（经典旧世记载）'), url: 'https://warcraft.wiki.gg/wiki/Scythe_of_Elune', note: L('Use the original quests and journals for what the investigators learn.', '调查者的所见所闻以原版任务与日志为准。') },
    'howling-vale': { title: L('The Howling Vale', '狼嚎谷'), url: 'https://www.wowhead.com/classic/quest=1022/the-howling-vale', note: L('Sentinel Melyria Frostshadow investigates the worgen and the temple records.', '哨兵梅丽瑞亚·霜影调查狼人及神殿记录。') },
    wetlands: { title: L('Wetlands — Classic zone', '湿地（经典旧世区域）'), url: 'https://www.wowhead.com/classic/zone=11/wetlands', note: L('The lowland road, the harbor and the creatures of the marsh.', '低地道路、海港与沼泽里的生物。') },
    'grim-history': { title: L('Grim Batol — fortress history', '格瑞姆巴托（要塞历史）'), url: 'https://warcraft.wiki.gg/wiki/Grim_Batol', note: L('The Wildhammer capital, Dragonmaw occupation and Alexstrasza’s liberation.', '蛮锤都城、龙喉氏族的占领，以及阿莱克丝塔萨获释的经过。') },
    'wet-dragonmaw': { title: L('Defeat Nek’rosh', '击败纳克罗什'), url: 'https://www.wowhead.com/classic/quest=474/defeat-nekrosh', note: L('The Dragonmaw catapults and Captain Stoutfist’s campaign.', '龙喉氏族的投石车与斯托菲队长的战事。') },
    'wet-bridge': { title: L('The Dark Iron War', '黑铁战争'), url: 'https://www.wowhead.com/classic/quest=303/the-dark-iron-war', note: L('The attack on the Thandol Span and the fall of Dun Modr.', '萨多尔大桥遇袭与丹莫德陷落。') },
    'wet-dig': { title: L('Uncovering the Past', '发现历史'), url: 'https://www.wowhead.com/classic/quest=299/uncovering-the-past', note: L('The tablet fragments at Whelgar’s excavation.', '维尔加挖掘场出土的石板碎片。') },
    'wet-fleet': { title: L('The Cursed Crew', '被诅咒的船员'), url: 'https://www.wowhead.com/classic/quest=289/the-cursed-crew', note: L('First Mate Fitzsimmons and the wreck of the Kul Tiran Third Fleet.', '大副菲兹莫斯及库尔提拉斯第三舰队的沉船。') },
    'wet-green': { title: L('Blisters on the Land', '大地上的脓疱'), url: 'https://www.wowhead.com/classic/quest=275/blisters-on-the-land', note: L('The Greenwarden’s account of the oozes in the marsh.', '绿色守卫者对沼泽中软泥怪的记述。') },
    'wet-excavation': { title: L('Excavation Site: Wetlands — Forever dungeon journal', '挖掘场（湿地，无限服地下城手册）'), url: 'https://www.wowhead.com/forever/dungeon-journal/excavation-site-wetlands', note: L('The Explorers’ League’s new camp and the titan activity beyond the older dig.', '探险者协会的新营地，以及旧挖掘场深处的泰坦活动迹象。') },
    'wet-horror': { title: L('Horrors in the Highland — Forever quest', '高地的恐魔（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=95646/horrors-in-the-highland', note: L('Rethiel senses corruption and warns the excavators.', '雷希耶尔察觉到腐化，向考古队发出警告。') },
    'wet-songblade': { title: L('Songblade Search — Forever quest', '寻找桑布雷德（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=95772/songblade-search', note: L('Dorin in Lakeshire sends word after his brother Daewyn stops writing.', '弟弟戴温不再来信后，湖畔镇的多林·桑布雷德派人打听消息。') },
    'wet-fallen': { title: L('Fallen in the Fen — Forever quest', '命丧沼泽（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=95795/fallen-in-the-fen', note: L('Daewyn’s fate and the news that reaches Lakeshire.', '戴温的遭遇，以及传回湖畔镇的消息。') },
    diplomat: { title: L('The Missing Diplomat — the Menethil lead', '失踪的使节（米奈希尔港的线索）'), url: 'https://www.wowhead.com/classic/quest=1248/the-missing-diplomat', note: L('Mikhail and the search for Tapoke “Slim” Jahn.', '米克哈尔与寻找“干柴”塔伯克·贾恩的经过。') },
    stormwind: { title: L('Stormwind City — history and districts', '暴风城（城市历史与城区）'), url: 'https://warcraft.wiki.gg/wiki/Stormwind_City', note: L('The First War, reconstruction and the capital’s districts. Use the Classic political setting and map.', '第一次战争、战后重建与都城各区。以经典旧世的政治背景与地图为准。') },
    'curious-visitor': { title: L('The Curious Visitor', '好奇的访客'), url: 'https://www.wowhead.com/classic/quest=392/the-curious-visitor', note: L('Thelwater’s description of the man visiting Bazil Thredd.', '塞尔沃特对探望巴基尔·斯瑞德之人的描述。') },
    'shadow-past': { title: L('Shadow of the Past', '往日的阴影'), url: 'https://www.wowhead.com/classic/quest=393/shadow-of-the-past', note: L('Shaw identifies Maelik as Marzon and names his employer.', '肖尔认出麦里克就是马尔松，并指出他的雇主。') },
    'court-audience': { title: L('An Audience with the King', '觐见国王'), url: 'https://www.wowhead.com/classic/quest=396/an-audience-with-the-king', note: L('Baros’s report and Lady Katrana Prestor’s response at Stormwind Keep.', '巴隆斯呈上报告，以及卡特拉娜·普瑞斯托女士在暴风要塞的反应。') },
    'court-reveal': { title: L('The Great Masquerade — Classic quest, spoiler', '潜藏者（经典旧世任务，含剧透）'), url: 'https://www.wowhead.com/classic/quest=6403/the-great-masquerade', note: L('The separate Windsor investigation at Stormwind Keep.', '温德索尔在暴风要塞展开的另一桩调查。') },
    'stormwind-goods': { title: L('Gatehouse Goods — Forever quest', '门楼的物资（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=97222/gatehouse-goods', note: L('Trias’ Cheese and the neighboring gatehouse stockroom.', '提亚斯奶酪店和旁边设在门楼的库房。') },
    ashenvale: { title: L('Ashenvale — Classic zone', '灰谷（经典旧世区域）'), url: 'https://warcraft.wiki.gg/wiki/Ashenvale_(Classic)', note: L('The night elf homeland, both factions’ outposts and the Zoram Strand.', '暗夜精灵的故乡、联盟和部落的前哨，以及佐拉姆海岸。') },
    'ashen-third-war': { title: L('The Hunter of Shadows — Warcraft III mission', '暗影猎手（《魔兽争霸Ⅲ》战役关卡）'), url: 'https://warcraft.wiki.gg/wiki/The_Hunter_of_Shadows', note: L('The Warsong’s logging expedition, Mannoroth’s blood and the death of Cenarius.', '战歌氏族的伐木远征、玛诺洛斯之血与塞纳留斯之死。') },
    'ashen-warsong': { title: L('Warsong Supplies', '战歌氏族的补给品'), url: 'https://www.wowhead.com/classic/quest=6571/warsong-supplies', note: L('Supplies for the lumber camp and rivals in the forest.', '伐木营地的补给，以及林中的对手。') },
    'ashen-raene': { title: L('Raene’s Cleansing', '莱恩的净化'), url: 'https://www.wowhead.com/classic/quest=1046/raenes-cleansing', note: L('Krolg, Ran Bloodtooth and the rod of transformation.', '克罗格、兰恩·血牙与变形魔棒。') },
    'ashen-satyrs': { title: L('Satyr Horns', '萨特之角'), url: 'https://www.wowhead.com/classic/quest=6441/satyr-horns', note: L('The satyr camps and their threat to the Horde’s eastern outpost.', '萨特的营地，以及它们对部落东部前哨的威胁。') },
    'ashen-necklace': { title: L('Gleaming Crescent Necklace — Forever quest', '闪亮的新月项链（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=98027/gleaming-crescent-necklace', note: L('Maliynn’s family keepsake and the work of supplying the forest outposts.', '玛琳家的纪念物，以及向森林前哨运送补给的工作。') },
    'bfd-classic': { title: L('Blackfathom Deeps — Classic dungeon', '黑暗深渊（经典旧世地下城）'), url: 'https://warcraft.wiki.gg/wiki/Blackfathom_Deeps_(Classic)', note: L('The flooded temple, Twilight’s Hammer, naga and Aku’mai.', '被淹没的神殿、暮光之锤、纳迦与阿库麦尔。') },
    'bfd-kelris': { title: L('Blackfathom Villainy', '黑暗深渊中的恶魔'), url: 'https://www.wowhead.com/classic/quest=1200/blackfathom-villainy', note: L('Thaelrid’s account of the cult’s alliance with the naga and its sacrifices.', '塞尔瑞德讲述邪教与纳迦的勾结及其献祭。') },
    'bfd-sapphires': { title: L('The Essence of Aku’Mai', '阿库麦尔水晶'), url: 'https://www.wowhead.com/classic/quest=6563/the-essence-of-akumai', note: L('Je’neu Sancrea investigates the naga harvesting sapphires.', '耶努萨克雷调查纳迦采集蓝宝石一事。') },
    'twilight-history': { title: L('Twilight’s Hammer — origins', '暮光之锤（起源）'), url: 'https://warcraft.wiki.gg/wiki/Twilight%27s_Hammer', note: L('The original orc clan and the later cult’s devotion to the Old Gods.', '昔日的兽人氏族，以及后来效忠上古之神的邪教。') },
    stonetalon: { title: L('Stonetalon Mountains — Classic zone', '石爪山脉（经典旧世区域）'), url: 'https://warcraft.wiki.gg/wiki/Stonetalon_Mountains_(Classic)', note: L('Mountain settlements, the Talondeep Path and the regions around the logging operation.', '山中聚落、石爪小径以及伐木区周边。') },
    'st-kaya': { title: L('Kaya’s Alive', '卡雅还活着'), url: 'https://www.wowhead.com/classic/quest=6401/kayas-alive', note: L('The attack on Camp Aparaje and the reunion with Tammra Windfield.', '阿帕拉耶营地遇袭，以及与塔姆拉·荒原的重逢。') },
    'st-logging': { title: L('Super Reaper 6000', '超级收割机6000'), url: 'https://www.wowhead.com/classic/quest=1093/super-reaper-6000', note: L('The Venture Company’s woodcutter, Gerenzo and Ziz Fizziks.', '风险投资公司的伐木机、格雷苏与菲兹克斯。') },
    'st-vale': { title: L('Reclaiming the Charred Vale', '夺回焦炭谷'), url: 'https://www.wowhead.com/classic/quest=1057/reclaiming-the-charred-vale', note: L('Keeper Albagorm’s account of the harpies in the burned valley.', '守护者奥巴格姆讲述焦炭谷的鹰身人。') },
    'st-seeds': { title: L('Cycle of Rebirth', '生生不息'), url: 'https://www.wowhead.com/classic/quest=6301/cycle-of-rebirth', note: L('Tammra’s account of damage to Stonetalon and the search for Gaea seeds.', '塔姆拉讲述石爪山脉遭受的破坏，并派人寻找盖亚之种。') },
    'st-new-life': { title: L('New Life', '新的生命'), url: 'https://www.wowhead.com/classic/quest=6381/new-life', note: L('The blessed seeds are planted in the Charred Vale.', '受过祝福的种子被种在焦炭谷。') },
    'st-supplies': { title: L('Stonetalon Supply Run — Forever quest', '石爪补给之行（无限服任务）'), url: 'https://www.wowhead.com/forever/quest=86574/stonetalon-supply-run', note: L('A courier killed by wyverns and the shipment meant for Stonetalon Peak.', '被双足飞龙杀死的信使，以及原本要送往石爪峰的物资。') },
    'st-standstill': { title: L('Stonetalon Standstill', '石爪山的困局'), url: 'https://www.wowhead.com/classic/quest=25/stonetalon-standstill', note: L('Elementals at Mystral Lake interrupt travel between Ashenvale and Stonetalon.', '密斯特拉湖的元素生物阻断了灰谷与石爪山脉之间的交通。') }
  };
  const beats = {};
  function B(id, title, text, questIds = [], extra = {}) {
    beats[id] = { id, title, text, questIds, ...extra };
    return id;
  }
  const S = (id, title, beatIds) => ({ id, title, beatIds });
  const H = (era, title, text) => ({ era, title, text });
  const P = (id, name, x, y, text) => ({ id, name, x, y, text });

  B('dm-exile', L('A shared mountain home', '群山中的共同家园'), L('The dwarves rule from Ironforge, while the gnomes have lost {Gnomeregan} to a trogg invasion and a disastrous radiation purge. High Tinker Gelbin Mekkatorque accepted the purge on Sicco Thermaplugg’s advice; it killed gnomes without saving the city. The survivors shelter in Tinker Town. Dun Morogh’s gnome workshops and dwarven defenses therefore belong to the same present emergency: two allied peoples share one safe capital.', '矮人以铁炉堡为王都，侏儒却在穴居人入侵和一场灾难性的辐射清剿后失去了{诺莫瑞根}。大工匠格尔宾·梅卡托克采纳了思科·瑟玛普拉格的建议，结果许多侏儒丧命，城市也没能保住。幸存者在侏儒区避难。丹莫罗的侏儒工坊与矮人防务有着同一个背景：危机之下，两个结盟的族群共用一座安全的都城。'), [], { figureIds: ['mekkatorque', 'thermaplugg'], sourceIds: ['manual'], zoneIds: [1426, 1455] });
  B('dm-troggs', L('Trouble below the snow', '雪下的威胁'), L('Rockjaw {Troggs} threaten Coldridge Valley and Gol’Bolar Quarry. These are local outbreaks of an enemy also found in Loch Modan and the ruined gnome capital. Excavation brings dwarves into contact with a dangerous underground world. The recurrence connects the regions, but does not establish that every trogg attack has a single commander.', '石腭{穴居人}威胁着寒脊山谷和古博拉采掘场。洛克莫丹和陷落的侏儒都城也出现过同类敌人。挖掘让矮人接触到一个危险的地下世界。相似的事件把几处连在一起，但无法由此断定所有袭击都由同一个首领指挥。'), [170, 433], { glossaryIds: ['troggs', 'explorers-league'], zoneIds: [1426, 1432], sourceIds: ['manual'] });
  B('dm-frostmane', L('Watching the Frostmane', '监视霜鬃巨魔'), L('The {Frostmane} trolls occupy caves and ridges around dwarven settlements. Grelin Whitebeard’s missing journal leads to Grik’nir the Cold in Coldridge; Senir Whitebeard later asks for reconnaissance in Frostmane Hold. The story develops from an isolated scholar’s loss into information for Ironforge’s government. Carrying Senir’s report to Senator Barin Redstone makes clear that the small outposts form a wider warning network.', '{霜鬃}巨魔占据着矮人聚落周边的洞穴和山脊。追查格瑞林·白须遗失的日志，会在寒脊山谷找到冷酷的格瑞克尼尔。森内尔·白须随后派人去霜鬃巨魔要塞侦察。事情最初只是个落单的学者丢了东西，最后却成为铁炉堡政府掌握敌情的渠道。森内尔的报告经人传到参议员巴林·红石手里，也让人看清这些小岗哨如何组成一张预警网。'), [182, 218, 287, 291], { figureIds: ['senir'], zoneIds: [1426, 1455] });
  B('dm-watch', L('The cost of keeping watch', '巡山的代价'), L('In Forever’s Secure the Mountain story, Mountaineer Gretchen’s partner Cornelius enters the Grizzled Den alone and does not return. His body gives the wendigo danger a cost that a stack of collected manes cannot express. Gretchen’s report returns to Senir at Kharanos: the {Mountaineers} gather information, but their patrols are neither everywhere nor invulnerable.', '无限服的“保卫群山”故事中，巡山人格雷琴的搭档巡山人科尼利厄斯独自进入灰色洞穴，再也没有回来。他的遗体让人明白，雪怪造成的损失远比收集到的一堆鬃毛更直观。格雷琴的报告最后送到卡拉诺斯的森内尔手中。{巡山人}虽然能收集情报，巡逻却无法覆盖每个角落，他们自己也会遇到危险。'), [98322, 98319, 98323], { edition: L('Forever addition', '无限服新增'), figureIds: ['senir'], zoneIds: [1426], interpretation: L('Reading the scouting errands as one portrait of an overstretched watch is an interpretation of several local stories, not a stated military history.', '把这些侦察差事放在一起，可以读出巡山人兵力吃紧。这是对几段地方故事的解读，游戏并未把它写成一部军事史。') });
  B('dm-brew', L('What the mountain towns protect', '山镇守护的生活'), L('Kharanos is home to the Thunderbrew Distillery; the Barleybrews operate in Brewnall. Rivalry spills into sabotage when Marleth sends an adventurer to distract Jarven and tamper with a Thunderbrew barrel. Rejold’s search for the perfect stout instead leads to Shimmerweed on a troll-held ridge. The finished stout travels through South Gate Pass to Loch Modan. Trade, drink, and old grudges give these guarded roads a purpose beyond fighting.', '雷酒酿制厂位于卡拉诺斯，麦酒一家则在烈酒村酿酒。两家的竞争演变成了蓄意破坏：马莱斯·麦酒让冒险者引开加文·雷酒，再对一桶雷酒动手脚。另一边，雷杰德·麦酒为了酿出理想的烈酒，找到了巨魔占据的山脊上生长的微光草。成品经南门小径送到洛克莫丹。贸易、酒和旧怨，都为这些有人把守的道路增添了战事之外的意义。'), [310, 308, 311, 315, 413, 414], { zoneIds: [1426, 1432] });
  B('dm-hearth', L('A warm place in a hard country', '苦寒之地的一点暖意'), L('Forever adds Eric Brighthammer’s campfire lessons and Father Gavin’s open hearth at Misty Pine Refuge. The camp teaches practical survival; the refuge offers warmth to travelers who might otherwise freeze. Gavin’s connection to the {Argent Dawn} reaches beyond the mountains to an order formed against the Scourge. His local work is still simple: candles, firewood, and care for people on the road.', '无限服新增了艾瑞克·亮锤教授生火，以及伽文神父在雾松避难所敞开炉火的故事。营地教人如何在野外生存，避难所则让可能冻死在路上的旅人有处取暖。伽文所属的{银色黎明}是山外为对抗天灾军团而建立的组织。他在当地做的仍是些朴素的事：备好蜡烛和柴火，照顾来往的人。'), [96628, 96608, 96629, 96055, 99158, 99159], { edition: L('Forever addition', '无限服新增'), zoneIds: [1426] });
  B('hammers-succession', L('One king, three rival clans', '一位国王，三个敌对氏族'), L('High King Modimus Anvilmar held together a kingdom divided among Bronzebeard, Wildhammer, and Dark Iron clans. His death removed that balance. Madoran Bronzebeard, Khardros Wildhammer, and Sorcerer-Thane Thaurissan led the struggle for control. The Bronzebeards kept Ironforge; the others departed. Anvilmar’s name survives in Dun Morogh, a reminder that the starting valley belongs to a much older political landscape.', '至高王莫迪姆斯·安威玛尔维系着一个由铜须、蛮锤和黑铁三族分掌的王国。他一死，平衡便被打破。玛多兰·铜须、卡德罗斯·蛮锤和巫王索瑞森各自率众争夺王位。铜须守住铁炉堡，另外两族离去。安威玛尔的名字留在了丹莫罗，提醒人们这片供新人训练的山谷曾属于一个古老得多的政治格局。'), [], { figureIds: ['modimus', 'madoran', 'khardros', 'thaurissan'], zoneIds: [1426, 1455], sourceIds: ['history', 'clans'] });
  B('hammers-exile', L('Rival kingdoms beyond Ironforge', '铁炉堡之外的敌对王国'), L('The Wildhammers made their home at Grim Batol to the east. The Dark Irons founded Thaurissan in the southern lands then counted as part of the Redridge Mountains. Losing the throne did not settle the rivalry: it moved the rival powers outside Ironforge. This is why the old conflict reaches across Dun Morogh, the Wetlands, and the country around Blackrock Mountain.', '蛮锤氏族在东边的格瑞姆巴托安家。黑铁矮人在当时仍算赤脊山脉的一片南方土地上建立了索瑞森城。失去王位并未结束敌对，只是让争斗的各方移到了铁炉堡之外。因此，丹莫罗、湿地和黑石山周边都留下了这场旧纷争的痕迹。'), [], { zoneIds: [1426, 1437, 1433, 1427, 1428], sourceIds: ['history'] });
  B('hammers-invasion', L('A war fought on two fronts', '两条战线'), L('Thaurissan attacked Ironforge while his wife, Modgud, marched on Grim Batol. Both invasions failed. Modgud died, but the darkness associated with her assault left the Wildhammer city tainted. The Bronzebeards and Wildhammers joined forces and advanced against the Dark Irons. The clans that had fought over one throne were now fighting over the survival of their separate homes.', '索瑞森进攻铁炉堡，他的妻子莫德古德则进军格瑞姆巴托。两路攻势均告失败。莫德古德战死，她进攻时带来的黑暗力量却污染了蛮锤的城市。铜须和蛮锤随后合兵，转而进攻黑铁。曾争夺同一王位的氏族，如今为各自家园的存亡而战。'), [], { figureIds: ['thaurissan', 'modgud', 'madoran', 'khardros'], zoneIds: [1455, 1437], sourceIds: ['history', 'clans'] });
  B('hammers-fire', L('The answer beneath the earth', '大地深处的回应'), L('Facing defeat, Thaurissan sought a power that could destroy his enemies. His summoning brought {Ragnaros}, the Firelord, into the world. Thaurissan died in the catastrophe; his city was destroyed, and the surrounding land became the scorched country of Searing Gorge and the Burning Steppes. The surviving Dark Irons fell under the power they had called. Blackrock Mountain became the center of that new captivity.', '眼看就要战败，索瑞森试图寻求能消灭对手的力量。他的召唤将炎魔之王{拉格纳罗斯}带到了这个世界。索瑞森死于这场灾难，他的都城被毁，周围变成了灼热峡谷和燃烧平原的焦土。幸存的黑铁矮人反被自己召来的力量奴役。黑石山成了他们受制的新中心。'), [], { figureIds: ['thaurissan', 'ragnaros'], zoneIds: [1427, 1428], sourceIds: ['history'] });
  B('hammers-aftermath', L('The landscape left by the war', '战争留下的地貌'), L('The allied armies withdrew rather than face Ragnaros. The Wildhammers eventually abandoned tainted Grim Batol for the Hinterlands, while the Bronzebeards retained Ironforge. In the Classic-era present, Magni rules Ironforge and Emperor Dagran Thaurissan rules the Dark Irons in Shadowforge under Ragnaros’s shadow. Dagran is a later ruler, not the sorcerer whose summoning ended the war. The clans’ later reunion is outside this atlas’s time frame.', '联军选择撤退，避开拉格纳罗斯。蛮锤最终离开遭腐化的格瑞姆巴托，迁往辛特兰，铜须则留在铁炉堡。经典旧世时期，麦格尼统治铁炉堡，达格兰·索瑞森大帝在拉格纳罗斯的阴影下从暗炉城统治黑铁。达格兰是后世的统治者，当年以召唤终结战争的是另一位索瑞森。三族再度联合是本图志所涉时期之后的事。'), [], { figureIds: ['magni', 'dagran', 'ragnaros'], zoneIds: [1455, 1437, 1427, 1428], sourceIds: ['clans'] });
  B('dm-farsen', L('The old feud reaches Dun Morogh', '宿怨延烧到丹莫罗'), L('In Forever, Beldin Steelgrill’s report of a visitor leads to Earthseer Farsen, a {Wildhammer} from Aerie Peak. His far sight reveals {Dark Iron} activity in Dun Morogh. Spies are already at work, and a recovered underground map points toward Ironforge’s lower vaults. The story’s important turn is geographical: the danger is no longer confined to a distant enemy kingdom. It has found a way beneath the dwarven capital.', '无限服中，贝尔丁·钢架提及一名访客，线索指向来自鹰巢山的{蛮锤氏族}成员大地先知法森。他用远视能力发现了{黑铁矮人}在丹莫罗的活动。密探已经开始行动，缴获的地下地图指向铁炉堡下层密室。事态的转折在于危险转移到了新的地方：过去远在敌对王国的威胁，如今已潜入矮人都城地下。'), [96408, 96392, 96390, 96391], { edition: L('Forever addition', '无限服新增'), figureIds: ['farsen'], zoneIds: [1426, 1455], sourceIds: ['farsen', 'incursion'] });
  B('dm-vaults', L('The Hall of Thanes', '领主大厅'), L('Farsen’s warning leads into the Hall of Thanes beneath Old Ironforge. Dark Iron raiders disturb the kingdom’s dead and scatter its heirlooms. Durgen Dirgehammer commands the incursion; the expedition also confronts Faldrim Anvilmar’s restless spirit. Durgen’s defeat is reported to Magni, who promises to secure the breached halls. A recovered Treaty of Understanding returns to the king as well. Its title alone does not establish who signed it or what it settled.', '法森的警告把调查引向旧铁炉堡地下的领主大厅。黑铁袭击者惊扰了王国的亡者，把传家宝弄得四处散落。杜根·挽锤指挥这次入侵，远征队也遇到了法德林·安威玛尔不得安息的灵魂。杜根落败的消息传到麦格尼手里，他承诺守住被攻破的大厅。寻回的《谅解条约》也交还给国王。仅凭条约的名字，尚无法确定签署方或它解决了什么问题。'), [96394, 96403, 96395, 96393, 98423], { edition: L('Forever addition', '无限服新增'), figureIds: ['durgen', 'magni', 'farsen'], zoneIds: [1455], sourceIds: ['incursion', 'thanes'], interpretation: L('The recurrence of the Anvilmar name invites comparison with the old succession crisis. No family relationship or treaty settlement is asserted here without quest text confirming it.', '安威玛尔的名字再度出现，让人想到当年的继承危机。任务文本没有证实人物之间的亲缘关系，也没有说明条约解决了什么，本图志对此保留判断。') });

  B('defias-rebuilding', L('The city that would not pay', '不肯付工钱的城市'), L('Stormwind was destroyed in the First War and rebuilt after the Second. Edwin VanCleef and the Stonemasons’ Guild supplied the labor that restored the capital, but a dispute with the House of Nobles ended without their promised payment. The builders’ grievance is the starting point of the Defias story. The rebuilt city looks secure; the unpaid people who built it have been driven outside its protection.', '暴风城毁于第一次战争，在第二次战争后重建。艾德温·范克里夫和石工协会出力恢复了都城，却在与贵族议会的争执中没能拿到承诺的工钱。工匠所受的不公是迪菲亚故事的起点。重建后的城市看似安稳，建造它却没拿到报酬的人已被逐到城墙之外。'), [], { figureIds: ['vancleef', 'baros'], zoneIds: [1453, 1436], sourceIds: ['defias'] });
  B('defias-rupture', L('From a grievance to a Brotherhood', '从欠薪纠纷到兄弟会'), L('The dispute broke into a riot in which Queen Tiffin Wrynn was killed. VanCleef and his followers left Stormwind and formed the {Defias Brotherhood}. In Westfall they recruited more men and built a base below Moonbrook. Their raids fell on farm families who had never had a seat in the House of Nobles.', '争执演变成骚乱，蒂芬·乌瑞恩王后在骚乱中遇难。范克里夫和追随者离开暴风城，成立了{迪菲亚兄弟会}。他们在西部荒野招募人手，在月溪镇地下建起据点，遭他们劫掠的却是从未在贵族议会拥有席位的农户。'), [], { figureIds: ['vancleef', 'tiffin'], zoneIds: [1453, 1436], sourceIds: ['defias'] });
  B('wf-farms', L('A breadbasket that cannot feed itself', '粮仓养不活自己'), L('Westfall’s abandoned farms and roaming harvest golems show a rural economy breaking down. Salma Saldean and Verna Furlbrow need help with the practical business of food and property. Farmers struggle with wildlife, machines, and armed looters at once. The farms are the stakes of the zone’s larger conflict: a capital depends on a countryside it is failing to protect.', '西部荒野废弃的农场和四处游荡的麦田傀儡，反映出乡村经济正在崩溃。萨尔玛·萨丁和弗娜·法布隆需要人帮忙解决粮食和财产方面的具体问题。当地农民同时面对野兽、机器和武装劫匪。农场关系到整场冲突的结果：都城赖以维生的乡村，恰恰没能得到都城的保护。'), [36, 38, 64], { figureIds: ['salma'], zoneIds: [1436], interpretation: L('The breadbasket framing reads the farms and food errands together. It does not assign every failed harvest to a single documented cause.', '把这里视为陷入危机的粮仓，是把农场的处境和筹粮差事放在一起解读。游戏没有把每次歉收都归因于同一件事。') });
  B('wf-militia', L('Sentinel Hill holds the center', '哨兵岭守住腹地'), L('Gryan Stoutmantle, a paladin and veteran, leads the People’s Militia from Sentinel Hill. His campaigns against Defias groups try to restore space in which the remaining farmers can live. Scout Riell collects red silk bandanas as proof of fighting inside the Brotherhood’s stronghold. The bandana has become a recognizable sign of allegiance; the militia responds to an organized movement, not a few disconnected thieves.', '身为圣骑士和老兵的格里安·斯托曼在哨兵岭领导人民军。他对迪菲亚团伙用兵，试图让留下的农民有地方安身。哨兵瑞尔收集红色丝质面罩，作为在兄弟会据点内交战的凭证。面罩已成了易于辨认的身份标志，说明人民军面对的是一个有组织的团体。'), [12, 13, 14, 214], { figureIds: ['gryan', 'riell'], zoneIds: [1436] });
  B('defias-investigation', L('Names behind the red bandanas', '红色面罩背后的人'), L('Stoutmantle’s investigation leads first to Wiley the Black in Lakeshire, then to Stormwind’s architect Baros Alexston. Messages and testimony identify VanCleef as the leader. A Defias messenger carries useful intelligence, and a defector can reveal the hidden entrance beneath Moonbrook. Read as a story, these discoveries move from visible raids to a named organization, then to its concealed base. Lakeshire and Stormwind matter because Westfall’s crisis crosses administrative boundaries.', '斯托曼的调查先找到湖畔镇的黑衣威利，继而找到暴风城建筑师巴隆斯·阿历克斯顿。书信与证词指认范克里夫是首领，迪菲亚信使携带着有用的情报，一名叛逃者则能指出月溪镇下的隐蔽入口。把这些发现连起来，调查从看得见的劫掠，逐步追到有名有姓的组织，再到它藏身的据点。湖畔镇与暴风城都被卷入，说明这场危机早已超出西部荒野的管辖范围。'), [65, 132, 135, 141, 142, 155], { figureIds: ['gryan', 'wiley', 'baros', 'vancleef'], zoneIds: [1436, 1433, 1453], sourceIds: ['trail'] });
  B('wf-miners', L('The people underneath the hideout', '据点下面的人'), L('Wilder Thistlenettle in Stormwind seeks miners’ union cards and the badge of his lost brother in the Deadmines. Their remains make the mine more than a bandit fortress: it was a workplace before it became a killing ground.', '暴风城的维尔德·蓟草希望找回矿工工会的会员卡，以及失踪兄弟遗落在死亡矿井的徽章。死者的遗物提醒人们，这座矿井在成为杀戮之地前，曾是许多人谋生的地方。'), [167, 168], { zoneIds: [1436, 1453] });
  B('defias-ship', L('A ship hidden inside a mine', '矿井中藏着一艘船'), L('The tunnels below Moonbrook open into workshops, a foundry, and Ironclad Cove. The Brotherhood’s craftsmen and goblin associates are building a great warship for an attack on Stormwind. This gives the farm raids a larger purpose: they sustain an armed organization preparing revenge against the capital. Adventurers sent by Stoutmantle reach the vessel and kill VanCleef before that attack can be launched.', '月溪镇下的隧道通往工坊、铸造厂和铁甲湾。兄弟会的工匠与地精同伙正在造一艘大战船，准备进攻暴风城。袭击各处农场为这个谋划向都城复仇的武装团体提供了资源。斯托曼派出的冒险者登上战船，在袭击发动前杀死了范克里夫。'), [166], { figureIds: ['vancleef', 'gryan'], zoneIds: [1436, 1453], sourceIds: ['defias', 'trail'] });
  B('defias-letter', L('VanCleef’s letter leads to the Stockade', '范克里夫的信把调查引向监狱'), L('VanCleef left a letter addressed to Baros Alexston. It points Baros toward Bazil Thredd, a Defias lieutenant held in the Stockade beside Stormwind’s canals. Thredd and the other inmates seize control inside the prison. Warden Thelwater stays outside the locked-down Stockade while Thredd is killed and the riot is put down.', '范克里夫留下一封写给巴隆斯·阿历克斯顿的信，信里提到被关在暴风城运河边监狱的迪菲亚副手巴基尔·斯瑞德。斯瑞德与其他囚犯夺取了监狱的控制权。典狱官塞尔沃特留在封锁的监狱外，直到斯瑞德被杀，暴动平息。'), [373, 389, 391], { figureIds: ['baros', 'bazil', 'thelwater'], zoneIds: [1436, 1453], sourceIds: ['letter', 'curious-visitor'] });
  B('defias-visitor', L('A visitor with borrowed papers', '用假身份来访的人'), L('Thelwater recalls that a well-connected man recently began visiting Thredd under the name Maelik. Baros sends the warden’s description to Master Mathias Shaw of SI:7. Shaw recognizes the assassin who uses the name Marzon the Silent Blade and identifies his employer, Lord Gregor Lescovar.', '塞尔沃特记起，一位有门路的男子最近以麦里克的名义来探望斯瑞德。巴隆斯把典狱官的描述送交军情七处的马迪亚斯·肖尔。肖尔认出那人是刺客沉默之刃马尔松，并查明他的雇主是葛瑞格·莱斯科瓦公爵。'), [392, 393], { figureIds: ['thelwater', 'bazil', 'baros', 'shaw', 'marzon', 'lescovar'], zoneIds: [1453], sourceIds: ['curious-visitor', 'shadow-past'] });
  B('defias-court', L('The meeting in the keep garden', '要塞花园里的会面'), L('Shaw sends word to Elling Trias, the cheesemonger with ties to Stormwind intelligence. Trias calls on Tyrion, who has been watching Lescovar. Tyrion sends Marzon a message purporting to be from Lescovar. His Spybot gets past the guards disguised as Priestess Tyriona and tells Lescovar to expect Marzon. The lord dismisses his guards. The two men talk about the Defias in the garden, and both are killed.', '肖尔把消息传给与暴风城情报部门有来往的奶酪商埃林·提亚斯。提亚斯联系上了早已监视莱斯科瓦的泰里恩。泰里恩假借莱斯科瓦的名义给马尔松送信，又让间谍机器人扮作女牧师泰莉欧娜，绕过守卫去通知莱斯科瓦等候马尔松。公爵支走护卫，与马尔松在花园谈起迪菲亚兄弟会，两人随后都被杀死。'), [350, 2745, 2746, 434], { figureIds: ['shaw', 'trias', 'tyrion', 'spybot', 'lescovar', 'marzon'], zoneIds: [1453], sourceIds: ['attack', 'shadow-past'] });
  B('defias-report', L('Who receives the king’s report', '谁接下了呈交国王的报告'), L('Trias sends the news to Shaw, and Baros prepares a report for the king. At Stormwind Keep, Lady Katrana Prestor receives it and presents the Seal of Wrynn. She says Varian is away on a diplomatic mission. The report closes the case against Lescovar while the king’s absence remains a question of its own.', '提亚斯把消息转告肖尔，巴隆斯则准备了一份呈交国王的报告。在暴风要塞，卡特拉娜·普瑞斯托女士收下报告，颁发了乌瑞恩的图章。她称瓦里安外出执行外交使命。报告了结了针对莱斯科瓦的案件，国王的下落却仍是另一个悬而未决的问题。'), [394, 395, 396], { figureIds: ['trias', 'shaw', 'baros', 'katrana', 'varian'], zoneIds: [1453], sourceIds: ['court-audience'] });
  B('defias-prestor', L('Spoiler · Lady Prestor’s identity', '剧透 · 普瑞斯托女士的身份'), L('Lady Katrana Prestor is Onyxia, a black dragon in human guise. The wider history credits her with helping turn the nobles and stonemasons against one another. Marshal Windsor exposes her disguise in a separate confrontation at the keep. The Defias investigation itself ends with Baros’s report in her hands.', '卡特拉娜·普瑞斯托女士就是化为人形的黑龙奥妮克希亚。更广泛的历史记载认为，她在贵族与石工反目一事中推波助澜。温德索尔元帅后来在要塞的另一场对峙中揭穿了她的伪装。迪菲亚一案的调查本身，到巴隆斯把报告交到她手里就告一段落。'), [], { edition: L('Spoiler · Classic Stormwind', '剧透 · 经典旧世的暴风城'), figureIds: ['katrana', 'windsor'], zoneIds: [1453], sourceIds: ['defias', 'court-reveal'] });
  B('wf-coast', L('A coast with its own dead', '海岸上也有不得安息的亡者'), L('Captain Grayson’s ghost tends Westfall’s lighthouse. Fuel keeps the beacon working; the threat of Old Murk-Eye and the coastal murlocs puts ships and shore dwellers at risk. Grayson’s unfinished duty is a separate local story from the Brotherhood. It widens Westfall beyond its most famous villains: the region also has sea lanes, wrecks, and people whose work outlasts them.', '葛瑞森船长的幽灵照看西部荒野的灯塔，灯火靠燃料维持。老瞎眼和沿岸鱼人威胁着船只和岸边居民。葛瑞森未了的职责是独立于兄弟会的地方故事，也让人看到这个地区最出名的反派之外，还有航道、沉船，以及死后仍尽职守的人。'), [103, 104], { figureIds: ['grayson'], zoneIds: [1436] });

  B('ds-shattering', L('A shore made from a broken world', '破碎世界留下的海岸'), L('Before the Sundering, this coast belonged to the night elves’ ancient civilization. The War of the Ancients and the collapse of the Well of Eternity broke that world apart. The ruined settlements of Bashal’Aran, Ameth’Aran, and Mathystra now stand among forests and beaches. Their stones place today’s small harbor in the long aftermath of an imperial disaster. The people living here inherit losses measured in millennia.', '大分裂前，这片海岸属于暗夜精灵的古老文明。上古之战与永恒之井的崩塌使那个世界四分五裂。今天，巴莎兰、亚米萨兰和玛塞斯特拉的废墟坐落在树林和海滩之间。遗迹表明，如今这座小港仍处在一个帝国覆灭的余波之中，当地人承受的是延续了数千年的失落。'), [], { zoneIds: [1439], sourceIds: ['darkshore'] });
  B('ds-asterion', L('A seal that keeps a spirit captive', '囚禁亡魂的封印'), L('Asterion is a bound spirit at Bashal’Aran, not a living caretaker visiting the ruins. A seal holds him there. Recovering the means to break that bond eventually leads to the flame of Ameth’Aran. The two ruins are therefore connected by a specific unfinished story, not simply by their shared architecture. The surviving magic of the old world can still bind the people who died in it.', '阿斯特利安是被束缚在巴莎兰的亡魂。封印让他无法离开，寻找解除封印的办法，最终会追到亚米萨兰的火焰。把两片废墟连在一起的，除了相似的建筑，还有这一桩未了之事。旧世界残存的法术，如今仍能束缚死于那个时代的人。'), [954, 955, 956, 957], { figureIds: ['asterion'], zoneIds: [1439], sourceIds: ['asterion'] });
  B('ds-memory', L('What Ameth’Aran remembers', '亚米萨兰记得什么'), L('The tablets at Ameth’Aran recount the settlement’s last days. Cerellean Whiteclaw supplies a more intimate memory: Anaya Dawnrunner, the woman he loved, remains there as a restless spirit. Her pendant returns to him after her spirit is released. Reading the tablets beside this loss gives two scales to the same catastrophe. A city fell; a person still waiting in Auberdine never stopped loving someone who was lost with it.', '亚米萨兰的石板记载了这座聚落最后的日子。塞瑞利恩·白爪则记得一段更私人的往事：他深爱的安娜雅·晨路化作不得安息的幽灵，仍在当地徘徊。她的灵魂获释后，坠饰被送回他手里。石板上的记载与塞瑞利恩的遭遇，映照出同一场灾难的两面。城毁了，仍在奥伯丁守候的人却始终爱着与城一同逝去的人。'), [953, 963], { figureIds: ['cerellean', 'anaya'], zoneIds: [1439], sourceIds: ['anaya'] });
  B('ds-bears', L('A sickness in the forest', '林中疫病'), L('Tharnariun Treetender investigates afflicted thistle bears. Capturing a living bear matters because the aim is to understand and heal the sickness, not merely remove dangerous animals. Nearby, the Blackwood furbolgs have become hostile, and Terenthis’s search for Volcor follows another broken relationship between the forest and its inhabitants. These stories establish that Darkshore’s living communities are under pressure as well as its haunted ruins.', '萨纳瑞恩·绿树正在调查染病的蓟熊。活捉一头很重要，因为他的目的是弄清病因并加以治疗。附近的黑木熊怪也变得敌对，特伦希斯寻找沃科尔的经过，又让人看到森林与其中居民之间的另一道裂痕。黑海岸出问题的地方既有闹鬼的废墟，也有仍然有人生活的聚落。'), [2118, 2138, 2139, 986, 993, 994], { figureIds: ['tharnariun', 'terenthis', 'volcor'], zoneIds: [1439] });
  B('ds-blackwood', L('A ritual reveals an enemy', '净化仪式揭出敌人'), L('Thundris Windweaver’s work with the Blackwood culminates in a cleansing ritual using moonwell water and offerings taken from their stores. Xabraxxis appears carrying a Talisman of Corruption. Defeating that demon identifies a concrete source of the furbolgs’ corruption and wins a local victory. The ritual also shows the moonwell as a practical source of healing power, not just a sacred landmark in Auberdine.', '桑迪斯·织风对黑木熊怪的调查，最后以月亮井水和从熊怪储备中取来的供品举行净化仪式。萨巴克希斯带着堕落护符现身。击败这个恶魔，便找到了熊怪遭到腐化的一个具体来源，也解了当地的燃眉之急。这场仪式还表明，奥伯丁的月亮井除了是圣地，也是可用来疗愈的力量源泉。'), [4761, 4763], { figureIds: ['thundris', 'xabraxxis'], zoneIds: [1439], sourceIds: ['blackwood'] });
  B('ds-crystal', L('A clue at the eastern wall', '东面山壁边的线索'), L('Sentinel Glynda Nal’Shea investigates a red crystal against Darkshore’s eastern mountains. Moonwell water makes its surface transparent and reveals fragments within. She suspects a connection to Felwood above the coast. The investigation presents that connection as a suspicion, not proof that the crystal, Xabraxxis, every sick bear, and every cultist share one plan. Keeping those limits visible preserves the mystery the zone actually tells.', '哨兵戈琳达·纳希恩调查一块紧贴黑海岸东部山脉的红色水晶。月亮井的水让水晶表面变得透明，露出其中的碎片。她怀疑此事与海岸上方的费伍德森林有关。调查到此仍停留在推测，无法断定水晶、萨巴克希斯、所有染病的熊和所有邪教徒都牵涉同一个计划。保留这个疑问，才符合故事在这里留下的悬念。'), [4811, 4812, 4813], { zoneIds: [1439], sourceIds: ['crystal'] });
  B('ds-glaive', L('Onu looks beneath the present', '安努追查古老的过去'), L('At the Grove of the Ancients, Onu directs attention to the Master’s Glaive, where a huge blade pierces an ancient creature’s remains. The {Twilight’s Hammer} is studying the site. Scrying and a recovered tome establish the cult’s interest in this old battlefield. Onu’s work with the Mathystra relics also places northern ruins inside a living effort to preserve memory. Ancient things here attract both caretakers and people seeking dangerous power.', '古树之林的安努把调查引向主宰之剑，一把巨大的利刃刺穿了古代生物的遗骸。{暮光之锤}正在研究这个地方。占卜结果和找回的典籍证实，邪教对这处古战场确实感兴趣。安努收集玛塞斯特拉遗物，也是眼下保存北部废墟记忆的一环。这里的古物既吸引看护者，也吸引觊觎危险力量的人。'), [947, 948, 944, 949, 950, 951], { figureIds: ['onu'], zoneIds: [1439], sourceIds: ['glaive'] });
  B('ds-deeps', L('The story continues beneath Ashenvale', '故事延续到灰谷地下'), L('A Twilight text from the Master’s Glaive becomes a lead for Gerrig Bonegrip in Ironforge. He asks for the Lorgalis Manuscript from Blackfathom Deeps, the drowned sanctuary on Ashenvale’s coast. In Forever, Arbal also fears that the naga in the ruins of Mathystra may aid the Twilight’s Hammer.', '从主宰之剑找来的暮光典籍给铁炉堡的葛利·硬骨提供了线索。他要找灰谷海岸沉没圣所黑暗深渊里的洛迦里斯手稿。无限服中，阿尔巴尔还担心玛塞斯特拉废墟里的纳迦可能会协助暮光之锤。'), [968, 971, 98013], { figureIds: ['gerrig', 'arbal'], zoneIds: [1439, 1440, 1455], sourceIds: ['deeps', 'swelling-forces'], edition: L('Classic arc with a Forever extension', '经典旧世故事 · 无限服新增后续') });
  B('ds-harbor', L('Life goes on between the ruins', '废墟之间的日常'), L('Auberdine connects the coast to the wider Alliance by sea. Gnomish Buzzboxes survey creatures along the beaches; Gelkak Gyromast’s recovered key reactivates a machine that turns violent. In the south, Prospector Remtravel’s expedition adds the {Explorers’ League} to the people trying to understand the shore. These smaller stories give the coast its present life: sailors, researchers, inventors, and caretakers working among the remains of a much older world.', '奥伯丁通过海路把这段海岸与联盟其他地方连在一起。侏儒的传声盒用来调查海滩上的生物。找回基尔卡克·旋杆的钥匙后，可以重新启动一台机器，它却会发起攻击。在南边，勘察员雷姆塔维尔带领的远征队让{探险者协会}也参与到了解这片海岸的工作中。水手、研究者、发明家和看护者在远古遗迹间劳作，这些小故事构成了海岸如今的生活。'), [983, 1001, 1002, 1003, 2098, 2078, 729, 731, 741, 942, 943], { figureIds: ['remtravel'], zoneIds: [1439, 1437] });

  B('lm-stonesplinters', L('The road out of the mountains', '出山的道路'), L('The southern pass from Dun Morogh opens near the Stonesplinter caves. At the Valley of Kings, Mountaineer Cobbleflint calls out the danger to travelers and Captain Rugelfuss calls for an attack on the troggs. Across the loch, troggs also disrupt the work at Ironband’s dig. These are the Stonesplinters’ own attacks, part of the same pattern of underground threats seen around Gol’Bolar Quarry and Gnomeregan.', '丹莫罗南面的山口通到碎石穴居人的洞穴附近。国王谷的巡山人库伯弗林特提醒旅客留意危险，拉格弗斯上尉则要求反击穴居人。湖对岸的铁环挖掘场也被穴居人搅扰。这些袭击是碎石穴居人所为，与古博拉采掘场和诺莫瑞根遭遇的一样，都是来自地下的威胁。'), [217, 224], { figureIds: ['cobbleflint', 'rugelfuss'], zoneIds: [1432, 1426], glossaryIds: ['troggs'], sourceIds: ['loch', 'loch-troggs'] });
  B('lm-excavation', L('The missing blastpowder', '失踪的爆破火药'), L('Prospector Ironband is digging among ancient ruins east of the water. He needs blastpowder to reach the lower part of the site, but a shipment that Ironforge already sent never reached him. Jern Hornhelm carries the dig’s business in Thelsamar, and the {Explorers’ League} supplies it from Ironforge. When Miran brings a fresh load, Dark Iron attackers ambush him on the way into the dig.', '勘察员基恩萨·铁环正在湖东的古代废墟中挖掘。他需要火药才能进入遗址下层，可铁炉堡已经送出的一批货却没到。吉恩·角盔在塞尔萨玛代办挖掘场的事务，铁炉堡的{探险者协会}负责供应物资。米兰重新运来一批火药，却在进入挖掘场时遭到黑铁矮人伏击。'), [436, 298, 301, 309], { figureIds: ['ironband', 'jern', 'miran'], zoneIds: [1432, 1455], sourceIds: ['loch-dig', 'ironforge-league', 'loch-powder'] });
  B('lm-sabotage', L('A charge at the Stonewrought Dam', '巨石水坝上的炸药'), L('After the attack on the Thandol Span, Chief Engineer Hinderweir spots Dark Iron sappers near the dam’s eastern ramp. Powder from a barrel goes to Ashlan Stonesmirk in Dun Modr, who identifies the explosive. Hinderweir works out how to neutralize it using materials from the loch and the Mo’grosh ogres’ stronghold. The dam stands, with the Wetlands still downstream.', '萨多尔大桥遇袭后，主工程师辛德维尔在大坝东坡发现黑铁工兵。他把桶里的火药送给丹莫德的阿胥兰·暗石，由后者辨认炸药。辛德维尔想出办法，利用湖中和莫格罗什食人魔要塞里的材料化解险情。大坝没有被炸毁，下游的湿地也安然无恙。'), [250, 161, 278, 283], { figureIds: ['hinderweir', 'ashlan'], zoneIds: [1432, 1437], sourceIds: ['loch', 'loch-dam'] });
  B('lm-silver', L('A keepsake on the lake bed', '湖底的纪念物'), L('Forever adds a small story amid the loch’s fishing debris. A tarnished silver hair clip, still marked with its owner’s initials, makes its way back to her. Alongside the engineers and prospectors, the story makes room for someone who has simply lost something she cared about.', '无限服在湖中垂钓所得的杂物里安排了一段小故事。一枚失去光泽的银发夹还刻着主人姓名的首字母，最终物归原主。在工程师和勘探者之外，故事也留了一点篇幅给一个只是弄丢了心爱之物的人。'), [86614], { edition: L('Forever addition', '无限服新增'), zoneIds: [1432], sourceIds: ['loch-silver'] });

  B('if-tram', L('A railway beneath the kingdoms', '王国地下的铁路'), L('The Deeprun Tram joins Tinker Town to Stormwind’s Dwarven District. Gnomish engineering put a railway between the mountain city and the rebuilt human capital. Above its platforms, dwarves work at the Great Forge and gnomes run workshops in the eastern ward. Refugees from one capital help maintain the connection between two others.', '矿道地铁把侏儒区和暴风城的矮人区连在一起。侏儒的工程技术让山中都城和重建后的人类都城有了铁路。站台上方，矮人在大锻炉劳作，侏儒在城东开设工坊。来自一座都城的难民，如今帮助维系另外两座都城的交通。'), [], { figureIds: ['mekkatorque'], zoneIds: [1455, 1453], sourceIds: ['ironforge', 'stormwind'] });
  B('if-league', L('Reports from the dig sites', '挖掘场送来的报告'), L('The Hall of Explorers houses the {Explorers’ League} under High Explorer Magellas. The paperwork brought back from Loch Modan shows how much a dig depends on the city: the League authorizes powder, keeps account of shipments and must answer when they go missing. Whelgar’s work in the Wetlands and Remtravel’s on Darkshore put prospectors from the same institution in very different country.', '{探险者协会}设在探险者大厅，由资深探险家麦格拉斯主持。从洛克莫丹带回的文件说明，挖掘场有多么依赖城里的支援：协会批准火药申请，记录货物去向，东西丢了也得出面处理。维尔加在湿地工作，雷姆塔维尔在黑海岸考察，同一个协会的人员就这样去了截然不同的地方。'), [301], { figureIds: ['magellas', 'ironband', 'whelgar', 'remtravel'], zoneIds: [1455, 1432, 1437, 1439], sourceIds: ['ironforge', 'ironforge-league', 'wet-dig'] });
  B('gn-salvage', L('The city’s surviving records', '城中幸存的记录'), L('In Tinker Town, Master Mechanic Castpipe wants to recover Gnomeregan’s data. Inside the old city, the punch-card machines still read and write. Castpipe can use the records their final card holds. The exiles are trying to save the knowledge that made their workshops possible as well as retake the rooms that housed them.', '侏儒区的大机械师卡斯派普想找回诺莫瑞根的数据。旧城里的打孔卡机器仍能读写，最后一张卡片里存有他能用上的记录。流亡者既想夺回当年的工坊，也想保住让那些工坊得以运作的知识。'), [2930], { figureIds: ['castpipe', 'mekkatorque'], zoneIds: [1455, 1426], sourceIds: ['gnome-data'] });
  B('gn-shredder', L('A part from the Deadmines', '来自死亡矿井的零件'), L('Shoni the Shilent works in Stormwind’s Dwarven District. She traces the power supply for a goblin shredder to the Deadmines. She can use it to power drills that will break through the rock around Gnomeregan. The gnomes’ plans to reopen their own tunnels reach all the way to the machines in VanCleef’s hideout.', '沉默的舒尼在暴风城矮人区工作。她查到死亡矿井里有一台地精伐木机的动力装置，可以拿来驱动钻机，凿穿诺莫瑞根周围的岩石。侏儒想重新打通自家隧道，为此找到了范克里夫据点里的机器。'), [2040], { figureIds: ['shoni'], zoneIds: [1453, 1436, 1426], sourceIds: ['gnome-shoni'] });
  B('gn-betrayal', L('The fight inside Gnomeregan', '诺莫瑞根内的战斗'), L('Irradiated gnomes, troggs and machines still fill the old city. In Tinker Town, Mekkatorque asks for the death of the adviser he once trusted. Thermaplugg commands from the heart of the complex, using its machinery against intruders. His defeat reaches Mekkatorque as a step toward reclaiming Gnomeregan. The exiles still have their workshops in Ironforge.', '受辐射的侏儒、穴居人和机器仍遍布旧城。在侏儒区，梅卡托克要求除掉他曾信赖的顾问。瑟玛普拉格坐镇设施深处，用城中机械对付闯入者。他落败的消息传给梅卡托克，收复诺莫瑞根也就迈出了一步。流亡者的工坊依然设在铁炉堡。'), [2929], { figureIds: ['thermaplugg', 'mekkatorque'], zoneIds: [1426, 1455], sourceIds: ['gnome-dungeon', 'gnome-betrayal'] });

  B('el-mines', L('The mines stop being safe', '矿井不再安全'), L('Kobolds take up residence in Echo Ridge Mine above Northshire and in Fargodeep and Jasperlode farther south. Marshal McBride can spare people to clear the abbey’s mine. At Goldshire, Marshal Dughan hears enough about Fargodeep to call for more patrols. The reports describe the same pressure in several places on which the forest depends for its ore.', '狗头人占据了北郡高处的回音山矿洞，以及更南边的法戈第矿洞和玉石矿洞。治安官玛克布莱德可以抽调人手清理修道院的矿洞。闪金镇的治安官杜汉得知法戈第矿洞的情况后，则要求增加巡逻。几个为森林供应矿石的地方，都在报告同一种威胁。'), [21, 62, 76], { figureIds: ['mcbride', 'dughan'], zoneIds: [1429], sourceIds: ['elwynn', 'elwynn-mines'] });
  B('el-defias', L('A stonemason’s ring in Elwynn', '艾尔文森林里的石工戒指'), L('Defias thieves occupy the Northshire vineyards under Garrick Padfoot. Farther south, a pickup schedule exposes a man called the Collector taking gold from Elwynn’s mines. Dughan traces him to the Brackwell Pumpkin Patch. The Collector’s ring belonged to the old Stonemasons’ Guild, a clue that ties the thefts to people who once worked inside Stormwind.', '加瑞克·帕德弗特带着迪菲亚盗贼占了北郡农场的葡萄园。再往南，一份收货时间表暴露了一个外号叫“收货人”的人，正从艾尔文森林的矿井拿走黄金。杜汉顺藤摸瓜，找到布莱克威尔南瓜田。收货人的戒指属于原来的石工协会，把这些盗窃案和曾在暴风城做工的人联系起来。'), [18, 123, 147], { figureIds: ['garrick', 'dughan', 'collector'], zoneIds: [1429, 1453, 1436], sourceIds: ['elwynn', 'elwynn-collector', 'defias'] });
  B('el-patrols', L('Two guards fail to return', '两名卫兵一去不回'), L('From the bridge near Eastvale, Guard Thomas sends Rolf and Malakai up the river to investigate. Both are found dead, and Rolf’s remains lie in a murloc camp near Stone Cairn Lake. Riverpaw gnolls also raid near Westbrook Garrison. Goldshire’s marshals rely on small posts like these to learn what is happening beyond the town.', '卫兵托马斯从东谷附近的桥上派罗尔夫和马拉凯沿河向上游调查。两人都被发现已经遇难，罗尔夫的遗体就在石碑湖附近的鱼人营地。西泉要塞附近也有河爪豺狼人出没劫掠。闪金镇的治安官靠这些小岗哨了解镇外的情况。'), [37, 45, 11], { figureIds: ['guard-thomas', 'rolf', 'malakai', 'dughan'], zoneIds: [1429], sourceIds: ['elwynn', 'elwynn-guards'] });
  B('el-families', L('A feud between farmhouses', '两户农家的宿怨'), L('Maybell Maclure and Tommy Joe Stonefield live on neighboring farms. Their families’ feud keeps them apart, and they turn to Gramma Stonefield and the apothecary in Goldshire for a way to meet. The farms give this forest its everyday sound, with animals in the yards and quarrels between neighbors.', '梅贝尔·马科伦与托米·乔·斯通菲尔德住在相邻的农场。两家的宿怨让两人无法相见，他们只好请斯通菲尔德老奶奶和闪金镇的药剂师帮忙，想办法见上一面。院子里的牲畜和邻人之间的争执，也是这片森林日常的一部分。'), [106], { figureIds: ['maybell', 'tommy-joe', 'gramma'], zoneIds: [1429], sourceIds: ['elwynn-lovers'] });
  B('el-river', L('When a wagon tips', '马车翻倒之后'), L('In Forever, a wagon returning from the trading post overturns and its supplies wash downstream. The driver cannot retrieve them alone with wolves and murlocs on the banks. For the people working this road, a damaged shipment can begin with an ordinary accident.', '无限服中，一辆从贸易站返回的马车翻倒，补给被河水冲向下游。岸上有狼和鱼人，车夫无法独自把东西找回来。对在这条路上工作的人来说，一场普通的事故就足以毁掉一批货。'), [91733], { edition: L('Forever addition', '无限服新增'), zoneIds: [1429], sourceIds: ['elwynn-river'] });

  B('rr-orcs', L('Stonewatch changes hands', '石堡易手'), L('Blackrock orcs hold Stonewatch Keep above the eastern end of Lake Everstill. Warlord Gath’Ilzogg and Tharil’zun command the forces there, with more orcs in the northern hills. Marshal Marris tries to contain the raids from Lakeshire. The road into the Burning Steppes shows how close an orc-held fortress can be to a town still flying Stormwind’s colors.', '黑石兽人占据了止水湖东端上方的石堡要塞。督军加塞尔佐格和萨瑞尔祖恩指挥守军，北面的山丘里还有更多兽人。治安官马瑞斯在湖畔镇设法遏制袭扰。沿通往燃烧平原的道路走一趟，就知道兽人控制的要塞离一座仍悬挂暴风城旗帜的小镇有多近。'), [20, 19], { figureIds: ['marris', 'gath-ilzogg', 'tharilzun'], zoneIds: [1433, 1428], sourceIds: ['redridge', 'redridge-orcs'] });
  B('rr-aid', L('Lakeshire asks for soldiers', '湖畔镇请求派兵'), L('Magistrate Solomon sends word to General Marcus Jonathan in Stormwind. The general promises troops once the king gives the order, and Lakeshire is left waiting. Gryan Stoutmantle in Westfall refuses to spare the militia from his own fight. Lord Ello Ebonlocke in Darkshire refuses as well. He says his town would be overrun before the Night Watch even reached the edge of the woods.', '所罗门镇长派人向暴风城的马库斯·乔纳森将军送信。将军答应国王一下令就派兵，湖畔镇只能等候。西部荒野的格里安·斯托曼忙于自己的战事，拒绝抽调民兵；夜色镇的艾尔罗·埃伯洛克公爵也拒绝了。他说，守夜人还没到森林边缘，自己的镇子就会被攻陷。'), [120, 121, 143, 144, 145, 146], { figureIds: ['solomon', 'marcus', 'gryan', 'ello'], zoneIds: [1433, 1453, 1436, 1431], sourceIds: ['redridge-aid', 'redridge-westfall', 'redridge-darkshire'] });
  B('rr-morganth', L('A mage behind the Shadowhide', '暗皮豺狼人背后的法师'), L('Gnolls live around the mountains and lake, and the Shadowhide near the Tower of Ilgalar answer to Morganth. Lieutenant Fangore leads them in the field. Theocritus watches from his own tower in Elwynn, and a pendant used by the gnolls reveals how they communicate with Morganth. The fight over the tower brings the two mages’ rivalry into Lakeshire’s defense.', '豺狼人栖居山中和湖畔，伊尔加拉之塔附近的暗皮豺狼人听命于莫甘斯，由范高雷中尉指挥作战。塞欧克瑞图斯从自己在艾尔文森林的高塔观察事态，豺狼人使用的坠饰则揭示了他们与莫甘斯联络的方式。围绕高塔的战斗，让两位法师的宿怨也卷入了湖畔镇的防务。'), [91, 180, 94, 178, 249], { figureIds: ['solomon', 'fangore', 'morganth', 'theocritus'], zoneIds: [1433, 1429], sourceIds: ['redridge-mage', 'redridge-gnolls'] });
  B('rr-trade', L('Crates at Three Corners', '三角路口的货箱'), L('Forever puts an Azeroth Commerce Authority trade hub at the crossroads. A torn shipping label directs lost or unfulfilled cargo there, and the Authority pays independent couriers for bringing it in. At the road junction used by Lakeshire’s messengers, merchants keep a network of their own moving.', '无限服中，艾泽拉斯贸易局在这里设立了贸易枢纽。破损的货运标签指明，遗失或未送达的货物应送到这里，贸易局会付钱给送来的独立信使。湖畔镇的信使走这处路口，商人也靠它维持自己的运输网络。'), [98247], { edition: L('Forever addition', '无限服新增'), zoneIds: [1433], sourceIds: ['redridge-trade'] });

  B('du-watch', L('Darkshire keeps a watch of its own', '夜色镇自己守夜'), L('Lord Ello Ebonlocke says Darkshire formed the Night Watch after Stormwind withdrew from the forest. His daughter Althea leads the watch against skeletons in Tranquil Gardens just outside town and in Raven Hill’s burial grounds. Darkshire’s front door is a road from Redridge. The watch has its hands full keeping even the ground beside the road safe.', '艾尔罗·埃伯洛克公爵说，暴风城从森林撤军后，夜色镇才组建了守夜人。他的女儿阿尔泰娅率队迎战镇外静谧花园墓场和乌鸦岭墓地的骷髅。从赤脊山来的路就是夜色镇的门户，守夜人光是确保路旁安全，就已忙不过来。'), [56, 58], { figureIds: ['ello', 'althea'], zoneIds: [1431, 1433], sourceIds: ['duskwood', 'dusk-watch', 'redridge-darkshire'] });
  B('du-scythe', L('What Jitters saw in the mine', '基特斯在矿洞里的所见'), L('The night elf priestess Velinde Starsong used the Scythe of Elune to call worgen against the demons of Ashenvale. Melyria Frostshadow looks to the old writings in the Howling Vale for clues. The trail leads to Duskwood, where Jitters writes that he found the scythe while digging in Roland’s Doom and saw worgen appear. He later witnesses the riders from Deadwind Pass attack the Yorgen farm. The inquiry finds signs of the scythe in the mine, with the weapon itself already gone.', '暗夜精灵女祭司维琳德·星歌曾用月神镰刀召来狼人，对抗灰谷的恶魔。梅丽瑞亚·霜影翻查狼嚎谷的旧文寻找线索。调查一路追到暮色森林。基特斯在日志中写道，他在罗兰之墓挖出镰刀，随后看见狼人现身。他后来又目睹来自逆风小径的骑士袭击约根农场。调查只在矿洞找到镰刀留下的痕迹，武器本身已不知去向。'), [1022, 1043], { figureIds: ['velinde', 'melyria', 'jitters', 'sven'], zoneIds: [1431, 1440], sourceIds: ['howling-vale', 'dusk-scythe', 'scythe-history'] });
  B('du-morbent', L('Sven and the dead of Raven Hill', '斯温与乌鸦岭的亡者'), L('Sven Yorgen survives the attack on his family and seeks help against Morbent Fel, the necromancer who commands undead near Raven Hill. Glorin Steelbrow directs the search for Lightforge iron off Menethil, and Grimand Elmore in Stormwind makes a weapon from it. Brought back to Duskwood, the weapon breaks Morbent’s magical protection.', '斯温·约根在家人遇袭后幸存下来，四处寻找能对付摩本特·费尔的人。这名死灵法师指挥着乌鸦岭附近的亡灵。戈罗林·钢眉指点人去米奈希尔港外寻找光铸铁，暴风城的格瑞曼德·艾尔默用它打造了一件武器。武器被带回暮色森林，破除了摩本特的魔法防护。'), [526, 322, 55], { figureIds: ['sven', 'morbent', 'glorin', 'grimand'], zoneIds: [1431, 1437, 1453], sourceIds: ['duskwood', 'dusk-morbent', 'dusk-lightforge'] });
  B('du-ladimore', L('The daughter at the gate', '在镇口守卫的女儿'), L('Morgan Ladimore went north to war and returned to a forest where he believed his family dead. In his grief he killed three people in the graveyard and took his own life. He rises as Mor’Ladim and haunts Raven Hill. His daughter Sarah survived and serves in the Night Watch. When her ring reaches his grave, he speaks of leaving the forest at peace. Forever adds a Ladimore heirloom to the keepsakes he leaves behind.', '摩根·拉迪莫尔曾北上参战，回到森林后以为家人已经死去。悲痛中，他在墓地杀了三人，又结束了自己的生命。他死后化为摩拉迪姆，在乌鸦岭徘徊。他的女儿莎拉其实活了下来，还加入了守夜人。有人把她的戒指带到父亲墓前，他才说自己可以安心离开这片森林了。无限服在他留下的纪念物中增加了一件拉迪莫尔家的传家宝。'), [228, 231], { edition: L('Classic story with a Forever reward', '经典旧世故事 · 无限服新增奖励'), figureIds: ['morgan-ladimore', 'sarah'], zoneIds: [1431], sourceIds: ['dusk-ladimore', 'dusk-ring', 'dusk-ring-forever'] });
  B('du-embalmer', L('The hermit’s gift', '隐士的礼物'), L('Abercrombie sends the mayor a letter, and his creation Stitches walks the road to Darkshire. The letter identifies the hermit as the Embalmer. He raised his dead wife Eliza by giving her his own heart, then shut her away when she hungered for human flesh. The heart is brought back from her grave, and the mayor hopes its magic will protect the town.', '亚伯克隆比给镇长送了一封信，他造出的缝合怪也沿路走向夜色镇。信揭开了隐士的身份：他就是藏尸者。他用自己的心脏复活亡妻伊莉莎，却在她渴求活人血肉后把她关了起来。有人从坟墓取回那颗心脏，镇长希望用它的魔力保护小镇。'), [160, 252, 253], { figureIds: ['abercrombie', 'ello', 'stitches', 'eliza'], zoneIds: [1431], sourceIds: ['duskwood', 'dusk-embalmer'] });
  B('du-stalvan', L('A schoolmaster’s papers', '家庭教师留下的信件'), L('Records in Moonbrook, Goldshire and the old house outside Stormwind trace Stalvan Mistmantle’s life as a tutor. His letters show how he fixated on his pupil Tilloa and turned to murder. By the time Darkshire learns the story, Stalvan is undead at his old manor. The papers preserved in ordinary homes explain how a local tale about a monster began with a man.', '月溪镇、闪金镇和暴风城外老宅中保存的记录，拼出了斯塔文·密斯特曼托当家庭教师的经历。他的信表明，他如何迷恋自己的学生蒂罗亚，最终动手杀人。夜色镇得知这段往事时，斯塔文已经变成亡灵，徘徊在旧庄园里。普通人家留下的文书，道出了这个怪物原本是怎样一个人。'), [98], { figureIds: ['stalvan', 'tilloa'], zoneIds: [1431, 1436, 1429, 1453], sourceIds: ['dusk-stalvan'] });
  B('du-grove', L('The green clearing in the dark', '黑暗中的绿色空地'), L('Hidden in the center of the wood, the Twilight Grove holds a great tree and a portal to the Emerald Dream. The other Classic portals include Bough Shadow in Ashenvale. Green dragonkin patrol the grove, and a Dragon of Nightmare can appear there. The grove ties Duskwood to the Dream even as the stories on its roads follow human families and the ghosts they leave behind.', '藏在森林中心的黎明森林里，有一棵大树和一扇通往翡翠梦境的传送门。经典旧世的其他入口还包括灰谷的大树荫。绿色龙人在林中巡逻，这里也可能出现梦魇之龙。周边道路上的故事讲的是人类家庭与他们留下的幽灵，这片树林则让暮色森林与梦境相连。'), [], { zoneIds: [1431, 1440], sourceIds: ['duskwood', 'ashenvale'] });

  B('we-grim-batol', L('A fortress used by two armies', '两支军队占据过的要塞'), L('Khardros Wildhammer made {Grim Batol} his home after losing Ironforge. Modgud’s assault left the fortress tainted, and the Wildhammers departed for the Hinterlands. Much later the {Dragonmaw} used the Demon Soul to enslave Alexstrasza and breed mounts for the Horde’s Second War armies. In the events of Day of the Dragon, the Demon Soul was destroyed and the red Dragonqueen was freed. Her flight now guards the old fortress.', '卡德罗斯·蛮锤失去铁炉堡后，在{格瑞姆巴托}安家。莫德古德的进攻污染了要塞，蛮锤氏族随后迁往辛特兰。很久以后，{龙喉氏族}用恶魔之魂奴役阿莱克丝塔萨，繁育坐骑供第二次战争中的部落军队使用。在《巨龙时代》的故事里，恶魔之魂被摧毁，红龙女王获得自由。她的龙群如今守着这座旧要塞。'), [], { figureIds: ['khardros', 'modgud', 'alexstrasza'], zoneIds: [1437, 1455], sourceIds: ['history', 'grim-history', 'wetlands'] });
  B('we-dragonmaw', L('The Dragonmaw still have a camp', '龙喉氏族仍有一处营地'), L('The clan survives in the thickets around Angerfang Encampment. Captain Stoutfist in Menethil sees the banners and catapults as a threat to the settlements and roads. The catapults burn and Chieftain Nek’rosh is killed. The campaign follows the people left in the marshes after the age of orcs riding dragons over Khaz Modan.', '龙喉氏族留在怒牙营地一带的灌木丛里。米奈希尔港的斯托菲队长发现，他们的战旗和投石车已对聚落与道路构成威胁。后来投石车被烧毁，纳克罗什酋长也被杀死。这场战役追踪的是兽人骑龙飞越卡兹莫丹的时代结束后，仍留在沼泽中的残部。'), [464, 465, 474], { figureIds: ['stoutfist', 'nekrosh'], zoneIds: [1437], sourceIds: ['wet-dragonmaw', 'wetlands'] });
  B('we-bridge', L('The fight for the northern road', '争夺北路'), L('Dark Iron forces damage the Thandol Span and overrun Dun Modr at its southern approach. Motley Garmason calls for a counterattack while waiting for reserves. The fight reaches south again when he names Kam Deepfury, a Dark Iron prisoner in Stormwind’s Stockade. The damaged bridge is the crossing from Khaz Modan into Arathi, so losing the road isolates more than one dwarven post.', '黑铁军队破坏了萨多尔大桥，攻陷桥南端的丹莫德。莫特雷·加玛森一边等候援军，一边号召反攻。他指出一名黑铁囚犯卡姆·深怒关在暴风城监狱，战事的线索便又延伸到南方。受损的大桥是从卡兹莫丹进入阿拉希高地的要道，这条路一断，受困的就远不止一座矮人岗哨。'), [303, 378], { figureIds: ['motley', 'kam'], zoneIds: [1437, 1453], sourceIds: ['wet-bridge', 'wetlands'] });
  B('we-dig', L('What lies under the mud', '淤泥之下埋着什么'), L('At Whelgar’s Excavation Site, raptors have driven the dig team into a cave. Prospector Whelgar still wants the fragments of an ancient tablet scattered around the site. The expedition is part of the same work that sends prospectors out from Ironforge to Loch Modan and Darkshore. The marsh has a buried past of its own under the roads and wrecks of the recent wars.', '迅猛龙把维尔加挖掘场的考古队逼进了山洞，勘察员维尔加仍想找齐散落在附近的上古石板碎片。和前往洛克莫丹、黑海岸的考察一样，这支队伍也是从铁炉堡派出的。道路与近年战事留下的残骸下方，还埋着沼泽自己的古老历史。'), [306, 299], { figureIds: ['whelgar'], zoneIds: [1437, 1455, 1432], sourceIds: ['wet-dig', 'wetlands'] });
  B('we-fleet', L('The crews in the wreckage', '沉船中的船员'), L('First Mate Fitzsimmons survives the wreck of the Third Fleet of Kul Tiras. The other sailors still walk the wrecks, held there by a cursed object aboard the Intrepid. Captain Halyndor keeps the key to its strongbox even in death. Fitzsimmons seeks help from the living in Menethil, where the priest Glorin Steelbrow can cleanse what the fleet carried.', '大副菲兹莫斯在库尔提拉斯第三舰队覆没时幸存。其他水手仍在沉船间游荡，被无畏号上的一件诅咒物品困在那里。哈林多尔船长死后仍攥着存放它的箱子钥匙。菲兹莫斯向米奈希尔港的活人求援，牧师戈罗林·钢眉能净化舰队载来的那件东西。'), [289, 290], { figureIds: ['fitzsimmons', 'halyndor', 'glorin'], zoneIds: [1437], sourceIds: ['wet-fleet'] });
  B('we-green', L('The marsh has a keeper', '沼泽的守卫者'), L('Beside the road, Rethiel the Greenwarden sees creatures trampling the land and oozes spreading through it. He asks for the damage to be checked where he finds it. Menethil’s people look at the marsh and see a road they need to keep open. Rethiel speaks for the wet ground and the things that grow there.', '在道路旁，绿色守卫者雷希耶尔看到生物践踏土地，软泥怪四处蔓延。他发现哪里受到损害，就请人在哪里加以遏制。米奈希尔港的居民看重的是穿过沼泽的道路，雷希耶尔关心的则是湿地本身和栖息在那里的生灵。'), [275], { figureIds: ['rethiel'], zoneIds: [1437], sourceIds: ['wet-green'] });
  B('we-excavation', L('What wakes beyond Whelgar’s dig', '维尔加挖掘场外苏醒的东西'), L('In Forever the Explorers’ League opens a camp near newly uncovered titan activity southeast of Whelgar’s site. Rethiel senses a taint seeping through the highland gully and warns the excavators that an ancient power is stirring. Daewyn Songblade, who joined a dig crew from Loch Modan, is found dead at the excavation. His brother Dorin hears the news back in Lakeshire.', '无限服中，探险者协会在维尔加挖掘场东南面发现了新的泰坦活动迹象，于是在附近扎营。雷希耶尔察觉腐化正从高地沟壑渗出，便警告考古队有古老力量正在苏醒。戴温·桑布雷德从洛克莫丹加入了一支挖掘队，后来被发现死在挖掘场。他的哥哥多林在湖畔镇收到了消息。'), [95646, 95772, 95795], { edition: L('Forever addition', '无限服新增'), figureIds: ['rethiel', 'dorin', 'daewyn', 'whelgar'], zoneIds: [1437, 1432, 1433], sourceIds: ['wet-excavation', 'wet-horror', 'wet-songblade', 'wet-fallen'] });
  B('we-diplomat', L('A witness at the harbor inn', '港口旅店里的证人'), L('Mikhail in Menethil knows where to find Tapoke “Slim” Jahn, a man implicated in the disappearance of a diplomat. Tapoke is stopped before he can escape, and the search continues across the sea toward Theramore. The missing diplomat investigation grows out of Stormwind’s concern over an absence at court. Menethil is where the trail catches up with one of the men who helped it happen.', '米奈希尔港的米克哈尔知道在哪里能找到牵涉使节失踪案的“干柴”塔伯克·贾恩。塔伯克没能逃走，调查继续跨海追向塞拉摩。失踪使节一案源于暴风城宫廷对一人下落的担忧，米奈希尔港则是调查者追上其中一名帮凶的地方。'), [1248, 1249, 1250], { figureIds: ['mikhail', 'tapoke', 'varian'], zoneIds: [1437, 1453], sourceIds: ['diplomat', 'manual'] });

  B('sw-fall', L('The First War reaches the capital', '第一次战争打到都城'), L('The first Horde came through the Dark Portal and fought its way to Stormwind. King Llane Wrynn was killed by Garona, the keep fell, and Anduin Lothar led survivors north to Lordaeron, including the young Varian. The refugees’ appeal helped bring the northern kingdoms together for the Second War. The statues on the bridge into Classic Stormwind remember the Alliance expedition that later went through the Dark Portal.', '最初的部落穿过黑暗之门，一路攻到暴风城。莱恩·乌瑞恩国王被迦罗娜杀死，要塞随之陷落。安度因·洛萨带着包括年幼的瓦里安在内的幸存者北逃洛丹伦。难民的求援促成了北方诸国在第二次战争中的联合。经典旧世时期，暴风城入口桥上的雕像纪念的是后来穿过黑暗之门的联盟远征军。'), [], { figureIds: ['llane', 'garona', 'lothar', 'varian'], zoneIds: [1453, 1429], sourceIds: ['stormwind', 'manual'] });
  B('sw-regency', L('A child on the throne', '王位上的孩子'), L('Varian goes missing on the way to a diplomatic meeting at Theramore. His son Anduin wears the crown, with Highlord Bolvar Fordragon as regent and Lady Katrana Prestor advising at court. When a report comes in from a place like Lakeshire, its path ends at a court still trying to govern while Varian is away.', '瓦里安在前往塞拉摩参加外交会谈的路上失踪。他的儿子安度因继位，由伯瓦尔·弗塔根公爵摄政，卡特拉娜·普瑞斯托女士在宫廷担任顾问。来自湖畔镇等地的报告，最终会送到这个仍得在瓦里安缺席时处理政务的宫廷。'), [], { figureIds: ['varian', 'anduin', 'bolvar', 'katrana'], zoneIds: [1453, 1433, 1437], sourceIds: ['manual', 'stormwind', 'redridge-aid'] });
  B('sw-gatehouse', L('Cheese and the city watch', '奶酪店与城卫'), L('Forever gives Trias’ Cheese a delivery to the gatehouse stockroom. The shop and guard quarters share a floor, and the guards have a routine for bringing deliveries in. The Trade District is a place where guild business, the watch and the errands of ordinary shoppers share the same buildings.', '无限服中，提亚斯奶酪店有一批货要送进门楼库房。店铺与卫兵营房在同一层，卫兵有自己的收货流程。在贸易区，行会、城卫与普通顾客的日常就在同一栋栋建筑里交汇。'), [97222], { edition: L('Forever addition', '无限服新增'), zoneIds: [1453], sourceIds: ['stormwind-goods'] });

  B('av-cenarius', L('The Warsong and the demigod', '战歌氏族与半神'), L('The Warsong entered Ashenvale during the Third War to cut timber. The night elves fought to drive them out, and Cenarius came to the forest’s defense. Grom Hellscream and his warriors drank from a well tainted with Mannoroth’s blood and killed Cenarius. Grom later died fighting Mannoroth. The Warsong’s lumber camp in the Classic forest keeps alive the quarrel over trees that began in that war.', '第三次战争期间，战歌氏族为伐木进入灰谷。暗夜精灵奋力驱逐他们，塞纳留斯也出面守卫森林。格罗姆·地狱咆哮和他的战士喝下被玛诺洛斯之血污染的井水，杀死了塞纳留斯。格罗姆后来在与玛诺洛斯的战斗中身亡。经典旧世时期的战歌伐木营地，延续了那场战争以来因木材而起的纷争。'), [], { figureIds: ['grom', 'cenarius', 'mannoroth'], zoneIds: [1440], sourceIds: ['ashen-third-war', 'ashenvale'] });
  B('av-warsong', L('A forest divided over timber', '因木材而分裂的森林'), L('Astranaar anchors the Sentinel road through the forest. The Silverwing Sentinels and Warsong Outriders fight over its southern timberlands in Warsong Gulch. At Splintertree Post, Locke Okarr needs saw blades, rope and axes for the lumber camp. Even the shipment from Booty Bay passes through country where furbolgs take the rope and satyrs steal oil for their rituals.', '阿斯特兰纳是哨兵穿行森林的主路上的重镇。银翼哨兵与战歌斥候在战歌峡谷争夺南部的林地。碎木岗哨的洛克·奥卡尔需要为伐木营地筹集锯条、绳索和斧头。连藏宝海湾运来的货都要穿过险地：熊怪夺走绳索，萨特偷走油料，用于自己的仪式。'), [6571], { figureIds: ['locke'], zoneIds: [1440], sourceIds: ['ashenvale', 'ashen-warsong'] });
  B('av-raene', L('The furbolgs and Dartol’s rod', '熊怪与达图尔的魔棒'), L('Raene Wolfrunner in Astranaar has seen furbolgs turn against their old neighbors. Her investigation uncovers the pieces of a rod made by Dartol that lets its bearer take furbolg form. Krolg, a furbolg willing to talk, says the corruption has made Ran Bloodtooth stronger. Krolg seeks help against Ran and his followers so they will leave the forest’s children in peace.', '阿斯特兰纳的莱恩·狼行者目睹熊怪与旧邻反目。她在调查中找到了达图尔制作的魔棒碎片，这根魔棒能让持有者变成熊怪。愿意交谈的熊怪克罗格说，腐化让兰恩·血牙变得更强。克罗格希望有人能对付兰恩及其追随者，好让森林的孩子们恢复安宁。'), [991, 1024, 1045, 1046], { figureIds: ['raene', 'krolg', 'ran', 'dartol'], zoneIds: [1440], sourceIds: ['ashen-raene'] });
  B('av-satyrs', L('The camps in the east', '东部的营地'), L('Satyrs occupy Night Run, Satyrnaar and Xavian. They use oil stolen from the Warsong in their rites, and the Horde post at Splintertree wants the camps pushed back. Ancient demonic enemies and a new lumber camp are close enough for a freight shipment to cross between them.', '萨特占据夜道谷、萨提纳尔与萨维亚。他们把从战歌氏族那里偷来的油用在仪式上，部落驻守的碎木岗哨则想把他们赶走。古老的恶魔宿敌离新建的伐木营地很近，一批货就可能从一方落到另一方手里。'), [6441], { zoneIds: [1440], sourceIds: ['ashen-satyrs', 'ashen-warsong'] });
  B('av-standstill', L('The path past a lake on the move', '湖中生变，山路受阻'), L('At Splintertree Post, Mastok Wrilehiss reports that water elementals at Mystral Lake have stopped traffic to Stonetalon. His concern is the same route Faldreas uses to contact the keepers on Stonetalon Peak. The Talondeep Path runs from the wooded shores near the lake to the logging country of Windshear Crag.', '碎木岗哨的马斯托克·维尔西斯报告说，密斯特拉湖的水元素阻断了前往石爪山脉的交通。法德瑞斯也走这条路去联络石爪峰的守护者。石爪小径从树木环绕的湖畔一路通往狂风峭壁的伐木区。'), [25, 1056], { figureIds: ['mastok', 'faldreas'], zoneIds: [1440, 1442], sourceIds: ['ashenvale', 'st-standstill', 'stonetalon'] });
  B('av-necklace', L('A keepsake on an outpost road', '遗落在前哨路上的纪念物'), L('In Forever, Maliynn in Astranaar loses a crescent necklace while delivering supplies to an outpost. It was a gift from her late parents. When it comes back to her, the same roads that carry timber and patrols have also carried home a piece of her family’s history.', '无限服中，阿斯特兰纳的玛琳在给前哨送补给时丢了一条新月项链，那是她已故父母的礼物。项链最终回到她手中。运送木材和供巡逻队通行的道路，也把她家的一段往事送回了家。'), [98027], { edition: L('Forever addition', '无限服新增'), figureIds: ['maliynn'], zoneIds: [1440], sourceIds: ['ashen-necklace'] });
  B('tw-sapphires', L('The naga gather crystals', '纳迦采集水晶'), L('At Zoram’gar, Je’neu Sancrea learns that naga are harvesting sapphires from the tunnels of Blackfathom Deeps. He knows the crystals hold elemental power and asks that the harvesting be stopped. His evidence gives the Horde its own reason to look beneath the shore, where an Argent Dawn scout is already searching for the cult.', '佐拉姆加的耶努萨克雷得知，纳迦正在黑暗深渊的隧道中采集蓝宝石。他知道水晶蕴含元素之力，便请人阻止采集。这条消息让部落也有了到海岸下方调查的理由。那时，银色黎明的一名侦察员已在那里寻找邪教了。'), [6563], { figureIds: ['jeneu', 'thaelrid'], zoneIds: [1440], sourceIds: ['bfd-sapphires', 'bfd-classic'] });
  B('tw-shrine', L('Sacrifices beneath the coast', '海岸地下的献祭'), L('Argent Guard Thaelrid finds the Twilight’s Hammer and the naga occupying the flooded sanctuary together. Twilight Lord Kelris sacrifices captives to Aku’mai for power. Thaelrid calls for Kelris to be killed, and the expedition can reach Aku’mai beyond the altar. The cult’s bargain at Blackfathom gives the investigation begun at the Master’s Glaive a concrete result: the ritual and the creature it fed are stopped.', '银月守卫塞尔瑞德发现，暮光之锤与纳迦共同占据了水下圣所。梦游者克尔里斯把俘虏献给阿库麦尔，以换取力量。塞尔瑞德要求除掉克尔里斯，远征队还可以越过祭坛找到阿库麦尔。主宰之剑开始的调查，在黑暗深渊取得了具体成果：献祭被阻止，接受祭品的生物也被消灭。'), [1200, 6561], { figureIds: ['thaelrid', 'kelris', 'akumai'], zoneIds: [1440, 1439], sourceIds: ['bfd-kelris', 'bfd-classic'] });

  B('st-kaya', L('The attack on Camp Aparaje', '阿帕拉耶营地遇袭'), L('Grimtotem raiders overrun Camp Aparaje. Makaba Flathoof believes he has lost his daughter Kaya until she is found alive near the Grimtotem camp. Her return brings word to her aunt Tammra at Sun Rock Retreat. The survivors turn to a nearby tauren refuge after an attack by another tauren faction.', '恐怖图腾的袭击者攻破阿帕拉耶营地。玛卡巴·扁蹄一度以为女儿卡雅已死，后来有人在恐怖图腾营地附近发现她还活着。她回来后，消息传到了烈日石居的姑妈塔姆拉那里。遭到另一个牛头人派系袭击后，幸存者投奔了附近的牛头人避难所。'), [6548, 6401], { figureIds: ['makaba', 'kaya', 'tammra'], zoneIds: [1442], sourceIds: ['st-kaya', 'stonetalon'] });
  B('st-logging', L('The saws at Windshear Crag', '狂风峭壁上的电锯'), L('The Venture Company cuts timber on a large scale. Loggers and machines fill Windshear Crag, and Gerenzo Wrenchwhistle oversees the work around Cragpool Lake. Ziz Fizziks, a goblin the company dismissed, seeks the plans for its Super Reaper 6000 for a rival employer. The tauren at Sun Rock want the invaders out. Ziz sees a machine worth copying.', '风险投资公司大规模砍伐木材。伐木工和机器遍布狂风峭壁，格雷苏负责监督峭壁湖周围的作业。被公司解雇的地精菲兹克斯替竞争对手寻找超级收割机6000的图纸。烈日石居的牛头人只想赶走入侵者，菲兹克斯看到的却是一台值得仿造的机器。'), [1062, 1093, 1096], { figureIds: ['gerenzo', 'ziz'], zoneIds: [1442], sourceIds: ['st-logging', 'stonetalon'] });
  B('st-vale', L('Life in the burned valley', '焦谷中的生灵'), L('In the Charred Vale, harpies nest among dead trees and burned ground. Keeper Albagorm at Stonetalon Peak calls for them to be driven back, and Maggran Earthbinder in Sun Rock Retreat singles out the Bloodfury Ripper. Both settlements have reason to care what happens in the valley below them.', '焦炭谷的鹰身人在枯树和焦土之间筑巢。石爪峰的守护者奥巴格姆号召人们把它们赶回去，烈日石居的马格兰则点名要除掉血怒撕裂者。山下谷地发生的事，两处聚落都无法置身事外。'), [1057, 6282, 6283], { figureIds: ['albagorm', 'maggran', 'bloodfury-ripper'], zoneIds: [1442, 1440], sourceIds: ['st-vale', 'stonetalon'] });
  B('st-seeds', L('What can grow again', '什么还能重新长出来'), L('Tammra Windfield sees the damage caused by war and industry and asks for Gaea seeds found beside Mirkfallon Lake. She blesses them in the name of the Earthmother. The seeds are planted in the Charred Vale so that other plants will have a foothold in the burned ground.', '塔姆拉·荒原看到战争与工业留下的破坏，请人去暗色湖畔寻找盖亚之种。她以大地母亲的名义为种子祈福。种子被播进焦炭谷，希望其他植物也能在焦土中扎下根。'), [6301, 6381], { figureIds: ['tammra'], zoneIds: [1442], sourceIds: ['st-seeds', 'st-new-life'] });
  B('st-supplies', L('The shipment that never reached the peak', '没有送上山峰的补给'), L('In Forever, a night elf courier bound for Stonetalon Peak dies near Mirkfallon Lake. The Pridewing wyverns take the supplies, and a note names Innkeeper Faralia as the intended recipient. The inn waits at the top of a mountain whose roads and slopes can be as dangerous to its neighbors as the burned vale below.', '无限服中，一名要去石爪峰的暗夜精灵信使死在暗色湖附近，补给被巨翼双足飞龙叼走。便笺注明，收件人是旅店老板法拉莉亚。旅店在山顶等待货物，而上山的路和山坡，对附近居民来说并不比下方的焦谷安全。'), [86574], { edition: L('Forever addition', '无限服新增'), figureIds: ['faralia'], zoneIds: [1442], sourceIds: ['st-supplies'] });

  B('al-papers', L('Plans on the mountain road', '山路上的密谋'), L('Magistrate Henry Maleb sends scouts after Syndicate spies. Papers found at a camp give Southshore grounds to treat the mountain groups as an organized threat.', '赫尼·马雷布镇长派人调查辛迪加密探。营地里搜出的文件让南海镇有理由相信，山里的团伙正在有组织地威胁当地。'), [505, 510], { figureIds: ['henry-maleb'], zoneIds: [1416, 1424], sourceIds: ['al-plans'] });
  B('al-rings', L('The signets of Alterac', '奥特兰克印戒'), L('Maleb asks for the rings carried by Syndicate members. He recognizes the seals as those of Alterac’s nobles and remembers how those lords betrayed the Alliance. The family insignia tie a present danger to a war Southshore has already lived through.', '马雷布要查验辛迪加成员随身携带的印戒。他认出那是奥特兰克贵族的纹章，也记得那些贵族曾背叛联盟。这些家族印记让眼前的威胁与南海镇经历过的战争连在了一起。'), [512], { figureIds: ['henry-maleb'], zoneIds: [1416, 1424], sourceIds: ['al-rings'] });
  B('ar-badges', L('The badges of the Syndicate', '辛迪加的徽章'), L('Captain Nials at Refuge Pointe learns that the Syndicate is paying a bounty for badges taken from Stromgarde’s militiamen. She asks for those badges to be recovered from the Syndicate inside the old Alliance city.', '避难谷地的尼艾丝队长得知，辛迪加出钱收购从激流堡民兵身上夺来的徽章。她要求从联盟古城内的辛迪加手里夺回这些徽章。'), [681, 682], { figureIds: ['nials'], zoneIds: [1417], sourceIds: ['ar-badges'] });
  B('ar-call', L('An outpost under pressure', '受到围攻的前哨'), L('Drum Fel sees a joint threat from the Witherbark and Boulderfist. The leaders behind the ogre attacks have made their lair in Stromgarde, drawing the Horde into a ruin that the Alliance wants back for itself.', '德拉姆·费尔察觉到枯木巨魔与石拳食人魔的联手威胁。带头进攻的食人魔躲在激流堡，把部落也扯进了联盟想要夺回的废墟。'), [677, 679], { figureIds: ['drum-fel'], zoneIds: [1417], sourceIds: ['ar-call', 'ar-lords'] });
  B('ba-lost', L('Three dwarves underground', '留在地下的三名矮人'), L('The Explorers’ League has lost contact with three dwarves in Uldaman. The missing party is a reminder that the ruins are still being explored and that the people doing the work can disappear inside them.', '探险者协会与深入奥达曼的三名矮人失去了联系。考察队的失踪让人意识到，这座遗迹远未探明，进来调查的人随时可能没了消息。'), [2398], { figureIds: [], zoneIds: [1418, 1455], sourceIds: ['ba-lost'] });
  B('ba-discs', L('The watcher’s archive', '看守者的档案'), L('The Discs of Norgannon and their watcher preserve an account of the earthen. A copy makes it possible to carry that account out of the ruins and compare it with what the peoples of Azeroth know of their own beginnings.', '诺甘农圆盘及其看守者保存了一份土灵的记录。抄本让这份史料得以离开遗迹，也让艾泽拉斯的族群可以拿它与自己的起源传说对照。'), [2278], { figureIds: [], zoneIds: [1418, 1455], sourceIds: ['ba-discs'] });
  B('bl-stones', L('The stones that hold the dead', '束缚亡者的石头'), L('A fallen Horde officer remains near the border with the swamp. In his account, the men he led are still bound to demonic stones. Breaking that hold is the first part of setting right what happened to his command.', '一名阵亡的部落军官留在沼泽边界附近。他说，自己带领的部下至今仍被恶魔的石头束缚。要弥补这支队伍遭遇的灾难，得先打破束缚。'), [2784, 2681], { figureIds: [], zoneIds: [1419, 1435], sourceIds: ['bl-grace', 'bl-stones'] });
  B('bl-demon', L('Spoiler · The master on the rise', '剧透 · 高地上的主谋'), L('The officer’s story leads to the dreadlord Razelikh, known as the Defiler. His lieutenants’ amulets open the way to the demon, and with Razelikh’s death the fallen officer at last counts his debt paid.', '循着军官讲出的往事，线索指向恐惧魔王污染者拉瑟莱克。其手下的护符打开了通往恶魔的道路。拉瑟莱克死后，阵亡军官终于得偿所愿。'), [3628], { figureIds: [], zoneIds: [1419], sourceIds: ['bl-demon'] });
  B('ti-awakening', L('The crypt opens', '墓穴开启'), L('At Deathknell, Undertaker Mordo greets the newly awakened and directs them to Shadow Priest Sarvis. The welcome is the first contact many of the free undead have with the community that calls itself the {Forsaken}.', '在丧钟镇，看护者莫多迎接刚苏醒的亡灵，让他们去找暗影牧师萨维斯。许多获得自由的亡灵，就这样第一次接触自称{被遗忘者}的同胞。'), [363], { figureIds: [], zoneIds: [1420], sourceIds: ['ti-awakening'] });
  B('ti-scarlet', L('Spies near the capital', '都城近郊的密探'), L('Deathguard Simmer reports that Scarlet zealots have sent spies close to Brill. The fighting stretches from village watch posts toward the monastery, where the Crusade still holds a base in the former kingdom.', '亡灵卫兵希米尔报告说，血色十字军的狂热信徒已把密探派到布瑞尔附近。战线从村镇岗哨延伸到修道院，十字军在那里保有一处据点。'), [370], { figureIds: [], zoneIds: [1420], sourceIds: ['ti-scarlet'] });
  B('ti-plague', L('A plague of their own', '他们自己的瘟疫'), L('Apothecary Johaan gathers ingredients for a new plague, meant to be turned against the Forsaken’s enemies. Brill’s experiments are part of the same undertaking that the Royal Apothecary Society directs from below the capital.', '药剂师约翰搜集研制新瘟疫的材料，打算用它对付被遗忘者的敌人。布瑞尔的实验与都城地下皇家药剂师协会主持的研究同属一项计划。'), [367, 368, 369, 492], { figureIds: ['johaan'], zoneIds: [1420, 1458], sourceIds: ['ti-plague'] });
  B('sp-shackles', L('The enchanted shackles', '带有魔法的镣铐'), L('From the Sepulcher, Dalar Dawnweaver studies the change that comes over Pyrewood after sunset. The shackles Arugal has enchanted on the townspeople give him a way to examine the spell behind the nightly transformation.', '达拉尔·道恩维沃在瑟伯切尔研究焚木村日落后发生的变故。阿鲁高施在村民身上的附魔镣铐，让他得以查究每夜变身背后的法术。'), [99], { figureIds: [], zoneIds: [1421], sourceIds: ['sp-shackles'] });
  B('sp-keep', L('The mage in the keep', '城堡里的法师'), L('High Executor Hadrec follows Arugal’s crimes back to Shadowfang Keep and calls for the archmage’s death. The stronghold stands above the village as a visible reminder of how close the source of its curse has been.', '高级执行官哈德瑞克追查阿鲁高的罪行，一路查到影牙城堡，要求处死这位大法师。要塞就在村庄上方，诅咒的源头原来一直近在眼前。'), [1014], { figureIds: ['arugal'], zoneIds: [1421], sourceIds: ['sp-keep'] });
  B('wp-cauldrons', L('From the granaries to the cauldrons', '从粮仓到瘟疫之锅'), L('Investigators set out to learn how the Scourge spreads its plague from the farms. The cauldrons supply samples, and the presence of cauldron lords makes it clear that the Scourge is still tending them.', '调查者要弄清天灾军团如何从农场散播瘟疫。瘟疫之锅提供了样本，而锅边的护锅领主表明，天灾军团还在照看这些锅。'), [5215, 5216, 5217, 5219], { figureIds: [], zoneIds: [1422], sourceIds: ['wp-cauldrons', 'wp-felstone'] });
  B('wp-araj', L('A lich in the ruined town', '废城里的巫妖'), L('Araj the Summoner holds Andorhal, and his phylactery holds a shard sought by those who confront him. The ruined grain town is still a seat of Scourge power.', '召唤者阿拉基占据着安多哈尔。讨伐他的人要取走他护命匣上的碎片。昔日粮镇虽已成废墟，仍是天灾军团的据点。'), [211], { figureIds: ['araj'], zoneIds: [1422], sourceIds: ['wp-araj'] });
  B('wp-order', L('Spoiler · A son leaves the Scarlet Order', '剧透 · 儿子离开血色十字军'), L('Tirion’s mementos reach Taelan in Hearthglen. Taelan casts off his Scarlet allegiance, but Grand Inquisitor Isillien intercepts him on the road. Tirion loses his son and vows to return to the fight against the Scourge.', '提里奥的纪念物送到了壁炉谷的泰兰手中。泰兰决意离开血色十字军，却在路上遭到大检察官伊森利恩截杀。提里奥失去了儿子，立誓重新投身对抗天灾军团的战斗。'), [5862, 5944], { figureIds: ['tirion', 'taelan'], zoneIds: [1422, 1423], sourceIds: ['wp-order'] });
  B('ep-doll', L('A child’s doll', '一个孩子的洋娃娃'), L('Pamela Redpath still waits in Darrowshire and asks about her doll. Her small concern leads to the record of the battle in which the village and its families were lost.', '帕米拉·雷德帕斯仍在达隆郡等待，惦记着自己的洋娃娃。从这件小事追查下去，便会读到那场战斗的记载。村庄和许多家庭都毁在那一战中。'), [5149], { figureIds: ['pamela'], zoneIds: [1423], sourceIds: ['ep-doll'] });
  B('ep-redpath', L('Spoiler · Captain Redpath’s return', '剧透 · 雷德帕斯队长归来'), L('A reenactment of the battle shows how Captain Joseph Redpath was corrupted and turned on his own defenders. When his corrupted spirit is defeated, he can ask forgiveness, and Pamela finally hears from her father.', '重现的战斗揭示了约瑟夫·雷德帕斯队长如何遭到腐化，转而攻击自己人。堕落的灵魂被击败后，他得以请求宽恕，帕米拉也终于收到了父亲的消息。'), [5721, 5941], { figureIds: ['pamela'], zoneIds: [1423], sourceIds: ['ep-battle', 'ep-redpath'] });
  B('ep-mementos', L('A father’s keepsakes', '父亲的纪念物'), L('Tirion lives in exile near the river. He recounts the loss of his standing and asks for objects that might remind his son Taelan of the family and the life he knew before the Scarlet Crusade.', '提里奥流亡在河边。他讲述了自己失去地位的经过，想找回几样旧物，好让儿子泰兰想起家人，以及加入血色十字军之前的生活。'), [5742, 5781, 5845, 5846], { figureIds: ['tirion', 'taelan'], zoneIds: [1423, 1422], sourceIds: ['ep-family'] });
  B('hi-fields', L('Orders from Tarren Mill', '塔伦米尔的命令'), L('High Executor Darthalia says she acts under Varimathras. Her first target is the food supply and the people who tend the farms. The orders show how quickly a dispute over the foothills reaches the households that feed them.', '高级执行官达萨利亚自称奉瓦里玛萨斯的命令行事。她先瞄准粮食供应和耕作的人。围绕丘陵的争夺很快波及了养活当地人的农户。'), [527], { figureIds: ['varimathras', 'darthalia'], zoneIds: [1424], sourceIds: ['hi-fields'] });
  B('hi-plague', L('A trial on a living farmer', '在活人身上试药'), L('Apothecary Lydon’s work produces an elixir tested on Stanley, the farmer at Hillsbrad Fields. The experiments that began as ingredient gathering in Tirisfal have reached a living person in the foothills.', '药剂师林度恩配出一种药剂，拿希尔斯布莱德农场的农夫斯坦雷试药。研究最初只是在提瑞斯法搜集材料，如今却已用在丘陵的活人身上。'), [502], { figureIds: [], zoneIds: [1424, 1420, 1458], sourceIds: ['hi-elixir'] });
  B('ht-elder', L('An elder taken in a raid', '在袭击中被掳走的长者'), L('Primal Torntusk at Revantusk Village seeks her mate, Elder Torntusk, after a midnight raid. Scouts discover him alive at Jintha’Alor, where Vile Priestess Hexx means to offer him to Hakkar.', '恶齿村在午夜遇袭，原始者图斯克随后四处寻找自己的伴侣断齿长者。侦察员发现他还活着，被囚在辛萨罗。邪恶祭司海克斯打算把他献给哈卡。'), [7845, 7846, 7847], { figureIds: [], zoneIds: [1425, 1434], sourceIds: ['ht-elder'] });
  B('ht-kidnapped', L('A gryphon held in the temple', '困在神庙里的狮鹫'), L('The Wildhammer dwarves look for Sharpbeak, a young gryphon taken from the highlands. The search reaches Jintha’Alor, where the Vilebranch hold him in a cage above the valley.', '蛮锤矮人寻找在高地失踪的幼年狮鹫沙普比克。调查一路追到辛萨罗，邪枝巨魔把它关在谷地上方的笼子里。'), [2989, 2994], { figureIds: [], zoneIds: [1425], sourceIds: ['ht-sharpbeak'] });
  B('sg-brotherhood', L('Supplies for the Brotherhood', '送给兄弟会的物资'), L('At Thorium Point, Master Smith Burninate exchanges supplies for favor with the Brotherhood. The list includes Incendosaur scales and coal, materials the forge needs to keep working.', '瑟银哨塔的大铁匠博恩奈特收取物资，兄弟会也因此对提供物资的人多一分信任。所需物资包括熏火龙的鳞片与煤，工坊少不了这些材料。'), [7737], { figureIds: [], zoneIds: [1427], sourceIds: ['sg-brotherhood'] });
  B('sg-flame', L('The fire for a new implement', '打造器具的火'), L('Kalaran Windblade waits by the road beside a stone monument. He has the means to make a torch, but needs a flame and a shaft suited to the work. The materials he seeks come from the gorge and its Dark Iron workings.', '卡拉然·温布雷在路旁的石碑边等候。他有办法打造火炬，却缺少合用的火种和火炬杆，只能从峡谷和黑铁矿场里寻找材料。'), [3442, 3443], { figureIds: ['kalaran'], zoneIds: [1427], sourceIds: ['sg-flame', 'sg-shaft'] });
  B('sg-torch', L('Spoiler · The dragon at the monument', '剧透 · 石碑旁的龙'), L('Kalaran’s torch is used to set the Dark Irons’ watchtowers ablaze. Afterward the traveler sheds his disguise, revealing himself to be a drake of the black dragonflight. The job that seemed to belong to a lone traveler was the business of a dragon.', '卡拉然的火炬点燃了黑铁矮人的哨塔。随后旅人卸下伪装，现出黑龙的原形。先前看似一名旅人的私事，竟是一头龙的安排。'), [3454, 3463, 3481], { figureIds: ['kalaran'], zoneIds: [1427], sourceIds: ['sg-ablaze', 'sg-reveal'] });
  B('bs-dragonkin', L('A report from the frontier', '边境传来的报告'), L('Helendis Riverhorn at Morgan’s Vigil calls attention to the black dragonkin in the steppes. His report goes to Lakeshire, where Magistrate Solomon turns to Stormwind for help.', '摩根的岗哨里，赫林迪斯·河角发出关于燃烧平原黑龙人的警讯。报告送到湖畔镇，所罗门镇长随即向暴风城求援。'), [4182, 4183], { figureIds: ['solomon', 'helendis'], zoneIds: [1428, 1433, 1453], sourceIds: ['bs-menace', 'bs-true'] });
  B('bs-windsor', L('The marshal’s lost evidence', '元帅丢失的证据'), L('Windsor is found inside Blackrock Depths. A crumpled note renews his resolve and points toward information taken by Dark Iron officers. Recovering his evidence gives him reason to leave the prison and take the case back to the capital.', '人们在黑石深渊找到温德索尔。一张弄皱的便笺让他重拾斗志，也指出黑铁军官夺走的情报下落。找回证据后，他决意出狱，把这件事带回都城。'), [4241, 4264, 4282, 4322], { figureIds: ['windsor'], zoneIds: [1428, 1453, 1445], sourceIds: ['bs-marshal', 'bs-note', 'bs-jail'] });
  B('bs-spire', L('Blackrock Spire and its masters', '黑石塔与它的主人'), L('The orcs in Blackrock Spire look to Rend Blackhand as their warchief. Farther inside the mountain, the black dragon Nefarian rules from Blackwing Lair. His experiments with the blood of different dragonflights drive a conflict beyond the armies massed outside.', '黑石塔的兽人奉雷德·黑手为大酋长。山中更深处，黑龙奈法利安坐镇黑翼之巢。他用不同龙族的血进行试验，山里的冲突早已超出平原上的战事。'), [6569, 7761], { figureIds: ['nefarian'], zoneIds: [1428], sourceIds: ['bs-rend', 'bs-orders', 'bs-lair'] });
  B('dw-portal', L('Spoiler · The Guardian’s bargain', '剧透 · 守护者的交易'), L('Sargeras’s influence reaches Azeroth through Medivh. The Guardian works with Gul’dan to open the Dark Portal, and Khadgar and Lothar take a stand against him. The tower above the pass survives the death of its master.', '萨格拉斯借麦迪文之手影响艾泽拉斯。守护者与古尔丹合作开启黑暗之门，卡德加与洛萨则奋起阻止他。主人死去后，高塔依旧矗立在小径上方。'), [], { figureIds: ['medivh', 'lothar'], zoneIds: [1430, 1419, 1453], sourceIds: ['dw-guardian', 'portal-history'] });
  B('dw-staff', L('A staff returns to the pass', '法杖重回小径'), L('Atiesh, Medivh’s staff, is broken and scattered. In Classic its recovery leads to Anachronos and to a cleansing in Stratholme. The restored staff can once again open a way to the old tower.', '麦迪文的法杖埃提耶什断裂散失。经典旧世时期，修复它的过程牵涉到阿纳克洛斯与斯坦索姆的一场净化。修复后的法杖又能开启通往旧塔的道路。'), [9250, 9251], { figureIds: ['medivh'], zoneIds: [1430, 1423, 1446], sourceIds: ['dw-staff', 'dw-cleansing'] });
  B('sv-pirates', L('Plans against Booty Bay', '针对藏宝海湾的计划'), L('First Mate Crazz receives word of the Bloodsail Buccaneers gathered near Booty Bay. The papers recovered from their camps show a fleet organized for an attack on the port.', '大副克拉兹接到消息，血帆海盗已在藏宝海湾附近集结。从营地缴获的文件显示，一支舰队正准备袭击港口。'), [595, 597], { figureIds: [], zoneIds: [1434], sourceIds: ['sv-pirates'] });
  B('sv-heart', L('Spoiler · The heart of the Soulflayer', '剧透 · 夺灵者的心'), L('Hakkar falls in Zul’Gurub. Molthor on Yojamba Isle recognizes the heart brought from the city as proof that the Soulflayer has been slain. For the Zandalar who made camp at sea, the danger they crossed it to fight has finally ended.', '哈卡在祖尔格拉布倒下。尤亚姆巴岛上的莫托尔认出从城里带回的心脏，确认夺灵者已经被杀。赞达拉人渡海来此对抗的威胁，终于在此刻告终。'), [8183], { figureIds: ['hakkar'], zoneIds: [1434, 1435], sourceIds: ['sv-heart'] });
  B('ss-discovery', L('The exiles’ sanctuary', '流亡者的圣所'), L('The Explorers’ League seeks the stone tablets kept inside the temple. The site is evidence that the Atal’ai built a lasting home for the worship that drove them from their own people.', '探险者协会要寻找保存在神庙里的石板。遗迹表明，阿塔莱为那种使他们遭族人驱逐的信仰，建起了一座长久的圣所。'), [1448, 1475], { figureIds: [], zoneIds: [1435], sourceIds: ['ss-temple'] });
  B('ss-avatar', L('Spoiler · Hakkar’s avatar takes form', '剧透 · 哈卡的化身现形'), L('Yeh’kinya’s investigation culminates beneath the temple. The flames that hold Hakkar’s spirit are put out, allowing his avatar to take shape. It is defeated there, and its essence is carried away in the ancient egg.', '叶基亚的调查在神庙地下迎来结局。禁锢哈卡灵体的火焰熄灭，化身随即现形。化身被击败，精华则装进古老的卵中带走。'), [3528], { figureIds: ['hakkar'], zoneIds: [1435, 1446, 1425], sourceIds: ['ss-avatar'] });
  B('uc-free', L('The claim of the free undead', '自由亡灵夺取王城'), L('While control over some of the undead weakens, Sylvanas gathers the newly free. She defeats rival dreadlords and claims Lordaeron. Varimathras serves in her new government, which takes shape under the old throne room.', '当天灾军团对部分亡灵的控制减弱，希尔瓦娜斯召集重获自由的人。她击败争夺地盘的恐惧魔王，夺取洛丹伦。瓦里玛萨斯在她的新政权中效力，而这个政权就在旧王座厅下扎下了根。'), [], { figureIds: ['sylvanas', 'varimathras'], zoneIds: [1458, 1420], sourceIds: ['manual', 'uc-classic'] });
  B('uc-hillsbrad', L('A field report comes home', '前线送回的报告'), L('After the fighting near Tarren Mill, Darthalia sends a report to Varimathras. The officer who ordered raids on the farming community answers to the capital beneath Lordaeron.', '塔伦米尔附近的战事过后，达萨利亚把报告送给瓦里玛萨斯。那名下令突袭农庄的军官，听命于洛丹伦地下的新都。'), [550], { figureIds: ['varimathras', 'darthalia'], zoneIds: [1458, 1424], sourceIds: ['uc-report'] });
  B('uc-allies', L('An agreement on the bluff', '高崖上的协议'), L('Magatha Grimtotem takes an interest in what Forsaken apothecaries can do. She sends an envoy to Apothecary Zamah at the Pools of Vision. Word can travel from there to the apothecaries in the Eastern Kingdoms.', '玛加萨·恐怖图腾对被遗忘者药剂师的本领感兴趣。她派信使到预见之池会见药剂师扎玛，消息可以从那里传给东部王国的药剂师。'), [1064, 1065], { figureIds: ['magatha'], zoneIds: [1458, 1456], sourceIds: ['uc-allies'] });
  B('dt-isles', L('The islands across the water', '隔海相望的群岛'), L('Master Gadrin describes how the witch doctor Zalazane took control of other Darkspear on the Echo Isles. The village on the mainland lives within sight of land it cannot safely return to.', '加德林大师讲述巫医扎拉赞如何在回音群岛控制了其他暗矛巨魔。大陆村庄望得见旧居，族人却无法平安回去。'), [826], { figureIds: ['gadrin'], zoneIds: [1411], sourceIds: ['dt-isles'] });
  B('dt-tiragarde', L('The troops still in the keep', '仍驻扎在城堡里的士兵'), L('At Razor Hill, Gar’Thok warns that Lieutenant Benedict still commands men at Tiragarde. For those keeping the road open, there is unfinished business along the coast after the war that gave the Horde its new home.', '剃刀岭的加索克警告说，本尼迪克上尉仍在提拉加德指挥士兵。部落已经在战后有了新家，但对守路的人来说，海岸上的争端远未结束。'), [784], { figureIds: [], zoneIds: [1411, 1445], sourceIds: ['dt-tiragarde'] });
  B('dt-burning', L('A name from an old clan', '沿用旧氏族的名字'), L('Margoz traces Burning Blade activity to Skull Rock, where the cult has established a foothold. Its insignia help carry the alarm from Durotar’s settlements to the Horde capital.', '玛高兹查到火刃势力在骷髅石建立了据点。缴获的徽记帮助人们把警讯从杜隆塔尔的聚落送往部落都城。'), [827, 829], { figureIds: [], zoneIds: [1411, 1454], sourceIds: ['dt-skull'] });
  B('mg-rites', L('The hunt and the Earthmother', '狩猎与大地母亲'), L('The Rites of the Earthmother ask young tauren to show that they can hunt and see to the needs of their people. At Camp Narache the ability to bring food home is a duty as much as a sign of skill.', '大地母亲仪祭考验年轻牛头人是否会狩猎，能否照应族人的需要。在纳拉其营地，把食物带回家既是本领，也是一份责任。'), [747, 752, 755, 757], { figureIds: [], zoneIds: [1412], sourceIds: ['mg-rites', 'mg-hunt'] });
  B('mg-machines', L('A mine in the hills', '丘陵里的矿洞'), L('Morin Cloudstalker sees the Venture Company exploiting Mulgore. He calls for its workers and supervisors to be driven out. From the mine to the grassland, the dispute is over who gets to decide what happens to the land.', '摩林·云行者看见风险投资公司在莫高雷开掘矿藏，要求赶走工人和监工。从矿洞到草原，争的都是谁有权决定怎样对待这片土地。'), [764], { figureIds: [], zoneIds: [1412], sourceIds: ['mg-venture'] });
  B('br-oases', L('What grows beside the pools', '水池边长出的东西'), L('Tonga Runetotem follows reports of changes in the oases. Whatever power is renewing life around the water also alters creatures there. The investigation gives context to the druids’ more dangerous work beneath the surface.', '图加·符文图腾追查绿洲发生变化的消息。使水边重现生机的力量，也改变了那里的生物。德鲁伊在地下进行的工作，还有着更大的危险。'), [870, 877, 880], { figureIds: ['tonga'], zoneIds: [1413], sourceIds: ['br-oases'] });
  B('br-nightmare', L('The disciple wakes his teacher', '弟子唤醒老师'), L('Naralex enters the Emerald Dream hoping to restore the Barrens. The dream turns into a nightmare and his followers are changed. A loyal disciple still undertakes a waking ritual deep in the caverns, and a dream creature left behind brings news of what happened to Thunder Bluff.', '纳拉雷克斯进入翡翠梦境，想让贫瘠之地重现生机。美梦却化为噩梦，弟子也发生异变。一名忠心的弟子仍深入洞穴举行唤醒仪式，遗留下来的梦境生物让雷霆崖得知了事情的经过。'), [1489, 6981, 3369], { figureIds: ['naralex', 'hamuul'], zoneIds: [1413, 1456], sourceIds: ['br-naralex', 'br-nightmare'] });
  B('br-pirates', L('The Southsea threat', '南海海盗的威胁'), L('Gazlowe has trouble with the Southsea pirates who prey on Ratchet’s shipping. Fighting along the merchant coast is part of keeping goods moving on the roads inland as well.', '加兹鲁维为劫掠棘齿城航船的南海海盗所困。商港在沿海的战斗，也是为了让货物能继续沿陆路运往内地。'), [887], { figureIds: ['gazlowe'], zoneIds: [1413, 1434], sourceIds: ['br-pirates'] });
  B('te-moss', L('A closer look at the timberlings', '查看林精的异状'), L('Denalan studies the timberlings near Lake Al’Ameth. To find out what is changing them, he examines their seeds and the moss on them. The creatures around the lake give him something he can study directly.', '德纳兰研究奥拉密斯湖附近的林精。他检查种子与林精身上的苔藓，想弄清是什么让它们发生变化。湖边的生灵为他提供了可以直接查验的线索。'), [918, 919], { figureIds: ['denalan'], zoneIds: [1438], sourceIds: ['te-moss'] });
  B('te-oracle', L('Water from the moonwells', '来自月亮井的水'), L('Corithras Moonrage sends a vessel to the moonwell at the Oracle Glade. The water gathered from the wells goes to Fandral in Darnassus, where the druids are watching the young World Tree for signs of trouble.', '科瑞萨斯·月怒派人带着容器到神谕林地的月亮井取水。各处井水最终送到达纳苏斯的范达尔手中，当地德鲁伊一直在留意年轻的世界之树是否出现异状。'), [934, 935], { figureIds: ['fandral'], zoneIds: [1438, 1457], sourceIds: ['te-oracle', 'te-crown'] });
  B('tn-centaur', L('Pressure below Freewind', '乱风岗下的威胁'), L('Cliffwatcher Longhorn sees the centaur of the canyon as a danger to the post. Reports of fighting on the floor explain why the tauren keep a lookout so high above it.', '峭壁卫兵图林·长角视谷中的半人马为据点的威胁。谷底的战报说明了牛头人为何在那么高的地方设岗。'), [4841], { figureIds: [], zoneIds: [1441], sourceIds: ['tn-centaur'] });
  B('tn-faith', L('A leap above the canyon', '峡谷上方的一跃'), L('Dorn Plainstalker guides a test of faith at a ledge high above the canyon. The same cliffs that serve as defensible ground for the tauren can be a place for testing trust.', '多恩·平原行者在峡谷高处的一道崖台上主持信仰的试炼。牛头人借这些峭壁防守，也在这里考验信念。'), [1149], { figureIds: ['dorn'], zoneIds: [1441], sourceIds: ['tn-faith'] });
  B('tn-race', L('A shell becomes a racing part', '龟壳变成赛车零件'), L('Wizzle Brassbolts needs the shells of the salt-flat tortoises for work on a racing vehicle. The teams make the desert part of their workshops as well as the ground on which they compete.', '维兹尔·铜栓需要盐滩乌龟的壳来制造赛车。对这些车队来说，沙漠既是比赛场地，也是工坊材料的来源。'), [1105], { figureIds: [], zoneIds: [1441], sourceIds: ['tn-shells'] });
  B('de-allies', L('Two rival offers', '来自敌对双方的提议'), L('The Gelkis and Magram judge outsiders by what they do to the other clan. An offer of friendship from either side can make an enemy of the other, and the old feud draws more people into the fighting.', '吉尔吉斯与玛格拉姆都凭外人如何对待敌对部族来衡量他们。接受一方的友谊，就可能与另一方结仇，旧日部族纷争由此把更多人拉进战事。'), [1367, 1368], { figureIds: [], zoneIds: [1443], sourceIds: ['de-magram', 'de-gelkis'] });
  B('de-scepter', L('A keeper’s broken scepter', '守护者破碎的节杖'), L('Cavindra remembers how Celebras entered Maraudon seeking his uncle Zaetar. After corruption takes hold of the keeper, its remnants include a broken scepter through which his work can be carried on.', '凯雯德拉记得塞雷布拉斯如何走进玛拉顿，寻找叔父扎尔塔。守护者遭到腐化后，留下破碎的节杖，他原先未完的事仍可借它继续。'), [7044, 7046], { figureIds: [], zoneIds: [1443], sourceIds: ['de-scepter'] });
  B('de-seed', L('Spoiler · A seed for Moonglade', '剧透 · 送往月光林地的种子'), L('With Theradras defeated, Zaetar’s spirit entrusts a seed to be taken to Remulos. The family tragedy beneath Desolace ends with a request for new growth in a place tended by the keepers.', '瑟莱德丝败亡后，扎尔塔的灵魂托人把一枚种子送给雷姆洛斯。凄凉之地下的家族悲剧，最终留下一个愿望：让种子在守护者照看的地方萌发。'), [7066], { figureIds: ['remulos'], zoneIds: [1443, 1450], sourceIds: ['de-seed'] });
  B('fe-naga', L('The ruins near the island fortress', '岛上要塞附近的遗迹'), L('Latronicus Moonspear sends an investigation to the ruins of Solarsal. Naga have emerged there close enough to Feathermoon to threaten the fortress. The report draws the Sentinels’ eyes out to the nearby islands.', '拉托尼库斯·月矛派人去调查索兰萨尔废墟。现身的纳迦离羽月要塞太近，已足以威胁要塞。哨兵因此开始留意附近的岛屿。'), [2866, 2867], { figureIds: ['latronicus'], zoneIds: [1444], sourceIds: ['fe-naga'] });
  B('fe-ogres', L('A king among the ogres', '食人魔的国王'), L('The Gordok succession depends on who can defeat their king. To the ogres, what happens in their part of Dire Maul is a matter of allegiance and rule in a home they have made their own.', '戈多克王位的继承取决于谁能击败现任国王。对食人魔来说，厄运之槌的一部分已经成了家园，那里发生的事关系到谁掌权、他们向谁效忠。'), [7703], { figureIds: [], zoneIds: [1444], sourceIds: ['fe-ogres'] });
  B('fe-prince', L('Spoiler · What sustained the prince', '剧透 · 维系王子力量的来源'), L('The Shen’dralar have long drawn on the power of the imprisoned demon Immol’thar. Killing the demon frees the way to Prince Tortheldrin, who has kept hold of that power in the old city.', '辛德拉长久以来从被囚的恶魔伊莫塔尔身上汲取力量。恶魔死后，通往托塞德林王子的路就此打开。长久以来，正是这位王子在古城把持着那股力量。'), [7462], { figureIds: [], zoneIds: [1444], sourceIds: ['fe-prince'] });
  B('dm-clues', L('Clues in the ashes', '灰烬里的线索'), L('A blackened shield and a lieutenant’s badge are found at the burned inn. Hoofprints lead from the ruins. The evidence gives investigators several trails to follow and leaves the full account unsettled.', '烧毁的旅店里找到了一面焦黑的盾和一枚军官徽记，一串蹄印通向废墟外。调查者有了几条可以追查的线索，事情的全貌仍是个谜。'), [1252, 1268, 1284], { figureIds: [], zoneIds: [1445], sourceIds: ['dm-inn', 'dm-hoofprints'] });
  B('dm-lair', L('Spoiler · Where the court’s secret leads', '剧透 · 宫廷秘密指向何方'), L('Windsor’s confrontation exposes Onyxia at Stormwind. The black dragon’s refuge in the Wyrmbog gives the conspiracy a home far from the court where it did its work.', '温德索尔在暴风城的对峙揭穿了奥妮克希亚。那头黑龙的巢穴藏在巨龙沼泽，离她施展阴谋的宫廷十分遥远。'), [6403, 6502], { figureIds: ['windsor', 'katrana'], zoneIds: [1445, 1428, 1453], sourceIds: ['court-reveal', 'dm-amulet'] });
  B('ta-pirates', L('The ships off Lost Rigger Cove', '落帆海湾外的船只'), L('Security Chief Bilgewhizzle wants Southsea pirates driven away from the port. Their presence makes it hard to keep the sea lanes quiet while the cartel grows inland.', '安全主管比索希望赶走港口附近的南海海盗。财团的生意向内陆扩展时，这批海盗让海上航路难以太平。'), [8366], { figureIds: [], zoneIds: [1446], sourceIds: ['ta-pirates'] });
  B('ta-zulfarrak', L('The shells in the old city', '古城里的甲虫壳'), L('Tran’rek is interested in the unusually tough shells of the scarabs that live inside Zul’Farrak. The city that the Sandfury hold in the dunes still supplies things the townspeople of Gadgetzan cannot find at their own market.', '特兰雷克对祖尔法拉克里异常坚硬的甲虫壳感兴趣。沙怒在沙丘间据守的城市，仍有些连加基森市集也买不到的东西。'), [2865], { figureIds: [], zoneIds: [1446], sourceIds: ['ta-scarab'] });
  B('ta-spirits', L('A scholar asks for old words', '一名学者问起旧日之言'), L('Yeh’kinya begins his inquiry by seeking the speech of ancient spirits in Feralas. It reaches Zul’Farrak and later the Hinterlands as he gathers what he needs to pursue the story of Hakkar.', '叶基亚先从菲拉斯寻找古老灵魂的话语着手。他追寻哈卡的往事，沿途来到祖尔法拉克，后来又查到了辛特兰。'), [3520, 3527, 4787], { figureIds: ['yehkinya'], zoneIds: [1446, 1444, 1425, 1435], sourceIds: ['ta-spirits', 'ta-egg'] });
  B('az-tablets', L('The tablets at Eldarath', '埃达拉斯的石板'), L('From Valormok, Jediga seeks inscriptions left in Eldarath. The tablets are important enough to draw attention much farther afield than the camps around the ruins.', '瓦罗莫克的杰迪加寻找埃达拉斯留下的铭文。这些石板引来的关注远远超出了遗迹周边的营地。'), [3517, 3561], { figureIds: [], zoneIds: [1447, 1454], sourceIds: ['az-tablets'] });
  B('az-water', L('Water against the Firelord', '水元素对抗炎魔之王'), L('Duke Hydraxis directs his allies against Ragnaros’s elementals. What begins with signs of elemental trouble elsewhere leads toward the core beneath Blackrock Mountain, far from his island in the bay.', '海达克西斯公爵让盟友对付拉格纳罗斯麾下的元素生物。线索从各地的元素异动开始，最终指向黑石山下的熔火之心，远离公爵在海湾里的岛屿。'), [6804, 6821, 6822, 6824], { figureIds: ['hydraxis', 'ragnaros'], zoneIds: [1447, 1427, 1428], sourceIds: ['az-water', 'az-core'] });
  B('fw-cleansing', L('A salve for damaged plants', '受损植物的药膏'), L('The druids use samples from Felwood to make a salve that can cleanse corrupted plants. The return of a flower or a root gives them a way to measure what can be recovered, even while demons still live nearby.', '德鲁伊用费伍德森林的样本制成药膏，净化受腐化的植物。恶魔仍在附近活动，但救回一株花或一条根，也让人知道森林还有多少生机可以挽回。'), [4101, 4102], { figureIds: [], zoneIds: [1448], sourceIds: ['fw-cleansing'] });
  B('fw-timbermaw', L('A furbolg asks for an ally', '熊怪寻找盟友'), L('At the edge of Felwood, Grazle asks for help against the Deadwood furbolgs. Taking his side gives strangers a way to build trust with the Timbermaw, whose tunnels are as much a home as a passage between forests.', '在费伍德森林边缘，格拉兹要求援手对抗死木熊怪。愿意相助的外人可以逐渐获得木喉熊怪的信任。那些隧道除了连接各处森林，也是木喉的家。'), [8460], { figureIds: ['grazle'], zoneIds: [1448, 1452, 1450], sourceIds: ['fw-timbermaw'] });
  B('ug-crystals', L('Loose crystals and standing pylons', '散落的水晶与矗立的塔'), L('J.D. Collie links crystals of different colors to the old pylons. Examining the standing structures shows that the loose crystals are part of a larger system, with uses that can be tested.', '科琳把不同颜色的水晶与古老的水晶塔联系起来。研究矗立的塔后发现，散落的水晶属于一套更大的装置，各种用途可以通过试验查明。'), [4284, 4285, 4287, 4288], { figureIds: ['collie'], zoneIds: [1449], sourceIds: ['ug-crystals', 'ug-pylon'] });
  B('ug-soil', L('An experiment carried to Darnassus', '带到达纳苏斯的实验'), L('Fandral Staghelm’s druids cultivate Tharlendris seeds in soil from the crater. One of the resulting plants is morrowgrain, which the archdruid wants to understand.', '范达尔·鹿盔手下的德鲁伊用环形山的泥土培育萨伦迪斯种子。其中长出了一种叫晨光麦的植物，大德鲁伊想弄清它的特性。'), [3781, 3785], { figureIds: ['fandral'], zoneIds: [1449, 1457], sourceIds: ['da-grain'] });
  B('mo-remulos', L('A keeper receives a seed', '守护者收到种子'), L('A seed sent from Maraudon reaches Keeper Remulos in the sanctuary. The delivery brings the story of Zaetar and his family into the keeping of those who still tend the trees and lakes of Moonglade.', '守护者雷姆洛斯在圣地收到一枚从玛拉顿送来的种子。扎尔塔一家的故事，就这样由仍照管月光林地林木与湖泊的人接了过去。'), [7066], { figureIds: ['remulos'], zoneIds: [1450, 1443], sourceIds: ['de-seed'] });
  B('mo-eranikus', L('Spoiler · A dragon’s redemption', '剧透 · 一头巨龙的救赎'), L('Remulos calls Eranikus out of the Emerald Dream in an effort to free him from corruption. The crisis threatens the sanctuary until Tyrande comes to aid the stricken dragon.', '雷姆洛斯将伊兰尼库斯从翡翠梦境召出，试图让他摆脱腐化。危机一度威胁圣地，直到泰兰德前来救助这头陷入困境的巨龙。'), [8733, 8735, 8736], { figureIds: ['remulos', 'tyrande'], zoneIds: [1450, 1451], sourceIds: ['mo-tyrant', 'mo-redemption'] });
  B('si-memory', L('Anachronos remembers the wall', '阿纳克洛斯重忆城墙往事'), L('A vision preserves the moment the Scarab Wall went up. The loss of Fandral’s son and the breaking of the scepter leave a burden for those who will one day need to open the gate again.', '一幕幻象保留了甲虫之墙升起的时刻。范达尔痛失儿子，权杖也被摔碎，终有一天要再开城门的人必须收拾这段往事留下的残局。'), [8519], { figureIds: ['anachronos', 'fandral'], zoneIds: [1451, 1446], sourceIds: ['si-memory'] });
  B('si-hives', L('Guarding the supply lines', '守卫补给线'), L('Windcaller Proudhorn warns that silithid have begun to threaten supplies heading to Cenarion Hold. The druids have an enemy to contain outside the wall before they can face what it was raised to hold in.', '唤风者傲角警告说，异种虫已开始威胁运往塞纳里奥要塞的补给。要面对墙内囚禁的势力，德鲁伊先得在墙外遏制敌人。'), [8280], { figureIds: [], zoneIds: [1451], sourceIds: ['si-hives'] });
  B('si-gong', L('The gong at the wall', '城墙边的铜锣'), L('With the Scepter of the Shifting Sands restored and supplies gathered, its bearer can ring the Scarab Gong. Opening the wall gives the assembled armies a way into the city that the first war had left sealed.', '流沙节杖修复、军需筹齐后，持杖者可以敲响甲虫之锣。城门开启，集结的军队得以进入第一场战争后就被封闭起来的古城。'), [8743], { figureIds: ['anachronos'], zoneIds: [1451, 1446, 1450], sourceIds: ['si-gong', 'si-war-effort'] });
  B('wi-winterfall', L('A warning near the east road', '东路附近的警告'), L('Salfa and Donova Snowden have reason to worry about the Winterfall. Where the Timbermaw offer a chance for cooperation, the Winterfall’s activity near the road has put their neighbors on guard.', '萨尔法和多诺瓦·雪山都有理由担心冬泉熊怪。木喉熊怪还愿意谈合作，冬泉熊怪在路边的活动却让邻居提高了警惕。'), [8464, 5082], { figureIds: ['donova'], zoneIds: [1452], sourceIds: ['wi-winterfall', 'wi-threat'] });
  B('wi-firewater', L('A drink and its source', '酒水的来历'), L('A flask of Winterfall firewater brings the investigation to Donova. She follows the supply back toward the Deadwood in Felwood, where the trouble among the furbolgs has another foothold.', '一瓶冬泉火酒把调查引向多诺瓦。她沿着来源一路查到费伍德森林的死木熊怪，那里也是熊怪异变的一个源头。'), [5083, 5084], { figureIds: ['donova'], zoneIds: [1452, 1448], sourceIds: ['wi-firewater', 'wi-corruption'] });
  B('wi-finkle', L('The hide from the Beast', '比斯巨兽的皮'), L('Finkle survives the Beast in Blackrock Spire. News of the creature’s hide reaches Malyfous Darkhammer in Everlook, where the material becomes the basis for work that few craftspeople could attempt.', '芬克从黑石塔的比斯巨兽身边活了下来。巨兽兽皮的消息传到永望镇的玛雷弗斯·暗锤手里，这块材料成了一项没几个匠人能做的活计。'), [5047, 5050], { figureIds: ['finkle'], zoneIds: [1452, 1428], sourceIds: ['wi-finkle'] });
  B('or-hidden', L('The investigation under Orgrimmar', '奥格瑞玛地下的调查'), L('Thrall has Burning Blade insignia brought to him as evidence. He lets one of his agents approach Neeru Fireblade, then acts on intelligence about two Searing Blade leaders in Ragefire Chasm. The warchief gains a victory beneath his own city without letting the informant’s cover go to waste.', '萨尔拿到火刃徽记作为证据。他派人接近尼尔鲁·火刃，继而根据情报打击怒焰裂谷里的两名灼刃首领。大酋长就在城下取得了一场胜利，线人的身份仍得以保密。'), [5726, 5727, 5728, 5729], { figureIds: ['thrall', 'neeru'], zoneIds: [1454], sourceIds: ['or-hidden', 'or-leaders'] });
  B('or-tale', L('Thrall tells how the Horde changed', '萨尔讲述部落的变化'), L('Thrall’s account of the Horde explains how the orcs came to Kalimdor. A claim to the title of warchief still survives inside Blackrock Spire. The city’s name remembers an older leader, and its own warchief now has to answer for what that inheritance means.', '萨尔讲述部落如何来到卡利姆多。黑石塔中仍有人自称大酋长。城名纪念着昔日的领袖，如今这座城市的大酋长却得回应那份传承究竟意味着什么。'), [6566, 6567, 6569], { figureIds: ['thrall'], zoneIds: [1454, 1428], sourceIds: ['or-tale', 'bs-rend'] });
  B('tb-forsaken', L('From the bluff to Lordaeron', '从雷霆崖到洛丹伦'), L('Magatha sends word to Apothecary Zamah at the Pools of Vision. The apothecary, in turn, has business with Tarren Mill. A discussion in the tauren capital thus leads into the fighting and experiments in the hills across the sea.', '玛加萨向预见之池的药剂师扎玛传话。扎玛又和塔伦米尔有往来。牛头人都城里的一番商谈，就这样牵涉到海对岸丘陵里的战斗与实验。'), [1064, 1065], { figureIds: ['magatha', 'zamah'], zoneIds: [1456, 1458, 1424], sourceIds: ['uc-allies', 'tb-tarren'] });
  B('da-grain', L('Seeds from the enclave', '塞纳里奥区的种子'), L('Fandral wants to know more about morrowgrain, one of the plants grown from Tharlendris seeds in soil brought from Un’Goro. Mathrengyl Bearwalker handles the seeds. The enclave’s interest in cultivation extends from its own tree to a closed basin far to the south.', '范达尔想进一步了解晨光麦。它是用安戈洛泥土培育萨伦迪斯种子时长出的植物之一。玛斯雷·驭熊者负责分发种子。塞纳里奥区对栽培的兴趣从自己的大树一直延伸到南方遥远的盆地。'), [3781, 3785], { figureIds: ['fandral'], zoneIds: [1457, 1449], sourceIds: ['da-grain'] });
  B('da-messenger', L('A message for Tyrande', '送给泰兰德的消息'), L('In Ashenvale, Sentinel Thenysil sends a visitor to the Temple of the Moon. Tyrande receives news from the forest in the same halls where Elune’s priestesses gather.', '灰谷的哨兵塞恩希尔把一名来客引荐到月神殿。泰兰德在艾露恩的女祭司们聚集的大厅里接到森林传来的消息。'), [1081], { figureIds: ['tyrande'], zoneIds: [1457, 1440], sourceIds: ['da-temple', 'manual'] });

  B('hy-azgalor', L('Remains of the battle', '战斗的遗迹'), L('Azgalor died alongside the Legion’s forces at Hyjal. His ashes still lie in the ruins of Dae’gun. Ketharas needs only a pinch to supply a steady source of energy for a difficult spell.', '阿兹加洛与燃烧军团的兵将一同战死在海加尔山。他的灰烬仍留在达尔苟废墟。凯萨拉斯只需一小撮，就能为一道复杂的法术提供稳定的力量。'), [92335], { edition: L('Forever addition', '无限服新增'), figureIds: ['azgalor', 'ketharas'], zoneIds: [2482], sourceIds: ['hy-ashes'] });
  B('rg-elbrim', L('A family’s keepsakes', '一家人的遗物'), L('A farmer remembers hiding his family and others in the barn when the Twilight’s Hammer attacked. Afterward, he asks for the keepsakes he cannot bring himself to retrieve. The search turns up a discarded doll and a damaged locket.', '暮光之锤来袭时，一位农夫把家人和其他人藏进谷仓。事后，他请人取回自己不忍去找的遗物。谷仓里留下了被丢弃的玩偶和损坏的坠饰。'), [94829, 94858], { edition: L('Forever addition', '无限服新增'), factionIds: ['twilight'], zoneIds: [2548], sourceIds: ['rg-farm'] });
  B('sd-restore-pylons', L('The fading crystals', '逐渐黯淡的水晶'), L('Mana elementals guard a fractured crystal among the elven ruins. Other pylons survive, including one still bright inside the temple. Once the failing crystals are restored, Magister Kirandis explains that their power anchors the temple’s inhabitants to Shen’dralas.', '精灵废墟中的一块水晶已经碎裂，法力元素仍在守护它。其他水晶塔也保留了下来，其中一座在神殿里依然明亮。衰弱的水晶恢复力量之后，魔导师基兰迪斯解释，正是这股力量让神殿里的居民得以留在辛德拉。'), [92914, 96018, 93394], { edition: L('Forever addition', '无限服新增'), figureIds: ['kirandis'], zoneIds: [2652], sourceIds: ['sd-pylons', 'sd-magister'] });

  const figures = {};
  function F(id, name, role, text, zoneIds, glossaryId = null) { figures[id] = { id, name, role, text, zoneIds, glossaryId }; }
  F('azgalor', L('Azgalor', '阿兹加洛'), L('Archimonde’s lieutenant', '阿克蒙德的副将'), L('The Legion commander was slain at Hyjal. His ashes remain in the ruins of Dae’gun.', '这名燃烧军团的指挥官在海加尔山战死，灰烬仍留在达尔苟废墟。'), [2482]);
  F('ketharas', L('Ketharas', '凯萨拉斯'), L('Spellcaster at Hyjal', '海加尔山的施法者'), L('He needs a steady source of magical energy and sends word for a sample of Azgalor’s ashes.', '他需要稳定的魔力来源，为此托人寻找阿兹加洛的灰烬。'), [2482]);
  F('kirandis', L('Magister Kirandis', '魔导师基兰迪斯'), L('Magister of the temple', '神殿的魔导师'), L('He explains how the restored crystal pylons anchor the temple’s inhabitants to Shen’dralas.', '他解释了修复后的水晶塔如何让神殿的居民留在辛德拉。'), [2652]);
  F('magni', L('Magni Bronzebeard', '麦格尼·铜须'), L('King of Ironforge', '铁炉堡国王'), L('Ironforge’s Bronzebeard king in the Classic-era setting. He receives reports from the mountain defenses and the Hall of Thanes.', '经典旧世时期统治铁炉堡的铜须国王。山中守军的情报和领主大厅的消息都汇报给他。'), [1455, 1426], 'magni');
  F('mekkatorque', L('Gelbin Mekkatorque', '格尔宾·梅卡托克'), L('High Tinker', '大工匠'), L('Leader of the gnomes in exile. His people shelter in Ironforge while Gnomeregan remains occupied.', '流亡侏儒的领袖。诺莫瑞根仍被占据，他的族人在铁炉堡避难。'), [1455, 1426], 'gnomeregan');
  F('thermaplugg', L('Sicco Thermaplugg', '思科·瑟玛普拉格'), L('Usurper of Gnomeregan', '篡夺诺莫瑞根之人'), L('Mekkatorque’s treacherous former adviser, left ruling the irradiated gnome capital.', '梅卡托克从前的顾问。他背叛了梅卡托克，留在受辐射污染的侏儒都城掌权。'), [1426], 'gnomeregan');
  F('senir', L('Senir Whitebeard', '森内尔·白须'), L('The watch at Kharanos', '卡拉诺斯的巡山人'), L('Gathers intelligence about the threats around the mountain settlements and sends his report to Ironforge.', '汇集山中聚落周边的威胁情报，将报告送到铁炉堡。'), [1426], 'mountaineers');
  F('farsen', L('Earthseer Farsen', '大地先知法森'), L('Wildhammer visitor · Forever', '蛮锤访客 · 无限服'), L('His far sight and the spies’ map reveal the threat beneath Ironforge. His warning connects Dun Morogh to the Hall of Thanes.', '他用远视发现敌情，密探的地图则进一步揭示了铁炉堡地下的威胁。他的警告把丹莫罗的调查引向领主大厅。'), [1426, 1455], 'wildhammer');
  F('durgen', L('Durgen Dirgehammer', '杜根·挽锤'), L('Dark Iron commander · Forever', '黑铁指挥官 · 无限服'), L('Commands the raiders in the Hall of Thanes. His defeat ends the incursion’s immediate leadership.', '统领领主大厅里的袭击者。他的落败使这次入侵失去了指挥官。'), [1455], 'dark-iron');
  F('modimus', L('Modimus Anvilmar', '莫迪姆斯·安威玛尔'), L('High King before the civil war', '内战前的至高王'), L('His death leaves the three clans competing for control of Ironforge.', '他死后，三个氏族争夺铁炉堡的统治权。'), [1455, 1426]);
  F('madoran', L('Madoran Bronzebeard', '玛多兰·铜须'), L('Bronzebeard leader in the war', '战争中的铜须领袖'), L('Wins the struggle for Ironforge and later fights alongside the Wildhammers against Thaurissan.', '在争夺铁炉堡的战斗中获胜，后来与蛮锤并肩对抗索瑞森。'), [1455]);
  F('khardros', L('Khardros Wildhammer', '卡德罗斯·蛮锤'), L('Wildhammer leader in the war', '战争中的蛮锤领袖'), L('Leads the clan that settles Grim Batol after losing the struggle for Ironforge.', '争夺铁炉堡失败后，率领族人定居格瑞姆巴托。'), [1437], 'wildhammer');
  F('thaurissan', L('Sorcerer-Thane Thaurissan', '巫王索瑞森'), L('Dark Iron ruler in the war', '战争中的黑铁统治者'), L('Launches the second conflict and dies in the catastrophe caused by summoning Ragnaros.', '发动第二轮战争，死于召唤拉格纳罗斯所引发的灾难。'), [1427, 1428], 'dark-iron');
  F('modgud', L('Modgud', '莫德古德'), L('Dark Iron sorceress', '黑铁女巫'), L('Thaurissan’s wife, who leads the assault on Grim Batol and dies there.', '索瑞森的妻子，率军攻打格瑞姆巴托，战死于当地。'), [1437], 'dark-iron');
  F('ragnaros', L('Ragnaros', '拉格纳罗斯'), L('The Firelord', '炎魔之王'), L('Elemental lord whose summoning destroys Thaurissan’s city and subjugates the surviving Dark Irons.', '被召唤而来的元素领主。索瑞森城因此毁灭，幸存的黑铁矮人也被他奴役。'), [1427, 1428], 'ragnaros');
  F('dagran', L('Emperor Dagran Thaurissan', '达格兰·索瑞森大帝'), L('Classic-era Dark Iron ruler', '经典旧世时期的黑铁统治者'), L('Rules Shadowforge City generations after the sorcerer of the same name. Ragnaros remains the greater power beneath Blackrock Mountain.', '在同姓的巫王死后数代统治暗炉城。黑石山地下，拉格纳罗斯仍是更强大的势力。'), [1427, 1428], 'dark-iron');
  F('vancleef', L('Edwin VanCleef', '艾德温·范克里夫'), L('Founder of the Defias', '迪菲亚兄弟会创始人'), L('The stonemason who turns a payment dispute into an armed campaign against Stormwind.', '这名石工把一场工钱纠纷发展成对暴风城的武装斗争。'), [1436, 1453], 'defias-brotherhood');
  F('baros', L('Baros Alexston', '巴隆斯·阿历克斯顿'), L('Stormwind’s city architect', '暴风城建筑师'), L('A former stonemason and important witness to the history behind VanCleef’s rebellion.', '曾是石工，也是范克里夫起事之前那段历史的重要见证人。'), [1453]);
  F('katrana', L('Lady Katrana Prestor', '卡特拉娜·普瑞斯托女士'), L('Royal adviser', '王室顾问'), L('Advises the court during Varian’s absence and receives Baros Alexston’s report on the Defias investigation.', '瓦里安不在时协助宫廷处理政务，接收了巴隆斯·阿历克斯顿对迪菲亚一案的报告。'), [1453]);
  F('gryan', L('Gryan Stoutmantle', '格里安·斯托曼'), L('Leader of the People’s Militia', '人民军领袖'), L('A paladin and veteran organizing Westfall’s defense from Sentinel Hill.', '圣骑士，也是老兵，在哨兵岭组织西部荒野的防御。'), [1436]);
  F('riell', L('Scout Riell', '哨兵瑞尔'), L('Militia scout', '人民军侦察员'), L('Her request for red silk bandanas carries the militia’s fight into the Defias stronghold.', '她要人搜集红色丝质面罩，把人民军的行动推进到迪菲亚据点内部。'), [1436]);
  F('salma', L('Salma Saldean', '萨尔玛·萨丁'), L('Westfall farmer', '西部荒野的农民'), L('Her cooking and farm work express the everyday needs behind the region’s military crisis.', '她做饭、务农的日常，让人看见地区军事危机背后普通人生活所需。'), [1436]);
  F('wiley', L('Wiley the Black', '黑衣威利'), L('Informant in Lakeshire', '湖畔镇的线人'), L('A contact who connects the investigation in Westfall to Stormwind’s stonemasons.', '将西部荒野的调查与暴风城石工联系起来。'), [1433]);
  F('bazil', L('Bazil Thredd', '巴基尔·斯瑞德'), L('Defias lieutenant', '迪菲亚副手'), L('A prisoner in the Stockade whose role carries the investigation into Stormwind.', '关在监狱里的囚犯。循着他的线索，调查深入暴风城。'), [1453]);
  F('lescovar', L('Lord Gregor Lescovar', '葛瑞格·莱斯科瓦公爵'), L('A compromised Stormwind noble', '牵涉阴谋的暴风城贵族'), L('His meeting with Marzon exposes the conspiracy pursued at the end of the Defias investigation.', '他与马尔松的会面，揭开了迪菲亚调查末尾追查的阴谋。'), [1453]);
  F('trias', L('Elling Trias', '埃林·提亚斯'), L('An old intelligence contact', '情报部门的老联系人'), L('Helps arrange the meeting that reveals Lescovar’s connection with the Defias.', '协助安排那场会面，揭露了莱斯科瓦与迪菲亚兄弟会的联系。'), [1453]);
  F('grayson', L('Captain Grayson', '葛瑞森船长'), L('Ghost of the lighthouse', '灯塔的幽灵'), L('Keeps watch over a dangerous coastline and asks that its beacon and defenses be maintained.', '守望险恶的海岸，请人维持灯塔运作和当地的防卫。'), [1436]);
  F('asterion', L('Asterion', '阿斯特利安'), L('Bound spirit of Bashal’Aran', '巴莎兰被束缚的亡魂'), L('A lingering spirit held by a magical seal. His release links Bashal’Aran and Ameth’Aran.', '被法术封印困住，迟迟无法离去。解开他的束缚一事把巴莎兰和亚米萨兰连在了一起。'), [1439], 'highborne');
  F('cerellean', L('Cerellean Whiteclaw', '塞瑞利恩·白爪'), L('A survivor in Auberdine', '奥伯丁的幸存者'), L('Still grieves for Anaya Dawnrunner, lost in the fall of Ameth’Aran.', '至今仍为安娜雅·晨路哀悼。她在亚米萨兰陷落时遇难。'), [1439]);
  F('anaya', L('Anaya Dawnrunner', '安娜雅·晨路'), L('Restless spirit of Ameth’Aran', '亚米萨兰不得安息的幽灵'), L('Her pendant and her release bring a personal conclusion to Cerellean’s long grief.', '她的灵魂获释，坠饰物归原主，终于给塞瑞利恩多年的悲痛画上了句号。'), [1439]);
  F('thundris', L('Thundris Windweaver', '桑迪斯·织风'), L('Auberdine’s forest guardian', '奥伯丁的森林守护者'), L('Investigates the Blackwood furbolgs and uses a cleansing ritual to confront their corruption.', '调查黑木熊怪，用净化仪式对抗侵蚀它们的腐化。'), [1439]);
  F('xabraxxis', L('Xabraxxis', '萨巴克希斯'), L('Demon behind the Blackwood’s corruption', '腐化黑木熊怪的恶魔'), L('Appears during the cleansing ritual carrying the Talisman of Corruption.', '带着堕落护符在净化仪式上现身。'), [1439]);
  F('tharnariun', L('Tharnariun Treetender', '萨纳瑞恩·绿树'), L('Healer of the forest', '森林的治疗者'), L('Studies the afflicted thistle bears and seeks a remedy.', '研究染病的蓟熊，寻找治疗方法。'), [1439]);
  F('terenthis', L('Terenthis', '特伦希斯'), L('Auberdine’s watcher', '奥伯丁的守望者'), L('Follows the dangers facing the forest and seeks news of the missing Volcor.', '追查森林面临的危险，打听失踪的沃科尔的消息。'), [1439]);
  F('volcor', L('Volcor', '沃科尔'), L('Grimclaw’s missing master', '锐爪失踪的主人'), L('Stranded after an encounter with hostile furbolgs, he needs a way back to safety.', '遭遇敌对熊怪后受困，需要设法返回安全地带。'), [1439]);
  F('onu', L('Onu', '安努'), L('Ancient of lore', '知识古树'), L('At the Grove of the Ancients, he connects the coast’s present threats with its deep memory.', '在古树之林，他将海岸当前的威胁与久远的记忆联系起来。'), [1439]);
  F('gerrig', L('Gerrig Bonegrip', '葛利·硬骨'), L('Scholar in Ironforge', '铁炉堡的学者'), L('Reads the recovered Twilight text as a lead toward the Lorgalis Manuscript in Blackfathom Deeps.', '在找回的暮光典籍中发现了线索，指向黑暗深渊中的洛迦里斯手稿。'), [1455, 1439, 1440]);
  F('arbal', L('Arbal', '阿尔巴尔'), L('Ancient of War · Forever', '战争古树 · 无限服'), L('At the Grove of the Ancients, he fears the naga in Mathystra will help the Twilight’s Hammer.', '他在古树之林担忧，玛塞斯特拉的纳迦可能会协助暮光之锤。'), [1439]);
  F('remtravel', L('Prospector Remtravel', '勘察员雷姆塔维尔'), L('Explorers’ League archaeologist', '探险者协会的考古人员'), L('His southern excavation sends reports beyond Darkshore to other centers of archaeological study.', '他在南部挖掘，并把报告送到黑海岸之外的考古研究中心。'), [1439, 1437], 'explorers-league');
  F('cobbleflint', L('Mountaineer Cobbleflint', '巡山人库伯弗林特'), L('Guard in the Valley of Kings', '国王谷的卫兵'), L('Holds the southern approach to Loch Modan against the Stonesplinter troggs.', '把守洛克莫丹南边的入口，抵挡碎石穴居人。'), [1432], 'mountaineers');
  F('rugelfuss', L('Captain Rugelfuss', '拉格弗斯上尉'), L('Defender of Loch Modan', '洛克莫丹的守卫者'), L('Calls for an attack on the Stonesplinters to protect the dwarven settlements.', '号召进攻碎石穴居人，以保卫矮人的聚落。'), [1432], 'mountaineers');
  F('ironband', L('Prospector Ironband', '勘察员基恩萨·铁环'), L('Excavation leader', '考古队负责人'), L('Directs the dig east of the loch and depends on supplies sent from Ironforge.', '指挥湖东的挖掘工作，物资靠铁炉堡供应。'), [1432], 'explorers-league');
  F('jern', L('Jern Hornhelm', '吉恩·角盔'), L('The dig’s contact in Thelsamar', '挖掘场在塞尔萨玛的联系人'), L('Raises the alarm over Ironband’s slow progress and brings the supply problem to Ironforge’s attention.', '铁环的挖掘工作进展缓慢，他为此发出警讯，把补给问题反映给铁炉堡。'), [1432], 'explorers-league');
  F('miran', L('Miran', '米兰'), L('Blastpowder courier', '运送爆破火药的信使'), L('Brings blastpowder to the excavation while Dark Iron attackers wait along his path.', '他把火药带往挖掘场，黑铁袭击者就在他要走的路上埋伏。'), [1432]);
  F('hinderweir', L('Chief Engineer Hinderweir VII', '主工程师辛德维尔七世'), L('Engineer at Stonewrought Dam', '巨石水坝的工程师'), L('Investigates the Dark Iron powder and prepares a way to disarm the charge at the dam.', '调查黑铁火药，想办法解除大坝上的爆炸威胁。'), [1432]);
  F('franclorn', L('Franclorn Forgewright', '弗兰克罗恩·铸铁'), L('Dwarven architect', '矮人建筑师'), L('The ancient master builder associated with the Stonewrought Dam.', '与巨石水坝有关的古代营造大师。'), [1432]);
  F('ashlan', L('Ashlan Stonesmirk', '阿胥兰·暗石'), L('Explosives expert at Dun Modr', '丹莫德的爆破专家'), L('Identifies the danger in the powder found at the Stonewrought Dam.', '鉴定巨石水坝上找到的火药，指出其危险。'), [1437, 1432]);
  F('magellas', L('High Explorer Magellas', '资深探险家麦格拉斯'), L('Head of the Explorers’ League', '探险者协会负责人'), L('Works from the Hall of Explorers, where the League collects findings from its expeditions.', '在探险者大厅办公，协会将考察收获也汇集于此。'), [1455], 'explorers-league');
  F('castpipe', L('Master Mechanic Castpipe', '大机械师卡斯派普'), L('Gnomeregan’s records keeper in exile', '诺莫瑞根流亡中的档案保管人'), L('Sends for information stored in the old capital’s punch-card machines.', '派人取回旧都打孔卡机器中存储的资料。'), [1455, 1426], 'gnomeregan');
  F('shoni', L('Shoni the Shilent', '沉默的舒尼'), L('Gnome engineer in Stormwind', '暴风城的侏儒工程师'), L('Needs a gnomish component installed in a Deadmines shredder and sends for machinery from Gnomeregan.', '需要一个装在死亡矿井伐木机里的侏儒零件，也派人去诺莫瑞根找机器。'), [1453, 1436, 1426], 'gnomeregan');
  F('mcbride', L('Marshal McBride', '治安官玛克布莱德'), L('Officer at Northshire Abbey', '北郡修道院的军官'), L('Oversees the response to the kobolds in the mine above Northshire.', '负责处置北郡高处矿洞的狗头人。'), [1429]);
  F('dughan', L('Marshal Dughan', '治安官杜汉'), L('Officer at Goldshire', '闪金镇的军官'), L('Tracks threats to the mines and recognizes the guild ring carried by the Collector.', '追查矿井面临的威胁，认出了收货人带着的行会戒指。'), [1429]);
  F('garrick', L('Garrick Padfoot', '加瑞克·帕德弗特'), L('Defias in Northshire', '北郡的迪菲亚成员'), L('Leads the thieves camped at the Northshire vineyards.', '带领盗贼在北郡农场的葡萄园扎营。'), [1429], 'defias-brotherhood');
  F('collector', L('Morgan the Collector', '收货人莫根'), L('Defias gold collector', '替迪菲亚收取黄金的人'), L('Takes gold from Elwynn’s mines and carries an old Stonemasons’ Guild ring.', '从艾尔文森林的矿井运走黄金，身上带着一枚原属石工协会的戒指。'), [1429], 'defias-brotherhood');
  F('guard-thomas', L('Guard Thomas', '卫兵托马斯'), L('Watch at the Eastvale bridge', '东谷桥的守卫'), L('Searches for two guards who disappeared while investigating the river.', '寻找在沿河调查时失踪的两名卫兵。'), [1429]);
  F('rolf', L('Rolf', '罗尔夫'), L('Missing Stormwind guard', '失踪的暴风城卫兵'), L('Sent to investigate the river. His remains are found in the murloc camp near Stone Cairn Lake.', '奉命调查河岸，遗体在石碑湖附近的鱼人营地被发现。'), [1429]);
  F('malakai', L('Malakai', '马拉凯'), L('Missing Stormwind guard', '失踪的暴风城卫兵'), L('Disappears with Rolf on the river patrol and is found dead beside the river.', '与罗尔夫一起巡河时失踪，后来被发现死在河边。'), [1429]);
  F('maybell', L('Maybell Maclure', '梅贝尔·马科伦'), L('Daughter of the Maclure farm', '马科伦农场的女儿'), L('Loves Tommy Joe Stonefield despite the feud between their families.', '两家素有宿怨，她仍爱着托米·乔·斯通菲尔德。'), [1429]);
  F('tommy-joe', L('Tommy Joe Stonefield', '托米·乔·斯通菲尔德'), L('Son of the Stonefield farm', '斯通菲尔德农场的儿子'), L('Seeks his grandmother’s help in finding a way to see Maybell.', '请祖母想办法帮他见梅贝尔一面。'), [1429]);
  F('gramma', L('Gramma Stonefield', '斯通菲尔德老奶奶'), L('Stonefield elder', '斯通菲尔德家的长辈'), L('Offers to help her grandson see Maybell despite the family feud.', '虽然两家有世仇，她依然愿意帮孙子与梅贝尔相见。'), [1429]);
  F('solomon', L('Magistrate Solomon', '所罗门镇长'), L('Magistrate of Lakeshire', '湖畔镇的镇长'), L('Appeals to Stormwind, Westfall and Darkshire for help defending the town.', '向暴风城、西部荒野和夜色镇求援，以保卫小镇。'), [1433]);
  F('parker', L('Guard Parker', '卫兵派克'), L('Watch at Three Corners', '三角路口的守卫'), L('Holds the road junction at the western approach to Lake Everstill.', '把守止水湖西边的道路交会处。'), [1433]);
  F('marcus', L('General Marcus Jonathan', '马库斯·乔纳森将军'), L('Stormwind Army officer', '暴风城军官'), L('Receives Solomon’s appeal and promises reinforcements once the king gives the order.', '接到所罗门的求援，答应国王下令后派遣援兵。'), [1453, 1433]);
  F('marris', L('Marshal Marris', '治安官马瑞斯'), L('Lakeshire’s marshal', '湖畔镇的治安官'), L('Leads the town’s response to the Blackrock orcs holding Stonewatch.', '领导镇民对抗占据石堡的黑石兽人。'), [1433]);
  F('gath-ilzogg', L('Gath’Ilzogg', '加塞尔佐格'), L('Blackrock warlord', '黑石督军'), L('Holds Stonewatch Keep above Lake Everstill.', '占据止水湖上方的石堡要塞。'), [1433]);
  F('tharilzun', L('Tharil’zun', '萨瑞尔祖恩'), L('Blackrock officer at Stonewatch', '石堡的黑石军官'), L('Helps command the force occupying Stonewatch.', '协助指挥占据石堡的军队。'), [1433]);
  F('fangore', L('Lieutenant Fangore', '范高雷中尉'), L('Shadowhide leader', '暗皮豺狼人首领'), L('Leads the gnolls who serve Morganth near the Tower of Ilgalar.', '带领伊尔加拉之塔附近听命于莫甘斯的豺狼人。'), [1433]);
  F('morganth', L('Morganth', '莫甘斯'), L('Mage in the Tower of Ilgalar', '伊尔加拉之塔的法师'), L('Commands the Shadowhide gnolls and draws the attention of the rival mage Theocritus.', '指挥暗皮豺狼人，引起对手塞欧克瑞图斯的注意。'), [1433, 1429]);
  F('theocritus', L('Theocritus', '塞欧克瑞图斯'), L('Mage at the Tower of Azora', '阿祖拉之塔的法师'), L('Investigates his rival Morganth from Elwynn Forest.', '在艾尔文森林调查自己的对手莫甘斯。'), [1429, 1433]);
  F('ello', L('Lord Ello Ebonlocke', '艾尔罗·埃伯洛克公爵'), L('Mayor of Darkshire', '夜色镇镇长'), L('Governs the town through the forest’s troubles and receives the Embalmer’s letter.', '带领小镇应对森林里的危机，也收到了藏尸者的来信。'), [1431]);
  F('althea', L('Commander Althea Ebonlocke', '指挥官阿尔泰娅·埃伯洛克'), L('Leader of the Night Watch', '守夜人首领'), L('Directs Darkshire’s defense against the undead in the local graveyards.', '指挥夜色镇抵御当地墓地里的亡灵。'), [1431]);
  F('velinde', L('Velinde Starsong', '维琳德·星歌'), L('Night elf priestess', '暗夜精灵女祭司'), L('Used the Scythe of Elune to call worgen against the demons of Ashenvale. Her trail leads to Roland’s Doom.', '曾用月神镰刀召来狼人，对抗灰谷的恶魔。她留下的线索通往罗兰之墓。'), [1440, 1431]);
  F('melyria', L('Sentinel Melyria Frostshadow', '哨兵梅丽瑞亚·霜影'), L('Watcher at the Shrine of Aessina', '艾森娜神殿的守望者'), L('Looks to the old writings in the Howling Vale for clues about the worgen.', '在狼嚎谷的旧文中寻找有关狼人的线索。'), [1440]);
  F('jitters', L('Jitters', '基特斯'), L('Witness in hiding', '藏身的目击者'), L('His journal describes the discovery of the scythe and the attack on the Yorgen family.', '他的日志记录了月神镰刀重见天日，以及约根一家遇袭的经过。'), [1431]);
  F('sven', L('Sven Yorgen', '斯温·约根'), L('Survivor of the Yorgen farm', '约根农场的幸存者'), L('Seeks the truth about the deaths of his family and help against Morbent Fel.', '追查家人死去的真相，寻找能帮他对抗摩本特·费尔的人。'), [1431]);
  F('morbent', L('Morbent Fel', '摩本特·费尔'), L('Necromancer of Raven Hill', '乌鸦岭的死灵法师'), L('Commands undead and protects himself with magic that a Lightforge weapon can dispel.', '指挥亡灵，并用魔法护身。光铸武器能破除他的防护。'), [1431]);
  F('morgan-ladimore', L('Morgan Ladimore', '摩根·拉迪莫尔'), L('Fallen knight', '堕落的骑士'), L('Returns from war to loss in Duskwood. As Mor’Ladim, he haunts the graveyard near Raven Hill.', '战后回到暮色森林，家人却已不在。死后化作摩拉迪姆，在乌鸦岭墓地游荡。'), [1431]);
  F('sarah', L('Sarah Ladimore', '莎拉·拉迪莫尔'), L('Darkshire watcher', '夜色镇的守夜人'), L('Gives her ring to be placed on her father Morgan’s grave so that he will know she survived.', '托人把自己的戒指放到父亲摩根的墓前，让他知道自己还活着。'), [1431]);
  F('abercrombie', L('Abercrombie', '亚伯克隆比'), L('The Embalmer', '藏尸者'), L('Lives above Raven Hill, where he raises his wife Eliza and makes the abomination Stitches.', '住在乌鸦岭高处，在那里复活了妻子伊莉莎，造出了憎恶缝合怪。'), [1431]);
  F('stitches', L('Stitches', '缝合怪'), L('The Embalmer’s creation', '藏尸者的造物'), L('An abomination sent down the road toward Darkshire.', '一个被派往夜色镇的憎恶，沿着道路朝镇上走去。'), [1431]);
  F('eliza', L('Eliza', '伊莉莎'), L('Bride of the Embalmer', '藏尸者的妻子'), L('Abercrombie’s wife, raised from the dead and found in a grave behind his shack.', '亚伯克隆比的妻子，从死亡中复生，被发现在他小屋后的坟墓里。'), [1431]);
  F('stalvan', L('Stalvan Mistmantle', '斯塔文·密斯特曼托'), L('Undead former tutor', '已成亡灵的昔日教师'), L('His letters and the testimony of people who knew him reveal the crimes behind the haunting of his manor.', '他的信和旧相识的证词，揭露了庄园闹鬼背后的罪行。'), [1431, 1436, 1429, 1453]);
  F('tilloa', L('Tilloa', '蒂罗亚'), L('Stalvan’s pupil', '斯塔文的学生'), L('Her former tutor’s writings reveal his fixation on her and his anger at her plans to marry.', '旧日教师的书信写出了他对她的迷恋，以及得知她打算结婚时的愤怒。'), [1431, 1453]);
  F('alexstrasza', L('Alexstrasza', '阿莱克丝塔萨'), L('Red Dragonqueen', '红龙女王'), L('Held by the Dragonmaw at Grim Batol until the Demon Soul that bound her was destroyed.', '龙喉氏族将她囚禁在格瑞姆巴托，直到束缚她的恶魔之魂被摧毁。'), [1437], 'grim-batol');
  F('stoutfist', L('Captain Stoutfist', '斯托菲队长'), L('Menethil garrison commander', '米奈希尔港驻军指挥官'), L('Directs the campaign against the Dragonmaw, their siege engines and their chieftain.', '指挥对龙喉氏族的战事，目标包括他们的攻城器械和酋长。'), [1437]);
  F('nekrosh', L('Chieftain Nek’rosh', '纳克罗什酋长'), L('Dragonmaw commander', '龙喉氏族指挥官'), L('Leads the Dragonmaw forces still active around Angerfang Encampment.', '率领仍在怒牙营地周边活动的龙喉部队。'), [1437], 'dragonmaw');
  F('motley', L('Motley Garmason', '莫特雷·加玛森'), L('Dun Modr’s counterattack', '丹莫德反攻的组织者'), L('Tries to push back the Dark Iron forces that damaged the Thandol Span.', '试图击退破坏了萨多尔大桥的黑铁部队。'), [1437]);
  F('kam', L('Kam Deepfury', '卡姆·深怒'), L('Dark Iron prisoner', '黑铁囚犯'), L('Held in Stormwind’s Stockade and wanted by Motley Garmason at Dun Modr.', '被关在暴风城监狱，丹莫德的莫特雷·加玛森正要找他。'), [1453, 1437], 'dark-iron');
  F('whelgar', L('Prospector Whelgar', '勘察员维尔加'), L('Excavation leader in the Wetlands', '湿地考古队负责人'), L('Seeks the fragments of an ancient tablet after raptors overrun the dig.', '挖掘场被迅猛龙占据后，仍在寻找上古石板的碎片。'), [1437], 'explorers-league');
  F('fitzsimmons', L('First Mate Fitzsimmons', '大副菲兹莫斯'), L('Survivor of the Third Fleet', '第三舰队的幸存者'), L('Seeks to free the other sailors from the curse binding them to their wrecks.', '希望解除将其他水手困在沉船上的诅咒。'), [1437]);
  F('halyndor', L('Captain Halyndor', '哈林多尔船长'), L('Dead captain of the Intrepid', '无畏号已故船长'), L('Still carries the key to the strongbox aboard his wrecked ship.', '死后仍携带失事船上的箱子钥匙。'), [1437]);
  F('glorin', L('Glorin Steelbrow', '戈罗林·钢眉'), L('Priest in Menethil', '米奈希尔港的牧师'), L('Receives the cursed object from the Intrepid’s strongbox.', '接收从无畏号箱子里取出的受诅咒物品。'), [1437]);
  F('grimand', L('Grimand Elmore', '格瑞曼德·艾尔默'), L('Stormwind smith', '暴风城铁匠'), L('Works the Lightforge metal from the Wetlands into a weapon for the fight against Morbent Fel.', '将湿地找回的光铸金属打造成武器，用来对付摩本特·费尔。'), [1453, 1431, 1437]);
  F('rethiel', L('Rethiel the Greenwarden', '绿色守卫者雷希耶尔'), L('Keeper of the marsh', '沼泽的守护者'), L('Asks for help tending the living land beside the Wetlands road.', '请人帮忙照料湿地道路旁的生灵与土地。'), [1437]);
  F('dorin', L('Dorin Songblade', '多林·桑布雷德'), L('Lakeshire armorer · Forever', '湖畔镇的护甲商 · 无限服'), L('Seeks word of his brother, who left with a Loch Modan excavation crew.', '打听弟弟的消息。弟弟随洛克莫丹的一支考古队出发后便没了音讯。'), [1433, 1437]);
  F('daewyn', L('Daewyn Songblade', '戴温·桑布雷德'), L('Excavator from Loch Modan · Forever', '洛克莫丹来的考古队员 · 无限服'), L('Joins an expedition into the Wetlands and dies at the site.', '随队到湿地考察，死在挖掘场。'), [1432, 1437]);
  F('mikhail', L('Mikhail', '米克哈尔'), L('Contact in Menethil Harbor', '米奈希尔港的联系人'), L('Points the missing diplomat investigation toward Tapoke Jahn.', '为失踪的使节一案提供了塔伯克·贾恩的线索。'), [1437]);
  F('tapoke', L('Tapoke “Slim” Jahn', '“干柴”塔伯克·贾恩'), L('The man at the inn', '旅店里的男人'), L('Tries to flee when the missing diplomat investigation reaches Menethil.', '失踪的使节一案查到米奈希尔港时，他试图逃走。'), [1437]);
  F('tiffin', L('Queen Tiffin Wrynn', '蒂芬·乌瑞恩王后'), L('Queen during the reconstruction', '重建时期的王后'), L('Varian’s wife, killed in the riot that followed the stonemasons’ dispute.', '瓦里安的妻子，在石工纠纷引发的骚乱中遇难。'), [1453]);
  F('llane', L('King Llane Wrynn', '莱恩·乌瑞恩国王'), L('King during the First War', '第一次战争时期的国王'), L('Varian’s father, killed during the fall of Stormwind.', '瓦里安的父亲，在暴风城陷落时遇害。'), [1453]);
  F('garona', L('Garona Halforcen', '半兽人迦罗娜'), L('Assassin of King Llane', '刺杀莱恩国王的人'), L('Kills Llane during the First War, shortly before the city falls.', '第一次战争期间，她在暴风城陷落前不久杀死了莱恩。'), [1453]);
  F('lothar', L('Anduin Lothar', '安度因·洛萨'), L('Champion of Stormwind', '暴风城的勇士'), L('Leads the survivors north after Stormwind falls and commands the Alliance in the Second War.', '暴风城陷落后带领幸存者北上，第二次战争时统帅联盟。'), [1453]);
  F('varian', L('Varian Wrynn', '瓦里安·乌瑞恩'), L('Stormwind’s absent king', '下落不明的暴风城国王'), L('Returns to the throne after the Second War and later vanishes while traveling to Theramore.', '第二次战争后重登王位，后来在前往塞拉摩的途中失踪。'), [1453, 1437]);
  F('anduin', L('Anduin Wrynn', '安度因·乌瑞恩'), L('Young king of Stormwind', '暴风城的年幼国王'), L('Varian’s son, crowned while his father is missing.', '瓦里安之子，在父亲失踪期间继位。'), [1453]);
  F('bolvar', L('Highlord Bolvar Fordragon', '伯瓦尔·弗塔根公爵'), L('Stormwind’s regent', '暴风城的摄政'), L('Governs and advises the young Anduin during Varian’s absence.', '瓦里安不在时主持政务，辅佐年幼的安度因。'), [1453]);
  F('thelwater', L('Warden Thelwater', '典狱官塞尔沃特'), L('Warden of the Stockade', '暴风城监狱的典狱官'), L('Tries to contain the prison riot and recalls the visitor who signed in as Maelik.', '设法控制监狱暴动，并回想起曾以麦里克的名字登记的一名访客。'), [1453]);
  F('shaw', L('Master Mathias Shaw', '马迪亚斯·肖尔'), L('Head of SI:7', '军情七处首领'), L('Identifies Thredd’s visitor as Marzon and connects him to Lord Gregor Lescovar.', '认出斯瑞德的访客是马尔松，并查明他与葛瑞格·莱斯科瓦公爵有关。'), [1453]);
  F('marzon', L('Marzon the Silent Blade', '沉默之刃马尔松'), L('Assassin in Lescovar’s service', '为莱斯科瓦效力的刺客'), L('Visits Bazil Thredd under the name Maelik and meets Lescovar in the keep garden.', '以麦里克之名探望巴基尔·斯瑞德，并在要塞花园与莱斯科瓦会面。'), [1453]);
  F('tyrion', L('Tyrion', '泰里恩'), L('Gnome intelligence contact', '侏儒情报联系人'), L('Arranges the ruse at Stormwind Keep through his Spybot.', '通过自己的间谍机器人，在暴风要塞设下计谋。'), [1453]);
  F('spybot', L('Tyrion’s Spybot', '泰里恩的间谍机器人'), L('Undercover automaton', '执行秘密任务的机器人'), L('Passes false information to Lescovar and sets up the meeting in the keep garden.', '把假消息传给莱斯科瓦，促成要塞花园里的会面。'), [1453]);
  F('windsor', L('Marshal Reginald Windsor', '雷吉纳德·温德索尔元帅'), L('Stormwind marshal', '暴风城元帅'), L('Returns from Blackrock Depths and confronts Lady Prestor in the separate Classic court investigation.', '从黑石深渊归来，在经典旧世的另一条宫廷调查线中与普瑞斯托女士对峙。'), [1453, 1428]);
  F('grom', L('Grom Hellscream', '格罗姆·地狱咆哮'), L('Warsong chieftain in the Third War', '第三次战争中的战歌酋长'), L('Leads the logging expedition into Ashenvale and kills Cenarius after drinking Mannoroth’s blood.', '率领伐木队进入灰谷，饮下玛诺洛斯之血后杀死塞纳留斯。'), [1440]);
  F('cenarius', L('Cenarius', '塞纳留斯'), L('Demigod of the forest', '森林半神'), L('Comes to the night elves’ defense when the Warsong cut into Ashenvale.', '战歌氏族侵入灰谷砍伐时，他出面保卫暗夜精灵。'), [1440]);
  F('mannoroth', L('Mannoroth', '玛诺洛斯'), L('Pit lord of the Burning Legion', '燃烧军团的深渊领主'), L('His tainted blood gives the Warsong the strength to kill Cenarius and binds them to him again.', '他被污染的血赋予战歌氏族杀死塞纳留斯的力量，也让他们再度受制于他。'), [1440]);
  F('locke', L('Locke Okarr', '洛克·奥卡尔'), L('Warsong supplier', '战歌氏族的补给负责人'), L('Tries to keep the lumber camp supplied from Splintertree Post.', '在碎木岗哨设法维持伐木场的物资供应。'), [1440]);
  F('raene', L('Raene Wolfrunner', '莱恩·狼行者'), L('Sentinel at Astranaar', '阿斯特兰纳的哨兵'), L('Investigates the change in the furbolgs and learns the story of Dartol’s rod.', '调查熊怪为何发生变化，并了解达图尔魔棒的来历。'), [1440], 'sentinels');
  F('krolg', L('Krolg', '克罗格'), L('Furbolg contact', '熊怪联系人'), L('Speaks to a visitor in furbolg form and asks for help against Ran Bloodtooth.', '与变成熊怪来访的人交谈，请对方帮忙对付兰恩·血牙。'), [1440]);
  F('ran', L('Ran Bloodtooth', '兰恩·血牙'), L('Hostile furbolg leader', '敌对熊怪首领'), L('Leads the group Krolg seeks help against.', '率领克罗格想请人对付的那群熊怪。'), [1440]);
  F('dartol', L('Dartol', '达图尔'), L('Maker of the rod of transformation', '变形魔棒的制作者'), L('Made the rod whose pieces help Raene get answers from the local furbolgs.', '他制作的魔棒虽已断裂，碎片仍能帮助莱恩向当地熊怪查问内情。'), [1440]);
  F('faldreas', L('Faldreas Goeth’Shael', '法德瑞斯·戈森沙尔'), L('Night elf at Astranaar', '阿斯特兰纳的暗夜精灵'), L('Sends word to Keeper Albagorm on Stonetalon Peak.', '向石爪峰的守护者奥巴格姆传话。'), [1440, 1442]);
  F('mastok', L('Mastok Wrilehiss', '马斯托克·维尔西斯'), L('Horde officer at Splintertree', '碎木岗哨的部落军官'), L('Wants the road to Stonetalon reopened and a lookout established on Mystral Lake.', '希望恢复通往石爪山脉的交通，并在密斯特拉湖设立瞭望点。'), [1440]);
  F('maliynn', L('Maliynn', '玛琳'), L('Astranaar supplier · Forever', '阿斯特兰纳的补给员 · 无限服'), L('Loses a family necklace while carrying supplies to an outpost.', '给前哨运送物资时弄丢了家传项链。'), [1440]);
  F('jeneu', L('Je’neu Sancrea', '耶努萨克雷'), L('Earthen Ring shaman at Zoram’gar', '佐拉姆加的大地之环萨满祭司'), L('Wants to know why naga are mining sapphires in the Blackfathom tunnels.', '想弄清纳迦为何在黑暗深渊的隧道里开采蓝宝石。'), [1440]);
  F('thaelrid', L('Argent Guard Thaelrid', '银月守卫塞尔瑞德'), L('Argent Dawn scout', '银色黎明的侦察员'), L('Infiltrates Blackfathom Deeps and discovers the sacrifices led by Kelris.', '潜入黑暗深渊，发现了克尔里斯主持的献祭。'), [1440], 'argent-dawn');
  F('kelris', L('Twilight Lord Kelris', '梦游者克尔里斯'), L('Cult leader in Blackfathom Deeps', '黑暗深渊的邪教首领'), L('Leads the sacrifices to Aku’mai in the flooded temple.', '在被水淹没的神殿里主持向阿库麦尔献祭的仪式。'), [1440], 'twilights-hammer');
  F('chogall', L('Cho’gall', '古加尔'), L('Leader of the original Twilight’s Hammer', '最初的暮光之锤领袖'), L('The ogre who led the orc clan from which the later cult took its name.', '这名食人魔曾领导一个兽人氏族，后来的邪教沿用了该氏族的名字。'), [1439, 1440], 'twilights-hammer');
  F('akumai', L('Aku’mai', '阿库麦尔'), L('Hydra beneath Blackfathom', '黑暗深渊下的多头蛇'), L('The creature to which the cult sacrifices its captives.', '邪教把俘虏献祭给这头怪兽。'), [1440]);
  F('makaba', L('Makaba Flathoof', '玛卡巴·扁蹄'), L('Survivor of Camp Aparaje', '阿帕拉耶营地的幸存者'), L('Seeks justice after the Grimtotem attack and learns that Kaya survived.', '恐怖图腾发动袭击后，他试图讨回公道，并得知卡雅还活着。'), [1442]);
  F('kaya', L('Kaya Flathoof', '卡雅·扁蹄'), L('Survivor of the Grimtotem attack', '恐怖图腾袭击的幸存者'), L('Returns to her family after the destruction of Camp Aparaje.', '阿帕拉耶营地被毁后，回到了家人身边。'), [1442]);
  F('tammra', L('Tammra Windfield', '塔姆拉·荒原'), L('Tauren shaman at Sun Rock Retreat', '烈日石居的牛头人萨满祭司'), L('Kaya’s aunt. She seeks Gaea seeds to help damaged parts of the mountains grow again.', '卡雅的姑妈，寻找能让山中受损土地重新长出草木的盖亚之种。'), [1442]);
  F('gerenzo', L('Gerenzo Wrenchwhistle', '格雷苏'), L('Venture Company engineer', '风险投资公司工程师'), L('Oversees logging around Cragpool Lake and controls access to the Super Reaper plans.', '监督峭壁湖周围的伐木作业，掌握超级收割机的图纸。'), [1442]);
  F('ziz', L('Ziz Fizziks', '菲兹克斯'), L('Former Venture Company engineer', '风险投资公司的前工程师'), L('Wants the Super Reaper plans for Sputtervalve, who hired him after the company let him go.', '离开公司后受雇于斯布特瓦夫，想替新雇主拿到超级收割机的图纸。'), [1442]);
  F('albagorm', L('Keeper Albagorm', '守护者奥巴格姆'), L('Keeper at Stonetalon Peak', '石爪峰的守护者'), L('Receives word from Astranaar and calls for the Bloodfury to be driven back.', '接收阿斯特兰纳的消息，号召人们击退血怒鹰身人。'), [1442, 1440]);
  F('maggran', L('Maggran Earthbinder', '马格兰'), L('Shaman at Sun Rock Retreat', '烈日石居的萨满祭司'), L('Sees the spread of Bloodfury harpies in the Charred Vale as a threat to the retreat.', '认为血怒鹰身人在焦炭谷扩张，威胁到了烈日石居。'), [1442]);
  F('bloodfury-ripper', L('Bloodfury Ripper', '血怒撕裂者'), L('Harpy of the Charred Vale', '焦炭谷的鹰身人'), L('Maggran wants her killed to break the power of the Bloodfury in the vale.', '马格兰希望杀死她，好瓦解血怒鹰身人在谷内的势力。'), [1442]);
  F('faralia', L('Innkeeper Faralia', '旅店老板法拉莉亚'), L('Innkeeper at Stonetalon Peak', '石爪峰的旅店老板'), L('In Forever, her shipment goes missing after wyverns attack the courier.', '无限服中，信使被双足飞龙袭击，给她送的那批货也不见了。'), [1442]);

  F('henry-maleb', L('Magistrate Henry Maleb', '赫尼·马雷布镇长'), L('Magistrate of Southshore', '南海镇镇长'), L('Tracks the Syndicate from reports and papers to the signets of the old Alterac lords.', '根据情报与文件追查辛迪加，又查到奥特兰克旧贵族的印戒。'), [1416, 1424], 'syndicate');
  F('nials', L('Captain Nials', '尼艾丝队长'), L('Officer at Refuge Pointe', '避难谷地的军官'), L('Seeks the badges Syndicate agents have taken from Stromgarde’s defenders.', '追查辛迪加从激流堡守军手中夺走的徽章。'), [1417]);
  F('drum-fel', L('Drum Fel', '德拉姆·费尔'), L('Defender of Hammerfall', '落锤镇的守卫者'), L('Warns that Witherbark trolls and Boulderfist ogres are working together.', '警告枯木巨魔与石拳食人魔正在联手。'), [1417]);
  F('johaan', L('Apothecary Johaan', '药剂师约翰'), L('Researcher at Brill', '布瑞尔的研究者'), L('Uses local ingredients in the Forsaken effort to develop a plague.', '采集当地的材料，为被遗忘者研制瘟疫。'), [1420]);
  F('araj', L('Araj the Summoner', '召唤者阿拉基'), L('Lich of Andorhal', '安多哈尔的巫妖'), L('Rules the Scourge in Andorhal; his phylactery is sought by his opponents.', '统领安多哈尔的天灾军团，敌人想夺走他的护命匣。'), [1422], 'scourge');
  F('pamela', L('Pamela Redpath', '帕米拉·雷德帕斯'), L('Child of Darrowshire', '达隆郡的孩子'), L('Her ghost waits in Darrowshire for news of her family.', '她的幽灵在达隆郡等待家人的消息。'), [1423]);
  F('darthalia', L('High Executor Darthalia', '高级执行官达萨利亚'), L('Forsaken commander at Tarren Mill', '塔伦米尔的被遗忘者指挥官'), L('Orders attacks on Hillsbrad and reports to Varimathras in Undercity.', '下令袭击希尔斯布莱德，向幽暗城的瓦里玛萨斯报告。'), [1424, 1458], 'forsaken');
  F('kalaran', L('Kalaran Windblade', '卡拉然·温布雷'), L('Smith beside the monument', '石碑旁的工匠'), L('Knows how to make a torch with the materials found in the gorge.', '知道如何用峡谷里的材料制成一支火炬。'), [1427]);
  F('helendis', L('Helendis Riverhorn', '赫林迪斯·河角'), L('Defender of Morgan’s Vigil', '摩根的岗哨的守卫者'), L('Sends news of the black dragonkin to Solomon in Lakeshire.', '把黑龙人的消息送给湖畔镇的所罗门。'), [1428, 1433]);
  F('sylvanas', L('Lady Sylvanas Windrunner', '希尔瓦娜斯·风行者'), L('Leader of the Forsaken', '被遗忘者的领袖'), L('Once a ranger-general of Quel’Thalas, she leads the undead who won their freedom and took Lordaeron’s ruins.', '曾任奎尔萨拉斯的游侠将军，如今领导夺回自由、占据洛丹伦废墟的亡灵。'), [1420, 1458], 'forsaken');
  F('arthas', L('Arthas Menethil', '阿尔萨斯·米奈希尔'), L('Fallen prince of Lordaeron', '洛丹伦的堕落王子'), L('The prince who ordered the purge of Stratholme later brought the Scourge into his own capital.', '下令清洗斯坦索姆的王子，后来率天灾军团攻入自己的都城。'), [1420, 1423, 1458], 'scourge');
  F('thrall', L('Thrall', '萨尔'), L('Warchief of the Horde', '部落的大酋长'), L('He leads the orcs out of captivity and establishes their new capital in Kalimdor.', '他带领兽人摆脱囚禁，在卡利姆多建立新都。'), [1416, 1417, 1411, 1454], 'horde');
  F('hakkar', L('Hakkar the Soulflayer', '夺灵者哈卡'), L('Blood god of the Hakkari', '哈卡莱信奉的血神'), L('His followers seek to bring him into the world again. Their old sanctuaries in the jungle and in the swamp both have a part in his return.', '信徒试图将他再次带到这个世界。丛林和沼泽中的古老圣所，都与他的归来有关。'), [1434, 1435]);
  F('medivh', L('Medivh', '麦迪文'), L('The last Guardian of Tirisfal', '提瑞斯法的末代守护者'), L('The mage who lived in Karazhan and helped open the Dark Portal.', '曾住在卡拉赞、参与开启黑暗之门的法师。'), [1430, 1419]);
  F('tirion', L('Tirion Fordring', '提里奥·弗丁'), L('Exiled paladin', '流亡的圣骑士'), L('Lives by the Thondroril River and watches his son Taelan’s life from a distance.', '隐居在索多里尔河边，牵挂着远在别处的儿子泰兰。'), [1422, 1423]);
  F('taelan', L('Taelan Fordring', '泰兰·弗丁'), L('Highlord at Hearthglen', '壁炉谷的大领主'), L('Tirion’s son serves the Scarlet Crusade at the fortress once ruled by his father.', '提里奥的儿子，在父亲曾治理的要塞中为血色十字军效力。'), [1422]);
  F('arugal', L('Archmage Arugal', '大法师阿鲁高'), L('Master of Shadowfang Keep', '影牙城堡的主人'), L('The worgen and the enchantment on Pyrewood Village lead investigators to his stronghold.', '狼人与焚木村的诅咒将调查引向他的据点。'), [1421]);
  F('faranell', L('Master Apothecary Faranell', '大药剂师法拉尼尔'), L('Apothecary in Undercity', '幽暗城的药剂师'), L('He receives reports from field researchers and works in the Apothecarium.', '他在炼金房工作，接收各地研究者的报告。'), [1420, 1424, 1458]);
  F('varimathras', L('Varimathras', '瓦里玛萨斯'), L('Dreadlord in the Royal Quarter', '皇家区的恐惧魔王'), L('Sylvanas accepts his service after defeating him. In Classic he gives orders to Forsaken officers.', '希尔瓦娜斯击败他后接受了他的效忠。经典旧世时期，他向被遗忘者军官下达命令。'), [1424, 1458]);
  F('finkle', L('Finkle Einhorn', '芬克·恩霍尔'), L('Explorer of Blackrock Spire', '黑石塔的探险者'), L('Survives an encounter with the Beast and works with Malyfous Darkhammer to make use of its hide.', '在遭遇比斯巨兽后活了下来，并与玛雷弗斯·暗锤合作研究如何利用它的兽皮。'), [1428, 1452]);
  F('magatha', L('Magatha Grimtotem', '玛加萨·恐怖图腾'), L('Grimtotem elder', '恐怖图腾长者'), L('Represents the Grimtotem in Thunder Bluff and seeks help against the Venture Company from Apothecary Zamah.', '在雷霆崖代表恐怖图腾，向药剂师扎玛寻求援助对抗风险投资公司。'), [1456, 1458]);
  F('nefarian', L('Nefarian', '奈法利安'), L('Lord of Blackwing Lair', '黑翼之巢的主人'), L('Rules from the top of Blackrock Mountain and experiments with the blood of other dragonflights.', '在黑石山顶掌权，用其他龙族的血进行实验。'), [1428]);
  F('gadrin', L('Master Gadrin', '加德林大师'), L('Darkspear elder', '暗矛长者'), L('Speaks for the villagers displaced by Zalazane’s hold on the Echo Isles.', '为扎拉赞控制回音群岛后离开家园的村民发声。'), [1411]);
  F('tonga', L('Tonga Runetotem', '图加·符文图腾'), L('Druid at the Crossroads', '十字路口的德鲁伊'), L('Investigates the strange life around the oases.', '调查绿洲水边发生的异变。'), [1413]);
  F('denalan', L('Denalan', '德纳兰'), L('Researcher at Lake Al’Ameth', '奥拉密斯湖畔的研究者'), L('Studies timberlings to learn what is changing the life of the new tree.', '研究林精，试图弄清新树上的生灵为何发生变化。'), [1438]);
  F('collie', L('J.D. Collie', '科琳'), L('Crystal researcher', '水晶研究者'), L('Studies how the crystals are used with the pylons in the crater.', '研究盆地里的水晶如何与水晶塔一同使用。'), [1449]);
  F('dorn', L('Dorn Plainstalker', '多恩·平原行者'), L('Tauren of the canyon', '峡谷里的牛头人'), L('Sets a trial of faith high above the canyon floor.', '在高高的峡谷上方设下信仰的试炼。'), [1441]);
  F('latronicus', L('Latronicus Moonspear', '拉托尼库斯·月矛'), L('Sentinel at Feathermoon', '羽月要塞的哨兵'), L('Investigates the naga in the ruins near Feathermoon’s island.', '调查羽月要塞所在岛屿附近废墟中的纳迦。'), [1444], 'sentinels');
  F('yehkinya', L('Yeh’kinya', '叶基亚'), L('Troll at Steamwheedle Port', '热砂港的巨魔'), L('Seeks knowledge of Hakkar through spirits, old tablets and an ancient egg.', '通过灵魂、旧石板与一枚古卵探查哈卡的往事。'), [1435, 1446]);
  F('grazle', L('Grazle', '格拉兹'), L('Timbermaw furbolg', '木喉熊怪'), L('Offers outsiders a way to win the trust of the Timbermaw.', '让外来者有机会获得木喉熊怪的信任。'), [1448]);
  F('donova', L('Donova Snowden', '多诺瓦·雪山'), L('Investigator in Winterspring', '冬泉谷的调查者'), L('Follows the firewater back toward the Deadwood in Felwood.', '追查火酒的来源，线索指向费伍德森林的死木熊怪。'), [1452, 1448]);
  F('neeru', L('Neeru Fireblade', '尼尔鲁·火刃'), L('Warlock in the Cleft of Shadow', '暗影裂口的术士'), L('Lets slip the identities of the Searing Blade leaders in Ragefire Chasm.', '无意间说出了怒焰裂谷中灼刃首领的身份。'), [1454]);
  F('zamah', L('Apothecary Zamah', '药剂师扎玛'), L('Forsaken at the Pools of Vision', '预见之池的被遗忘者'), L('Hears from the Grimtotem and recruits help for the apothecaries far from Undercity.', '与恐怖图腾联络，在远离幽暗城的地方为药剂师们寻求援助。'), [1456, 1424], 'forsaken');
  F('cairne', L('Cairne Bloodhoof', '凯恩·血蹄'), L('High Chieftain of the tauren', '牛头人的大酋长'), L('Allied with Thrall during the migration to Mulgore and leads the tauren from Thunder Bluff.', '迁往莫高雷时和萨尔结盟，如今在雷霆崖领导牛头人。'), [1412, 1413, 1456]);
  F('hamuul', L('Hamuul Runetotem', '哈缪尔·符文图腾'), L('Archdruid at Thunder Bluff', '雷霆崖的大德鲁伊'), L('Represents tauren druids and sends help to the beleaguered expedition in the Wailing Caverns.', '代表牛头人德鲁伊，向哀嚎洞穴里受困的考察队派出援手。'), [1456, 1413, 1450], 'cenarion-circle');
  F('tyrande', L('Tyrande Whisperwind', '泰兰德·语风'), L('High Priestess of Elune', '艾露恩的高阶女祭司'), L('Leads the night elves from Darnassus and keeps watch while Malfurion is absent.', '在达纳苏斯领导暗夜精灵，在玛法里奥缺席期间守护族人。'), [1457, 1438, 1450], 'elune');
  F('fandral', L('Fandral Staghelm', '范达尔·鹿盔'), L('Archdruid at Darnassus', '达纳苏斯的大德鲁伊'), L('Leads the druids in Darnassus and carries the memory of the war in Silithus.', '统领达纳苏斯的德鲁伊，也背负着希利苏斯战争的往事。'), [1438, 1457, 1451], 'cenarion-circle');
  F('jaina', L('Jaina Proudmoore', '吉安娜·普罗德摩尔'), L('Leader of Theramore', '塞拉摩的领袖'), L('Led refugees across the Great Sea and governs Theramore from its citadel.', '曾带难民渡过无尽之海，如今在城堡里治理塞拉摩。'), [1445, 1453]);
  F('voljin', L('Vol’jin', '沃金'), L('Leader of the Darkspear', '暗矛部族的领袖'), L('Serves alongside Thrall in Orgrimmar. His people have a home on Durotar’s coast.', '在奥格瑞玛与萨尔共事，他的族人则在杜隆塔尔海岸安家。'), [1411, 1454], 'horde');
  F('naralex', L('Naralex', '纳拉雷克斯'), L('Druid of the Wailing Caverns', '哀嚎洞穴的德鲁伊'), L('Enters the Emerald Dream to restore the Barrens. His disciples struggle with the nightmare that follows.', '进入翡翠梦境，试图使贫瘠之地恢复生机。他的弟子不得不对抗随之而来的噩梦。'), [1413, 1456], 'cenarion-circle');
  F('gazlowe', L('Gazlowe', '加兹鲁维'), L('Goblin of Ratchet', '棘齿城的地精'), L('Takes an interest in the pirates threatening Ratchet’s shipping.', '关注威胁棘齿城航运的海盗。'), [1413]);
  F('remulos', L('Keeper Remulos', '守护者雷姆洛斯'), L('Keeper of the grove', '林地的守护者'), L('Tends the sanctuary in Moonglade and calls on allies when a nightmare reaches it.', '照看月光林地的圣所。当噩梦蔓延到这里时，他向盟友求援。'), [1450, 1451, 1440], 'cenarion-circle');
  F('hydraxis', L('Duke Hydraxis', '海达克西斯公爵'), L('Leader of the Hydraxian Waterlords', '海达希亚水元素的领袖'), L('Makes common cause with those who fight the elementals of Ragnaros.', '与对抗拉格纳罗斯麾下元素生物的人携手。'), [1447, 1427]);
  F('anachronos', L('Anachronos', '阿纳克洛斯'), L('Bronze dragon of the Caverns of Time', '时光之穴的青铜龙'), L('Remembers why the Scarab Wall was raised and helps restore the scepter that can open it.', '记得甲虫之墙为何建立，并协助修复能够开启它的权杖。'), [1446, 1451]);

  const factions = {};
  function faction(id, name, text, glossaryId) { factions[id] = { id, name, text, glossaryId }; }
  faction('bronzebeard', L('Bronzebeard clan', '铜须氏族'), L('The ruling clan of Ironforge, responsible for the mountain kingdom’s defense.', '统治铁炉堡的氏族，负责保卫山中王国。'), 'bronzebeard');
  faction('exiles', L('Gnomeregan Exiles', '诺莫瑞根流亡者'), L('The survivors of the lost gnome capital, rebuilding their strength beside their dwarven allies.', '侏儒都城陷落后的幸存者，在矮人盟友身边恢复力量。'), 'gnomeregan');
  faction('mountaineers', L('Mountaineers', '巡山人'), L('Scouts and guards linking Khaz Modan’s settlements and passes.', '负责侦察和守卫，把卡兹莫丹的聚落与山口联结起来。'), 'mountaineers');
  faction('frostmane', L('Frostmane tribe', '霜鬃氏族'), L('Ice trolls whose caves and ridges border the dwarven settlements.', '冰巨魔，其洞穴和山岭紧邻矮人聚落。'), 'frostmane');
  faction('dark-iron', L('Dark Iron clan', '黑铁氏族'), L('A rival dwarven power rooted in Shadowforge and the old civil war.', '与铁炉堡敌对的矮人势力，以暗炉城为据点，双方的恩怨可追溯至内战。'), 'dark-iron');
  faction('wildhammer', L('Wildhammer clan', '蛮锤氏族'), L('The clan driven from Ironforge and later from Grim Batol, now based at Aerie Peak.', '先后离开铁炉堡和格瑞姆巴托，如今定居鹰巢山。'), 'wildhammer');
  faction('defias', L('Defias Brotherhood', '迪菲亚兄弟会'), L('Former stonemasons, bandits, mercenaries, and craftsmen mobilized against Stormwind.', '由昔日的石工、强盗、佣兵与工匠集结而成，共同对抗暴风城。'), 'defias-brotherhood');
  faction('militia', L('People’s Militia', '人民军'), L('Westfall’s local defense, led by Stoutmantle from Sentinel Hill.', '西部荒野的地方守备力量，由驻扎在哨兵岭的斯托曼指挥。'), null);
  faction('sentinels', L('Sentinels', '哨兵'), L('The night elves’ military force, protecting settlements and forests.', '暗夜精灵的军队，负责保护聚落与森林。'), 'sentinels');
  faction('blackwood', L('Blackwood furbolgs', '黑木熊怪'), L('A forest community whose hostility is traced to demonic corruption.', '住在森林里的熊怪族群。调查发现，它们变得敌对与恶魔腐化有关。'), null);
  faction('twilight', L('Twilight’s Hammer', '暮光之锤'), L('A cult seeking destructive powers associated with the Old Gods.', '追寻与上古之神有关的毁灭之力的邪教。'), 'twilights-hammer');
  faction('league', L('Explorers’ League', '探险者协会'), L('Dwarven archaeologists following the traces of ancient civilizations.', '追寻古代文明遗迹的矮人考古组织。'), 'explorers-league');
  faction('stonesplinter', L('Stonesplinter troggs', '碎石穴居人'), L('Troggs around the Valley of Kings and the ruins east of the loch.', '栖居在国王谷和湖东遗迹周围的穴居人。'), 'troggs');
  faction('mogrosh', L('Mo’grosh ogres', '莫格罗什食人魔'), L('Ogres in the northeastern hills of Loch Modan, where they mine crystals.', '住在洛克莫丹东北部的山丘，在那里开采水晶。'), null);
  faction('stormwind-army', L('Stormwind Army', '暴风城军队'), L('The kingdom’s soldiers, marshals and outlying garrisons.', '王国的士兵、治安官和各处外围驻军。'), null);
  faction('holy-light', L('Church of the Holy Light', '圣光教会'), L('The church whose abbey stands in Northshire and whose cathedral overlooks Stormwind’s Cathedral Square.', '教会的修道院坐落于北郡，大教堂俯瞰暴风城的教堂广场。'), null);
  faction('nobles', L('House of Nobles', '贵族议会'), L('Stormwind’s nobles, whose dispute with the Stonemasons’ Guild helped drive the builders into revolt.', '暴风城的贵族组织，与石工协会的工钱纠纷助推了工匠的反抗。'), null);
  faction('stonemasons', L('Stonemasons’ Guild', '石工协会'), L('Artisans who rebuilt Stormwind. VanCleef led members of the guild into the Defias after the payment dispute.', '重建暴风城的工匠组织。工钱纠纷过后，范克里夫带协会部分成员加入迪菲亚兄弟会。'), null);
  faction('si7', L('SI:7', '军情七处'), L('Stormwind’s intelligence service, based in the barracks of Old Town and led by Mathias Shaw.', '暴风城的情报部门，设在旧城区的营房内，由马迪亚斯·肖尔领导。'), null);
  faction('riverpaw', L('Riverpaw gnolls', '河爪豺狼人'), L('Gnolls whose raids trouble the western road through Elwynn and the approaches to Lakeshire.', '常在艾尔文森林西路和湖畔镇外围劫掠的豺狼人。'), null);
  faction('blackrock', L('Blackrock clan', '黑石氏族'), L('The orcs holding Stonewatch and fighting Stormwind’s forces on the northern frontier.', '占据石堡，在北部边境与暴风城军队交战的兽人。'), null);
  faction('shadowhide', L('Shadowhide gnolls', '暗皮豺狼人'), L('Gnolls around Ilgalar who serve Morganth through Lieutenant Fangore.', '栖居在伊尔加拉之塔周边，由范高雷中尉统领，为莫甘斯效力。'), null);
  faction('commerce-authority', L('Azeroth Commerce Authority · Forever', '艾泽拉斯贸易局 · 无限服'), L('A trading organization with a hub for shipments and couriers at Three Corners.', '在三角路口设有货运及信使集散点的贸易组织。'), null);
  faction('night-watch', L('The Night Watch', '守夜人'), L('Darkshire’s local defense, led by Althea Ebonlocke.', '夜色镇的地方守备力量，由阿尔泰娅·埃伯洛克领导。'), null);
  faction('nightbane-worgen', L('Nightbane worgen', '夜行狼人'), L('Worgen prowling farms, groves and the mine in Duskwood.', '在暮色森林的农场、树林和矿洞间出没的狼人。'), null);
  faction('dragonmaw', L('Dragonmaw clan', '龙喉氏族'), L('Orcs who once held the red dragons at Grim Batol and still maintain camps in the Wetlands.', '曾在格瑞姆巴托囚禁红龙，至今仍在湿地扎营的兽人氏族。'), 'dragonmaw');
  faction('third-fleet', L('Third Fleet of Kul Tiras', '库尔提拉斯第三舰队'), L('Sailors whose ships wrecked along the Wetlands coast and whose dead were held by a curse.', '舰队在湿地沿岸失事，船员的亡魂被诅咒困在沉船上。'), null);
  faction('warsong', L('Warsong clan', '战歌氏族'), L('The orcs whose Third War logging expedition brought them into Ashenvale. The Warsong Outriders continue the fight over the forest’s timber.', '第三次战争中为伐木进入灰谷的兽人氏族。战歌斥候至今仍为林中的木材而战。'), null);
  faction('silverwing', L('Silverwing Sentinels', '银翼哨兵'), L('Night elf defenders fighting the Warsong over the forests around Warsong Gulch.', '在战歌峡谷周边与战歌氏族争夺林地的暗夜精灵守卫。'), 'sentinels');
  faction('satyrs', L('Ashenvale satyrs', '灰谷萨特'), L('Demons occupying camps in the eastern forest, including Night Run, Satyrnaar and Xavian.', '占据森林东部营地的恶魔，在夜道谷、萨提纳尔和萨维亚都可见到。'), null);
  faction('ashen-furbolgs', L('Ashenvale furbolgs', '灰谷熊怪'), L('Forest communities including the Thistlefur and Foulweald. Krolg and Ran Bloodtooth show divisions among the region’s furbolgs.', '包括蓟皮和污林在内的林中族群。克罗格与兰恩·血牙的分歧反映出当地熊怪并非铁板一块。'), null);
  faction('argent-dawn', L('Argent Dawn', '银色黎明'), L('An order that sends Thaelrid into Blackfathom Deeps to investigate the cult.', '派塞尔瑞德潜入黑暗深渊调查邪教的组织。'), 'argent-dawn');
  faction('earthen-ring', L('Earthen Ring', '大地之环'), L('A shamanic order represented at Zoram’gar by Je’neu Sancrea.', '萨满祭司的团体，由耶努萨克雷驻守佐拉姆加。'), null);
  faction('blackfathom-naga', L('Blackfathom naga', '黑暗深渊的纳迦'), L('Naga occupying the flooded sanctuary and harvesting crystals from its tunnels.', '占据被淹没的圣所，并在隧道中开采水晶的纳迦。'), null);
  faction('venture', L('Venture Company', '风险投资公司'), L('A company that cuts the forests of Windshear Crag with workers and mechanical shredders.', '派工人和机械伐木机在狂风峭壁砍伐森林的公司。'), null);
  faction('grimtotem', L('Grimtotem tribe', '恐怖图腾部族'), L('The tauren faction whose raiders destroy Camp Aparaje.', '派袭击者摧毁阿帕拉耶营地的牛头人派系。'), null);
  faction('bloodfury', L('Bloodfury harpies', '血怒鹰身人'), L('Harpies nesting in the Charred Vale and drawing the attention of both nearby settlements.', '在焦炭谷筑巢，引起附近两处聚落警惕的鹰身人。'), null);

  faction('horde', L('Horde', '部落'), L('Thrall’s coalition has its capital in Durotar and holds outposts throughout Kalimdor and the Eastern Kingdoms.', '萨尔领导的联盟以杜隆塔尔为中心，在卡利姆多与东部王国多地设有据点。'), 'horde');
  faction('forsaken', L('Forsaken', '被遗忘者'), L('Free undead under Sylvanas, based beneath ruined Lordaeron.', '效忠希尔瓦娜斯的自由亡灵，以洛丹伦废墟地下为据点。'), 'forsaken');
  faction('scourge', L('Scourge', '天灾军团'), L('The Lich King’s undead armies still occupy large parts of Lordaeron.', '巫妖王的亡灵大军仍占据洛丹伦大片土地。'), 'scourge');
  faction('syndicate', L('Syndicate', '辛迪加'), L('Alterac’s dispossessed nobles and their agents seek to recover power in Lordaeron.', '失势的奥特兰克贵族及其手下试图在洛丹伦重夺权势。'), 'syndicate');
  faction('scarlet-crusade', L('Scarlet Crusade', '血色十字军'), L('An order fighting the undead from fortified holdings in Lordaeron. Its zeal makes even living outsiders suspect.', '从洛丹伦的堡垒出击、与亡灵作战的组织。狂热的成员对活人外来者也不信任。'), null);
  faction('royal-apothecary', L('Royal Apothecary Society', '皇家药剂师协会'), L('Forsaken researchers in Undercity who develop a new plague and draw on work from their outposts.', '幽暗城的被遗忘者研究者，利用各地前哨的研究成果研制新的瘟疫。'), null);
  faction('thorium-brotherhood', L('Thorium Brotherhood', '瑟银兄弟会'), L('Dark Iron artisans who maintain their own forge and settlement at Thorium Point.', '在瑟银哨塔拥有自己工坊与据点的黑铁工匠。'), null);
  faction('zandalar', L('Zandalar Tribe', '赞达拉部族'), L('Trolls who establish a camp off Stranglethorn to oppose Hakkar.', '在荆棘谷近海扎营、反抗哈卡的巨魔。'), null);
  faction('steamwheedle', L('Steamwheedle Cartel', '热砂港集团'), L('The goblin cartel ties ports and trading towns such as Booty Bay, Ratchet, Gadgetzan and Everlook together.', '这个地精财团把藏宝海湾、棘齿城、加基森和永望镇等港口与商镇联结起来。'), null);
  faction('black-dragonflight', L('Black dragonflight', '黑龙军团'), L('The dragonflight whose brood holds strongholds at Blackrock Spire and in Dustwallow Marsh.', '其龙群在黑石塔和尘泥沼泽拥有据点的龙族。'), null);
  faction('green-dragonflight', L('Green dragonflight', '绿龙军团'), L('Dragons charged with guarding the Emerald Dream, whose kin watch the sunken temple in the Swamp of Sorrows.', '守护翡翠梦境的龙族，其同族看守悲伤沼泽的沉没神庙。'), null);
  faction('cenarion-circle', L('Cenarion Circle', '塞纳里奥议会'), L('Druids from both sides tend and study the land, from Moonglade to Silithus.', '来自两大阵营的德鲁伊在月光林地、希利苏斯等地照料土地，研究自然。'), 'cenarion-circle');
  faction('darkspear', L('Darkspear tribe', '暗矛部族'), L('The trolls who followed Thrall west and settled along the coast of Durotar.', '随萨尔向西渡海、后来定居在杜隆塔尔海岸的巨魔。'), null);
  faction('burning-blade', L('Burning Blade', '火刃氏族'), L('A name carried by orc cultists who work in caves and hide among the Horde.', '在洞穴里活动、也潜伏于部落之中的兽人邪教徒沿用了这个名字。'), null);
  faction('hydraxian', L('Hydraxian Waterlords', '海达希亚水元素'), L('Water elementals led by Duke Hydraxis, who opposes Ragnaros’s forces.', '由海达克西斯公爵领导、与拉格纳罗斯势力为敌的水元素。'), null);
  faction('qiraji', L('Qiraji', '其拉虫人'), L('The forces within Ahn’Qiraj, who command the silithid and threaten the desert beyond the walls.', '安其拉城中的势力，指挥异种虫，威胁城墙外的沙漠。'), 'qiraji');
  faction('timbermaw', L('Timbermaw Hold', '木喉要塞'), L('Furbolgs who defend their tunnels and seek aid against corrupted tribes nearby.', '守卫地下通道，并寻求援手对抗邻近腐化部族的熊怪。'), null);

  faction('brotherhood-of-the-horse', L('Brotherhood of the Horse', '铁马兄弟会'), L('Former Stormwind cavalry who made a home at Farholde Keep in the Riverglades.', '暴风城昔日的骑兵，在河林的法霍德要塞安家。'), null);
  faction('shendralar', L('Shen’dralar', '辛德拉'), L('The legacy of the Highborne of Eldre’Thalas links the temple at Shen’dralas to Dire Maul.', '埃雷萨拉斯上层精灵的遗产将辛德拉神殿与厄运之槌相连。'), null);

  const zones = {};
  function zone(id, name, region, levels, summary, extra = {}) {
    zones[id] = { id, name, region, continent: id === 1439 || id === 1440 || id === 1442 ? 'kalimdor' : 'eastern', levels: L(levels, levels === 'Capital city' ? '主城' : levels), map: 'maps/' + id + '.jpg', summary, complete: false, history: [], storylines: [], figureIds: [], factionIds: [], places: [], relatedZoneIds: [], sagaIds: [], sourceIds: [], ...extra };
  }
  zone(1426, L('Dun Morogh', '丹莫罗'), L('Khaz Modan · Eastern Kingdoms', '卡兹莫丹 · 东部王国'), '1–10', L('The snowbound heartland around Ironforge shelters two peoples: the dwarves who hold the mountain and the gnomes who have lost their city. Local patrols, rival brewers, and a renewed Dark Iron threat reveal how a kingdom survives at home.', '铁炉堡周围白雪覆盖的腹地住着两个族群：世代守卫群山的矮人，以及失去故乡的侏儒。巡山人的日常、酒商间的竞争，以及黑铁矮人再度带来的威胁，展现了这个王国如何维系自己的家园。'), {
    complete: true,
    overview: [L('Dun Morogh looks secure from the gates of Ironforge. Out on the snowfields, its security depends on scattered villages, guarded tunnels, and people carrying reports between them. Coldridge Valley trains newcomers; Kharanos supports the central watch; the eastern roads reach quarries, ranches, and the passes into Loch Modan.', '从铁炉堡的城门望去，丹莫罗似乎固若金汤。到了雪原上就会发现，当地的安全靠的是分散的村庄、有人把守的隧道，以及往来传递消息的人。寒脊山谷训练新人，卡拉诺斯为中部岗哨提供支援，向东的道路则通往采石场、牧场和前往洛克莫丹的山口。'), L('Two different histories meet here. The War of the Three Hammers explains why rival dwarf clans still threaten one another. The fall of Gnomeregan explains why gnomes now work and train alongside dwarves. Neither begins with an adventurer’s first errand. Those errands reveal the consequences of events already in motion.', '两段历史在这里交汇。三锤之战解释了矮人各氏族为何仍然彼此敌对；诺莫瑞根的陷落则解释了为什么侏儒如今与矮人一起工作和训练。冒险者接下第一件差事时，这些事件早已发生，而差事让人看到了它们留下的影响。')],
    history: [H(L('Deep past', '远古时代'), L('A people shaped by stone', '源自岩石的族群'), L('Dwarves descend from the titan-forged earthen. Their archaeological work seeks a past that the modern mountain kingdom only partly understands.', '矮人的祖先是泰坦铸造的土灵。他们四处考古，试图弄清这段连今天的山中王国也所知有限的历史。')), H(L('Centuries before the present', '数百年前'), L('The three clans divide', '三个氏族分裂'), L('After Modimus Anvilmar’s death, the Bronzebeards retain Ironforge. The Wildhammers and Dark Irons establish rival kingdoms, and renewed war ends with Ragnaros’s summoning.', '莫迪姆斯·安威玛尔死后，铜须氏族守住铁炉堡。蛮锤和黑铁分别另立王国，纷争再起，最终以拉格纳罗斯被召唤而告终。')), H(L('Recent past', '不久之前'), L('Gnomeregan falls', '诺莫瑞根陷落'), L('Troggs invade the gnome capital. A failed radiation purge and Thermaplugg’s treachery drive the survivors to Ironforge.', '穴居人入侵侏儒都城。辐射清剿失败，加上瑟玛普拉格的背叛，幸存者被迫逃往铁炉堡。')), H(L('Classic-era present', '经典旧世时期'), L('The watch keeps the roads open', '巡山人维持道路畅通'), L('Frostmane trolls, troggs, and dangerous wildlife press on the settlements. Forever adds an incursion into Ironforge’s ancestral vaults.', '霜鬃巨魔、穴居人和危险的野兽不断威胁各处聚落。无限服新增了铁炉堡先祖密室遭入侵的情节。'))],
    storylines: [S('dm-home', L('Two peoples, one refuge', '两个族群，一处避难所'), ['dm-exile', 'dm-troggs', 'gn-betrayal']), S('dm-defenses', L('The watch around Ironforge', '铁炉堡周边的防务'), ['dm-frostmane', 'dm-watch']), S('dm-ordinary', L('The life behind the defenses', '防线背后的日常'), ['dm-brew', 'dm-hearth']), S('dm-darkiron', L('An old enemy beneath the capital', '都城地下的宿敌'), ['dm-farsen', 'dm-vaults'])],
    figureIds: ['magni', 'mekkatorque', 'senir', 'farsen', 'durgen'], factionIds: ['bronzebeard', 'exiles', 'mountaineers', 'frostmane', 'dark-iron'],
    places: [P('anvilmar', L('Anvilmar', '安威玛尔'), 28.8, 67.2, L('The training hall in Coldridge Valley bears the old high king’s name.', '寒脊山谷的训练大厅以昔日的至高王命名。')), P('kharanos', L('Kharanos', '卡拉诺斯'), 46.8, 52.5, L('The central settlement and Thunderbrew Distillery.', '位于中部的聚落，也是雷酒酿制厂的所在地。')), P('gnomeregan-gate', L('Gnomeregan', '诺莫瑞根'), 24.2, 39.2, L('The lost gnome city in the western mountains.', '西部群山中陷落的侏儒城市。')), P('brewnall', L('Brewnall Village', '烈酒村'), 30.2, 45.7, L('Home of the Barleybrews and their rival brewing business.', '麦酒一家住在这里，经营着一家与雷酒竞争的酒坊。')), P('golbolar', L('Gol’Bolar Quarry', '古博拉采掘场'), 68.5, 56.5, L('An excavation threatened by Rockjaw troggs.', '一处受到石腭穴居人威胁的采掘场。')), P('farsen-camp', L('Farsen’s camp', '法森的营地'), 64.9, 58.5, L('The Wildhammer visitor’s lookout in Forever.', '无限服中这位蛮锤访客用来观察敌情的地方。'))],
    relatedZoneIds: [1455, 1432, 1437], sagaIds: ['three-hammers', 'gnomeregan'], sourceIds: ['manual', 'history', 'farsen', 'incursion', 'thanes', 'gnome-betrayal']
  });
  zone(1436, L('Westfall', '西部荒野'), L('Kingdom of Stormwind · Eastern Kingdoms', '暴风王国 · 东部王国'), '10–20', L('Stormwind’s western farmland is the place where the capital’s unresolved debts become a rural emergency. Its farmers and militia face a Brotherhood born from injustice that now inflicts injustice of its own.', '暴风城西面的农田本为都城供应物资，如今都城未偿的旧债却让乡间陷入危机。当地农民和民兵面对的兄弟会因不公而生，如今也在欺压他人。'), {
    complete: true,
    overview: [L('Westfall is open country: farms, windmills, mines, and a dangerous western shore. Sentinel Hill is its defensive center, but the militia’s view from the tower does not reach every abandoned field. Food errands and broken machines belong beside the military story because they show what is being lost.', '西部荒野地势开阔，遍布农场、风车和矿井，西边还有一段险恶的海岸。哨兵岭是防御中枢，但民兵站在塔上也望不到每一块荒废的田地。筹集食物和修理坏掉的机器，与军事冲突同样值得一提，因为它们让人看清当地正在失去什么。'), L('The Defias are the region’s dominant organized threat. Their origins lie in Stormwind’s rebuilding; their strength lies in workshops and hidden passages beneath Moonbrook. Follow that history from its cause to its consequences, and the mine becomes the middle of a political story rather than a self-contained monster lair.', '迪菲亚兄弟会是这一带最主要的有组织威胁。他们因暴风城的重建而兴起，靠月溪镇下的工坊与密道壮大。从头追溯这段历史，会发现矿井是政治风波中的一环，其中的故事远不止于清剿怪物。')],
    history: [H(L('Before the crisis', '危机之前'), L('A countryside tied to the capital', '与都城相连的乡野'), L('Farms and mines make Westfall part of Stormwind’s economic hinterland; roads connect it to Elwynn and the city.', '农场和矿井让西部荒野成为暴风城的经济腹地，道路把它与艾尔文森林和都城连在一起。')), H(L('After the Second War', '第二次战争之后'), L('Rebuilding leaves a debt', '重建留下欠债'), L('The Stonemasons restore Stormwind, but their payment dispute with its nobles ends in unrest and exile.', '石工们修复了暴风城，却与贵族因工钱发生争执。骚乱过后，石工被逐出城。')), H(L('The Brotherhood grows', '兄弟会壮大'), L('An abandoned mine becomes a base', '废弃矿井成为据点'), L('VanCleef builds a network in the countryside and a warship beneath Moonbrook. Remaining farmers organize around the People’s Militia.', '范克里夫在乡间建立组织，在月溪镇地下建造战船。留下来的农民以人民军为核心组织起来。')), H(L('The Classic story’s resolution', '经典旧世故事的结局'), L('The leader falls; the trail continues', '首领倒下，线索未断'), L('The Deadmines expedition stops VanCleef’s immediate plan. His letter carries the investigation back into Stormwind, while the damaged countryside still needs help.', '死亡矿井的突袭阻止了范克里夫眼下的计划。他的信将调查引回暴风城，而遭受破坏的乡间仍需要援助。'))],
    storylines: [S('wf-roots', L('How the crisis began', '危机如何开始'), ['defias-rebuilding', 'defias-rupture']), S('wf-hold', L('The countryside and its defenders', '乡间与守卫乡间的人'), ['wf-farms', 'wf-militia']), S('wf-hideout', L('Following the Brotherhood underground', '追查地下的兄弟会'), ['defias-investigation', 'wf-miners', 'gn-shredder', 'defias-ship', 'defias-letter']), S('wf-shore', L('The lighthouse still burns', '灯塔仍在发光'), ['wf-coast'])],
    figureIds: ['vancleef', 'gryan', 'riell', 'salma', 'grayson', 'baros'], factionIds: ['defias', 'militia'],
    places: [P('sentinel-hill', L('Sentinel Hill', '哨兵岭'), 56.3, 47.5, L('The militia’s base overlooking the farms.', '人民军俯瞰周边农场的据点。')), P('moonbrook', L('Moonbrook', '月溪镇'), 42.5, 71.7, L('A ruined settlement concealing the route into the Deadmines.', '这座废弃小镇藏着通往死亡矿井的道路。')), P('saldean-farm', L('Saldean’s Farm', '萨丁农场'), 56.2, 31.3, L('A working household amid the wider agricultural crisis.', '农业危机之中仍在耕作的一户人家。')), P('lighthouse', L('Westfall Lighthouse', '西部荒野灯塔'), 30.5, 86, L('Captain Grayson’s ghost keeps its warning light alive.', '葛瑞森船长的幽灵仍维持着灯塔的警示灯。'))],
    relatedZoneIds: [1429, 1433, 1453, 1431], sagaIds: ['defias', 'gnomeregan'], sourceIds: ['defias', 'trail', 'letter', 'gnome-shoni']
  });
  zone(1439, L('Darkshore', '黑海岸'), L('Northern Kalimdor', '卡利姆多北部'), '10–20', L('Darkshore is the surviving edge of a shattered night elf world, where ruined cities stand close to a working harbor. Its stories move from ancient loss to the care of a sick forest, then to powers stirring beneath the coast.', '黑海岸是暗夜精灵旧世界破碎后留下的边缘，城镇的废墟就在仍有船只进出的港口附近。这里的故事从远古的失落讲到对染病森林的照料，继而追踪在海岸地下蠢动的力量。'), {
    complete: true,
    overview: [L('In this Classic-era setting, Auberdine is still a living port. The later Cataclysm and the later war for Darkshore have not happened. Boats, beach surveys, and excavations take place among ruins left by the Sundering, while the Grove of the Ancients keeps a longer memory than any harbor ledger.', '经典旧世时期，奥伯丁仍是一座繁忙的港口。大灾变和后来争夺黑海岸的战事都尚未发生。船只往来，人们在大分裂留下的废墟中勘查海滩、挖掘遗迹。古树之林见证的往事，比任何港口账簿都要古老。'), L('The coast has several related themes, not one proven explanation for everything. Asterion’s bondage and Anaya’s haunting grow from the ancient catastrophe. Xabraxxis is implicated in the Blackwood’s corruption. The red crystal points toward a suspected outside influence, while the Twilight’s Hammer pursues old powers farther south.', '海岸上的几桩事件彼此呼应，各自的成因却未必相同。阿斯特利安遭到囚禁，安娜雅的幽灵徘徊不去，都源自远古那场灾难。萨巴克希斯牵涉黑木熊怪的腐化，红色水晶让人怀疑有外来力量介入，而暮光之锤在更南边追寻古老的力量。')],
    history: [H(L('Before the Sundering', '大分裂之前'), L('Night elf settlements on an unbroken continent', '大陆尚未破碎时的暗夜精灵聚落'), L('Bashal’Aran, Ameth’Aran, and Mathystra belong to the ancient night elf world.', '巴莎兰、亚米萨兰与玛塞斯特拉都是古代暗夜精灵世界的一部分。')), H(L('About ten thousand years ago', '约一万年前'), L('A civilization breaks', '文明崩塌'), L('The War of the Ancients and the Sundering destroy the old order. Ruins, ghosts, and surviving enchantments remain.', '上古之战和大分裂摧毁了旧秩序，只留下废墟、幽灵和尚未消散的法术。')), H(L('The long aftermath', '灾后的漫长岁月'), L('A forest grows around the losses', '森林在废墟间生长'), L('Night elf communities endure along the coast. Auberdine becomes a harbor; the Ancients and caretakers tend what remains.', '暗夜精灵的聚落在海岸上延续下来。奥伯丁成为港口，古树与看护者照料着幸存的一切。')), H(L('Classic-era present', '经典旧世时期'), L('Memory meets a new danger', '古老记忆与新的危险'), L('Forest sickness, demonic corruption, and cult activity demand investigation. Leads connect this coast to Ashenvale and Ironforge.', '林中疫病、恶魔腐化和邪教活动亟待调查。线索将这片海岸与灰谷和铁炉堡联系起来。'))],
    storylines: [S('ds-ruins', L('The ruins and the people who remember', '废墟与记得往事的人'), ['ds-shattering', 'ds-asterion', 'ds-memory']), S('ds-corruption', L('A forest asking for care', '需要照料的森林'), ['ds-bears', 'ds-blackwood', 'ds-crystal']), S('ds-depths', L('Ancient ground, dangerous interest', '古战场引来危险的访客'), ['ds-glaive', 'ds-deeps']), S('ds-present', L('A living coast', '海岸上的日常'), ['ds-harbor'])],
    figureIds: ['asterion', 'cerellean', 'anaya', 'thundris', 'tharnariun', 'onu', 'remtravel'], factionIds: ['sentinels', 'blackwood', 'twilight', 'league'],
    places: [P('auberdine', L('Auberdine', '奥伯丁'), 37, 44, L('Harbor, moonwell, and the coast’s main settlement.', '有港口和月亮井，也是海岸上最大的聚落。')), P('bashalaran', L('Bashal’Aran', '巴莎兰'), 44.2, 36.3, L('Ruins where Asterion remains bound.', '阿斯特利安至今仍被囚禁在这些废墟里。')), P('ametharan', L('Ameth’Aran', '亚米萨兰'), 42.9, 61, L('Tablets and restless spirits remember the fallen city.', '石板与不得安息的幽灵记录着这座城市的覆灭。')), P('red-crystal', L('Mysterious Red Crystal', '神秘的红色水晶'), 47.3, 48.7, L('A clue at the eastern mountain wall.', '位于东侧山壁旁的一条线索。')), P('grove', L('Grove of the Ancients', '古树之林'), 43.6, 76.3, L('Onu’s home and a meeting point for the southern investigations.', '安努的家，也是南部几项调查的交汇处。')), P('masters-glaive', L('The Master’s Glaive', '主宰之剑'), 38.5, 86, L('An ancient battlefield attracting the Twilight’s Hammer.', '暮光之锤相中的一处古战场。')), P('mathystra', L('Ruins of Mathystra', '玛塞斯特拉废墟'), 59, 18, L('Northern ruins whose relics Onu seeks to preserve.', '安努希望保护这片北部废墟中的遗物。'))],
    relatedZoneIds: [1440, 1455, 1437], sagaIds: ['corrupted-forests', 'twilight'], sourceIds: ['darkshore', 'asterion', 'anaya', 'blackwood', 'crystal', 'glaive', 'deeps', 'swelling-forces']
  });
  zone(1432, L('Loch Modan', '洛克莫丹'), L('Khaz Modan · Eastern Kingdoms', '卡兹莫丹 · 东部王国'), '10–20', L('Below Dun Morogh’s snowy passes, a long blue loch waters a valley of wooded hills and dwarven roads. Thelsamar serves the travelers, prospectors and engineers whose work keeps the valley open.', '丹莫罗白雪覆盖的山口下，一条狭长的蓝色湖泊滋养着遍布林丘和矮人道路的谷地。塞尔萨玛为旅客、勘探者和工程师提供补给，山谷的道路也靠这些人维持畅通。'), {
    complete: true,
    overview: [L('Thelsamar sits on the western road. Its inn and the patrols on the road make it the valley’s center. Across the water, hunters gather at the Farstrider Lodge while Ironband’s crew digs among ancient ruins. The north belongs to the Stonewrought Dam, where the dwarves hold back the loch above the Wetlands.', '塞尔萨玛坐落在西岸的大路上。镇上的旅店与路上的巡逻让它成为山谷的中心。湖对岸，猎人聚在旅行者营地，铁环的队伍在古代遗迹间挖掘。北面是巨石水坝，矮人用它拦住流向湿地的湖水。'), L('The roads out matter as much as the water. The gates to Dun Morogh lead toward Ironforge. Beyond the dam, the mountain road descends through Dun Algaz to Menethil Harbor. Troggs in the passes and Dark Iron saboteurs at the dam can interrupt the work of people far beyond the valley.', '通往外地的道路与湖水同样重要。通往丹莫罗的关口朝向铁炉堡；过了大坝，山路穿过丹奥加兹，下行通往米奈希尔港。山口的穴居人和大坝上的黑铁破坏者，会让远在谷地之外的人也受到影响。')],
    history: [H(L('The older valley', '更古老的山谷'), L('Ruins east of the lake', '湖东的遗迹'), L('The ruins at Ironband’s dig preserve an earlier chapter of Khaz Modan. Ironforge sends prospectors to learn what lies beneath them.', '铁环挖掘场的遗迹见证了卡兹莫丹更早的一段历史。铁炉堡派勘探者来查明地下埋着什么。')), H(L('The dwarven kingdom', '矮人王国时期'), L('A dam above the marshes', '沼泽上方的大坝'), L('Franclorn Forgewright oversees the building of the Stonewrought Dam. The great stone wall controls the loch’s outflow to the Wetlands and carries a road across the north end.', '弗兰克罗恩·铸铁监督修建巨石水坝。巨大的石墙控制湖水流入湿地的水量，坝顶的道路横贯湖北端。')), H(L('Classic-era present', '经典旧世时期'), L('The roads and the dam come under threat', '道路和大坝受到威胁'), L('Stonesplinter troggs threaten the borders and the dig. Dark Iron dwarves move against the excavation’s supplies and bring explosives to the dam.', '碎石穴居人威胁边境与挖掘场。黑铁矮人对考古队的补给下手，还把炸药运到了大坝。'))],
    storylines: [S('lm-watch', L('The gates and the troggs', '山口与穴居人'), ['lm-stonesplinters']), S('lm-dark-iron', L('Excavation and sabotage', '考古与破坏'), ['lm-excavation', 'lm-sabotage']), S('lm-waterfront', L('Life on the loch and beyond', '湖畔内外的日常'), ['lm-silver', 'we-excavation'])],
    figureIds: ['cobbleflint', 'rugelfuss', 'ironband', 'jern', 'miran', 'franclorn', 'hinderweir', 'ashlan'], factionIds: ['mountaineers', 'league', 'stonesplinter', 'dark-iron', 'mogrosh'],
    places: [
      P('thelsamar', L('Thelsamar', '塞尔萨玛'), 33.9, 51, L('The gryphon landing serves the inn and market town on the west bank.', '狮鹫落脚点服务于西岸的旅店和集镇。')),
      P('stonewrought', L('Stonewrought Dam', '巨石水坝'), 46, 13.6, L('Hinderweir’s post on the dam above the Wetlands.', '辛德维尔驻守于湿地上方的大坝。')),
      P('ironband-dig', L('Ironband’s Excavation Site', '铁环挖掘场'), 65.9, 65.6, L('Ironband works among ruins on the east bank.', '铁环在东岸的废墟间工作。')),
      P('farstrider-lodge', L('The Farstrider Lodge', '旅行者营地'), 83.5, 65.5, L('A hunting lodge on a wooded slope above the loch.', '猎人的营房坐落在俯瞰湖泊的林坡上。'))
    ],
    relatedZoneIds: [1426, 1455, 1437], sagaIds: ['gnomeregan', 'three-hammers'], sourceIds: ['loch', 'stonewrought-dam', 'loch-troggs', 'loch-dam', 'loch-dig', 'ironforge-league', 'loch-powder', 'loch-silver', 'wet-songblade']
  });
  zone(1455, L('Ironforge', '铁炉堡'), L('Khaz Modan · Eastern Kingdoms', '卡兹莫丹 · 东部王国'), 'Capital city', L('Ironforge is a working city carved around an enormous forge. Magni rules the dwarves from its halls, and the gnomes of Gnomeregan build a life in its eastern ward.', '铁炉堡围绕一座巨大的熔炉开凿而成，城中工匠终日忙碌。麦格尼在这里统治矮人，来自诺莫瑞根的侏儒则在城东安顿下来。'), {
    complete: true,
    overview: [L('Inside the gate, the Commons gives way to a ring of workshops and halls. Smiths work beside the molten channels of the Great Forge. At the Hall of Explorers, stone and metal brought up from old ruins sit within the living mountain that the dwarves hollowed out for their city.', '穿过城门和平民区，工坊和大厅沿环形通道分布。铁匠在大锻炉流淌的熔液旁劳作。探险者大厅收藏着从古老废墟带回的岩石与金属，这座大厅本身就开凿在矮人世居的大山里。'), L('Tinker Town sounds different. Gnome workshops and the Deeprun Tram fill a ward that became a place of refuge. Farther below the public halls are older chambers. In Forever, a breach in those vaults brings a war remembered in books into Magni’s own house.', '侏儒区是另一番响动。这里曾是侏儒的避难所，如今满是工坊运作和矿道地铁往来的声音。公共大厅的地下还有更古老的密室。无限服中，那些密室遭到入侵，把史书里的战争带到了麦格尼的家门里。')],
    history: [H(L('The early kingdom', '王国早期'), L('A capital inside the mountain', '山中都城'), L('Ironforge becomes the seat of the dwarven kingdom in Dun Morogh. Under Modimus Anvilmar it holds three rival clans together.', '铁炉堡成为丹莫罗矮人王国的都城。莫迪姆斯·安威玛尔在位时，三个敌对氏族得以共处。')), H(L('War of the Three Hammers', '三锤之战'), L('The Bronzebeards hold Ironforge', '铜须守住铁炉堡'), L('Modimus’s death brings civil war. The Bronzebeards win the capital and later repel Thaurissan’s renewed attack.', '莫迪姆斯去世后爆发内战。铜须夺得都城，后来又击退了索瑞森的再次进攻。')), H(L('The Second and Third Wars', '第二次与第三次战争'), L('Allies and refugees', '盟友与难民'), L('Ironforge joins the Alliance in the Second War. Around the time of the Third War, the fall of Gnomeregan drives the surviving gnomes to the mountain capital.', '铁炉堡在第二次战争中加入联盟。第三次战争前后，诺莫瑞根陷落，幸存的侏儒来到山中都城避难。')), H(L('Classic / Forever present', '经典旧世及无限服时期'), L('Magni’s city', '麦格尼的都城'), L('Magni rules as prospectors set out from the Hall of Explorers and gnome engineers work on recovering their city. Forever brings Dark Iron raiders into the Hall of Thanes.', '麦格尼统治城中，勘探者从探险者大厅出发，侏儒工程师为夺回故乡而努力。无限服新增了黑铁袭击者闯入领主大厅的情节。'))],
    storylines: [S('if-clans', L('The throne in the mountain', '山中的王座'), ['hammers-succession', 'hammers-invasion', 'hammers-aftermath']), S('if-living', L('The workers of Ironforge', '铁炉堡的劳作者'), ['dm-exile', 'if-tram', 'gn-salvage', 'if-league', 'ds-deeps']), S('if-vaults', L('The breach below the city', '城下的入侵'), ['dm-farsen', 'dm-vaults'])],
    figureIds: ['magni', 'modimus', 'madoran', 'mekkatorque', 'castpipe', 'magellas', 'gerrig', 'farsen', 'durgen'], factionIds: ['bronzebeard', 'exiles', 'league', 'wildhammer', 'dark-iron'],
    places: [
      P('high-seat', L('The High Seat', '王座厅'), 39.1, 56.2, L('Magni holds court in the chamber off the Great Forge.', '麦格尼在大锻炉旁的大厅处理朝政。')),
      P('tinker-town', L('Tinker Town', '侏儒区'), 68.8, 49, L('Mekkatorque and the gnome workshops stand near the tram entrance.', '梅卡托克和侏儒工坊就在地铁入口附近。')),
      P('hall-of-explorers', L('Hall of Explorers', '探险者大厅'), 69, 18, L('High Explorer Magellas receives reports near the League’s collections.', '资深探险家麦格拉斯在协会藏品附近听取报告。')),
      P('great-forge', L('The Great Forge', '大锻炉'), 55.5, 47.7, L('The gryphon landing stands beside Ironforge’s central foundry.', '狮鹫落脚点就在铁炉堡中央的铸造厂旁。'))
    ],
    relatedZoneIds: [1426, 1432, 1437, 1453, 1439, 1440], sagaIds: ['three-hammers', 'gnomeregan', 'twilight'], sourceIds: ['ironforge', 'manual', 'history', 'clans', 'ironforge-league', 'gnome-data', 'deeps', 'farsen', 'incursion', 'thanes']
  });
  zone(1429, L('Elwynn Forest', '艾尔文森林'), L('Kingdom of Stormwind · Eastern Kingdoms', '暴风王国 · 东部王国'), '1–10', L('Elwynn feeds and supplies Stormwind. The forest’s abbey, farms and logging camp stay busy while kobolds take over mines and Defias thieves send stolen gold out of the woods.', '艾尔文森林为暴风城供应粮食与物资。修道院、农场和伐木场照常运作，狗头人却占领了矿井，迪菲亚盗贼也在把偷来的黄金运出森林。'), {
    complete: true,
    overview: [L('Goldshire sits where the broad roads meet. To the north, Northshire Abbey looks over vines and a quiet valley. South of town, the Maclures and Stonefields work neighboring farms. In the east, woodcutters at Eastvale supply the kingdom from a clearing beside the river.', '闪金镇位于几条大路的交会处。北边的北郡修道院俯瞰葡萄园与静谧的山谷。镇南，马科伦家和斯通菲尔德家各自经营着相邻的农场。东边的东谷伐木场位于河边一块林间空地，伐木工在此为王国供应木材。'), L('Stormwind’s walls are within reach, but the trouble comes in patches. The road west to Westfall passes Riverpaw country, the eastern bridges need guards, and Defias thieves have settled in the vineyards and old farm buildings. The roads to Redridge and the wooded country across the river toward Duskwood lead to towns trying to guard their own borders.', '暴风城的城墙近在咫尺，森林里的麻烦却分散各处。向西去西部荒野的路经过河爪豺狼人的地盘，东边的桥需要卫兵把守，迪菲亚盗贼也在葡萄园和老农舍里占了据点。前往赤脊山和河对岸暮色森林的道路，通往几座努力守住各自边境的小镇。')],
    history: [H(L('The old kingdom', '旧王国时期'), L('Settlements under the trees', '林中的聚落'), L('Human farms and forest roads grow around Stormwind. Northshire Abbey serves the Church of the Holy Light outside the city.', '暴风城周围逐渐有了人类农场和林间道路。北郡修道院是圣光教会在城外的据点。')), H(L('The First War', '第一次战争'), L('War reaches Elwynn', '战火烧到艾尔文'), L('The Horde presses through the forest toward Stormwind. When the city falls, survivors flee north.', '部落穿过森林，向暴风城进军。城破以后，幸存者向北逃亡。')), H(L('After the Second War', '第二次战争之后'), L('Home to a rebuilt capital', '重建后的都城腹地'), L('Stormwind rises again and the forest returns to the kingdom. The builders’ bitter dispute with the court eventually brings the Defias into Elwynn itself.', '暴风城重建，森林也重归王国。工匠与宫廷因工钱结下的宿怨最终把迪菲亚兄弟会带进了森林。')), H(L('Classic-era present', '经典旧世时期'), L('Small posts keep watch', '小岗哨维持治安'), L('The marshals in Goldshire and Northshire receive reports of infested mines, raids and missing guards.', '闪金镇与北郡的治安官不断接到矿洞遭占、袭击发生以及卫兵失踪的报告。'))],
    storylines: [S('el-supply', L('The mines and the people who take their gold', '矿井与夺走黄金的人'), ['el-mines', 'el-defias']), S('el-roads', L('At the edges of the patrol', '巡逻所及的边缘'), ['el-patrols', 'rr-morganth']), S('el-home', L('Farmhouses and riverside work', '农舍与河边的劳作'), ['el-families', 'el-river'])],
    figureIds: ['mcbride', 'dughan', 'garrick', 'collector', 'guard-thomas', 'theocritus', 'maybell', 'tommy-joe', 'gramma'], factionIds: ['stormwind-army', 'holy-light', 'defias', 'riverpaw'],
    places: [
      P('northshire-abbey', L('Northshire Abbey', '北郡修道院'), 48.9, 41.6, L('Marshal McBride’s post outside the abbey in the sheltered valley.', '治安官玛克布莱德驻守在幽静山谷中的修道院外。')),
      P('goldshire', L('Goldshire', '闪金镇'), 42.1, 65.9, L('Marshal Dughan’s crossroads town, beside the Lion’s Pride Inn.', '治安官杜汉驻守的路口小镇，狮王之傲旅店也在这里。')),
      P('eastvale', L('Eastvale Logging Camp', '东谷伐木场'), 81.4, 66.1, L('Supervisor Raelen’s crew cuts timber near the eastern river.', '管理员莱琳的人在东边河畔采伐木材。')),
      P('westbrook', L('Westbrook Garrison', '西泉要塞'), 24.2, 74.4, L('Deputy Rainer watches the road to Westfall from this post.', '瑞尼尔副队长在这座岗哨看守通往西部荒野的道路。'))
    ],
    relatedZoneIds: [1453, 1436, 1433, 1431], sagaIds: ['defias'], sourceIds: ['elwynn', 'stormwind', 'elwynn-mines', 'elwynn-guards', 'elwynn-collector', 'elwynn-lovers', 'elwynn-river', 'redridge-mage']
  });
  zone(1433, L('Redridge Mountains', '赤脊山'), L('Kingdom of Stormwind · Eastern Kingdoms', '暴风王国 · 东部王国'), '15–25', L('At Lake Everstill, Lakeshire looks across the water toward an old keep held by Blackrock orcs. The town’s messengers carry requests for troops along roads watched by gnolls and bandits.', '湖畔镇隔着止水湖与黑石兽人占据的旧要塞相望。镇上的信使沿着豺狼人和强盗出没的道路向外求援。'), {
    complete: true,
    overview: [L('Fishing boats and a bridge make Lakeshire look like an ordinary lakeside town. From the shore, the eye can follow the road around Everstill toward Stonewatch. Blackrock troops use that fortress. The Tower of Ilgalar, beyond the keep, is the seat of a hostile mage with gnolls in his service.', '渔船和桥梁让湖畔镇看起来只是寻常水乡。沿着湖岸望去，道路绕过止水湖，通向驻有黑石军队的石堡。要塞后方是伊尔加拉之塔，一名敌对法师驱使着手下的豺狼人。'), L('Three Corners joins the roads to Elwynn and Darkshire. Westfall’s militia is within a messenger’s reach, and Wiley the Black hears enough in Lakeshire to help its chief track VanCleef. The road north climbs into the Burning Steppes and reaches more Blackrock orcs near the mountain that gives them their name.', '三角路口把通往艾尔文森林和夜色镇的道路连在一起。信使也能赶到西部荒野的人民军营地，而黑衣威利在湖畔镇听到了有助于民兵首领追踪范克里夫的消息。北路爬上燃烧平原，来到黑石兽人得名的那座山附近，那里还有更多黑石兽人。')],
    history: [H(L('The old Redridge range', '古老的赤脊山脉'), L('The mountains once ran into green country', '山脉曾延伸到苍翠的南方'), L('During the dwarven civil war, the Dark Irons founded Thaurissan in the southern reaches of the older range. Ragnaros’s summoning helped turn the lands around Blackrock Mountain into the burned country north of present-day Lakeshire.', '矮人内战期间，黑铁矮人在旧山脉的南端建立索瑞森城。拉格纳罗斯被召唤后，黑石山周边逐渐变成如今湖畔镇以北的焦土。')), H(L('The First War', '第一次战争'), L('Orcs enter Stormwind’s borderlands', '兽人进入暴风城边境'), L('The old Horde battles into the human kingdom from the east. Redridge remains a frontier between Stormwind’s settlements and the lands beyond the mountains.', '旧部落从东边杀进人类王国。赤脊山始终是暴风城各聚落与山外土地之间的边境。')), H(L('Classic-era present', '经典旧世时期'), L('Lakeshire under pressure', '湖畔镇受到威胁'), L('The Blackrock clan holds Stonewatch, Morganth commands gnolls from Ilgalar and the magistrate has to make do with a thin defense.', '黑石氏族占领石堡，莫甘斯在伊尔加拉之塔指挥豺狼人，镇长只能靠单薄的兵力守城。'))],
    storylines: [S('rr-frontier', L('The keep across the lake', '湖对岸的要塞'), ['rr-orcs', 'rr-aid']), S('rr-tower', L('The gnolls and the tower', '豺狼人与高塔'), ['rr-morganth']), S('rr-crossroads', L('Word passing through town', '镇上传来的消息'), ['defias-investigation', 'rr-trade', 'we-excavation'])],
    figureIds: ['solomon', 'marris', 'parker', 'gath-ilzogg', 'tharilzun', 'morganth', 'fangore', 'theocritus', 'marcus', 'wiley', 'dorin'], factionIds: ['stormwind-army', 'blackrock', 'shadowhide', 'riverpaw', 'commerce-authority'],
    places: [
      P('lakeshire', L('Lakeshire', '湖畔镇'), 23.9, 44.0, L('Magistrate Solomon hears news and sends appeals from the town beside Lake Everstill.', '镇长所罗门在止水湖边听取消息，派信使外出求援。')),
      P('stonewatch-keep', L('Stonewatch Keep', '石堡要塞'), 64.5, 55.8, L('Gath’Ilzogg’s Blackrock stronghold overlooking the eastern lake.', '加塞尔佐格的黑石据点，俯瞰止水湖东部。')),
      P('ilgalar', L('Tower of Ilgalar', '伊尔加拉之塔'), 75.0, 49.5, L('Morganth commands the Shadowhide from this tower.', '莫甘斯在这座塔里指挥暗皮豺狼人。')),
      P('three-corners', L('Three Corners', '三角路口'), 10.2, 71.5, L('Guard Parker watches the junction of the roads to Elwynn, Lakeshire and Duskwood.', '卫兵派克把守着通往艾尔文森林、湖畔镇和暮色森林的交会处。'))
    ],
    relatedZoneIds: [1429, 1453, 1436, 1431, 1428, 1437], sagaIds: ['defias', 'three-hammers'], sourceIds: ['redridge', 'history', 'redridge-aid', 'redridge-westfall', 'redridge-darkshire', 'redridge-orcs', 'redridge-mage', 'redridge-gnolls', 'trail', 'redridge-trade', 'wet-songblade']
  });
  zone(1431, L('Duskwood', '暮色森林'), L('Kingdom of Stormwind · Eastern Kingdoms', '暴风王国 · 东部王国'), '18–30', L('Once called Brightwood, the forest south of Elwynn now lies under a permanent gloom. Darkshire’s lamps and the Night Watch hold the road between abandoned farms, old graves and the edge of Deadwind Pass.', '艾尔文森林以南的这片林地曾名为阳光森林，如今终年笼罩在幽暗之中。夜色镇的灯火与守夜人守护着一条道路，两旁是废弃农场、古老墓地，以及逆风小径的边缘。'), {
    complete: true,
    overview: [L('Darkshire is still a town, with an inn, a mayor and people who stand watch. Raven Hill to the west is a quieter place, with empty buildings and a cemetery where the dead have risen. Between them the roads run past farms whose owners are dead, missing or afraid to go home.', '夜色镇仍是一座有人生活的小镇，有旅店、镇长，还有人站岗。西边的乌鸦岭冷清得多，到处是空屋，墓地里还有亡者起身游荡。两地间的道路经过一些农场，主人不是已死或失踪，就是害怕回家。'), L('The darkness has more than one story in it. Jitters saw worgen appear in a mine. The dead around Raven Hill have a necromancer of their own. The Embalmer makes another kind of dead thing in his shack. Westfall, Elwynn and the Wetlands all hold pieces of those stories. The green trees at the Twilight Grove recall an older forest behind the gloom.', '阴影中藏着好几段往事。基特斯亲眼见过狼人出现在矿洞里。乌鸦岭附近的亡者与一名死灵法师有关，藏尸者又在自己的小屋里造出了另一种亡灵。西部荒野、艾尔文森林和湿地都留有这些故事的线索，黎明森林中的绿树还让人依稀看见森林从前的样子。')],
    history: [H(L('Before the gloom', '阴霾降临之前'), L('The forest south of Elwynn', '艾尔文以南的森林'), L('The country later called Duskwood was wooded farmland with two substantial settlements, Darkshire and Raven Hill.', '后来被称为暮色森林的地方，原是林间农田，有夜色镇和乌鸦岭两座较大的聚落。')), H(L('The shadow over Brightwood', '阳光森林上的阴影'), L('Darkness settles on the forest', '黑暗笼罩森林'), L('The history of neighboring Deadwind Pass and Karazhan hangs over the region. Classic’s local stories follow particular horrors inside the woods, from the dead at Raven Hill to the worgen in the mines.', '邻近的逆风小径与卡拉赞的历史给这一带留下阴影。经典旧世的本地故事记录了林中不同的恐怖事件，从乌鸦岭的亡者到矿洞里的狼人。')), H(L('The coming of the worgen', '狼人出现'), L('A trail ends at Roland’s Doom', '线索止于罗兰之墓'), L('Velinde Starsong’s journey brings the Scythe of Elune from Kalimdor. Jitters’s journal records the weapon’s rediscovery and the worgen that follow.', '维琳德·星歌从卡利姆多带来月神镰刀。基特斯的日志记录了镰刀重见天日之后，狼人如何随之出现。')), H(L('Classic-era present', '经典旧世时期'), L('A town guards itself', '小镇自行防卫'), L('The Night Watch protects Darkshire. Along the road west, old deaths and new acts of necromancy keep the place dangerous.', '守夜人保护夜色镇。在西边的道路上，过去的死亡和新近的死灵法术仍不断带来危险。'))],
    storylines: [S('du-darkshire', L('A town on watch', '守夜的小镇'), ['du-watch', 'rr-aid']), S('du-worgen', L('The mine, the farm and the graveyard', '矿洞、农场与墓地'), ['du-scythe', 'du-morbent']), S('du-hauntings', L('Three lives that ended in the wood', '三段在林中终结的人生'), ['du-ladimore', 'du-embalmer', 'du-stalvan']), S('du-dream', L('A clearing that belongs to the Dream', '通往梦境的林间空地'), ['du-grove'])],
    figureIds: ['ello', 'althea', 'velinde', 'jitters', 'sven', 'morbent', 'morgan-ladimore', 'sarah', 'abercrombie', 'stitches', 'eliza', 'stalvan', 'tilloa'], factionIds: ['night-watch', 'nightbane-worgen'],
    places: [
      P('darkshire', L('Darkshire', '夜色镇'), 71.9, 46.4, L('The mayor’s town hall is where Darkshire hears news from its outlying roads.', '镇上的议事厅汇集外围道路传来的消息。')),
      P('raven-hill', L('Raven Hill', '乌鸦岭'), 18.4, 56.4, L('Jitters keeps out of sight in the abandoned western settlement.', '基特斯躲在西部这座废弃的聚落里。')),
      P('eliza-grave', L('Eliza’s grave', '伊莉莎的坟墓'), 28, 30, L('The grave lies behind Abercrombie’s shack above Raven Hill Cemetery.', '坟墓位于乌鸦岭墓地上方、亚伯克隆比的小屋后面。')),
      P('twilight-grove', L('Twilight Grove', '黎明森林'), 45.4, 39.6, L('The portal to the Emerald Dream stands beyond the trees of the central clearing.', '穿过林中空地的树丛，就是通向翡翠梦境的传送门。'))
    ],
    relatedZoneIds: [1429, 1433, 1436, 1453, 1437, 1440], sagaIds: ['corrupted-forests'], sourceIds: ['duskwood', 'dusk-watch', 'redridge-darkshire', 'dusk-scythe', 'scythe-history', 'dusk-morbent', 'dusk-lightforge', 'dusk-ladimore', 'dusk-ring', 'dusk-ring-forever', 'dusk-embalmer', 'dusk-stalvan', 'ashenvale']
  });
  zone(1437, L('Wetlands', '湿地'), L('Khaz Modan · Eastern Kingdoms', '卡兹莫丹 · 东部王国'), '20–30', L('Menethil Harbor is a busy port at the end of a road through marshes. The road passes a buried history of dwarven ruins, Dragonmaw camps and the bridge where a fresh Dark Iron attack cuts the way north.', '穿过沼泽，道路尽头是繁忙的米奈希尔港。沿途埋着许多旧事：矮人遗迹、龙喉营地，以及一座因黑铁矮人新近发动袭击而断了北路的大桥。'), {
    complete: true,
    overview: [L('Menethil’s inn, keep and docks crowd together at the western edge of the marsh. Ships connect the town to Auberdine and Theramore. Just beyond the harbor lie the wrecks of another fleet. Inland, the road through the reeds passes diggers, soldiers and Rethiel the Greenwarden.', '米奈希尔港的旅店、城堡和码头挤在沼泽西缘。船只往来于港口与奥伯丁、塞拉摩之间。港外就有另一支舰队留下的沉船。往内陆走，穿过芦苇丛的路途经考古人员、士兵和绿色守卫者雷希耶尔的驻地。'), L('Dun Algaz carries the route up to Loch Modan. At the north end, Dun Modr guards the way across the Thandol Span to Arathi. Farther east, red dragons brood around Grim Batol in the fortress where their queen was once a prisoner. The lowland holds the remains of wars whose armies came through from several directions.', '丹奥加兹的山道通往洛克莫丹。北端的丹莫德把守萨多尔大桥，桥对面是阿拉希高地。再向东，红龙在格瑞姆巴托一带盘踞，那里曾是囚禁红龙女王的要塞。这片低地留有多场战争的遗迹，昔日各路军队曾从不同方向涌入。')],
    history: [H(L('War of the Three Hammers', '三锤之战'), L('The Wildhammers build east of Ironforge', '蛮锤在铁炉堡以东建城'), L('Khardros takes the Wildhammers to Grim Batol. Modgud’s attack leaves a taint that drives them farther north.', '卡德罗斯带领蛮锤氏族来到格瑞姆巴托。莫德古德的进攻留下腐化，迫使他们继续北迁。')), H(L('Second War', '第二次战争'), L('Grim Batol becomes a prison', '格瑞姆巴托成为牢狱'), L('The Dragonmaw hold Alexstrasza with the Demon Soul and force her flight to serve the Horde.', '龙喉氏族用恶魔之魂囚禁阿莱克丝塔萨，胁迫她的龙群为部落效力。')), H(L('After the Second War', '第二次战争之后'), L('The Dragonqueen is freed', '红龙女王获释'), L('The Demon Soul is destroyed, and the red flight retakes the fortress. Dragonmaw bands remain in the Wetlands.', '恶魔之魂被摧毁，红龙军团夺回要塞。龙喉氏族仍有部分人马留在湿地。')), H(L('Classic-era present', '经典旧世时期'), L('The port stays open while the road is fought over', '道路争夺不休，港口依然通航'), L('Menethil keeps its sea links. Dark Iron attackers hold Dun Modr, and the Dragonmaw at Angerfang build siege engines of their own.', '米奈希尔港保持海上交通。黑铁袭击者占据丹莫德，怒牙营地的龙喉兽人也在建造自己的攻城武器。'))],
    storylines: [S('we-wars', L('Grim Batol and the two land battles', '格瑞姆巴托与两处陆上战事'), ['we-grim-batol', 'we-dragonmaw', 'we-bridge']), S('we-marsh', L('The dig and the living marsh', '挖掘场与沼泽生灵'), ['we-dig', 'we-green', 'we-excavation']), S('we-harbor', L('What the sea brings to Menethil', '大海给米奈希尔港带来什么'), ['we-fleet', 'we-diplomat'])],
    figureIds: ['khardros', 'modgud', 'alexstrasza', 'stoutfist', 'nekrosh', 'motley', 'kam', 'ashlan', 'whelgar', 'rethiel', 'dorin', 'daewyn', 'fitzsimmons', 'halyndor', 'glorin', 'mikhail', 'tapoke'], factionIds: ['wildhammer', 'bronzebeard', 'dark-iron', 'dragonmaw', 'league', 'third-fleet'],
    places: [
      P('menethil', L('Menethil Harbor', '米奈希尔港'), 9.5, 59.7, L('The gryphon landing near the keep serves the port and its ships.', '城堡附近的狮鹫落脚点为港口和船只提供接驳。')),
      P('dun-modr', L('Dun Modr', '丹莫德'), 49.7, 18.2, L('Motley Garmason gathers a counterattack near the road to the Thandol Span.', '莫特雷·加玛森在通往萨多尔大桥的路边集结人手反攻。')),
      P('whelgar-dig', L('Whelgar’s Excavation Site', '维尔加挖掘场'), 38.8, 52.4, L('The prospector and his crew shelter in a cave at the dig.', '勘探者和他的队伍在挖掘场的洞穴里避难。')),
      P('greenwarden', L('The Greenwarden’s roadside', '绿色守卫者驻地'), 56.4, 40.4, L('Rethiel minds the marsh on the road east of the harbor.', '雷希耶尔在港口以东的路边照料湿地。')),
      P('grim-batol-approach', L('Approach to Grim Batol', '格瑞姆巴托入口'), 79.5, 48.4, L('Red dragonkin guard the way toward the sealed fortress.', '红色龙人看守通往封闭要塞的道路。'))
    ],
    relatedZoneIds: [1432, 1455, 1426, 1439, 1431, 1433, 1453], sagaIds: ['three-hammers'], sourceIds: ['wetlands', 'history', 'grim-history', 'wet-dragonmaw', 'wet-bridge', 'wet-dig', 'wet-fleet', 'wet-green', 'wet-excavation', 'wet-horror', 'wet-songblade', 'diplomat', 'loch-dam', 'dusk-lightforge']
  });
  zone(1453, L('Stormwind City', '暴风城'), L('Kingdom of Stormwind · Eastern Kingdoms', '暴风王国 · 东部王国'), 'Capital city', L('The human capital looks splendid after its rebuilding. The people who built it, the prisoners in its Stockade and the missing king all leave unfinished business behind its white walls.', '重建之后，人类都城看起来熠熠生辉。建造这座城市的工匠、监狱里的囚犯，还有失踪的国王，都在白色城墙背后留下了未了之事。'), {
    complete: true,
    overview: [L('The Valley of Heroes leads into the market and counting houses of the Trade District. Beyond the canals, priests work in Cathedral Square and intelligence officers work from Old Town. In the Dwarven District, workshops and the Deeprun Tram bring Ironforge into the daily life of the city.', '穿过英雄谷，就是贸易区的集市与各家账房。越过运河，教士在教堂广场服务，情报人员则在旧城区办公。矮人区的工坊和矿道地铁，让铁炉堡与都城的日常生活密不可分。'), L('Stormwind Keep stands apart from the shops and the prison beside the canal. Yet news travels between all three. A letter from Westfall reaches the city architect, the warden remembers a visitor and the case follows an assassin to a garden inside the keep.', '暴风要塞远离商铺及运河边的监狱，但消息在三地往来。一封来自西部荒野的信交到了城市建筑师手中，监狱长想起一名访客，调查人员追着一名刺客到了要塞的花园。')],
    history: [H(L('The First War', '第一次战争'), L('The old city falls', '旧城陷落'), L('The Horde takes Stormwind. Llane dies and Lothar leads Varian and other survivors north to Lordaeron.', '部落攻占暴风城，莱恩身死，洛萨带着瓦里安和其他幸存者北逃洛丹伦。')), H(L('After the Second War', '第二次战争之后'), L('Varian and the builders return', '瓦里安与工匠归来'), L('The Stonemasons’ Guild rebuilds the capital. The payment dispute that follows ends in a riot, Tiffin’s death and the founding of the Defias Brotherhood.', '石工协会重建都城。随后的欠薪纠纷引发骚乱，蒂芬身亡，迪菲亚兄弟会由此成立。')), H(L('Before the Classic present', '经典旧世之前'), L('The king goes missing', '国王失踪'), L('Varian disappears on the way to Theramore. Anduin takes the crown, with Bolvar as regent and Katrana Prestor at court.', '瓦里安在前往塞拉摩的途中失踪。安度因继位，伯瓦尔摄政，卡特拉娜·普瑞斯托也身在宫廷。')), H(L('Classic-era present', '经典旧世时期'), L('A case comes in from Westfall', '来自西部荒野的案子'), L('VanCleef’s letter leads from the Stockade to SI:7 and Stormwind Keep. The city also sends the Missing Diplomat investigation through Menethil Harbor.', '范克里夫的信将调查从监狱引向军情七处和暴风要塞。都城也派人到米奈希尔港追查失踪的使节。'))],
    storylines: [S('sw-kingdom', L('The fall, the rebuilding and the regency', '陷落、重建与摄政'), ['sw-fall', 'defias-rebuilding', 'defias-rupture', 'sw-regency']), S('sw-conspiracy', L('From the Stockade to the keep', '从监狱到要塞'), ['defias-letter', 'defias-visitor', 'defias-court', 'defias-report']), S('sw-streets', L('The city at work', '城中的日常劳作'), ['if-tram', 'gn-shredder', 'sw-gatehouse']), S('sw-spoiler', L('Spoiler · the court’s secret', '剧透 · 宫廷的秘密'), ['defias-prestor'])],
    figureIds: ['llane', 'lothar', 'garona', 'tiffin', 'varian', 'anduin', 'bolvar', 'katrana', 'vancleef', 'baros', 'bazil', 'thelwater', 'shaw', 'trias', 'tyrion', 'spybot', 'lescovar', 'marzon', 'marcus', 'shoni'], factionIds: ['stormwind-army', 'holy-light', 'nobles', 'stonemasons', 'si7', 'defias', 'exiles'],
    places: [
      P('city-hall', L('City Hall', '城市大厅'), 57.6, 47.8, L('Baros Alexston works off Cathedral Square in the city he helped rebuild.', '巴隆斯·阿历克斯顿曾参与重建暴风城，如今在教堂广场旁工作。')),
      P('stockade', L('The Stockade', '暴风城监狱'), 51.6, 69.3, L('Warden Thelwater stands by the prison door on the canal.', '典狱官塞尔沃特站在运河边的牢门旁。')),
      P('si7-barracks', L('SI:7 barracks', '军情七处营房'), 78.3, 70.7, L('Mathias Shaw works in the barracks in Old Town.', '马迪亚斯·肖尔在旧城区的这处营房办公。')),
      P('trias-cheese', L('Trias’ Cheese', '提亚斯奶酪店'), 66.1, 74.0, L('Elling Trias keeps shop in the Trade District.', '埃林·提亚斯在贸易区经营这家店。')),
      P('keep-garden', L('Stormwind Keep garden', '暴风要塞花园'), 73.1, 35.3, L('Tyrion waits in the garden where the operation against Lescovar takes place.', '泰里恩在这里等候，针对莱斯科瓦的行动也在此展开。'))
    ],
    relatedZoneIds: [1429, 1436, 1433, 1455, 1437], sagaIds: ['defias', 'gnomeregan', 'blackrock-brood'], sourceIds: ['stormwind', 'manual', 'defias', 'letter', 'curious-visitor', 'shadow-past', 'attack', 'court-audience', 'court-reveal', 'diplomat', 'ironforge', 'gnome-shoni', 'stormwind-goods']
  });
  zone(1440, L('Ashenvale', '灰谷'), L('Northern Kalimdor', '卡利姆多北部'), '18–30', L('Ashenvale is the night elves’ old forest and a border of the new Horde. Night elf patrols and Warsong lumber crews share its roads with furbolgs, satyrs and a cult hidden under the shore.', '灰谷是暗夜精灵的古老森林，也是新部落的边境。暗夜精灵的巡逻队和战歌氏族的伐木队在此往来，林中还有熊怪和萨特，海岸下藏着邪教徒。'), {
    complete: true,
    overview: [L('Astranaar sits on a narrow island between bridges, a sheltered town in a forest people still fight over. Maestra’s Post watches the northwestern road toward Darkshore. On the far side, Splintertree Post supplies the Warsong, while Zoram’gar is a small Horde foothold on the coast.', '阿斯特兰纳坐落在两座桥之间的狭长岛上，藏身于一片战事未歇的森林中。迈斯特拉岗哨监视通往黑海岸的西北道路。森林另一侧，碎木岗哨为战歌氏族提供补给，佐拉姆加则是部落在海岸边的小据点。'), L('The quiet under the trees ends abruptly at the lumber camp or a satyr’s clearing. The coast hides the flooded halls of Blackfathom Deeps. To the south, the Talondeep Path reaches Stonetalon. On foot, the forest’s roads tie these places together long before anyone sees how different their troubles are.', '走到伐木场或萨特盘踞的空地，林间的宁静便戛然而止。海岸下藏着黑暗深渊被水淹没的殿堂，南边的石爪小径通向石爪山脉。徒步沿森林道路走过，首先感受到的是这些地方离得很近，到了才知道各自的麻烦大不相同。')],
    history: [H(L('The old forest', '古老的森林'), L('Night elf homeland', '暗夜精灵的故乡'), L('The night elves hold this wooded country across the millennia after the Sundering. Bough Shadow keeps a passage into the Emerald Dream.', '大分裂之后，暗夜精灵世代守着这片森林，那里还有一条从大树荫通往翡翠梦境的通道。')), H(L('Third War', '第三次战争'), L('Trees for a new Horde', '为新部落砍伐木材'), L('The Warsong cut timber and fight the Sentinels. Cenarius intervenes, and Grom and his warriors turn to Mannoroth’s blood to kill him.', '战歌氏族砍伐森林，与哨兵交战。塞纳留斯出面干预，格罗姆和战士们饮下玛诺洛斯之血，将他杀死。')), H(L('Classic-era present', '经典旧世时期'), L('Outposts on both sides', '双方各守岗哨'), L('The night elves hold Astranaar and their other posts. The Horde supplies the lumber camp from the east and watches the shore from Zoram’gar. The Twilight’s Hammer and naga occupy Blackfathom Deeps.', '暗夜精灵仍控制阿斯特兰纳和其他据点。部落从东边为伐木场送物资，在佐拉姆加监视海岸。暮光之锤与纳迦占据了黑暗深渊。'))],
    storylines: [S('av-timber', L('The Warsong in the forest', '林中的战歌氏族'), ['av-cenarius', 'av-warsong']), S('av-woods', L('The forest’s own communities', '世居林中的族群'), ['av-raene', 'av-satyrs', 'du-scythe', 'av-standstill', 'av-necklace']), S('av-coast', L('Beneath the Zoram Strand', '佐拉姆海岸之下'), ['tw-sapphires', 'tw-shrine'])],
    figureIds: ['grom', 'cenarius', 'mannoroth', 'locke', 'raene', 'krolg', 'ran', 'dartol', 'velinde', 'melyria', 'mastok', 'faldreas', 'maliynn', 'jeneu', 'thaelrid', 'kelris', 'akumai'], factionIds: ['sentinels', 'silverwing', 'warsong', 'ashen-furbolgs', 'satyrs', 'earthen-ring', 'argent-dawn', 'twilight', 'blackfathom-naga'],
    places: [
      P('astranaar', L('Astranaar', '阿斯特兰纳'), 34.5, 48, L('The hippogryph landing serves the night elf town and its forest patrols.', '角鹰兽落脚点服务于暗夜精灵小镇及其林间巡逻队。')),
      P('splintertree', L('Splintertree Post', '碎木岗哨'), 73.3, 61.7, L('The Horde flight post and supply base for the lumber camp.', '部落的飞行站，也是向伐木营地供给物资的据点。')),
      P('zoramgar', L('Zoram’gar Outpost', '佐拉姆加前哨站'), 11.6, 34.3, L('Je’neu Sancrea investigates what the naga are doing farther up the strand.', '耶努萨克雷调查纳迦在海岸更北边的活动。')),
      P('blackfathom', L('Blackfathom Deeps', '黑暗深渊'), 14, 15, L('Caves in the northwestern headland lead to the submerged temple.', '西北岬角的洞穴通往沉入水下的神殿。'))
    ],
    relatedZoneIds: [1439, 1442, 1455, 1431], sagaIds: ['corrupted-forests', 'twilight'], sourceIds: ['ashenvale', 'ashen-third-war', 'ashen-warsong', 'ashen-raene', 'ashen-satyrs', 'st-standstill', 'ashen-necklace', 'bfd-classic', 'bfd-kelris', 'bfd-sapphires', 'scythe-history', 'howling-vale']
  });
  zone(1442, L('Stonetalon Mountains', '石爪山脉'), L('Central Kalimdor', '卡利姆多中部'), '15–27', L('In Stonetalon, pine forests and cliff paths hem in logging camps, tauren refuges and a burned valley. People living in the mountains fight to keep their homes and help the damaged places grow again.', '石爪山脉的松林和险峻小路之间，分布着伐木场、牛头人的避难所，以及一座烧焦的山谷。山民一面保卫家园，一面想办法让受损的土地重新长出草木。'), {
    complete: true,
    overview: [L('Sun Rock Retreat is tucked into narrow cliffs. Its tauren have a place to bring news and survivors from the settlements below. The night elves’ refuge is high on Stonetalon Peak, near a sacred grove. Between them, cutting machines and lumber crews spread along Windshear Crag.', '烈日石居藏在陡峭的夹谷里，住在山下的人可以把幸存者与消息带给这里的牛头人。暗夜精灵的避难所则深居石爪峰高处，紧邻一片圣林。两地之间，伐木机器和工人沿狂风峭壁越聚越多。'), L('The Talondeep Path opens toward Ashenvale. The road down the other side runs past tauren homes toward the Barrens. West of Sun Rock, the dead trunks of the Charred Vale and the harpies nesting among them mark how different the valleys can look in the space of one mountain crossing.', '石爪小径通向灰谷，另一侧的下山路经过牛头人的村落，通往贫瘠之地。烈日石居以西，焦炭谷只剩枯死的树干和在其间筑巢的鹰身人。翻过一道山岭，山谷的景象就变得截然不同。')],
    history: [H(L('The older mountain country', '山区的往昔'), L('High groves and valley homes', '高处的圣林与谷底的家园'), L('Stonetalon Peak is sacred to both the night elves and the tauren. Night elf caretakers hold the peak, and tauren villages and paths occupy the valleys below.', '石爪峰对暗夜精灵和牛头人都有神圣的意义。暗夜精灵看护者留在峰顶，下方谷地是牛头人的村庄与道路。')), H(L('Classic-era conflict', '经典旧世的冲突'), L('Settlements and forests come under attack', '聚落与森林遇袭'), L('Grimtotem raiders strike Camp Aparaje as Venture Company logging expands in Windshear Crag.', '恐怖图腾的袭击者突袭阿帕拉耶营地，与此同时，风险投资公司扩大了在狂风峭壁的伐木作业。')), H(L('Classic-era present', '经典旧世时期'), L('A retreat and a recovery', '避难与恢复'), L('The night elves watch the peak and the Bloodfury’s spread. The tauren of Sun Rock Retreat shelter survivors and gather seeds for damaged ground.', '暗夜精灵守住峰顶，警惕血怒鹰身人扩张。烈日石居的牛头人收留幸存者，并寻找能让受损土地重新长出草木的种子。'))],
    storylines: [S('st-homes', L('The people of Camp Aparaje', '阿帕拉耶营地的人'), ['st-kaya']), S('st-works', L('The road from Ashenvale and the logging camps', '通往伐木场与灰谷的道路'), ['av-standstill', 'st-logging', 'st-supplies']), S('st-recovery', L('The vale and what can grow there', '烧焦的山谷还能长出什么'), ['st-vale', 'st-seeds'])],
    figureIds: ['makaba', 'kaya', 'tammra', 'gerenzo', 'ziz', 'albagorm', 'maggran', 'bloodfury-ripper', 'faldreas', 'faralia'], factionIds: ['sentinels', 'grimtotem', 'venture', 'bloodfury'],
    places: [
      P('sun-rock', L('Sun Rock Retreat', '烈日石居'), 45.2, 59.8, L('The wind rider landing serves the tauren refuge between the cliffs.', '双足飞龙落脚点服务于这座藏在峭壁间的牛头人避难所。')),
      P('stonetalon-peak', L('Stonetalon Peak', '石爪峰'), 36.4, 7.2, L('The night elves’ hippogryph post sits high above the valleys.', '暗夜精灵的角鹰兽岗哨高踞在诸多山谷之上。')),
      P('ziz-workshop', L('Ziz Fizziks’s workshop', '菲兹克斯的工坊'), 59, 62.6, L('A former Venture Company engineer watches the logging operation from this side of the crag.', '一名前风险投资公司工程师在山崖这一侧观察伐木作业。')),
      P('charred-vale', L('The Charred Vale', '焦炭谷'), 30.8, 61.9, L('The Bloodfury Ripper prowls this part of the burned valley.', '血怒撕裂者在这片焦黑的山谷中游荡。'))
    ],
    relatedZoneIds: [1440, 1439], sagaIds: ['corrupted-forests'], sourceIds: ['stonetalon', 'st-kaya', 'st-logging', 'st-vale', 'st-seeds', 'st-new-life', 'st-standstill', 'st-supplies']
  });
  zone(1416, L('Alterac Mountains', '奥特兰克山脉'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '30–40', L('Ogres hold the ruined capital of Alterac, while spies in the mountain towns keep the ambitions of its old nobility alive.', '食人魔占据了奥特兰克的都城废墟，而山间城镇里的密探，仍在为旧日贵族的野心奔走。'), {
    complete: true,
    overview: [L('The old kingdom survives in its walls, farmsteads and signet rings. The Crushridge ogres occupy the ruins, while the {Syndicate} operates out of Strahnbrad and reaches down toward Hillsbrad.', '古老王国留下了城墙、农舍和印戒。破碎岭食人魔占据都城废墟，{辛迪加}则以斯坦恩布莱德为据点，把势力伸向山下的希尔斯布莱德。'), L('The fallen kingdom’s reach can be read in the papers its agents carry. Even after the loss of its throne, the people organizing in its name are a concern as far away as Southshore and Stromgarde.', '从密探携带的文件里，仍可看见这个亡国的势力范围。王座早已失去，但以它的名义行事的人，依然让远至南海镇和激流堡的守军放心不下。')],
    history: [
      H(L('Second War', '第二次战争'), L('A king makes a bargain', '国王与部落达成交易'), L('King Aiden Perenolde betrays the Alliance. The defeat of his kingdom leaves its nobles without a throne to serve.', '艾登·匹瑞诺德国王背叛联盟。王国败亡，贵族从此失去了效忠的王座。')),
      H(L('Classic era', '经典旧世时期'), L('Two heirs to the ruins', '废墟里的两股势力'), L('The Crushridge settle in the capital’s ruins. The Syndicate claims the legacy of the old nobility from other parts of the mountains.', '破碎岭食人魔在都城废墟定居。辛迪加则从山中别处活动，以旧日贵族的继承人自居。'))
    ],
    storylines: [S('alterac-inheritance', L('The lords who lost a kingdom', '失去王国的贵族'), ['al-papers', 'al-rings'])],
    figureIds: ['thrall', 'henry-maleb'], factionIds: ['syndicate'],
    places: [
      { id: 'alterac-ruins', name: L('Ruins of Alterac', '奥特兰克废墟'), text: L('The old capital’s walls now shelter Crushridge ogres.', '旧都的城墙如今庇护着破碎岭食人魔。') },
      { id: 'strahnbrad', name: L('Strahnbrad', '斯坦恩布莱德'), text: L('Syndicate spies and wizards gather in the mountain town.', '辛迪加密探和巫师聚集在这座山间城镇。') },
      { id: 'dalaran-crater', name: L('Dalaran', '达拉然'), text: L('Dalaran’s surviving mages keep the ruined city behind a violet barrier.', '达拉然幸存的法师用紫色屏障围住了城市废墟。') }
    ],
    relatedZoneIds: [1424, 1417], sagaIds: ['fallen-lordaeron'], sourceIds: ['al-classic', 'al-kingdom', 'al-plans', 'al-rings']
  });

  zone(1417, L('Arathi Highlands', '阿拉希高地'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '30–40', L('In the old lands of Arathor, Stromgarde’s survivors hope to recover their city while the Horde builds a home out of a former prison.', '在古老的阿拉索故地，激流堡的幸存者希望收复家园，部落则把昔日的囚营建成新的据点。'), {
    complete: true,
    overview: [L('Refuge Pointe shelters the Alliance in a fold in the highlands. Hammerfall keeps the memory of the orcs’ imprisonment and escape. Stromgarde, where the Syndicate and Boulderfist ogres occupy parts of the city, shows how much land its old defenders have lost.', '避难谷地藏在山间，庇护着联盟。落锤镇保留着兽人被囚与脱困的记忆。辛迪加和石拳食人魔占据了激流堡的部分城区，让人看清旧日守军已经失去了多少土地。'), L('The danger to Hammerfall comes from nearby hills as well as the Alliance frontier. Drum Fel finds the Witherbark trolls and Boulderfist ogres cooperating against the outpost.', '落锤镇既面对联盟，也得提防附近山地。德拉姆·费尔发现枯木巨魔与石拳食人魔联起手来，准备把部落赶出高地。')],
    history: [
      H(L('Arathor', '阿拉索时期'), L('The old human kingdom', '古老的人类王国'), L('Strom was the home of Arathor. Stromgarde carried on the name and fought for the Alliance in the Second War.', '斯特罗姆曾是阿拉索的都城。激流堡承继其名，在第二次战争中为联盟而战。')),
      H(L('After the Second War', '第二次战争之后'), L('From camp to outpost', '囚营变成前哨'), L('The eastern settlement becomes a camp for captive orcs. The Horde later holds it and calls it Hammerfall in memory of Orgrim Doomhammer.', '东部聚落被改成关押兽人的营地。部落随后占领这里，为纪念奥格瑞姆·毁灭之锤，将它命名为落锤镇。'))
    ],
    storylines: [S('ar-strom', L('The struggle for Stromgarde', '争夺激流堡'), ['ar-badges']), S('ar-hammerfall', L('The defense of Hammerfall', '落锤镇的防卫'), ['ar-call'])],
    figureIds: ['thrall', 'nials', 'drum-fel'], factionIds: ['horde', 'syndicate'],
    places: [
      P('refuge-pointe', L('Refuge Pointe', '避难谷地'), 45.8, 46.1, L('The Alliance keeps its refuge in a sheltered hollow north of Stromgarde.', '联盟在激流堡以北一处隐蔽山谷内立足。')),
      P('hammerfall', L('Hammerfall', '落锤镇'), 73.1, 32.6, L('The former internment camp has become a Horde outpost.', '昔日的兽人囚营已成为部落前哨。')),
      P('stromgarde', L('Stromgarde Keep', '激流堡'), 26.2, 65.1, L('Rival groups occupy separate parts of the old stronghold. The Syndicate operates in this part of the ruins.', '几股势力各自占据了这座旧要塞的一部分。辛迪加就在这片废墟里活动。'))
    ],
    relatedZoneIds: [1416, 1424, 1425, 1437], sagaIds: ['fallen-lordaeron'], sourceIds: ['ar-classic', 'ar-badges', 'ar-call', 'ar-lords']
  });

  zone(1418, L('Badlands', '荒芜之地'), L('Khaz Modan · Eastern Kingdoms', '卡兹莫丹 · 东部王国'), '35–45', L('Between dry canyons and makeshift camps, excavators in the Badlands uncover an archive left by the titans.', '在干旱峡谷与临时营地之间，荒芜之地的考古队发现了泰坦留下的档案。'), {
    complete: true,
    overview: [L('Kargath gives the Horde a foothold in the west. On the other side of the badlands, black dragon whelps roam the ravine of Lethlor. An excavation at Uldaman opens into passages far larger than the camp above them.', '卡加斯是部落在西部的据点。荒地另一侧，黑色雏龙在莱瑟罗峡谷出没。奥达曼的挖掘场通向一片远比地面营地庞大的地下通道。'), L('The Explorers’ League has people in the ruins who need to come home. What remains below includes records about the beginnings of the earthen, a question that matters as much in Ironforge as in the dig.', '探险者协会还有队员滞留在遗迹里，等着回家。地下保存着关于土灵起源的记录，此事牵动着挖掘场，也同样牵动着铁炉堡。')],
    history: [
      H(L('Age of the titans', '泰坦时代'), L('An archive beneath the hills', '群山之下的档案库'), L('The facility at Uldaman preserves a titan record about the earthen long after its makers are gone.', '建造者离去许久之后，奥达曼仍保存着泰坦留下的土灵记录。')),
      H(L('Classic era', '经典旧世时期'), L('The doors open again', '石门再度开启'), L('Dwarven expeditions uncover rooms and mechanisms. Troggs and other occupants make the investigation dangerous.', '矮人考察队发现了封存的石室和机关，穴居人等盘踞者让调查险象环生。'))
    ],
    storylines: [S('ba-uldaman', L('Under the excavation', '挖掘场之下'), ['ba-lost', 'ba-discs'])],
    figureIds: [], factionIds: ['league', 'dark-iron'],
    places: [
      { id: 'kargath', name: L('Kargath', '卡加斯'), text: L('A Horde outpost at the western edge of the basin.', '位于盆地西缘的部落前哨。') },
      { id: 'uldaman', name: L('Uldaman', '奥达曼'), text: L('The excavation gives way to old stone halls and a sealed record chamber.', '穿过挖掘场，便是古老的石厅与封闭的档案室。') },
      { id: 'lethlor', name: L('Lethlor Ravine', '莱瑟罗峡谷'), text: L('Black whelps roam this eastern canyon.', '黑色雏龙在东部这条峡谷出没。') }
    ],
    relatedZoneIds: [1432, 1427, 1426], sagaIds: [], sourceIds: ['ba-classic', 'ba-lost', 'ba-discs']
  });

  zone(1419, L('Blasted Lands', '诅咒之地'), L('Southern Eastern Kingdoms', '东部王国南部'), '45–55', L('The Dark Portal stands above a demon-haunted crater. At the edge of the scar, Nethergarde keeps watch and a dead soldier tries to free his men.', '黑暗之门立在恶魔出没的巨坑上方。焦土边缘，守望堡仍在警戒，一名死去的士兵则试图解救自己的部下。'), {
    complete: true,
    overview: [L('The orcs first came into Azeroth through the Dark Portal. In Classic the gateway stands silent above its crater and the land around it remains dangerous, long after the armies that first crossed it have left.', '兽人最初经由黑暗之门进入艾泽拉斯。经典旧世时期，大门仍寂静地立在巨坑上方，最初穿越它的军队早已远去，周围却依然险恶。'), L('Nethergarde is an Alliance watch on the northern heights. Farther south, demons bind their victims to stones, leaving a job that a soldier’s death did not end.', '联盟在北部高地的守望堡警戒。更往南，恶魔把受害者束缚在石头上。一名士兵虽然早已死去，仍没放下这件事。')],
    history: [
      H(L('First War', '第一次战争'), L('The way opens', '通道开启'), L('Medivh and Gul’dan help open the gateway that brings the orc Horde into Azeroth.', '麦迪文与古尔丹促成黑暗之门开启，兽人部落由此进入艾泽拉斯。')),
      H(L('After the Second War', '第二次战争之后'), L('A fortress keeps watch', '堡垒守望'), L('The Alliance builds Nethergarde to watch the rift after the original portal is destroyed.', '最初的黑暗之门被毁后，联盟建起守望堡，监视留下的裂隙。'))
    ],
    storylines: [S('bl-fallen', L('The dead soldier and his men', '阵亡的战士与他的部下'), ['bl-stones', 'bl-demon'])],
    figureIds: ['medivh'], factionIds: ['stormwind-army'],
    places: [
      { id: 'nethergarde', name: L('Nethergarde Keep', '守望堡'), text: L('The Alliance garrison watches the approaches to the portal from the north.', '联盟驻军从北面监视通往黑暗之门的道路。') },
      { id: 'dark-portal', name: L('The Dark Portal', '黑暗之门'), text: L('The stone gateway stands in the crater left by the old wars.', '石门立在昔日战争留下的巨坑中。') },
      { id: 'tainted-scar', name: L('The Tainted Scar', '腐烂之痕'), text: L('Demons occupy the blasted hollow in the southwest.', '恶魔盘踞在西南方满目疮痍的谷地。') }
    ],
    relatedZoneIds: [1435, 1430, 1453], sagaIds: [], sourceIds: ['bl-classic', 'bl-grace', 'bl-stones', 'bl-demon', 'portal-history', 'manual']
  });

  zone(1420, L('Tirisfal Glades', '提瑞斯法林地'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '1–10', L('The forests around Lordaeron’s ruined capital are the first home of many Forsaken. They share the old heartland with enemies who remember the kingdom very differently.', '洛丹伦王城废墟周围的林地，是许多被遗忘者最初的家园。昔日王国的腹地如今还有敌人出没，各方对洛丹伦的记忆大不相同。'), {
    complete: true,
    overview: [L('Deathknell is a village of crypts and ruined homes. Brill is a working Forsaken settlement close to the capital, while the Scarlet Monastery is a reminder that armed survivors also claim the land.', '丧钟镇遍布墓穴和残破的房屋。布瑞尔是都城附近仍在运转的被遗忘者聚落，血色修道院则让人想起，拿起武器的幸存者也对这片土地有所主张。'), L('The people in Brill fight remnants of the Scourge and the Scarlet Crusade. Their apothecaries also work on a plague of their own, a project that links village laboratories to Undercity.', '布瑞尔的居民与天灾残部和血色十字军交战。镇上的药剂师也在研制自己的瘟疫，把村镇里的实验室与幽暗城联结起来。')],
    history: [
      H(L('Third War', '第三次战争'), L('The king’s city falls', '王都陷落'), L('Arthas returns to Lordaeron, kills King Terenas and brings ruin to the capital he was meant to inherit.', '阿尔萨斯回到洛丹伦，杀死泰瑞纳斯国王，使本该由他继承的都城沦为废墟。')),
      H(L('After the Third War', '第三次战争之后'), L('The Forsaken take root', '被遗忘者扎根'), L('Sylvanas and the undead who follow her claim the city ruins. In the surrounding countryside they find enemies as well as others newly freed from the Scourge.', '希尔瓦娜斯和追随她的亡灵夺取王城废墟。他们在周边乡间遇到了敌人，也遇到更多刚摆脱天灾军团的同胞。'))
    ],
    storylines: [S('ti-allegiances', L('A new allegiance in the old kingdom', '旧王国里的新归属'), ['ti-awakening', 'ti-scarlet']), S('ti-plague', L('The laboratory at Brill', '布瑞尔的实验室'), ['ti-plague'])],
    figureIds: ['sylvanas', 'arthas', 'faranell', 'johaan'], factionIds: ['forsaken', 'scourge', 'scarlet-crusade', 'royal-apothecary'],
    places: [
      { id: 'deathknell', name: L('Deathknell', '丧钟镇'), text: L('Newly awakened undead emerge from the crypts of the ruined village.', '新近苏醒的亡灵从废弃村庄的墓穴里走出来。') },
      { id: 'brill', name: L('Brill', '布瑞尔'), text: L('Forsaken officers and apothecaries work out of the town near the capital.', '被遗忘者的军官与药剂师在靠近都城的镇上办事。') },
      { id: 'scarlet-monastery', name: L('Scarlet Monastery', '血色修道院'), text: L('The Scarlet Crusade holds a fortified monastery in the northeastern hills.', '血色十字军在东北部的山丘上据守这座设防的修道院。') }
    ],
    relatedZoneIds: [1458, 1421, 1422, 1423], sagaIds: ['fallen-lordaeron'], sourceIds: ['ti-classic', 'ti-awakening', 'ti-scarlet', 'ti-plague', 'manual', 'arthas-history']
  });

  zone(1421, L('Silverpine Forest', '银松森林'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '10–20', L('From the Sepulcher, the Forsaken push into a forest where the homes of the living and the stronghold of a mage have come under the shadow of the worgen.', '被遗忘者从瑟伯切尔深入森林。那里，活人的村庄与法师的要塞都笼罩在狼人的阴影之下。'), {
    complete: true,
    overview: [L('The Sepulcher is the Forsaken’s foothold on the road south. At Pyrewood, the villagers change after sundown, while the old keep above them is held by Archmage Arugal.', '瑟伯切尔是被遗忘者在南下道路上的据点。焚木村的居民日落后就会变身，村子上方的旧城堡则落入大法师阿鲁高手中。'), L('The Greymane Wall closes the road into Gilneas. On this side of the wall, the Forsaken investigate a curse that has already undone a human community.', '格雷迈恩之墙封住了通往吉尔尼斯的道路。在墙的这一侧，被遗忘者正调查一种已经摧毁了一个人类村落的诅咒。')],
    history: [
      H(L('Third War', '第三次战争'), L('A desperate defense', '孤注一掷的防御'), L('Arugal unleashes worgen against the Scourge. They soon threaten the people he hoped to protect.', '阿鲁高放出狼人抵御天灾军团。很快，狼人就威胁到了他原本想保护的人。')),
      H(L('Classic era', '经典旧世时期'), L('A forest under watch', '受到监视的森林'), L('The Forsaken hold the Sepulcher, while Arugal commands worgen from Shadowfang Keep.', '被遗忘者据守瑟伯切尔，阿鲁高则在影牙城堡指挥狼人。'))
    ],
    storylines: [S('sp-curse', L('The trouble at Pyrewood', '焚木村的祸事'), ['sp-shackles', 'sp-keep'])],
    figureIds: ['arugal'], factionIds: ['forsaken', 'royal-apothecary'],
    places: [
      { id: 'sepulcher', name: L('The Sepulcher', '瑟伯切尔'), text: L('The Forsaken keep a garrison among the old graves.', '被遗忘者在昔日的墓地间驻扎守军。') },
      { id: 'pyrewood', name: L('Pyrewood Village', '焚木村'), text: L('Human by day, the villagers become Moonrage worgen at night.', '居民白天看似人类，夜晚则变成月怒狼人。') },
      { id: 'shadowfang', name: L('Shadowfang Keep', '影牙城堡'), text: L('The old stronghold houses Arugal and his worgen.', '这座旧要塞如今住着阿鲁高和他的狼人。') }
    ],
    relatedZoneIds: [1420, 1424, 1458, 1431], sagaIds: ['fallen-lordaeron'], sourceIds: ['sp-classic', 'sp-shackles', 'sp-keep']
  });

  zone(1422, L('Western Plaguelands', '西瘟疫之地'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '51–58', L('The grain fields of Lordaeron still stand around Andorhal. With the granaries ruined and Caer Darrow given over to necromancers, the Argent Dawn fights to contain what keeps spreading from them.', '洛丹伦的田地依然环绕着安多哈尔。粮仓荒废，凯尔达隆落入死灵法师之手，银色黎明奋力遏制仍在蔓延的瘟疫。'), {
    complete: true,
    overview: [L('Andorhal once sent grain across Lordaeron. Now the farms nearby have their own plague cauldrons, and the camps to the west and south send investigators to learn what is feeding them.', '安多哈尔曾把谷物运往洛丹伦各处。如今附近农场里架起了瘟疫之锅，西面与南面的营地派人来查看锅里究竟有什么。'), L('There are two fortified centers beyond the farms. Scarlet soldiers still hold Hearthglen. Under the ruined keep on Caer Darrow lies Scholomance, a school of necromancy.', '田野之外，还有两处堡垒。血色十字军依然控制壁炉谷。湖上，往日辉煌的凯尔达隆已成废墟，要塞地下是教授死灵法术的通灵学院。')],
    history: [
      H(L('Third War', '第三次战争'), L('The grain carries the plague', '谷物带来瘟疫'), L('The Scourge uses Lordaeron’s grain supply to spread the plague among the living. Andorhal is one of the centers of the disaster.', '天灾军团利用洛丹伦的粮食供应，把瘟疫传给活人。安多哈尔是这场灾难的中心之一。')),
      H(L('Classic era', '经典旧世时期'), L('The plague outlasts the kingdom', '瘟疫在王国覆灭后仍在蔓延'), L('The Argent Dawn studies the cauldrons and confronts the Scourge in a land still dotted with farms and old fortresses.', '银色黎明调查瘟疫之锅，在仍遍布农场与旧堡垒的土地上对抗天灾军团。'))
    ],
    storylines: [S('wp-contagion', L('What keeps the plague spreading', '瘟疫为何仍在蔓延'), ['wp-cauldrons', 'wp-araj']), S('wp-family', L('The Highlord of Hearthglen', '壁炉谷的大领主'), ['ep-mementos', 'wp-order'])],
    figureIds: ['tirion', 'taelan', 'araj'], factionIds: ['scourge', 'argent-dawn', 'scarlet-crusade'],
    places: [
      { id: 'andorhal', name: L('Andorhal', '安多哈尔'), text: L('The old grain hub is a ruined town held by the Scourge and its lich, Araj the Summoner.', '昔日的粮食集散地已成废墟，由天灾军团及其巫妖召唤者阿拉基占据。') },
      { id: 'felstone', name: L('Felstone Field', '费尔斯通农场'), text: L('Its plague cauldron becomes an early subject of the investigation.', '农场里的瘟疫之锅是最先受到调查的几口之一。') },
      { id: 'scholomance', name: L('Scholomance', '通灵学院'), text: L('The school beneath Caer Darrow trains the Scourge’s necromancers.', '凯尔达隆地下的学校为天灾军团培养死灵法师。') },
      { id: 'hearthglen', name: L('Hearthglen', '壁炉谷'), text: L('A fortified Scarlet town where Taelan Fordring serves as Highlord.', '血色十字军据守的城镇，由大领主泰兰·弗丁坐镇。') }
    ],
    relatedZoneIds: [1423, 1420, 1458, 1424], sagaIds: ['fallen-lordaeron'], sourceIds: ['wp-classic', 'wp-cauldrons', 'wp-felstone', 'wp-araj', 'wp-order', 'arthas-history', 'ep-family']
  });

  zone(1423, L('Eastern Plaguelands', '东瘟疫之地'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '53–60', L('Little living country remains between the burned streets of Stratholme and the chapel where the Argent Dawn still gathers supplies and testimony.', '从斯坦索姆焚毁的街巷到仍在收集物资与消息的圣光之愿礼拜堂，沿路能见到的生机已寥寥无几。'), {
    complete: true,
    overview: [L('The road passes ruined towns, Scourge towers and the Scarlet fortress at Tyr’s Hand. Light’s Hope Chapel is a base for defenders who must work within reach of the dead.', '道路沿途是残破的城镇、天灾军团的高塔，以及提尔之手的血色要塞。圣光之愿礼拜堂则是守军的据点，他们就在亡者活动的地方附近坚持作战。'), L('The war left private losses as well as ruined cities. Near the Thondroril River, Tirion remembers the family he had before exile. In Darrowshire, survivors are scarce enough that the dead must speak for what happened there.', '战争除了毁去城镇，还夺走了许多人的亲友。索多里尔河畔，提里奥仍惦念流亡前的家人。在达隆郡，幸存者寥寥，往事只能由亡者来讲述。')],
    history: [
      H(L('Third War', '第三次战争'), L('The purge of Stratholme', '斯坦索姆大清洗'), L('Arthas orders the slaughter of Stratholme’s people after learning that plagued grain has reached the city.', '阿尔萨斯得知受瘟疫污染的谷物已经运进城，便下令屠杀斯坦索姆的居民。')),
      H(L('Classic era', '经典旧世时期'), L('The defense at Light’s Hope', '圣光之愿礼拜堂的防卫'), L('The Argent Dawn maintains a base in the east while Scourge forces hold Stratholme and reach into the surrounding country.', '天灾军团占据斯坦索姆，势力深入周边地区。银色黎明仍在东部坚守据点。'))
    ],
    storylines: [S('ep-darrow', L('A family in Darrowshire', '达隆郡的一家人'), ['ep-doll', 'ep-redpath']), S('ep-exile', L('The exile on the river', '河畔的流亡者'), ['ep-mementos'])],
    figureIds: ['arthas', 'tirion', 'taelan', 'pamela'], factionIds: ['scourge', 'argent-dawn', 'scarlet-crusade'],
    places: [
      { id: 'stratholme', name: L('Stratholme', '斯坦索姆'), text: L('The city still bears the marks of the purge and is occupied by the dead and the Scarlet Crusade.', '城里仍留着大清洗的痕迹，亡灵与血色十字军分别占据街区。') },
      { id: 'lights-hope', name: L('Light’s Hope Chapel', '圣光之愿礼拜堂'), text: L('The Argent Dawn’s refuge and meeting place in the eastern reaches.', '银色黎明在东部的避难所和集结地。') },
      { id: 'darrowshire', name: L('Darrowshire', '达隆郡'), text: L('The ghost of Pamela Redpath waits in the ruined village.', '帕米拉·雷德帕斯的幽灵在村庄废墟中等待。') },
      { id: 'tyrs-hand', name: L('Tyr’s Hand', '提尔之手'), text: L('The Scarlet Crusade holds the fortified settlement in the southeast.', '血色十字军据守东南方这座设防的聚落。') }
    ],
    relatedZoneIds: [1422, 1420, 1425], sagaIds: ['fallen-lordaeron'], sourceIds: ['ep-classic', 'ep-doll', 'ep-battle', 'ep-redpath', 'ep-family', 'arthas-history', 'manual']
  });

  zone(1424, L('Hillsbrad Foothills', '希尔斯布莱德丘陵'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '20–30', L('Southshore still looks out over Lordaeron’s old farms. Inland at Tarren Mill, the Forsaken prepare for a war that puts those farms on the front line.', '南海镇仍守望着洛丹伦昔日的农田。内陆的塔伦米尔，被遗忘者正在备战，而那些农田就在最前线。'), {
    complete: true,
    overview: [L('Southshore holds the coast for the Alliance. Tarren Mill gives the Forsaken a base among the northern hills. Between them are estates and fields whose people are still living much as they did before the new border cut across the foothills.', '南海镇为联盟守住海岸，塔伦米尔则让被遗忘者得以在北部丘陵立足。两地之间散布着庄园和农田，那里的人还过着一如往昔的日子，而丘陵间已经划出新的战线。'), L('Other conflicts cross that line. The Syndicate works from Durnholde Keep, and in Southshore magistrates track its agents north into Alterac.', '还有别的纷争跨过这条战线。辛迪加以敦霍尔德城堡为据点，南海镇的官员则追着他们的密探一路查到北边的奥特兰克。')],
    history: [
      H(L('After the Second War', '第二次战争之后'), L('Durnholde and the prisoners', '敦霍尔德与兽人囚徒'), L('The Alliance imprisons orcs after the war. Durnholde is the stronghold where Thrall grows up in captivity.', '战后，联盟囚禁兽人。萨尔便是在敦霍尔德城堡的囚禁中长大的。')),
      H(L('Classic era', '经典旧世时期'), L('The foothills become a front', '丘陵成了前线'), L('With Lordaeron fallen, the Alliance holds Southshore and Forsaken officers direct attacks on Hillsbrad from Tarren Mill.', '洛丹伦陷落后，联盟坚守南海镇，被遗忘者的军官则从塔伦米尔指挥对希尔斯布莱德的袭击。'))
    ],
    storylines: [S('hi-front', L('The war comes to the farms', '战火烧到农田'), ['hi-fields', 'hi-plague']), S('hi-syndicate', L('The road to Alterac', '通往奥特兰克的路'), ['al-papers', 'al-rings'])],
    figureIds: ['faranell', 'varimathras', 'henry-maleb', 'darthalia'], factionIds: ['forsaken', 'royal-apothecary', 'syndicate'],
    places: [
      P('southshore', L('Southshore', '南海镇'), 49.4, 52.1, L('The Alliance port still gives the old farms a town to turn to.', '联盟港镇依然是周围老农庄可以投奔的地方。')),
      P('tarren-mill', L('Tarren Mill', '塔伦米尔'), 60.2, 18.8, L('Forsaken officers and apothecaries maintain an inland base here.', '被遗忘者的军官和药剂师在这里经营内陆据点。')),
      { id: 'durnholde', name: L('Durnholde Keep', '敦霍尔德城堡'), text: L('The Syndicate occupies the stronghold associated with Thrall’s captivity.', '这座关押过萨尔的要塞如今被辛迪加占据。') }
    ],
    relatedZoneIds: [1416, 1417, 1421, 1425, 1458], sagaIds: ['fallen-lordaeron'], sourceIds: ['hi-classic', 'hi-fields', 'hi-elixir', 'manual', 'al-kingdom', 'al-plans', 'al-rings']
  });

  zone(1425, L('The Hinterlands', '辛特兰'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), '40–50', L('Wildhammer gryphon riders hold Aerie Peak above a highland contested by forest trolls. At the coast, the Revantusk have made a home apart from their enemies inland.', '蛮锤狮鹫骑士居高守卫鹰巢山，林间则有不同的森林巨魔部族争斗。沿海的恶齿巨魔远离内陆敌人，自建家园。'), {
    complete: true,
    overview: [L('After leaving Grim Batol, the Wildhammer clan found a home among the high ridges. Aerie Peak remains a base for riders and a place from which the dwarves look east toward the old troll sites.', '蛮锤氏族离开格瑞姆巴托之后，在山岭之间找到了家园。鹰巢山至今仍是骑士的据点，矮人从这里监视东边的巨魔古地。'), L('The Vilebranch hold the temple terraces of Jintha’Alor. Their enemies include the coastal Revantusk, who turn to Horde allies when their people are captured.', '邪枝巨魔占有辛萨罗层层叠叠的神庙。沿海的恶齿巨魔也是他们的敌人。族人被俘时，恶齿向部落盟友求援。')],
    history: [
      H(L('After the War of the Three Hammers', '三锤之战后'), L('A refuge on the high ridges', '高岭上的新家'), L('The Wildhammers leave cursed Grim Batol and make a new home at Aerie Peak.', '蛮锤矮人离开受诅咒的格瑞姆巴托，在鹰巢山安家。')),
      H(L('Classic era', '经典旧世时期'), L('Fighting over the old temples', '争夺古老神庙'), L('The Vilebranch occupy Jintha’Alor, while the Revantusk maintain their own settlement on the eastern shore.', '邪枝巨魔盘踞辛萨罗，恶齿巨魔则在东海岸维持自己的聚落。'))
    ],
    storylines: [S('ht-captive', L('Captives of Jintha’Alor', '辛萨罗的俘虏'), ['ht-elder', 'ht-kidnapped'])],
    figureIds: ['khardros'], factionIds: ['wildhammer', 'horde'],
    places: [
      { id: 'aerie-peak', name: L('Aerie Peak', '鹰巢山'), text: L('Gryphon riders watch the highlands from the Wildhammer stronghold.', '狮鹫骑士从蛮锤要塞守望高地。') },
      { id: 'jintha-alor', name: L('Jintha’Alor', '辛萨罗'), text: L('The terraced temple city is a center of Vilebranch power.', '这座层台式神庙城是邪枝巨魔的重镇。') },
      { id: 'revantusk', name: L('Revantusk Village', '恶齿村'), text: L('The coastal settlement gives the Horde a foothold and the Revantusk a place of their own.', '这座海滨聚落既是部落的据点，也是恶齿巨魔自己的家园。') }
    ],
    relatedZoneIds: [1437, 1417, 1424], sagaIds: ['three-hammers', 'hakkar'], sourceIds: ['ht-classic', 'ht-elder', 'ht-sharpbeak', 'history', 'clans', 'grim-history', 'hakkar-wrath']
  });

  zone(1427, L('Searing Gorge', '灼热峡谷'), L('Blackrock region · Eastern Kingdoms', '黑石山一带 · 东部王国'), '43–50', L('On the north side of Blackrock Mountain, the Dark Irons dig into land that Ragnaros burned. A brotherhood of their own artisans keeps a separate forge above the pits.', '黑石山北侧，黑铁矮人挖掘着被拉格纳罗斯烧焦的土地。矿坑上方，一群同为黑铁矮人的工匠另立工坊。'), {
    complete: true,
    overview: [L('Tracks and scaffolds cross the Cauldron, the great pit worked by the Dark Irons. Their mining and smelting give the burned country a purpose for the rulers down in Blackrock Mountain.', '铁轨与脚手架纵横交错，跨过黑铁矮人开掘的大熔炉。对黑石山深处的统治者来说，焦土上的采矿和冶炼依然大有用处。'), L('Thorium Point is the Thorium Brotherhood’s post. Work at its forge stands apart from the labor in the pit below. The gorge shows the Dark Irons divided over who commands their craft.', '瑟银哨塔是瑟银兄弟会的据点。哨塔的工坊与下方矿坑的劳作各有归属。同是黑铁矮人，却已各自决定为谁打铁。')],
    history: [
      H(L('War of the Three Hammers', '三锤之战'), L('Fire comes out of the earth', '烈焰从地下涌出'), L('Thaurissan summons Ragnaros. The eruption destroys his city and scars the country on both sides of Blackrock Mountain.', '索瑞森召出拉格纳罗斯。喷涌的烈焰摧毁了他的城，也在黑石山两侧的土地上留下伤痕。')),
      H(L('Classic era', '经典旧世时期'), L('Mines in the burned country', '焦土上的矿坑'), L('The Dark Irons work the gorge near Blackrock Mountain, and the Thorium Brotherhood holds Thorium Point.', '黑铁矮人在黑石山附近的峡谷挖矿，瑟银兄弟会则据守瑟银哨塔。'))
    ],
    storylines: [S('sg-feud', L('Fire and the people who work it', '烈焰与炉火旁的人'), ['hammers-fire', 'sg-brotherhood']), S('sg-torch', L('The work at the stone', '石碑旁的打造'), ['sg-flame', 'sg-torch'])],
    figureIds: ['thaurissan', 'ragnaros', 'dagran', 'kalaran'], factionIds: ['dark-iron', 'thorium-brotherhood'],
    places: [
      { id: 'thorium-point', name: L('Thorium Point', '瑟银哨塔'), text: L('The Thorium Brotherhood trades supplies and keeps its own forge above the gorge.', '瑟银兄弟会在峡谷上方交易物资，经营自己的工坊。') },
      { id: 'the-cauldron', name: L('The Cauldron', '大熔炉'), text: L('Dark Iron workings cut deep into the floor of the gorge.', '黑铁矮人的矿井深深切进谷底。') },
      { id: 'slag-pit', name: L('The Slag Pit', '熔渣之池'), text: L('Tunnels and platforms carry the Dark Iron operation under the open pit.', '隧道和平台把黑铁矮人的矿场延伸到露天矿坑之下。') }
    ],
    relatedZoneIds: [1428, 1418, 1432, 1455], sagaIds: ['three-hammers'], sourceIds: ['sg-classic', 'sg-brotherhood', 'sg-flame', 'sg-ablaze', 'sg-shaft', 'sg-reveal', 'history', 'clans']
  });

  zone(1428, L('Burning Steppes', '燃烧平原'), L('Blackrock region · Eastern Kingdoms', '黑石山一带 · 东部王国'), '50–58', L('Blackrock Mountain looms over the southern ash plain. Orc strongholds and dragonkin threaten the human watch at Morgan’s Vigil, where word arrives of a marshal imprisoned inside the mountain.', '黑石山俯瞰南面的灰烬平原。兽人据点和龙人威胁着摩根的岗哨。就在这里，人们得知一名元帅被囚于山中。'), {
    complete: true,
    overview: [L('Morgan’s Vigil watches the road toward the Redridge Mountains. Flame Crest looks out from the northern ridge. Between them are the ruins of Thaurissan’s city and the Blackrock orcs’ stronghold at Blackrock Stronghold.', '摩根的岗哨监视通往赤脊山的道路，烈焰峰则在北部山脊上俯瞰平原。两地之间是索瑞森城的废墟和兽人占据的黑石要塞。'), L('Inside Blackrock Mountain, the Dark Irons rule the depths while the Blackrock orcs and the black dragonflight operate above. The garrison in the steppes learns how far these powers reach when its search for Windsor leads back toward Stormwind.', '黑石山内部，黑铁矮人掌控深渊，黑石兽人与黑龙军团则占据上层。燃烧平原的驻军追寻温德索尔时，发现线索竟一路通向暴风城。')],
    history: [
      H(L('War of the Three Hammers', '三锤之战'), L('A city burns on the plain', '平原上的城市焚毁'), L('The eruption brought on by Ragnaros’s summoning destroys Thaurissan’s city and blackens the surrounding land.', '召唤拉格纳罗斯引发的爆发摧毁了索瑞森城，也烧焦了周围的土地。')),
      H(L('Second War and after', '第二次战争及战后'), L('A stronghold outlasts the war', '要塞在战后依然屹立'), L('Blackrock Spire serves the old Horde. In Classic, Blackrock orcs and black dragons both hold ground inside the mountain.', '黑石塔曾为旧部落效力。经典旧世时期，黑石兽人和黑龙都在山中立足。'))
    ],
    storylines: [S('bs-windsor', L('The marshal in the depths', '深渊里的元帅'), ['bs-dragonkin', 'bs-windsor', 'defias-prestor']), S('bs-spire', L('The powers above the depths', '深渊上方的势力'), ['bs-spire'])],
    figureIds: ['ragnaros', 'thaurissan', 'windsor', 'finkle', 'nefarian', 'helendis'], factionIds: ['blackrock', 'dark-iron', 'black-dragonflight', 'stormwind-army'],
    places: [
      { id: 'morgans-vigil', name: L('Morgan’s Vigil', '摩根的岗哨'), text: L('Helendis Riverhorn reports the dragonkin threat from the Alliance camp.', '赫林迪斯·河角在这处联盟营地报告龙人的威胁。') },
      { id: 'flame-crest', name: L('Flame Crest', '烈焰峰'), text: L('The outpost in the north gives the Horde a foothold on the plain.', '北部前哨是部落在平原上的据点。') },
      { id: 'thaurissan-ruins', name: L('Ruins of Thaurissan', '索瑞森废墟'), text: L('The remains of the Dark Iron city stand amid the soot and ash.', '昔日黑铁矮人城市的残垣断壁仍立在灰烬中。') },
      { id: 'blackrock-mountain', name: L('Blackrock Mountain', '黑石山'), text: L('Passages from the mountain’s interior lead into Blackrock Depths and up to Blackrock Spire.', '山体内部的通道向下通往黑石深渊，向上则通往黑石塔。') }
    ],
    relatedZoneIds: [1427, 1433, 1453, 1452, 1445], sagaIds: ['three-hammers', 'blackrock-brood'], sourceIds: ['bs-classic', 'bs-lair', 'bs-menace', 'bs-true', 'bs-marshal', 'bs-note', 'bs-jail', 'bs-rend', 'bs-orders', 'history', 'clans', 'court-reveal', 'manual']
  });

  zone(1430, L('Deadwind Pass', '逆风小径'), L('Southern Eastern Kingdoms', '东部王国南部'), '55–60', L('A narrow road crosses empty hills between Duskwood and the swamp. At the end of the valley stands Karazhan, the tower from which Medivh changed Azeroth’s history.', '暮色森林与沼泽之间，一条狭路穿过空寂的山岭。谷底矗立着卡拉赞，麦迪文曾在这座塔里改变艾泽拉斯的历史。'), {
    complete: true,
    overview: [L('The pass has few inhabitants. Ogres hold caves near the road, and the country around Karazhan is haunted. In Classic the tower stands closed above the abandoned village at its foot.', '小径一带人口稀少。食人魔占据路边洞穴，卡拉赞周围则闹鬼。经典旧世时期，高塔大门紧闭，脚下的村庄早已荒废。')],
    history: [
      H(L('First War', '第一次战争'), L('The last Guardian’s seat', '末代守护者的居所'), L('Medivh lives at Karazhan. His pact with Gul’dan helps the first orc armies cross into Azeroth.', '麦迪文住在卡拉赞。他与古尔丹达成交易，使最早的兽人军队得以进入艾泽拉斯。')),
      H(L('Classic era', '经典旧世时期'), L('The tower stands closed', '塔门紧闭'), L('The Master’s Terrace and the abandoned village remain visible below a tower whose interior is shut.', '高塔内部无法进入，塔下仍可见主宰的露台与废弃村落。'))
    ],
    storylines: [S('dw-guardian', L('The Guardian of Karazhan', '卡拉赞的守护者'), ['dw-portal', 'dw-staff'])],
    figureIds: ['medivh', 'lothar'], factionIds: ['night-watch'],
    places: [
      { id: 'karazhan', name: L('Karazhan', '卡拉赞'), text: L('Medivh’s abandoned tower dominates the southern end of the pass.', '麦迪文废弃的高塔矗立在小径南端。') },
      { id: 'deadwind-ogres', name: L('Deadwind Ravine', '逆风谷'), text: L('The ogres make their home in caves off the road.', '食人魔住在路旁的洞穴里。') }
    ],
    relatedZoneIds: [1431, 1435, 1419, 1453], sagaIds: [], sourceIds: ['dw-classic', 'dw-guardian', 'dw-staff', 'dw-cleansing', 'portal-history', 'manual']
  });

  zone(1434, L('Stranglethorn Vale', '荆棘谷'), L('Southern Eastern Kingdoms', '东部王国南部'), '30–45', L('Trading ships and zeppelins reach the edges of Stranglethorn. Deeper in the jungle, the old troll city of Zul’Gurub is the center of a struggle over the return of Hakkar.', '商船与飞艇抵达荆棘谷边缘。丛林深处，古老的巨魔城市祖尔格拉布正在为哈卡的归来而争斗。'), {
    complete: true,
    overview: [L('Booty Bay is a goblin port with a ship to Ratchet. The Horde holds Grom’gol on the coast farther north. Away from the docks, hunters set up camp and rival troll groups occupy old ruins.', '藏宝海湾是地精港口，有船驶往棘齿城。部落则在更北的海岸据守格罗姆高。离开码头，能看到猎人扎营，也能看到不同的巨魔势力占据旧日遗迹。'), L('The Zandalar establish a camp on Yojamba Isle to oppose Hakkar’s rise. Their expedition links a living troll community with the fate of the old Gurubashi capital across the jungle.', '赞达拉人在尤亚姆巴岛扎营，决心阻止哈卡崛起。这个仍然兴盛的巨魔部族渡海而来，为的是丛林另一端古拉巴什旧都的命运。')],
    history: [
      H(L('After the Sundering', '大分裂之后'), L('The Gurubashi and the blood god', '古拉巴什与血神'), L('The Gurubashi ask Hakkar for power. As the price in blood grows, they turn against him and drive his most devoted followers into exile.', '古拉巴什向哈卡寻求力量。献血的代价越来越沉重，他们转而反抗哈卡，将其最忠诚的信徒逐出家园。')),
      H(L('Classic era', '经典旧世时期'), L('A return to Zul’Gurub', '重返祖尔格拉布'), L('Hakkar threatens the Gurubashi capital again, and the Zandalar call for help from their island camp.', '哈卡再度威胁古拉巴什的都城，赞达拉人从岛上营地向外求援。'))
    ],
    storylines: [S('sv-port', L('A port in the path of pirates', '海盗盯上的港口'), ['sv-pirates']), S('sv-hakkar', L('The Soulflayer’s return', '夺灵者归来'), ['sv-heart'])],
    figureIds: ['hakkar'], factionIds: ['zandalar', 'steamwheedle', 'horde'],
    places: [
      P('booty-bay', L('Booty Bay', '藏宝海湾'), 27.5, 77.7, L('The goblin port’s shipping ties reach across the Great Sea to Ratchet.', '地精港口的航线横跨无尽之海，通往棘齿城。')),
      P('gromgol', L('Grom’gol Base Camp', '格罗姆高营地'), 32.5, 29.3, L('The Horde keeps a garrison and a zeppelin tower on the western shore.', '部落在西海岸驻军，并建有飞艇塔。')),
      P('nesingwary', L('Nesingwary’s Expedition', '奈辛瓦里远征队营地'), 35.7, 10.8, L('The hunters set their camp beside the river in northern Stranglethorn.', '猎人们在荆棘谷北部的河边扎营。')),
      { id: 'yojamba', name: L('Yojamba Isle', '尤亚姆巴岛'), text: L('The Zandalar gather here to oppose Hakkar.', '赞达拉人在岛上集结，对抗哈卡。') },
      { id: 'zulgurub', name: L('Zul’Gurub', '祖尔格拉布'), text: L('The old Gurubashi capital is the seat of the Soulflayer’s return.', '古拉巴什旧都是夺灵者归来的地方。') }
    ],
    relatedZoneIds: [1435, 1431, 1446, 1413], sagaIds: ['hakkar'], sourceIds: ['sv-classic', 'sv-pirates', 'sv-heart', 'hakkar-history', 'hakkar-wrath']
  });

  zone(1435, L('Swamp of Sorrows', '悲伤沼泽'), L('Southern Eastern Kingdoms', '东部王国南部'), '35–45', L('Stonard keeps a Horde watch among the reeds. Beneath the waters of the Pool of Tears, the exiles who worship Hakkar still guard their temple.', '斯通纳德的部落守军在芦苇间警戒。泪水之池的水下，崇拜哈卡的流亡者依然守着自己的神庙。'), {
    complete: true,
    overview: [L('The road into the swamp runs past Stonard and the remnants at the Fallow Sanctuary. Off the road, the Pool of Tears covers much of the Temple of Atal’Hakkar, where trolls and green dragonkin still meet in conflict.', '沼泽里的道路经过斯通纳德和农田避难所的残存建筑。远离道路，泪水之池淹没了阿塔哈卡神庙的大半，巨魔与绿龙军团的龙人依然在那里争斗。'), L('The temple’s story reaches beyond the swamp. An egg from the Hinterlands and a request in Tanaris give the sunk halls a role in Hakkar’s return, long after the place was first sealed under water.', '神庙的故事并不局限于沼泽。一枚来自辛特兰的卵和一项在塔纳利斯提出的委托，让沉入水下多年的大厅卷入了哈卡归来的事件。')],
    history: [
      H(L('In the time of the exiles', '流亡者时代'), L('The Atal’ai build a temple', '阿塔莱建起神庙'), L('Driven out for their worship of Hakkar, the Atal’ai raise a sanctuary and continue their rites in the swamp.', '阿塔莱因崇拜哈卡被放逐，于是在沼泽建起神庙，继续举行仪式。')),
      H(L('Before Classic', '经典旧世之前'), L('The temple sinks', '神庙沉没'), L('Ysera and her flight bring down the temple to stop the rites. Green dragons keep watch over what remains.', '伊瑟拉和她的龙族摧毁神庙，希望阻止仪式。绿龙留在那里看守遗迹。'))
    ],
    storylines: [S('ss-temple', L('Beneath the Pool of Tears', '泪水之池下'), ['ss-discovery', 'ss-avatar'])],
    figureIds: ['hakkar'], factionIds: ['horde', 'green-dragonflight'],
    places: [
      { id: 'stonard', name: L('Stonard', '斯通纳德'), text: L('The Horde garrison holds the road through the swamp.', '部落驻军守住了穿过沼泽的道路。') },
      { id: 'pool-of-tears', name: L('Pool of Tears', '泪水之池'), text: L('The pool hides most of the temple beneath its surface.', '池水淹没了大部分神庙。') },
      { id: 'atal-hakkar', name: L('Temple of Atal’Hakkar', '阿塔哈卡神庙'), text: L('The sunken sanctuary is still occupied by the Atal’ai and watched by green dragonkin.', '阿塔莱依然盘踞在沉没的圣所中，绿龙军团也仍在看守。') }
    ],
    relatedZoneIds: [1430, 1419, 1434, 1446], sagaIds: ['hakkar'], sourceIds: ['ss-classic', 'ss-temple', 'ss-avatar', 'hakkar-wrath']
  });

  zone(1458, L('Undercity', '幽暗城'), L('Lordaeron · Eastern Kingdoms', '洛丹伦 · 东部王国'), 'Capital city', L('The ruined court of Lordaeron stands above another capital. Below it, Sylvanas rules the free undead from a city of ringed passages, sewers and workshops.', '洛丹伦宫廷的废墟下方，还有一座都城。希尔瓦娜斯在这片由环形通道、下水道与工坊组成的地下城市统领自由亡灵。'), {
    complete: true,
    overview: [L('The throne room above ground keeps the memory of Terenas and Arthas. The city underneath is busy with a new government. Trade fills its central ring, and beyond it the quarters house soldiers, mages, rogues and the Royal Apothecary Society.', '地面上的王座厅留着泰瑞纳斯与阿尔萨斯的记忆，地下城则忙着运转新的政权。中央环道商贸繁忙，外围各区分别有士兵、法师、潜行者与皇家药剂师协会活动。'), L('From the Royal Quarter, Sylvanas holds together a people whose freedom is still recent. The apothecaries have their own far-reaching network, from the test sites of Hillsbrad to allies and prospective partners across the sea.', '希尔瓦娜斯在皇家区统领这些重获自由不久的亡灵。药剂师们另有一套延伸甚远的网络，既包括希尔斯布莱德的试验地点，也包括海对岸的盟友和潜在伙伴。')],
    history: [
      H(L('Third War', '第三次战争'), L('The old court falls', '旧宫廷陷落'), L('Arthas kills Terenas on his return to Lordaeron. The city and its people fall to the Scourge.', '阿尔萨斯回到洛丹伦，杀死泰瑞纳斯。王城和城中居民落入天灾军团之手。')),
      H(L('After the Third War', '第三次战争之后'), L('A capital beneath the ruins', '废墟下的新都'), L('Sylvanas claims Lordaeron for the free undead. The Forsaken finish the underground city and make it their seat of power.', '希尔瓦娜斯为自由亡灵夺取洛丹伦。被遗忘者完成地下城市的建造，把它作为统治中心。'))
    ],
    storylines: [S('uc-power', L('Who holds the old capital', '谁掌握昔日王城'), ['uc-free', 'uc-hillsbrad']), S('uc-apothecary', L('The apothecaries’ reach', '药剂师的人脉'), ['uc-allies'])],
    figureIds: ['sylvanas', 'faranell', 'varimathras', 'arthas', 'magatha', 'darthalia'], factionIds: ['forsaken', 'royal-apothecary', 'horde'],
    places: [
      { id: 'lordaeron-throne', name: L('Ruins of Lordaeron', '洛丹伦废墟'), text: L('The courtyard and throne room stand above the entrance to the underground capital.', '庭院和王座厅就在地下都城入口的上方。') },
      { id: 'royal-quarter', name: L('Royal Quarter', '皇家区'), text: L('Sylvanas and Varimathras direct the Forsaken from these chambers.', '希尔瓦娜斯与瓦里玛萨斯在这些厅室里指挥被遗忘者。') },
      { id: 'apothecarium', name: L('The Apothecarium', '炼金房'), text: L('Master Apothecary Faranell and the Society work in this wing of the city.', '大药剂师法拉尼尔和协会成员在这个城区工作。') }
    ],
    relatedZoneIds: [1420, 1421, 1424, 1422], sagaIds: ['fallen-lordaeron'], sourceIds: ['uc-classic', 'uc-report', 'uc-allies', 'manual', 'arthas-history', 'hi-fields', 'ti-plague']
  });

  zone(1411, L('Durotar', '杜隆塔尔'), L('Central Kalimdor', '卡利姆多中部'), '1–10', L('The orcs of the new Horde settle among red ridges, and the Darkspear make a home on the coast. Both have to defend their first homes in Kalimdor.', '新部落的兽人在红色山脊间定居，暗矛巨魔则在沿海安家。两族都得守住他们在卡利姆多最早的家园。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('The dry ravines of the Valley of Trials give way to the road through Razor Hill. On the southern coast, Sen’jin Village looks out at the Echo Isles, where the Darkspear’s immediate troubles have followed them home.', '试炼谷的干燥沟壑通向剃刀岭的道路。南部海岸上，森金村正对着回音群岛，暗矛巨魔回到家门口也依然有麻烦。'), L('Razor Hill’s defenders watch Northwatch men who remain in Tiragarde Keep. The guard’s evidence also points to trouble closer to the Horde, among the spellcasters in the inland caves.', '剃刀岭的守军留意仍据守提拉加德城堡的北方城堡士兵。守军掌握的消息还指向内陆洞穴里的施法者，那是离部落更近的麻烦。')],
    history: [
      H(L('After the Third War', '第三次战争之后'), L('A new home named for Durotan', '以杜隆坦命名的新家园'), L('Thrall settles the orcs in Kalimdor and names the land for his father. The Darkspear share its coast.', '萨尔让兽人在卡利姆多定居，以父亲的名字命名这片土地。暗矛则在同一片海岸落脚。')),
      H(L('Classic era', '经典旧世时期'), L('An uneasy shore', '难以安宁的海岸'), L('Tiragarde remains a hostile military post, and the Darkspear live on the mainland while the Echo Isles remain dangerous.', '提拉加德仍是敌对军队的据点，回音群岛依然险恶，暗矛于是住在大陆上。'))
    ],
    storylines: [S('du-new-home', L('Holding the new shore', '守住新的海岸'), ['dt-isles', 'dt-tiragarde']), S('du-inner', L('Enemies under the red hills', '红色山岭下的敌人'), ['dt-burning'])],
    figureIds: ['thrall', 'voljin', 'gadrin'], factionIds: ['horde', 'darkspear', 'burning-blade'],
    places: [
      { id: 'senjin', name: L('Sen’jin Village', '森金村'), text: L('The mainland settlement faces the islands that the Darkspear once occupied.', '这座大陆上的聚落面对暗矛曾经居住的群岛。') },
      { id: 'razor-hill', name: L('Razor Hill', '剃刀岭'), text: L('The Horde garrison watches the road and the troops at Tiragarde.', '部落驻军监视道路，也留意提拉加德的士兵。') },
      { id: 'tiragarde', name: L('Tiragarde Keep', '提拉加德城堡'), text: L('Northwatch troops remain in the old fort on the coast.', '北方城堡的部队依然驻扎在海岸的旧要塞里。') }
    ],
    relatedZoneIds: [1454, 1413, 1445], sagaIds: ['new-horde'], sourceIds: ['dt-classic', 'dt-isles', 'dt-tiragarde', 'dt-skull', 'manual', 'horde-founding']
  });

  zone(1412, L('Mulgore', '莫高雷'), L('Central Kalimdor', '卡利姆多中部'), '1–10', L('After years of flight from the centaur, the tauren have grassland to call home. Protecting Mulgore means defending the herds and the earth on which their new settlements depend.', '多年躲避半人马之后，牛头人终于有了自己的草原。守卫莫高雷，就是保护新聚落赖以生存的兽群和土地。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Bloodhoof Village stands beside Stonebull Lake below Thunder Bluff. The grasslands are hunting grounds and a place where young tauren learn obligations to the land and the people who live on it.', '血蹄村坐落在雷霆崖下的石牛湖畔。草原是猎场，年轻的牛头人也在这里学习自己对土地和乡邻负有的责任。'), L('Sites in the hills make different claims on the land. The Venture Company sets up a mine and works with machines, while the tauren also object to dwarven digging at Bael’dun.', '丘陵上的各方对土地各有打算。风险投资公司建矿动用机器，矮人在巴尔丹的挖掘也招致牛头人反对。')],
    history: [
      H(L('Third War', '第三次战争'), L('An alliance on the plains', '草原上的盟约'), L('Cairne and Thrall make common cause as the tauren seek a defensible home away from centaur attacks.', '牛头人饱受半人马袭击，寻找可以守住的家园。凯恩于是与萨尔并肩作战。')),
      H(L('After the migration', '迁徙之后'), L('Homes below the bluffs', '悬崖下的家园'), L('The tauren make their home in Mulgore, with Bloodhoof Village in the grasslands and Thunder Bluff rising above them.', '牛头人在莫高雷安家，草原上建起血蹄村，雷霆崖则高踞村庄之上。'))
    ],
    storylines: [S('mg-country', L('Living on the new land', '在新家园生活'), ['mg-rites', 'mg-machines'])],
    figureIds: ['cairne'], factionIds: ['horde', 'venture', 'grimtotem'],
    places: [
      { id: 'bloodhoof', name: L('Bloodhoof Village', '血蹄村'), text: L('The lakeside settlement joins the hunting grounds to the road toward Thunder Bluff.', '湖畔聚落连着猎场，也连着通往雷霆崖的道路。') },
      { id: 'red-cloud', name: L('Red Cloud Mesa', '红云台地'), text: L('Camp Narache sits here above the southern grasslands.', '纳拉其营地位于此处，俯瞰南部草原。') },
      { id: 'venture-mine', name: L('Venture Co. Mine', '风险投资公司矿洞'), text: L('Goblin mining encroaches on the grassland from the eastern hills.', '地精从东边山地开矿，侵入草原。') }
    ],
    relatedZoneIds: [1456, 1413, 1443], sagaIds: ['new-horde'], sourceIds: ['mg-classic', 'mg-rites', 'mg-hunt', 'mg-venture', 'manual', 'horde-exodus']
  });

  zone(1413, L('The Barrens', '贫瘠之地'), L('Central Kalimdor', '卡利姆多中部'), '10–25', L('The Horde’s inland roads meet in a vast dry grassland. Goblin ships tie it to another continent, and below the dust a druid tries to make the Barrens green.', '部落的内陆道路汇于广袤干燥的草原。地精的航船把它同另一块大陆相连，尘土之下则有德鲁伊试图让贫瘠之地恢复绿意。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('The Crossroads holds the meeting of the inland routes. Camp Taurajo watches the southern road, and Ratchet offers a port where the cartel trades with people from both sides.', '十字路口扼守内陆道路的交会处。陶拉祖营地看护南路，棘齿城则是地精财团同时与双方做生意的港口。'), L('The grassland around the oases is under pressure from centaur, quilboar and other raiders. In the Wailing Caverns, the struggle over the Barrens takes a different shape when a druid’s dream changes the life around him.', '绿洲周围的草原受到半人马、野猪人等袭击者威胁。哀嚎洞穴中，德鲁伊的一场梦改变了周围的生灵，贫瘠之地也因此面临别样的纷争。')],
    history: [
      H(L('Third War', '第三次战争'), L('The crossing of the plains', '横穿草原'), L('Thrall aids Cairne and the tauren as they cross the Barrens, strengthening the alliance that takes hold in Kalimdor.', '萨尔帮助凯恩和牛头人穿过贫瘠之地，巩固了后来在卡利姆多扎根的同盟。')),
      H(L('Classic era', '经典旧世时期'), L('Roads and oases', '道路与绿洲'), L('The Horde’s settlements take shape along the roads. Druids turn their attention to the unusual growth in and around the oases.', '部落的聚落在道路沿线逐渐建成。德鲁伊开始留意绿洲内外异常旺盛的生长。'))
    ],
    storylines: [S('br-druid', L('The dream below the oases', '绿洲之下的梦'), ['br-oases', 'br-nightmare']), S('br-port', L('Keeping a port open', '维持港口通航'), ['br-pirates'])],
    figureIds: ['cairne', 'hamuul', 'naralex', 'gazlowe', 'tonga'], factionIds: ['horde', 'cenarion-circle', 'steamwheedle'],
    places: [
      { id: 'crossroads', name: L('The Crossroads', '十字路口'), text: L('The Horde’s road garrison stands in the middle of the northern plains.', '部落守路的驻军位于北部草原中央。') },
      { id: 'ratchet', name: L('Ratchet', '棘齿城'), text: L('The goblin port trades across the Great Sea and faces pirates close to home.', '地精港口跨越无尽之海做生意，近海却有海盗出没。') },
      { id: 'wailing-caverns', name: L('Wailing Caverns', '哀嚎洞穴'), text: L('Naralex’s expedition is caught in a nightmare beneath the grassland.', '纳拉雷克斯的考察队陷入草原地下的噩梦。') }
    ],
    relatedZoneIds: [1411, 1412, 1440, 1441, 1456, 1434], sagaIds: ['new-horde'], sourceIds: ['br-classic', 'br-oases', 'br-naralex', 'br-nightmare', 'br-pirates', 'horde-exodus', 'manual']
  });

  zone(1438, L('Teldrassil', '泰达希尔'), L('Northern Kalimdor', '卡利姆多北部'), '1–10', L('The night elves have a new home in the boughs of Teldrassil. The moonwells sustain the settlements, even as trouble appears among the creatures living on the young World Tree.', '暗夜精灵在泰达希尔的枝干上有了新家。月亮井滋养着各处聚落，新生世界之树上的一些生灵却开始出现异状。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Shadowglen lies apart from the busy road through Dolanaar to Darnassus. Below the boughs, Rut’theran Village gives the tree access to the sea and to Darkshore.', '幽影谷远离经过多兰纳尔、通往达纳苏斯的繁忙道路。枝干下方的鲁瑟兰村，则让岛上居民得以出海前往黑海岸。'), L('The new tree has sacred wells and villages, yet some of its furbolgs and other inhabitants have become dangerous. A druid’s investigation and a moonwell ceremony tell different parts of the story of a home still taking root.', '新树上有圣井和村庄，但一些熊怪与其他生灵已变得危险。德鲁伊的调查与月亮井的仪式，从不同方面讲述了一个刚刚扎根的家园。')],
    history: [
      H(L('Third War', '第三次战争'), L('The cost at Nordrassil', '诺达希尔的代价'), L('The night elves stop Archimonde at Mount Hyjal, and the battle costs them the blessing that sustained their immortality.', '暗夜精灵在海加尔山阻止了阿克蒙德，也在这一战中失去了维系永生的祝福。')),
      H(L('After the Third War', '第三次战争之后'), L('A second World Tree', '第二棵世界之树'), L('The druids raise Teldrassil and the night elves build a home in its crown. The new tree does not restore their lost immortality.', '德鲁伊种下泰达希尔，暗夜精灵在树冠上安家。新树未能恢复他们失去的永生。'))
    ],
    storylines: [S('te-growth', L('Trouble among the new roots', '新树根旁的异状'), ['te-moss', 'te-oracle'])],
    figureIds: ['tyrande', 'fandral', 'denalan'], factionIds: ['sentinels', 'cenarion-circle'],
    places: [
      { id: 'shadowglen', name: L('Shadowglen', '幽影谷'), text: L('Aldrassil shelters the first settlement on this part of the tree.', '奥达希尔庇护着树上这一带最早可见的聚落。') },
      { id: 'dolanaar', name: L('Dolanaar', '多兰纳尔'), text: L('The village keeps a moonwell and watches the road to Darnassus.', '村中有一口月亮井，也有人照看通往达纳苏斯的道路。') },
      { id: 'rutheran', name: L('Rut’theran Village', '鲁瑟兰村'), text: L('The village at the tree’s base keeps the route to the mainland open.', '树根处的村庄维系着通往大陆的航路。') }
    ],
    relatedZoneIds: [1457, 1439, 1450, 1448], sagaIds: ['corrupted-forests'], sourceIds: ['te-classic', 'te-moss', 'te-oracle', 'te-crown', 'manual', 'mount-hyjal']
  });

  zone(1441, L('Thousand Needles', '千针石林'), L('Central Kalimdor', '卡利姆多中部'), '25–35', L('The canyon’s stone columns hold bridges and tauren settlements. Down on the dry floor, roads lead from centaur territory to a racetrack on the salt flats.', '峡谷的石柱托起桥梁和牛头人聚落。干燥的谷底有路穿过半人马的地盘，一直通到盐滩上的赛道。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Freewind Post sits high above the canyon floor, where centaur raids keep the garrison busy. The mesas are not all friendly to the Horde. The Grimtotem use their own heights at Darkcloud Pinnacle.', '乱风岗高踞谷底之上，守军忙于应付半人马的袭击。台地上的势力并非都与部落交好，恐怖图腾便在黑云峰据有自己的高地。'), L('To the east, the Shimmering Flats open bright and level. The Mirage Raceway brings goblin and gnome engineers into competition, with the bodies of local creatures serving as sources of materials for their machines.', '向东走便是闪光平原，明亮而平坦。沙漠赛道上，地精与侏儒工程师一较高下，当地生物的甲壳也成了赛车的材料。')],
    history: [
      H(L('Before the settlements', '聚落建立之前'), L('A dry canyon of stone needles', '石柱林立的干谷'), L('The waters that once covered the flats leave a broad bed of salt below the cliffs.', '曾经覆盖平原的水退去，在岩壁下留下辽阔的盐滩。')),
      H(L('Classic era', '经典旧世时期'), L('A post above the floor', '谷底上方的前哨'), L('The Horde fortifies a mesa at Freewind Post. Goblins and gnomes build a racecourse beyond the canyons.', '部落在台地上修筑乱风岗。地精与侏儒则在峡谷以外建起赛道。'))
    ],
    storylines: [S('tn-heights', L('Life above the canyon floor', '谷底上方的生活'), ['tn-centaur', 'tn-faith']), S('tn-racing', L('The workshops on the salt', '盐滩上的工坊'), ['tn-race'])],
    figureIds: ['dorn'], factionIds: ['horde', 'grimtotem'],
    places: [
      { id: 'freewind', name: L('Freewind Post', '乱风岗'), text: L('The tauren watch the canyon and dispute its floor with centaur.', '牛头人守望峡谷，与半人马争夺谷底。') },
      { id: 'darkcloud', name: L('Darkcloud Pinnacle', '黑云峰'), text: L('Grimtotem occupy the high paths on these mesas.', '恐怖图腾占据台地上方的小路。') },
      { id: 'mirage-raceway', name: L('Mirage Raceway', '沙漠赛道'), text: L('Gnome and goblin teams build and race on the salt flats.', '侏儒和地精的车队在盐滩上造车、比赛。') }
    ],
    relatedZoneIds: [1413, 1444, 1446], sagaIds: ['new-horde'], sourceIds: ['tn-classic', 'tn-centaur', 'tn-faith', 'tn-shells']
  });

  zone(1443, L('Desolace', '凄凉之地'), L('Central Kalimdor', '卡利姆多中部'), '30–40', L('Centaur clans divide the pale, dry country of Desolace. Its coast holds settlements and old ruins, and the caverns of Maraudon hold a much older story of the centaurs’ beginnings.', '半人马部族瓜分了凄凉之地灰白干燥的原野。海岸散布聚落与古老废墟，玛拉顿洞穴里则保留着半人马起源的更古老故事。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('From the heights of Nijel’s Point or the coast at Shadowprey Village, travelers look onto land divided between the centaur clans. The Gelkis and Magram both seek help against the other.', '无论从尼耶尔前哨站的高处，还是从葬影村的海边望去，都能看到半人马部族各据一方的土地。吉尔吉斯和玛格拉姆都在找人助战，以对付另一方。'), L('Mannoroc Coven is occupied by demons. Maraudon is sacred to centaur, and its inner caverns keep the story of a family that has as much to do with the land as with the clans’ fighting.', '玛诺洛克集会所盘踞着恶魔。玛拉顿则是半人马的圣地，洞穴深处保留着一个家族的故事，同这片土地和部族间的战争都有关联。')],
    history: [
      H(L('Early centaur history', '半人马的早期历史'), L('The family beneath the valley', '谷地之下的家族'), L('Zaetar, a son of Cenarius, and Princess Theradras are remembered as the parents of the centaur. The story of Zaetar’s death is bound to Maraudon.', '塞纳留斯之子扎尔塔与瑟莱德丝公主被认为是半人马的父母。扎尔塔之死的故事与玛拉顿紧密相连。')),
      H(L('Classic era', '经典旧世时期'), L('Clans in a long rivalry', '长年敌对的部族'), L('The Gelkis and Magram remain enemies. Their rivalry shapes which parts of the interior are open to outsiders.', '吉尔吉斯与玛格拉姆依然敌对，他们的纷争决定外人能进入内陆哪些地方。'))
    ],
    storylines: [S('de-clans', L('The clans seek allies', '部族寻求盟友'), ['de-allies']), S('de-maraudon', L('The family of Maraudon', '玛拉顿中的家族'), ['de-scepter', 'de-seed'])],
    figureIds: [], factionIds: ['horde', 'cenarion-circle'],
    places: [
      { id: 'nijels-point', name: L('Nijel’s Point', '尼耶尔前哨站'), text: L('The Alliance post watches the road from the Stonetalon Mountains.', '联盟前哨监视从石爪山脉下来的道路。') },
      { id: 'shadowprey', name: L('Shadowprey Village', '葬影村'), text: L('The Horde keeps a harbor among the cliffs on the western coast.', '部落在西海岸峭壁间经营港口。') },
      { id: 'maraudon', name: L('Maraudon', '玛拉顿'), text: L('The caverns contain the tomb of Zaetar and the domain of Theradras.', '洞穴内有扎尔塔的陵墓，也是瑟莱德丝的领地。') }
    ],
    relatedZoneIds: [1442, 1444, 1412], sagaIds: [], sourceIds: ['de-classic', 'de-magram', 'de-gelkis', 'de-scepter', 'de-seed']
  });

  zone(1444, L('Feralas', '菲拉斯'), L('Southern Kalimdor', '卡利姆多南部'), '40–50', L('Feralas has roads shaded by enormous trees. Its living settlements surround an ancient city where ogres and surviving Highborne shelter in different wings of the ruins.', '菲拉斯的道路被参天巨树遮蔽。仍有居民的聚落环绕着一座古城，食人魔与幸存的上层精灵各自占据废墟的一角。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Feathermoon Stronghold stands on an island off the western coast. Camp Mojache is a tauren settlement on the inland road. Between them lies Dire Maul, the ruin of Eldre’Thalas, which still holds very different communities behind its walls.', '羽月要塞位于西海岸外的岛上，莫沙彻营地则是内陆道路边的牛头人聚落。两地之间是埃雷萨拉斯的废墟厄运之槌，城墙内仍住着迥然不同的族群。'), L('Even the coast near Feathermoon holds pieces of the night elves’ older world. The naga on nearby islands make it difficult to treat those ruins simply as places of memory.', '连羽月要塞附近的海岸都留有暗夜精灵旧世界的遗迹。邻岛上活动的纳迦，使这些废墟成了必须防守的地方。')],
    history: [
      H(L('Before the Sundering', '大分裂之前'), L('The city of Eldre’Thalas', '埃雷萨拉斯城'), L('Highborne build and occupy Eldre’Thalas. Some of them endure in the forest city long after the Sundering.', '上层精灵建造并居住在埃雷萨拉斯。大分裂很久以后，仍有一部分人在林中古城生活。')),
      H(L('Classic era', '经典旧世时期'), L('The city divided', '古城分裂'), L('The Gordok ogres make their home in part of the ruins, while the Shen’dralar survive in another part.', '戈多克食人魔在部分废墟安家，辛德拉则在另一处延续下来。'))
    ],
    storylines: [S('fe-riddle', L('Trouble close to Feathermoon', '羽月要塞近旁的麻烦'), ['fe-naga']), S('fe-city', L('Within the walls of Eldre’Thalas', '埃雷萨拉斯城墙之内'), ['fe-ogres', 'fe-prince'])],
    figureIds: ['latronicus'], factionIds: ['sentinels', 'horde'],
    places: [
      { id: 'feathermoon', name: L('Feathermoon Stronghold', '羽月要塞'), text: L('The Sentinels use the island fortress to watch the coast.', '哨兵以这座岛上要塞监视海岸。') },
      { id: 'camp-mojache', name: L('Camp Mojache', '莫沙彻营地'), text: L('A tauren settlement beside the inland road through the forest.', '林间内陆道路旁的牛头人聚落。') },
      { id: 'dire-maul', name: L('Dire Maul', '厄运之槌'), text: L('The ruined city is divided between inhabitants with very different ties to its past.', '各方盘踞于废城，对其往昔各有不同的牵连。') }
    ],
    relatedZoneIds: [1443, 1441, 1457], sagaIds: [], sourceIds: ['fe-classic', 'fe-dire', 'fe-naga', 'fe-ogres', 'fe-prince']
  });

  zone(1445, L('Dustwallow Marsh', '尘泥沼泽'), L('Central Kalimdor', '卡利姆多中部'), '35–45', L('Theramore’s harbor holds refugees and soldiers behind its walls, while the Horde maintains a village in the marsh. Beyond those settlements, someone has burned an inn and black dragons have claimed the deeper swamp.', '塞拉摩的城墙内住着难民和士兵，部落也在沼泽里维持着一座村庄。两处聚落之外，有人烧毁了一家旅店，而黑龙占据了沼泽深处。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Theramore looks out over the sea and Brackenwall Village faces the inland reeds. At the western entrance to the marsh, the remains of the Shady Rest Inn are a mystery the people on both sides have reason to investigate.', '塞拉摩面朝大海，蕨墙村则面向内陆芦苇荡。沼泽西口的树荫旅店已成废墟，双方都有理由追查这桩谜案。'), L('In the south, the black dragons at the Wyrmbog live amid deep water, mud and dense vegetation. The causeway leads to Theramore itself, while reports about the dragons lead into country that its walls cannot protect.', '南部巨龙沼泽里，黑龙栖息于深水、泥泞与茂密草木之间。堤道通向塞拉摩岛城，但有关巨龙的消息，却把调查引向城墙护不到的地方。')],
    history: [
      H(L('Third War', '第三次战争'), L('An eastern people settles in Kalimdor', '东部王国的居民在卡利姆多定居'), L('Jaina leads refugees across the Great Sea. Theramore becomes their fortified home.', '吉安娜率难民渡过无尽之海。塞拉摩成为这群人在城墙庇护下的家园。')),
      H(L('After the Third War', '第三次战争之后'), L('The fighting reaches Theramore', '战火波及塞拉摩'), L('Daelin Proudmoore’s campaign against the Horde ends at Theramore. Jaina remains in charge of the city.', '戴林·普罗德摩尔讨伐部落的战事在塞拉摩结束。吉安娜继续治理这座城市。'))
    ],
    storylines: [S('dm-inn', L('The burned inn', '被烧毁的旅店'), ['dm-clues']), S('dm-court', L('The black brood in the marsh', '沼泽里的黑龙后裔'), ['bs-windsor', 'dm-lair'])],
    figureIds: ['jaina', 'thrall', 'windsor'], factionIds: ['horde', 'black-dragonflight'],
    places: [
      { id: 'theramore', name: L('Theramore Isle', '塞拉摩岛'), text: L('Jaina’s fortified city and port hold the eastern shore.', '吉安娜的城堡和港口守住东部海岸。') },
      { id: 'brackenwall', name: L('Brackenwall Village', '蕨墙村'), text: L('The Horde’s ogre allies keep a settlement in the marsh.', '部落的食人魔盟友在沼泽里维持着一处聚落。') },
      { id: 'shady-rest', name: L('Shady Rest Inn', '树荫旅店'), text: L('The charred site leaves papers and objects for investigators to examine.', '烧焦的旅店留下文件与物件，供调查者查验。') },
      { id: 'wyrmbog', name: L('The Wyrmbog', '巨龙沼泽'), text: L('Black dragonkin occupy the southern marsh around the lair.', '黑龙军团的龙人占据巢穴周围的南部沼泽。') }
    ],
    relatedZoneIds: [1411, 1413, 1428, 1453], sagaIds: ['new-horde', 'blackrock-brood'], sourceIds: ['dm-classic', 'dm-inn', 'dm-hoofprints', 'dm-amulet', 'horde-founding', 'manual', 'court-reveal', 'bs-note', 'bs-jail']
  });

  zone(1446, L('Tanaris', '塔纳利斯'), L('Southern Kalimdor', '卡利姆多南部'), '40–50', L('The roads through the dunes meet at Gadgetzan. Beyond the trading town lie a Sandfury city, a pirate coast and caves where the bronze dragons guard older concerns.', '沙丘间的道路汇于加基森。商镇外有沙怒巨魔的城市、海盗出没的海岸，以及青铜龙守护着古老秘密的洞穴。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Gadgetzan is an inland market with walls around its wells. At Steamwheedle Port, fishing and shipping share the coast with an active pirate threat. The Sandfury hold Zul’Farrak in the northwestern desert.', '加基森是内陆市镇，城墙围住了水井。热砂港的捕鱼与航运都受海盗威胁。沙漠西北方，沙怒巨魔占据祖尔法拉克。'), L('People bring very different questions to the desert. Yeh’kinya seeks knowledge of Hakkar at the coast. At the Caverns of Time, Anachronos remembers why the desert to the west had to be sealed off.', '来到沙漠的人各有疑问。叶基亚在海岸探寻哈卡的事，而时光之穴里的阿纳克洛斯仍记得，沙漠西边为何必须被封起来。')],
    history: [
      H(L('After the troll empires', '巨魔帝国之后'), L('The Sandfury in the desert', '沙漠里的沙怒巨魔'), L('Zul’Farrak remains a Sandfury stronghold in the dry country.', '祖尔法拉克在干旱的土地上延续为沙怒巨魔的据点。')),
      H(L('Classic era', '经典旧世时期'), L('A trade town and a coast', '商镇与海岸'), L('The cartel works from Gadgetzan and Steamwheedle Port while pirates threaten its ships and coast.', '财团经营加基森和热砂港，海盗则威胁它的船只与海岸。'))
    ],
    storylines: [S('ta-desert', L('The peoples of the desert', '沙漠里的各方势力'), ['ta-pirates', 'ta-zulfarrak']), S('ta-troll-history', L('The inquiry at the coast', '从海岸开始的调查'), ['ta-spirits', 'ss-avatar'])],
    figureIds: ['anachronos', 'yehkinya'], factionIds: ['steamwheedle'],
    places: [
      { id: 'gadgetzan', name: L('Gadgetzan', '加基森'), text: L('The cartel’s walled market sits where the desert roads converge.', '财团的市镇有城墙围护，位于沙漠道路的交会处。') },
      { id: 'steamwheedle-port', name: L('Steamwheedle Port', '热砂港'), text: L('The port keeps contact with the sea and is home to Yeh’kinya’s inquiry.', '港口维持着海上联系，叶基亚也从这里着手调查。') },
      { id: 'zul-farrak', name: L('Zul’Farrak', '祖尔法拉克'), text: L('The Sandfury still hold the city among the desert cliffs.', '沙怒巨魔仍据守这座沙漠岩壁间的城市。') },
      { id: 'caverns-of-time', name: L('Caverns of Time', '时光之穴'), text: L('Anachronos waits outside the bronze dragonflight’s caverns.', '阿纳克洛斯守在青铜龙军团的洞穴外。') }
    ],
    relatedZoneIds: [1441, 1449, 1451, 1435, 1434], sagaIds: ['hakkar', 'shifting-sands'], sourceIds: ['ta-classic', 'ta-pirates', 'ta-scarab', 'ta-spirits', 'ta-egg', 'hakkar-wrath', 'ss-avatar', 'si-memory']
  });

  zone(1447, L('Azshara', '艾萨拉'), L('Northern Kalimdor', '卡利姆多北部'), '45–55', L('Ruined night elf halls line a broken coast. Naga move through the shallows, and far from the road a water elemental sends word of a war against fire.', '破碎的海岸上，暗夜精灵的古老厅堂已经坍塌。纳迦在浅水间活动，远离大路的地方，一名水元素向外传达对抗烈火的战事。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('The road through Azshara passes the ruins of Eldarath and looks down toward the Bay of Storms. Naga hold ground near the flooded ruins, while the inland hills and camps offer other dangers.', '艾萨拉的道路经过埃达拉斯废墟，俯瞰风暴海湾。纳迦占据水淹遗迹附近的地面，内陆丘陵与营地则另有危险。'), L('Old objects bring people here from both continents. The bay also brings the coast into the fight against the forces of Ragnaros through the work of Duke Hydraxis.', '古老器物把两块大陆上的人引到这里。海湾里的海达克西斯公爵，也让这片海岸牵涉进对抗拉格纳罗斯势力的战事。')],
    history: [
      H(L('The Sundering', '大分裂'), L('The old coast breaks', '旧日海岸断裂'), L('The Sundering tears through the old night elf lands. Eldarath’s ruins remain beside the broken coastline.', '大分裂撕裂暗夜精灵的旧领地。埃达拉斯的废墟仍留在破碎海岸边。')),
      H(L('Classic era', '经典旧世时期'), L('The ruins change hands', '废墟换了主人'), L('Naga occupy parts of the coast, and scholars search the remains of the Highborne settlement.', '纳迦占据部分海岸，学者则在上层精灵聚落遗迹中搜寻。'))
    ],
    storylines: [S('az-past', L('What survived the Sundering', '大分裂留下了什么'), ['az-tablets']), S('az-water', L('The ally out in the bay', '远在海湾里的盟友'), ['az-water'])],
    figureIds: ['hydraxis', 'ragnaros'], factionIds: ['hydraxian', 'horde'],
    places: [
      { id: 'eldarath', name: L('Ruins of Eldarath', '埃达拉斯废墟'), text: L('The ruined Highborne settlement is one of the sites where the naga gather.', '上层精灵的聚落已成废墟，如今是纳迦聚集的一处地方。') },
      { id: 'bay-of-storms', name: L('Bay of Storms', '风暴海湾'), text: L('Hydraxis makes his island home among the reefs and rough water.', '海达克西斯住在礁石与急流间的一座岛上。') },
      { id: 'valormok', name: L('Valormok', '瓦罗莫克'), text: L('The Horde maintains a small post among the hills.', '部落在群山间设有一座小前哨。') }
    ],
    relatedZoneIds: [1440, 1454, 1427, 1428], sagaIds: ['three-hammers'], sourceIds: ['az-classic', 'az-tablets', 'az-water', 'az-core', 'history']
  });

  zone(1448, L('Felwood', '费伍德森林'), L('Northern Kalimdor', '卡利姆多北部'), '48–55', L('Felwood is a forest hurt by the Burning Legion. Druids tend what still grows, and the Timbermaw fight to hold their underground refuge against neighboring furbolgs.', '费伍德森林遭受燃烧军团的破坏。德鲁伊照料尚能生长的草木，木喉熊怪则奋力抵御邻近的熊怪，守住地下避难所。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('The road north passes corrupted groves and pools before it reaches Timbermaw Hold. Furbolgs in the forest’s old villages now attack outsiders. The Timbermaw still offer a chance to talk to those willing to help them.', '北上的道路穿过受污染的树林与水池，最后抵达木喉要塞。森林旧村里的熊怪如今攻击外来者，木喉熊怪却仍愿意与肯相助的人谈一谈。'), L('The Emerald Sanctuary and the setting around Bloodvenom Post show different ways of keeping a hold in this country. The druids’ work includes treating individual plants in woods that cannot yet support their own recovery.', '翡翠圣地和血毒岗哨周围的环境，显示了人们如何用不同的办法在此立足。森林尚难自行恢复，德鲁伊于是从救治一株株植物做起。')],
    history: [
      H(L('Third War', '第三次战争'), L('The Legion enters the forest', '燃烧军团进入森林'), L('The Burning Legion’s campaign leaves the forest corrupted, with demons still active among the old groves.', '燃烧军团的攻势使森林遭到腐化，战后仍有恶魔在古老的林地活动。')),
      H(L('Classic era', '经典旧世时期'), L('Small efforts to reclaim the wood', '一点点恢复森林'), L('Druids test methods of cleansing the land while the Timbermaw protect their own people at the northern passage.', '德鲁伊试验净化土地的方法，木喉熊怪则在北方通道保护自己的族人。'))
    ],
    storylines: [S('fw-restoration', L('Work on the living forest', '救治仍有生机的森林'), ['fw-cleansing']), S('fw-passage', L('The Timbermaw’s neighbors', '木喉的邻居'), ['fw-timbermaw'])],
    figureIds: ['grazle', 'donova'], factionIds: ['cenarion-circle', 'timbermaw'],
    places: [
      { id: 'emerald-sanctuary', name: L('Emerald Sanctuary', '翡翠圣地'), text: L('A camp on the southern road brings people together against the forest’s corruption.', '南路上的营地集合人手，应对森林的腐化。') },
      { id: 'bloodvenom', name: L('Bloodvenom Post', '血毒岗哨'), text: L('The Horde outpost stands by the river running west toward Darkshore.', '部落前哨位于向西流往黑海岸的河边。') },
      { id: 'timbermaw-hold', name: L('Timbermaw Hold', '木喉要塞'), text: L('The Timbermaw hold the tunnels toward Winterspring and Moonglade.', '木喉熊怪控制通往冬泉谷与月光林地的隧道。') }
    ],
    relatedZoneIds: [1440, 1439, 1450, 1452], sagaIds: ['corrupted-forests'], sourceIds: ['fw-classic', 'fw-cleansing', 'fw-timbermaw', 'manual']
  });

  zone(1449, L('Un’Goro Crater', '安戈洛环形山'), L('Southern Kalimdor', '卡利姆多南部'), '48–55', L('A wet jungle fills the crater between deserts. The expedition at its edge studies giant animals, colored crystals and the machinery set among them.', '两片沙漠之间的环形山里，长满湿润茂密的丛林。在盆地边缘扎营的考察队研究巨兽、彩色水晶，以及安置在它们之间的装置。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Tar pits, rivers and jungle rise around Fire Plume Ridge. The paths between them can hide giant creatures from view, even close to the northern camp where scholars try to understand the crater.', '沥青池、河流与丛林环绕火羽山。穿行其间时，哪怕离北方学者营地不远，巨兽也可能藏在视野之外。'), L('At Marshal’s Refuge, the experimenters compare loose crystals with large pylons standing elsewhere in the crater. Soil from the same country is useful in Darnassus, where it can be used to grow unfamiliar herbs.', '马绍尔营地的研究者把散落的水晶与盆地各处的大型水晶塔相比较。来自这里的泥土在达纳苏斯也派得上用场，可以用来栽培陌生的草药。')],
    history: [
      H(L('Long before the expedition', '考察队来到之前'), L('The old pylons', '古老的水晶塔'), L('Large crystal pylons stand around the crater, evidence of builders whose machinery has survived among the plants and animals.', '巨大的水晶塔分布在盆地四周。建造者留下的装置在动植物间存留至今。')),
      H(L('Classic era', '经典旧世时期'), L('A refuge becomes a research camp', '避难所成了考察营地'), L('The camp gathers scholars who make the crater’s soil and crystals subjects of experiment.', '学者聚在营地，把盆地里的泥土和水晶用于实验。'))
    ],
    storylines: [S('ug-fieldwork', L('Reading the crater', '读懂环形山'), ['ug-crystals', 'ug-soil'])],
    figureIds: ['fandral', 'collie'], factionIds: ['cenarion-circle'],
    places: [
      { id: 'marshals-refuge', name: L('Marshal’s Refuge', '马绍尔营地'), text: L('The northern camp provides shelter and a place to study samples.', '北面的营地可供避难，也是研究样本的地方。') },
      { id: 'fire-plume', name: L('Fire Plume Ridge', '火羽山'), text: L('The fiery ridge stands among the waterways and jungle of the basin.', '炽热的山峰立于盆地的河流和丛林之间。') },
      { id: 'eastern-pylon', name: L('Eastern Crystal Pylon', '东部水晶塔'), text: L('One of the large pylons J.D. Collie investigates.', '科琳调查的大型水晶塔之一。') }
    ],
    relatedZoneIds: [1446, 1451, 1457], sagaIds: [], sourceIds: ['ug-classic', 'ug-crystals', 'ug-pylon', 'da-grain']
  });

  zone(1450, L('Moonglade', '月光林地'), L('Northern Kalimdor', '卡利姆多北部'), '55–60', L('Around Lake Elune’ara, druids maintain a sanctuary shared across faction lines. The grove also gives them a place to face the troubles that come out of the Emerald Dream.', '艾露恩湖四周，德鲁伊照料着一处两大阵营都能使用的圣地。林地也是他们面对翡翠梦境中出现的祸患之处。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Nighthaven looks out over the lake, and Keeper Remulos tends a shrine to the west. The quiet of the valley contrasts with the dangers that druids encounter while working beyond it.', '永夜港俯瞰湖面，守护者雷姆洛斯照料西面的神殿。山谷里宁静无声，德鲁伊在外面工作时却会遭遇种种危险。')],
    history: [
      H(L('Before the Third War', '第三次战争之前'), L('A sanctuary for druids', '德鲁伊的圣地'), L('The grove is sacred to the druids, who gather here around the lake.', '这片林地是德鲁伊的圣地，他们在湖边集会。')),
      H(L('Classic era', '经典旧世时期'), L('A shared refuge', '双方共享的家园'), L('The Cenarion Circle gathers druids of both factions here. Remulos looks after the grove during their work against corruption.', '塞纳里奥议会在这里召集双方的德鲁伊。德鲁伊对抗腐化之际，雷姆洛斯负责照看林地。'))
    ],
    storylines: [S('mo-dream', L('When the Dream reaches the grove', '梦境蔓延到林地'), ['mo-remulos', 'mo-eranikus'])],
    figureIds: ['remulos', 'tyrande'], factionIds: ['cenarion-circle', 'timbermaw'],
    places: [
      { id: 'nighthaven', name: L('Nighthaven', '永夜港'), text: L('Druids gather and study in the settlement beside the lake.', '德鲁伊在湖边的聚落聚会、学习。') },
      { id: 'remulos-shrine', name: L('Shrine of Remulos', '雷姆洛斯神殿'), text: L('The keeper tends this shrine to the west of the lake.', '守护者照料湖西的神殿。') }
    ],
    relatedZoneIds: [1448, 1452, 1457, 1440, 1451], sagaIds: ['corrupted-forests', 'shifting-sands'], sourceIds: ['mo-classic', 'mo-tyrant', 'mo-redemption', 'manual', 'de-seed']
  });

  zone(1451, L('Silithus', '希利苏斯'), L('Southern Kalimdor', '卡利姆多南部'), '55–60', L('Silithid burrow through the desert north of Ahn’Qiraj. At Cenarion Hold, the druids grapple with a danger older than their outpost and prepare for what waits behind the sealed gate.', '异种虫在安其拉以北的沙漠里掘穴。塞纳里奥要塞的德鲁伊应付着远比据点古老的威胁，并为封闭大门后的敌人做准备。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Cenarion Hold overlooks the roads between three silithid hives. Twilight’s Hammer camps occupy the desert as well. At the southern edge, the Scarab Wall separates the outpost’s day-to-day fighting from the city behind it.', '塞纳里奥要塞俯瞰连接三处异种虫巢的道路。暮光之锤也在沙漠中扎营。南缘的甲虫之墙，把前哨日常应付的战斗与墙后的城市隔开。'), L('The gate was closed in a war remembered by elves and dragons. Fighting near the hives leads back to their unfinished business, and eventually to a new gathering of armies in the sand.', '这扇门是在一场精灵与巨龙都还记得的战争中关闭的。虫巢附近的战斗牵出那一战留下的未竟之事，后来又有大军在沙地上集结。')],
    history: [
      H(L('War of the Shifting Sands', '流沙之战'), L('The wall rises', '城墙升起'), L('Fandral Staghelm and his allies fight the {Qiraji}. The bronze dragon Anachronos raises the Scarab Wall with the aid of the other dragons and seals off Ahn’Qiraj.', '范达尔·鹿盔与盟友对抗{其拉虫人}。青铜龙阿纳克洛斯在其他巨龙协助下升起甲虫之墙，把安其拉封了起来。')),
      H(L('Classic era', '经典旧世时期'), L('An old war returns', '古老的战争再度来临'), L('The Cenarion Circle investigates new activity around the hives. Both factions supply a war effort for the reopening of the gates.', '塞纳里奥议会调查虫巢周围的新动向。两大阵营筹措军需，为重新开启大门做准备。'))
    ],
    storylines: [S('si-gates', L('The war at the Scarab Wall', '甲虫之墙前的战争'), ['si-memory', 'si-hives', 'si-gong'])],
    figureIds: ['fandral', 'anachronos'], factionIds: ['cenarion-circle', 'qiraji', 'twilight'],
    places: [
      { id: 'cenarion-hold', name: L('Cenarion Hold', '塞纳里奥要塞'), text: L('The {Cenarion Circle} investigates the desert from this outpost.', '{塞纳里奥议会}从这处前哨调查沙漠。') },
      { id: 'hive-regal', name: L('Hive’Regal', '雷戈虫巢'), text: L('One of the silithid hives from which the infestation spreads.', '虫群向外扩散的巢穴之一。') },
      { id: 'scarab-wall', name: L('Scarab Wall', '甲虫之墙'), text: L('The barrier seals off the old city of Ahn’Qiraj.', '屏障封住了安其拉古城。') }
    ],
    relatedZoneIds: [1446, 1449, 1450, 1447], sagaIds: ['shifting-sands'], sourceIds: ['si-classic', 'si-memory', 'si-hives', 'si-gong', 'si-war-effort', 'mo-tyrant', 'mo-redemption']
  });

  zone(1452, L('Winterspring', '冬泉谷'), L('Northern Kalimdor', '卡利姆多北部'), '55–60', L('The road from Timbermaw Hold emerges into a snowy valley. Furbolgs fight over its western reaches, while Everlook offers a place for merchants and specialists to work.', '从木喉要塞出来，道路进入一片雪谷。熊怪在西部争斗，永望镇则为商人和匠人提供了做事的地方。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Hot springs break through the snow in the west, close to the Timbermaw tunnels. The Winterfall furbolgs hold ground farther east, where travelers from Everlook have reason to watch their movements.', '西部温泉穿过积雪涌出，离木喉隧道不远。冬泉熊怪据守更东边的土地，从永望镇来的人得留意他们的动向。'), L('Everlook connects isolated settlements with outside trade. A craftsman there takes an interest in materials brought out of Blackrock Mountain, so events in a distant dungeon reach a workshop in a snowy town.', '永望镇让偏远聚落得以和外界交易。镇上一名匠人对从黑石山带出来的材料产生兴趣，于是遥远地下城里发生的事，传到了雪镇的一间工坊。')],
    history: [
      H(L('Before Classic', '经典旧世之前'), L('Furbolg country', '熊怪的土地'), L('Furbolgs make their homes in the valley and the tunnels leading west. Their communities take different courses in the face of corruption.', '熊怪在谷中和通往西边的隧道里安家。面对腐化，各部族走上不同的道路。')),
      H(L('Classic era', '经典旧世时期'), L('The town in the snow', '雪中城镇'), L('The goblins of Everlook establish a trading post amid the forest, furbolg territory and frost-covered ridges.', '永望镇的地精在树林、熊怪地盘与覆霜山脊之间建立贸易据点。'))
    ],
    storylines: [S('wi-winterfall', L('Signs of trouble among the Winterfall', '冬泉熊怪当中的异状'), ['wi-winterfall', 'wi-firewater']), S('wi-armor', L('An unusual shipment for Everlook', '送到永望镇的一件奇货'), ['wi-finkle'])],
    figureIds: ['finkle', 'donova'], factionIds: ['timbermaw', 'steamwheedle'],
    places: [
      { id: 'everlook', name: L('Everlook', '永望镇'), text: L('The cartel’s trading town brings artisans and merchants into the valley.', '财团的商镇把匠人和商人带到谷中。') },
      { id: 'frostfire', name: L('Frostfire Hot Springs', '冰火温泉'), text: L('Warm water emerges through the snow near the western tunnels.', '温热的水从靠近西部隧道的积雪间涌出。') },
      { id: 'winterfall-village', name: L('Winterfall Village', '寒水村'), text: L('Outsiders find armed Winterfall furbolgs gathered in the eastern settlement.', '外来者发现，武装的冬泉熊怪聚在这处东部聚落。') }
    ],
    relatedZoneIds: [1448, 1450, 1428], sagaIds: ['corrupted-forests', 'blackrock-brood'], sourceIds: ['wi-classic', 'wi-winterfall', 'wi-threat', 'wi-firewater', 'wi-corruption', 'wi-finkle']
  });

  zone(1454, L('Orgrimmar', '奥格瑞玛'), L('Central Kalimdor', '卡利姆多中部'), 'Capital city', L('Orgrimmar gathers the new Horde inside Durotar’s ravines. Thrall governs from the Valley of Wisdom while an inquiry into cultists leads beneath the city itself.', '奥格瑞玛把新部落聚集在杜隆塔尔的峡谷间。萨尔从智慧谷主持政务，一项追查邪教徒的调查却延伸到了城市下方。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('The Valley of Strength receives trade through the southern gate, and the Valley of Honor makes room for the city’s martial life. Thrall’s hall stands in the Valley of Wisdom. Darkspear and other allies have a place in the new capital alongside the orc clans.', '力量谷通过南门接纳商旅，荣誉谷则为城中习武的人提供场地。萨尔的大厅坐落在智慧谷。除了兽人各氏族，暗矛等盟友也在新都里有自己的位置。'), L('In the Cleft of Shadow, warlocks work near the entrance to Ragefire Chasm. The ravine’s tunnels hold dangers of their own, within reach of a warchief who has to think about enemies inside his walls as well as outside.', '暗影裂口的术士在怒焰裂谷入口附近活动。峡谷的隧道另有险情，大酋长在留意城外敌人的同时，也得提防近在城内的威胁。')],
    history: [
      H(L('After the Third War', '第三次战争之后'), L('A capital named for Doomhammer', '以毁灭之锤命名的都城'), L('Thrall’s people build their capital in Durotar and name it for Orgrim Doomhammer.', '萨尔的族人在杜隆塔尔建起都城，以奥格瑞姆·毁灭之锤的名字命名。')),
      H(L('Classic era', '经典旧世时期'), L('A coalition in one city', '各族在同一座城市共事'), L('Thrall and his allies govern from Orgrimmar. Its streets serve a new Horde grown beyond the old orc clans.', '萨尔与盟友从奥格瑞玛主持政务。城里的街道服务于早已不止兽人氏族的新部落。'))
    ],
    storylines: [S('or-danger', L('Enemies within the city', '城墙内的敌人'), ['dt-burning', 'or-hidden']), S('or-horde', L('The warchief’s account', '大酋长的讲述'), ['or-tale', 'bs-spire'])],
    figureIds: ['thrall', 'voljin', 'nefarian', 'neeru'], factionIds: ['horde', 'darkspear', 'burning-blade', 'warsong'],
    places: [
      { id: 'valley-strength', name: L('Valley of Strength', '力量谷'), text: L('The bank, auction house and other traders cluster by the main gate.', '银行、拍卖行和其他商家聚在正门附近。') },
      { id: 'valley-wisdom', name: L('Valley of Wisdom', '智慧谷'), text: L('Thrall holds court here in Grommash Hold.', '萨尔在谷中的格罗玛什堡处理政务。') },
      { id: 'cleft-shadow', name: L('Cleft of Shadow', '暗影裂口'), text: L('The hidden ravine contains the entrance to Ragefire Chasm.', '这处隐蔽的峡谷中有通往怒焰裂谷的入口。') }
    ],
    relatedZoneIds: [1411, 1413, 1412, 1440], sagaIds: ['new-horde', 'blackrock-brood'], sourceIds: ['or-classic', 'or-hidden', 'or-leaders', 'or-tale', 'manual', 'horde-founding', 'dt-skull', 'bs-rend']
  });

  zone(1456, L('Thunder Bluff', '雷霆崖'), L('Central Kalimdor', '卡利姆多中部'), 'Capital city', L('Thunder Bluff brings the tauren’s tents, councils and sacred places together above Mulgore. The city also looks outward, sending help to the Barrens and hearing offers from the Forsaken.', '雷霆崖把牛头人的帐篷、议事处与圣地聚在莫高雷上方。城里的人也关心外面的事，既向贫瘠之地派出援手，也听取被遗忘者的提议。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('Bridges join the occupied mesas. The central bluff holds the main market, while Elder Rise and Spirit Rise give the city space for different kinds of counsel and ceremony.', '桥梁把各座有人居住的台地连接起来。中央台地有主要市集，长者高地与灵魂高地则容纳各类议事与仪式。'), L('Cairne’s leadership grows out of the alliance that brought his people to this land. The city also gives Hamuul a place to guide druids and Magatha a place to voice the concerns of the Grimtotem.', '凯恩的领导源于当初将族人带来这片土地的同盟。城中也有哈缪尔指导德鲁伊、玛加萨代表恐怖图腾发言的地方。')],
    history: [
      H(L('Third War', '第三次战争'), L('The passage to Mulgore', '迁往莫高雷'), L('Cairne and the orcs make common cause against the centaur and the tauren cross to a new homeland.', '凯恩与兽人联手对抗半人马，牛头人得以迁往新的家园。')),
      H(L('Classic era', '经典旧世时期'), L('The city of the bluffs', '高崖上的城市'), L('Thunder Bluff serves as the tauren’s capital and a meeting place for their allies in the Horde.', '雷霆崖成为牛头人的都城，也是他们与部落盟友相会的地方。'))
    ],
    storylines: [S('tb-druids', L('The druids look to the Barrens', '德鲁伊关注贫瘠之地'), ['br-oases', 'br-nightmare']), S('tb-allies', L('An apothecary in Thunder Bluff', '雷霆崖的药剂师'), ['uc-allies', 'tb-forsaken'])],
    figureIds: ['cairne', 'hamuul', 'magatha', 'zamah'], factionIds: ['horde', 'cenarion-circle', 'grimtotem'],
    places: [
      { id: 'central-bluff', name: L('Thunder Bluff central mesa', '雷霆崖中央台地'), text: L('Market buildings gather around the tower on the central bluff.', '市集的建筑聚在中央台地的高塔周围。') },
      { id: 'elder-rise', name: L('Elder Rise', '长者高地'), text: L('Hamuul serves the city’s druids on this outlying mesa.', '哈缪尔在外围这座台地上指导城中的德鲁伊。') },
      { id: 'spirit-rise', name: L('Spirit Rise', '灵魂高地'), text: L('The Pools of Vision shelter seers and a Forsaken apothecary.', '预见之池有先知居住，也有一名被遗忘者的药剂师在那里做事。') }
    ],
    relatedZoneIds: [1412, 1413, 1450, 1458, 1442], sagaIds: ['new-horde'], sourceIds: ['tb-classic', 'tb-tarren', 'manual', 'horde-exodus', 'br-oases', 'br-naralex', 'br-nightmare', 'uc-allies']
  });

  zone(1457, L('Darnassus', '达纳苏斯'), L('Northern Kalimdor', '卡利姆多北部'), 'Capital city', L('Darnassus lies in the crown of Teldrassil. The priesthood, the Sentinels and the druids share a city built after a war that changed how long its people could expect to live.', '达纳苏斯坐落在泰达希尔树冠中。祭司、哨兵与德鲁伊共享这座战后建起的城市，那场战争也改变了居民的寿命。'), {
    complete: true,
    continent: 'kalimdor',
    overview: [L('The Temple of the Moon rises to the south, and the druids gather in the Cenarion Enclave to the north. Between them, the city opens onto water and terraces where people train, worship and trade. The passage to Rut’theran links them to the coast below.', '月神殿屹立在南面，德鲁伊则聚于北方的塞纳里奥区。两处之间有湖泊和台地，人们在那里训练、礼拜、交易。通往鲁瑟兰村的通道把城里与树下的海岸连接起来。'), L('Tyrande leads while Malfurion is absent. Fandral’s druids turn to new growth in a city that already owes its existence to a great effort of cultivation. Their experiments draw on soil from the other end of Kalimdor.', '玛法里奥缺席期间，泰兰德担负起领导之责。这座城本就因一次非凡的栽培得以建立，范达尔带领的德鲁伊又开始研究新的植物。他们从卡利姆多另一端取来土壤，进行试验。')],
    history: [
      H(L('Third War', '第三次战争'), L('The night elves lose an old blessing', '暗夜精灵失去古老祝福'), L('The defense at Mount Hyjal leaves the night elves without the immortality they had known.', '海加尔山的防卫战过后，暗夜精灵失去了曾经拥有的永生。')),
      H(L('After the Third War', '第三次战争之后'), L('A capital within a new tree', '新树里建起都城'), L('The night elves raise Teldrassil and make Darnassus their capital in its boughs.', '暗夜精灵种下泰达希尔，在枝干之间建立都城达纳苏斯。'))
    ],
    storylines: [S('da-world-tree', L('Settling in the crown', '在树冠中安家'), ['te-oracle', 'da-grain']), S('da-priestess', L('Petition at the temple', '在神殿向祭司陈情'), ['da-messenger'])],
    figureIds: ['tyrande', 'fandral'], factionIds: ['sentinels', 'cenarion-circle'],
    places: [
      P('moon-temple', L('Temple of the Moon', '月神殿'), 39.1, 81.6, L('Tyrande and the priestesses of Elune keep the city’s temple.', '泰兰德与艾露恩的女祭司守护城中的神殿。')),
      P('cenarion-enclave', L('Cenarion Enclave', '塞纳里奥区'), 34.8, 9.3, L('Fandral and other druids work in the enclave to the north.', '范达尔与其他德鲁伊在北部街区中工作。')),
      { id: 'warriors-terrace', name: L('Warrior’s Terrace', '战士区'), text: L('The Sentinels gather near the Hall of Justice.', '哨兵在正义大厅附近集结。') }
    ],
    relatedZoneIds: [1438, 1439, 1450, 1449], sagaIds: ['corrupted-forests'], sourceIds: ['da-classic', 'da-grain', 'da-temple', 'manual', 'mount-hyjal', 'te-crown']
  });

  zone(2482, L('Mount Hyjal', '海加尔山'), L('Northern Kalimdor', '卡利姆多北部'), '55–60', L('The mountain is recovering after Archimonde’s defeat. The ruins still hold traces of the Legion’s dead.', '阿克蒙德败亡后，海加尔山正在恢复生机，废墟里仍留有燃烧军团的遗骸。'), {
    complete: true,
    continent: 'kalimdor',
    map: 'maps/2482.jpg',
    overview: [L('Darkwhisper Gorge connects the high country with Winterspring. Above it, the land around Nordrassil bears the marks of the Third War. The Forever quests return to old battle sites and follow people dealing with what the Legion left behind.', '暗语峡谷把高山与冬泉谷相连。峡谷上方，诺达希尔周围仍有第三次战争留下的伤痕。无限服的任务重访昔日战场，讲述当地的人如何应对燃烧军团留下的威胁。')],
    places: [
      { id: 'darkwhisper-gorge', name: L('Darkwhisper Gorge', '暗语峡谷'), text: L('The ravine between Winterspring and the recovering mountain.', '连接冬泉谷与正在复苏的海加尔山的峡谷。') },
      { id: 'dae-gun', name: L('Ruins of Dae’gun', '达尔苟废墟'), text: L('The ruins hold the ashes of Archimonde’s lieutenant Azgalor.', '阿克蒙德的副将阿兹加洛的灰烬仍留在这片废墟。') }
    ],
    history: [H(L('Third War', '第三次战争'), L('The battle at Nordrassil', '诺达希尔之战'), L('Archimonde falls at Mount Hyjal. The night elves lose the immortality that Nordrassil had granted them.', '阿克蒙德在海加尔山败亡。暗夜精灵失去了诺达希尔曾赋予他们的永生。'))],
    storylines: [S('hy-legion-legacy', L('What the Legion left behind', '燃烧军团留下的痕迹'), ['hy-azgalor'])],
    figureIds: ['azgalor', 'ketharas'], relatedZoneIds: [1452, 1448, 1457], sourceIds: ['hy-forever', 'hy-zones', 'mount-hyjal', 'hy-ashes', 'forever-new-zones']
  });

  zone(2548, L('Riverglades', '河林'), L('Eastern Kingdoms', '东部王国'), '36–44', L('Farms, garrisons, and a goblin port share a river frontier where settlers are still trying to make a home.', '农庄、驻军和地精港口分布在河流沿岸，定居者仍在努力在这片边疆安家。'), {
    complete: true,
    map: 'maps/2548.jpg',
    overview: [L('The Brotherhood of the Horse, former riders of Stormwind, makes its home at Farholde Keep. The Horde holds Rog’mar, and the Steamwheedle route connects Powderfuse Port with Tanaris. Twilight’s Hammer attacks reach the farms, while ogre raiders strike from Krol’dok Stronghold.', '暴风城昔日的骑兵组成铁马兄弟会，在法霍德要塞安家。部落据守洛格玛，热砂港集团的航线将爆破引线港与塔纳利斯相连。暮光之锤袭击农庄，克罗多克要塞的食人魔也四处劫掠。')],
    places: [
      P('farholde', L('Farholde Keep', '法霍德要塞'), 60.6, 81.6, L('The southern stronghold of the Brotherhood of the Horse.', '铁马兄弟会在南部的据点。')),
      P('rogmar', L('Rog’mar', '洛格玛'), 59.6, 45.0, L('The Horde outpost in the middle of the frontier.', '部落设在边疆腹地的哨所。')),
      P('powderfuse', L('Powderfuse Port', '爆破引线港'), 80.6, 54.6, L('The goblin docks serve the route from Steamwheedle Port.', '地精在此经营码头，船只往返于这里与热砂港。'))
    ],
    history: [H(L('Before the local quests', '当地任务开始前'), L('The riders settle on the frontier', '骑兵在边疆落脚'), L('Outcasts from Stormwind’s cavalry found a new home on the east coast and build trade ties there. The zone sources give little detail on the date or the stages of the settlement.', '离开暴风城骑兵队的流亡者在东海岸建立新家，并在当地拓展贸易往来。现有区域资料很少提及定居的时间和经过。'))],
    storylines: [S('rg-frontier-families', L('The cost of the raids', '袭击的代价'), ['rg-elbrim'])],
    factionIds: ['brotherhood-of-the-horse', 'steamwheedle', 'twilight'], relatedZoneIds: [1433, 1418, 1428, 1446], sourceIds: ['rg-forever', 'rg-settlements', 'rg-farm', 'rg-stronghold']
  });

  zone(2652, L("Shen'dralas", '辛德拉'), L('Western Kalimdor', '卡利姆多西部'), '38–45', L('A temple and its fading crystal pylons preserve a remnant of the Shen’dralar amid the centaur country south of Desolace.', '凄凉之地以南是半人马的领地。一座神殿与逐渐衰弱的水晶塔，让一部分辛德拉族人得以留在这里。'), {
    complete: true,
    continent: 'kalimdor',
    map: 'maps/2652.jpg',
    overview: [L('Beyond the Valley of Bones, old elven buildings stand in country contested by centaur clans. The temple’s inhabitants connect the ruins to the Highborne of Eldre’Thalas and Dire Maul. The published quest text leaves much of the settlement’s early history unclear.', '越过白骨之谷，古老的精灵建筑矗立在半人马部族争夺的土地上。神殿的居民将废墟的历史与埃雷萨拉斯和厄运之槌的上层精灵联系起来。公开的任务文本对聚落早期的历史着墨不多。')],
    places: [
      { id: 'sd-temple', name: L('Temple of Shen’dralas', '辛德拉神殿'), text: L('Magister Kirandis and other Shen’dralar remain here, near the crystal that still shines.', '魔导师基兰迪斯和其他辛德拉族人仍守在这里，神殿里的水晶依然发光。') },
      { id: 'sd-pylon-ruins', name: L('Pylon ruins', '水晶塔废墟'), text: L('Mana elementals watch over the dwindling crystals outside the temple.', '法力元素守护着神殿外逐渐失去力量的水晶。') }
    ],
    history: [H(L('Before Forever’s restoration', '无限服修复晶塔之前'), L('Crystals among the ruins', '废墟中的水晶'), L('Ancient crystal pedestals were built over older elven ruins. By the time the story opens, the temple’s pylon still shines while others are running out of power.', '古老的水晶基座建在更早的精灵废墟上。故事开始时，神殿里的水晶塔依然明亮，其他晶塔的力量却已所剩无几。'))],
    storylines: [S('sd-temple-pylons', L('Restoring the pylons', '修复水晶塔'), ['sd-restore-pylons'])],
    figureIds: ['kirandis'], factionIds: ['shendralar'], relatedZoneIds: [1443, 1412, 1444], sourceIds: ['sd-forever', 'hy-zones', 'sd-pylons', 'sd-magister', 'forever-new-zones']
  });

  const sagas = {
    'fallen-lordaeron': {
      id: 'fallen-lordaeron', name: L('The lands of fallen Lordaeron', '洛丹伦沦陷后的土地'), complete: false,
      summary: L('Plagued grain brings down a kingdom. The free undead claim its capital while soldiers and families face what the Scourge left behind.', '受污染的谷物摧毁了一个王国。自由亡灵夺取王都，幸存的士兵与家人则面对天灾军团留下的一切。'),
      introduction: L('The fall of Lordaeron leaves several powers fighting across the same countryside. The Argent Dawn studies the tools of the Scourge. The Scarlet Crusade holds old fortresses. Under the ruined capital, the Forsaken turn to a new plague of their own.', '洛丹伦沦陷后，几股势力在同一片土地上交战。银色黎明研究天灾军团用来散播瘟疫的器具，血色十字军据守旧堡垒，被遗忘者则在王城废墟下研制自己的瘟疫。'),
      beatIds: ['uc-free', 'ti-awakening', 'ti-plague', 'hi-fields', 'uc-hillsbrad', 'al-papers', 'al-rings', 'ar-badges', 'sp-shackles', 'sp-keep', 'wp-cauldrons', 'wp-araj', 'ep-doll', 'ep-redpath', 'ep-mementos', 'wp-order'],
      zoneIds: [1416, 1417, 1420, 1421, 1422, 1423, 1424, 1458], figureIds: ['arthas', 'sylvanas', 'varimathras', 'tirion', 'taelan'],
      relatedSagaIds: ['new-horde'], sourceIds: ['arthas-history', 'manual', 'uc-classic', 'ti-awakening', 'ti-plague', 'hi-fields', 'uc-report', 'al-plans', 'al-rings', 'ar-badges', 'sp-shackles', 'sp-keep', 'wp-cauldrons', 'wp-araj', 'ep-doll', 'ep-battle', 'ep-redpath', 'ep-family', 'wp-order']
    },
    'new-horde': {
      id: 'new-horde', name: L('The Horde makes a home in Kalimdor', '部落在卡利姆多安家'), complete: true,
      summary: L('Orcs, Darkspear and tauren build new homes after years of captivity and flight. The roads between their settlements show what it takes to keep those homes.', '多年囚禁与流亡后，兽人、暗矛巨魔与牛头人建立了新家园。沿着聚落间的道路，可以看到他们为守住家园付出了什么。'),
      beatIds: ['or-tale', 'dt-isles', 'dt-tiragarde', 'mg-rites', 'mg-machines', 'br-oases', 'br-nightmare', 'dt-burning', 'or-hidden', 'tn-centaur', 'tb-forsaken'],
      zoneIds: [1411, 1412, 1413, 1441, 1445, 1454, 1456], figureIds: ['thrall', 'voljin', 'cairne', 'hamuul', 'magatha', 'jaina'],
      relatedSagaIds: ['fallen-lordaeron', 'blackrock-brood'], sourceIds: ['manual', 'horde-exodus', 'horde-founding', 'or-tale', 'dt-isles', 'dt-tiragarde', 'dt-skull', 'mg-rites', 'mg-hunt', 'mg-venture', 'br-oases', 'br-naralex', 'br-nightmare', 'or-hidden', 'or-leaders', 'tn-centaur', 'uc-allies', 'tb-tarren'],
      conclusion: L('The coast, the grasslands and the city have different enemies, but their people can now send word and call for aid from one settlement to the next.', '海岸、草原和城市各有敌人，但如今一处聚落可以把消息传到另一处，也可以向彼此求援。')
    },
    'blackrock-brood': {
      id: 'blackrock-brood', name: L('The black brood’s strongholds', '黑龙后裔的据点'), complete: false,
      summary: L('A report from the Burning Steppes leads into Blackrock Mountain, back to Stormwind and across the sea.', '燃烧平原的一份报告，把调查引入黑石山，又带回暴风城，最后跨过大海。'),
      beatIds: ['bs-dragonkin', 'bs-windsor', 'defias-prestor', 'dm-lair', 'bs-spire', 'wi-finkle'],
      zoneIds: [1428, 1445, 1452, 1453, 1454], figureIds: ['windsor', 'katrana', 'nefarian', 'finkle'],
      relatedSagaIds: ['three-hammers', 'defias', 'new-horde'], sourceIds: ['bs-menace', 'bs-true', 'bs-marshal', 'bs-note', 'bs-jail', 'court-reveal', 'dm-amulet', 'bs-rend', 'bs-orders', 'bs-lair', 'wi-finkle']
    },
    hakkar: {
      id: 'hakkar', name: L('The return of Hakkar', '哈卡归来'), complete: true,
      summary: L('The Atal’ai keep worshipping the blood god in exile. Their temple in the swamp and the Gurubashi capital tell two parts of his return.', '阿塔莱流亡后依然崇拜血神。沼泽里的神庙和古拉巴什都城，各自讲述了哈卡归来的一段经过。'),
      beatIds: ['ss-discovery', 'ta-spirits', 'ss-avatar', 'sv-heart'],
      zoneIds: [1434, 1435, 1446, 1425], figureIds: ['hakkar'],
      relatedSagaIds: [], sourceIds: ['hakkar-history', 'hakkar-wrath', 'ss-temple', 'ta-spirits', 'ta-egg', 'ss-avatar', 'sv-heart']
    },
    'shifting-sands': {
      id: 'shifting-sands', name: L('The War of the Shifting Sands', '流沙之战'), complete: false,
      summary: L('The dragons seal Ahn’Qiraj in the first war. When the hives stir again, old allies and new armies prepare to open the gate.', '第一场战争中，巨龙封闭安其拉。虫巢再度蠢动时，昔日盟友与新集结的军队准备开启大门。'),
      beatIds: ['si-memory', 'si-hives', 'mo-eranikus', 'si-gong'],
      zoneIds: [1451, 1446, 1450], figureIds: ['fandral', 'anachronos', 'remulos', 'tyrande'],
      relatedSagaIds: ['corrupted-forests'], sourceIds: ['si-memory', 'si-hives', 'si-gong', 'si-war-effort', 'mo-tyrant', 'mo-redemption']
    },
    defias: {
      id: 'defias', name: L('The Defias Brotherhood', '迪菲亚兄弟会'), complete: true,
      summary: L('The builders who restored Stormwind go unpaid. Their rebellion reaches the mines of Elwynn, the farms of Westfall and a garden inside Stormwind Keep.', '重建暴风城的工匠拿不到工钱。他们发起的反抗波及艾尔文森林的矿洞、西部荒野的农场，最后来到暴风要塞的一座花园。'),
      introduction: L('Edwin VanCleef knew Stormwind from the inside. After its nobles withheld pay from the workers who had rebuilt it, he led some of those workers into exile. What began in the city became a military threat in Westfall, where farmers and a local militia faced an organization gathering men and materials for an attack on the capital.', '艾德温·范克里夫对暴风城了如指掌。贵族拒绝支付重建工钱后，他领着一部分工匠离开了城市。这场始于城中的纷争，最终在西部荒野演变成武装威胁。农民和当地民兵不得不对付一个正在招兵买马、筹备攻打都城的组织。'),
      history: [H(L('After the Second War', '第二次战争之后'), L('Work without payment', '干了活却拿不到工钱'), L('Stormwind is rebuilt. A dispute over pay turns into a riot, and the stonemasons leave the city.', '暴风城重建完毕。劳资纠纷演变成骚乱，石工们出走。')), H(L('The Brotherhood grows', '兄弟会壮大'), L('A ship beneath Westfall', '西部荒野地下的战船'), L('The Defias take gold in Elwynn, raid farms in Westfall and build a ship in the Deadmines.', '迪菲亚兄弟会在艾尔文森林夺取黄金，在西部荒野袭击农场，并在死亡矿井建造战船。')), H(L('Classic-era present', '经典旧世时期'), L('The case returns to Stormwind', '案件回到暴风城'), L('VanCleef’s letter leads through the Stockade to Lescovar. Baros’s report reaches Lady Katrana Prestor at the keep.', '范克里夫的信将调查引向监狱，又从那里追查到莱斯科瓦。巴隆斯最后在要塞向卡特拉娜·普瑞斯托女士呈报。'))],
      beatIds: ['defias-rebuilding', 'defias-rupture', 'el-defias', 'wf-farms', 'wf-militia', 'defias-investigation', 'defias-ship', 'defias-letter', 'defias-visitor', 'defias-court', 'defias-report', 'defias-prestor'],
      zoneIds: [1453, 1436, 1433, 1429], figureIds: ['vancleef', 'tiffin', 'gryan', 'wiley', 'baros', 'bazil', 'thelwater', 'shaw', 'trias', 'tyrion', 'spybot', 'lescovar', 'marzon', 'katrana'],
      relatedSagaIds: ['gnomeregan'], sourceIds: ['defias', 'trail', 'elwynn-collector', 'letter', 'curious-visitor', 'shadow-past', 'attack', 'court-audience', 'court-reveal'],
      conclusion: L('VanCleef’s ship stays in its cavern, the Stockade riot ends, and the men meeting in the garden are dead. The account finally reaches the same court where the trouble began. Out in Westfall, the farmers and the militia still have fields and roads to reclaim.', '范克里夫的战船留在洞穴里，监狱暴动平息，在花园碰头的人也已身亡。事情终于呈报到当初引发纠纷的宫廷。西部荒野的农民和民兵仍有农田与道路等着收复。')
    },
    'three-hammers': { id: 'three-hammers', name: L('The Three Hammers & the Dark Iron threat', '三锤之战与黑铁威胁'), complete: true, summary: L('A succession dispute divides the dwarves, a desperate summoning scars the land, and an old feud finds new tunnels into Ironforge.', '王位之争使矮人分裂，绝望中的一次召唤在大地上留下伤痕。昔日宿敌如今又从地下通道进入铁炉堡。'), introduction: L('Begin with a kingdom that already contains three rival centers of power. The first war decides who holds Ironforge; the second changes the geography of the Eastern Kingdoms. Forever’s local raid on the ancestral vaults is a new episode in that inherited landscape, not the event that created it.', '故事始于一个早已有三股势力角力的王国。第一场战争决定谁统治铁炉堡，第二场改变了东部王国的地貌。无限服中对先祖密室的袭击，发生在那两场战争早已塑造的局势之下，是这段历史的新篇章。'), history: [H(L('Centuries ago · succession', '数百年前 · 王位继承'), L('Ironforge breaks apart', '铁炉堡分裂'), L('Modimus dies. The Bronzebeards win the capital, and the other clans leave.', '莫迪姆斯去世，铜须氏族赢得都城，其余两个氏族离开。')), H(L('The renewed war', '战火再起'), L('Two failed invasions', '两次失败的入侵'), L('Thaurissan attacks Ironforge and Modgud attacks Grim Batol. The defenders counterattack together.', '索瑞森进攻铁炉堡，莫德古德进攻格瑞姆巴托。守军联手反攻。')), H(L('The catastrophe', '灾变'), L('Fire reshapes the south', '大火重塑南方'), L('Ragnaros’s arrival destroys Thaurissan’s city and subjugates the survivors.', '拉格纳罗斯现身，摧毁索瑞森的城市，奴役幸存者。')), H(L('Classic / Forever present', '经典旧世及无限服时期'), L('An inherited threat', '延续至今的威胁'), L('The rival powers endure. Forever adds Farsen’s warning and the Hall of Thanes incursion.', '敌对势力仍然存在。无限服新增了法森发出警告和领主大厅遭到入侵的情节。'))], beatIds: ['hammers-succession', 'hammers-exile', 'hammers-invasion', 'hammers-fire', 'hammers-aftermath', 'dm-farsen', 'dm-vaults'], zoneIds: [1455, 1426, 1437, 1427, 1428, 1433, 1425, 1447], figureIds: ['modimus', 'madoran', 'khardros', 'thaurissan', 'modgud', 'ragnaros', 'dagran', 'magni', 'farsen'], relatedSagaIds: ['gnomeregan'], sourceIds: ['history', 'clans', 'farsen', 'incursion', 'thanes'], conclusion: L('The old war ends in separation and catastrophe. In the present, Magni’s response secures the breached vaults; it does not end the greater conflict with Shadowforge or Ragnaros. The treaty recovered from the dungeon is presented as an artifact, with its unstated meaning left open.', '昔日的战争以各族分离和一场灾难告终。如今麦格尼重新守住被攻破的密室，与暗炉城和拉格纳罗斯的更大冲突却仍在继续。从地下城取回的条约是一件历史遗物，文本没有说明的含义仍有待考证。') },
    gnomeregan: {
      id: 'gnomeregan', name: L('The fall of Gnomeregan', '诺莫瑞根的陷落'), complete: true,
      summary: L('Troggs break into a city under Dun Morogh. The gnomes lose their home and try to save the tools and knowledge they need to return.', '穴居人闯进丹莫罗地下的城市。失去故乡的侏儒设法保住返回家园所需的工具与知识。'),
      introduction: L('Gnomeregan was a capital of workshops, machines and buried halls. When troggs broke in, High Tinker Mekkatorque took Thermaplugg’s advice and flooded parts of the city with radiation. The gnomes who got out went to Ironforge. They brought their skills with them, and they soon had reason to go looking for what they had left behind.', '诺莫瑞根曾是一座布满工坊、机械与地下大厅的都城。穴居人闯入后，大工匠梅卡托克听从瑟玛普拉格的建议，让辐射淹没城中部分区域。逃出来的侏儒带着自己的技艺去了铁炉堡，不久便要回去寻找当时遗落的东西。'),
      history: [H(L('Before the invasion', '入侵之前'), L('The city under Dun Morogh', '丹莫罗地下的城市'), L('The gnomes build their capital in the western mountains and share their engineering with the Alliance.', '侏儒在西部山区修建都城，与联盟分享工程技术。')), H(L('Around the Third War', '第三次战争前后'), L('Breach and evacuation', '城破与撤离'), L('Troggs invade. The purge poisons the city and kills many of its inhabitants. Thermaplugg remains behind and takes control.', '穴居人入侵。辐射清剿使城市遭到污染，许多居民遇难。瑟玛普拉格留下来夺取了控制权。')), H(L('Classic-era present', '经典旧世时期'), L('Work in exile', '流亡中的努力'), L('Mekkatorque and his people live in Ironforge. They salvage records and machinery while trying to unseat Thermaplugg.', '梅卡托克与族人住在铁炉堡。他们一面抢救记录和机械，一面设法推翻瑟玛普拉格。'))],
      beatIds: ['dm-exile', 'dm-troggs', 'lm-stonesplinters', 'if-tram', 'gn-salvage', 'gn-shredder', 'gn-betrayal'],
      zoneIds: [1426, 1455, 1432, 1453, 1436], figureIds: ['mekkatorque', 'thermaplugg', 'castpipe', 'shoni'],
      relatedSagaIds: ['three-hammers', 'defias'], sourceIds: ['manual', 'ironforge', 'loch-troggs', 'gnome-dungeon', 'gnome-data', 'gnome-shoni', 'gnome-betrayal'],
      conclusion: L('Thermaplugg falls, and Castpipe gets information out of the old machines. Mekkatorque counts the death of his former adviser as one step toward taking the city back. In the Classic present, the survivors still call Tinker Town home.', '瑟玛普拉格倒下了，卡斯派普也从旧机器里取出了资料。梅卡托克把前顾问的死亡视为夺回家园的一步。经典旧世时期，幸存者仍以侏儒区为家。')
    },
    twilight: {
      id: 'twilight', name: L('The Twilight’s Hammer', '暮光之锤'), complete: true,
      summary: L('The cult’s camp at the Master’s Glaive leads to a scholar in Ironforge and a flooded sanctuary where captives are sacrificed to Aku’mai.', '邪教在主宰之剑扎营。循着线索查下去，会先遇到铁炉堡的一位学者，再发现一座淹没在水下的圣所，俘虏在那里被献祭给阿库麦尔。'),
      introduction: L('Onu, an Ancient in Darkshore, sees the Twilight’s Hammer taking an interest in a colossal blade and the remains beneath it. What the cult has left at the site is enough to send an inquiry as far as Ironforge and back to the other side of the sea. Under the Zoram Strand, the Argent Dawn and the Horde have found their own reasons to enter the same ruins.', '黑海岸的古树安努察觉，暮光之锤盯上了一把巨刃和它下方的遗骸。邪教留在现场的东西足以让调查一路追到铁炉堡，又从海的另一边折回。佐拉姆海岸下方，银色黎明和部落也各有理由进入同一片废墟。'),
      history: [H(L('The old coast', '古老的海岸'), L('A sanctuary sinks', '圣所沉没'), L('A night elf temple near the Zoram Strand is flooded after the Sundering. Its passages and shrines survive beneath the water.', '大分裂后，佐拉姆海岸附近一座暗夜精灵神殿被淹没。殿内的通道和神龛仍留在水下。')), H(L('The old Horde and after', '旧部落时期及以后'), L('From an orc clan to a cult', '从兽人氏族到邪教'), L('The Twilight’s Hammer takes its name from Cho’gall’s orc clan. Its later followers come from many peoples and seek the power of the Old Gods.', '暮光之锤沿用了古加尔麾下兽人氏族的名字。后来的信徒来自不同族群，都在追寻上古之神的力量。')), H(L('Classic-era present', '经典旧世时期'), L('Two sites on one coast', '同一海岸上的两处遗迹'), L('Twilight followers investigate the remains at the Master’s Glaive. In Blackfathom Deeps, Kelris and the naga hold the drowned temple and make sacrifices to Aku’mai.', '暮光之锤的信徒调查主宰之剑下的遗骸。在黑暗深渊，克尔里斯与纳迦盘踞在沉没的神殿中，向阿库麦尔献祭。'))],
      beatIds: ['ds-glaive', 'ds-deeps', 'tw-sapphires', 'tw-shrine'],
      zoneIds: [1439, 1455, 1440], figureIds: ['chogall', 'onu', 'gerrig', 'arbal', 'jeneu', 'thaelrid', 'kelris', 'akumai'],
      relatedSagaIds: ['corrupted-forests'], sourceIds: ['twilight-history', 'glaive', 'deeps', 'swelling-forces', 'bfd-classic', 'bfd-sapphires', 'bfd-kelris'],
      conclusion: L('Kelris and Aku’mai fall in the flooded halls. Thaelrid’s evidence establishes what this branch of the cult was doing, and Je’neu’s inquiry shows what the naga were taking from the tunnels. The stones at the Master’s Glaive still bear the marks of a much older fight.', '克尔里斯与阿库麦尔在被淹没的殿堂中倒下。塞尔瑞德的证据证实了这一支邪教所做的事，耶努的调查也揭示了纳迦在隧道中开采的东西。主宰之剑的石头上，仍有一场古老得多的战斗留下的痕迹。')
    },
    'corrupted-forests': {
      id: 'corrupted-forests', name: L('The night elves’ wounded forests', '暗夜精灵受创的森林'), complete: true,
      summary: L('Darkshore’s healers treat sick animals, Ashenvale’s defenders reckon with demons and war, and the mountain communities of Stonetalon try to regrow damaged land.', '黑海岸的治疗者照看染病的动物，灰谷的守卫应对恶魔与战争，石爪山脉的山民则设法让草木在受损的大地上重新生长。'),
      introduction: L('Darkshore, Ashenvale and Stonetalon give their caretakers different problems. A demon has taken hold among the Blackwood furbolgs. The Warsong come to Ashenvale for timber. In Stonetalon, Tammra Windfield looks at land damaged by industry and war and asks for seeds. The interpretation here is that the choices of those caretakers tell a connected story about trying to keep damaged places alive.', '黑海岸、灰谷和石爪山脉的看护者各有难处。恶魔在黑木熊怪中扎了根，战歌氏族为木材而来到灰谷，石爪山脉的塔姆拉·荒原看到工业和战争损毁的土地，便请人寻找种子。图志把这些选择解读为一个彼此呼应的故事：当地人如何让受损的家园继续存续。'),
      history: [H(L('After the Sundering', '大分裂之后'), L('Forests among the ruins', '废墟间的森林'), L('Night elf settlements and sacred places endure from the coast to the inland forests. Ancients and moonwells remain part of how the forests are tended.', '从海岸到内陆森林，暗夜精灵的聚落和圣地留存下来。古树和月亮井仍是照料森林不可或缺的一部分。')), H(L('Third War', '第三次战争'), L('Demons and the war for timber', '恶魔与争夺木材的战事'), L('War returns to the night elves’ homeland. The Warsong kill Cenarius in Ashenvale after drinking Mannoroth’s blood.', '战火重返暗夜精灵的故乡。战歌氏族饮下玛诺洛斯之血，在灰谷杀死塞纳留斯。')), H(L('Classic-era present', '经典旧世时期'), L('The work of repair', '修复家园'), L('Thundris confronts a demon afflicting the Blackwood, Raene investigates the furbolgs of Ashenvale, and the tauren seek new growth in Stonetalon.', '桑迪斯对抗危害黑木熊怪的恶魔，莱恩调查灰谷熊怪，牛头人则设法让石爪山脉重新长出草木。'))],
      beatIds: ['av-cenarius', 'av-warsong', 'ds-bears', 'ds-blackwood', 'ds-crystal', 'av-raene', 'av-satyrs', 'du-scythe', 'av-standstill', 'st-logging', 'st-vale', 'st-seeds', 'fw-cleansing', 'fw-timbermaw', 'te-moss', 'te-oracle'],
      zoneIds: [1439, 1440, 1442, 1431, 1438, 1448, 1450, 1452, 1457], figureIds: ['tharnariun', 'thundris', 'xabraxxis', 'cenarius', 'raene', 'krolg', 'velinde', 'albagorm', 'tammra'],
      relatedSagaIds: ['twilight'], sourceIds: ['darkshore', 'blackwood', 'crystal', 'ashen-third-war', 'ashen-warsong', 'ashen-raene', 'ashen-satyrs', 'scythe-history', 'howling-vale', 'st-standstill', 'st-logging', 'st-vale', 'st-seeds', 'st-new-life', 'fw-cleansing', 'fw-timbermaw', 'te-moss', 'te-oracle'],
      conclusion: L('The Blackwood cleansing names one demon. Raene’s work yields a living ally among the furbolgs. In the mountains, the people tending the land still have to deal with saws, harpies and burned soil. Tammra’s answer is to bring back seeds and give them a chance to grow.', '净化黑木熊怪的行动查明了一头恶魔的身份。莱恩在熊怪中找到了活着的盟友。在山中，照料土地的人仍要面对电锯、鹰身人和焦土。塔姆拉的办法是带回种子，给它们一个发芽的机会。')
    }
  };
  // One line per zone for the continent map's hover card. Levels only where no zone entry gives them.
  const Z = (levels, en, zh) => ({ levels: levels && (levels === 'city' ? L('Capital city', '主城') : L(levels, levels)), tagline: L(en, zh) });
  const briefs = {
    1416: Z('', 'Snowbound ruins of a traitor king’s realm, now held by ogres and the Syndicate.', '叛国之王领地的雪中废墟，如今被食人魔和辛迪加占据。'),
    1417: Z('', 'Stromgarde’s broken hills, the cradle of the first human kingdom.', '激流堡残破的丘陵，人类第一个王国的摇篮。'),
    1418: Z('', 'A sun-scorched waste of canyons, dragons and the ruins of Uldaman.', '烈日炙烤的峡谷荒原，有巨龙和奥达曼遗迹。'),
    1419: Z('', 'Scarred land around the Dark Portal, where the orcs first came through.', '黑暗之门周围的焦土，兽人最初由此进入艾泽拉斯。'),
    1420: Z('', 'Lordaeron’s haunted heartland, home of the Forsaken and the Scarlet Crusade.', '洛丹伦闹鬼的腹地，被遗忘者与血色十字军的据点。'),
    1421: Z('', 'Misty pine woods below the Greymane Wall, stalked by worgen.', '格雷迈恩之墙下雾气笼罩的松林，狼人在此出没。'),
    1422: Z('', 'Lordaeron’s farmland rotted by the plague, with Scholomance at its heart.', '被瘟疫腐蚀的洛丹伦农田，通灵学院位于其中。'),
    1423: Z('', 'The Scourge’s heartland, where Stratholme burned and the Argent Dawn holds on.', '天灾军团的腹地，斯坦索姆在此焚毁，银色黎明仍在坚守。'),
    1424: Z('', 'Farms and orchards where Southshore faces the Forsaken of Tarren Mill.', '农田与果园之间，南海镇与塔伦米尔的被遗忘者对峙。'),
    1425: Z('', 'Wild highlands of the Wildhammer dwarves and the Vilebranch trolls.', '蛮锤矮人与邪枝巨魔栖居的荒野高地。'),
    1426: Z('', 'Snowy home of the dwarves, and of the gnomes who lost Gnomeregan.', '矮人的雪原故乡，也是失去诺莫瑞根的侏儒的栖身之地。'),
    1427: Z('', 'Dark Iron mines and slag pits at the foot of Blackrock Mountain.', '黑石山脚下的黑铁矮人矿坑与熔渣池。'),
    1428: Z('', 'Ashen plains below Blackrock Spire, ruled by dragons and orcs.', '黑石塔下的灰烬平原，由黑龙和兽人统治。'),
    1429: Z('', 'Stormwind’s woods and farms, troubled by kobolds and Defias thieves.', '暴风城的林地与农田，狗头人和迪菲亚盗贼时常侵扰。'),
    1430: Z('', 'A dead valley around Karazhan, Medivh’s abandoned tower.', '卡拉赞周围死寂的山谷，麦迪文的高塔早已荒废。'),
    1431: Z('', 'A forest in permanent night, where Darkshire’s Night Watch guards the road.', '永夜笼罩的森林，夜色镇的守夜人守护着道路。'),
    1432: Z('', 'A dwarven valley of hills and roads below the Stonewrought Dam.', '石坝之下丘陵起伏、道路纵横的矮人山谷。'),
    1433: Z('', 'Lakeshire’s red hills, where Blackrock orcs still raid the farms.', '湖畔镇的红色山岭，黑石兽人仍在袭扰农庄。'),
    1434: Z('', 'Jungle of trolls, pirates and hunters, from Zul’Gurub to Booty Bay.', '巨魔、海盗与猎人的丛林，从祖尔格拉布延伸到藏宝海湾。'),
    1435: Z('', 'Mist over the sunken Temple of Atal’Hakkar.', '雾气笼罩着沉没的阿塔哈卡神庙。'),
    1436: Z('', 'Abandoned farms overrun by the Defias Brotherhood.', '被迪菲亚兄弟会占据的荒废农田。'),
    1437: Z('', 'Marshes between Menethil Harbor and the dwarven roads, with Dragonmaw camps.', '米奈希尔港与矮人道路之间的沼泽，龙喉兽人在此扎营。'),
    1453: Z('', 'The rebuilt human capital, with its king missing and its Stockade full.', '重建后的人类王都，国王下落不明，监狱人满为患。'),
    1455: Z('', 'The dwarven city carved around a great forge.', '环绕巨大熔炉开凿而成的矮人城市。'),
    1458: Z('', 'The Forsaken capital, beneath the ruins of Lordaeron.', '洛丹伦废墟之下的被遗忘者都城。'),
    1411: Z('', 'The orcs’ red, rocky homeland, named for Thrall’s father.', '兽人红色多岩的家园，以萨尔之父的名字命名。'),
    1412: Z('', 'Grassy plains of the tauren below Thunder Bluff.', '雷霆崖下牛头人的草原。'),
    1413: Z('', 'Savanna of the Horde’s roads, from the Crossroads to Ratchet.', '部落道路贯穿的草原，从十字路口通往棘齿城。'),
    1438: Z('', 'The night elves’ new World Tree, rising from the sea.', '从海中升起的暗夜精灵新世界之树。'),
    1439: Z('', 'A ruined night elf coast around the harbor of Auberdine.', '奥伯丁港周围暗夜精灵残破的海岸。'),
    1440: Z('', 'The night elves’ ancient forest, cut by Warsong lumber camps.', '暗夜精灵的古老森林，战歌伐木营正在砍伐。'),
    1441: Z('', 'Stone spires and salt flats where centaur clans roam.', '石柱林立、盐滩广布，半人马部族在此游荡。'),
    1442: Z('', 'Pine peaks of druids and refugees, scarred by Venture Co. loggers.', '德鲁伊与难民栖身的松林山峰，被风险投资公司的伐木场破坏。'),
    1443: Z('', 'A grey wasteland of centaur wars and demon ruins.', '半人马战火与恶魔遗迹遍布的灰色荒原。'),
    1444: Z('', 'Rain-soaked forest of giant trees around the ruins of Dire Maul.', '巨树参天、雨水丰沛的森林，环绕着厄运之槌的废墟。'),
    1445: Z('', 'Theramore’s swamp, home of black dragons and Onyxia’s lair.', '塞拉摩所在的沼泽，黑龙和奥妮克希亚巢穴的所在。'),
    1446: Z('', 'Desert of goblins at Gadgetzan and trolls at Zul’Farrak.', '加基森地精与祖尔法拉克巨魔所在的沙漠。'),
    1447: Z('', 'Shores of ruined Highborne cities, haunted by naga and demons.', '上层精灵城市废墟所在的海岸，纳迦与恶魔出没。'),
    1448: Z('', 'A forest corrupted by the Burning Legion’s fel.', '被燃烧军团邪能腐化的森林。'),
    1449: Z('', 'A primordial jungle crater of dinosaurs and titan secrets.', '恐龙出没、藏着泰坦秘密的远古丛林盆地。'),
    1450: Z('', 'A sacred druid sanctuary around Lake Elune’ara.', '环绕艾露恩湖的德鲁伊圣地。'),
    1451: Z('', 'Desert of silithid hives above Ahn’Qiraj.', '安其拉之上异种虫巢穴遍布的沙漠。'),
    1452: Z('', 'Snowy valleys of furbolgs, frostsabers and Everlook’s goblins.', '熊怪、霜刃豹与永望镇地精所在的雪谷。'),
    1454: Z('', 'Thrall’s capital, built for the new Horde.', '萨尔为新部落建立的都城。'),
    1456: Z('', 'The tauren city on the mesas above Mulgore.', '建于莫高雷台地之上的牛头人城市。'),
    1457: Z('', 'The night elf city in Teldrassil’s branches.', '坐落于泰达希尔枝干间的暗夜精灵城市。'),
    2482: Z('', 'The site of Archimonde’s defeat, where the mountain is still recovering.', '阿克蒙德败亡之地，群山仍在恢复生机。'),
    2548: Z('', 'Farms, old grudges, and a goblin port on the eastern coast.', '东部海岸的农庄、宿怨与地精港口。'),
    2652: Z('', 'A temple whose fading crystals sustain the Shen’dralar.', '逐渐黯淡的水晶维系着神殿里的辛德拉族人。')
  };

  /* Chain retellings: second person, past tense, in story order. Each chapter groups consecutive
     steps from chains.js; `recap` is the one-line version used in the session recap. Text paraphrases
     the quest text; quotes are short. `meaning` places the chain in the wider story;
     `links` names related chains; cast IDs link the same person across chains, and `chapter` is where
     each person first appears, so the cast never names someone from a chapter still hidden. */
  const quote = (text, by) => ({ quote: text, by });
  const untold = { hook: null, chapters: [], meaning: null, cast: [], links: [], sourceIds: [] };
  const chains = {
    'missing-diplomat': {
      hook: L('A Stormwind envoy to Lady Jaina Proudmoore never reached Theramore, and the Bishop wants it kept quiet.',
        '一位派往塞拉摩面见吉安娜·普罗德摩尔的暴风城使节始终没有抵达，主教希望此事秘而不宣。'),
      chapters: [
        { title: L('A Discreet Matter', '不可声张的事'), stepIds: [1274, 1241, 1242],
          recap: L('Bishop DeLavey told you a diplomat bound for Theramore had vanished, and sent you to his quiet allies.',
            '德拉维主教告诉你，一位前往塞拉摩的使节失踪了，并让你去找他暗中的帮手。'),
          text: [
            L('It began with a quiet word from a man named Thomas: Bishop DeLavey needed someone who could keep a secret. In Stormwind Keep the Bishop explained why. A diplomat sent to Theramore to meet Lady Jaina Proudmoore had never arrived. He suspected the Defias, and he did not want anyone to learn the kingdom had lost its envoy.',
              '一切始于一个叫托马斯的人悄悄递来的话：德拉维主教需要一个守得住秘密的人。在暴风要塞里，主教说明了原委。一位派往塞拉摩面见吉安娜·普罗德摩尔的使节始终没有抵达。他怀疑是迪菲亚兄弟会干的，也不想让任何人知道王国弄丢了自己的使节。'),
            L('He sent you to Jorgen, who agreed to help only reluctantly, and Jorgen’s sealed note sent you on to an unlikely contact: Elling Trias, who sells cheese in the Trade District.',
              '他让你去找乔贞。乔贞勉强答应帮忙，又用一封密封的便笺把你引向一个意想不到的联络人：在贸易区卖奶酪的埃林·提亚斯。')
          ] },
        { title: L('The Docket at Addle’s Stead', '艾德尔农场的记事本'), stepIds: [1243, 1244, 1245],
          recap: L('You found a Defias docket at Addle’s Stead that named the plot’s “Fist”.',
            '你在艾德尔农场找到一本迪菲亚记事本，上面提到了阴谋中的“拳头”。'),
          text: [
            L('Trias’s lead pointed south. Watcher Backus, on Darkshire’s north road, read the note and asked what Trias needed. The answer lay west, at Addle’s Stead, where you found a Defias docket. It looked official. The Brotherhood keeps careful records.',
              '提亚斯的线索指向南方。夜色镇北路上的守夜人巴库斯读过便笺，问提亚斯需要什么。答案在西边的艾德尔农场，你在那里找到了一本迪菲亚记事本。它看起来像是正式文件。兄弟会的记录一向一丝不苟。'),
            L('Back in Stormwind, Trias read it closely. The kidnapping had been planned, and one name stood out: Fist.',
              '回到暴风城，提亚斯仔细读了一遍。这起绑架是预谋好的，其中一个名字格外显眼：“拳头”。')
          ] },
        { title: L('Fist', '拳头'), stepIds: [1246, 1447, 1247],
          recap: L('You beat the truth out of Dashel Stonefist. The trail now leads to a man called Slim in Menethil.',
            '你打得达舍尔·石拳说了实话。线索如今指向米奈希尔港一个叫“干柴”的人。'),
          text: [
            L('The man called Fist was Dashel Stonefist, a brawler in Old Town. He would not discuss his affairs, so the conversation became a fight. Beaten, he finally talked.',
              '“拳头”就是旧城区的打手达舍尔·石拳。他不肯谈自己的事，于是谈话变成了一场架。被打服之后，他终于开了口。'),
            L('It was not enough. Trias learned the plan Dashel served had already failed, and the Defias had a backup: an inside man called Slim, working out of Menethil Harbor.',
              '但这还不够。提亚斯得知，达舍尔参与的计划早已失败，而迪菲亚还有后手：一个叫“干柴”的内应，在米奈希尔港活动。')
          ] },
        { title: L('Slim', '干柴'), stepIds: [1248, 1249, 1250],
          recap: L('You caught Slim in Menethil’s tavern and learned the truth: the missing diplomat was the King of Stormwind.',
            '你在米奈希尔的酒馆里抓住了“干柴”，并得知了真相：失踪的使节正是暴风城的国王。'),
          text: [
            L('Trias’s contact in Menethil Harbor was Mikhail, a Stormwind man retired from the underground to pour ale. He welcomed you loudly, then dropped his voice at Trias’s name.',
              '提亚斯在米奈希尔港的联络人是米克哈尔，一个从地下行当退下来、在酒馆倒麦酒的暴风城人。他大声招呼你，听到提亚斯的名字后立刻压低了声音。'),
            quote(L('Keep your voice down, my friend. This isn’t something for the whole tavern to hear about.', '小声点，朋友。这事可不能让整个酒馆都听见。'),
              L('Mikhail', '米克哈尔')),
            L('The man by the exit was listening too closely. That was Tapoke Jahn, and you subdued him before he could slip away. Even Mikhail was surprised: that was Slim.',
              '门口那个人听得太仔细了。他叫塔伯克·贾恩，你在他溜走之前制服了他。连米克哈尔都很意外：原来他就是“干柴”。'),
            L('Then the case changed. The Defias had not taken a minor envoy. They had taken the King of Stormwind, on his way to meet Jaina Proudmoore in secret. Slim’s part had been getting their man aboard the king’s ship while it lay in the harbor. The man’s name was Hendel.',
              '接着，整件事变了样。迪菲亚劫走的不是什么小使节，而是暴风城的国王：他正要去秘密会见吉安娜·普罗德摩尔。“干柴”的任务是趁国王的船停在港口时，把他们的人送上船。那个人叫亨德尔。')
          ] },
        { title: L('Theramore', '塞拉摩'), stepIds: [1264, 1265, 1266, 1324, 1267],
          recap: L('You subdued Private Hendel in Dustwallow Marsh, and Jaina Proudmoore thanked you in private.',
            '你在尘泥沼泽制服了亨德尔下士，吉安娜·普罗德摩尔私下向你道谢。'),
          text: [
            L('Hendel was a Kul Tiras marine, and the marines spent their pay in Theramore’s tavern. Mikhail sent you to Commander Samaul, who leads Lady Proudmoore’s forces there. Samaul was wary of anyone Elling sent, but he helped. Hendel was not at Sentry Point, the first tower outside the city.',
              '亨德尔是一名库尔提拉斯陆战队员，陆战队员领了军饷都会去塞拉摩的酒馆。米克哈尔让你去找统领普罗德摩尔女士部队的指挥官萨穆尔。萨穆尔对埃林派来的人心存戒备，但还是帮了忙。亨德尔并不在城外的第一座哨塔警戒哨岗。'),
            L('Back in Theramore, Archmage Tervosh explained that other sources had already told Lady Proudmoore what you knew, and she wanted you to have help. He sent you to the tents along the western road, where Hendel guarded the scouts watching the Horde at Brackenwall.',
              '回到塞拉摩，大法师特沃什告诉你，别的消息来源早已把你知道的事告诉了普罗德摩尔女士，她希望有人协助你。他把你派往西边路旁的帐篷，亨德尔在那里守卫着监视蕨墙村部落的侦察兵。'),
            quote(L('You come here accusing me of allying with the Defias, and think I’ll just stand here while you insult me?!', '你跑来指控我勾结迪菲亚，还以为我会站着任你侮辱？！'),
              L('Private Hendel', '亨德尔下士')),
            L('Theramore needed him alive, so you subdued him. Hendel was taken to the city for questioning. Then Lady Jaina Proudmoore thanked you herself. She could not thank you openly, she said, but she meant it, and she gave you her signet ring.',
              '塞拉摩需要活口，所以你制服了他。亨德尔被押回城里审问。随后吉安娜·普罗德摩尔亲自向你道谢。她说她无法公开感谢你，但这份谢意是真诚的，并把她的印戒送给了你。')
          ] }
      ],
      meaning: {
        title: L('The King Is Missing', '国王失踪了'),
        text: [
          L('The diplomat was King Varian Wrynn. He sailed from Menethil for a secret meeting with Jaina Proudmoore and never arrived. The Defias took him, with help from a man aboard his own ship, and his young son Anduin was crowned in his place.',
            '那位使节就是国王瓦里安·乌瑞恩。他从米奈希尔出海，准备秘密会见吉安娜·普罗德摩尔，却再也没有抵达。迪菲亚在他自己船上的内应帮助下劫走了他，他年幼的儿子安度因随后加冕。'),
          L('Catching Hendel gives Theramore a lead, not a rescue. When this story ends, the king is still missing, and in Stormwind, Lady Katrana Prestor tells visitors he is “away on a diplomatic mission.”',
            '抓到亨德尔只是给塞拉摩留下了一条线索，并不是营救。故事结束时，国王依然下落不明；而在暴风城，卡特拉娜·普瑞斯托女伯爵对来访者说，他“正在外执行外交任务”。')
        ]
      },
      cast: [
        { id: 'bishop-delavey', chapter: 1, name: L('Bishop DeLavey', '德拉维主教'), role: L('Keeps the kingdom’s quiet business quiet.', '替王国处理不宜声张的事务。') },
        { id: 'elling-trias', chapter: 1, name: L('Elling Trias', '埃林·提亚斯'), role: L('A cheesemonger who is more than he seems.', '一个不简单的奶酪商。') },
        { id: 'watcher-backus', chapter: 2, name: L('Watcher Backus', '守夜人巴库斯'), role: L('Trias’s contact on Darkshire’s north road.', '提亚斯在夜色镇北路的联络人。') },
        { id: 'dashel-stonefist', chapter: 3, name: L('Dashel Stonefist', '达舍尔·石拳'), role: L('Old Town brawler, the “Fist” in the docket.', '旧城区的打手，记事本里的“拳头”。') },
        { id: 'mikhail', chapter: 4, name: L('Mikhail', '米克哈尔'), role: L('Retired from Stormwind’s underground, now a Menethil bartender.', '从暴风城地下行当退休，如今在米奈希尔当酒保。') },
        { id: 'slim', chapter: 4, name: L('Tapoke “Slim” Jahn', '“干柴”塔伯克·贾恩'), role: L('The Defias inside man in Menethil.', '迪菲亚在米奈希尔的内应。') },
        { id: 'private-hendel', chapter: 5, name: L('Private Hendel', '亨德尔下士'), role: L('The Kul Tiras marine who got the Defias aboard the king’s ship.', '把迪菲亚的人送上国王座船的库尔提拉斯陆战队员。') },
        { id: 'jaina-proudmoore', chapter: 5, name: L('Lady Jaina Proudmoore', '吉安娜·普罗德摩尔'), role: L('Ruler of Theramore, whom the king was sailing to meet.', '塞拉摩的统治者，国王此行要会见的人。') },
        { id: 'katrana-prestor', chapter: 5, name: L('Lady Katrana Prestor', '卡特拉娜·普瑞斯托女伯爵'), role: L('Royal councilor beside the throne.', '王座旁的皇家顾问。') }
      ],
      links: ['unsent-letter'],
      sourceIds: ['md-start']
    },
    'unsent-letter': {
      hook: L('A letter found on VanCleef’s body leads to a traitor in the House of Nobles, and to the throne room.',
        '范克里夫尸体上的一封信，牵出了贵族院里的叛徒，也把你带到了王座之前。'),
      chapters: [
        { title: L('A Letter on a Dead Man', '死者身上的信'), stepIds: [373, 389],
          recap: L('You carried VanCleef’s letter to the City Architect and learned why the Stonemasons turned on Stormwind.',
            '你把范克里夫的信交给城市建筑师，得知了石匠们为何与暴风城反目。'),
          text: [
            L('Edwin VanCleef died in the Deadmines with a sealed letter on him, addressed to Baros Alexston, City Architect of Stormwind. Alexston was surprised to hear VanCleef was dead, but not by what he read.',
              '艾德温·范克里夫死在死亡矿井，身上带着一封封好的信，收信人是暴风城的城市建筑师巴隆斯·阿历克斯顿。听说范克里夫死了，阿历克斯顿很意外；信里的内容却没让他意外。'),
            quote(L('An idealist as ever, and a romantic. Revenge has consumed him.', '还是那个理想主义者，那个浪漫的人。复仇已经吞噬了他。'),
              L('Baros Alexston', '巴隆斯·阿历克斯顿')),
            L('Then he told you the story behind the Defias. VanCleef and Bazil Thredd were Stonemasons who rebuilt Stormwind, and the nobles refused to pay them. VanCleef led a riot and left the city. Thredd was still here, in the Stockade, and might know what VanCleef had planned.',
              '随后他讲起了迪菲亚兄弟会的来历。范克里夫和巴基尔·斯瑞德都是重建暴风城的石匠，贵族们却拒绝付给他们工钱。范克里夫带头暴动，离开了这座城市。斯瑞德还在城里，关在监狱中，也许知道范克里夫的计划。')
          ] },
        { title: L('Riot in the Stockade', '监狱暴动'), stepIds: [391, 392],
          recap: L('You ended the Stockade riot with Bazil Thredd’s head, and learned of his quiet visitor.',
            '你带回巴基尔·斯瑞德的头颅平息了监狱暴动，也得知了他那位沉默的访客。'),
          text: [
            L('Warden Thelwater did not trust you. Thredd had turned his prison into a riot, and only Thredd’s head would end it. You went into the cells and brought it back.',
              '典狱官塞尔沃特并不信任你。斯瑞德把他的监狱变成了暴动现场，只有斯瑞德的人头才能平息这一切。你走进牢房，把它带了回来。'),
            L('That earned you one more secret: for months a quiet visitor had come to see Thredd. He gave his name as Maelik.',
              '这为你换来了另一个秘密：几个月来，一直有个沉默的访客来探望斯瑞德。他自称梅里克。')
          ] },
        { title: L('Maelik', '梅里克'), stepIds: [393, 350],
          recap: L('SI:7 put a name to the visitor: Marzon, an assassin working for Lord Gregor Lescovar.',
            '军情七处查明了访客的身份：为葛瑞格·莱斯科瓦公爵效力的刺客马尔松。'),
          text: [
            L('Alexston did not know the name, but SI:7 might. Master Mathias Shaw did. Maelik was an alias of Marzon the Silent Blade, an assassin who now worked for Lord Gregor Lescovar of the House of Nobles.',
              '阿历克斯顿没听过这个名字，但军情七处也许知道。马迪亚斯·肖尔大师果然知道：梅里克是沉默之刃马尔松的化名，这个刺客如今为贵族院的葛瑞格·莱斯科瓦公爵效力。'),
            L('With VanCleef and Thredd dead, no witness was left to convict a lord. So Shaw sent you to a man he did not like: Elling Trias, the cheesemonger.',
              '范克里夫和斯瑞德都已死去，再没有证人能让一位公爵定罪。于是肖尔把你派去找一个他并不喜欢的人：奶酪商埃林·提亚斯。')
          ] },
        { title: L('The Garden', '花园'), stepIds: [2745, 2746, 434],
          recap: L('You overheard Lescovar and Marzon in the Keep’s garden, and killed them both.',
            '你在要塞花园里偷听了莱斯科瓦和马尔松的密谈，并杀死了他们两人。'),
          text: [
            L('Justice here, Trias said, would not be legal. His partner Tyrion, a gnome hiding in the bushes of the Keep’s garden, had been watching Lescovar. He needed a disguise for his Spybot: silk cloth and fresh apples from Clara’s farm.',
              '提亚斯说，这一次的正义不会是合法的。他的搭档泰里恩是个躲在要塞花园灌木丛里的侏儒，一直在监视莱斯科瓦。他需要给自己的侦察机器人做一身伪装：丝绸，再加上克拉拉农场的新鲜苹果。'),
            L('Dressed as a priestess, the Spybot went into Lescovar’s library. Soon Lescovar came out to the garden to meet Marzon, and you listened as they spoke of the Defias.',
              '扮成女牧师的侦察机器人走进了莱斯科瓦的书房。不久，莱斯科瓦来到花园与马尔松碰头，你听着他们谈论迪菲亚兄弟会。'),
            quote(L('The Defias shall succeed! No meek adventurer will stop us!', '迪菲亚必将成功！没有哪个软弱的冒险者能阻止我们！'),
              L('Marzon the Silent Blade, moments before you killed him', '沉默之刃马尔松，在你杀死他之前'))
          ] },
        { title: L('Quiet Justice', '无声的正义'), stepIds: [394, 395, 396],
          recap: L('You delivered the report on the Defias to the throne, and Lady Prestor received it.',
            '你把关于迪菲亚兄弟会的报告送到王座前，由普瑞斯托女伯爵收下。'),
          text: [
            L('“Your justice was swift,” Shaw told you, and asked you never to speak of Trias. Alexston had heard Lescovar was found dead. He thanked you for stopping VanCleef’s revenge and wrote a report on the Defias Brotherhood for the king.',
              '“你的正义来得真快。”肖尔对你说，并叮嘱你永远别提起提亚斯。阿历克斯顿听说莱斯科瓦被发现死了。他感谢你阻止了范克里夫的复仇，并为国王写了一份关于迪菲亚兄弟会的报告。'),
            L('But King Varian was “away on a diplomatic mission,” so the report went to the royal councilor beside the throne, Lady Katrana Prestor. She said you were to be commended, and gave you the Seal of Wrynn.',
              '然而瓦里安国王“正在外执行外交任务”，于是报告交到了王座旁的皇家顾问卡特拉娜·普瑞斯托女伯爵手中。她说你理应受到嘉奖，并授予你乌瑞恩之印。')
          ] }
      ],
      meaning: {
        title: L('The Report Went to the Dragon', '报告落入了巨龙之手'),
        text: [
          L('Lady Katrana Prestor was Onyxia, the black dragon, in human form. In the wider story she fed the quarrel between the Stonemasons and the nobles that gave birth to the Defias, and the king she called “away” had been taken by the Defias on her plan.',
            '卡特拉娜·普瑞斯托女伯爵其实是化身人形的黑龙奥妮克希亚。在更大的故事里，正是她煽动了石匠与贵族之间的争端，催生了迪菲亚兄弟会；而她口中“在外”的国王，也是按她的计划被迪菲亚掳走的。'),
          L('You ended VanCleef’s conspiracy and handed its report to the one who had used it. The quest never says so. The truth comes out in Dragonkin Menace.',
            '你终结了范克里夫的阴谋，却把报告交给了利用这场阴谋的人。任务本身从未点破这一点。真相要到“黑龙的威胁”才会揭开。')
        ]
      },
      cast: [
        { id: 'baros-alexston', chapter: 1, name: L('Baros Alexston', '巴隆斯·阿历克斯顿'), role: L('City Architect, and the letter’s addressee.', '城市建筑师，那封信的收信人。') },
        { id: 'mathias-shaw', chapter: 3, name: L('Mathias Shaw', '马迪亚斯·肖尔'), role: L('Master of SI:7, Stormwind’s spies.', '暴风城间谍组织军情七处的首领。') },
        { id: 'elling-trias', chapter: 3, name: L('Elling Trias', '埃林·提亚斯'), role: L('The cheesemonger who arranges justice that is “not legal”.', '安排“不合法”正义的奶酪商。') },
        { id: 'gregor-lescovar', chapter: 3, name: L('Lord Gregor Lescovar', '葛瑞格·莱斯科瓦公爵'), role: L('A noble who worked with the Defias.', '与迪菲亚勾结的贵族。') },
        { id: 'marzon', chapter: 3, name: L('Marzon the Silent Blade', '沉默之刃马尔松'), role: L('Lescovar’s assassin, known to the Defias as Maelik.', '莱斯科瓦的刺客，迪菲亚称他为梅里克。') },
        { id: 'katrana-prestor', chapter: 5, name: L('Lady Katrana Prestor', '卡特拉娜·普瑞斯托女伯爵'), role: L('Royal councilor beside the throne.', '王座旁的皇家顾问。') }
      ],
      links: ['missing-diplomat', 'onyxia-alliance'],
      sourceIds: ['ul-chain', 'ul-onyxia']
    },
    'on-guard-in-stonetalon': untold,
    'welcome-to-the-jungle': untold,
    'claws-from-the-deep': untold,
    'howling-vale': untold,
    'deliveries-to-sven': untold,
    'the-hermit': untold,
    'legend-of-stalvan': untold,
    'defias-brotherhood': untold,
    'onyxia-alliance': untold
  };

  root.WORLD = { version: 1, title: L('Azeroth, in context', '艾泽拉斯全景'), setting: L('Classic-era world · Forever additions identified', '经典旧世的艾泽拉斯 · 标注无限服新增内容'), zones, briefs, sagas, beats, figures, factions, sources, chains, glossary: {} };
})(globalThis);

// Re-cut from the original primer; personal references and later-era assumptions removed.
Object.assign(WORLD.glossary, {
  'horde': { id: 'horde', name: { en: 'Horde', zh: '部落' }, text: { en: 'Thrall’s alliance of orcs, Darkspear trolls, tauren and Forsaken in the Classic era.', zh: '经典旧世时期由萨尔领导的联盟，成员包括兽人、暗矛巨魔、牛头人和被遗忘者。' } },
  'syndicate': { id: 'syndicate', name: { en: 'Syndicate', zh: '辛迪加' }, text: { en: 'A network led by nobles of fallen Alterac. Its agents operate in the mountains and in neighboring human lands.', zh: '由奥特兰克亡国贵族领导的组织，成员在山中和周边的人类领地活动。' } },
  'cenarion-circle': { id: 'cenarion-circle', name: { en: 'Cenarion Circle', zh: '塞纳里奥议会' }, text: { en: 'The druidic order that tends sacred groves, studies corruption and maintains a force at Silithus.', zh: '德鲁伊组织，照看圣林、研究腐化，并在希利苏斯派驻人手。' } },
  'qiraji': { id: 'qiraji', name: { en: 'Qiraji', zh: '其拉虫人' }, text: { en: 'The people of Ahn’Qiraj, sealed behind the Scarab Wall after the War of the Shifting Sands.', zh: '安其拉的族群，流沙之战后被封在甲虫之墙后。' } },

  "titans": {
    "id": "titans",
    "name": {
      "en": "Titans",
      "zh": "泰坦"
    },
    "text": {
      "en": "Godlike beings who shaped Azeroth. They built the earthen, living stone servants, to tend the deep places of the world. Over ages a 'Curse of Flesh' turned the earthen into flesh-and-blood dwarves. The dwarves only rediscovered this origin recently, which is why the Explorers' League digs so obsessively.",
      "zh": "塑造艾泽拉斯的神祇般的存在。他们创造了由活石构成的仆从土灵，照管世界深处。漫长岁月中，血肉诅咒使土灵变成有血有肉的矮人。矮人直到近来才重新发现自己的起源，这也解释了探险者协会为何如此热衷于发掘遗迹。"
    },
    "image": "img/titans.jpg"
  },
  "khaz-modan": {
    "id": "khaz-modan",
    "name": {
      "en": "Khaz Modan",
      "zh": "卡兹莫丹"
    },
    "text": {
      "en": "The dwarven mountain homeland. Dun Morogh, Loch Modan, Ironforge and Gnomeregan all sit in it. Its passes are guarded by the Mountaineers.",
      "zh": "矮人的山中故乡。丹莫罗、洛克莫丹、铁炉堡和诺莫瑞根都在这一带。巡山人把守着各处山口。"
    },
    "image": "img/khaz-modan.jpg"
  },
  "gnomeregan": {
    "id": "gnomeregan",
    "name": {
      "en": "Gnomeregan",
      "zh": "诺莫瑞根"
    },
    "text": {
      "en": "The lost gnome capital in western Dun Morogh. Troggs invaded from below; a radiation purge urged by Sicco Thermaplugg killed many gnomes and failed to save the city. Survivors shelter in Ironforge’s Tinker Town. Thermaplugg remained behind as a usurper.",
      "zh": "侏儒在丹莫罗西部陷落的都城。穴居人从地下入侵，思科·瑟玛普拉格力主用辐射清剿，结果造成许多侏儒丧命，城市也没能保住。幸存者在铁炉堡侏儒区避难，瑟玛普拉格则留在城中夺权。"
    },
    "image": "img/gnomeregan.jpg"
  },
  "troggs": {
    "id": "troggs",
    "name": {
      "en": "Troggs",
      "zh": "穴居人"
    },
    "text": {
      "en": "Underground creatures related to the titan-forged earthen. Rockjaw troggs threaten Dun Morogh, Stonesplinters threaten Loch Modan, and a great invasion overwhelmed Gnomeregan. These repeated outbreaks do not by themselves prove one coordinated army.",
      "zh": "与泰坦铸造的土灵有亲缘关系的地下生物。石腭穴居人威胁丹莫罗，碎石穴居人威胁洛克莫丹，另有一次大规模入侵攻陷了诺莫瑞根。仅凭这几次入侵，还不足以断定它们是同一支有统一指挥的军队。"
    },
    "image": "img/troggs.jpg"
  },
  "frostmane": {
    "id": "frostmane",
    "name": {
      "en": "Frostmane",
      "zh": "霜鬃"
    },
    "text": {
      "en": "Ice trolls living in Dun Morogh’s caves and snowfields. Their settlements and dwarven outposts are in continuing conflict. Their seers gather Shimmerweed on Shimmer Ridge.",
      "zh": "居住在丹莫罗洞穴与雪原上的冰巨魔。他们的聚落与矮人岗哨长期冲突，族中的先知会到闪光岭采集微光草。"
    },
    "image": "img/frostmane.jpg"
  },
  "wendigo": {
    "id": "wendigo",
    "name": {
      "en": "Wendigo",
      "zh": "雪怪"
    },
    "text": {
      "en": "Shaggy, yeti-like beasts of the snowy peaks. Dun Morogh's live in the Grizzled Den west of Kharanos.",
      "zh": "栖息在雪山上的长毛野兽，形似雪人。丹莫罗的雪怪住在卡拉诺斯西边的灰色洞穴。"
    },
    "image": "img/wendigo.jpg"
  },
  "mountaineers": {
    "id": "mountaineers",
    "name": {
      "en": "Mountaineers",
      "zh": "巡山人"
    },
    "text": {
      "en": "Ironforge's mountain rangers. They patrol Khaz Modan, hold its gates and outposts, and send scouting reports to the city. Senir Whitebeard, Gretchen, Cornelius, Kadrell, Cobbleflint and Stormpike are all Mountaineers.",
      "zh": "铁炉堡的山地巡逻队。他们在卡兹莫丹巡逻，把守关口和岗哨，把侦察结果送回城里。森内尔·白须、格雷琴、科尼利厄斯、卡德雷尔、库伯弗林特和雷矛都是巡山人。"
    },
    "image": "img/mountaineers.jpg"
  },
  "bronzebeard": {
    "id": "bronzebeard",
    "name": {
      "en": "Bronzebeard",
      "zh": "铜须氏族"
    },
    "text": {
      "en": "The clan that retained Ironforge after the War of the Three Hammers. In the Classic-era present, King Magni Bronzebeard rules the mountain capital.",
      "zh": "三锤之战后保住铁炉堡的氏族。经典旧世时期，国王麦格尼·铜须统治这座山中都城。"
    },
    "image": "img/bronzebeard.jpg"
  },
  "magni": {
    "id": "magni",
    "name": {
      "en": "Magni",
      "zh": "麦格尼"
    },
    "text": {
      "en": "Magni Bronzebeard, King of Ironforge in this era. He is allied with the gnomes and humans. Forever’s Hall of Thanes incursion is reported to him.",
      "zh": "麦格尼·铜须是这一时期的铁炉堡国王，与侏儒和人类结盟。无限服中，领主大厅遭入侵的消息最终呈报给他。"
    },
    "image": "img/magni.jpg"
  },
  "wildhammer": {
    "id": "wildhammer",
    "name": {
      "en": "Wildhammer",
      "zh": "蛮锤氏族"
    },
    "text": {
      "en": "Dwarves famous for gryphon riding and their close relationship with the land. They left Ironforge after the civil war, then abandoned tainted Grim Batol and settled at Aerie Peak. Forever’s Earthseer Farsen belongs to this clan.",
      "zh": "以骑乘狮鹫和亲近大地而闻名的矮人。内战后他们离开铁炉堡，后来又放弃遭到腐化的格瑞姆巴托，定居鹰巢山。无限服的大地先知法森就是蛮锤一员。"
    },
    "image": "img/wildhammer.jpg"
  },
  "dark-iron": {
    "id": "dark-iron",
    "name": {
      "en": "Dark Iron",
      "zh": "黑铁矮人"
    },
    "text": {
      "en": "The dwarven clan centered on Shadowforge City beneath Blackrock Mountain. Their ancestors summoned Ragnaros, who subjugated the survivors. Emperor Dagran Thaurissan is their Classic-era ruler, generations after the sorcerer who called the Firelord.",
      "zh": "以黑石山地下的暗炉城为中心的矮人氏族。他们的祖先召唤了拉格纳罗斯，幸存者从此受其奴役。经典旧世时期的统治者是达格兰·索瑞森大帝，距那位召来炎魔的法师已隔了好几代。"
    },
    "image": "img/dark-iron.jpg"
  },
  "war-of-the-three-hammers": {
    "id": "war-of-the-three-hammers",
    "name": {
      "en": "War of the Three Hammers",
      "zh": "三锤之战"
    },
    "text": {
      "en": "When High King Modimus Anvilmar died, the Bronzebeard, Wildhammer and Dark Iron clans fought for Ironforge's throne. The Bronzebeards won. The Wildhammers left for Grim Batol and later Aerie Peak. The Dark Irons attacked both, and Sorcerer-Thane Thaurissan's summoning of Ragnaros burned their own land into the Searing Gorge and Burning Steppes. Anvilmar, the training hall in Coldridge Valley, carries that old king's name.",
      "zh": "至高王莫迪姆斯·安威玛尔死后，铜须、蛮锤和黑铁氏族争夺铁炉堡的王位。铜须获胜，蛮锤迁往格瑞姆巴托，后来又迁至鹰巢山。黑铁向另外两个氏族发起进攻，巫王索瑞森召唤拉格纳罗斯，反将自家领土烧成了灼热峡谷与燃烧平原。寒脊山谷的训练大厅安威玛尔沿用了老国王的名字。"
    },
    "image": null
  },
  "thanes": {
    "id": "thanes",
    "name": {
      "en": "Thanes",
      "zh": "领主"
    },
    "text": {
      "en": "Dwarven clan lords. Forever’s Hall of Thanes lies beneath Old Ironforge and contains ancestral tombs threatened by Dark Iron raiders.",
      "zh": "矮人各氏族的首领。无限服的领主大厅位于旧铁炉堡地下，那里安葬着矮人的先祖，如今受到黑铁袭击者的威胁。"
    },
    "image": "img/thanes.jpg"
  },
  "argent-dawn": {
    "id": "argent-dawn",
    "name": {
      "en": "Argent Dawn",
      "zh": "银色黎明"
    },
    "text": {
      "en": "An order founded after the Third War to oppose the undead Scourge, accepting members across faction lines. Its principal struggle is in the Plaguelands. Forever places Father Gavin, one of its priests, at Misty Pine Refuge.",
      "zh": "第三次战争后为对抗亡灵天灾而成立的组织，招收不同阵营的成员，主要在瘟疫之地作战。无限服中，该组织的牧师伽文神父在雾松避难所落脚。"
    },
    "image": "img/argent-dawn.jpg"
  },
  "explorers-league": {
    "id": "explorers-league",
    "name": {
      "en": "Explorers' League",
      "zh": "探险者协会"
    },
    "text": {
      "en": "Ironforge's archaeological society. They dig up titan sites across the world to learn where the dwarves came from. Brann Bronzebeard is its most famous member.",
      "zh": "铁炉堡的考古组织，在世界各地发掘泰坦遗迹，追寻矮人的来历。布莱恩·铜须是协会最著名的成员。"
    },
    "image": "img/explorers--league.jpg"
  },
  "stormpike": {
    "id": "stormpike",
    "name": {
      "en": "Stormpike",
      "zh": "雷矛"
    },
    "text": {
      "en": "A dwarven clan whose Stormpike Guard leads Ironforge's expedition into Alterac Valley, the contested valley in the Alterac Mountains (and a level-60 battleground).",
      "zh": "矮人氏族之一，其雷矛卫队率领铁炉堡的探险队进入奥特兰克山谷。那是奥特兰克山脉中一处有争议的谷地，也是60级战场。"
    },
    "image": "img/stormpike.jpg"
  },
  "scourge": {
    "id": "scourge",
    "name": {
      "en": "Scourge",
      "zh": "天灾军团"
    },
    "text": {
      "en": "The undead army of the Lich King. In the Third War it destroyed the human kingdom of Lordaeron, led by the fallen prince Arthas.",
      "zh": "巫妖王的亡灵大军。第三次战争中，堕落王子阿尔萨斯率领这支军队摧毁了人类王国洛丹伦。"
    },
    "image": "img/scourge.jpg"
  },
  "forsaken": {
    "id": "forsaken",
    "name": {
      "en": "Forsaken",
      "zh": "被遗忘者"
    },
    "text": {
      "en": "Undead who broke free of the Lich King's control. They built Undercity in the catacombs beneath the ruined capital of Lordaeron and joined the Horde.",
      "zh": "摆脱巫妖王控制的亡灵。他们在洛丹伦都城废墟下的墓穴中建立幽暗城，并加入部落。"
    },
    "image": "img/forsaken.jpg"
  },
  "defias-brotherhood": {
    "id": "defias-brotherhood",
    "name": {
      "en": "Defias Brotherhood",
      "zh": "迪菲亚兄弟会"
    },
    "text": {
      "en": "A movement founded by Edwin VanCleef after Stormwind’s rebuilding left the Stonemasons unpaid. Its ranks grew to include bandits and mercenaries. In the Classic story it operates from the Deadmines while preparing an attack on Stormwind.",
      "zh": "暴风城重建后，石工们未能拿到工钱，艾德温·范克里夫因此发起了这场运动。强盗和佣兵随后加入。经典旧世的故事里，他们以死亡矿井为据点，准备袭击暴风城。"
    },
    "image": "img/defias-brotherhood.jpg"
  },
  "highborne": {
    "id": "highborne",
    "name": {
      "en": "Highborne",
      "zh": "上层精灵"
    },
    "text": {
      "en": "The arcane aristocracy of the ancient night elf empire. Azshara’s court and its reckless use of the Well of Eternity drew the Burning Legion into the world. The Sundering destroyed that civilization; its ruined settlements and lingering spirits remain along Darkshore.",
      "zh": "古代暗夜精灵帝国中精研奥术的贵族。艾萨拉的宫廷肆意使用永恒之井，把燃烧军团引入了这个世界。大分裂摧毁了昔日的文明，黑海岸至今仍留有聚落遗迹和徘徊的幽灵。"
    },
    "image": "img/highborne.jpg"
  },
  "elune": {
    "id": "elune",
    "name": {
      "en": "Elune",
      "zh": "艾露恩"
    },
    "text": {
      "en": "The moon goddess venerated by the night elves. Her priesthood is central to night elf society, and moonwells are sacred sources of power used in the healing work of Darkshore.",
      "zh": "暗夜精灵敬奉的月亮女神。她的祭司在暗夜精灵社会中地位重要，月亮井则是神圣力量的源泉，被用来帮助黑海岸的治疗工作。"
    },
    "image": "img/elune.jpg"
  },
  "sentinels": {
    "id": "sentinels",
    "name": {
      "en": "Sentinels",
      "zh": "哨兵"
    },
    "text": {
      "en": "The night elves’ military force, commanded by Shandris Feathermoon under Tyrande Whisperwind’s leadership. They defend settlements, sacred places, and forests in northern Kalimdor.",
      "zh": "暗夜精灵的军队，由珊蒂斯·羽月指挥，听命于泰兰德·语风。她们守卫卡利姆多北部的聚落、圣地和森林。"
    },
    "image": "img/sentinels.jpg"
  },
  "twilights-hammer": {
    "id": "twilights-hammer",
    "name": {
      "en": "Twilight's Hammer",
      "zh": "暮光之锤"
    },
    "text": {
      "en": "A doomsday cult that serves the Old Gods, the imprisoned powers beneath the earth. Founded by orcs, it now recruits from every race. Its camps in Darkshore and its interest in Blackfathom Deeps are early signs of a much larger plan.",
      "zh": "崇奉上古之神、企图让世界走向末日的邪教。它所崇奉的力量被囚禁在大地之下。邪教由兽人创立，如今招揽各族成员。他们在黑海岸扎营，又对黑暗深渊表现出兴趣，这些都是更大计划的早期迹象。"
    },
    "image": "img/twilight-s-hammer.jpg"
  },
  "dragonmaw": {
    "id": "dragonmaw",
    "name": {
      "en": "Dragonmaw",
      "zh": "龙喉氏族"
    },
    "text": {
      "en": "An orc clan that enslaved red dragons during the Second War, holding Alexstrasza at Grim Batol. Its remaining forces still threaten the eastern Wetlands in the Classic-era setting.",
      "zh": "第二次战争中奴役红龙的兽人氏族，曾将阿莱克丝塔萨囚禁在格瑞姆巴托。经典旧世时期，其残部仍威胁湿地东部。"
    },
    "image": "img/dragonmaw.jpg"
  },
  "grim-batol": {
    "id": "grim-batol",
    "name": {
      "en": "Grim Batol",
      "zh": "格瑞姆巴托"
    },
    "text": {
      "en": "A fortress in the eastern Wetlands, once the Wildhammers’ home. Modgud’s assault left it tainted; much later the Dragonmaw used it to imprison Alexstrasza. Those are separate episodes in its history.",
      "zh": "湿地东部的要塞，曾是蛮锤氏族的家园。莫德古德的袭击使这里受到腐化，很久以后龙喉氏族又在此囚禁阿莱克丝塔萨。两件事发生在要塞历史的不同阶段。"
    },
    "image": null
  },
  "ragnaros": {
    "id": "ragnaros",
    "name": {
      "en": "Ragnaros",
      "zh": "拉格纳罗斯"
    },
    "text": {
      "en": "The elemental Firelord summoned by Sorcerer-Thane Thaurissan. The catastrophe destroyed the Dark Iron capital and made the survivors his subjects beneath Blackrock Mountain.",
      "zh": "巫王索瑞森召唤的火元素领主，亦称炎魔之王。这场灾难摧毁了黑铁都城，幸存者在黑石山地下沦为他的臣属。"
    },
    "image": null
  }
});
