let currentPage = 1;
const itemsPerPage = 4;

document.addEventListener('DOMContentLoaded', function () {
    loadUsers(currentPage);
    loadMemberships(currentPage);
    loadTrainers(currentPage);
    loadWorkouts(currentPage);
    loadBookings(currentPage);

    document.getElementById('showUserForm').addEventListener('click', () => showUserForm());
    document.getElementById('showTrainerForm').addEventListener('click', () => showTrainerForm());
    document.getElementById('showWorkoutForm').addEventListener('click', () => showWorkoutForm());
    document.getElementById('showMembershipForm').addEventListener('click', () => showMembershipForm());
    document.getElementById('showBookingForm').addEventListener('click', () => showBookingForm());

    document.getElementById('users-menu').addEventListener('click', () => showSection('users'));
    document.getElementById('workouts-menu').addEventListener('click', () => showSection('workouts'));
    document.getElementById('trainers-menu').addEventListener('click', () => showSection('trainers'));
    document.getElementById('memberships-menu').addEventListener('click', () => showSection('memberships'));
    document.getElementById('bookings-menu').addEventListener('click', () => showSection('bookings'));
    document.getElementById('queries-menu').addEventListener('click', () => showSection('queries'));

    document.getElementById('prev').addEventListener('click', () => loadUsers(currentPage - 1));
    document.getElementById('next').addEventListener('click', () => loadUsers(currentPage + 1));

    document.getElementById('workout-prev').addEventListener('click', () => loadWorkouts(currentPage - 1));
    document.getElementById('workout-next').addEventListener('click', () => loadWorkouts(currentPage + 1));

    document.getElementById('trainer-prev').addEventListener('click', () => loadTrainers(currentPage - 1));
    document.getElementById('trainer-next').addEventListener('click', () => loadTrainers(currentPage + 1));

    document.getElementById('membership-prev').addEventListener('click', () => loadMemberships(currentPage - 1));
    document.getElementById('membership-next').addEventListener('click', () => loadMemberships(currentPage + 1));

    document.getElementById('booking-prev').addEventListener('click', () => loadBookings(currentPage - 1));
    document.getElementById('booking-next').addEventListener('click', () => loadBookings(currentPage + 1));

});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    currentPage = 1;
    switch (sectionId) {
        case "users": loadUsers(currentPage); break;
        case "bookings": loadBookings(currentPage); break;
        case "memberships": loadMemberships(currentPage); break;
        case "trainers": loadTrainers(currentPage); break;
        case "workouts": loadWorkouts(currentPage); break;
    }
}

function showUserForm() {
    document.getElementById('user-form').style.display = 'block';
    loadMembershipsForSelect();
}

function showWorkoutForm() {
    document.getElementById('workout-form').style.display = 'block';
    loadTrainersForSelect();
}

function showTrainerForm() {
    document.getElementById('trainer-form').style.display = 'block';
}

function showMembershipForm() {
    document.getElementById('membership-form').style.display = 'block';
}

