let products;
let productsArray = {};
let filteredProducts = {};
let cart = {};
let product;
let keyEdit = '';
let accounts = {};
let currentAccount = {};

function slideShow() {
  setInterval(() => mySiema.next(), 6000);
}

function ajax(method, url, body) {
  return new Promise(((resolve, reject) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(this.responseText);
        } else {
          reject(new Error('Error'));
        }
      }
    };
    xhttp.open(method, url, true);
    xhttp.send(body);
  }));
}

async function logIn() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const response = await ajax('GET', 'https://final-project-accounts.firebaseio.com/.json');
  accounts = Object.values(JSON.parse(response));
  for (let i = 0; i < accounts.length; i += 1) {
    if (accounts[i].user === username) {
      if (accounts[i].pass === password) {
        currentAccount = accounts[i];
        localStorage.setItem('logged_in', true);
        localStorage.setItem('account', JSON.stringify(currentAccount));
        window.location.reload();
        return;
      }
    }
  }
  document.getElementById('invalidLogin').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('invalidLogin').classList.add('hidden');
  }, 3000);
}

function adminAccess() {
  if (localStorage.getItem('account') === null) {
    document.getElementById('adminButton').classList.add('hidden');
  } else {
    const myAccount = JSON.parse(localStorage.getItem('account'));
    if (myAccount.role === 'admin') {
      document.getElementById('adminButton').classList.remove('hidden');
    } else {
      document.getElementById('adminButton').classList.add('hidden');
    }
  }
}

function logInVisibility() {
  if (localStorage.getItem('logged_in') !== null) {
    if (localStorage.getItem('logged_in')) {
      document.getElementById('log_in').classList.add('hidden');
    } else {
      document.getElementById('log_in').classList.add('hidden');
    }
  }
}

function loggedIn() {
  if (localStorage.getItem('logged_in')) {
    document.getElementById('log_out').classList.remove('hidden');
  } else {
    document.getElementById('log_out').classList.add('hidden');
  }
}

function logOut() {
  localStorage.removeItem('logged_in');
  localStorage.removeItem('account');
  currentAccount = {};
  window.location.replace('./project.html');
}

function sortAZZA(toBeSorted, criterion) {
  toBeSorted.sort((a, b) => {
    const alpha = a.name.toLowerCase();
    const omega = b.name.toLowerCase();
    if (criterion === 'A-Z') {
      if (alpha < omega) { return -1; }
      if (omega > alpha) { return 1; }
      return 0;
    }
    if (alpha > omega) { return -1; }
    if (omega < alpha) { return 1; }
    return 0;
  });
  drawProducts(toBeSorted);
}

function sortAscDesc(toBeSorted, criterion) {
  toBeSorted.sort((a, b) => {
    if (criterion === 'asc') {
      return parseInt(a.price) - parseInt(b.price);
    }
    return parseInt(b.price) - parseInt(a.price);
  });
  drawProducts(toBeSorted);
}

function sortByCriteria(criterion, toBeSorted) {
  if (criterion === 'A-Z' || criterion === 'Z-A') {
    sortAZZA(toBeSorted, criterion);
  } else if (criterion === 'asc' || criterion === 'desc') {
    sortAscDesc(toBeSorted, criterion);
  } else {
    drawProducts(toBeSorted);
  }
}

function sortProducts() {
  const criterion = document.getElementById('sort').value;
  if (filteredProducts.length !== productsArray.length && filteredProducts.length !== undefined) {
    sortByCriteria(criterion, filteredProducts);
  } else {
    sortByCriteria(criterion, productsArray);
  }
}

function showFilters(id1, id2, id3) {
  const elem1 = document.getElementById(id1);
  const elem2 = document.getElementById(id2);
  const elem3 = document.getElementById(id3);
  if (elem1.classList.contains('hidden')) {
    elem1.classList.remove('hidden');
    elem2.classList.add('hidden');
    elem3.classList.add('hidden');
  } else {
    elem1.classList.add('hidden');
  }
}

function filterByGenre(genreFilters) {
  let filtered = [];
  if (genreFilters.length === 0) {
    filtered = products;
    return filtered;
  }
  for (let i; i < products.length; i += 1) {
    if (genreFilters.includes(products[i].genre)) {
      filtered.push(products[i]);
    }
  }
  return filtered;
}

