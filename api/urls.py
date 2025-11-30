from django.urls import path
from .views import generate_flashcards, get_all_decks, generate_quiz, update_card_progress, generate_explanation

urlpatterns = [
    path('generate-explanation/', generate_explanation),
    path('generate-cards/', generate_flashcards),
    path('decks/', get_all_decks), 
    path('generate-quiz/', generate_quiz),
    path('card/<int:pk>/update/', update_card_progress),
]
