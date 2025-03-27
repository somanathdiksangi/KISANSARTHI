from agents.provider import Agent
import aiohttp, json
import asyncio
import pickle, re
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
    """
    Extracts plain text data from a list of URLs using asynchronous requests.

    Args:
        urls (list): List of website URLs.

    Returns:
        dict: Dictionary with URLs as keys and extracted text or errors as values.
    """
    return asyncio.run(scrape_websites_parallel(urls))

demo_soil_data = {
    "temprature": 20,
    "Rainfall" : "300",
    "pH" : "5.5pH",
    "Nitrogen" : "40",
    "Phosphorus" : "20",
    "Pottasium" : "20",
    "Soil Color" : "red"
}


class Fertilizer_Recommender:
    def __init__(self, GEN_API_KEY):
        self.agent = Agent(GEN_API_KEY)

    def load_model_and_predict(self):
        with open('./model/fertilizer.pkl', 'rb') as model_file:
            model = pickle.load(model_file)
            #N
            #P
            #K
            #temp
            #humidity
            #ph
            #rainfall
            input_data = [[1, 80, 50, 100, 6.5, 1000, 20, 1]]  # Example input
            prediction = model.predict(input_data)

    def execute(self, location, WEATHER_API_KEY, soil_data=demo_soil_data, crop='Tur'):
        if "temperature" not in soil_data:
            d = get_weather_data(location, WEATHER_API_KEY)
            soil_data["temperature"] = d["temperature"]
            soil_data["Rainfall"] = d["rainfall"]
            soil_data['humidity'] = d['humidity']

        with open('./agents/model/fertilizer.pkl', "rb") as file:
            model = pickle.load(file)
            #soil color
            #NPK
            #ph
            #rainfall
            #temp
            #crop
            input_data = [["Red" , int(soil_data['Nitrogen']), int(soil_data['Phosphorus']), int(soil_data['Pottasium']), float(soil_data['pH']), float(soil_data["Rainfall"]), float(soil_data['temperature']), crop]]
            prediction = model.predict(input_data)[0]

        task = f"""
Role-Playing: You are an expert agricultural specialist with extensive knowledge of farming and fertilizers. You understand precisely which crop types and soils require specific fertilizers and in what amounts. You excel at providing detailed and relevant explanations to farmers, clearly communicating the benefits of your recommendations in an accessible manner.

Instructions: You will be provided with raw fertilizer data collected from various websites, along with soil data and crop information. Your task is to carefully analyze the soil data, fertilizer requirements, and crop type. Respond *only* in the following structured format:

```
Crop: <name of the crop>
Fertilizer: <name of fertilizer recommended>
Fertilizer Product: <name of the product - the fertilizer which is available for sale>
Buy at: <site to buy at>
Amount: <amount of fertilizer to spread and frequency>
Price: <price of the fertilizer>
Description: <a brief description of the fertilizer>
Explanation: <explain in layman's terms to the farmer why this fertilizer is essential and recommended, in an easy, non-technical manner>
```

Consider the following data:

Crop: {crop}
Soil Data: {soil_data}
Type of Fertilizer Recommended: {prediction}

Provide your response in the structured format outlined above. Do not include any introductory or concluding remarks.
"""
        response = self.agent.execute(task=task)
        print(json.dumps(response, indent=4))

        # for url, data in result.items():
        #     print(f"\nURL: {url}\n{'-'*60}\n{data[:500]}...")  # Print first 500 chars



def parse_crop_response(response_text):
    """
    Parses the crop recommendation response and converts it into a dictionary.

    Args:
        response_text (str): The input text in the specified response format.

    Returns:
        dict: A dictionary containing parsed information.
    """
    # Define the regex pattern using non-greedy matching and clear field boundaries
    pattern = re.compile(
        r"Crop:\s*(.*?)\s*"
        r"Fertilizer:\s*(.*?)\s*"
        r"Fertilizer Product:\s*(.*?)\s*"
        r"Explanation:\s*(.*?)\s*"
        r"Buy at:\s*(.*?)\s*"
        r"Amount:\s*(.*?)\s*"
        r"Price:\s*(.*?)\s*"
        r"Description:\s*(.*)",
        re.DOTALL
    )

    # Perform regex search
    match = pattern.search(response_text)
    if not match:
        return {"Error": "Invalid or improperly formatted response"}

    # Extract data and map to dictionary
    fields = [
        "Crop",
        "Match",
        "Description",
        "Explanation",
        "Growing Season",
        "Water Requirement",
        "Expected Yield",
        "Recommendations"
    ]
    data = {field: match.group(i+1).strip() for i, field in enumerate(fields)}

    return data