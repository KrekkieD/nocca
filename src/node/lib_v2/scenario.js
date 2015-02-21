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
    this.type = TYPE.SEQUENTIAL;
    this.repeatable = REPEATABLE.INFINITE;
}

Scenario.prototype.buildStateDag = function() {

};

Scenario.State = function() {
    this.name = undefined;
    this.title = undefined;
    this.endpoint = undefined;
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
    finalizeStateAndCreateNew(this);

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
    
    finalizeStateAndCreateNew(this);
    
    return this.scenario;
    
};

// Private functions used by the Builder
function requireState(builder) {
    if (builder.built) { throw Error('Builder has already been built'); }
    if (!builder.currentState) {
        builder.currentState = new Scenario.State();
    }
}

function finalizeStateAndCreateNew (builder) {
    if (builder.currentState) {
        if (typeof builder.currentState.name === 'undefined') {
            builder.currentState.name = Object.keys(builder.scenario.states).length.toString();
            
        }
        builder.scenario.states[builder.currentState.name] = builder.currentState;
        builder.currentState = undefined;
    }
    requireState(builder);
}