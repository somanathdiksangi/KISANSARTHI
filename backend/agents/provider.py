from google import genai
import os

GEN_API_KEY = os.environ.get('GEN_API_KEY')
class Agent:
    def __init__(self):
        self.client = genai.Client(api_key=GEN_API_KEY)

    def execute(self, task):
        response = self.client.models.generate_content(
            model="gemini-2.0-flash", contents=task
        )
        print(response.text)
        return response.text