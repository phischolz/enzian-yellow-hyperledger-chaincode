
const {ProcessesContext} = require('../src/contracts/Processes');
const ProcessInstanceNode = require('../src/contracts/ProcessInstanceNode');
const TaskNode = require('../src/contracts/TaskNode');
const VariableNode = require('../src/contracts/VariableNode');


const assert = require('chai').assert
const sinon = require('sinon');
const { ChaincodeStub } = require('fabric-shim');
const makeFakeContext = require('./make-fake-context')


describe('ProcessesContext Testing', async function (){
    let ctx = makeFakeContext();

    describe('Stubbing', async function(){
        beforeEach(function (){
            ctx = makeFakeContext();
        })

        it('Context exists', async function (){
            assert.exists(ctx);
            assert.instanceOf(ctx, ProcessesContext)
        })

        it('Context contains ProcessesNode', async function(){
            assert.exists(ctx.processesNode)
        })

        it('Sinon created Stub',async function(){
            let chaincodeStub = sinon.createStubInstance(ChaincodeStub);
            assert.exists(chaincodeStub);
        })

        it('Context has stub',async function(){
            assert.exists(ctx.stub);
        })
    })

    describe('ProcessesNode', async function(){
        beforeEach(function (){
            ctx = makeFakeContext();
        })

        it('PIDs exist', async function(){
            let PID = ctx.processesNode.getNextProcessID()
            assert.exists(PID);
        })

        it('PID counting', async function(){
            assert.equal(await ctx.processesNode.getNextProcessID(), 0);
            assert.equal(await ctx.processesNode.getNextProcessID(), 1);
            assert.equal(await ctx.processesNode.getNextProcessID(), 2);
        })

        it('Output signatures', async function(){

            //PROCESS
            let PID = await ctx.processesNode.getNextProcessID();
            let process = await ProcessInstanceNode.createInstance(PID);
            assert.instanceOf(process, ProcessInstanceNode, 'Factory of ProcessInstanceNode didn\'t return ProcessInstance');

            let processKey = await ctx.processesNode.addProcess(process);
            assert.exists(processKey, 'addProcess didn\'t return String');


            process = await ctx.processesNode.getProcess(processKey);
            assert.instanceOf(process, ProcessInstanceNode, 'getProcess didn\'t return ProcessInstance');

            //TASK
            let task = await TaskNode.createInstance(process.id, 0, 'name', '',
                [], undefined, []);
            assert.instanceOf(task, TaskNode, 'TaskNode Factory didn\'t return TaskNode');


            let taskKey = await ctx.processesNode.addTask(processKey, task);

            assert.exists(taskKey, 'addTask didn\'t return Task Key');

            task = await ctx.processesNode.getTask(processKey, task.id);
            assert.instanceOf(task, TaskNode, 'getTask didn\'t return TaskNode');

            //VARIABLE

            let variable = await VariableNode.createInstance(process.id, 0, 0, 'aloha');
            assert.instanceOf(variable, VariableNode, 'Variable Factory didn\'t return variable');

            let variableKey = await ctx.processesNode.addVariable(processKey, variable);
            assert.exists(variableKey, 'addVariable didn\'t return Key');

            variable = await ctx.processesNode.getVariable(processKey, variable.id);
            assert.instanceOf(variable, VariableNode, 'getVariable didn\'t return variable');
        })

    })

    it('template', async function(){

    })
})
