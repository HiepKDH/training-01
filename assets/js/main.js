const usersAPI =
    "http://training.mumesoft.com/api/users?page=1&page_size=30&sort=+latest_update_at";
const authToken = "MBczeFfWzzspy1a1C4bs5mAuDCAbo187x5nfwJls";
const requestOptions = {
    headers: {
        Authorization: `Bearer ${authToken}`,
    },
};
const usersPerPage = 4; // set the number of users per page
let searchQuery = ""; // declare searchQuery as a global variable

function start() {
    const currentPage = localStorage.getItem("currentPage") || 1;
    const searchQuery = localStorage.getItem("searchQuery") || "";
    const sortOrder = localStorage.getItem("sortOrder") || "+latest_update_at";

    // Get the filtered users
    getUsers(renderUsers, currentPage, searchQuery, sortOrder);

    // Add event listeners
    const searchBtn = document.getElementById("search-btn");
    const sortBtn = document.getElementById("sort-users");

    searchBtn.addEventListener("click", handleSearchBtnClick);
    sortBtn.addEventListener("change", handleSortBtnChange);
}

start();

function handleSearchBtnClick() {
    const searchInput = document.getElementById("search-input");
    const searchQuery = searchInput.value.trim().toLowerCase();
    localStorage.setItem("searchQuery", searchQuery);
    getUsers(renderUsers, 1, searchQuery);
}

function handleSortBtnChange() {
    const sortBtn = document.getElementById("sort-users");
    const sortOrder = sortBtn.value;
    localStorage.setItem("sortOrder", sortOrder);
    getUsers(renderUsers, 1, searchQuery, sortOrder);
}

