const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artwork.controller.js');

// Retrieve all artworks
router.get("/", artworkController.getAllArtworks);

// Create a new artwork
router.post("/", artworkController.createArtwork);

// Retrieve a single artwork with artwork_id
router.get("/:id([0-9a-fA-F]{24})", artworkController.findArtworkById);

// Retrieve a single artwork with author_id
router.get("/author/:id([0-9a-fA-F]{24})", artworkController.findArtworkByAuthorId);

// Delete a artwork with artwork_id
router.delete("/:id([0-9a-fA-F]{24})", artworkController.deleteArtworkById);

// Update a artwork with artwork_id
router.patch("/:id", artworkController.updateArtworkById);

// Update a artwork with artwork_id
router.patch("/mainInfo/:id", artworkController.updateArtworkMainInfoById);

// update a photo with photo_id in one artwork
router.patch("/:artworkId/editPhoto/:photoId", artworkController.updatePhotoById);

// delete a photo with photo_id in one artwork
router.delete("/:artworkId/deletePhoto/:photoId", artworkController.deletePhotoById);

// add a photo in one artwork.photos
router.post("/:artworkId/addPhoto", artworkController.addPhoto);


module.exports = router;
