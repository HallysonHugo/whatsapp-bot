import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

@Injectable()
export class CalendarService implements OnModuleInit {
  constructor() {}
  private _googleCalendarApi;
  async onModuleInit() {
    this._googleCalendarApi = await this.initializeGoogleCalendarApi();
  }

  async initializeGoogleCalendarApi() {
    const auth = await authenticate({
      keyfilePath: path.join(
        process.cwd(),
        'src',
        'calendar',
        'credentials.json',
      ),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    if (auth.credentials) {
      google.options({ auth });
    }
    return google.calendar({ version: 'v3', auth });
  }

  async addEventToCalendar(
    calendarId: string,
    event: {
      summary: string;
      description?: string;
      start: { dateTime: string; timeZone?: string };
      end: { dateTime: string; timeZone?: string };
    },
  ): Promise<any> {
    if (!this._googleCalendarApi) {
      this._googleCalendarApi = await this.initializeGoogleCalendarApi();
    }
    try {
      const response = await this._googleCalendarApi.events.insert({
        calendarId,
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      throw error;
    }
  }

  async updateEventInCalendar(
    calendarId: string,
    eventId: string,
    event: {
      summary?: string;
      description?: string;
      start?: { dateTime: string; timeZone?: string };
      end?: { dateTime: string; timeZone?: string };
    },
  ): Promise<any> {
    if (!this._googleCalendarApi) {
      this._googleCalendarApi = await this.initializeGoogleCalendarApi();
    }
    try {
      const response = await this._googleCalendarApi.events.update({
        calendarId,
        eventId,
        requestBody: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating event in calendar:', error);
      throw error;
    }
  }

  async deleteEventFromCalendar(
    calendarId: string,
    eventId: string,
  ): Promise<void> {
    if (!this._googleCalendarApi) {
      this._googleCalendarApi = await this.initializeGoogleCalendarApi();
    }
    try {
      await this._googleCalendarApi.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      console.error('Error deleting event from calendar:', error);
      throw error;
    }
  }

  async getEventsFromCalendar(
    calendarId: string,
    timeMin?: string,
    timeMax?: string,
    maxResults?: number,
  ): Promise<any> {
    if (!this._googleCalendarApi) {
      this._googleCalendarApi = await this.initializeGoogleCalendarApi();
    }
    try {
      const response = await this._googleCalendarApi.events.list({
        calendarId,
        timeMin,
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.data.items;
    } catch (error) {
      console.error('Error retrieving events from calendar:', error);
      throw error;
    }
  }
}
