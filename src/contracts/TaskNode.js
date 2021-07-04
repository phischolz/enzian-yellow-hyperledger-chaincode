'use strict';

const State = require('../ledger-api/state')


class TaskNode extends State {



    constructor(obj) {
        super(TaskNode.getClass(), [obj.parentProcessInstanceID, 'task:' + obj.id]);
        Object.assign(this, obj);
        if (!obj.completed) this.completed = false;
    }

    //====================== Getters & Setters ===========================

    async getDecisionEndBoss(){
        if (this.decision){
            return this.decision.endBoss;
        } else return undefined;
    }

    /**
     *
     * @param endBoss {number}
     * @param gatewayType {number}
     * @param decisionType {number}
     * @param completed {boolean}
     * @param exists {boolean}
     * @param operator {number}
     * @param processVariable {number} ID of Variable
     * @param value
     * @returns {Promise<void>}
     */
    async setDecision (
        endBoss,
        gatewayType,
        decisionType,
        completed,
        exists,
        operator,
        processVariable,
        value) {


        this.decision = {
            endBoss: endBoss,
            gatewayType: gatewayType,
            decisionType: decisionType,
            completed: completed,
            exists: exists,
            operator: operator,
            processVariable: processVariable,
            value: value
        }
    }

    //====================== Statics & Utils ===========================

    static fromBuffer(buffer) {
        return TaskNode.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Factory method to create a Task object
     * @param parentProcessInstanceID {number}
     * @param taskID {number}
     * @param taskName {string}
     * @param taskResource {string}
     * @param competitors {Array<number>}
     * @param precedingMergingGateway {number}
     * @param requirements {Array<number>}
     * @returns {TaskNode}
     */
    static createInstance(parentProcessInstanceID, taskID, taskName, taskResource, competitors,
                          precedingMergingGateway, requirements) {

        return new TaskNode({
            parentProcessInstanceID,
            id: taskID,
            name: taskName,
            taskResource,
            precedingMergingGateway,
            requirements,
            competitors,
        });
    }

    static getClass() {
        return 'enzian-yellow.TaskNode';
    }
}

module.exports = TaskNode