// Находим все кнопки "Подробнее"
const allButtons = document.querySelectorAll('.details-btn');

// Для каждой кнопки добавляем обработчик события
for (let i = 0; i < allButtons.length; i++) {

    const button = allButtons[i];

    // Событие "клик"
    button.addEventListener('click', function() {

        // Находим блок с дополнительной информацией
        const detailsBlock = button.nextElementSibling;

        // Если информация скрыта — показываем её
        if (detailsBlock.style.display === 'none' || detailsBlock.style.display === '') {

            detailsBlock.style.display = 'block';
            button.textContent = 'Скрыть';

        } else {

            // Если информация показана — скрываем её
            detailsBlock.style.display = 'none';
            button.textContent = 'Подробнее';
        }
    });

    // Наведение мыши
    button.addEventListener('mouseover', function() {
        button.style.backgroundColor = 'orange';
    });

    // Уход мыши
    button.addEventListener('mouseout', function() {
        button.style.backgroundColor = '#3498db';
    });
}

// Проверка работы JavaScript
console.log('Скрипт работает!');





// ЛАБОРАТОРНАЯ РАБОТА №5
// Чтение данных из Firestore и вывод списка игр
// =============================================

// Ждем загрузки страницы
document.addEventListener('DOMContentLoaded', function () {

    console.log('✅ Страница загружена');

    // Ждем, пока Firebase инициализируется
    // (в index.html мы установили window.firebaseReady = true)
    waitForFirebase();

});

// Функция ожидания Firebase
function waitForFirebase() {
    if (window.firebaseReady && window.db) {
        console.log('✅ Firebase готов, начинаем загрузку игр');
        loadGames();
    } else {
        // Проверяем каждые 100 мс
        setTimeout(waitForFirebase, 100);
    }
}

// =============================================
// ЗАГРУЗКА ИГР ИЗ FIRESTORE
// =============================================

async function loadGames() {
    try {
        // 1. Импортируем нужные функции
        const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');

        // 2. Получаем ссылку на коллекцию "games"
        const gamesCollection = collection(window.db, 'games');
        console.log('📚 Запрашиваем игры из коллекции "games"...');

        // 3. Получаем все документы из коллекции
        const querySnapshot = await getDocs(gamesCollection);
        console.log('📦 Получено документов:', querySnapshot.size);

        // 4. Преобразуем документы в массив объектов
        const games = [];
        querySnapshot.forEach(function (doc) {
            // doc.id — ID документа
            // doc.data() — данные документа
            games.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('🎮 Игры:', games);

        // 5. Отрисовываем игры на странице
        renderGames(games);

    } catch (error) {
        console.error('❌ Ошибка при загрузке игр:', error);
        showError();
    }
}

// =============================================
// ОТРИСОВКА КАРТОЧЕК ИГР (с кнопками управления)
// =============================================

function renderGames(games) {
    // 1. Находим контейнер для карточек
    const container = document.getElementById('games-container');

    // 2. Очищаем контейнер от старого содержимого
    container.innerHTML = '';

    // 3. Если игр нет — показываем сообщение
    if (games.length === 0) {
        container.innerHTML = '<p>Пока нет игр в базе данных</p>';
        return;
    }

    // 4. Для каждой игры создаем карточку
    games.forEach(function (game) {
        // Создаем HTML-элемент карточки
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-id', game.id); // сохраняем ID для удаления/редактирования

        // Заполняем карточку данными из Firestore
        card.innerHTML = `
            <img src="${game.imageUrl || 'https://via.placeholder.com/280x150'}" 
                 alt="${game.title}" 
                 class="game-image">
            <h3 class="game-title">${game.title}</h3>
            <p class="game-short">Жанр: ${game.genre}</p>
            <p class="game-rating">⭐ Рейтинг: ${game.rating}/10</p>
            
            <!-- КНОПКИ УПРАВЛЕНИЯ -->
            <div class="card-actions">
                <button class="edit-btn" data-id="${game.id}">✏️ Изменить</button>
                <button class="delete-btn" data-id="${game.id}">🗑️ Удалить</button>
            </div>
        `;

        // Добавляем карточку в контейнер
        container.appendChild(card);
    });

    // 5. Навешиваем обработчики на кнопки
    attachCardHandlers();

    console.log('✅ Отрисовано карточек:', games.length);
}



// =============================================
// СООБЩЕНИЕ ОБ ОШИБКЕ
// =============================================

function showError() {
    const container = document.getElementById('games-container');
    container.innerHTML = `
        <p style="color: red;">
            ❌ Ошибка загрузки игр. Проверь консоль (F12).
        </p>
    `;
}



// =============================================
// ЛАБОРАТОРНАЯ №6: Добавление игр через форму
// =============================================


// Ждём загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    
    // Находим форму
    const form = document.getElementById('add-game-form');
    
    if (form) {
        console.log('✅ Форма найдена');
        
        // Добавляем обработчик отправки формы
        form.addEventListener('submit', async function(event) {
            // 1. Отменяем перезагрузку страницы
            event.preventDefault();
            
            console.log('📝 Форма отправлена');
            
            // 2. Собираем данные из полей
            const title = document.getElementById('title').value.trim();
            const genre = document.getElementById('genre').value.trim();
            const rating = parseFloat(document.getElementById('rating').value);
            const imageUrl = document.getElementById('imageUrl').value.trim();
            
            // 3. Проверяем данные
            if (!title || !genre || isNaN(rating)) {
                alert('❌ Заполните все обязательные поля!');
                return;
            }
            
            console.log('📦 Данные:', { title, genre, rating, imageUrl });
            
            // 4. Отправляем в Firestore
            try {
                // Импортируем addDoc
                const { collection, addDoc } = await import(
                    'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
                );
                
                // Добавляем документ
                const docRef = await addDoc(collection(window.db, 'games'), {
                    title: title,
                    genre: genre,
                    rating: rating,
                    imageUrl: imageUrl || 'https://via.placeholder.com/280x150'
                });
                
                console.log('✅ Игра добавлена! ID:', docRef.id);
                
                // 5. Очищаем форму
                form.reset();
                
                // 6. Показываем уведомление
                alert('✅ Игра успешно добавлена!');
                
                // 7. Обновляем список игр
                if (typeof loadGames === 'function') {
                    loadGames();
                }
                
            } catch (error) {
                console.error('❌ Ошибка:', error);
                alert('❌ Ошибка при добавлении: ' + error.message);
            }
        });
    }
});

