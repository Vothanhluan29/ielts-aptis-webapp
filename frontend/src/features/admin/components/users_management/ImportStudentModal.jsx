import React, { useState } from 'react';
import { Modal, Button, Upload, Table, message, Typography } from 'antd';
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Text } = Typography;

const ImportStudentModal = ({ visible, onClose, onImport }) => {
  const [fileList, setFileList] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: 'Class Code', dataIndex: 'class_code', key: 'class_code' },
    { title: 'Student ID', dataIndex: 'student_id', key: 'student_id' },
    { title: 'Full Name', dataIndex: 'full_name', key: 'full_name' },
  ];

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Assuming first row is header
        const rows = jsonData.slice(1).filter(row => row.length > 0);
        
        const parsed = rows.map((row, index) => ({
          key: index,
          class_code: row[0] ? String(row[0]).trim() : null,
          student_id: row[1] ? String(row[1]).trim() : null,
          full_name: row[2] ? String(row[2]).trim() : null,
        }));
        
        // Strict Validation for missing fields
        const invalidRows = parsed.filter(item => !item.class_code || !item.student_id || !item.full_name);
        if (invalidRows.length > 0) {
          message.error(`Found ${invalidRows.length} row(s) with missing data. Please provide Class Code, Student ID, and Full Name for all rows!`);
          setFileList([]);
          return;
        }

        setPreviewData(parsed);
        setFileList([file]);
      } catch (error) {
        message.error("Failed to parse the file. Please ensure it is a valid Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent auto upload
  };

  const handleRemove = () => {
    setFileList([]);
    setPreviewData([]);
  };

  const handleSubmit = async () => {
    if (previewData.length === 0) {
      message.error("No valid data to import");
      return;
    }
    setLoading(true);
    try {
      await onImport(previewData);
      message.success("Import successful");
      setFileList([]);
      setPreviewData([]);
      onClose();
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Import Students"
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="import" 
          type="primary" 
          onClick={handleSubmit} 
          loading={loading}
          disabled={previewData.length === 0}
        >
          Confirm Import
        </Button>,
      ]}
    >
      <div className="mb-4">
        <Text type="secondary">
          Upload an Excel or CSV file. The file should have columns in this exact order: <br/>
          <b>Class Code</b> | <b>Student ID</b> | <b>Full Name</b>
        </Text>
      </div>

      <Upload
        accept=".xlsx,.xls,.csv"
        fileList={fileList}
        beforeUpload={handleUpload}
        onRemove={handleRemove}
        maxCount={1}
      >
        <Button icon={<FileExcelOutlined />}>Select Excel File</Button>
      </Upload>

      {previewData.length > 0 && (
        <div className="mt-4">
          <Text strong>Preview ({previewData.length} records):</Text>
          <Table 
            dataSource={previewData} 
            columns={columns} 
            size="small" 
            pagination={{ pageSize: 5 }}
            className="mt-2"
          />
        </div>
      )}
    </Modal>
  );
};

export default ImportStudentModal;
