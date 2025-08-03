let tokenExpiredHandled = false;
function getAuthToken() {
    return JSON.parse(localStorage.getItem("user")).token;
}
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
            // טיפול ב-401 Unauthorized
            if (xhr.status === 401 && !tokenExpiredHandled) {
                tokenExpiredHandled = true;
                showWarningToast('Your session has expired. Please log in again.', 'Session Expired');
                localStorage.removeItem('user');
                localStorage.removeItem('cachedFollowingUsers');
                window.location.reload(); // רענון הדף כדי להראות login
                setTimeout(() => window.location.reload(), 100);
                return;
            }

            // קריאה לפונקציית השגיאה המקורית
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


//function ajaxCall(method, api, data, successCB, errorCB) {
//    const token = getAuthToken();

//    $.ajax({
//        type: method,
//        url: api,
//        data: data,
//        cache: false,
//        contentType: "application/json",
//        //dataType: "json",
//        success: successCB,
//        error: function (xhr, status, error) {
//            // טיפול ב-401 Unauthorized
//            if (xhr.status === 401) {
//                removeAuthToken();
//                alert('Your session has expired. Please log in again.');
//                window.location.reload();
//                return;
//            }

//            if (errorCB) {
//                errorCB(xhr, status, error);
//            }
//        }
//    });
//}