# Booking Page Setup Guide — joshdlange.com
## Recommended: Google Calendar Appointment Schedule (Free)
## Written: 2026-03-16

---

## Why Google Calendar (not Calendly)

- 100% free, no account limits, no branding watermark on free tier
- Already syncs to your existing Google Calendar (josh@trillage.io)
- Generates an embeddable iframe — drop it straight into the site
- Clients get automatic confirmation + reminder emails
- No third-party data sharing

Calendly free tier = 1 event type only, Calendly branding on booking page. Not worth it.

---

## Setup Steps (10 minutes)

### Step 1 — Create the Appointment Schedule
1. Go to **calendar.google.com** (logged in as josh@trillage.io)
2. Click **+ Create** → select **Appointment schedule**
3. Fill in:
   - **Title:** "Free 30-Minute Strategy Call with Josh"
   - **Duration:** 30 minutes
   - **Availability:** Set your working hours (e.g. Mon-Fri 9am-5pm CT)
   - **Buffer time:** 15 minutes between appointments (recommended)
4. Under **Booking form**, add these fields:
   - Name (default)
   - Email (default)
   - **Custom question:** "What's your biggest operational challenge right now?" (short answer)
5. Under **Scheduling window**, set how far out people can book (suggest: 2-4 weeks)
6. Click **Save**

### Step 2 — Get the Embed Code
1. In Google Calendar, find your new appointment schedule on the left sidebar under "Booking pages"
2. Hover over it → click the **three dots** → **Sharing options**
3. Click **Website embed**
4. Select **"Inline booking page"** (not button)
5. Copy the iframe code — it looks like:
   ```html
   <iframe src="https://calendar.google.com/calendar/appointments/schedules/XXXXX" 
           style="border: 0" width="100%" height="600" frameborder="0"></iframe>
   ```

### Step 3 — Send the iframe code to Peter
Paste the iframe code in GChat and Peter will add a new "Book a Call" section to joshdlange.com, styled to match the dark theme.

---

## What Peter Will Build

A new section on joshdlange.com between the Services section and the Contact Form:
- "Book a Free 30-Minute Call" header
- Brief copy ("No pitch, just an honest conversation about where you're leaving money")
- The Google Calendar booking iframe embedded inline
- CTA button in the nav linking to this section

---

## GA4 Event Tracking (Peter handles this)

Once embedded, Peter will add a script to fire `gtag('event', 'schedule_call')` when the booking iframe sends a confirmation message — tracking booked calls as conversion events in GA4.

---

## Alternative: Cal.com (open source Calendly)

If Google Calendar's embed feels too plain, **cal.com** is a free, open-source Calendly alternative:
- Self-hostable or use their free hosted tier
- Much better UI than Google's native embed
- No branding on free tier
- Connects to Google Calendar
- Embeddable widget

Setup: cal.com/signup → connect Google Calendar → copy embed snippet → send to Peter.

**Recommendation:** Try Google Calendar first (zero setup). If it looks bad on the site, switch to Cal.com.
