import os
from sqlalchemy.orm import joinedload
from datetime import datetime

from app.core.database import SessionLocal
from app.core.AI.speaking_grading import IELTS_Speaking_Grader
from app.modules.IELTS.speaking.models import SpeakingSubmission, SpeakingQuestionAnswer, SpeakingQuestion, SpeakingStatus
from .utils import SpeakingUtils, BASE_URL


class SpeakingGradingService:
    @staticmethod
    def process_ai_grading(submission_id: int):
        print(f"[AI START] Grading Speaking Submission #{submission_id}...")
        db = SessionLocal()
        try:
            sub = db.query(SpeakingSubmission).options(
                joinedload(SpeakingSubmission.answers)
                .joinedload(SpeakingQuestionAnswer.question)
                .joinedload(SpeakingQuestion.part)
            ).filter(SpeakingSubmission.id == submission_id).first()

            if not sub:
                return

            sub.status = SpeakingStatus.GRADING.value
            db.commit()

            grader = IELTS_Speaking_Grader()

            total_fluency, total_lexical, total_grammar, total_pron = 0.0, 0.0, 0.0, 0.0
            question_count = 0

            combined_feedback = ""

            for answer in sub.answers:
                question_text = answer.question.question_text
                part_number = answer.question.part.part_number

                if not answer.audio_url:
                    print(f"[ERROR] Audio URL empty for Question {answer.question_id}")
                    continue

                relative_path = answer.audio_url.split(f"{BASE_URL}/")[-1]

                if not os.path.exists(relative_path):
                    answer.transcript = "(System Error: Audio file missing)"
                    answer.feedback = "We couldn't locate your audio file. Please try recording again."
                    continue

                ai_result = grader.grade_single_part(
                    audio_path=relative_path,
                    question_text=question_text,
                    part_number=part_number
                )

                answer.transcript = ai_result.get("transcript", "")

                ans_feedback = ai_result.get("feedback", "")
                answer.feedback = ans_feedback
                combined_feedback += f"**Part {part_number} - Q:** {question_text}\n{ans_feedback}\n\n"

                scores = ai_result.get("scores", {})
                answer.score_fluency = scores.get("fluency", 0.0)
                answer.score_lexical = scores.get("lexical", 0.0)
                answer.score_grammar = scores.get("grammar", 0.0)
                answer.score_pronunciation = scores.get("pronunciation", 0.0)

                answer.correction = ai_result.get("correction", [])

                total_fluency += answer.score_fluency
                total_lexical += answer.score_lexical
                total_grammar += answer.score_grammar
                total_pron += answer.score_pronunciation
                question_count += 1

            if question_count > 0:
                sub.score_fluency = SpeakingUtils.round_ielts_score(total_fluency / question_count)
                sub.score_lexical = SpeakingUtils.round_ielts_score(total_lexical / question_count)
                sub.score_grammar = SpeakingUtils.round_ielts_score(total_grammar / question_count)
                sub.score_pronunciation = SpeakingUtils.round_ielts_score(total_pron / question_count)

                raw_band = (sub.score_fluency + sub.score_lexical + sub.score_grammar + sub.score_pronunciation) / 4
                sub.band_score = SpeakingUtils.round_ielts_score(raw_band)

                sub.overall_feedback = combined_feedback.strip()
                sub.status = SpeakingStatus.GRADED.value
                sub.graded_at = datetime.now()
            else:
                sub.status = SpeakingStatus.ERROR.value
                sub.overall_feedback = "All questions failed to process. Audio files might be missing or empty."

            db.commit()
            print(f"[AI DONE] Speaking Graded. Band: {sub.band_score}")

        except Exception as e:
            print(f"[AI ERROR] Speaking Grading: {e}")
            try:
                sub.status = SpeakingStatus.ERROR.value
                sub.overall_feedback = f"System Error during grading: {str(e)}"
                db.commit()
            except:
                db.rollback()
        finally:
            db.close()