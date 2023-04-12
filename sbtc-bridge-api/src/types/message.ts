export type Message = {
	_id?: string,
	reply_id?: string,
	subject: string,
	body: string,
	timestamp: number,
	author: Uint8Array | string,
	signature?: Uint8Array | string
};
