# IntentGuard — AI Risk Manager for Agentic Payments

![IntentGuard](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-GPLv3-blue)

IntentGuard is an AI-powered Risk Management layer designed specifically for the era of Agentic Commerce. Built for the **Razorpay Buildathon (Track 02: AI Risk Manager)**, it detects "Intent Drift" when an AI shopping agent is making a payment on behalf of a human user.

## The Problem: Intent Hijacking
As AI agents gain the ability to spend money on our behalf, traditional fraud detection (which looks for stolen cards or unusual locations) becomes insufficient. A transaction can be technically legitimate but completely wrong if the AI agent was confused, manipulated, or hallucinated.

## The Solution: IntentGuard
IntentGuard sits between the AI Agent and the Payment Gateway. Instead of asking *"Is this user fraudulent?"*, it asks *"Is this transaction faithful to the user's original authorization?"*

### Key Features
1. **Live Intent Extraction**: Uses the Google Gemini API (Structured JSON Mode) to instantly convert natural language instructions into strict `Intent Contracts`.
2. **Drift Detection Engine**: Deterministically compares the agent's attempted transaction against the Intent Contract (checking budget limits, spec requirements, and seller trust).
3. **Automated Risk Triage**: Intelligently categorizes risk into LOW (Approve), MEDIUM (Verify Intent), or HIGH (Hold Payment).
4. **AI Explainability**: Uses Gemini to generate real-time, human-readable explanations of exactly why a transaction was flagged, providing an evidence trail for human operators.

## Tech Stack
- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Glassmorphism, Dark Mode, Micro-animations)
- **AI / LLM**: Google Gemini 3.5 Flash API (REST)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/balaa1407/razorpay-intentguard.git
   cd razorpay-intentguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API Key**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Run the Simulations!**
   Open `http://localhost:5173`. You can type custom intents into the dashboard and run the built-in simulator to watch IntentGuard detect drift in real-time.

## License
This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
