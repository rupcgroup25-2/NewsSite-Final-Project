function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });
}
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}
