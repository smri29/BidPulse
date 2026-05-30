/**
 * Module: features/profile/components/sections/ProfileEditForm.jsx
 * Purpose: Presents the Profile Edit Form UI fragment so parent files can stay focused on flow and data.
 */
import React from 'react';
import { Plus, Save } from 'lucide-react';

import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from '../../constants';
import ProfileField from '../ProfileField';

const ProfileEditForm = ({
  formData,
  isLoading,
  onSubmit,
  onInput,
  onSocialInput,
  onAddSocialProfile,
  onRemoveSocialProfile,
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <ProfileField label="Full Name">
        <input name="name" value={formData.name} onChange={onInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      </ProfileField>
      <ProfileField label="Emergency Contact">
        <input name="emergencyContact" value={formData.emergencyContact} onChange={onInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      </ProfileField>
      <ProfileField label="Blood Group">
        <select name="bloodGroup" value={formData.bloodGroup} onChange={onInput} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
          <option value="">Select blood group</option>
          {BLOOD_GROUP_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </ProfileField>
      <ProfileField label="Gender">
        <select name="gender" value={formData.gender} onChange={onInput} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2">
          <option value="">Select gender</option>
          {GENDER_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </ProfileField>
      <ProfileField label="City / State">
        <input name="cityState" value={formData.cityState} onChange={onInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      </ProfileField>
      <ProfileField label="Postal Code">
        <input name="postalCode" value={formData.postalCode} onChange={onInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      </ProfileField>
      <ProfileField label="Occupation">
        <input name="occupation" value={formData.occupation} onChange={onInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      </ProfileField>
      <ProfileField label="Secondary Email">
        <input name="secondaryEmail" value={formData.secondaryEmail} onChange={onInput} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      </ProfileField>
    </div>

    <ProfileField label="Address">
      <textarea name="address" value={formData.address} onChange={onInput} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
    </ProfileField>

    <ProfileField label="Preferred Delivery Address">
      <textarea name="preferredDeliveryAddress" value={formData.preferredDeliveryAddress} onChange={onInput} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
    </ProfileField>

    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Social Profiles</p>
        <button onClick={onAddSocialProfile} className="btn-soft inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-700" type="button">
          <Plus size={14} /> Add
        </button>
      </div>
      <div className="space-y-4">
        {formData.socialProfiles.length > 0 ? (
          formData.socialProfiles.map((profile, index) => (
            <div key={`${index}-${profile.name}`} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
                <ProfileField label="Name">
                  <input
                    value={profile.name}
                    onChange={(event) => onSocialInput(index, 'name', event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Platform name"
                  />
                </ProfileField>
                <ProfileField label="Link">
                  <input
                    value={profile.link}
                    onChange={(event) => onSocialInput(index, 'link', event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Profile URL"
                  />
                </ProfileField>
                <button onClick={() => onRemoveSocialProfile(index)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50" type="button">
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No social profiles added yet.</p>
        )}
      </div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-900">Health Notes</p>
      <ProfileField label="Medical Notes / Allergies">
        <textarea
          name="medicalNotes"
          value={formData.medicalNotes}
          onChange={onInput}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Any important medical notes or allergies"
        />
      </ProfileField>
    </div>

    <button disabled={isLoading} className="btn-premium inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-70" type="submit">
      <Save size={14} /> {isLoading ? 'Saving...' : 'Save Changes'}
    </button>
  </form>
);

export default ProfileEditForm;
