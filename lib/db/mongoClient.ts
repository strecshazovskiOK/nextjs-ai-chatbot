import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

// Enable MongoDB command monitoring
const client = new MongoClient(uri, {
  monitorCommands: true
});

// Add command monitoring
client.on('commandStarted', (event) => {
  console.log('\n=== MongoDB Query Started ===');
  console.log('Command:', JSON.stringify(event.command, null, 2));
  console.log('Database:', event.databaseName);
  console.log('Request ID:', event.requestId);
});

client.on('commandSucceeded', (event) => {
  console.log('\n=== MongoDB Query Succeeded ===');
  console.log('Command:', event.commandName);
  console.log('Duration:', event.duration, 'ms');
  console.log('Reply:', JSON.stringify(event.reply, null, 2));
  console.log('========================\n');
});

client.on('commandFailed', (event) => {
  console.error('\n=== MongoDB Query Failed ===');
  console.error('Command:', event.commandName);
  console.error('Duration:', event.duration, 'ms');
  console.error('Error:', event.failure);
  console.error('========================\n');
});

const clientPromise = client.connect();

export default clientPromise;
