const catchAsyncError = require("../middlewares/catchAsyncErrors");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");

const BATCH_SIZE = 100; // Number of products to process at once

const {
  content,
  retryWithExponentialBackoff,
  sleep,
} = require("../utils/oAuthClient");

const getGoogleMerchantProducts = catchAsyncError(async (req, res) => {
  try {
    const response = await content.products.list({
      merchantId: process.env.GOOGLE_MERCHANT_ID,
    });

    res.status(200).json({
      status: "success",
      data: response.data,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
});

const syncProductWithGoogle = async (product) => {
  const resource = {
    title: product.productName,
    description: product.description,
    link: `https://skytire.com/product-details/${product._id}`,
    image_link: product.images[0],
    price: {
      value: product.regularPrice.toString(),
      currency: "USD",
    },
    brand: product.brand ? product.brand.name : "Unknown",
    mpn: product.sku,
    condition: "new",
    availability: product.stock > 0 ? "in stock" : "out of stock",
    sale_price: {
      value: product.salePrice.toString(),
      currency: "USD",
    },
  };

  try {
    const productId = `online:en:US:${product._id}`;

    await retryWithExponentialBackoff(async () => {
      try {
        // Check if the product exists
        const existingProduct = await content.products.get({
          merchantId: process.env.GOOGLE_MERCHANT_ID,
          productId,
        });

        if (existingProduct) {
          await content.products.update({
            merchantId: process.env.GOOGLE_MERCHANT_ID,
            productId,
            resource: resource, // `offerId` and `targetCountry` should not be here for update
          });
          console.log(`Product ${product._id} updated successfully`);
        }
      } catch (error) {
        // If the product does not exist, insert it
        if (error.code === 404) {
          await content.products.insert({
            merchantId: process.env.GOOGLE_MERCHANT_ID,
            resource: {
              ...resource,
              offerId: product._id.toString(),
              targetCountry: "US",
              contentLanguage: "en",
              channel: "online",
            },
          });
          console.log(`Product ${product._id} inserted successfully`);
        } else {
          throw error;
        }
      }
    });
  } catch (error) {
    console.error(`Failed to sync product ${product._id}:`, error);
  }
};

const syncAllProducts = catchAsyncError(async (req, res) => {
  try {
    const products = await Product.find({}).populate("brand").exec();
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const batch = products.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const syncPromises = batch.map(syncProductWithGoogle);
      await Promise.all(syncPromises);
      console.log(`Batch ${i + 1}/${totalBatches} processed`);
      await sleep(2000); // Wait for 2 seconds between batches
    }

    res.status(200).json({ message: "All products synced successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const deleteAllGoogleMerchantProducts = catchAsyncError(async (req, res) => {
  try {
    let products = [];
    let pageToken = null;

    // Fetch all products from Google Merchant Center
    do {
      const response = await content.products.list({
        merchantId: process.env.GOOGLE_MERCHANT_ID,
        ...(pageToken ? { pageToken } : {}), // Include pageToken only if it exists
      });

      if (response.data.resources) {
        products = products.concat(response.data.resources);
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken); // Continue fetching until all products are retrieved

    // Function to delete a product
    const deleteProduct = async (productId) => {
      try {
        await retryWithExponentialBackoff(async () => {
          await content.products.delete({
            merchantId: process.env.GOOGLE_MERCHANT_ID,
            productId,
          });
          console.log(`Product ${productId} deleted successfully`);
        });
      } catch (error) {
        console.error(`Failed to delete product ${productId}:`, error);
      }
    };

    // Delete products in batches
    const BATCH_SIZE = 100; // Adjust as necessary
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    for (let i = 0; i < totalBatches; i++) {
      const batch = products.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const deletePromises = batch.map((product) => deleteProduct(product.id));
      await Promise.all(deletePromises);
      console.log(`Batch ${i + 1}/${totalBatches} processed`);
      await sleep(2000); // Wait for 2 seconds between batches
    }

    res.status(200).json({ message: "All products deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  getGoogleMerchantProducts,
  syncAllProducts,
  deleteAllGoogleMerchantProducts,
};
