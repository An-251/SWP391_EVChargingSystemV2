import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Alert, Descriptions } from 'antd';
import { Car, Battery, Zap } from 'lucide-react';
import { getBrands, getModelsByBrand, getVehicleData } from '../../../../constants/vehicleData';
import { getConnectorOptions } from '../../../../constants/chargingConnectors';

const { Option } = Select;

const VehicleForm = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [vehicleSpec, setVehicleSpec] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      // If editing existing vehicle, try to load specs
      if (initialValues.brand && initialValues.model) {
        const specs = getVehicleData(initialValues.brand, initialValues.model);
        if (specs) {
          setVehicleSpec(specs);
          setSelectedBrand(initialValues.brand);
          setSelectedModel(initialValues.model);
          setAvailableModels(getModelsByBrand(initialValues.brand));
        }
      }
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  // Handle brand selection
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setVehicleSpec(null);
    const models = getModelsByBrand(brand);
    setAvailableModels(models);
    
    // Clear dependent fields
    form.setFieldsValue({
      model: undefined,
      chargingPort: undefined,
      batteryCapacity: undefined,
    });
  };

  // Handle model selection - auto-fill specs
  const handleModelChange = (model) => {
    setSelectedModel(model);
    const specs = getVehicleData(selectedBrand, model);
    if (specs) {
      setVehicleSpec(specs);
      // Auto-fill form with real vehicle specs
      form.setFieldsValue({
        chargingPort: specs.connectorType,
        batteryCapacity: specs.batteryCapacity,
      });
    }
  };

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  const brands = getBrands();
  const connectorOptions = getConnectorOptions();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="space-y-2"
    >
      {/* License Plate */}
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

      {/* ⭐ NEW: Brand Dropdown with real data */}
      <Form.Item
        label={
          <span className="flex items-center">
            <Car className="w-4 h-4 mr-2" />
            Vehicle Brand
          </span>
        }
        name="brand"
        rules={[{ required: true, message: 'Please select vehicle brand' }]}
      >
        <Select 
          placeholder="Select brand (Tesla, VinFast, BYD...)" 
          size="large"
          showSearch
          onChange={handleBrandChange}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {brands.map(brand => (
            <Option key={brand} value={brand}>
              {brand}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* ⭐ NEW: Model Dropdown - depends on brand */}
      <Form.Item
        label="Vehicle Model"
        name="model"
        rules={[{ required: true, message: 'Please select vehicle model' }]}
      >
        <Select 
          placeholder={selectedBrand ? "Select model" : "Select brand first"} 
          size="large"
          showSearch
          disabled={!selectedBrand}
          onChange={handleModelChange}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {availableModels.map(model => (
            <Option key={model} value={model}>
              {model}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* ⭐ Show vehicle specs if model selected */}
      {vehicleSpec && (
        <Alert
          message="Vehicle Specifications"
          description={
            <Descriptions size="small" column={1} className="mt-2">
              <Descriptions.Item label={<span className="flex items-center"><Battery className="w-4 h-4 mr-1" />Battery</span>}>
                {vehicleSpec.batteryCapacity} kWh
              </Descriptions.Item>
              <Descriptions.Item label={<span className="flex items-center"><Zap className="w-4 h-4 mr-1" />Connector</span>}>
                {vehicleSpec.connectorType}
              </Descriptions.Item>
              <Descriptions.Item label="Max Charging Power">
                {vehicleSpec.maxChargingPower} kW
              </Descriptions.Item>
              <Descriptions.Item label="Range (WLTP)">
                {vehicleSpec.range} km
              </Descriptions.Item>
            </Descriptions>
          }
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      {/* ⭐ NEW: Charging Port with real connector types */}
      <Form.Item
        label="Charging Port"
        name="chargingPort"
        rules={[{ required: true, message: 'Please select charging port' }]}
        tooltip={vehicleSpec ? "Auto-filled based on vehicle model" : "Select vehicle model to auto-fill"}
      >
        <Select 
          placeholder="Select charging port type" 
          size="large"
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          options={connectorOptions}
        />
      </Form.Item>

      {/* ⭐ UPDATED: Battery Capacity - auto-filled from vehicle specs */}
      <Form.Item
        label={
          <span className="flex items-center">
            <Battery className="w-4 h-4 mr-2" />
            Battery Capacity (kWh)
          </span>
        }
        name="batteryCapacity"
        rules={[
          { required: true, message: 'Please enter battery capacity' },
          { type: 'number', min: 1, max: 200, message: 'Battery capacity must be between 1-200 kWh' }
        ]}
        tooltip={vehicleSpec ? "Auto-filled based on vehicle model" : "Will be auto-filled when you select model"}
      >
        <InputNumber 
          min={1} 
          max={200} 
          className="w-full" 
          size="large"
          placeholder="e.g., 75"
          addonAfter="kWh"
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
