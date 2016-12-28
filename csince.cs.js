/* Copyright (C) 2016 Romain Guillemot

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

var cmake_versions = [
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

var cmake_old_versions = [
    "v2.6",
    "v2.8.0",
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
    "v2.8.12"
];

var h1_elements = document.getElementsByTagName('h1');
var i;
var checking_required = false;

for (i = 0; i < h1_elements.length; ++i)
{
    if (h1_elements[i].textContent != 'Not Found')
    {
        checking_required = true;

        var csince_element = document.createElement('span');
        csince_element.className = 'csince';
        csince_element.textContent = '(CSince checking version...)';

        h1_elements[i].parentNode.insertBefore(
            csince_element,
            h1_elements[i].nextSibling
        );
    }
}

if (checking_required) {
    var checked_url = location.protocol + '//cmake.org/cmake/help/';
    var checked_path = location.href.substr(checked_url.length);

    var initial_version = checked_path.substr(0, checked_path.indexOf('/'));
    checked_path = checked_path.substr(initial_version.length);

    var initial_version_index = cmake_versions.indexOf(initial_version);

    if (initial_version_index < 0)
    {
        // use latest version
        initial_version_index = cmake_versions.length - 1;
    }

    check_version(
        checked_url,
        0,
        initial_version_index,
        checked_path
    );
}

function check_version(
    checked_url_,
    lower_version_index_,
    upper_version_index_,
    checked_path_
)
{
    if (lower_version_index_ > upper_version_index_)
    {
        if (lower_version_index_ == 0)
        {
            // reached v3.0: feature may be present in old versions
            var checked_feature = checked_path.substr(
                checked_path.lastIndexOf('/') + 1
            );
            checked_feature = checked_feature.substr(
                0, checked_feature.indexOf('.html')
            );

            check_old_version(
                checked_url,
                0,
                cmake_old_versions.length - 1,
                checked_feature
            );
        }
        else
        {
            show_since(cmake_versions[lower_version_index_]);
        }
    }
    else
    {
        var current_version_index = Math.floor(
            lower_version_index_ + (
                upper_version_index_ - lower_version_index_
            )/2
        );

        var checked_version = cmake_versions[current_version_index];

        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function()
        {
            if (this.readyState == 4)
            {
                if (this.status == 200)
                {
                    check_version(
                        checked_url_,
                        lower_version_index_,
                        current_version_index-1,
                        checked_path_
                    );
                }
                else if (this.status == 404)
                {
                    check_version(
                        checked_url_,
                        current_version_index+1,
                        upper_version_index_,
                        checked_path_
                    );
                }
            }
        };

        xhttp.open(
            'GET',
            checked_url_ + checked_version + checked_path_,
            true
        );
        xhttp.send();
    }
}

function check_old_version(
    checked_url_,
    lower_version_index_,
    upper_version_index_,
    checked_feature_
)
{
    if (lower_version_index_ > upper_version_index_)
    {
        show_since(cmake_old_versions[lower_version_index_]);
    }
    else
    {
        var current_version_index = Math.floor(
            lower_version_index_ + (
                upper_version_index_ - lower_version_index_
            )/2
        );

        var checked_version = cmake_old_versions[current_version_index];

        var xhttp = new XMLHttpRequest();

        var to_open = checked_url_ + "cmake2.6docs.html";

        if (current_version_index >= cmake_old_versions.indexOf("v2.8.0"))
        {
            to_open = checked_url_ + checked_version + "/cmake.html";
        }

        xhttp.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                if (this.responseText.includes(checked_feature_))
                {
                    check_old_version(
                        checked_url_,
                        lower_version_index_,
                        current_version_index-1,
                        checked_feature_
                    );
                }
                else if (current_version_index < cmake_old_versions.length-1)
                {
                    check_old_version(
                        checked_url_,
                        current_version_index+1,
                        upper_version_index_,
                        checked_feature_
                    );
                }
                else
                {
                    // the feature doesn't exist in old versions
                    show_since(cmake_versions[0]);
                }
            }
        };

        xhttp.open('GET', to_open, true);
        xhttp.send();
    }
}

function show_since(since_version_)
{
    var csince_elements = document.getElementsByClassName('csince');
    var i;

    for (i = 0; i < csince_elements.length; ++i)
    {
        csince_elements[i].textContent =
            '(since CMake ' + since_version_ + ')';
    }
}
