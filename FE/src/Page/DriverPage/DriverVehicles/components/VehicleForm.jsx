import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button } from 'antd';

const { Option } = Select;

const VehicleForm = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-2"
    >
      <Form.Item
        label="Vehicle Model"
        name="model"
        rules={[{ required: true, message: 'Please enter vehicle model' }]}
      >
        <Input 
          placeholder="e.g., Tesla Model 3, VinFast VF8" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="License Plate"
        name="licensePlate"
        rules={[
          { required: true, message: 'Please enter license plate' },
          { pattern: /^[0-9]{2}[A-Z]-[0-9]{3,5}$/, message: 'Format: 29A-12345' }
        ]}
      >
        <Input 
          placeholder="e.g., 29A-12345" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Battery Capacity (kWh)"
        name="batteryCapacity"
        rules={[{ required: true, message: 'Please enter battery capacity' }]}
      >
        <InputNumber 
          min={1} 
          max={200} 
          className="w-full" 
          size="large"
          placeholder="e.g., 75"
        />
      </Form.Item>

      <Form.Item
        label="Connector Type"
        name="connectorType"
        rules={[{ required: true, message: 'Please select connector type' }]}
      >
        <Select placeholder="Select connector type" size="large">
          <Option value="CCS">CCS (Combined Charging System)</Option>
          <Option value="CHAdeMO">CHAdeMO</Option>
          <Option value="Type2">Type 2 (Mennekes) - AC</Option>
          <Option value="Type1">Type 1 (J1772) - AC</Option>
          <Option value="Tesla">Tesla Supercharger</Option>
          <Option value="GB/T">GB/T (Chinese Standard)</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Color (Optional)"
        name="color"
      >
        <Input 
          placeholder="e.g., White, Black, Red" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Manufacturing Year (Optional)"
        name="year"
      >
        <InputNumber 
          min={2000} 
          max={2030} 
          className="w-full" 
          size="large"
          placeholder="e.g., 2024"
        />
      </Form.Item>

      <div className="flex space-x-2 justify-end pt-4">
        <Button onClick={onCancel} size="large">
          Cancel
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          size="large"
        >
          {initialValues ? 'Update Vehicle' : 'Add Vehicle'}
        </Button>
      </div>
    </Form>
  );
};

export default VehicleForm;
