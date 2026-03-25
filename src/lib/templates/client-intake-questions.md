# Client Intake Form — Viddix AI Onboarding

## Section 1: Your Business
1. What does your business do? (describe in 2-3 sentences)
2. What industry are you in?
3. How many people work in your business (including yourself)?
4. How long have you been in business?

## Section 2: Your Customers
5. Who is your ideal customer? (describe them)
6. How do most of your customers find you right now? (word of mouth / Google / social media / ads / other)
7. What is your average sale value? (€/$ amount)
8. How many new customers do you get per month?

## Section 3: Your Biggest Problems (Most Important)
9. What is the #1 thing stopping you from growing right now?
10. What happens to leads that don't buy immediately? (follow up / nothing / something else)
11. Do you run paid ads? (Facebook/Instagram / Google / both / none)
12. How are you currently managing your leads and customers? (spreadsheet / CRM / nothing / other)

## Section 4: Goals
13. What does success look like for you in 90 days?
14. What tools do you currently use? (list them)
15. Is there anything specific you've tried before that didn't work?

---
## Agent Analysis Rules

Based on answers, the Client Analyzer agent decides:

### Load Skicenter snapshot features IF:
- Tourism / travel / experiences / seasonal business
- Sells packages/bundles (multiple components per sale)
- Has multiple product lines or locations
- Needs quote/proposal flow
- Booking + payment required

### Load Carson Reed snapshot features IF:
- Runs or wants to run Meta/Facebook ads
- Needs lead capture + instant follow-up automation
- Wants AI caller / speed-to-lead
- Service business (home services, consulting, coaching)
- Needs appointment booking funnel

### Load BOTH if:
- Running ads AND selling packages
- Needs full funnel (ads → lead → nurture → booking → sale)

### Priority bottlenecks to flag:
- "Nothing happens to leads" → load full nurture sequence
- "Word of mouth only" → load ads + lead capture
- "Spreadsheet/nothing" → load full CRM pipeline
- "Less than 10 clients/month" → load lead gen focused features
- "No follow up" → load speed-to-lead + 30-day nurture
