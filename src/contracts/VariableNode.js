'use strict';

const State = require('../ledger-api/state')

class VariableNode extends State {

    constructor(obj) {
        super(VariableNode.getClass(), [obj.parentProcessInstanceID, obj.variableName]);
        Object.assign(this, obj);
        this.valueLog = [];
        this.valueLog.append(obj.variableValue);
    }

    //====================== Getters & Setters ===========================

    getValue(){
        return this.variableValue;
    }

    setValue(value){
        this.variableValue = value;
        this.valueLog.append(value);
    }

    getValueLog(){
        return this.valueLog;
    }

    getName(){
        return this.variableName;
    }


    //====================== Statics & Utils ===========================

    static fromBuffer(buffer) {
        return VariableNode.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, VariableNode);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(parentProcessInstanceID, variableName, variableValue) {

        return new VariableNode({ parentProcessInstanceID, variableName, variableValue});
    }

    static getClass() {
        return 'enzian-yellow.VariableNode';
    }

}

module.exports = VariableNode