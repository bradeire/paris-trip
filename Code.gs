/**
 * Paris Trip — live feed backend
 * -------------------------------
 * Runs entirely on your own Google account (no separate login, no
 * credentials stored anywhere else). Deployed as a Web App, it exposes
 * a small JSON endpoint that the PWA polls every 90 minutes.
 *
 * SETUP
 * 1. Go to script.google.com -> New project.
 * 2. Delete the placeholder code, paste in this whole file.
 * 3. Click Deploy -> New deployment -> type: "Web app".
 *      Execute as:  Me
 *      Who has access: Anyone
 * 4. Click Deploy, then Authorize access when prompted (it's your own
 *    script touching your own Gmail/Calendar — you'll see an "unverified
 *    app" warning, that's normal for a personal script: Advanced ->
 *    Go to <project name> (unsafe) -> Allow).
 * 5. Copy the "Web app URL" it gives you (ends in /exec) and paste it
 *    into LIVE_CONFIG.scriptUrl near the top of index.html.
 *
 * That's it — no schedule/trigger needed here. The script just answers
 * fresh every time the app calls it; the 90-minute cadence lives in the
 * app itself, so you're not spinning up Google infrastructure on a timer
 * you don't control.
 */

// ---- Adjust these if anything about the trip changes ----
var TRIP_END = new Date('2026-09-05T23:59:59');
var FAMILY_CALENDAR_ID = 'family00503160338403755998@group.calendar.google.com';
var GMAIL_QUERY = '(from:centerparcs OR from:groupe-pvcp OR from:tiqets OR from:super.com ' +
  'OR from:leshuttle OR from:eurotunnel OR from:disneylandparis OR from:magicbreaks ' +
  'OR "Villages Nature" OR "Disneyland" OR "LeShuttle" OR "Novotel" OR "Center Parcs") ' +
  'newer_than:45d';

function doGet(e) {
  var result = {
    generatedAt: new Date().toISOString(),
    tripEnded: new Date() > TRIP_END,
    emails: [],
    events: []
  };

  try {
    result.emails = fetchEmails();
  } catch (err) {
    result.emailError = String(err);
  }

  try {
    result.events = fetchEvents();
  } catch (err) {
    result.eventError = String(err);
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function fetchEmails() {
  var threads = GmailApp.search(GMAIL_QUERY, 0, 25);
  return threads.map(function (thread) {
    var msgs = thread.getMessages();
    var last = msgs[msgs.length - 1];
    return {
      id: last.getId(),
      threadId: thread.getId(),
      subject: thread.getFirstMessageSubject(),
      from: last.getFrom(),
      date: last.getDate().toISOString(),
      snippet: last.getPlainBody().substring(0, 240).replace(/\s+/g, ' ').trim()
    };
  });
}

function fetchEvents() {
  var calendars = [CalendarApp.getDefaultCalendar()];
  var familyCal = CalendarApp.getCalendarById(FAMILY_CALENDAR_ID);
  if (familyCal) calendars.push(familyCal);

  var rangeStart = new Date();
  var rangeEnd = TRIP_END;
  var out = [];

  calendars.forEach(function (cal) {
    if (!cal) return;
    var events = cal.getEvents(rangeStart, rangeEnd);
    events.forEach(function (ev) {
      out.push({
        id: ev.getId(),
        title: ev.getTitle(),
        start: ev.getStartTime().toISOString(),
        end: ev.getEndTime().toISOString(),
        allDay: ev.isAllDayEvent(),
        location: ev.getLocation() || '',
        description: (ev.getDescription() || '').substring(0, 300),
        calendar: cal.getName(),
        lastUpdated: ev.getLastUpdated().toISOString()
      });
    });
  });

  return out;
}
