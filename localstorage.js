/* =====================================
   BASE DE DATOS LOCALSTORAGE
=====================================*/

const DB = {
    usuarios: JSON.parse(localStorage.getItem("usuarios")) || [],
    peliculas: JSON.parse(localStorage.getItem("peliculas")) || [],
    sessionUser: JSON.parse(localStorage.getItem("sessionUser")) || null
};

/* =====================================
   USUARIOS DE PRUEBA (AUTO SEED)
=====================================*/

if (DB.usuarios.length === 0) {

    DB.usuarios.push(
        {
            nombre: "Administrador",
            email: "admin@cineflix.com",
            user: "admin",
            password: "admin123"
        },
        {
            nombre: "Usuario Demo",
            email: "usuario@cineflix.com",
            user: "usuario",
            password: "1234"
        },
        {
            nombre: "Demo",
            email: "demo@cineflix.com",
            user: "demo",
            password: "demo"
        }
    );

    localStorage.setItem("usuarios", JSON.stringify(DB.usuarios));
}

function guardarDB() {
    localStorage.setItem("usuarios", JSON.stringify(DB.usuarios));
    localStorage.setItem("peliculas", JSON.stringify(DB.peliculas));
    localStorage.setItem("sessionUser", JSON.stringify(DB.sessionUser));
}

/* =====================================
   ELEMENTOS DOM
=====================================*/

const loginSection = document.getElementById("loginSection");
const mainContent = document.getElementById("mainContent");

const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnAgregar = document.getElementById("btnAgregar");

const grid = document.getElementById("gridPeliculas");

/* =====================================
   REGISTRO
=====================================*/

formRegistro.addEventListener("submit", e => {
    e.preventDefault();

    const usuario = {
        nombre: inputNombre.value,
        email: inputEmail.value,
        user: inputUserReg.value,
        password: inputPasswordReg.value
    };

    if (DB.usuarios.find(u => u.user === usuario.user))
        return alert("Usuario ya existe");

    DB.usuarios.push(usuario);
    guardarDB();

    alert("Usuario registrado");
    formRegistro.reset();
});

/* =====================================
   LOGIN
=====================================*/

formLogin.addEventListener("submit", e => {
    e.preventDefault();

    const usuario = DB.usuarios.find(
        u => u.user === inputUser.value &&
             u.password === inputPassword.value
    );

    if (!usuario) return alert("Credenciales incorrectas");

    DB.sessionUser = usuario;
    guardarDB();
    iniciarSesion();
});

function iniciarSesion() {
    loginSection.style.display = "none";
    mainContent.style.display = "block";

    btnLogin.style.display = "none";
    btnLogout.style.display = "block";
    btnAgregar.style.display = "block";

    renderPeliculas();
    renderCarrusel();
}

btnLogout.onclick = () => {
    DB.sessionUser = null;
    guardarDB();
    location.reload();
};

if (DB.sessionUser) iniciarSesion();

/* =====================================
   CRUD PELÍCULAS
=====================================*/

let editandoID = null;

btnGuardarPelicula.onclick = () => {

    const pelicula = {
        id: editandoID ?? Date.now(),
        titulo: inputTitulo.value,
        genero: inputGenero.value,
        director: inputDirector.value,
        ano: inputAno.value,
        calificacion: inputCalificacion.value,
        descripcion: inputDescripcion.value,
        imagen: inputImagen.value
    };

    if (editandoID) {
        const index = DB.peliculas.findIndex(p => p.id === editandoID);
        DB.peliculas[index] = pelicula;
    } else {
        DB.peliculas.push(pelicula);
    }

    guardarDB();
    renderPeliculas();
    renderCarrusel();

    editandoID = null;
    formPelicula.reset();

    const modal = bootstrap.Modal.getOrCreateInstance(modalPelicula);
    modal.hide();
};

/* ---------- ELIMINAR ---------- */

function eliminarPelicula(id) {
    DB.peliculas = DB.peliculas.filter(p => p.id !== id);
    guardarDB();
    renderPeliculas();
    renderCarrusel();
}

/* ---------- EDITAR ---------- */

function editarPelicula(id) {

    const p = DB.peliculas.find(p => p.id === id);

    editandoID = id;

    inputTitulo.value = p.titulo;
    inputGenero.value = p.genero;
    inputDirector.value = p.director;
    inputAno.value = p.ano;
    inputCalificacion.value = p.calificacion;
    inputDescripcion.value = p.descripcion;
    inputImagen.value = p.imagen;

    new bootstrap.Modal(modalPelicula).show();
}

/* ---------- DETALLES ---------- */

function verDetalles(id) {

    const p = DB.peliculas.find(p => p.id === id);

    detallesTitulo.textContent = p.titulo;
    detallesGenero.textContent = p.genero;
    detallesDirector.textContent = p.director;
    detallesAno.textContent = p.ano;
    detallesCalificacion.textContent = p.calificacion;
    detallesDescripcion.textContent = p.descripcion;
    detallesImagen.src = p.imagen;

    new bootstrap.Modal(modalDetalles).show();
}

/* =====================================
   RENDER TARJETAS
=====================================*/

function renderPeliculas() {

    const texto = inputBuscar.value.toLowerCase();
    const genero = selectGenero.value;

    const lista = DB.peliculas.filter(p =>
        p.titulo.toLowerCase().includes(texto) &&
        (genero === "" || p.genero === genero)
    );

    grid.innerHTML = "";

    lista.forEach(p => {

        grid.innerHTML += `
        <div class="col-md-4">
            <div class="movie-card">
                <img src="${p.imagen}" class="movie-image">
                <div class="movie-content">

                    <div class="movie-title">${p.titulo}</div>
                    <span class="movie-genre">${p.genero}</span>

                    <div class="movie-meta">${p.director} (${p.ano})</div>
                    <div class="movie-rating">⭐ ${p.calificacion}</div>

                    <div class="movie-description">${p.descripcion}</div>

                    <div class="movie-actions">
                        <button class="btn btn-info btn-sm"
                            onclick="verDetalles(${p.id})">Ver</button>

                        <button class="btn btn-warning btn-sm"
                            onclick="editarPelicula(${p.id})">Editar</button>

                        <button class="btn btn-danger btn-sm"
                            onclick="eliminarPelicula(${p.id})">Eliminar</button>
                    </div>

                </div>
            </div>
        </div>`;
    });
}

/* =====================================
   CARRUSEL
=====================================*/

function renderCarrusel() {

    const cont = document.getElementById("carouselMovies");
    cont.innerHTML = "";

    DB.peliculas.slice(-10).reverse().forEach(p => {

        cont.innerHTML += `
        <div class="slider-movie-card"
             onclick="verDetalles(${p.id})">
            <img src="${p.imagen}">
            <div class="slider-movie-info">
                <h6>${p.titulo}</h6>
            </div>
        </div>`;
    });
}

function scrollSlider(dir) {
    document
        .getElementById("carouselMovies")
        .scrollBy({ left: dir * 300, behavior: "smooth" });
}

/* =====================================
   BUSCADOR
=====================================*/

inputBuscar.oninput = renderPeliculas;
selectGenero.onchange = renderPeliculas;

/* =====================================
   🔥 FIX IMPORTANTE (GLOBAL FUNCTIONS)
=====================================*/

window.editarPelicula = editarPelicula;
window.eliminarPelicula = eliminarPelicula;
window.verDetalles = verDetalles;
window.scrollSlider = scrollSlider;