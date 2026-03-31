import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

/* --- LAYOUTS --- */
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

/* --- AUTH --- */
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import StudentProfile from './features/auth/pages/StudentProfile';

/* --- CHOOSE MODE PAGE (TRANG CỔNG CHÀO) --- */
import ModeSelectionPage from './features/auth/pages/ModeSelectionPage'; 

/* --- STUDENT PAGES --- */
import DashboardPage from './features/public/pages/IELTS/dashboard/DashBoardPage';
import DashboardAptisStudentPage from './features/public/pages/APTIS/dashboard/DashboardAptisStudentPage';

// Exam (Full Mock Test)
import ExamListPage from './features/public/pages/IELTS/exam/ExamListPage';
import ExamLobbyPage from './features/public/pages/IELTS/exam/ExamLobbyPage';
import ExamTakingPage from './features/public/pages/IELTS/exam/ExamTakingPage';
import ExamResultPage from './features/public/pages/IELTS/exam/ExamResultPage';
import ExamHistoryPage from './features/public/pages/IELTS/exam/ExamHistoryPage';

// Reading
import ReadingListPageStudent from './features/public/pages/IELTS/reading/ReadingListPage';
import ReadingExamPage from './features/public/pages/IELTS/reading/ReadingExamPage';
import ReadingResultPage from './features/public/pages/IELTS/reading/ReadingResultPage';
import ReadingHistoryPage from './features/public/pages/IELTS/reading/ReadingHistoryPage';

// Listening
import ListeningListPage from './features/public/pages/IELTS/listening/ListeningListPage';
import ListeningExamPage from './features/public/pages/IELTS/listening/ListeningExamPage';
import ListeningResultPage from './features/public/pages/IELTS/listening/ListeningResultPage';
import ListeningHistoryPage from './features/public/pages/IELTS/listening/ListeningHistoryPage';

// Writing
import WritingListPage from './features/public/pages/IELTS/writing/WritingListPage';
import WritingExamPage from './features/public/pages/IELTS/writing/WritingExamPage';
import WritingResultPage from './features/public/pages/IELTS/writing/WritingResultPage';
import WritingHistoryPage from './features/public/pages/IELTS/writing/WritingHistoryPage';

// Speaking
import SpeakingListPage from './features/public/pages/IELTS/speaking/SpeakingListPage';
import SpeakingExamPage from './features/public/pages/IELTS/speaking/SpeakingExamPage';
import SpeakingResultPage from './features/public/pages/IELTS/speaking/SpeakingResultPage';
import SpeakingHistoryPage from './features/public/pages/IELTS/speaking/SpeakingHistoryPage';


//APTIS 

//GRAMMAR & VOCAB
import GrammarVocabAptisListPage from './features/public/pages/APTIS/grammar_vocab/GrammarVocabAptisListPage';
import GrammarVocabLobbyPage from './features/public/pages/APTIS/grammar_vocab/GrammarVocabLobbyPage';
import GrammarVocabExamPage from './features/public/pages/APTIS/grammar_vocab/GrammarVocabExamPage';
import GrammarVocabResultPage from './features/public/pages/APTIS/grammar_vocab/GrammarVocabResultPage';
import GrammarVocabHistoryPage from './features/public/pages/APTIS/grammar_vocab/GrammarVocabHistoryPage';


//LISTENING
import ListeningAptisListPage from './features/public/pages/APTIS/listening/ListeningAptisListPage';
import ListeningAptisLobbyPage from './features/public/pages/APTIS/listening/ListeningAptisLobbyPage';
import ListeningAptisExamPage from './features/public/pages/APTIS/listening/ListeningAptisExamPage';
import ListeningAptisResultPage from './features/public/pages/APTIS/listening/ListeningAptisResultPage';
import ListeningAptisHistoryPage from './features/public/pages/APTIS/listening/ListeningAptisHistoryPage';

//READING
import ReadingAptisListPage from './features/public/pages/APTIS/reading/ReadingAptisListPage';
import ReadingAptisLobbyPage from './features/public/pages/APTIS/reading/ReadingAptisLobbyPage';
import ReadingAptisExamPage from './features/public/pages/APTIS/reading/ReadingAptisExamPage';
import ReadingAptisResultPage from './features/public/pages/APTIS/reading/ReadingAptisResultPage';
import ReadingAptisHistoryPage from './features/public/pages/APTIS/reading/ReadingAptisHistoryPage';

//WRITING
import WritingAptisListPage from './features/public/pages/APTIS/writing/WritingAptisListPage';
import WritingAptisLobbyPage from './features/public/pages/APTIS/writing/WritingAptisLobbyPage';
import WritingAptisExamPage from './features/public/pages/APTIS/writing/WritingAptisExamPage';
import WritingAptisResultPage from './features/public/pages/APTIS/writing/WritingAptisResultPage';
import WritingAptisHistoryPage from './features/public/pages/APTIS/writing/WritingAptisHistoryPage';

