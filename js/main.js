addEventListener('load', () => {
    pedirInfoFetch(); //Nos aseguramos que se haga la petición cuando la página cargue
})

let vectorIds = [];

const easyMode = document.querySelector('.easy-mode');
const mediumMode = document.querySelector('.medium-mode');
const hardMode = document.querySelector('.hard-mode');
const intentosNum = document.querySelector('.intentos-num');

let intentos = 0;

const difficultyIntentos = {
    facil: 10,
    medio: 6,
    dificil: 3
}

easyMode.addEventListener('click', () => {
    intentosNum.innerText = difficultyIntentos.facil;
})
mediumMode.addEventListener('click', () => {
    intentosNum.innerText = difficultyIntentos.medio;
})
hardMode.addEventListener('click', () => {
    intentosNum.innerText = difficultyIntentos.dificil;
})

intentosNum.innerText = intentosNum.innerText - intentos;

async function pedirInfoFetch() {
    let url = `https://pokeapi.co/api/v2/pokemon/`;
    const v = randomsSinRepetir(1010);

    //Por parámetro le pasamos el random máximo. El mínimo va a ser 1, el primer pokémon empieza con 1.
    //Hacemos esto para concatenarlo al final de la URL, y nos devuelva la repuesta del pokémon. Hacemos que no se repitan para que no aparezca el mismo pokémon
    //en las diferentes peticiones. Así en cada petición osea cuando recargamos la página devuelven diferentes pokémones

    //Este array es para poder desordenar las areas y no queden todas ordenadas en base a los pokémones
    for (let i = 1; i <= 10; i++) {
        url = `https://pokeapi.co/api/v2/pokemon/${v[i - 1]}`; //Petición a pokémon al número que tenga el v en la posicion que diga i-1
        //(porque el vector comienza en la posición 0 y termina en la longitud - 1). El número que tiene v es el random generado

        const respuesta = await fetch(url);
        const resultado = await respuesta.json();
        vectorIds.push([resultado.id, resultado.name]);

        //Pusheamos del pokémon elegido aleaotoriamente el id y el nombre en un array dentro de vectorIds
        //Mandamos el nombre  para poder añadirselo al nombre de cada area y el id para ponerle un id y despues con drag an drop capturar en caso que hayamos acertado
        if (vectorIds.length === 10) {
            const loading = document.querySelector('.loader')
            loading.style.display = 'none'
        }
        cargarProductos(resultado); //Función que carga los productos en el DOM
    }
    cargarArea(vectorIds); //Función que carga las areas, recibe como parámetro  el vectorIds para poder desordenarlo y que las areas queden desordenadas
    dragAndDrup(); //Función que realiza las acciones del minijuego
}

function cargarProductos(res) { //Función que recibe por parametro la respuesta y carga en el dom cada pokémon
    const pokemonesContainer = document.querySelector(".pokemones");

    const div = document.createElement('div');
    div.classList.add("img-div");
    div.id = res.id;

    const img = document.createElement('img');

    const sprites = res.sprites;

    //Estas condiciones son porque hay algunos pokémones en la api que no tienen imagenes nulas entonces la que no sea nula la pongo como src
    //No pude recorrerlo con un for each 

    if (sprites.back_default !== null) img.src = res.sprites.back_default;
    else if (sprites.back_female !== null) img.src = res.sprites.back_female;
    else if (sprites.back_shiny !== null) img.src = res.sprites.back_shiny;
    else if (sprites.back_shiny_female !== null) img.src = res.sprites.back_shiny_female;
    else if (sprites.front_default !== null) img.src = res.sprites.front_default;
    else if (sprites.front_female !== null) img.src = res.sprites.front_female;
    else if (sprites.front_shiny !== null) img.src = res.sprites.front_shiny;
    else if (sprites.front_shiny_female !== null) img.src = res.sprites.front_shiny_female;

    div.append(img);

    pokemonesContainer.append(div);

}

function cargarArea(vec) {
    /* desordenarAreas(vec);  */ //Función que recibe el array de ids con los nombres, y los desordena

    for (let i of vec) { //Recorremos el array de arrays
        const areasContenedor = document.querySelector('.areas');
        const div = document.createElement('div');

        div.classList.add("area");
        div.id = i[0]; //El array en la posición 0  tiene el id del pokémon

        div.innerText = i[1];  //El array en la posición 1 tiene el nombre del pokémon

        areasContenedor.append(div);
    }

}

