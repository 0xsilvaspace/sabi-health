# Sabi Health – Product Requirements Document (PRD)
## Proactive Voice AI for Disease Prevention

**Version:** 1.0  
**Date:** February 21, 2026  
**Team:** [Your Team Name]  
**Theme:** *From Data to Prevention: AI as your Health Partner*

---

## 1. Product Overview

**Sabi Health** is a proactive health companion that uses real-time environmental and epidemiological data to place automated outbound calls to at-risk individuals, delivering personalized, culturally resonant voice advice in Nigerian Pidgin/English. The system predicts disease outbreaks (Lassa fever, malaria, cholera) and educates users before exposure occurs, while providing a safety net by connecting symptomatic users to the nearest health center.

**Tagline:** *“Your AI neighbor that calls before sickness catches you.”*

---

## 2. Problem Statement

- Healthcare in Nigeria is predominantly reactive: interventions happen after people are already sick.
- Official public health bulletins and weather reports are too technical for the average person to translate into daily action.
- In February 2026, a Lassa fever surge in the North and an early malaria spike in the South demand immediate, localized public health communication.
- Trust in automated systems is low; people prefer advice from someone who sounds like them and understands their context.
- Many at-risk individuals lack smartphones or constant internet access, but nearly everyone has access to a basic mobile phone.

---

## 3. Target Audience

- Residents of high-risk Local Government Areas (LGAs) in Nigeria.
- Individuals without smartphones or reliable internet (voice calls work on any phone).
- Public health agencies and NGOs seeking to disseminate preventive information at scale.
- Health-conscious individuals who want personalized, actionable health advice.

---

## 4. Solution Overview

**Sabi Health** evolves from a passive information source into an active preventive partner. The system continuously monitors two data streams:

- **Weather data** (rainfall, humidity) from Open-Meteo API.
- **Disease hotspot data** from a curated (mock) NCDC dataset.

When risk thresholds are crossed, the system automatically generates a short, friendly voice message in authentic Nigerian Pidgin/English using **Gemini 1.5 Flash** and **YarnGPT/Spitch** for voice synthesis. It then places an outbound call to registered users in the affected LGA. During the call, the AI asks about the user’s health and, if a fever is reported, provides the address of the nearest primary health center.

---

## 5. Core Features (MVP)

| Feature | Description |
|--------|-------------|
| **User Registration** | Collect name, phone number, and LGA via a simple web form. |
| **Environmental & Epidemiological Monitoring** | Fetch rainfall data (Open-Meteo) and check against a static hotspot list (mock NCDC). |
| **Risk Engine** | Simple rule-based logic: if rainfall >15mm in the last 24h OR LGA is flagged as a hotspot → risk = HIGH. |
| **AI Script Generation** | Use Gemini 1.5 Flash to generate a culturally appropriate preventive message in Pidgin/English based on risk type and LGA. |
| **Voice Synthesis** | Convert the script to speech using YarnGPT/Spitch API, delivering a natural Nigerian accent. |
| **Call Simulation** | A web dashboard that simulates an outbound call: plays the audio and captures user responses (“I have fever” / “I’m fine”). |
| **Health Center Referral** | If user reports fever, display the nearest health center address (static for demo). |
| **Dashboard & Logs** | Show registered users, current risk status, call history, and manual trigger button for demo. |

---

## 6. Technical Architecture

```
[Next.js Frontend Dashboard]
         |
         | REST API
         ↓
[FastAPI Backend]
 ├─ Risk Engine (rainfall + hotspot rules)
 ├─ Gemini AI (script generation)
 ├─ Open-Meteo API (weather data)
 ├─ YarnGPT/Spitch API (text-to-speech)
 ├─ Twilio (optional – for real calls) or Simulated Calls
 └─ In-memory store (users, logs, mock hotspot data)
```

