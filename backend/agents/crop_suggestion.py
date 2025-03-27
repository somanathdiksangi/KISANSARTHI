from agents.provider import Agent
import pickle
from agents.weather_agent import get_weather_data

demo_soil_data = {
    "temperature": 20,
    "Rainfall" : "300",
    "pH" : "5.5pH",
    "Nitrogen" : "40",
    "Phosphorus" : "20",
    "Pottasium" : "20",
    "Soil Color" : "red"
}


class Crop_Suggestion:
    def __init__(self, GEN_API_KEY):
        self.agent = Agent(GEN_API_KEY)

    def execute(self, location, WEATHER_API_KEY, soil_data=demo_soil_data, crop='Tur'):
        if "temperature" not in soil_data:
            d = get_weather_data(location, WEATHER_API_KEY)
            soil_data["temperature"] = d["temperature"]
            soil_data["Rainfall"] = d["rainfall"]
            soil_data['humidity'] = d['humidity']

        with open('./agents/model/crop_recommendation.pkl', "rb") as file:
            model = pickle.load(file)

            input_data = [[int(soil_data['Nitrogen']), int(soil_data['Phosphorus']), int(soil_data['Pottasium']), float(soil_data['temperature']), float(soil_data['humidity']), float(soil_data['pH']), float(soil_data["Rainfall"])]]
            prediction = model.predict(input_data)[0]

        print(soil_data)
        task = f"""
Role-Playing: You are an expert agricultural specialist with extensive knowledge of farming and crops. You understand precisely which crop types and soils grows in specific duration and in what season. You excel at providing detailed and relevant explanations to farmers, clearly communicating the benefits of your recommendations in an accessible manner.

Instructions: You will be provided with raw soil data and crop information. Your task is to carefully analyze the soil data, and the given crop type and provide briefs, explanation and reasons why it is suggested. Respond *only* in the following structured format:

```
Crop: <name of the crop>
Match: <Matching Score with soil type (this should vary between 0 to 1)>
Description: <a brief description>
Explanation: <explain in layman's terms to the farmer why this crop is recommended, in an easy, non-technical manner>
Growing Season: <season of growing (this should be multiline contaning heading and sub-heading)>
Water Requirement: <ideal require of water (this should be multiline contaning heading and sub-heading)>
Expected Yield: <expected yeild (this should be multiline contaning heading and sub-heading)>
Recommendations: <List of Additional Recommendations or tips while cultivating or planting, seperated by '\\n'>
```

Consider the following data:

Crop: {prediction}
Soil Data: {soil_data}

Provide your response in the structured format outlined above. Do not include any introductory or concluding remarks.
"""
        response = self.agent.execute(task=task)
        return parse_crop_response(response)


import re

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
        r"Match:\s*(.*?)\s*"
        r"Description:\s*(.*?)\s*"
        r"Explanation:\s*(.*?)\s*"
        r"Growing Season:\s*(.*?)\s*"
        r"Water Requirement:\s*(.*?)\s*"
        r"Expected Yield:\s*(.*?)\s*"
        r"Recommendations:\s*(.*)",
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
        "growing_season",
        "water_requirement",
        "expected_yield",
        "Recommendations"
    ]
    data = {field: match.group(i+1).strip() for i, field in enumerate(fields)}

    return data