//SPEAKING
import SpeakingAptisListPage from './features/public/pages/APTIS/speaking/SpeakingAptisListPage';
import SpeakingAptisLobbyPage from './features/public/pages/APTIS/speaking/SpeakingAptisLobbyPage';
import SpeakingAptisExamPage from './features/public/pages/APTIS/speaking/SpeakingAptisExamPage';
import SpeakingAptisResultPage from './features/public/pages/APTIS/speaking/SpeakingAptisResultPage';
import SpeakingAptisHistoryPage from './features/public/pages/APTIS/speaking/SpeakingAptisHistoryPage';

//EXAM APTIS
import ExamAptisListPage from './features/public/pages/APTIS/exam/ExamAptisListPage';
import ExamAptisLobbyPage from './features/public/pages/APTIS/exam/ExamAptisLobbyPage';
import ExamAptisExamPage from './features/public/pages/APTIS/exam/ExamAptisExamPage';
import ExamAptisResultPage from './features/public/pages/APTIS/exam/ExamAptisResultPage';
import ExamAptisHistoryPage from './features/public/pages/APTIS/exam/ExamAptisHistoryPage';





/* --- ADMIN PAGES --- */
import AdminRoute from './routes/AdminRoute';
import AdminProfilePage from './features/admin/pages/profile/AdminProfilePage';
import AdminDashboardPage from './features/admin/pages/dashboard/AdminDashboardPage';
import UserManagement from './features/admin/pages/users/UserManagement';
import AdminSubmissions from './features/admin/pages/submissions/AdminSubmissionsPage';

// Exam Management
import ExamManagerPage from './features/admin/pages/exam/ExamManagerPage';
import ExamEditPage from './features/admin/pages/exam/ExamEditPage';

// Admin Skills
import ReadingManagerPage from './features/admin/pages/reading/ReadingManagerPage'; 
import ReadingEditPage from './features/admin/pages/reading/ReadingEditPage';

import ListeningManagerPage from './features/admin/pages/listening/ListeningManagerPage';
import ListeningEditPage from './features/admin/pages/listening/ListeningEditPage';

import WritingManagerPage from './features/admin/pages/writing/WritingManagerPage';
import WritingEditPage from './features/admin/pages/writing/WritingEditPage';

import SpeakingManagerPage from './features/admin/pages/speaking/SpeakingManagerPage';
import SpeakingEditPage from './features/admin/pages/speaking/SpeakingEditPage';

import ExamAptisManagerPage from './features/admin/pages/APTIS/exam/ExamAptisManagerPage';
import ExamAptisEditPage from './features/admin/pages/APTIS/exam/ExamAptisEditPage';
import ExamAptisSubmissionsManager from './features/admin/pages/APTIS/exam/ExamAptisSubmissionsManager';
import ExamAptisSubmissionDetailPage from './features/admin/pages/APTIS/exam/ExamAptisSubmissionDetailPage';

import GramVocabManagePage from './features/admin/pages/APTIS/grammar_vocab/GramVocabManagePage';
import GramVocabEditPage from './features/admin/pages/APTIS/grammar_vocab/GramVocabEditPage';

import ListeningAptisManageList from './features/admin/pages/APTIS/listening/ListeningAptisManageList';
import ListeningAptisEditPage from './features/admin/pages/APTIS/listening/ListeningAptisEditPage'; 

import ReadingAptisManagerList from './features/admin/pages/APTIS/reading/ReadingAptisManagerList';
import ReadingAptisEditPage from './features/admin/pages/APTIS/reading/ReadingAptisEditPage'; 

import WritingAptisManagerList from './features/admin/pages/APTIS/writing/WritingAptisManagerList';
import WritingAptisEditPage from './features/admin/pages/APTIS/writing/WritingAptisEditPage'; 
import WritingSubmissionListPage from './features/admin/pages/APTIS/writing/WritingSubmissionListPage';
import WritingGradingDetailPage  from './features/admin/pages/APTIS/writing/WritingGradingDetailPage'; 

