import json

class GrammarVocabUtils:
    @staticmethod
    def parse_options(options):

        if isinstance(options, dict):
            return options
        if isinstance(options, str):
            try:
                return json.loads(options)
            except Exception:
                return {}
        return {}