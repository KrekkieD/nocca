'use strict';

var _ = require('lodash');
var $nocca = require('nocca');

var Responses = {
  "state-0": {
    "requestKey": "{\"url\":\"/google/sjampoo\"}",
    "endpointKey": "google",
    "playbackResponse": {
      "type": "RESPONSE",
      "statusCode": 404,
      "headers": {
        "x-content-type-options": "nosniff",
        "date": "Tue, 07 Apr 2015 12:12:05 GMT",
        "server": "sffe",
        "x-xss-protection": "1; mode=block",
        "alternate-protocol": "80:quic,p=0.5",
        "content-length": "1432",
        "content-type": "text/html; charset=UTF-8",
        "via": "1.1 WSA2.klm.com:80 (Cisco-WSA/8.0.6-119)",
        "connection": "keep-alive"
      },
      "body": "<!DOCTYPE html>\n<html lang=en>\n  <meta charset=utf-8>\n  <meta name=viewport content=\"initial-scale=1, minimum-scale=1, width=device-width\">\n  <title>Error 404 (Not Found)!!1</title>\n  <style>\n    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/errors/logo_sm_2.png) no-repeat}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/errors/logo_sm_2_hr.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:55px;width:150px}\n  </style>\n  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>\n  <p><b>404.</b> <ins>That’s an error.</ins>\n  <p>The requested URL <code>/sjampoo</code> was not found on this server.  <ins>That’s all we know.</ins>\n"
    }
  },
  "state-1": {
    "requestKey": "{\"url\":\"/google/sjampoooo\"}",
    "endpointKey": "google",
    "playbackResponse": {
      "type": "RESPONSE",
      "statusCode": 404,
      "headers": {
        "x-content-type-options": "nosniff",
        "date": "Tue, 07 Apr 2015 12:12:07 GMT",
        "server": "sffe",
        "x-xss-protection": "1; mode=block",
        "alternate-protocol": "80:quic,p=0.5",
        "content-length": "1434",
        "content-type": "text/html; charset=UTF-8",
        "via": "1.1 WSA2.klm.com:80 (Cisco-WSA/8.0.6-119)",
        "connection": "keep-alive"
      },
      "body": "<!DOCTYPE html>\n<html lang=en>\n  <meta charset=utf-8>\n  <meta name=viewport content=\"initial-scale=1, minimum-scale=1, width=device-width\">\n  <title>Error 404 (Not Found)!!1</title>\n  <style>\n    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/errors/logo_sm_2.png) no-repeat}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/errors/logo_sm_2_hr.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:55px;width:150px}\n  </style>\n  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>\n  <p><b>404.</b> <ins>That’s an error.</ins>\n  <p>The requested URL <code>/sjampoooo</code> was not found on this server.  <ins>That’s all we know.</ins>\n"
    }
  },
  "state-2": {
    "requestKey": "{\"url\":\"/google/sjampoooooo\"}",
    "endpointKey": "google",
    "playbackResponse": {
      "type": "RESPONSE",
      "statusCode": 404,
      "headers": {
        "x-content-type-options": "nosniff",
        "date": "Tue, 07 Apr 2015 12:12:08 GMT",
        "server": "sffe",
        "x-xss-protection": "1; mode=block",
        "alternate-protocol": "80:quic,p=0.5",
        "content-length": "1436",
        "content-type": "text/html; charset=UTF-8",
        "via": "1.1 WSA2.klm.com:80 (Cisco-WSA/8.0.6-119)",
        "connection": "keep-alive"
      },
      "body": "<!DOCTYPE html>\n<html lang=en>\n  <meta charset=utf-8>\n  <meta name=viewport content=\"initial-scale=1, minimum-scale=1, width=device-width\">\n  <title>Error 404 (Not Found)!!1</title>\n  <style>\n    *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/errors/logo_sm_2.png) no-repeat}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/errors/logo_sm_2_hr.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/errors/logo_sm_2_hr.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:55px;width:150px}\n  </style>\n  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>\n  <p><b>404.</b> <ins>That’s an error.</ins>\n  <p>The requested URL <code>/sjampoooooo</code> was not found on this server.  <ins>That’s all we know.</ins>\n"
    }
  }
};

module.exports = new $nocca.$scenario.Builder('google', 'googles')
    .sequentialScenario()
    .infiniteLoop()
    .on('google')
    .name('state-0')
    .title('undefined')
    .matchUsing($nocca.$scenario.Matchers.requestKeyMatcher(Responses['state-0'].requestKey))
    .respondWith(Responses['state-0'])
    .delayBy(0)
    .then()
    .on('google')
    .name('state-1')
    .title('undefined')
    .matchUsing($nocca.$scenario.Matchers.requestKeyMatcher(Responses['state-1'].requestKey))
    .respondWith(Responses['state-1'])
    .delayBy(0)
    .then()
    .on('google')
    .name('state-2')
    .title('undefined')
    .matchUsing($nocca.$scenario.Matchers.requestKeyMatcher(Responses['state-2'].requestKey))
    .respondWith(Responses['state-2'])
    .delayBy(0)
    .build();