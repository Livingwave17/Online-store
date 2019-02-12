var products;
var cart = {};
var product;
var keyEdit = "";

function getProducts(x) {
    //localStorage.clear()
    document.getElementById("products").classList.add("hidden");
    document.getElementById("loading").classList.remove("hidden");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            products = JSON.parse(this.responseText);
            if (x === 'main'){
                // undo la clasele CSS a plecat in functiile drawProducts si drawAdminProducts si getCart (facem ajax si in cart ca sa vada products)
                drawProducts();
                document.getElementById("carousel").classList.remove("invisible");
                slideShow()
            } else if (x === 'admin') {
                drawAdminProducts();
            } else if (x === 'cart') {
                if(Object.keys(localStorage).includes('cart')){
                    cart = JSON.parse(localStorage['cart'])
                }
                if (isEmpty(cart)){
                    document.getElementById("loading").classList.add("hidden");
                    document.getElementById('cartTable').classList.add("hidden")
                    document.getElementById('products').classList.remove("hidden")
                    document.getElementById("emptyCart").classList.remove('hidden')
                } else {
                    document.getElementById('emptyCart').classList.add('hidden');
                    document.getElementById('cartTable').classList.remove("hidden")
                    getCart()
                }
            }
        }
    }
    xhttp.open("GET", "https://final-project-d6167.firebaseio.com/.json", true)
    xhttp.send();
}

function slideShow() {
    setInterval(() => mySiema.next(), 6000)
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
            document.getElementById("addToCartButton").innerHTML = `<button onclick="addToCart('${target}')">Add to Cart</button>`
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
    document.getElementById("detail-description").innerHTML = product.description;
    document.getElementById("detail-price").innerHTML = product.price + ' $';
    document.getElementById("q").max = product.stock;
}

function addToCart(target) {
    var name = product.name;
    var price = product.price;
    var quantity = parseInt(document.getElementById("q").value);
    var newQuantity = 0
    var inCart = 0;
    var inStock = product.stock;
    console.log(Object.keys(localStorage).includes('cart'))
    //console.log(Object.keys(JSON.parse(localStorage['cart'])).includes(name))
    if(Object.keys(localStorage).includes('cart')){
        cart = JSON.parse(localStorage['cart'])
        if (Object.keys(JSON.parse(localStorage['cart'])).includes(target)){
            inCart = JSON.parse(localStorage.getItem('cart'))[target].quantity
            newQuantity = quantity + inCart;
        } else {
            newQuantity = quantity;
        }
    } else {
        newQuantity = quantity;
    }
    var cartItem = {
        "name": name,
        "price": price,
        "quantity": newQuantity
    }
    if (isNaN(quantity) || quantity === 0){
        return;
    } else if (quantity + inCart < inStock) {
        cart[target] = cartItem
        localStorage.setItem('cart', JSON.stringify(cart));
        document.getElementById("popup").classList.remove("hidden");
        setTimeout(function() {
            document.getElementById("popup").classList.add("hidden");
        }, 3000);
    } else {
        document.getElementById("invalidOrder").classList.remove("hidden");
        setTimeout(function() {
            document.getElementById("invalidOrder").classList.add("hidden");
        }, 3000);
    }
    console.log(cart)
}

function verifyCart(key) {
    /*save properties cu Object.keys intr-un array
        if (cart[key].price !== products[key].price) {
        iterezi prin array si compari cu ce e in cart
        daca nu e egal (except quantity) reasign ce e in cos sa fie ca ce e in baza de data
        pentru quantity make sure sa nu fie mai mare ca stocul
    }*/
    var currentProduct = cart[key]
    if (currentProduct.name !== products[key].name) {
        currentProduct.name = products[key].name;
    }
    if (currentProduct.price !== products[key].price) {
        currentProduct.price = products[key].price;
    }
    if (currentProduct.quantity > products[key].stock) {
        currentProduct.quantity = products[key].stock
    }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            return false;
        } 
    }
    return true;
}

function getCart() {
    var str = "";
    var total = 0;
    var counter = 0;
    for (var key in cart) {
        str += `
        <tr>
            <td><span>${cart[key].name}</span></td>
            <td><span>${cart[key].price}</span></td>
            <td><button onclick="increase('${key}')">+</button><span>${cart[key].quantity}</span><button onclick="decrease('${key}')">-</button></td>
            <td><span>${cart[key].price*cart[key].quantity}</span></td>
            <td><span onclick="remove('${key}')">Remove</span></td>
        </tr>
        `
        total += parseInt(cart[key].price)*parseInt(cart[key].quantity);
        counter+= 1;
    }
    document.getElementById("cartBody").innerHTML=str;
    document.getElementById('counter').innerHTML='Produse: ' + counter;
    document.getElementById('total').innerHTML='Total: ' + total;
    //cesese loading undo
    document.getElementById("products").classList.remove("hidden");
    document.getElementById("loading").classList.add("hidden");
}

function increase(key){
    var inCart = JSON.parse(localStorage.getItem('cart'))[key].quantity
    var inStock = parseInt(products[key].stock);
    if (inCart < inStock) {
        var quantum = parseInt(JSON.parse(localStorage.getItem('cart'))[key].quantity);
        quantum += 1;
        var cartItem = {
            "name": JSON.parse(localStorage['cart'])[key].name,
            "price": JSON.parse(localStorage['cart'])[key].price,
            "quantity": quantum
        }
        //localStorage.setItem(key, JSON.stringify(cartItem));
        cart[key] = cartItem
        localStorage.setItem('cart', JSON.stringify(cart));
        getCart()
    }
}

