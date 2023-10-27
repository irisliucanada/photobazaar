//db.js
const { MongoClient } = require('mongodb');

require('dotenv').config();

const dbURI = process.env.MONGODB_URI;


const client = new MongoClient(dbURI);

const connect=async ()=> {
  try {
      await client.connect();
    

  } catch (error) {
    console.error('Database operation error:', error);
  }
}
const db = client.db("PhotoBazaar")
module.exports= db;

