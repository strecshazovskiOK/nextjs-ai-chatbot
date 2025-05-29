import clientPromise from './mongoClient';

export interface StockItem {
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  keywords: string[];
}

export async function getRelevantItems(userMessage: string) {
  console.log('\n=== Searching for items ===');
  console.log('Search term:', userMessage);
  
  const client = await clientPromise;
  const db = client.db('stock_info');
  const collection = db.collection('item_details');

  // Create a text search query that looks for matches in name, description, and keywords
  const searchQuery = {
    $or: [
      { name: { $regex: userMessage, $options: 'i' } },
      { description: { $regex: userMessage, $options: 'i' } },
      { keywords: { $regex: userMessage, $options: 'i' } },
      { category: { $regex: userMessage, $options: 'i' } }
    ]
  };

  const results = await collection.find(searchQuery).toArray();
  
  console.log('\n=== Search Results ===');
  console.log('Found', results.length, 'items:');
  results.forEach(item => {
    console.log(`- ${item.code}: ${item.name} (${item.category})`);
  });
  console.log('=====================\n');

  return results;
}

export async function getAllItems() {
  const client = await clientPromise;
  const db = client.db('stock_info');
  const collection = db.collection('item_details');
  
  return await collection.find({}).toArray();
}

export async function getItemByCode(code: string) {
  const client = await clientPromise;
  const db = client.db('stock_info');
  const collection = db.collection('item_details');
  
  return await collection.findOne({ code });
}

export async function addItem(item: StockItem) {
  const client = await clientPromise;
  const db = client.db('stock_info');
  const collection = db.collection('item_details');
  
  return await collection.insertOne(item);
}

export async function updateItem(code: string, updates: Partial<StockItem>) {
  const client = await clientPromise;
  const db = client.db('stock_info');
  const collection = db.collection('item_details');
  
  return await collection.updateOne(
    { code },
    { $set: updates }
  );
}

export async function deleteItem(code: string) {
  const client = await clientPromise;
  const db = client.db('stock_info');
  const collection = db.collection('item_details');
  
  return await collection.deleteOne({ code });
}