**Technology Stack:**
- **Backend:** FastAPI (Python)
- **Frontend:** Next.js (React) with Tailwind CSS
- **AI:** Gemini 1.5 Flash (Google AI Studio)
- **Voice:** YarnGPT / Spitch API
- **Weather:** Open-Meteo API (free, no API key)
- **Epidemiological Data:** Static JSON (mock NCDC)
- **Deployment:** Localhost for demo (or Vercel + Railway if time permits)

---

## 7. User Flow (Demo Scenario)

1. **Registration**  
   User visits the dashboard, fills in name, phone, and LGA (e.g., “Kano”). Data is stored in memory.

2. **Risk Monitoring**  
   Backend periodically checks Open-Meteo for Kano. If rainfall >15mm OR Kano is in the mock hotspot list, risk is set to HIGH.

3. **Call Trigger**  
   - In a real scenario, a scheduler would trigger automatically.  
   - For demo, a manual “Trigger Health Call” button on the dashboard initiates the process.

4. **Message Generation**  
   Backend calls Gemini with a prompt like:  
   *“Generate a short, friendly preventive message in Nigerian Pidgin/English for a user in Kano. Risks: Lassa fever (hotspot) and malaria (heavy rain). Ask if anyone has fever.”*  
   Gemini returns a script (e.g., *“Good evening! I see say Kano dey inside Lassa hotspot now. Make sure you cover your food well well so rat no go touch am. Also, di rain wey fall fit cause mosquito to plenty – use your net every night. Anybody dey sick for your house?”*)

5. **Voice Synthesis**  
   Script is sent to YarnGPT/Spitch, returning an MP3 URL.

6. **Call Simulation**  
   Dashboard shows an incoming call notification. The user (presenter) clicks “Answer”, the audio plays, and two buttons appear: “I have fever” / “I’m fine”.  
   - If “I have fever” is clicked, the dashboard displays: *“Please visit Kano General Hospital, located at…”*  
   - The response is logged.

7. **Logging & Analytics**  
   All events (trigger, script, response) appear in a log table below the simulation area.

---

## 8. Team Structure & Task Breakdown (3 Developers)

| Role | Responsibilities |
|------|------------------|
| **Backend Dev A (AI + Logic)** | Risk engine, Gemini integration, message generation, logging endpoints. |
| **Backend Dev B (APIs + Telephony)** | Open-Meteo integration, Twilio/simulated calls, scheduler, user registration API. |
| **Frontend Dev** | Next.js dashboard, registration form, risk display, call simulation UI, logs, manual trigger. |

### Detailed Task List

#### 👨‍💻 Backend Dev A – AI & Risk Logic
- [ ] Set up FastAPI project, define data models (user, log).
- [ ] Implement `/register` (POST) and `/risk-check/<user_id>` (GET) endpoints.
- [ ] Create risk engine function: `check_risk(lga, rainfall, hotspots)` → risk level.
- [ ] Integrate Gemini API: design prompt templates, create `generate_script(risk_data)`.
- [ ] Create `/generate-message` endpoint that returns script and audio URL (calls voice API).
- [ ] Implement in-memory logging (list of dicts) for calls and responses.
- [ ] Assist in end-to-end testing.

#### 👨‍💻 Backend Dev B – APIs & Telephony
- [ ] Integrate Open-Meteo: function `get_rainfall(lat, lon)`.
- [ ] Create LGA → coordinates mapping (static JSON).
- [ ] Implement `/call-user` endpoint: if risk high, call `generate-message`, then trigger call.
- [ ] Set up Twilio trial account (or simulate calls via frontend audio).
- [ ] If Twilio works: implement webhook to handle user keypress responses (DTMF). If not, simulate responses via frontend buttons.
- [ ] Add a simple scheduler (Python `schedule` or manual trigger).
- [ ] Implement retry logic and error handling.

