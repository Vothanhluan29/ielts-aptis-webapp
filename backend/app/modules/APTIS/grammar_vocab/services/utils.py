import json

class GrammarVocabUtils:
    @staticmethod
    def parse_options(options):
        """Hàm an toàn để parse chuỗi JSON từ DB về dạng dictionary."""
        if isinstance(options, dict):
            return options
        if isinstance(options, str):
            try:
                return json.loads(options)
            except Exception:
                return {}
        return {}