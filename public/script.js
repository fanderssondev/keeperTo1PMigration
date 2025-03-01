document.getElementById('uploadBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length === 0) {
    alert('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    .catch(() => alert('Conversion failed'));
});

// Drag & Drop support
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  document.getElementById('fileInput').files = files;
});
