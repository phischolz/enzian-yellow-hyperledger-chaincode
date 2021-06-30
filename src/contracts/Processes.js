const { Contract, Context } = require('fabric-contract-api');
const ProcessesNode = require('./ProcessesNode')
const ProcessInstanceNode = require('./ProcessInstanceNode')
const TaskNode = require('./TaskNode')

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

    /**
     * define custom Context
     * @returns {ProcessesContext}
     */
    createContext(){
        return new ProcessesContext();
    }

    //===========================================
    // PROCESS INSTANCES
    //===========================================

    /**
     * Creates a new blank Process Instance.
     * @param ctx {ProcessesContext}
     * @returns {Promise<string>} Key of deployed empty Process
     */
    async startProcessInstance(ctx){
        let PID = ctx.processesNode.getNextProcessID();
        let process = ProcessInstanceNode.createInstance(String(PID));

        return await ctx.processesNode.addProcess(process);
    }

    async terminateProcessInstance(ctx, processInstanceID){
        //return success
        //TODO
    }

    //===========================================
    // TASK INSTANCES
    //===========================================

    /**
     *
     * @param ctx {ProcessesContext}
     * @param parentProcessKey {string}
     * @param taskID
     * @param taskName
     * @param resource
     * @param decisions
     * @param competitors
     * @param proceedingMergingGateway
     * @param requirements
     */
    async createTaskInstance(ctx, parentProcessKey, taskID, taskName, resource, decisions, competitors,
                       proceedingMergingGateway, requirements){

        let task = TaskNode.createInstance(parentProcessKey, taskID, taskName, resource, decisions, competitors,
            proceedingMergingGateway, requirements)
        let parentProcess = ctx.processesNode.getProcess(parentProcessKey);

        if(task && parentProcess){
            parentProcess.addTask();
            //TODO
            //add task to process
            //push task
            //update process
        } else {
            //TODO throw
        }
    }

    async executeTaskInstance(ctx, processInstanceID, taskInstanceID){

    }

    async getTaskInstanceStatus(ctx, processInstanceID, taskInstanceID){

    }

    //===========================================
    // VARIABLE INSTANCES
    //===========================================

    async createVariableInstance(ctx, processInstanceID, opts){

    }

    async setVariableInstanceValue(ctx, processInstanceID, variableInstanceID, value){

    }

    async getVariableInstanceValue(ctx, processInstanceID, variableInstanceID){
        
    }


    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }




}

module.exports = {ProcessesContext, Processes}