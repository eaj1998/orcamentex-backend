const Counter = require("../models/CounterModel");

class CounterRepository {
    constructor() {}

    async findCounter() {
        try {
            const counter = await Counter.findOne({ id: "counter" });
            return counter.seq;
        } catch (error) {
            throw new Error(`Error finding counter: ${error.message}`);
        }
    }

    async findAndUpdate() {

        Counter.findOneAndUpdate(
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