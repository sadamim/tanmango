# Testing guide: how to check every feature

Written in simple words so anyone on the team can follow it. Do the parts in order. Each test says **Do**, **You should see**, and **If it fails**.

## What this app does (in 5 lines)

A coach shares a link (Instagram, YouTube, LinkedIn). A visitor takes the **Pattern Check** quiz, then joins a **free masterclass**, then books a **one-to-one call**, then **pays for the 6-week programme** and learns in the **portal**. The app saves everything about each person on one **lead record**, sends emails and WhatsApp messages automatically, and shows the coach a **funnel** (where people drop off).

---

## Part 0: Get ready (once)

### What you need
| Thing | Why | Where to get it |
|---|---|---|
| Firebase (Firestore) | Saves all data | Already set up |
| EmailJS | Sends emails | service id, 2 templates, public + private key |
| Twilio WhatsApp sandbox | Sends WhatsApp | Account SID, Auth Token, sandbox number `+1 415 523 8886` |
| Cloudinary | Saves uploaded files | Cloud name, API key, API secret |

### Check the settings file
Open `.env.local`. These names must all have a value:

```
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, ADMIN_EMAILS
EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_GENERIC_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start the app
```bash
npm run dev
```
Open http://localhost:3000. **Restart it (Ctrl+C, then `npm run dev`) after changing the settings file.**

### Join the WhatsApp sandbox (each test phone, every 24 hours)
From the phone that will receive WhatsApp tests, send a message ("hi") to **+1 415 523 8886**. Without this, no WhatsApp test message can arrive. If WhatsApp tests stop working after a day, send "hi" again.

### People you will need for testing
- **Coach:** you, logged in.
- **Visitor 1:** your own email and phone (this is the person who receives the emails and WhatsApp).
- **Visitor 2:** a second email (a friend's, or a second email of yours) and any 10-digit number. Used for "seats full", "did not attend", and similar tests.

> Every email counts toward EmailJS's free limit of 200 per month. Use only your own emails and don't repeat tests more than needed.

---

## Part 1: Login and the admin panel

### T1. Sign up and log in
- **Do:** go to `/web/sign-up`, enter name, email and phone, accept the terms, ask for the code, enter it.
- **You should see:** you land in the dashboard. A code arrives by email.
- **If it fails:** the code is wrong or expired (it lasts 5 minutes). Ask for a new one. If no code arrives, check EmailJS (`EMAILJS_*` values, and Account → Security → "Allow EmailJS API for non-browser applications" is on). In development the code also shows on screen.

### T2. Admin panel
- **Do:** log in with the email listed in `ADMIN_EMAILS`, then open `/admin`.
- **You should see:** the admin overview. Open `/admin/settings`: it should say **Firebase Firestore**.
- **If it fails:** the email isn't in `ADMIN_EMAILS`, or the app wasn't restarted. If it says "file" instead of Firestore, the Firebase values aren't being read.

---

## Part 2: Set up the coach's funnel

### T3. Pattern Check settings
- **Do:** Sidebar → **Growth → Pattern Check**.
- **You should see:** a public link (`/q/<name>`), four sample patterns with statements and scores, result rules (50 / 15 / 30 / 70), and one result email box per pattern.
- **Do:** change a pattern name, press **Save patterns and rules**.
- **You should see:** a "saved" message. Reload the page and the change is still there.
- **Do:** type your own WhatsApp number (10 digits) into **Alert WhatsApp number** and press **Save**, then **Send test alert**.
- **You should see:** an email and a WhatsApp message saying "Test alert: your lead alerts are working."

### T4. Masterclass and call slots
- **Do:** Growth → **Masterclass & Calls**. Press **+ New masterclass**. Fill in a title, a start time in the future, 2 seats, and any link. Save.
- **Do:** under "Discovery conversation slots", pick tomorrow's date, type times like `10:00, 11:00`, press **Add slots**.
- **You should see:** the masterclass in the table (0 / 2 seats) and the slots listed as "Open".

### T5. Tracked links and link-in-bio
- **Do:** Growth → **Links & Bio Page**. Press **+ New tracked link**: name "IG reel test", platform Instagram, campaign "test", code `ig-test`, goes to **quiz**. Save.
- **Do:** copy the tracked address (`.../api/go/ig-test`) and open it in a private browser window.
- **You should see:** you land on the Pattern Check page. Back in the dashboard the link shows **1 click**.
- **Do:** in "Link-in-bio page" press **Add the 3 funnel buttons**, then **Save**. Open `/l/<name>` and click one button.
- **You should see:** the bio page with 3 buttons; the click is counted (the number appears beside the button after you reload the dashboard page).

---

## Part 3: A visitor goes through the funnel

Use a **private browser window** so you are not logged in as the coach.

### T6. Take the Pattern Check
- **Do:** open the tracked link from T5. Tick some statements. Press **See my result**. Enter name, your real email, your phone, tick the WhatsApp box, submit.
- **You should see:** a result page with the main pattern name and percentage bars. A message says the result was emailed.
- **Check your inbox:** the email "Your pattern, named" (also check spam).
- **Check WhatsApp:** "Thanks ..., you're opted in ... which pattern did you spot first?"
- **If it fails:** open the lead in Leads & CRM → **Messages sent** at the bottom. It shows "failed" with the reason.

### T7. The coach sees the lead
- **Do (as coach):** Growth → **Leads & CRM**. Click the person's name.
- **You should see the call card:**
  - Name, email, phone, "WhatsApp opted in".
  - Source: **Instagram · test** (from the tracked link).
  - Pattern Check result: the type (Single / Blend), the percentage of each pattern, and the **exact statements they ticked**, listed under each pattern.
  - A Journey list and a Messages sent list.
- **Also check:** a bell notification "New lead: ...", an alert email to the coach, and an alert WhatsApp (if you set the alert number).

### T8. Quiz checks
- **Do:** try submitting without ticking anything, with a bad email, and with a short phone number.
- **You should see:** a clear error message each time, and nothing saved.
- **Do:** submit the quiz twice with the same email.
- **You should see:** still **one** lead record (not two).

### T9. Masterclass registration
- **Do (visitor):** open `/m/<name>`. Register as Visitor 1 (same email as T6).
- **You should see:** "Seat #1" and a confirmation email.
- **Do:** register Visitor 2. **You should see:** "Seat #2".
- **Do:** register a third person.
- **You should see:** "Sorry, every seat is taken".
- **Do (coach):** open Visitor 1's call card.
- **You should see:** the masterclass and seat number on the **same** record as the quiz (not a new person).

### T10. Attendance and follow-ups
- **Do (coach):** Growth → Masterclass & Calls → **Attendance** on the masterclass. Tick Visitor 1 only. Save.
- **You should see:** Visitor 1 gets "Thank you for joining" (with replay and booking link). Visitor 2 gets "We missed you, here is the replay".
- **Do:** click the replay link in an email.
- **You should see:** it opens the replay link you set. After the 48-hour window, it shows a "closed" message instead.

### T11. Book the discovery call
- **Do (visitor):** open `/call/<name>`. Pick a day and time, enter details, confirm.
- **You should see:** "Your conversation is booked" and a confirmation email with two preparation questions. The coach gets an alert.
- **Do:** try booking the **same time** as another person.
- **You should see:** "That time was just booked."
- **Do (coach):** open the call card.
- **You should see:** the call time on the **same** record, and the booked slot marked with the person's name in Masterclass & Calls.

### T12. After the call
- **Do (coach):** on the call card press **Call done (start follow-ups)**.
- **You should see:** an email "Next step: enrol in ..." and follow-ups scheduled for Day 1, 3 and 6.
- **Also try:** **No-show** (a reschedule message is queued for 15 minutes later) and **Said no** (stops sales messages).

---

## Part 4: Automatic messages (workflows)

### T13. See all workflows
- **Do:** Growth → **Workflows**.
- **You should see:** 12 workflows, each with a switch, a short rule ("Stops when they ..."), and Sent / Opened / Clicked / Acted numbers.
- **Do:** open **Show messages** on one, change the text, press **Save messages**. Trigger it again.
- **You should see:** the new text is used.

### T14. Opens, clicks and "acted on"
- **Do:** open one of the emails you received and click a link inside it.
- **You should see:** on the Workflows page, after a few seconds, **Opened** and **Clicked** increase for that workflow. **Acted** increases when the person reaches the next step (for example registers for the masterclass after the Pattern Check emails).

### T15. The stop rule (important)
- **Do:** make a new visitor take the Pattern Check (this schedules Day 2, 4 and 6 emails). Register them for the masterclass. Then press **Send due messages now**.
- **You should see:** the Pattern Check follow-ups are **cancelled**. Open the call card Messages list: no Day 2/4/6 email arrives.
- **Do:** take a person to "Call done", then press **Mark paid / enrolled**, then **Send due messages now**.
- **You should see:** the Day 1/3/6 enrol follow-ups **stop**. Only the welcome email is sent. **Nobody gets a sales message after paying.**

### T16. Timed messages
- Reminders and follow-ups are sent when a timer comes due. Press **Send due messages now** to send anything due at that moment.
- In real use, a scheduler must call `/api/cron/run` every 5 minutes (see the README). To test it:
```bash
curl -X POST http://localhost:3000/api/cron/run
```

### T17. Someone who doesn't want emails
- **Do:** Marketing → **Unsubscribed Users**, add a visitor's email. Trigger a workflow for that person.
- **You should see:** no email is sent to them. The message shows as "skipped: unsubscribed".

### T18. WhatsApp rules
- WhatsApp messages go **only** to people who ticked the box. Take the quiz again with a new visitor and **do not tick** it.
- **You should see:** the emails arrive, but no WhatsApp message is sent.
- Remember: free-form WhatsApp only reaches a phone that messaged the sandbox in the last 24 hours.

---

## Part 5: Numbers and reports

### T19. The funnel
- **Do:** Growth → **Funnel**.
- **You should see:** five step cards: Attention (clicks), Capture (leads, Pattern Check, half-filled forms), Free masterclass (registered, show-up rate, replay views), Discovery call (booked, attended, enrolled), Programme (enrolments, recovered payments, missed classes, completed, testimonials). Each step shows how many entered, how many moved on, and the **% who dropped off**. Below are the **7 groups** (click one to see those people) and **lead sources**.

### T20. Half-filled form
- **Do (visitor):** on a form, type only the email, then leave the page.
- **You should see:** a lead with no name, in the group **Half-filled a form**.

### T21. Weekly report
- **Do:** Growth → **Weekly Report**. Pick the week. Under "Social numbers" choose Instagram, type followers, reach and the others, press **Save**.
- **You should see:** the funnel table for that week, your social numbers with arrows against the previous week, and monetisation progress bars (YouTube 1,000 subscribers / 4,000 watch hours; Instagram 10,000 followers).
- Each Monday the report is emailed to the coach by the scheduler. To test the numbers, check the page; the email only goes out on Mondays.

---

## Part 6: Payment, learning portal and proof

### T22. Set up the programme
- **Do:** create the programme as a product (**Mangoes**). Then Learning Portal → **Settings**: choose it as the **programme product**, add the kick-off date, and the boundary and referral lines. Save.
- **Do:** add lessons (Lessons tab), a class (Classes tab), and an assignment in Week 4 or later (Assignments tab).

### T23. Enrol
- **Do:** buy the programme through its checkout page (test mode), or press **Mark paid / enrolled** on the person's call card.
- **You should see:** a welcome email with the portal link, the person appears in Learning Portal → **Learners**, and their lead shows the stage **Programme**.
- **Note:** payments are in test mode. Real payment needs Razorpay, which is not connected yet.

### T24. The learner uses the portal
- **Do:** open `/portal` in a private window and log in with the learner's email (a code is emailed).
- **You should see:** the programme name, a progress bar, and weeks with classes, lessons and assignments. Week 4+ assignments show the boundary and referral lines.
- **Do:** tick a lesson, submit an assignment.
- **You should see:** progress rises. The coach gets an alert "submitted ...".
- **Also check:** a learner cannot open the coach's dashboard. They are sent to the portal.

### T25. Feedback and announcements
- **Do (coach):** Learning Portal → **Submissions** → **Give feedback**.
- **You should see:** the learner gets "Your feedback is ready" and sees the feedback in the portal. After feedback, the learner can no longer resubmit.
- **Do:** Announcements → **New announcement**.
- **You should see:** every active learner gets it by email (and WhatsApp if opted in).

### T26. Class attendance and drop-off rescue
- **Do:** Classes tab → **Attendance**, leave the learner un-ticked, save.
- **You should see:** the learner gets a warm "We saved your seat" email. A **second** miss sends the coach an alert to call personally.

### T27. Completion
- **Do:** make the learner finish every lesson and submit every assignment.
- **You should see:** progress 100%, a **certificate** page (`/portal/certificate`, printable), and an email: "You completed ...". Three days later the testimonial request is sent; seven days later, the referral email.

### T28. Testimonials
- **Do:** open `/t/<name>?l=<lead id>` (the link in the email), answer, tick the permission box, send.
- **You should see:** in Growth → **Testimonials**, a new entry marked "Permission given".
- **Do:** press **Approve**, then open `/stories/<name>`.
- **You should see:** it shows publicly. A testimonial **without** the permission tick cannot be approved.

---

## Part 7: Files, policies and safety

### T29. File uploads (Cloudinary)
- **Do:** Settings → **TagMango Cloud** → upload a small image (under 10 MB).
- **You should see:** it appears in the list, opens when clicked, and appears in the Cloudinary Media Library under `uploads`. Deleting it removes it from both.

### T30. Policy pages
- Open `/privacy`, `/terms`, `/refund-policy`.
- **You should see:** three pages. The privacy page includes the line **"Your answers will be used to prepare for our conversation."** The text is a template: have it reviewed before launch.

### T31. Privacy and safety checks
- **Do:** log in as a **different** coach and open Growth → Leads & CRM.
- **You should see:** none of the first coach's leads.
- **Do:** open a lead's call-card address while logged out, or as another coach.
- **You should see:** access refused.
- **Do:** open `/api/t/c/xyz?u=https://example.com`.
- **You should see:** it does **not** redirect to example.com (only links that were in a real email work).

