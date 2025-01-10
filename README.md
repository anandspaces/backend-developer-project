# Backend System Design Using Queue

This is the backend service for the **Backend Developer Program**. The application is built using **Node.js**, **Express**, **PostgreSQL**, and **RabbitMQ** for queue management. It also integrates **Prometheus** for monitoring.

## Features

1. **User Authentication**: Securely authenticate users before they can enqueue requests.
2. **Request Queueing**: Implement a queue for each client to handle requests in a FIFO manner.
3. **Request Processing**: A dedicated worker processes requests from each client’s queue sequentially.
4. **Concurrency Management**: Efficient handling of multiple clients with their dedicated queues.
5. **Scalability**: System capable of handling a growing number of users and requests.
6. **Robustness**: Error handling and recovery mechanisms to avoid data loss.
7. **Logging and Monitoring**: Tracking of request handling and system performance metrics using Prometheus and Grafana.

## Technologies Used

- **Programming Language**: Node.js
- **Queueing System**: RabbitMQ
- **Database**: PostgreSQL
- **Monitoring Tools**: Prometheus
- **Authentication**: JWT
- **Logging**: Winston

## System Architecture

The backend system follows a client-server model where users interact with the server through an API. The system handles request queuing, processing, and logging. The architecture consists of several key components:

### Components:

1. **Client Interface**: Users send requests to the server through a web interface (or API calls).
2. **Server**: The backend server authenticates users, assigns them a queue, and manages request flow.
3. **Queue System**: RabbitMQ manages individual client queues, ensuring requests are processed sequentially.
4. **Worker Processes**: Workers pull requests from the queue and execute them sequentially.
5. **Database**: PostgreSQL stores user information, request logs, and processing status.
6. **Logging**: Winston logs all actions and errors.
7. **Monitoring**: Prometheus collects metrics and Grafana visualizes the system’s performance.

### System Flow Diagram

Below is an overview of how users, client interfaces, servers, queues, and workers interact:

```text
User -> Client Interface -> Server -> Queue (RabbitMQ) -> Worker -> Processed Response -> Client
