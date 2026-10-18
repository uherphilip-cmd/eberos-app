'use strict';

/* Eberos v1.8.4 · Phase 15: bewusster Kampagnenstart. */
(function installCampaignStartRelease(global){
  const VERSION='1.8.4',REVISION='phase15';
  const seasons=['Frühling','Sommer','Herbst','Winter'];
  function absoluteDay(year,season,seasonDay){const index=seasons.indexOf(season),y=Number(year),d=Number(seasonDay);return Number.isInteger(y)&&y>=1&&index>=0&&Number.isInteger(d)&&d>=1&&d<=90?(y-1)*360+index*90+d:null}
  function summary(year,season,seasonDay){const day=absoluteDay(year,season,seasonDay);return day===null?'Bitte Jahr, Jahreszeit und einen Tag von 1 bis 90 vollständig angeben.':`Start: Jahr ${year} · ${season}, Tag ${seasonDay} · Welttag ${day}`}
  global.EberosCampaignStart=Object.freeze({version:VERSION,revision:REVISION,seasons,absoluteDay,summary});
  if(global.Eberos)Object.assign(global.Eberos,{version:VERSION,revision:REVISION,campaignStartVersion:VERSION});
})(globalThis);
