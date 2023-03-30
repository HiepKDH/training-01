function addUser() {
    const name = document.querySelector('input[name="name"]').value;
    const email = document
        .querySelector('input[name="email"]')
        .value.toLowerCase();
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const password_confirmation = document.querySelector(
        'input[name="password_confirmation"]'
    ).value;
    const birth_date = document.querySelector('input[name="birth_date"]').value;
    const phone_number = document.querySelector(
        'input[name="phone_number"]'
    ).value;
    const gender = document.querySelector('input[name="gender"]').value;
    const is_active = document.getElementById("is_active").value;
    const description = document.querySelector('input[name="password"]').value;
    const avatar = document.querySelector('input[name="avatar"]').value;
    const role_id = document.getElementById("role_id").value;

    const authToken = "5wYlmkDfIpSZpUzEN1viAbzc1ubmBMeaWYh26IAu";
    const newUser = {
        username: username,
        password: password,
        password_confirmation: password_confirmation,
        name: name,
        birth_date: birth_date,
        phone_number: phone_number,
        role_id: role_id,
        gender: gender,
        is_active: is_active,
        email: email,
        description: description,
        avatar: avatar,
    };

    fetch("http://training.mumesoft.com/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            alert("Tạo tài khoản thành công!");
            window.location.href = "user-management.html";
        })
        .catch((error) => {
            console.error(error);
            alert("Tài khoản đã tồn tại. Vui lòng chọn tên người dùng khác.");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    Validator({
        form: "#form-1",
        formGroupSelector: ".form-group",
        errorSelector: ".form-message",
        rules: [
            Validator.isRequired("#name", "Vui lòng nhập tên đầy đủ của bạn"),
            Validator.isEmail("#email"),
            Validator.isRequired(
                "#username",
                "Vui lòng nhập tên người dùng của bạn"
            ),
            Validator.minLength("#password", 6),
            Validator.isRequired("#password_confirmation"),
            Validator.isConfirmed(
                "#password_confirmation",
                function () {
                    return document.querySelector("#form-1 #password").value;
                },
                "Mật khẩu nhập lại không chính xác"
            ),
        ],
        onSubmit: addUser,
    });
});

// Đối tượng `Validator`
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorElement = getParent(
            inputElement,
            options.formGroupSelector
        ).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add(
                "invalid"
            );
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
                "invalid"
            );
        }

        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll("[name]");
                    var formValues = Array.from(enableInputs).reduce(function (
                        values,
                        input
                    ) {
                        switch (input.type) {
                            case "radio":
                                values[input.name] = formElement.querySelector(
                                    'input[name="' + input.name + '"]:checked'
                                );
                                break;
                            case "checkbox":
                                if (!input.matches(":checked")) {
                                    values[input.name] = "";
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case "file":
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    },
                    {});
                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        };

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function (rule) {
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(
                        inputElement,
                        options.formGroupSelector
                    ).querySelector(options.errorSelector);
                    errorElement.innerText = "";
                    getParent(
                        inputElement,
                        options.formGroupSelector
                    ).classList.remove("invalid");
                };
            });
        });
    }
}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || "Vui lòng nhập trường này";
        },
    };
};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)
                ? undefined
                : message || "Trường này phải là email";
        },
    };
};

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min
                ? undefined
                : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        },
    };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue()
                ? undefined
                : message || "Giá trị nhập vào không chính xác";
        },
    };
};