#### 🎨 Frontend Dev – Next.js Dashboard
- [ ] Initialize Next.js app with Tailwind CSS.
- [ ] Create pages: `/register` (form), `/dashboard` (main view).
- [ ] Build registration form (name, phone, LGA) – POST to `/register`.
- [ ] Dashboard: display list of registered users, current risk for each (poll `/risk-check`).
- [ ] Add “Trigger Health Call” button that calls `/call-user` for a selected user.
- [ ] Implement call simulation card:
  - Show “Incoming call…” when triggered.
  - Audio player for the generated MP3.
  - Response buttons (“I have fever”, “I’m fine”) – POST to `/respond`.
  - On fever response, show static health center address.
- [ ] Build log table showing call history (timestamp, LGA, trigger type, script snippet, user response).
- [ ] Add loading states and error toasts.
- [ ] Polish UI: highlight HIGH risk in red, use friendly colors, ensure mobile responsiveness.

---

## 9. 15-Hour Execution Plan

| Time Slot | Backend A | Backend B | Frontend |
|-----------|-----------|-----------|----------|
| **Hour 0-1** | Team sync, GitHub setup, define API contracts, folder structure. | | |
| **Hour 1-3** | Flask app, `/register`, in-memory store, risk engine skeleton. | Open-Meteo integration, LGA→coords mapping, `/risk-check` endpoint. | Next.js setup, `/register` page, basic layout. |
| **Hour 3-6** | Gemini integration, prompt design, `/generate-message` (text only). | Implement `/call-user` logic, integrate Twilio (or prepare simulation). | Dashboard layout, fetch and display users, risk panel. |
| **Hour 6-8** | Connect voice API (YarnGPT), return audio URL. Tune prompts for clarity. | Add scheduler/manual trigger, error handling. | Trigger button, audio player, response buttons. |
| **Hour 8-11** | Logging endpoints (`/log-response`), health center logic. | Test full flow, ensure audio generation works. | Log table, integrate response logging, polish UI. |
| **Hour 11-13** | End-to-end testing, bug fixes. | | End-to-end testing, demo mode (fake data toggle). |
| **Hour 13-15** | Final system test, prepare slide deck, record demo video, document AI use. | | |

---

## 10. Alignment with Judging Criteria

| Criteria | How Sabi Health Excels |
|----------|------------------------|
| **Technology (7 pts)** | Integrates multiple APIs (weather, AI, voice) with a clean backend and interactive frontend. Demonstrates practical use of cutting-edge AI (Gemini) and voice synthesis. |
| **Design (3 pts)** | Voice-first interaction feels natural and accessible. Dashboard is clean, intuitive, and highlights risk status at a glance. The call simulation is engaging and easy to demo. |
| **Business (6 pts)** | Addresses a real, pressing public health need in Nigeria. Scalable to other regions/diseases. Potential for partnership with governments, NGOs, and health ministries. Proactive model reduces hospital burden and saves lives. |
| **Presentation (4 pts)** | A live call demo will captivate judges. The story is simple and powerful: “AI that calls you to prevent sickness.” Clear documentation and responsible AI disclosure. |

---

## 11. Responsible AI Use Disclosure

We will explicitly state in our presentation and GitHub README:

- **Gemini 1.5 Flash** is used to generate culturally appropriate health messages. Prompts are designed to avoid harmful or misleading advice.
- **YarnGPT/Spitch API** is used for voice synthesis to ensure authentic Nigerian accents.
- All data used (weather, hotspot) is from public APIs or mock datasets. No personal data is stored beyond the hackathon demo; user information is kept in memory only.
- The system is a prototype for demonstration and should not be used for actual medical decisions without proper validation.

---

## 12. Conclusion

**Sabi Health** transforms public health communication from reactive bulletins to proactive, personalized conversations. By leveraging real-time data, generative AI, and culturally resonant voice, we can reach vulnerable populations where they are—on their phones—and empower them to take preventive action. This MVP is feasible within 24 hours, aligns perfectly with the hackathon theme, and has the potential to make a real impact.

**Let’s build Sabi Health and make prevention a call away!**