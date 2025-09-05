import { generateUUID, getDeviceId } from "./Helper";
const hostURL = process.env.NEXT_PUBLIC_TELEMETRY_URL;
let CsTelemetryModule;
let EkTelemetry;
let jQuery;

if (typeof window !== "undefined") {
  CsTelemetryModule =
    require("@project-sunbird/client-services/telemetry").CsTelemetryModule;
  EkTelemetry = require("@project-sunbird/telemetry-sdk");
  jQuery = require("jquery");
  window.jQuery = jQuery;
}

const telemetryConfig = {
  apislug: "",
  pdata: {
    id: "pratham-admin-app",
    pid: "0.0.1",
    ver: "pratham-admin-app",
  },
  env: "pratham-admin-app",
  channel: "",
  did: "did",
  authtoken: "",
  userId:
    (typeof window !== "undefined" && localStorage.getItem("userId")) ||
    "Anonymous",
  uid:
    (typeof window !== "undefined" && localStorage.getItem("id")) ||
    "Anonymous",
  sid: generateUUID(),
  batchsize: 5,
  mode: "",
  host: hostURL, //TODO: Change this host and endpoint properly
  endpoint: "/v1/telemetry",
  tags: [],
};

if (typeof window !== "undefined") {
  getDeviceId().then((deviceId) => {
    telemetryConfig.did = deviceId;
  });
}

export const telemetryFactory = {
  init: () => {
    // Telemetry disabled - no initialization
    console.log("Telemetry is disabled");
  },

  interact: (interactEventInput) => {
    // Telemetry disabled - no interaction events sent
    console.log("Telemetry interact event disabled:", interactEventInput);
  },

  impression: (impressionEventInput) => {
    // Telemetry disabled - no impression events sent
    console.log("Telemetry impression event disabled:", impressionEventInput);
  },

  assess: (assessEventInput) => {
    // Telemetry disabled - no assessment events sent
    console.log("Telemetry assess event disabled:", assessEventInput);
  },

  response: (responseEventInput) => {
    // Telemetry disabled - no response events sent
    console.log("Telemetry response event disabled:", responseEventInput);
  },

  interrupt: (interruptEventInput) => {
    // Telemetry disabled - no interrupt events sent
    console.log("Telemetry interrupt event disabled:", interruptEventInput);
  },

  start: ({ appName, ...edata }) => {
    // Telemetry disabled - return empty object
    console.log("Telemetry start event disabled:", { appName, ...edata });
    return {};
  },

  end: ({ appName, ...edata }) => {
    // Telemetry disabled - return empty object
    console.log("Telemetry end event disabled:", { appName, ...edata });
    return {};
  },
};

function getEventData(eventInput) {
  const timestamp = Date.now();
  const event = {
    edata: eventInput.edata,
    options: {
      context: getEventContext(eventInput),
      object: getEventObject(eventInput),
      tags: [],
    },
    ets: timestamp,
  };
  return event;
}

function getEventObject(eventInput) {
  if (eventInput.object) {
    const eventObjectData = {
      id: eventInput.object.id || "",
      type: eventInput.object.type || "",
      ver: eventInput.object.ver || "",
      rollup: eventInput.object.rollup || {},
    };
    return eventObjectData;
  } else {
    return {};
  }
}

function getEventContext(eventInput) {
  const eventContextData = {
    channel: eventInput.edata.channel || telemetryConfig.channel,
    pdata: eventInput.context.pdata || telemetryConfig.pdata,
    env: eventInput.context.env || telemetryConfig.env,
    sid: eventInput.sid || telemetryConfig.sid,
    uid:
      (typeof window !== "undefined" && localStorage.getItem("id")) ||
      telemetryConfig.uid, //user id
    cdata: eventInput.context.cdata || [],
  };
  if (telemetryConfig.sid) {
    eventContextData.cdata.push({
      id: telemetryConfig.sid,
      type: "UserSession",
    });
  }
  eventContextData.cdata.push({
    id: "uuid",
    type: "Device",
  });
  return eventContextData;
}

function getRollUpData(data = []) {
  const rollUp = {};
  data.forEach((element, index) => (rollUp["l" + (index + 1)] = element));
  return rollUp;
}
