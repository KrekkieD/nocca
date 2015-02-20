'use strict';

var $scenario = require('../lib_v2/scenario.js');

var t = new $scenario.Builder('Mandatory Profile Update - Missing Email');

t.sequentialScenario()
    .oneShot()
    .on('/customer')
    .title('Get Customer With Missing Email')
    .matchUsing(Matchers.gin('029387400'))





    //scenario.new('Mandatory Profile Update – Missing Email')
    //.sequentialScenario()
    //.oneShot()
    //.on(Endpoints.getCustomer)
    //.matchUsing(Matchers.gin, '029387400')
    //.respondWith(Responses.CustomerWithoutEmail)
    //.then()
    //.on(Endpoints.updateCustomer)
    //.matchUsing(Matchers.gin, '029387400')
    //.respondWith(Responses.CustomerWithoutEmailUpdated);
