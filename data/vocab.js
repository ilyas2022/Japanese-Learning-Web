// Vocabulario ordenado por utilidad. El orden = orden en que aparecen en el reto diario.
// Formato: [japonés, kana, romaji, español, etiqueta, ejemploJP, ejemploRomaji, ejemploES]
// IMPORTANTE: añade palabras nuevas SOLO al final (el id depende de la posición).
window.VOCAB_RAW = [
  ['はい','はい','hai','sí','básico','はい、そうです。','hai, sou desu.','Sí, así es.'],
  ['いいえ','いいえ','iie','no','básico','いいえ、違います。','iie, chigaimasu.','No, no es así.'],
  ['私','わたし','watashi','yo (neutro)','pronombre','私はスペイン人です。','watashi wa supein-jin desu.','Soy español.'],
  ['何','なに','nani','qué','pregunta','これは何？','kore wa nani?','¿Qué es esto?'],

  ['これ','これ','kore','esto','básico','これをください。','kore wo kudasai.','Deme esto, por favor.'],
  ['好き','すき','suki','gustar','sentimiento','猫が好き。','neko ga suki.','Me gustan los gatos.'],
  ['いい','いい','ii','bueno / vale','adjetivo','いいね！','ii ne!','¡Qué bien!'],
  ['大丈夫','だいじょうぶ','daijoubu','estar bien / no pasa nada','adjetivo','大丈夫？','daijoubu?','¿Estás bien?'],

  ['行く','いく','iku','ir','verbo','一緒に行こう！','issho ni ikou!','¡Vamos juntos!'],
  ['見る','みる','miru','ver / mirar','verbo','見て！','mite!','¡Mira!'],
  ['食べる','たべる','taberu','comer','verbo','一緒に食べよう。','issho ni tabeyou.','Comamos juntos.'],
  ['分かる','わかる','wakaru','entender','verbo','分からない。','wakaranai.','No lo entiendo.'],

  ['今日','きょう','kyou','hoy','tiempo','今日は暑い。','kyou wa atsui.','Hoy hace calor.'],
  ['明日','あした','ashita','mañana (día)','tiempo','また明日！','mata ashita!','¡Hasta mañana!'],
  ['今','いま','ima','ahora','tiempo','今どこ？','ima doko?','¿Dónde estás ahora?'],
  ['どこ','どこ','doko','dónde','pregunta','トイレはどこですか？','toire wa doko desu ka?','¿Dónde está el baño?'],

  ['君','きみ','kimi','tú (cariñoso, típico de chico)','pronombre','君が好きだ。','kimi ga suki da.','Me gustas.'],
  ['彼女','かのじょ','kanojo','ella / novia','persona','僕の彼女はかわいい。','boku no kanojo wa kawaii.','Mi novia es muy mona.'],
  ['可愛い','かわいい','kawaii','mono / adorable','adjetivo','この猫、かわいい！','kono neko, kawaii!','¡Este gato es adorable!'],
  ['すごい','すごい','sugoi','increíble','adjetivo','すごい！','sugoi!','¡Increíble!'],

  ['する','する','suru','hacer','verbo','何をする？','nani wo suru?','¿Qué hacemos?'],
  ['ある','ある','aru','haber / tener (cosas)','verbo','時間がある。','jikan ga aru.','Tengo tiempo.'],
  ['いる','いる','iru','estar / haber (seres vivos)','verbo','猫がいる。','neko ga iru.','Hay un gato.'],
  ['来る','くる','kuru','venir','verbo','こっちに来て。','kocchi ni kite.','Ven aquí.'],

  ['僕','ぼく','boku','yo (chico, amable)','pronombre','僕は大丈夫。','boku wa daijoubu.','Yo estoy bien.'],
  ['俺','おれ','ore','yo (chulo, muy masculino)','pronombre','俺は強い！','ore wa tsuyoi!','¡Soy fuerte!'],
  ['あなた','あなた','anata','tú (ojo: suena distante)','pronombre','あなたは誰？','anata wa dare?','¿Quién eres tú?'],
  ['誰','だれ','dare','quién','pregunta','誰ですか？','dare desu ka?','¿Quién es?'],

  ['本当','ほんとう','hontou','verdad','básico','本当？','hontou?','¿En serio?'],
  ['ちょっと','ちょっと','chotto','un poco / espera','básico','ちょっと待って。','chotto matte.','Espera un momento.'],
  ['待つ','まつ','matsu','esperar','verbo','待って！','matte!','¡Espera!'],
  ['早く','はやく','hayaku','rápido / pronto','adverbio','早く！','hayaku!','¡Date prisa!'],

  ['水','みず','mizu','agua','cosa','水をください。','mizu wo kudasai.','Agua, por favor.'],
  ['ご飯','ごはん','gohan','comida / arroz','cosa','ご飯食べた？','gohan tabeta?','¿Has comido?'],
  ['美味しい','おいしい','oishii','delicioso','adjetivo','おいしい！','oishii!','¡Qué rico!'],
  ['飲む','のむ','nomu','beber','verbo','何か飲む？','nanika nomu?','¿Quieres beber algo?'],

  ['言う','いう','iu','decir','verbo','何て言った？','nante itta?','¿Qué has dicho?'],
  ['知る','しる','shiru','saber / conocer','verbo','知らない。','shiranai.','No lo sé.'],
  ['思う','おもう','omou','pensar / creer','verbo','そう思う。','sou omou.','Eso creo.'],
  ['話す','はなす','hanasu','hablar','verbo','日本語を少し話せます。','nihongo wo sukoshi hanasemasu.','Hablo un poco de japonés.'],

  ['日本語','にほんご','nihongo','japonés (idioma)','cosa','日本語を勉強しています。','nihongo wo benkyou shite imasu.','Estoy estudiando japonés.'],
  ['名前','なまえ','namae','nombre','cosa','お名前は？','onamae wa?','¿Cómo te llamas?'],
  ['友達','ともだち','tomodachi','amigo/a','persona','彼は友達です。','kare wa tomodachi desu.','Él es mi amigo.'],
  ['人','ひと','hito','persona','persona','いい人だね。','ii hito da ne.','Es buena persona.'],

  ['会う','あう','au','quedar / verse con','verbo','また会おう！','mata aou!','¡Volvamos a vernos!'],
  ['一緒に','いっしょに','issho ni','juntos','adverbio','一緒にいたい。','issho ni itai.','Quiero estar contigo.'],
  ['また','また','mata','otra vez / de nuevo','adverbio','またね！','mata ne!','¡Nos vemos!'],
  ['嬉しい','うれしい','ureshii','feliz / contento','sentimiento','会えて嬉しい。','aete ureshii.','Me alegra verte.'],

  ['楽しい','たのしい','tanoshii','divertido','adjetivo','楽しかった！','tanoshikatta!','¡Me lo pasé genial!'],
  ['面白い','おもしろい','omoshiroi','interesante / gracioso','adjetivo','この漫画は面白い。','kono manga wa omoshiroi.','Este manga mola mucho.'],
  ['漫画','まんが','manga','manga / cómic','cosa','漫画を読む。','manga wo yomu.','Leo manga.'],
  ['読む','よむ','yomu','leer','verbo','日本語で読みたい。','nihongo de yomitai.','Quiero leer en japonés.'],

  ['やばい','やばい','yabai','brutal / chungo (según contexto)','manga','やばい、遅刻だ！','yabai, chikoku da!','¡Mierda, llego tarde!'],
  ['怖い','こわい','kowai','dar miedo','adjetivo','怖い！','kowai!','¡Qué miedo!'],
  ['強い','つよい','tsuyoi','fuerte','adjetivo','あいつは強い。','aitsu wa tsuyoi.','Ese tío es fuerte.'],
  ['弱い','よわい','yowai','débil','adjetivo','弱すぎる。','yowa sugiru.','Eres demasiado débil.'],

  ['大好き','だいすき','daisuki','encantar / querer mucho','sentimiento','大好きだよ。','daisuki da yo.','Te quiero mucho.'],
  ['綺麗','きれい','kirei','bonita / limpio','adjetivo','君は綺麗だ。','kimi wa kirei da.','Eres preciosa.'],
  ['寂しい','さびしい','sabishii','sentirse solo / echar de menos','sentimiento','寂しいよ。','sabishii yo.','Te echo de menos.'],
  ['会いたい','あいたい','aitai','quiero verte','sentimiento','早く会いたい。','hayaku aitai.','Tengo ganas de verte ya.'],

  ['どう','どう','dou','cómo / qué tal','pregunta','どうしたの？','dou shita no?','¿Qué te pasa?'],
  ['なんで','なんで','nande','por qué (hablado)','pregunta','なんで？','nande?','¿Por qué?'],
  ['いつ','いつ','itsu','cuándo','pregunta','いつ会える？','itsu aeru?','¿Cuándo nos podemos ver?'],
  ['いくら','いくら','ikura','cuánto (precio)','pregunta','これはいくら？','kore wa ikura?','¿Cuánto cuesta esto?'],

  ['一','いち','ichi','uno (1)','número','一つください。','hitotsu kudasai.','Uno, por favor.'],
  ['二','に','ni','dos (2)','número','二人です。','futari desu.','Somos dos.'],
  ['三','さん','san','tres (3)','número','三時に会おう。','sanji ni aou.','Quedamos a las tres.'],
  ['四','よん','yon','cuatro (4)','número','四月','shigatsu','abril'],

  ['五','ご','go','cinco (5)','número','五分待って。','gofun matte.','Espera cinco minutos.'],
  ['六','ろく','roku','seis (6)','número','六時','rokuji','las seis'],
  ['七','なな','nana','siete (7)','número','七つの玉','nanatsu no tama','las siete bolas'],
  ['八','はち','hachi','ocho (8)','número','八時','hachiji','las ocho'],

  ['九','きゅう','kyuu','nueve (9)','número','九時','kuji','las nueve'],
  ['十','じゅう','juu','diez (10)','número','十分','juppun','diez minutos'],
  ['百','ひゃく','hyaku','cien (100)','número','百円','hyaku en','cien yenes'],
  ['お金','おかね','okane','dinero','cosa','お金がない。','okane ga nai.','No tengo dinero.'],

  ['頑張る','がんばる','ganbaru','esforzarse / dar lo mejor','verbo','頑張って！','ganbatte!','¡Ánimo! / ¡Tú puedes!'],
  ['できる','できる','dekiru','poder / saber hacer','verbo','できた！','dekita!','¡Lo conseguí!'],
  ['助ける','たすける','tasukeru','ayudar / salvar','verbo','助けて！','tasukete!','¡Socorro!'],
  ['守る','まもる','mamoru','proteger','verbo','君を守る。','kimi wo mamoru.','Te protegeré.'],

  ['仲間','なかま','nakama','compañeros (de equipo / banda)','manga','仲間を信じろ！','nakama wo shinjiro!','¡Confía en tus compañeros!'],
  ['戦う','たたかう','tatakau','luchar','manga','一緒に戦おう！','issho ni tatakaou!','¡Luchemos juntos!'],
  ['勝つ','かつ','katsu','ganar','verbo','絶対に勝つ！','zettai ni katsu!','¡Ganaré sí o sí!'],
  ['負ける','まける','makeru','perder','verbo','負けないで。','makenaide.','No te rindas / No pierdas.'],

  ['絶対','ぜったい','zettai','absolutamente / sí o sí','adverbio','絶対嫌だ！','zettai iya da!','¡Ni de broma!'],
  ['もう','もう','mou','ya / más','adverbio','もう寝る。','mou neru.','Ya me voy a dormir.'],
  ['まだ','まだ','mada','todavía','adverbio','まだまだだね。','mada mada da ne.','Aún te falta mucho.'],
  ['少し','すこし','sukoshi','un poco','adverbio','少し分かる。','sukoshi wakaru.','Entiendo un poco.'],

  ['寝る','ねる','neru','dormir / acostarse','verbo','早く寝なさい。','hayaku nenasai.','Vete a dormir ya.'],
  ['起きる','おきる','okiru','despertarse','verbo','起きて！','okite!','¡Despierta!'],
  ['眠い','ねむい','nemui','tener sueño','adjetivo','眠い…','nemui...','Qué sueño…'],
  ['疲れる','つかれる','tsukareru','cansarse','verbo','疲れた。','tsukareta.','Estoy cansado.'],

  ['家','いえ','ie','casa','lugar','家に帰る。','ie ni kaeru.','Vuelvo a casa.'],
  ['帰る','かえる','kaeru','volver (a casa)','verbo','もう帰る？','mou kaeru?','¿Ya te vas?'],
  ['駅','えき','eki','estación','lugar','駅はどこですか？','eki wa doko desu ka?','¿Dónde está la estación?'],
  ['店','みせ','mise','tienda','lugar','この店、いいね。','kono mise, ii ne.','Esta tienda está bien.'],

  ['死ぬ','しぬ','shinu','morir','manga','死ぬかと思った！','shinu ka to omotta!','¡Creí que me moría!'],
  ['逃げる','にげる','nigeru','huir','manga','逃げろ！','nigero!','¡Huye!'],
  ['敵','てき','teki','enemigo','manga','お前は敵だ。','omae wa teki da.','Eres mi enemigo.'],
  ['力','ちから','chikara','poder / fuerza','manga','力が欲しい。','chikara ga hoshii.','Quiero poder.'],

  ['心','こころ','kokoro','corazón (emocional)','cosa','心から感謝します。','kokoro kara kansha shimasu.','Te lo agradezco de corazón.'],
  ['夢','ゆめ','yume','sueño / meta','cosa','夢を叶える。','yume wo kanaeru.','Cumplir un sueño.'],
  ['愛','あい','ai','amor','sentimiento','愛してる。','aishiteru.','Te amo.'],
  ['恋','こい','koi','enamoramiento','sentimiento','恋をした。','koi wo shita.','Me he enamorado.'],

  ['聞く','きく','kiku','escuchar / preguntar','verbo','聞いて！','kiite!','¡Escucha!'],
  ['書く','かく','kaku','escribir','verbo','名前を書いて。','namae wo kaite.','Escribe tu nombre.'],
  ['買う','かう','kau','comprar','verbo','何を買った？','nani wo katta?','¿Qué has comprado?'],
  ['使う','つかう','tsukau','usar','verbo','これを使って。','kore wo tsukatte.','Usa esto.'],

  ['大きい','おおきい','ookii','grande','adjetivo','大きい犬！','ookii inu!','¡Qué perro tan grande!'],
  ['小さい','ちいさい','chiisai','pequeño','adjetivo','小さい手','chiisai te','manos pequeñas'],
  ['高い','たかい','takai','caro / alto','adjetivo','高すぎる！','taka sugiru!','¡Es demasiado caro!'],
  ['安い','やすい','yasui','barato','adjetivo','安いね。','yasui ne.','Qué barato.'],

  ['それ','それ','sore','eso','básico','それはいいね！','sore wa ii ne!','¡Eso está genial!'],
  ['あれ','あれ','are','aquello / ¿eh?','básico','あれ？','are?','¿Eh? (algo raro)'],
  ['ここ','ここ','koko','aquí','básico','ここはどこ？','koko wa doko?','¿Dónde estoy?'],
  ['そこ','そこ','soko','ahí','básico','そこにいて。','soko ni ite.','Quédate ahí.'],

  ['猫','ねこ','neko','gato','animal','猫が大好き。','neko ga daisuki.','Me encantan los gatos.'],
  ['犬','いぬ','inu','perro','animal','犬を飼っている。','inu wo katte iru.','Tengo un perro.'],
  ['日本','にほん','nihon','Japón','lugar','日本に行きたい。','nihon ni ikitai.','Quiero ir a Japón.'],
  ['言葉','ことば','kotoba','palabra / idioma','cosa','言葉が出ない。','kotoba ga denai.','Me quedo sin palabras.'],

  ['朝','あさ','asa','mañana (parte del día)','tiempo','朝ご飯','asagohan','desayuno'],
  ['夜','よる','yoru','noche','tiempo','今夜、会える？','kon\'ya, aeru?','¿Nos vemos esta noche?'],
  ['昨日','きのう','kinou','ayer','tiempo','昨日は楽しかった。','kinou wa tanoshikatta.','Ayer me lo pasé genial.'],
  ['時間','じかん','jikan','tiempo / hora','tiempo','時間がない！','jikan ga nai!','¡No hay tiempo!'],

  ['いつも','いつも','itsumo','siempre','adverbio','いつもありがとう。','itsumo arigatou.','Gracias por todo, siempre.'],
  ['とても','とても','totemo','muy','adverbio','とても綺麗。','totemo kirei.','Muy bonito.'],
  ['たくさん','たくさん','takusan','mucho','adverbio','たくさん食べて。','takusan tabete.','Come mucho.'],
  ['全部','ぜんぶ','zenbu','todo','adverbio','全部食べた。','zenbu tabeta.','Me lo he comido todo.'],

  ['痛い','いたい','itai','doler','adjetivo','痛い！','itai!','¡Ay, duele!'],
  ['暑い','あつい','atsui','hacer calor','adjetivo','今日は暑いね。','kyou wa atsui ne.','Hoy hace calor, ¿eh?'],
  ['寒い','さむい','samui','hacer frío','adjetivo','寒い！','samui!','¡Qué frío!'],
  ['忙しい','いそがしい','isogashii','estar ocupado','adjetivo','今忙しい。','ima isogashii.','Ahora estoy ocupado.'],

  ['泣く','なく','naku','llorar','verbo','泣かないで。','nakanaide.','No llores.'],
  ['笑う','わらう','warau','reír / sonreír','verbo','笑って！','waratte!','¡Sonríe!'],
  ['信じる','しんじる','shinjiru','creer / confiar','verbo','信じて。','shinjite.','Confía en mí.'],
  ['忘れる','わすれる','wasureru','olvidar','verbo','忘れないで。','wasurenaide.','No me olvides.'],

  ['先生','せんせい','sensei','profesor / maestro','persona','先生、質問です！','sensei, shitsumon desu!','¡Profe, una pregunta!'],
  ['先輩','せんぱい','senpai','compañero mayor','manga','先輩、気づいて！','senpai, kizuite!','¡Senpai, fíjate en mí!'],
  ['彼','かれ','kare','él / novio','persona','彼は優しい。','kare wa yasashii.','Él es amable.'],
  ['家族','かぞく','kazoku','familia','persona','家族が大切。','kazoku ga taisetsu.','La familia es lo importante.'],

  ['優しい','やさしい','yasashii','amable / tierno','adjetivo','優しいね。','yasashii ne.','Qué majo/a eres.'],
  ['かっこいい','かっこいい','kakkoii','guay / atractivo','adjetivo','かっこいい！','kakkoii!','¡Qué guapo/guay!'],
  ['変','へん','hen','raro','adjetivo','変な人。','hen na hito.','Qué persona más rara.'],
  ['難しい','むずかしい','muzukashii','difícil','adjetivo','日本語は難しい。','nihongo wa muzukashii.','El japonés es difícil.'],

  ['簡単','かんたん','kantan','fácil','adjetivo','簡単だよ。','kantan da yo.','Es fácil.'],
  ['つまらない','つまらない','tsumaranai','aburrido','adjetivo','つまらない…','tsumaranai...','Qué aburrido…'],
  ['悲しい','かなしい','kanashii','triste','sentimiento','悲しい話','kanashii hanashi','una historia triste'],
  ['嫌い','きらい','kirai','odiar / no gustar','sentimiento','野菜が嫌い。','yasai ga kirai.','Odio la verdura.'],

  ['欲しい','ほしい','hoshii','querer (algo)','adjetivo','これが欲しい。','kore ga hoshii.','Quiero esto.'],
  ['元気','げんき','genki','con energía / bien','adjetivo','元気？','genki?','¿Qué tal estás?'],
  ['上手','じょうず','jouzu','hábil, bueno en algo','adjetivo','日本語上手！','nihongo jouzu!','¡Qué bien hablas japonés!'],
  ['下手','へた','heta','malo en algo / torpe','adjetivo','料理が下手。','ryouri ga heta.','Cocino fatal.'],

  ['遊ぶ','あそぶ','asobu','jugar / salir a divertirse','verbo','遊ぼう！','asobou!','¡Vamos a divertirnos!'],
  ['働く','はたらく','hataraku','trabajar','verbo','明日は働く。','ashita wa hataraku.','Mañana trabajo.'],
  ['休む','やすむ','yasumu','descansar','verbo','ゆっくり休んで。','yukkuri yasunde.','Descansa bien.'],
  ['作る','つくる','tsukuru','hacer / crear / cocinar','verbo','ご飯を作る。','gohan wo tsukuru.','Hago la comida.'],

  ['入る','はいる','hairu','entrar','verbo','入って。','haitte.','Pasa.'],
  ['出る','でる','deru','salir','verbo','出て行け！','dete ike!','¡Fuera de aquí!'],
  ['持つ','もつ','motsu','tener / llevar','verbo','持ってる？','motteru?','¿Lo tienes?'],
  ['教える','おしえる','oshieru','enseñar / decir','verbo','教えて！','oshiete!','¡Dímelo! / ¡Enséñame!'],

  ['始める','はじめる','hajimeru','empezar','verbo','始めよう！','hajimeyou!','¡Empecemos!'],
  ['終わる','おわる','owaru','terminar','verbo','終わった…','owatta...','Se acabó… / Estoy acabado.'],
  ['覚える','おぼえる','oboeru','memorizar / recordar','verbo','覚えてる？','oboeteru?','¿Te acuerdas?'],
  ['愛する','あいする','aisuru','amar','sentimiento','愛する人','aisuru hito','la persona amada'],

  ['世界','せかい','sekai','mundo','cosa','世界一可愛い。','sekai ichi kawaii.','La más mona del mundo.'],
  ['命','いのち','inochi','vida','manga','命をかける。','inochi wo kakeru.','Arriesgar la vida.'],
  ['約束','やくそく','yakusoku','promesa','cosa','約束だよ。','yakusoku da yo.','Es una promesa.'],
  ['秘密','ひみつ','himitsu','secreto','cosa','秘密だよ。','himitsu da yo.','Es un secreto.'],

  ['目','め','me','ojo','cuerpo','目が綺麗。','me ga kirei.','Tienes unos ojos preciosos.'],
  ['手','て','te','mano','cuerpo','手をつなごう。','te wo tsunagou.','Démonos la mano.'],
  ['顔','かお','kao','cara','cuerpo','顔が赤いよ。','kao ga akai yo.','Tienes la cara roja.'],
  ['声','こえ','koe','voz','cuerpo','声が好き。','koe ga suki.','Me encanta tu voz.'],

  ['問題','もんだい','mondai','problema','cosa','問題ない。','mondai nai.','Sin problema.'],
  ['気持ち','きもち','kimochi','sentimiento / sensación','sentimiento','気持ちいい！','kimochi ii!','¡Qué gusto!'],
  ['多分','たぶん','tabun','quizás','adverbio','多分大丈夫。','tabun daijoubu.','Seguramente esté bien.'],
  ['でも','でも','demo','pero','conector','でも、好き。','demo, suki.','Pero me gusta.'],

  ['だから','だから','dakara','por eso / así que','conector','だから言ったじゃん！','dakara itta jan!','¡Ya te lo dije!'],
  ['すぐ','すぐ','sugu','enseguida','adverbio','すぐ行く！','sugu iku!','¡Voy enseguida!'],
  ['後で','あとで','atode','luego / después','adverbio','後で電話する。','atode denwa suru.','Te llamo luego.'],
  ['毎日','まいにち','mainichi','cada día','tiempo','毎日勉強する。','mainichi benkyou suru.','Estudio cada día.'],

  ['お茶','おちゃ','ocha','té','cosa','お茶しない？','ocha shinai?','¿Tomamos algo?'],
  ['電話','でんわ','denwa','teléfono / llamada','cosa','電話して。','denwa shite.','Llámame.'],
  ['学校','がっこう','gakkou','escuela','lugar','学校に行く。','gakkou ni iku.','Voy a la escuela.'],
  ['空','そら','sora','cielo','cosa','空が綺麗だね。','sora ga kirei da ne.','Qué cielo tan bonito.'],

  ['男','おとこ','otoko','hombre','persona','男らしい。','otokorashii.','Muy varonil.'],
  ['女','おんな','onna','mujer','persona','女の子','onna no ko','chica'],
  ['子供','こども','kodomo','niño/a','persona','子供じゃない！','kodomo ja nai!','¡No soy un crío!'],
  ['彼氏','かれし','kareshi','novio','persona','彼氏いる？','kareshi iru?','¿Tienes novio?'],

  ['お母さん','おかあさん','okaasan','mamá','persona','お母さん、ただいま！','okaasan, tadaima!','¡Mamá, ya estoy en casa!'],
  ['お父さん','おとうさん','otousan','papá','persona','お父さんは厳しい。','otousan wa kibishii.','Mi padre es estricto.'],
  ['お兄ちゃん','おにいちゃん','oniichan','hermano mayor','persona','お兄ちゃん、待って！','oniichan, matte!','¡Hermano, espera!'],
  ['お姉ちゃん','おねえちゃん','oneechan','hermana mayor','persona','お姉ちゃんは優しい。','oneechan wa yasashii.','Mi hermana mayor es buena.'],

  ['開ける','あける','akeru','abrir','verbo','ドアを開けて。','doa wo akete.','Abre la puerta.'],
  ['閉める','しめる','shimeru','cerrar','verbo','窓を閉めて。','mado wo shimete.','Cierra la ventana.'],
  ['走る','はしる','hashiru','correr','verbo','走れ！','hashire!','¡Corre!'],
  ['殺す','ころす','korosu','matar','manga','殺すぞ！','korosu zo!','¡Te mato! (frase de villano)'],

  ['新しい','あたらしい','atarashii','nuevo','adjetivo','新しい服','atarashii fuku','ropa nueva'],
  ['古い','ふるい','furui','viejo (cosas)','adjetivo','古い家','furui ie','casa vieja'],
  ['悪い','わるい','warui','malo','adjetivo','悪い人','warui hito','mala persona'],
  ['王','おう','ou','rey','manga','海賊王に俺はなる！','kaizoku ou ni ore wa naru!','¡Seré el rey de los piratas!'],

  // ===== Ampliación 2: +200 palabras =====
  ['よかった','よかった','yokatta','¡menos mal! / qué bien','básico','よかった！','yokatta!','¡Menos mal!'],
  ['嘘','うそ','uso','mentira','básico','嘘でしょ！','uso desho!','¡No me lo creo!'],
  ['ねえ','ねえ','nee','oye','básico','ねえ、聞いて。','nee, kiite.','Oye, escucha.'],
  ['ほら','ほら','hora','¡mira! / ¿ves?','básico','ほら、見て！','hora, mite!','¡Mira!'],

  ['考える','かんがえる','kangaeru','pensar / reflexionar','verbo','ちょっと考える。','chotto kangaeru.','Déjame pensarlo.'],
  ['探す','さがす','sagasu','buscar','verbo','何を探してるの？','nani wo sagashiteru no?','¿Qué buscas?'],
  ['見つける','みつける','mitsukeru','encontrar','verbo','見つけた！','mitsuketa!','¡Lo encontré!'],
  ['違う','ちがう','chigau','ser diferente / no es así','verbo','違う！','chigau!','¡No es eso!'],

  ['ずっと','ずっと','zutto','siempre / todo el rato','adverbio','ずっと待ってた。','zutto matteta.','Te he estado esperando todo el rato.'],
  ['やっぱり','やっぱり','yappari','como pensaba / al final','adverbio','やっぱり君だ。','yappari kimi da.','Sabía que eras tú.'],
  ['きっと','きっと','kitto','seguro (que)','adverbio','きっと大丈夫。','kitto daijoubu.','Seguro que todo va bien.'],
  ['もっと','もっと','motto','más','adverbio','もっと食べて。','motto tabete.','Come más.'],

  ['幸せ','しあわせ','shiawase','felicidad / feliz','sentimiento','君といると幸せ。','kimi to iru to shiawase.','Soy feliz contigo.'],
  ['笑顔','えがお','egao','sonrisa','sentimiento','笑顔が素敵。','egao ga suteki.','Tienes una sonrisa preciosa.'],
  ['大切','たいせつ','taisetsu','importante / querido','adjetivo','君は大切な人だ。','kimi wa taisetsu na hito da.','Eres alguien importante para mí.'],
  ['特別','とくべつ','tokubetsu','especial','adjetivo','君は特別だ。','kimi wa tokubetsu da.','Eres especial.'],

  ['最高','さいこう','saikou','lo mejor / genial','adjetivo','最高！','saikou!','¡Lo mejor!'],
  ['最悪','さいあく','saiaku','lo peor','adjetivo','最悪…','saiaku...','Lo peor…'],
  ['無理','むり','muri','imposible / ni de coña','adjetivo','無理！','muri!','¡Imposible!'],
  ['冗談','じょうだん','joudan','broma','cosa','冗談だよ。','joudan da yo.','Es broma.'],

  ['自分','じぶん','jibun','uno mismo','pronombre','自分を信じろ。','jibun wo shinjiro.','Cree en ti mismo.'],
  ['みんな','みんな','minna','todos','pronombre','みんな、ありがとう！','minna, arigatou!','¡Gracias a todos!'],
  ['誰か','だれか','dareka','alguien','pronombre','誰か助けて！','dareka tasukete!','¡Que alguien me ayude!'],
  ['何か','なにか','nanika','algo','pronombre','何か食べたい。','nanika tabetai.','Quiero comer algo.'],

  ['おい','おい','oi','¡eh, tú!','manga','おい、待て！','oi, mate!','¡Eh, espera!'],
  ['本気','ほんき','honki','en serio / con todo','manga','本気で行くぞ！','honki de iku zo!','¡Voy en serio!'],
  ['諦める','あきらめる','akirameru','rendirse','manga','諦めるな！','akirameru na!','¡No te rindas!'],
  ['倒す','たおす','taosu','derribar / derrotar','manga','あいつを倒す！','aitsu wo taosu!','¡Lo derrotaré!'],

  ['仕事','しごと','shigoto','trabajo','cosa','仕事が終わった。','shigoto ga owatta.','He terminado de trabajar.'],
  ['休み','やすみ','yasumi','descanso / día libre','tiempo','明日は休み。','ashita wa yasumi.','Mañana libro.'],
  ['週末','しゅうまつ','shuumatsu','fin de semana','tiempo','週末、何する？','shuumatsu, nani suru?','¿Qué haces el finde?'],
  ['暇','ひま','hima','tener tiempo libre','adjetivo','今暇？','ima hima?','¿Estás libre ahora?'],

  ['恥ずかしい','はずかしい','hazukashii','qué vergüenza','sentimiento','恥ずかしい！','hazukashii!','¡Qué vergüenza!'],
  ['羨ましい','うらやましい','urayamashii','qué envidia','sentimiento','羨ましい！','urayamashii!','¡Qué envidia!'],
  ['懐かしい','なつかしい','natsukashii','qué nostalgia','sentimiento','懐かしいね。','natsukashii ne.','Qué recuerdos.'],
  ['素敵','すてき','suteki','precioso / encantador','adjetivo','素敵な笑顔','suteki na egao','una sonrisa preciosa'],

  ['頼む','たのむ','tanomu','pedir / rogar','verbo','頼む！','tanomu!','¡Te lo ruego!'],
  ['許す','ゆるす','yurusu','perdonar','verbo','許さない！','yurusanai!','¡No te lo perdonaré!'],
  ['気づく','きづく','kizuku','darse cuenta','verbo','気づかなかった。','kizukanakatta.','No me di cuenta.'],
  ['決める','きめる','kimeru','decidir','verbo','もう決めた。','mou kimeta.','Ya lo he decidido.'],

  ['肉','にく','niku','carne','comida','肉が食べたい！','niku ga tabetai!','¡Quiero carne!'],
  ['魚','さかな','sakana','pescado','comida','魚が好き。','sakana ga suki.','Me gusta el pescado.'],
  ['野菜','やさい','yasai','verdura','comida','野菜を食べなさい。','yasai wo tabenasai.','Cómete la verdura.'],
  ['お菓子','おかし','okashi','dulces / chuches','comida','お菓子買って！','okashi katte!','¡Cómprame chuches!'],

  ['前','まえ','mae','delante / antes','lugar','駅の前で会おう。','eki no mae de aou.','Quedamos delante de la estación.'],
  ['後ろ','うしろ','ushiro','detrás','lugar','後ろ！','ushiro!','¡Detrás de ti!'],
  ['上','うえ','ue','arriba','lugar','上を見て。','ue wo mite.','Mira arriba.'],
  ['下','した','shita','abajo','lugar','下に行く。','shita ni iku.','Bajo.'],

  ['どれ','どれ','dore','cuál','pregunta','どれがいい？','dore ga ii?','¿Cuál prefieres?'],
  ['どんな','どんな','donna','qué tipo de','pregunta','どんな人？','donna hito?','¿Qué tipo de persona es?'],
  ['どうやって','どうやって','dou yatte','cómo (de qué manera)','pregunta','どうやって行く？','dou yatte iku?','¿Cómo vamos?'],
  ['なぜ','なぜ','naze','por qué (formal)','pregunta','なぜだ？！','naze da?!','¿¡Por qué!?'],

  ['生きる','いきる','ikiru','vivir','manga','生きろ！','ikiro!','¡Vive!'],
  ['止める','とめる','tomeru','detener','manga','止めろ！','tomero!','¡Detenlo!'],
  ['運命','うんめい','unmei','destino','manga','これは運命だ。','kore wa unmei da.','Esto es el destino.'],
  ['未来','みらい','mirai','futuro','cosa','未来を変える！','mirai wo kaeru!','¡Cambiaré el futuro!'],

  ['怒る','おこる','okoru','enfadarse','verbo','怒ってる？','okotteru?','¿Estás enfadada?'],
  ['心配','しんぱい','shinpai','preocupación','sentimiento','心配しないで。','shinpai shinaide.','No te preocupes.'],
  ['驚く','おどろく','odoroku','sorprenderse','verbo','驚いた！','odoroita!','¡Qué sorpresa!'],
  ['困る','こまる','komaru','estar en apuros','verbo','困ったな…','komatta na...','Vaya lío…'],

  ['付き合う','つきあう','tsukiau','salir (ser pareja)','sentimiento','付き合ってください。','tsukiatte kudasai.','¿Quieres salir conmigo?'],
  ['告白','こくはく','kokuhaku','declaración de amor','sentimiento','告白された！','kokuhaku sareta!','¡Se me han declarado!'],
  ['照れる','てれる','tereru','sonrojarse / dar corte','sentimiento','照れるな～','tereru na~','Me da corte~'],
  ['結婚','けっこん','kekkon','boda / matrimonio','sentimiento','結婚してください。','kekkon shite kudasai.','Cásate conmigo.'],

  ['美しい','うつくしい','utsukushii','hermoso','adjetivo','美しい景色','utsukushii keshiki','un paisaje hermoso'],
  ['静か','しずか','shizuka','tranquilo / silencioso','adjetivo','静かにして。','shizuka ni shite.','Silencio, por favor.'],
  ['危ない','あぶない','abunai','¡cuidado! / peligroso','adjetivo','危ない！','abunai!','¡Cuidado!'],
  ['必要','ひつよう','hitsuyou','necesario','adjetivo','君が必要だ。','kimi ga hitsuyou da.','Te necesito.'],

  ['写真','しゃしん','shashin','foto','cosa','写真を撮って。','shashin wo totte.','Hazme una foto.'],
  ['映画','えいが','eiga','película','cosa','映画を見に行こう。','eiga wo mi ni ikou.','Vamos a ver una peli.'],
  ['音楽','おんがく','ongaku','música','cosa','音楽が好き。','ongaku ga suki.','Me gusta la música.'],
  ['歌','うた','uta','canción','cosa','歌って！','utatte!','¡Canta!'],

  ['一番','いちばん','ichiban','el número uno / lo más','adverbio','一番好き。','ichiban suki.','Es lo que más me gusta.'],
  ['よく','よく','yoku','bien / a menudo','adverbio','よくできた！','yoku dekita!','¡Muy bien hecho!'],
  ['全然','ぜんぜん','zenzen','nada / en absoluto','adverbio','全然大丈夫。','zenzen daijoubu.','Para nada, no pasa nada.'],
  ['すごく','すごく','sugoku','muy / súper','adverbio','すごく楽しい！','sugoku tanoshii!','¡Súper divertido!'],

  ['早い','はやい','hayai','temprano / rápido','adjetivo','早いね！','hayai ne!','¡Qué pronto!'],
  ['遅い','おそい','osoi','tarde / lento','adjetivo','遅い！','osoi!','¡Llegas tarde!'],
  ['近い','ちかい','chikai','cerca','adjetivo','駅は近い？','eki wa chikai?','¿La estación está cerca?'],
  ['遠い','とおい','tooi','lejos','adjetivo','遠いね。','tooi ne.','Está lejos, ¿eh?'],

  ['あいつ','あいつ','aitsu','ese / esa (despectivo)','manga','あいつ、誰？','aitsu, dare?','¿Quién es ese?'],
  ['奴','やつ','yatsu','tipo / ese tío','manga','あいつはいい奴だ。','aitsu wa ii yatsu da.','Es un buen tío.'],
  ['神','かみ','kami','dios','manga','神様、お願い！','kamisama, onegai!','¡Dios mío, por favor!'],
  ['鬼','おに','oni','ogro / demonio japonés','manga','鬼を倒す！','oni wo taosu!','¡Mataré al demonio!'],

  ['意味','いみ','imi','significado','cosa','どういう意味？','dou iu imi?','¿Qué significa?'],
  ['話','はなし','hanashi','historia / charla','cosa','話がある。','hanashi ga aru.','Tenemos que hablar.'],
  ['理由','りゆう','riyuu','razón / motivo','cosa','理由は？','riyuu wa?','¿Por qué motivo?'],
  ['質問','しつもん','shitsumon','pregunta','cosa','質問がある。','shitsumon ga aru.','Tengo una pregunta.'],

  ['あげる','あげる','ageru','dar (a otro)','verbo','これ、あげる。','kore, ageru.','Esto, para ti.'],
  ['もらう','もらう','morau','recibir','verbo','プレゼントをもらった。','purezento wo moratta.','Me han hecho un regalo.'],
  ['くれる','くれる','kureru','darme (a mí)','verbo','これくれるの？','kore kureru no?','¿Me lo das?'],
  ['送る','おくる','okuru','enviar / acompañar','verbo','写真を送って。','shashin wo okutte.','Mándame una foto.'],

  ['赤','あか','aka','rojo','color','赤い糸','akai ito','el hilo rojo (del destino)'],
  ['青','あお','ao','azul','color','青い空','aoi sora','cielo azul'],
  ['白','しろ','shiro','blanco','color','白い雪','shiroi yuki','nieve blanca'],
  ['黒','くろ','kuro','negro','color','黒い猫','kuroi neko','gato negro'],

  ['涙','なみだ','namida','lágrima','sentimiento','涙が止まらない。','namida ga tomaranai.','No paro de llorar.'],
  ['体','からだ','karada','cuerpo','cuerpo','体に気をつけて。','karada ni ki wo tsukete.','Cuídate.'],
  ['頭','あたま','atama','cabeza','cuerpo','頭がいい。','atama ga ii.','Es listo.'],
  ['髪','かみ','kami','pelo','cuerpo','髪、切った？','kami, kitta?','¿Te has cortado el pelo?'],

  ['歩く','あるく','aruku','caminar','verbo','一緒に歩こう。','issho ni arukou.','Caminemos juntos.'],
  ['座る','すわる','suwaru','sentarse','verbo','ここに座って。','koko ni suwatte.','Siéntate aquí.'],
  ['立つ','たつ','tatsu','ponerse de pie','verbo','立て！','tate!','¡Levántate!'],
  ['呼ぶ','よぶ','yobu','llamar (a alguien)','verbo','誰か呼んで！','dareka yonde!','¡Llama a alguien!'],

  ['今度','こんど','kondo','la próxima vez','tiempo','今度一緒に行こう。','kondo issho ni ikou.','La próxima vez vamos juntos.'],
  ['次','つぎ','tsugi','siguiente','tiempo','次は君の番だ。','tsugi wa kimi no ban da.','Ahora es tu turno.'],
  ['最後','さいご','saigo','último / final','cosa','最後まで戦う！','saigo made tatakau!','¡Lucharé hasta el final!'],
  ['最初','さいしょ','saisho','primero / al principio','cosa','最初から','saisho kara','desde el principio'],

  ['同じ','おなじ','onaji','igual / mismo','adjetivo','同じだね。','onaji da ne.','Es lo mismo.'],
  ['正しい','ただしい','tadashii','correcto','adjetivo','君が正しい。','kimi ga tadashii.','Tienes razón.'],
  ['ずるい','ずるい','zurui','tramposo / injusto','adjetivo','ずるい！','zurui!','¡Qué injusto!'],
  ['ひどい','ひどい','hidoi','cruel / horrible','adjetivo','ひどい！','hidoi!','¡Qué cruel!'],

  ['海','うみ','umi','mar / playa','lugar','海に行こう！','umi ni ikou!','¡Vamos a la playa!'],
  ['山','やま','yama','montaña','lugar','山に登る。','yama ni noboru.','Subo a la montaña.'],
  ['部屋','へや','heya','habitación','lugar','私の部屋','watashi no heya','mi habitación'],
  ['町','まち','machi','ciudad / pueblo','lugar','この町が好き。','kono machi ga suki.','Me gusta esta ciudad.'],

  ['魔法','まほう','mahou','magia','manga','魔法を使える。','mahou wo tsukaeru.','Puedo usar magia.'],
  ['剣','けん','ken','espada','manga','剣を抜け！','ken wo nuke!','¡Desenvaina la espada!'],
  ['技','わざ','waza','técnica / ataque especial','manga','必殺技！','hissatsu waza!','¡Técnica definitiva!'],
  ['勝負','しょうぶ','shoubu','duelo / combate','manga','勝負だ！','shoubu da!','¡Combate!'],

  ['乗る','のる','noru','subir (a un vehículo)','verbo','電車に乗る。','densha ni noru.','Cojo el tren.'],
  ['払う','はらう','harau','pagar','verbo','私が払う。','watashi ga harau.','Pago yo.'],
  ['遅れる','おくれる','okureru','llegar tarde','verbo','ごめん、遅れる！','gomen, okureru!','¡Perdón, llego tarde!'],
  ['似合う','にあう','niau','quedar bien (ropa)','verbo','よく似合うね！','yoku niau ne!','¡Te queda genial!'],

  ['電車','でんしゃ','densha','tren','cosa','電車で行く。','densha de iku.','Voy en tren.'],
  ['車','くるま','kuruma','coche','cosa','車で行こう。','kuruma de ikou.','Vamos en coche.'],
  ['本','ほん','hon','libro','cosa','この本、面白い。','kono hon, omoshiroi.','Este libro es interesante.'],
  ['服','ふく','fuku','ropa','cosa','その服、かわいい！','sono fuku, kawaii!','¡Qué ropa tan mona!'],

  ['じゃあ','じゃあ','jaa','entonces / bueno','conector','じゃあ、行こう。','jaa, ikou.','Bueno, vamos.'],
  ['それで','それで','sorede','y entonces / ¿y qué?','conector','それで？','sorede?','¿Y entonces?'],
  ['もし','もし','moshi','si (condicional)','conector','もし良かったら…','moshi yokattara...','Si te parece bien…'],
  ['例えば','たとえば','tatoeba','por ejemplo','conector','例えば？','tatoeba?','¿Por ejemplo?'],

  ['甘い','あまい','amai','dulce','adjetivo','甘いものが好き。','amai mono ga suki.','Me gusta lo dulce.'],
  ['辛い','からい','karai','picante','adjetivo','辛い！','karai!','¡Pica!'],
  ['まずい','まずい','mazui','asqueroso / chungo','adjetivo','まずい！','mazui!','¡Qué asco! / ¡Mal asunto!'],
  ['熱い','あつい','atsui','caliente (cosas)','adjetivo','熱い！','atsui!','¡Quema!'],

  ['天気','てんき','tenki','tiempo (clima)','cosa','いい天気だね。','ii tenki da ne.','Hace buen día.'],
  ['雨','あめ','ame','lluvia','cosa','雨が降ってる。','ame ga futteru.','Está lloviendo.'],
  ['花','はな','hana','flor','cosa','花をあげる。','hana wo ageru.','Te regalo flores.'],
  ['月','つき','tsuki','luna / mes','cosa','月が綺麗ですね。','tsuki ga kirei desu ne.','La luna está preciosa (= te quiero).'],

  ['こっち','こっち','kocchi','por aquí','básico','こっちだよ！','kocchi da yo!','¡Por aquí!'],
  ['あっち','あっち','acchi','por allí','básico','あっち行け！','acchi ike!','¡Vete por ahí!'],
  ['いくつ','いくつ','ikutsu','cuántos / qué edad','pregunta','いくつ？','ikutsu?','¿Cuántos años tienes?'],
  ['何も','なにも','nanimo','nada (con negativo)','pronombre','何もない。','nanimo nai.','No hay nada.'],

  ['長い','ながい','nagai','largo','adjetivo','髪が長い。','kami ga nagai.','Tiene el pelo largo.'],
  ['短い','みじかい','mijikai','corto','adjetivo','人生は短い。','jinsei wa mijikai.','La vida es corta.'],
  ['多い','おおい','ooi','muchos','adjetivo','人が多い。','hito ga ooi.','Hay mucha gente.'],
  ['少ない','すくない','sukunai','pocos','adjetivo','時間が少ない。','jikan ga sukunai.','Queda poco tiempo.'],

  ['血','ち','chi','sangre','manga','血が出てる！','chi ga deteru!','¡Estás sangrando!'],
  ['悪魔','あくま','akuma','demonio','manga','悪魔の力','akuma no chikara','el poder del demonio'],
  ['正義','せいぎ','seigi','justicia','manga','正義の味方','seigi no mikata','defensor de la justicia'],
  ['復讐','ふくしゅう','fukushuu','venganza','manga','復讐してやる。','fukushuu shite yaru.','Me vengaré.'],

  ['女の子','おんなのこ','onna no ko','chica','persona','かわいい女の子','kawaii onna no ko','una chica mona'],
  ['男の子','おとこのこ','otoko no ko','chico','persona','男の子でしょ！','otoko no ko desho!','¡Eres un chico, ¿no?! (sé valiente)'],
  ['私たち','わたしたち','watashitachi','nosotros','pronombre','私たちは友達。','watashitachi wa tomodachi.','Somos amigos.'],
  ['皆さん','みなさん','minasan','todos ustedes','pronombre','皆さん、こんにちは。','minasan, konnichiwa.','Hola a todos.'],

  ['口','くち','kuchi','boca','cuerpo','口を閉じろ。','kuchi wo tojiro.','Cierra la boca.'],
  ['胸','むね','mune','pecho','cuerpo','胸が痛い。','mune ga itai.','Me duele el pecho (o el corazón).'],
  ['足','あし','ashi','pie / pierna','cuerpo','足が痛い。','ashi ga itai.','Me duelen los pies.'],
  ['物','もの','mono','cosa','cosa','欲しい物は？','hoshii mono wa?','¿Qué cosa quieres?'],

  ['着る','きる','kiru','ponerse (ropa)','verbo','何を着る？','nani wo kiru?','¿Qué me pongo?'],
  ['返す','かえす','kaesu','devolver','verbo','返して！','kaeshite!','¡Devuélvemelo!'],
  ['貸す','かす','kasu','prestar','verbo','ペン貸して。','pen kashite.','Préstame un boli.'],
  ['住む','すむ','sumu','residir / vivir en','verbo','どこに住んでる？','doko ni sunderu?','¿Dónde vives?'],

  ['右','みぎ','migi','derecha','lugar','右に曲がって。','migi ni magatte.','Gira a la derecha.'],
  ['左','ひだり','hidari','izquierda','lugar','左です。','hidari desu.','Es a la izquierda.'],
  ['中','なか','naka','dentro','lugar','中に入って。','naka ni haitte.','Entra.'],
  ['外','そと','soto','fuera','lugar','外は寒い。','soto wa samui.','Fuera hace frío.'],

  ['大変','たいへん','taihen','duro / ¡qué fuerte!','adjetivo','大変だね。','taihen da ne.','Qué duro, ¿eh?'],
  ['偉い','えらい','erai','admirable','adjetivo','偉いね！','erai ne!','¡Bien hecho!'],
  ['若い','わかい','wakai','joven','adjetivo','若いね。','wakai ne.','Qué joven.'],
  ['冷たい','つめたい','tsumetai','frío (cosas / persona)','adjetivo','冷たいね。','tsumetai ne.','Qué frío/a eres.'],

  ['今年','ことし','kotoshi','este año','tiempo','今年こそ！','kotoshi koso!','¡Este año sí!'],
  ['来年','らいねん','rainen','el año que viene','tiempo','来年、日本に行く。','rainen, nihon ni iku.','El año que viene voy a Japón.'],
  ['時々','ときどき','tokidoki','a veces','tiempo','時々会う。','tokidoki au.','Nos vemos a veces.'],
  ['昔','むかし','mukashi','antiguamente / érase una vez','tiempo','昔々…','mukashi mukashi...','Érase una vez…'],

  ['誕生日','たんじょうび','tanjoubi','cumpleaños','tiempo','誕生日はいつ？','tanjoubi wa itsu?','¿Cuándo es tu cumple?'],
  ['分','ふん','fun','minuto','tiempo','五分待って。','gofun matte.','Espera cinco minutos.'],
  ['千','せん','sen','mil (1.000)','número','千円','sen en','mil yenes'],
  ['万','まん','man','diez mil (10.000)','número','一万円','ichiman en','diez mil yenes'],

  ['卵','たまご','tamago','huevo','comida','卵かけご飯','tamago kake gohan','arroz con huevo crudo'],
  ['お酒','おさけ','osake','alcohol / sake','comida','お酒飲める？','osake nomeru?','¿Bebes alcohol?'],
  ['朝ご飯','あさごはん','asagohan','desayuno','comida','朝ご飯食べた？','asagohan tabeta?','¿Has desayunado?'],
  ['晩ご飯','ばんごはん','bangohan','cena','comida','晩ご飯、何がいい？','bangohan, nani ga ii?','¿Qué te apetece cenar?'],

  ['過去','かこ','kako','pasado','cosa','過去は忘れろ。','kako wa wasurero.','Olvida el pasado.'],
  ['場所','ばしょ','basho','lugar / sitio','lugar','いい場所だね。','ii basho da ne.','Qué buen sitio.'],
  ['事','こと','koto','asunto / cosa (abstracta)','cosa','君の事が好き。','kimi no koto ga suki.','Me gustas (todo de ti).'],
  ['桜','さくら','sakura','flor de cerezo','cosa','桜が綺麗。','sakura ga kirei.','Los cerezos están preciosos.'],

  ['星','ほし','hoshi','estrella','cosa','星が見える。','hoshi ga mieru.','Se ven las estrellas.'],
  ['雪','ゆき','yuki','nieve','cosa','雪だ！','yuki da!','¡Nieva!'],
  ['風','かぜ','kaze','viento','cosa','風が強い。','kaze ga tsuyoi.','Hace mucho viento.'],
  ['火','ひ','hi','fuego','manga','火を使え！','hi wo tsukae!','¡Usa el fuego!'],

  ['洗う','あらう','arau','lavar','verbo','手を洗って。','te wo aratte.','Lávate las manos.'],
  ['取る','とる','toru','coger / tomar','verbo','塩を取って。','shio wo totte.','Pásame la sal.'],
  ['壊す','こわす','kowasu','romper','verbo','壊さないで。','kowasanaide.','No lo rompas.'],
  ['続ける','つづける','tsuzukeru','continuar','verbo','続けて。','tsuzukete.','Sigue.'],

  ['降りる','おりる','oriru','bajar (de vehículo)','verbo','次で降りる。','tsugi de oriru.','Me bajo en la siguiente.'],
  ['落ちる','おちる','ochiru','caer','verbo','落ちるな！','ochiru na!','¡No te caigas!'],
  ['間に合う','まにあう','maniau','llegar a tiempo','verbo','間に合った！','maniatta!','¡Llegué a tiempo!'],
  ['変わる','かわる','kawaru','cambiar','verbo','君は変わったね。','kimi wa kawatta ne.','Has cambiado.'],

  ['無事','ぶじ','buji','sano y salvo','adjetivo','無事でよかった。','buji de yokatta.','Menos mal que estás bien.'],
  ['明るい','あかるい','akarui','luminoso / alegre','adjetivo','明るい人','akarui hito','persona alegre'],
  ['暗い','くらい','kurai','oscuro','adjetivo','暗い！','kurai!','¡Qué oscuro!'],
  ['色々','いろいろ','iroiro','varios / de todo','adverbio','色々ありがとう。','iroiro arigatou.','Gracias por todo.'],
];

window.VOCAB = window.VOCAB_RAW.map((v, i) => ({
  id: 'v' + i, type: 'vocab',
  jp: v[0], kana: v[1], romaji: v[2], es: v[3], tag: v[4],
  ex: v[5] ? { jp: v[5], romaji: v[6], es: v[7] } : null,
}));
