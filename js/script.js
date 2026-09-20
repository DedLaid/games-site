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
// ОТРИСОВКА КАРТОЧЕК ИГР
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

        // Заполняем карточку данными из Firestore
        card.innerHTML = `
            <img src="${game.imageUrl || 'https://via.placeholder.com/280x150'}" 
                 alt="${game.title}" 
                 class="game-image">
            <h3 class="game-title">${game.title}</h3>
            <p class="game-short">Жанр: ${game.genre}</p>
            <p class="game-rating">⭐ Рейтинг: ${game.rating}/10</p>
        `;

        // Добавляем карточку в контейнер
        container.appendChild(card);
    });

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


