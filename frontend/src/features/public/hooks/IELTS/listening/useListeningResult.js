import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listeningStudentApi } from '../../../api/IELTS/listening/listeningStudentApi'; 

export const useListeningResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const submissionResponse = await listeningStudentApi.getSubmissionDetail(id);
        const submission = submissionResponse.data || submissionResponse;
        if (!submission) throw new Error("Không tìm thấy kết quả");


        const testResponse = await listeningStudentApi.getTestById(submission.test_id);
        const testDataRes = testResponse.data || testResponse;
        setTestData(testDataRes);

        const backendResultsMap = {};
        if (Array.isArray(submission.results)) {
            submission.results.forEach(item => {
                backendResultsMap[item.question_number] = item;
            });
        }


        let rawUserAnswers = {};
        const rawJsonString = submission.user_answers || submission.answers;
        if (typeof rawJsonString === 'string') {
            try { rawUserAnswers = JSON.parse(rawJsonString); } catch(e) {console.error("Lỗi khi parse JSON:", e);}
        } else if (typeof rawJsonString === 'object' && rawJsonString !== null) {
            rawUserAnswers = rawJsonString;
        }


        let allQuestions = [];
        if (testDataRes?.parts) {
            testDataRes.parts.forEach(part => {
                if (part.groups) {
                    part.groups.forEach(group => {
                        if (group.questions) {
                            
                            const questionsWithPart = group.questions.map(q => ({
                                ...q,
                                part_number: part.part_number
                            }));
                            allQuestions = [...allQuestions, ...questionsWithPart];
                        }
                    });
                }
            });
        }

        allQuestions.sort((a, b) => a.question_number - b.question_number);


        const detailMapping = allQuestions.map(q => {
            const qNum = String(q.question_number); 

         
            let cAnsList = backendResultsMap[q.question_number]?.correct_answers;
            if (!cAnsList || !Array.isArray(cAnsList)) {
                cAnsList = q.correct_answers || [];
            }


            let uAns = rawUserAnswers[qNum];
            if (uAns === undefined || uAns === null) {
                uAns = backendResultsMap[q.question_number]?.user_answer;
            }
            if (uAns === undefined || uAns === null) {
                uAns = ""; 
            }

  
            const isCorrect = compareAnswers(uAns, cAnsList);

            return {
                id: q.id,
                part_number: q.part_number, 
                question_number: q.question_number,
                question_text: q.question_text,
                user_answer: uAns,
                correct_answers: cAnsList,
                is_correct: isCorrect,
                explanation: q.explanation || backendResultsMap[q.question_number]?.explanation
            };
        });


        const calculatedCorrect = detailMapping.filter(x => x.is_correct).length;
        const total = allQuestions.length;
        const calculatedBand = calculateIELTSBand(calculatedCorrect);

      
        setResult({
            ...submission,
            test_title: submission.test?.title || testDataRes.title || `Test #${submission.test_id}`,
            details: detailMapping,
            correct_count: calculatedCorrect, 
            total_questions: total,
            band_score: calculatedBand 
        });

      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  return { result, loading, testData }; 
};



const cleanText = (text) => {
    if (text === null || text === undefined) return "";
    return String(text).trim().toLowerCase().replace(/\s+/g, ' ');
};

const compareAnswers = (userAns, correctAnswersList) => {
    if (userAns === undefined || userAns === null || userAns === "" || (Array.isArray(userAns) && userAns.length === 0)) return false;
    if (!correctAnswersList || !Array.isArray(correctAnswersList) || correctAnswersList.length === 0) return false;

    const acceptedCleaned = correctAnswersList.map(a => cleanText(a));

   
    if (Array.isArray(userAns)) {
        const userCleaned = userAns.map(a => cleanText(a));
   
        if (userCleaned.length !== acceptedCleaned.length) return false;
        
        const sortedUser = [...userCleaned].sort();
        const sortedAccept = [...acceptedCleaned].sort();
        
        return sortedUser.every((val, index) => val === sortedAccept[index]);
    }


    const cleanedStudent = cleanText(userAns);
    return acceptedCleaned.includes(cleanedStudent);
};

const calculateIELTSBand = (score) => {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 26) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 18) return 5.5;
    if (score >= 16) return 5.0;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4.0;
    return 0.0;
};