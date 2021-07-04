'use strict';

const StateList = require('../ledger-api/statelist')
const ProcessInstanceNode = require('./ProcessInstanceNode')
const TaskNode = require('./TaskNode')
const VariableNode = require('./VariableNode')
const {GatewayType, Operator} = require('../contract-consts')

class ProcessesNode extends StateList {

    constructor(ctx) {
        super(ctx, 'enzian-yellow.processes');
        this.use(ProcessInstanceNode);
        this.use(TaskNode);
        this.use(VariableNode)
        this.nextProcessID = 0;
    }

    //===========================================
    // PROCESSES
    //===========================================

    /**
     *
     * @returns {Promise<number>}
     */
    async getNextProcessID(){
        this.nextProcessID +=1;
        return this.nextProcessID - 1;
    }

    /**
     * Writes given Process onto Blockchain.
     * @param process {ProcessInstanceNode}
     * @returns {Promise<string>} Process Key
     */
    async addProcess(process){
        return await this.addState(process);
    }

    /**
     *
     * @param processInstanceKey {string}
     * @returns {Promise<ProcessInstanceNode>}
     */
    async getProcess(processInstanceKey){
        let processInstance = await this.getState(processInstanceKey);


        if (processInstance instanceof ProcessInstanceNode) return processInstance;
        else throw new Error("Process not Found");
    }

    /**
     * Overwrites given Process.
     * Note that the ProcessInstanceNode Object knows its own Key.
     * Note that composing Tasks must be overwritten separately, if changed.
     * @param process {ProcessInstanceNode}
     * @returns {Promise<void>}
     */
    async updateProcess(process){
        return await this.updateState(process);
    }

    //===========================================
    // TASKS
    //===========================================

    /**
     * Registers task into process, then writes task into blockchain and updates process
     * Safe for non-existing parent Process (throws)
     * @param parentProcessInstanceKey {string}
     * @param task {TaskNode} Task Object
     * @returns {Promise<number>} Task ID
     */
    async addTask(parentProcessInstanceKey, task){
        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        if (!parentProcess) throw new Error('Parent Process does not exist');


        let taskKey = await this.addState(task);

        await parentProcess.addTask(task.id, taskKey);

        await this.updateProcess(parentProcess);
        return taskKey;

    }

    /**
     * Query Blockchain for task object. This function will not write on the world state.
     * Safe for non-existing processes/tasks (throw)
     * @param parentProcessInstanceKey {string}
     * @param taskID {number}
     * @returns {Promise<TaskNode>}
     */
    async getTask(parentProcessInstanceKey, taskID){
        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        if (!parentProcess) throw new Error('Parent Process does not exist');

        let taskKey = await parentProcess.getTaskKey(taskID);
        if (!taskKey) throw new Error('Process doesn\'t know a task with this ID');

        let task = await this.getState(taskKey);
        if (task instanceof TaskNode) return task;
        else throw new Error('Task not found');
    }

    /**
     * Overwrites the current TaskNode Object at specified Address with a new one. Should throw on failure.
     * @param parentProcessInstanceKey {string}
     * @param task {TaskNode} Task to be written into Blockchain
     * @returns {Promise<void>}
     */
    async updateTask(parentProcessInstanceKey, task){
        //make sure parent exists
        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        if (!parentProcess) throw new Error('Parent Process does not exist');

        //make sure task is registered
        let taskKey = await parentProcess.getTaskKey(task.id);
        if (!taskKey) throw new Error('Process doesn\'t know a task with this ID');

        return await this.updateState(task);
    }

