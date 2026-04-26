import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Car, Plus, Clock, CheckCircle, XCircle, IndianRupee, User, MapPin, Calendar as CalendarIcon } from 'lucide-react';
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
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  submittedAt: string;
}

const UserDashboard = () => {
  const { user, token } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, [user, token]);

  const fetchSubmissions = async () => {
    if (!user || !token) return;

    try {
      const data = await apiRequest<Submission[]>(`/api/cars/user/${user.id}`, { token });
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status === filter;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-600 text-white p-2 rounded-lg">
              <Car className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Your Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600">Welcome back, {user?.name}! Track your car submissions and earnings.</p>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-4">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-orange-700 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg"><User className="h-8 w-8" /></div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-orange-100 flex items-center gap-2"><MapPin className="h-4 w-4" /> {user.email}</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-orange-100 text-sm">Account Status</p>
                <p className="text-xl font-bold">Active ✓</p>
              </div>
            </div>
          </div>
        )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Submissions */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Car className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.estimatedPrice, 0).toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <IndianRupee className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <Link
          to="/submit-car"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Submit New Car
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Submissions', count: stats.total },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'rejected', label: 'Rejected', count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl">
        <ul className="divide-y divide-gray-200">
          {filteredSubmissions.length === 0 ? (
            <li className="px-6 py-8 text-center text-gray-500">
              No submissions found.
            </li>
          ) : (
            filteredSubmissions.map((submission) => (
              <li key={submission._id} className="px-6 py-5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {submission.year} {submission.make} {submission.model}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="capitalize">{submission.status}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                      <div className="text-sm">
                        <p className="text-gray-500 text-xs">Mileage</p>
                        <p className="font-semibold text-gray-900">{submission.mileage.toLocaleString()} km</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500 text-xs">Condition</p>
                        <p className="font-semibold text-gray-900 capitalize">{submission.condition}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500 text-xs">Expected</p>
                        <p className="font-semibold text-gray-900">₹{submission.expectedPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500 text-xs">Estimated</p>
                        <p className="font-semibold text-orange-600">₹{submission.estimatedPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    {submission.adminNote && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <strong>💬 Admin Note:</strong> {submission.adminNote}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
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

export default UserDashboard;