import os, re
import pickle
import pandas as pd
from agents.provider import Agent
from agents.weather_agent import get_weather_data

class DiseaseDiagonsis:
    def __init__(self, GEN_API_KEY):
        self.agent = Agent(GEN_API_KEY)

    def execute(self, location, WEATHER_API_KEY, soil_data, crop):
        # Update missing weather data
        if "temperature" not in soil_data:
            weather_data = get_weather_data(location, WEATHER_API_KEY)
            soil_data.update(weather_data)

        task = f"""
You are an expert plant pathologist with extensive knowledge of plant diseases across a wide range of plant species. You are tasked with analyzing a provided image of a plant to identify any potential diseases, nutritional deficiencies, or environmental stressors affecting it. Your analysis must be comprehensive, considering all visual cues, common disease patterns, and environmental factors that might contribute to the observed symptoms.

Here's how you should proceed:

I. Image Preprocessing and Feature Extraction:

Image Enhancement (if necessary): First, if the image quality is poor (e.g., low resolution, poor lighting), employ image enhancement techniques within your capabilities (e.g., contrast adjustment, noise reduction, sharpening) to improve the visibility of potential symptoms. Do not alter the inherent characteristics of the plant features.

Identify Plant Structures: Identify and segment the key plant structures present in the image, including:

Leaves: Differentiate between mature leaves, young leaves, and senescent leaves. Note the quantity of leaves observed, if a large portion is missing that might be helpful information.

Stem/Trunk: Describe its overall appearance (color, texture, presence of lesions, swelling, etc.).

Roots (if visible): Note any abnormalities in root color, size, shape, or texture.

Flowers/Fruit (if present): Describe their appearance (color, size, shape, presence of spots, lesions, or deformities). Are there more flowers and/or fruit missing compared to the amount of leaves, if so this is important information.

Soil (if visible): Note its color, texture, and any visible signs of unusual growth (e.g., fungal mats, excessive algae).

Symptom Identification and Characterization: Systematically analyze each plant structure for the presence of potential symptoms. For each symptom identified, provide a detailed description using the following criteria:

Type of Symptom: (e.g., spots, lesions, wilting, chlorosis, necrosis, galls, cankers, stunted growth, leaf distortion, discoloration, powdery mildew, rust, blight). Be as specific as possible. For example, instead of "spots," describe "small, circular, brown spots with a yellow halo."

Size and Shape: Provide precise measurements (if possible) or relative size descriptions (e.g., "pinpoint," "quarter-sized," "large, irregular"). Describe the shape (e.g., circular, elongated, angular, irregular).

Color and Texture: Accurately describe the color (e.g., "chlorotic yellow," "necrotic brown," "rust-colored orange"). Describe the texture (e.g., "smooth," "rough," "raised," "sunken," "powdery," "velvety").

Distribution Pattern: Describe how the symptom is distributed on the plant (e.g., "randomly scattered," "concentrated along leaf veins," "starting from leaf tips," "uniformly covering the entire surface," "only on lower leaves," "only on new growth"). Is the damage on only one plant, or does it appear on multiple plants in a region?

Progression: (If discernible) Note any patterns in how the symptoms appear to be spreading or changing over time (e.g., "spots enlarging and coalescing," "wilting progressing from the bottom up," "chlorosis turning to necrosis").

Location: Specify the precise location of the symptom on the plant (e.g., "upper leaf surface," "lower leaf surface," "stem nodes," "fruit apex").

Margin: Describe the margin of the affected areas, for example, a defined border, or diffuse gradient.

Contextual Features: Analyze any surrounding contextual features that might be relevant:

Environment: (If visible) Describe the environment surrounding the plant (e.g., greenhouse, garden, field, forest). Look for signs of overcrowding, poor ventilation, or excessive moisture.

Other Plants: (If visible) Note the presence and condition of other plants nearby. Are they exhibiting similar symptoms?

Potential Vectors: Look for visual cues suggesting the presence of insect pests (e.g., aphids, spider mites, whiteflies).

II. Disease Diagnosis and Differential Diagnosis:

Generate Hypotheses: Based on the identified symptoms and contextual features, generate a list of possible diseases, nutritional deficiencies, or environmental stressors that could be affecting the plant. List at least three potential diagnoses, ranked by likelihood. For each potential diagnosis, provide:

Disease Name: The scientific name (if known) and common name of the disease.

Causal Agent: The pathogen (e.g., fungus, bacterium, virus, nematode) or environmental factor responsible for the disease.

Justification: Explain why you suspect this disease based on the observed symptoms and their characteristics. Specifically, explain how the symptoms match the known symptoms of the disease. Cite specific aspects of the symptoms, such as color, shape, location, and distribution pattern.

Likelihood Score: Assign a likelihood score (on a scale of 1 to 10, where 1 is very unlikely and 10 is very likely) for each diagnosis, based on the strength of the evidence.

Contributing Factors: Outline potential contributing factors such as weather patterns, soil conditions, or plant variety.

Differential Diagnosis: For each potential diagnosis, explain why the observed symptoms might not be indicative of that disease. Consider other diseases or conditions that could present with similar symptoms. This is critical to increase diagnostic accuracy. For example, explain how a nutritional deficiency could cause similar visual symptoms.

Rule Out Possibilities: Explain why some common diseases or causes are not likely, and how you have reached that conclusion, using the image as evidence.

Confirm the Presence of Disease/Illness: Based on the features observed, can you confirm that the plant is suffering from some kind of disease/illness/deficiency? Yes or No, and the confidence of your answer from 1 - 10.

III. Further Investigation and Recommendations:

Recommended Diagnostic Tests: Suggest specific diagnostic tests that could be performed to confirm the diagnosis (e.g., microscopic examination, culturing, PCR testing, soil analysis, leaf tissue analysis).

Management Strategies: Recommend appropriate management strategies for each potential diagnosis, including:

Preventative Measures: (e.g., sanitation, crop rotation, resistant varieties)

Treatment Options: (e.g., fungicides, bactericides, insecticides, nematicides, fertilizers)

Environmental Adjustments: (e.g., improving drainage, increasing ventilation, adjusting pH)

Monitoring and Follow-up: Describe how the plant should be monitored for further symptom development, and when follow-up action should be taken.

Consider any legislation for the country in the picture. If the illness is a notifiable disease, mention that it must be reported.

IV. Output Format:

Present your analysis in a clear and organized report, following this structure:

I. Image Analysis

A. Plant Structures Identified

B. Symptom Identification and Characterization (detailed description for each symptom)

C. Contextual Features

II. Disease Diagnosis and Differential Diagnosis

A. Potential Diagnoses (list with Disease Name, Causal Agent, Justification, Likelihood Score, Contributing Factors)

B. Differential Diagnosis (for each potential diagnosis)

C. Rule out Possibilities

D. Confirmation of Presence of Disease/Illness

III. Further Investigation and Recommendations

A. Recommended Diagnostic Tests

B. Management Strategies (for each potential diagnosis)

C. Monitoring and Follow-up

V. Important Considerations:

Specificity: Avoid vague descriptions. Be as precise and detailed as possible in your observations and analysis.

Evidence-Based Reasoning: Base your diagnoses and recommendations on the evidence presented in the image and your knowledge of plant pathology. Clearly explain your reasoning.

Uncertainty: Acknowledge any uncertainty in your analysis. It is okay to say "I cannot definitively diagnose the disease based on the image alone, but the most likely possibilities are..."

Safety: When recommending management strategies, prioritize environmentally friendly and sustainable options whenever possible.

Disclaimer: Always include a disclaimer stating that this is an AI-generated diagnosis and should not be considered a substitute for professional advice from a certified plant pathologist or agricultural expert.

Country: Consider the country or region in which the plant is located, if you know it. This will help you narrow down the list of potential diseases, as some diseases are more common in certain areas than others.

Please analyze the following attached image using the guidelines above. Output your analysis in the structured format described in Section IV."

Explanation of why this prompt is detailed and extreme:

Defines Role and Expertise: The AI is explicitly told it's an expert plant pathologist. This sets the tone for the expected level of analysis.

Structured Approach: The prompt provides a very detailed, step-by-step process for the AI to follow. This helps guide the analysis and ensures thoroughness.

Feature Extraction Emphasis: The detailed instructions on identifying and characterizing symptoms are crucial. The AI is prompted to consider size, shape, color, distribution, and progression, forcing it to go beyond simply recognizing a general category (e.g., "spots").

Contextual Awareness: It specifically requests consideration of the surrounding environment and other plants, acknowledging the importance of context in diagnosis.

Differential Diagnosis Focus: The prompt emphasizes the importance of considering other possible causes and ruling out less likely options. This is a critical aspect of accurate diagnosis.

Justification and Reasoning: The AI is required to justify its diagnoses and explain its reasoning, making the process transparent.

Quantitative elements: Likelihood Score and Confidence level.

Actionable Recommendations: It requests specific recommendations for further investigation and management, making the analysis more useful.

Structured Output: The defined output format ensures the analysis is presented in a clear and organized way.
"""
        response = self.agent.execute(task=task, data=image)
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
