import { Auth0AI } from "@auth0/ai-langchain";
import { MemoryStore } from "@auth0/ai/stores";
import { createCalendarEvent, sendGmail, postSlackMessage } from "./tools";
import config from "@/config";

let _auth0AI: Auth0AI | null = null;
function getAuth0AI() {
  if (!_auth0AI) {
    _auth0AI = new Auth0AI({
      auth0: {
        domain: config.auth0.domain,
        clientId: config.auth0.clientId,
        clientSecret: config.auth0.clientSecret,
      },
      store: new MemoryStore(),
    });
  }
  return _auth0AI;
}

type CalendarTool = ReturnType<Auth0AI["withTokenVault"]> extends infer T ? T : never;
let _calendarTool: CalendarTool;
let _gmailTool: CalendarTool;
let _slackTool: CalendarTool;

export function getCalendarTool() {
  if (!_calendarTool) {
    _calendarTool = getAuth0AI().withTokenVault(
      {
        scopes: ["https://www.googleapis.com/auth/calendar.events"],
        connection: config.connections.google,
      },
      createCalendarEvent
    );
  }
  return _calendarTool;
}

export function getGmailTool() {
  if (!_gmailTool) {
    _gmailTool = getAuth0AI().withTokenVault(
      {
        scopes: ["https://www.googleapis.com/auth/gmail.send"],
        connection: config.connections.google,
      },
      sendGmail
    );
  }
  return _gmailTool;
}

export function getSlackTool() {
  if (!_slackTool) {
    _slackTool = getAuth0AI().withTokenVault(
      {
        scopes: ["chat:write"],
        connection: config.connections.slack,
      },
      postSlackMessage
    );
  }
  return _slackTool;
}
