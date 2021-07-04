const { Contract, Context } = require('fabric-contract-api');
const ProcessesNode = require('./ProcessesNode');
const ProcessInstanceNode = require('./ProcessInstanceNode');
const TaskNode = require('./TaskNode');
const VariableNode = require('./VariableNode');
const {GatewayType, DecisionType, Operator, operatorBySymbol} = require('../contract-consts');

class ProcessesContext extends Context{

    constructor() {
        super();
        this.processesNode = new ProcessesNode(this);
    }

}

class Processes extends Contract {

    constructor() {
        super('enzian-yellow.Processes');
    }

    //===========================================
    // PROCESSES
    //===========================================

    /**
     * Creates a new blank Process Instance.
     * @param ctx {ProcessesContext}
     * @returns {Promise<string>} Key of deployed empty Process
     */
    async createProcess(ctx){
        let PID = await ctx.processesNode.getNextProcessID();
        let process = ProcessInstanceNode.createInstance(PID);

        return await ctx.processesNode.addProcess(process);
    }

    /**
     *
     * @param {ProcessesContext} ctx
     * @param {string} parentProcessKey
     * @returns {Promise<string>}
     */
    async getEventLog(ctx, parentProcessKey){
        let process = await ctx.processesNode.getProcess(parentProcessKey);
        return JSON.stringify(await process.getEventLog());
    }

    //===========================================
    // TASKS
    //===========================================

    /**
     *
     * @param {ProcessesContext} ctx
     * @param {string} parentProcessKey
     * @param {number} taskID
     * @param {string} taskName
     * @param {string} resource
     * @param {string} competitors
     * @param {number} precedingMergingGateway ID, as defined in contract-consts
     * @param {string} requirements
     * @param {string} [decision] JSON: Dict, see code for key definition
     */
    async createTask(ctx, parentProcessKey, taskID, taskName, resource, competitors,
                       precedingMergingGateway, requirements, decision){

        let parentProcess = await ctx.processesNode.getProcess(parentProcessKey);
        if(!parentProcess) return new Error('Parent process not found');

        let parentProcessID = parentProcess.id
        if (!parentProcessID && parentProcessID!==0) return new Error('CRITICAL: Process had no ID');

        let task = TaskNode.createInstance(
            parentProcessID,
            taskID,
            taskName,
            resource,
            JSON.parse(competitors),
            precedingMergingGateway,
            JSON.parse(requirements))

        if(decision) {
            if(decision instanceof string)  decision = JSON.parse(decision);

            await task.setDecision(
                decision['endBoss'],
                decision['gatewayType'],
                decision['decisionType'],
                decision['completed'] ? decision['completed'] : false,
                decision['exists'],
                decision['operator'],
                decision['processVariable'],
                decision['value']
            )
        }

        //write task to chain
        await ctx.processesNode.addTask(parentProcessKey, task);
    }

    /**
     *
     * @param ctx
     * @param {string} processInstanceKey
     * @param {number} taskInstanceID
     * @returns {Promise<boolean>}
     */
    async executeTask(ctx, processInstanceKey, taskInstanceID){
        return await ctx.processesNode.executeTask(processInstanceKey, taskInstanceID);
    }

    /**
     *
     * @param {ProcessesContext} ctx
     * @param {string} processInstanceKey
     * @param {number} taskInstanceID
     * @returns {Promise<boolean>}
     */
    async getTaskCompleted(ctx, processInstanceKey, taskInstanceID){
        let task = await ctx.processesNode.getTask(processInstanceKey, taskInstanceID);
        return task.completed
    }

    //===========================================
    // VARIABLES
    //===========================================

    /**
     *
     * @param ctx
     * @param {string} parentProcessKey
     * @param {number} variableID
     * @param {string|number} [initialValue]
     * @param {string} [variableName]
     * @returns {Promise<Error|number>}
     */
    async createVariable(ctx, parentProcessKey, variableID, initialValue, variableName){
        let parentProcess = await ctx.processesNode.getProcess(parentProcessKey);
        if(!parentProcess) return new Error('Parent process not found');

        let variable = await VariableNode.createInstance(parentProcess.id, variableID, initialValue, variableName);

        return await ctx.processesNode.addVariable(parentProcessKey, variable);
    }

    /**
     *
     * @param {ProcessesContext} ctx
     * @param {string} processInstanceKey
     * @param {number} variableInstanceID
     * @param {string|number} value
     * @returns {Promise<void>}
     */
    async setVariableValue(ctx, processInstanceKey, variableInstanceID, value){
        let variable = await ctx.processesNode.getVariable(processInstanceKey, variableInstanceID);
        await variable.setValue(value)
        return await ctx.processesNode.updateVariable(processInstanceKey, variable);
    }

    /**
     *
     * @param {ProcessesContext} ctx
     * @param {string} processInstanceKey
     * @param {number} variableInstanceID
     * @returns {Promise<string|number>}
     */
    async getVariableValue(ctx, processInstanceKey, variableInstanceID){
        let variable = await ctx.processesNode.getVariable(processInstanceKey, variableInstanceID);
        return await variable.getValue();
    }

    //===========================================
    // CHAINCODE
    //===========================================

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * define custom Context
     * @returns {ProcessesContext}
     */
    createContext(){
        return new ProcessesContext();
    }


}

module.exports = {ProcessesContext, Processes}