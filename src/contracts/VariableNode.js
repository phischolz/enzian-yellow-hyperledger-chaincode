'use strict';

const State = require('../ledger-api/state')

class VariableNode extends State {


    constructor(obj) {
        super(VariableNode.getClass(), [obj.parentProcessInstanceID, 'var:' + obj.id]);
        Object.assign(this, obj);
        if(!obj.valueLog) {
            this.valueLog = [];
            if(obj.variableValue===0 || obj.variableValue==='' || obj.variableValue) this.valueLog.push(obj.variableValue);
        }

    }

    //====================== Getters & Setters ===========================

    /**
     *
     * @returns {Promise<string|number>}
     */
    async getValue(){
        return this.variableValue;
    }

    /**
     *
     * @param value {string|number}
     * @returns {Promise<void>}
     */
    async setValue(value){
        this.variableValue = value;
        this.valueLog.push(value);
    }

    /**
     *
     * @returns {Array<number|string>}
     */
    getValueLog(){
        return this.valueLog;
    }

    /**
     *
     * @returns {string}
     */
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
     * Factory method
     * @param {number} parentProcessInstanceID
     * @param {number} variableID
     * @param {string|number} [variableValue]
     * @param {string} [variableName]
     * @returns {VariableNode}
     */
    static createInstance(parentProcessInstanceID, variableID, variableValue, variableName) {
        return new VariableNode({parentProcessInstanceID, id: variableID, variableValue, variableName});
    }

    static getClass() {
        return 'enzian-yellow.VariableNode';
    }

}

module.exports = VariableNode