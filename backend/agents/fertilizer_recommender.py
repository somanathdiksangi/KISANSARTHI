from provider import Agent
import aiohttp, json
import asyncio
from bs4 import BeautifulSoup

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
    def __init__(self):
        self.agent = Agent()

    def execute(self, fertilizer="Urea", soil_data=None, crop='Tur'):
        urls = ['https://farmkart.com/search?q=fertilizer&options%5Bprefix%5D=last', f"https://krishisevakendra.in/search?q={fertilizer+'+' if fertilizer else 'urea+'}fertilizer&options%5Bprefix%5D=last"]
        result = extract_text_from_websites(urls)
        # print(result)
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
Type of Fertilizer Recommended: {fertilizer}

Provide your response in the structured format outlined above. Do not include any introductory or concluding remarks.
"""
        response = self.agent.execute(task=task)
        print(json.dumps(response, indent=4))

        # for url, data in result.items():
        #     print(f"\nURL: {url}\n{'-'*60}\n{data[:500]}...")  # Print first 500 chars


Fertilizer_Recommender().execute()