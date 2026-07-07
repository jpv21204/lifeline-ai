# 🏥 LifeLine AI – Multi-Agent Community Healthcare Assistant

> **An AI-powered Community Healthcare Assistant that helps people make the right healthcare decisions before, during, and after visiting a hospital.**

![LifeLine AI](https://img.shields.io/badge/LifeLine-AI-00d4aa?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzAwZDRhYSIvPjxwYXRoIGQ9Ik01MCAyMCBMNTAgODAgTTIwIDUwIEw4MCA1MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=)
![Agents](https://img.shields.io/badge/AI%20Agents-8-7c3aed?style=for-the-badge)
![Languages](https://img.shields.io/badge/Languages-12-3b82f6?style=for-the-badge)

## 🌟 What is LifeLine AI?

LifeLine AI is a **multi-agent AI system** that coordinates 8 specialized healthcare agents to provide comprehensive health guidance to communities, especially in rural and semi-rural areas of India.

Unlike a single chatbot, LifeLine AI demonstrates **true agentic AI** — multiple specialized agents collaborate, each with a clear responsibility, coordinated by an orchestrator agent.

## 🤖 The 8 AI Agents

| Agent | Role | What it Does |
|-------|------|-------------|
| 🩺 **Health Assessment** | Symptom Analysis | Evaluates symptoms, calculates urgency, recommends care level |
| 📞 **Emergency Detection** | Life-Saving Alerts | Detects emergencies, provides immediate action steps |
| 🏥 **Hospital Finder** | Facility Locator | Finds nearby hospitals matching needs and specialties |
| 📋 **Government Schemes** | Benefits Navigator | Matches users with eligible government health programs |
| 💊 **Medicine Information** | Drug Education | Provides medicine information (usage, side effects, precautions) |
| 📅 **Follow-up Care** | Health Continuity | Creates reminders and monitoring plans |
| 🌐 **Translation** | Language Bridge | Translates health advice into 12 Indian languages |
| 📊 **Analytics** | Community Insights | Tracks anonymized health trends for public health |

## 🏗️ Architecture

```
User → Orchestrator → [Health Agent + Emergency Agent] (parallel)
                    → [Hospital Agent + Scheme Agent + Medicine Agent] (based on results)
                    → [Follow-up Agent] (creates care plan)
                    → [Translation Agent] (translates if needed)
                    → [Analytics Agent] (logs anonymized data)
                    → Personalized Action Plan
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📍 Demo Region

Focused on **rural and semi-rural areas** in:
- **Telangana**: Warangal, Karimnagar, Nizamabad, Khammam, Nalgonda, Mahbubnagar
- **Andhra Pradesh**: Anantapur, Kurnool, Guntur, Ongole, Nellore, Kadapa, Tirupati

## 🌍 Supported Languages

Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Urdu, English

## 💡 Demo Scenarios

### Scenario 1: Rural Health Emergency
> "My mother has had high fever and cough for 4 days. She is 65 years old and has diabetes."

### Scenario 2: Pregnancy Care
> "I am 7 months pregnant. What government schemes am I eligible for?"

### Scenario 3: Emergency
> "My father is having chest pain and difficulty breathing!"

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Custom CSS with glassmorphism design
- **AI Architecture**: Multi-agent orchestration system
- **Data**: Curated databases for hospitals, schemes, symptoms, and medicines

## 📊 Hackathon Evaluation Alignment

| Criteria | Weight | How LifeLine AI Addresses It |
|----------|--------|------------------------------|
| Social Impact | 25% | Healthcare access for underserved communities |
| Innovation | 20% | 8 specialized AI agents with real-time collaboration |
| Agentic AI | 20% | Orchestrator coordinates specialized agents |
| Technical Implementation | 15% | Modern React + multi-agent architecture |
| Scalability | 10% | Region-agnostic design, extensible agent system |
| Presentation | 10% | Real-time agent visualization, beautiful UI |

## 👥 Team

Built with ❤️ for community healthcare.

---

*LifeLine AI does not replace professional medical advice. Always consult a healthcare professional for medical decisions.*
