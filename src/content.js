/* ===================== COURSE CONTENT =====================
   Professional French for the luxury natural-stone trade.
   Speakers: A = interlocutor (female voice), C = site manager (male voice, lower pitch), N = the learner (male voice).
   {nome} and {empresa} are filled from the learner's settings.
   Text inside «» is French everywhere (the narrator reads it with a French voice); Portuguese quotes use “”.
   item:  [fr, pt, build?]  build = backward build-up chunks, ending with the full phrase
   drill: [pt, fr]          role: [cue fr (spoken by A or C), task pt, model fr]            */

const MODULES = [
  { id:"m1", n:1, fr:"Premier contact", pt:"Primeiro contacto", stone:"carrara", blurb:"Telefonar, marcar, perceber o projeto, falar de medidas e preços." },
  { id:"m2", n:2, fr:"La pierre", pt:"A pedra", stone:"travertin", blurb:"Materiais, acabamentos, peças e a escolha das chapas." },
  { id:"m3", n:3, fr:"Le devis", pt:"Orçamento e negociação", stone:"quartzite", blurb:"Apresentar, defender o preço, condições e fecho." },
  { id:"m4", n:4, fr:"Le chantier", pt:"Obra e entrega", stone:"granit", blurb:"Medições, produção, transporte, montagem e reclamações." }
];

