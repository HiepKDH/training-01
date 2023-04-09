$(document).ready(function () {
    let API_URL = "http://training.mumesoft.com/api/users";
    let TOKEN = "Bearer MBczeFfWzzspy1a1C4bs5mAuDCAbo187x5nfwJls";
    let CONTENT_TYPE = "application/json";
    let pageSize = localStorage.getItem("pageSize") || 5;
    let currentPage = localStorage.getItem("currentPage") || 1;
    let searchQuery = localStorage.getItem("searchQuery") || "";
    let sortOrder = localStorage.getItem("sortOrder") || "+latest_update_at";

    function renderUsers(page, searchQuery = "", sortOrder = "") {
        let apiUrl = `${API_URL}?page=${page}&page_size=${pageSize}&sort=${sortOrder}`;
        if (searchQuery) {
            apiUrl += `&search=${searchQuery}`;
        }
        const headers = {
            Authorization: TOKEN,
            "Content-Type": CONTENT_TYPE,
        };
        fetch(apiUrl, { headers })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                const userList = data.data
                    .filter((user) => {
                        if ($("#status-checkbox").prop("checked")) {
                            return user.is_active;
                        } else if ($("#lock-checkbox").prop("checked")) {
                            return !user.is_active;
                        } else {
                            return true;
                        }
                    })
                    .filter((user) => {
                        return (
                            (user.name &&
                                user.username &&
                                user.email &&
                                user.phone_number &&
                                user.name
                                    .toUpperCase()
                                    .includes(searchQuery.toUpperCase())) ||
                            user.username
                                .toUpperCase()
                                .includes(searchQuery.toUpperCase()) ||
                            user.phone_number
                                ?.toUpperCase()
                                .includes(searchQuery.toUpperCase()) ||
                            user.email
                                ?.toUpperCase()
                                .includes(searchQuery.toUpperCase())
                        );
                    })
                    .map(getUserHtml)
                    .join("");
                $("#user-list").html(userList);

                // Show/hide list-users__status-check based on lock-checkbox
                if ($("#lock-checkbox").prop("checked")) {
                    $(".list-users__status-check [checked]")
                        .closest(".list-users")
                        .hide();
                    $(".list-users__status-check :not([checked])")
                        .closest(".list-users", ".status-lock")
                        .show();
                    $("#lock-icon").toggleClass("locked");
                } else {
                    $(".list-users__status-check")
                        .closest(".list-users")
                        .show();
                }

                // $("#lock-checkbox").click(function () {});

                const totalPages = Math.ceil(data.total / pageSize);
                let paginationHtml = "";
                for (let i = 1; i <= totalPages; i++) {
                    const activeClass = currentPage == i ? "active" : "";
                    paginationHtml += `
            <a href="#" class="page-link__item ${activeClass}" data-page="${i}">${i}</a>
                `;
                }

                $("#pagination").html(paginationHtml);
                // Display current page user count
                const startUserIndex = (currentPage - 1) * pageSize + 1;
                const endUserIndex = startUserIndex + userList.length - 1;
                const totalUsers = data.total;
                const displayedUsers =
                    endUserIndex > totalUsers ? totalUsers : endUserIndex;
                $(".num-users").text(displayedUsers);

                $("#endBtn")
                    .off("click")
                    .on("click", () => {
                        currentPage = totalPages;
                        renderUsers(currentPage, searchQuery, sortOrder);
                        localStorage.setItem("currentPage", currentPage);
                    });

                $(".nextBtn")
                    .off("click")
                    .on("click", () => {
                        if (currentPage < totalPages) {
                            currentPage++;
                            renderUsers(currentPage, searchQuery, sortOrder);
                            localStorage.setItem("currentPage", currentPage);
                        }
                    });
            })
            .catch((error) => console.log(error));
    }

    function getUserHtml(user) {
        return `
        <div class="list-users" id="list-users-item-${user.id}">
            
            <div class="row__item">
                    <div class="row__item-header">
                        <div class="list-users__heading">
                            <div class="list-users__check">
                                <input type="checkbox" class="user-checkbox" data-user-id="${
                                    user.id
                                }">
                            </div>
                        </div>
                        <div class="me-5">
                            <img class="list-users__avatar" src="${
                                user.avatar
                                    ? user.avatar
                                    : getAvatarString(user.gender)
                            }" alt="Avatar">
                        </div>
                    </div>
                <div class="row__item-info row">
                    <div class="col-sm-6 col-lg-3">
                        <div>
                            <div class="p-2 list-users__name line-clamp line-2  break-all" id="update-name">
                             <i class="fa fa-user" title="Tên"></i>
                                ${user.name}
                            </div>
                            <div class="p-2 list-users__user-name line-clamp line-2 break-all" id="update-username">
                            <i class="fa fa-user" title="Tên người dùng"></i>
                                ${user.username}
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3">
                        <div class="p-2 list-users__email line-clamp line-2 break-all" id="update-email">
                        <i class="fa fa-envelope" title="Email"></i>
                            ${user.email}
                        </div>
                        <div class="p-2 list-users__birth-date" id="update-birth-date">
                        <i class="fa fa-calendar" title="Ngày sinh"></i>
                        ${new Date(user.birth_date).toLocaleDateString("vi-VN")}
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3">
                        <div class="p-2 list-users__gender" id="update-gender">
                        <i class="fa fa-venus-mars" title="Giới tính"></i>
                            ${getGenderString(user.gender)}
                        </div>
                        <div class="p-2 list-users__phone_number" id="update-phone_number">
                        <i class="fa-solid fa-phone" title="Số điện thoại"></i>
                            ${user.phone_number}
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3">
                          <div class="list-users__action">
                              <div class="edit-user-btn">
                                  <a href="#!" class="list-users__update">
                                      <i class="fa-regular fa-pen-to-square"></i>
                                          Cập nhật
                                  </a>
                              </div>
                              <div class="delete-user-btn">
                                  <div class="list-users__action-clear">
                                      <i class="fa-solid fa-trash-can" title="Xóa"></i>
                                  </div>
                              </div>
                          </div>
                    </div>
                </div>
                    <div class="list-users__status-check">
                            <label for="status-check-${
                                user.id
                            }" title="Đang hoạt động" ${user.is_active ? "checked" : "hidden"}></label>
                    </div>
            </div>
        </div>
    `;
    }

    renderUsers(currentPage, searchQuery, sortOrder);

    // Click on the title reload user
    $(".header-staff__heading").on("click", function () {
        renderUsers(currentPage);
        $("#user-list").html("");
    });

    // Set default checkbox state from local storage
    const statusCheckboxChecked = localStorage.getItem("statusCheckboxChecked");
    if (statusCheckboxChecked !== null) {
        $("#status-checkbox").prop("checked", statusCheckboxChecked == "true");
    }
    const lockCheckboxChecked = localStorage.getItem("lockCheckboxChecked");
    if (lockCheckboxChecked !== null) {
        $("#lock-checkbox").prop("checked", lockCheckboxChecked == "true");
    }

    $("#status-checkbox").on("change", function () {
        localStorage.setItem("#status-checkbox", "statusCheckboxChecked");
        renderUsers(currentPage, searchQuery, sortOrder);
    });

    $("#lock-checkbox").on("change", function () {
        localStorage.setItem("#lock-checkbox", "lockCheckboxChecked");
        renderUsers(currentPage, searchQuery, sortOrder);
    });

    // handle select onchange event
    $("#employee-count").on("change", function () {
        pageSize = $(this).val();
        currentPage = 1;
        localStorage.setItem("pageSize", pageSize);
        localStorage.setItem("currentPage", currentPage);
        renderUsers(currentPage, searchQuery, sortOrder);
    });

    $("#search-btn").on("click", function (event) {
        event.preventDefault();
        searchQuery = $("#search-input").val().toLowerCase();
        renderUsers(currentPage, searchQuery, sortOrder);
        localStorage.setItem("searchQuery", searchQuery);
        $("#user-list").html("");
    });

    // store user sort selection state
    const SORT_ORDER_KEY = "sortOrder";
    const savedSortOrder = localStorage.getItem(SORT_ORDER_KEY);
    if (savedSortOrder) {
        $("#sort-users").val(savedSortOrder);
    }

    $("#sort-users").on("change", function (event) {
        const sortOrder = event.target.value;
        localStorage.setItem(SORT_ORDER_KEY, sortOrder);
        $(".page-link__item").removeClass("active");
        renderUsers(currentPage, searchQuery, sortOrder);
    });

    // Pagination event listener
    $("#pagination").on("click", ".page-link__item", function (event) {
        event.preventDefault();
        const pageNumber = $(this).attr("data-page");
        if (pageNumber !== currentPage) {
            renderUsers(pageNumber);
            currentPage = pageNumber;
            localStorage.setItem("currentPage", currentPage);
            $(".page-link__item").removeClass("active");
            $(this).addClass("active");
        }
    });

    // handle pagination button clicks
    $("#startBtn").on("click", function () {
        currentPage = 1;
        $(".page-link__item").removeClass("active");
        renderUsers(currentPage, searchQuery, sortOrder);
    });

    $(".prevBtn").on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            renderUsers(currentPage, searchQuery, sortOrder);
            $(".page-link__item").removeClass("active");
        }
    });

    // Load saved data from localStorage
    const savedPageSize = localStorage.getItem("pageSize");
    if (savedPageSize) {
        pageSize = savedPageSize;
        $("#employee-count").val(pageSize);
    }
    const savedCurrentPage = localStorage.getItem("currentPage");
    if (savedCurrentPage) {
        currentPage = savedCurrentPage;
        renderUsers(currentPage, searchQuery, sortOrder);
    }

    // Delete User
    // Hide delete options
    $(document).on("change", ".user-checkbox", function () {
        const deleteStaff = $(".delete-staff");
        if ($(this).is(":checked")) {
            deleteStaff.show();
        } else {
            deleteStaff.hide();
        }
    });

    function deleteUsers(id) {
        const url = `${API_URL}?ids=${id}`;
        const headers = {
            Authorization: TOKEN,
            "Content-Type": CONTENT_TYPE,
        };
        $.ajax({
            url: url,
            type: "DELETE",
            headers,
            success: function () {
                renderUsers(currentPage, searchQuery, sortOrder);
            },
            error: function (xhr, status, error) {
                console.log(`Failed to delete users: ${error}`);
                $("#confirmDeleteModal").modal("hide");
            },
        });
    }

    function handleDeleteBtnClick(event, userId) {
        event.stopPropagation();
        $("#confirmDeleteModal").modal("show");
        $("#confirmDeleteBtn")
            .off("click")
            .on("click", function () {
                deleteUsers([userId]);
                $("#confirmDeleteModal").modal("hide");
            });
    }

    function handleDeleteAllBtnClick(event) {
        event.stopPropagation();
        const selectedUserIds = getSelectedUserIds();
        if (selectedUserIds.length > 0) {
            $("#confirmDeleteModal").modal("show");
            $("#confirmDeleteBtn")
                .off("click")
                .on("click", function () {
                    deleteUsers(selectedUserIds);
                    $(".delete-staff").hide();
                    $("#confirmDeleteModal").modal("hide");
                });
        }
    }

    function handleUncheckAllBtnClick(event) {
        event.stopPropagation();
        $(".delete-staff").hide();
        $(".user-checkbox").prop("checked", false);
    }

    function handleCheckAllBtnClick(event) {
        event.stopPropagation();
        $(".user-checkbox").prop("checked", true);
    }

    $(".delete-btn").on("click", handleDeleteAllBtnClick);

    $(".uncheck-btn").on("click", handleUncheckAllBtnClick);

    $(".select-all-btn").on("click", handleCheckAllBtnClick);

    // Handling delete button click in user list
    $("#user-list").on("click", ".delete-user-btn", function (event) {
        const userId = $(this)
            .closest(".list-users")
            .attr("id")
            .split("-")
            .pop();
        handleDeleteBtnClick(event, userId);
    });

    // Get the user ids of the selected users
    function getSelectedUserIds() {
        const selectedUserIds = [];
        $(".user-checkbox:checked").each(function () {
            selectedUserIds.push($(this).data("userId"));
        });
        return selectedUserIds;
    }

    // Edit user
    function handleUpdateBtnClick(event, id) {
        event.preventDefault();
        $("#updateUserModal").modal("show");
        userId = id.split("-").pop(); // get id user
        const headers = {
            Authorization: TOKEN,
            "Content-Type": CONTENT_TYPE,
        };
        fetch(`${API_URL}/${userId}`, { headers })
            .then((response) => response.json())
            .then((data) => {
                const users = data.data;
                console.log(users);
                const birthDate = new Date(users.birth_date);
                const year = birthDate.getFullYear();
                const month = birthDate.getMonth() + 1;
                const day = birthDate.getDate();
                const formattedDateISO = `${year}-${month
                    .toString()
                    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                $("#birth_date").val(formattedDateISO);
                $("#name").val(users.name);
                $("#username").val(users.username);
                $("#email").val(users.email);
                $("#phone_number").val(users.phone_number);
                $('input[type="radio"][name="gender"]')
                    .filter(`[value="${users.gender}"]`)
                    .prop("checked", true);
                $("#is_active").val(users.is_active);
                $("#role_id").val(users.role_id);
                $("#description").val(users.description);
                $("#avatar").val();
            })
            .catch((error) => console.log(error));
    }

    Validator({
        form: "#form-update-user",
        formGroupSelector: ".form-group",
        errorSelector: ".form-message",
        rules: [
            Validator.isRequired("#name", "Vui lòng nhập tên đầy đủ của bạn"),
            Validator.isEmail("#email"),
            Validator.isRequired(
                "#username",
                "Vui lòng nhập tên người dùng của bạn"
            ),
            Validator.isPhoneNumber("#phone_number"),
        ],
        onSubmit: function () {
            const headers = {
                Authorization: TOKEN,
                "Content-Type": CONTENT_TYPE,
            };
            const reader = new FileReader();
            reader.readAsDataURL($("#avatar").prop("files")[0]);
            reader.onload = function () {
                const base64 = reader.result.split(",")[1];

                fetch(`${API_URL}/${userId}`, {
                    method: "PUT",
                    headers: headers,
                    body: JSON.stringify({
                        name: $("#name").val(),
                        username: $("#username").val(),
                        email: $("#email").val(),
                        phone_number: $("#phone_number").val(),
                        gender: $('input[type="radio"][name="gender"]')
                            .filter(":checked")
                            .val(),
                        is_active: $("#is_active").val(),
                        role_id: $("#role_id").val(),
                        birth_date: $("#birth_date").val(),
                        description: $("#description").val(),
                        avatar: base64,
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(data);
                        $("#updateUserModal").modal("hide");
                        renderUsers(currentPage, searchQuery, sortOrder);
                    })
                    .catch((error) => console.log(error));
            };
        },
    });

    $("#user-list").on("click", ".edit-user-btn", function (event) {
        const userId = $(this)
            .closest(".list-users")
            .attr("id")
            .split("-")
            .pop();
        handleUpdateBtnClick(event, userId);
    });
});

function getGenderString(gender) {
    switch (gender) {
        case 0:
            return "Nam";
        case 1:
            return "Nữ";
        default:
            return "Khác";
    }
}

function getAvatarString(gender) {
    switch (gender) {
        case 0:
            return "./assets/image/default_male.jpg";
        case 1:
            return "./assets/image/default_female.jpg";
        default:
            return "./assets/image/default_other.png";
    }
}
