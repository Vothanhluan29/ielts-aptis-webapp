import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import teacherStudentsApi from '../api/teacherStudentsApi';

export function useTeacherStudents() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherStudentsApi.getStudents(0, 100);
      setUsers(response.items || []);
    } catch (error) {
      console.error('Fetch teacher students error:', error);
      message.error('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { users, loading, refresh: fetchStudents };
}
