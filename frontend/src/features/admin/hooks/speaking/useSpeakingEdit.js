import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminSpeakingApi } from '../../api/IELTS/speaking/adminSpeakingApi';
import toast from 'react-hot-toast';

export const useSpeakingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);

  // 1. Form State (Thông tin chung của Đề thi)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 15,
    is_published: false,
    is_full_test_only: false, 
  });

  // 2. Parts State
  const [parts, setParts] = useState([
    { part_number: 1, instruction: '', cue_card: '', question_text: '', audio_question_url: '' },
    { part_number: 2, instruction: '', cue_card: '', question_text: '', audio_question_url: '' },
    { part_number: 3, instruction: '', cue_card: '', question_text: '', audio_question_url: '' },
  ]);

  // 3. Fetch Data (Khi ở chế độ Edit)
  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const response = await adminSpeakingApi.getTestDetail(id);
          const data = response.data || response; // Xử lý bọc data của axios
          
          setFormData({
            title: data.title || '',
            description: data.description || '',
            time_limit: data.time_limit || 15,
            is_published: data.is_published || false,
            is_full_test_only: data.is_full_test_only || false, 
          });

          // Map data từ Backend (parts -> questions) về Frontend (phẳng)
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
                // Sắp xếp lại câu hỏi theo sort_order trước khi nối chuỗi
                const sortedQs = [...foundPart.questions].sort((a,b) => a.sort_order - b.sort_order);
                combinedText = sortedQs.map(q => q.question_text).join('\n');
                
                // Lấy audio_url của câu hỏi đầu tiên (nếu có) làm đại diện cho Part đó trên UI
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
          toast.error("Lỗi tải thông tin đề thi.");
          navigate('/admin/skills/speaking');
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id, isEditMode, navigate]);

  // 4. Handlers
  const handlePartChange = (index, field, value) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
  
    
    // Validate cơ bản
    if (!formData.title.trim()) {
      return toast.error("Vui lòng nhập tên đề thi");
    }
    
    // Tùy chọn: Bạn có thể bắt buộc phải có câu hỏi cho cả 3 phần, 
    // hoặc cho phép trống nếu đề đang làm dở. Ở đây mình giữ yêu cầu bắt buộc.
    if (parts.some(p => !p.question_text.trim())) {
      return toast.error("Vui lòng nhập ít nhất 1 câu hỏi cho mỗi Part");
    }

    // 🔥 CHUẨN BỊ PAYLOAD CHO BACKEND
    const formattedParts = parts.map(p => {
      // Tách mỗi dòng (xuống dòng) thành 1 câu hỏi riêng biệt, bỏ qua dòng trống
      const lines = p.question_text.split('\n').filter(line => line.trim() !== '');
      
      const mappedQuestions = lines.map((text, idx) => ({
        sort_order: idx + 1, // Đã đổi tên trường từ order_number thành sort_order cho khớp Schema
        question_text: text.trim(),
        // Ở phiên bản UI này, ta tạm thời gắn audio cho câu hỏi đầu tiên của Part. 
        // Các câu sau sẽ không có audio (Nếu muốn nâng cấp, UI cần làm dạng List thêm/xóa từng câu).
        audio_question_url: idx === 0 ? p.audio_question_url : null 
      }));

      return {
        part_number: p.part_number,
        instruction: p.instruction,
        cue_card: p.cue_card,
        questions: mappedQuestions // Mảng các đối tượng câu hỏi
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
        toast.success("Đã cập nhật thay đổi thành công!");
        navigate('/admin/skills/speaking'); // Cập nhật xong thì quay về danh sách
      } else {
        await adminSpeakingApi.createTest(payload);
        toast.success("Tạo đề thi mới thành công!");
        navigate('/admin/skills/speaking'); // Tạo xong thì quay về danh sách
      }
    } catch (error) {
      console.error("Save failed:", error.response?.data || error);
      toast.error(error.response?.data?.detail || "Có lỗi xảy ra khi lưu. Vui lòng thử lại!");
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