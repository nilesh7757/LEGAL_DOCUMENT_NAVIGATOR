from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import google.generativeai as genai
import json
from django.http import FileResponse
import markdown
from xhtml2pdf import pisa
from io import BytesIO

@api_view(['POST'])
def chat(request):
    """
    API endpoint for the conversational legal document generator.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == '':
        return Response({'error': 'GEMINI_API_KEY is not configured in your .env file or is empty.'}, status=500)

    messages = request.data.get('messages', [])
    if not messages:
        return Response({'error': 'Messages are required'}, status=400)

    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)

        system_instruction = """You are a helpful legal assistant. Your goal is to help the user create a legal document.
- First, ask follow-up questions to gather all the necessary details.
- When you have enough information, generate the full legal document in a JSON format like this: ```json{\"type\": \"document\", \"text\": \"...your document here...\"}```.
- If the user asks to update some information, you must regenerate the **entire** document with the updated information and provide the full document again in the same JSON format. Do not just provide the updated line or a confirmation message."""

        model = genai.GenerativeModel(
            'models/gemini-2.5-flash-lite',
            system_instruction=system_instruction
        )

        conversation_history = []
        for message in messages:
            role = 'user' if message['sender'] == 'user' else 'model'
            conversation_history.append({'role': role, 'parts': [message['text']]})

        print(f"Conversation history: {conversation_history}")

        response = model.generate_content(conversation_history)

        print(f"Model response: {response.text}")

        # The response from the model is just text, so we need to parse it to see
        # if it is a question or the final document.
        # For now, we will assume that if the response contains "```json", it is the final document in JSON format.
        # Otherwise, it is a question.
        if '```json' in response.text:
            # It's the final document
            # Extract the JSON part from the response
            json_str = response.text.split('```json')[1].split('```')[0]
            document_data = json.loads(json_str)
            return Response(document_data)
        else:
            # It's a question
            return Response({'type': 'question', 'text': response.text})

    except Exception as e:
        print(f"Error in chat view: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def download_pdf(request):
    """
    API endpoint to download a legal document as PDF.
    """
    document_content = request.data.get('document_content')
    if not document_content:
        return Response({'error': 'Document content is required'}, status=400)

    try:
        # Convert markdown to HTML
        html_content = markdown.markdown(document_content)

        # Create a basic HTML structure for xhtml2pdf
        full_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Legal Document</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: sans-serif; margin: 2cm; line-height: 1.6; color: #333; }}
                h1, h2, h3, h4, h5, h6 {{ margin-top: 1em; margin-bottom: 0.5em; font-weight: bold; line-height: 1.2; }}
                h1 {{ font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }}
                h2 {{ font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }}
                h3 {{ font-size: 1.2em; }}
                p {{ margin-bottom: 1em; }}
                ul, ol {{ margin-bottom: 1em; padding-left: 2em; }}
                li {{ margin-bottom: 0.5em; }}
                pre {{ background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; font-family: monospace; }}
                code {{ font-family: monospace; background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }}
                blockquote {{ border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0; color: #666; }}
                table {{ width: 100%; border-collapse: collapse; margin-bottom: 1em; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
        </html>
        """

        # Generate PDF using xhtml2pdf
        result_file = BytesIO()
        pisa_status = pisa.CreatePDF(
                full_html,                # the HTML to convert
                dest=result_file)         # file handle to receive result

        if pisa_status.err:
            return Response({'error': f'PDF generation error: {pisa_status.err}'}, status=500)

        # Important: Seek to the beginning of the stream before returning
        result_file.seek(0)
        response = FileResponse(result_file, content_type='application/pdf') # Pass BytesIO object directly
        response['Content-Disposition'] = 'attachment; filename="legal_document.pdf"'
        return response
    except Exception as e:
        return Response({'error': f'Error generating PDF: {e}'}, status=500)
