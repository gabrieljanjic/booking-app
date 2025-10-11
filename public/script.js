document.addEventListener('DOMContentLoaded', function () {
  checkAuthStatus();
});
let mapsApiKey = null;
let googleMapsLoaded = false;

async function initializeMaps() {
  try {
    const response = await fetch('/api/maps-config');
    const config = await response.json();
    mapsApiKey = config.apiKey;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleMapsLoaded = true;
      console.log('Google Maps loaded successfully');
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps');
    };

    document.head.appendChild(script);
  } catch (err) {
    console.error('Greška pri učitavanju mape:', err);
  }
}

function waitForGoogleMaps() {
  return new Promise(resolve => {
    if (googleMapsLoaded && window.google && window.google.maps) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (googleMapsLoaded && window.google && window.google.maps) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 10000);
  });
}

initializeMaps();

//My rezervations
const accommodation = document.getElementById('accommodation');
const aboutUs = document.getElementById('about-us');
const myRezervations = document.getElementById('my-rezervations');
const addHotel = document.getElementById('add-hotel');
//
const mainSection = document.getElementById('main-section');
const aboutUsSection = document.getElementById('about-us-section');
const myRezervationsSection = document.getElementById('my-rezervations-section');
const addHotelSection = document.getElementById('add-hotel-section');
//
const myRezervationsDiv = document.getElementById('my-rezervations-div');
const aboutUsDiv = document.getElementById('about-us-div');
const addHotelDiv = document.getElementById('add-hotel-div');
//
const hiddenEverything = function () {
  accommodation.classList.remove('active-nav-link');
  aboutUs.classList.remove('active-nav-link');
  myRezervations.classList.remove('active-nav-link');
  addHotel.classList.remove('active-nav-link');
  //
  mainSection.classList.add('d-none');
  aboutUsSection.classList.add('d-none');
  addHotelSection.classList.add('d-none');
  myRezervationsSection.classList.add('d-none');
  //
};

accommodation.addEventListener('click', function () {
  hiddenEverything();
  accommodation.classList.add('active-nav-link');
  mainSection.classList.remove('d-none');
  getAllTours();
});
addHotel.addEventListener('click', function () {
  hiddenEverything();
  addHotel.classList.add('active-nav-link');
  addHotelSection.classList.remove('d-none');
  cleanNewHotelInput();
});
aboutUs.addEventListener('click', function () {
  hiddenEverything();
  aboutUs.classList.add('active-nav-link');
  aboutUsSection.classList.remove('d-none');
});
myRezervations.addEventListener('click', function () {
  hiddenEverything();
  myRezervationsDiv.innerHTML = '';
  myRezervations.classList.add('active-nav-link');
  myRezervationsSection.classList.remove('d-none');
  //const token = localStorage.getItem('token');
  getMyRezervations();
});

const checkAuthStatus = function () {
  fetch('/verify-token', {
    method: 'GET',
    credentials: 'include',
    headers: {
      //Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        showUserUI(data);
      } else {
        removeUserUI();
      }
    });
};

const loginUserBtn = document.getElementById('login-user-btn');
const createUserBtn = document.getElementById('create-user-btn');
const createHotelBtn = document.getElementById('create-hotel-btn');

