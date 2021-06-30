
const {ProcessesContext} = require('../src/contracts/Processes');
const ProcessInstanceNode = require('../src/contracts/ProcessInstanceNode');
const State = require('../src/ledger-api/state')


const assert = require('chai').assert
const sinon = require('sinon');
const { ChaincodeStub } = require('fabric-shim');
const makeFakeContext = require('./make-fake-context')

console.log("NODE_ENV: " + process.env.NODE_ENV);


describe('ProcessesContext Testing', function (){
    let testContext = makeFakeContext();

    beforeEach(function (){
        testContext = makeFakeContext();
    })

    it('Context exists', function (){
        assert.exists(testContext);
        assert.instanceOf(testContext, ProcessesContext)
    })

    it('Context contains ProcessesNode', function(){
        assert.exists(testContext.processesNode)
    })

    it('Sinon created Stub', function(){
        let chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        assert.exists(chaincodeStub);
    })

    it('Context has stub', function(){
        assert.exists(testContext.stub);
    })

    it('Context gets PIDs', async function(){
        let PID = testContext.processesNode.getNextProcessID()
        assert.exists(PID);
    })

    it('Context creates Process', async function(){
        let PID = await testContext.processesNode.getNextProcessID();
        assert.exists(PID, "PID was not created");

        let createdProcess = ProcessInstanceNode.createInstance(String(PID));
        assert.exists(createdProcess, "Process Instance not created");

        let res = await testContext.processesNode.addProcess(createdProcess);
        assert.exists(res, "addProcess did not return results");
    })

    it('create process, then get process', async function(){
        let PID = await testContext.processesNode.getNextProcessID();
        let createdProcess = ProcessInstanceNode.createInstance(String(PID));
        let processAddress = await testContext.processesNode.addProcess(createdProcess);
        let gottenProcess = await testContext.processesNode.getProcess(processAddress);

        assert.exists(gottenProcess, "Object returned by getProcess is empty");
        assert.instanceOf(gottenProcess, State, "Object returned by getProcess is NOT a State")
        assert.instanceOf(gottenProcess, ProcessInstanceNode,
            "State returned by getProcess is NOT ProcessInstanceNode");
    })

    it('template', function(){

    })
})
