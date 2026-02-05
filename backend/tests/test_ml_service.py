"""Tests for ML service."""

import pytest

from app.services.ml_service import ml_service


@pytest.mark.asyncio
async def test_ml_service_singleton():
    """Test that ML service is a singleton."""
    from app.services.ml_service import MLService

    service1 = MLService()
    service2 = MLService()

    assert service1 is service2


def test_analyze_sentiment_positive():
    """Test sentiment analysis with positive text."""
    text = "Сегодня чудесный день! Я очень рад и счастлив!"
    emotions = ml_service.analyze_sentiment(text)

    assert "fear" in emotions
    assert "joy" in emotions
    assert "neutral" in emotions
    assert "sadness" in emotions

    # Check normalization
    total = sum(emotions.values())
    assert abs(total - 1.0) < 0.01  # Should be approximately 1


def test_analyze_sentiment_negative():
    """Test sentiment analysis with negative text."""
    text = "Мне так страшно. Война вокруг, везде трагедия и смерть."
    emotions = ml_service.analyze_sentiment(text)

    assert "fear" in emotions
    assert "joy" in emotions
    assert "neutral" in emotions
    assert "sadness" in emotions


def test_analyze_sentiment_empty():
    """Test sentiment analysis with empty text."""
    emotions = ml_service.analyze_sentiment("")

    # Should return neutral for empty text
    assert emotions["neutral"] > 0


def test_analyze_batch():
    """Test batch sentiment analysis."""
    texts = [
        "Очень радостное событие!",
        "Страшно и грустно.",
        "Обычный день, ничего особенного.",
    ]

    results = ml_service.analyze_batch(texts)

    assert len(results) == 3
    for emotions in results:
        assert "fear" in emotions
        assert "joy" in emotions
        assert "neutral" in emotions
        assert "sadness" in emotions


def test_aggregate_emotions():
    """Test emotion aggregation."""
    emotion_list = [
        {"fear": 0.8, "joy": 0.1, "neutral": 0.1, "sadness": 0.0},
        {"fear": 0.2, "joy": 0.7, "neutral": 0.1, "sadness": 0.0},
        {"fear": 0.0, "joy": 0.0, "neutral": 1.0, "sadness": 0.0},
    ]

    aggregated = ml_service.aggregate_emotions(emotion_list)

    assert "fear" in aggregated
    assert "joy" in aggregated
    assert "neutral" in aggregated
    assert "sadness" in aggregated

    # Check normalization
    total = sum(aggregated.values())
    assert abs(total - 1.0) < 0.01


def test_aggregate_empty_emotions():
    """Test aggregation with empty list."""
    aggregated = ml_service.aggregate_emotions([])

    assert aggregated["neutral"] == 1.0
    assert aggregated["fear"] == 0.0
    assert aggregated["joy"] == 0.0
    assert aggregated["sadness"] == 0.0
