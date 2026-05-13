# ShopSphere E-Commerce Platform - Comprehensive Documentation

## 1. Project Overview
ShopSphere is a full-stack, microservices-based e-commerce platform. It provides a robust, scalable architecture with a modern React-based frontend and multiple Spring Boot backend services. The application handles user authentication, product catalog management, cart operations, secure checkout, payment processing (via Razorpay), and asynchronous email notifications.

## 2. Technology Stack
**Frontend:**
- **React 19 & Vite:** Fast development and optimized builds.
- **Redux Toolkit:** State management (auth, cart, products, orders).
- **React Router v7:** Client-side routing.
- **Tailwind CSS:** Utility-first styling for a responsive, modern UI.
- **Axios:** HTTP client with interceptors for JWT injection and automatic token refresh.
- **React Toastify:** For smooth UI toast notifications.

**Backend:**
- **Java 17 & Spring Boot 3.3.2:** Core backend framework.
- **Spring Security & JWT:** Stateless authentication and role-based authorization.
- **Spring Cloud Netflix Eureka:** Service discovery registry.
- **Spring Cloud Config:** Centralized configuration management for all microservices.
- **Spring Cloud Gateway:** API Gateway routing requests to respective microservices.
- **Spring Data JPA & Hibernate:** ORM for database interactions.

**Infrastructure & DevOps:**
- **MySQL 9.1:** Relational database (each microservice has its own logical database).
- **RabbitMQ:** Message broker for asynchronous, event-driven communication.
- **Zipkin & Micrometer:** Distributed tracing for observability across microservices.
- **Docker & Docker Compose:** Containerization and local/production orchestration.
- **AWS EC2:** Cloud hosting instance for production.
- **GitHub Actions:** CI/CD pipeline for automated deployments.

## 3. Microservices Architecture
The project consists of 12 Docker containers: 8 core Java services, 1 React frontend, and 3 infrastructure containers.

### Core Services:
1. **eureka-service (Port 8761):** Acts as the service registry. All other microservices register themselves here, allowing dynamic discovery without hardcoding IP addresses.
2. **config-server (Port 8888):** Centralized configuration server. It provides specific configurations (`application.yml` properties) to all microservices at startup.
3. **api-gateway (Port 8089):** The single entry point for the frontend. It routes incoming API calls to the correct backend service (`/auth/**` -> auth-service, `/orders/**` -> order-service, etc.) and handles CORS.
4. **auth-service (Port 8087):** Handles user registration, login, JWT generation, refresh tokens, and password resets (sends OTPs via email). Connects to `auth_db`.
5. **catalog-service (Port 8088):** Manages the product catalog and categories. Handles fetching product listings and details. Connects to `catalog` db.
6. **order-service (Port 8086):** Manages user shopping carts, calculates totals, handles checkout, processes payments (integrates with Razorpay SDK), and persists orders. Connects to `order_db` and publishes events to RabbitMQ.
7. **notification-service (Port 8085):** Asynchronously listens to RabbitMQ queues for order events and sends confirmation emails to users using `JavaMailSender`. Connects to `notification_db`.
8. **admin-service (Port 8084):** Dedicated service for administrative tasks. Aggregates data from other services to provide an admin dashboard API.

### Infrastructure Services:
9. **mysql-db (Port 3310):** The MySQL instance hosting databases for all microservices. Data is persisted using Docker volumes.
10. **rabbitmq (Port 5672, 15672):** The message broker handling events (e.g., `OrderEvent`).
11. **zipkin (Port 9411):** Collects and displays distributed tracing logs for debugging.
12. **shopsphere-frontend (Port 80):** Containerized React application serving the user interface.

## 4. Complete Application Flow (Start to Finish)

1. **User Registration & Login:**
   - A user signs up via the `/register` page. The `auth-service` saves the user with a securely hashed password.
   - The user logs in via `/login`. `auth-service` verifies credentials and issues a JWT (Access Token) and a Refresh Token. The frontend stores these in `localStorage` and Redux state.
2. **Browsing Products:**
   - The user visits the homepage or products page. The frontend calls `/catalog/products` via the API Gateway.
   - `api-gateway` routes the request to `catalog-service`, which fetches data from the database and returns the JSON payload.
3. **Cart Management:**
   - The user adds a product to the cart. The frontend sends a request to `/orders/cart/items`.
   - `order-service` stores and manages the user's cart state in the `order_db`.
