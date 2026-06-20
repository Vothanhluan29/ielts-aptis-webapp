import React, { useState, useEffect } from 'react';
import { Input } from 'antd';

export const BlurInput = ({ value, onChange, onBlur, onPressEnter, ...rest }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e) => {
    if (localValue !== value) {
      if (onChange) onChange(e);
    }
    if (onBlur) onBlur(e);
  };

  const handlePressEnter = (e) => {
    if (localValue !== value) {
      if (onChange) onChange(e);
    }
    if (onPressEnter) onPressEnter(e);
  };

  return (
    <Input
      {...rest}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onPressEnter={handlePressEnter}
    />
  );
};

export const BlurTextArea = ({ value, onChange, onBlur, onPressEnter, ...rest }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e) => {
    if (localValue !== value) {
      if (onChange) onChange(e);
    }
    if (onBlur) onBlur(e);
  };

  const handlePressEnter = (e) => {
    if (localValue !== value) {
      if (onChange) onChange(e);
    }
    if (onPressEnter) onPressEnter(e);
  };

  return (
    <Input.TextArea
      {...rest}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onPressEnter={handlePressEnter}
    />
  );
};
