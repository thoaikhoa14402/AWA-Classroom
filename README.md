# INSTRUCTIONS
> First, to build a project you need to install **nodejs v20** with **docker** and **docker compose** first.

Let's stated !!

## Database Migration
> Make sure that you have already in root folder

**Step 1: Change directory to db-scripts directory**

```shell
cd db-scripts
```

**Step 2: Install dependencies (Optinal: Only need for the first time)**

Window: 
```bash
npm install -g ts-node; npm install
```

Linux / MacOS
```shell
sudo npm install -g ts-node; npm install
```

**Step 3: Clean up old data**

```shell
npx ts-node sample-data.ts --delete-data
```

**Step 4: Import all data**

```shell
npx ts-node sample-data.ts --import-data
```

## Local Installation

### Install with docker compose

> Make sure that you have already in root folder

**Step 1: Change directory to docker-compose directory**

```shell
cd docker-compose
```

**Step 2: Run build the docker compose** (Optional: Only for first time installation)

Window: 

```bash
docker compose up --build
```

Linux / MacOS:

```shell
sudo docker compose up --build
```

Alternative Linux / MacOS:

```shell
sudo docker-compose up --build
```

**Step 3: Run docker compose** (Skipped if you have already run step 2)

Window: 

```bash
docker compose up
```

Linux / MacOS:

```shell
sudo docker compose up
```

Alternative Linux / MacOS:

```shell
sudo docker-compose up
```

> **Congrats, That all !! Now you can use the link below to access each service**

## Links

> - Student: [http://localhost:3000](http://localhost:3000).
> - Lecturer: [http://localhost:3001/auth/login](http://localhost:3001/auth/login).
> - Admin: [http://localhost:3002/auth/login](http://localhost:3002/auth/login).

## Deployment Links
> - Student: [https://awa-classroom-student.onrender.com](https://awa-classroom-student.onrender.com).
> - Lecturer: [https://awa-classroom-lecturer.onrender.com/auth/login](https://awa-classroom-lecturer.onrender.com/auth/login).
> - Admin: [https://awa-classroom-admin.onrender.com/auth/login](https://awa-classroom-admin.onrender.com/auth/login).

### Clean Up Project (If you dont use anymore).
> Make sure that you have already in root folder

**Step 1: Change directory to docker-compose directory**

```shell
cd docker-compose
```

**Step 2: Run clean up the docker compose**

Window: 

```bash
docker compose down -v --rmi all --remove-orphans
```

Linux / MacOS:

```shell
sudo docker compose down -v --rmi all --remove-orphans
```

Alternative Linux / MacOS:

```shell
sudo docker-compose down -v --rmi all --remove-orphans
```
