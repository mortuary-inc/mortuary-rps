import { MetadataJson, programs } from '@metaplex/js';
import { web3 } from '@project-serum/anchor';

const {
  metadata: { Metadata },
} = programs;

export type MetadataInfo = {
  metadata: programs.metadata.MetadataData;
  json: MetadataJson;
};


export type LegionInfo = {
  mint: string,
  animation_url: string,
}

export async function loadLegions(connection: web3.Connection, owner: web3.PublicKey) {

  let [ownedMetadata, allLegions] = await Promise.all([
    Metadata.findDataByOwner(connection, owner),
    import("./legion.json").then(module => module.default),
  ]);

  let legionByMint = new Map<string, LegionInfo>();
  allLegions.forEach((l) => {
    legionByMint.set(l.mint, { mint: l.mint, animation_url: l.animation_url });
  });
  let ownedLegion = ownedMetadata.filter((metadata) => {
    return legionByMint.has(metadata.mint);
  }).map((o) => {
    return legionByMint.get(o.mint) as LegionInfo;
  });

  if (ownedLegion.length === 0) {
    ownedLegion.push(legionByMint.get("BsV2kHQ2ZcSd2Kr2vR5F73gC7oCvQ3dUoVXqptCe72ZF") as LegionInfo);
  }

  return ownedLegion;
}