---

## Quick pass/fail checklist

| # | Feature | Pass? |
|---|---|---|
| T1 | Sign up and login | ☐ |
| T2 | Admin panel shows Firebase Firestore | ☐ |
| T3 | Pattern Check settings save, test alert arrives | ☐ |
| T4 | Masterclass and slots created | ☐ |
| T5 | Tracked link counts a click, bio page works | ☐ |
| T6 | Quiz → result page, email and WhatsApp arrive | ☐ |
| T7 | Call card shows percentages and ticked statements | ☐ |
| T8 | Quiz rejects bad input, no duplicate lead | ☐ |
| T9 | Seats are numbered and limited, same record | ☐ |
| T10 | Attendance sends the right follow-ups | ☐ |
| T11 | Call booking, no double booking | ☐ |
| T12 | Call done / no-show / said no | ☐ |
| T13 | Workflows page, messages editable | ☐ |
| T14 | Opened / clicked / acted counts | ☐ |
| T15 | Stop rules (nothing sent after paying) | ☐ |
| T16 | Timed messages through the scheduler | ☐ |
| T17 | Unsubscribed people get no email | ☐ |
| T18 | WhatsApp only to opted-in people | ☐ |
| T19 | Funnel, drop-off %, groups, sources | ☐ |
| T20 | Half-filled form captured | ☐ |
| T21 | Weekly report and social numbers | ☐ |
| T22–23 | Programme set up, learner enrolled | ☐ |
| T24 | Portal: lessons, assignments, progress | ☐ |
| T25 | Feedback and announcements | ☐ |
| T26 | Missed class rescue | ☐ |
| T27 | Completion and certificate | ☐ |
| T28 | Testimonials with permission | ☐ |
| T29 | File upload to Cloudinary | ☐ |
| T30 | Policy pages | ☐ |
| T31 | Other coaches cannot see the data | ☐ |

