
export type NFTHoldings = {
  total:number;
  limit:number;
  offset:number;
  results: Array<NFTHolding>
}

export type NFTHolding = {
	id:string;
  asset_identifier:string;
  tx_id:string;
  token_uri:string;
  block_height:number;
  semiFungible:boolean;
  metaData:Sip16NFTMetaData;
  token: {owner:string, id:number}|{id:number};
}

export type Sip16NFTMetaData = {
	id:string;
  version:string;
  name:string;
  description:string;
  image:string;
  attributes:Array<Sip016Trait>;
  properties:Array<Sip016Properties>;
  localization:Array<Sip016Localisation>;
}

export type Sip016Trait = {
	display_type:string;
	trait_type:string;
	value:{ hex: string, repr: string };
}

export type Sip016Properties = {
	collection:string;
	collectionId:string;
	dna:string;
	aspect_ratio:string;
	total_supply:string;
	full_size_image:string;
	external_url:string;
	animation_url:string;
	animation_cdn_url:string;
	assetHash:string;
}

export type Sip016Localisation = {
	uri:string;
	locales:Array<string>;
}