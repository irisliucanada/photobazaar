const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');

//create payment
router.post('/create-payment-intent', purchaseController.createPaymentIntent);
//check payment status
router.post('/checkPaymentStatus/:id', purchaseController.checkPaymentStatus);

router.post('/', purchaseController.createPurchase);

router.get('/', purchaseController.getAllPurchases);

router.get('/:id', purchaseController.getPurchaseById);
router.get('/payments/:purchase_id', purchaseController.getPaymentStatusById);

//payment
// router.put('/:id', purchaseController.payPurchase);

router.delete('/:id', purchaseController.deletePurchase);

// get all unpaid purchase records by buyerId
// router.get('/unpaid/:buyerId', purchaseController.getUnpaidPurchasesByBuyerId);
router.get('/unpaid/buyer', purchaseController.getUnpaidPurchases);
// router.get('/unpaid/:buyerId', purchaseController.getUnpaidPurchasesByBuyerId);

// check if a artwork is sold
router.get('/checkSold/:artworkId', purchaseController.checkArtworkSold);

// check if buyer has purchased the artwork or added to cart
router.get('/checkPurchased/:artworkId/:buyerId', purchaseController.checkPurchased);

module.exports = router;
