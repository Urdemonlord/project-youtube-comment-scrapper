import fs from 'fs';

(async () => {
  const fd = new FormData();
  fd.append('model', fs.createReadStream('server.js'));
  fd.append('userId', 'test');
  const uploadRes = await fetch('http://localhost:3000/models/upload', { method: 'POST', body: fd });
  console.log('Upload status', uploadRes.status);
  const uploadData = await uploadRes.json();
  console.log(uploadData);
  const id = uploadData.model?.id;

  if (id) {
    const act = await fetch('http://localhost:3000/models/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test', modelId: id })
    });
    console.log('Activate', act.status);
  }
})();
