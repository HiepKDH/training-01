$(document).ready(function () {
    let API_URL = "http://training.mumesoft.com/api/users";
    let TOKEN = "Bearer MBczeFfWzzspy1a1C4bs5mAuDCAbo187x5nfwJls";
    let CONTENT_TYPE = "application/json";
    let pageSize = localStorage.getItem("pageSize") || 5;
    let currentPage = localStorage.getItem("currentPage") || 1;
    let searchQuery = localStorage.getItem("searchQuery") || "";
    let sortOrder = localStorage.getItem("sortOrder") || "+latest_update_at";

    function fetchUsers(page, searchQuery = "", sortOrder = "") {
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
                        return $("#status-checkbox").prop("checked")
                            ? user.is_active
                            : true;
                    })
                    .filter((user) => {
                        return (
                            (user.name &&
                                user.username &&
                                user.email &&
                                user.phone_number &&
                                user.name
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())) ||
                            user.username
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                            user.phone_number
                                ?.toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                            user.email
                                ?.toLowerCase()
                                .includes(searchQuery.toLowerCase())
                        );
                    })
                    .map(getUserHtml)
                    .join("");
                $("#user-list").html(userList);

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
                        fetchUsers(currentPage, searchQuery, sortOrder);
                        localStorage.setItem("currentPage", currentPage);
                    });

                $(".nextBtn")
                    .off("click")
                    .on("click", () => {
                        if (currentPage < totalPages) {
                            currentPage++;
                            fetchUsers(currentPage, searchQuery, sortOrder);
                            localStorage.setItem("currentPage", currentPage);
                        }
                    });
            })
            .catch((error) => console.log(error));
    }

    function getUserHtml(user) {
        return `
        <div class="list-users" id="list-users-item-${user.id}">
            <div class="list-users__heading">
                <div class="list-users__check">
                <input type="checkbox" class="user-checkbox" data-user-id="${
                    user.id
                }">
                    
                </div>
            </div>
            <div class="row__item">
                <div class="me-5">
                    <img class="list-users__avatar" src="${
                        user.avatar ? user.avatar : getAvatarString(user.gender)
                    }" alt="Avatar">
                </div>
                <div class="row__item-info row g-3">
                    <div class="col-sm-6 col-xl-4">
                        <div class="list-users__name line-clamp line-2  break-all" id="update-name">
                         <i class="fa fa-user" title="Tên"></i>
                            ${user.name}
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-4">
                        <div class="list-users__user-name line-clamp line-2 break-all" id="update-username">
                        <i class="fa fa-user" title="Tên người dùng"></i>
                            ${user.username}
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-4">
                        <div class="list-users__email line-clamp line-2 break-all" id="update-email">
                        <i class="fa fa-envelope" title="Email"></i>
                            ${user.email}
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-4">
                        <div class="list-users__birth-date" id="update-birth-date">
                        <i class="fa fa-calendar" title="Ngày sinh"></i>
                        ${new Date(user.birth_date).toLocaleDateString("vi-VN")}
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-4">
                        <div class="list-users__gender" id="update-gender">
                        <i class="fa fa-venus-mars" title="Giới tính"></i>
                            ${getGenderString(user.gender)}
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-4">
                        <div class="list-users__phone_number" id="update-phone_number">
                        <i class="fa-solid fa-phone" title="Số điện thoại"></i>
                            ${user.phone_number}
                        </div>
                    </div>
                </div>
            </div>
            <div class="list-users__action">
                  <div onclick="handleUpdateBtnClick(event, ${user.id})">
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
            <div class="list-users__status-check">
                    <label for="status-check-${
                        user.id
                    }" title="Đang hoạt động" ${user.is_active ? "checked" : "hidden"}></label>
            </div>
        </div>
    `;
    }

    fetchUsers(currentPage, searchQuery, sortOrder);

    // Set default checkbox state from local storage
    const savedStatusCheckboxChecked = localStorage.getItem(
        "statusCheckboxChecked"
    );
    if (savedStatusCheckboxChecked !== null) {
        $("#status-checkbox").prop(
            "checked",
            savedStatusCheckboxChecked == "true"
        );
    }

    $("#status-checkbox").on("change", function () {
        localStorage.setItem(
            "statusCheckboxChecked",
            $("#status-checkbox").prop("checked")
        );
        fetchUsers(currentPage, searchQuery, sortOrder);
    });

    // handle select onchange event
    $("#employee-count").on("change", function () {
        pageSize = $(this).val();
        currentPage = 1;
        localStorage.setItem("pageSize", pageSize);
        localStorage.setItem("currentPage", currentPage);
        fetchUsers(currentPage, searchQuery, sortOrder);
    });

    $("#search-btn").on("click", function (event) {
        event.preventDefault();
        searchQuery = $("#search-input").val().toLowerCase();
        currentPage = 1;
        fetchUsers(currentPage, searchQuery, sortOrder);
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
        currentPage = 1;
        localStorage.setItem(SORT_ORDER_KEY, sortOrder);
        $(".page-link__item").removeClass("active");
        fetchUsers(currentPage, searchQuery, sortOrder);
    });

    // Pagination event listener
    $("#pagination").on("click", ".page-link__item", function (event) {
        event.preventDefault();
        const pageNumber = $(this).attr("data-page");
        if (pageNumber !== currentPage) {
            fetchUsers(pageNumber);
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
        fetchUsers(currentPage, searchQuery, sortOrder);
    });

    $(".prevBtn").on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            fetchUsers(currentPage, searchQuery, sortOrder);
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
        fetchUsers(currentPage, searchQuery, sortOrder);
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
                // Refresh the user list
                fetchUsers(currentPage, searchQuery, sortOrder);
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
