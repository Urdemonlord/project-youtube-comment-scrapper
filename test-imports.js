// Test file to check if all imports work
import('./src/components/tabs/ResultsTab.tsx').then(module => {
  console.log('ResultsTab imported successfully:', !!module.default);
}).catch(err => {
  console.error('Error importing ResultsTab:', err);
});

import('./src/components/layout/MainLayout.tsx').then(module => {
  console.log('MainLayout imported successfully:', !!module.default);
}).catch(err => {
  console.error('Error importing MainLayout:', err);
});
