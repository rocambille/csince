/* Copyright (C) 2016 Romain Guillemot

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

;(function(){
    let MyMath = {
        middle: function(begin_, end_)
        {
            return Math.floor(
                begin_ + (
                    end_ - begin_
                )/2
            );
        }
    };

    let CSince = {
        cmake_versions: [
            "v3.0",
            "v3.1",
            "v3.2",
            "v3.3",
            "v3.4",
            "v3.5",
            "v3.6",
            "v3.7",
            "v3.8",
            "v3.9",
            "v3.10",
            "v3.11",
            "v3.12",
            "v3.13",
            "v3.14",
            "v3.15",
            "v3.16",
            "v3.17",
            "v3.18",
            "v3.19",
            "v3.20",
            "v3.21",
            "v3.22",
            "v3.23",
            "v3.24",
        ],
        cmake_old_versions: [
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
        ],
        run: function()
        {
            this.init();

            let excluded_features = [
                '',
                'index',
                'cmake.1',
                'ctest.1',
                'cpack.1',
                'cmake-gui.1',
                'ccmake.1',
                'cmake-buildsystem.7',
                'cmake-commands.7',
                'cmake-compile-features.7',
                'cmake-developer.7',
                'cmake-generator-expressions.7',
                'cmake-generators.7',
                'cmake-language.7',
                'cmake-server.7',
                'cmake-modules.7',
                'cmake-packages.7',
                'cmake-policies.7',
                'cmake-properties.7',
                'cmake-qt.7',
                'cmake-toolchains.7',
                'cmake-variables.7',
                'genindex',
                'search'
            ];

            let initial_version_index = this.cmake_versions.indexOf(
                this.initial_version
            );

            if (
                excluded_features.indexOf(this.checked_feature) < 0 &&
                initial_version_index >= 0
            )
            {
                this.insert_csince_version();

                let last_found_version = this.retrieve_version(
                    this.checked_feature
                );

                if (last_found_version)
                {
                    this.print_csince_version(last_found_version);
                }
                else
                {
                    this.print_csince_version(
                        this.initial_version, true
                    );

                    // check v3.0 first, as a pre-test for all modern versions
                    this.check_version_3_0(
                        initial_version_index,
                        function()
                        {
                            CSince.check_version(
                                0,
                                initial_version_index,
                                0 // force checked version
                            );
                        }
                    );
                }
            }
        },
        init: function()
        {
            this.checked_url = location.protocol + '//cmake.org/cmake/help/';
            this.checked_path = location.href.substr(
                this.checked_url.length
            );

            this.initial_version = this.checked_path.substr(
                0, this.checked_path.indexOf('/')
            );

            this.checked_path = this.checked_path.substr(
                this.initial_version.length
            );

            this.checked_feature = this.checked_path.substr(
                this.checked_path.lastIndexOf('/') + 1
            );
            this.checked_feature = this.checked_feature.substr(
                0, this.checked_feature.indexOf('.html')
            );

            let special_versions = [
                "git-stage",
                "git-master",
                "latest"
            ]

            if (special_versions.indexOf(this.initial_version) >= 0)
            {
                this.initial_version = this.cmake_versions[
                    this.cmake_versions.length - 1
                ];
            }
        },
        insert_csince_version: function()
        {
            let h1_element = document.querySelector('h1');

            if (h1_element.textContent != 'Not Found')
            {
                let csince_element = document.createElement('span');
                csince_element.className = 'csince';
                csince_element.textContent = '(CSince checking version...)';

                h1_element.parentNode.insertBefore(
                    csince_element,
                    h1_element.nextSibling
                );
            }
        },
        print_csince_version: function(version_, still_checking = false)
        {
            let csince_element = document.querySelector('.csince');

            csince_element.textContent = '(since ';

            if (still_checking)
            {
                csince_element.textContent += 'at least ';
            }
            else
            {
                this.store_version(this.checked_feature, version_);
            }

            csince_element.textContent += 'CMake ' + version_ + ')';
        },
        store_version: function(feature_, version_)
        {
            if (typeof(Storage) !== "undefined")
            {
                let csince_data = {
                    feature_versions: {}
                };

                if (localStorage.csince)
                {
                    csince_data = JSON.parse(localStorage.csince);
                }

                csince_data.feature_versions[feature_] = version_;

                localStorage.csince = JSON.stringify(csince_data);
            }
        },
        retrieve_version: function(feature_)
        {
            let version = null;

            if (typeof(Storage) !== "undefined" && localStorage.csince)
            {
                csince_data = JSON.parse(localStorage.csince);

                if (
                    csince_data.feature_versions &&
                    csince_data.feature_versions[feature_]
                )
                {
                    version = csince_data.feature_versions[feature_];
                }
            }

            return version;
        },
        check_version_3_0: function(
            checked_version_index_,
            not_version_3_0_
        )
        {
            if (checked_version_index_ == 0)
            {
                // reached v3.0: feature may be present in old versions
                this.check_old_version(
                    0,
                    this.cmake_old_versions.length - 1
                );
            }
            else
            {
                not_version_3_0_();
            }
        },
        check_version: function(
            lower_version_index_,
            upper_version_index_,
            checked_version_index_ = MyMath.middle(
                lower_version_index_, upper_version_index_
            )
        )
        {
            if (lower_version_index_ > upper_version_index_)
            {
                this.check_version_3_0(
                    lower_version_index_,
                    function()
                    {
                        CSince.print_csince_version(
                            CSince.cmake_versions[lower_version_index_]
                        );
                    }
                );
            }
            else
            {
                let checked_version = this.cmake_versions[
                    checked_version_index_
                ];

                let xhttp = new XMLHttpRequest();

                xhttp.onreadystatechange = function()
                {
                    if (this.readyState == 4)
                    {
                        if (this.status == 200)
                        {
                            CSince.print_csince_version(
                                checked_version, true
                            );
                            CSince.check_version(
                                lower_version_index_,
                                checked_version_index_ - 1
                            );
                        }
                        else if (this.status == 404)
                        {
                            CSince.check_version(
                                checked_version_index_ + 1,
                                upper_version_index_
                            );
                        }
                    }
                };

                xhttp.open(
                    'GET',
                    this.checked_url + checked_version + this.checked_path,
                    true
                );
                xhttp.send();
            }
        },
        check_old_version: function(
            lower_version_index_,
            upper_version_index_,
            checked_version_index_ = MyMath.middle(
                lower_version_index_, upper_version_index_
            )
        )
        {
            if (lower_version_index_ > upper_version_index_)
            {
                this.print_csince_version(
                    this.cmake_old_versions[lower_version_index_]
                );
            }
            else
            {
                let checked_version = this.cmake_old_versions[
                    checked_version_index_
                ];

                let xhttp = new XMLHttpRequest();

                let to_open = this.checked_url + "cmake2.6docs.html";

                if (checked_version_index_ >= this.cmake_old_versions.indexOf("v2.8.0"))
                {
                    to_open = this.checked_url + checked_version + "/cmake.html";
                }

                xhttp.onreadystatechange = function()
                {
                    if (this.readyState == 4 && this.status == 200)
                    {
                        if (this.responseText.includes(CSince.checked_feature))
                        {
                            CSince.print_csince_version(
                                checked_version, true
                            );
                            CSince.check_old_version(
                                lower_version_index_,
                                checked_version_index_ - 1
                            );
                        }
                        else if (checked_version_index_ < CSince.cmake_old_versions.length - 1)
                        {
                            CSince.check_old_version(
                                checked_version_index_ + 1,
                                upper_version_index_
                            );
                        }
                        else
                        {
                            // the feature doesn't exist in old versions
                            CSince.print_csince_version(
                                CSince.cmake_versions[0]
                            );
                        }
                    }
                };

                xhttp.open('GET', to_open, true);
                xhttp.send();
            }
        }
    };

    CSince.run();
}());
