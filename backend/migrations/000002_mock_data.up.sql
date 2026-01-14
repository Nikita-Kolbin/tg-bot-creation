-- 1. Создаем тестового пользователя
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
    ('string', 'test@example.com', 'ecb252044b5ea0f679ee78ec1a12904739e2904d', 'Test', 'User')
ON CONFLICT (username) DO NOTHING;

-- 2. Создаем тестового бота для пользователя (получаем ID пользователя = 1)
INSERT INTO bots (name, description, token, status, username, owner_user_id) VALUES
    ('Test Bot', 'Тестовый бот для мини-приложения', '1234567890:ABCdefGhIjKlMnOpQrStUvWxYz', 'active', '@testbot', 1)
ON CONFLICT (token) DO NOTHING;

-- 3. Создаем 3 тестовых товара для бота (bot_id = 1)
INSERT INTO products (bot_id, name, description, picture_urls, preview_url, price, active) VALUES
(1, 'iPhone 15 Pro', 'Смартфон Apple iPhone 15 Pro 256GB Natural Titanium',
'{"https://example.com/iphone1.jpg", "https://example.com/iphone2.jpg"}',
'https://example.com/iphone-preview.jpg', 129990, true),

(1, 'MacBook Air M2', 'Ноутбук Apple MacBook Air 13 M2 16/512 Space Gray',
'{"https://example.com/macbook1.jpg", "https://example.com/macbook2.jpg"}',
'https://example.com/macbook-preview.jpg', 149990, true),

(1, 'AirPods Pro 2', 'Беспроводные наушники Apple AirPods Pro 2 USB-C',
'{"https://example.com/airpods1.jpg"}',
'https://example.com/airpods-preview.jpg', 24990, true);