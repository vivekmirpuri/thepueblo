# The Pueblo — product context

Group 3, Hackathon TechLab II. This file says **what** we are building and **why**.
How it is built: [ARCHITECTURE.md](ARCHITECTURE.md). Who builds what, in what order: [PLAN.md](PLAN.md).

## One sentence

A map of the Canary Islands full of small social meetups that anyone can create and join, so people of different origins and languages actually meet — in person or online.

Think GuruWalk or Google Maps, but the pins are meetups created by neighbours and institutions.

## The problem

People who arrive in the islands (and plenty who were born here) find it hard to meet others: they don't know what is happening nearby, they are unsure whether anyone there will speak their language, and official activities and informal meetups live in different places.

## Two sides

| Side | Who | What they do |
|---|---|---|
| **People** (the core) | Anyone who wants to cooperate and meet people around them | Create a profile, find and join meetups, create their own, chat with the group, find people like them |
| **Instituciones** | Town halls, cabildos, NGOs, cultural centres | Publish **official** events and meetups, shown with an "Official" badge |

## Features

Each feature has an ID so branches, PRs and team files can refer to it.

### Profile and onboarding
- **F1 Account.** Sign in with email and password (Google sign-in can be added later).
- **F2 Onboarding.** Pick interests from the meetup categories, the **languages you speak** (required), your island, and a few short questions that help matching: in person / online / both, when you are usually free, one line about what you'd like to do with others.
- **F3 Institution account.** At onboarding you can say "I represent an institution". It becomes able to publish official events once verified (done by hand for the hackathon).

### Discover
- **F4 Map.** Canary Islands map with a pin per event.
- **F5 Category chips.** A row of buttons above the map (like Google Maps' "Restaurants / Groceries"), one per meetup category: sport, languages, politics & debate, improv, music, food… Tapping filters the map and the list.
- **F6 Nearby.** Uses the device location to sort events by distance. Other sorts: soonest, most joined. Filters: official only, online only, "speaks my languages".
- **F7 Event list.** The same events as cards under the map.

### Events
- **F8 Create event.** Title, description, category, date/time, in person (place on map) or online (link), optional capacity, optional cover image (uploaded).
- **F9 Similar-event check.** Before posting, a small model running **on the device** looks for similar existing events and suggests joining one instead of creating a duplicate.
- **F10 Join / leave.**
- **F11 Language flags.** Every event shows the flags of the languages spoken by the people who joined, with counts, so you can see whether someone there speaks your language.
- **F12 Reviews.** People who attended leave a star rating and a comment.
- **F13 Official events.** Events from verified institutions carry an "Official" badge and can be filtered.

### Together
- **F14 Group chat.** Once you join an event you enter its group chat (like a WhatsApp group) with everyone else who joined.
- **F15 People like you.** A list of profiles similar to yours (shared interests and languages).

### Assistant
- **F16 Chatbot.** Two modes: "Suggest for me" (uses your profile) and free-form search ("something outdoors this weekend in Tenerife, in English"). Runs on the device.

## Meetup categories (first version)

Sport · Outdoors & hiking · Language exchange · Politics & debate · Improv & theatre · Music · Food & cooking · Tech · Arts & crafts · Games · Volunteering · Families · Wellbeing · Culture & heritage

One list, defined once in code, used by onboarding interests, the chips and the event form.

## Principles

- **Minimal and clean.** Few screens, one obvious action per screen, mobile first.
- **Works on any device.** Phone, tablet, laptop. The AI parts degrade gracefully instead of blocking.
- **Language is visible.** Languages spoken are shown everywhere a person or an event appears.
- **Private by default.** We never store a person's exact location; only their island. Group chats are readable by members only. The AI runs on the device, so what you type into it stays there.

## Out of scope for the hackathon

Payments, push notifications, direct one-to-one messages, profile photo uploads, moderation tools, native apps, translating the interface into several languages (interface is in one language; content is whatever people write).

## Glossary

| Term | Meaning |
|---|---|
| **Event / meetup** | Same thing. One gathering with a time, a category and a place or a link. |
| **Official event** | Event created by a verified institution. |
| **Attendee** | A user who joined an event. |
| **Category** | One of the fixed meetup types above. A user's *interests* are categories. |
| **Island** | One of the eight Canary Islands; the coarsest location we store for a person. |
| **Local model** | A model that runs in the browser on the user's device, not on a server. |
