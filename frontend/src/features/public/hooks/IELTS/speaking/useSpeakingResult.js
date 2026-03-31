import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { speakingStudentApi } from '../../api/speakingStudentApi'; // Đã sửa lại đường dẫn cho chuẩn
import toast from 'react-hot-toast';

export const useSpeakingResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý tab Part nào đang được xem (1, 2, hoặc 3)
  const [activePart, setActivePart] = useState(1);

  // 1. Fetch Data
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await speakingStudentApi.getSubmissionDetail(id);
        const data = res.data || res;
        setSubmission(data);
      } catch (error) {
        console.error("Error fetching speaking result:", error);
        toast.error("Không thể tải kết quả bài thi.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchResult();
  }, [id]);

  // 2. Computed Data: Lấy toàn bộ Câu hỏi & Câu trả lời của Part đang active
  const activePartData = useMemo(() => {
    if (!submission?.test?.parts || !submission?.answers) return null;

    // A. Tìm thông tin của Part hiện tại (chứa instruction, cue_card, và danh sách câu hỏi gốc)
    const currentPartInfo = submission.test.parts.find(p => p.part_number === activePart);
    if (!currentPartInfo) return null;

    // B. Lặp qua từng câu hỏi trong Part này, tìm câu trả lời (answer) mà học viên đã nộp để ghép vào
    const questionsWithAnswers = currentPartInfo.questions.map(question => {
      // Tìm answer có question_id khớp với id của câu hỏi
      const studentAnswer = submission.answers.find(a => a.question_id === question.id) || null;

      // Parse mảng lỗi (correction) an toàn
      let parsedCorrections = [];
      if (studentAnswer?.correction) {
        try {
          if (typeof studentAnswer.correction === 'string') {
            parsedCorrections = JSON.parse(studentAnswer.correction);
          } else if (Array.isArray(studentAnswer.correction)) {
            parsedCorrections = studentAnswer.correction;
          }
        } catch (e) {
          console.error("Failed to parse correction JSON", e);
        }
      }

      return {
        questionInfo: question, // Chứa text câu hỏi, thứ tự...
        answerDetail: studentAnswer ? { ...studentAnswer, parsedCorrections } : null // Chứa audio, điểm, transcript, lỗi...
      };
    });

    // C. Tính điểm trung bình nháp cho Part này (tùy chọn, rất hữu ích cho UI)
    let partScores = { fluency: 0, lexical: 0, grammar: 0, pronunciation: 0 };
    let answeredCount = 0;

    questionsWithAnswers.forEach(qa => {
      if (qa.answerDetail && qa.answerDetail.score_fluency !== undefined) {
        partScores.fluency += qa.answerDetail.score_fluency;
        partScores.lexical += qa.answerDetail.score_lexical;
        partScores.grammar += qa.answerDetail.score_grammar;
        partScores.pronunciation += qa.answerDetail.score_pronunciation;
        answeredCount++;
      }
    });

    if (answeredCount > 0) {
      partScores.fluency = (partScores.fluency / answeredCount).toFixed(1);
      partScores.lexical = (partScores.lexical / answeredCount).toFixed(1);
      partScores.grammar = (partScores.grammar / answeredCount).toFixed(1);
      partScores.pronunciation = (partScores.pronunciation / answeredCount).toFixed(1);
    }

    return {
      partInfo: currentPartInfo,             // Chứa Instruction, Cue Card
      qaList: questionsWithAnswers,          // Mảng [ { questionInfo, answerDetail } ]
      partScores: answeredCount > 0 ? partScores : null // Điểm TB của riêng Part này
    };

  }, [submission, activePart]);

  return {
    submission,
    loading,
    activePart,
    setActivePart,
    activePartData, // Đã đổi tên từ activeAnswerData sang activePartData cho đúng ngữ nghĩa
    navigate
  };
};