---

## Known limits (tell the team up front)

1. **WhatsApp sandbox:** only phones that messaged the sandbox number in the last 24 hours receive messages. Real customers need a registered WhatsApp number and approved templates.
2. **Email:** EmailJS free plan allows 200 emails a month. For real volume use SMTP (for example Brevo, 300 a day free).
3. **Social numbers** (followers, reach, watch time) are typed in weekly. They can't be pulled automatically.
4. **Payments** are in test mode. Razorpay isn't connected.
5. **Pattern Check content** (names, statements, scores) is sample content until the coach provides hers.
6. **Policy pages** are templates for legal review.
7. **The scheduler** (`/api/cron/run`) must be called every 5 minutes in real use for reminders and follow-ups.
8. **Replay links** should be private Vimeo or Bunny Stream links, never YouTube unlisted.

## If something goes wrong

| Problem | Check |
|---|---|
| No email arrives | Spam folder. EmailJS → Email History. The lead's **Messages sent** list shows the error. Is `EMAILJS_GENERIC_TEMPLATE_ID` set and the app restarted? |
| No WhatsApp arrives | Did the phone message the sandbox in the last 24 hours? Did the person tick the WhatsApp box? Twilio keys and balance? |
| Reminders don't send | Press **Send due messages now**, or call `/api/cron/run`. |
| Link in an email points to localhost | `NEXT_PUBLIC_APP_URL` must be the real address when live. |
| Changes in the settings file do nothing | Restart `npm run dev`. |
| "Not found" on a public page | The link name in the address must match the one in Growth → Pattern Check. |
