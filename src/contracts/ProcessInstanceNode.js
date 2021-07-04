'use strict';

const State = require('../ledger-api/state')

class ProcessInstanceNode extends State {

    eventLog = []; //IDs
    variables = {}; //ID-Key Pairs
    tasks = {}; //ID-Key Pairs


    constructor(obj) {
        super(ProcessInstanceNode.getClass(), [obj.id]);
        Object.assign(this, obj);
    }

    //====================== Getters & Setters ===========================

    /**
     * Adds deployed task to internal register. Throws, if ID already in use.
     * @param taskID {number}
     * @param taskKey {string}
     * @returns {Promise<void>}
     */
    async addTask(taskID, taskKey){
        if (this.tasks[taskID]){
            throw new Error('this taskID is already in use!');
        } else {
            this.tasks[taskID] = taskKey;
        }

    }

    /**
     *
     * @param taskID {number}
     * @returns {Promise<string>}
     */
    async getTaskKey(taskID){
        return this.tasks[taskID];
    }

    /**
     *
     * @returns {Promise<{}>} Internal task register.
     */
    async getTasks(){
        return this.tasks;
    }

    /**
     * Adds deployed variable to internal register. Throws, if ID already in use.
     * @param varID {number}
     * @param varKey {string}
     * @returns {Promise<void>}
     */
    async addVariable(varID, varKey){
        if (this.variables[varID]) {
            throw new Error('varID already in use!');
        } else {
            this.variables[varID] = varKey;
        }
    }

    /**
     *
     * @param varID {number}
     * @returns {Promise<string>}
     */
    async getVariableKey(varID){
        return this.variables[varID];
    }

    /**
     *
     * @returns {Promise<{}>} Internal variables register.
     */
    async getVariables() {
        return this.variables;
    }

    /**
     * Returns order of executed tasks.
     * @returns {Promise<*[]>}
     */
    async getEventLog(){
        return this.eventLog;
    }

    /**
     * Appends TaskID to internal event log.
     * @param taskID {number}
     * @returns {Promise<void>}
     */
    async addEvent(taskID){
        this.eventLog.append(taskID)
    }

    //====================== Statics & Utils ===========================

    static fromBuffer(buffer) {
        return ProcessInstanceNode.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Factory method to create a commercial paper object
     * @param processInstanceID {number}
     */
    static createInstance(processInstanceID) {
        return new ProcessInstanceNode({id: processInstanceID});
    }

    static getClass() {
        return 'enzian-yellow.ProcessInstanceNode';
    }
}

module.exports = ProcessInstanceNode