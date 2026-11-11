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
];

window.VOCAB = window.VOCAB_RAW.map((v, i) => ({
  id: 'v' + i, type: 'vocab',
  jp: v[0], kana: v[1], romaji: v[2], es: v[3], tag: v[4],
  ex: v[5] ? { jp: v[5], romaji: v[6], es: v[7] } : null,
}));
