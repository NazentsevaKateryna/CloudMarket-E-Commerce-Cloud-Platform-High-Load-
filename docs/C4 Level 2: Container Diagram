C4Container
    title C4 Level 2: Container Diagram — CloudMarket Platform

    Person(customer, "Customer", "Покупець у системі")
    Person(merchant, "Merchant", "Продавець товарів")

    Container(spa, "Single Page Application (SPA)", "React / TypeScript", "Клієнтський веб-інтерфейс маркетплейсу та кабінету мерчанта.")
    Container(mobile, "Mobile Application", "Flutter / Dart", "Мобільний застосунок для iOS та Android.")
    Container(apiGw, "API Gateway / Reverse Proxy", "Nginx / Envoy", "Маршрутизація трафіку, TLS Termination, Rate Limiting, CORS, SSL Offloading.")

    Container(backendApp, "Backend Core Service (Modular Monolith)", "Node.js / Express / TypeScript", "Бізнес-логіка каталогу, замовлень, платежів та складського обліку (Clean Architecture).")

    ContainerDb(redisCache, "In-Memory Cache & Session Store", "Redis 7.x", "Кешування популярного каталогу, кошиків, сесій та блокувань (Redlock).")
    ContainerDb(postgresDb, "Primary Relational Database", "PostgreSQL 16", "Транзакційне збереження користувачів, замовлень, платежів, каталог (ACID, JSONB).")
    Container(kafkaQueue, "Message Broker / Event Streaming", "Apache Kafka", "Асинхронний обмін подіями (OrderCreated, StockReserved, PaymentSucceeded).")
    Container(workerApp, "Background Notification Worker", "Node.js / NestJS", "Фоновий обробник асинхронних черг та генерації листів/сповіщень.")

    System_Ext(paymentGw, "Stripe / LiqPay", "Платіжний еквайринг")

    Rel(customer, spa, "Використовує", "HTTPS")
    Rel(customer, mobile, "Використовує", "HTTPS")
    Rel(merchant, spa, "Керує товарами", "HTTPS")

    Rel(spa, apiGw, "API-запити", "HTTPS / JSON / TLS 1.3")
    Rel(mobile, apiGw, "API-запити", "HTTPS / JSON / TLS 1.3")

    Rel(apiGw, backendApp, "Проксування запитів", "HTTP/2 / Reverse Proxy")

    Rel(backendApp, redisCache, "Кешування та отримання швидких даних", "TCP / RESP Protocol")
    Rel(backendApp, postgresDb, "Читання та запис реляційних даних", "TCP / PostgreSQL Native Protocol")
    Rel(backendApp, kafkaQueue, "Публікація доменних подій", "TCP / Apache Kafka Protocol (SASL_PLAINTEXT)")

    Rel(kafkaQueue, workerApp, "Споживання черги повідомлень", "TCP / Kafka Consumer Group Protocol")
    Rel(backendApp, paymentGw, "Запити на оплату / Webhook", "HTTPS / REST / TLS 1.3")
