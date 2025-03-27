import os, re
import pickle
import pandas as pd
from agents.provider import Agent
import aiohttp
import json
import asyncio
from bs4 import BeautifulSoup
from agents.weather_agent import get_weather_data


async def fetch_content(session, url):
    try:
        async with session.get(url) as response:
            response.raise_for_status()
            html_content = await response.text()
            soup = BeautifulSoup(html_content, 'html.parser')
            text_data = soup.get_text(separator='\n', strip=True)
            return {url: text_data}
    except Exception as e:
        return {url: f"Error: {str(e)}"}


async def scrape_websites_parallel(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_content(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results


def extract_text_from_websites(urls):
    return asyncio.run(scrape_websites_parallel(urls))


class FertilizerRecommender:
    def __init__(self, GEN_API_KEY):
        self.agent = Agent(GEN_API_KEY)
        self.model_path = './agents/model/fertilizer.pkl'
        self.crop_mapping = {
            'Sugarcane': 1, 'Jowar': 2, 'Cotton': 3, 'Rice': 4, 'Wheat': 5,
            'Groundnut': 6, 'Maize': 7, 'Tur': 8, 'Urad': 9, 'Moong': 10,
            'Gram': 11, 'Masoor': 12, 'Soybean': 13, 'Ginger': 14,
            'Turmeric': 15, 'Grapes': 16
        }
        self.soil_color_mapping = {
            'Black': 1, 'Red': 2, 'Medium Brown': 3,
            'Dark Brown': 4, 'Light Brown': 5, 'Reddish Brown': 6
        }

    def load_model_and_predict(self, soil_data, crop):
        if not os.path.exists(self.model_path):
            print(f"❌ Error: Model file not found at {self.model_path}")
            return None

        with open(self.model_path, 'rb') as model_file:
            model = pickle.load(model_file)

        # Crop Mapping
        crop_encoded = self.crop_mapping.get(crop, 0)
        soil_color_encoded = self.soil_color_mapping.get(soil_data.get('Soil Color', 'Unknown'), 0)

        if crop_encoded == 0:
            print(f"⚠ Warning: Crop '{crop}' not recognized. Using default value 0.")
        if soil_color_encoded == 0:
            print(f"⚠ Warning: Soil color '{soil_data.get('Soil Color', 'Unknown')}' not recognized. Using default value 0.")

        # Input Data
        input_data = pd.DataFrame([{
            'Soil_color': soil_color_encoded,
            'Nitrogen': int(soil_data['Nitrogen']),
            'Phosphorus': int(soil_data['Phosphorus']),
            'Potassium': int(soil_data['Pottasium']),
            'pH': float(soil_data['pH']),
            'Rainfall': float(soil_data['rainfall']),
            'Temperature': float(soil_data['temperature']),
            'Crop': crop_encoded,
            # 'Humidity': float(soil_data.get('humidity', 60)),
        }])

        # Prediction
        prediction = model.predict(input_data)[0]
        return prediction

    def execute(self, location, WEATHER_API_KEY, soil_data, crop):
        # Update missing weather data
        if "temperature" not in soil_data:
            weather_data = get_weather_data(location, WEATHER_API_KEY)
            soil_data.update(weather_data)

        # Predict fertilizer
        prediction = self.load_model_and_predict(soil_data, crop)

        if prediction is None:
            print('Prediction is none')
            return

        task = f"""
Role-Playing: You are an expert agricultural specialist with extensive knowledge of farming and fertilizers.

Instructions: Provide recommendations in the following format:
```
Crop: <name of the crop>
Fertilizer: <name of fertilizer recommended>
Product: <name of the product - the fertilizer which is available for sale>
Buy at: <site to buy at>
Amount: <amount of fertilizer to spread and frequency>
Price: <price of the fertilizer>
Description: <a brief description of the fertilizer>
Explanation: <explain in layman's terms to the farmer why this fertilizer is essential and recommended, in an easy, non-technical manner>
```

Consider the following data:
Soil Data: {soil_data}

Only Respond in the provided format, Do not leave any other note.
"""
        response = self.agent.execute(task=task)
        return parse_crop_response(response)
        # print(json.dumps(response, indent=4))


def parse_crop_response(response_text):
    """
    Parses the crop recommendation response and converts it into a dictionary.

    Args:
        response_text (str): The input text in the specified response format.

    Returns:
        dict: A dictionary containing parsed information.
    """
    pattern = re.compile(
        r"Crop:\s*(.*?)\s*"
        r"Fertilizer:\s*(.*?)\s*"
        r"Product:\s*(.*?)\s*"
        r"Buy at:\s*(.*?)\s*"
        r"Amount:\s*(.*?)\s*"
        r"Price:\s*(.*?)\s*"
        r"Description:\s*(.*?)\s*"
        r"Explanation:\s*(.*)",
        re.DOTALL
    )

    match = pattern.search(response_text)
    if not match:
        return {"Error": "Invalid or improperly formatted response"}

    fields = ["Crop", "Fertilizer", "Fertilizer_Product", "Buy at", "Amount", "Price", "Description", "Explanation"]
    data = {field: match.group(i + 1).strip() for i, field in enumerate(fields)}
    print(data)
    return data
