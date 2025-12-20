import { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Droplets,
  Plus,
  Trash2,
  X,
  Calendar,
  Clock,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const WaterUsage = () => {
  const [records, setRecords] = useState([]);
  const [fields, setFields] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterField, setFilterField] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [formData, setFormData] = useState({
    field: '',
    date: new Date().toISOString().split('T')[0],
    waterUsed: '',
    unit: 'liters',
    duration: '',
    method: 'drip',
    notes: ''
  });

  const methods = [
    { value: 'drip', label: 'Drip Irrigation' },
    { value: 'sprinkler', label: 'Sprinkler' },
    { value: 'flood', label: 'Flood/Surface' },
    { value: 'furrow', label: 'Furrow' },
    { value: 'manual', label: 'Manual' }
  ];

  useEffect(() => {
    fetchData();
  }, [filterField]);

  // Auto-hide messages after 5 seconds
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

  const fetchData = async () => {
    try {
      const [recordsRes, fieldsRes, statsRes] = await Promise.all([
        api.get(`/water${filterField ? `?fieldId=${filterField}` : ''}`),
        api.get('/fields'),
        api.get('/water/stats?period=30')
      ]);
      setRecords(recordsRes.data);
      setFields(fieldsRes.data);
      setStats(statsRes.data);
      localStorage.setItem('waterRecords', JSON.stringify(recordsRes.data));
      localStorage.setItem('fields', JSON.stringify(fieldsRes.data));
    } catch (err) {
      const cachedRecords = localStorage.getItem('waterRecords');
      const cachedFields = localStorage.getItem('fields');
      if (cachedRecords) setRecords(JSON.parse(cachedRecords));
      if (cachedFields) setFields(JSON.parse(cachedFields));
      if (!cachedRecords && !cachedFields) setError('Failed to load data');
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

    if (!formData.field) {
      setError('Please select a field');
      return;
    }

    try {
      await api.post('/water', formData);
      setSuccess('Water usage recorded successfully');
      fetchData();
      closeModal();
    } catch (err) {
      const newRecord = { ...formData, _id: Date.now().toString(), createdAt: new Date().toISOString() };
      const cached = JSON.parse(localStorage.getItem('waterRecords') || '[]');
      localStorage.setItem('waterRecords', JSON.stringify([newRecord, ...cached]));
      setRecords([newRecord, ...cached]);
      setSuccess('Water usage recorded (offline)');
      closeModal();
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/water/${id}`);
      setSuccess('Record deleted successfully');
      fetchData();
    } catch (err) {
      const cached = JSON.parse(localStorage.getItem('waterRecords') || '[]');
      const updated = cached.filter(r => r._id !== id);
      localStorage.setItem('waterRecords', JSON.stringify(updated));
      setRecords(updated);
      setSuccess('Record deleted (offline)');
    }
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteDialog(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      field: fields[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      waterUsed: '',
      unit: 'liters',
      duration: '',
      method: 'drip',
      notes: ''
    });
  };

  const openModal = () => {
    setFormData({
      ...formData,
      field: fields[0]?._id || ''
    });
    setShowModal(true);
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = ['Date', 'Field', 'Crop', 'Water Used', 'Unit', 'Method', 'Duration', 'Notes'];
    const csvData = records.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.field?.name || 'Unknown',
      record.field?.cropType || 'Unknown',
      record.waterUsed,
      record.unit,
      record.method,
      record.duration || '',
      record.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water-usage-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(records.length / recordsPerPage);

  // Chart data
  const chartData = stats?.byMethod?.map(item => ({
    name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1).replace('_', ' '),
    water: item.totalWater,
    count: item.count
  })) || [];

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
          <h1 className="text-2xl font-bold text-gray-900">Water Usage</h1>
          <p className="text-gray-600">Track and manage your irrigation records</p>
        </div>
        <div className="flex items-center space-x-3">
          {records.length > 0 && (
            <button onClick={exportToCSV} className="btn-secondary">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          )}
          <button
            onClick={openModal}
            className="btn-primary"
            disabled={fields.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Usage
          </button>
        </div>
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

      {fields.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Fields Available</h3>
          <p className="text-gray-600 mb-6">You need to add at least one field before logging water usage.</p>
          <a href="/fields" className="btn-primary inline-flex">
            Add Your First Field
          </a>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total (30 days)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.summary?.totalWater?.toLocaleString() || 0}L
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Daily Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats?.summary?.avgDaily || 0)}L
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.summary?.count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Irrigation Method</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px'
                      }}
                      formatter={(value, name) => [
                        name === 'water' ? `${value.toLocaleString()}L` : value,
                        name === 'water' ? 'Water Used' : 'Sessions'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="water" name="Water (L)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Filter and Records Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Usage Records</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterField}
                    onChange={(e) => {
                      setFilterField(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input py-2 text-sm"
                  >
                    <option value="">All Fields</option>
                    {fields.map((field) => (
                      <option key={field._id} value={field._id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {records.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Water Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                                <Droplets className="w-4 h-4 text-primary-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {record.field?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {record.field?.cropType}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-primary-600">
                              {record.waterUsed.toLocaleString()} {record.unit}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                            {record.method?.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {record.duration ? `${record.duration} min` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => confirmDelete(record)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, records.length)} of {records.length} records
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center">
                <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No water usage records found</p>
                <button onClick={openModal} className="text-primary-600 font-medium hover:underline mt-2">
                  Add your first record
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/50" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Log Water Usage</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Field
                  </label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Choose a field...</option>
                    {fields.map((field) => (
                      <option key={field._id} value={field._id}>
                        {field.name} ({field.cropType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Used
                    </label>
                    <input
                      type="number"
                      name="waterUsed"
                      value={formData.waterUsed}
                      onChange={handleChange}
                      className="input"
                      placeholder="1000"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="liters">Liters</option>
                      <option value="gallons">Gallons</option>
                      <option value="cubic_meters">Cubic Meters</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Irrigation Method
                    </label>
                    <select
                      name="method"
                      value={formData.method}
                      onChange={handleChange}
                      className="input"
                    >
                      {methods.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="input"
                      placeholder="30"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input"
                    rows="3"
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    <Droplets className="w-4 h-4 mr-2" />
                    Save Record
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
        onConfirm={() => handleDelete(recordToDelete?._id)}
        title="Delete Water Usage Record"
        message={`Are you sure you want to delete this water usage record for ${recordToDelete?.field?.name || 'Unknown Field'} on ${recordToDelete ? new Date(recordToDelete.date).toLocaleDateString() : ''}?`}
        confirmText="Delete Record"
        type="danger"
      />
    </div>
  );
};

export default WaterUsage;