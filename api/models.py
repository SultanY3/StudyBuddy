from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

#  FLASHCARDS 
class FlashcardDeck(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    topic = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic

class Flashcard(models.Model):
    deck = models.ForeignKey(FlashcardDeck, related_name='cards', on_delete=models.CASCADE)
    front = models.TextField()
    back = models.TextField()
    
    box = models.IntegerField(default=1) 
    next_review = models.DateTimeField(default=timezone.now)

    def move_box(self, correct):
        """Simple Leitner System Logic"""
        if correct:
            self.box = min(self.box + 1, 5) 
        else:
            self.box = 1 
        
        intervals = {1: 1, 2: 3, 3: 7, 4: 14, 5: 30}
        days_to_add = intervals.get(self.box, 1)
        self.next_review = timezone.now() + timedelta(days=days_to_add)
        self.save()

    def __str__(self):
        return f"{self.deck.topic} - {self.front[:30]}"

#  QUIZZES 
class Quiz(models.Model):
    topic = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    options = models.JSONField() 
    correct_answer = models.IntegerField()