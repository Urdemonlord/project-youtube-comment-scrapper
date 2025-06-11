import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Bell, 
  Shield, 
  Save,
  Download,
  Key
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface SettingsState {
  theme: string;
  compactView: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
  weeklyReports: boolean;
  dataRetention: string;
  autoSave: boolean;
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'button';
  value?: boolean | string | number;
  options?: { value: string; label: string }[];
  action?: () => void;
}

const SettingsTab: React.FC = () => {
  const { addNotification } = useAppStore();
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'system',
    compactView: false,
    emailNotifications: true,
    browserNotifications: true,
    weeklyReports: false,
    dataRetention: '30',
    autoSave: true,
  });

  const handleSettingChange = (settingId: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  };

  const handleSave = () => {
    // Simulate saving settings
    setTimeout(() => {      addNotification({
        type: 'success',
        message: 'Your preferences have been updated successfully.',
        read: false,
      });
    }, 500);
  };

  const settingsCategories = [
    {
      title: 'Appearance',
      description: 'Theme, layout, and visual preferences',
      icon: Palette,
      items: [
        {
          id: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color theme',
          type: 'select' as const,
          value: settings.theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ],
        },
        {
          id: 'compactView',
          label: 'Compact View',
          description: 'Use a more condensed layout to fit more content',
          type: 'toggle' as const,
          value: settings.compactView,
        },
      ],
    },
    {
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell,
      items: [
        {
          id: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive updates via email',
          type: 'toggle' as const,
          value: settings.emailNotifications,
        },
        {
          id: 'browserNotifications',
          label: 'Browser Notifications',
          description: 'Show desktop notifications',
          type: 'toggle' as const,
          value: settings.browserNotifications,
        },
        {
          id: 'weeklyReports',
          label: 'Weekly Reports',
          description: 'Get weekly analysis summaries',
          type: 'toggle' as const,
          value: settings.weeklyReports,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      description: 'Data handling and privacy settings',
      icon: Shield,
      items: [
        {
          id: 'dataRetention',
          label: 'Data Retention',
          description: 'How long to keep analysis data (days)',
          type: 'select' as const,
          value: settings.dataRetention,
          options: [
            { value: '7', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' },
            { value: 'forever', label: 'Forever' },
          ],
        },
        {
          id: 'autoSave',
          label: 'Auto-save Results',
          description: 'Automatically save analysis results',
          type: 'toggle' as const,
          value: settings.autoSave,
        },
        {
          id: 'exportData',
          label: 'Export Data',
          description: 'Download all your data',
          type: 'button' as const,
          action: () => {            addNotification({
              type: 'info',
              message: 'Your data export is being prepared...',
              read: false,
            });
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={item.value as boolean}
              onChange={(e) => handleSettingChange(item.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
          </label>
        );

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {item.label}
            </label>            <select
              value={item.value as string}
              onChange={(e) => handleSettingChange(item.id, e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {item.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'button':
        return (
          <button
            onClick={item.action}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your application preferences and settings
          </p>
        </div>
        
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {settingsCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Icon className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                {category.items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {renderSettingItem(item)}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* API Configuration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Key className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              API Configuration
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your API keys and external service integrations
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Security Notice
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your API keys are stored securely. For enhanced security, regularly rotate your keys and ensure they have appropriate restrictions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube API Key Status
              </label>
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 dark:text-green-300">Connected</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Key Rotation
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Never</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsTab;
