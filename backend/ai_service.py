# ai_service.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Set up Gemini
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_health_script(user_name: str, lga: str, risk_data: dict) -> str:
    """Generate a preventive health message in Nigerian Pidgin/English."""
    if not model:
        # Fallback if no API key
        return f"Hello {user_name}, this is Sabi Health. There is a high risk in {lga} due to {', '.join(risk_data.get('risks', []))}. Please stay safe."

    risks_str = ", ".join(risk_data.get("risks", []))
    prompt = f"""
    You are 'Sabi Health', a proactive and caring health assistant in Nigeria. 
    Your tone should be warm, neighborly, and culturally resonant. 
    User Name: {user_name}
    LGA: {lga}
    Risks detected: {risks_str}
    
    TASK: Generate a short health alert message in authentic Nigerian Pidgin (blended with English where natural).
    
    GUIDELINES:
    1. Start with a friendly greeting using the user's name.
    2. Mention that you're calling because of the high risk in {lga}.
    3. If 'Lassa fever' is a risk, advise on covering food and keeping rats away.
    4. If 'malaria' or 'heavy rain' is a risk, advise on using mosquito nets and clearing stagnant water.
    5. Always end by asking: "Anybody dey sick for your house?" or "How your body dey?" to check for fever.
    6. Keep the total length under 60 words.
    7. Do NOT use overly formal medical jargon. Use "well well", "sharp sharp", "no gree", etc., where appropriate.
    
    Example vibe: "Abeg, make sure say you cover your food o, so rat no go touch am."
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip().replace('"', '') # Clean up quotes if any
    except Exception as e:
        print(f"Gemini Error: {e}")
        return f"Nne/Nna, Sabi Health dey call you for {lga}. Risk don high for there. Abeg stay safe!"