function filterByYear(yearFilters, filteredByGenre) {
  let filtered = [];
  if (yearFilters.length === 0) {
    filtered = filteredByGenre;
    return filtered;
  }
  for (let i; i < filteredByGenre.length; i += 1) {
    for (let y; y < yearFilters.length; y += 1) {
      if ((parseInt(yearFilters[y]) <= parseInt(filteredByGenre[i].year))
        && (parseInt(filteredByGenre[i].year) <= parseInt(yearFilters[y]) + 9)) {
        filtered.push(filteredByGenre[i]);
      }
    }
  }
  return filtered;
}

function filterByPrice(priceFilters, filteredByYear) {
  let filtered = [];
  if (priceFilters.length === 0) {
    filtered = filteredByYear;
    return filtered;
  }
  for (let i; i < filteredByYear.length; i += 1) {
    for (let p; p < priceFilters.length; p += 1) {
      if (parseInt(priceFilters[p]) === 20) {
        if (parseInt(priceFilters[p]) <= parseInt(filteredByYear[i].price)) {
          filtered.push(filteredByYear[i]);
        }
      } else if ((parseInt(priceFilters[p]) <= parseInt(filteredByYear[i].price))
        && (parseInt(filteredByYear[i].price) <= parseInt(priceFilters[p]) + 9)) {
        filtered.push(filteredByYear[i]);
      }
    }
  }
  return filtered;
}

async function setFilters() {
  const checkboxes = document.querySelectorAll('input[name="filter"]');
  const yearFilters = [];
  const genreFilters = [];
  const priceFilters = [];
  let filteredByGenre = [];
  for (let i = 0; i < 4; i += 1) {
    if (checkboxes[i].checked === true) {
      genreFilters.push(checkboxes[i].value);
    }
  }
  for (let i = 4; i < 8; i += 1) {
    if (checkboxes[i].checked === true) {
      yearFilters.push(checkboxes[i].value);
    }
  }
  for (let i = 8; i < 11; i += 1) {
    if (checkboxes[i].checked === true) {
      priceFilters.push(checkboxes[i].value);
    }
  }
  filteredByGenre = await filterByGenre(genreFilters);
  filteredByYear = await filterByYear(yearFilters, filteredByGenre);
  filteredProducts = await filterByPrice(priceFilters, filteredByYear);
  sortProducts();
}

async function getProducts(x) {
  loggedIn();
  document.getElementById('products').classList.add('hidden');
  document.getElementById('loading').classList.remove('hidden');
  const response = await ajax('get', 'https://final-project-d6167.firebaseio.com/.json');
  products = JSON.parse(response);
  if (products !== null) {
    productsArray = Object.values(products);
  }
  if (x === 'main') {
    adminAccess();
    logInVisibility();
    drawProducts(products);
    document.getElementById('carousel').classList.remove('invisible');
    slideShow();
  } else if (x === 'admin') {
    drawAdminProducts();
  } else if (x === 'cart') {
    adminAccess();
    if (Object.keys(localStorage).includes('cart')) {
      cart = JSON.parse(localStorage.cart);
    }
    if (isEmpty(cart)) {
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('cartTable').classList.add('hidden');
      document.getElementById('products').classList.remove('hidden');
      document.getElementById('emptyCart').classList.remove('hidden');
    } else {
      document.getElementById('emptyCart').classList.add('hidden');
      document.getElementById('cartTable').classList.remove('hidden');
      getCart();
    }
  }
}

function drawProducts(toBeDrawn) {
  let str = '';
  for (const i in toBeDrawn) {
    str += `
            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-3 product">
                <img class="img" src="${toBeDrawn[i].image}"><br>
                <span class="info">${toBeDrawn[i].name}</span><br>
                <span class="info">${toBeDrawn[i].price}$</span><a class="info" href="./details.html?id=${i}"><button>Details</button></a>
            </div>
        `;
  }
  document.getElementById('grid').innerHTML = str;
  document.getElementById('products').classList.remove('hidden');
  document.getElementById('loading').classList.add('hidden');
}

async function getDetails() {
  loggedIn();
  adminAccess();
  const target = location.search.substring(4);
  document.getElementById('details').classList.add('hidden');
  document.getElementById('loading').classList.remove('hidden');
  const response = await ajax('GET', `https://final-project-d6167.firebaseio.com/${target}.json`);
  product = JSON.parse(response);
  document.getElementById('addToCartButton').innerHTML = `<button onclick="addToCart('${target}')">Add to Cart</button>`;
  drawDetails();
  document.getElementById('details').classList.remove('hidden');
  document.getElementById('loading').classList.add('hidden');
}

