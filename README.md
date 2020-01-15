# How to run:

* Setup AWS
* Run database
* Configure Server
* Run server
* Build and run client
* Enjoy

# Setup AWS

Create .aws in ~/ (home dir) and create a text file called `credentials`.
In that file put your AWS credentials as follows

```
[default]
aws_access_key_id = Your-Access-Key
aws_secret_access_key = Your-secret-key
```

```$ export AWS_PROFILE=default

```

## Run database:

Checkout the pro-db project. (https://github.com/ailytic/pro_db)
In the project's root run

```docker-compose up

```

## Configure server:

###DB settings:

---

## Installation

In directory `pro_graphql`

```
$ npm install
```

# Development

```
$ npm run dev
```
