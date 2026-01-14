-- Пользователи системы
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL DEFAULT '',
    last_name VARCHAR(255) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);



-- Telegram боты
CREATE TABLE bots (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    token VARCHAR(255) UNIQUE NOT NULL DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'maintenance'
    username VARCHAR(50) NOT NULL DEFAULT '',
    owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tg_offset BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- Шаги сценария тг бота
CREATE TABLE steps (
    id BIGSERIAL PRIMARY KEY,
    number INT NOT NULL,
    bot_id BIGINT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    text TEXT NOT NULL DEFAULT '',
    coord_x SMALLINT NOT NULL DEFAULT 0,
    coord_y SMALLINT NOT NULL DEFAULT 0,
    button_uuids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_bot_step_number ON steps (bot_id, number);



-- Кнопки в шаге бота
CREATE TABLE buttons (
    uuid TEXT PRIMARY KEY,
    text TEXT NOT NULL DEFAULT '',
    next_step INT NOT NULL,
    bot_id BIGINT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



--- На каком шаге сейчас юзер
CREATE TABLE tg_user_steps (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    number INT NOT NULL,
    bot_id BIGINT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_tg_user_steps_username_bot_id ON tg_user_steps (username, bot_id);



--- Товары в мини апп
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    bot_id BIGINT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    picture_urls TEXT[] NOT NULL DEFAULT '{}',
    preview_url TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);



-- Товары в корзине пользователя
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    bot_id BIGINT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(bot_id, username, product_id)
);

CREATE UNIQUE INDEX idx_cart_items_bot_username ON cart_items(bot_id, username, product_id);



-- Заказы
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    bot_id BIGINT NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    total_amount INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Элементы заказа
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase INTEGER NOT NULL, -- цена на момент покупки
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
