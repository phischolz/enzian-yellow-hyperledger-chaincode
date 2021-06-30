'use strict';

const State = require('../ledger-api/state')
const {GatewayType, DecisionType, Operator, operatorBySymbol} = require('../contract-consts')


class TaskNode extends State {

    id = 0;
    activity;
    taskResource;
    completed = false;
    precedingMergingGateway;
    requirements = [];
    competitors = [];
    decision = undefined;


    /**
     * Set decision property with {@link setDecision}.
     * @param parentProcessInstanceID {string}
     * @param taskID {number}
     * @param activity {string}
     * @param taskResource {string}
     * @param precedingMergingGateway {GatewayType}
     * @param requirements {Array<number>}
     * @param competitors {Array<number>}
     */
    constructor(
        parentProcessInstanceID,
        taskID,
        activity,
        taskResource,
        precedingMergingGateway,
        requirements,
        competitors) {


        super(TaskNode.getClass(), [parentProcessInstanceID, taskID]);
        this.parentProcessInstanceID = parentProcessInstanceID;
        this.id = taskID
        this.activity = activity;
        this.taskResource = taskResource;
        this.precedingMergingGateway = precedingMergingGateway;
        this.requirements = requirements;
        this.competitors = competitors;
    }

    //====================== Getters & Setters ===========================

    /**
     *
     * @param endBoss {number}
     * @param gatewayType {GatewayType}
     * @param decisionType {DecisionType}
     * @param completed {boolean}
     * @param exists {boolean}
     * @param operator {Operator}
     * @param processVariable {string} Key to Variable
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
     * @param parentProcessInstanceID {string}
     * @param taskID {number}
     * @param taskName {string}
     * @param resource {string}
     * @param competitors {Array<number>}
     * @param precedingMergingGateway {GatewayType}
     * @param requirements {Array<number>}
     * @returns {TaskNode}
     */
    static createInstance(parentProcessInstanceID, taskID, taskName, resource, competitors,
                          precedingMergingGateway, requirements) {

        return new TaskNode(
            parentProcessInstanceID,
            taskID,
            taskName,
            resource,
            precedingMergingGateway,
            requirements,
            competitors);
    }

    static getClass() {
        return 'enzian-yellow.TaskNode';
    }
}

module.exports = TaskNode