    /**
     * Completes Task if requirements met. Saves all effects on Chain.
     * Throws potentially.
     * @param {string} parentProcessInstanceKey
     * @param {number} taskID
     * @returns {Promise<boolean>} success value of task execution
     */
    async executeTask(parentProcessInstanceKey, taskID) {
        let task = await this.getTask(parentProcessInstanceKey, taskID);
        if(task.completed) throw new Error('task already completed!');

        let success = false;

        // resource is ignored, since auth is native in hyperledger (?) TODO

        //let endBoss = 0;
        if(task.decision.exists){
            //endBoss = task.decision.endBoss;
            let result = this.evaluateTaskDecision(parentProcessInstanceKey, task);
            if(!result) throw new Error('Process Variable is not correct.')
        }

        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        let requiredTaskIDs = task.requirements;
        if(requiredTaskIDs.length === 0) success = true;
        else{

            let numFulfilledRequirements = 0;
            for (let i = 0; i<requiredTaskIDs.length; i++){
                if (parentProcess.eventLog.find(element => element === requiredTaskIDs[i]))
                    numFulfilledRequirements++;
            }

            //TODO Is this sufficient? Something seemed to be missing in solidity. ctrl+f "enabled"
            let gateway = task.precedingMergingGateway;
            switch(gateway){
                case GatewayType.NONE.id: if(numFulfilledRequirements === 1) success = true; break;
                case GatewayType.AND.id: if(numFulfilledRequirements === requiredTaskIDs.length) success = true; break;
                case GatewayType.OR.id: if(numFulfilledRequirements > 0) success = true; break;
                case GatewayType.XOR.id: if(numFulfilledRequirements === 1) success = true; break;
                default: break;
            }
        }

        if(success){
            if(task.decision.exists) {
                //lock all competing tasks!
                for (let i = 0; i < task.competitors.length; i++){
                    let competingTask = await this.getTask(parentProcessInstanceKey, task.competitors[i]);
                    competingTask.completed = true;
                    await this.updateTask(parentProcessInstanceKey, competingTask);
                }

                await parentProcess.addEvent(task.id);
                task.completed = true;
            }
        }

        return success;
    }

    /**
     * Evaluates decision on Task. Task will not be altered.
     * Throws if values nonexistent or non-comparable.
     * @param {string} parentProcessInstanceKey
     * @param {TaskNode} task
     * @returns {Promise<boolean>}
     */
    async evaluateTaskDecision(parentProcessInstanceKey, task) {

        let value1 = await (await this.getVariable(parentProcessInstanceKey, task.decision.processVariable)).getValue();
        let value2 = task.decision.value;
        if(!value1 || !value2) throw new Error("A Decision-value is missing")
        if(typeof value1 !== typeof value2) throw new Error("Values non-comparable")

        switch (task.decision.operator){
            case Operator.LESS.id: return value1 < value2;
            case Operator.GREATER.id: return value1 > value2;
            case Operator.EQUAL.id: return value1 === value2;
            case Operator.NEQ.id: return value1 !== value2;
            case Operator.GEQ.id: return value1 >= value2;
            case Operator.LEQ.id: return value1 <= value2;
            case Operator.ELEMENT.id:
                for(let elem in value2) {
                    if (elem === value1) return true;
                }
                return false;
            default:
                return false;
        }
    }

    //===========================================
    // VARIABLES
    //===========================================

    /**
     * Registers variable to parent process, then updates Ledger with new variable and changed parent.
     * Safe for non-existing parent Process (throws)
     * @param {string} parentProcessInstanceKey
     * @param {VariableNode} variable
     * @returns {Promise<number>}
     */
    async addVariable(parentProcessInstanceKey, variable){
        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        if (!parentProcess) throw new Error('Parent Process does not exist');

        let variableKey = await this.addState(variable);

        await parentProcess.addVariable(variable.id, variableKey);
        await this.updateProcess(parentProcess);

        return variableKey;
    }

    /**
     * Pulls up-to-date variable object from ledger.
     * Safe for non-existing parent-Process or Value (throws)
     * @param {string} parentProcessInstanceKey
     * @param {number} variableID
     * @returns {Promise<VariableNode>}
     */
    async getVariable(parentProcessInstanceKey, variableID){
        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        if (!parentProcess) throw new Error('Parent Process does not exist');

        let variableKey = await parentProcess.getVariableKey(variableID);
        if (!variableKey) throw new Error('Variable ID not associated with an Instance!');

        let variable = await this.getState(variableKey);
        if (!variableKey) throw new Error('Critical: Key didn\'t yield Object');

        return variable;
    }

    /**
     * Overwrites the current object at given variables' address
     * @param {string} parentProcessInstanceKey
     * @param {VariableNode} variable
     * @returns {Promise<void>}
     */
    async updateVariable(parentProcessInstanceKey, variable){
        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        if (!parentProcess) throw new Error('Parent Process does not exist');

        let variableKey = parentProcess.getVariableKey(variable.id);
        if (!variableKey) throw new Error('Process doesn\'t know a variable with this ID');

        return await this.updateState(variable);
    }
}

module.exports = ProcessesNode