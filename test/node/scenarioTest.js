'use strict';

var $scenario = require('../../src/node/index').scenario;
var $keys     = require('../../src/node/index').keys;

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
var stateMachine = s.player();
console.log('----');
console.log(JSON.stringify(stateMachine, null, 2));
console.log('----');
console.log(JSON.stringify(stateMachine.next(), null, 2));
console.log('----');
console.log(JSON.stringify(stateMachine.next(), null, 2));
console.log('----');
console.log(JSON.stringify(stateMachine.next(), null, 2));
console.log('----');
console.log(JSON.stringify(stateMachine.next(), null, 2));
console.log('----');

    //scenario.new('Mandatory Profile Update � Missing Email')
    //.sequentialScenario()
    //.oneShot()
    //.on(Endpoints.getCustomer)
    //.matchUsing(Matchers.gin, '029387400')
    //.respondWith(Responses.CustomerWithoutEmail)
    //.then()
    //.on(Endpoints.updateCustomer)
    //.matchUsing(Matchers.gin, '029387400')
    //.respondWith(Responses.CustomerWithoutEmailUpdated);



var GoogleResponses = {
        "f1": {
            "requestKey": "{\"url\":\"/google/sjampoooo\",\"headers\":[\"accept-encoding:gzip, deflate, sdch\",\"accept-language:en-US,en;q=0.8,nl;q=0.6\",\"accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\",\"cache-control:max-age=0\",\"connection:keep-alive\",\"host:localhost:3003\",\"user-agent:Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36\"],\"method\":\"GET\"}",
            "hits": 0,
            "statusCode": 404,
            "headers": {
                "X-Content-Type-Options": "nosniff",
                "Date": "Mon, 23 Feb 2015 10:15:30 GMT",
                "Server": "sffe",
                "X-Xss-Protection": "1; mode=block",
                "Alternate-Protocol": "80:quic,p=0.08",
                "Content-Length": "1434",
                "Content-Type": "text/html; charset=UTF-8",
                "Via": "1.1 WSA2.klm.com:80 (Cisco-WSA/8.0.6-119)",
                "Connection": "keep-alive"
            },
            "body": "<!DOCTYPE html>\n<html lang=en>\n <meta charset=utf-8>\n <meta name=viewport content=\"initial-scale=1, minimum-scale=1, width=device-width\">\n <title>Error 404 (Not Found)!!1</title>\n <style>\n *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/errors/logo_sm_2.png) no-repeat}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/errors/logo_sm_2_hr.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:55px;width:150px}\n </style>\n <a href=//www.google.com/><span id=logo aria-label=Google></span></a>\n <p><b>404.</b> <ins>That’s an error.</ins>\n <p>The requested URL <code>/sjampoooo</code> was not found on this server. <ins>That’s all we know.</ins>\n"
        },
        "f2": {
            "requestKey": "{\"url\":\"/google/sjampooooooo/jolo\",\"headers\":[\"accept-encoding:gzip, deflate, sdch\",\"accept-language:en-US,en;q=0.8,nl;q=0.6\",\"accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\",\"cache-control:max-age=0\",\"connection:keep-alive\",\"host:localhost:3003\",\"user-agent:Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36\"],\"method\":\"GET\"}",
            "hits": 0,
            "statusCode": 200,
            "headers": {
                "X-Content-Type-Options": "nosniff",
                "Date": "Mon, 23 Feb 2015 12:49:24 GMT",
                "Server": "sffe",
                "X-Xss-Protection": "1; mode=block",
                "Alternate-Protocol": "80:quic,p=0.08",
                "Content-Length": "1442",
                "Content-Type": "text/html; charset=UTF-8",
                "Via": "1.1 WSA2.klm.com:80 (Cisco-WSA/8.0.6-119)",
                "Connection": "keep-alive"
            },
            "body": "<!DOCTYPE html>\n<html lang=en>\n <meta charset=utf-8>\n <meta name=viewport content=\"initial-scale=1, minimum-scale=1, width=device-width\">\n <title>Error 404 (Not Found)!!1</title>\n <style>\n *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/errors/logo_sm_2.png) no-repeat}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/errors/logo_sm_2_hr.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:55px;width:150px}\n </style>\n Holadieeeeeeeee, dit is stap2 ^_^_^_^\n"
        }
};