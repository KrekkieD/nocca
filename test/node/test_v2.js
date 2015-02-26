'use strict';

var $nocca = require('../../index');

var config = {
    endpoints: {
        'google': {
            targetBaseUrl: 'http://www.google.com/'
        },
        'yahoo': {
            targetBaseUrl: 'http://www.yahoo.com/'
        },
        'MyA_CustomerApi_Customers': {
            targetBaseUrl: 'https://api.ite1.klm.com/customerapi-develop/'
        },
        'customerapi-oauth': {
            targetBaseUrl: 'https://api.ite1.klm.com/customerapi-develop/'
        },
        'MyA_CustomerApi_Customer': {
            targetBaseUrl: 'https://api.ite1.klm.com/customerapi-develop/'
        },
        'MyA_Crisp_Logoff': {
            targetBaseUrl: 'https://www.ite2.klm.com/ams/crisp/'
        },
        'MyA_Crisp_Logon': {
            targetBaseUrl: 'https://www.ite2.klm.com/ams/crisp/'
        },
        'MyA_Crisp_Verify': {
            targetBaseUrl: 'https://www.ite2.klm.com/ams/crisp/'
        },
        'MyA_fbupgrade_UpgradeToFBActionV2do': {
            targetBaseUrl: 'https://b2c-evol4rct3-rct.airfrance.fr/FR/fr/local/myaccount/flyingblue/UpgradeToFBActionV2.do'
        },
        'MyA_fbenroll_EnrollFBActionV2do': {
            targetBaseUrl: 'https://b2c-evol4rct3-rct.airfrance.fr/FR/fr/local/myaccount/flyingblue/EnrollFBActionV2.do'
        },
        'MyA_traveldb_listValueDouments_001075v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/distribmgmt/001075v01'
        },
        'MyA_mytrip_listFlightReservations_v20': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/mytrip/listFlightReservations/V2.0'
        },
        'MyA_osiristransferofflyingbluemiles_000530v02': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000530v03'
        },
        'MyA_osirislistngo_001006v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/001006v01'
        },
        'MyA_osirishandleretroclaim_000888v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000888v01'
        },
        'MyA_cpschecksecretanswer_000545v02': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000545v02'
        },
        'MyA_cmscontent_v11': {
            targetBaseUrl: 'https://services.ite2.klm.com/passenger/contentmanagement/CMS/v1.1'
        },
        'MyA_geo_WSGeography': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/geography7/WSGeography'
        },
        'MyA_epasspayment_PaymentService': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/payment/GetPaymentConfiguration/v1.0'
        },
        'MyA_isisprovidefbcommunicationlanguage_000524v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000524v01'
        },
        'MyA_isisprovidemileagesummary_000462v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000462v01'
        },
        'MyA_cpsgeneratepassword_000439v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000439v01'
        },
        'MyA_cpsprovidegin_000422v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000422v01'
        },
        'MyA_cpsprovidesecret_000544v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000544v01'
        },
        'MyA_cpsdeletepayment_000471v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000471v01'
        },
        'MyA_cpscreatepayment_000470v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000470v01'
        },
        'MyA_cpsprovidepayment_000469v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000469v01'
        },
        'MyA_cpsupdateconnection_000433v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000433v02'
        },
        'MyA_cpsupdate_000443v02': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000443v05'
        },
        'MyA_cpsdeleteaccount_000562v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000562v01'
        },
        'MyA_cpsprovide_000423v01': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000423v04'
        },
        'MyA_cpsauthenticate_000420v02': {
            targetBaseUrl: 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/000420v02'
        }

    },
    playback: {
        recorder: $nocca.$scenarioRecorder.scenarioEntryRecorderFactory($nocca.$playback.addRecording)
        
    },
    scenarios: {
        writeNewScenarios: true,
        scenarioOutputDir: 'D:/dev/tmp/'
        
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

var googleScenarioBuilder = new $nocca.$scenario.Builder('google', 'Google Test Scenario');

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
    
config.scenarios.available = [googleScenario];

$nocca(config);

