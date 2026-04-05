import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { adminSpeakingApi } from '../../../api/IELTS/speaking/adminSpeakingApi';

export const useSpeakingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 15,
    is_published: false,
    is_full_test_only: false,
  });

  const [parts, setParts] = useState([
    { part_number: 1, instruction: '', cue_card: '', question_text: '', audio_question_url: '' },
    { part_number: 2, instruction: '', cue_card: '', question_text: '', audio_question_url: '' },
    { part_number: 3, instruction: '', cue_card: '', question_text: '', audio_question_url: '' },
  ]);

  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const response = await adminSpeakingApi.getTestDetail(id);
          const data = response.data || response;

          setFormData({
            title: data.title || '',
            description: data.description || '',
            time_limit: data.time_limit || 15,
            is_published: data.is_published || false,
            is_full_test_only: data.is_full_test_only || false,
          });

          const sortedParts = [...(data.parts || [])].sort((a,b) => a.part_number - b.part_number);

          const newPartsState = [1, 2, 3].map(num => {
            const foundPart = sortedParts.find(p => p.part_number === num);

            let combinedText = '';
            let audioUrl = '';
            let instr = '';
            let cue = '';

            if (foundPart) {
              instr = foundPart.instruction || '';
              cue = foundPart.cue_card || '';

              if (foundPart.questions && foundPart.questions.length > 0) {
                const sortedQs = [...foundPart.questions].sort((a,b) => a.sort_order - b.sort_order);
                combinedText = sortedQs.map(q => q.question_text).join('\n');
                audioUrl = sortedQs[0].audio_question_url || '';
              }
            }

            return { 
              part_number: num, 
              instruction: instr,
              cue_card: cue,
              question_text: combinedText, 
              audio_question_url: audioUrl 
            };
          });

          setParts(newPartsState);
        } catch (error) {
          console.error("Error fetching test detail:", error);
          message.error("Failed to load test details.");
          navigate('/admin/skills/speaking');
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id, isEditMode, navigate]);

  const handlePartChange = (index, field, value) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      return message.error("Please enter the test title.");
    }

    if (parts.some(p => !p.question_text.trim())) {
      return message.error("Please enter at least one question for each part.");
    }

    const formattedParts = parts.map(p => {
      const lines = p.question_text.split('\n').filter(line => line.trim() !== '');
      
      const mappedQuestions = lines.map((text, idx) => ({
        sort_order: idx + 1,
        question_text: text.trim(),
        audio_question_url: idx === 0 ? p.audio_question_url : null 
      }));

      return {
        part_number: p.part_number,
        instruction: p.instruction,
        cue_card: p.cue_card,
        questions: mappedQuestions
      };
    });

    const payload = { 
      ...formData, 
      parts: formattedParts 
    };

    try {
      setLoading(true);
      if (isEditMode) {
        await adminSpeakingApi.updateTest(id, payload);
        message.success("Test updated successfully!");
        navigate('/admin/skills/speaking');
      } else {
        await adminSpeakingApi.createTest(payload);
        message.success("New test created successfully!");
        navigate('/admin/skills/speaking');
      }
    } catch (error) {
      console.error("Save failed:", error.response?.data || error);
      message.error(error.response?.data?.detail || "An error occurred while saving. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditMode,
    loading,
    formData,
    handleFormChange,
    parts,
    handlePartChange,
    handleSubmit,
    navigate
  };
};