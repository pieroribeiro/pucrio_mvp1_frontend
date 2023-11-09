const API_DOMAIN = "http://localhost:5000"
const API_ENDPOINT_GET_PRODUCT = `${API_DOMAIN}/product/?id=`
const API_ENDPOINT_LIST_PRODUCTS = `${API_DOMAIN}/products/`
const API_ENDPOINT_CREATE_PRODUCT = `${API_DOMAIN}/product/`
const API_ENDPOINT_UPDATE_PRODUCT = API_ENDPOINT_GET_PRODUCT
const API_ENDPOINT_DELETE_PRODUCT = API_ENDPOINT_GET_PRODUCT

const FORM_ACTION_ADD = "add"
const FORM_ACTION_EDIT = "edit"

window.onload = (e) => {
    const fetchAPI = async (endpoint = '', method = 'GET', type = 'json', data = null) => {
        return new Promise((resolve, reject) => { 
            let bodyRequest = undefined
            if (data) {
                if (type == 'json') {
                    bodyRequest = JSON.stringify(data)
                } else {
                    const formData  = new FormData();      
                    for(const name in data) {
                        formData.append(name, data[name]);
                    }
                    bodyRequest = formData
                }                
            }

            fetch(endpoint, {
                method,
                body: bodyRequest,
                mode: 'cors'
            })
            .then(res => res.json())
            .then(res => {
                resolve(res)    
            }).catch(e => {
                reject(e.message)
            })
        })
    }

    const showMessage = (message = "", error = false) => {
        const messageContainer = document.querySelector(".message-container")
        if (error) {
            messageContainer.classList.add("error")
        } else {
            messageContainer.classList.remove("error")            
        }

        messageContainer.innerHTML = message
        messageContainer.classList.remove("dn")
        setTimeout(() => {
            const messageContainer = document.querySelector(".message-container")
            messageContainer.innerHTML = ""
        }, 2500)
    }

    const menuBtnEvent = () => {
        const containerMenu = document.querySelector(".menu")
        const btn = document.querySelector(".menu .btn")
        btn.addEventListener("click", (e) => {
            e.stopPropagation()
            e.preventDefault()

            if (containerMenu.classList.contains("active")) {
                containerMenu.classList.remove("active")
            } else {
                containerMenu.classList.add("active")
            }
        })
    }

    const selectAreaToShow = (menuSelected) => {
        switch(menuSelected) {
            case "products":
                setTitle("Listagem de Produtos")
                break
            case "sales":
                setTitle("Vendas")
                break
        }

    }

    const setTitle = (title) => {
        document.querySelector(".header h1").innerHTML = title
        document.title = title        
    }

    const menuItemsEvent = () => {
        document.querySelectorAll(".menu ul li").forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation()
                e.preventDefault()
    
                const currItem = e.target
                currItem.classList.add("active")

                selectAreaToShow(currItem.dataset.item)
    
                removeClassFromSiblings(currItem, 'active')

                document.querySelector(".menu .btn").dispatchEvent(new Event("click"))
            })
        })
    }

    const activateFirstMenuItem = () => {
        document.querySelector(".menu ul li[data-item='products']").dispatchEvent(new Event("click"))
    }

    const editProduct = async (id) => {
        const res = await fetchAPI(`${API_ENDPOINT_GET_PRODUCT}${id}`, 'GET')
        if (res.id) {
            document.querySelector(".container-product-new-edit #formProductAction").value = "edit"
            document.querySelector(".container-product-new-edit #productId").value = id
            document.querySelector(".container-product-new-edit #productName").value = res.name
            document.querySelector(".container-product-new-edit #productValue").value = res.value
        } else {
            alert("Item não encontrado!")
            return
        }
    }

    const deleteProduct = async (id) => {
        if ( confirm(`Dejesa realmente deletar o item ${id}?`) ) {
            const res = await fetchAPI(`${API_ENDPOINT_DELETE_PRODUCT}${id}`, 'DELETE')
            if (res && res.message) {
                showMessage(res.message)
                await updateProductList()
            } else {
                showMessage("Ocorreu um erro, tente novamente mais tarde!")
            }
        }
    }

    const fillListProducts = (records = []) => {
        while (document.querySelector(".list-products .item-list")) {
            document.querySelector(".list-products .item-list").remove()
        }

        const container = document.getElementsByClassName("list-products")[0]

        if (records.length <= 0) {
            container.appendChild(createElementFromHTML(`
                <div class="item-list-no-results">
                    <div>Não há registros cadastrados!</div>
                </div>
            `))
        } else {
            records.forEach(item => {
                container.appendChild(createElementFromHTML(`
                    <div class="item-list">
                        <div class="item-field item-id">${item.id}</div>
                        <div class="item-field item-name">${item.name}</div>
                        <div class="item-field item-value">${formatCurrency(item.value)}</div>
                        <div class="item-field item-createdAt">${formatDate(item.created_at)}</div>
                        <div class="item-action">
                            <div class="btn-item-action btnEdit" data-id="${item.id}"></div>
                            <div class="btn-item-action btnDelete" data-id="${item.id}"></div>
                        </div>
                    </div>
                `))
            })

            listEventListeners()
        }
    }

    const listEventListeners = () => {
        document.querySelectorAll(".list-products .btn-item-action.btnDelete").forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = e.target.dataset.id
                if (id) {
                    deleteProduct(id)
                }
            })
        })

        document.querySelectorAll(".list-products .btn-item-action.btnEdit").forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = e.target.dataset.id
                if (id) {
                    editProduct(id)
                }
            })
        })
    }

    const updateProductList = async () => {
        const res = await fetchAPI(API_ENDPOINT_LIST_PRODUCTS, 'GET')
        
        await fillListProducts(res.products)
    }

    const resetFormAddEdit = async () => {
        document.querySelector(".container-product-new-edit #formProductAction").value = "add"
        document.querySelector(".container-product-new-edit #productId").value = ""
        document.querySelector(".container-product-new-edit #productName").value = ""
        document.querySelector(".container-product-new-edit #productValue").value = ""
    }

    const addEditListeners = async () => {
        document.querySelector(".container-product-new-edit .action-container .btnSave").addEventListener("click", async (e) => {
            e.stopPropagation();
            e.preventDefault();

            const action = document.querySelector(".container-product-new-edit #formProductAction").value
            const productId = document.querySelector(".container-product-new-edit #productId").value
            const productName = document.querySelector(".container-product-new-edit #productName").value
            const productValue = document.querySelector(".container-product-new-edit #productValue").value
            let results
            let sufixoAction

            if (productName == "" || productValue == "") {
                alert("Preencha os campos corretamente!")
                return
            }

            if (action === FORM_ACTION_ADD) {
                results = await fetchAPI(API_ENDPOINT_CREATE_PRODUCT, 'POST', 'formData', {
                    name: productName,
                    value: productValue
                })
                sufixoAction = "inserido"
            } else if (action === FORM_ACTION_EDIT) {
                results = await fetchAPI(`${API_ENDPOINT_UPDATE_PRODUCT}${productId}`, 'PUT', 'formData', {
                    name: productName,
                    value: productValue
                })
                sufixoAction = "atualizado"
            }

            if (results.id) {
                showMessage(`Produto ${sufixoAction}`, false)
            } else {
                showMessage(results.message, true)
            }

            await updateProductList()
            resetFormAddEdit()
        })

        document.querySelector(".container-product-new-edit .action-container .btnCancel").addEventListener("click", (e) => {
            resetFormAddEdit()
        })
    }

    const init = async () => {
        const container = document.querySelector(".list-products")
        container.appendChild(createElementFromHTML(`
            <div class="item-list-header">
                <div class="item-header-field">ID</div>
                <div class="item-header-field">Nome do Produto</div>
                <div class="item-header-field">Valor</div>
                <div class="item-header-field">Data de cadastro</div>
                <div class="item-header-field">Ações</div>
            </div>
        `))

        menuBtnEvent()
        menuItemsEvent()
        activateFirstMenuItem()

        await updateProductList()

        addEditListeners()
    }

    init()
}