const LESSONS = [
/* ---------------- Module 1 · Premier contact ---------------- */
{ id:"l01", m:"m1", n:1, fr:"Au téléphone", pt:"Ao telefone",
  situation:"Ligas para um gabinete de arquitetura em Paris para falar com a arquiteta do projeto.",
  cue:"A",
  dialogue:[
    ["A","Cabinet Moreau, bonjour.","Gabinete Moreau, bom dia."],
    ["N","Bonjour, madame. Je voudrais parler à Madame Moreau, s'il vous plaît.","Bom dia. Queria falar com a senhora Moreau, por favor."],
    ["A","C'est de la part de qui ?","Da parte de quem?"],
    ["N","De la part de {nome}, de la société {empresa}. Nous sommes spécialisés dans la pierre naturelle haut de gamme.","Da parte de {nome}, da empresa {empresa}. Somos especializados em pedra natural de gama alta."],
    ["A","Et c'est à quel sujet ?","E é sobre que assunto?"],
    ["N","C'est au sujet du projet de l'avenue Montaigne.","É sobre o projeto da avenida Montaigne."],
    ["A","Très bien. Ne quittez pas, je vous la passe.","Muito bem. Não desligue, vou passar-lha."]
  ],
  items:[
    ["Je voudrais parler à Madame Moreau.","Queria falar com a senhora Moreau.",["Madame Moreau","parler à Madame Moreau","Je voudrais parler à Madame Moreau"]],
    ["s'il vous plaît","por favor"],
    ["C'est de la part de qui ?","Da parte de quem?",["de qui","de la part de qui","C'est de la part de qui ?"]],
    ["De la part de {nome}.","Da parte de {nome}."],
    ["la société {empresa}","a empresa {empresa}"],
    ["Nous sommes spécialisés dans la pierre naturelle.","Somos especializados em pedra natural.",["la pierre naturelle","spécialisés dans la pierre naturelle","Nous sommes spécialisés dans la pierre naturelle"]],
    ["haut de gamme","de gama alta"],
    ["C'est à quel sujet ?","É sobre que assunto?"],
    ["C'est au sujet du projet.","É sobre o projeto.",["du projet","au sujet du projet","C'est au sujet du projet"]],
    ["Ne quittez pas.","Não desligue."],
    ["Je vous la passe.","Vou passar-lha."],
    ["Très bien.","Muito bem."]
  ],
  drills:[
    ["Queria falar com o senhor Durand, por favor.","Je voudrais parler à Monsieur Durand, s'il vous plaît."],
    ["Da parte de {nome}, da empresa {empresa}.","De la part de {nome}, de la société {empresa}."],
    ["Somos especializados em pedra natural de gama alta.","Nous sommes spécialisés dans la pierre naturelle haut de gamme."],
    ["É sobre o projeto de Genebra.","C'est au sujet du projet de Genève."],
    ["Não desligue, vou passar-lho.","Ne quittez pas, je vous le passe."]
  ],
  roles:[
    ["Cabinet Moreau, bonjour.","Cumprimenta e pede para falar com a senhora Moreau.","Bonjour, madame. Je voudrais parler à Madame Moreau, s'il vous plaît."],
    ["C'est de la part de qui ?","Diz o teu nome e a tua empresa.","De la part de {nome}, de la société {empresa}."],
    ["Et c'est à quel sujet ?","Diz que é sobre o projeto da avenida Montaigne.","C'est au sujet du projet de l'avenue Montaigne."]
  ],
  notes:[
    "Ao telefone, quando não sabes o nome, basta «madame» ou «monsieur», sem apelido.",
    "«Je vous la passe» leva «la» porque é uma mulher. Para um homem: «je vous le passe»."
  ]
},
{ id:"l02", m:"m1", n:2, fr:"Prendre rendez-vous", pt:"Marcar uma reunião",
  situation:"A arquiteta atende. Marcas uma reunião para lhe apresentar os materiais.",
  cue:"A",
  dialogue:[
    ["A","Bonjour, monsieur. Je vous écoute.","Bom dia. Diga, estou a ouvir."],
    ["N","Bonjour, madame. Je souhaiterais vous présenter nos matériaux. Seriez-vous disponible la semaine prochaine ?","Bom dia. Gostaria de lhe apresentar os nossos materiais. Estaria disponível na próxima semana?"],
    ["A","Oui, plutôt en fin de semaine.","Sim, de preferência no fim da semana."],
    ["N","Jeudi à dix heures, ça vous conviendrait ?","Quinta-feira às dez, dava-lhe jeito?"],
    ["A","Jeudi à dix heures, c'est parfait. À l'agence ?","Quinta às dez está perfeito. No gabinete?"],
    ["N","Oui, je viendrai avec des échantillons.","Sim, vou com amostras."],
    ["A","Très bien. À jeudi, alors.","Muito bem. Até quinta, então."],
    ["N","À jeudi. Bonne journée, madame.","Até quinta. Bom dia."]
  ],
  items:[
    ["Je vous écoute.","Diga, estou a ouvir."],
    ["Je souhaiterais vous présenter nos matériaux.","Gostaria de lhe apresentar os nossos materiais.",["nos matériaux","vous présenter nos matériaux","Je souhaiterais vous présenter nos matériaux"]],
    ["Seriez-vous disponible ?","Estaria disponível?"],
    ["la semaine prochaine","na próxima semana"],
    ["plutôt en fin de semaine","de preferência no fim da semana"],
    ["jeudi à dix heures","quinta-feira às dez horas"],
    ["Ça vous conviendrait ?","Dava-lhe jeito?"],
    ["C'est parfait.","Está perfeito."],
    ["À l'agence ?","No gabinete?"],
    ["Je viendrai avec des échantillons.","Vou com amostras.",["des échantillons","avec des échantillons","Je viendrai avec des échantillons"]],
    ["À jeudi, alors.","Até quinta, então."],
    ["Bonne journée.","Bom dia (ao despedir)."]
  ],
  drills:[
    ["Estaria disponível na segunda-feira?","Seriez-vous disponible lundi ?"],
    ["Terça às três da tarde, dava-lhe jeito?","Mardi à quinze heures, ça vous conviendrait ?"],
    ["Gostaria de lhe apresentar as nossas amostras.","Je souhaiterais vous présenter nos échantillons."],
    ["Vou com amostras de mármore.","Je viendrai avec des échantillons de marbre."],
    ["Quarta-feira às nove e meia.","Mercredi à neuf heures et demie."],
    ["Até sexta, então. Bom dia.","À vendredi, alors. Bonne journée."]
  ],
  roles:[
    ["Bonjour, monsieur. Je vous écoute.","Diz que gostavas de lhe apresentar os vossos materiais.","Bonjour, madame. Je souhaiterais vous présenter nos matériaux."],
    ["Plutôt en fin de semaine.","Propõe quinta-feira às dez.","Jeudi à dix heures, ça vous conviendrait ?"],
    ["À l'agence ?","Confirma e diz que levas amostras.","Oui, je viendrai avec des échantillons."]
  ],
  notes:[
    "No trabalho, as horas dizem-se de 0 a 24: «quinze heures» são as três da tarde.",
    "«Bonjour» é para cumprimentar. Para te despedires de dia, diz «bonne journée»; ao fim da tarde, «bonne soirée»."
  ]
},
{ id:"l03", m:"m1", n:3, fr:"Comprendre le projet", pt:"Perceber o projeto",
  situation:"Na reunião, recebes os desenhos e ficas a saber os prazos e as preocupações do cliente.",
  cue:"A",
  dialogue:[
    ["A","Voici les plans de la cuisine et des salles de bains.","Aqui estão os desenhos da cozinha e das casas de banho."],
    ["N","Merci. Quel est le délai prévu pour le chantier ?","Obrigado. Qual é o prazo previsto para a obra?"],
    ["A","Le chantier commence en mars, et la livraison est prévue fin mai.","A obra começa em março e a entrega está prevista para o fim de maio."],
    ["N","Très bien. Avez-vous déjà choisi les matériaux ?","Muito bem. Já escolheram os materiais?"],
    ["A","Pas encore. Le client adore le marbre, mais il a peur des taches.","Ainda não. O cliente adora mármore, mas tem medo das manchas."],
    ["N","Je comprends. Nous avons des solutions pour ça. Pourriez-vous m'envoyer les plans par e-mail ?","Compreendo. Temos soluções para isso. Podia enviar-me os desenhos por email?"],
    ["A","Bien sûr. Je vous les envoie aujourd'hui.","Claro. Envio-lhos hoje."]
  ],
  items:[
    ["les plans de la cuisine","os desenhos da cozinha"],
    ["les salles de bains","as casas de banho"],
    ["Quel est le délai prévu ?","Qual é o prazo previsto?",["le délai prévu","Quel est le délai prévu ?"]],
    ["le chantier","a obra"],
    ["La livraison est prévue fin mai.","A entrega está prevista para o fim de maio.",["fin mai","est prévue fin mai","La livraison est prévue fin mai"]],
    ["Avez-vous déjà choisi les matériaux ?","Já escolheu os materiais?",["les matériaux","déjà choisi les matériaux","Avez-vous déjà choisi les matériaux ?"]],
    ["Pas encore.","Ainda não."],
    ["Il a peur des taches.","Tem medo das manchas."],
    ["Je comprends.","Compreendo."],
    ["Nous avons des solutions pour ça.","Temos soluções para isso."],
    ["Pourriez-vous m'envoyer les plans ?","Podia enviar-me os desenhos?",["les plans","m'envoyer les plans","Pourriez-vous m'envoyer les plans ?"]],
    ["par e-mail","por email"],
    ["Je vous les envoie aujourd'hui.","Envio-lhos hoje."]
  ],
  drills:[
    ["Podia enviar-me os desenhos da cozinha?","Pourriez-vous m'envoyer les plans de la cuisine ?"],
    ["Qual é o prazo previsto para a entrega?","Quel est le délai prévu pour la livraison ?"],
    ["Já escolheu o mármore?","Avez-vous déjà choisi le marbre ?"],
    ["A obra começa em abril.","Le chantier commence en avril."],
    ["O cliente tem medo dos riscos.","Le client a peur des rayures."]
  ],
  roles:[
    ["Voici les plans.","Agradece e pergunta qual é o prazo previsto para a obra.","Merci. Quel est le délai prévu pour le chantier ?"],
    ["Le client adore le marbre, mais il a peur des taches.","Diz que compreendes e que têm soluções para isso.","Je comprends. Nous avons des solutions pour ça."],
    ["Je peux vous envoyer quelque chose ?","Pede-lhe os desenhos por email.","Oui, pourriez-vous m'envoyer les plans par e-mail ?"]
  ],
  notes:[
    "Cuidado: «délai» é prazo. Atraso diz-se «retard».",
    "«Les plans» são os desenhos. A planta de um piso também é «un plan»."
  ]
},
{ id:"l04", m:"m1", n:4, fr:"Cotes et prix", pt:"Medidas e preços",
  situation:"A arquiteta pede medidas, espessuras e um preço por metro quadrado.",
  cue:"A",
  dialogue:[
    ["A","Quelles sont les dimensions de l'îlot ?","Quais são as medidas da ilha?"],
    ["N","Trois mètres vingt sur un mètre dix.","Três metros e vinte por um metro e dez."],
    ["A","Et l'épaisseur ?","E a espessura?"],
    ["N","Deux centimètres, avec une retombée de six centimètres.","Dois centímetros, com um avental de seis centímetros."],
    ["A","Ça fait combien de mètres carrés au total ?","Quantos metros quadrados dá no total?"],
    ["N","Environ quatorze mètres carrés, crédences comprises.","Cerca de catorze metros quadrados, com os frontões incluídos."],
    ["A","Et le prix, à peu près ?","E o preço, mais ou menos?"],
    ["N","Pour ce marbre, comptez environ huit cents euros le mètre carré, posé.","Para este mármore, conte com cerca de oitocentos euros o metro quadrado, instalado."]
  ],
  items:[
    ["Quelles sont les dimensions ?","Quais são as medidas?"],
    ["l'îlot","a ilha (da cozinha)"],
    ["trois mètres vingt sur un mètre dix","três metros e vinte por um metro e dez",["un mètre dix","sur un mètre dix","trois mètres vingt sur un mètre dix"]],
    ["l'épaisseur","a espessura"],
    ["une retombée de six centimètres","um avental de seis centímetros",["six centimètres","une retombée de six centimètres"]],
    ["Ça fait combien de mètres carrés ?","Quantos metros quadrados dá?",["mètres carrés","combien de mètres carrés","Ça fait combien de mètres carrés ?"]],
    ["environ quatorze mètres carrés","cerca de catorze metros quadrados"],
    ["crédences comprises","com os frontões incluídos"],
    ["à peu près","mais ou menos"],
    ["Comptez environ…","Conte com cerca de…"],
    ["huit cents euros le mètre carré","oitocentos euros o metro quadrado",["le mètre carré","huit cents euros le mètre carré"]],
    ["posé","instalado (com montagem)"]
  ],
  drills:[
    ["Dois metros e quarenta por noventa centímetros.","Deux mètres quarante sur quatre-vingt-dix centimètres."],
    ["A espessura é de três centímetros.","L'épaisseur est de trois centimètres."],
    ["Setenta e cinco centímetros.","Soixante-quinze centimètres."],
    ["Cerca de vinte e oito metros quadrados.","Environ vingt-huit mètres carrés."],
    ["Mil e duzentos euros o metro quadrado, instalado.","Mille deux cents euros le mètre carré, posé."],
    ["Noventa e oito metros quadrados.","Quatre-vingt-dix-huit mètres carrés."]
  ],
  roles:[
    ["Quelles sont les dimensions de l'îlot ?","Diz: três metros e vinte por um metro e dez.","Trois mètres vingt sur un mètre dix."],
    ["Et l'épaisseur ?","Dois centímetros, com um avental de seis.","Deux centimètres, avec une retombée de six centimètres."],
    ["Et le prix, à peu près ?","Cerca de oitocentos euros o metro quadrado, instalado.","Comptez environ huit cents euros le mètre carré, posé."]
  ],
  notes:[
    "Nas medidas, o “por” diz-se «sur»: «trois mètres vingt sur un mètre dix».",
    "70 é «soixante-dix», 80 «quatre-vingts», 90 «quatre-vingt-dix». Na Suíça e na Bélgica ouves «septante» e «nonante»; em alguns cantões suíços, «huitante»."
  ]
},
/* ---------------- Module 2 · La pierre ---------------- */
{ id:"l05", m:"m2", n:5, fr:"Les matériaux", pt:"Os materiais",
  situation:"No showroom, aconselhas a pedra certa para cada espaço.",
  cue:"A",
  dialogue:[
    ["A","Qu'est-ce que vous nous conseillez pour la salle de bains ?","O que é que nos aconselha para a casa de banho?"],
    ["N","Pour un rendu chaleureux, je vous conseille un travertin.","Para um efeito acolhedor, aconselho-lhe um travertino."],
    ["A","Le travertin, ce n'est pas trop poreux ?","O travertino não é demasiado poroso?"],
    ["N","Il est poreux, oui, mais on le rebouche et on le traite. Il est très résistant.","É poroso, sim, mas betumamos e tratamos. É muito resistente."],
    ["A","Et pour la cuisine ?","E para a cozinha?"],
    ["N","Un quartzite. C'est plus dur que le granit, et ça ressemble au marbre.","Um quartzito. É mais duro do que o granito e parece mármore."],
    ["A","Intéressant. D'où vient cette pierre ?","Interessante. De onde vem esta pedra?"],
    ["N","Du Brésil. Le marbre, lui, vient du Portugal, d'Estremoz.","Do Brasil. Já o mármore vem de Portugal, de Estremoz."]
  ],
  items:[
    ["Qu'est-ce que vous nous conseillez ?","O que é que nos aconselha?"],
    ["Je vous conseille un travertin.","Aconselho-lhe um travertino."],
    ["un rendu chaleureux","um efeito acolhedor"],
    ["Ce n'est pas trop poreux ?","Não é demasiado poroso?"],
    ["On le rebouche et on le traite.","Betumamos e tratamos.",["et on le traite","On le rebouche et on le traite"]],
    ["Il est très résistant.","É muito resistente."],
    ["un quartzite","um quartzito"],
    ["plus dur que le granit","mais duro do que o granito"],
    ["Ça ressemble au marbre.","Parece mármore."],
    ["D'où vient cette pierre ?","De onde vem esta pedra?"],
    ["Le marbre vient du Portugal.","O mármore vem de Portugal."],
    ["le calcaire","o calcário"],
    ["l'onyx","o ónix"]
  ],
  drills:[
    ["Aconselho-lhe um mármore para a casa de banho.","Je vous conseille un marbre pour la salle de bains."],
    ["O granito é muito resistente.","Le granit est très résistant."],
    ["Este calcário vem de França.","Ce calcaire vient de France."],
    ["O ónix é translúcido.","L'onyx est translucide."],
    ["De onde vem este quartzito?","D'où vient ce quartzite ?"]
  ],
  roles:[
    ["Qu'est-ce que vous nous conseillez pour la salle de bains ?","Aconselha um travertino, para um efeito acolhedor.","Pour un rendu chaleureux, je vous conseille un travertin."],
    ["Ce n'est pas trop poreux ?","Diz que é poroso, mas que é betumado e tratado.","Il est poreux, oui, mais on le rebouche et on le traite."],
    ["D'où vient cette pierre ?","Vem do Brasil.","Elle vient du Brésil."]
  ],
  notes:[
    "«Le quartzite» é masculino no francês correto, embora no comércio se oiça «la quartzite».",
    "«Granit» e «granite» escrevem-se das duas maneiras e dizem-se igual."
  ]
},
{ id:"l06", m:"m2", n:6, fr:"Les finitions", pt:"Os acabamentos",
  situation:"Escolhem-se os acabamentos para o pavimento, o exterior e a cozinha.",
  cue:"A",
  dialogue:[
    ["A","Quelle finition vous recommandez pour le sol ?","Que acabamento recomenda para o pavimento?"],
    ["N","Pour le sol, une finition adoucie ou brossée. Le poli est trop glissant.","Para o pavimento, um acabamento amaciado ou escovado. O polido é demasiado escorregadio."],
    ["A","Et pour la terrasse ?","E para o terraço?"],
    ["N","À l'extérieur, il faut une finition antidérapante : flammée ou bouchardée.","No exterior é preciso um acabamento antiderrapante: flamejado ou bujardado."],
    ["A","Pour le plan de travail, le client voudrait un aspect plus naturel.","Para o tampo, o cliente queria um aspeto mais natural."],
    ["N","Alors je vous propose une finition cuir. C'est mat, doux au toucher, et ça marque moins.","Então proponho-lhe um acabamento couro. É mate, suave ao toque e marca menos."],
    ["A","Vous pouvez nous montrer un échantillon ?","Pode mostrar-nos uma amostra?"],
    ["N","Bien sûr. J'ai les trois finitions avec moi.","Claro. Tenho os três acabamentos comigo."]
  ],
  items:[
    ["Quelle finition vous recommandez ?","Que acabamento recomenda?"],
    ["pour le sol","para o pavimento"],
    ["une finition adoucie","um acabamento amaciado"],
    ["brossée","escovado"],
    ["Le poli est trop glissant.","O polido é demasiado escorregadio.",["trop glissant","Le poli est trop glissant"]],
    ["à l'extérieur","no exterior"],
    ["une finition antidérapante","um acabamento antiderrapante"],
    ["flammée ou bouchardée","flamejado ou bujardado"],
    ["une finition cuir","um acabamento couro"],
    ["mat et doux au toucher","mate e suave ao toque"],
    ["Ça marque moins.","Marca menos."],
    ["Vous pouvez nous montrer un échantillon ?","Pode mostrar-nos uma amostra?",["un échantillon","nous montrer un échantillon","Vous pouvez nous montrer un échantillon ?"]]
  ],
  drills:[
    ["Para o exterior, aconselho um acabamento flamejado.","Pour l'extérieur, je vous conseille une finition flammée."],
    ["O polido marca mais.","Le poli marque plus."],
    ["Um acabamento jateado é antiderrapante.","Une finition sablée est antidérapante."],
    ["Tenho as amostras comigo.","J'ai les échantillons avec moi."],
    ["Este acabamento é mate e suave ao toque.","Cette finition est mate et douce au toucher."]
  ],
  roles:[
    ["Quelle finition vous recommandez pour le sol ?","Amaciado ou escovado; o polido é demasiado escorregadio.","Une finition adoucie ou brossée. Le poli est trop glissant."],
    ["Et pour la terrasse ?","No exterior é preciso antiderrapante: flamejado ou bujardado.","À l'extérieur, il faut une finition antidérapante : flammée ou bouchardée."],
    ["Le client voudrait un aspect plus naturel.","Propõe um acabamento couro.","Alors je vous propose une finition cuir."]
  ],
  notes:[
    "Amaciado é «adouci», polido «poli», jateado «sablé», envelhecido «vieilli». O couro diz-se «cuir» ou mesmo «leather».",
    "«Finition» é feminino: «une finition mate, douce, brossée»."
  ]
},
{ id:"l07", m:"m2", n:7, fr:"Les pièces", pt:"As peças",
  situation:"Revês os desenhos peça a peça: tampos, cubas, arestas e bases de duche.",
  cue:"A",
  dialogue:[
    ["A","Sur ce plan, vous avez le plan de travail, la crédence et l'îlot.","Neste desenho tem o tampo, o frontão e a ilha."],
    ["N","L'évier sera sous le plan ?","O lava-loiça fica por baixo do tampo?"],
    ["A","Oui, sous le plan. Et la plaque de cuisson est encastrée.","Sim, por baixo do tampo. E a placa é encastrada."],
    ["N","D'accord. Nous ferons les découpes en atelier. Vous préférez un chanfrein ou un chant arrondi ?","Está bem. Faremos os recortes na fábrica. Prefere um chanfro ou uma aresta boleada?"],
    ["A","Un petit chanfrein. Pour la salle de bains, nous voulons un plan vasque avec deux vasques taillées dans la masse.","Um chanfro pequeno. Para a casa de banho, queremos um tampo de lavatório com duas cubas esculpidas no maciço."],
    ["N","Avec un receveur de douche assorti ?","Com uma base de duche a condizer?"],
    ["A","Oui, dans le même marbre.","Sim, no mesmo mármore."]
  ],
  items:[
    ["le plan de travail","o tampo da cozinha"],
    ["la crédence","o frontão"],
    ["L'évier sera sous le plan ?","O lava-loiça fica por baixo do tampo?",["sous le plan","L'évier sera sous le plan ?"]],
    ["la plaque de cuisson","a placa do fogão"],
    ["encastrée","encastrada"],
    ["Nous ferons les découpes en atelier.","Faremos os recortes na fábrica.",["en atelier","les découpes en atelier","Nous ferons les découpes en atelier"]],
    ["un chanfrein","um chanfro"],
    ["un chant arrondi","uma aresta boleada"],
    ["un plan vasque","um tampo de lavatório"],
    ["deux vasques taillées dans la masse","duas cubas esculpidas no maciço",["dans la masse","taillées dans la masse","deux vasques taillées dans la masse"]],
    ["un receveur de douche assorti","uma base de duche a condizer"],
    ["dans le même marbre","no mesmo mármore"]
  ],
  drills:[
    ["O lava-loiça fica por baixo do tampo.","L'évier est sous le plan."],
    ["Fazemos os recortes na fábrica.","Nous faisons les découpes en atelier."],
    ["Prefere um chanfro ou uma aresta boleada?","Vous préférez un chanfrein ou un chant arrondi ?"],
    ["Uma banheira esculpida no maciço.","Une baignoire taillée dans la masse."],
    ["Um frontão no mesmo mármore.","Une crédence dans le même marbre."]
  ],
  roles:[
    ["Vous avez vu le plan de travail ?","Diz que sim e pergunta se o lava-loiça fica por baixo do tampo.","Oui. L'évier sera sous le plan ?"],
    ["Quel type de chant vous proposez ?","Pergunta se prefere um chanfro ou uma aresta boleada.","Vous préférez un chanfrein ou un chant arrondi ?"],
    ["Pour la salle de bains, un plan vasque.","Pergunta se querem uma base de duche a condizer.","Avec un receveur de douche assorti ?"]
  ],
  notes:[
    "«Plan» tem dois sentidos: o desenho («les plans») e o tampo («le plan de travail», «le plan vasque»).",
    "«Taillé dans la masse» é o argumento de luxo: uma peça esculpida num só bloco, sem colagens."
  ]
},
{ id:"l08", m:"m2", n:8, fr:"Choisir les tranches", pt:"Escolher as chapas",
  situation:"No armazém, mostras o bloco e as chapas escolhidas para o projeto.",
  cue:"A",
  dialogue:[
    ["N","Voici le bloc que nous avons sélectionné pour votre projet.","Este é o bloco que selecionámos para o seu projeto."],
    ["A","Les tranches sont magnifiques. On peut faire un livre ouvert ?","As chapas são magníficas. Dá para fazer um livro aberto?"],
    ["N","Oui, les tranches sont numérotées et consécutives. Le veinage sera continu.","Sim, as chapas estão numeradas e são consecutivas. O desenho dos veios será contínuo."],
    ["A","Il y a des différences de couleur entre les tranches ?","Há diferenças de cor entre as chapas?"],
    ["N","Légèrement. C'est une pierre naturelle : chaque tranche est unique.","Ligeiramente. É uma pedra natural: cada chapa é única."],
    ["A","Je voudrais valider le calepinage avant la découpe.","Queria aprovar a calepinagem antes do corte."],
    ["N","Bien sûr. Nous vous enverrons une simulation avec les vraies tranches.","Claro. Vamos enviar-lhe uma simulação com as chapas reais."]
  ],
  items:[
    ["le bloc que nous avons sélectionné","o bloco que selecionámos"],
    ["les tranches","as chapas"],
    ["un livre ouvert","um livro aberto (book-match)"],
    ["numérotées et consécutives","numeradas e consecutivas"],
    ["Le veinage sera continu.","O desenho dos veios será contínuo.",["sera continu","Le veinage sera continu"]],
    ["des différences de couleur","diferenças de cor"],
    ["légèrement","ligeiramente"],
    ["Chaque tranche est unique.","Cada chapa é única."],
    ["valider le calepinage","aprovar a calepinagem"],
    ["avant la découpe","antes do corte"],
    ["une simulation avec les vraies tranches","uma simulação com as chapas reais",["les vraies tranches","avec les vraies tranches","une simulation avec les vraies tranches"]],
    ["Nous vous enverrons…","Vamos enviar-lhe…"]
  ],
  drills:[
    ["As chapas são consecutivas.","Les tranches sont consécutives."],
    ["O veio é contínuo no tampo e no avental.","Le veinage est continu sur le plan et la retombée."],
    ["Cada bloco é único.","Chaque bloc est unique."],
    ["Podemos fazer um livro aberto na parede.","On peut faire un livre ouvert sur le mur."],
    ["Enviamos-lhe a simulação amanhã.","Nous vous envoyons la simulation demain."]
  ],
  roles:[
    ["On peut faire un livre ouvert ?","Sim: as chapas estão numeradas e são consecutivas.","Oui, les tranches sont numérotées et consécutives."],
    ["Il y a des différences de couleur ?","Ligeiramente; é pedra natural, cada chapa é única.","Légèrement. C'est une pierre naturelle : chaque tranche est unique."],
    ["Je voudrais valider le calepinage.","Diz que vais enviar uma simulação com as chapas reais.","Bien sûr. Nous vous enverrons une simulation avec les vraies tranches."]
  ],
  notes:[
    "«Tranche» é a chapa serrada do bloco. «Dalle» é uma laje ou um ladrilho de pavimento.",
    "O «calepinage» é o plano de corte e distribuição das peças nas chapas: o teu nesting."
  ]
},
/* ---------------- Module 3 · Le devis ---------------- */
{ id:"l09", m:"m3", n:9, fr:"Présenter le devis", pt:"Apresentar o orçamento",
  situation:"Explicas o que está incluído no orçamento que enviaste esta manhã.",
  cue:"A",
  dialogue:[
    ["N","Je vous ai envoyé le devis ce matin. Vous avez eu le temps de le regarder ?","Enviei-lhe o orçamento esta manhã. Teve tempo de o ver?"],
    ["A","Oui, rapidement. Qu'est-ce qui est compris dans le prix ?","Sim, por alto. O que está incluído no preço?"],
    ["N","Le prix comprend la fourniture, la fabrication, le transport et la pose.","O preço inclui o fornecimento, a transformação, o transporte e a montagem."],
    ["A","Et les découpes pour l'évier et la plaque ?","E os recortes do lava-loiça e da placa?"],
    ["N","Elles sont comprises. Le traitement hydrofuge aussi.","Estão incluídos. O tratamento hidrófugo também."],
    ["A","Le transport jusqu'en Suisse, c'est inclus ?","O transporte até à Suíça está incluído?"],
    ["N","Oui : livraison sur chantier, dédouanement compris.","Sim: entrega em obra, com desalfandegamento incluído."]
  ],
  items:[
    ["le devis","o orçamento"],
    ["Je vous ai envoyé le devis ce matin.","Enviei-lhe o orçamento esta manhã.",["ce matin","le devis ce matin","Je vous ai envoyé le devis ce matin"]],
    ["Vous avez eu le temps de le regarder ?","Teve tempo de o ver?",["de le regarder","le temps de le regarder","Vous avez eu le temps de le regarder ?"]],
    ["Qu'est-ce qui est compris dans le prix ?","O que está incluído no preço?",["dans le prix","compris dans le prix","Qu'est-ce qui est compris dans le prix ?"]],
    ["la fourniture","o fornecimento do material"],
    ["la fabrication","a transformação"],
    ["le transport et la pose","o transporte e a montagem"],
    ["Elles sont comprises.","Estão incluídas."],
    ["le traitement hydrofuge","o tratamento hidrófugo"],
    ["C'est inclus ?","Está incluído?"],
    ["livraison sur chantier","entrega em obra"],
    ["dédouanement compris","desalfandegamento incluído"]
  ],
  drills:[
    ["O preço inclui a montagem.","Le prix comprend la pose."],
    ["O transporte não está incluído.","Le transport n'est pas inclus."],
    ["Enviei-lhe o orçamento ontem.","Je vous ai envoyé le devis hier."],
    ["Os recortes estão incluídos.","Les découpes sont comprises."],
    ["Entrega em obra em Genebra.","Livraison sur chantier à Genève."]
  ],
  roles:[
    ["Qu'est-ce qui est compris dans le prix ?","Fornecimento, transformação, transporte e montagem.","Le prix comprend la fourniture, la fabrication, le transport et la pose."],
    ["Et les découpes pour l'évier ?","Estão incluídas, e o tratamento hidrófugo também.","Elles sont comprises. Le traitement hydrofuge aussi."],
    ["Le transport jusqu'en Suisse, c'est inclus ?","Sim: entrega em obra, com desalfandegamento incluído.","Oui : livraison sur chantier, dédouanement compris."]
  ],
  notes:[
    "«Compris» e «inclus» querem ambos dizer incluído. «Fourniture» é o fornecimento do material.",
    "«Découpes» é feminino, por isso: «elles sont comprises»."
  ]
},
{ id:"l10", m:"m3", n:10, fr:"Défendre son prix", pt:"Defender o preço",
  situation:"O teu orçamento é mais alto do que o da concorrência. Defendes o valor.",
  cue:"A",
  dialogue:[
    ["A","Votre devis est plus élevé que celui de vos concurrents.","O seu orçamento é mais alto do que o dos seus concorrentes."],
    ["N","Je comprends. Est-ce que les devis portent sur le même matériau ?","Compreendo. Os orçamentos são para o mesmo material?"],
    ["A","Pas exactement. L'autre propose un marbre espagnol.","Não exatamente. O outro propõe um mármore espanhol."],
    ["N","C'est là toute la différence. Notre marbre est de premier choix, sans réparations.","É aí que está toda a diferença. O nosso mármore é de primeira escolha, sem reparações."],
    ["A","Vous pouvez faire un effort sur le prix ?","Pode fazer um esforço no preço?"],
    ["N","Je peux vous proposer une remise de cinq pour cent, si la commande est confirmée cette semaine.","Posso propor-lhe um desconto de cinco por cento, se a encomenda for confirmada esta semana."],
    ["A","Je vais en parler au client.","Vou falar disso com o cliente."],
    ["N","Très bien. Je reste à votre disposition.","Muito bem. Fico ao seu dispor."]
  ],
  items:[
    ["plus élevé que celui de vos concurrents","mais alto do que o dos seus concorrentes",["vos concurrents","celui de vos concurrents","plus élevé que celui de vos concurrents"]],
    ["Est-ce que les devis portent sur le même matériau ?","Os orçamentos são para o mesmo material?",["le même matériau","portent sur le même matériau","Est-ce que les devis portent sur le même matériau ?"]],
    ["Pas exactement.","Não exatamente."],
    ["C'est là toute la différence.","É aí que está toda a diferença."],
    ["de premier choix","de primeira escolha"],
    ["sans réparations","sem reparações"],
    ["faire un effort sur le prix","fazer um esforço no preço"],
    ["une remise de cinq pour cent","um desconto de cinco por cento"],
    ["si la commande est confirmée","se a encomenda for confirmada"],
    ["cette semaine","esta semana"],
    ["Je vais en parler au client.","Vou falar disso com o cliente."],
    ["Je reste à votre disposition.","Fico ao seu dispor."]
  ],
  drills:[
    ["Compreendo, mas não é o mesmo material.","Je comprends, mais ce n'est pas le même matériau."],
    ["Posso propor-lhe um desconto de três por cento.","Je peux vous proposer une remise de trois pour cent."],
    ["Se a encomenda for confirmada hoje.","Si la commande est confirmée aujourd'hui."],
    ["É um mármore de primeira escolha.","C'est un marbre de premier choix."],
    ["Vou falar disso com a nossa direção.","Je vais en parler à notre direction."]
  ],
  roles:[
    ["Votre devis est plus élevé que celui de vos concurrents.","Diz que compreendes e pergunta se os orçamentos são para o mesmo material.","Je comprends. Est-ce que les devis portent sur le même matériau ?"],
    ["Vous pouvez faire un effort sur le prix ?","Propõe cinco por cento de desconto se a encomenda for confirmada esta semana.","Je peux vous proposer une remise de cinq pour cent, si la commande est confirmée cette semaine."],
    ["Je vais en parler au client.","Diz que ficas ao dispor.","Très bien. Je reste à votre disposition."]
  ],
  notes:[
    "Nunca chames «cher» ao teu próprio preço. Fala de valor: «premier choix», «sans réparations», «sélectionné pour vous».",
    "«Remise» é o desconto comercial. «Rabais» usa-se mais quando há um defeito."
  ]
},
{ id:"l11", m:"m3", n:11, fr:"Les conditions", pt:"As condições",
  situation:"Combinas o sinal, a validade, o IVA e o prazo de produção.",
  cue:"A",
  dialogue:[
    ["A","Quelles sont vos conditions de paiement ?","Quais são as vossas condições de pagamento?"],
    ["N","Trente pour cent d'acompte à la commande, et le solde à la livraison.","Trinta por cento de sinal com a encomenda e o restante na entrega."],
    ["A","Le devis est valable combien de temps ?","O orçamento é válido quanto tempo?"],
    ["N","Il est valable trente jours. Les prix sont hors taxes.","É válido trinta dias. Os preços são sem IVA."],
    ["A","Et le délai de fabrication ?","E o prazo de produção?"],
    ["N","Six semaines après la validation des plans.","Seis semanas depois da aprovação dos desenhos."],
    ["A","C'est un peu long. Vous ne pouvez pas faire plus vite ?","É um pouco demorado. Não consegue fazer mais depressa?"],
    ["N","Si ! Avec une validation des plans lundi, nous pouvons livrer en cinq semaines.","Consigo! Com os desenhos aprovados na segunda, podemos entregar em cinco semanas."]
  ],
  items:[
    ["les conditions de paiement","as condições de pagamento"],
    ["trente pour cent d'acompte","trinta por cento de sinal",["d'acompte","trente pour cent d'acompte"]],
    ["à la commande","com a encomenda"],
    ["le solde à la livraison","o restante na entrega"],
    ["Le devis est valable trente jours.","O orçamento é válido trinta dias.",["trente jours","valable trente jours","Le devis est valable trente jours"]],
    ["hors taxes","sem IVA"],
    ["toutes taxes comprises","com IVA incluído"],
    ["le délai de fabrication","o prazo de produção"],
    ["après la validation des plans","depois da aprovação dos desenhos"],
    ["C'est un peu long.","É um pouco demorado."],
    ["Si !","Sim! (a uma pergunta na negativa)"],
    ["Nous pouvons livrer en cinq semaines.","Podemos entregar em cinco semanas."]
  ],
  drills:[
    ["Quarenta por cento de sinal com a encomenda.","Quarante pour cent d'acompte à la commande."],
    ["O orçamento é válido quinze dias.","Le devis est valable quinze jours."],
    ["Os preços são com IVA incluído.","Les prix sont toutes taxes comprises."],
    ["O prazo de produção é de quatro semanas.","Le délai de fabrication est de quatre semaines."],
    ["Sim, posso! (a quem perguntou «vous ne pouvez pas ?»)","Si, je peux !"]
  ],
  roles:[
    ["Quelles sont vos conditions de paiement ?","Trinta por cento de sinal com a encomenda e o restante na entrega.","Trente pour cent d'acompte à la commande, et le solde à la livraison."],
    ["Le devis est valable combien de temps ?","Trinta dias, com preços sem IVA.","Il est valable trente jours. Les prix sont hors taxes."],
    ["Vous ne pouvez pas faire plus vite ?","Sim! Com os desenhos aprovados na segunda, entregam em cinco semanas.","Si ! Avec une validation des plans lundi, nous pouvons livrer en cinq semaines."]
  ],
  notes:[
    "«HT» quer dizer «hors taxes», sem IVA; «TTC» quer dizer «toutes taxes comprises», com IVA. Em França, a «TVA» normal é de 20%; na Suíça, de 8,1%.",
    "«Si» é o “sim” que responde a uma pergunta na negativa: «Vous ne pouvez pas ?» «Si !»"
  ]
},
{ id:"l12", m:"m3", n:12, fr:"Conclure", pt:"Fechar o negócio",
  situation:"O cliente aprova. Fechas o negócio e marcas os próximos passos.",
  cue:"A",
  dialogue:[
    ["A","Le client a validé votre proposition.","O cliente aprovou a sua proposta."],
    ["N","Excellente nouvelle ! Merci pour votre confiance.","Excelente notícia! Obrigado pela sua confiança."],
    ["A","Qu'est-ce qu'il vous faut pour lancer la commande ?","De que precisa para lançar a encomenda?"],
    ["N","Le devis signé avec la mention « bon pour accord », et l'acompte.","O orçamento assinado com a menção «bon pour accord», e o sinal."],
    ["A","Je vous envoie tout ça demain.","Envio-lhe tudo amanhã."],
    ["N","Parfait. Dès réception, je vous confirme la date de la prise de cotes.","Perfeito. Assim que receber, confirmo-lhe a data do levantamento de medidas."],
    ["A","Très bien.","Muito bem."],
    ["N","Je vous envoie un récapitulatif par e-mail. Encore merci, et à très bientôt.","Envio-lhe um resumo por email. Mais uma vez obrigado, e até muito breve."]
  ],
  items:[
    ["Le client a validé votre proposition.","O cliente aprovou a sua proposta.",["votre proposition","a validé votre proposition","Le client a validé votre proposition"]],
    ["Excellente nouvelle !","Excelente notícia!"],
    ["Merci pour votre confiance.","Obrigado pela sua confiança."],
    ["Qu'est-ce qu'il vous faut ?","De que precisa?"],
    ["lancer la commande","lançar a encomenda"],
    ["le devis signé","o orçamento assinado"],
    ["la mention « bon pour accord »","a menção «bon pour accord» (aceite)"],
    ["Dès réception…","Assim que receber…"],
    ["Je vous confirme la date.","Confirmo-lhe a data."],
    ["la prise de cotes","o levantamento de medidas"],
    ["un récapitulatif par e-mail","um resumo por email"],
    ["Encore merci, et à très bientôt.","Mais uma vez obrigado, e até muito breve."]
  ],
  drills:[
    ["Assim que receber o sinal, lanço a encomenda.","Dès réception de l'acompte, je lance la commande."],
    ["Envio-lhe um resumo amanhã.","Je vous envoie un récapitulatif demain."],
    ["O cliente aprovou o orçamento.","Le client a validé le devis."],
    ["Confirmo-lhe a data da entrega.","Je vous confirme la date de livraison."],
    ["Lanço a encomenda hoje.","Je lance la commande aujourd'hui."]
  ],
  roles:[
    ["Le client a validé votre proposition.","Excelente notícia! Agradece a confiança.","Excellente nouvelle ! Merci pour votre confiance."],
    ["Qu'est-ce qu'il vous faut pour lancer la commande ?","O orçamento assinado com «bon pour accord», e o sinal.","Le devis signé avec la mention « bon pour accord », et l'acompte."],
    ["Je vous envoie tout ça demain.","Perfeito; assim que receberes, confirmas a data do levantamento de medidas.","Parfait. Dès réception, je vous confirme la date de la prise de cotes."]
  ],
  notes:[
    "Em França, o cliente escreve à mão «bon pour accord» por cima da assinatura do orçamento. É o “aceito” deles.",
    "Fecha sempre com o passo seguinte e uma data. «Dès réception…» é a fórmula certa."
  ]
},
/* ---------------- Module 4 · Le chantier ---------------- */
{ id:"l13", m:"m4", n:13, fr:"La prise de cotes", pt:"O levantamento de medidas",
  situation:"Em obra, fazes o levantamento de medidas com o encarregado.",
  cue:"C",
  dialogue:[
    ["N","Bonjour ! Je viens pour la prise de cotes.","Bom dia! Venho fazer o levantamento de medidas."],
    ["C","Bonjour. Les meubles de cuisine sont posés, vous pouvez y aller.","Bom dia. Os móveis da cozinha estão montados, pode avançar."],
    ["N","Merci. Les murs ne sont pas tout à fait d'équerre. Je vais faire un gabarit.","Obrigado. As paredes não estão bem em esquadria. Vou fazer um molde."],
    ["C","Vous aurez besoin de combien de temps ?","Vai precisar de quanto tempo?"],
    ["N","Environ deux heures. Ensuite, je vous envoie les plans d'exécution pour validation.","Cerca de duas horas. Depois, envio-lhe os desenhos de execução para aprovação."],
    ["C","Il faudra aussi la validation de l'architecte.","Também vai ser precisa a aprovação do arquiteto."],
    ["N","Bien sûr. Nous ne lançons rien en production sans plans signés.","Claro. Não lançamos nada em produção sem desenhos assinados."]
  ],
  items:[
    ["Je viens pour la prise de cotes.","Venho fazer o levantamento de medidas.",["la prise de cotes","pour la prise de cotes","Je viens pour la prise de cotes"]],
    ["les meubles de cuisine","os móveis da cozinha"],
    ["Vous pouvez y aller.","Pode avançar."],
    ["les murs","as paredes"],
    ["pas tout à fait d'équerre","não estão bem em esquadria",["d'équerre","tout à fait d'équerre","pas tout à fait d'équerre"]],
    ["Je vais faire un gabarit.","Vou fazer um molde."],
    ["Vous aurez besoin de combien de temps ?","Vai precisar de quanto tempo?",["combien de temps","besoin de combien de temps","Vous aurez besoin de combien de temps ?"]],
    ["environ deux heures","cerca de duas horas"],
    ["les plans d'exécution","os desenhos de execução"],
    ["pour validation","para aprovação"],
    ["la validation de l'architecte","a aprovação do arquiteto"],
    ["Nous ne lançons rien en production sans plans signés.","Não lançamos nada em produção sem desenhos assinados.",["sans plans signés","rien en production sans plans signés","Nous ne lançons rien en production sans plans signés"]]
  ],
  drills:[
    ["As paredes não estão em esquadria.","Les murs ne sont pas d'équerre."],
    ["Vou fazer um molde do tampo.","Je vais faire un gabarit du plan de travail."],
    ["Envio-lhe os desenhos para aprovação.","Je vous envoie les plans pour validation."],
    ["Preciso de cerca de uma hora.","J'ai besoin d'environ une heure."],
    ["Os móveis ainda não estão montados.","Les meubles ne sont pas encore posés."]
  ],
  roles:[
    ["Bonjour, vous êtes ?","Diz que vens fazer o levantamento de medidas.","Bonjour ! Je viens pour la prise de cotes."],
    ["Vous aurez besoin de combien de temps ?","Cerca de duas horas.","Environ deux heures."],
    ["On peut lancer la production ?","Diz que não lançam nada em produção sem desenhos assinados.","Nous ne lançons rien en production sans plans signés."]
  ],
  notes:[
    "Em obra falas com o «chef de chantier» ou com o «conducteur de travaux». Trata-o por «vous» até ele passar ao «tu».",
    "«D'équerre» é em esquadria, a 90 graus. Fora de esquadria diz-se «hors d'équerre»."
  ]
},
{ id:"l14", m:"m4", n:14, fr:"Fabrication et transport", pt:"Produção e transporte",
  situation:"Dás o ponto de situação da produção, da embalagem e do camião.",
  cue:"A",
  dialogue:[
    ["A","Où en est la fabrication ?","Em que ponto está a produção?"],
    ["N","Les pièces sont terminées. Nous les emballons cette semaine.","As peças estão prontas. Embalamo-las esta semana."],
    ["A","Comment seront-elles emballées ?","Como vão ser embaladas?"],
    ["N","En caisses en bois, sur palettes, avec des protections sur les chants.","Em caixas de madeira, em paletes, com proteções nas arestas."],
    ["A","Et la livraison ?","E a entrega?"],
    ["N","Le camion part lundi. Il arrivera à Lyon jeudi matin.","O camião parte na segunda. Chega a Lyon na quinta de manhã."],
    ["A","Il faudra un chariot élévateur pour décharger ?","Vai ser preciso um empilhador para descarregar?"],
    ["N","Oui, les caisses pèsent environ six cents kilos. Pouvez-vous en prévoir un sur place ?","Sim, as caixas pesam cerca de seiscentos quilos. Pode prever um no local?"]
  ],
  items:[
    ["Où en est la fabrication ?","Em que ponto está a produção?"],
    ["Les pièces sont terminées.","As peças estão prontas."],
    ["Nous les emballons cette semaine.","Embalamo-las esta semana."],
    ["en caisses en bois","em caixas de madeira"],
    ["sur palettes","em paletes"],
    ["des protections sur les chants","proteções nas arestas"],
    ["Le camion part lundi.","O camião parte na segunda."],
    ["Il arrivera jeudi matin.","Chega na quinta de manhã."],
    ["un chariot élévateur","um empilhador"],
    ["pour décharger","para descarregar"],
    ["Les caisses pèsent six cents kilos.","As caixas pesam seiscentos quilos.",["six cents kilos","pèsent six cents kilos","Les caisses pèsent six cents kilos"]],
    ["Pouvez-vous en prévoir un sur place ?","Pode prever um no local?",["sur place","en prévoir un sur place","Pouvez-vous en prévoir un sur place ?"]]
  ],
  drills:[
    ["As peças estão embaladas.","Les pièces sont emballées."],
    ["O camião chega na sexta à tarde.","Le camion arrive vendredi après-midi."],
    ["Precisamos de um empilhador no local.","Nous avons besoin d'un chariot élévateur sur place."],
    ["A caixa pesa oitocentos quilos.","La caisse pèse huit cents kilos."],
    ["Em que ponto está a entrega?","Où en est la livraison ?"]
  ],
  roles:[
    ["Où en est la fabrication ?","As peças estão prontas; embalam esta semana.","Les pièces sont terminées. Nous les emballons cette semaine."],
    ["Comment seront-elles emballées ?","Em caixas de madeira, em paletes, com proteção nas arestas.","En caisses en bois, sur palettes, avec des protections sur les chants."],
    ["Il faudra un chariot élévateur ?","Sim, as caixas pesam cerca de seiscentos quilos; pede que prevejam um no local.","Oui, les caisses pèsent environ six cents kilos. Pouvez-vous en prévoir un sur place ?"]
  ],
  notes:[
    "«Où en est… ?» é a pergunta de ponto de situação mais usada em obra.",
    "Para a Suíça, acrescenta: «Les documents de douane sont prêts.» Os documentos de alfândega estão prontos."
  ]
},
{ id:"l15", m:"m4", n:15, fr:"La pose", pt:"A montagem",
  situation:"Dia de montagem: acessos, proteções, prazos e silicone.",
  cue:"C",
  dialogue:[
    ["C","Bonjour ! Vous commencez la pose aujourd'hui ?","Bom dia! Começam a montagem hoje?"],
    ["N","Oui. L'équipe arrive à huit heures. Il y a un monte-charge ?","Sim. A equipa chega às oito. Há monta-cargas?"],
    ["C","Oui, au fond de la cour. Mais il faut protéger les sols.","Sim, ao fundo do pátio. Mas é preciso proteger os pavimentos."],
    ["N","Bien sûr, nous posons des protections partout.","Claro, pomos proteções em todo o lado."],
    ["C","Combien de temps pour la cuisine ?","Quanto tempo para a cozinha?"],
    ["N","Deux jours. Le premier jour, le plan de travail ; le deuxième, la crédence et les joints.","Dois dias. No primeiro, o tampo; no segundo, o frontão e as juntas."],
    ["C","Et pour le silicone, il faut attendre combien de temps ?","E o silicone, quanto tempo é preciso esperar?"],
    ["N","Vingt-quatre heures avant d'utiliser l'évier.","Vinte e quatro horas antes de usar o lava-loiça."]
  ],
  items:[
    ["Vous commencez la pose aujourd'hui ?","Começam a montagem hoje?"],
    ["L'équipe arrive à huit heures.","A equipa chega às oito."],
    ["Il y a un monte-charge ?","Há monta-cargas?"],
    ["au fond de la cour","ao fundo do pátio"],
    ["Il faut protéger les sols.","É preciso proteger os pavimentos."],
    ["Nous posons des protections partout.","Pomos proteções em todo o lado.",["partout","des protections partout","Nous posons des protections partout"]],
    ["Combien de temps pour la cuisine ?","Quanto tempo para a cozinha?"],
    ["le premier jour","no primeiro dia"],
    ["le deuxième","no segundo"],
    ["les joints","as juntas"],
    ["Il faut attendre vingt-quatre heures.","É preciso esperar vinte e quatro horas."],
    ["avant d'utiliser l'évier","antes de usar o lava-loiça"]
  ],
  drills:[
    ["A equipa chega às sete e meia.","L'équipe arrive à sept heures et demie."],
    ["É preciso proteger a escada.","Il faut protéger l'escalier."],
    ["No segundo dia fazemos as juntas.","Le deuxième jour, nous faisons les joints."],
    ["Onde podemos estacionar o camião?","Où pouvons-nous garer le camion ?"],
    ["É preciso esperar doze horas.","Il faut attendre douze heures."]
  ],
  roles:[
    ["Vous commencez la pose aujourd'hui ?","Sim, a equipa chega às oito; pergunta se há monta-cargas.","Oui. L'équipe arrive à huit heures. Il y a un monte-charge ?"],
    ["Il faut protéger les sols.","Claro: põem proteções em todo o lado.","Bien sûr, nous posons des protections partout."],
    ["Combien de temps pour la cuisine ?","Dois dias: o tampo no primeiro, o frontão e as juntas no segundo.","Deux jours. Le premier jour, le plan de travail ; le deuxième, la crédence et les joints."]
  ],
  notes:[
    "«Poser» é instalar ou assentar; «la pose» é a montagem; «le poseur» é o montador.",
    "«Il faut…», é preciso, é a forma mais útil em obra: «il faut protéger», «il faut attendre», «il faut décharger»."
  ]
},
{ id:"l16", m:"m4", n:16, fr:"Gérer un problème", pt:"Resolver um problema",
  situation:"Uma reclamação e um atraso. Respondes com calma e com soluções.",
  cue:"A",
  dialogue:[
    ["A","Monsieur, le client a remarqué une fissure sur le plan vasque.","O cliente reparou numa fissura no tampo do lavatório."],
    ["N","Je suis désolé. Pouvez-vous m'envoyer une photo ?","Lamento. Pode enviar-me uma fotografia?"],
    ["A","Je vous l'envoie tout de suite. Et le chantier a aussi pris du retard, à cause de la livraison.","Envio-lha já. E a obra também se atrasou, por causa da entrega."],
    ["N","Je comprends votre inquiétude. Je regarde la photo et je vous rappelle dans une heure.","Compreendo a sua preocupação. Vejo a fotografia e volto a ligar-lhe daqui a uma hora."],
    ["N","J'ai vu la photo : c'est une veine naturelle, pas une fissure. Mais si le client n'est pas satisfait, nous remplaçons la pièce.","Vi a fotografia: é um veio natural, não uma fissura. Mas se o cliente não ficar satisfeito, substituímos a peça."],
    ["A","Merci pour votre réactivité.","Obrigada pela rapidez."],
    ["N","C'est normal. Quant au retard, nous mettons une deuxième équipe pour le rattraper.","É o nosso dever. Quanto ao atraso, pomos uma segunda equipa para o recuperar."]
  ],
  items:[
    ["Le client a remarqué une fissure.","O cliente reparou numa fissura.",["une fissure","a remarqué une fissure","Le client a remarqué une fissure"]],
    ["Je suis désolé.","Lamento."],
    ["Pouvez-vous m'envoyer une photo ?","Pode enviar-me uma fotografia?"],
    ["tout de suite","já, imediatamente"],
    ["Le chantier a pris du retard.","A obra atrasou-se.",["du retard","a pris du retard","Le chantier a pris du retard"]],
    ["à cause de la livraison","por causa da entrega"],
    ["Je comprends votre inquiétude.","Compreendo a sua preocupação."],
    ["Je vous rappelle dans une heure.","Volto a ligar-lhe daqui a uma hora.",["dans une heure","Je vous rappelle dans une heure"]],
    ["une veine naturelle, pas une fissure","um veio natural, não uma fissura"],
    ["si le client n'est pas satisfait","se o cliente não ficar satisfeito"],
    ["Nous remplaçons la pièce.","Substituímos a peça."],
    ["Merci pour votre réactivité.","Obrigado pela rapidez."],
    ["rattraper le retard","recuperar o atraso"]
  ],
  drills:[
    ["Lamento o atraso.","Je suis désolé pour le retard."],
    ["Volto a ligar-lhe daqui a dez minutos.","Je vous rappelle dans dix minutes."],
    ["É um veio natural, não é um defeito.","C'est une veine naturelle, ce n'est pas un défaut."],
    ["Substituímos a peça esta semana.","Nous remplaçons la pièce cette semaine."],
    ["Pomos uma segunda equipa para recuperar o atraso.","Nous mettons une deuxième équipe pour rattraper le retard."]
  ],
  roles:[
    ["Le client a remarqué une fissure sur le plan vasque.","Lamenta e pede uma fotografia.","Je suis désolé. Pouvez-vous m'envoyer une photo ?"],
    ["Le chantier a pris du retard.","Diz que compreendes a preocupação e que voltas a ligar daqui a uma hora.","Je comprends votre inquiétude. Je vous rappelle dans une heure."],
    ["C'est une fissure ?","É um veio natural; mas se o cliente não ficar satisfeito, substituem a peça.","C'est une veine naturelle, pas une fissure. Mais si le client n'est pas satisfait, nous remplaçons la pièce."]
  ],
  notes:[
    "«Je suis désolé» abre qualquer resposta a uma reclamação, mesmo antes de saberes de quem é a culpa.",
    "Dá sempre um prazo concreto: «je vous rappelle dans une heure» acalma mais do que «je regarde»."
  ]
}
];

