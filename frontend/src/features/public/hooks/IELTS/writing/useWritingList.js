import { useState, useEffect, useMemo } from 'react';
import { writingStudentApi } from '../../../api/IELTS/writing/writingStudentApi';

export const useWritingList = () => {
    // Basic states for tests and user interactions
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Added to filter through 'ALL', 'NOT_STARTED', or 'COMPLETED' tabs
    const [filter, setFilter] = useState('ALL');

    // 1. Fetch Data
    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true); // Reset loading indicator when executing call
            try {
                const data = await writingStudentApi.getAllTests();
                // Assure fallback when data returns invalid fields
                setTests(data.filter(t => t.is_published) || []);
            } catch (error) {
                console.error("Failed to load writing tests", error);
                setTests([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    // 2. Filter Logic (Memoized to optimize performance)
    const filteredTests = useMemo(() => {
        return tests.filter(test => {
            // Filters down tests through search terms
            const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());

            // Switch statement controlling which tabs to render out
            let matchesTab = true;
            if (filter === 'NOT_STARTED') {
                matchesTab = test.status === 'NOT_STARTED' || test.status === 'PENDING' || test.status === 'IN_PROGRESS';
            } else if (filter === 'COMPLETED') {
                matchesTab = test.status === 'GRADED' || test.status === 'ERROR' || test.status === 'GRADING';
            }

            return matchesSearch && matchesTab;
        });
    }, [tests, searchTerm, filter]);

    // Added to handle counts rendered directly into the tab selectors
    const stats = useMemo(() => ({
        all: tests.length,
        notStarted: tests.filter(t => t.status === 'NOT_STARTED' || t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
        completed: tests.filter(t => t.status === 'GRADED' || t.status === 'ERROR' || t.status === 'GRADING').length,
    }), [tests]);

    return {
        tests,
        filteredTests,
        loading,
        searchTerm,
        setSearchTerm,
        filter,
        setFilter,
        stats
    };
};