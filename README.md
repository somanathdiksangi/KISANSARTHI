# 🧑‍🌾 KisanSarthi: AI-Driven Precision Agriculture Assistant

KisanSarthi is a **Multimodal AI-powered mobile application** designed to bring precision agriculture to smallholder farmers in India. It provides **personalized, real-time advisory** on crop selection, fertilizer application, soil monitoring, and plant disease diagnosis to maximize yield and profitability.

---

## 🎯 Problem Statement: Precision Agriculture Access Gap

Smallholder farmers often face:

- **Inefficient Resource Management:** Mismanagement of soil nutrients (N, P, K, pH) leads to wasted fertilizer and soil degradation.
- **Suboptimal Crop Selection:** Planting crops not suited to their soil and local climate.
- **Delayed Threat Response:** Slow disease identification and lack of market information increases the risk of crop loss.

**KisanSarthi solves this by integrating Sensors, AI (text/data), and Computer Vision (images)** to provide actionable guidance directly on mobile devices.

---

## ✨ Key Features & Multimodal Integration

KisanSarthi combines diverse data streams to provide context-aware recommendations:

| Feature | Data Modality | Functionality |
| :--- | :--- | :--- |
| **AI Crop Suggestion** | Sensors/Data (N, P, K, pH) | Recommends the most suitable crop (e.g., Apple with 65% match) based on current soil data. |
| **Precision Fertilizer** | Sensors/Data (N, P, K levels) | Suggests exact fertilizer type and quantity (e.g., Apply Urea 46-0-0 at 100 kg/ha) based on nutrient readings. |
| **Soil Monitoring** | Sensors/Data (Moisture, Temp, pH) | Displays real-time and historical soil nutrient, moisture, pH, and temperature data. |
| **Plant Disease Scan** | Images / Computer Vision | Upload leaf images for instant disease diagnosis and remedy (future scope). |
| **Market Value Check** | External Data (Text) | Provides real-time market prices for crops to enable informed selling decisions. |

---

## 🏗️ Technical Architecture

- **Frontend:** Built with **Flutter** (Dart) for cross-platform mobile UI (Android/iOS).  
- **Backend:** REST API built with **Python** (Flask/Django/FastAPI) to host AI/ML models.  
- **AI/ML Models:**
  - **Crop/Fertilizer:** Classification/Regression models trained on agro-climatic data (N, P, K, pH, temperature, moisture).  
  - **Disease Diagnosis:** Convolutional Neural Network (CNN) for leaf image recognition.  

---

## 🛠️ End-to-End Setup Instructions

### 1. Prerequisites

- **Flutter SDK** (for mobile frontend)  
- **Python 3.8+** (for backend server)  
- **Git** (for cloning the repository)  

---

### 2. Clone the Repository

```bash
git clone https://github.com/somanathdiksangi/KISANSARTHI.git
cd KISANSARTHI
