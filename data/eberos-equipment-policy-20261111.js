'use strict';
// Shared deterministic catalog policy. No player state or source archives are overwritten here.
(function(root){
  const revision='equipment-rules-2026-11-11-r1';
  const materialKinds=new Set(['armor','weapon','gear','vehicle','property']);
  const initiative={ '0071':2,'0100':1,'0149':3,'0050':2,'0099':1,'0155':2,'0020':1,'0040':2,'0273':1,'0116':1,'0130':1,'0281':2,'0077':2,'0145':2,'0285':3,'0199':3,'0157':2,'0290':2,'0023':2,'0152':2,'0203':2,'0256':2,'0218':1,'0049':2,'0053':2,'0072':1,'0194':1,'0264':1,'0250':3,'0269':1 };
  const skillChanges={'0065':'Verbergen & Schmuggeln','0164':'Tarnen & Verkleiden','0255':'Tarnen & Verkleiden','0287':'Tarnen & Verkleiden','0291':'Tarnen & Verkleiden'};
  const fire={'0114':1,'0318':1,'0319':1,'0320':1,'0323':2,'0328':1,'0402':1,'0403':2,'0404':2,'0406':1};
  const number=item=>String(item.sourceRecord?.cardNumber||item.catalogId?.slice(-4)||item.id?.slice(-4)||'');
  function physical(item){
    if(item.assetKind)return materialKinds.has(item.assetKind);
    return !['companion','mount','familiar','npc','boon','title','blessing'].includes(item.itemType||item.type) && !item.sourceMseItemV16;
  }
  function classification(item){
    if(!physical(item))return {isMaterial:false,protection:0,baseStructurePoints:0,zones:[],reason:'Lebewesen oder immaterieller Vorteil'};
    const n=String(item.name||'').toLowerCase(),kind=item.assetKind||item.itemType||'gear';
    let p=0,sp=2,zones=[],reason='Gewöhnliche feste Ausrüstung';
    if(kind==='property'){sp=/amboss/.test(n)?30:/hütte|haus/.test(n)?80:/zirkus/.test(n)?100:150;reason='Bauwerk bzw. ortsfeste Einrichtung';}
    else if(kind==='vehicle'){sp=/segler/.test(n)?200:/baloon|ballon/.test(n)?40:30;reason='Fahrzeugstruktur';}
    else if(kind==='weapon'){
      sp=/stab|szepter|zepter|hirtenstab|bogen|fächer|peitsche/.test(n)?2:/sense|axt|hammer|dreizack|morgenstern|kettenschwert/.test(n)?4:3;
      if(/dolch|wurfmesser|jongliermesser/.test(n))sp=2;
      reason='Holz-/leichte Waffe 2; feste Klinge 3; schwere Stangen-/Schlagwaffe 4';
    }else if(/schild|buckler/.test(n)){p=/turmschild|bollwerk/.test(n)?4:3;zones=['Schild'];reason='Schild 3; Turm-/Bollwerkschild 4';}
    else if(/stiefel|schuhe|sabatons|schritte über/.test(n)){p=/gepanzert|sabatons|anker/.test(n)?2:1;zones=['Füße'];reason='Normale Schuhe und Stiefel 1; ausdrücklich gepanzert 2';}
    else if(/beinschienen/.test(n)){p=/schiefer|platten/.test(n)?3:2;zones=['Beine'];reason='Beinschutz 2; massive Schienen 3';}
    else if(/plattenharnisch|plattenpanzer/.test(n)){p=5;zones=['Torso'];reason='Plattenpanzer analog vorhandenem normalen Plattenharnisch 5';}
    else if(/schuppenpanzer|lamellenharnisch|brigantine|rankenpanzer|dornenrüstung/.test(n)){p=3;zones=['Torso'];reason='Schuppen-, Lamellen- bzw. verstärkter Panzer 3';}
    else if(/panzer|rüstung/.test(n)){p=/leder|waldläufer|winter|fliegende/.test(n)?2:4;zones=['Torso'];reason='Leichte Rüstung 2; schwerer Panzer 4';}
    else if(/harnisch|cuirass/.test(n)){p=/gepolstert|kletter|leder|rinden/.test(n)?2:3;zones=['Torso'];reason='Gepolsterter/leichter Harnisch 2; fester Harnisch 3';}
    else if(/armschienen|schulterplatten|basaltschultern/.test(n)){p=/platten|basalt/.test(n)?3:2;zones=[/schulter/.test(n)?'Schultern':'Arme'];reason='Armschienen 2; massive Schulterplatten 3';}
    else if(/helm|blutvisier/.test(n)){p=/helmreif/.test(n)?1:3;zones=['Kopf'];reason='Offener Helmreif 1; geschlossener Helm 3';}
    else if(/handschuhe|stulpen|hände der|finger der/.test(n)){p=/gepanzert|runenschmied|aderstulpen|befehlsstulpen|fesselstulpen/.test(n)?2:/zangengriff|führer|knoten|fallensucher/.test(n)?1:0;zones=['Hände'];sp=1;reason=p?'Arbeitsleder 1; metallverstärkte Stulpen 2':'Stoff-/Schreibhandschuhe: keine Rüstung, Struktur 1';}
    else if(/wams|weste|gepolstert|schulterleder|schmiedeschürze|kampfrobe|verstärkte.*robe/.test(n)){p=/kampfrobe|verstärkte.*robe/.test(n)?2:1;zones=['Torso'];reason='Wams/Polster-/Arbeitskleidung 1; verstärkte Kampfrobe 2';}
    else if(/mantel|umhang|gewand|gewänder|robe|haube|kapuze|hut|kappe|turban|schal|beinkleid|beintracht|waffenrock/.test(n)){
      p=/lederkapuze|fellmantel/.test(n)?1:0;sp=1;zones=[/haube|kapuze|hut|kappe|turban/.test(n)?'Kopf':/beinkleid|beintracht/.test(n)?'Beine':'Torso'];reason=p?'Leder-/Fellschutz 1':'Unverstärkte Textilien: keine Rüstung, Struktur 1';
    }else if(/fiole|sphäre|sphären|glas|linse|tinktur|gift|teleskop|spiegel|prisma/.test(n)){sp=1;reason='Zerbrechliches Glas/Behältnis: Struktur 1';}
    else if(/schrift|bericht|brief|karte|lieder|pegament|palimpsest|meisterbrief|rolle/.test(n)&&!/buch|kodex/.test(n)){sp=1;reason='Papier/Pergament: Struktur 1';}
    else if(/buch|kodex|almanach|grimoire|kanon|atlas|lexikon|kompendium|konpendium|chronik/.test(n)){sp=2;reason='Gebundener Band: Struktur 2';}
    else if(/ring|amulett|schmuck|diadem|kette|waage|kelch|amboss|fessel|reliquiar|siegel|tafel/.test(n)){sp=3;reason='Fester Metall-/Steingegenstand: Struktur 3';}
    else if(/tasche|gürtel|koffer|köcher|netz|flügel/.test(n)){sp=1;reason='Leder/Textil bzw. empfindliches Gewebe: Struktur 1';}
    if(/reiseladen/.test(n)){sp=25;reason='Transportabler Laden: Struktur 25';}
    if(/faltsteg|werkbank/.test(n)){sp=12;reason='Tragende Arbeits-/Brückenstruktur: Struktur 12';}
    if(p)sp=p;
    return {isMaterial:true,protection:p,baseStructurePoints:sp,zones,reason};
  }
  function clean(text){return String(text||'').replace(/[🖐🔮❤🍀🧠🏹🗡🛡👣🍃🎲🫧🖤\uFE0F]/gu,'').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();}
  function counterTags(text){
    // Add a tag only to numerical counter clauses; never to costs/durations or derived Initiative.
    return text.replace(/\(Counter \+ Wert\)/g,'(Counter)').split(/( · |\n)/).map(part=>{
      if(!/(?:Leben|Ausdauer|Mana|Fokus|Glaube|\bHS\b|\bAP\b)/.test(part)||!/\d/.test(part)||/\(Counter\)|Kosten|verbraucht|regener|pro Runde|Stunde|Minute|Besitzer|Begleiter|Bei |wenn |solange |Sechs |Set-/.test(part))return part;
      if(/^(?:\+\s*\d+\s*(?:Leben|Ausdauer|Mana|Fokus|Glaube)|(?:Leben|Ausdauer|Mana|Fokus|Glaube)\s*\+\d+)/.test(part.trim().replace(/^•\s*/,'')))return part.replace(/\s*\(Wert\)/g,'').replace(/\s*\(Counter?\)?\s*$/,'').replace(/\)\s*$/,'')+' (Counter)';
      return part;
    }).join('');
  }
  function normalizeStats(item){
    const code=number(item),s=item.sourceRecord,joined=[...s.primaryStats,...s.secondaryStats].map(clean).join(' · ');
    let text=joined;
    if(initiative[code]){
      text=text.replace(/Initiative\s*\+?\d+(?:\s*\((?:Fähigkeit|Bonus|Würfel|Wert|Grundwert)\)?)?/gi,'').replace(/\+\d+\s*Initiative(?:\s*\((?:Fähigkeit|Bonus|Würfel|Wert|Grundwert)\)?)?/gi,'');
      // Split imported label/value cells, explicitly known by the audited card number.
      text=text.replace(/Initiative\s*·\s*\+?\d+(?:\s*(?:\((?:Bonus|Würfel|Wert|Grundwert)\)?|Würfel))?/gi,'').replace(/Initiative/gi,'');
      // The duplicate Initiative label in 0152 leaves an empty column only.
      text=text.replace(/\s*·\s*·\s*/g,' · ').replace(/^[ ·/]+|[ ·/]+$/g,'');
    }
    const patches={
      '0041':'Fokus +1 · Mana +1 (Counter)',
      '0071':'Schaden: 1x W4 · Schaden +1 (Wert)',
      '0116':'Schaden: 1x W7 +1 · Schaden +2 (Wert)',
      '0077':'Schaden: 1x W6 +1 · Schaden +2 (Wert)',
      '0194':'Schaden: 1x W8 +1 · Schaden +2 (Wert)',
      '0199':'Schaden: 1x W9 +1 · Schaden +2 (Wert)',
      '0238':'Schaden: 1x W10 +2 · Ausdauer +3 · Leben +2 (Counter)',
      '0281':'Schaden: 1x W9 +1',
      '0152':'Schaden: 1x W5 (magisch)',
      '0273':'Schaden: 1x W6 +2 · Reichweite: 12 Felder',
      '0201':'Schaden: 1x W6 +2 · Reichweite: 24 Felder',
      '0260':'Schaden: 1x W6 +2 · Fernkampf – leichte Waffen +2 (Fähigkeit)',
      '0220':'Schaden: 1x W6 +1 · Nahkampf – leichte Waffen +2 (Fähigkeit)',
      '0219':'Schaden: 1x W7 +2 · Nahkampf – leichte Waffen +2 (Fähigkeit)',
      '0095':'Leben +2 · Ausdauer +3 (Counter)',
      '0289':'Leben +2 · Ausdauer +1 (Counter)',
      '0087':'Wildniskunde & Wildnisleben +1 (Fähigkeit)',
      '0131':'Magieresistenz +1 (Widerstand)',
      '0148':'Magieresistenz +2 (Widerstand)',
      '0195':'Magieresistenz +2 (Widerstand)',
      '0296':'Magieresistenz +1 (Widerstand)',
      '0287':'Giftresistenz +2 (Widerstand)',
      '0019':'Magieresistenz +4 (Widerstand)',
      '0235':'Schaden: 1x W8 +1 · Schaden +3 (Wert)',
      '0212':'Verteidigung & Blocken +1 (Fähigkeit)',
      '0088':'Wildniskunde & Wildnisleben +2 (Fähigkeit)',
      '0086':'Wildniskunde & Wildnisleben +4 (Fähigkeit)',
      '0103':'Polymorph-Magie-Proben +2 (Fähigkeit)',
      '0106':'Konstitutionsproben +2 (Probenbonus)',
      '0160':'Gedankenmagie-Widerstand +4 (Widerstand)',
      '0262':'Wissensproben +1 (Probenbonus)',
      '0236':'Schaden: 1x W4 +1 · Nahkampf – leichte Waffen +1 (Fähigkeit)',
      '0227':'Schaden: 1x W6 · Nahkampf – leichte Waffen +1 (Fähigkeit)',
      '0139':'Wakka: Leben 7 (Counter)',
      '0283':'Muhdok: Leben 5 / Ausdauer 6 (Counter) · Bewegung ×5 (Wert)',
    };
    if(Object.hasOwn(patches,code))text=patches[code];
    text=text.replace(/\(Counter\s*·\s*\(Counter\)/g,'(Counter)').replace(/\(Counter(?!\))/g,'(Counter)').replace(/\s*·\s*\(Counter\)/g,' (Counter)').replace(/((?:Magie|Zauber)[- ]Resistenz: \+\d+) \(Würfel\)/g,'$1 (Widerstand)');
    text=counterTags(text);
    if(text==='(Counter)')text='';
    return text;
  }
  function valueText(copper){let n=copper;const gold=Math.floor(n/10000);n%=10000;const silver=Math.floor(n/100);n%=100;return [gold?gold+' Gold':'',silver?silver+' Silber':'',n?n+' Kupfer':''].filter(Boolean).join(' ')||'0 Kupfer';}
  function apply(input){
    if(input.meta.equipmentRulesRevision===revision)return structuredClone(input);
    const catalog=structuredClone(input);
    for(const item of catalog.items){
      const s=item.sourceRecord,code=number(item),old=structuredClone({primaryStats:s.primaryStats,secondaryStats:s.secondaryStats,effectText:s.effectText,rarity:s.rarity,valueCopper:item.valueCopper});
      item.equipmentRulesSource=old;
      const cls=classification(item);Object.assign(item,cls,{equipmentRulesRevision:revision});
      if(cls.isMaterial){item.structurePointsCurrent=cls.baseStructurePoints;item.objectKind=item.assetKind==='vehicle'?'cart':item.assetKind==='property'?'other':/fiole|koffer|tasche/i.test(item.name)?'container':'none';}
      if(cls.protection>0&&item.itemType!=='armor'){item.itemType='armor';item.category='mse.armor';}
      let effect=clean(s.effectText);
      if(skillChanges[code]){
        if(code==='0164')effect='• Tarnen & Verkleiden +2 (Fähigkeit) · Wildniskunde & Wildnisleben +1 (Fähigkeit) · Monsterkunde & Jägerwissen +1 (Fähigkeit)\n• Resistenz gegen Nässe/Regen +1 (Wetterprobe).';
        else effect=effect.replaceAll('Heimlichkeit & Schleichen',skillChanges[code]);
        item.equipmentSkillBonuses=[{name:skillChanges[code],value:2}];
      }
      if(fire[code]){
        effect=effect.split('\n').filter(line=>!/Resistenz gegen (?:Hitze|heiße Oberflächen|Feuer)/.test(line)).filter(Boolean).join('\n');
        const qualifier=code==='0323'?'Begleiter selbst: ':code==='0328'?'Bei sechs Set-Teilen: ':'';
        effect+='\n• '+qualifier+'Feuerresistenz '+fire[code]+' (Schadensminderung).';
        item.equipmentFireResistance={value:fire[code],target:code==='0323'?'self':'holder',requiredSetParts:code==='0328'?6:0};
      }
      if(initiative[code]){
        effect=effect.replace(/Initiative\s*\+\d+(?:\s*\((?:Bonus|Würfel|Fähigkeit|Grundwert|Wert)\))?/gi,'').replace(/\+\d+\s*Initiative(?:\s*\((?:Bonus|Würfel|Fähigkeit|Grundwert|Wert)\))?/gi,'').replace(/•\s*(?=\n|$)/g,'');
        item.initiativeBonus=initiative[code];
      }
      effect=effect.replace(/\+3 Leben\)/g,'Leben +3 (Counter)');
      effect=counterTags(effect);
      const stat=normalizeStats(item);
      const statParts=[...new Set(stat.split(' · ').map(x=>x.trim()).filter(Boolean))];
      // Use the existing two statistic rows; long original values move together into the description.
      let primary=statParts.join(' · '),secondary='';
      if(cls.isMaterial)secondary=(cls.protection?'Rüstung '+cls.protection+' · ':'')+'Struktur '+cls.baseStructurePoints;
      if(initiative[code])secondary+=(secondary?' · ':'')+'Initiative +'+initiative[code]+' (abgeleiteter Wert)';
      if(primary.length>78){effect='• '+primary+'\n'+effect;primary='';}
      s.primaryStats=primary?[primary]:[];s.secondaryStats=secondary?[secondary]:[];
      s.effectText=effect.replace(/\n{2,}/g,'\n').trim();
      item.effect=s.effectText;item.description=[primary,secondary,item.effect].filter(Boolean).join('\n');
      s.rarity='';item.rarity='';item.rarityLabel='';
      item.tags=[...new Set((item.tags||[]).filter(tag=>!['common','uncommon','rare','mythic','mythic rare','special','masterpiece','unspecified','ohne-seltenheit'].includes(tag)))];
      for(const factor of item.valuation?.factors||[]){
        if(skillChanges[code])factor.label=factor.label.replaceAll('Heimlichkeit & Schleichen',skillChanges[code]);
        if(fire[code]&&/Resistenz gegen (?:Hitze|heiße Oberflächen)/.test(factor.label))factor.label=(code==='0328'?'Bei sechs Set-Teilen: ':'')+'Feuerresistenz '+fire[code]+' (Schadensminderung)';
        if(initiative[code]&&/Initiative/.test(factor.label))factor.label=factor.label.replace(/\((?:Bonus|Würfel|Fähigkeit|Grundwert|Wert)\)/g,'(abgeleiteter Wert)');
      }
      // A modest durability component. Existing magic/category prices remain the base, no rarity premium.
      if(cls.isMaterial&&item.tradeStatus==='market'&&item.valueCopper>0){
        const base=item.valueCopper,rate=Math.min(.10,Math.max(0,cls.baseStructurePoints-1)*.02),surcharge=Math.min(Math.floor(base*.10),Math.round(base*rate/100)*100);
        item.valuation.stability={model:'structure-small-uplift-v1',baseValueCopper:base,points:cls.baseStructurePoints,rate,surchargeCopper:surcharge,capPercent:10};
        item.valueCopper=base+surcharge;item.valueText=valueText(item.valueCopper);item.valuation.valueCopper=item.valueCopper;
        item.balance.stabilityRevision=revision;
      }
      item.editorialCorrections.push({field:'equipmentRules',sourceValue:'equipmentRulesSource',value:revision,reason:'Regelaudit 11.11.2026: materielle Struktur, Rüstung=Struktur, konsistente Werte, semantische Fähigkeiten, Feuer statt Wetter; Original einmalig in equipmentRulesSource erhalten.'});
    }
    catalog.meta.equipmentRulesRevision=revision;
    catalog.meta.rarityPolicy='Aktives Feld leer; historische Angabe ausschließlich in equipmentRulesSource.';
    catalog.meta.structurePolicy='Alle materiellen Gegenstände besitzen Strukturpunkte. Schutzgebende Teile: Rüstungspunkte = maximale Strukturpunkte; verbleibende Struktur begrenzt die aktuelle Rüstung. Lebewesen behalten Leben, immaterielle Segen und Titel keinen Strukturwert.';
    return catalog;
  }
  const api={revision,physical,classification,initiative,skillChanges,fire,apply,number};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.EberosEquipmentPolicy=Object.freeze(api);
})(typeof window==='undefined'?globalThis:window);
