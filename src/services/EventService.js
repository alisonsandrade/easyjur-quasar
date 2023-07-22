import { request } from "boot/axios";

class EventService {
  constructor() {}

  async getEvents(idCalendar, options) {
    const startdatetime = new Date();
    const enddatetime = new Date().setDate(startdatetime.getDate() + 360);

    const url = idCalendar
      ? `/me/calendars/${idCalendar}/events?${startdatetime}&${enddatetime}?$select=subject,body,bodyPreview,organizer,attendees,start,end,location`
      : "/me/events";

    const response = await request.get(url, options);
    return response.data;
  }

  async getAllCalendars(options) {
    const url = "/me/calendars";
    const response = await request.get(url, options);
    return response.data;
  }

  async create(data, options) {
    const { calendar } = data;
    const url = `/me/calendars/${calendar.id}/events`;
    const dataPrepared = this.prepareDataToGraph(data);
    return await request.post(url, dataPrepared, options);
  }

  async createMassive(data, options) {
    const url = "$batch";
    const dateNormalized = this.normalizeDataCreateEvents(data);
    return await request.post(url, { requests: dateNormalized }, options);
  }

  async deleteEvent(idCalendar, idEvent) {
    const url = `/me/calendars/${idCalendar}/events/${idEvent}`;
    return await request.delete(url);
  }

  prepareDataToGraph(data) {
    const { start, end, subject, attendees, body, isAllDay } = data;

    return {
      subject,
      start: {
        dateTime: start,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: end,
        timeZone: "America/Sao_Paulo",
      },
      body: {
        contentType: "HTML",
        content: body,
      },
      attendees: attendees ? this.sanitizeAttendees(attendees) : [],
      isAllDay,
    };
  }

  sanitizeAttendees(attendees) {
    const arrayPrepared = attendees
      .split(",")
      .map((d) => d.trim())
      .filter((item) => item !== "" && item !== undefined);

    arrayPrepared.forEach((email) => {
      if (!this.isValidEmail(email))
        throw new Error(`O e-mail ${email} é inválido.`);
    });

    const arrayAttendees = [];
    arrayPrepared.forEach((attendee) => {
      arrayAttendees.push({
        type: "required",
        emailAddress: {
          address: attendee,
        },
      });
    });
    return arrayAttendees;
  }

  isValidEmail(email) {
    return /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email);
  }

  normalizeDataCreateEvents(events) {
    return events.map((event, key) => {
      return {
        id: key + 1,
        method: "POST",
        url: `/me/calendars/${event.calendar.id}/events`,
        body: {
          subject: event.subject,
          start: {
            dateTime: event.start,
            timeZone: "America/Sao_Paulo",
          },
          end: {
            dateTime: event.end,
            timeZone: "America/Sao_Paulo",
          },
          body: {
            contentType: "HTML",
            content: event.body,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      };
    });
  }
}

export const eventService = new EventService();
