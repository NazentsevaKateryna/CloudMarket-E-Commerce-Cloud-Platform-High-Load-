# Звіт до Лабораторної роботи № 2
**Дисципліна:** Проєктування архітектури, специфікація та стандарти інженерії  
**Тема:** Побудова C4 Model, UML-моделювання статичної структури та динаміки поведінки (MILESTONE 2)  
**Варіант 1:** E-Commerce Cloud Platform (CloudMarket)  
**Виконавець:** студент(ка) ПІБ, група  
**Репозиторій:** https://github.com/NazentsevaKateryna/CloudMarket-E-Commerce-Cloud-Platform-High-Load-  
**Git-тег:** `lr2`

---

## Розділ 1. C4 Model (Level 1 System Context & Level 2 Container Diagrams)

### 1.1. C4 Level 1: System Context Diagram
Діаграма контексту відображає місце системи CloudMarket в інформаційному середовищі, взаємодію з основними групами користувачів (покупці, продавці) та зовнішніми хмарними сервісами (платіжні шлюзи, поштові служби, провайдери сповіщень).

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
