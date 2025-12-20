import { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Leaf,
  Droplets,
  Layers,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Fields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cropType: 'wheat',
    area: '',
    areaUnit: 'acres',
    soilType: 'loamy',
    irrigationType: 'drip'
  });

  const cropTypes = [
    { value: 'wheat', label: 'Wheat', icon: '🌾' },
    { value: 'rice', label: 'Rice', icon: '🌾' },
    { value: 'corn', label: 'Corn', icon: '🌽' },
    { value: 'cotton', label: 'Cotton', icon: '☁️' },
    { value: 'sugarcane', label: 'Sugarcane', icon: '🎋' },
    { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
    { value: 'fruits', label: 'Fruits', icon: '🍎' },
    { value: 'other', label: 'Other', icon: '🌱' }
  ];

  const soilTypes = [
    { value: 'clay', label: 'Clay' },
    { value: 'sandy', label: 'Sandy' },
    { value: 'loamy', label: 'Loamy' },
    { value: 'silt', label: 'Silt' },
    { value: 'peat', label: 'Peat' },
    { value: 'chalky', label: 'Chalky' }
  ];

  const irrigationTypes = [
    { value: 'drip', label: 'Drip Irrigation', efficiency: '90%' },
    { value: 'sprinkler', label: 'Sprinkler', efficiency: '75%' },
    { value: 'flood', label: 'Flood/Surface', efficiency: '60%' },
    { value: 'furrow', label: 'Furrow', efficiency: '65%' },
    { value: 'center_pivot', label: 'Center Pivot', efficiency: '85%' }
  ];

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchFields = async () => {
    try {
      const response = await api.get('/fields');
      setFields(response.data);
      localStorage.setItem('fields', JSON.stringify(response.data));
    } catch (err) {
      const cached = localStorage.getItem('fields');
      if (cached) {
        setFields(JSON.parse(cached));
      } else {
        setError('Failed to load fields');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingField) {
        await api.put(`/fields/${editingField._id}`, formData);
        setSuccess('Field updated successfully');
      } else {
        await api.post('/fields', formData);
        setSuccess('Field added successfully');
      }
      fetchFields();
      closeModal();
    } catch (err) {
      const newField = { ...formData, _id: Date.now().toString() };
      const cached = JSON.parse(localStorage.getItem('fields') || '[]');
      if (editingField) {
        const updated = cached.map(f => f._id === editingField._id ? { ...f, ...formData } : f);
        localStorage.setItem('fields', JSON.stringify(updated));
        setFields(updated);
      } else {
        localStorage.setItem('fields', JSON.stringify([...cached, newField]));
        setFields([...cached, newField]);
      }
      setSuccess(editingField ? 'Field updated (offline)' : 'Field added (offline)');
      closeModal();
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      cropType: field.cropType,
      area: field.area,
      areaUnit: field.areaUnit,
      soilType: field.soilType,
      irrigationType: field.irrigationType
    });
    setShowModal(true);
  };

  const handleDelete = async (fieldId) => {
    try {
      await api.delete(`/fields/${fieldId}`);
      setSuccess('Field deleted successfully');
      fetchFields();
    } catch (err) {
      const cached = JSON.parse(localStorage.getItem('fields') || '[]');
      const updated = cached.filter(f => f._id !== fieldId);
      localStorage.setItem('fields', JSON.stringify(updated));
      setFields(updated);
      setSuccess('Field deleted (offline)');
    }
  };

  const confirmDelete = (field) => {
    setFieldToDelete(field);
    setShowDeleteDialog(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingField(null);
    setFormData({
      name: '',
      cropType: 'wheat',
      area: '',
      areaUnit: 'acres',
      soilType: 'loamy',
      irrigationType: 'drip'
    });
  };

  const getCropIcon = (cropType) => {
    const crop = cropTypes.find(c => c.value === cropType);
    return crop?.icon || '🌱';
  };

  const getIrrigationEfficiency = (type) => {
    const irrigation = irrigationTypes.find(i => i.value === type);
    return irrigation?.efficiency || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fields</h1>
          <p className="text-gray-600">Manage your farm fields and crops</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Field
        </button>
      </div>

      {error && (
        <div className="fixed top-4 right-4 z-50 w-80 animate-slide-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 flex items-center gap-2.5">
              <div className="bg-red-100 rounded-lg p-1.5 flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm text-gray-800 flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-0.5 bg-red-100">
              <div className="h-full bg-red-500 animate-[shrink_3s_linear]" style={{animation: 'shrink 3s linear forwards'}} />
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-50 w-80 animate-slide-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 flex items-center gap-2.5">
              <div className="bg-green-100 rounded-lg p-1.5 flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-800 flex-1">{success}</p>
              <button onClick={() => setSuccess('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-0.5 bg-green-100">
              <div className="h-full bg-green-500 animate-[shrink_3s_linear]" style={{animation: 'shrink 3s linear forwards'}} />
            </div>
          </div>
        </div>
      )}

      {/* Fields Grid */}
      {fields.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div key={field._id} className="card-hover overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-500 to-success-500 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{getCropIcon(field.cropType)}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(field)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => confirmDelete(field)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-red-500/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{field.name}</h3>
                <p className="text-primary-100 capitalize">{field.cropType}</p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="font-medium text-gray-900">{field.area} {field.areaUnit}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Soil</p>
                      <p className="font-medium text-gray-900 capitalize">{field.soilType}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-600 capitalize">{field.irrigationType.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm font-medium text-success-600">
                    {getIrrigationEfficiency(field.irrigationType)} efficient
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Fields Added</h3>
          <p className="text-gray-600 mb-6">Start by adding your first field to track water usage.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Field
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingField ? 'Edit Field' : 'Add New Field'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., North Field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {cropTypes.map((crop) => (
                      <button
                        key={crop.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, cropType: crop.value })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.cropType === crop.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{crop.icon}</span>
                        <p className="text-xs mt-1 text-gray-600">{crop.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="input"
                      placeholder="10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      name="areaUnit"
                      value={formData.areaUnit}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                      <option value="sqft">Square Feet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Type
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className="input"
                  >
                    {soilTypes.map((soil) => (
                      <option key={soil.value} value={soil.value}>
                        {soil.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Irrigation Type
                  </label>
                  <select
                    name="irrigationType"
                    value={formData.irrigationType}
                    onChange={handleChange}
                    className="input"
                  >
                    {irrigationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({type.efficiency} efficient)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingField ? 'Update Field' : 'Add Field'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => handleDelete(fieldToDelete?._id)}
        title="Delete Field"
        message={`Are you sure you want to delete "${fieldToDelete?.name}"? This action cannot be undone and will also remove all associated water usage records.`}
        confirmText="Delete Field"
        type="danger"
      />
    </div>
  );
};

export default Fields;