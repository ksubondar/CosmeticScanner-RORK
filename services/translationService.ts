const ruToEnDict: Record<string, string> = {
  'вода': 'Water',
  'вода очищенная': 'Water',
  'глицерин': 'Glycerin',
  'ретинол': 'Retinol',
  'ретиналь': 'Retinal',
  'ретинил пальмитат': 'Retinyl Palmitate',
  'ниацинамид': 'Niacinamide',
  'пантенол': 'Panthenol',
  'аллантоин': 'Allantoin',
  'мочевина': 'Urea',
  'кофеин': 'Caffeine',
  'коллаген': 'Collagen',
  'эластин': 'Elastin',
  'сера': 'Sulfur',
  'спирт': 'Alcohol',
  'сквалан': 'Squalane',
  'бисаболол': 'Bisabolol',
  'бакучиол': 'Bakuchiol',
  'бетаин': 'Betaine',
  'ресвератрол': 'Resveratrol',
  'трегалоза': 'Trehalose',
  'арбутин': 'Arbutin',
  'альфа-арбутин': 'Alpha-Arbutin',
  'бензоилпероксид': 'Benzoyl Peroxide',
  'адапален': 'Adapalene',
  'гиалуроновая кислота': 'Hyaluronic Acid',
  'гиалуронат натрия': 'Sodium Hyaluronate',
  'салициловая кислота': 'Salicylic Acid',
  'гликолевая кислота': 'Glycolic Acid',
  'молочная кислота': 'Lactic Acid',
  'миндальная кислота': 'Mandelic Acid',
  'азелаиновая кислота': 'Azelaic Acid',
  'койевая кислота': 'Kojic Acid',
  'транексамовая кислота': 'Tranexamic Acid',
  'феруловая кислота': 'Ferulic Acid',
  'лимонная кислота': 'Citric Acid',
  'аскорбиновая кислота': 'Ascorbic Acid',
  'стеариновая кислота': 'Stearic Acid',
  'пальмитиновая кислота': 'Palmitic Acid',
  'лактобионовая кислота': 'Lactobionic Acid',
  'полигидроксикислота': 'Polyhydroxy Acid',
  'витамин с': 'Ascorbic Acid',
  'витамин с (аскорбиновая кислота)': 'Ascorbic Acid',
  'витамин е': 'Tocopherol',
  'витамин а': 'Retinol',
  'витамин b3': 'Niacinamide',
  'витамин b5': 'Panthenol',
  'токоферол': 'Tocopherol',
  'токоферил ацетат': 'Tocopheryl Acetate',
  'диметикон': 'Dimethicone',
  'циклопентасилоксан': 'Cyclopentasiloxane',
  'циклогексасилоксан': 'Cyclohexasiloxane',
  'парфюмерная композиция': 'Parfum',
  'отдушка': 'Fragrance',
  'ароматизатор': 'Fragrance',
  'линалоол': 'Linalool',
  'лимонен': 'Limonene',
  'цитронеллол': 'Citronellol',
  'гераниол': 'Geraniol',
  'феноксиэтанол': 'Phenoxyethanol',
  'этилгексилглицерин': 'Ethylhexylglycerin',
  'метилпарабен': 'Methylparaben',
  'пропилпарабен': 'Propylparaben',
  'бутилпарабен': 'Butylparaben',
  'лаурилсульфат натрия': 'Sodium Lauryl Sulfate',
  'лауретсульфат натрия': 'Sodium Laureth Sulfate',
  'кокамидопропил бетаин': 'Cocamidopropyl Betaine',
  'коко-глюкозид': 'Coco-Glucoside',
  'денатурированный спирт': 'Alcohol Denat',
  'изопропиловый спирт': 'Isopropyl Alcohol',
  'цетиловый спирт': 'Cetyl Alcohol',
  'цетеариловый спирт': 'Cetearyl Alcohol',
  'стеариловый спирт': 'Stearyl Alcohol',
  'изопропилмиристат': 'Isopropyl Myristate',
  'изопропилпальмитат': 'Isopropyl Palmitate',
  'кокосовое масло': 'Coconut Oil',
  'масло кокоса': 'Cocos Nucifera Oil',
  'масло жожоба': 'Jojoba Oil',
  'аргановое масло': 'Argan Oil',
  'масло арганы': 'Argania Spinosa Kernel Oil',
  'масло ши': 'Shea Butter',
  'масло ши (карите)': 'Butyrospermum Parkii Butter',
  'масло шиповника': 'Rosehip Oil',
  'масло чайного дерева': 'Tea Tree Oil',
  'масло лаванды': 'Lavandula Angustifolia Oil',
  'масло эвкалипта': 'Eucalyptus Oil',
  'касторовое масло': 'Ricinus Communis Seed Oil',
  'подсолнечное масло': 'Helianthus Annuus Seed Oil',
  'оливковое масло': 'Olea Europaea Fruit Oil',
  'минеральное масло': 'Mineral Oil',
  'жидкий парафин': 'Paraffinum Liquidum',
  'вазелин': 'Petrolatum',
  'ланолин': 'Lanolin',
  'пропиленгликоль': 'Propylene Glycol',
  'бутиленгликоль': 'Butylene Glycol',
  'карбомер': 'Carbomer',
  'ксантановая камедь': 'Xanthan Gum',
  'гидроксид натрия': 'Sodium Hydroxide',
  'триэтаноламин': 'Triethanolamine',
  'динатрий эдта': 'Disodium EDTA',
  'бентонит': 'Bentonite',
  'каолин': 'Kaolin',
  'оксид цинка': 'Zinc Oxide',
  'диоксид титана': 'Titanium Dioxide',
  'авобензон': 'Avobenzone',
  'октиноксат': 'Octinoxate',
  'экстракт зелёного чая': 'Camellia Sinensis Leaf Extract',
  'экстракт зеленого чая': 'Camellia Sinensis Leaf Extract',
  'экстракт алоэ вера': 'Aloe Barbadensis Leaf Extract',
  'сок алоэ вера': 'Aloe Barbadensis Leaf Juice',
  'алоэ вера': 'Aloe Barbadensis Leaf Juice',
  'экстракт центеллы азиатской': 'Centella Asiatica Extract',
  'центелла азиатская': 'Centella Asiatica Extract',
  'мадекассозид': 'Madecassoside',
  'экстракт корня солодки': 'Glycyrrhiza Glabra Root Extract',
  'муцин улитки': 'Snail Secretion Filtrate',
  'гамамелис': 'Witch Hazel',
  'гидрохинон': 'Hydroquinone',
  'пчелиный воск': 'Cera Alba',
  'бензоат натрия': 'Sodium Benzoate',
  'сорбат калия': 'Potassium Sorbate',
  'хлорид натрия': 'Sodium Chloride',
  'керамид np': 'Ceramide NP',
  'керамид ap': 'Ceramide AP',
  'керамид eop': 'Ceramide EOP',
  'полисорбат 20': 'Polysorbate 20',
  'полисорбат 80': 'Polysorbate 80',
  'глицерил стеарат': 'Glyceryl Stearate',
  'глюконолактон': 'Gluconolactone',
  'медный трипептид-1': 'Copper Tripeptide-1',
  'гидролат гамамелиса': 'Hamamelis Virginiana Water',
  'пкн натрия': 'Sodium PCA',
  'цетеарет-20': 'Ceteareth-20',
  'цетеарет-12': 'Ceteareth-12',
  'пэг-100 стеарат': 'PEG-100 Stearate',
  'пэг-40 гидрогенизированное касторовое масло': 'PEG-40 Hydrogenated Castor Oil',
  'декспантенол': 'Dexpanthenol',
  'глутатион': 'Glutathione',
  'аминокапроновая кислота': 'Aminocaproic Acid',
  'глицин': 'Glycine',
  'аланин': 'Alanine',
  'пролин': 'Proline',
  'серин': 'Serine',
  'треонин': 'Threonine',
  'аргинин': 'Arginine',
  'лизин': 'Lysine',
  'кератин': 'Keratin',
  'шелк': 'Silk',
  'гидролизат коллагена': 'Hydrolyzed Collagen',
  'гидролизат кератина': 'Hydrolyzed Keratin',
  'гидролизат шелка': 'Hydrolyzed Silk',
  'гидролизат пшеницы': 'Hydrolyzed Wheat Protein',
  'коллоидная овсянка': 'Colloidal Oatmeal',
  'масло авокадо': 'Persea Gratissima Oil',
  'масло миндаля': 'Prunus Amygdalus Dulcis Oil',
  'масло виноградной косточки': 'Vitis Vinifera Seed Oil',
  'масло какао': 'Theobroma Cacao Seed Butter',
  'масло макадамии': 'Macadamia Integrifolia Seed Oil',
  'масло примулы вечерней': 'Oenothera Biennis Oil',
  'масло семян льна': 'Linum Usitatissimum Seed Oil',
  'льняное масло': 'Linum Usitatissimum Seed Oil',
  'масло зародышей пшеницы': 'Triticum Vulgare Germ Oil',
  'масло рисовых отрубей': 'Oryza Sativa Bran Oil',
  'кокосовый масло': 'Cocos Nucifera Oil',
  'масло сои': 'Glycine Soja Oil',
  'соевое масло': 'Glycine Soja Oil',
  'масло семян подсолнечника': 'Helianthus Annuus Seed Oil',
  'экстракт ромашки': 'Chamomilla Recutita Extract',
  'экстракт календулы': 'Calendula Officinalis Flower Extract',
  'экстракт лаванды': 'Lavandula Angustifolia Extract',
  'экстракт розмарина': 'Rosmarinus Officinalis Extract',
  'экстракт крапивы': 'Urtica Dioica Extract',
  'экстракт лопуха': 'Arctium Lappa Root Extract',
  'экстракт шалфея': 'Salvia Officinalis Extract',
  'экстракт мяты': 'Mentha Piperita Extract',
  'экстракт чистотела': 'Chelidonium Majus Extract',
  'экстракт огурца': 'Cucumis Sativus Extract',
  'экстракт петрушки': 'Petroselinum Crispum Extract',
  'экстракт липы': 'Tilia Cordata Flower Extract',
  'экстракт березы': 'Betula Alba Extract',
  'экстракт хмеля': 'Humulus Lupulus Extract',
  'экстракт зверобоя': 'Hypericum Perforatum Extract',
  'экстракт подорожника': 'Plantago Major Extract',
  'экстракт женьшеня': 'Panax Ginseng Root Extract',
  'экстракт корня женьшеня': 'Panax Ginseng Root Extract',
  'экстракт чайного дерева': 'Melaleuca Alternifolia Leaf Extract',
  'экстракт гинкго билоба': 'Ginkgo Biloba Leaf Extract',
  'экстракт плюща': 'Hedera Helix Extract',
  'экстракт конского каштана': 'Aesculus Hippocastanum Extract',
  'сорбитол': 'Sorbitol',
  'маннитол': 'Mannitol',
  'ксилитол': 'Xylitol',
  'эритритол': 'Erythritol',
  'мальтодекстрин': 'Maltodextrin',
  'крахмал': 'Starch',
  'целлюлоза': 'Cellulose',
  'гидроксиэтилцеллюлоза': 'Hydroxyethylcellulose',
  'метилцеллюлоза': 'Methylcellulose',
  'поливинилпирролидон': 'PVP',
  'тальк': 'Talc',
  'кремнезем': 'Silica',
  'коллоидный кремнезем': 'Colloidal Silica',
  'микрокристаллический воск': 'Cera Microcristallina',
  'парафин': 'Paraffin',
  'церезин': 'Ceresin',
  'озокерит': 'Ozokerite',
  'канделиллый воск': 'Candelilla Cera',
  'карнаубский воск': 'Copernicia Cerifera Cera',
  'лецитин': 'Lecithin',
  'холестерин': 'Cholesterol',
  'фитосфингозин': 'Phytosphingosine',
  'сквален': 'Squalene',
  'каприлик/каприк триглицерид': 'Caprylic/Capric Triglyceride',
  'триглицерид': 'Triglyceride',
  'изононил изононаноат': 'Isononyl Isononanoate',
  'цетилпальмитат': 'Cetyl Palmitate',
  'миристил миристат': 'Myristyl Myristate',
  'октилдодеканол': 'Octyldodecanol',
  'токоферол ацетат': 'Tocopheryl Acetate',
  'ретинил ацетат': 'Retinyl Acetate',
  'аскорбил глюкозид': 'Ascorbyl Glucoside',
  'аскорбил пальмитат': 'Ascorbyl Palmitate',
  'магний аскорбилфосфат': 'Magnesium Ascorbyl Phosphate',
  'пиридоксин': 'Pyridoxine',
  'тиамин': 'Thiamine',
  'рибофлавин': 'Riboflavin',
  'фолиевая кислота': 'Folic Acid',
  'биотин': 'Biotin',
  'цинк': 'Zinc',
  'магний': 'Magnesium',
  'кальций': 'Calcium',
  'железо': 'Iron',
  'медь': 'Copper',
  'селен': 'Selenium',
  'триклозан': 'Triclosan',
  'хлоргексидин': 'Chlorhexidine',
  'миконазол': 'Miconazole',
  'клотримазол': 'Clotrimazole',
  'метронидазол': 'Metronidazole',
  'метилизотиазолинон': 'Methylisothiazolinone',
  'метилхлоризотиазолинон': 'Methylchloroisothiazolinone',
  'имидазолидинилмочевина': 'Imidazolidinyl Urea',
  'диазолидинилмочевина': 'Diazolidinyl Urea',
  'бензиловый спирт': 'Benzyl Alcohol',
  'фенилэтиловый спирт': 'Phenethyl Alcohol',
  'кокамид мэа': 'Cocamide MEA',
  'кокамид дэа': 'Cocamide DEA',
  'лаурамид дэа': 'Lauramide DEA',
  'лаурил глюкозид': 'Lauryl Glucoside',
  'децил глюкозид': 'Decyl Glucoside',
  'лауроилсаркозинат натрия': 'Sodium Lauroyl Sarcosinate',
  'кокоил глутамат натрия': 'Sodium Cocoyl Glutamate',
  'кокоил изетионат натрия': 'Sodium Cocoyl Isethionate',
  'октокрилен': 'Octocrylene',
  'гомосалат': 'Homosalate',
  'октисалат': 'Octisalate',
  'энсулизол': 'Ensulizole',
  'бемотризинол': 'Bemotrizinol',
  'бисэтилгексилоксифенол метоксифенил триазин': 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine',
  'фосфорная кислота': 'Phosphoric Acid',
  'уксусная кислота': 'Acetic Acid',
  'бензойная кислота': 'Benzoic Acid',
  'сорбиновая кислота': 'Sorbic Acid',
  'дегидроуксусная кислота': 'Dehydroacetic Acid',
  'янтарная кислота': 'Succinic Acid',
  'яблочная кислота': 'Malic Acid',
  'винная кислота': 'Tartaric Acid',
  'олеиновая кислота': 'Oleic Acid',
  'линолевая кислота': 'Linoleic Acid',
  'линоленовая кислота': 'Linolenic Acid',
  'лауриновая кислота': 'Lauric Acid',
  'миристиновая кислота': 'Myristic Acid',
  'каприловая кислота': 'Caprylic Acid',
  'каприновая кислота': 'Capric Acid',
  'глюконовая кислота': 'Gluconic Acid',
  'пироглутаминовая кислота': 'Pyroglutamic Acid',
  'глютаминовая кислота': 'Glutamic Acid',
  'аспарагиновая кислота': 'Aspartic Acid',
  'этилендиаминтетрауксусная кислота': 'EDTA',
  'акрилаты': 'Acrylates',
  'акрилат кроссполимер': 'Acrylates Crosspolymer',
  'карбомер натрия': 'Sodium Carbomer',
  'акрилаты/c10-30 алкил акрилат кроссполимер': 'Acrylates/C10-30 Alkyl Acrylate Crosspolymer',
  'полиакриламид': 'Polyacrylamide',
  'каприлил гликоль': 'Caprylyl Glycol',
  'гексиленгликоль': 'Hexylene Glycol',
  'пентиленгликоль': 'Pentylene Glycol',
  'дипропиленгликоль': 'Dipropylene Glycol',
  'полиэтиленгликоль': 'PEG',
  'пользамер 90': 'Poloxamer 90',
  'циклометикон': 'Cyclomethicone',
  'фенилтриметикон': 'Phenyl Trimethicone',
  'амодиметикон': 'Amodimethicone',
  'симетикон': 'Simethicone',
  'глина': 'Clay',
  'белая глина': 'Kaolin',
  'голубая глина': 'Bentonite',
  'зеленая глина': 'Montmorillonite',
  'активированный уголь': 'Charcoal',
  'коллоидное золото': 'Colloidal Gold',
  'коллоидное серебро': 'Colloidal Silver',
  'морская соль': 'Maris Sal',
  'морской коллаген': 'Marine Collagen',
  'морские водоросли': 'Algae Extract',
  'спирулина': 'Spirulina',
  'хитозан': 'Chitosan',
  'муравьиная кислота': 'Formic Acid',
  'прополис': 'Propolis',
  'маточное молочко': 'Royal Jelly',
  'мед': 'Honey',
  'мёд': 'Honey',
  'глицинат цинка': 'Zinc Glycinate',
  'пиритион цинка': 'Zinc Pyrithione',
  'сульфид селена': 'Selenium Sulfide',
  'кетоконазол': 'Ketoconazole',
  'ментол': 'Menthol',
  'камфора': 'Camphor',
  'эвкалиптол': 'Eucalyptol',
  'тимол': 'Thymol',
  'фенол': 'Phenol',
  'резорцин': 'Resorcinol',
  'перекись водорода': 'Hydrogen Peroxide',
  'молочные протеины': 'Milk Protein',
  'казеин': 'Casein',
  'цетеарилоливат': 'Cetearyl Olivate',
  'сорбитан оливат': 'Sorbitan Olivate',
  'сорбитан стеарат': 'Sorbitan Stearate',
  'сорбитан олеат': 'Sorbitan Oleate',
  'гидроксид калия': 'Potassium Hydroxide',
};

