'use strict';

module.exports = {};
module.exports.builder = Scenario.Builder;
var TYPE = module.exports.TYPE = {
    SEQUENTIAL: 0
};
var REPEATABLE = module.exports.REPEATABLE = {
    ONE_SHOT: 1,
    INFINITE: 1
};

var scenarioData = {
    states: {


    },
    currentState: '0'

};


function Scenario(title) {
    this.title = title;
    
}

Scenario.State = function() {
    this.name = undefined;
    this.title = undefined;
    this.endpoint = undefined;
    this.type = TYPE.SEQUENTIAL;
    this.repeatable = REPEATABLE.INFINITE;
};

Scenario.Builder = function() {
    this.scenario = new Scenario();
    this.currentState = undefined;
    
    return this;
};

// -- Scenario Type
Scenario.Builder.prototype.sequentialScenario = function() {
    this.scenario.type = TYPE.SEQUENTIAL;
};

// -- Scenario Repeatability
Scenario.Builder.prototype.oneShot = function() {
    this.scenario.repeatable = REPEATABLE.ONE_SHOT;
};

Scenario.Builder.prototype.infiniteLoop = function() {
    this.scenario.repeatable = REPEATABLE.INFINITE;
};

// -- Request Description
Scenario.Builder.prototype.then = function() {
    finalizeStateAndCreateNew(this);

    return this;
};

function stateBuilderSetter(propertyName) {
    return function(param) {
        requireState(this);
        
        this.currentState[propertyName] = param;
        return this;
    };
}

Scenario.Builder.prototype.on = stateBuilderSetter('endpointKey');
Scenario.Builder.prototype.title = stateBuilderSetter('title');

// -- Request matching
Scenario.Builder.prototype.matchUsing = stateBuilderSetter('matcher');
//Scenario.Builder.prototype.


// Private functions used by the Builder
function requireState(builder) {
    if (!builder.currentState) {
        builder.currentState = new Scenario.State();
    }
}

function finalizeStateAndCreateNew (builder) {
    if (builder.currentState) {
        builder.scenario.states[builder.currentState.name || Object.keys(builder.scenario.states).length] = builder.currentState;
    }
    builder.currentState = new Scenario.State();
}