// =============================================
// ЛАБОРАТОРНАЯ №7: Удаление и редактирование
// =============================================

// ==========================================
// ФУНКЦИЯ УДАЛЕНИЯ
// ==========================================

async function deleteGame(id) {
    console.log('🗑️ Удаляем игру с ID:', id);
    
    // Спрашиваем подтверждение
    const confirmed = confirm('Вы уверены, что хотите удалить эту игру?');
    if (!confirmed) {
        console.log('❌ Удаление отменено');
        return;
    }
    
    try {
        const { doc, deleteDoc } = await import(
            'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
        );
        
        // Удаляем документ по ID
        await deleteDoc(doc(window.db, 'games', id));
        
        console.log('✅ Игра удалена!');
        alert('✅ Игра успешно удалена!');
        
        // Обновляем список
       // Находим карточку по data-id и удаляем её из DOM
const cardToRemove = document.querySelector(`.game-card[data-id="${id}"]`);
if (cardToRemove) {
    cardToRemove.style.transition = 'opacity 0.3s, transform 0.3s';
    cardToRemove.style.opacity = '0';
    cardToRemove.style.transform = 'scale(0.8)';
    
    setTimeout(function() {
        cardToRemove.remove();
        console.log('✅ Карточка удалена из DOM');
    }, 300);
}

        
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        alert('❌ Ошибка при удалении: ' + error.message);
    }
}

// ==========================================
// ФУНКЦИЯ ОТКРЫТИЯ МОДАЛЬНОГО ОКНА
// ==========================================

async function openEditModal(id) {
    console.log('✏️ Открываем редактирование для ID:', id);
    
    try {
        const { doc, getDoc } = await import(
            'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
        );
        
        // Получаем текущие данные документа
        const docSnap = await getDoc(doc(window.db, 'games', id));
        
        if (!docSnap.exists()) {
            alert('❌ Игра не найдена');
            return;
        }
        
        const game = docSnap.data();
        console.log('📦 Текущие данные:', game);
        
        // Заполняем форму текущими данными
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-title').value = game.title || '';
        document.getElementById('edit-genre').value = game.genre || '';
        document.getElementById('edit-rating').value = game.rating || 0;
        document.getElementById('edit-imageUrl').value = game.imageUrl || '';
        
        // Показываем модальное окно
        document.getElementById('edit-modal').classList.add('active');
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        alert('❌ Ошибка загрузки данных: ' + error.message);
    }
}

// ==========================================
// НАВЕШИВАЕМ ОБРАБОТЧИКИ НА КНОПКИ КАРТОЧЕК
// ==========================================

function attachCardHandlers() {
    
    // Кнопки «Удалить»
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const gameId = button.getAttribute('data-id');
            deleteGame(gameId);
        });
    });
    
    // Кнопки «Изменить»
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const gameId = button.getAttribute('data-id');
            openEditModal(gameId);
        });
    });
}

// ==========================================
// ОБРАБОТКА ФОРМЫ РЕДАКТИРОВАНИЯ
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    const editForm = document.getElementById('edit-form');
    const modal = document.getElementById('edit-modal');
    const cancelBtn = document.getElementById('cancel-edit');
    
    // Отправка формы редактирования
    if (editForm) {
        editForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Собираем данные из формы
            const id = document.getElementById('edit-id').value;
            const title = document.getElementById('edit-title').value.trim();
            const genre = document.getElementById('edit-genre').value.trim();
            const rating = parseFloat(document.getElementById('edit-rating').value);
            const imageUrl = document.getElementById('edit-imageUrl').value.trim();
            
            // Проверка
            if (!title || !genre || isNaN(rating)) {
                alert('❌ Заполните все обязательные поля!');
                return;
            }
            
            try {
                const { doc, updateDoc } = await import(
                    'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js'
                );
                
                // Обновляем документ
                await updateDoc(doc(window.db, 'games', id), {
                    title: title,
                    genre: genre,
                    rating: rating,
                    imageUrl: imageUrl
                });
                
                console.log('✅ Игра обновлена!');
                alert('✅ Игра успешно обновлена!');
                
                // Закрываем модальное окно
                modal.classList.remove('active');
                editForm.reset();
                
                // Обновляем список
                loadGames();
                
            } catch (error) {
                console.error('❌ Ошибка обновления:', error);
                alert('❌ Ошибка при обновлении: ' + error.message);
            }
        });
    }
    
    // Кнопка «Отмена»
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            editForm.reset();
        });
    }
    
    // Клик по фону — закрыть модальное окно
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('active');
                editForm.reset();
            }
        });
    }
    
    // Esc — закрыть модальное окно
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            editForm.reset();
        }
    });
});














