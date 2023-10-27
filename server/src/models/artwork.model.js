const { ObjectId } = require("mongodb");
const { mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const artworkSchema = new Schema(
    {
        author_id: {
            type: String,
            required: true,
        },
        cover_url: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        photos: [
            {
                photo_name: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
                upload_time: {
                    type: Date,
                    required: true,
                },
                modify_time: {
                    type: Date,
                    required: true,
                },
                file_url: {
                    type: String,
                    required: true,
                },
            },
        ],
        price: {
            type: Number,
            required: true,
        },
        tags: [
            {
                tag_id: {
                    type: String,
                    required: true,
                },
            },
        ],
        title: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
    { versionKey: false } // exclude __v field

);

const Artwork = mongoose.model("Artwork", artworkSchema);
module.exports = Artwork;