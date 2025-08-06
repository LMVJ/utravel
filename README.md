# uTravel: An LLM-Based Personalized Travel Planner

uTravel is a smart travel planning assistant powered by large language models (LLMs), designed to simplify and personalize the travel experience. It generates dynamic itineraries based on user preferences and real-time data.

Built on top of the **LangGraph framework**, uTravel leverages the **Google Gemini Pro** model for natural language understanding and decision making. It also integrates data from **Google Maps** and **OpenWeatherMap** to enrich travel plans with real-time weather and location information.

The system features:
- A **Django REST Framework** + **SQLite** backend for session-based conversation and storage
- A **React** frontend for responsive, cross-device user interaction
- Mobile compatibility via **WebView** on Android

---

## 🌟 Features

- Chat-based travel planning powered by LLM
- Personalized itineraries based on user input
- Real-time weather and location data integration
- Interactive maps with Google Maps API
- Exportable PDF itinerary plans
- Cross-platform support (Web and Android)

---

## 🧰 Tech Stack

| Technology        | Usage                          |
|------------------|---------------------------------|
| JavaScript (69.7%) | Frontend development (React)   |
| Java (17.4%)       | Android WebView integration     |
| CSS (11.6%)        | Styling                         |
| HTML (1.3%)        | Markup                         |
| Django REST Framework | Backend API and session handling |
| SQLite             | Lightweight database            |
| LangGraph          | Agent orchestration framework   |
| Google Gemini Pro  | LLM for natural language understanding |
| Google Maps API    | Map integration                 |
| OpenWeatherMap API | Weather augmentation            |

---

## 💡 Usage Example
Type a destination you'd like to visit

The AI will ask follow-up questions (e.g. travel dates, interests, transportation methods, travel pace)

It will generate a detailed and personalized itinerary

The itinerary includes:

Day-by-day plans

Google Maps integration

Downloadable PDF

## 👥 Team Roster
This project was developed by a collaborative team of five members, each taking responsibility for different components of the system:

Hongrui Zhu is the designer and developer of the core travel planning agent and backend service. On the backend side, he implemented the logic that orchestrates the interaction between the user, the LLM-based itinerary planner, and external APIs. He also led the design and integration of the LangChain-based agent system, enabling dynamic follow-up questions and personalized trip generation based on user preferences. His work ensured that the AI assistant could reason effectively and generate coherent travel plans across multiple user sessions.

Xiaotian Lin also worked on the backend, with a focus on database design and server-side infrastructure. He was responsible for defining and managing the SQLite schema used to store user sessions, chat messages, and travel plans. He implemented the Django REST Framework (DRF) API endpoints that enabled multi-turn interactions and persisted itinerary data. Additionally, he configured and deployed the cloud server, ensuring stable hosting and secure access to the uTravel platform. His work laid the foundation for scalable data management and reliable backend performance.

Sirui Liu focused on the frontend, specifically building the user interface for AI-driven travel conversations. He designed and implemented the chat interaction flow between the user and the LLM agent, enabling users to naturally input their travel preferences, respond to follow-up questions, and receive personalized itineraries. His work prioritized usability and responsiveness across devices.

Sikuang Zhou was also responsible for frontend development. He implemented the integration of the Google Maps API to visualize destinations and daily routes directly within the itinerary. Additionally, he developed the PDF export functionality, allowing users to download their finalized travel plans. He also handled the export of location data into JSON format for downstream use.

Youchen Qing handled the cross-platform adaptation of the web application. He led the effort to convert the React-based web interface into a mobile-friendly Android app using WebView. This allowed the team to extend the reach of uTravel beyond desktop platforms, ensuring a consistent and user-friendly experience on Android devices.

Together, this team successfully brought uTravel to life, combining backend stability, intelligent agent integration, and a polished, accessible frontend experience.

## Challenges and Efforts

One of the main challenges we encountered during the development process was our limited prior experience with frontend technologies. At the beginning of the project, none of us had a strong foundation in frontend frameworks or UI design principles, which made it difficult to implement a user-friendly interface and ensure cross-platform compatibility. We had to dedicate a significant amount of time learning React, HTML/CSS, and various libraries such as Google Maps APIs and PDF generation tools.

Another major obstacle was the integration between the web-based application and the Android mobile app. Ensuring that components designed for web usage could function correctly in a mobile environment required additional effort in debugging, adapting layouts, and managing performance limitations. This process was particularly time-consuming due to platform-specific issues and lack of direct support for some features on mobile devices.

To overcome these difficulties, we worked closely as a team, regularly communicating and sharing new knowledge with each other. We actively consulted official documentation, online tutorials, and forums to troubleshoot problems and improve our understanding. Although the learning curve was steep, we are proud of the progress we made and the final product we delivered.
