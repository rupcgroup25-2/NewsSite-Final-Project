// ================================================
// ================= AJAX CALLS ===================
// ================================================

let tokenExpiredHandled = false;

// Get authentication token from localStorage
function getAuthToken() {
    return JSON.parse(localStorage.getItem("user")).token;
}

// Generic AJAX call function with authentication and error handling
function ajaxCall(method, api, data, successCB, errorCB) {
    let token;
    try {
        token = getAuthToken();
    }
    catch {
        token = null;
    }
    const ajaxSettings = {
        type: method,
        url: api,
        data: data,
        cache: false,
        contentType: "application/json",
        success: successCB,
        error: function (xhr, status, error) {
            // Handle 401 Unauthorized
            if (xhr.status === 401 && !tokenExpiredHandled) {
                tokenExpiredHandled = true;
                showWarningToast('Your session has expired. Please log in again.', 'Session Expired');
                localStorage.removeItem('user');
                localStorage.removeItem('cachedFollowingUsers');
                window.location.reload(); // Refresh page to show login
                setTimeout(() => window.location.reload(), 100);
                return;
            }

            // Call original error callback function
            if (errorCB) {
                errorCB(xhr, status, error);
            }
        }
    };

    // הוספת Authorization header אם יש טוקן
    if (token != null) {
        ajaxSettings.headers = {
            'Authorization': `Bearer ${token}`
        };
    }

    $.ajax(ajaxSettings);
}