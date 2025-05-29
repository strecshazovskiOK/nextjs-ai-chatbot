import { MongoClient } from 'mongodb';
import { StockItem } from '@/lib/db/queries';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

const mongoUri: string = uri;
console.log('Using MongoDB URI:', mongoUri.replace(/\/\/[^@]+@/, '//*****@')); // Hide credentials in logs

const client = new MongoClient(mongoUri);

const sampleItems: StockItem[] = [
  {
    code: 'FISH-001',
    name: 'Atlantic Salmon Fillet',
    description: 'Fresh Atlantic salmon fillet, skin-on, premium quality',
    category: 'Seafood',
    unit: 'kg',
    price: 25.99,
    keywords: ['salmon', 'fish', 'seafood', 'fillet', 'atlantic']
  },
  {
    code: 'FISH-002',
    name: 'Sea Bass Whole',
    description: 'Fresh Mediterranean sea bass, scaled and gutted',
    category: 'Seafood',
    unit: 'kg',
    price: 28.50,
    keywords: ['sea bass', 'fish', 'seafood', 'whole fish', 'mediterranean']
  },
  {
    code: 'MEAT-001',
    name: 'Prime Ribeye Steak',
    description: 'USDA Prime grade ribeye steak, well-marbled',
    category: 'Meat',
    unit: 'kg',
    price: 45.99,
    keywords: ['beef', 'steak', 'ribeye', 'prime', 'meat']
  },
  {
    code: 'VEG-001',
    name: 'Organic Baby Spinach',
    description: 'Fresh organic baby spinach leaves',
    category: 'Vegetables',
    unit: 'kg',
    price: 12.99,
    keywords: ['spinach', 'organic', 'vegetables', 'greens', 'salad']
  },
  {
    code: 'WINE-001',
    name: 'Château Margaux 2015',
    description: 'Premium French red wine, Bordeaux region',
    category: 'Beverages',
    unit: 'bottle',
    price: 899.99,
    keywords: ['wine', 'red wine', 'french', 'bordeaux', 'premium']
  },
  {
    code: 'WINE-002',
    name: 'Dom Pérignon 2012',
    description: 'Vintage champagne from the prestigious house',
    category: 'Beverages',
    unit: 'bottle',
    price: 299.99,
    keywords: ['champagne', 'wine', 'french', 'sparkling', 'premium']
  },
  {
    code: 'SPICE-001',
    name: 'Saffron Threads',
    description: 'Premium Spanish saffron threads',
    category: 'Spices',
    unit: 'gram',
    price: 8.99,
    keywords: ['saffron', 'spice', 'spanish', 'premium', 'seasoning']
  },
  {
    code: 'DAIRY-001',
    name: 'French Butter',
    description: 'Premium French butter, unsalted',
    category: 'Dairy',
    unit: 'kg',
    price: 15.99,
    keywords: ['butter', 'french', 'dairy', 'unsalted']
  },
  {
    code: 'FISH-003',
    name: 'Yellowfin Tuna Steak',
    description: 'Sushi-grade yellowfin tuna steak',
    category: 'Seafood',
    unit: 'kg',
    price: 39.99,
    keywords: ['tuna', 'fish', 'seafood', 'sushi', 'steak']
  },
  {
    code: 'MEAT-002',
    name: 'Lamb Rack',
    description: 'New Zealand lamb rack, frenched',
    category: 'Meat',
    unit: 'kg',
    price: 34.99,
    keywords: ['lamb', 'meat', 'rack', 'new zealand']
  }
];

async function seedDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB');

    const db = client.db('stock_info');
    console.log('Using database: stock_info');
    
    const collection = db.collection('item_details');
    console.log('Using collection: item_details');

    // Clear existing data
    console.log('Clearing existing data...');
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing items`);

    // Insert sample items
    console.log('Inserting new items...');
    const result = await collection.insertMany(sampleItems);
    console.log(`Successfully inserted ${result.insertedCount} items`);

  } catch (error) {
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    console.log('Closing MongoDB connection...');
    await client.close();
    console.log('Connection closed');
  }
}

seedDatabase(); 