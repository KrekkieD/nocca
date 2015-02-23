'use strict';

module.exports = {};
module.exports.Builder = Builder;
var TYPE = module.exports.TYPE = {
    SEQUENTIAL: 0
};
var REPEATABLE = module.exports.REPEATABLE = {
    ONE_SHOT: 1,
    INFINITE: 2
};


function Scenario(title) {
    this.title = title;
    this.states = {};
    this.initialStateKey = undefined;
    this.type = TYPE.SEQUENTIAL;
    this.repeatable = REPEATABLE.INFINITE;
}

// TODO: Refactor to defining edges instead of states

function noopCondition() {
    return true;
}

// Only capable of SEQUENTIAL for now
Scenario.prototype.player = function() {
    var dagStates = {};
    var that = this;
    Object.keys(this.states).forEach(function(key) { dagStates[key] = {state: that.states[key], edges: []}; });
    Object.keys(dagStates).forEach(function(key) {
        dagStates[key].state.next.forEach(function(nextState) { dagStates[key].edges.push({condition: noopCondition, targetState: dagStates[nextState.name]}); });
    });

    return new ScenarioPlayer(this, dagStates, this.initialStateKey, this.type);
};

Scenario.Trigger = function() {
    this.title = undefined;
    this.condition = undefined;
    this.response = undefined;
    
}

Scenario.State = function() {
    this.name = undefined;
    this.title = undefined;
    this.endpoint = undefined;
    this.next = [];
};

function Builder() {
    this.scenario = new Scenario();
    this.currentState = undefined;
    this.built = false;
    
    return this;
}

function builderSetter(builderProperty, propertyName, requiresState, propertyValue) {
    return function(param) {
        if (requiresState === true) { requireState(this); }

        this[builderProperty][propertyName] = (typeof propertyValue !== 'undefined') ? propertyValue : param;
        return this;
    };
}

// -- Scenario Type
Builder.prototype.sequentialScenario = builderSetter('scenario', 'type', false, TYPE.SEQUENTIAL);

// -- Scenario Repeatability
Builder.prototype.oneShot = builderSetter('scenario', 'repeatable', false, REPEATABLE.ONE_SHOT);
Builder.prototype.infiniteLoop = builderSetter('scenario', 'repeatable', false, REPEATABLE.INFINITE);

// -- Request Description
Builder.prototype.then = function() {
    if (typeof this.currentState === 'undefined') { throw Error('Cannot call then before any state has been created'); }
    
    var previousState = this.currentState;
    finalizeState(this);
    requireState(this);
    previousState.next.push(this.currentState);

    return this;
};

Builder.prototype.on = builderSetter('currentState', 'endpointKey', true);
Builder.prototype.title = builderSetter('currentState', 'title', true);
Builder.prototype.name = builderSetter('currentState', 'name', true);

// -- Request matching
Builder.prototype.matchUsing = builderSetter('currentState', 'matcher', true);


// -- Response selection & transformation
Builder.prototype.respondWith = builderSetter('currentState', 'response', true);
Builder.prototype.transformResponse = builderSetter('currentState', 'responseTransformer', true);
Builder.prototype.delayBy = builderSetter('currentState', 'delay', true);


// -- Finalization
Builder.prototype.build = function() {
    finalizeState(this);
    
    this.built = true;
    
    return this.scenario;
};

// Private functions used by the Builder
function requireState(builder) {
    if (builder.built) { throw Error('Builder has already been built'); }
    if (!builder.currentState) {
        builder.currentState = new Scenario.State();
    }
}

function finalizeState(builder) {
    if (builder.currentState) {
        if (typeof builder.currentState.name === 'undefined') {
            builder.currentState.name = 'state-' + Object.keys(builder.scenario.states).length.toString();
        }
        builder.scenario.states[builder.currentState.name] = builder.currentState;
        if (typeof builder.scenario.initialStateKey === 'undefined') {
            builder.scenario.initialStateKey = builder.currentState.name;
        }
        builder.currentState = undefined;
    }
}

function ScenarioPlayer(scenario, stateRecords, initialKey, type) {
    this.scenario = scenario;
    this.stateRecords = stateRecords;
    this.initialKey = initialKey;
    this.finished = false;
    this.type = type;

    this.reset();
}

ScenarioPlayer.prototype.reset = function() {
    console.log('|      Resetting scenario: ' + this.scenario.title);
    this.currentPosition = this.stateRecords[this.initialKey];
    this.finished = false;
};

ScenarioPlayer.prototype.next = function() {
    if (this.finished) { return this.finished; }

    var eligibleEdges = [];
    this.currentPosition.edges.forEach(function(edge) { if (edge.condition()) { eligibleEdges.push(edge.targetState); } });
    
    // get first eligible state
    console.log('|      Number of eligible edges: ' + eligibleEdges.length);
    if (eligibleEdges.length === 0) {
        // TODO: Could be replaced by 'finishHandler' strategy abstraction
        if (this.scenario.repeatable === REPEATABLE.ONE_SHOT) {
            this.finished = true;
        }
        else if (this.repeatable === REPEATABLE.INFINITE) {
            this.reset();
        }
    }
    else {
        this.currentPosition = eligibleEdges[0];
    }
    return this.finished;
};


