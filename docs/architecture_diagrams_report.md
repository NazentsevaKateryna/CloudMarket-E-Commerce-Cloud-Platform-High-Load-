# Звіт до Лабораторної роботи № 2
**Дисципліна:** Проєктування архітектури, специфікація та стандарти інженерії  
**Тема:** Побудова C4 Model, UML-моделювання статичної структури та динаміки поведінки (MILESTONE 2)  
**Варіант 1:** E-Commerce Cloud Platform (CloudMarket)  
**Виконавець:** Назенцева Катерина  
**Репозиторій:** [https://github.com/NazentsevaKateryna/CloudMarket-E-Commerce-Cloud-Platform-High-Load-](https://github.com/NazentsevaKateryna/CloudMarket-E-Commerce-Cloud-Platform-High-Load-)  
**Git-тег:** `lr2`

---

## Розділ 1. C4 Model (Level 1 System Context & Level 2 Container Diagrams)

### 1.1. C4 Level 1: System Context Diagram
Діаграма контексту відображає взаємодію маркетплейсу CloudMarket з основними групами користувачів (покупці, продавці) та зовнішніми інтеграційними сервісами.

```mermaid
C4Context
    title C4 Level 1: System Context Diagram — CloudMarket Platform

    Person(customer, "Customer (Покупець)", "Користувач, який шукає товари, формує кошик, оформлює та оплачує замовлення.")
    Person(merchant, "Merchant (Мерчант)", "Продавець, який керує асортиментом, цінами та складськими залишками.")

    System(cloudMarket, "CloudMarket Platform", "High-Load маркетплейс електронної комерції: каталог, кошик, замовлення, склад та аналітика.")

    System_Ext(paymentGw, "External Payment Gateway (Stripe/LiqPay)", "Проведення фінансових транзакцій, 3D-Secure перевірка, повернення коштів.")
    System_Ext(deliveryApi, "Postal & Delivery Services (Nova Poshta/DHL)", "Розрахунок вартості логістики, трекінг посилок, доставка товарів.")
    System_Ext(notificationGw, "Notification Gateway (Twilio / SendGrid)", "Зовнішній сервіс відправки SMS-повідомлень, transactional email та Web Push.")

    Rel(customer, cloudMarket, "Переглядає товари, оплачує замовлення", "HTTPS / Browser / Mobile App")
    Rel(merchant, cloudMarket, "Оновлює номенклатуру, переглядає продажі", "HTTPS / Browser (Merchant Portal)")

    Rel(cloudMarket, paymentGw, "Ініціює списання та перевіряє статус", "HTTPS / REST API / TLS 1.3")
    Rel(cloudMarket, deliveryApi, "Реєструє накладні (ТТН) та отримує статус", "HTTPS / JSON API")
    Rel(cloudMarket, notificationGw, "Передає тексти повідомлень для відправки", "HTTPS / REST API")
```

---

### 1.2. C4 Level 2: Container Diagram
Діаграма контейнерів системи CloudMarket із зазначенням стеків технологій та конкретних мережевих протоколів комунікації (HTTPS/TLS 1.3, RESP, TCP Native, Kafka Protocol).

```mermaid
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
```

---

## Розділ 2. Проєктування статичної структури (UML Component & Class Diagrams)

### 2.1. UML Component Diagram (C4 Level 3) для сервісу замовлень та складу
Діаграма відображає надані (Provided — Ball `O-`) та запитувані (Required — Socket `)-`) інтерфейси ядра платформи.

```mermaid
graph TD
    subgraph ClientLayer [Клієнтський шар]
        Gateway[API Gateway]
    end

    subgraph OrderInventoryComponent [Component: Order & Inventory Management]
        direction TB
        OrderController["OrderController<br/>(REST Handler)"]
        OrderService["OrderService<br/>(Application Logic)"]
        StockManager["StockManager<br/>(Inventory Domain)"]
        OrderRepo["OrderRepository<br/>(Infrastructure Layer)"]
        EventBusPublisher["EventBusPublisher<br/>(Integration)"]
    end

    subgraph ExternalTargets [Зовнішні сервіси та сховища]
        Postgres[(PostgreSQL DB)]
        KafkaBroker[[Apache Kafka Broker]]
        PaymentSvc[Payment Integration Service]
    end

    %% Інтерфейси Provided та Required
    IOrderApi("Provided: IOrderApi (REST/HTTP)")
    IPaymentPort("Required: IPaymentPort (Internal Contract)")
    IDbPort("Required: IOrderRepository (SQL)")
    IEventPort("Required: IEventPublisher (AMQP/Kafka)")

    Gateway -->|HTTP POST/GET| IOrderApi
    IOrderApi --- OrderController

    OrderController --> OrderService
    OrderService --> StockManager
    OrderService --> IPaymentPort
    IPaymentPort -.-> PaymentSvc

    OrderService --> IDbPort
    IDbPort --- OrderRepo
    OrderRepo -->|SQL Queries| Postgres

    StockManager --> IEventPort
    IEventPort --- EventBusPublisher
    EventBusPublisher -->|Kafka Producer| KafkaBroker
```

---

### 2.2. UML Domain Class Diagram (Доменна модель платформи)
Діаграма класів для 6 сутностей домену із зазначенням специфікаторів доступу (`+`, `-`), типів атрибутів, методів та кратності зв'язків.

```mermaid
classDiagram
    direction TB

    class User {
        -UUID id
        -String email
        -String passwordHash
        -String fullName
        -UserRole role
        -DateTime createdAt
        +register() Boolean
        +login(String password) String
        +updateProfile(ProfileDTO data) Void
    }

    class Merchant {
        -UUID merchantId
        -String storeName
        -String taxNumber
        -Float rating
        -Boolean isVerified
        +createProduct(ProductDTO dto) Product
        +updateStock(UUID productId, Int count) Void
    }

    class Product {
        -UUID id
        -String title
        -String description
        -Decimal price
        -String sku
        -Boolean isActive
        +updatePrice(Decimal newPrice) Void
        +archive() Void
    }

    class OrderItem {
        -UUID id
        -UUID productId
        -Int quantity
        -Decimal unitPrice
        +calculateSubtotal() Decimal
    }

    class Order {
        -UUID id
        -UUID customerId
        -DateTime orderDate
        -OrderStatus status
        -Decimal totalAmount
        -String deliveryAddress
        +addItem(Product product, Int quantity) Void
        +removeItem(UUID itemId) Void
        +calculateTotal() Decimal
        +cancel(String reason) Boolean
    }

    class Payment {
        -UUID id
        -UUID orderId
        -Decimal amount
        -PaymentStatus status
        -String transactionRef
        -PaymentMethod method
        +processPayment() Boolean
        +refund(Decimal amount) Boolean
    }

    User <|-- Merchant : Спадкування (Inheritance)
    Merchant "1" o-- "0..*" Product : Агрегація (Aggregation)
    Order "1" *-- "1..*" OrderItem : Композиція (Composition)
    Product "1" <-- "0..*" OrderItem : Асоціація (Association)
    User "1" --> "0..*" Order : Створює (Association)
    Order "1" -- "1" Payment : 1-to-1 Асоціація (Association)
```

---

## Розділ 3. Проєктування динамічної поведінки (UML Sequence & State Machine)

### 3.1. UML Sequence Diagram: Оформлення та оплата замовлення (оператори alt, opt, loop)

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant GW as API Gateway
    participant OS as Order Service
    participant IS as Inventory Service
    participant PS as Payment Gateway
    participant KB as Kafka Broker

    C->>GW: POST /api/v1/orders (items, address, promoCode)
    GW->>OS: route(CreateOrderCommand)
    
    activate OS
    opt Якщо передано промокод (Promo Code Applied)
        OS->>OS: applyDiscount(promoCode)
    end

    loop Перевірка наявності для кожної позиції кошика (each item in cart)
        OS->>IS: checkAvailability(productId, qty)
        activate IS
        IS-->>OS: stockStatus (Available / OutOfStock)
        deactivate IS
    end

    OS->>PS: processCardCharge(orderTotal, cardToken)
    activate PS

    alt Оплата успішна (HTTP 200 OK — Payment Authorized)
        PS-->>OS: TransactionResponse(Status: Success, TxID: "tx_9981")
        OS->>IS: reserveStock(items)
        OS->>KB: emitEvent("OrderPaidEvent", payload)
        OS-->>GW: 201 Created (OrderId, "Оплачено")
        GW-->>C: Відображення екрану успішного замовлення
    else Відхилено банком (HTTP 402 — Payment Failed / Insufficient Funds)
        PS-->>OS: TransactionResponse(Status: Declined, Reason: "No funds")
        OS->>OS: markOrderAsPaymentFailed()
        OS-->>GW: 402 Payment Required (ErrorCode: "ERR_PAYMENT_DECLINED")
        GW-->>C: Помилка: "Недостатньо коштів на картці"
    end
    deactivate PS
    deactivate OS
```

---

### 3.2. UML Sequence Diagram: Автентифікація клієнта (обробка 401 Unauthorized)

```mermaid
sequenceDiagram
    autonumber
    actor User as Клієнт
    participant GW as API Gateway
    participant Auth as Auth Service
    participant Redis as Redis Cache
    participant DB as PostgreSQL DB

    User->>GW: POST /api/v1/auth/login (email, password)
    GW->>Auth: validateCredentials(email, password)
    activate Auth

    Auth->>DB: findUserByEmail(email)
    DB-->>Auth: UserRecord(hash, salt, role)

    Auth->>Auth: verifyPasswordHash(password, hash)

    alt Пароль невірний або користувача не існує
        Auth-->>GW: 401 Unauthorized ("Invalid credentials")
        GW-->>User: Помилка 401: Невірний логін або пароль
    else Облікові дані вірні
        Auth->>Auth: generateTokens(AccessJWT, RefreshToken)
        Auth->>Redis: saveRefreshToken(userId, refreshToken, TTL=14d)
        Redis-->>Auth: OK
        Auth-->>GW: 200 OK (AccessToken in Body, RefreshToken in HttpOnly Cookie)
        GW-->>User: 200 OK (Успішний вхід)
    end
    deactivate Auth
```

---

### 3.3. UML State Machine Diagram: Життєвий цикл замовлення (Order Entity)

```mermaid
stateDiagram-v2
    [*] --> Draft : Створення кошика (Cart created)
    
    Draft --> PendingPayment : Оформлення (Checkout initiated)
    
    PendingPayment --> Paid : [Оплата підтверджена] / reserveStock()
    PendingPayment --> Cancelled : [Таймаут оплати 15 хв / Відмова банку]
    
    Paid --> Processing : Передано на комплектацію складу
    Paid --> Refunded : Клієнт скасував до відправки / refundPayment()
    
    Processing --> Shipped : Передано в службу доставки / assignTrackingId()
    
    Shipped --> Delivered : Клієнт отримав посилку [Підпис отримання]
    Shipped --> Returned : Відмова клієнта при врученні / returnToWarehouse()
    
    Returned --> Refunded : Товар повернено на склад
    
    Delivered --> [*]
    Cancelled --> [*]
    Refunded --> [*]
```

---

## Розділ 4. Відповіді на контрольні запитання

### 1. У чому полягають фундаментальні відмінності між нотацією C4 Model та класичним стандартом UML 2.5?
* **C4 Model** фокусується на ієрархічному масштабуванні архітектури («концепція карт Google Maps»)[cite: 24]: містить фіксовані рівні (Context, Container, Component, Code), прості геометричні блоки та зрозуміла всім стейкхолдерам.
* **UML 2.5** — формальний стандартизований набір із 14 типів діаграм зі суворою семантикою символів (ромбики агрегації/композиції, типи ліній, порти, стереотипи)[cite: 24, 25].

### 2. Яким чином на C4 Container Diagram відображаються виклики між синхронними (REST/gRPC) та асинхронними (AMQP/Kafka) контейнерами?
* **Синхронні:** позначаються суцільною прямою стрілкою від споживача до сервісу із зазначенням блокуючого мережевого протоколу (`HTTPS / JSON`, `HTTP/2`)[cite: 25].
* **Асинхронні:** продюсер шле подію в брокер (`Publish Event` по `Kafka Protocol / TCP`), а консьюмер вичитує повідомлення з черги (`Consume Event`)[cite: 26]. Між продюсером та консьюмером немає прямого зв'язку.

### 3. Що означають поняття Provided («Ball») та Required («Socket») інтерфейсів на діаграмі компонентів UML?
* **Provided Interface («Ball», `O-`):** контракт/інтерфейс, який компонент відкриває назовні та надає іншим (наприклад, REST API чи контролер)[cite: 25, 26].
* **Required Interface («Socket», `)-`):** контракт/інтерфейс, необхідний компоненту від зовнішніх модулів або БД для виконання своєї роботи (наприклад, DB Repository чи виклик платіжного шлюзу)[cite: 25, 26].

### 4. У чому відмінність між агрегацією та композицією на діаграмі класів? Приклад з доменної моделі.
* **Композиція (`*--`):** дочірній об'єкт не може існувати без батьківського (видалення батька знищує дітей)[cite: 26]. *Приклад:* `Order` та `OrderItem` (позиція замовлення не існує окремо від замовлення).
* **Агрегація (`o--`):** дочірній об'єкт має автономний життєвий цикл[cite: 26]. *Приклад:* `Merchant` та `Product` (товар залишається в базі маркетплейсу, навіть якщо продавець тимчасово деактивує акаунт).

### 5. Як на діаграмі послідовностей (Sequence Diagram) моделюється умовне виконання (alt vs opt) та циклічна обробка (loop)?
* **`alt` (Alternatives):** повне розгалуження (як `if-else`)[cite: 25, 26]. Блок розділений пунктиром, виконується строго одна з гілок (успішна оплата або помилка)[cite: 25, 26].
* **`opt` (Option):** умовний блок без альтернативи (як простий `if`)[cite: 25, 26]. Виконується лише якщо умова істинна (наприклад, застосування знижки по промокоду)[cite: 25, 26].
* **`loop`:** циклічне повторення дій для колекції (як цикл `for-each`)[cite: 25, 26].
