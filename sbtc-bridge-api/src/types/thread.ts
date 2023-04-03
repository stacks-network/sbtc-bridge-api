export type Thread = {
	thread_id?: number,
	subject: string,
	body: string,
	timestamp: number,
	author: Uint8Array | string,
	signature?: Uint8Array | string
};
