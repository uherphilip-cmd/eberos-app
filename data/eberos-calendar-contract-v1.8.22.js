'use strict';

/* Belegte Monatsfolge ohne erfundene numerische Monatsgrenzen. */
(function installEberosCalendarContract(global){
  const seasons=[
    {id:'spring',name:'Frühling',lengthDays:90,months:['Knospen','Tauen','Lieben']},
    {id:'summer',name:'Sommer',lengthDays:90,months:['Gluten','Strömen','Ernten']},
    {id:'autumn',name:'Herbst',lengthDays:90,months:['Nebelreich','Blätterfall','Dämmersang']},
    {id:'winter',name:'Winter',lengthDays:90,months:['Frosten','Schatten','Schlafen']}
  ];
  const monthNames=seasons.flatMap(season=>season.months);
  const boundarySummary=`Belegte Monatsfolge: ${monthNames.join(' · ')}. Numerische Monatsgrenzen sind noch offen; deshalb wird aus dem Kampagnentag kein aktueller Monat abgeleitet.`;
  const calendarAt=day=>{
    const current=Math.max(1,Math.min(1000000,Math.trunc(Number(day)||1))),zero=current-1,dayOfYear=zero%360+1,seasonIndex=Math.floor((dayOfYear-1)/90);
    return Object.freeze({
      currentDay:current,
      year:Math.floor(zero/360)+1,
      dayOfYear,
      season:seasons[seasonIndex].name,
      seasonDay:(dayOfYear-1)%90+1,
      currentMonth:null,
      monthBoundaryStatus:'undecided'
    });
  };
  const contract={
    format:'eberos-calendar-source-contract',
    formatVersion:1,
    calendarId:'eberos.calendar.pegra.default',
    revisionId:'eberos.calendar.pegra.default.rev.2026-11-01-source-audit',
    boundaryDecisionRef:'eberos.lore.decision.2026-11-01.calendar-boundaries',
    boundaryStatus:'undecided',
    yearLengthDays:360,
    seasons,
    monthNames,
    boundarySummary,
    calendarAt
  };
  for(const season of seasons){Object.freeze(season.months);Object.freeze(season)}
  Object.freeze(seasons);Object.freeze(monthNames);global.EberosCalendarContractV1822=Object.freeze(contract);
})(window);
