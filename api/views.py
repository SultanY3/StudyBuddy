import json
import google.generativeai as genai
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import FlashcardDeck, Flashcard, Quiz, Question
from .serializers import DeckSerializer, QuizSerializer
from django.conf import settings


genai.configure(api_key=settings.GOOGLE_API_KEY)


#  1. EXPLANATION GENERATOR 
@api_view(['POST'])
def generate_explanation(request):
    topic = request.data.get('topic')
    if not topic:
        return Response({"error": "No topic provided."}, status=400)
    
    print(f"Generating explanation for: {topic}")

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        
        response = model.generate_content(
            f"Explain '{topic}' simply for a university student. Keep it under 150 words."
        )
        
        
        return Response({
            "topic": topic,
            "explanation": response.text
        })
    except Exception as e:
        return Response({"error": f"Backend Error: {str(e)}"}, status=500)

#  2. FLASHCARD GENERATOR 
@api_view(['POST'])
def generate_flashcards(request):
    topic = request.data.get('topic')
    print(f"Generating flashcards for: {topic}")

    model = genai.GenerativeModel('gemini-2.5-flash') 
    
    prompt = f"""
    Create 6 flashcards for studying '{topic}'.
    Return ONLY valid JSON in this exact format, no other text:
    [
        {{"front": "Question 1", "back": "Answer 1"}},
        {{"front": "Question 2", "back": "Answer 2"}}
    ]
    """
    
    try:
        response = model.generate_content(prompt)
        
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        cards_data = json.loads(clean_text)
        
        deck = FlashcardDeck.objects.create(topic=topic)
        for card in cards_data:
            Flashcard.objects.create(
                deck=deck,
                front=card['front'],
                back=card['back']
            )
            
        serializer = DeckSerializer(deck)
        return Response(serializer.data)

    except Exception as e:
        print(f"Error: {e}")
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def get_all_decks(request):
    decks = FlashcardDeck.objects.all().order_by('-created_at')
    serializer = DeckSerializer(decks, many=True)
    return Response(serializer.data)


#  3. QUIZ GENERATOR 
@api_view(['POST'])
def generate_quiz(request):
    topic = request.data.get('topic')
    print(f"Generating quiz for: {topic}")

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Create a multiple choice quiz about '{topic}' with 5 questions.
    Return ONLY valid JSON in this format, no other text:
    [
        {{
            "text": "What is the capital of France?",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "correct_answer": 2
        }}
    ]
    """
    try:
        response = model.generate_content(prompt)
        
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        quiz_data = json.loads(clean_text)
        
        quiz = Quiz.objects.create(topic=topic)
        for q in quiz_data:
            Question.objects.create(
                quiz=quiz,
                text=q['text'],
                options=q['options'],
                correct_answer=q['correct_answer']
            )
        
        return Response(QuizSerializer(quiz).data)

    except Exception as e:
        print(f"Error: {e}")
        return Response({"error": str(e)}, status=500)


#  4. SPACED REPETITION LOGIC 
@api_view(['POST'])
def update_card_progress(request, pk):
    
    card = get_object_or_404(Flashcard, pk=pk)
    correct = request.data.get('correct', False)
    
    card.move_box(correct)
    
    return Response({
        "message": "Progress updated", 
        "new_box": card.box, 
        "next_review": card.next_review
    })