function desordenarAreas(array) {
    //Función que desordena el array que enviemos por parámetro
    function compareRandom(a, b) {
        return Math.random() - 0.5; //Está función recibe como parametro a y b que es lo requerido por sort()
        // y retorná un numero random entre -0.5 y 0.5 para luego ordenarlo.
        //Como es un numero random que tiene la mismas chances que salga como positivo y negativo lo ordena de forma desordenada
    }

    return array.sort(compareRandom); //El método sort recibe como parámetro una función comparadora en base a, a y b
}

function randomsSinRepetir(rand) { //Algoritmo que genera un random entre 1 y un número que enviemos por parámetro sin repetir
    const vector = [];
    let random;
    let repeat;

    for (let i = 0; i < 10; i++) {

        do {

            random = Math.ceil(Math.random() * rand); //Generamos un random
            repeat = vector.some(indice => indice == random); //Si se encuentra en el array devuelve true
            if (repeat == false) vector[i] = random; //si es false es porque no se encuentra y se asigna el random en la posición en la que estemos

        } while (repeat); //Si se repite no se asigna y y vuelve a ejecutarse el bucle

    }
    return vector;
}

function dragAndDrup() {
    const pokemonesContenedor = document.querySelector("#pokemones");
    const areasContenedor = document.querySelector('.areas');
    const msjIndicacion = document.querySelector('.indicacion');
    const btnReload = document.querySelector('.btn-recargar');

    let contador = 0;

    btnReload.addEventListener('click', () => {
        location.reload();
        btnReload.classList.add('disabled'); //La funcionalidad del boton una vez que ganas es recargar la página para nuevos pokémones
        msjIndicacion.innerText = "Arrastra y suelta";
    })

    pokemonesContenedor.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('id', e.target.parentNode.id);
        //Cuando se empieza a arrastrar generamos un dataTransfer con el id del div que contiene la imagen
    })

    areasContenedor.addEventListener('dragover', (e) => {/*  */
        e.preventDefault();
    })

    areasContenedor.addEventListener('dragleave', (e) => {/*  */
        e.preventDefault(); //Anulamos el comportamiento por defecto del dragover, asi nos permite soltar la información
    })

    areasContenedor.addEventListener('drop', (e) => {
        const dataId = e.dataTransfer.getData('id')
        const areaDrop = e.target;

        let pokemonElegido;

        for (let i of pokemonesContenedor.children) {
            if (i.id == dataId) pokemonElegido = i; //Capturamos el pokémon que elegimos una vez que soltamos en el area
        }

        try {
            if (areaDrop.id == pokemonElegido.id) { //Si el pokémon que elegimos o mejor dicho agarramos y arrastramos coincide con el id
                //del area es porque es el correcto y lo appendeamos y usamos un contador que cuando se appenden todos en su respectiva area es porque ganamos
                contador++;
                areaDrop.innerText = "";
                areaDrop.append(pokemonElegido)
                areaDrop.style.border = '2px solid var(--clr-green)'
                msjIndicacion.innerText = "Arrastra y suelta";
            } else {
                
                if (areaDrop.hasChildNodes()) {
                    intentos++;
                    intentosNum.innerText = intentosNum.innerText - 1;
                }
                areaDrop.style.border = '2px dashed var(--clr-red)'
                msjIndicacion.innerText = "¡Pokémon incorrecto!"; //Sino es porque es incorrecto osea que el que elegimos y arrastramos no coincide con el area
                activeAnimation(msjIndicacion);
                
                if (intentosNum.innerText == 0) {
                    msjIndicacion.innerText = "";
                    contador = 0;
                    btnReload.innerText = 'Perdiste';
                    btnReload.classList.remove('disabled');
                    activeAnimation(msjIndicacion);
                    activeAnimation(btnReload);
                }
            }
        } catch {
            areaDrop.style.border = '2px dashed var(--clr-red)'
            msjIndicacion.innerText = "¡Ya está en el lugar correcto!";
            activeAnimation(msjIndicacion);
            //En caso de que queramos intercambiar las imagenes en las areas genera un error y lo controlamos acá
        }
        if (contador == 10) {
            confeti()
            msjIndicacion.innerText = "";
            contador = 0;
            btnReload.classList.remove('disabled');
            activeAnimation(msjIndicacion);
            activeAnimation(btnReload);
        }


    })

}

function activeAnimation(msjIndicacion) {
    msjIndicacion.style.animation = "none";
    setTimeout(() => {   //Función para activar animación de atención 
        msjIndicacion.style.animation = "shake-horizontal 0.8s cubic-bezier(0.455, 0.030, 0.515, 0.955) both";
    }, 0);
}

const confeti = () => {
    const duration = 15 * 150,
        animationEnd = Date.now() + duration,
        defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // since particles fall down, start a bit higher than random
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
        );
        confetti(
            Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
        );
    }, 250);
}

