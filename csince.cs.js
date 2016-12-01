var cmake_versions = [
    /*"v2.8.0",
    "v2.8.1",
    "v2.8.2",
    "v2.8.3",
    "v2.8.4",
    "v2.8.5",
    "v2.8.6",
    "v2.8.7",
    "v2.8.8",
    "v2.8.9",
    "v2.8.10",
    "v2.8.11",
    "v2.8.12",*/
    "v3.0",
    "v3.1",
    "v3.2",
    "v3.3",
    "v3.4",
    "v3.5",
    "v3.6",
    "v3.7",
    "latest"
];

var h1_elements = document.getElementsByTagName('h1');
var i;
var checking_required = false;

for (i = 0; i < h1_elements.length; ++i) {
    if (h1_elements[i].innerHTML != 'Not Found') {
        checking_required = true;

        var csince_element = document.createElement('span');
        csince_element.className = 'csince';
        csince_element.innerHTML = '(CSince checking version...)';

        h1_elements[i].appendChild(csince_element);
    }
}

if (checking_required) {
    var checked_url = location.protocol + '//cmake.org/cmake/help/';
    var checked_path = location.href.substr(checked_url.length);

    var initial_version = checked_path.substr(0, checked_path.indexOf('/'));
    checked_path = checked_path.substr(initial_version.length);

    var initial_version_index = cmake_versions.indexOf(initial_version);

    if (initial_version_index < 0) {
        // use latest version
        initial_version_index = cmake_versions.length - 1;
    }

    check_version(
        checked_url,
        Math.floor(initial_version_index/2),
        initial_version_index,
        checked_path
    );
}

function check_version (checked_url_, lower_version_index_, upper_version_index_, checked_path_) {
    if (lower_version_index_ == upper_version_index_) {
        show_since(cmake_versions[lower_version_index_]);
    }
    else {
        var checked_version = cmake_versions[lower_version_index_];

        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    check_version(
                        checked_url_,
                        Math.floor(lower_version_index_/2),
                        lower_version_index_,
                        checked_path_
                    );
                }
                else if (this.status == 404) {
                    check_version(
                        checked_url_,
                        Math.floor(1 + (lower_version_index_ + upper_version_index_)/2),
                        upper_version_index_,
                        checked_path_
                    );
                }
            }
        };

        xhttp.open('GET', checked_url + checked_version + checked_path, true);
        xhttp.send();
    }
}

function show_since(since_version_) {
    var csince_elements = document.getElementsByClassName('csince');
    var i;

    for (i = 0; i < csince_elements.length; ++i) {
        csince_elements[i].innerHTML = '(since CMake ' + since_version_ + ')';
    }
}
