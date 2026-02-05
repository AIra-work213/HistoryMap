"""ML service for sentiment analysis of Russian text."""

import re
from typing import Optional

from app.config import settings


class MLService:
    """Service for sentiment analysis using rule-based approach."""

    _instance: Optional["MLService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # Define emotion keywords for Russian language
        self._fear_keywords = [
            "страх", "боюсь", "пугаю", "ужас", "кошмар", "тревога", "боязнь",
            "испуг", "паника", "ужасный", "страшный", "драма", "катастрофа",
            "бомбят", "война", "обстрел", "raid", "опасность", "грозит",
        ]
        self._joy_keywords = [
            "радость", "счастлив", "праздник", "победа", "торжество", "восторг",
            "любовь", "обожаю", "наслаждаюсь", "восхищение", " excelente",
            "чудесный", "прекрасный", "отличный", "хороший", "удача",
        ]
        self._sadness_keywords = [
            "грусть", "печаль", "оплакиваю", "скорбь", "сожаление", "тоска",
            "уныние", "меланхолия", "дpressive", "грустный", "печальный",
            "плачу", "слезы", "рыдаю", "горечь", "потеря", "смерть",
        ]

        # Compile regex patterns
        self._fear_pattern = re.compile(
            "|".join(self._fear_keywords), re.IGNORECASE
        )
        self._joy_pattern = re.compile(
            "|".join(self._joy_keywords), re.IGNORECASE
        )
        self._sadness_pattern = re.compile(
            "|".join(self._sadness_keywords), re.IGNORECASE
        )

    def analyze_sentiment(self, text: str) -> dict:
        """
        Analyze sentiment of a single text using rule-based approach.

        Returns dict with keys: fear, joy, neutral, sadness
        """
        if not text or len(text.strip()) == 0:
            return {"fear": 0.0, "joy": 0.0, "neutral": 1.0, "sadness": 0.0}

        text_lower = text.lower()

        # Count keyword matches
        fear_count = len(self._fear_pattern.findall(text_lower))
        joy_count = len(self._joy_pattern.findall(text_lower))
        sadness_count = len(self._sadness_pattern.findall(text_lower))

        total = fear_count + joy_count + sadness_count

        if total == 0:
            return {"fear": 0.0, "joy": 0.0, "neutral": 1.0, "sadness": 0.0}

        # Calculate normalized scores
        emotions = {
            "fear": fear_count / total,
            "joy": joy_count / total,
            "neutral": 0.0,
            "sadness": sadness_count / total,
        }

        # Normalize to sum to 1.0
        total_score = sum(emotions.values())
        if total_score > 0:
            emotions = {k: v / total_score for k, v in emotions.items()}

        return emotions

    def analyze_batch(self, texts: list[str]) -> list[dict]:
        """Analyze sentiment for multiple texts."""
        return [self.analyze_sentiment(text) for text in texts]

    def aggregate_emotions(self, emotion_list: list[dict]) -> dict:
        """Aggregate multiple emotion results into average."""
        if not emotion_list:
            return {"fear": 0.0, "joy": 0.0, "neutral": 1.0, "sadness": 0.0}

        aggregated = {"fear": 0.0, "joy": 0.0, "neutral": 0.0, "sadness": 0.0}

        for emotions in emotion_list:
            for key, value in emotions.items():
                aggregated[key] += value

        # Normalize
        total = sum(aggregated.values()) or 1.0
        aggregated = {k: v / total for k, v in aggregated.items()}

        return aggregated


# Singleton instance
ml_service = MLService()
