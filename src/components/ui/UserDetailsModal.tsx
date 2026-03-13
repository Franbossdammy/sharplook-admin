import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Clock, Star, CheckCircle, XCircle, Briefcase, Package, Wallet, Shield, User as UserIcon, FileText, Image as ImageIcon, Clock3 } from 'lucide-react';
import { User } from '@/types';
import { userService } from '@/services/user.service';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

interface VendorDetails {
  vendor: User;
  services?: any[];
  reviews?: any[];
  stats: {
    totalServices: number;
    activeServices: number;
    totalReviews: number;
    averageRating: number;
    completedBookings: number;
    responseRate: number;
  };
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (user.isVendor) {
          const response: any = await userService.getVendorFullDetails(user._id, {
            includeServices: true,
            includeReviews: true,
            reviewsLimit: 10,
          });
          
          console.log('Raw vendor response:', response);
          
          const details = response.data || response;
          setVendorDetails(details);
          setUserDetails(details.vendor);
          
          console.log('Vendor details:', details);
        } else {
          const response: any = await userService.getUserById(user._id);
          
          console.log('Raw user response:', response);
          
          const userData = response.data?.user || response.user || response.data || response;
          setUserDetails(userData);
          
          console.log('User details:', userData);
        }
      } catch (error: any) {
        console.error('Failed to fetch user details:', error);
        setError(error.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user._id, user.isVendor]);

  const renderAvailabilitySchedule = (schedule: any) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return (
      <div className="grid grid-cols-1 gap-2">
        {days.map((day) => {
          const daySchedule = schedule[day];
          return (
            <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
              {daySchedule?.isAvailable ? (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {daySchedule.from} - {daySchedule.to}
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-400">
                  <XCircle className="w-4 h-4 mr-1" />
                  Closed
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-900">
            {user.isVendor ? 'Vendor Details' : 'User Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-8">
            <Loading size="lg" text="Loading details..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        ) : !userDetails ? (
          <div className="p-8 text-center">
            <p className="text-red-500">No user data available</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* User Profile Card */}
            <Card>
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {userDetails.avatar ? (
                    <img
                      src={userDetails.avatar}
                      alt={userDetails.fullName || userDetails.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary-600">
                      {userDetails.firstName?.[0]?.toUpperCase()}
                      {userDetails.lastName?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">
                    {userDetails.fullName || `${userDetails.firstName} ${userDetails.lastName}`}
                  </h4>
                  <p className="text-sm text-gray-500">ID: {userDetails._id || userDetails.id}</p>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="break-all">{userDetails.email}</span>
                      {userDetails.isEmailVerified ? (
                        <CheckCircle className="w-4 h-4 ml-2 text-green-500 flex-shrink-0" title="Email Verified" />
                      ) : (
                        <XCircle className="w-4 h-4 ml-2 text-gray-400 flex-shrink-0" title="Email Not Verified" />
                      )}
                    </div>
                    {userDetails.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        {userDetails.phone}
                        {userDetails.isPhoneVerified ? (
                          <CheckCircle className="w-4 h-4 ml-2 text-green-500 flex-shrink-0" title="Phone Verified" />
                        ) : (
                          <XCircle className="w-4 h-4 ml-2 text-gray-400 flex-shrink-0" title="Phone Not Verified" />
                        )}
                      </div>
                    )}
                    {userDetails.location && userDetails.location.city && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          {userDetails.location.address && <p>{userDetails.location.address}</p>}
                          <p>
                            {userDetails.location.city}, {userDetails.location.state}
                            {userDetails.location.country && `, ${userDetails.location.country}`}
                          </p>
                          {userDetails.location.coordinates && (
                            <p className="text-xs text-gray-400 mt-1">
                              Coordinates: {userDetails.location.coordinates[1]}, {userDetails.location.coordinates[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                    userDetails.role === 'admin' || userDetails.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-800'
                      : userDetails.role === 'vendor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  <UserIcon className="w-3 h-3 inline mr-1" />
                  {userDetails.role === 'admin' ? 'Admin' : userDetails.role === 'super_admin' ? 'Super Admin' : userDetails.role === 'vendor' ? 'Vendor' : userDetails.role === 'client' ? 'Client' : 'User'}
                </span>
                <span className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize ${
                    userDetails.status === 'active' ? 'bg-green-100 text-green-800' :
                    userDetails.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                    userDetails.status === 'pending_verification' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {userDetails.status?.replace('_', ' ')}
                </span>
                {userDetails.isOnline && (
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    Online
                  </span>
                )}
                {userDetails.hasWithdrawalPin && (
                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    PIN Set
                  </span>
                )}
              </div>
            </Card>

            {/* Account Information */}
            <Card>
              <h5 className="font-semibold text-gray-900 mb-4">Account Information</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined Date
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Last Seen
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {userDetails.lastSeen
                      ? new Date(userDetails.lastSeen).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Never'}
                  </p>
                </div>
                {userDetails.lastLogin && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Last Login
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(userDetails.lastLogin).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet Balance
                  </div>
                  <p className="text-sm font-bold text-primary-600">
                    ₦{(userDetails.walletBalance || 0).toLocaleString()}
                  </p>
                </div>
                {userDetails.referralCode && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      Referral Code
                    </div>
                    <p className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                      {userDetails.referralCode}
                    </p>
                  </div>
                )}
                {userDetails.referredBy && (
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      Referred By
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {typeof userDetails.referredBy === 'string' ? userDetails.referredBy : userDetails.referredBy._id}
                    </p>
                  </div>
                )}
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    Login Attempts
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {userDetails.loginAttempts || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* User Preferences */}
            {userDetails.preferences && (
              <Card>
                <h5 className="font-semibold text-gray-900 mb-4">User Preferences</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(userDetails.preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      {value ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 mr-2" />
                      )}
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Vendor Details Section */}
            {userDetails.isVendor && vendorDetails && (
              <>
                {/* Vendor Business Profile */}
                <Card>
                  <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                    Business Profile
                  </h5>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                      <div className="flex items-center justify-center text-yellow-600 mb-2">
                        <Star className="w-6 h-6 fill-current" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendorDetails.stats.averageRating.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {vendorDetails.stats.totalReviews} reviews
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendorDetails.stats.completedBookings}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="flex items-center justify-center text-blue-600 mb-2">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {vendorDetails.stats.activeServices}/{vendorDetails.stats.totalServices}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Services</p>
                    </div>
                  </div>

                  {userDetails.vendorProfile && (
                    <div className="space-y-4">
                      {/* Business Info */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Business Name</p>
                          <p className="font-semibold text-gray-900">
                            {userDetails.vendorProfile.businessName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Vendor Type</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {userDetails.vendorProfile.vendorType?.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Service Radius</p>
                          <p className="font-medium text-gray-900">
                            {userDetails.vendorProfile.serviceRadius} km
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="flex items-center mt-1">
                            {userDetails.vendorProfile.isVerified ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600 font-semibold">Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600">Not Verified</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Business Description */}
                      {userDetails.vendorProfile.businessDescription && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Business Description</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {userDetails.vendorProfile.businessDescription}
                          </p>
                        </div>
                      )}

                      {/* Categories */}
                      {userDetails.vendorProfile.categories && userDetails.vendorProfile.categories.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {userDetails.vendorProfile.categories.map((category: any) => (
                              <span
                                key={category._id}
                                className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full flex items-center"
                              >
                                {category.icon && (
                                  <img src={category.icon} alt="" className="w-4 h-4 mr-1" />
                                )}
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Verification Date */}
                      {userDetails.vendorProfile.verificationDate && (
                        <div>
                          <p className="text-sm text-gray-600">Verified On</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(userDetails.vendorProfile.verificationDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}

                      {/* Documents */}
                      {userDetails.vendorProfile.documents && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Documents</p>
                          <div className="space-y-2">
                            {userDetails.vendorProfile.documents.idCard && (
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm font-medium text-gray-700">ID Card</span>
                                </div>
                                <a
                                  href={userDetails.vendorProfile.documents.idCard}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary-600 hover:text-primary-700"
                                >
                                  View
                                </a>
                              </div>
                            )}
                            {userDetails.vendorProfile.documents.businessLicense && (
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm font-medium text-gray-700">Business License</span>
                                </div>
                                <a
                                  href={userDetails.vendorProfile.documents.businessLicense}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary-600 hover:text-primary-700"
                                >
                                  View
                                </a>
                              </div>
                            )}
                            {userDetails.vendorProfile.documents.certification && userDetails.vendorProfile.documents.certification.length > 0 && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm font-medium text-gray-700">Certifications ({userDetails.vendorProfile.documents.certification.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2 ml-6">
                                  {userDetails.vendorProfile.documents.certification.map((cert: string, index: number) => (
                                    <a
                                      key={index}
                                      href={cert}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary-600 hover:text-primary-700"
                                    >
                                      Cert {index + 1}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                {/* Availability Schedule */}
                {userDetails.vendorProfile?.availabilitySchedule && (
                  <Card>
                    <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock3 className="w-5 h-5 mr-2 text-primary-600" />
                      Availability Schedule
                    </h5>
                    {renderAvailabilitySchedule(userDetails.vendorProfile.availabilitySchedule)}
                  </Card>
                )}

                {/* Services */}
                {vendorDetails.services && vendorDetails.services.length > 0 && (
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-semibold text-gray-900">Services</h5>
                      <span className="text-sm text-gray-500">
                        {vendorDetails.services.length} total
                      </span>
                    </div>
                    <div className="space-y-4">
                      {vendorDetails.services.map((service: any) => (
                        <div
                          key={service._id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h6 className="font-semibold text-gray-900">{service.name}</h6>
                              <p className="text-xs text-gray-500 mt-1">
                                {service.slug} • Created {new Date(service.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-primary-600 text-lg">
                                ₦{service.basePrice?.toLocaleString()}
                              </p>
                              <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full font-medium ${
                                  service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                                }`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          {service.description && (
                            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span className="ml-1 font-medium text-gray-900">{service.duration} min</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Type:</span>
                              <span className="ml-1 font-medium text-gray-900 capitalize">{service.priceType}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Views:</span>
                              <span className="ml-1 font-medium text-gray-900">{service.metadata?.views || 0}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Bookings:</span>
                              <span className="ml-1 font-medium text-gray-900">{service.metadata?.bookings || 0}</span>
                            </div>
                          </div>

                          {service.category && (
                            <div className="mb-3">
                              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                {service.category.icon && (
                                  <img src={service.category.icon} alt="" className="w-3 h-3 mr-1" />
                                )}
                                {service.category.name}
                              </span>
                            </div>
                          )}

                          {service.images && service.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto">
                              {service.images.map((img: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Service ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded border border-gray-200"
                                />
                              ))}
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded ${
                                  service.approvalStatus === 'approved' ? 'bg-green-50 text-green-700' :
                                  service.approvalStatus === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-red-50 text-red-700'
                                }`}>
                                {service.approvalStatus}
                              </span>
                              {service.approvedAt && (
                                <span>Approved: {new Date(service.approvedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Reviews */}
                {vendorDetails.reviews && vendorDetails.reviews.length > 0 ? (
                  <Card>
                    <h5 className="font-semibold text-gray-900 mb-4">Recent Reviews</h5>
                    <div className="space-y-4">
                      {vendorDetails.reviews.map((review: any) => (
                        <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                {review.reviewer?.avatar ? (
                                  <img
                                    src={review.reviewer.avatar}
                                    alt={review.reviewer.firstName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm font-medium text-primary-600">
                                    {review.reviewer?.firstName?.[0]}
                                    {review.reviewer?.lastName?.[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {review.reviewer?.firstName} {review.reviewer?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                              <span className="text-sm font-semibold text-gray-900">{review.rating}</span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-700 ml-13">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : vendorDetails.reviews && (
                  <Card>
                    <h5 className="font-semibold text-gray-900 mb-2">Reviews</h5>
                    <p className="text-sm text-gray-500">No reviews yet</p>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};