'use strict';
var $constants = require('../../constants');

var _ = require('lodash');

// This makes the Builder available as a 'static' resource (required for Scenario definitions)
module.exports = ScenarioTools;
module.exports.Builder = Builder;
module.exports.serializer = serializer;
module.exports.Matchers = {
    requestKeyMatcher: requestKeyMatcherBuilder,
    anyMatcher: anyMatcher
};

// This makes the ScenarioTools available as a non-static Nocca plugin (Nocca.scenario)
function ScenarioTools (Nocca) {

    this.Builder = module.exports.Builder;
    this.serializer = module.exports.serializer;
    this.Matchers = module.exports.Matchers;
    
    return this;

}

function Scenario (name, title) {
    this.name = name;
    this.title = title;
    this.states = {};
    this.initialStateKey = undefined;
    this.type = $constants.SCENARIO_TYPE_SEQUENTIAL;
    this.repeatable = $constants.SCENARIO_REPEATABLE_INFINITE;
}

// TODO: Refactor to defining edges instead of states

function noopCondition() {
    return true;
}

// Only capable of SEQUENTIAL for now
Scenario.prototype.player = function () {
    var dagStates = {};
    var that = this;
    Object.keys(this.states).forEach(function (key) {
        dagStates[key] = {state: that.states[key], edges: []};
    });
    Object.keys(dagStates).forEach(function (key) {
        dagStates[key].state.next.forEach(function (nextState) {
            dagStates[key].edges.push({condition: noopCondition, targetState: dagStates[nextState.name]});
        });
    });

    return new ScenarioPlayer(this, dagStates, this.initialStateKey, this.type);
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

function serializer(scenario) {

    var fileLines = [];

    Array.prototype.push.apply(fileLines, [
        "'use strict';",
        '',
        'module.exports = function (Scenario) {',
        '',
        '    var Responses = getResponses();',
        '',
        "    return new Scenario.Builder('" + scenario.name + "', '" + scenario.title + "')"
    ]);

    fileLines.push();

    if (scenario.type === $constants.SCENARIO_TYPE_SEQUENTIAL) {
        fileLines.push('    .sequentialScenario()');
    }

    if (scenario.repeatable === $constants.SCENARIO_REPEATABLE_ONE_SHOT) {
        fileLines.push('    .oneShot()');
    }
    else if (scenario.repeatable === $constants.SCENARIO_REPEATABLE_INFINITE) {
        fileLines.push('    .infiniteLoop()');
    }

    var collectedResponses = {};
    var initialStateGenerated = false;
    Object.keys(scenario.states).forEach(function (stateKey) {
        var state = scenario.states[stateKey];
        if (initialStateGenerated) {
            fileLines.push('    .then()');
        }
        initialStateGenerated = true;

        collectedResponses[state.name] = state.response;

        Array.prototype.push.apply(fileLines, [
            "    .on('" + state.endpointKey + "')",
            "    .name('" + state.name + "')",
            "    .title('" + state.title + "')",
            "    .matchUsing(Scenario.Matchers.requestKeyMatcher(Responses['" + state.name + "'].requestKey))",
            "    .respondWith(Responses['" + state.name + "'])"
        ]);

        if (state.hasOwnProperty('responseTransformer')) {
            fileLines.push("    .transformResponse('" + state.responseTransformer + "')");
        }

    });

    Array.prototype.push.apply(fileLines, [
        '    .build();',
        '}',
        '',
        'function getResponses () {',
        '    return ' + JSON.stringify(collectedResponses, null, 4) + ';',
        '}',
        ''
    ]);

    return fileLines.join('\n');
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

function ScenarioPlayer(scenario, stateRecords, initialKey, type) {
    this.scenario = scenario;
    this.stateRecords = stateRecords;
    this.initialKey = initialKey;
    this.finished = false;
    this.type = type;

    this.reset();
}

ScenarioPlayer.prototype.reset = function () {
    //Nocca.logInfo('Resetting scenario: ' + this.scenario.title);
    this.currentPosition = this.stateRecords[this.initialKey];
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

