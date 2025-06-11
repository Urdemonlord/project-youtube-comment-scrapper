import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Download, 
  Users, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import AnalysisTab from '../tabs/AnalysisTab';
import DashboardTab from '../tabs/DashboardTab';
import ResultsTab from '../tabs/ResultsTab';
import ExportTab from '../tabs/ExportTab';
import UserManagementTab from '../tabs/UserManagementTab';
import SettingsTab from '../tabs/SettingsTab';
import ErrorAnalysisTab from '../tabs/ErrorAnalysisTab';
import NotificationCenter from '../ui/NotificationCenter';
import ProgressIndicator from '../ui/ProgressIndicator';
import 'react-tabs/style/react-tabs.css';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    notifications, 
    scrapingProgress, 
    currentSessionId,
    currentUser 
  } = useAppStore();
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: DashboardTab },
    { id: 'analysis', label: 'Analysis', icon: BarChart3, component: AnalysisTab },
    { id: 'results', label: 'Results', icon: MessageSquare, component: ResultsTab },
    { id: 'export', label: 'Export', icon: Download, component: ExportTab },
    ...(currentUser?.role === 'admin' ? [
      { id: 'users', label: 'Users', icon: Users, component: UserManagementTab },
      { id: 'errors', label: 'Error Analysis', icon: AlertTriangle, component: ErrorAnalysisTab }
    ] : []),
    { id: 'settings', label: 'Settings', icon: Settings, component: SettingsTab },
  ];

  const getCurrentProgress = () => {
    if (!currentSessionId) return null;
    return scrapingProgress[currentSessionId];
  };

  const currentProgress = getCurrentProgress();
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const unreadNotifications = notifications.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  YouTube Comment Analyzer
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI-Powered Sentiment & Toxicity Analysis
                </p>
              </div>
            </div>

            {/* User Info & Notifications */}
            <div className="flex items-center space-x-4">
              {/* Progress Indicator */}
              {currentProgress && (
                <ProgressIndicator 
                  progress={currentProgress}
                  className="hidden md:block"
                />
              )}

              {/* Notifications */}
              <div className="relative">
                <NotificationCenter />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadNotifications}
                  </span>
                )}
              </div>

              {/* User Menu */}
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}`}
                    alt={currentUser.username}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentUser.username}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        {currentProgress && currentProgress.status !== 'idle' && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
            <motion.div 
              className="h-1 bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs 
          selectedIndex={activeTabIndex >= 0 ? activeTabIndex : 0}
          onSelect={(index) => setActiveTab(tabs[index].id)}
          className="react-tabs"
        >
          {/* Tab Navigation */}
          <TabList className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.id}
                  className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  selectedClassName="bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Tab>
              );
            })}
          </TabList>

          {/* Tab Content */}
          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabPanel key={tab.id} className="focus:outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Component />
                </motion.div>
              </TabPanel>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
};

export default MainLayout;
