// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const qrForm = document.getElementById('qr-form');
const urlInput = document.getElementById('url-input');
const qrResult = document.getElementById('qr-result');
const qrCodeImg = document.getElementById('qr-code');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const totalScansElement = document.getElementById('total-scans');
const uniqueVisitorsElement = document.getElementById('unique-visitors');

// Theme Management
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    body.classList.add(savedTheme);
};

const toggleTheme = () => {
    body.classList.toggle('dark-theme');
    const currentTheme = body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', currentTheme);
};

// QR Code Generation
const generateQRCode = async (url) => {
    try {
        const response = await fetch('/api/qr/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        return data.data;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

// Analytics Management
const fetchAnalytics = async (shortId) => {
    try {
        const response = await fetch(`/api/qr/${shortId}`);
        const data = await response.json();
        
        if (data.success) {
            updateAnalyticsDisplay(data.data);
        }
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
};

const updateAnalyticsDisplay = (data) => {
    totalScansElement.textContent = data.totalScans || 0;
    uniqueVisitorsElement.textContent = data.uniqueVisitors || 0;
};

// Download QR Code
const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCodeImg.src;
    link.click();
};

// Share QR Code
const shareQRCode = async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'QR Code',
                text: 'Check out my QR code',
                url: urlInput.value
            });
        } else {
            await navigator.clipboard.writeText(urlInput.value);
            showNotification('URL copied to clipboard!');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        showNotification('Error sharing QR code', 'error');
    }
};

// Notification System
const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);

qrForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    if (!url) {
        showNotification('Please enter a URL', 'error');
        return;
    }

    try {
        const data = await generateQRCode(url);
        qrCodeImg.src = data.qrImage;
        qrResult.classList.remove('hidden');
        
        // Store QR code ID for analytics
        localStorage.setItem('currentQrId', data.shortId);
        
        // Start analytics polling
        startAnalyticsPolling(data.shortId);
        
        showNotification('QR code generated successfully!');
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

downloadBtn.addEventListener('click', downloadQRCode);
shareBtn.addEventListener('click', shareQRCode);

// Analytics Polling
let analyticsInterval;

const startAnalyticsPolling = (shortId) => {
    // Clear existing interval if any
    if (analyticsInterval) {
        clearInterval(analyticsInterval);
    }

    // Initial fetch
    fetchAnalytics(shortId);

    // Set up polling every 30 seconds
    analyticsInterval = setInterval(() => {
        fetchAnalytics(shortId);
    }, 30000);
};

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    }

    .notification.success {
        background-color: var(--success-color, #10B981);
    }

    .notification.error {
        background-color: var(--error-color, #EF4444);
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize theme on page load
initializeTheme();