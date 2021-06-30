'use strict';

const StateList = require('../ledger-api/statelist')
const ProcessInstanceNode = require('./ProcessInstanceNode')
const TaskNode = require('./TaskNode')
const VariableNode = require('./VariableNode')//TODO

class ProcessesNode extends StateList {

    constructor(ctx) {
        super(ctx, 'enzian-yellow.processes');
        this.use(ProcessInstanceNode);
        this.use(TaskNode);
        this.use(VariableNode)
        this.nextProcessID = 0;
    }

    /**
     *
     * @returns {Promise<number>}
     */
    async getNextProcessID(){
        this.nextProcessID +=1;
        return this.nextProcessID - 1;
    }

    /**
     *
     * @param parentProcessInstanceKey {string}
     * @param task {TaskNode} Task Object
     * @returns {Promise<string>} Task ID
     */
    async addTask(parentProcessInstanceKey, task){
        let parentProcess = await this.getProcess(parentProcessInstanceKey);
        if (!parentProcess) throw new Error('Parent Process does not exist');
        let taskKey = await this.addState(task);

        await parentProcess.addTask(task.id, taskKey);

        await this.updateState(parentProcess);
        return task.id;

    }

    /**
     * Query Blockchain for task object. This function will not write on the world state.
     * @param parentProcessInstanceKey {string}
     * @param taskID {string}
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
     * Writes given Process onto Blockchain.
     * @param process {ProcessInstanceNode}
     * @returns {Promise<string>} Process Key
     */
    async addProcess(process){
        let processKey = await this.addState(process);
        return processKey;
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

    async addVariable(){

    }

    async getVariable(){

    }

    async updateVariable(){

    }
}

module.exports = ProcessesNode