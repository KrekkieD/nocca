'use strict';

var Nocca = require('../../index');

Nocca.$caches.newEndpoint('google', 'https://www.google.com/');

var endPoints = {
    'google': {
        targetBaseUrl: 'https://www.google.com/'
    },
    'MyA_CustomerApi_OAuth': {
        targetBaseUrl: 'https://api.ute2.klm.com/customerapi/'
    },
    'MyA_CustomerApi_Customer': {
        targetBaseUrl: 'https://api.ute2.klm.com/customerapi/'
    },
    'MyA_CustomerApi_Customers': {
        targetBaseUrl: 'https://api.ute2.klm.com/customerapi/'
    },
    'MyA_cpsdeleteaccount_000562v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cmscontent_v11': {
        'targetBaseUrl': 'https://services.ute1.klm.com/passenger/contentmanagement/CMS/'
    },
    'MyA_cpscreatepayment_000470v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_traveldb_listValueDouments_001075v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovidegin_000422v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovidesecret_000544v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpschecksecretanswer_000545v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_isisprovidemileagesummary_000462v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsupdateconnection_000433v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_isisprovidefbcommunicationlanguage_000524v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsdeletepayment_000471v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovide_000423v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsupdate_000443v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_osirishandleretroclaim_000888v01': {
        'targetBaseUrl': 'https://ws-qvi-dev.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsenroll_000431v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_geo_WSGeography': {
        'targetBaseUrl': 'https://services.ute3.klm.com/passenger/geography7/'
    },
    'MyA_cpsauthenticate_000420v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_mytrip_listFlightReservations_v20': {
        'targetBaseUrl': 'https://ws-qvi-dev.airfrance.fr/passenger/mytrip/listFlightReservations/'
    },
    'MyA_epasspayment_PaymentService': {
        'targetBaseUrl': 'https://services.ute1.klm.com/passenger/payment/PaymentService/'
    },
    'MyA_cpsgeneratepassword_000439v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_cpsprovidepayment_000469v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_osiristransferofflyingbluemiles_000530v02': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'MyA_osirislistngo_001006v01': {
        'targetBaseUrl': 'https://ws-qvi-rct.airfrance.fr/passenger/marketing/'
    },
    'Mya_CustomerApi_TestCustomerid': {
        'targetBaseUrl': 'https://api.ute2.klm.com/testcustomerid/'
    },
    'MyA_Crisp_Verify': {
        'targetBaseUrl': 'https://www.ite1.klm.com/ams/crisp/'
    },
    'MyA_Crisp_Logon': {
        'targetBaseUrl': 'https://www.ite1.klm.com/ams/crisp/'
    },
    'MyA_fbenroll_EnrollFBActionV2do': {
        'targetBaseUrl': 'https://b2c3evol3rct.airfrance.fr/FR/fr/local/myaccount/flyingblue/'
    },
    'MyA_Crisp_Logoff': {
        'targetBaseUrl':  'https://www.ite1.klm.com/ams/crisp/'
    },
    'Mya_CustomerApi_TestCustomers': {
        'targetBaseUrl': 'https://api.ute2.klm.com/testcustomers/'
    },
    'MyA_fbupgrade_UpgradeToFBActionV2do': {
        'targetBaseUrl': 'https://b2c3evol3rct.airfrance.fr/FR/fr/local/myaccount/flyingblue/'
    }
};


var targetConfig = {
    // specify endpoints config
    endPoints: endPoints,

    // NOTE: except for endpoints itself, all properties below can also be configured per endpoint

    // overrides default if desired
    keyGenerator: keyGenerator,
    // overrides default if desired
    endPointSelector: endPointSelector,
    // manipulate request before forwarding
    forwardRequestDecorator: forwardRequestDecorator,
    // manipulate mock before continuing with processing
    forwardResponseDecorator: forwardResponseDecorator,
    // set timeouts
    timeouts: {
        minSimulatedDelayMs: 160,
        maxSimulatedDelayMs: 240,
        fwdDelayTimeoutMs: 30000
    }
};

new Nocca(targetConfig);




function keyGenerator (flatRequest) {

    var keyObj = {};
    keyObj.url = flatRequest.url;
    keyObj.method = flatRequest.method;
    keyObj.body = flatRequest.body || null;
    keyObj.headers = {
        Accept: flatRequest.headers.Accept,
        'Content-Type': flatRequest.headers['Content-Type']
    };

    return JSON.stringify(keyObj);

}

function endPointSelector (flatRequest, endPoints) {

    // currently hardcoding to google
    return endPoints.google;

}

function forwardRequestDecorator (fwdFlatReq) {

    return fwdFlatReq;
}

function forwardResponseDecorator (mock) {

    return mock;

}