const Product = require("../models/ProductModel");
const CounterRepository = require("../repositories/CounterRepository")
const EntitiyNotFoundException = require("../exceptions/EntitiyNotFoundException");

class ProductRepository {
    constructor() {}

    async create(productData) {
        try {
            const counterRepo = new CounterRepository();
            productData.code = await counterRepo.findCounter();
            const product = new Product(productData);

            await counterRepo.findAndUpdate();

            // Save product.
            product.save();

            return product

        } catch (err) {
            throw new Error(`Error finding product by ID: ${err}`);
        }
    }

    async findById(productId) {
    
        const product = await Product.findById(productId);
        if(!product)
            throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

        return product;
        
    }

    async findAll() {
        try {
            const products = await Product.find();
            return products;
        } catch (error) {
            throw new Error(`Error finding all products: ${error.message}`);
        }
    }

    async findByNameOrCode(val) {
       return Product.find({
            $or: [
              { name: { $regex: val, $options: "i" } },
              { code: val },
            ],
          }).limit(15)
    }

    async update(productId, updates) {
        try {
                //update product.
            const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
            return product;

        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    async delete(productId) {
        try {
            const result = await Product.findByIdAndDelete(productId);
            console.log(result);
            return result;
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }
  
}

module.exports = ProductRepository;