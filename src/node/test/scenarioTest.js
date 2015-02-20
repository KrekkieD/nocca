'use strict';

var $scenario = require('../lib_v2/scenario');
var $keys     = require('../lib_v2/keys');

var t = new $scenario.Builder('Mandatory Profile Update - Missing Email');

var Matchers = {
    gin: function(gin) {
        return function() {
            
            
        };
        
    }
    
};

var Responses = {
    CustomerWithoutEmail: '',
    CustomerUpdateWithEmail: '',
    CustomerWithEmail: ''
};

var s = t.sequentialScenario()
    .oneShot()
    .on('/customer')
    .title('Get Customer With Missing Email')
    .matchUsing(Matchers.gin('029387400'))
    .respondWith(Responses.CustomerWithoutEmail)
    .delayBy(10)
    .then()
    .on('/MyA_update_account')
    .title('Update Customer With New Email')
    .matchUsing(Matchers.gin('029387400'))
    .respondWith(Responses.CustomerUpdateWithEmail)
    .then()
    .on('/MyA_provide_comment')
    .title('Get Customer With Corrected Email')
    .matchUsing(Matchers.gin('029387400'))
    .respondWith(Responses.CustomerWithEmail)
    .build();




           console.log(JSON.stringify(s, null, 2));

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
