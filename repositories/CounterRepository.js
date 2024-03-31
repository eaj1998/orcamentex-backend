const Counter = require("../models/CounterModel");

class CounterRepository {
    constructor() {}

    async findCounter() {
        const counter = await Counter.findOne({ id: "counter" });
        if(!counter)
            throw new EntitiyNotFoundException(`Error finding product by ID: ${error.message}`);

        return counter.seq;
    }

    async findAndUpdate() {

        await Counter.findOneAndUpdate(
            { id: "counter" }, 
            { "$inc": { "seq": 1 } }, 
            { new: true }
        ).exec(async (err, cd) => {
            if (cd === null) {
                const newCounter = new Counter({ id: "counter", seq: 1 });
                await newCounter.save();
            }
        });
    }
}


module.exports = CounterRepository;