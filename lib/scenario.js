'use strict';
var $constants = require('./constants');

var _ = require('lodash');
var $extend = require('extend');

// This makes the Builder available as a 'static' resource (required for Scenario definitions)
module.exports = ScenarioTools;
module.exports.Builder = Builder;
module.exports.Serializer = Serializer;
module.exports.Matchers = {
    requestKeyMatcher: requestKeyMatcherBuilder,
    anyMatcher: anyMatcher
};

// This makes the ScenarioTools available as a non-static Nocca plugin (Nocca.scenario)
function ScenarioTools (Nocca) {

    this.Builder = module.exports.Builder;
    this.Serializer = module.exports.Serializer;
    this.Matchers = module.exports.Matchers;
    
    return this;

}

var ScenarioMetaModel = {
    key: function() { throw new Error('A key is mandatory for the scenario'); },
    title: function() { return 'Nameless Scenario'; },
    repeatability: function() { return $constants.Scenarios.Repeatability.INFINITE; },
    type: function() { return $constants.Scenarios.Type.SEQUENTIAL; },
    sequence: function() { throw new Error('Scenario must have a sequence to run'); }
};

function Scenario (model) {
    var input = $extend(true, {}, model);
    var self = this;
    
    _.each(_.keys(ScenarioMetaModel), function(prop) { 
        if (input.hasOwnProperty(prop)) {
            self[prop] = input[prop];
            delete input[prop];
        }
        else {
            self[prop] = ScenarioMetaModel[prop]();
        }
    });
    
    _.each(_.keys(input), function(prop) {
        console.log('Warning, scenario property not understood and ignored: ' + prop);
    });
}


// TODO: Refactor to defining edges instead of states

function noopCondition() {
    return true;
}

// Only capable of SEQUENTIAL for now
Scenario.prototype.player = function () {
    return new ScenarioPlayer(this);
};

Scenario.Trigger = function () {
    this.title = undefined;
    this.condition = undefined;
    this.response = undefined;

};

Scenario.State = function () {
    this.name = undefined;
    this.title = undefined;
    this.endpoint = undefined;
    this.delay = 0;
    this.timeout = false;
    this.next = [];
};

function Builder(name, title) {
    this.scenario = new Scenario(name, title);
    this.currentState = undefined;
    this.built = false;

    return this;
}

function Serializer(scenario) {
    // TODO: EEEWWWWWWWWW
    var filePreamble = "'use strict';\n\nvar _ = require('lodash');\nvar $nocca = require('nocca');\n\n";

    var builderCode = "\n\nmodule.exports = new $nocca.$scenario.Builder('" + scenario.name + "', '" + scenario.title + "')\n";
    if (scenario.type === $constants.SCENARIO_TYPE_SEQUENTIAL) {
        builderCode += "    .sequentialScenario()\n";
    }

    if (scenario.repeatable === $constants.SCENARIO_REPEATABLE_ONE_SHOT) {
        builderCode += "    .oneShot()\n";
    }
    else if (scenario.repeatable === $constants.SCENARIO_REPEATABLE_INFINITE) {
        builderCode += "    .infiniteLoop()\n";
    }

    var collectedResponses = {};
    var initialStateGenerated = false;
    Object.keys(scenario.states).forEach(function (stateKey) {
        var state = scenario.states[stateKey];
        if (initialStateGenerated) {
            builderCode += "    .then()\n";
        }
        initialStateGenerated = true;

        builderCode += "    .on('" + state.endpointKey + "')\n";
        builderCode += "    .name('" + state.name + "')\n";
        builderCode += "    .title('" + state.title + "')\n";
        builderCode += "    .matchUsing($nocca.$scenario.Matchers.requestKeyMatcher(Responses['" + state.name + "'].requestKey))\n";
        collectedResponses[state.name] = state.response;
        builderCode += "    .respondWith(Responses['" + state.name + "'])\n";
        if (state.hasOwnProperty('responseTransformer')) {
            builderCode += "    .transformResponse('" + state.responseTransformer + "')\n";
        }
        if (state.hasOwnProperty('delay')) {
            builderCode += "    .delayBy(" + state.delay + ")\n";

        }

    });

    builderCode += "    .build();";

    var responsesCode = 'var Responses = ' + JSON.stringify(collectedResponses, null, 2) + ';';

    return filePreamble + responsesCode + builderCode;
}

function builderSetter(builderProperty, propertyName, requiresState, propertyValue) {
    return function (param) {
        if (requiresState === true) {
            requireState(this);
        }

        this[builderProperty][propertyName] = (typeof propertyValue !== 'undefined') ? propertyValue : param;
        return this;
    };
}

Builder.prototype.isBuildingState = function () {
    return typeof this.currentState !== 'undefined';
};

// -- Scenario Type
Builder.prototype.sequentialScenario = builderSetter('scenario', 'type', false, $constants.SCENARIO_TYPE_SEQUENTIAL);

// -- Scenario Repeatability
Builder.prototype.oneShot = builderSetter('scenario', 'repeatable', false, $constants.SCENARIO_REPEATABLE_ONE_SHOT);
Builder.prototype.infiniteLoop = builderSetter('scenario', 'repeatable', false, $constants.SCENARIO_REPEATABLE_INFINITE);

// -- Request Description
Builder.prototype.then = function () {
    if (typeof this.currentState === 'undefined') {
        throw Error('Cannot call then before any state has been created');
    }

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
Builder.prototype.timeout = builderSetter('currentState', 'timeout', true);


// -- Finalization
Builder.prototype.build = function () {
    finalizeState(this);

    this.built = true;

    return this.scenario;
};

// Private functions used by the Builder
function requireState(builder) {
    if (builder.built) {
        throw Error('Builder has already been built');
    }
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

function ScenarioPlayer(scenario) {
    this.scenario = scenario;
    this.currentStep = 0;
    this.currentPosition = scenario.sequence[this.currentStep];
    this.finished = false;

    this.reset();
}

ScenarioPlayer.prototype.reset = function () {
    this.currentPosition = this.scenario.sequence[this.currentStep = 0];
    this.finished = false;
};

ScenarioPlayer.prototype.next = function () {
    if (this.finished) {
        return this.finished;
    }

    var eligibleEdges = [];
    this.currentPosition.edges.forEach(function (edge) {
        if (edge.condition()) {
            eligibleEdges.push(edge.targetState);
        }
    });

    // get first eligible state
    // TODO: replace log with Nocca logger once this is an instance
    console.log('Number of eligible edges: ' + eligibleEdges.length);
    if (eligibleEdges.length === 0) {
        // TODO: Could be replaced by 'finishHandler' strategy abstraction
        if (this.scenario.repeatable === $constants.SCENARIO_REPEATABLE_ONE_SHOT) {
            this.finished = true;
        }
        else { // if (this.repeatable === $constants.SCENARIO_REPEATABLE_INFINITE) {
            this.reset();
        }
    }
    else {
        this.currentPosition = eligibleEdges[0];
    }
    return this.finished;
};


// --- Default matchers

function requestKeyMatcherBuilder(requiredKey) {
    return function (reqContext) {
        return _.isEqual(requiredKey, reqContext.requestKey);
    };
}

function anyMatcher(reqContext) {
    return true;
}

