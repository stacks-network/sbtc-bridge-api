import mongoose from "mongoose";
import { mongoUrl } from './config';

mongoose.set('strictQuery', true);

try {
	mongoose.connect(mongoUrl!);
	const db = mongoose.connection;
	console.log(`Running db ${db}\n`);	
	// Bind connection to error event (to get notification of connection errors)
	db.on("error", console.error.bind(console, "MongoDB connection error:"));
} catch(err) {
	console.log('unable to connect to mongoose on: ' + mongoUrl);
}

// Get the default connection
// Define a schema
const Schema = mongoose.Schema;
const ReplySchema = new Schema({
	reply_id: 'string',
	body: 'string',
	timestamp: 'string',
	signature: 'string',
	author: 'string'
});
const ThreadSchema = new Schema({
	subject: 'string',
	body: 'string',
	timestamp: { type : Number , required : true },
	author: 'string',
	signature: 'string',
  replies: {
    type: [ReplySchema],
    required: false
  }
});
// Compile model from schema
const ThreadModel = mongoose.model("Thread", ThreadSchema);
const ReplyModel = mongoose.model("Reply", ReplySchema);

export async function findThreadById(thread_id:string) {
  console.log('findThreadById:thread_id:' + thread_id);
}