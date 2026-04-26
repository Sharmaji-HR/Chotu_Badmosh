import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Car, Clock, CheckCircle, XCircle, IndianRupee, Check, X, Trash2 } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface Submission {
  _id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  expectedPrice: number;
  estimatedPrice: number;
  description?: string;
  carImage: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  userId: {
    name: string;
    email: string;
  };
}

interface PartForm {
  name: string;
  category: string;
  carMake: string;
  carModel: string;
  year: string;
  price: string;
  condition: string;
  quantity: string;
  description: string;
}

interface AdminPart {
  _id: string;
  name: string;
  category: string;
  carMake: string;
  carModel: string;
  year: number;
  price: number;
  quantity: number;
  inStock: boolean;
  image?: string;
}

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [partForm, setPartForm] = useState<PartForm>({
    name: '',
    category: '',
    carMake: '',
    carModel: '',
    year: '',
    price: '',
    condition: '',
    quantity: '1',
    description: '',
  });
  const [partImage, setPartImage] = useState<File | null>(null);
  const [savingPart, setSavingPart] = useState(false);
  const [parts, setParts] = useState<AdminPart[]>([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [deletingPartId, setDeletingPartId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchSubmissions = async () => {
    if (!token) return;

    try {
      const data = await apiRequest<Submission[]>('/api/cars', { token });
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;

    const adminNote = prompt('Add an admin note (optional):');

    try {
      await apiRequest(`/api/cars/${id}/approve`, {
        method: 'PUT',
        token,
        body: { adminNote },
      });

      toast.success('Submission approved');
      fetchSubmissions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;

    const adminNote = prompt('Add an admin note (required for rejection):');

    if (!adminNote) {
      toast.error('Admin note is required for rejection');
      return;
    }

    try {
      await apiRequest(`/api/cars/${id}/reject`, {
        method: 'PUT',
        token,
        body: { adminNote },
      });

      toast.success('Submission rejected');
      fetchSubmissions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const [deletingSubmissionId, setDeletingSubmissionId] = useState<string | null>(null);

  const handleDeleteSubmission = async (id: string) => {
    if (!token) return;

    const confirmed = window.confirm('Delete this car submission? This cannot be undone.');
    if (!confirmed) return;

    setDeletingSubmissionId(id);

    try {
      await apiRequest(`/api/cars/${id}`, {
        method: 'DELETE',
        token,
      });

      toast.success('Submission deleted successfully');
      if (selectedSubmission?._id === id) {
        setSelectedSubmission(null);
      }
      fetchSubmissions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the submission');
    } finally {
      setDeletingSubmissionId(null);
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    totalValue: submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.estimatedPrice, 0),
  };

  const handlePartChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPartForm({
      ...partForm,
      [name]: value,
    });
  };

  const fetchParts = async () => {
    setLoadingParts(true);
    try {
      const data = await apiRequest<AdminPart[]>('/api/parts');
      setParts(data);
    } catch (error) {
      console.error('Error fetching parts:', error);
      setParts([]);
    } finally {
      setLoadingParts(false);
    }
  };

  const handleDeletePart = async (id: string) => {
    if (!token) {
      toast.error('Admin token missing. Please log in again.');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to permanently delete this part?');
    if (!confirmed) return;

    setDeletingPartId(id);

    try {
      await apiRequest(`/api/parts/${id}`, {
        method: 'DELETE',
        token,
      });

      toast.success('Part deleted successfully');
      fetchParts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the part');
      console.error('Delete part error:', error);
    } finally {
      setDeletingPartId(null);
    }
  };

  const handleCreatePart = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!partImage) {
      toast.error('Please upload a photo for this part');
      return;
    }
    setSavingPart(true);

    const formData = new FormData();
    formData.append('name', partForm.name);
    formData.append('category', partForm.category);
    formData.append('carMake', partForm.carMake);
    formData.append('carModel', partForm.carModel);
    formData.append('year', partForm.year);
    formData.append('price', partForm.price);
    formData.append('condition', partForm.condition);
    formData.append('quantity', partForm.quantity);
    formData.append('description', partForm.description);
    formData.append('image', partImage);

    try {
      await apiRequest('/api/parts', {
        method: 'POST',
        token,
        body: formData,
      });

      toast.success('Part added successfully');
      setPartForm({
        name: '',
        category: '',
        carMake: '',
        carModel: '',
        year: '',
        price: '',
        condition: '',
        quantity: '1',
        description: '',
      });
      setPartImage(null);
      fetchParts();
    } catch (error) {
      console.error('Error creating part:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred while adding the part');
    } finally {
      setSavingPart(false);
    }
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleCloseDetails = () => {
    setSelectedSubmission(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      <div className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage car submissions and parts</p>
        </div>
        {user && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex items-center gap-4">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-lg">A</div>
            )}
            <div>
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-semibold text-gray-900">{user.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* New Part Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Add New Part</h2>
          <p className="text-gray-600">Create a new part listing with a photo to show on the parts marketplace.</p>
        </div>
        <form onSubmit={handleCreatePart} className="space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="sr-only">Part Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={partForm.name}
                onChange={handlePartChange}
                placeholder="Part Name"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="category" className="sr-only">Category</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  value={partForm.category}
                  onChange={handlePartChange}
                  placeholder="Category"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="condition" className="sr-only">Condition</label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={partForm.condition}
                  onChange={handlePartChange}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="carMake" className="sr-only">Car Make</label>
                <input
                  id="carMake"
                  name="carMake"
                  type="text"
                  required
                  value={partForm.carMake}
                  onChange={handlePartChange}
                  placeholder="Car Make"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="carModel" className="sr-only">Car Model</label>
                <input
                  id="carModel"
                  name="carModel"
                  type="text"
                  required
                  value={partForm.carModel}
                  onChange={handlePartChange}
                  placeholder="Car Model"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="year" className="sr-only">Year</label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  required
                  min="1900"
                  value={partForm.year}
                  onChange={handlePartChange}
                  placeholder="Year"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="price" className="sr-only">Price</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  value={partForm.price}
                  onChange={handlePartChange}
                  placeholder="Price"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="quantity" className="sr-only">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  required
                  min="0"
                  value={partForm.quantity}
                  onChange={handlePartChange}
                  placeholder="Quantity"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="sr-only">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={partForm.description}
                onChange={handlePartChange}
                placeholder="Description"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="partImage" className="sr-only">Part Photo</label>
              <input
                id="partImage"
                name="partImage"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setPartImage(e.target.files ? e.target.files[0] : null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={savingPart}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPart ? 'Saving part...' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>

      {/* Parts Management */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Parts Marketplace</h2>
            <p className="text-gray-600">Review and delete parts listed in the marketplace.</p>
          </div>
          <span className="text-sm text-gray-500">Total parts: {parts.length}</span>
        </div>

        {loadingParts ? (
          <div className="py-12 text-center text-gray-500">Loading parts...</div>
        ) : (
          <div className="space-y-4">
            {parts.length === 0 ? (
              <div className="text-gray-500">No parts available.</div>
            ) : (
              <div className="grid gap-4">
                {parts.map((part) => (
                  <div key={part._id} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{part.name}</p>
                      <p className="text-sm text-gray-600">
                        {part.carMake} {part.carModel} {part.year} • {part.category}
                      </p>
                      <p className="text-sm text-gray-600">₹{part.price} • {part.inStock ? 'In stock' : 'Out of stock'} • Qty: {part.quantity}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePart(part._id)}
                      disabled={deletingPartId === part._id}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deletingPartId === part._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <IndianRupee className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Details Panel */}
      {selectedSubmission && (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-gray-200 bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600 uppercase tracking-[0.16em]">Car submission</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">{selectedSubmission.year} {selectedSubmission.make} {selectedSubmission.model}</h3>
              <p className="mt-1 text-sm text-gray-600">Review the selected car including image, description, and admin actions.</p>
            </div>
            <button
              onClick={handleCloseDetails}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
                <img
                  src={selectedSubmission.carImage}
                  alt={`${selectedSubmission.make} ${selectedSubmission.model}`}
                  className="h-72 w-full object-cover"
                />
              </div>
              <div className="space-y-4 rounded-3xl border border-gray-200 bg-slate-50 p-5">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Submitted by {selectedSubmission.userId.name} ({selectedSubmission.userId.email})</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Condition</p>
                    <p className="mt-2 text-sm font-medium text-gray-900 capitalize">{selectedSubmission.condition}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Mileage</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">{selectedSubmission.mileage.toLocaleString()} miles</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Expected Price</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">₹{selectedSubmission.expectedPrice}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Estimated Price</p>
                    <p className="mt-2 text-sm font-medium text-gray-900">₹{selectedSubmission.estimatedPrice}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Description</p>
                  <p className="mt-2 text-sm text-gray-700">{selectedSubmission.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-gray-500">Submission Status</p>
                <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-gray-900">
                  {selectedSubmission.status}
                </div>
                {selectedSubmission.adminNote && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">Admin note</p>
                    <p className="mt-2">{selectedSubmission.adminNote}</p>
                  </div>
                )}
                <div className="mt-6 space-y-3">
                  {selectedSubmission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedSubmission._id)}
                        className="w-full inline-flex justify-center items-center rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
                      >Approve submission</button>
                      <button
                        onClick={() => handleReject(selectedSubmission._id)}
                        className="w-full inline-flex justify-center items-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                      >Reject submission</button>
                    </>
                  )}
                  {(selectedSubmission.status === 'approved' || selectedSubmission.status === 'rejected') && (
                    <button
                      onClick={() => handleDeleteSubmission(selectedSubmission._id)}
                      disabled={deletingSubmissionId === selectedSubmission._id}
                      className="w-full inline-flex justify-center items-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >{deletingSubmissionId === selectedSubmission._id ? 'Deleting...' : 'Delete submission'}</button>
                  )}
                  <button
                    onClick={handleCloseDetails}
                    className="w-full inline-flex justify-center items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >Close</button>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-gray-500">Submission metadata</p>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <p><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  {selectedSubmission.reviewedAt && <p><strong>Reviewed:</strong> {new Date(selectedSubmission.reviewedAt).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Submissions</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {submissions.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No submissions found.
            </li>
          ) : (
            submissions.map((submission) => (
              <li key={submission._id} className="px-6 py-4 hover:bg-slate-50 transition-colors duration-150">
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => handleSelectSubmission(submission)}
                    className="flex-1 text-left"
                  >
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {submission.year} {submission.make} {submission.model}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          <span className="capitalize">{submission.status}</span>
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <span>Submitted by: {submission.userId.name} ({submission.userId.email})</span>
                        <span className="mx-2">•</span>
                        <span>{submission.mileage.toLocaleString()} miles</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{submission.condition}</span>
                        <span className="mx-2">•</span>
                        <span>Expected: ₹{submission.expectedPrice}</span>
                        <span className="mx-2">•</span>
                        <span>Estimated: ₹{submission.estimatedPrice}</span>
                      </div>
                      {submission.adminNote && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Admin Note:</strong> {submission.adminNote}
                        </div>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center space-x-2 shrink-0">
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(submission._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(submission._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    {(submission.status === 'approved' || submission.status === 'rejected') && (
                      <button
                        onClick={() => handleDeleteSubmission(submission._id)}
                        disabled={deletingSubmissionId === submission._id}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingSubmissionId === submission._id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                    <div className="text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;