loginUserBtn.addEventListener('click', function () {
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  fetch('/login', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: loginUsername.value,
      password: loginPassword.value,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        showUserUI(data);
        hiddenEverything();
        accommodation.classList.add('active-nav-link');
        mainSection.classList.remove('d-none');
        toastifySuccess('Korisnik je uspiješno logiran.');
      }
      if (data.status === 'fail') {
        toastifyError(data.message);
      }
    })
    .then(() => {
      const modalEl = document.getElementById('loginUserModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    });
});

const logout = document.getElementById('logout');
logout.addEventListener('click', function () {
  fetch('/logout', {
    method: 'POST',
    credentials: 'include',
  }).then(() => {
    removeUserUI();
    hiddenEverything();
    accommodation.classList.add('active-nav-link');
    mainSection.classList.remove('d-none');
  });
});

createUserBtn.addEventListener('click', function () {
  const name = document.getElementById('user-name');
  const surname = document.getElementById('user-surname');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  fetch('/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.value,
      surname: surname.value,
      username: username.value,
      password: password.value,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        showUserUI(data);
        toastifySuccess('Korisnik je kreiran i logiran.');
      }
      if (data.status === 'fail') {
        toastifyError(data.message);
      }
      console.log(data);
      const modalEl = document.getElementById('createUserModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    })
    .catch(err => {
      console.log('Err:', err);
    });
});

createHotelBtn.addEventListener('click', function () {
  const name = document.getElementById('name');
  const type = document.getElementById('type');
  const street = document.getElementById('street');
  const place = document.getElementById('place');
  const description = document.getElementById('description');
  const image = document.getElementById('image');
  const price = document.getElementById('price');
  const breakfast = document.getElementById('breakfast');
  const parking = document.getElementById('parking');
  const wiFi = document.getElementById('wi-fi');
  const klima = document.getElementById('klima');
  const cleaning = document.getElementById('cleaning');
  const familyRoom = document.getElementById('family-room');
  const smoking = document.getElementById('smoking');

  fetch('/create-hotel', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.value,
      type: type.value,
      street: street.value,
      place: place.value,
      description: description.value,
      image: image.value,
      price: price.value,
      breakfast: breakfast.checked,
      parking: parking.checked,
      wiFi: wiFi.checked,
      klima: klima.checked,
      cleaning: cleaning.checked,
      familyRoom: familyRoom.checked,
      smoking: smoking.checked,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        Swal.fire({
          title: 'Uspijeh!',
          text: 'Hotel uspiješno dodan',
          icon: 'success',
          confirmButtonText: 'Ok',
        });
        cleanNewHotelInput();
        getAllTours();
        hiddenEverything();
        accommodation.classList.add('active-nav-link');
        mainSection.classList.remove('d-none');
        getAllTours();
      }
      if (data.status === 'fail') {
        Swal.fire({
          title: 'Greška!',
          text: data.message,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    });
});
const getAllTours = function () {
  fetch('/get-all-hotels', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(result => {
      console.log('Dohvaćeni hoteli:', result);
      const allHotels = document.getElementById('all-hotels');
      allHotels.innerHTML = '';
      console.log(result);
      const data = result.data;
      data.forEach(el => {
        showAllHotels(el);
      });
    });
};
getAllTours();

const showAllHotels = function (el) {
  const allHotels = document.getElementById('all-hotels');
  const div = document.createElement('div');
  div.innerHTML = `<div style="height:12rem;overflow: hidden;" class="row bg-white rounded-3 shadow eachPost" data-hotel-id="${
    el._id
  }">
      <div class="col-3 p-0">
        <img src="${el.image}" style="width:100%; height:100%; object-fit:cover; rounded-2"/>
      </div>
      <div class="col-6 px-4 py-2 d-flex flex-column justify-content-center">
        <h3 class="mb-2">${el.name}</h3>
        <p class="card-text mb-1 text-muted">${el.place}, Hrvatska</p>
        <div class="d-flex flex-row">
          ${el.breakfast ? '<span class="fs-6"> •Doručak</span>' : ''}
          ${el.parking ? '<span class="fs-6">  Parkiralište</span>' : ''}
          ${el.wiFi ? '<span class="fs-6"> •WiFi</span>' : ''}
          ${el.klima ? '<span class="fs-6"> •Klima-uređaj</span>' : ''}
          ${el.cleaning ? '<span class="fs-6"> •Svakodnevno čišćenje</span>' : ''}
          ${el.familyRoom ? '<span class="fs-6"> •Obiteljska soba</span>' : ''}
          ${el.smoking ? '<span class="fs-6"> •Soba za nepušače</span>' : ''}
        </div>
      </div>
      <div class="col-3 px-4 py-2 d-flex flex-column justify-content-center align-items-end">
        <h4 class="m-0">${el.price}€</h4>
        <small class="mb-3 text-muted">po noći</small>
      </div>
    </div>`;
  allHotels.prepend(div);
  const newHotel = div.querySelector('.eachPost');
  newHotel.addEventListener('click', function () {
    getExactPost(el._id);
  });
};

const getExactPost = function (id) {
  fetch(`/get-exact-post/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => {
      let existingModal = document.getElementById('showExactHotelModal');
      if (existingModal) {
        existingModal.remove();
      }
      getOnePost(data);

      const modal = new bootstrap.Modal(document.getElementById('showExactHotelModal'));
      modal._element.addEventListener('hidden.bs.modal', function () {
        this.remove();
      });
      modal._element.addEventListener('shown.bs.modal', function () {
        waitForGoogleMaps().then(() => {
          if (window.google && window.google.maps) {
            const map = new google.maps.Map(document.getElementById('hotel-map'), {
              center: hotelLatLng,
              zoom: 15,
              mapId: '97f5996dc5746febd87d5e68',
            });
            const marker = new google.maps.marker.AdvancedMarkerElement({
              map: map,
              position: hotelLatLng,
              title: rezervationData.hotelId.name,
            });
          } else {
            console.error('Google Maps nije učitan');
            document.getElementById('hotel-map').innerHTML = '<p class="text-center mt-5">Karta nije dostupna</p>';
          }
        });
      });
      modal.show();
    })
    .catch(err => {
      console.error('Error:', err);
    });
};

function getOnePost(postData) {
  const detailsOfPost = document.createElement('div');
  detailsOfPost.innerHTML = `
    <div class="modal fade" id="showExactHotelModal" tabindex="-1" aria-labelledby="showExactHotelLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white" style="border:none !important" >
            <h1 class="modal-title fs-4" id="showExactHotelLabel">
              <i class="fas fa-hotel me-2"></i>Detalji smještaja
            </h1>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          
          <div class="modal-body p-0">
            <div class="position-relative">
              <img src="${postData.data.image}" 
                   class="w-100" 
                   style="height: 300px; object-fit: cover;" 
                   alt="${postData.data.name}">
            </div>
            <div class="p-4 d-flex flex-column">
              <div class="w-100 d-flex flex-row gap-2 ">
                  <div class="w-50 custom-block">
                    <h5 class="mb-3 text-center fw-semibold">Rezervacija</h5>
                    <input type="text" id="rezervation-date" placeholder="Odaberite datume" class="mb-3">
                    <div class="mb-4">
                      <div class="row g-2">
                        ${
                          postData.data.breakfast
                            ? `
                          <div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-utensils"></i> Doručak uključen
                            </span>
                          </div>`
                            : ''
                        }
                        ${
                          postData.data.parking
                            ? `
                          <div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-car"></i> Besplatno parkiranje
                            </span>
                          </div>`
                            : ''
                        }
                        ${
                          postData.data.wiFi
                            ? `
                          <div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-wifi"></i> Besplatan WiFi
                            </span>
                          </div>`
                            : ''
                        }
                        ${
                          postData.data.klima
                            ? `
                          <div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-fan"></i> Klima uređaj
                            </span>
                          </div>`
                            : ''
                        }
                        ${
                          postData.data.cleaning
                            ? `
                          <div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-broom"></i> Dnevno čišćenje
                            </span>
                          </div>`
                            : ''
                        }
                        ${
                          postData.data.familyRoom
                            ? `
                          <div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-users"></i> Obiteljska soba
                            </span>
                          </div>`
                            : ''
                        }
                        ${
                          postData.data.smoking
                            ? `
                          <div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-smoking"></i> Pušenje dozvoljeno
                            </span>
                          </div>`
                            : `<div class="col-auto">
                            <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                              <i class="las la-smoking-ban"></i> Pušenje zabranjeno
                            </span>
                          </div>`
                        }
                      </div>
                    </div>
                      <div class="card border-0 ">
                        <div class="mt-4 card-body text-center d-flex flex-column justify-content-start">
                          <div class="mb-3 d-flex align-items-baseline justify-content-center">
                            <h3 class="fw-bold mb-1 me-2">${postData.data.price}€</h3>
                            <small class="text-muted tex-bottom">po noći</small>
                          </div>
                          <button type="button" class="blue-white rezervation-btn" data-rezervation-id="${
                            postData.data._id
                          }" id="rezervation-btn"}>
                            <i class="fas fa-calendar-check me-2"></i>Rezerviraj sada
                          </button>
                          <small class="text-muted mt-2">Besplatno otkazivanje do 24h</small>
                          ${
                            postData.user && postData.data.guestId === postData.user
                              ? `<button type="button" data-hotel-id=${postData.data._id} class="btn mt-4 delete-post" >
                                  <i class="lar la-trash-alt"></i>
                            </button>`
                              : ``
                          }
                        </div>
                      </div>
                  </div>
                  <div class="w-50 custom-block">
                    <h5 class="mb-3 text-center fw-bold">Lokacija</h5>
                    <div id="hotel-map" style="height: 250px; width: 100%;"></div>
                      <div  class="d-flex align-items-baseline">
                        <p class="p-0 m-0 mt-2 fs-5 fw-semibold text-dark">${postData.data.name} </p>
                        <p class="mx-1"> - </p>
                        <p class="p-0 m-0 mt-2  text-muted"> ${postData.data.place}</p>
                      </div>
                      <div class="mb-4">
                        <p>${postData.data.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(detailsOfPost);
  console.log('lat:', postData.data.lat);
  console.log('lon:', postData.data.lng);
  const hotelLatLng = { lat: postData.data.lat, lng: postData.data.lng };

  waitForGoogleMaps().then(() => {
    if (window.google && window.google.maps) {
      const map = new google.maps.Map(document.getElementById('hotel-map'), {
        center: hotelLatLng,
        zoom: 15,
        mapId: '97f5996dc5746febd87d5e68',
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: hotelLatLng,
        title: postData.data.name,
      });
    } else {
      console.error('Google Maps nije učitan');
      document.getElementById('hotel-map').innerHTML = '<p class="text-center mt-5">Karta nije dostupna</p>';
    }
  });

  const rezervationBtn = document.getElementById('rezervation-btn');
  rezervationBtn.addEventListener('click', function () {
    const id = rezervationBtn.getAttribute('data-rezervation-id');
    console.log(id);
    const dates = document.getElementById('rezervation-date');
    const datesValue = dates.value;
    const splitDates = datesValue.split('to');
    if (!datesValue) {
      return Swal.fire({
        title: 'Greška!',
        text: 'Morate unijeti datum dolaska i odlaska',
        icon: 'error',
      });
    }
    const checkIn = splitDates[0].trim();
    const checkOut = splitDates[1].trim();
    if (!checkIn || !checkOut) {
      return Swal.fire({
        title: 'Greška!',
        text: 'Morate unijeti datum dolaska i odlaska',
        icon: 'error',
      });
    }
    console.log(checkIn, checkOut);
    fetch('/set-rezervation', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hotelId: id,
        checkIn: checkIn,
        checkOut: checkOut,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.status === 'success') {
          const modal = bootstrap.Modal.getInstance(document.getElementById('showExactHotelModal'));
          modal.hide();
          toastifySuccess('Rezervacija kreirana. Sve rezervacije možete pogledati u mojim rezervacijama');
        }
        if (data.status === 'error') {
          toastifyError(data.message);
        }
      });
  });
}

document.addEventListener('click', function (e) {
  const deleteBtn = e.target.closest('.delete-post');
  if (deleteBtn) {
    const id = deleteBtn.dataset.hotelId;
    fetch(`/delete-post/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        console.log('Uspiješno obrisano');
        if (data.status === 'success') {
          getAllTours();
          const modal = bootstrap.Modal.getInstance(document.getElementById('showExactHotelModal'));
          modal.hide();
        }
      });
  }
});

const getDisabledDates = function (reservations) {
  const disabledDates = [];

  reservations.forEach(reservation => {
    if (reservation.checkIn && reservation.checkOut) {
      const dateRange = getDateRange(reservation.checkIn, reservation.checkOut);
      disabledDates.push(...dateRange);
    }
  });

  return [...new Set(disabledDates)];
};

const getDateRange = function (startDate, endDate) {
  const dates = [];
  const start = new Date(startDate.trim());
  const end = new Date(endDate.trim());

  const currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(new Date(currentDate).toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const initializeCalendar = function (disabledDates) {
  flatpickr('#rezervation-date', {
    mode: 'range',
    minDate: 'today',
    dateFormat: 'd.m.Y',
    locale: 'hr',
    disable: disabledDates,

    // Bolji prikaz
    static: true,
    monthSelectorType: 'static',

    onChange: function (selectedDates, dateStr, instance) {
      console.log('✅ Odabrani datumi:', dateStr);
    },

    onDayCreate: function (dObj, dStr, fp, dayElem) {
      const date = dayElem.dateObj.toISOString().split('T')[0];

      if (disabledDates.includes(date)) {
        dayElem.classList.add('disabled-date');
        dayElem.style.textDecoration = 'line-through';
        dayElem.style.opacity = '0.4';
        dayElem.style.cursor = 'not-allowed';
        dayElem.title = 'Zauzeto';
      }
    },
  });
};

const search = document.getElementById('search');
search.addEventListener('click', function () {
  const destination = document.getElementById('destination').value;
  fetch(`/search-hotel?destination=${destination}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => {
      const allHotels = document.getElementById('all-hotels');
      allHotels.innerHTML = '';
      const results = data.data;
      results.forEach(el => {
        showAllHotels(el);
      });
    });
  console.log(destination);
});

const allLeftPriceFilters = document.querySelectorAll('input[name="price"]');
allLeftPriceFilters.forEach(el => {
  el.addEventListener('change', applyAllFilters);
});

const allLeftTypeFilters = document.querySelectorAll('input[name="type-filter"]');
allLeftTypeFilters.forEach(el => {
  el.addEventListener('change', applyAllFilters);
});
const allLeftBenefitsFilters = document.querySelectorAll('input[name="benefits"]');
allLeftBenefitsFilters.forEach(el => {
  el.addEventListener('change', applyAllFilters);
});

function applyAllFilters() {
  const priceString = [...document.querySelectorAll(`input[name="price"]:checked`)].map(cb => cb.value).join(',');
  //
  const typeString = [...document.querySelectorAll(`input[name="type-filter"]:checked`)].map(cb => cb.value).join(',');
  //
  const benefitsString = [...document.querySelectorAll(`input[name="benefits"]:checked`)].map(cb => cb.value).join(',');
  //
  fetch(`/type-filter?types=${typeString}&prices=${priceString}&benefits=${benefitsString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        console.log(data.data);
        const results = data.data;
        const allHotels = document.getElementById('all-hotels');
        if (results.length > 0) {
          allHotels.innerHTML = '';
          results.forEach(hotel => {
            showAllHotels(hotel);
          });
        } else {
          allHotels.innerHTML = '<p class="text-center fs-5 mt-3">Nema rezultata za odabrane filtere.</p>';
        }
      }
    });
}

const showUserUI = function (data) {
  document.getElementById('all-nav-buttons').classList.add('d-none');
  document.getElementById('user-nav').classList.remove('d-none');
  document.getElementById('user-nav-name').textContent = data.message.name;
  document.getElementById('user-nav-surname').textContent = data.message.surname;
};
const removeUserUI = function () {
  document.getElementById('all-nav-buttons').classList.remove('d-none');
  document.getElementById('user-nav').classList.add('d-none');
};
const cleanNewHotelInput = function () {
  document.getElementById('name').value = '';
  document.getElementById('type').value = '';
  document.getElementById('place').value = '';
  document.getElementById('street').value = '';
  document.getElementById('description').value = '';
  document.getElementById('image').value = '';
  document.getElementById('price').value = '';
  document.getElementById('breakfast').checked = false;
  document.getElementById('parking').checked = false;
  document.getElementById('wi-fi').checked = false;
  document.getElementById('klima').checked = false;
  document.getElementById('cleaning').checked = false;
  document.getElementById('family-room').checked = false;
  document.getElementById('smoking').checked = false;
};

function getMyRezervations() {
  fetch('/my-rezervations', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const allReservations = data.data;
        console.log(allReservations);
        allReservations.forEach(rezervation => {
          const div = document.createElement('div');
          div.innerHTML = `<div style="height:13rem;overflow: hidden; position:relative" class="row bg-white rounded-3 shadow eachPost mb-4 w-75 mx-auto" data-rezervation-id="${
            rezervation._id
          }">
              <div class="col-3 p-0 ">
                <img src="${rezervation.hotelId.image}" style="width:100%; height:100%; object-fit:cover; rounded-2"/>
              </div>
              <div class="col-7 px-4 py-2 d-flex flex-column justify-content-center" >
                <h3 class="mb-2">${rezervation.hotelId.name}</h3>
                <p class="card-text mb-1 text-muted">${rezervation.hotelId.place}, Hrvatska</p>
                <div class="d-flex flex-row">
                  ${rezervation.hotelId.breakfast ? '<span class="fs-6">Doručak • </span>' : ''}
                  ${rezervation.hotelId.parking ? '<span class="fs-6">Parkiralište • </span>' : ''}
                  ${rezervation.hotelId.wiFi ? '<span class="fs-6">WiFi • </span>' : ''}
                  ${rezervation.hotelId.klima ? '<span class="fs-6">Klima-uređaj • </span>' : ''}
                  ${rezervation.hotelId.cleaning ? '<span class="fs-6">Čišćenje • </span>' : ''}
                  ${rezervation.hotelId.familyRoom ? '<span class="fs-6">Obiteljska soba • </span>' : ''}
                  ${rezervation.hotelId.smoking ? '<span class="fs-6">Smoking • </span>' : ''}
                </div>
              </div>
              <div class="col-2 d-flex flex-column justify-content-center align-items-end pe-4"> 
                <h3 class="m-0">${rezervation.hotelId.price}€</h3>
                <small class="mb-3 text-muted">po noći</small>
              </div>
              <span class="badge ${rezervation.confirmed ? 'bg-success text-white' : 'bg-warning text-dark'} 
                border-0 rounded-pill px-3 py-2"
                  style="position:absolute; top:1.5rem; right:0.5rem; width:auto !important">
                ${rezervation.confirmed ? 'Potvrđeno' : 'Potrebno potvrditi'}
              </span>
            </div>`;
          myRezervationsDiv.prepend(div);
          const thisHotel = div.querySelector('.eachPost');
          thisHotel.addEventListener('click', function () {
            const id = this.getAttribute('data-rezervation-id');
            getExactPostRezervations(id);
          });
        });
      }
    });
}

function getExactPostRezervations(id) {
  fetch(`/get-exact-rezervation/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.status === 'success') {
        let existingModal = document.getElementById('showExactHotelModal');
        if (existingModal) {
          existingModal.remove();
        }
        const rezervationData = data.data;
        console.log(rezervationData);
        const detailsOfPost = document.createElement('div');
        detailsOfPost.innerHTML = `
          <div class="modal fade" id="showExactHotelModal" tabindex="-1" aria-labelledby="showExactHotelLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
              <div class="modal-content">
                <div class="modal-header bg-primary text-white" style="border:none !important" >
                  <h1 class="modal-title fs-4" id="showExactHotelLabel">
                    <i class="fas fa-hotel me-2"></i>Detalji smještaja
                  </h1>
                  <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                
                <div class="modal-body p-0">
                  <div class="position-relative">
                    <img src="${rezervationData.hotelId.image}" 
                        class="w-100" 
                        style="height: 300px; object-fit: cover;" 
                        alt="${rezervationData.hotelId.name}">
                  </div>
                  <div class="p-4 d-flex flex-column">
                    <div class="w-100 d-flex flex-row gap-2 ">
                        <div class="w-50 custom-block">
                          <h5 class="mb-3 text-center fw-semibold">Rezervacija</h5>
                          <div class="mb-4">
                            <div class="card p-3">
                              <div class="d-flex justify-content-between align-items-baseline" style="padding: 0 2.5rem">
                                  <div class="circle-small bg-success"></div>
                                  <i class="las la-bed"></i>
                                  <div class="circle-small bg-danger"></div>
                              </div>
                              <div class="d-flex flex-row justify-content-center align-items-center gap-2 px-2">
                                <p class="p-0 mb-0 text-nowrap text-success">Check in</p>
                                <div class="line"></div>
                                <p class="p-0 mb-0 text-nowrap text-danger">Check out</p>
                              </div>
                              <div class="d-flex justify-content-between mb-2">
                                <p class="text-nowrap mb-0">${formatToLocalTime(rezervationData.checkIn)}</p>
                                <p class="p-0 mb-0">${numberOfDays(
                                  rezervationData.checkIn,
                                  rezervationData.checkOut
                                )} noći</p>
                                <p class="text-nowrap mb-0">${formatToLocalTime(rezervationData.checkOut)}</p>
                              </div>
                            </div>
                            <div class="card p-3 pb-1 mb-3 mt-3 ">
                              <div class="d-flex justify-content-between">
                                <p class="text-muted">Broj noći: </p>
                                <p><strong>${numberOfDays(
                                  rezervationData.checkIn,
                                  rezervationData.checkOut
                                )}</strong></p>
                              </div>
                              <div class="d-flex justify-content-between">
                                <p class="text-muted">Cijena po noći: </p>
                                <p><strong> ${rezervationData.hotelId.price} €</strong></p>
                              </div>
                              <div class="line"></div>
                              <div class="d-flex justify-content-between mt-2 mb-0">
                                <p><strong>Ukupno: </strong>
                                <p><strong>${numberOfDaysTimesMoney(
                                  rezervationData.checkIn,
                                  rezervationData.checkOut,
                                  rezervationData.hotelId.price
                                )} €</strong></p>
                              </div>
                            </div>
                            <div class="row g-2">
                              ${
                                rezervationData.hotelId.breakfast
                                  ? `
                                <div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-utensils"></i> Doručak uključen
                                  </span>
                                </div>`
                                  : ''
                              }
                              ${
                                rezervationData.hotelId.parking
                                  ? `
                                <div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-car"></i> Besplatno parkiranje
                                  </span>
                                </div>`
                                  : ''
                              }
                              ${
                                rezervationData.hotelId.wiFi
                                  ? `
                                <div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-wifi"></i> Besplatan WiFi
                                  </span>
                                </div>`
                                  : ''
                              }
                              ${
                                rezervationData.hotelId.klima
                                  ? `
                                <div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-fan"></i> Klima uređaj
                                  </span>
                                </div>`
                                  : ''
                              }
                              ${
                                rezervationData.hotelId.cleaning
                                  ? `
                                <div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-broom"></i> Dnevno čišćenje
                                  </span>
                                </div>`
                                  : ''
                              }
                              ${
                                rezervationData.hotelId.familyRoom
                                  ? `
                                <div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-users"></i> Obiteljska soba
                                  </span>
                                </div>`
                                  : ''
                              }
                              ${
                                rezervationData.hotelId.smoking
                                  ? `
                                <div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-smoking"></i> Pušenje dozvoljeno
                                  </span>
                                </div>`
                                  : `<div class="col-auto">
                                  <span class="badge bg-white border border-secondary text-muted rounded-pill px-3 py-2">
                                    <i class="las la-smoking-ban"></i> Pušenje zabranjeno
                                  </span>
                                </div>`
                              }
                            </div>
                            <div class="row mb-3 mt-3">
                                ${
                                  !rezervationData.confirmed
                                    ? `<div class="col-6">
                                  <button type="button" class="btn btn-primary w-100 confirm-rezervation"  data-id=${rezervationData._id}>Potvrdi rezervaciju</button>
                                </div>`
                                    : `<div></div>`
                                }
                                <div ${!rezervationData.confirmed ? `class="col-6"` : `class="col-12"`}>
                                  <button type="button" class="btn btn-danger w-100 cancel-rezervation-btn" data-id=${
                                    rezervationData._id
                                  }>Otkazi</button>
                                </div>
                            </div> 
                          </div>
                        </div>
                        <div class="w-50 custom-block">
                          <h5 class="mb-3 text-center fw-bold">Lokacija</h5>
                          <div id="hotel-map" style="height: 250px; width: 100%;"></div>
                            <div  class="d-flex align-items-baseline">
                              <p class="p-0 m-0 mt-2 fs-5 fw-semibold text-dark">${rezervationData.hotelId.name} </p>
                              <p class="mx-1"> - </p>
                              <p class="p-0 m-0 mt-2  text-muted"> ${rezervationData.hotelId.place}</p>
                            </div>
                            <div class="mb-4">
                              <p>${rezervationData.hotelId.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        document.body.appendChild(detailsOfPost);
        const hotelLatLng = { lat: rezervationData.hotelId.lat, lng: rezervationData.hotelId.lng };

        const modal = new bootstrap.Modal(document.getElementById('showExactHotelModal'));

        modal._element.addEventListener('hidden.bs.modal', function () {
          this.remove();
        });

        modal._element.addEventListener('shown.bs.modal', function () {
          setTimeout(() => {
            const map = new google.maps.Map(document.getElementById('hotel-map'), {
              center: hotelLatLng,
              zoom: 15,
              mapId: '97f5996dc5746febd87d5e68',
            });
            const marker = new google.maps.marker.AdvancedMarkerElement({
              map: map,
              position: hotelLatLng,
              title: rezervationData.hotelId.name,
            });
          }, 100);
        });
        modal.show();
      }
    });
}
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('cancel-rezervation-btn')) {
    const id = e.target.getAttribute('data-id');
    fetch(`/delete-rezervation/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          myRezervationsDiv.innerHTML = '';
          getMyRezervations();
          toastifySuccess('Rezervacija je uspiješno otkazana');
          const modalEl = document.getElementById('showExactHotelModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal.hide();
        }
      });
  }
  if (e.target.classList.contains('confirm-rezervation')) {
    const id = e.target.getAttribute('data-id');
    fetch(`/confirm-rezervation/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          myRezervationsDiv.innerHTML = '';
          getMyRezervations();
          toastifySuccess('Rezervacija je uspiješno potvrđena');
          const modalEl = document.getElementById('showExactHotelModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal.hide();
        } else {
          toastifyError(data.message || 'Došlo je do greške');
        }
      });
  }
});
function formatToLocalTime(time) {
  const date = new Date(time);
  const formatted = date.toLocaleDateString('hr-HR');
  return formatted;
}
function numberOfDays(day1, day2) {
  const dayOne = new Date(day1);
  const dayTwo = new Date(day2);
  const timeDiff = dayTwo - dayOne;
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  return daysDiff;
}
function numberOfDaysTimesMoney(day1, day2, moneyPerNight) {
  const numberOfNights = numberOfDays(day1, day2);
  return numberOfNights * moneyPerNight;
}
function toastifySuccess(msg) {
  Toastify({
    text: msg,
    duration: 3000,
    close: true,
    gravity: 'top',
    position: 'right',
    backgroundColor: '#198754 ',
  }).showToast();
}
function toastifyWarning(msg) {
  Toastify({
    text: msg,
    duration: 3000,
    close: true,
    gravity: 'top',
    position: 'right',
    backgroundColor: '#ffc107 ',
  }).showToast();
}
function toastifyError(msg) {
  Toastify({
    text: msg,
    duration: 3000,
    close: true,
    gravity: 'top',
    position: 'right',
    backgroundColor: '#dc3545 ',
  }).showToast();
}

/*const hotelLatLng = { lat: rezervation.hotelId.lat, lng: rezervation.hotelId.lng };

          setTimeout(() => {
            const map = new google.maps.Map(document.getElementById('hotel-map-rez'), {
              center: hotelLatLng,
              zoom: 15,
              mapId: '97f5996dc5746febd87d5e68',
            });

            const marker = new google.maps.marker.AdvancedMarkerElement({
              map: map,
              position: hotelLatLng,
              title: postData.name,
            });
          }, 100); */
