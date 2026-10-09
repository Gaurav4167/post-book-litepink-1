var cl = console.log;


const resultCardDRow = document.getElementById("resultCardDRow")
const bookName = document.getElementById("bookName")
const description = document.getElementById("description")
const form = document.getElementById("form")
const addBook = document.getElementById("addBook")
const addBtn = document.getElementById("addBtn")
const updateBtn = document.getElementById("updateBtn")
const closeBtn = document.getElementById("closeBtn")
const cancelBtn = document.getElementById("cancelBtn")
const formShowHide = document.getElementById("form-show-hide")
const formHeading = document.getElementById("form-heading")
const spinner = document.getElementById("spinner")

const BASE_URL = `https://gaurav2-1b96d-default-rtdb.firebaseio.com/`
const POST_URL = `${BASE_URL}/fetchGenericPosts.json`
const state = {
    postArray: [],
    edit_id: null
}

//======================= Generic fun ================================
function genericApiCall(URL, METHOD, BODY) {
    BODY = BODY ? JSON.stringify(BODY) : null
    return fetch(URL, {
        method: METHOD,
        body: BODY,
        headers: {
            "Content-Type": "Application/json",
            "Autherization": "JWT FROM LS"
        }
    })

        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status}`)
            }
            return res.json()
        })
}
//======================= CREATE ================================
function createPost(eve) {
    eve.preventDefault()

    let newPostObj = {
        bookName: bookName.value,
        description: description.value
    }
    showSpinner("text-success")

    genericApiCall(POST_URL, "POST", newPostObj)
        .then(data => {
            newPostObj.id = data.name
            state.postArray.unshift(newPostObj)

            let col = document.createElement("div")
            col.id = data.name
            col.className = "col-3 mb-4"
            col.innerHTML = `
                <div class="card circle result-card">
                   <h3>${newPostObj.bookName}</h3>
                    <div class="content">
                        <p class="">${newPostObj.description}</p>
                    </div>
                    <div class="d-flex justify-content-between p-2 buttons mt-2">
                        <i onClick="editPost(this)" id="editSubject" role="button" class="fa-solid fa-pen-nib text-success"></i>
                        <i onClick="deletePost(this)" id="deleteSubject" role="button" class="fa-solid fa-trash text-danger"></i>
                    </div>
                `
            resultCardDRow.prepend(col)
            hideForm()
            showSnackBar("Added!", "Book Added successfully", "success")

        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })
}
//======================= READ ================================
function fetchPosts(arr) {
    showSpinner("text-primary")
    genericApiCall(POST_URL, "GET")
        .then(data => {
            for (const key in data) {
                data[key].id = key;
                state.postArray.unshift(data[key])
            }

            let result = ''
            arr.forEach(ele => {
                result += `
                <div class="col-3 mb-4" id=${ele.id}> 
                    <div class="card circle result-card">
                      <h3>${ele.bookName}</h3>
                      <div class="content">
                        <p class="">${ele.description}</p>
                      </div>
                    <div class="d-flex justify-content-between p-2 buttons mt-2">
                        <i onClick="editPost(this)" id="editSubject" role="button" class="fa-solid fa-pen-nib text-primary"></i>
                        <i onClick="deletePost(this)" id="deleteSubject" role="button" class="fa-solid fa-trash text-danger"></i>
                    </div>
                </div>
            </div>
            `
                resultCardDRow.innerHTML = result
            });

        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-primary")
        })
}
fetchPosts(state.postArray)
//======================= EDIT ================================
function editPost(ele) {
    let EDIT_ID = ele.closest(".col-3").id
    let EDIT_URL = `${BASE_URL}/fetchGenericPosts/${EDIT_ID}.json`

    showSpinner("text-success")
    genericApiCall(EDIT_URL, "GET")
        .then(data => {
            bookName.value = data.bookName
            description.value = data.description

            showForm()
            formHeading.innerText = "Update Subject"
            addBook.disabled = true
            window.scrollTo({
                top : 0,
                behavior : "smooth"
            })
            state.edit_id = EDIT_ID

            addBtn.classList.add("d-none")
            updateBtn.classList.remove("d-none")
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })
}
//======================= UPDATE ================================
function updatePost(ele) {
    let UPDATE_ID = state.edit_id
    let UPDATE_URL = `${BASE_URL}/fetchGenericPosts/${UPDATE_ID}.json`

    let updatedPostObj = {
        bookName: bookName.value,
        description: description.value
    }
    showSpinner("text-success")

    genericApiCall(UPDATE_URL, "PATCH", updatedPostObj)
        .then(data => {
            state.edit_id = null
            let getIndex = state.postArray.findIndex(ele => ele.id === UPDATE_ID)
            state.postArray[getIndex] = updatedPostObj;

            document.getElementById(UPDATE_ID).innerHTML = `<div class="card circle result-card">
                   <h3>${updatedPostObj.bookName}</h3>
                    <div class="content">
                        <p class="">${updatedPostObj.description}</p>
                    </div>
                    <div class="d-flex justify-content-between p-2 buttons mt-2">
                        <i onClick="editPost(this)" id="editSubject" role="button" class="fa-solid fa-pen-nib text-primary"></i>
                        <i onClick="deletePost(this)" id="deleteSubject" role="button" class="fa-solid fa-trash text-danger"></i>
                    </div>`
            clearForm()
            addBtn.classList.remove("d-none")
            updateBtn.classList.add("d-none")
            hideForm()
            showSnackBar("Updated!", "Book Updated successfully", "success")
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })
}
//======================= DELETE ================================
function deletePost(ele) {
    let DELETE_ID = ele.closest(".col-3").id
    let DELETE_URL = `${BASE_URL}/fetchGenericPosts/${DELETE_ID}.json`

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            showSpinner("text-danger")
            genericApiCall(DELETE_URL, "DELETE")
                .then(data => {
                    let getIndex = state.postArray.findIndex(ele => ele.id === DELETE_ID)
                    state.postArray.splice(getIndex, 1)
                    ele.closest(".col-3").remove()
                    showSnackBar("Removed!", "Book Post removed successfully", "success")
                })
                .catch(err => {
                    showSnackBar("Error", err, "error")
                })
                .finally(() => {
                    hideSpinner("text-danger")
                })
        }
    });
}

function showForm() {
    formShowHide.classList.remove("d-none")
    formHeading.innerText = "Add Subject"

}
function hideForm() {
    formShowHide.classList.add("d-none")
    addBook.disabled = false
    formHeading.innerText = "Add Subject"
    addBtn.classList.remove("d-none")
    updateBtn.classList.add("d-none")

    clearForm()

}
function clearForm() {
    form.reset()
}

function showSnackBar(title, msg, icon) {
    Swal.fire({
        title: title,
        text: msg,
        icon: icon
    });
}
function showSpinner(color) {
    spinner.classList.remove("d-none")
    spinner.classList.add(color)
}
function hideSpinner(color) {
    spinner.classList.add("d-none")
    spinner.classList.remove(color)
}

addBook.addEventListener("click", showForm)
form.addEventListener("submit", createPost)
closeBtn.addEventListener("click", hideForm)
updateBtn.addEventListener("click", updatePost)


















