function drawDetails() {
  document.getElementById('detail-image').src = product.image;
  document.getElementById('detail-name').innerHTML = product.name;
  document.getElementById('detail-year').innerHTML = product.year;
  document.getElementById('detail-description').innerHTML = product.genre;
  document.getElementById('detail-price').innerHTML = `${product.price} $`;
  document.getElementById('q').max = product.stock;
}

function addToCart(target) {
  const { name } = product;
  const { price } = product;
  const quantity = parseInt(document.getElementById('q').value);
  let newQuantity = 0;
  let inCart = 0;
  const inStock = product.stock;
  if (Object.keys(localStorage).includes('cart')) {
    cart = JSON.parse(localStorage.cart);
    if (Object.keys(JSON.parse(localStorage.cart)).includes(target)) {
      inCart = JSON.parse(localStorage.getItem('cart'))[target].quantity;
      newQuantity = quantity + inCart;
    } else {
      newQuantity = quantity;
    }
  } else {
    newQuantity = quantity;
  }
  const cartItem = {
    name,
    price,
    quantity: newQuantity,
  };
  if (isNaN(quantity) || quantity === 0) {

  } else if (quantity + inCart < inStock) {
    cart[target] = cartItem;
    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById('popup').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('popup').classList.add('hidden');
    }, 3000);
  } else {
    document.getElementById('invalidOrder').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('invalidOrder').classList.add('hidden');
    }, 3000);
  }
}

function verifyCart(key) {
  const currentProduct = cart[key];
  if (products.hasOwnProperty(key)) {
    if (currentProduct.name !== products[key].name) {
      currentProduct.name = products[key].name;
    }
    if (currentProduct.price !== products[key].price) {
      currentProduct.price = products[key].price;
    }
    if (currentProduct.quantity > products[key].stock) {
      currentProduct.quantity = products[key].stock;
    }
  } else {
    remove(key);
  }
}

function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function getCart() {
  let str = '';
  let total = 0;
  let counter = 0;
  for (const key in cart) {
    if (!isEmpty(cart)) {
      verifyCart(key);
      if (!(products.hasOwnProperty(key))) {
        continue;
      }
    }
    str += `
        <tr>
            <td><span>${cart[key].name}</span></td>
            <td><span>${cart[key].price}</span></td>
            <td><button onclick="increase('${key}')">+</button><span>${cart[key].quantity}</span><button onclick="decrease('${key}')">-</button></td>
            <td><span>${cart[key].price * cart[key].quantity}</span></td>
            <td><span onclick="remove('${key}')">Remove</span></td>
        </tr>
        `;
    total += parseInt(cart[key].price) * parseInt(cart[key].quantity);
    counter += 1;
  }
  document.getElementById('cartBody').innerHTML = str;
  document.getElementById('counter').innerHTML = `Produse: ${counter}`;
  document.getElementById('total').innerHTML = `Total: ${total}`;
  document.getElementById('products').classList.remove('hidden');
  document.getElementById('loading').classList.add('hidden');
}

function increase(key) {
  const inCart = JSON.parse(localStorage.getItem('cart'))[key].quantity;
  const inStock = parseInt(products[key].stock);
  if (inCart < inStock) {
    let quantum = parseInt(JSON.parse(localStorage.getItem('cart'))[key].quantity);
    quantum += 1;
    const cartItem = {
      name: JSON.parse(localStorage.cart)[key].name,
      price: JSON.parse(localStorage.cart)[key].price,
      quantity: quantum,
    };
    cart[key] = cartItem;
    localStorage.setItem('cart', JSON.stringify(cart));
    getCart();
  }
}

function decrease(key) {
  const inCart = JSON.parse(localStorage.getItem('cart'))[key].quantity;
  if (parseInt(inCart) > 1) {
    const quantum = parseInt(JSON.parse(localStorage.getItem('cart'))[key].quantity) - 1;
    const cartItem = {
      name: JSON.parse(localStorage.getItem('cart'))[key].name,
      price: JSON.parse(localStorage.getItem('cart'))[key].price,
      quantity: quantum,
    };
    cart[key] = cartItem;
    localStorage.setItem('cart', JSON.stringify(cart));
    getCart();
  }
}