// Send the request to get users with the given parameters
async function getUsers(
    callback,
    currentPage,
    searchQuery = "",
    sortOrder = ""
) {
    let apiUrl = usersAPI + `?page=${currentPage}`;
    if (searchQuery) {
        // ký tự &, ?, /, =, +, #, v.v. phải được mã hóa để tránh xảy ra lỗi trong quá trình truyền tải.
        apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
    }
    apiUrl += `&sort=${sortOrder}`;
    try {
        const response = await fetch(apiUrl, requestOptions);
        if (response.ok) {
            const data = await response.json();
            const users = data.data;
            const filteredUsers = searchQuery
                ? users.filter((user) =>
                      Object.values(user)
                          .join(" ")
                          .toLowerCase()
                          .includes(searchQuery)
                  )
                : users;
            callback(
                { data: filteredUsers, total: filteredUsers.length },
                currentPage
            );
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }

    localStorage.setItem("currentPage", currentPage);
}

function renderUsers(data, currentPage) {
    const users = data.data;
    console.log(users);
    var startIndex = (currentPage - 1) * usersPerPage; // calculate the start index for the current page
    var endIndex = startIndex + usersPerPage; // calculate the end index for the current page
    var paginatedUsers = users.slice(startIndex, endIndex); // slice the users array to get the users for the current page
    var html = "";
    localStorage.setItem("currentPage", currentPage);
    for (var i = 0; i < paginatedUsers.length; i++) {
        var user = paginatedUsers[i];
        html += `
        <div class="list-users" id="list-users-item-${user.id}">
            <div class="list-users__info">
                <div class="avatar"><img src="${user.avatar}" 
                    alt="${user.avatar}">
                </div>
                <div class="list-users__item">
                    <div class="name" id="update-name"><i class="fa fa-user"></i>
                    ${user.name}
                    </div>
                    <div class="user-name" id="update-username"><i class="fa fa-user"></i> 
                    ${user.username}
                    </div>
                    <div class="email" id="update-email"><i class="fa fa-envelope"></i>
                    ${user.email}
                    </div>
                    <div class="birth-date" id="update-birth-date"><i class="fa fa-calendar"></i> 
                    ${user.birth_date}
                    </div>
                    <div class="gender" id="update-gender"><i class="fa fa-venus-mars"></i> 
                    ${getGenderString(user.gender)}
                    </div>
                    <div class="phone_number" id="update-phone_number"><i class="fa-solid fa-phone"></i> 
                    ${user.phone_number}
                    </div>
                </div>
            </div>
            <div class="list-users__action-update" onclick="handleUpdateBtnClick(event, ${
                user.id
            })">
                <a href="#!">
                    <i class="fa-regular fa-pen-to-square"></i>
                        Cập nhật
                </a>
            </div>
            <div class="list-users__action">
                <div onclick="handleDeleteBtnClick(event, ${user.id})">
                    <a href="#!" class="list-users__action-clear">
                        <i class="fa-solid fa-trash-can"></i>
                    </a>
                </div>
            <div class="list-users__check">
                <input
                    type="checkbox"
                    data-id="${user.id}"
                    name="status-checkbox"
                    onclick="handleDeleteAllBtnClick(event)"
                />
            </div>
            </div>
        </div>
      `;
    }

    $(".users-container").html(html);
    // Calculate number of pages
    var numPages = Math.ceil(users.length / usersPerPage);

    // Generate pagination links
    var paginationHtml = "";
    for (var i = 1; i <= numPages; i++) {
        paginationHtml +=
            '<button class="page-link" data-page="' +
            i +
            '">' +
            i +
            "</button>";
    }

    // Render pagination links
    $(".pagination-container").html(paginationHtml);

    // Add click event to pagination links
    $(".pagination-container").on("click", ".page-link", function (event) {
        event.preventDefault();
        var pageNum = $(this).data("page");
        getUsers(renderUsers, pageNum);
    });

    // Highlight current page link
    $(".page-link").removeClass("active"); // remove the "active" class from all page links
    $(".page-link[data-page='" + currentPage + "']").addClass("active"); // add the "active" class to the current page link

    // Display the number of users on the current page
    var numUsersOnPage = paginatedUsers.length;
    var startIndexOnPage = startIndex + 1;
    var endIndexOnPage = startIndexOnPage + numUsersOnPage;
    $(".num-users").html(users.length);
    $(".num-users-page").html(endIndexOnPage - startIndexOnPage);
}

// convert gender from number to String
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

// Delete user

function handleDeleteBtnClick(event, id) {
    event.stopPropagation();
    deleteUser(id);
}

function handleDeleteAllBtnClick(event) {
    const checkboxes = document.querySelectorAll(
        'input[type="checkbox"][name^="status-checkbox"]'
    );
    const checkedIds = [];
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkedIds.push(checkboxes[i].getAttribute("data-id"));
        }
    }
    if (checkedIds.length > 0) {
        const confirmation = confirm(
            `Bạn có chắc muốn xóa ${checkedIds.length} người dùng đã chọn không?`
        );
        if (confirmation) {
            const apiUrl = `http://training.mumesoft.com/api/users?ids=${checkedIds.join(
                ","
            )}`;
            fetch(apiUrl, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
            })
                .then((response) => {
                    if (response.ok) {
                        checkedIds.forEach((id) => {
                            $(`#list-users-item-${id}`).remove();
                        });
                        const totalRecord =
                            document.querySelectorAll(".list-users").length;
                        alert(
                            `Xóa người dùng thành công! Hiện tại còn ${totalRecord} người dùng.`
                        );
                    } else {
                        throw new Error(
                            `Request failed with status ${response.status}`
                        );
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    } else {
        alert("Vui lòng chọn ít nhất một người dùng để xóa.");
    }
}

function handleCheckAllBtnClick(event) {
    const checkboxes = document.querySelectorAll(
        'input[type="checkbox"][name^="status-checkbox"]'
    );
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
    }
}

function handleUncheckAllBtnClick(event) {
    const checkboxes = document.querySelectorAll(
        'input[type="checkbox"][name^="status-checkbox"]'
    );
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
}

// sửa đổi để thêm cảnh báo trước khi xóa và hiển thị số lượng bản ghi còn lại sau khi xóa thành công.
async function deleteUser(id) {
    const confirmation = confirm("Bạn có chắc muốn xóa người dùng này không?");
    if (confirmation) {
        try {
            const response = await fetch(
                `http://training.mumesoft.com/api/users?ids=${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        Accept: "application/json",
                        "Content-type": "application/json",
                    },
                }
            );
            if (response.ok) {
                const listItem = document.getElementById(
                    `list-users-item-${id}`
                );
                listItem.remove();
                const totalRecord =
                    document.querySelectorAll(".list-users").length;
                alert(
                    `Xóa người dùng thành công! Hiện tại còn ${totalRecord} người dùng.`
                );
            } else {
                throw new Error(
                    `Request failed with status ${response.status}`
                );
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

// function handleUpdateBtnClick(event, id) {
//     event.stopPropagation();
//     window.location.href = `add-user.html?id=${id}`;
// }

// Edit user
function handleUpdateBtnClick(event, id) {
    event.stopPropagation();
    const user = users.find((user) => user.id === id);
    const html = `
        <div class="update-user-form">
            <div class="form-group">
                <label for="update-name">Họ và tên</label>
                <input type="text" id="update-name" value="${user.name}" />
            </div>
            <div class="form-group">
                <label for="update-username">Tên đăng nhập</label>
                <input type="text" id="update-username" value="${
                    user.username
                }" />
            </div>
            <div class="form-group">
                <label for="update-email">Email</label>
                <input type="email" id="update-email" value="${user.email}" />
            </div>
            <div class="form-group">
                <label for="update-birth-date">Ngày sinh</label>
                <input type="date" id="update-birth-date" value="${
                    user.birth_date
                }" />
            </div>
            <div class="form-group">
                <label for="update-gender">Giới tính</label>
                <select id="update-gender">
                    <option value="0" ${
                        user.gender === 0 ? "selected" : ""
                    }>Nam</option>
                    <option value="1" ${
                        user.gender === 1 ? "selected" : ""
                    }>Nữ</option>
                    <option value="2" ${
                        user.gender === 2 ? "selected" : ""
                    }>Khác</option>
                </select>
            </div>
            <div class="form-group">
                <label for="update-phone_number">Số điện thoại</label>
                <input type="text" id="update-phone_number" value="${
                    user.phone_number
                }" />
            </div>
            <div class="form-group">
                <button onclick="handleUpdateUserSubmit(event, ${
                    user.id
                })">Cập nhật</button>
            </div>
        </div>
    `;
    $(".update-user-container").html(html);
    $(".update-user-container").show();
}

async function handleUpdateUserSubmit(event, id) {
    event.preventDefault();
    const name = $("#update-name").val();
    const username = $("#update-username").val();
    const email = $("#update-email").val();
    const birth_date = $("#update-birth-date").val();
    const gender = $("#update-gender").val();
    const phone_number = $("#update-phone_number").val();
    const data = {
        name,
        username,
        email,
        birth_date,
        gender,
        phone_number,
    };
    try {
        const response = await fetch(
            `http://training.mumesoft.com/api/users/${id}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );
        if (response.ok) {
            const user = await response.json();
            const listItem = document.getElementById(`list-users-item-${id}`);
            listItem.querySelector("#update-name").textContent = user.name;
            listItem.querySelector("#update-username").textContent =
                user.username;
            listItem.querySelector("#update-email").textContent = user.email;
            listItem.querySelector("#update-birth-date").textContent =
                user.birth_date;
            listItem.querySelector("#update-gender").textContent =
                getGenderString(user.gender);
            listItem.querySelector("#update-phone_number").textContent =
                user.phone_number;
            $(".update-user-container").hide();
            alert("Cập nhật người dùng thành công!");
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
