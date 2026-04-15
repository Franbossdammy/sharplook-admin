import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { appSettingsService, AppVersionConfig } from '../services/appSettings.service';

const DEFAULT_CONFIG: AppVersionConfig = {
  minimumVersion: '',
  latestVersion: '',
  forceUpdate: false,
  updateMessage: '',
};

export const AppSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<AppVersionConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await appSettingsService.getVersionConfig();
      setConfig(data);
    } catch {
      setErrorMsg('Failed to load app settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await appSettingsService.updateVersionConfig(config);
      setConfig(updated);
      setSuccessMsg('App version settings saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setErrorMsg('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Smartphone className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
          <p className="text-sm text-gray-500">Control the minimum app version and update prompts</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          When <strong>Latest Version</strong> is higher than the user's installed version, they'll see an
          optional update prompt. When <strong>Minimum Version</strong> is higher, the prompt becomes
          mandatory (or forced if <strong>Force Update</strong> is on).
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-700">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700">{errorMsg}</span>
        </div>
      )}

      {/* Version Settings Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Version Control</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Latest Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latest Version
            </label>
            <input
              type="text"
              value={config.latestVersion}
              onChange={(e) => setConfig({ ...config, latestVersion: e.target.value })}
              placeholder="e.g. 2.3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              Users below this version will see an "Update Available" prompt (dismissible).
            </p>
          </div>

          {/* Minimum Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Required Version
            </label>
            <input
              type="text"
              value={config.minimumVersion}
              onChange={(e) => setConfig({ ...config, minimumVersion: e.target.value })}
              placeholder="e.g. 2.2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              Users below this version will see a non-dismissible update modal.
            </p>
          </div>

          {/* Update Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Message
            </label>
            <textarea
              value={config.updateMessage}
              onChange={(e) => setConfig({ ...config, updateMessage: e.target.value })}
              rows={3}
              placeholder="Describe what's new in this version..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>

          {/* Force Update Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-800">Force Update</p>
              <p className="text-xs text-gray-500 mt-0.5">
                When enabled, users cannot dismiss the update modal — they must update to continue.
              </p>
            </div>
            <button
              onClick={() => setConfig({ ...config, forceUpdate: !config.forceUpdate })}
              className="flex-shrink-0 ml-4"
            >
              {config.forceUpdate ? (
                <ToggleRight className="w-10 h-10 text-primary-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-400" />
              )}
            </button>
          </div>

          {config.forceUpdate && (
            <div className="flex items-start space-x-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                <strong>Force Update is ON.</strong> All users on older versions will be blocked until they update from the store.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current State Preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800">Current Live Settings</h2>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Minimum</p>
            <p className="text-xl font-bold text-blue-700 mt-1">{config.minimumVersion || '—'}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-500 font-medium uppercase tracking-wide">Latest</p>
            <p className="text-xl font-bold text-green-700 mt-1">{config.latestVersion || '—'}</p>
          </div>
          <div className={`p-3 rounded-lg ${config.forceUpdate ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${config.forceUpdate ? 'text-red-500' : 'text-gray-500'}`}>
              Force Update
            </p>
            <p className={`text-xl font-bold mt-1 ${config.forceUpdate ? 'text-red-700' : 'text-gray-400'}`}>
              {config.forceUpdate ? 'ON' : 'OFF'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};
