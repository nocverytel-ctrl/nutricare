export type Recipe = {
  time: string
  servings: string
  difficulty: 'Fácil' | 'Medio' | 'Difícil'
  calories: string
  ingredients: string[]
  steps: string[]
  tip?: string
}

export const RECIPES: Record<string, Recipe> = {

  // ── Desayunos ──────────────────────────────────────────────────────────────

  'Avena con frutas frescas': {
    time: '10 min', servings: '1 porción', difficulty: 'Fácil', calories: '~320 kcal',
    ingredients: [
      '¾ taza de avena en hojuelas',
      '1½ taza de agua o leche descremada',
      '1 plátano maduro en rodajas',
      '½ taza de fresas o mango picado',
      '1 cucharadita de miel o stevia',
      'Canela al gusto',
    ],
    steps: [
      'Lleva el agua o la leche a ebullición en una olla pequeña.',
      'Agrega la avena, reduce el fuego y cocina revolviendo 4-5 minutos hasta que espese.',
      'Retira del fuego y sirve en un tazón.',
      'Coloca las frutas encima y termina con un hilo de miel y una pizca de canela.',
    ],
    tip: 'Para "overnight oats": mezcla la avena cruda con leche fría la noche anterior, refrigera y añade frutas al servir.',
  },

  'Tostada de pan integral con aguacate': {
    time: '10 min', servings: '1 porción', difficulty: 'Fácil', calories: '~280 kcal',
    ingredients: [
      '2 rebanadas de pan integral',
      '1 aguacate maduro',
      'Jugo de ½ limón',
      'Sal y pimienta al gusto',
      'Tomate cherry partido (opcional)',
      'Cilantro fresco (opcional)',
    ],
    steps: [
      'Tuesta el pan en tostadora o sartén hasta que esté dorado.',
      'Parte el aguacate por la mitad, retira la semilla y saca la pulpa.',
      'Machaca el aguacate con el jugo de limón, sal y pimienta.',
      'Unta generosamente sobre las tostadas.',
      'Decora con tomate cherry y cilantro si lo deseas.',
    ],
    tip: 'Añade un huevo pochado o escalfado encima para agregar proteína y hacerlo más completo.',
  },

  'Smoothie verde con plátano y espinaca': {
    time: '5 min', servings: '1 porción', difficulty: 'Fácil', calories: '~220 kcal',
    ingredients: [
      '1 plátano congelado o maduro',
      '1 taza de espinaca baby fresca',
      '1 taza de leche de almendras o agua de coco',
      '½ taza de piña en trozos',
      '1 cucharada de semillas de chía (opcional)',
    ],
    steps: [
      'Agrega todos los ingredientes a la licuadora.',
      'Licúa a alta velocidad durante 60 segundos hasta obtener una textura cremosa.',
      'Prueba el dulzor; si lo deseas más dulce añade un poco de miel.',
      'Sirve inmediatamente en un vaso alto.',
    ],
    tip: 'No se nota el sabor de la espinaca pero obtienes todo su hierro y vitaminas. El plátano congelado da textura cremosa.',
  },

  'Pan integral con hummus': {
    time: '5 min', servings: '1 porción', difficulty: 'Fácil', calories: '~260 kcal',
    ingredients: [
      '2 rebanadas de pan integral',
      '3 cucharadas de hummus (ver receta base o comprado)',
      'Pepino en rodajas finas',
      'Páprika o comino al gusto',
      'Aceite de oliva extra virgen (unas gotas)',
    ],
    steps: [
      'Tuesta el pan o sírvelo a temperatura ambiente.',
      'Unta generosamente el hummus sobre cada rebanada.',
      'Coloca las rodajas de pepino encima.',
      'Termina con una pizca de páprika y unas gotas de aceite de oliva.',
    ],
    tip: 'Hummus casero rápido: licúa 1 lata de garbanzos escurridos + 2 cdas de tahini + jugo de limón + ajo + sal.',
  },

  'Avena cocida con leche de almendras y nueces': {
    time: '12 min', servings: '1 porción', difficulty: 'Fácil', calories: '~380 kcal',
    ingredients: [
      '¾ taza de avena en hojuelas',
      '1½ taza de leche de almendras sin azúcar',
      '1 cucharada de nueces picadas',
      '1 cucharada de mantequilla de almendras (opcional)',
      '1 cucharadita de vainilla',
      'Stevia o miel al gusto',
    ],
    steps: [
      'Calienta la leche de almendras en una olla a fuego medio.',
      'Agrega la avena y el extracto de vainilla.',
      'Cocina revolviendo 5-6 minutos hasta que espese.',
      'Sirve en un tazón y añade las nueces picadas encima.',
      'Endulza al gusto con stevia o miel.',
    ],
    tip: 'Las nueces aportan grasas saludables omega-3. Puedes variar con almendras laminadas o semillas de girasol.',
  },

  'Batido de frutos rojos': {
    time: '5 min', servings: '1 porción', difficulty: 'Fácil', calories: '~180 kcal',
    ingredients: [
      '1 taza de frutos rojos mixtos (fresa, arándano, frambuesa)',
      '1 taza de leche de almendras o yogur natural',
      '½ plátano',
      '1 cucharada de semillas de lino molidas',
      'Hielo al gusto',
    ],
    steps: [
      'Si los frutos rojos son frescos, lávalos bien.',
      'Agrega todos los ingredientes a la licuadora.',
      'Licúa 45-60 segundos hasta obtener una mezcla homogénea.',
      'Sirve en un vaso y consume de inmediato.',
    ],
    tip: 'Los frutos rojos congelados son más económicos y tienen la misma nutrición. Además enfrían el batido sin necesidad de hielo.',
  },

  'Huevos revueltos con verduras': {
    time: '15 min', servings: '1 porción', difficulty: 'Fácil', calories: '~290 kcal',
    ingredients: [
      '3 huevos enteros o 2 enteros + 2 claras',
      '¼ pimentón rojo picado en cubos',
      '¼ cebolla cabezona picada finamente',
      '1 puñado de espinaca',
      '1 cucharadita de aceite de oliva',
      'Sal, pimienta y cúrcuma al gusto',
    ],
    steps: [
      'Calienta el aceite en sartén a fuego medio.',
      'Saltea la cebolla y el pimentón 3 minutos hasta ablandar.',
      'Agrega la espinaca y cocina 1 minuto hasta que se marchite.',
      'Bate los huevos con sal, pimienta y cúrcuma; vierte sobre las verduras.',
      'Revuelve suavemente con cuchara de madera hasta que estén apenas cuajados.',
      'Retira del fuego antes de que sequen completamente (siguen cocinando con el calor).',
    ],
    tip: 'La cúrcuma da color dorado y tiene propiedades antiinflamatorias. Agrega queso cottage para más proteína.',
  },

  'Tostada integral con tomate': {
    time: '7 min', servings: '1 porción', difficulty: 'Fácil', calories: '~200 kcal',
    ingredients: [
      '2 rebanadas de pan integral',
      '1 tomate maduro grande',
      '1 diente de ajo',
      '1 cucharada de aceite de oliva',
      'Sal y orégano al gusto',
      'Albahaca fresca (opcional)',
    ],
    steps: [
      'Tuesta el pan hasta que esté crujiente y dorado.',
      'Parte el ajo y frota suavemente sobre la superficie caliente del pan.',
      'Parte el tomate por la mitad y frota también sobre el pan; exprime el jugo.',
      'Rocía el aceite de oliva, agrega sal y orégano.',
      'Decora con hojas de albahaca fresca si tienes.',
    ],
    tip: 'Es la versión colombiana del "pan con tomate" catalán. Simple, sabroso y muy nutritivo con el aceite de oliva.',
  },

  // ── Meriendas ──────────────────────────────────────────────────────────────

  'Yogur natural con semillas': {
    time: '3 min', servings: '1 porción', difficulty: 'Fácil', calories: '~210 kcal',
    ingredients: [
      '1 taza (200g) de yogur natural sin azúcar',
      '1 cucharada de semillas de chía',
      '1 cucharada de semillas de girasol o ajonjolí',
      '1 cucharadita de miel',
      'Frutos rojos al gusto (opcional)',
    ],
    steps: [
      'Sirve el yogur en un tazón o vaso.',
      'Espolvorea las semillas uniformemente encima.',
      'Agrega un hilo de miel.',
      'Decora con frutos rojos si los tienes a la mano.',
    ],
    tip: 'Las semillas de chía se pueden hidratar en el yogur desde la noche anterior para mejor digestión.',
  },

  'Frutos rojos': {
    time: '2 min', servings: '1 porción', difficulty: 'Fácil', calories: '~80 kcal',
    ingredients: [
      '1 taza de fresas frescas',
      '½ taza de arándanos',
      'Jugo de limón (opcional)',
      'Menta fresca (opcional)',
    ],
    steps: [
      'Lava los frutos con agua fría.',
      'Parte las fresas por la mitad si son grandes.',
      'Mezcla en un tazón y añade unas gotas de limón.',
      'Decora con hojas de menta si deseas.',
    ],
    tip: 'Consume en el día; los frutos rojos son altos en antioxidantes y vitamina C.',
  },

  'Palitos de zanahoria con guacamole': {
    time: '10 min', servings: '1 porción', difficulty: 'Fácil', calories: '~200 kcal',
    ingredients: [
      '2 zanahorias medianas',
      '1 aguacate maduro',
      'Jugo de ½ limón',
      '¼ cebolla cabezona muy picada',
      '1 cucharada de cilantro fresco picado',
      'Sal y pimienta al gusto',
    ],
    steps: [
      'Pela y corta las zanahorias en palitos longitudinales.',
      'Machaca el aguacate con tenedor hasta obtener una crema.',
      'Mezcla con el limón, cebolla, cilantro, sal y pimienta.',
      'Sirve el guacamole en un tazón con los palitos de zanahoria al lado.',
    ],
    tip: 'Prepara el guacamole fresco cada vez; deja el hueso del aguacate dentro para retardar la oxidación.',
  },

  'Manzana verde': {
    time: '2 min', servings: '1 porción', difficulty: 'Fácil', calories: '~80 kcal',
    ingredients: [
      '1 manzana verde mediana',
      'Limón (opcional)',
      '1 cucharada de mantequilla de maní (opcional para más proteína)',
    ],
    steps: [
      'Lava bien la manzana.',
      'Córtala en gajos o consúmela entera.',
      'Si la cortas, rocía un poco de limón para evitar que se oxide.',
      'Acompaña con mantequilla de maní para un snack más completo.',
    ],
    tip: 'La cáscara concentra la fibra y los antioxidantes; consúmela con cáscara siempre que sea posible.',
  },

  'Hummus con bastones de pepino': {
    time: '5 min', servings: '1 porción', difficulty: 'Fácil', calories: '~160 kcal',
    ingredients: [
      '1 pepino cohombro grande',
      '4 cucharadas de hummus',
      'Páprika al gusto',
      'Aceite de oliva (unas gotas)',
    ],
    steps: [
      'Pela el pepino y córtalo en bastones de 8-10 cm.',
      'Coloca el hummus en un tazón pequeño.',
      'Espolvorea páprika encima del hummus y añade unas gotas de aceite.',
      'Sirve los bastones de pepino alrededor del tazón.',
    ],
    tip: 'También puedes usar apio, pimentón o brócoli crudo como acompañante del hummus.',
  },

  'Nueces mixtas': {
    time: '1 min', servings: '1 porción', difficulty: 'Fácil', calories: '~190 kcal',
    ingredients: [
      '30g de nueces mixtas (nuez de castilla, almendras, marañón)',
      'Pizca de sal marina (opcional)',
    ],
    steps: [
      'Pesa o mide aproximadamente un puñado pequeño (30g).',
      'Consume como snack entre comidas.',
    ],
    tip: '30g al día es la porción recomendada. Las nueces aportan omega-3, magnesio y grasas saludables; evita comer en exceso por su densidad calórica.',
  },

  'Peras en rodajas': {
    time: '3 min', servings: '1 porción', difficulty: 'Fácil', calories: '~100 kcal',
    ingredients: [
      '1 pera madura',
      'Jugo de limón (opcional)',
      'Canela en polvo (opcional)',
    ],
    steps: [
      'Lava bien la pera.',
      'Córtala en rodajas o gajos medianos.',
      'Rocía limón si la vas a consumir después.',
      'Espolvorea canela para realzar el sabor.',
    ],
    tip: 'La pera es alta en fibra soluble (pectina), ideal para la salud digestiva y el control del azúcar en sangre.',
  },

  // ── Almuerzos ──────────────────────────────────────────────────────────────

  'Pollo a la plancha con quinoa y verduras': {
    time: '30 min', servings: '2 porciones', difficulty: 'Medio', calories: '~480 kcal',
    ingredients: [
      '300g de pechuga de pollo',
      '1 taza de quinoa seca',
      '1 taza de brócoli en floretes',
      '1 zanahoria en juliana',
      '1 cucharadita de aceite de oliva',
      'Ajo en polvo, orégano, sal y pimienta',
      'Jugo de ½ limón',
    ],
    steps: [
      'Lava la quinoa bajo el chorro de agua fría, escurre y cocina con 2 tazas de agua y sal por 15 minutos.',
      'Aplana la pechuga con la palma, marina con limón, ajo, orégano, sal y pimienta por 10 min.',
      'Calienta una plancha o sartén a fuego alto y agrega unas gotas de aceite.',
      'Cocina el pollo 5-6 minutos por lado hasta que esté dorado y bien cocido.',
      'En otra sartén saltea el brócoli y la zanahoria con un poco de aceite y sal por 5 minutos.',
      'Sirve la quinoa como base, coloca el pollo encima y las verduras al lado.',
    ],
    tip: 'La quinoa es el único cereal vegetal con todos los aminoácidos esenciales. Enjuágala siempre para eliminar la saponina amarga.',
  },

  'Ensalada de hojas verdes con aceite de oliva': {
    time: '10 min', servings: '1 porción', difficulty: 'Fácil', calories: '~150 kcal',
    ingredients: [
      '2 tazas de hojas verdes mixtas (espinaca, rúgula, lechuga romana)',
      '½ pepino en rodajas',
      '¼ taza de tomates cherry',
      '2 cucharadas de aceite de oliva extra virgen',
      '1 cucharada de vinagre balsámico o limón',
      'Sal, pimienta y orégano al gusto',
    ],
    steps: [
      'Lava y seca bien las hojas verdes.',
      'Coloca en un tazón grande y agrega el pepino y los tomates.',
      'En un recipiente aparte, mezcla el aceite, el vinagre, sal y pimienta.',
      'Vierte el aderezo sobre la ensalada justo antes de servir.',
      'Espolvorea orégano al gusto.',
    ],
    tip: 'El aceite de oliva ayuda a absorber las vitaminas liposolubles (A, D, E, K) de las hojas verdes. Añade aguacate para más saciedad.',
  },

  'Bowl de lentejas con vegetales y arroz integral': {
    time: '35 min', servings: '2 porciones', difficulty: 'Medio', calories: '~420 kcal',
    ingredients: [
      '1 taza de lentejas rojas o verdes secas',
      '1 taza de arroz integral',
      '1 zanahoria picada en cubos',
      '½ cebolla cabezona picada',
      '2 dientes de ajo picados',
      '1 cucharadita de comino y cúrcuma',
      'Sal y aceite de oliva',
    ],
    steps: [
      'Cocina el arroz integral con 2 tazas de agua y sal por 35 minutos.',
      'Lava las lentejas y ponlas a cocinar con agua por 20 minutos.',
      'En una sartén, sofríe la cebolla y el ajo en aceite hasta dorar.',
      'Agrega la zanahoria, comino y cúrcuma; cocina 3 minutos más.',
      'Incorpora las lentejas cocidas al sofrito, mezcla bien y sazona.',
      'Sirve las lentejas sobre el arroz integral.',
    ],
    tip: 'Combinar lentejas con arroz forma una proteína completa. La cúrcuma tiene efecto antiinflamatorio y realza el color del plato.',
  },

  'Ensalada de garbanzos': {
    time: '15 min', servings: '2 porciones', difficulty: 'Fácil', calories: '~340 kcal',
    ingredients: [
      '1 lata (400g) de garbanzos cocidos escurridos',
      '1 tomate grande en cubos',
      '½ pepino en cubos',
      '¼ cebolla morada finamente picada',
      '3 cucharadas de aceite de oliva',
      'Jugo de 1 limón',
      'Perejil fresco picado',
      'Sal, pimienta y comino al gusto',
    ],
    steps: [
      'Escurre y enjuaga los garbanzos con agua fría.',
      'Mezcla en un tazón con el tomate, pepino y cebolla.',
      'Prepara el aderezo: mezcla aceite, limón, sal, pimienta y comino.',
      'Vierte sobre los garbanzos y mezcla bien.',
      'Añade el perejil picado y refrigera 10 minutos antes de servir.',
    ],
    tip: 'Esta ensalada es una versión del "fattouche" árabe adaptada. Mejora con el reposo; puedes hacerla la noche anterior.',
  },

  'Bowl de quinoa con tofu y vegetales': {
    time: '30 min', servings: '2 porciones', difficulty: 'Medio', calories: '~410 kcal',
    ingredients: [
      '1 taza de quinoa seca',
      '200g de tofu firme',
      '1 taza de edamame o habas',
      '1 zanahoria rallada',
      '1 aguacate en rodajas',
      '2 cucharadas de salsa de soya baja en sodio',
      '1 cucharadita de aceite de ajonjolí',
      'Semillas de ajonjolí para decorar',
    ],
    steps: [
      'Cocina la quinoa con 2 tazas de agua y sal por 15 minutos hasta que absorba el líquido.',
      'Corta el tofu en cubos y marina con salsa de soya por 10 minutos.',
      'Dora el tofu en sartén con aceite de ajonjolí a fuego medio-alto, 3 minutos por lado.',
      'Cocina el edamame al vapor o en microondas por 3 minutos.',
      'Arma el bowl: quinoa como base, tofu, zanahoria, edamame y aguacate.',
      'Rocía con la salsa de soya restante y semillas de ajonjolí.',
    ],
    tip: 'Presiona el tofu entre papeles absorbentes por 20 minutos antes de marinarlo para que absorba mejor los sabores.',
  },

  'Ensalada de kale con semillas': {
    time: '15 min', servings: '1 porción', difficulty: 'Fácil', calories: '~280 kcal',
    ingredients: [
      '2 tazas de kale (col rizada) sin tallos duros',
      '2 cucharadas de semillas mixtas (girasol, calabaza, chía)',
      '¼ taza de tomates cherry',
      '¼ aguacate',
      '2 cucharadas de aceite de oliva',
      'Jugo de ½ limón',
      'Sal y pimienta',
    ],
    steps: [
      'Retira los tallos duros del kale y corta las hojas en trozos.',
      'Masajea el kale con limón y una pizca de sal por 2-3 minutos hasta ablandarlo.',
      'Agrega los tomates cherry, aguacate y semillas.',
      'Aliña con aceite de oliva, sal y pimienta.',
      'Mezcla bien y sirve.',
    ],
    tip: 'Masajear el kale es clave: rompe las fibras y lo hace más digerible y sabroso. No omitas este paso.',
  },

  'Pechuga de pollo a la plancha con verduras asadas': {
    time: '35 min', servings: '2 porciones', difficulty: 'Medio', calories: '~360 kcal',
    ingredients: [
      '300g de pechuga de pollo',
      '1 pimentón rojo en tiras',
      '1 calabacín en rodajas',
      '1 berenjena en cubos',
      '2 cucharadas de aceite de oliva',
      'Ajo en polvo, tomillo, sal y pimienta',
      'Jugo de limón',
    ],
    steps: [
      'Precalienta el horno a 200°C.',
      'Mezcla las verduras con 1 cda de aceite, sal y tomillo; extiende en una bandeja.',
      'Hornea las verduras 20-25 minutos hasta que estén tiernas y doradas.',
      'Marina la pechuga con limón, ajo en polvo, sal y pimienta.',
      'Cocina a la plancha 5-6 minutos por lado hasta que esté bien cocida.',
      'Sirve la pechuga cortada en diagonal sobre las verduras asadas.',
    ],
    tip: 'Cortar la pechuga a la mitad longitudinalmente reduce el tiempo de cocción a la mitad y evita que quede seca.',
  },

  'Ensalada mixta con nueces': {
    time: '12 min', servings: '1 porción', difficulty: 'Fácil', calories: '~310 kcal',
    ingredients: [
      '2 tazas de lechuga mixta',
      '¼ taza de nueces de castilla picadas',
      '½ manzana verde en láminas finas',
      '2 cucharadas de queso feta o cottage (opcional)',
      '2 cucharadas de aceite de oliva',
      '1 cucharada de vinagre de manzana',
      'Mostaza, sal y miel al gusto',
    ],
    steps: [
      'Lava y seca bien las hojas de lechuga.',
      'Prepara el aderezo: mezcla aceite, vinagre, mostaza, miel y sal.',
      'Coloca la lechuga en un tazón.',
      'Añade la manzana, las nueces y el queso.',
      'Vierte el aderezo justo antes de servir y mezcla suavemente.',
    ],
    tip: 'La combinación manzana + nuez + vinagre crea un balance perfecto de dulce, ácido y crujiente. Añade pollo desmechado para hacerla más contundente.',
  },

  // ── Cenas ──────────────────────────────────────────────────────────────────

  'Salmón al horno con brócoli al vapor': {
    time: '25 min', servings: '2 porciones', difficulty: 'Medio', calories: '~420 kcal',
    ingredients: [
      '2 filetes de salmón (150g c/u)',
      '2 tazas de brócoli en floretes',
      '2 cucharadas de aceite de oliva',
      'Jugo de 1 limón',
      '2 dientes de ajo laminados',
      'Eneldo o tomillo fresco',
      'Sal y pimienta',
    ],
    steps: [
      'Precalienta el horno a 190°C.',
      'Coloca los filetes en una bandeja y cubre con aceite, ajo, hierbas, limón, sal y pimienta.',
      'Hornea 15-18 minutos según el grosor; el salmón debe estar opaco en el centro.',
      'Mientras tanto, cocina el brócoli al vapor 6-7 minutos hasta que esté tierno pero firme.',
      'Sazona el brócoli con sal, pimienta y unas gotas de limón.',
      'Sirve el salmón con el brócoli al lado.',
    ],
    tip: 'El salmón está listo cuando cambia de color naranja brillante a rosado opaco. No lo sobrecocines; queda seco y pierde omega-3.',
  },

  'Batata asada con especias suaves': {
    time: '45 min', servings: '2 porciones', difficulty: 'Fácil', calories: '~230 kcal',
    ingredients: [
      '2 batatas o camotes medianos',
      '1 cucharada de aceite de oliva',
      'Canela en polvo',
      'Cúrcuma (opcional)',
      'Sal y pimienta',
      'Yogur natural para servir (opcional)',
    ],
    steps: [
      'Precalienta el horno a 200°C.',
      'Lava bien las batatas y córtalas en mitades o en cubos.',
      'Mezcla con aceite, canela, sal y pimienta.',
      'Extiende en una bandeja con papel de hornear.',
      'Hornea 35-40 minutos hasta que estén blandas y doradas.',
      'Sirve con una cucharada de yogur natural si gustas.',
    ],
    tip: 'La batata asada entera (sin pelar) conserva más nutrientes. Solo lávala, pínchala con tenedor y hornea por 50 min.',
  },

  'Tacos de vegetales asados': {
    time: '30 min', servings: '2 porciones', difficulty: 'Medio', calories: '~380 kcal',
    ingredients: [
      '6 tortillas de maíz pequeñas',
      '1 pimentón de cada color (rojo, amarillo)',
      '1 calabacín',
      '1 cebolla morada en gajos',
      '1 cucharada de aceite de oliva',
      'Comino, ajo en polvo, sal y pimienta',
      'Aguacate, cilantro y limón para servir',
    ],
    steps: [
      'Corta los vegetales en tiras similares y mezcla con aceite y especias.',
      'Asa en sartén caliente o grill a fuego alto 8-10 minutos, removiendo ocasionalmente.',
      'Calienta las tortillas en sartén seco 30 segundos por lado.',
      'Arma los tacos: tortilla, vegetales asados, aguacate en rodajas.',
      'Termina con cilantro fresco y limón al gusto.',
    ],
    tip: 'Para tacos más proteicos agrega frijoles negros o lentejas cocidas como relleno adicional.',
  },

  'Crema de calabaza ligera': {
    time: '30 min', servings: '3 porciones', difficulty: 'Fácil', calories: '~190 kcal',
    ingredients: [
      '500g de calabaza o ahuyama pelada y en cubos',
      '1 cebolla cabezona picada',
      '2 dientes de ajo',
      '1 zanahoria picada',
      '3 tazas de caldo de verduras',
      '½ cucharadita de jengibre rallado',
      'Sal, pimienta y aceite de oliva',
    ],
    steps: [
      'En una olla, sofríe la cebolla y el ajo en aceite 3 minutos.',
      'Agrega la calabaza, zanahoria y jengibre; sofríe 2 minutos más.',
      'Vierte el caldo y cocina a fuego medio 20 minutos hasta que la calabaza esté blanda.',
      'Licúa la mezcla hasta obtener una crema homogénea.',
      'Regresa a la olla, rectifica la sazón y calienta antes de servir.',
    ],
    tip: 'Sirve con unas pepas de calabaza tostadas encima y un hilo de crema de coco para un toque especial.',
  },

  'Stir fry de vegetales y garbanzos': {
    time: '20 min', servings: '2 porciones', difficulty: 'Medio', calories: '~350 kcal',
    ingredients: [
      '1 lata de garbanzos escurridos',
      '1 taza de brócoli en floretes pequeños',
      '1 pimentón rojo en tiras',
      '1 zanahoria en juliana fina',
      '2 cucharadas de salsa de soya baja en sodio',
      '1 cucharadita de aceite de ajonjolí',
      '2 dientes de ajo y 1 trozo de jengibre rallado',
    ],
    steps: [
      'Calienta el wok o sartén grande a fuego muy alto.',
      'Agrega el aceite y saltea el ajo y jengibre 30 segundos.',
      'Incorpora los garbanzos y dóralos 3-4 minutos sin mover.',
      'Agrega las verduras y saltea revolviendo constantemente 4-5 minutos.',
      'Vierte la salsa de soya, mezcla bien y cocina 1 minuto más.',
      'Sirve de inmediato sobre arroz integral o solo.',
    ],
    tip: 'El secreto del stir fry es el wok muy caliente y no amontonar los ingredientes. Cocina en dos tandas si la sartén es pequeña.',
  },

  'Crema de zanahoria con jengibre': {
    time: '30 min', servings: '3 porciones', difficulty: 'Fácil', calories: '~160 kcal',
    ingredients: [
      '6 zanahorias medianas peladas y picadas',
      '1 cebolla picada',
      '1 trozo de jengibre fresco (2 cm) rallado',
      '2 dientes de ajo',
      '3 tazas de caldo de verduras',
      '1 cucharada de aceite de coco o oliva',
      'Sal y pimienta',
      'Leche de coco (opcional, para servir)',
    ],
    steps: [
      'Sofríe la cebolla, ajo y jengibre en aceite por 3 minutos.',
      'Agrega las zanahorias y el caldo; cocina 20 minutos hasta que ablanden.',
      'Licúa hasta obtener una crema lisa y suave.',
      'Regresa a la olla, sazona y calienta.',
      'Sirve con un chorrito de leche de coco en espiral encima.',
    ],
    tip: 'El jengibre tiene propiedades digestivas y antiinflamatorias. Esta crema es ideal para cenar pues es ligera y reconfortante.',
  },

  'Merluza al limón con espinacas': {
    time: '25 min', servings: '2 porciones', difficulty: 'Medio', calories: '~320 kcal',
    ingredients: [
      '300g de filetes de merluza o mojarra',
      '3 tazas de espinaca fresca',
      'Jugo de 1 limón',
      '2 dientes de ajo laminados',
      '2 cucharadas de aceite de oliva',
      'Alcaparras (opcional)',
      'Sal, pimienta y eneldo',
    ],
    steps: [
      'Seca los filetes con papel absorbente y sazona con sal, pimienta y eneldo.',
      'Calienta 1 cda de aceite en sartén y dora el pescado 3-4 min por lado.',
      'Retira el pescado y en la misma sartén sofríe el ajo laminado 30 segundos.',
      'Agrega la espinaca, cócala 2 minutos hasta que se marchite y sazona.',
      'Vuelve a colocar el pescado, vierte el limón y cocina 1 minuto más.',
      'Sirve el pescado sobre la cama de espinacas.',
    ],
    tip: 'El pescado blanco como la merluza es bajo en grasa y alto en proteína. Las alcaparras aportan un toque de acidez y sofisticación.',
  },

  'Papas cambray al horno': {
    time: '40 min', servings: '2 porciones', difficulty: 'Fácil', calories: '~240 kcal',
    ingredients: [
      '400g de papas cambray (pequeñas)',
      '2 cucharadas de aceite de oliva',
      '2 dientes de ajo machacados',
      'Romero y tomillo fresco',
      'Sal en escamas y pimienta',
      'Paprika ahumada (opcional)',
    ],
    steps: [
      'Precalienta el horno a 210°C.',
      'Lava bien las papas y pártalas por la mitad.',
      'Mezcla con aceite, ajo, hierbas, sal y paprika.',
      'Extiende en una bandeja con el lado cortado hacia abajo.',
      'Hornea 30-35 minutos hasta que estén doradas y crujientes por fuera.',
    ],
    tip: 'Hervir las papas 5 minutos antes de hornearlas garantiza que queden bien cocidas por dentro y crujientes por fuera.',
  },
}
