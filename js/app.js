let DB;

//variables del form
const form = document.querySelector('form'),
    nombreMascota = document.querySelector('#mascota'),
    nombreCliente = document.querySelector('#cliente'),
    telefono = document.querySelector('#telefono'),
    fecha = document.querySelector('#fecha'),
    hora = document.querySelector('#hora'),
    sintomas = document.querySelector('#sintomas'),
    citas = document.querySelector('#citas'),
    headingAdministra = document.querySelector('#administra');

//esperar el DOM redy (index db debe esperar a que cargue el DOM)
document.addEventListener('DOMContentLoaded', () => {
    //cerar la base de datos
    let crearDB = window.indexedDB.open('citas', 1);
    //si hay un error enviarlo a la consola
    crearDB.onerror = function() {
            console.log('Hubo un error');
        }
        //si todo esta bine muestra en conola y asigna la bd
    crearDB.onsuccess = function() {
        // console.log('Todo Listo!!');
        //asingar ala base de datos
        DB = crearDB.result;
        // console.log(DB);
        mostrarCitas();
    }

    //este metodo solo corre una vez y es ideal para cerar el Schema
    crearDB.onupgradeneeded = function(e) {
            // el Evento es el mismo base de datos.
            let db = e.target.result;
            //definir el ObjectStore, toma 2 parametros nombre de la bdd y ocpiones //keyPath es el indice de la bd
            let objectStore = db.createObjectStore('citas', { keyPath: 'key', autoIncrement: true });
            //crear indices y campos de la base de datos
            objectStore.createIndex('mascota', 'mascota', { unique: false });
            objectStore.createIndex('cliente', 'cliente', { unique: false });
            objectStore.createIndex('telefono', 'telefono', { unique: false });
            objectStore.createIndex('fecha', 'fecha', { unique: false });
            objectStore.createIndex('hora', 'hora', { unique: false });
            objectStore.createIndex('sintomas', 'sintomas', { unique: false });
        }
        //cuando el formulario se envia
    form.addEventListener('submit', agregarDatos);

    function agregarDatos(e) {
        e.preventDefault();
        const nuevaCita = {
                mascota: nombreMascota.value,
                cliente: nombreCliente.value,
                telefono: telefono.value,
                fecha: fecha.value,
                hora: hora.value,
                sintomas: sintomas.value
            }
            //console.log(nuevaCita);
            //en index DB se tultilizan transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        //console.log(objectStore);
        let peticion = objectStore.add(nuevaCita);
        console.log(peticion);
        peticion.onsuccess = () => {
            form.reset();
            mostrarCitas();
        }
        transaction.oncompleate = () => {
            console.log('Cita Agregada');
            mostrarCitas();
        }
        transaction.onerror = () => {
            console.log('Hubo un error');
        }

    }

    function mostrarCitas() {
        //limpiar las citas anteriores
        while (citas.firstChild) {
            citas.removeChild(citas.firstChild);
        }
        //ceramos un ojestore
        let objectStore = DB.transaction('citas').objectStore('citas');

        //esto reotrna una peticion
        objectStore.openCursor().onsuccess = function(e) {
            //cursor se va a ubicar ne le registro indicado para acceder a los daos.
            let cursor = e.target.result;
            //recorrer registros en bd
            if (cursor) {
                let citaHtml = document.createElement('li');
                citaHtml.setAttribute('data-cita-id', cursor.value.key);
                citaHtml.classList.add('list-group-item');
                citaHtml.innerHTML = `
                <p class ="font-weight-bold"> Mascota: <span class="font-weight-normal">
                ${cursor.value.mascota}</span></p>
                <p class ="font-weight-bold"> Cliente: <span class="font-weight-normal">
                ${cursor.value.cliente}</span></p>
                <p class ="font-weight-bold"> Telefono: <span class="font-weight-normal">
                ${cursor.value.telefono}</span></p>
                <p class ="font-weight-bold"> Fecha: <span class="font-weight-normal">
                ${cursor.value.fecha}</span></p>
                <p class ="font-weight-bold"> Hora: <span class="font-weight-normal">
                ${cursor.value.hora}</span></p>
                <p class ="font-weight-bold"> Sintomas: <span class="font-weight-normal">
                ${cursor.value.sintomas}</span></p>`;
                //boton de borrrar
                const botonBorrar = document.createElement('button');
                botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
                botonBorrar.innerHTML = '<span aria-hidden="true">x</span> Borrar';
                botonBorrar.onclick = borrarCita;
                citaHtml.appendChild(botonBorrar);


                //append en el padre
                citas.appendChild(citaHtml);
                //tomar los proximos registros
                cursor.continue();

            } else {
                if (!citas.firstChild) {
                    //cuando no hay registros
                    headingAdministra.textContent = 'Agregar Citas para comenzar';
                    let listado = document.createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent = 'No hay registros';
                    citas.appendChild(listado);
                } else {
                    headingAdministra.textContent = 'Administra tus citas';
                }
            }
        }

    }

    function borrarCita(e) {
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));
        //en index DB se tultilizan transacciones
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');
        //console.log(objectStore);
        let peticion = objectStore.delete(citaID);

        transaction.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            console.log(`Se ellimino la cita con el ID `);

            if (!citas.firstChild) {
                //cuando no hay registros
                headingAdministra.textContent = 'Agregar Citas para comenzar';
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay registros';
                citas.appendChild(listado);
            } else {
                headingAdministra.textContent = 'Administra tus citas';
            }
        }
    }
});