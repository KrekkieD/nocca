'use strict';

var $nocca = require(__dirname + '/../../index');

var responses = {
    "state-0": {
        "requestKey": "{\"bodyRegex\":[{\"gin\":\"001047992395\"}]}",
        "hits": 0,
        "playbackResponse": {
            "statusCode": 200,
            "headers": {
                "X-Backside-Transport": "OK OK",
                "Connection": "Keep-Alive",
                "Transfer-Encoding": "chunked",
                "Server": "Apache-Coyote/1.1",
                "Content-Type": "text/xml",
                "Date": "Tue, 10 Mar 2015 15:58:24 GMT",
                "X-Client-Ip": "10.60.47.8"
            },
            "body":"dingle"
        }
    },
    "state-1": {
        "requestKey": "{\"bodyRegex\":[{\"gin\":\"001047992395\"}]}",
        "hits": 0,
        "statusCode": 200,
        "headers": {
            "X-Backside-Transport": "OK OK",
            "Connection": "Keep-Alive",
            "Transfer-Encoding": "chunked",
            "Server": "Apache-Coyote/1.1",
            "Content-Type": "text/xml",
            "Date": "Tue, 10 Mar 2015 15:58:25 GMT",
            "X-Client-Ip": "10.60.47.8"
        },
        "body":"dingle"
    },
    "state-2": {
        "requestKey": "{\"url\":\"/MyA_osiristransferofflyingbluemiles_000530v02/000530v03\",\"headers\":[\"accept:text/xml, multipart/related\",\"connection:keep-alive\",\"content-length:1608\",\"content-type:text/xml; charset=utf-8\",\"host:www.localhost.nl:3003\",\"soapaction:\\\"http://www.af-klm.com/services/passenger/TransfertOfFlyingBlueMiles-v3/transfertOfFlyingBlueMiles\\\"\",\"user-agent:Metro/2.1 (branches/2.1-6728; 2011-02-03T14:14:58+0000) JAXWS-RI/2.2.3 JAXWS/2.2\"],\"method\":\"POST\"}",
        "hits": 0,
        "statusCode": 200,
        "headers": {
            "X-Backside-Transport": "OK OK",
            "Connection": "Keep-Alive",
            "Transfer-Encoding": "chunked",
            "Server": "Apache-Coyote/1.1",
            "Content-Type": "text/xml",
            "Date": "Tue, 10 Mar 2015 15:58:26 GMT",
            "Set-Cookie": [
                "SMSESSION=s1JYkN/bQa7yH+StzmjfvCRX5r8VvwP63qXL7lowF0czy3oDe/CSQqEs9pJ2njuusc1QMM2HvXZD5rFbDP/XoK0WXsdj0XQiOzt2GcQSz27dyqKKuwlg3rrwjT6krB1ZvClUCjlet1WP2yNrKmC7/KO+HQV4/gYMIux3TKfjgQiFVcrKLtM3/FBUDCglvSUuAHjApqEIHGUWqCwAJMlt1qhExLbSNnOb6gLPxdcIJ7YZfVU1PLwmONpXov0OfR14Sezs8oE7bmZKPNrI/9b+ykGtZVb9QscXhH9lDHGXcKG3nYZJm0Tc+pgKqRBWxA6CqQHXdWG3y1yUkAu5diWOV9Tg4kM6H8vdUgCmg7Qs94PoZT9iDNAjKV2c/eejHl4Dl9OXSqmnysFolCC0UfiwqwOSKLsqnLjgZK7F8jOX+LXuN4SSfHTJB45Bfw8bJFlQaUwJE9Jd81mUqT4yVcA23guEeEBPFqYuYOYSq9IJVJ8eEKqvCV6Wm8JoHvl5WL9XN+Ogv3/YJeJhjTQj7lmOAQAuqUZmdCUQmbqggHFkc4iS+nzlG3FCWPzD8unTXjDORx44/R9L6TZIV8uJuAqmZfujwBjLEmOS2SbNVt8R+pUvu1RUj3mq83ODymHahP3rN5eowjj+8RD8b5KsQO5ILcJFdfGiHCyrJDpFOYVbrJYqVU0vnTGEbVkl1SDc7hgnrJzKdps1cedvg1DmaYAwdILCgI1lfTzHiGg+nJmqaXqOhHFAapDpN+ucf44mlzcWhpekLM3X9LkakCd/u+NrF+W14sf2FD1sPTMEZNUu0dfaPiS82Fr8gZ17mZmZYT9qza1Ds44yKMWHX6eajNTSTBQxTdAxwNbEEIXx2/yj2S8="
            ],
            "X-Client-Ip": "10.60.47.8"
        },
        "body":"dingle"

    }
};

var newResp = $nocca.$patchScenarios(responses);

Object.keys(newResp).forEach(function (state) {

    console.log('\n' + state + ':');
    console.log(newResp[state]);

});