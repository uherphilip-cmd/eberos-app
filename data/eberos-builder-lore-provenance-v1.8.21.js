'use strict';

/* Eberos v1.8.21 · versionierte und quellgebundene Spieler-Lore. */
(function attachBuilderLoreProvenanceV1821(global){
  const catalog=global.EBEROS_SKILL_LORE_V1821;
  if(!catalog||catalog.meta?.version!=='1.8.21'||catalog.meta?.schema!==2||!Array.isArray(catalog.documents)||catalog.documents.length!==10){
    throw new Error('Versionierte Builder-Lore v1.8.21 fehlt oder ist ungültig.');
  }

  const SHA256_V1821=/^[A-F0-9]{64}$/;
  const shortHashV1821=value=>String(value||'').slice(0,12);
  const shortRevisionV1821=value=>String(value||'').split('.rev.').at(-1)||'—';

  function publicationStatusV1821(document,current={}){
    const provenance=document?.provenance;
    if(!provenance
      ||provenance.audience!=='players'
      ||provenance.targetProduct!=='builder'
      ||provenance.publicationStatus!=='approved'
      ||!Number.isInteger(provenance.publicationRevision)
      ||provenance.publicationRevision<1
      ||!SHA256_V1821.test(provenance.sourceSha256||'')
      ||!SHA256_V1821.test(provenance.snapshotSha256||'')){
      return{key:'invalid',label:'Publikationsnachweis ungültig'};
    }
    const registry=current.sourceRegistrySha256??catalog.meta.sourceRegistrySha256;
    const sourceRevision=current.sourceRevisionId??provenance.sourceRevisionId;
    const sourceHash=current.sourceSha256??provenance.sourceSha256;
    if(registry!==provenance.sourceRegistrySha256
      ||sourceRevision!==provenance.sourceRevisionId
      ||sourceHash!==provenance.sourceSha256){
      return{key:'stale',label:'Quellenstand abweichend'};
    }
    return{key:'current',label:'Quellenstand geprüft'};
  }

  function provenanceLineV1821(document){
    const provenance=document.provenance,status=publicationStatusV1821(document);
    const line=el('p',{
      class:`builder-lore-provenance-v1821 builder-lore-provenance-${status.key}-v1821`,
      title:`Lore-ID: ${provenance.loreId}\nQuellrevision: ${provenance.sourceRevisionId}\nQuellhash: ${provenance.sourceSha256}\nPublikation: ${provenance.publicationId} · Revision ${provenance.publicationRevision}\nSnapshot: ${provenance.snapshotSha256}`,
      text:`Quelle ${shortRevisionV1821(provenance.sourceRevisionId)} · Publikation ${provenance.publicationRevision} · Snapshot ${shortHashV1821(provenance.snapshotSha256)} · ${status.label}`,
    });
    line.dataset.loreId=provenance.loreId;
    line.dataset.sourceRevisionId=provenance.sourceRevisionId;
    line.dataset.publicationId=provenance.publicationId;
    line.dataset.publicationRevision=String(provenance.publicationRevision);
    line.dataset.snapshotSha256=provenance.snapshotSha256;
    line.dataset.publicationStatus=status.key;
    return line;
  }

  const skillLoreContentBeforeV1821=skillLoreContentV1724;
  skillLoreContentV1724=function skillLoreContentV1821(skill,owner){
    const box=skillLoreContentBeforeV1821(skill,owner);if(!box)return box;
    const document=SKILL_LORE_BY_NAME_V1724.get(skill.name);if(!document||box.querySelector('.builder-lore-provenance-v1821'))return box;
    const meta=box.querySelector('.skill-lore-meta-v1724'),source=box.querySelector('.rule-source-r5');
    const line=provenanceLineV1821(document);
    if(meta)meta.insertAdjacentElement('afterend',line);else if(source)source.insertAdjacentElement('afterend',line);else box.append(line);
    return box;
  };

  const style=el('style',{text:`
.builder-lore-provenance-v1821{margin:.28rem 0 0;padding:.35rem .5rem;border-left:3px solid var(--accent-2);border-radius:0 6px 6px 0;background:color-mix(in srgb,var(--accent-2) 9%,transparent);color:var(--muted);font-size:.75rem;line-height:1.35;overflow-wrap:anywhere}
.builder-lore-provenance-current-v1821::before{content:'✓ ';color:var(--success,#208447);font-weight:800}.builder-lore-provenance-stale-v1821,.builder-lore-provenance-invalid-v1821{border-color:var(--danger,#b3261e);color:var(--danger,#b3261e);font-weight:700}
@media print{.builder-lore-provenance-v1821{display:block!important;border:0;padding:.2rem 0;background:none;color:#333;font-size:8.5pt}}
`});
  global.document?.head?.append(style);

  Object.assign(global.Eberos,{
    skillLoreVersion:'1.8.21',
    skillLore:()=>catalog,
    skillLoreContent:(skill,owner)=>skillLoreContentV1724(skill,owner),
  });
  global.EberosBuilderLoreV1821=Object.freeze({
    version:'1.8.21',
    catalog:()=>catalog,
    publicationStatus:publicationStatusV1821,
    provenanceLine:provenanceLineV1821,
  });
})(globalThis);
