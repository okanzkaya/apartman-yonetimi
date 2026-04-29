const API_BASE_URL = 'https://apartman-yonetimi-production.up.railway.app/api';

export const apiCall = async (endpoint, method = 'GET', body = null, role = 'adminToken') => {
    const token = localStorage.getItem(role);
    const headers = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Eğer body FormData değilse JSON olarak ayarla (Dosya yükleme çakışmasını önler)
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const config = { method, headers };
    if (body) config.body = body instanceof FormData ? body : JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
        localStorage.removeItem(role);
        window.location.href = role === 'adminToken' ? '/admin/login' : '/sakin/login';
        throw new Error('Oturum süresi doldu');
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    
    if (isJson) {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.mesaj || 'Bir hata oluştu');
        return data;
    } else {
        if (!response.ok) throw new Error('Bir hata oluştu');
        return response; // Dosya indirme işlemleri için raw response döner
    }
};

// Dosya indirme fonksiyonu eklendi
export const downloadFile = async (endpoint, filename, role = 'adminToken') => {
    try {
        const response = await apiCall(endpoint, 'GET', null, role);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        throw new Error('Dosya indirilirken hata oluştu.');
    }
};