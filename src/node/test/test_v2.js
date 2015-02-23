'use strict';

var $nocca2 = require('../index_v2');

var config = {
    endpoints: {
        'google': {
            targetBaseUrl: 'http://www.google.com/'
        },
        'yahoo': {
            targetBaseUrl: 'http://www.yahoo.com/'
        }
    }
};

var Matchers = {
    anyMatcher: function(reqContext) {
        return true;
    },
    ginInSoapBodyBuilder: function(gin) {
        var ginQuery = '<GIN>' + gin + '</GIN>';
        return function (reqContext) {
            return reqContext.request.body.indexOf(ginQuery) || false;
        };
    },
    ginInUrlBuilder: function(gin) {
        return function (reqContext) {
            return reqContext.request.url.split('/')[3] === gin || false;
        };
    }
};

var GoogleResponses = {
    "f1": {
        "statusCode": 404,
        "headers": {
            "content-type": "text/html; charset=UTF-8",
            "x-content-type-options": "nosniff",
            "date": "Mon, 23 Feb 2015 21:16:18 GMT",
            "server": "sffe",
            "content-length": "1435",
            "x-xss-protection": "1; mode=block",
            "alternate-protocol": "80:quic,p=0.08"
        },
        "body": "<!DOCTYPE html>\n<html lang=en>\n  <meta charset=utf-8>\n  <meta name=viewport content=\"initial-scale=1, minimum-scale=1, width=device-width\">\n  <title>Error 404 (Not Found)!!1</title>\n  <style>\n    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/errors/logo_sm_2.png) no-repeat}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/errors/logo_sm_2_hr.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:55px;width:150px}\n  </style>\n  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>\n  <p><b>404.</b> <ins>That’s an error.</ins>\n  <p>The requested URL <code>/sjampooooo</code> was not found on this server.  <ins>That’s all we know.</ins>\n"
    },
    "f2": {
        "statusCode": 404,
        "headers": {
            "content-type": "text/html; charset=UTF-8",
            "x-content-type-options": "nosniff",
            "date": "Mon, 23 Feb 2015 21:16:18 GMT",
            "server": "sffe",
            "x-xss-protection": "1; mode=block",
            "content-length": "1435",
            "alternate-protocol": "80:quic,p=0.08"
        },
        "body": "<!DOCTYPE html>\n<html lang=en>\n  <meta charset=utf-8>\n  <meta name=viewport content=\"initial-scale=1, minimum-scale=1, width=device-width\">\n  <title>Error 404 (Not Found)!!1</title>\n  <style>\n    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/errors/logo_sm_2.png) no-repeat}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/errors/logo_sm_2_hr.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:55px;width:150px}\n  </style>\n  Holadiee, dit is stap 2 ^_^  <ins>That’s all we know.</ins>\n"
    },
    "f3": {
        "statusCode": 200,
        "headers": {
            "content-type": "text/html; charset=UTF-8",
            "x-content-type-options": "nosniff",
            "date": "Mon, 23 Feb 2015 21:16:18 GMT",
            "server": "sffe",
            "x-xss-protection": "1; mode=block",
            "content-length": "1435",
            "alternate-protocol": "80:quic,p=0.08"
        },
        "body": "<!DOCTYPE html>\n<html lang=en>\nYahoooooo\n"
    }
};

var googleScenarioBuilder = new $nocca2.scenario.Builder('Google Test Scenario');

var googleScenario = googleScenarioBuilder.sequentialScenario()
    .infiniteLoop()
    .on('google')
    .title('Get Google BooBoo Page')
    .matchUsing(Matchers.anyMatcher)
    .respondWith(GoogleResponses.f1)
    .then()
    .on('google')
    .title('Get Google Woohoo Page')
    .matchUsing(Matchers.anyMatcher)
    .respondWith(GoogleResponses.f2)
    .then()
    .on('yahoo')
    .title('Get Yahoo Page')
    .matchUsing(Matchers.ginInUrlBuilder('1234'))
    .respondWith(GoogleResponses.f3)
    .build();
    
config.scenarios = [googleScenario];

$nocca2.setup(config);

