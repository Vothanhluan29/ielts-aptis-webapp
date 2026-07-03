import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { debounce } from 'lodash';

/**
 * Hook to manage auto-saving Ant Design forms to localStorage
 * 
 * @param {string} storageKey - Unique key for the draft (e.g. `aptis-reading-draft-123`)
 * @param {object} form - Ant Design form instance
 */
export const useAutoSaveDraft = (storageKey, form) => {
  const [draftExists, setDraftExists] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isReadyToSave, setIsReadyToSave] = useState(false);
  
  const saveDraftRef = useRef();

  // Create a debounced save function and store it in a ref to avoid recreation
  useEffect(() => {
    saveDraftRef.current = debounce((values) => {
      try {
        const draftData = {
          data: values,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(draftData));
        setLastSavedTime(draftData.timestamp);
        // Do not set draftExists here to prevent banner from popping up during normal editing
      } catch (error) {
        console.error("Failed to save draft to localStorage:", error);
      }
    }, 1500);

    return () => {
      if (saveDraftRef.current) saveDraftRef.current.cancel();
    };
  }, [storageKey]);

  // Check for existing draft on mount or key change
  useEffect(() => {
    if (!storageKey) return;
    
    const draft = localStorage.getItem(storageKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && parsed.data) {
          setDraftExists(true);
          setLastSavedTime(parsed.timestamp);
        }
      } catch (e) {
        localStorage.removeItem(storageKey);
      }
    } else {
      setDraftExists(false);
      setLastSavedTime(null);
    }
  }, [storageKey]);

  // Handle form changes (to be attached to Form's onValuesChange)
  const handleFormChange = useCallback((changedValues, allValues) => {
    if (!isReadyToSave) return;

    // If there is a banner showing but the user decides to just start typing,
    // we assume they want to ignore the old draft and overwrite it.
    // So we hide the banner to keep the UI clean.
    if (draftExists) {
      setDraftExists(false);
    }

    if (saveDraftRef.current) {
      saveDraftRef.current(allValues);
    }
  }, [isReadyToSave, draftExists]);

  // Enable auto-save (call this AFTER initial data is loaded to avoid saving empty/initial state as draft)
  const enableAutoSave = useCallback(() => {
    setIsReadyToSave(true);
  }, []);

  const restoreDraft = useCallback((onRestoreComplete) => {
    const draft = localStorage.getItem(storageKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && parsed.data) {
          form.setFieldsValue(parsed.data);
          setDraftExists(false);
          message.success('Draft restored successfully');
          if (onRestoreComplete) onRestoreComplete(parsed.data);
        }
      } catch (e) {
        message.error('Failed to restore draft');
      }
    }
  }, [storageKey, form]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraftExists(false);
    setLastSavedTime(null);
    if (saveDraftRef.current) saveDraftRef.current.cancel();
  }, [storageKey]);

  return {
    draftExists,
    lastSavedTime,
    isReadyToSave,
    handleFormChange,
    restoreDraft,
    clearDraft,
    enableAutoSave
  };
};
