import React, { useState } from 'react';
import { Modal, Input, Button, Typography, message, Spin, Tag, Card, Select } from 'antd';
import { BulbOutlined, CopyOutlined } from '@ant-design/icons';
import writingAptisAdminApi from '../../../api/APTIS/writing/writingAptisAdminApi';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const AISuggestionModal = ({ visible, onClose, onCopy }) => {
  const [inputText, setInputText] = useState('');
  const [partContext, setPartContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleSuggest = async () => {
    if (!inputText.trim()) {
      message.warning('Please enter some text to get suggestions.');
      return;
    }

    setLoading(true);
    setSuggestions([]);
    try {
      const res = await writingAptisAdminApi.getAISuggestion(inputText.trim(), partContext);
      // Handle axios wrapper
      const data = res.data || res;
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        message.error('Failed to get suggestions. Please try again.');
      }
    } catch (err) {
      console.error(err);
      message.error('An error occurred while fetching AI suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Copied to clipboard!');
      if (onCopy) onCopy(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        message.success('Copied to clipboard!');
        if (onCopy) onCopy(text);
      } catch (e) {
        message.error('Failed to copy to clipboard.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClose = () => {
    setInputText('');
    setSuggestions([]);
    setPartContext('');
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-indigo-600">
          <BulbOutlined />
          <span>AI Grammar & Vocab Suggestion</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="mb-4 mt-2">
        <Text type="secondary" className="block mb-2 text-sm">
          Paste a sentence here to get natural and advanced rewritten versions.
        </Text>
        <Select
          className="w-full mb-3"
          placeholder="Select Part context (Optional but recommended)"
          value={partContext || undefined}
          onChange={setPartContext}
          allowClear
          options={[
            { label: 'Part 1 (Word-level, 1-5 words)', value: 'Part 1' },
            { label: 'Part 2 (Short text, 20-30 words)', value: 'Part 2' },
            { label: 'Part 3 (Social network, 30-40 words)', value: 'Part 3' },
            { label: 'Part 4 - Informal Email (40-50 words)', value: 'Part 4 (Informal)' },
            { label: 'Part 4 - Formal Email (120-150 words)', value: 'Part 4 (Formal)' },
          ]}
        />
        <TextArea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. He go to school everyday very happy."
          className="mb-3 border-indigo-200"
        />
        <Button 
          type="primary" 
          icon={<BulbOutlined />} 
          onClick={handleSuggest} 
          loading={loading}
          className="bg-indigo-600 w-full font-semibold"
        >
          Ask AI for Suggestions
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center p-6">
          <Spin size="large" />
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
          <Text strong className="text-gray-700">AI Suggestions:</Text>
          {suggestions.map((sug, idx) => (
            <Card size="small" key={idx} className="border border-indigo-100 bg-indigo-50/40 shadow-sm rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <Tag color={sug.type === 'Advanced' ? 'purple' : 'blue'} className="font-semibold px-3 py-0.5 rounded-full">
                  {sug.type}
                </Tag>
                <Button 
                  size="small" 
                  type="primary" ghost
                  icon={<CopyOutlined />} 
                  onClick={() => handleCopy(sug.rewritten_text)}
                  className="text-xs font-semibold"
                >
                  Copy to Feedback
                </Button>
              </div>
              <Paragraph className="text-base font-semibold text-gray-800 mb-2">
                "{sug.rewritten_text}"
              </Paragraph>
              <Text type="secondary" className="text-xs leading-relaxed">
                <span className="font-bold text-gray-600">Explanation:</span> {sug.explanation}
              </Text>
            </Card>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AISuggestionModal;
