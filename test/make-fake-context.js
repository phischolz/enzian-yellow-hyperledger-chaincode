const {Processes, ProcessesContext} = require('../src/contracts/Processes');
const { Contract, Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');
const sinon = require('sinon');

console.log("NODE_ENV: " + process.env.NODE_ENV);


function makeFakeContext(){

    let transactionContext = new ProcessesContext();
    let chaincodeStub = sinon.createStubInstance(ChaincodeStub);


    chaincodeStub.putState.callsFake((key, value) => {
        if (!chaincodeStub.states) {
            chaincodeStub.states = {};
        }
        chaincodeStub.states[key] = value;
    });

    chaincodeStub.createCompositeKey.callsFake(async (objectType, attributes) => {
        let key = objectType;
        attributes.forEach(elem => key += ":" + elem);
        return key;
    });

    chaincodeStub.getState.callsFake(async (key) => {
        let ret;
        if (chaincodeStub.states) {
            ret = chaincodeStub.states[key];
        }
        return Promise.resolve(ret);
    });

    chaincodeStub.deleteState.callsFake(async (key) => {
        if (chaincodeStub.states) {
            delete chaincodeStub.states[key];
        }
        return Promise.resolve(key);
    });

    chaincodeStub.getStateByRange.callsFake(async () => {
        function* internalGetStateByRange() {
            if (chaincodeStub.states) {
                // Shallow copy
                const copied = Object.assign({}, chaincodeStub.states);

                for (let key in copied) {
                    yield {value: copied[key]};
                }
            }
        }

        return Promise.resolve(internalGetStateByRange());
    });

    transactionContext.setChaincodeStub(chaincodeStub);
    return transactionContext;
}

module.exports = makeFakeContext;