const enToRuTerms: Record<string, string> = {
  'moisturizer': 'увлажнитель',
  'moisturizing': 'увлажняющий',
  'humectant': 'увлажнитель',
  'emollient': 'смягчающий компонент',
  'surfactant': 'поверхностно-активное вещество',
  'preservative': 'консервант',
  'antioxidant': 'антиоксидант',
  'anti-aging': 'антивозрастной',
  'anti-inflammatory': 'противовоспалительный',
  'sunscreen': 'солнцезащитный',
  'uv filter': 'УФ-фильтр',
  'fragrance': 'отдушка',
  'colorant': 'краситель',
  'thickener': 'загуститель',
  'emulsifier': 'эмульгатор',
  'solvent': 'растворитель',
  'chelating agent': 'хелатирующий агент',
  'skin conditioning': 'кондиционирование кожи',
  'skin conditioner': 'кондиционер для кожи',
  'skin protectant': 'защита кожи',
  'hair conditioning': 'кондиционирование волос',
  'viscosity controlling': 'контроль вязкости',
  'ph adjuster': 'регулятор pH',
  'buffering': 'буфер',
  'cleansing': 'очищающий',
  'exfoliant': 'эксфолиант',
  'soothing': 'успокаивающий',
  'antibacterial': 'антибактериальный',
  'antimicrobial': 'антимикробный',
  'irritant': 'раздражитель',
  'allergen': 'аллерген',
  'toxic': 'токсичный',
  'carcinogen': 'канцероген',
  'banned': 'запрещённый',
  'restricted': 'ограниченный',
  'safe': 'безопасный',
  'used in cosmetics': 'используется в косметике',
  'cosmetic ingredient': 'косметический ингредиент',
  'chemical compound': 'химическое соединение',
  'organic compound': 'органическое соединение',
  'synthetic': 'синтетический',
  'natural': 'натуральный',
  'plant extract': 'растительный экстракт',
  'essential oil': 'эфирное масло',
  'fatty acid': 'жирная кислота',
  'amino acid': 'аминокислота',
  'peptide': 'пептид',
  'protein': 'белок',
  'vitamin': 'витамин',
  'mineral': 'минерал',
  'silicone': 'силикон',
  'polymer': 'полимер',
  'wax': 'воск',
  'oil': 'масло',
  'alcohol': 'спирт',
  'acid': 'кислота',
  'ester': 'эфир',
  'clay': 'глина',
};

