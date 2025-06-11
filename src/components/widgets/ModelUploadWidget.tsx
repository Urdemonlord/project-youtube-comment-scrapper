import React, { useState, useEffect } from 'react';
import { Upload, Trash2, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface UserModel {
  id: string;
  fileName: string;
  active: number;
}

const ModelUploadWidget: React.FC = () => {
  const { currentUser, addNotification } = useAppStore();
  const userId = currentUser?.id || 'default';
  const [models, setModels] = useState<UserModel[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const fetchModels = async () => {
    const res = await fetch(`/models?userId=${userId}`);
    const data = await res.json();
    setModels(data.models || []);
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('model', file);
    fd.append('userId', userId);
    const res = await fetch('/models/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      addNotification({ type: 'success', message: 'Model uploaded successfully.' });
      setFile(null);
      fetchModels();
    } else {
      addNotification({ type: 'error', message: data.error || 'Upload failed.' });
    }
  };

  const activate = async (id: string) => {
    const res = await fetch('/models/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, modelId: id })
    });
    if (res.ok) {
      addNotification({ type: 'success', message: 'Model activated.' });
      fetchModels();
    }
  };

  const remove = async (id: string) => {
    await fetch(`/models/${id}?userId=${userId}`, { method: 'DELETE' });
    addNotification({ type: 'info', message: 'Model deleted.' });
    fetchModels();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Models</h3>
      <div className="flex items-center space-x-2">
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="flex-1" />
        <button onClick={handleUpload} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1">
          <Upload className="h-4 w-4" /> <span>Upload</span>
        </button>
      </div>
      <ul className="space-y-2">
        {models.map(model => (
          <li key={model.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <span className="text-sm text-gray-800 dark:text-gray-200">{model.fileName}</span>
            <div className="flex items-center space-x-2">
              {model.active ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <button onClick={() => activate(model.id)} className="text-blue-600 text-sm hover:underline">Activate</button>
              )}
              <button onClick={() => remove(model.id)} className="text-red-600 hover:underline">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {models.length === 0 && <p className="text-sm text-gray-500">No models uploaded.</p>}
      </ul>
    </div>
  );
};

export default ModelUploadWidget;
