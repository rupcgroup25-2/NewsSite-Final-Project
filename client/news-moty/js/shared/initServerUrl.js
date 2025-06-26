function isDevEnv() {
    return !(location.host.includes('proj.ruppin.ac.il'));
}

$(document).ready(init);

function init() {

    if (isDevEnv()) {
        port = 7065; //niv's port
        serverUrl = `https://localhost:${port}/api/`;
    }
    else {
        serverUrl = "https://proj.ruppin.ac.il/cgroup2/test2/tar1/api/";
    }
}