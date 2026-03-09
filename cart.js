// Класс для работы с корзиной
class Cart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    // Загрузка корзины из localStorage
    loadCart() {
        const savedCart = localStorage.getItem('altynCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Сохранение корзины в localStorage
    saveCart() {
        localStorage.setItem('altynCart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    // Добавление товара
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.showNotification('Товар добавлен в корзину');
    }

    // Удаление товара
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Товар удален из корзины');
        
        // Обновляем отображение корзины, если мы на странице корзины
        if (window.location.pathname.includes('cart.html')) {
            this.displayCart();
        }
    }

    // Изменение количества
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
            }
        }
        
        // Обновляем отображение корзины, если мы на странице корзины
        if (window.location.pathname.includes('cart.html')) {
            this.displayCart();
        }
    }

    // Получение общей суммы
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Получение количества товаров
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Обновление счетчика в шапке
    updateCartCount() {
        const countElements = document.querySelectorAll('.cart-count');
        const totalItems = this.getTotalItems();
        
        countElements.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'inline' : 'none';
        });
    }

    // Показ уведомления
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gold);
            color: #0a0a0a;
            padding: 15px 30px;
            border-radius: 5px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Очистка корзины
    clearCart() {
        this.items = [];
        this.saveCart();
        
        if (window.location.pathname.includes('cart.html')) {
            this.displayCart();
        }
    }

    // Отображение корзины на странице cart.html
    displayCart() {
        const cartContainer = document.getElementById('cart-items-container');
        const cartSummary = document.getElementById('cart-summary');
        
        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Ваша корзина пуста</p>
                    <a href="index.html" class="btn">Перейти в каталог</a>
                </div>
            `;
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }

        if (cartSummary) cartSummary.style.display = 'block';

        let html = '';
        this.items.forEach(item => {
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>${item.category}</p>
                        <div class="cart-item-price">${item.price.toLocaleString()} ₸</div>
                    </div>
                    <div class="cart-item-actions">
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" onchange="cart.updateQuantity('${item.id}', this.value)">
                        <button class="remove-btn" onclick="cart.removeItem('${item.id}')">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
            `;
        });

        cartContainer.innerHTML = html;

        // Обновляем итоговую сумму
        if (cartSummary) {
            const subtotal = this.getTotal();
            const total = subtotal; // Здесь можно добавить доставку и т.д.
            
            cartSummary.innerHTML = `
                <h3>Ваш заказ</h3>
                <div class="summary-row">
                    <span>Товары (${this.getTotalItems()} шт.)</span>
                    <span>${subtotal.toLocaleString()} ₸</span>
                </div>
                <div class="summary-row">
                    <span>Доставка</span>
                    <span>Бесплатно</span>
                </div>
                <div class="summary-total">
                    <span>Итого:</span>
                    <span>${total.toLocaleString()} ₸</span>
                </div>
                <a href="#order" class="checkout-btn">Оформить заказ</a>
            `;
        }
    }
}

// Инициализация корзины
const cart = new Cart();

// Добавление обработчиков на кнопки "В корзину"
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const product = {
                id: this.dataset.id,
                name: this.dataset.name,
                price: parseInt(this.dataset.price),
                category: this.dataset.category,
                image: this.dataset.image
            };
            
            cart.addItem(product);
        });
    });
});

// Добавляем стили для анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);