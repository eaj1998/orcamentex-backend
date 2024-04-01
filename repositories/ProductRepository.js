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
            if(!product)
                throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

            await counterRepo.findAndUpdate();

            // Save product.
            product.save();

            return product

        } catch (err) {
            throw new EntitiyNotFoundException(`Error finding product by ID: ${err}`);
        }
    }

    async findById(productId) {
    
        const product = await Product.findById(productId);
        if(!product)
            throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

        return product;
        
    }

    async findAll() {
        
        const products = await Product.find();
        if(!products)
            throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

        return products;        
    }

    async findByNameOrCode(val) {
       return await Product.find({
            $or: [
              { name: { $regex: val, $options: "i" } },
              { code: val },
            ],
          }).limit(15)
    }

    async update(productId, updates) {
                //update product.
        const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
        if(!product)
            throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

        return product;

    }

    async delete(productId) {
            const result = await Product.findByIdAndDelete(productId);
            if(!result)
                throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

            return result;
    }
  
}

module.exports = ProductRepository;