import axios from 'axios';

export const exportToPDF = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/export', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'drum-transcription.pdf');
    
    document.body.appendChild(link);
    link.click();
    
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to download PDF.');
  }
};