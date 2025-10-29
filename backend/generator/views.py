from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import google.generativeai as genai
from django.http import FileResponse
import markdown
from xhtml2pdf import pisa
from io import BytesIO
import os

genai.configure(api_key=settings.GEMINI_API_KEY)

@api_view(['POST'])
def generate_document(request):
    """
    API endpoint to generate a legal document.
    """
    prompt = request.data.get('prompt')
    if not prompt:
        return Response({'error': 'Prompt is required'}, status=400)

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(prompt)
        document_content = response.text
    except Exception as e:
        print(f"Error generating document: {e}")
        return Response({'error': str(e)}, status=500)

    return Response({'document': document_content})

@api_view(['POST'])
def download_pdf(request):
    """
    API endpoint to download a legal document as PDF.
    """
    document_content = request.data.get('document_content')
    if not document_content:
        return Response({'error': 'Document content is required'}, status=400)

    print('Document content received for PDF download:', document_content)

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
            print(f"Pisa error: {pisa_status.err}")
            return Response({'error': 'PDF generation error'}, status=500)

        # Important: Seek to the beginning of the stream before returning
        result_file.seek(0)
        response = FileResponse(result_file, content_type='application/pdf') # Pass BytesIO object directly
        response['Content-Disposition'] = 'attachment; filename="legal_document.pdf"'
        return response
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return Response({'error': str(e)}, status=500)