import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import { readingAdminApi } from '../../api/IELTS/reading/readingAdminApi';
import toast from 'react-hot-toast';

export const useReadingEdit = () => {
  const { id } = useParams(); // Nếu có ID trên URL thì là chế độ Edit
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!id;

  // =========================================================
  // 1. HÀM FETCH DỮ LIỆU (Được bọc useCallback để tránh warning)
  // =========================================================
  const fetchTestDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await readingAdminApi.getTestDetail(id);
      const data = res.data || res;
      
      // Đổ dữ liệu từ Backend thẳng vào Form Ant Design
      form.setFieldsValue(data);
    } catch (error) {
      console.error("Fetch Test Detail Error:", error);
      toast.error("Không thể tải dữ liệu đề thi.");
      navigate('/admin/skills/reading');
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate]); // Khai báo đủ dependency cho hàm này

  // =========================================================
  // 2. KHỞI TẠO DỮ LIỆU BẮT ĐẦU (INIT DATA)
  // =========================================================
  useEffect(() => {
    if (isEditMode) {
      fetchTestDetail();
    } else {
      // Khởi tạo form trống chuẩn cấu trúc cho Create Mode
      form.setFieldsValue({
        time_limit: 60,
        is_published: false,
        is_full_test_only: false,
        passages: [
          { 
            order: 1, 
            title: '',
            content: '',
            groups: [
              { 
                order: 1, 
                instruction: '',
                questions: [{ 
                  question_number: 1, 
                  question_type: 'MULTIPLE_CHOICE',
                  question_text: '',
                  correct_answers: [] 
                }] 
              }
            ] 
          }
        ]
      });
    }
  }, [isEditMode, form, fetchTestDetail]); // Đã thêm fetchTestDetail vào đây, fix triệt để warning!

  // =========================================================
  // 3. LOGIC LƯU DỮ LIỆU (SAVE DATA)
  // =========================================================
  // =========================================================
  // 3. LOGIC LƯU DỮ LIỆU (SAVE DATA) - ĐÃ FIX LỖI NULL CỦA FASTAPI
  // =========================================================
  const handleSave = async (values) => {
    try {
      setLoading(true);

      // 🔥 BƯỚC QUAN TRỌNG: "Rửa sạch" payload trước khi gửi
      // Lọc bỏ toàn bộ các phần tử null/undefined do Form.List của Ant Design sinh ra khi Xóa
      let cleanPayload = { ...values };

      if (cleanPayload.passages) {
        cleanPayload.passages = cleanPayload.passages
          // 1. Lọc mảng passages
          .filter((p) => p !== null && p !== undefined)
          .map((p) => {
            // 2. Lọc mảng groups bên trong mỗi passage
            const cleanGroups = (p.groups || [])
              .filter((g) => g !== null && g !== undefined)
              .map((g) => {
                // 3. Lọc mảng questions bên trong mỗi group
                const cleanQuestions = (g.questions || [])
                  .filter((q) => q !== null && q !== undefined);
                return { ...g, questions: cleanQuestions };
              });
            return { ...p, groups: cleanGroups };
          });
      }

      // Gửi payload đã sạch sẽ 100% xuống Backend
      if (isEditMode) {
        await readingAdminApi.updateTest(id, cleanPayload);
        toast.success("Cập nhật đề thi thành công!");
      } else {
        await readingAdminApi.createTest(cleanPayload);
        toast.success("Tạo đề thi mới thành công!");
      }
      
      // Chuyển hướng về trang quản lý Reading
      navigate('/admin/skills/reading'); 
      
    } catch (error) {
      console.error("Save Test Error:", error);
      const msg = error.response?.data?.detail || "Có lỗi xảy ra khi lưu đề thi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 4. TÍNH NĂNG THÔNG MINH: TỰ ĐỘNG ĐÁNH SỐ THỨ TỰ CÂU HỎI
  // =========================================================
  
  // Hàm 1: Tìm số thứ tự lớn nhất hiện tại và cộng thêm 1 cho câu hỏi mới
  const getNextQuestionNumber = useCallback(() => {
    const passages = form.getFieldValue('passages') || [];
    let maxNumber = 0;
    
    // Quét toàn bộ mảng lồng nhau để tìm question_number bự nhất
    passages.forEach(p => {
      if (p?.groups) {
        p.groups.forEach(g => {
          if (g?.questions) {
            g.questions.forEach(q => {
              // 🔥 FIX LỖI: Ép kiểu dữ liệu về Số Nguyên để không bị lỗi mất số khi ấn Thêm
              const currentNum = parseInt(q?.question_number, 10);
              if (!isNaN(currentNum) && currentNum > maxNumber) {
                maxNumber = currentNum;
              }
            });
          }
        });
      }
    });
    
    return maxNumber + 1; // Trả về số tiếp theo an toàn
  }, [form]);

  // Hàm 2: Sắp xếp lại toàn bộ số thứ tự từ 1 đến N (Dùng khi lỡ xóa 1 câu ở giữa)
  const recalculateAllQuestionNumbers = useCallback(() => {
    const currentValues = form.getFieldsValue();
    let currentNumber = 1;
    
    if (currentValues.passages) {
      currentValues.passages.forEach(p => {
        if (p?.groups) {
          p.groups.forEach(g => {
            if (g?.questions) {
              g.questions.forEach(q => {
                if (q) {
                  // Ghi đè lại số thứ tự hiện tại bằng biến đếm
                  q.question_number = currentNumber++; 
                }
              });
            }
          });
        }
      });
      
      // Cập nhật lại form với mảng đã được đánh số lại
      form.setFieldsValue(currentValues);
      toast.success(`Đã sắp xếp lại số thứ tự từ 1 đến ${currentNumber - 1}`);
    }
  }, [form]);

  return { 
    form, 
    loading, 
    isEditMode, 
    handleSave, 
    navigate,
    getNextQuestionNumber,
    recalculateAllQuestionNumbers
  };
};