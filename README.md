

# 🧑‍🌾 KisanSarthi: AI-Driven Precision Agriculture Assistant

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Problem Statement](#-the-precision-agriculture-access-gap-problem)
- [Key Features](#-key-features--multimodal-integration)
- [Technical Architecture](#-technical-architecture)
- [Setup Instructions](#-end-to-end-setup-instructions)

## 🌱 Project Overview

KisanSarthi is a **Multimodal AI-powered mobile application** designed to democratize precision agriculture for smallholder farmers, particularly in the Indian context. It provides personalized, real-time advisory on crop selection, fertilizer application, and plant disease diagnosis to maximize yield and profitability.

### 🎬 Demo Video
Watch the demo video to see KisanSarthi in action:  
[https://drive.google.com/drive/folders/1aVO5KDEp7lY4WLPOi3iveJNiDtvdMNzV](https://drive.google.com/drive/folders/1aVO5KDEp7lY4WLPOi3iveJNiDtvdMNzV)

## 🎯 The Precision Agriculture Access Gap (Problem)

Smallholder farmers often struggle with high operational costs and suboptimal yields because they lack access to personalized, data-driven advice. They typically rely on generalized methods, leading to:

- **Inefficient Resource Management:** Mismanagement of soil nutrients (N, P, K, pH) results in wasted fertilizer and soil degradation.
- **Suboptimal Crop Selection:** Planting crops that aren't the best match for their specific soil and local climate.
- **Delayed Threat Response:** Slow disease identification and lack of real-time market data increase the risk of crop loss.

KisanSarthi solves this by integrating **Sensors, AI (Text/Data), and Computer Vision (Images)** to provide comprehensive, actionable guidance directly on a mobile phone.

## ✨ Key Features & Multimodal Integration

KisanSarthi is a highly practical demonstration of **Multimodal AI**, combining diverse data streams to create contextually aware recommendations.

| Feature | Modality Integrated | Functionality Demonstrated |
| :--- | :--- | :--- |
| **1. AI Crop Suggestion** | **Sensors/Data (N, P, K, pH)** | Recommends the most suitable crop (e.g., *Apple* with a *65% Match*) based on current soil data, ensuring the optimal selection for the farm. |
| **2. Precision Fertilizer** | **Sensors/Data (N, P, K levels)** | Based on low nutrient readings, it recommends the exact fertilizer type and amount (e.g., *Apply Urea 46-0-0* at *100 kg per hectare*). |
| **3. Soil Monitoring** | **Sensors/Data (Moisture, Temp)** | Displays real-time and historical soil nutrient data, moisture (e.g., *87%*), pH (e.g., *6.7*), and temperature readings. |
| **4. Plant Disease Scan** | **Images / Computer Vision** | (Future Scope / Architecture Readiness) Allows a farmer to upload a photo of a leaf to get an instant diagnosis and remedy. |
| **5. Market Value Check** | **External Data (Text)** | Fetches real-time market prices for crops, enabling farmers to make informed selling decisions. |

## 🏗️ Technical Architecture

The application follows a standard mobile-backend architecture for scalability and clear separation of concerns.

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Mobile App    │◄────────┤   Backend API   │◄────────┤   AI/ML Models  │
│   (Flutter)     │         │   (Python)      │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │                           │                           │
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   User Interface│         │  Data Processing │         │  Crop/Fertilizer│
│                 │         │                 │         │  Classification │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                          ┌─────────────────┐
                                                          │  Disease        │
                                                          │  Diagnosis CNN  │
                                                          └─────────────────┘
```

- **Frontend:** Built using **Flutter** (Dart) for a beautiful, cross-platform mobile user interface (Android/iOS).
- **Backend:** A REST API built with **Python** to host the core AI/ML models.
- **AI/ML Models:**
  - **Crop/Fertilizer:** Classification/Regression models trained on agro-climatic data (N, P, K, pH, etc.).
  - **Disease Diagnosis:** Convolutional Neural Network (CNN) for image recognition.

## 🛠️ End-to-End Setup Instructions

Follow these steps to set up and run the KisanSarthi application locally.

### 1. Prerequisites

You must have the following installed on your system:

- **Flutter SDK** (for the mobile frontend)
- **Python 3.8+** (for the backend server)
- **Git** (for cloning the repository)

### 2. Clone the Repository

```bash
git clone https://github.com/somanathdiksangi/KISANSARTHI.git
cd KISANSARTHI
```

### 3. Backend Setup

The backend hosts the AI models and handles data processing.

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create a virtual environment and install dependencies:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**

   Create a file named **`.env`** inside the `backend` directory with the following content. **You must replace the placeholders with your actual keys.**

   ```bash
   # ===============================================
   # Environment Variables for KisanSarthi Backend
   # ===============================================

   # 1. Google Gemini API Key
   # Used for potential future AI Assistant features.
   GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_HERE"

   # 2. Weather/Agri-Specific API Key
   # Used for fetching real-time weather and climate data.
   WEATHER_API_KEY="YOUR_WEATHER_API_KEY_HERE"

   # 3. Server Configuration (Adjust if necessary)
   HOST=0.0.0.0
   PORT=8080 
   ```

4. **Run the Backend Server:**

   ```bash
   python main.py  # Or the appropriate entry file for your Python framework
   ```

   The server should now be running, typically at `http://127.0.0.1:8080`.

### 4. Frontend (Mobile App) Setup

The frontend connects to the running backend.

1. **Navigate to the frontend directory:**

   ```bash
   cd ../frontend/kisansarthi
   ```

2. **Fetch Flutter packages:**

   ```bash
   flutter pub get
   ```

3. **Update API Endpoint:**

   - You may need to modify the base API URL in your application's configuration files (e.g., a constants file or a service file) to point to your running backend (e.g., `http://10.0.2.2:8080` for Android emulator or your local IP for a physical device).

4. **Run the App:**

   ```bash
   flutter run
   ```

The mobile app will now launch on your connected device or emulator, ready to communicate with the local AI backend.

---

**Note:** This project was developed during a Hackathon focused on Multimodal AI for the Indian Context. The application demonstrates the practical application of AI technologies to address real-world agricultural challenges faced by Indian farmers.