export function isCyrillic(text: string): boolean {
  return /[а-яА-ЯёЁ]/.test(text);
}

const cyrToLatMap: Record<string, string> = {
  'а': 'a',
  'б': 'b',
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  'ё': 'e',
  'ж': 'zh',
  'з': 'z',
  'и': 'i',
  'й': 'y',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'х': 'kh',
  'ц': 'ts',
  'ч': 'ch',
  'ш': 'sh',
  'щ': 'shch',
  'ъ': '',
  'ы': 'y',
  'ь': '',
  'э': 'e',
  'ю': 'yu',
  'я': 'ya',
};

function transliterate(text: string): string {
  return text.toLowerCase().split('').map(c => cyrToLatMap[c] ?? c).join('');
}

export function translateIngredientToEn(name: string): string {
  const trimmed = name.trim();
  if (!isCyrillic(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase().replace(/ё/g, 'е');
  const direct = ruToEnDict[lower];
  if (direct) {
    console.log('[Translation] RU→EN:', trimmed, '→', direct);
    return direct;
  }

  for (const [ru, en] of Object.entries(ruToEnDict)) {
    const normalizedRu = ru.replace(/ё/g, 'е');
    if (lower === normalizedRu) {
      console.log('[Translation] RU→EN (normalized):', trimmed, '→', en);
      return en;
    }
  }

  for (const [ru, en] of Object.entries(ruToEnDict)) {
    const normalizedRu = ru.replace(/ё/g, 'е');
    if (lower.includes(normalizedRu) || normalizedRu.includes(lower)) {
      console.log('[Translation] RU→EN (partial):', trimmed, '→', en);
      return en;
    }
  }

  const translit = transliterate(lower);
  console.log('[Translation] Transliterated:', trimmed, '→', translit);
  return translit;
}

function containsSignificantEnglish(text: string): boolean {
  const words = text.split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return false;
  const englishWords = words.filter(w => /^[a-zA-Z]+$/.test(w.replace(/[.,;:!?\-()[\]]/g, '')));
  return englishWords.length / words.length > 0.4;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function translateDescriptionToRu(englishText: string, categoryRu?: string): string {
  if (!englishText || englishText.length < 10) {
    return categoryRu ? `${categoryRu} — компонент косметических средств` : 'Компонент косметических средств';
  }

  let result = englishText;
  const sortedTerms = Object.entries(enToRuTerms).sort((a, b) => b[0].length - a[0].length);

  for (const [en, ru] of sortedTerms) {
    const escaped = escapeRegExp(en);
    const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
    result = result.replace(regex, ru);
  }

  const sentences = result.split(/(?<=[.!?])\s+/);
  const translated = sentences.slice(0, 2).join(' ');

  if (containsSignificantEnglish(translated)) {
    if (categoryRu && categoryRu !== 'Компонент') {
      return `${categoryRu} — компонент косметических средств`;
    }
    return 'Косметический компонент';
  }

  if (translated === englishText && categoryRu) {
    return `${categoryRu} — компонент косметических средств`;
  }

  return translated;
}

export function hasRussianIngredients(rawText: string): boolean {
  const parts = rawText.split(/[,;\/\n]+/);
  const cyrillicCount = parts.filter(p => isCyrillic(p.trim())).length;
  return cyrillicCount > parts.length * 0.3;
}

export function translateCompositionToEn(rawText: string): string {
  if (!hasRussianIngredients(rawText)) return rawText;
  console.log('[Translation] Detected Russian composition, translating...');
  const parts = rawText.split(/[,;\/\n]+/).map(p => p.trim()).filter(p => p.length > 0);
  const translated = parts.map(part => {
    if (isCyrillic(part)) {
      return translateIngredientToEn(part);
    }
    return part;
  });
  return translated.join(', ');
}
