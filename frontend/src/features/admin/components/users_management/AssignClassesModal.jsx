import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Typography, message } from 'antd';

const { Text } = Typography;

const AssignClassesModal = ({ visible, onClose, onAssign, user, availableClasses = [] }) => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.managed_classes) {
      setSelectedClasses(user.managed_classes);
    } else {
      setSelectedClasses([]);
    }
  }, [user, visible]);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await onAssign(user.id, selectedClasses);
      onClose();
    } catch (error) {
      // Handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Assign Classes for ${user?.full_name || 'Teacher'}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Save
        </Button>,
      ]}
    >
      <div className="mb-4">
        <Text type="secondary">
          Select class codes that this teacher will manage. You can also type to add a new class code.
        </Text>
      </div>

      <Select
        mode="tags"
        style={{ width: '100%' }}
        placeholder="e.g. SE1605, SE1606"
        value={selectedClasses}
        onChange={setSelectedClasses}
        tokenSeparators={[',']}
      >
        {availableClasses.map(cls => (
          <Select.Option key={cls} value={cls}>{cls}</Select.Option>
        ))}
      </Select>
    </Modal>
  );
};

export default AssignClassesModal;
