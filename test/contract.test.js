const {ProcessesContext, Processes} = require('../src/contracts/Processes');
const ProcessInstanceNode = require('../src/contracts/ProcessInstanceNode');
const State = require('../src/ledger-api/state')


const assert = require('chai').assert
const sinon = require('sinon');
const { ChaincodeStub } = require('fabric-shim');
const makeFakeContext = require('./make-fake-context')

describe('temp', async function(){

    beforeEach(async function(){

    })

    it('temp', async function(){

    })
})

describe('Processes Contract', async function(){
    let testContext, testContract;

    beforeEach(async function(){
        testContext = makeFakeContext();
        testContract = new Processes();
    })

    it('createProcess', async function(){
        let processKey = await testContract.createProcess(testContext)
        console.log('ret:', processKey)
    })
})