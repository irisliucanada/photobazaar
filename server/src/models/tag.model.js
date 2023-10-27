const { ObjectId } = require('mongodb');
const db = require('./db');

class TagModel {
  constructor() {
    this.collection = db.collection('tags');
  }

  async createTag(tag, count = 0) {
    const tagData = {
      tag: tag,
      count: count,
    };
    const result = await this.collection.insertOne(tagData);
    return result.insertedId;
  }

  async getAllTags() {
    const tags = await this.collection.find({}).toArray();
    return tags;
  }

  async getTagById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async updateTag(id, updatedData) {
    const filter = { _id: new ObjectId(id) };
    const result = await this.collection.updateOne(filter, { $set: updatedData });
    return result.modifiedCount;
  }

  async deleteTag(id) {
    const filter = { _id: new ObjectId(id) };
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount;
  }

  // increaseTagCount(id) {
  async increaseTagCount(id) {
    const filter = { _id: new ObjectId(id) };
    const tag = await this.collection.findOne(filter);
    const newCount = tag.count + 1;
    const result = await this.collection.updateOne(filter, { $set: { count: newCount } });
    return result.modifiedCount;
  }

  // decreaseTagCount(id) {
  async decreaseTagCount(id) {
    const filter = { _id: new ObjectId(id) };
    const tag = await this.collection.findOne(filter);
    const newCount = tag.count - 1;
    const result = await this.collection.updateOne(filter, { $set: { count: newCount } });
    return result.modifiedCount;
  }
}

module.exports = new TagModel();