4. **Checkout & Payment:**
   - The user proceeds to checkout, inputs shipping details, and selects a payment method (e.g., Razorpay or COD).
   - The frontend submits the order to `/orders/place`. `order-service` creates an Order entity.
   - If Razorpay is chosen, `order-service` calls the Razorpay API to generate an order ID, which the frontend uses to open the Razorpay payment modal. Upon success, the frontend calls `/orders/{id}/razorpay/verify`.
5. **Order Confirmation & Notification:**
   - Once an order is confirmed and paid (or placed via COD), `order-service` updates the order status to `PAID`/`PACKED`.
   - `order-service` publishes an `OrderEvent` to RabbitMQ.
   - `notification-service` picks up the event from the queue and sends an HTML-formatted order confirmation email to the user.
6. **Admin Management:**
   - An Admin user logs in, and the frontend decodes the JWT to verify the `ADMIN` role.
   - The Admin can access protected routes to manage products (calls `catalog-service` via Gateway) or view all orders across the platform.

## 5. Deployment & CI/CD Pipeline
The project is continuously deployed to an AWS EC2 instance using a robust CI/CD pipeline.
- **Pipeline Tool:** GitHub Actions (`.github/workflows/deploy.yml`).
- **Trigger:** Any commit pushed to the `main` branch.
- **Workflow Steps:**
  1. **Checkout Code:** The GitHub runner checks out the latest repository code.
  2. **Install Dependencies on EC2:** The pipeline uses SSH to connect to the EC2 instance and ensures Docker and Docker Compose are installed.
  3. **File Transfer:** Copies project files via SCP to the EC2 instance's working directory (`~/shopsphere`).
  4. **Build & Deploy:** Pulls the latest code via git on the server, sets necessary environment variables using GitHub Secrets (Database credentials, Mail credentials, Razorpay keys), and executes `docker-compose up -d --build --remove-orphans`. This rebuilds the images and restarts the containers seamlessly.

## 6. Important Evaluation Questions & Answers

**Q1: Why did you choose a Microservices architecture instead of a Monolith?**
**Answer:** Microservices allow for independent scaling, deployment, and technology selection for different features. For instance, if the catalog service experiences high traffic during a sale, we can scale it independently of the order or auth services. It also prevents a single point of failure; if the notification service goes down, users can still place orders seamlessly.

**Q2: How do your microservices communicate with each other?**
**Answer:** We use two types of communication:
1. **Synchronous:** The API Gateway uses REST HTTP calls to route frontend traffic to specific backend services.
2. **Asynchronous:** We use RabbitMQ for event-driven communication. When an order is placed, `order-service` publishes a message, and `notification-service` consumes it asynchronously to send an email without blocking the checkout flow.

**Q3: How is authentication and security handled across multiple services?**
**Answer:** We use stateless JWT (JSON Web Tokens). The `auth-service` authenticates the user and generates a JWT. The frontend attaches this token as an `Authorization: Bearer` header in every subsequent request. The `api-gateway` routes the request, and the individual backend microservices validate the token's signature to extract user roles for authorization. We also implement a Refresh Token mechanism to maintain seamless user sessions without forcing repeated logins.

**Q4: How do you handle distributed tracing and debugging?**
**Answer:** In a microservices architecture, a single frontend request might hit multiple services, making debugging difficult. We integrated Micrometer and Zipkin. A unique Trace ID is generated for every request at the API Gateway, which is passed along in headers to all downstream services. We can view these traces in the Zipkin dashboard to identify bottlenecks, trace errors, and visualize the request flow across the system.

**Q5: What happens if the Notification Service is down when an order is placed?**
**Answer:** Because we use RabbitMQ as a message broker, the `OrderEvent` message stays safely in the queue until it is consumed. The user's checkout process completes without failure. Once the `notification-service` is back online, it will automatically consume the pending messages and send the emails. This ensures no data or notifications are lost.

**Q6: Explain the role of the Eureka Service Registry.**
**Answer:** Eureka acts as a dynamic phonebook for our microservices. Instead of hardcoding static IP addresses and ports, services register themselves with Eureka upon startup. The API Gateway queries Eureka to find the dynamic location of a service (like `catalog-service`) before routing the request. This is critical for scaling in cloud environments where container IPs change frequently.

**Q7: How are you managing environment configurations like database passwords and API keys?**
**Answer:** In the local environment, they are managed via `.env` files and `application.yml`. In production, sensitive variables are stored securely in GitHub Secrets. During the GitHub Actions deployment pipeline, these secrets are securely injected into the EC2 instance as environment variables, which Docker Compose passes into the respective containers.
