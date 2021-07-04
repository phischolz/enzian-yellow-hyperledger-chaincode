const {GatewayType} = require('../src/contract-consts');
const {Processes} = require('../src/contracts/Processes');

const assert = require('chai').assert
const makeFakeContext = require('./make-fake-context')

describe('temp', async function(){

    beforeEach(async function(){

    })

    it('temp', async function(){

    })
})

describe('Processes Contract', async function(){
    let ctx = makeFakeContext();    //Mock-stub saves states locally and will lose them if re-instantiated -
                                    // do not overwrite in beforeEach
    let testContract = new Processes();

    beforeEach(async function(){

    })

    describe('Sample usage', async function(){

        let processKey;

        beforeEach(async function(){

        })

        it('create Process', async function(){
            processKey = await testContract.createProcess(ctx);
        })

        it('create root Task 1', async function(){
            await testContract.createTask(ctx, processKey, 1, '', '', '[]',
                GatewayType.NONE.id, '[]');
        })

        it('create task 2, requiring task 1', async function(){
            await testContract.createTask(ctx, processKey, 2, '', '', '[]',
                GatewayType.NONE.id, '[1]');
        })

        it('cannot execute task 2 before 1', async function(){
            let success = await testContract.executeTask(ctx, processKey, 2);
            assert.isFalse(success)
        })

        it('no tasks completed', async function(){
            assert.isFalse(await testContract.getTaskCompleted(ctx, processKey, 1));
            assert.isFalse(await testContract.getTaskCompleted(ctx, processKey, 2));
        })

        it('execute task 1', async function(){
            let success = await testContract.executeTask(ctx, processKey, 1);
            assert.isTrue(success);
        })

        it('execute task 2', async function(){
            let success = await testContract.executeTask(ctx, processKey, 2);
            assert.isTrue(success);
        })

        it('both tasks completed', async function(){
            assert.isTrue(await testContract.getTaskCompleted(ctx, processKey, 1));
            assert.isTrue(await testContract.getTaskCompleted(ctx, processKey, 2));
        })

        it('created variable', async function(){
            await testContract.createVariable(ctx, processKey, 1, 0, '');
        })

        it('updated variable', async function(){
            await testContract.setVariableValue(ctx, processKey, 1, 'abc');
        })

        it('accessed variable', async function(){
            let val = await testContract.getVariableValue(ctx, processKey, 1);
            assert.equal(val, 'abc')
        })

        it('eventLog is correct', async function(){
            let eL = JSON.parse(await testContract.getEventLog(ctx, processKey))
            assert.deepEqual(eL, [1,2]);
        })
    })
})