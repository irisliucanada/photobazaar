//create database
const { MongoClient } = require('mongodb');

require('dotenv').config();

const dbURI = process.env.MONGODB_URI;

const client = new MongoClient(dbURI);

const insertExampleData = async () => {
  const db = client.db("PhotoBazaar")
  //users
  let document = {
    username: "user123",
    password: "hashed_password",
    email: "user123@email.com",
    role: "user",
    avatar: "http://www.example.com/user123_avatar.jpg",
    my_assets: [
      {
        artwork_id: "artwork1_id"
      },
      {
        artwork_id: "artwork2_id"
      }
    ],
    nickname: "John Doe"
  }
  await db.createCollection("users")
  let collection = db.collection("users")
  collection.insertOne(document)
  collection.createIndex({ username: 1 }, { unique: true });
  collection.createIndex({ email: 1 }, { unique: true })
  //tags
  document = {
    "tag": "Food",
    "count": 0
  }
  await db.createCollection("tags")
  collection = db.collection("tags")
  collection.insertOne(document)
  collection.createIndex({ tag: 1 }, { unique: true })
  //artworks
  document = {
    title: "Beautiful Landscape",
    tags: [
      {
        tag_id: "tag1_id"
      },
      {
        tag_id: "tag2_id"
      }
    ],
    description: "A stunning landscape painting.",
    cover_url: "http://example.com/artwork_1_cover.jpg",
    author_id: "user1_id",
    price: 199.99,
    upload_time: "2023-10-04T12:00:00Z",
    modify_time: "2023-10-04T12:00:00Z",
    photos: [
      {
        photo_name: "a beautiful photo",
        description: "this is a beautiful photo",
        upload_time: "2023-10-04T12:00:00Z",
        modify_time: "2023-10-04T12:00:00Z",
        file_url: "https://your-s3-bucket-name.s3.amazonaws.com/artwork/file1.jpg"
      },
      {
        photo_name: "a beautiful photo",
        description: "this is another beautiful photo",
        upload_time: "2023-10-04T12:00:00Z",
        modify_time: "2023-10-04T12:00:00Z",
        file_url: "https://your-s3-bucket-name.s3.amazonaws.com/artwork/file2.jpg"
      }
    ]
  }
  await db.createCollection("artworks")
  collection = db.collection("artworks")
  collection.insertOne(document)
  //purchases
  document = {
    seller_id: "user1_id",
    buyer_id: "user2_id",
    artwork_id: "artwork1_id",
    purchase_time: "2023-10-04T15:30:00Z",
    is_paid: true,
    pay_time: "2023-10-04T15:30:00Z",
    transaction_price: "199.99",
    transaction_ref: []
  }
  await db.createCollection("purchases")
  collection = db.collection("purchases")
  collection.insertOne(document)
  //messages
  document = {
    sender_id: "user1_id",
    receiver_id: "user2_id",
    send_time: "2023-10-04T15:30:00Z",
    is_read: false,
    message: "Helllo!"
  }
  await db.createCollection("messages")
  collection = db.collection("messages")
  collection.insertOne(document)

  console.log("database initialed")
}

const initDB = async () => {
  try {
    await client.connect()
    await client.db("PhotoBazaar").dropDatabase()
    await insertExampleData()
    process.exit()
  } catch (err) {
    console.error(err)
  }
  
}
initDB()