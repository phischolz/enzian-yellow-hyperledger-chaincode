'use strict';

const State = require('../ledger-api/state')

class ProcessInstanceNode extends State {

    eventLog = []; //IDs
    variables = {}; //ID-Key Pairs
    tasks = {}; //ID-Key Pairs

    /**
     *
     * @param processInstanceID {number}
     */
    constructor(processInstanceID) {
        super(ProcessInstanceNode.getClass(), [processInstanceID]);
        this.id = processInstanceID;
    }

    //====================== Getters & Setters ===========================

    async addTask(taskID, taskKey){
        if (this.tasks[taskID]){
            throw new Error('this taskID is already in use!');
        } else {
            this.tasks[taskID] = taskKey;
        }

    }

    async getTaskKey(taskID){
        return this.tasks[taskID];
    }

    getTasks(){
        return this.tasks;
    }

    getEventLog(){
        return this.eventLog;
    }

    addEvent(taskID){
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
     */
    static createInstance(processInstanceID) {
        return new ProcessInstanceNode({ processInstanceID });
    }

    static getClass() {
        return 'enzian-yellow.ProcessInstanceNode';
    }
}

module.exports = ProcessInstanceNode