const Artwork = require('../models/artwork.model');

module.exports = {
    getAllArtworks: async (req, res) => {
        await Artwork.find()
            .sort({ _id: 1 })
            .then((result) => {
                // console.log(result);
                res.send(result).status(200);
            })
            .catch((err) => {
                // console.log(err);
                res.status(400).json({
                    message: "error from artwork controller",
                    err
                });
            });
    },
    createArtwork: async (req, res) => {
        const { _id, author_id, cover_url, description, photos, price, tags, title } = req.body;
        console.log(req.body);
        const newArtwork = new Artwork({
            _id,
            author_id,
            cover_url,
            description,
            photos: photos.map(photo => {
                return {
                    photo_name: photo.photo_name,
                    description: photo.description,
                    upload_time: new Date(photo.upload_time),
                    modify_time: new Date(photo.modify_time),

                    file_url: photo.file_url,
                };
            }),
            price,
            tags: tags.map(tag => ({ tag_id: tag.tag_id })),
            title,
        });

        newArtwork.save()
            .then((result) => {
                // console.log(result);
                res.send(result).status(200);
            })
            .catch((err) => {
                // console.log(err);
                res.status(400).json({
                    message: "error from artwork controller",
                    err
                });
            });
    },
    findArtworkById: async (req, res) => {
        const artwork_id = req.params.id;
        Artwork.findOne({ _id: artwork_id })
            .then((result) => {
                if (result) {
                    res.send(result).status(200);
                } else {
                    res.status(404).send({ message: "error from artwork controller: No such product found" });
                }
            })
            .catch((err) => {
                res.status(400).json({
                    message: "error from artwork controller",
                    err
                });
            });
    },
    findArtworkByAuthorId: async (req, res) => {
        const author_id = req.params.id;
        Artwork.find({ author_id: author_id })
            .then((result) => {
                if (result) {
                    res.send(result).status(200);
                } else {
                    res.status(404).send({ message: "error from artwork controller: No such product found" });
                }
            })
            .catch((err) => {
                res.status(400).json({
                    message: "error from artwork controller",
                    err
                });
            });
    },
    // FIXME, if artwork is sold, can't delete by user
    deleteArtworkById: async (req, res) => {
        const artwork_id = req.params.id;
        await Artwork.findOneAndDelete({ _id: artwork_id })
            .then((result) => {
                if (result) {
                    res.status(200).send({ message: "Artwork deleted successfully" });
                } else {
                    res.status(404).send({ message: "No artwork found to delete" });
                }
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    },
    updateArtworkById: async (req, res) => {
        const artwork_id = req.params.id;
        console.log(artwork_id);
        const { _id, author_id, cover_url, description, photos, price, tags, title } = req.body;

        const update = {
            _id,
            author_id,
            cover_url,
            description,
            photos: photos.map(photo => ({
                photo_name: photo.photo_name,
                description: photo.description,
                upload_time: new Date(photo.upload_time),
                modify_time: new Date(photo.modify_time),
                file_url: photo.file_url,
            })),
            price,
            tags: tags.map(tag => ({ tag_id: tag.tag_id })),
            title,
        };

        Artwork.findOneAndUpdate({ _id: artwork_id }, update, { new: true })
            .then((result) => {
                if (result) {
                    res.status(200).send({ message: "Artwork updated successfully" });
                } else {
                    res.status(404).json({ message: 'Artwork not found' });
                }
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    },
    updateArtworkMainInfoById: async (req, res) => {
        const artwork_id = req.params.id;
        const { cover_url, description, price, title } = req.body;

        Artwork.findOne({ _id: artwork_id })
            .then((result) => {
                if (result) {
                    result.cover_url = cover_url;
                    result.description = description;
                    result.price = price;
                    result.title = title;

                    result.save()
                        .then((result) => {
                            res.status(200).send({ message: "Artwork updated successfully" });
                        })
                        .catch((err) => {
                            res.status(400).json(err);
                        });
                } else {
                    res.status(404).json({ message: 'Artwork not found' });
                }

            })
            .catch((err) => {
                res.status(400).json(err);
            });
    },
    updatePhotoById: async (req, res) => {
        try {
            const artwork_id = req.params.artworkId;
            const photo_id = req.params.photoId;
            console.log(artwork_id, photo_id);
            const { photo_name, description, upload_time, modify_time, file_url } = req.body;

            const artwork = await Artwork.findOne({ _id: artwork_id });

            if (!artwork) {
                return res.status(404).json({ message: 'Artwork not found' });
            }

            // Find the index of the photo within the `photos` array
            const photoIndex = artwork.photos.findIndex(photo => photo._id.toString() === photo_id);

            if (photoIndex === -1) {
                return res.status(404).json({ message: 'Photo not found' });
            }
            // Update the photo properties
            artwork.photos[photoIndex].photo_name = photo_name;
            artwork.photos[photoIndex].description = description;
            artwork.photos[photoIndex].upload_time = upload_time;
            artwork.photos[photoIndex].modify_time = modify_time;
            artwork.photos[photoIndex].file_url = file_url;

            const result = await artwork.save();

            console.log("Photo After Update:", result);
            res.status(200).send({ message: "Photo updated successfully" });
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: "Failed to update the photo" });
        }
    },
    deletePhotoById: async (req, res) => {
        try {
            const artwork_id = req.params.artworkId;
            const photo_id = req.params.photoId;
            console.log(artwork_id, photo_id);

            const artwork = await Artwork.findOne({ _id: artwork_id });
            if (!artwork) {
                return res.status(404).json({ message: 'Artwork not found' });
            }

            // Find the index of the photo within the `photos` array
            const photoIndex = artwork.photos.findIndex(photo => photo._id.toString() === photo_id);

            if (photoIndex === -1) {
                return res.status(404).json({ message: 'Photo not found' });
            }
            // Delete the photo
            artwork.photos.splice(photoIndex, 1);
            await artwork.save();
            res.status(200).send({ message: "Photo delete successfully" });
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: "Failed to update the photo" });
        }
    },
    addPhoto: async (req, res) => {
        try {
            const artwork_id = req.params.artworkId;
            const { photo_name, description, upload_time, modify_time, file_url } = req.body;

            const artwork = await Artwork.findOne({ _id: artwork_id });
            if (!artwork) {
                return res.status(404).json({ message: 'Artwork not found' });
            }

            // Add the new photo
            artwork.photos.push({
                photo_name,
                description,
                upload_time,
                modify_time,
                file_url,
            });

            const result = await artwork.save();

            console.log("Photo After Add:", result);
            res.status(200).send({ message: "Photo added successfully" });
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: "Failed to add the photo" });
        }
    }

};
