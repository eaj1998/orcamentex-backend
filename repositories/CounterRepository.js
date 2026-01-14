const Counter = require("../models/CounterModel");

class CounterRepository {
    constructor() {}

    async findCounter() {
        let counter = await Counter.findOne({ id: "counter" });
        if(!counter)
            counter = await this.findAndUpdate();

        return counter.seq;
    }

    async findAndUpdate() {
        let counter = await Counter.findOneAndUpdate(
            { id: "counter" }, 
            { "$inc": { "seq": 1 } }, 
            { new: true }
        );

        if (!counter) {
            const newCounter = new Counter({ id: "counter", seq: 1 });
            await newCounter.save();
            return newCounter;
        }

        return counter;
    }
}


module.exports = CounterRepository;