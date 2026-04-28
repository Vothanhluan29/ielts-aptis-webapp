import google.generativeai as genai  # type: ignore
import os
from dotenv import load_dotenv

# 1. Load API Key from the .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in the .env file")
else:
    # 2. Configure Gemini
    genai.configure(api_key=api_key)

    print(f"Checking available models for key: {api_key[:5]}...")
    print("-" * 30)

    # 3. Retrieve the list and filter models that support generateContent
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"MODEL: {m.name}")
                print(f"--> Display Name: {m.display_name}")
                print("-" * 30)
    except Exception as e:
        print(f" Connection error: {e}")