/* Technical glossary: [fr, pt, gender for elided articles] */
const GLOSSARY = [
  { cat:"Matériaux", pt:"Materiais", items:[
    ["le marbre","o mármore"],["le granit","o granito"],["le quartzite","o quartzito"],["le travertin","o travertino"],
    ["le calcaire","o calcário"],["l'onyx","o ónix","m"],["l'ardoise","a ardósia","f"],["la pierre naturelle","a pedra natural"],
    ["le grès cérame","o grés porcelânico"],["la carrière","a pedreira"],["le bloc","o bloco"],["la tranche","a chapa"],
    ["la dalle","a laje, o ladrilho"],["le carreau","o mosaico, o azulejo"]]},
  { cat:"Finitions", pt:"Acabamentos", items:[
    ["poli","polido"],["adouci","amaciado"],["brossé","escovado"],["flammé","flamejado"],["bouchardé","bujardado"],
    ["sablé","jateado"],["vieilli","envelhecido"],["cuir","couro (leather)"],["scié","serrado"],["éclaté","face partida"]]},
  { cat:"Pièces", pt:"Peças", items:[
    ["le plan de travail","o tampo da cozinha"],["la crédence","o frontão"],["l'îlot","a ilha","m"],["la retombée","o avental"],
    ["le plan vasque","o tampo de lavatório"],["la vasque","a cuba, o lavatório"],["l'évier","o lava-loiça","m"],
    ["le receveur de douche","a base de duche"],["la baignoire","a banheira"],["l'habillage mural","o revestimento de parede","m"],
    ["la marche","o cobertor do degrau"],["la contremarche","o espelho do degrau"],["le nez de marche","o focinho do degrau"],
    ["la plinthe","o rodapé"],["le seuil","a soleira"],["l'appui de fenêtre","o peitoril","m"],["la cheminée","a lareira"],
    ["la façade ventilée","a fachada ventilada"],["l'agrafe","o grampo de fixação","f"]]},
  { cat:"Façonnage", pt:"Transformação", items:[
    ["le chant","a aresta"],["le chanfrein","o chanfro"],["le chant arrondi","a aresta boleada"],["la coupe d'onglet","o corte em meia-esquadria"],
    ["la découpe","o recorte"],["le perçage","a furação"],["la rainure","o rasgo, a ranhura"],["les rainures d'égouttoir","o escorredor"],
    ["le collage","a colagem"],["le joint","a junta"],["le mastic","a massa de enchimento"],["la résine","a resina"],
    ["le rebouchage","o betumado"],["le traitement hydrofuge","o tratamento hidrófugo"],["le traitement oléofuge","o tratamento oleófugo"]]},
  { cat:"Défauts", pt:"Defeitos", items:[
    ["la fissure","a fissura"],["la veine","o veio"],["la tache","a mancha"],["l'éclat","a lasca, o esbeiçado","m"],
    ["la rayure","o risco"],["la porosité","a porosidade"],["le défaut","o defeito"]]},
  { cat:"Projet", pt:"Projeto", items:[
    ["le devis","o orçamento"],["l'acompte","o sinal","m"],["le solde","o restante do pagamento"],["la facture","a fatura"],
    ["le bon de commande","a nota de encomenda"],["le bon de livraison","a guia de entrega"],["la fiche technique","a ficha técnica"],
    ["le délai","o prazo"],["le retard","o atraso"],["la prise de cotes","o levantamento de medidas"],["le gabarit","o molde"],
    ["le plan d'exécution","o desenho de execução"],["le calepinage","a calepinagem"],["l'échantillon","a amostra","m"],
    ["le maître d'ouvrage","o dono de obra"],["le maître d'œuvre","o projetista, a fiscalização"],["le conducteur de travaux","o diretor de obra"],
    ["le chef de chantier","o encarregado"],["la réception des travaux","a receção da obra"],["les réserves","os pendentes da receção"],
    ["la garantie décennale","a garantia decenal"]]},
  { cat:"Logistique", pt:"Logística", items:[
    ["la caisse","a caixa de madeira"],["la palette","a palete"],["le camion","o camião"],["le transporteur","a transportadora"],
    ["le chariot élévateur","o empilhador"],["le monte-charge","o monta-cargas"],["la grue","a grua"],["le déchargement","a descarga"],
    ["la douane","a alfândega"],["le dédouanement","o desalfandegamento"]]}
];

