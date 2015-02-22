'use strict';

module.exports = {};
module.exports.Builder = Builder;
var TYPE = module.exports.TYPE = {
    SEQUENTIAL: 0
};
var REPEATABLE = module.exports.REPEATABLE = {
    ONE_SHOT: 1,
    INFINITE: 1
};


function Scenario(title) {
    this.title = title;
    this.states = {};
    this.initialStateKey = undefined;
    this.type = TYPE.SEQUENTIAL;
    this.repeatable = REPEATABLE.INFINITE;
}

// Only capable of SEQUENTIAL for now
Scenario.prototype.buildStateDag = function() {
    var dagStates = {};
    var that = this;
    Object.keys(this.states).forEach(function(key) { dagStates[key] = {state: that.states[key], next: null}; });
    Object.keys(dagStates).forEach(function(key) { dagStates[key].next = dagStates[dagStates[key].state[0]]; });

    return new ScenarioPlayer(dagStates, this.initialStateKey, this.type);
};

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

function builderSetter(builderProperty, propertyName, propertyValue) {
    return function(param) {
        requireState(this);

        this[builderProperty][propertyName] = (typeof propertyValue !== 'undefined') ? propertyValue : param;
        return this;
    };
}

// -- Scenario Type
Builder.prototype.sequentialScenario = builderSetter('scenario', 'type', TYPE.SEQUENTIAL);

// -- Scenario Repeatability
Builder.prototype.oneShot = builderSetter('scenario', 'repeatable', REPEATABLE.ONE_SHOT);
Builder.prototype.infiniteLoop = builderSetter('scenario', 'repeatable', REPEATABLE.INFINITE);

// -- Request Description
Builder.prototype.then = function() {
    var previousState = this.currentState;
    finalizeState(this);
    requireState(this);
    previousState.next.push(this.currentState);

    return this;
};

Builder.prototype.on = builderSetter('currentState', 'endpointKey');
Builder.prototype.title = builderSetter('currentState', 'title');
Builder.prototype.name = builderSetter('currentState', 'name');

// -- Request matching
Builder.prototype.matchUsing = builderSetter('currentState', 'matcher');


// -- Response selection & transformation
Builder.prototype.respondWith = builderSetter('currentState', 'response');
Builder.prototype.transformResponse = builderSetter('currentState', 'responseTransformer');
Builder.prototype.delayBy = builderSetter('currentState', 'delay');


// -- Finalization
Builder.prototype.build = function() {
    finalizeState(this);
    
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
            builder.currentState.name = Object.keys(builder.scenario.states).length.toString();
        }
        builder.scenario.states[builder.currentState.name] = builder.currentState;
        if (typeof builder.scenario.initialStateKey === 'undefined') {
            builder.scenario.initialStateKey = builder.currentState.name;
        }
        builder.currentState = undefined;
    }
}

function ScenarioPlayer(stateRecords, initialKey, type) {
    this.stateRecords = stateRecords;
    this.initialKey = initialKey;
    this.finished = false;
    this.type = type;

    this.reset();
}

ScenarioPlayer.prototype.reset = function() {
    this.currentPosition = this.stateRecords[this.initialKey];
    this.finished = false;
};

ScenarioPlayer.prototype.next = function() {
    if (this.finished) { return this.finished; }

    this.currentPosition = this.currentPosition.next;
    if (typeof this.currentPosition === 'undefined') {
        // TODO: Could be replaced by 'finishHandler' strategy abstraction
        if (this.repeatable === REPEATABLE.ONE_SHOT) {
            this.finished = true;
        }
        else if (this.repeatable === REPEATABLE.INFINITE) {
            this.reset();
        }
    }
    return this.finished;
};


