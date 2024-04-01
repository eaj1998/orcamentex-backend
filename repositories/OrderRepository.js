const { Order } = require("../models/OrderModel");
const  CustomerRepository  = require("../repositories/CustomerRepository");
const EntitiyNotFoundException = require("../exceptions/EntitiyNotFoundException");

const customerRepo = new CustomerRepository();

class OrderRepository {
    constructor() {}

    async create(orderData) {
        const order = new Order(orderData)
        order.title = 'Orçamento - ' + new Date().toLocaleDateString();
        const customer = await customerRepo.findById(order.customer)
        if(customer)
            order.title = 'Orçamento - ' + customer.name + ' - '+ new Date().toLocaleDateString();
        // Save order.
        order.save();

        if(!order)
            throw new EntitiyNotFoundException(`Error finding order by ID: ${error.message}`);

        return order

    }

    async findById(orderId) {       
        try {
            console.log('order', orderId);
            const order = await Order.findById(orderId).populate('products.product customer');
          
    
            return order;
        }catch(err){
            throw new EntitiyNotFoundException(`Error finding order by ID: ${err}`);
        }
       
        
    }

    async findAll() {
        const orders = await Order.find().populate('customer');
        if(!orders)
            throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

        return orders;           
    }  

    async update(orderId, updates) {       		                    		
      		
        //update order.
        const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
        if(!order)
            throw new EntitiyNotFoundException(`Error finding order by ID: ${error.message}`);

        return order;

    }

    async delete(orderId) {
        const result = await Order.findByIdAndDelete(orderId);
        if(!result)
            throw new EntitiyNotFoundException(`Error finding order by ID: ${error.message}`);

        return result;
    }
  
}

module.exports = OrderRepository;