from google import genai
import os

class Agent:
    def __init__(self, GEN_API_KEY):
        self.client = genai.Client(api_key=GEN_API_KEY)

    def execute(self, task, data=None):
        if not data:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash", contents=task
            )
            # print(response.text)
            return response.text
        else:
            pass