import React, { useState } from 'react';
import { Form, Input, Radio, Button, Modal, Typography, message } from 'antd';
import { ThunderboltOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const MultipleChoiceAdmin = ({ relativePath, absolutePath, form }) => {
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const handleQuickPaste = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n').filter((line) => line.trim() !== '');
    const newOptions = lines.map((line) =>
      line.trim().replace(/^([a-zA-Z0-9]+)[.)-]\s+/, '')
    );

    form.setFieldValue([...absolutePath, 'options'], newOptions);

    const currentCorrect = form.getFieldValue([...absolutePath, 'correct_answer']);
    if (currentCorrect && parseInt(currentCorrect) >= newOptions.length) {
      form.setFieldValue([...absolutePath, 'correct_answer'], null);
    }

    setIsPasteModalOpen(false);
    setPasteText('');
    message.success(`Auto-filled ${newOptions.length} options!`);
  };

  return (
    <>
      <Form.Item
        label={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <span>Options (Select the correct answer using the radio button)</span>
            <Button
              size="small"
              type="link"
              icon={<ThunderboltOutlined />}
              onClick={() => setIsPasteModalOpen(true)}
              style={{ fontWeight: 'bold' }}
            >
              Quick paste options
            </Button>
          </div>
        }
        required
        style={{ marginBottom: 12 }}
      >
        <Form.Item
          name={[...relativePath, 'correct_answer']}
          noStyle
          rules={[{ required: true, message: 'Please select the correct answer!' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <Form.List name={[...relativePath, 'options']}>
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {fields.map((field, index) => {
                    const letter = String.fromCharCode(65 + index);

                    return (
                      <div
                        key={field.key}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                      >
                        <Radio value={index.toString()} style={{ marginTop: 5 }} />

                        <Form.Item
                          {...field}
                          validateTrigger={['onChange', 'onBlur']}
                          rules={[{ required: true, message: `Enter Option ${letter}` }]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input placeholder={`Option ${letter}`} />
                        </Form.Item>

                        {fields.length > 2 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              remove(field.name);

                              const currentAns = form.getFieldValue([
                                ...absolutePath,
                                'correct_answer',
                              ]);

                              if (currentAns === index.toString()) {
                                form.setFieldValue(
                                  [...absolutePath, 'correct_answer'],
                                  null
                                );
                              } else if (parseInt(currentAns) > index) {
                                form.setFieldValue(
                                  [...absolutePath, 'correct_answer'],
                                  (parseInt(currentAns) - 1).toString()
                                );
                              }
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                  <Button
                    type="dashed"
                    onClick={() => add('')}
                    icon={<PlusOutlined />}
                    style={{ width: '200px', alignSelf: 'flex-start' }}
                  >
                    Add Option
                  </Button>
                </div>
              )}
            </Form.List>
          </Radio.Group>
        </Form.Item>
      </Form.Item>

      <Modal
        title="Quick paste options"
        open={isPasteModalOpen}
        onOk={handleQuickPaste}
        onCancel={() => {
          setIsPasteModalOpen(false);
          setPasteText('');
        }}
        width={500}
        okText="Auto fill"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 10 }}>
          <Text type="secondary">
            Copy options from Word/PDF and paste them here (each option on a new
            line). The system will automatically detect and create the
            corresponding number of options.
          </Text>
        </div>

        <TextArea
          rows={6}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={`Example:\nA. 1990\nB. 1995\nC. 2000\nD. 2005`}
        />
      </Modal>
    </>
  );
};

export default MultipleChoiceAdmin;