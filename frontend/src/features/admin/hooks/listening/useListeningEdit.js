import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import { listeningAdminApi } from '../../api/IELTS/listening/listeningAdminApi';

export const useListeningEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Sử dụng Form instance của Ant Design để quản lý toàn bộ data
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- 1. FETCH DỮ LIỆU ĐỂ FILL VÀO FORM (Chỉ chạy khi ở chế độ Edit) ---
  useEffect(() => {
    if (isEditMode) {
      const fetchTest = async () => {
        try {
          setLoading(true);
          const response = await listeningAdminApi.getTestById(id);
          const data = response.data || response;

          // Xử lý dữ liệu trả về: Đảm bảo options parse đúng dạng object để form render
          if (data.parts) {
            data.parts.forEach(part => {
              if (part.groups) {
                part.groups.forEach(group => {
                  if (group.questions) {
                    group.questions.forEach(q => {
                      if (typeof q.options === 'string') {
                        try {
                          q.options = JSON.parse(q.options);
                        } catch (e) {
                          q.options = {};
                          message.error('Failed to parse options for question ID ' + q.id, e);
                        }
                      }
                      if (!q.options) q.options = {};
                      // Đảm bảo mảng correct_answers tồn tại
                      if (!q.correct_answers) q.correct_answers = [];
                    });
                  }
                });
              }
            });
          }

          // Nạp dữ liệu vào form của Ant Design
          form.setFieldsValue(data);
        } catch (error) {
          console.error('Failed to fetch test details:', error);
          message.error('Không thể tải dữ liệu đề thi!');
          navigate('/admin/skills/listening');
        } finally {
          setLoading(false);
        }
      };

      fetchTest();
    } else {
      // Chế độ tạo mới: Nạp sẵn một số giá trị mặc định cho form
      form.setFieldsValue({
        time_limit: 40,
        is_published: false,
        is_full_test_only: false,
        parts: [
          {
            part_number: 1,
            audio_url: '',
            transcript: '',
            groups: []
          }
        ]
      });
    }
  }, [id, form, navigate, isEditMode]);

  // --- 2. LOGIC TỰ ĐỘNG ĐÁNH SỐ CÂU HỎI (Auto-increment Question Number) ---
  const getNextQuestionNumber = useCallback(() => {
    const currentValues = form.getFieldsValue();
    let maxNum = 0;
    
    if (currentValues.parts) {
      currentValues.parts.forEach(p => {
        if (p?.groups) {
          p.groups.forEach(g => {
            if (g?.questions) {
              g.questions.forEach(q => {
                if (q?.question_number > maxNum) {
                  maxNum = q.question_number;
                }
              });
            }
          });
        }
      });
    }
    return maxNum + 1;
  }, [form]);

  // --- 3. LOGIC TÍNH TOÁN LẠI SỐ THỨ TỰ (Dành cho nút Recalculate) ---
  const recalculateAllQuestionNumbers = useCallback(() => {
    const currentValues = form.getFieldsValue();
    let counter = 1;
    
    if (currentValues.parts) {
      currentValues.parts.forEach((p, pIdx) => {
        if (p?.groups) {
          p.groups.forEach((g, gIdx) => {
            if (g?.questions) {
              g.questions.forEach((q, qIdx) => {
                // Update trực tiếp vào object values
                if (currentValues.parts[pIdx].groups[gIdx].questions[qIdx]) {
                    currentValues.parts[pIdx].groups[gIdx].questions[qIdx].question_number = counter++;
                }
              });
            }
          });
        }
      });
    }
    
    // Nạp lại toàn bộ dữ liệu vào form sau khi tính toán
    form.setFieldsValue(currentValues);
    message.success('Đã đánh số lại các câu hỏi từ 1 đến ' + (counter - 1));
  }, [form]);


  // --- 4. HÀM GỬI DỮ LIỆU LÊN API ---
  const handleSave = async (values) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await listeningAdminApi.updateTest(id, values);
        message.success('Cập nhật đề thi thành công!');
      } else {
        await listeningAdminApi.createTest(values);
        message.success('Tạo đề thi mới thành công!');
      }
      navigate('/admin/skills/listening');
    } catch (error) {
      console.error('Lỗi khi lưu đề thi:', error);
      message.error(error.response?.data?.detail || 'Có lỗi xảy ra khi lưu đề thi!');
    } finally {
      setLoading(false);
    }
  };

  return {
    form, // 🔥 Trả form instance ra cho giao diện sử dụng
    loading,
    isEditMode,
    navigate,
    getNextQuestionNumber,
    recalculateAllQuestionNumbers,
    handleSave,
  };
};