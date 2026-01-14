const Customer = require("../models/CustomerModel");
const CounterRepository = require("../repositories/CounterRepository")
const EntitiyNotFoundException = require("../exceptions/EntitiyNotFoundException");

class CustomerRepository {
    constructor() { }

    async create(customerData) {
        const customer = new Customer(customerData);
        // Save customer.
        await customer.save();

        if (!customer)
            throw new EntitiyNotFoundException(`Error finding customer by ID: ${error.message}`);

        return customer
    }

    async findById(customerId) {

        const customer = await Customer.findById(customerId);
        if (!customer)
            throw new EntitiyNotFoundException(`Error finding customer by ID: ${error.message}`);

        return customer;

    }

    async findAll() {

        const customers = await Customer.find();
        if (!customers)
            throw new EntitiyNotFoundException(`Error finding customer by ID: ${error.message}`);

        return customers;
    }

    async findByCpfOrName(val) {
        return await Customer.find({
            $or: [
                { name: { $regex: val, $options: "i" } },
            ],
        }).limit(15)
    }

    async findByCpfCnpj(val) {
        return await Customer.find({ cpfCnpj: val })
    }

    async update(customerId, updates) {
        //update customer.
        const customer = await Customer.findByIdAndUpdate(customerId, updates, { new: true });
        if (!customer)
            throw new EntitiyNotFoundException(`Error finding customer by ID: ${error.message}`);

        return customer;

    }

    async delete(customerId) {
        const result = await Customer.findByIdAndDelete(customerId);
        if (!result)
            throw new EntitiyNotFoundException(`Error finding customer by ID: ${error.message}`);

        return result;
    }

}

module.exports = CustomerRepository;