function remove(key) {
  delete cart[key];
  localStorage.setItem('cart', JSON.stringify(cart));
  getCart();
}

function drawAdminProducts() {
  let str = '';
  for (const i in products) {
    str += `
        <tr>
            <td><img width="25" height="25" src='${products[i].image}'></td>
            <td><span onclick="manage('${i}')">${products[i].name}</span></td>
            <td><span>${products[i].genre}</span></td>
            <td><span>${products[i].price} $</span></td>
            <td><span>${products[i].stock}</span></td>
            <td><span>${products[i].year}</span></td>
            <td><span onclick="removeProduct('${i}')">Remove</span></td>
        </tr>
        `;
  }
  document.getElementById('productsAdmin').innerHTML = str;
  document.getElementById('products').classList.remove('hidden');
  document.getElementById('loading').classList.add('hidden');
}

async function removeProduct(i) {
  const confirmDelete = confirm('Confirm Delete?');
  if (confirmDelete === true) {
    await ajax('DELETE', `https://final-project-d6167.firebaseio.com/${i}.json`);
    getProducts('admin');
  }
}

function manage(key) {
  document.getElementById('products').classList.add('hidden');
  document.getElementById('manage').classList.remove('hidden');
  if (key !== 'add') {
    const product = products[key];
    getData(product);
    keyEdit = key;
  } else {
    getData(null);
  }
}

function getData(product) {
  if (product !== null) {
    document.getElementById('manageImage').value = product.image;
    document.getElementById('manageName').value = product.name;
    document.getElementById('manageGenre').value = product.genre;
    document.getElementById('managePrice').value = product.price;
    document.getElementById('manageStock').value = product.stock;
    document.getElementById('manageYear').value = product.year;
  } else {
    document.getElementById('manageImage').value = '';
    document.getElementById('manageName').value = '';
    document.getElementById('manageGenre').value = '';
    document.getElementById('managePrice').value = '';
    document.getElementById('manageStock').value = '';
    document.getElementById('manageYear').value = '';
  }
}

async function update(action) {
  const image = document.getElementById('manageImage').value;
  const name = document.getElementById('manageName').value;
  const genre = document.getElementById('manageGenre').value;
  const price = document.getElementById('managePrice').value;
  const stock = document.getElementById('manageStock').value;
  const year = document.getElementById('manageYear').value;

  const newProduct = {
    image,
    name,
    genre,
    price,
    stock,
    year,
  };

  if (action === 'cancel') {
    document.getElementById('products').classList.remove('hidden');
    document.getElementById('manage').classList.add('hidden');
    keyEdit = '';
  } else if (keyEdit === '') {
    await ajax('POST', 'https://final-project-d6167.firebaseio.com/.json', JSON.stringify(newProduct));
    getProducts('admin');
    document.getElementById('manage').classList.add('hidden');
  } else {
    await ajax('PUT', `https://final-project-d6167.firebaseio.com/${keyEdit}.json`, JSON.stringify(newProduct));
    getProducts('admin');
    document.getElementById('products').classList.remove('hidden');
    document.getElementById('manage').classList.add('hidden');
    keyEdit = '';
  }
}

function checkout() {
  if (localStorage.getItem('logged_in')) {
    if (!isEmpty(cart)) {
      const buy = confirm('Confirm transaction?');
      if (buy === true) {
        acquisition();
      }
    }
  } else if (!isEmpty(cart)) {
    document.getElementById('log_in_cart').classList.remove('hidden');
  }
}

function hide_log_in() {
  document.getElementById('log_in_cart').classList.add('hidden');
}

function transaction() {
  document.getElementById('processing').classList.add('hidden');
  document.getElementById('products').classList.add('hidden');
  document.getElementById('log_out').classList.add('hidden');
  document.getElementById('transaction').classList.remove('hidden');
}

function checkoutRedirect() {
  window.location.replace('./project.html');
}

async function acquisition() {
  document.getElementById('processing').classList.remove('hidden');
  const ajaxes = [];
  for (key in cart) {
    const updated = products[key];
    updated.stock -= parseInt(cart[key].quantity);
    delete cart[key];
    const mypromise = await ajax('PUT', `https://final-project-d6167.firebaseio.com/${key}.json`, JSON.stringify(updated));
    ajaxes.push(mypromise);
    if (isEmpty(cart)) {
      localStorage.removeItem('cart');
    }
  }
  await Promise.all(ajaxes);
  transaction();
}