function showBookingForm() {
    document.getElementById('booking-form').style.display = 'block';
    loadUsersForSelect();
    loadWorkoutsForSelect();
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JavaScript начинаются с 0
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

async function loadUsers(page) {
    if (page < 1) page = 1;
    currentPage = page;
    const skip = (page - 1) * itemsPerPage;
    fetch(`/users/?skip=${skip}&limit=${itemsPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const userList = document.getElementById('user-list');
            const thead = userList.querySelector('thead');
            const tbody = userList.querySelector('tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            if (data.length > 0) {
                const headers = ['Имя', 'Email', 'Телефон', 'Тип членства', 'Окончание членства', 'Действия'];
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);

                data.forEach(user => {
                    const startDate = new Date(user.membership.start_date);
                    const endDate = new Date(user.membership.end_date);

                    // Проверка, что даты были успешно преобразованы
                    if (isNaN(startDate) || isNaN(endDate)) {
                        console.error('Неверный формат даты:', user.membership.start_date, user.membership.end_date);
                        return;
                    }

                    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-id', user.id);
                    newRow.innerHTML = `
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone}</td>
                        <td>${user.membership.type}</td>
                        <td>${formatDate(endDate)} (${daysDiff} дней)</td>
                        <td class="action-table">
                            <button class="editUser" data-id="${user.id}">Изменить</button>
                            <button class="deleteUser" data-id="${user.id}">Удалить</button>
                        </td>
                    `;
                    tbody.appendChild(newRow);
                });

                document.getElementById('page-info').textContent = `Страница ${currentPage}`;
                document.getElementById('next').disabled = false;
            } else {
                document.getElementById('page-info').textContent = `Страница ${currentPage} (последняя)`;
                document.getElementById('next').disabled = true;
                if (currentPage > 1) {
                    loadUsers(currentPage - 1);
                }
            }

            if (currentPage === 1) {
                document.getElementById('prev').disabled = true;
            } else {
                document.getElementById('prev').disabled = false;
            }

            // Добавляем обработчики событий для кнопок редактирования и удаления
            const editUserButtons = document.getElementsByClassName('editUser');
            const deleteUserButtons = document.getElementsByClassName('deleteUser');

            for (let i = 0; i < editUserButtons.length; i++) {
                editUserButtons[i].addEventListener('click', function () {
                    editUser(this.getAttribute('data-id'));
                });
            }

            for (let i = 0; i < deleteUserButtons.length; i++) {
                deleteUserButtons[i].addEventListener('click', function () {
                    deleteUser(this.getAttribute('data-id'));
                });
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

async function loadWorkouts(page) {
    if (page < 1) page = 1;
    currentPage = page;
    const skip = (page - 1) * itemsPerPage;
    fetch(`/workouts/?skip=${skip}&limit=${itemsPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const workoutList = document.getElementById('workout-list');
            const thead = workoutList.querySelector('thead');
            const tbody = workoutList.querySelector('tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            if (data.length > 0) {
                const headers = ['Название', 'Описание', 'Тренер', 'Дата', 'Время', 'Количество мест', 'Действия'];
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);

                data.forEach(workout => {
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-id', workout.id);
                    newRow.innerHTML = `
                        <td>${workout.name}</td>
                        <td>${workout.description}</td>
                        <td>${workout.trainer.name}</td>
                        <td>${formatDate(new Date(workout.date))}</td>
                        <td>${workout.time}</td>
                        <td>${workout.capacity}</td>
                        <td class="action-table">
                            <button class="editWorkout" data-id="${workout.id}">Изменить</button>
                            <button class="deleteWorkout" data-id="${workout.id}">Удалить</button>
                        </td>
                    `;
                    tbody.appendChild(newRow);
                });

                document.getElementById('workout-page-info').textContent = `Страница ${currentPage}`;
                document.getElementById('workout-next').disabled = false;
            } else {
                document.getElementById('workout-page-info').textContent = `Страница ${currentPage} (последняя)`;
                document.getElementById('workout-next').disabled = true;
                if (currentPage > 1) {
                    loadWorkouts(currentPage - 1);
                }
            }

            if (currentPage === 1) {
                document.getElementById('workout-prev').disabled = true;
            } else {
                document.getElementById('workout-prev').disabled = false;
            }

            // Добавляем обработчики событий для кнопок редактирования и удаления
            const editWorkoutButtons = document.getElementsByClassName('editWorkout');
            const deleteWorkoutButtons = document.getElementsByClassName('deleteWorkout');

            for (let i = 0; i < editWorkoutButtons.length; i++) {
                editWorkoutButtons[i].addEventListener('click', function () {
                    editWorkout(this.getAttribute('data-id'));
                });
            }

            for (let i = 0; i < deleteWorkoutButtons.length; i++) {
                deleteWorkoutButtons[i].addEventListener('click', function () {
                    deleteWorkout(this.getAttribute('data-id'));
                });
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

async function loadTrainers(page) {
    if (page < 1) page = 1;
    currentPage = page;
    const skip = (page - 1) * itemsPerPage;
    fetch(`/trainers/?skip=${skip}&limit=${itemsPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const trainerList = document.getElementById('trainer-list');
            const thead = trainerList.querySelector('thead');
            const tbody = trainerList.querySelector('tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            if (data.length > 0) {
                const headers = ['Имя', 'Специализация', 'Действия'];
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);

                data.forEach(trainer => {
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-id', trainer.id);
                    newRow.innerHTML = `
                        <td>${trainer.name}</td>
                        <td>${trainer.specialization}</td>
                        <td class="action-table">
                            <button class="editTrainer" data-id="${trainer.id}">Изменить</button>
                            <button class="deleteTrainer" data-id="${trainer.id}">Удалить</button>
                        </td>
                    `;
                    tbody.appendChild(newRow);
                });

                document.getElementById('trainer-page-info').textContent = `Страница ${currentPage}`;
                document.getElementById('trainer-next').disabled = false;
            } else {
                document.getElementById('trainer-page-info').textContent = `Страница ${currentPage} (последняя)`;
                document.getElementById('trainer-next').disabled = true;
                if (currentPage > 1) {
                    loadTrainers(currentPage - 1);
                }
            }

            if (currentPage === 1) {
                document.getElementById('trainer-prev').disabled = true;
            } else {
                document.getElementById('trainer-prev').disabled = false;
            }

            // Добавляем обработчики событий для кнопок редактирования и удаления
            const editTrainerButtons = document.getElementsByClassName('editTrainer');
            const deleteTrainerButtons = document.getElementsByClassName('deleteTrainer');

            for (let i = 0; i < editTrainerButtons.length; i++) {
                editTrainerButtons[i].addEventListener('click', function () {
                    editTrainer(this.getAttribute('data-id'));
                });
            }

            for (let i = 0; i < deleteTrainerButtons.length; i++) {
                deleteTrainerButtons[i].addEventListener('click', function () {
                    deleteTrainer(this.getAttribute('data-id'));
                });
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

async function loadMemberships(page) {
    if (page < 1) page = 1;
    currentPage = page;
    const skip = (page - 1) * itemsPerPage;
    fetch(`/memberships/?skip=${skip}&limit=${itemsPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const membershipList = document.getElementById('membership-list');
            const thead = membershipList.querySelector('thead');
            const tbody = membershipList.querySelector('tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            if (data.length > 0) {
                const headers = ['Тип членства', 'Дата начала', 'Дата окончания', 'Действия'];
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);

                data.forEach(membership => {
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-id', membership.id);
                    newRow.innerHTML = `
                        <td>${membership.type}</td>
                        <td>${formatDate(new Date(membership.start_date))}</td>
                        <td>${formatDate(new Date(membership.end_date))}</td>
                        <td class="action-table">
                            <button class="editMembership" data-id="${membership.id}">Изменить</button>
                            <button class="deleteMembership" data-id="${membership.id}">Удалить</button>
                        </td>
                    `;
                    tbody.appendChild(newRow);
                });

                document.getElementById('membership-page-info').textContent = `Страница ${currentPage}`;
                document.getElementById('membership-next').disabled = false;
            } else {
                document.getElementById('membership-page-info').textContent = `Страница ${currentPage} (последняя)`;
                document.getElementById('membership-next').disabled = true;
                if (currentPage > 1) {
                    loadMemberships(currentPage - 1);
                }
            }

            if (currentPage === 1) {
                document.getElementById('membership-prev').disabled = true;
            } else {
                document.getElementById('membership-prev').disabled = false;
            }

            // Добавляем обработчики событий для кнопок редактирования и удаления
            const editMembershipButtons = document.getElementsByClassName('editMembership');
            const deleteMembershipButtons = document.getElementsByClassName('deleteMembership');

            for (let i = 0; i < editMembershipButtons.length; i++) {
                editMembershipButtons[i].addEventListener('click', function () {
                    editMembership(this.getAttribute('data-id'));
                });
            }

            for (let i = 0; i < deleteMembershipButtons.length; i++) {
                deleteMembershipButtons[i].addEventListener('click', function () {
                    deleteMembership(this.getAttribute('data-id'));
                });
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

async function loadBookings(page) {
    if (page < 1) page = 1;
    currentPage = page;
    const skip = (page - 1) * itemsPerPage;
    fetch(`/bookings/?skip=${skip}&limit=${itemsPerPage}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const bookingList = document.getElementById('booking-list');
            const thead = bookingList.querySelector('thead');
            const tbody = bookingList.querySelector('tbody');
            thead.innerHTML = '';
            tbody.innerHTML = '';

            if (data.length > 0) {
                const headers = ['Клиент', 'Тренировка', 'Тренер', 'Дата', 'Время', 'Действия'];
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);

                data.forEach(booking => {
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-id', booking.id);
                    newRow.innerHTML = `
                        <td>${booking.user.name}</td>
                        <td>${booking.workout.name}</td>
                        <td>${booking.workout.trainer.name}</td>
                        <td>${booking.workout.date}</td>
                        <td>${booking.workout.time}</td>
                        <td class="action-table">
                            <button class="editBooking" data-id="${booking.id}">Изменить</button>
                            <button class="deleteBooking" data-id="${booking.id}">Удалить</button>
                        </td>
                    `;
                    tbody.appendChild(newRow);
                });

                document.getElementById('booking-page-info').textContent = `Страница ${currentPage}`;
                document.getElementById('booking-next').disabled = false;
            } else {
                document.getElementById('booking-page-info').textContent = `Страница ${currentPage} (последняя)`;
                document.getElementById('booking-next').disabled = true;
                if (currentPage > 1) {
                    loadBookings(currentPage - 1);
                }
            }

            if (currentPage === 1) {
                document.getElementById('booking-prev').disabled = true;
            } else {
                document.getElementById('booking-prev').disabled = false;
            }

            // Добавляем обработчики событий для кнопок редактирования и удаления
            const editBookingButtons = document.getElementsByClassName('editBooking');
            const deleteBookingButtons = document.getElementsByClassName('deleteBooking');

            for (let i = 0; i < editBookingButtons.length; i++) {
                editBookingButtons[i].addEventListener('click', function () {
                    editBooking(this.getAttribute('data-id'));
                });
            }

            for (let i = 0; i < deleteBookingButtons.length; i++) {
                deleteBookingButtons[i].addEventListener('click', function () {
                    deleteBooking(this.getAttribute('data-id'));
                });
            }
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

function loadMembershipsForSelect() {
    fetch('/memberships/?skip=0&limit=100')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const membershipSelect = document.getElementById('user-membership-id');
            membershipSelect.innerHTML = '<option value="" disabled selected>Выберите членство</option>';
            data.forEach(membership => {
                const option = document.createElement('option');
                option.value = membership.id;
                option.textContent = membership.type;
                membershipSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

function loadTrainersForSelect() {
    fetch('/trainers/?skip=0&limit=100')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const trainerSelect = document.getElementById('workout-trainer-id');
            trainerSelect.innerHTML = '<option value="" disabled selected>Выберите тренера</option>';
            data.forEach(trainer => {
                const option = document.createElement('option');
                option.value = trainer.id;
                option.textContent = trainer.name;
                trainerSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

function loadUsersForSelect() {
    fetch('/users/?skip=0&limit=100')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const userSelect = document.getElementById('booking-user-id');
            userSelect.innerHTML = '<option value="" disabled selected>Выберите пользователя</option>';
            data.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                userSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

function loadWorkoutsForSelect() {
    fetch('/workouts/?skip=0&limit=100')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const workoutSelect = document.getElementById('booking-workout-id');
            workoutSelect.innerHTML = '<option value="" disabled selected>Выберите тренировку</option>';
            data.forEach(workout => {
                const option = document.createElement('option');
                option.value = workout.id;
                option.textContent = workout.name + ' ' + formatDate(new Date(workout.date)) + ' ' + workout.time;
                workoutSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Произошла ошибка при выполнении запроса:', error);
        });
}

document.getElementById('user-create-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    const membership_id = document.getElementById('user-membership-id').value;

    fetch('/users/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, membership_id })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error('Произошла ошибка');
                });
            }
            return response.json();
        })
        .then(data => {
            loadUsers(currentPage);
            document.getElementById('user-form').style.display = 'none';
        });
});

document.getElementById('workout-create-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('workout-name').value;
    const description = document.getElementById('workout-description').value;
    const trainer_id = document.getElementById('workout-trainer-id').value;
    const date = document.getElementById('workout-date').value;
    const time = document.getElementById('workout-time').value;
    const capacity = document.getElementById('workout-capacity').value;

    fetch('/workouts/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, trainer_id, date, time, capacity })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error('Произошла ошибка');
                });
            }
            return response.json();
        })
        .then(data => {
            loadWorkouts(currentPage);
            document.getElementById('workout-form').style.display = 'none';
        })
        .catch(error => {
            alert(error.message);
        });
});

document.getElementById('trainer-create-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('trainer-name').value;
    const specialization = document.getElementById('trainer-specialization').value;

    fetch('/trainers/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, specialization })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error('Произошла ошибка');
                });
            }
            return response.json();
        })
        .then(data => {
            loadTrainers(currentPage);
            document.getElementById('trainer-form').style.display = 'none';
        });
});

document.getElementById('membership-create-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const type = document.getElementById('membership-type').value;
    const start_date = document.getElementById('membership-start-date').value;
    const end_date = document.getElementById('membership-end-date').value;

    fetch('/memberships/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, start_date, end_date })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error('Произошла ошибка');
                });
            }
            return response.json();
        })
        .then(data => {
            loadMemberships(currentPage);
            document.getElementById('membership-form').style.display = 'none';
        });
});

document.getElementById('booking-create-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const user_id = document.getElementById('booking-user-id').value;
    const workout_id = document.getElementById('booking-workout-id').value;

    fetch('/bookings/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, workout_id })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error('Произошла ошибка');
                });
            }
            return response.json();
        })
        .then(data => {
            loadBookings(currentPage);
            document.getElementById('booking-form').style.display = 'none';
        });
});

function deleteUser(userId) {
    fetch(`/users/${userId}`, {
        method: 'DELETE'
    })
        .then(response => {
            // Проверяем, был ли ответ успешным (код статуса 200)
            if (!response.ok) {
                throw new Error(`Ошибка удаления пользователя: ${response.status}`);
            }
            return response.json(); // Если все хорошо, продолжаем обработку ответа
        })
        .then(data => {
            loadUsers(currentPage); // Обновляем список пользователей
            alert('Успешно удалено!'); // Сообщаем об успехе
        })
        .catch(error => {
            // Здесь обрабатываем любые ошибки, включая те, что пришли от сервера
            if (error.message.includes('404')) {
                alert('Пользователь не найден');
            } else if (error.message.includes('400')) {
                alert('Невозможно удалить пользователя, так как существуют связанные записи в таблице bookings.');
            } else {
                alert('Произошла ошибка при удалении пользователя');
            }
            console.error('Ошибка:', error);
        });
}

function deleteWorkout(workoutId) {
    fetch(`/workouts/${workoutId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка удаления тренировки: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadWorkouts(currentPage);
            alert('Успешно удалено!');
        })
        .catch(error => {
            if (error.message.includes('404')) {
                alert('Тренировка не найдена');
            } else if (error.message.includes('400')) {
                alert('Невозможно удалить тренировку, так как существуют связанные записи.');
            } else {
                alert('Произошла ошибка при удалении тренировки');
            }
            console.error('Ошибка:', error);
        });
}

function deleteTrainer(trainerId) {
    fetch(`/trainers/${trainerId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка удаления тренера: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadTrainers(currentPage);
            alert('Успешно удалено!');
        })
        .catch(error => {
            if (error.message.includes('404')) {
                alert('Тренер не найден');
            } else if (error.message.includes('400')) {
                alert('Невозможно удалить тренера, так как существуют связанные записи.');
            } else {
                alert('Произошла ошибка при удалении тренера');
            }
            console.error('Ошибка:', error);
        });
}

function deleteMembership(membershipId) {
    fetch(`/memberships/${membershipId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка удаления членства: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadMemberships(currentPage);
            alert('Успешно удалено!');
        })
        .catch(error => {
            if (error.message.includes('404')) {
                alert('Членство не найдено');
            } else if (error.message.includes('400')) {
                alert('Невозможно удалить членство, так как существуют связанные записи.');
            } else {
                alert('Произошла ошибка при удалении членства');
            }
            console.error('Ошибка:', error);
        });
}

function deleteBooking(bookingId) {
    fetch(`/bookings/${bookingId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка удаления бронирования: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadBookings(currentPage);
            alert('Успешно удалено!');
        })
        .catch(error => {
            if (error.message.includes('404')) {
                alert('Бронирование не найдено');
            } else if (error.message.includes('400')) {
                alert('Невозможно удалить бронирование, так как существуют связанные записи.');
            } else {
                alert('Произошла ошибка при удалении бронирования');
            }
            console.error('Ошибка:', error);
        });
}




async function editUser(userId) {
    const row = document.querySelector(`tr[data-id="${userId}"]`);
    const cells = row.querySelectorAll('td');

    // Преобразуем текст в инпуты
    cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}" class="edit-input">`;
    cells[1].innerHTML = `<input type="email" value="${cells[1].textContent}" class="edit-input">`;
    cells[2].innerHTML = `<input type="text" value="${cells[2].textContent}" class="edit-input">`;
    cells[3].innerHTML = `<select class="edit-input">${await getMembershipOptions(cells[3].textContent)}</select>`;
    cells[4].innerHTML = `<input type="date" value="${formatDateToInput(cells[4].textContent.split(' ')[0])}" class="edit-input">`;

    // Заменяем кнопку "Изменить" на "Сохранить"
    const editButton = cells[5].querySelector('button');
    if (editButton) {
        editButton.disabled = true; // Делаем кнопку "Изменить" неактивной
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.onclick = async () => await saveUser(userId);
        cells[5].appendChild(saveButton);
    } else {
        console.error('Edit button not found for userId:', userId);
    }
}

async function editWorkout(workoutId) {
    let row = document.querySelector(`#workout-list tr[data-id="${workoutId}"]`);
    if (!row) {
        console.error('Row not found for workoutId:', workoutId);
        return;
    }

    let cells = row.querySelectorAll('td');


    // Преобразуем текст в инпуты
    cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}" class="edit-input">`;
    cells[1].innerHTML = `<textarea class="edit-input">${cells[1].textContent}</textarea>`;
    cells[2].innerHTML = `<select class="edit-input">${await getTrainerOptions(cells[2].textContent)}</select>`;

    // Преобразуем дату в правильный формат
    const dateValue = cells[3].textContent.split(' ')[0];
    const formattedDate = formatDateToInput(dateValue);
    cells[3].innerHTML = `<input type="date" value="${formattedDate}" class="edit-input">`;

    // Преобразуем время в правильный формат
    const timeValue = cells[4].textContent.trim();
    cells[4].innerHTML = `<input type="time" value="${timeValue}" class="edit-input">`;

    cells[5].innerHTML = `<input type="number" value="${cells[5].textContent}" class="edit-input">`;

    // Заменяем кнопку "Изменить" на "Сохранить"
    const editButton = cells[6].querySelector('button');
    if (editButton) {
        editButton.disabled = true; // Делаем кнопку "Изменить" неактивной
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.onclick = async () => await saveWorkout(workoutId, row);
        cells[6].appendChild(saveButton);
    } else {
        console.error('Edit button not found for workoutId:', workoutId);
    }
}

function formatDateToInput(dateString) {
    const parts = dateString.split('.');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString;
}

async function editTrainer(trainerId) {
    const row = document.querySelector(`#trainer-list tr[data-id="${trainerId}"]`);
    const cells = row.querySelectorAll('td');

    // Преобразуем текст в инпуты
    cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}" class="edit-input">`;
    cells[1].innerHTML = `<input type="text" value="${cells[1].textContent}" class="edit-input">`;

    // Заменяем кнопку "Изменить" на "Сохранить"
    const editButton = cells[2].querySelector('button');
    if (editButton) {
        editButton.disabled = true; // Делаем кнопку "Изменить" неактивной
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.onclick = async () => await saveTrainer(trainerId);
        cells[2].appendChild(saveButton);
    } else {
        console.error('Edit button not found for workoutId:', trainerId);
    }
}

async function editMembership(membershipId) {
    const row = document.querySelector(`#membership-list tr[data-id="${membershipId}"]`);
    const cells = row.querySelectorAll('td');

    // Преобразуем текст в инпуты
    cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}" class="edit-input">`;
    cells[1].innerHTML = `<input type="date" value="${formatDateToInput(cells[1].textContent.split(' ')[0])}" class="edit-input">`;
    cells[2].innerHTML = `<input type="date" value="${formatDateToInput(cells[2].textContent.split(' ')[0])}" class="edit-input">`;

    // Заменяем кнопку "Изменить" на "Сохранить"
    const editButton = cells[3].querySelector('button');
    if (editButton) {
        editButton.disabled = true; // Делаем кнопку "Изменить" неактивной
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.onclick = async () => await saveMembership(membershipId);
        cells[3].appendChild(saveButton);
    } else {
        console.error('Edit button not found for membershipId:', membershipId);
    }
}

async function editBooking(bookingId) {
    const row = document.querySelector(`#booking-list tr[data-id="${bookingId}"]`);
    const cells = row.querySelectorAll('td');

    // Преобразуем текст в инпуты
    cells[0].innerHTML = `<select class="edit-input">${await getUserOptions(cells[0].textContent)}</select>`;
    cells[1].innerHTML = `<select class="edit-input">${await getWorkoutOptions(cells[1].textContent)}</select>`;

    // Заменяем кнопку "Изменить" на "Сохранить"
    const editButton = cells[5].querySelector('button');
    if (editButton) {
        editButton.disabled = true; // Делаем кнопку "Изменить" неактивной
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.onclick = async () => await saveBooking(bookingId);
        cells[5].appendChild(saveButton);
    } else {
        console.error('Edit button not found for bookingId:', bookingId);
    }
}

async function saveUser(userId) {
    const row = document.querySelector(`#user-list tr[data-id="${userId}"]`);
    const cells = row.querySelectorAll('td');

    const name = cells[0].querySelector('input').value;
    const email = cells[1].querySelector('input').value;
    const phone = cells[2].querySelector('input').value;
    const membership_id = cells[3].querySelector('select').value;
    const end_date = cells[4].querySelector('input').value;

    fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, membership_id, end_date })
    })
        .then(response => response.json())
        .then(async data => {
            await loadUsers(currentPage);
        });
    // Заменяем кнопку "Сохранить" обратно на "Изменить"
    const saveButton = cells[6].querySelector('button');
    if (saveButton) {
        saveButton.remove(); // Удаляем кнопку "Сохранить"
        const editButton = document.createElement('button');
        editButton.textContent = 'Изменить';
        editButton.onclick = () => editUser(userId);
        cells[6].appendChild(editButton);
    }
}

