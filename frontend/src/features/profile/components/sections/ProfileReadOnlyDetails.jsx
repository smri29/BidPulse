import React from 'react';
import {
  BadgeAlert,
  Calendar,
  Clock3,
  IdCard,
  Link2,
  Mail,
  MapPin,
  Smartphone,
  User,
  Users,
} from 'lucide-react';

import { formatDate, formatDateTime } from '../../formatters';
import ProfileInfoCard from '../ProfileInfoCard';

const ProfileReadOnlyDetails = ({ user }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <ProfileInfoCard label="Date of Birth" value={formatDate(user.dob)} icon={<Calendar size={15} />} />
      <ProfileInfoCard label="Country" value={user.location || 'Not set'} icon={<MapPin size={15} />} />
      <ProfileInfoCard label="Primary Contact" value={user.mobile || 'Not set'} icon={<Smartphone size={15} />} />
      <ProfileInfoCard label="Emergency Contact" value={user.emergencyContact || 'Not provided'} icon={<Users size={15} />} />
      <ProfileInfoCard label="Blood Group" value={user.bloodGroup || 'Not provided'} icon={<BadgeAlert size={15} />} />
      <ProfileInfoCard label="City / State" value={user.cityState || 'Not provided'} icon={<MapPin size={15} />} />
      <ProfileInfoCard label="Postal Code" value={user.postalCode || 'Not provided'} icon={<IdCard size={15} />} />
      <ProfileInfoCard label="Gender" value={user.gender || 'Not provided'} icon={<User size={15} />} />
      <ProfileInfoCard label="Occupation" value={user.occupation || 'Not provided'} icon={<BadgeAlert size={15} />} />
      <ProfileInfoCard label="Secondary Email" value={user.secondaryEmail || 'Not provided'} icon={<Mail size={15} />} />
      <ProfileInfoCard label="NID / Passport Number" value={user.idNumber || 'Not set'} icon={<IdCard size={15} />} />
      <ProfileInfoCard label="Verified On" value={formatDateTime(user.profileVerifiedAt || user.createdAt)} icon={<Clock3 size={15} />} />
    </div>
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Address</p>
      <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">{user.address || 'No address added'}</p>
    </div>
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Preferred Delivery Address</p>
      <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">{user.preferredDeliveryAddress || 'No preferred delivery address added'}</p>
    </div>
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Medical Notes / Allergies</p>
      <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">{user.medicalNotes || 'No medical notes added'}</p>
    </div>
    <div>
      <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">Social Profiles</p>
      {Array.isArray(user.socialProfiles) && user.socialProfiles.length > 0 ? (
        <div className="space-y-3">
          {user.socialProfiles.map((profile, index) => (
            <div key={`${profile.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{profile.name || 'Unnamed profile'}</p>
                <p className="mt-1 break-all text-sm text-slate-600">{profile.link || 'No link added'}</p>
              </div>
              <Link2 size={16} className="shrink-0 text-slate-400" />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">No social profiles added.</p>
      )}
    </div>
  </div>
);

export default ProfileReadOnlyDetails;
