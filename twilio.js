/**
  *
  * Copyright 2017 IBM
  *
  * Twilio to Watson IoT OpenWhisk Action
  *
  * By JeanCarl Bisson (@dothewww)
  * More info at http://github.com/jeancarl/twilio-watsoniot-openwhisk
  *
  * @param deviceType type of the IoT device (default twilio)
  * @param deviceId ID of the IoT device (default 10-digit phone number from the To parameter)
  * @param eventType command/event to the IoT device (default sms)
  * @param sendAs if present, will send this message as a device command insead of an event (default event, set to true to send as command).
  * @param To phone number from Twilio where the message was received
  * @param Body content of the text message
  *
  * @return either the Twiml response, or JSON of the analyzed message.
  *
  */
'use strict';

function main(params) {
  const deviceType = params.deviceType || "twilio";
  const deviceId = params.deviceId || params.To.replace(/[^0-9]/g, "");
  const eventType = params.eventType || "sms";
  const sendAs = params.sendAs && params.sendAs.toLowerCase() == "command" ? "Command" : "Event"; // Determines if this is a device event or command.

  const appClientConfig = {
  	org: params.IOT_ORG,
    id: "app"+new Date().getTime(),
    "domain": "internetofthings.ibmcloud.com",
    "auth-key": params.IOT_API_KEY,
    "auth-token": params.IOT_API_TOKEN
  };

  // Process the message.
  return new Promise((resolve, reject) => {
    const iotf = require("ibmiotf");
    const appClient = new iotf.IotfApplication(appClientConfig);
    const payload = {
      "body": params.Body,
      "from": params.From,
      "to": params.To
    };

    appClient.connect();

    appClient.on("connect", () => {
      appClient["publishDevice"+sendAs](deviceType, deviceId, eventType, "json", payload);
      appClient.disconnect();

      resolve({
        headers: {
          "content-type": "text/xml"
        },
        body: "<Response></Response>",
        payload: payload,
        deviceId: deviceId,
        deviceType: deviceType,
        eventType: eventType,
        sentAs: sendAs.toLowerCase()
      });
    });
  });
}

exports.main = main;