import SpeakingAptisManagerList from './features/admin/pages/APTIS/speaking/SpeakingAptisManagerList';
import SpeakingAptisEditPage from './features/admin/pages/APTIS/speaking/SpeakingAptisEditPage'; 
import SpeakingSubmissionListPage from './features/admin/pages/APTIS/speaking/SpeakingSubmissionListPage';
import SpeakingGradingDetailPage from './features/admin/pages/APTIS/speaking/SpeakingGradingDetailPage'; 

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        {/* PUBLIC / AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/choose-mode" element={<ModeSelectionPage />} />

        {/* ================= STUDENT LAYOUT (CHỨA CẢ IELTS VÀ APTIS) ================= */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Sửa đổi: Khi vào gốc '/', tự động đẩy sang trang chọn Mode thay vì auto vào IELTS */}
          <Route index element={<Navigate to="/choose-mode" replace />} />
          
          {/* --- IELTS ROUTES --- */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<StudentProfile />} />
          
          <Route path="exam" element={<ExamListPage />} /> 
          <Route path="exam/lobby/:id" element={<ExamLobbyPage />} /> 
          <Route path="exam/result/:id" element={<ExamResultPage />} />
          <Route path="exam/history" element={<ExamHistoryPage />} />

          <Route path="reading" element={<ReadingListPageStudent />} />
          <Route path="reading/history" element={<ReadingHistoryPage />} />
          <Route path="reading/result/:id" element={<ReadingResultPage />} />

          <Route path="listening" element={<ListeningListPage />} />
          <Route path="listening/history" element={<ListeningHistoryPage />} />
          <Route path="listening/result/:id" element={<ListeningResultPage/>} />

          <Route path="writing" element={<WritingListPage />} />
          <Route path="writing/history" element={<WritingHistoryPage />} />
          <Route path="writing/result/:id" element={<WritingResultPage />} />

          <Route path="speaking" element={<SpeakingListPage />} />
          <Route path="speaking/history" element={<SpeakingHistoryPage />} />
          <Route path="speaking/result/:id" element={<SpeakingResultPage />} />

          {/*  --- APTIS STUDENT ROUTES ---*/}
          <Route path="aptis/dashboard" element={<DashboardAptisStudentPage />} />
          <Route path="aptis/profile" element={<StudentProfile />} /> 

          <Route path="aptis/grammar-vocab" element={<GrammarVocabAptisListPage/>} />
          <Route path="aptis/grammar-vocab/lobby/:id" element={<GrammarVocabLobbyPage />} />
          <Route path="aptis/grammar-vocab/result/:id" element={<GrammarVocabResultPage />} />
          <Route path="aptis/grammar-vocab/history" element={<GrammarVocabHistoryPage />} />

          <Route path="aptis/listening" element={<ListeningAptisListPage />} />
          <Route path="aptis/listening/lobby/:id" element={<ListeningAptisLobbyPage />} />
          <Route path="aptis/listening/result/:id" element={<ListeningAptisResultPage />} />
          <Route path="aptis/listening/history" element={<ListeningAptisHistoryPage />} />

          <Route path="aptis/reading" element={<ReadingAptisListPage />} />
          <Route path="aptis/reading/lobby/:id" element={<ReadingAptisLobbyPage />} />
          <Route path="aptis/reading/result/:id" element={<ReadingAptisResultPage />} />
          <Route path="aptis/reading/history" element={<ReadingAptisHistoryPage />} />

          <Route path="aptis/writing" element={<WritingAptisListPage />} />
          <Route path="aptis/writing/lobby/:id" element={<WritingAptisLobbyPage />} /> {/* ĐÃ SỬA LỖI ĐƯỜNG DẪN */}
          <Route path="aptis/writing/result/:id" element={<WritingAptisResultPage />} />
          <Route path="aptis/writing/history" element={<WritingAptisHistoryPage />} />

          <Route path="aptis/speaking" element={<SpeakingAptisListPage />} />
          <Route path="aptis/speaking/lobby/:id" element={<SpeakingAptisLobbyPage />} />
          <Route path="aptis/speaking/result/:id" element={<SpeakingAptisResultPage />} />
          <Route path="aptis/speaking/history" element={<SpeakingAptisHistoryPage />} />

          <Route path="aptis/exam" element={<ExamAptisListPage />} />
          <Route path="aptis/exam/lobby/:id" element={<ExamAptisLobbyPage />} />
          <Route path="aptis/exam/result/:id" element={<ExamAptisResultPage />} />
          <Route path="aptis/exam/history" element={<ExamAptisHistoryPage />} />
        </Route>

        {/* ================= FULLSCREEN EXAM MODE ================= */}
        {/* IELTS FULLSCREEN */}
        <Route path="/exam/taking/:id" element={<ExamTakingPage />} />
        <Route path="/reading/exam/:id" element={<ReadingExamPage />} />
        <Route path="/listening/exam/:id" element={<ListeningExamPage />} />
        <Route path="/writing/exam/:id" element={<WritingExamPage />} />
        <Route path="/speaking/exam/:id" element={<SpeakingExamPage />} />

        {/* APTIS FULLSCREEN */}
        <Route path="/aptis/exam/taking/:id" element={<ExamAptisExamPage />} />
        <Route path="/aptis/grammar-vocab/taking/:id" element={<GrammarVocabExamPage />} />
        <Route path="/aptis/reading/taking/:id" element={<ReadingAptisExamPage />} />
        <Route path="/aptis/listening/taking/:id" element={<ListeningAptisExamPage />} />
        <Route path="/aptis/writing/taking/:id" element={<WritingAptisExamPage />} />
        <Route path="/aptis/speaking/taking/:id" element={<SpeakingAptisExamPage />} />


        {/* ================= ADMIN LAYOUT ================= */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="aptis/dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<UserManagement/>}/>
            <Route path="aptis/users" element={<UserManagement/>}/>
            <Route path="submissions" element={<AdminSubmissions/>}/>
            <Route path="profile" element={<AdminProfilePage/>}/>
            <Route path="aptis/profile" element={<AdminProfilePage/>}/>

            {/* APTIS GRADING (CHẤM BÀI) */}
            <Route path="aptis/submissions/writing" element={<WritingSubmissionListPage />} />
            <Route path="aptis/submissions/writing/:id" element={<WritingGradingDetailPage />} />
            <Route path="aptis/submissions/speaking" element={<SpeakingSubmissionListPage/>} />
            <Route path="aptis/submissions/speaking/:id" element={<SpeakingGradingDetailPage/>} />

            <Route path="aptis/submissions" element={<ExamAptisSubmissionsManager />} />
            <Route path="aptis/submissions/:id" element={<ExamAptisSubmissionDetailPage />} />

            {/* ADMIN EXAM MANAGEMENT */}
            <Route path="full-tests" element={<ExamManagerPage />} />
            <Route path="full-tests/create" element={<ExamEditPage />} />
            <Route path="full-tests/edit/:id" element={<ExamEditPage />} />
            <Route path="full-tests/result/:id" element={<ExamResultPage />} />

            <Route path="skills/reading" element={<ReadingManagerPage />} /> 
            <Route path="skills/reading/create" element={<ReadingEditPage />} />
            <Route path="skills/reading/edit/:id" element={<ReadingEditPage />} />
            <Route path="skills/reading/result/:id" element={<ReadingResultPage />} />

            <Route path="skills/listening" element={<ListeningManagerPage />} />
            <Route path="skills/listening/create" element={<ListeningEditPage />} />
            <Route path="skills/listening/edit/:id" element={<ListeningEditPage />} />
            <Route path="skills/listening/result/:id" element={<ListeningResultPage />} />

            <Route path="skills/writing" element={<WritingManagerPage />} />
            <Route path="skills/writing/create" element={<WritingEditPage />} />
            <Route path="skills/writing/edit/:id" element={<WritingEditPage />} />
            <Route path="skills/writing/result/:id" element={<WritingResultPage />} />

            <Route path="skills/speaking" element={<SpeakingManagerPage />} />
            <Route path="skills/speaking/create" element={<SpeakingEditPage />} />
            <Route path="skills/speaking/edit/:id" element={<SpeakingEditPage />} />
            <Route path="skills/speaking/result/:id" element={<SpeakingResultPage />} />

            {/* ADMIN APTIS SKILLS */}
            <Route path="aptis/grammar-vocab" element={<GramVocabManagePage />} />
            <Route path="aptis/grammar-vocab/create" element={<GramVocabEditPage />} />
            <Route path="aptis/grammar-vocab/edit/:id" element={<GramVocabEditPage />} />

            <Route path="aptis/listening" element={<ListeningAptisManageList />} />
            <Route path="aptis/listening/create" element={<ListeningAptisEditPage />} />
            <Route path="aptis/listening/edit/:id" element={<ListeningAptisEditPage />} />

            <Route path="aptis/reading" element={<ReadingAptisManagerList />} />
            <Route path="aptis/reading/create" element={<ReadingAptisEditPage />} />
            <Route path="aptis/reading/edit/:id" element={<ReadingAptisEditPage />} />

            <Route path="aptis/writing" element={<WritingAptisManagerList />} />
            <Route path="aptis/writing/create" element={<WritingAptisEditPage />} />
            <Route path="aptis/writing/edit/:id" element={<WritingAptisEditPage />} />

            <Route path="aptis/speaking" element={<SpeakingAptisManagerList />} />
            <Route path="aptis/speaking/create" element={<SpeakingAptisEditPage />} />
            <Route path="aptis/speaking/edit/:id" element={<SpeakingAptisEditPage />} />

            <Route path="aptis/full-tests" element={<ExamAptisManagerPage />} />
            <Route path="aptis/full-tests/create" element={<ExamAptisEditPage />} />
            <Route path="aptis/full-tests/edit/:id" element={<ExamAptisEditPage />} />

          </Route>  
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;