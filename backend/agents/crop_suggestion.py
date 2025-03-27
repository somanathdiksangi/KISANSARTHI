from provider import Agent
import aiohttp, json
import asyncio
from bs4 import BeautifulSoup

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
    def __init__(self):
        self.agent = Agent()

    def execute(self, fertilizer="Urea", soil_data=demo_soil_data, crop='Tur'):
        task = f"""
Role-Playing: You are an expert agricultural specialist with extensive knowledge of farming and crops. You understand precisely which crop types and soils grows in specific duration and in what season. You excel at providing detailed and relevant explanations to farmers, clearly communicating the benefits of your recommendations in an accessible manner.

Instructions: You will be provided with raw soil data and crop information. Your task is to carefully analyze the soil data, and the given crop type and provide briefs, explanation and reasons why it is suggested. Respond *only* in the following structured format:

```
Crop: <name of the crop>
Match: <Matching Score with soil type>
Description: <a brief description>
Explanation: <explain in layman's terms to the farmer why this crop is recommended, in an easy, non-technical manner>
Growing Season: <season of growing>
Water Requirement: <ideal require of water>
Expected Yield: <expected yeild>
Recommendations: <Additional Recommendations or tips while cultivating or planting>
```

Consider the following data:

Crop: {crop}
Soil Data: {soil_data}

Provide your response in the structured format outlined above. Do not include any introductory or concluding remarks.
"""
        response = self.agent.execute(task=task)
        print(json.dumps(response, indent=4))

        # for url, data in result.items():
        #     print(f"\nURL: {url}\n{'-'*60}\n{data[:500]}...")  # Print first 500 chars


Fertilizer_Recommender().execute()