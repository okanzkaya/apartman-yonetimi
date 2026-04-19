const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, method = 'GET', body = null, role = 'adminToken') => {
    const token = localStorage.getItem(role);
    const headers = { 'Content-Type': 'application/json' };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
        localStorage.removeItem(role);
        window.location.href = role === 'adminToken' ? '/admin/login' : '/sakin/login';
        throw new Error('Oturum süresi doldu');
    }

    // Eğer cevap boşsa veya JSON değilse hata fırlatmasını engelle
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) throw new Error(data?.mesaj || 'Bir hata oluştu');
    
    return data;
};