from typing import Any

class AptisWritingUtils:
    @staticmethod
    def count_words(text: str) -> int:
        if not text: return 0
        return len(text.strip().split())

    @staticmethod
    def count_words_json(data: Any) -> int:
        count = 0
        if isinstance(data, str):
            count += AptisWritingUtils.count_words(data)
        elif isinstance(data, list):
            for item in data:
                count += AptisWritingUtils.count_words_json(item)
        elif isinstance(data, dict):
            for value in data.values():
                count += AptisWritingUtils.count_words_json(value)
        return count