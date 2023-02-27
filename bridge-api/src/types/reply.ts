export type Reply = {
	reply_id?: number,
	thread_id: number,
	body: string,
	timestamp: number,
	signature?: Uint8Array | string,
	author: Uint8Array | string
};
