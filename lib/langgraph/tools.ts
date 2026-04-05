import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getAccessTokenFromTokenVault } from "@auth0/ai-langchain";

export const createCalendarEvent = tool(
  async ({ summary, start, end, attendees, description }) => {
    const accessToken = getAccessTokenFromTokenVault();
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          description,
          start: { dateTime: start },
          end: { dateTime: end },
          attendees: attendees?.split(",").map((e) => ({ email: e.trim() })),
        }),
      }
    );
    if (!res.ok) return `Calendar error: ${await res.text()}`;
    const event = await res.json();
    return `Event "${event.summary}" created. Link: ${event.htmlLink}`;
  },
  {
    name: "create_calendar_event",
    description: "Create a Google Calendar event",
    schema: z.object({
      summary: z.string().describe("Event title"),
      start: z.string().describe("Start time ISO 8601"),
      end: z.string().describe("End time ISO 8601"),
      attendees: z.string().optional().describe("Comma-separated emails"),
      description: z.string().optional().describe("Event description"),
    }),
  }
);

export const sendGmail = tool(
  async ({ to, subject, body }) => {
    const accessToken = getAccessTokenFromTokenVault();
    const raw = btoa(
      `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      }
    );
    if (!res.ok) return `Gmail error: ${await res.text()}`;
    return `Email sent to ${to}.`;
  },
  {
    name: "send_gmail",
    description: "Send an email via Gmail",
    schema: z.object({
      to: z.string().describe("Recipient email"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body text"),
    }),
  }
);

export const postSlackMessage = tool(
  async ({ channel, text }) => {
    const accessToken = getAccessTokenFromTokenVault();
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ channel, text }),
    });
    if (!res.ok) return `Slack error: ${await res.text()}`;
    const data = await res.json();
    return data.ok ? `Message posted to #${channel}.` : `Slack API error: ${data.error}`;
  },
  {
    name: "post_slack_message",
    description: "Post a message to a Slack channel",
    schema: z.object({
      channel: z.string().describe("Channel name or ID"),
      text: z.string().describe("Message text"),
    }),
  }
);
