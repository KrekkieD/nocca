'use strict';

var _ = require('lodash');
var $nocca = require('../index_v2');

var Responses = {
  "state-0": {
    "requestKey": "{\"url\":\"/MyA_cpsauthenticate_000420v02/000420v02\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1723\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"http://www.af-klm.com/services/passenger/AuthenticateAnIndividualService-v2/authenticateAnIndividual\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Server": "Apache-Coyote/1.1",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:24 GMT",
      "X-Client-Ip": "10.60.47.8"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>W90000420</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T10:11:23.315Z</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:2f35d60e-fc3b-4262-aa36-ac5ad5e8b314</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:28733774-9d60-4287-9e65-30269579b78a</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:28733774-9d60-4287-9e65-30269579b78a</RelatesTo></S:Header><S:Body><ns5:AuthenticateAnIndividualResponseV2Element xmlns:ns5=\"http://www.af-klm.com/services/passenger/AuthenticateAnIndividualType-v1/xsd\" xmlns:ns4=\"http://www.af-klm.com/services/passenger/SoftComputingType-v1/xsd\" xmlns:ns3=\"http://www.af-klm.com/services/passenger/SicIndividuType-v1/xsd\" xmlns:ns2=\"http://www.af-klm.com/services/common/SystemFault-v1/xsd\"><GIN>400447845205</GIN><FoundIdentifier>FP</FoundIdentifier></ns5:AuthenticateAnIndividualResponseV2Element></S:Body></S:Envelope>"
  },
  "state-1": {
    "requestKey": "{\"url\":\"/MyA_cpsprovide_000423v01/000423v04\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:2034\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"http://www.af-klm.com/services/passenger/ProvideMyAccountCustomerDataService-v4/provideMyAccountCustomerDataByIdentifier\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Server": "Apache-Coyote/1.1",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:24 GMT",
      "X-Client-Ip": "10.60.47.8"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>W90000423</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T10:11:24.055Z</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:67232cbc-aff0-40d2-8293-74fb368815a5</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:ca5ba8e2-b131-41d9-8461-c05017857499</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:ca5ba8e2-b131-41d9-8461-c05017857499</RelatesTo></S:Header><S:Body><ns5:MyAccountCustomerDataResponseElement xmlns:ns8=\"http://www.af-klm.com/services/passenger/response-v1/xsd\" xmlns:ns7=\"http://www.af-klm.com/services/passenger/SicCommonType-v1/xsd\" xmlns:ns6=\"http://www.af-klm.com/services/passenger/SicIndividuType-v1/xsd\" xmlns:ns5=\"http://www.af-klm.com/services/passenger/data-v1/xsd\" xmlns:ns4=\"http://www.af-klm.com/services/passenger/SicMarketingType-v1/xsd\" xmlns:ns3=\"http://www.af-klm.com/services/passenger/SoftComputingType-v1/xsd\" xmlns:ns2=\"http://www.af-klm.com/services/common/SystemFault-v1/xsd\"><emailResponse><email><version>1</version><mediumStatus>V</mediumStatus><mediumCode>D</mediumCode><email>bla_20150121_06@bla.nl</email><emailOptin>T</emailOptin></email><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:39Z</date></signature><signature><signatureType>C</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:39Z</date></signature></emailResponse><telecomResponse><telecom><version>3</version><mediumStatus>V</mediumStatus><terminalType>T</terminalType><countryCode>31</countryCode><phoneNumber>0612345678</phoneNumber></telecom><signature><signatureType>C</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><telecomFlags><flagInvalidFixTelecom>false</flagInvalidFixTelecom><flagInvalidMobileTelecom>false</flagInvalidMobileTelecom><flagNoValidNormalizedTelecom>false</flagNoValidNormalizedTelecom></telecomFlags><telecomNormalization><internationalPhoneNumber>+31612345678</internationalPhoneNumber></telecomNormalization></telecomResponse><telecomResponse><telecom><version>3</version><mediumStatus>V</mediumStatus><terminalType>M</terminalType><countryCode>31</countryCode><phoneNumber>0201234567</phoneNumber></telecom><signature><signatureType>C</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><telecomFlags><flagInvalidFixTelecom>false</flagInvalidFixTelecom><flagInvalidMobileTelecom>false</flagInvalidMobileTelecom><flagNoValidNormalizedTelecom>false</flagNoValidNormalizedTelecom></telecomFlags><telecomNormalization><internationalPhoneNumber>+31201234567</internationalPhoneNumber></telecomNormalization></telecomResponse><postalAddressResponse><usageAddress><applicationCode>ISI</applicationCode><usageNumber>1</usageNumber><addressRoleCode>M</addressRoleCode></usageAddress><postalAddressContent><numberAndStreet>KAASHOEVE 3</numberAndStreet><city>HOUTEN</city><zipCode>3992 NG</zipCode><countryCode>NL</countryCode></postalAddressContent><postalAddressProperties><indicAdrNorm>false</indicAdrNorm><version>1</version><mediumCode>D</mediumCode><mediumStatus>V</mediumStatus></postalAddressProperties><signature><signatureType>C</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:32Z</date></signature><signature><signatureType>M</signatureType><signatureSite>ISI</signatureSite><signature>Ajout Usage</signature><date>2015-01-21T07:55:32Z</date></signature></postalAddressResponse><individualResponse><individualInformations><identifier>400447845205</identifier><version>12</version><gender>F</gender><birthDate>1984-01-01T00:00:00Z</birthDate><flagNoFusion>false</flagNoFusion><status>V</status><flagThirdTrap>false</flagThirdTrap><civility>MISS</civility><lastNameSC>TESTER</lastNameSC><firstNameSC>PIET</firstNameSC><languageCode>EN</languageCode></individualInformations><signature><signatureType>C</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:32Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:40Z</date></signature><normalizedName><lastName>TESTER</lastName><firstName>PIET</firstName></normalizedName></individualResponse><contractResponse><contract><contractNumber>380050AK</contractNumber><contractType>C</contractType><productType>MA</productType><contractStatus>C</contractStatus><validityStartDate>2015-01-21T07:55:35Z</validityStartDate></contract><signature><signatureType>C</signatureType><signatureSite>SIC WS</signatureSite><signature>AUTHENT MYACCNT</signature><date>2015-01-21T07:55:35Z</date></signature></contractResponse><contractResponse><contract><contractNumber>001101051150</contractNumber><contractType>C</contractType><productType>FP</productType><companyContractType>AF</companyContractType><contractStatus>C</contractStatus><tierLevel>A</tierLevel></contract><signature><signatureType>M</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:33Z</date></signature><signature><signatureType>C</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:33Z</date></signature></contractResponse><flyingBlueContractDataResponse><flyingBlueContractData><startMemberShipDate>2015-01-21T00:00:00Z</startMemberShipDate><endMemberShipDate>2099-12-31T00:00:00Z</endMemberShipDate><amexContract>false</amexContract><cbcContract>false</cbcContract><status>C</status><statusFB>*</statusFB><tierLevel>A</tierLevel><welcomeBonus>false</welcomeBonus><subtier>99</subtier><startTierLevelDate>2015-01-21T00:00:00Z</startTierLevelDate><endTierLevelDate>2099-12-31T00:00:00Z</endTierLevelDate><lastModificationDate>2015-01-21T07:55:46.712Z</lastModificationDate><memberType/><nextMemberType/><oldMemberType/><memberTypeChangeUser/><originMember>NP</originMember><qualificationStatus/><nbYearsPlatinum>0</nbYearsPlatinum><milesExpiryAmount>0</milesExpiryAmount><milesExpiryType/><milesExpiryProtection>false</milesExpiryProtection><milesAmount>0</milesAmount><milesStatusAmount>0</milesStatusAmount><milesStatusPostponed>0</milesStatusPostponed><milesStatusPostponedNextYear>0</milesStatusPostponedNextYear><qSegmentNb>0</qSegmentNb><qSegmentNbPostponed>0</qSegmentNbPostponed><ptc>ADT</ptc><eliteLevel/><milesToBuy>0</milesToBuy><poolingAuthorized>false</poolingAuthorized><clubPetroleum>false</clubPetroleum><communicationMedia>T</communicationMedia><nextTierPossibleData><code>B</code><milesThreshold>25000</milesThreshold><segmentThreshold>15</segmentThreshold><milesStatusMissing>25000</milesStatusMissing><qualifyingSegmentMissing>15</qualifyingSegmentMissing></nextTierPossibleData><nextTierPossibleData><code>R</code><milesThreshold>40000</milesThreshold><segmentThreshold>30</segmentThreshold><milesStatusMissing>40000</milesStatusMissing><qualifyingSegmentMissing>30</qualifyingSegmentMissing></nextTierPossibleData><nextTierPossibleData><code>M</code><milesThreshold>70000</milesThreshold><segmentThreshold>60</segmentThreshold><milesStatusMissing>70000</milesStatusMissing><qualifyingSegmentMissing>60</qualifyingSegmentMissing></nextTierPossibleData></flyingBlueContractData></flyingBlueContractDataResponse><communicationPreferencesResponse><communicationPreferences><communicationGroupeType>N</communicationGroupeType><communicationType>AF</communicationType><optIn>N</optIn><media/><signature><signatureType>C</signatureType></signature><signature><signatureType>M</signatureType></signature></communicationPreferences></communicationPreferencesResponse><communicationPreferencesResponse><communicationPreferences><communicationGroupeType>N</communicationGroupeType><communicationType>KL</communicationType><optIn>N</optIn><media/><signature><signatureType>C</signatureType></signature><signature><signatureType>M</signatureType></signature></communicationPreferences></communicationPreferencesResponse><communicationPreferencesResponse><communicationPreferences><communicationGroupeType>N</communicationGroupeType><communicationType>KL_IFLY</communicationType><optIn>N</optIn><media/><signature><signatureType>C</signatureType></signature><signature><signatureType>M</signatureType></signature></communicationPreferences></communicationPreferencesResponse><delegationDataResponse/><accountDataResponse><myAccountData><accountIdentifier>380050AK</accountIdentifier><emailIdentifier>bla_20150121_06@bla.nl</emailIdentifier><customerType>FP</customerType><fbIdentifier>001101051150</fbIdentifier><percentageFullProfil>35</percentageFullProfil><secretQuestion>What's the name of your favourite pet?</secretQuestion><status>V</status></myAccountData><signature><signatureType>C</signatureType><signatureSite>S09372</signatureSite><signature>CREATE ACCOUNT</signature><date>2015-01-21T07:55:33Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:40Z</date></signature></accountDataResponse><marketingInformationResponse><marketingInformation><errorCode>ERROR_905</errorCode></marketingInformation></marketingInformationResponse></ns5:MyAccountCustomerDataResponseElement></S:Body></S:Envelope>"
  },
  "state-2": {
    "requestKey": "{\"url\":\"/MyA_cpsprovidepayment_000469v01/000469v01\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1581\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"http://www.af-klm.com/services/passenger/ProvidePaymentPreferences-v1/provideMaskedPaymentPreferences\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 500,
    "headers": {
      "X-Backside-Transport": "FAIL FAIL",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Server": "Apache-Coyote/1.1",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:24 GMT",
      "X-Client-Ip": "10.60.47.8"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>W90000469</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T10:11:24.667Z</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:560b4cc0-4035-4af7-9210-c72dad1fc337</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:e77942ea-d70e-4d9c-8da9-b4df8d496ba6</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:e77942ea-d70e-4d9c-8da9-b4df8d496ba6</RelatesTo></S:Header><S:Body><S:Fault xmlns:ns4=\"http://www.w3.org/2003/05/soap-envelope\"><faultcode>S:Server</faultcode><faultstring>NOT FOUND</faultstring><faultactor>URN:AFKL:ENV-UNDEF:LOC-UNDEF:PROV:unicainteractrctl6.airfrance.fr:repind-wsrct.airfrance.fr</faultactor><detail><ns5:BusinessErrorElement xmlns:ns4=\"http://www.af-klm.com/services/passenger/ProvideDecryptedPaymentPreferencesSchema-v1/xsd\" xmlns:ns3=\"http://www.af-klm.com/services/passenger/ProvidePaymentPreferences-v1/wsdl\" xmlns:ns2=\"http://www.af-klm.com/services/common/SystemFault-v1/xsd\" xmlns:ns5=\"http://www.af-klm.com/services/passenger/ProvidePaymentPreferencesSchema-v1/xsd\"><errorCode>ERR_001</errorCode><missingParameter>gin</missingParameter><faultDescription>NOT FOUND</faultDescription></ns5:BusinessErrorElement></detail></S:Fault></S:Body></S:Envelope>"
  },
  "state-3": {
    "requestKey": "{\"url\":\"/MyA_Crisp_Logon/logon?login=bla_20150121_06@bla.nl&password=123123\",\"headers\":[\"accept:application/xml, text/xml, application/*+xml\",\"connection:keep-alive\",\"content-length:0\",\"content-type:application/x-www-form-urlencoded\",\"host:www.localhost.nl:3003\",\"user-agent:Java/1.7.0_55\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "Content-Language": "en-US",
      "Content-Type": "application/xml",
      "Date": "Wed, 25 Feb 2015 10:11:25 GMT",
      "P3p": "CP=\"NON CUR OTPi OUR NOR UNI\"",
      "Server": "IBM_HTTP_Server",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache=\"set-cookie, set-cookie2\"",
      "Expires": "Thu, 01 Dec 1994 16:00:00 GMT",
      "Set-Cookie": [
        "JSESSIONID=0000dDeNWNFLCXO_HOaEHO1XVAs:17errca1r; Domain=.klm.com; Path=/",
        "sticky-key=1061033388.47873.0000; expires=Wed, 25-Feb-2015 18:18:45 GMT; path=/",
        "klm_tracking_id=33342664_172.26.147.93;path=/;domain=.ite2.klm.com;"
      ],
      "Vary": "Accept-Encoding"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><MyAccountSecurityProviderLogonResponse><Result><authStrength>200</authStrength><engineID>17errca1r</engineID><sessionID>0000dDeNWNFLCXO_HOaEHO1XVAs</sessionID><ttl>1424859985327</ttl></Result><ResultCode>0</ResultCode></MyAccountSecurityProviderLogonResponse>"
  },
  "state-4": {
    "requestKey": "{\"url\":\"/MyA_cmscontent_v11/v1.1\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1467\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"getPageByURL\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:25 GMT",
      "Server": "d2dcd262-6cf1-465b-968e-cb158cab9321",
      "X-Client-Ip": "172.21.62.102",
      "Set-Cookie": [
        "sticky-key=1480463788.20992.0000; expires=Wed, 25-Feb-2015 18:18:46 GMT; path=/"
      ],
      "Vary": "Accept-Encoding"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>w38995799</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T11:11:25.383+01:00</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:103b73cc-3dfd-40a4-ae72-f469f480f317</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:9efa55f6-1086-42ec-a2fa-618c7bd8ce5e</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:9efa55f6-1086-42ec-a2fa-618c7bd8ce5e</RelatesTo></S:Header><S:Body><ns2:GetPageByURLResponse xmlns:ns3=\"http://klm.com/cms/v1.1/getpagebyurl/request\" xmlns:ns2=\"http://klm.com/cms/v1.1/getpagebyurl/response\"><page><componentPresentations><id>link</id><components>&lt;li>&lt;a href=\"/ams/mytrip/bookingsOverview.xhtml?COUNTRY=gb&amp;amp;LANG=en&amp;amp;POS=gb\">My bookings&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/ams/account/secure/myProfileForm.htm\">My profile&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/ams/account/secure/milesRetroClaim.htm\">Claim miles&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/travel/gb_en/flying_blue/earn_and_spend_miles/spend_miles/book_an_award_ticket.htm\">Book award tickets&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/ams/account/secure/mileageSummaryFB.htm\">Mileage Summary&lt;/a>&lt;/li></components></componentPresentations><pageMeta><creationDate>2013-09-11 12:57:25.0</creationDate><gridName>content-service</gridName><id>tcm:638-459848-64</id><roleNeeded>ROLE_GUEST</roleNeeded><initialPublicationDate>2013-09-11 15:11:42.0</initialPublicationDate><lastPublicationDate>2014-11-11 15:37:37.157</lastPublicationDate><majorVersion>3</majorVersion><minorVersion>0</minorVersion><modificationDate>2013-09-20 14:22:22.0</modificationDate><owningPublicationId>493</owningPublicationId><path>/passage/klmcomui/cms/gb_en/apps/myaccount/links/kl/UsefulLinksLoginWidgetFlyingBlue.htm</path><publicationId>638</publicationId><templateId>185961</templateId><title>LoginWidget_FlyingBlue_Links</title><urlPath>/travel/gb_en/apps/myaccount/links/kl/UsefulLinksLoginWidgetFlyingBlue.htm</urlPath><categories><id>ComponentPresentations</id><value>tcm:638-459839,link,o1_01,tcm:638-459826-32</value></categories><categories><id>Grid</id><value>content-service</value></categories></pageMeta></page></ns2:GetPageByURLResponse></S:Body></S:Envelope>"
  },
  "state-5": {
    "requestKey": "{\"url\":\"/MyA_cpsprovide_000423v01/000423v04\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:2034\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"http://www.af-klm.com/services/passenger/ProvideMyAccountCustomerDataService-v4/provideMyAccountCustomerDataByIdentifier\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Server": "Apache-Coyote/1.1",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:25 GMT",
      "X-Client-Ip": "10.60.47.8"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>W90000423</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T10:11:25.383Z</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:747cd169-2c5c-4508-af8c-23154c646eb9</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:f4fe684a-151f-419e-aadc-ae97eb2a876e</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:f4fe684a-151f-419e-aadc-ae97eb2a876e</RelatesTo></S:Header><S:Body><ns5:MyAccountCustomerDataResponseElement xmlns:ns8=\"http://www.af-klm.com/services/passenger/response-v1/xsd\" xmlns:ns7=\"http://www.af-klm.com/services/passenger/SicCommonType-v1/xsd\" xmlns:ns6=\"http://www.af-klm.com/services/passenger/SicIndividuType-v1/xsd\" xmlns:ns5=\"http://www.af-klm.com/services/passenger/data-v1/xsd\" xmlns:ns4=\"http://www.af-klm.com/services/passenger/SicMarketingType-v1/xsd\" xmlns:ns3=\"http://www.af-klm.com/services/passenger/SoftComputingType-v1/xsd\" xmlns:ns2=\"http://www.af-klm.com/services/common/SystemFault-v1/xsd\"><emailResponse><email><version>1</version><mediumStatus>V</mediumStatus><mediumCode>D</mediumCode><email>bla_20150121_06@bla.nl</email><emailOptin>T</emailOptin></email><signature><signatureType>C</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:39Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:39Z</date></signature></emailResponse><telecomResponse><telecom><version>3</version><mediumStatus>V</mediumStatus><terminalType>T</terminalType><countryCode>31</countryCode><phoneNumber>0612345678</phoneNumber></telecom><signature><signatureType>C</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><telecomFlags><flagInvalidFixTelecom>false</flagInvalidFixTelecom><flagInvalidMobileTelecom>false</flagInvalidMobileTelecom><flagNoValidNormalizedTelecom>false</flagNoValidNormalizedTelecom></telecomFlags><telecomNormalization><internationalPhoneNumber>+31612345678</internationalPhoneNumber></telecomNormalization></telecomResponse><telecomResponse><telecom><version>3</version><mediumStatus>V</mediumStatus><terminalType>M</terminalType><countryCode>31</countryCode><phoneNumber>0201234567</phoneNumber></telecom><signature><signatureType>C</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-21T11:44:42Z</date></signature><telecomFlags><flagInvalidFixTelecom>false</flagInvalidFixTelecom><flagInvalidMobileTelecom>false</flagInvalidMobileTelecom><flagNoValidNormalizedTelecom>false</flagNoValidNormalizedTelecom></telecomFlags><telecomNormalization><internationalPhoneNumber>+31201234567</internationalPhoneNumber></telecomNormalization></telecomResponse><postalAddressResponse><usageAddress><applicationCode>ISI</applicationCode><usageNumber>1</usageNumber><addressRoleCode>M</addressRoleCode></usageAddress><postalAddressContent><numberAndStreet>KAASHOEVE 3</numberAndStreet><city>HOUTEN</city><zipCode>3992 NG</zipCode><countryCode>NL</countryCode></postalAddressContent><postalAddressProperties><indicAdrNorm>false</indicAdrNorm><version>1</version><mediumCode>D</mediumCode><mediumStatus>V</mediumStatus></postalAddressProperties><signature><signatureType>C</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:32Z</date></signature><signature><signatureType>M</signatureType><signatureSite>ISI</signatureSite><signature>Ajout Usage</signature><date>2015-01-21T07:55:32Z</date></signature></postalAddressResponse><individualResponse><individualInformations><identifier>400447845205</identifier><version>12</version><gender>F</gender><birthDate>1984-01-01T00:00:00Z</birthDate><flagNoFusion>false</flagNoFusion><status>V</status><flagThirdTrap>false</flagThirdTrap><civility>MISS</civility><lastNameSC>TESTER</lastNameSC><firstNameSC>PIET</firstNameSC><languageCode>EN</languageCode></individualInformations><signature><signatureType>C</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:32Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:40Z</date></signature><normalizedName><lastName>TESTER</lastName><firstName>PIET</firstName></normalizedName></individualResponse><contractResponse><contract><contractNumber>380050AK</contractNumber><contractType>C</contractType><productType>MA</productType><contractStatus>C</contractStatus><validityStartDate>2015-01-21T07:55:35Z</validityStartDate></contract><signature><signatureType>C</signatureType><signatureSite>SIC WS</signatureSite><signature>AUTHENT MYACCNT</signature><date>2015-01-21T07:55:35Z</date></signature></contractResponse><contractResponse><contract><contractNumber>001101051150</contractNumber><contractType>C</contractType><productType>FP</productType><companyContractType>AF</companyContractType><contractStatus>C</contractStatus><tierLevel>A</tierLevel></contract><signature><signatureType>M</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:33Z</date></signature><signature><signatureType>C</signatureType><signatureSite>TLS</signatureSite><signature>OSI</signature><date>2015-01-21T07:55:33Z</date></signature></contractResponse><flyingBlueContractDataResponse><flyingBlueContractData><startMemberShipDate>2015-01-21T00:00:00Z</startMemberShipDate><endMemberShipDate>2099-12-31T00:00:00Z</endMemberShipDate><amexContract>false</amexContract><cbcContract>false</cbcContract><status>C</status><statusFB>*</statusFB><tierLevel>A</tierLevel><welcomeBonus>false</welcomeBonus><subtier>99</subtier><startTierLevelDate>2015-01-21T00:00:00Z</startTierLevelDate><endTierLevelDate>2099-12-31T00:00:00Z</endTierLevelDate><lastModificationDate>2015-01-21T07:55:46.712Z</lastModificationDate><memberType/><nextMemberType/><oldMemberType/><memberTypeChangeUser/><originMember>NP</originMember><qualificationStatus/><nbYearsPlatinum>0</nbYearsPlatinum><milesExpiryAmount>0</milesExpiryAmount><milesExpiryType/><milesExpiryProtection>false</milesExpiryProtection><milesAmount>0</milesAmount><milesStatusAmount>0</milesStatusAmount><milesStatusPostponed>0</milesStatusPostponed><milesStatusPostponedNextYear>0</milesStatusPostponedNextYear><qSegmentNb>0</qSegmentNb><qSegmentNbPostponed>0</qSegmentNbPostponed><ptc>ADT</ptc><eliteLevel/><milesToBuy>0</milesToBuy><poolingAuthorized>false</poolingAuthorized><clubPetroleum>false</clubPetroleum><communicationMedia>T</communicationMedia><nextTierPossibleData><code>B</code><milesThreshold>25000</milesThreshold><segmentThreshold>15</segmentThreshold><milesStatusMissing>25000</milesStatusMissing><qualifyingSegmentMissing>15</qualifyingSegmentMissing></nextTierPossibleData><nextTierPossibleData><code>R</code><milesThreshold>40000</milesThreshold><segmentThreshold>30</segmentThreshold><milesStatusMissing>40000</milesStatusMissing><qualifyingSegmentMissing>30</qualifyingSegmentMissing></nextTierPossibleData><nextTierPossibleData><code>M</code><milesThreshold>70000</milesThreshold><segmentThreshold>60</segmentThreshold><milesStatusMissing>70000</milesStatusMissing><qualifyingSegmentMissing>60</qualifyingSegmentMissing></nextTierPossibleData></flyingBlueContractData></flyingBlueContractDataResponse><communicationPreferencesResponse><communicationPreferences><communicationGroupeType>N</communicationGroupeType><communicationType>AF</communicationType><optIn>N</optIn><media/><signature><signatureType>C</signatureType></signature><signature><signatureType>M</signatureType></signature></communicationPreferences></communicationPreferencesResponse><communicationPreferencesResponse><communicationPreferences><communicationGroupeType>N</communicationGroupeType><communicationType>KL</communicationType><optIn>N</optIn><media/><signature><signatureType>C</signatureType></signature><signature><signatureType>M</signatureType></signature></communicationPreferences></communicationPreferencesResponse><communicationPreferencesResponse><communicationPreferences><communicationGroupeType>N</communicationGroupeType><communicationType>KL_IFLY</communicationType><optIn>N</optIn><media/><signature><signatureType>C</signatureType></signature><signature><signatureType>M</signatureType></signature></communicationPreferences></communicationPreferencesResponse><delegationDataResponse/><accountDataResponse><myAccountData><accountIdentifier>380050AK</accountIdentifier><emailIdentifier>bla_20150121_06@bla.nl</emailIdentifier><customerType>FP</customerType><fbIdentifier>001101051150</fbIdentifier><percentageFullProfil>35</percentageFullProfil><secretQuestion>What's the name of your favourite pet?</secretQuestion><status>V</status></myAccountData><signature><signatureType>C</signatureType><signatureSite>S09372</signatureSite><signature>CREATE ACCOUNT</signature><date>2015-01-21T07:55:33Z</date></signature><signature><signatureType>M</signatureType><signatureSite>KLM</signatureSite><signature>MYA</signature><date>2015-01-22T08:12:40Z</date></signature></accountDataResponse><marketingInformationResponse><marketingInformation><errorCode>ERROR_905</errorCode></marketingInformation></marketingInformationResponse></ns5:MyAccountCustomerDataResponseElement></S:Body></S:Envelope>"
  },
  "state-6": {
    "requestKey": "{\"url\":\"/MyA_cpsprovidepayment_000469v01/000469v01\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1581\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"http://www.af-klm.com/services/passenger/ProvidePaymentPreferences-v1/provideMaskedPaymentPreferences\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 500,
    "headers": {
      "X-Backside-Transport": "FAIL FAIL",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Server": "Apache-Coyote/1.1",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:26 GMT",
      "X-Client-Ip": "10.60.47.8"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>W90000469</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T10:11:26.080Z</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:527f955d-8e79-45df-8987-8d9e111ce448</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:e18e83d0-43d6-4a4f-bad9-16df4793f470</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:e18e83d0-43d6-4a4f-bad9-16df4793f470</RelatesTo></S:Header><S:Body><S:Fault xmlns:ns4=\"http://www.w3.org/2003/05/soap-envelope\"><faultcode>S:Server</faultcode><faultstring>NOT FOUND</faultstring><faultactor>URN:AFKL:ENV-UNDEF:LOC-UNDEF:PROV:unicainteractrctl6.airfrance.fr:repind-wsrct.airfrance.fr</faultactor><detail><ns5:BusinessErrorElement xmlns:ns4=\"http://www.af-klm.com/services/passenger/ProvideDecryptedPaymentPreferencesSchema-v1/xsd\" xmlns:ns3=\"http://www.af-klm.com/services/passenger/ProvidePaymentPreferences-v1/wsdl\" xmlns:ns2=\"http://www.af-klm.com/services/common/SystemFault-v1/xsd\" xmlns:ns5=\"http://www.af-klm.com/services/passenger/ProvidePaymentPreferencesSchema-v1/xsd\"><errorCode>ERR_001</errorCode><missingParameter>gin</missingParameter><faultDescription>NOT FOUND</faultDescription></ns5:BusinessErrorElement></detail></S:Fault></S:Body></S:Envelope>"
  },
  "state-7": {
    "requestKey": "{\"url\":\"/MyA_epasspayment_PaymentService/PaymentService\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1550\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"getPaymentConfiguration\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 500,
    "headers": {
      "Content-Type": "text/xml; charset=utf-8",
      "X-Backside-Transport": "FAIL FAIL",
      "Connection": "close"
    },
    "body": "<?xml version='1.0' ?>\n<env:Envelope xmlns:env='http://schemas.xmlsoap.org/soap/envelope/'>\n<env:Body>\n<env:Fault>\n<faultcode>env:Client</faultcode>\n<faultstring>Internal Error</faultstring>\n</env:Fault>\n</env:Body>\n</env:Envelope>\n"
  },
  "state-8": {
    "requestKey": "{\"url\":\"/MyA_cmscontent_v11/v1.1\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1469\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"getPageByURL\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:26 GMT",
      "Server": "d2dcd262-6cf1-465b-968e-cb158cab9321",
      "X-Client-Ip": "172.21.62.102",
      "Set-Cookie": [
        "sticky-key=1480463788.20992.0000; expires=Wed, 25-Feb-2015 18:18:47 GMT; path=/"
      ],
      "Vary": "Accept-Encoding"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>w38995799</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T11:11:26.647+01:00</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:ddb59059-a08b-4b67-b473-fc099eac7c5d</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:7a4c17a5-5096-4712-bbad-3b362251a338</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:7a4c17a5-5096-4712-bbad-3b362251a338</RelatesTo></S:Header><S:Body><ns2:GetPageByURLResponse xmlns:ns3=\"http://klm.com/cms/v1.1/getpagebyurl/request\" xmlns:ns2=\"http://klm.com/cms/v1.1/getpagebyurl/response\"><page><componentPresentations><id>link</id><components>&lt;h5>Useful links&lt;/h5>&lt;ul>&lt;li>&lt;a href=\"/travel/gb_en/flying_blue/earn_and_spend_miles/spend_miles/book_an_award_ticket.htm\">Book award tickets&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/ams/account/secure/milesRetroClaim.htm\">Claim miles&lt;/a>&lt;/li>&lt;li>&lt;a href=\"https://www.klm.com/travel/gb_en/flying_blue/buy_and_gift_miles/buy_award_miles_for_yourself/index.htm\">Buy Award Miles&lt;/a>&lt;/li>&lt;/ul></components></componentPresentations><pageMeta><creationDate>2013-09-20 14:06:30.0</creationDate><gridName>content-service</gridName><id>tcm:638-460420-64</id><roleNeeded>ROLE_GUEST</roleNeeded><initialPublicationDate>2013-09-30 17:58:25.0</initialPublicationDate><lastPublicationDate>2014-06-24 23:55:25.0</lastPublicationDate><majorVersion>6</majorVersion><minorVersion>0</minorVersion><modificationDate>2013-09-20 14:23:04.0</modificationDate><owningPublicationId>493</owningPublicationId><path>/passage/klmcomui/cms/gb_en/apps/myaccount/links/kl/UsefulLinksProfileWidgetFlyingBlue.htm</path><publicationId>638</publicationId><templateId>185961</templateId><title>ProfileWidget_FlyingBlue_UsefulLinks</title><urlPath>/travel/gb_en/apps/myaccount/links/kl/UsefulLinksProfileWidgetFlyingBlue.htm</urlPath><categories><id>ComponentPresentations</id><value>tcm:638-460418,link,o1_01,tcm:638-459826-32</value></categories><categories><id>Grid</id><value>content-service</value></categories></pageMeta></page></ns2:GetPageByURLResponse></S:Body></S:Envelope>"
  },
  "state-9": {
    "requestKey": "{\"url\":\"/MyA_isisprovidefbcommunicationlanguage_000524v01/000524v01\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1474\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"http://www.af-klm.com/services/passenger/S35810_ProvideFBAuthorizedCommunicationLanguage-v1/wsdl/invoke\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Server": "Apache-Coyote/1.1",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:27 GMT",
      "X-Client-Ip": "10.60.47.8"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\"><SOAP-ENV:Header><ns:MessageID xmlns:ns0=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns=\"http://www.w3.org/2005/08/addressing\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\">240c29c5-7f17-4a1d-82e4-d7b0921e6eb6</ns:MessageID><ns:RelatesTo RelationshipType=\"http://www.w3.org/2005/08/addressing/reply\" xmlns:ns0=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns=\"http://www.w3.org/2005/08/addressing\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\">uuid:ff6d8cab-4625-4f68-9d86-604be34cbcce</ns:RelatesTo><ns:trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\" xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns0=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:ns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\"><ns:consumerRef><ns:partyID>KL</ns:partyID><ns:consumerID>W90000524</ns:consumerID><ns:consumerLocation>AMS</ns:consumerLocation><ns:consumerType>A</ns:consumerType><ns:consumerTime>2015-02-25T11:11:26.82+01:00</ns:consumerTime></ns:consumerRef></ns:trackingMessageHeader></SOAP-ENV:Header><SOAP-ENV:Body><adh:S35810_OUT xmlns:adh=\"http://www.af-klm.com/services/passenger/S35810_ProvideFBAuthorizedCommunicationLanguage-v1/xsd\"><Exception><ErrCode>000</ErrCode><ErrMsg>OK</ErrMsg></Exception><ReqRes><OccNbr>02</OccNbr></ReqRes><Languages><IsisLangCod>A</IsisLangCod><LangDefFlag>Y</LangDefFlag><IsoLangCode>EN</IsoLangCode><LangLab>ENGLISH</LangLab></Languages><Languages><IsisLangCod>N</IsisLangCod><LangDefFlag>N</LangDefFlag><IsoLangCode>NL</IsoLangCode><LangLab>DUTCH</LangLab></Languages></adh:S35810_OUT></SOAP-ENV:Body></SOAP-ENV:Envelope>"
  },
  "state-10": {
    "requestKey": "{\"url\":\"/MyA_cmscontent_v11/v1.1\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1465\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"getPageByURL\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:26 GMT",
      "Server": "d2dcd262-6cf1-465b-968e-cb158cab9321",
      "X-Client-Ip": "172.21.62.102",
      "Set-Cookie": [
        "sticky-key=1480463788.20992.0000; expires=Wed, 25-Feb-2015 18:18:47 GMT; path=/"
      ],
      "Vary": "Accept-Encoding"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>w38995799</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T11:11:27.137+01:00</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:877f5359-595e-4c90-80e8-376b09f33cee</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:efeebebd-3e7c-42d9-9bea-456add8d35f8</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:efeebebd-3e7c-42d9-9bea-456add8d35f8</RelatesTo></S:Header><S:Body><ns2:GetPageByURLResponse xmlns:ns3=\"http://klm.com/cms/v1.1/getpagebyurl/request\" xmlns:ns2=\"http://klm.com/cms/v1.1/getpagebyurl/response\"><page><componentPresentations><id>content</id><components>&lt;div>&#13;\n&lt;div class=\"mya-r-5th-column-block\" linkresolving=\"no\">&#13;\n&#13;\n\t&lt;h2>Security&lt;/h2>&#13;\n\t&lt;div>&#13;\n\tAny information sent to KLM through this website is encrypted and secured with VeriSign SSL technology. &#13;\n&lt;img tcmuri='tcm:638-383396' src='/travel/gb_en/images/VeriSign_tcm638-383396.jpg' alt='Verisign' title='Verisign'/>&#13;\n\t\t\t&lt;ul>&#13;\n&lt;li>&lt;a href=\"http://www.verisign.com/ssl/ssl-information-center/how-ssl-security-works/index.html\" target=\"_blank\">Read more about SSL certificates&amp;#160;&lt;b class=\"g-klmicon\">&amp;#xe104;&lt;/b>&lt;/a>&lt;/li>&#13;\n\t\t\t&lt;/ul>&#13;\n&#13;\n\t&lt;/div>&#13;\n&lt;/div>&#13;\n&#13;\n&lt;div class=\"mya-r-5th-column-block\" linkresolving=\"no\">&#13;\n&#13;\n\t&lt;h2>Privacy&lt;/h2>&#13;\n\t&lt;div>&#13;\n\tKLM protects your privacy with the greatest possible care, which is in accordance with the Dutch Personal Data Protection Act. &#13;\n&#13;\n\t\t\t&lt;ul>&#13;\n&lt;li>&lt;a href=\"https://www.klm.com/travel/gb_en/customer_support/privacy_policy/privacy_policy.htm\" target=\"_blank\">KLM Privacy Policy&amp;#160;&lt;b class=\"g-klmicon\">&amp;#xe104;&lt;/b>&lt;/a>&lt;/li>&lt;li>&lt;a href=\"https://www.klm.com/travel/gb_en/customer_support/booking_conditions_carriage/index.htm\" target=\"_blank\">Conditions&amp;#160;&lt;b class=\"g-klmicon\">&amp;#xe104;&lt;/b>&lt;/a>&lt;/li>&lt;li>&lt;a href=\"https://www.klm.com/travel/gb_en/flying_blue/member_support/contact_flying_blue/index.htm\" target=\"_blank\">Flying Blue Service Centre&amp;#160;&lt;b class=\"g-klmicon\">&amp;#xe104;&lt;/b>&lt;/a>&lt;/li>&#13;\n\t\t\t&lt;/ul>&#13;\n&#13;\n\t&lt;/div>&#13;\n&lt;/div>&#13;\n&#13;\n&lt;div class=\"mya-r-5th-column-block\" linkresolving=\"no\">&#13;\n&#13;\n\t&lt;h2>Travel Manager&lt;/h2>&#13;\n\t&lt;div>&#13;\n\tAls travel manager kunt u boekingen maken voor andere personen. Handig als u bijvoorbeeld geregeld boekingen moet maken voor collega's namens uw bedrijf.&lt;br />&lt;br />Ook is het mogelijk dat bijvoorbeeld een collega uw travel manager wordt. &#13;\n&#13;\n\t\t\t&lt;ul>&#13;\n&lt;li>&lt;a href=\"/ams/account/secure/promo/travelManagerPromo.htm\"  class=\"mya-r-multiline-btn g-btn g-btn-small g-btn-forward\">What is travel manager?&lt;/a>&lt;/li>&#13;\n\t\t\t&lt;/ul>&#13;\n&#13;\n\t&lt;/div>&#13;\n&lt;/div>&#13;\n&#13;\n&lt;div class=\"mya-r-5th-column-block\" linkresolving=\"no\">&#13;\n&#13;\n\t&lt;h2>Platinum Service Line&lt;/h2>&#13;\n\t&lt;div>&#13;\n\tA dedicated team will be at your disposal for all flight related questions, complaints, compliments, check-in, and Flying Blue. This service is available exclusively to our most highly valued members.&lt;br />Read more about Platinum Service Line. &#13;\n&lt;img tcmuri='tcm:638-556909' src='/travel/gb_en/images/PlaatjeServiceLine_tcm638-556909.png' alt='Verisign' title='Verisign'/>&#13;\n\t\t\t&lt;ul>&#13;\n&lt;li>&lt;a href=\"http://www.verisign.com/ssl/ssl-information-center/how-ssl-security-works/index.html\" target=\"_blank\">Read more about SSL certificates&amp;#160;&lt;b class=\"g-klmicon\">&amp;#xe104;&lt;/b>&lt;/a>&lt;/li>&#13;\n\t\t\t&lt;/ul>&#13;\n&#13;\n\t&lt;/div>&#13;\n&lt;/div>&#13;\n&lt;/div></components></componentPresentations><pageMeta><creationDate>2012-01-27 16:54:03.0</creationDate><gridName>content-service</gridName><id>tcm:638-383443-64</id><roleNeeded>ROLE_GUEST</roleNeeded><initialPublicationDate>2012-02-01 15:14:13.0</initialPublicationDate><lastPublicationDate>2014-11-27 14:55:07.473</lastPublicationDate><majorVersion>2</majorVersion><minorVersion>0</minorVersion><modificationDate>2013-04-18 10:07:17.0</modificationDate><owningPublicationId>493</owningPublicationId><path>/passage/klmcomui/cms/gb_en/apps/myaccount/triggers/kl/MyProfileOverviewFlyingBlue.htm</path><publicationId>638</publicationId><templateId>185961</templateId><title>MyProfileOverviewFlyingBlue</title><urlPath>/travel/gb_en/apps/myaccount/triggers/kl/MyProfileOverviewFlyingBlue.htm</urlPath><categories><id>ComponentPresentations</id><value>tcm:638-442771,content,o5_01,tcm:638-187028-32</value></categories><categories><id>Grid</id><value>content-service</value></categories></pageMeta></page></ns2:GetPageByURLResponse></S:Body></S:Envelope>"
  },
  "state-11": {
    "requestKey": "{\"url\":\"/MyA_cmscontent_v11/v1.1\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1467\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"getPageByURL\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
    "hits": 0,
    "statusCode": 200,
    "headers": {
      "X-Backside-Transport": "OK OK",
      "Connection": "Keep-Alive",
      "Transfer-Encoding": "chunked",
      "Content-Type": "text/xml",
      "Date": "Wed, 25 Feb 2015 10:11:26 GMT",
      "Server": "d2dcd262-6cf1-465b-968e-cb158cab9321",
      "X-Client-Ip": "172.21.62.102",
      "Set-Cookie": [
        "sticky-key=1480463788.20992.0000; expires=Wed, 25-Feb-2015 18:18:48 GMT; path=/"
      ],
      "Vary": "Accept-Encoding"
    },
    "body": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Header><trackingMessageHeader xmlns=\"http://www.af-klm.com/soa/xsd/MessageHeader-V1_0\"><consumerRef><partyID>KL</partyID><consumerID>w38995799</consumerID><consumerLocation>AMS</consumerLocation><consumerType>A</consumerType><consumerTime>2015-02-25T11:11:27.603+01:00</consumerTime></consumerRef></trackingMessageHeader><MessageID xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:1cbce801-2607-40ca-a1b5-7f44280f75dc</MessageID><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/ReplyTo\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:21af727f-1eb8-45e3-b375-13234028d318</RelatesTo><RelatesTo RelationshipType=\"http://www.af-klm.com/soa/tracking/InitiatedBy\" xmlns=\"http://www.w3.org/2005/08/addressing\">uuid:21af727f-1eb8-45e3-b375-13234028d318</RelatesTo></S:Header><S:Body><ns2:GetPageByURLResponse xmlns:ns3=\"http://klm.com/cms/v1.1/getpagebyurl/request\" xmlns:ns2=\"http://klm.com/cms/v1.1/getpagebyurl/response\"><page><componentPresentations><id>link</id><components>&lt;li>&lt;a href=\"/ams/mytrip/bookingsOverview.xhtml?COUNTRY=gb&amp;amp;LANG=en&amp;amp;POS=gb\">My bookings&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/ams/account/secure/myProfileForm.htm\">My profile&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/ams/account/secure/milesRetroClaim.htm\">Claim miles&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/travel/gb_en/flying_blue/earn_and_spend_miles/spend_miles/book_an_award_ticket.htm\">Book award tickets&lt;/a>&lt;/li>&lt;li>&lt;a href=\"/ams/account/secure/mileageSummaryFB.htm\">Mileage Summary&lt;/a>&lt;/li></components></componentPresentations><pageMeta><creationDate>2013-09-11 12:57:25.0</creationDate><gridName>content-service</gridName><id>tcm:638-459848-64</id><roleNeeded>ROLE_GUEST</roleNeeded><initialPublicationDate>2013-09-11 15:11:42.0</initialPublicationDate><lastPublicationDate>2014-11-11 15:37:37.157</lastPublicationDate><majorVersion>3</majorVersion><minorVersion>0</minorVersion><modificationDate>2013-09-20 14:22:22.0</modificationDate><owningPublicationId>493</owningPublicationId><path>/passage/klmcomui/cms/gb_en/apps/myaccount/links/kl/UsefulLinksLoginWidgetFlyingBlue.htm</path><publicationId>638</publicationId><templateId>185961</templateId><title>LoginWidget_FlyingBlue_Links</title><urlPath>/travel/gb_en/apps/myaccount/links/kl/UsefulLinksLoginWidgetFlyingBlue.htm</urlPath><categories><id>ComponentPresentations</id><value>tcm:638-459839,link,o1_01,tcm:638-459826-32</value></categories><categories><id>Grid</id><value>content-service</value></categories></pageMeta></page></ns2:GetPageByURLResponse></S:Body></S:Envelope>"
  }
};

module.exports = new $nocca.scenario.Builder('Recorded Scenario 1', 'undefined')
    .sequentialScenario()
    .oneShot()
    .on('MyA_cpsauthenticate_000420v02')
    .name('state-0')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-0'].requestKey))
    .respondWith(Responses['state-0'])
    .then()
    .on('MyA_cpsprovide_000423v01')
    .name('state-1')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-1'].requestKey))
    .respondWith(Responses['state-1'])
    .then()
    .on('MyA_cpsprovidepayment_000469v01')
    .name('state-2')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-2'].requestKey))
    .respondWith(Responses['state-2'])
    .then()
    .on('MyA_Crisp_Logon')
    .name('state-3')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-3'].requestKey))
    .respondWith(Responses['state-3'])
    .then()
    .on('MyA_cmscontent_v11')
    .name('state-4')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-4'].requestKey))
    .respondWith(Responses['state-4'])
    .then()
    .on('MyA_cpsprovide_000423v01')
    .name('state-5')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-5'].requestKey))
    .respondWith(Responses['state-5'])
    .then()
    .on('MyA_cpsprovidepayment_000469v01')
    .name('state-6')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-6'].requestKey))
    .respondWith(Responses['state-6'])
    .then()
    .on('MyA_epasspayment_PaymentService')
    .name('state-7')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-7'].requestKey))
    .respondWith(Responses['state-7'])
    .then()
    .on('MyA_cmscontent_v11')
    .name('state-8')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-8'].requestKey))
    .respondWith(Responses['state-8'])
    .then()
    .on('MyA_isisprovidefbcommunicationlanguage_000524v01')
    .name('state-9')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-9'].requestKey))
    .respondWith(Responses['state-9'])
    .then()
    .on('MyA_cmscontent_v11')
    .name('state-10')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-10'].requestKey))
    .respondWith(Responses['state-10'])
    .then()
    .on('MyA_cmscontent_v11')
    .name('state-11')
    .title('undefined')
    .matchUsing($nocca.scenario.Matchers.requestKeyMatcher(Responses['state-11'].requestKey))
    .respondWith(Responses['state-11'])
    .build();