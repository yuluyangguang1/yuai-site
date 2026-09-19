import{j as e,m as s,A as y}from"./vendor-motion-uegpHKi9.js";import{r}from"./vendor-react-D_ze9-jD.js";const i=[{name:"紫微",element:"土",nature:"帝王星",keywords:"尊贵·独立·领导",desc:"天皇贵星，统御众星。坐命者有孤傲之气，主权威显达，天生具备领导气质。需左右辅弼配合方为完整大格。",brightness:"寅卯辰巳午未申酉戌亥子丑",palace:"命宫"},{name:"天机",element:"木",nature:"智慧星",keywords:"智慧·机变·谋略",desc:"益寿星，主智谋与变动。聪慧机灵，善于筹谋，心思细腻，宜从事策划、顾问、技术类工作。",palace:"命宫"},{name:"太阳",element:"火",nature:"官禄主",keywords:"阳刚·官贵·慷慨",desc:"官禄主星，主声誉与名望。慷慨大度，重视公众形象，利官场与公职。入庙时光明磊落。",palace:"官禄宫"},{name:"武曲",element:"金",nature:"财帛主",keywords:"财富·刚毅·果断",desc:"财帛主星，主财务与决断。意志坚定，行动果敢，适合财务、金融、军警类职业。孤克之星，利晚婚。",palace:"财帛宫"},{name:"天同",element:"水",nature:"福德主",keywords:"温和·享福·随缘",desc:"福德主星，主享乐与人缘。性情温和，人缘极好，注重生活品质。晚年运势佳。",palace:"福德宫"},{name:"廉贞",element:"火",nature:"次桃花",keywords:"才艺·情欲·多变",desc:"次桃花星，主才艺与情欲。才华出众，感情丰富，适合艺术、政界。多才多艺但需防桃花是非。",palace:"命宫"},{name:"天府",element:"土",nature:"财库星",keywords:"财库·稳重·保守",desc:"南斗主星，主财库与积蓄。稳重保守，理财能力强，是命盘的稳定力量。",palace:"财帛宫"},{name:"太阴",element:"水",nature:"田宅主",keywords:"柔美·财富·细腻",desc:"田宅主星，主财富与阴柔。细腻温柔，感受力强。利不动产与积蓄。",palace:"田宅宫"},{name:"贪狼",element:"木",nature:"桃花主",keywords:"欲望·桃花·多才",desc:"桃花星，主欲望与才艺。多才多艺，欲望旺盛，社交活跃。宜艺术、公关、商业。",palace:"夫妻宫"},{name:"巨门",element:"水",nature:"暗星",keywords:"口舌·是非·善辩",desc:"暗星，主口才与是非。口才出众，思辨能力强，适合律师、教育、媒体。以辩才立身。",palace:"命宫"},{name:"天相",element:"水",nature:"印星",keywords:"辅佐·行政·印绶",desc:"印星，主辅佐与印绶。善于协调，重视礼节，正直守法。适合幕僚、行政。",palace:"官禄宫"},{name:"天梁",element:"土",nature:"荫星",keywords:"荫护·医药·长辈",desc:"荫星，主老成与荫蔽。正直稳重，慈悲心强。适合医疗、社会工作、宗教。",palace:"父母宫"},{name:"七杀",element:"金",nature:"将星",keywords:"将星·果决·孤克",desc:"将星，主刚烈与开创。性格刚毅，行动力强，勇于挑战。适合创业、军警。",palace:"命宫"},{name:"破军",element:"水",nature:"耗星",keywords:"开创·变动·破坏",desc:"耗星，主变动与开拓。勇于突破，不惧改变，一生变动大但有魄力。",palace:"夫妻宫"}],d=[{name:"命宫",desc:"核心人格、先天命运、外在形象、人生格局",icon:"◈"},{name:"兄弟宫",desc:"兄弟姐妹关系、同辈朋友、合作合伙",icon:"☷"},{name:"夫妻宫",desc:"婚姻感情、配偶特质、恋爱模式",icon:"♡"},{name:"子女宫",desc:"子女缘分、生育状况、下属晚辈",icon:"♢"},{name:"财帛宫",desc:"财运模式、赚钱方式、理财能力",icon:"◈"},{name:"疾厄宫",desc:"健康状况、体质弱点、意外灾厄",icon:"☷"},{name:"迁移宫",desc:"外出运势、贵人运、社会地位",icon:"→"},{name:"交友宫",desc:"人际关系、朋友质量、社交能力",icon:"♢"},{name:"官禄宫",desc:"事业方向、工作运、学业考试",icon:"◈"},{name:"田宅宫",desc:"不动产、居住环境、家庭根基",icon:"☷"},{name:"福德宫",desc:"精神生活、兴趣爱好、内心世界",icon:"♡"},{name:"父母宫",desc:"父母关系、长辈缘、遗传特质",icon:"♢"}],o=[{name:"化禄",type:"吉化",color:"var(--sihua-lu)",desc:"增益、福气、财运。所在宫位事物顺遂，能力增强。"},{name:"化权",type:"吉化",color:"var(--sihua-quan)",desc:"权威、掌控、领导力。所在宫位主强势与决断。"},{name:"化科",type:"吉化",color:"var(--sihua-ke)",desc:"名誉、贵人、考试运。所在宫位主文名与考运。"},{name:"化忌",type:"凶化",color:"var(--sihua-ji)",desc:"执念、阻碍、纠结。所在宫位需特别关注。"}];const CATS = [
{key:'aux',label:'辅煞星',entries:[
{name:'左辅',tag:'吉星',kw:'助力·忠诚·贵人',desc:'紫微斗数左辅弼为一对辅政之星，左辅主阳面助力，性情敦厚，临命身多得人扶持。与右弼同会更见力。',tip:'喜与紫微、天府同宫，孤星独值力减。'},
{name:'右弼',tag:'吉星',kw:'辅佐·阴助·协调',desc:'右弼主阴面之助，多指暗处贵人、平辈提携。性巧而敏，能缓冲突、调和诸星。',tip:'与左辅并称辅弼，夹命拱照尤佳。'},
{name:'文昌',tag:'吉星',kw:'科甲·文书·正统学业',desc:'主正途功名、文书印信。气质文雅，长于读书考试、文字著述，宜科甲仕进。',tip:'遇破军、贪狼则风流体性显现。'},
{name:'文曲',tag:'吉星',kw:'异路·口才·才艺',desc:'主异路功名与口才艺术，与文昌并称文星而偏才华流动，长于言语、表演、玄学。',tip:'文曲化忌主文书失误、口舌担保之累。'},
{name:'天魁',tag:'吉星',kw:'昼贵·男性贵人·科甲',desc:'南斗助星，白天生人以之为首贵，多主阳面贵人、年长男性提携，亦主科举机缘。',tip:'魁钺分昼夜，昼占喜魁、夜占喜钺。'},
{name:'天钺',tag:'吉星',kw:'夜贵·女性贵人·阴助',desc:'南斗助星，夜生人以之为首贵，多主暗处助力、女性贵人照拂。',tip:'守身行正则贵人来，魁钺不助不检之人。'},
{name:'禄存',tag:'吉星',kw:'财禄·解厄·司命',desc:'北斗司禄之星，主财帛、解厄延寿。临宫则该宫得禄，亦能压诸煞为福。',tip:'禄存前后必擎羊陀罗相夹，得禄须防掣肘。'},
{name:'擎羊',tag:'煞星',kw:'刑刃·刚烈·冲劲',desc:'北斗浮星，性刚凶暴，主刑伤、竞争、果决。入庙逢制化反能为权，闲弱则惹是非官非。',tip:'与陀罗同为禄存所夹，见吉亦带刺。'},
{name:'陀罗',tag:'煞星',kw:'暗滞·拖延·纠缠',desc:'北斗暗星，主蹉跎迟滞、心事纠缠。性缓而不发，久则磨人，亦主钻研功夫。',tip:'忌入命身六亲宫，主事情多周折方成。'},
{name:'火星',tag:'煞星',kw:'暴烈·速发·刚断',desc:'南斗凶星，主暴躁果断、发作急速。与禄马交会可主暴富横发，然亦主刑伤火灾。',tip:'喜与财星同乡成「火星钻架」，然祸福相倚须细看。'},
{name:'铃星',tag:'煞星',kw:'阴火·隐忍·权谋',desc:'南斗浊星，性阴烈而内敛，主谋划于心、动于无声。得地主权谋，失地主怨恨。',tip:'与火星对较：明暴为火、阴炸为铃。'},
{name:'天马',tag:'中性',kw:'奔走·迁移·机遇',desc:'主驿动之曜，临命多奔波、迁移、外出发展。与禄同行为「禄马交驰」，主离乡发迹。',tip:'逢空劫则「龙困浅滩」，动而无成。'},
{name:'地空',tag:'煞星',kw:'空幻·出世·破财',desc:'北斗空星，主一切成空、思想超脱世俗。得之者多玄想、宗教缘，亦主财物耗散。',tip:'入财帛田宅不主聚，然利修行艺术。'},
{name:'地劫',tag:'煞星',kw:'劫夺·得失·反背',desc:'昌曲正曜之敌，主得而复失、行事反背。与空同临命身，多出世之思、不羁之才。',tip:'空劫夹空亡，主人清高不群。'},
{name:'天刑',tag:'中性',kw:'律法·刑名·自律',desc:'主刑律之曜，临官禄财帛多司法律、军警、外科之职。亦主自律刚直。',tip:'与武曲、廉贞会，主司法权威。'},
{name:'天姚',tag:'中性',kw:'风流·魅力·人缘',desc:'主风情之曜，添人缘魅力与艺术感性，入命身夫妻多感情色彩。',tip:'会贪狼廉贞则桃花转盛，宜自制。'},
{name:'华盖',tag:'中性',kw:'孤高·宗教·艺术',desc:'帝王伞盖之星，主聪明孤高、近宗教艺术。入命多独善其身的清趣。',tip:'与空劫同临，慧根更深。'},
{name:'阴煞',tag:'煞星',kw:'暗耗·小人·疑忌',desc:'主暗中耗损、小人疑忌之曜，亦近神灵幽暗之事。',tip:'居命身宜坦荡防暗箭，入福德多通灵之思。'}]},
{key:'zt',label:'斗数术语',entries:[
{name:'三方四正',tag:'结构',kw:'本宫对宫与三合',desc:'论一宫必合看：本宫、对宫（冲照）、三合两宫共四宫，星情庙旺与四化叠加而断，为斗数看盘基本法。'},
{name:'命主身主',tag:'结构',kw:'先天与后天之主',desc:'命主依命宫地支取（如子属贪狼），主禀赋根基；身主依生年地支取，主后天际遇行止。二星为全盘纲领之一。'},
{name:'五行局',tag:'起盘',kw:'水二木三金四土五火六',desc:'依命宫纳音定局数（水二局至火六局），决定起运岁数与紫微星定位，是排盘必经参数。'},
{name:'大限流年',tag:'推运',kw:'十年一宫逐年盘',desc:'大限以五行局起，每十年行经一个宫位；流年叠加上层盘。本命为体、大限为运、流年为应期。'},
{name:'安星法',tag:'排盘',kw:'紫微系天府系',desc:'以紫微星定位起紫微星系六曜，天府星随系定十二宫职，再布辅煞、化曜。今人可软件起盘，古法须查历手安。'},
{name:'庙旺利陷',tag:'亮度',kw:'星曜能量分级',desc:'诸星落地支宫有庙、旺、得地、利、平、不得地、陷七等亮度，决定星性发挥程度；吉处藏凶、陷处逢救皆须细看。'},
{name:'入垣失垣',tag:'亮度',kw:'宫星相得与否',desc:'星曜入庙旺且不受冲破谓之入垣，主贵；反之失垣则吉不成吉、凶愈显凶。'},
{name:'飞化',tag:'四化',kw:'宫干四化入他宫',desc:'以各宫宫干起四化飞入他宫，看宫与宫间的生克制化与因缘流向，与生年四化并参，为飞星派核心手法。'}]},
{key:'ss',label:'十神',entries:[
{name:'比肩',tag:'同我',kw:'平行·自立·分财',desc:'与我同行同阴阳者。主兄弟同侪、自立自尊；身旺见之多克父、争财，合伙须明账。',tip:'为用神主帮身，为忌神主分夺。'},
{name:'劫财',tag:'同我',kw:'异性同伴·投机·争夺',desc:'与我同行异阴阳者。主朋友竞争、投机胆识，性急豪爽；透干无制易破财惹是非。',tip:'又名「败财」，见之须看官杀有无力制。'},
{name:'食神',tag:'我生',kw:'才气·福寿·温和',desc:'我生而同阴阳者。主口福才艺、宽厚之德，古人谓之「爵星」；亦主女命之子女。',tip:'忌偏印夺之（枭神夺食）。'},
{name:'伤官',tag:'我生',kw:'才华·傲上·创新',desc:'我生而异阴阳者。主聪明剔透、不拘礼法、敢于非上；成格者大才，失制者官非口舌。',tip:'伤官见官为祸百端，须财印调停。'},
{name:'偏印',tag:'生我',kw:'偏学·孤克·玄思',desc:'生我而同阴阳者，又称枭神。主冷门学问、宗教玄艺、敏感多思；带则性情孤癖。',tip:'枭神夺食为忌，见财星可解。'},
{name:'正印',tag:'生我',kw:'学问·名誉·庇荫',desc:'生我而异阴阳者。主正统学业、名誉长辈庇护、心地慈善；有官无印不贵，有印无官亦清。',tip:'印绶逢官杀为「官印双全」。'},
{name:'偏财',tag:'我克',kw:'众财·慷慨·父缘',desc:'我克而同阴阳者。主众人之财、流动之利、慷慨疏财，亦主父亲与男命情人。',tip:'偏财喜身旺，身弱财多反为累。'},
{name:'正财',tag:'我克',kw:'常财·节俭·妻缘',desc:'我克而异阴阳者。主薪俸田宅之常财，性勤俭守信；女命亦以财看夫星根基。',tip:'正财忌劫，见比劫则财被分夺。'},
{name:'七杀',tag:'克我',kw:'权威·挑战·开创',desc:'克我而同阴阳者，又称偏官。主威烈果敢、开创镇摄之力；无制为祸，制化得宜为大贵之格。',tip:'杀须食制、印化，二者得其一方可用。'},
{name:'正官',tag:'克我',kw:'名分·法度·仕途',desc:'克我而异阴阳者。主名誉职司、循守法度，为仕途名分之星；一位纯粹最贵，多则官变杀论。',tip:'官星忌伤，喜财印相辅。'}]},
{key:'sha',label:'八字神煞',entries:[
{name:'天乙贵人',tag:'吉',kw:'解难·提携·第一吉神',desc:'命中最尊之贵人，依日干查地支（甲戊庚牛羊之类）。主危急有人援手、易近权贵。',tip:'贵人多反主劳碌，逢冲合则力减。'},
{name:'太极贵人',tag:'吉',kw:'玄思·好学·终始',desc:'主聪明好学、喜究形上之理，入命多近宗教哲学五术。'},
{name:'文昌贵人',tag:'吉',kw:'文星·记诵·科甲',desc:'依日干取之（甲见巳、乙见午之类），主文章科甲、聪敏记诵，与学堂词馆并看更验。'},
{name:'驿马',tag:'中性',kw:'奔动·迁移·出外',desc:'三合局首冲之位（申子辰马在寅），主变动远行、出外发展；会财官则驿马得禄。',tip:'马落空亡则奔走无成。'},
{name:'桃花（咸池）',tag:'中性',kw:'情缘·人缘·艺文',desc:'三合局沐浴之地（申子辰在酉），主情欲魅力、艺术人缘；喜入命身财，忌带劫煞。',tip:'桃花带劫为「滚浪桃花」，因色惹祸。'},
{name:'华盖',tag:'中性',kw:'孤高·艺道·宗教',desc:'三合局墓库之支（申子辰见辰），主聪明孤僻、近艺近道；会印绶则清贵。'},
{name:'将星',tag:'吉',kw:'领袖·权柄·中枢',desc:'三合局中神（申子辰见子），主掌权威望、能作众中之主。',tip:'逢冲则将星失垣。'},
{name:'金舆',tag:'吉',kw:'车驾·安稳·配偶缘',desc:'禄前二辰，古谓天子车驾；入命主出入安适、得配偶家族之荫。'},
{name:'天厨贵人（福星）',tag:'吉',kw:'口福·俸禄·福泽',desc:'主食禄之吉神，主福泽深厚、衣食无忧、逢凶化吉。'},
{name:'学堂词馆',tag:'吉',kw:'教育·文名·讲席',desc:'以纳音长生为学堂、临官为词馆，主读书授徒、以文墨显。'},
{name:'羊刃',tag:'凶',kw:'刚烈·刑伤·决断',desc:'五行帝旺过极之地（甲见卯之类），主刚烈果敢亦主血光刑伤；军警外科武职反喜。',tip:'羊刃逢冲之岁运宜防意外。'},
{name:'亡神',tag:'凶',kw:'城府·耗失·深机',desc:'三合局临官受克之处，主人深城府、机巧多虑，失则耗散官非。'},
{name:'劫煞',tag:'凶',kw:'夺败·急暴·灾伤',desc:'三合局绝处，主夺败暴虐、意外损伤；为用则主权谋果断。'},
{name:'空亡',tag:'中性',kw:'落空·虚耗·脱卸',desc:'干余支尽为旬空（甲子旬中戌亥空），吉落空则虚、凶落空则缓，亦主与佛道缘分。',tip:'有「真空假空」之辨：一气中不可尽废。'},
{name:'红艳煞',tag:'中性',kw:'风情·魅力·恋爱',desc:'依日干查支（甲午、乙申之类），主人多情风情，恋爱机缘多而杂。'},
{name:'孤辰寡宿',tag:'中性',kw:'六缘·孤高·独立',desc:'寅卯辰人巳寡丑孤类推，主六亲缘薄、独立自守；入命身夫妻尤须会吉解。'},
{name:'阴差阳错',tag:'中性',kw:'婚姻·周折·沟通',desc:'丙子丁丑戊寅辛卯壬辰癸巳等十二日，古谓主婚姻周折、亲家少和，现代只作沟通课题看。'},
{name:'童子煞',tag:'中性',kw:'体弱·灵缘·俗说',desc:'民俗谓前世宫童转世，主幼小多病、婚姻迟；属民间信仰范畴，作文化参考。'}]},
{key:'bt',label:'八字术语',entries:[
{name:'阴阳五行',tag:'根基',kw:'对立·生克·系统',desc:'阴阳为万物对待之二态，五行（木火土金水）为系统分类模型；命理以干支为载体推演其生克制化。'},
{name:'天干地支',tag:'根基',kw:'十干十二支六十甲子',desc:'十日十二支按序相配得六十组（甲子至癸亥），纪年月日时，四柱各一，构成命盘骨架。'},
{name:'纳音',tag:'根基',kw:'五行三十纳音',desc:'六十甲子两两一组配五行纳音（如甲子乙丑海中金），源自律吕，合婚、论命之辅参。'},
{name:'得令得地得势',tag:'旺衰',kw:'月令为尊',desc:'日干强弱三要素：得月令之气、得地支根苗、得干支生扶，三者之中月令最重，先定旺衰后议格局。'},
{name:'十二长生',tag:'状态',kw:'生命周期模型',desc:'长生沐浴冠带临官帝旺衰病死墓绝胎养，以日干对支论能量周期，冠带临官帝旺为强，死墓绝为弱。'},
{name:'通根透干',tag:'结构',kw:'支为根干为苗',desc:'天干得同气地支为通根，地支所藏上透天干为透干；根苗相连则其神有力，虚浮无根则外强中干。'},
{name:'用神',tag:'核心',kw:'治病之药',desc:'命局最需之一字（或一行）以扶抑、调候、通关纠其偏，为论命提纲；用神有力、行用神运则发。',tip:'流派取用不同：扶抑、调候、病药、旺衰各有门径。'},
{name:'喜神忌神闲神',tag:'层次',kw:'生用制用',desc:'生扶用神为喜，克制用神为忌，于局无涉为闲；岁运喜忌随用神之变而转。'},
{name:'格局',tag:'框架',kw:'月令定格',desc:'以月令所藏透干取格（正官、七杀、财印食伤等八正格为纲），辅以成败救应论命之层次。'},
{name:'从格专旺',tag:'变格',kw:'旺极衰极',desc:'日主旺极无制则从强从旺（曲直炎上稼穑从革润下），衰极无扶则弃命从财从杀，破格则凶。'},
{name:'合化',tag:'变化',kw:'干合支会',desc:'天干五合（甲己化土之类）与地支三合三会，化神得令真化则改其性情，合而不化只论牵绊。'},
{name:'大运流年',tag:'推运',kw:'十年一气当年应期',desc:'大运排月令之顺逆主十年基调，流年与岁运叠加、天克地冲等形成为应期；命为车、运为路、岁为时。'},
{name:'岁运并临',tag:'推运',kw:'大运流年干支同',desc:'大运与流年干支相同，古人谓灾殃立至，实为所应五行力量加倍之兆，吉加倍凶亦加倍。'},
{name:'墓库',tag:'结构',kw:'藏而待发',desc:'辰戌丑未为四库，物入墓须待冲刑开启；日主财官入库，逢冲之运应其显晦。'}]},
{key:'bg',label:'八卦',entries:[
{name:'乾',tag:'天',kw:'健·父·马·首·西北',desc:'三阳成乾，象天，其德为健；于人父、于体首、于马为良马老马。《说卦》：乾，天也，故称乎父。'},
{name:'坤',tag:'地',kw:'顺·母·牛·腹·西南',desc:'三阴成坤，象地，其德为顺；承载含弘，牝马之贞。于人为母、于畜为牛。'},
{name:'震',tag:'雷',kw:'动·长男·龙·足·东',desc:'一阳始动于二阴之下，象雷，其德为动；主奋起惊惧，于长子为肇造生机之人。'},
{name:'巽',tag:'风',kw:'入·长女·鸡·股·东南',desc:'一阴伏于二阳之下，象风，其德为入；无孔不入、进退多虑，于畜为鸡。'},
{name:'坎',tag:'水',kw:'陷·中男·豕·耳·北',desc:'阳陷二阴之中，象水，其德为陷；主险难劳苦，亦主智慧流通，心亨则越险。'},
{name:'离',tag:'火',kw:'丽·中女·雉·目·南',desc:'阴丽二阳之间，象火，其德为附丽；主文明礼仪、甲胄戈兵，于体为目。'},
{name:'艮',tag:'山',kw:'止·少男·狗·手·东北',desc:'一阳止二阴之上，象山，其德为止；时止则止时行则行，门阙守备之象。'},
{name:'兑',tag:'泽',kw:'悦·少女·羊·口·西',desc:'一阴说于二阳之上，象泽，其德为悦；主口舌饮食、毁折缺损，于人为妾少女。'}]},
{key:'yl',label:'易理',entries:[
{name:'元亨利贞',tag:'卦辞',kw:'四德·始终',desc:'乾卦卦辞，易之根本程式：元为始亨为通利为和贞为固。四德循环，事之成必先具此四义。'},
{name:'一阴一阳之谓道',tag:'系辞',kw:'对待·流行',desc:'系辞核心命题：阴阳对待互根、迭为消长，即易之道。命理取义：刚柔相推、过与不及皆须济。'},
{name:'爻位',tag:'结构',kw:'初至上·三才',desc:'六爻自下而上分初（始）、二（现）、三（惕）、四（疑）、五（功）、上（终），三才配天地人，五多君位贵，上多为退。'},
{name:'九六',tag:'结构',kw:'老变少占',desc:'阳爻称九、阴爻称六；七八为少不变，九六为老能变，占筮以变爻为断，此爻题之由来。'},
{name:'互综错',tag:'取象',kw:'卦外生卦',desc:'互卦取中四爻另成一卦，综卦颠倒重排，错卦阴阳全反；三法由一卦生多面，看事之里表反正。'}]},
{key:'tr',label:'塔罗',entries:[
{name:'大阿尔卡纳',tag:'22张',kw:'原型·人生课题',desc:'22 张主牌以愚者编号 0 起、世界 21 终，象征灵魂旅程的原型阶段；占卜中出现多指人生大课题。'},
{name:'小阿尔卡纳',tag:'56张',kw:'四组·日常事件',desc:'权杖（火·行动）、圣杯（水·情感）、宝剑（风·思维）、星币（土·物质）各 1-10 加四张宫廷牌，主日常具体事。'},
{name:'正位逆位',tag:'解读',kw:'能量顺逆',desc:'正位顺其本性而显，逆位多为能量受阻、内转或过度；解读无定于一尊，以问者与牌阵脉络为准。'}]}
];function v(){
const[n,m]=r.useState("stars"),[x,t]=r.useState(null),[q,Q]=r.useState("");
const p=[{key:"stars",label:"主星",count:i.length},{key:"palaces",label:"宫位",count:d.length},{key:"sihua",label:"四化",count:o.length},...CATS.map(c=>({key:c.key,label:c.label,count:c.entries.length}))];
const norm=()=>[
...i.map(a=>({id:"stars|"+a.name,nm:a.name,tg:a.element+" · "+a.nature,kw:a.keywords,desc:a.desc,tip:"主入："+a.palace})),
...d.map(a=>({id:"palaces|"+a.name,nm:a.name,tg:"宫位",kw:a.desc.split("、")[0],desc:a.desc,tip:""})),
...o.map(a=>({id:"sihua|"+a.name,nm:a.name,tg:a.type,kw:"",desc:a.desc,tip:"",tc:a.color})),
...CATS.flatMap(c=>c.entries.map(a=>({id:c.key+"|"+a.name,nm:a.name,tg:a.tag,kw:a.kw,desc:a.desc,tip:a.tip||"",gl:c.label})))
];
const all=norm();
const colorOf=tg=>/^吉/.test(tg)?"var(--sihua-lu)":/(凶|煞)/.test(tg)?"var(--sihua-ji)":/(桃花|情|风)/.test(tg)?"var(--sihua-ke)":"var(--tx-3)";
const card=(a,l)=>{const c=x===a.id;return e.jsxs(s.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},transition:{delay:Math.min(l,14)*.03},onClick:()=>t(c?null:a.id),className:"card p-4 cursor-pointer transition-all",children:[
e.jsxs("div",{className:"flex items-center gap-3",children:[
e.jsx("div",{className:"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",style:{background:"var(--ac-bg)",border:"1px solid var(--ac-border)"},children:e.jsx("span",{className:"heading text-sm",style:{color:"var(--ac)"},children:a.nm.slice(0,2)})}),
e.jsxs("div",{className:"flex-1 min-w-0",children:[
e.jsxs("div",{className:"flex items-center gap-2",children:[
e.jsx("span",{className:"text-xs font-semibold",style:{color:"var(--tx-0)"},children:a.nm}),
e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded-full",style:{border:"1px solid var(--bdr)",color:a.tc||colorOf(a.tg)},children:a.tg})]}),
a.kw?e.jsx("p",{className:"text-[10px] mt-0.5",style:{color:"var(--tx-3)"},children:a.kw}):null]}),
e.jsx(s.span,{animate:{rotate:c?180:0},className:"text-[10px]",style:{color:"var(--tx-faint)"},children:"▾"})]}),
e.jsx(y,{children:c&&e.jsxs(s.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},className:"mt-3 pt-3 overflow-hidden",style:{borderTop:"1px solid var(--bdr)"},children:[
e.jsx("p",{className:"text-xs leading-relaxed",style:{color:"var(--tx-1)"},children:a.desc}),
a.tip?e.jsx("p",{className:"text-[10px] mt-2",style:{color:"var(--tx-faint)"},children:a.tip}):null]})})]},a.id)};
const Q0=q.trim();
const hits=Q0?all.filter(a=>[a.nm,a.tg,a.kw,a.desc,a.tip].some(f=>f.indexOf(Q0)>-1)):[];
const shown=Q0?hits:all.filter(a=>a.id.indexOf(n+"|")===0);
return e.jsxs("div",{className:"relative",children:[
e.jsx("div",{className:"absolute inset-0 bg-stars opacity-20 dark:opacity-40 pointer-events-none"}),
e.jsxs("div",{className:"relative container py-10 max-w-2xl",children:[
e.jsxs(s.div,{initial:{opacity:0,y:16},animate:{opacity:1,y:0},className:"text-center mb-6",children:[
e.jsx("div",{className:"tag mx-auto mb-3 w-fit",children:"KNOWLEDGE"}),
e.jsx("h1",{className:"heading text-3xl mb-1",style:{color:"var(--ac)"},children:"命理百科"}),
e.jsxs("p",{className:"text-[10px]",style:{color:"var(--tx-faint)"},children:["共 ",all.length," 条 · 古籍通说改述"]})]}),
e.jsx(s.div,{initial:{opacity:0,y:16},animate:{opacity:1,y:0},transition:{delay:.06},children:
e.jsx("input",{value:q,onChange:a=>{Q(a.target.value);t(null)},placeholder:"搜索词条：星曜 · 十神 · 神煞 · 术语 · 卦名…",className:"w-full px-4 py-2.5 rounded-xl text-xs outline-none mb-4",style:{background:"var(--bg-1)",border:"1px solid var(--bdr)",color:"var(--tx-0)"}})}),
e.jsx(s.div,{initial:{opacity:0,y:16},animate:{opacity:1,y:0},transition:{delay:.1},className:"grid grid-cols-4 gap-1.5 mb-5",children:p.map(a=>e.jsxs("button",{onClick:()=>{m(a.key);Q("");t(null)},className:"py-2 rounded-xl text-center transition-all",style:{background:n===a.key&&!Q0?"var(--ac-bg)":"var(--bg-1)",border:"1px solid "+(n===a.key&&!Q0?"var(--ac-border)":"var(--bdr)")},children:[
e.jsx("span",{className:"text-[11px] font-semibold",style:{color:n===a.key&&!Q0?"var(--ac)":"var(--tx-2)"},children:a.label}),
e.jsx("span",{className:"text-[9px] ml-1",style:{color:"var(--tx-faint)"},children:a.count})]},a.key))}),
Q0&&e.jsx("p",{className:"text-[10px] mb-2",style:{color:"var(--tx-faint)"},children:"匹配 "+hits.length+" 条"}),
shown.length?e.jsx("div",{className:"space-y-2",children:shown.map((a,l)=>card(a,l))}):e.jsxs("div",{className:"card p-6 text-center",children:[
e.jsx("p",{className:"text-xs",style:{color:"var(--tx-2)"},children:"没有匹配「"+Q0+"」的词条"}),
e.jsx("button",{onClick:()=>{Q("");m("stars")},className:"text-[11px] mt-2 underline",style:{color:"var(--ac)"},children:"清除搜索"})]})]})]})
}
export{v as default};