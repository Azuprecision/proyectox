document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const sections = {
        search: document.getElementById('search-section'),
        results: document.getElementById('results-section'),
        passenger: document.getElementById('passenger-section'),
        payment: document.getElementById('payment-section'),
        confirmation: document.getElementById('confirmation-section'),
    };

    const forms = {
        search: document.getElementById('search-form'),
        passenger: document.getElementById('passenger-form'),
        payment: document.getElementById('payment-form'),
    };

    const buttons = {
        newSearch: document.getElementById('new-search-btn'),
        bookAnother: document.getElementById('book-another-flight-btn'),
    };

    const containers = {
        flightList: document.getElementById('flight-list'),
        passengerInputs: document.getElementById('passenger-inputs'),
        flightSummaryPassenger: document.getElementById('selected-flight-summary-passenger'),
        flightSummaryPayment: document.getElementById('selected-flight-summary-payment'),
        totalPrice: document.getElementById('total-price'),
        confirmationDetails: document.getElementById('confirmation-details'),
    };
    
    const inputs = {
        origin: document.getElementById('origin'),
        destination: document.getElementById('destination'),
        passengers: document.getElementById('passengers'),
        departureDate: document.getElementById('departure-date'),
        returnDate: document.getElementById('return-date'),
        tripType: document.querySelectorAll('input[name="trip-type"]'),
        returnDateGroup: document.getElementById('return-date-group'),
    };

    // --- ESTADO DE LA APLICACIÓN ---
    let appState = {
        flights: [],
        selectedFlight: null,
        passengerCount: 1,
        passengerDetails: [],
        totalPrice: 0,
        isRoundTrip: false,
    };

    // --- LÓGICA DE NAVEGACIÓN ---
    function showSection(sectionName) {
        Object.values(sections).forEach(section => section.classList.add('hidden'));
        sections[sectionName].classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    // --- LÓGICA DE BÚSQUEDA DE VUELOS ---
    forms.search.addEventListener('submit', (e) => {
        e.preventDefault();
        // Validación de campos
        if (inputs.origin.value === inputs.destination.value) {
            alert("El origen y el destino no pueden ser iguales.");
            return;
        }
        if (appState.isRoundTrip && !inputs.returnDate.value) {
            alert("Por favor, selecciona una fecha de regreso.");
            return;
        }

        appState.passengerCount = parseInt(inputs.passengers.value, 10);
        generateMockFlights();
        displayFlights();
        showSection('results');
    });

    function generateMockFlights() {
        appState.flights = [];
        const airlines = ['AeroNeon', 'MexaGlo', 'Quantum Airlines', 'CyberJet'];
        for (let i = 0; i < 5; i++) {
            let price = Math.floor(Math.random() * (4500 - 1800 + 1)) + 1800;
            if (appState.isRoundTrip) {
                price = Math.floor(price * 1.8); // Precio de ida y vuelta es un poco más barato
            }
            const departureHour = Math.floor(Math.random() * (20 - 6 + 1)) + 6;
            const arrivalHour = departureHour + Math.floor(Math.random() * 3) + 2;
            appState.flights.push({
                id: `AN-${Date.now()}-${i}`,
                airline: airlines[Math.floor(Math.random() * airlines.length)],
                origin: inputs.origin.value,
                destination: inputs.destination.value,
                departureTime: `${String(departureHour).padStart(2, '0')}:00`,
                arrivalTime: `${String(arrivalHour).padStart(2, '0')}:00`,
                price: price,
            });
        }
    }

    function displayFlights() {
        containers.flightList.innerHTML = '';
        if (appState.flights.length === 0) {
            containers.flightList.innerHTML = '<p class="text-center text-gray-400">No se encontraron vuelos para esta ruta.</p>';
            return;
        }
        appState.flights.forEach(flight => {
            const tripBadge = appState.isRoundTrip ? '<span class="text-xs bg-cyan-500 text-gray-900 font-bold py-1 px-2 rounded">IDA Y VUELTA</span>' : '';
            const flightCard = `
                <div class="flight-card grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div class="md:col-span-3">
                        <div class="flex justify-between items-start">
                            <p class="text-xl font-bold neon-text-cyan">${flight.airline}</p>
                            ${tripBadge}
                        </div>
                        <div class="flex items-center space-x-4 mt-2">
                            <div>
                                <p class="text-2xl font-orbitron">${flight.departureTime}</p>
                                <p class="text-sm text-gray-400">${flight.origin.substring(0,3)}</p>
                            </div>
                            <div class="text-cyan-400">➔</div>
                            <div>
                                <p class="text-2xl font-orbitron">${flight.arrivalTime}</p>
                                <p class="text-sm text-gray-400">${flight.destination.substring(0,3)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="md:col-span-2 text-right">
                        <p class="text-3xl font-bold neon-text-magenta">${flight.price.toLocaleString('es-MX')}</p>
                        <p class="text-sm text-gray-400">Precio por pasajero</p>
                        <button class="neon-button-cyan mt-2 w-full md:w-auto" data-flight-id="${flight.id}">Seleccionar</button>
                    </div>
                </div>
            `;
            containers.flightList.innerHTML += flightCard;
        });
    }

    // --- LÓGICA DE SELECCIÓN DE VUELO Y PASAJEROS ---
    containers.flightList.addEventListener('click', (e) => {
        if (e.target.matches('[data-flight-id]')) {
            const flightId = e.target.getAttribute('data-flight-id');
            appState.selectedFlight = appState.flights.find(f => f.id === flightId);
            displayFlightSummary(containers.flightSummaryPassenger);
            generatePassengerInputs();
            showSection('passenger');
        }
    });

    function generatePassengerInputs() {
        containers.passengerInputs.innerHTML = '';
        for (let i = 1; i <= appState.passengerCount; i++) {
            const passengerInput = `
                <div class="p-4 border border-gray-700 rounded-lg">
                    <p class="font-bold neon-text-cyan mb-2">Pasajero ${i}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="name-${i}" class="form-label">Nombre Completo</label>
                            <input type="text" id="name-${i}" class="form-input passenger-name" placeholder="Nombre y Apellido">
                        </div>
                        <div class="form-group">
                            <label for="email-${i}" class="form-label">Email</label>
                            <input type="email" id="email-${i}" class="form--input passenger-email" placeholder="correo@ejemplo.com">
                        </div>
                    </div>
                </div>
            `;
            containers.passengerInputs.innerHTML += passengerInput;
        }
    }

    forms.passenger.addEventListener('submit', (e) => {
        e.preventDefault();
        appState.passengerDetails = [];
        const names = document.querySelectorAll('.passenger-name');
        const emails = document.querySelectorAll('.passenger-email');
        let allValid = true;

        for (let i = 0; i < appState.passengerCount; i++) {
            if (names[i].value.trim() === '' || emails[i].value.trim() === '') {
                allValid = false;
                break;
            }
            appState.passengerDetails.push({ name: names[i].value, email: emails[i].value });
        }

        if (!allValid) {
            alert('Por favor, completa la información de todos los pasajeros.');
            return;
        }

        appState.totalPrice = appState.selectedFlight.price * appState.passengerCount;
        displayFlightSummary(containers.flightSummaryPayment);
        containers.totalPrice.innerHTML = `Total: ${appState.totalPrice.toLocaleString('es-MX')}`;
        showSection('payment');
    });

    // --- LÓGICA DE PAGO Y CONFIRMACIÓN ---
    forms.payment.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validación de fecha de expiración
        const expiryInput = document.getElementById('card-expiry').value;
        const [month, year] = expiryInput.split('/').map(num => parseInt(num, 10));
        const currentYear = new Date().getFullYear() % 100; // Obtener los últimos dos dígitos del año actual
        const currentMonth = new Date().getMonth() + 1; // Enero es 0

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            alert('La fecha de expiración de la tarjeta no es válida.');
            return; // Detiene el proceso si la tarjeta está vencida
        }

        // Si la validación pasa, continúa con la confirmación
        displayConfirmation();
        showSection('confirmation');
    });

    function displayConfirmation() {
        const confirmationCode = `AN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        let passengerListHTML = appState.passengerDetails.map(p => `<li class="text-gray-300">${p.name} (${p.email})</li>`).join('');
        
        const tripDatesHTML = appState.isRoundTrip 
            ? `<p class="mt-2"><strong class="neon-text-cyan">Fechas:</strong> Ida: ${inputs.departureDate.value} | Regreso: ${inputs.returnDate.value}</p>`
            : `<p class="mt-2"><strong class="neon-text-cyan">Fecha:</strong> ${inputs.departureDate.value}</p>`;

        containers.confirmationDetails.innerHTML = `
            <p><strong class="neon-text-cyan">Código de Reservación:</strong> ${confirmationCode}</p>
            <p class="mt-2"><strong class="neon-text-cyan">Vuelo:</strong> ${appState.selectedFlight.airline} de ${appState.selectedFlight.origin} a ${appState.selectedFlight.destination}</p>
            ${tripDatesHTML}
            <p class="mt-2"><strong class="neon-text-cyan">Total Pagado:</strong> <span class="neon-text-magenta font-bold">${appState.totalPrice.toLocaleString('es-MX')}</span></p>
            <div class="mt-4">
                <strong class="neon-text-cyan">Pasajeros:</strong>
                <ul class="list-disc list-inside mt-1">${passengerListHTML}</ul>
            </div>
            <p class="mt-6 text-sm text-gray-400">Hemos enviado una copia de esta confirmación a los correos proporcionados.</p>
        `;
    }

    // --- FUNCIONES DE RESET Y UTILIDAD ---
    function resetApp() {
        appState = {
            flights: [],
            selectedFlight: null,
            passengerCount: 1,
            passengerDetails: [],
            totalPrice: 0,
            isRoundTrip: false,
        };
        forms.search.reset();
        forms.passenger.reset();
        forms.payment.reset();
        document.getElementById('one-way').checked = true;
        handleTripTypeChange();
        showSection('search');
    }

    buttons.newSearch.addEventListener('click', () => showSection('search'));
    buttons.bookAnother.addEventListener('click', resetApp);

    function displayFlightSummary(element) {
        const { airline, origin, destination, departureTime, arrivalTime } = appState.selectedFlight;
        const tripDatesHTML = appState.isRoundTrip 
            ? `<p class="text-sm text-gray-400">Ida: ${inputs.departureDate.value} | Regreso: ${inputs.returnDate.value}</p>`
            : `<p class="text-sm text-gray-400">Ida: ${inputs.departureDate.value}</p>`;

        element.innerHTML = `
            <p class="font-bold text-lg">${airline}</p>
            <p class="text-sm text-gray-300">${origin} ➔ ${destination}</p>
            <p class="text-sm text-gray-400">Horario: ${departureTime} - ${arrivalTime}</p>
            ${tripDatesHTML}
        `;
    }
    
    // --- MANEJO DE TIPO DE VIAJE ---
    function handleTripTypeChange() {
        const selectedType = document.querySelector('input[name="trip-type"]:checked').value;
        appState.isRoundTrip = selectedType === 'round-trip';

        if (appState.isRoundTrip) {
            inputs.returnDateGroup.classList.remove('hidden');
            inputs.returnDate.setAttribute('required', 'required');
        } else {
            inputs.returnDateGroup.classList.add('hidden');
            inputs.returnDate.removeAttribute('required');
            inputs.returnDate.value = '';
        }
    }

    inputs.tripType.forEach(radio => radio.addEventListener('change', handleTripTypeChange));

    // --- INICIALIZACIÓN DE CALENDARIOS ---
    const departurePicker = flatpickr(inputs.departureDate, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disableMobile: true,
        onChange: function(selectedDates) {
            // Cuando se elige una fecha de ida, se establece como la fecha mínima para el regreso
            if (selectedDates[0]) {
                returnPicker.set('minDate', selectedDates[0]);
            }
        }
    });

    const returnPicker = flatpickr(inputs.returnDate, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disableMobile: true,
    });

    // Inicializar estado de tipo de viaje al cargar
    handleTripTypeChange();
});
