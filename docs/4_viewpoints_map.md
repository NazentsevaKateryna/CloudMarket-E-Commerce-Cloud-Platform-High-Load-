# 4. Карта архітектурних ракурсів (Architectural Viewpoints Map)

Відповідність архітектурних ракурсів згідно зі стандартом **ISO/IEC/IEEE 42010:2022** моделям представлення системи CloudMarket:

| Viewpoint (Ракурс) | View (Вигляд / Артефакт) | Нотація | Зацікавлені сторони (Stakeholders) | Призначення артефакту |
| :--- | :--- | :--- | :--- | :--- |
| **Context Viewpoint** | C4 Level 1: System Context Diagram | C4 Model | Business Owner, Мерчанти, Покупці, Інтегратори | Фіксація меж платформи CloudMarket та її зв'язків із клієнтами, банками, поштовими службами та аналітикою. |
| **Container Viewpoint** | C4 Level 2: Container Diagram | C4 Model / PlantUML | Software Architect, Lead Dev, DevOps | Відображення високорівневих контейнерів: SPA, Mobile App, API Gateway, Сервіс Додатків, Redis Cache, Postgres DB, Kafka. |
| **Structural Viewpoint** | UML Component / Class Diagram | UML 2.5 | Developers, Module Owners | Внутрішній поділ моноліту на доменні шари (Clean Architecture: Domain, Application, Infrastructure). |
| **Behavioral Viewpoint** | UML Sequence Diagram | UML 2.5 | Backend Developers, QA Engineers | Відображення послідовності обробки замовлення: перевірка залишків на складі $\rightarrow$ блокування коштів $\rightarrow$ публікація події `OrderCreated`. |
| **Deployment Viewpoint** | UML Deployment Diagram | UML 2.5 / C4 Deployment | DevOps, SRE, Security Engineers | Схема розміщення в хмарі: Kubernetes Cluster, Ingress Controller, Load Balancers, Multi-AZ реплікація СУБД. |
