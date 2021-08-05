const State = require('../ledger-api/state')

class ProcessCounter extends State{

    counter;

    constructor(obj) {
        super(ProcessCounter.getClass(), ["ProcessCounter"]);
        Object.assign(this, obj);
    }

    /**
     *
     * @returns {Promise<number>}
     */
    async getCurrentCounter(){
        return this.counter;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async incrementCounter(){
        this.counter += 1;
    }

    //====================== Statics & Utils ===========================

    static fromBuffer(buffer) {
        return ProcessCounter.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Counters always start at 0.
     * @returns {ProcessCounter}
     */
    static createInstance() {
        return new ProcessCounter({counter: 0});
    }

    static getClass() {
        return 'enzian-yellow.ProcessCounter';
    }
}

module.exports = ProcessCounter