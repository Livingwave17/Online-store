var products;
var cart = {};
var product;
var keyEdit = "";

function getProducts(x) {
    console.log(x);
    document.getElementById("products").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            products = JSON.parse(this.responseText);
            if (x === 'main'){
                // undo la clasele CSS a plecat in functiile drawProducts si drawAdminProducts si getCart (facem ajax si in cart ca sa vada products)
                drawProducts();
            } else if (x === 'admin') {
                drawAdminProducts();
            } else if (x === 'cart') {
                getCart()
            }
        }
    }
    xhttp.open("GET", "https://final-project-d6167.firebaseio.com/.json", true)
    xhttp.send();
}
function drawProducts() {
    var str = "";
    for (var i in products) {
        str += `
            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-3 product">
                <img class="img" src="${products[i].image}"><br>
                <span class="info">${products[i].name}</span><br>
                <span class="info">${products[i].price}$</span><a class="info" href="./details.html?id=${i}"><button>Details</button></a>
            </div>
        `
    }
    document.getElementById("grid").innerHTML = str;
    document.getElementById("products").classList.remove("hidden");
    document.getElementById("loading").classList.add("hidden");
}

function getDetails() {
    var target = location.search.substring(4);
    var xhttp = new XMLHttpRequest();
    document.getElementById("details").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            product = JSON.parse(this.responseText);
            drawDetails();
            document.getElementById("details").classList.remove("hidden");
            document.getElementById("loading").classList.add("hidden");
        }
    }
    xhttp.open("GET", `https://final-project-d6167.firebaseio.com/${target}.json`, true)
    xhttp.send();
}
function drawDetails() {
    document.getElementById("detail-image").src = product.image;
    document.getElementById("detail-name").innerHTML = product.name;
    document.getElementById("detail-price").innerHTML = product.price;
    document.getElementById("q").max = product.stock;
}

function addToCart() {
    var name = product.name;
    var price = product.price;
    var quantity = parseInt(document.getElementById("q").value);
    var newQuantity = 0
    var inCart = 0;
    var inStock = product.stock;
    if (Object.keys(localStorage).includes(name)){
        inCart = JSON.parse(localStorage.getItem(name)).quantity;
        newQuantity = quantity + inCart;
    }
    console.log(quantity + inCart)
    var cartItem = JSON.stringify({
        "name": name,
        "price": price,
        "quantity": newQuantity
    })
    if (quantity + inCart < inStock) {
        localStorage.setItem(name, cartItem);
        document.getElementById("popup").classList.remove("hidden");
        setTimeout(function() {
            document.getElementById("popup").classList.add("hidden");
        }, 3000);
    } else {
        console.log("Insuficient stock")
    }
    
    //localStorage.clear();
}

function getCart() {
    var str = "";
    var total = 0;
    var counter = 0;
    console.log(localStorage);
    for (var key in localStorage) {
        if (key === 'length'){break}
        str += `
        <tr>
            <td><span>${JSON.parse(localStorage[key]).name}</span></td>
            <td>${JSON.parse(localStorage[key]).price}</td>
            <td><button onclick="increase('${key}')">+</button><span>${JSON.parse(localStorage[key]).quantity}</span><button onclick="decrease('${key}')">-</button></td>
            <td>${JSON.parse(localStorage[key]).price*JSON.parse(localStorage[key]).quantity}</td>
            <td><span onclick="remove('${key}')">Remove</span></td>
        </tr>
        `
        total += parseInt(JSON.parse(localStorage[key]).price*JSON.parse(localStorage[key]).quantity);
        counter+= 1;
    }
    document.getElementById("cartBody").innerHTML=str;
    document.getElementById('counter').innerHTML='Produse: ' + counter;
    document.getElementById('total').innerHTML='Total: ' + total;
    //cesese loading undo
    document.getElementById("products").classList.remove("hidden");
    document.getElementById("loading").classList.add("hidden");
    console.log(total);
}

function increase(key){
    if (parseInt(JSON.parse(localStorage[key]).quantity) < parseInt(products[key].stock)) {
        var quantum = parseInt(JSON.parse(localStorage[key]).quantity);
        quantum += 1;
        var cartItem = {
            "name": JSON.parse(localStorage[key]).name,
            "price": JSON.parse(localStorage[key]).price,
            "quantity": quantum
        }
        localStorage.setItem(key, JSON.stringify(cartItem));
        getCart()
    }
}

function decrease(key){
    if (parseInt(JSON.parse(localStorage[key]).quantity) > 0) {
        var quantum = parseInt(JSON.parse(localStorage[key]).quantity) - 1;
        var cartItem = {
            "name": JSON.parse(localStorage[key]).name,
            "price": JSON.parse(localStorage[key]).price,
            "quantity": quantum
        }
        localStorage.setItem(key, JSON.stringify(cartItem));
        getCart()
    }
}

function remove(key){
    localStorage.removeItem(key);
    getCart();
}

function drawAdminProducts(){
    var str = "";
    for (var i in products) {
        str += `
        <tr>
            <td><img width="25" height="25" src='${products[i].image}'></td>
            <td><span onclick='manage(${JSON.stringify(products[i])})'>${products[i].name}</span></td>
            <td><span>${products[i].price} $</span></td>
            <td>${products[i].stock}</td>
            <td><span onclick="removeProduct('${i}')">Remove</span></td>
        </tr>
        `
        console.log(products[i])
    }
    document.getElementById("productsAdmin").innerHTML = str;
    document.getElementById("products").classList.remove("hidden");
    document.getElementById("loading").classList.add("hidden");
}

function removeProduct(i){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            getProducts('admin');
        }
    }
    xhttp.open("DELETE", `https://final-project-d6167.firebaseio.com/${i}.json`, true)
    xhttp.send();
}

function manage(product) {
    document.getElementById('adminTable').classList.add('hidden');
    document.getElementById('manage').classList.remove('hidden');
    if (product !== 'add') {
        getData(product);
        keyEdit = product.name;
    }
    console.log(keyEdit)
}

function getData(product){
    document.getElementById('manageImage').value = product.image
    document.getElementById('manageName').value = product.name
    document.getElementById('manageDescription').value = product.description
    document.getElementById('managePrice').value = product.price
    document.getElementById('manageStock').value = product.stock
}

function update(keyEdit) {
    var newProduct = {}
    var image = document.getElementById('manageImage').value;
    var name = document.getElementById('manageName').value;
    var description = document.getElementById('manageDescription').value;
    var price = document.getElementById('managePrice').value;
    var stock = document.getElementById('manageStock').value;

    var newProductValue = {
        "image":image,
        "name":name,
        "description":description,
        "price":price,
        "stock":stock
    }

    newProduct[name] = newProductValue;
    console.log(newProduct)
    console.log(JSON.stringify(newProduct))
    
    if (keyEdit === "") {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                getProducts('admin');
                document.getElementById('adminTable').classList.remove('hidden');
                document.getElementById('manage').classList.add('hidden');
            }
        }
        xhttp.open("POST", `https://final-project-d6167.firebaseio.com/.json`, true)
        xhttp.send(JSON.stringify(newProduct));
    } else {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                getProducts('admin');
                document.getElementById('adminTable').classList.remove('hidden');
                document.getElementById('manage').classList.add('hidden');
                keyEdit = "";
            }
        }
        xhttp.open("PUT", `https://final-project-d6167.firebaseio.com/${keyEdit}.json`, true)
        xhttp.send(JSON.stringify(newProductValue));
    }
}