function decrease(key){
    var inCart = JSON.parse(localStorage.getItem('cart'))[key].quantity
    if (parseInt(inCart) > 1) {
        var quantum = parseInt(JSON.parse(localStorage.getItem('cart'))[key].quantity) - 1;
        var cartItem = {
            "name": JSON.parse(localStorage.getItem('cart'))[key].name,
            "price": JSON.parse(localStorage.getItem('cart'))[key].price,
            "quantity": quantum
        }
        cart[key] = cartItem
        localStorage.setItem('cart', JSON.stringify(cart));
        getCart()
    }
}

function remove(key){
    delete cart[key];
    localStorage.setItem('cart', JSON.stringify(cart));
    getCart();
    console.log(cart)
}

function drawAdminProducts(){
    var str = "";
    for (var i in products) {
        str += `
        <tr>
            <td><img width="25" height="25" src='${products[i].image}'></td>
            <td><span onclick="manage('${i}')">${products[i].name}</span></td>
            <td><span>${products[i].price} $</span></td>
            <td><span>${products[i].stock}</span></td>
            <td><span onclick="removeProduct('${i}')">Remove</span></td>
        </tr>
        `
    }
    document.getElementById("productsAdmin").innerHTML = str;
    document.getElementById("products").classList.remove("hidden");
    document.getElementById("loading").classList.add("hidden");
}

function removeProduct(i){
    var confirmDelete = confirm("Confirm Delete?");
    if (confirmDelete === true) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                getProducts('admin');
            }
        }
        xhttp.open("DELETE", `https://final-project-d6167.firebaseio.com/${i}.json`, true)
        xhttp.send();
    } 
}

function manage(key) {
    console.log(key);
    document.getElementById('products').classList.add('hidden');
    document.getElementById('manage').classList.remove('hidden');
    if (key !== 'add') {
        var product = products[key]
        getData(product);
        keyEdit = key
        console.log(keyEdit)
    } else {
        getData(null);
        console.log(keyEdit)
    }
}

function getData(product){
    if (product !== null) {
        document.getElementById('manageImage').value = product.image
        document.getElementById('manageName').value = product.name
        document.getElementById('manageDescription').value = product.description
        document.getElementById('managePrice').value = product.price
        document.getElementById('manageStock').value = product.stock
    } else {
        document.getElementById('manageImage').value = "";
        document.getElementById('manageName').value = "";
        document.getElementById('manageDescription').value = "";
        document.getElementById('managePrice').value = "";
        document.getElementById('manageStock').value = "";
    }
}

function update(action) {
    console.log(keyEdit)
    var image = document.getElementById('manageImage').value;
    var name = document.getElementById('manageName').value;
    var description = document.getElementById('manageDescription').value;
    var price = document.getElementById('managePrice').value;
    var stock = document.getElementById('manageStock').value;

    var newProduct = {
        "image":image,
        "name":name,
        "description":description,
        "price":price,
        "stock":stock
    }
    
    if (action === 'cancel') {
        console.log('canceled')
        document.getElementById('products').classList.remove('hidden');
        document.getElementById('manage').classList.add('hidden');
        keyEdit = '';
    } else if (keyEdit === ''){
        console.log('adding');
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                getProducts('admin');
                document.getElementById('products').classList.remove('hidden');
                document.getElementById('manage').classList.add('hidden');
            }
        }
        xhttp.open("POST", `https://final-project-d6167.firebaseio.com/.json`, true)
        xhttp.send(JSON.stringify(newProduct));
    } else {
        console.log('editing')
        var xhttp2 = new XMLHttpRequest();
        xhttp2.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                getProducts('admin');
                document.getElementById('products').classList.remove('hidden');
                document.getElementById('manage').classList.add('hidden');
                keyEdit = "";
            }
        }
        xhttp2.open("PUT", `https://final-project-d6167.firebaseio.com/${keyEdit}.json`, true)
        xhttp2.send(JSON.stringify(newProduct));
    }
}

function checkout() {
    if (!isEmpty(cart)){
        var buy = confirm("Confirm transaction?");
        if (buy === true) {
            acquisition();
        }
    }
}

function checkoutRedirect(){
    document.getElementById('transaction').classList.add('hidden');
    document.getElementById('products').classList.remove('hidden');
    getCart()
}


function acquisition() {
    for (key in cart) {
        var updated = products[key];
        updated.stock -= parseInt(cart[key].quantity);
        delete cart[key]
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                if (isEmpty(cart)){
                    localStorage.removeItem('cart');
                    document.getElementById('products').classList.add('hidden');
                    document.getElementById('transaction').classList.remove('hidden');
                }
            }
        }
        xhttp.open("PUT", `https://final-project-d6167.firebaseio.com/${key}.json`, true)
        xhttp.send(JSON.stringify(updated));
    }
}

/*function acquisition() {
    return new Promise(function(resolve, reject){
        for (key in cart) {
            var updated = products[key];
            updated.stock -= parseInt(cart[key].quantity);
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    delete cart[key]
                    console.log('done')
                    console.log(cart)
                    console.log(isEmpty(cart))
                }
            }
            xhttp.open("PUT", `https://final-project-d6167.firebaseio.com/${key}.json`, true)
            xhttp.send(JSON.stringify(updated));
        }
        resolve;
    })
}*/