const STONES = {
  carrara:   { name:"Carrara",   base:"#ECEDEB", vein:"#8E959A" },
  travertin: { name:"Travertin", base:"#D9C7A6", vein:"#A88C62" },
  quartzite: { name:"Quartzite", base:"#C9D1CC", vein:"#7F8F87" },
  granit:    { name:"Granit",    base:"#55595C", vein:"#A2A6A8" },
  nero:      { name:"Nero Marquina", base:"#1F2224", vein:"#E4E5E3" }
};

/* Bonus · Sans filtre: the polite phrase you mean, and how a grumpy French person would really say it. For laughs.
   item: [polite pt, rude fr, free translation pt, speaker]                                                       */
const BONUS = [
{ id:"b1", n:1, fr:"Au quotidien", pt:"No dia a dia", stone:"nero",
  intro:"Bónus: francês sem filtro. Eu digo-te uma frase bem-educada, tu tentas dizê-la em francês, e depois ouves como um francês mal-disposto a diria mesmo. É para rir, não para usar com clientes.",
  items:[
    ["Bom dia! Em que posso ajudar?","Qu'est-ce que tu veux ?","O que é que queres?","A"],
    ["Desculpe, não percebi.","Hein ? Articule !","Hã? Articula!","C"],
    ["Lamento, mas agora não consigo ajudar.","Débrouille-toi !","Desenrasca-te!","A"],
    ["Com licença, posso passar?","Pousse-toi !","Sai da frente!","C"],
    ["Não concordo consigo.","N'importe quoi !","Que disparate!","A"],
    ["Pode falar um pouco mais baixo?","Tu peux la fermer deux minutes ?","Consegues calar-te dois minutos?","C"],
    ["Que bom voltar a vê-lo!","Encore toi ?","Outra vez tu?","A"],
    ["Não tenho a certeza.","Aucune idée, et je m'en fiche.","Não faço ideia, e quero lá saber.","C"],
    ["Peço desculpa pelo atraso.","Oui, je suis en retard. Et alors ?","Sim, estou atrasado. E depois?","N"],
    ["Podemos falar disso mais tarde?","Lâche-moi les baskets !","Larga-me os ténis! Ou seja: deixa-me em paz.","A"],
    ["Acho que se enganou.","T'es complètement à côté de la plaque !","Estás completamente ao lado!","C"],
    ["Importa-se de me deixar sozinho?","Casse-toi !","Põe-te a andar!","A"]
  ]
},
{ id:"b2", n:2, fr:"Sur le chantier", pt:"Em obra", stone:"nero",
  intro:"Ronda dois: em obra. Eu digo-te a versão profissional, tu tentas em francês, e depois ouves o que te apetecia mesmo dizer a clientes, arquitetos e transportadores.",
  items:[
    ["Infelizmente, não conseguimos baixar mais o preço.","Et puis quoi encore ?","E que mais?! Era o que faltava.","C"],
    ["Pagamento a noventa dias? Lamento, não é possível.","Même pas en rêve.","Nem em sonhos.","C"],
    ["Lamento, a entrega vai atrasar uma semana.","C'est pas ma faute, c'est le transporteur.","Não é culpa minha, é da transportadora.","N"],
    ["Pode confirmar as medidas, por favor?","Tu sais pas mesurer ou quoi ?","Não sabes medir ou quê?","C"],
    ["O veio mais escuro é uma característica natural da pedra.","C'est naturel, mon pote. Ça s'appelle la nature.","É natural, pá. Chama-se natureza.","C"],
    ["O preço reflete a qualidade do material.","La qualité, ça se paie. Sinon, y a le carrelage.","A qualidade paga-se. Senão, há sempre o cerâmico.","A"],
    ["O arquiteto fez mais umas alterações ao projeto.","Encore ?! Il se fout de nous !","Outra vez?! Está a gozar connosco!","C"],
    ["Vamos com calma, para ficar bem feito.","On n'est pas aux pièces !","Calma, ninguém aqui ganha à peça!","C"],
    ["Penso que o problema não está na pedra.","Le problème, c'est pas la pierre, c'est vous.","O problema não é a pedra, é você.","A"],
    ["A descarga em obra é da vossa responsabilidade.","Débrouillez-vous, je suis pas grutier.","Desenrasquem-se, não sou operador de grua.","C"],
    ["Precisamos do sinal para avançar com a produção.","Pas d'acompte, pas de chantier.","Sem sinal, não há obra.","N"],
    ["Tivemos um pequeno contratempo com a chapa.","La tranche est cassée. Fais chier !","A chapa partiu-se. Que chatice! Em versão impublicável.","C"]
  ]
}
];