async function saveWorkout(workoutId) {
    const row = document.querySelector(`#workout-list tr[data-id="${workoutId}"]`);
    const cells = row.querySelectorAll('td');

    const name = cells[0].querySelector('input').value;
    const description = cells[1].querySelector('textarea').value;
    const trainer_id = cells[2].querySelector('select').value;
    const date = cells[3].querySelector('input').value;
    const time = cells[4].querySelector('input').value;
    const capacity = cells[5].querySelector('input').value;

    fetch(`/workouts/${workoutId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, trainer_id, date, time, capacity })
    })
        .then(response => response.json())
        .then(async data => {
            await loadWorkouts(currentPage);
        });

    // Заменяем кнопку "Сохранить" обратно на "Изменить"
    const saveButton = cells[6].querySelector('button');
    if (saveButton) {
        saveButton.remove(); // Удаляем кнопку "Сохранить"
        const editButton = document.createElement('button');
        editButton.textContent = 'Изменить';
        editButton.onclick = () => editWorkout(workoutId);
        cells[6].appendChild(editButton);
    }
}

async function saveTrainer(trainerId) {
    const row = document.querySelector(`#trainer-list tr[data-id="${trainerId}"]`);
    const cells = row.querySelectorAll('td');

    const name = cells[0].querySelector('input').value;
    const specialization = cells[1].querySelector('input').value;

    fetch(`/trainers/${trainerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, specialization })
    })
        .then(response => response.json())
        .then(async data => {
            await loadTrainers(currentPage);
        });
    // Заменяем кнопку "Сохранить" обратно на "Изменить"
    const saveButton = cells[3].querySelector('button');
    if (saveButton) {
        saveButton.remove(); // Удаляем кнопку "Сохранить"
        const editButton = document.createElement('button');
        editButton.textContent = 'Изменить';
        editButton.onclick = () => editTrainer(trainerId);
        cells[3].appendChild(editButton);
    }
}

async function saveMembership(membershipId) {
    const row = document.querySelector(`#membership-list tr[data-id="${membershipId}"]`);
    const cells = row.querySelectorAll('td');

    const type = cells[0].querySelector('input').value;
    const start_date = cells[1].querySelector('input').value;
    const end_date = cells[2].querySelector('input').value;

    fetch(`/memberships/${membershipId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, start_date, end_date })
    })
        .then(response => response.json())
        .then(async data => {
            await loadMemberships(currentPage);
        });
    // Заменяем кнопку "Сохранить" обратно на "Изменить"
    const saveButton = cells[6].querySelector('button');
    if (saveButton) {
        saveButton.remove(); // Удаляем кнопку "Сохранить"
        const editButton = document.createElement('button');
        editButton.textContent = 'Изменить';
        editButton.onclick = () => editMembership(membershipId);
        cells[6].appendChild(editButton);
    }
}

async function saveBooking(bookingId) {
    const row = document.querySelector(`#booking-list tr[data-id="${bookingId}"]`);
    const cells = row.querySelectorAll('td');

    const user_id = cells[0].querySelector('select').value;
    const workout_id = cells[1].querySelector('select').value;

    fetch(`/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id, workout_id })
    })
        .then(response => response.json())
        .then(async data => {
            await loadBookings(currentPage);
        });
    // Заменяем кнопку "Сохранить" обратно на "Изменить"
    const saveButton = cells[5].querySelector('button');
    if (saveButton) {
        saveButton.remove(); // Удаляем кнопку "Сохранить"
        const editButton = document.createElement('button');
        editButton.textContent = 'Изменить';
        editButton.onclick = () => editBooking(bookingId);
        cells[5].appendChild(editButton);
    }
}

async function getMembershipOptions(selectedValue) {
    let options = '<option value="" disabled selected>Выберите членство</option>';
    try {
        const response = await fetch('/memberships/?skip=0&limit=100');
        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.statusText);
        }
        const data = await response.json();
        data.forEach(membership => {
            options += `<option value="${membership.id}" ${membership.type === selectedValue ? 'selected' : ''}>${membership.type}</option>`;
        });
    } catch (error) {
        console.error('Произошла ошибка при выполнении запроса:', error);
    }
    return options;
}

async function getTrainerOptions(selectedValue) {
    let options = '<option value="" disabled selected>Выберите тренера</option>';
    try {
        const response = await fetch('/trainers/?skip=0&limit=100');
        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.statusText);
        }
        const data = await response.json();
        data.forEach(trainer => {
            options += `<option value="${trainer.id}" ${trainer.name === selectedValue ? 'selected' : ''}>${trainer.name}</option>`;
        });
    } catch (error) {
        console.error('Произошла ошибка при выполнении запроса:', error);
    }
    return options;
}

async function getUserOptions(selectedValue) {
    let options = '<option value="" disabled selected>Выберите пользователя</option>';
    try {
        const response = await fetch('/users/?skip=0&limit=100');
        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.statusText);
        }
        const data = await response.json();
        data.forEach(user => {
            options += `<option value="${user.id}" ${user.name === selectedValue ? 'selected' : ''}>${user.name}</option>`;
        });
    } catch (error) {
        console.error('Произошла ошибка при выполнении запроса:', error);
    }
    return options;
}

async function getWorkoutOptions(selectedValue) {
    let options = '<option value="" disabled selected>Выберите тренировку</option>';
    try {
        const response = await fetch('/workouts/?skip=0&limit=100')
        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.statusText);
        }
        const data = await response.json();
        data.forEach(workout => {
            options += `<option value="${workout.id}" ${workout.name === selectedValue ? 'selected' : ''}>${workout.name} ${formatDate(new Date(workout.date))} ${workout.time}</option>`;
        });
    } catch (error) {
        console.error('Произошла ошибка при выполнении запроса:', error);
    }
    return options;
}

document.getElementById('showUserForm').addEventListener('click', () => {
    document.getElementById('user-form').style.display = 'block';
    clearForm('user-create-form');
});

document.getElementById('closeUserForm').addEventListener('click', () => {
    document.getElementById('user-form').style.display = 'none';
    clearForm('user-create-form');
});

document.getElementById('showWorkoutForm').addEventListener('click', () => {
    document.getElementById('workout-form').style.display = 'block';
    clearForm('workout-create-form');
});

document.getElementById('closeWorkoutForm').addEventListener('click', () => {
    document.getElementById('workout-form').style.display = 'none';
    clearForm('workout-create-form');
});

document.getElementById('showTrainerForm').addEventListener('click', () => {
    document.getElementById('trainer-form').style.display = 'block';
    clearForm('trainer-create-form');
});

document.getElementById('closeTrainerForm').addEventListener('click', () => {
    document.getElementById('trainer-form').style.display = 'none';
    clearForm('trainer-create-form');
});

document.getElementById('showMembershipForm').addEventListener('click', () => {
    document.getElementById('membership-form').style.display = 'block';
    clearForm('membership-create-form');
});

document.getElementById('closeMembershipForm').addEventListener('click', () => {
    document.getElementById('membership-form').style.display = 'none';
    clearForm('membership-create-form');
});

document.getElementById('showBookingForm').addEventListener('click', () => {
    document.getElementById('booking-form').style.display = 'block';
    clearForm('booking-create-form');
});

document.getElementById('closeBookingForm').addEventListener('click', () => {
    document.getElementById('booking-form').style.display = 'none';
    clearForm('booking-create-form');
});

function clearForm(formId) {
    const form = document.getElementById(formId);
    form.reset();
}

// const btn1 = document.getElementById("btn1");
// const btn2 = document.getElementById("btn2");
// const btn3 = document.getElementById("btn3");
const btn4 = document.getElementById("btn4");
const btn5 = document.getElementById("btn5");
const btn6 = document.getElementById("btn6");

// btn1.addEventListener("click", getWorkoutsByTrainer);
// btn2.addEventListener("click", getBookingsByUser);
// btn3.addEventListener("click", getWorkoutsByDate);
btn4.addEventListener("click", getMostPopularWorkout);
btn5.addEventListener("click", getTrainersWithMostWorkouts);
btn6.addEventListener("click", getUsersWithExpiringMemberships);

function getWorkoutsByTrainer() {
    const trainerId = document.getElementById('workout-trainer-id').value;
    fetch(`/workouts/trainer/${trainerId}`)
        .then(response => response.json())
        .then(data => {
            displayQueryResults(data);
        });
}

function getBookingsByUser() {
    const userId = document.getElementById('booking-user-id').value;
    fetch(`/bookings/user/${userId}`)
        .then(response => response.json())
        .then(data => {
            displayQueryResults(data);
        });
}

function getWorkoutsByDate() {
    const date = prompt('Введите дату (ГГГГ-ММ-ДД):');
    fetch(`/workouts/date/${date}`)
        .then(response => response.json())
        .then(data => {
            displayQueryResults(data);
        });
}

function getMostPopularWorkout() {
    fetch('/queries/most-popular-workout')
        .then(response => response.json())
        .then(data => {
            displayQueryResults(data);
        });
}

function getTrainersWithMostWorkouts() {
    fetch('/queries/trainers-with-most-workouts')
        .then(response => response.json())
        .then(data => {
            displayQueryResults(data);
        });
}

function getUsersWithExpiringMemberships() {
    fetch('/queries/users-with-expiring-memberships')
        .then(response => response.json())
        .then(data => {
            displayQueryResults(data);
        });
}

function displayQueryResults(data) {
    const queryResults = document.getElementById('query-results');
    queryResults.innerHTML = '';

    if (Array.isArray(data) && data.length > 0) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Создаем заголовки таблицы
        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Создаем строки таблицы
        data.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = item[header];
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        queryResults.appendChild(table);
    } else if (typeof data === 'object' && data !== null) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Создаем заголовки таблицы
        const headers = Object.keys(data);
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Создаем строки таблицы
        const row = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = data[header];
            row.appendChild(td);
        });
        tbody.appendChild(row);
        table.appendChild(tbody);

        queryResults.appendChild(table);
    } else {
        const noDataDiv = document.createElement('div');
        noDataDiv.textContent = 'Нет данных для отображения.';
        queryResults.appendChild(noDataDiv);
    }
}

