# encourage
Encourage is a small NodeJS + ExpressJS + mongodb boilerplate backend for mobile apps user creation/info/authentication


## API endpoints

### /api/users/<username>

Retrieves user info stored

**Method:** GET

**Output:**

```
{
	"user": { 
				"username": "<username>", 
				"key1": "value1",
				...
				"keyN": "valueN"
			}
}
```	

**HTTP Errors:**

500: DB not ready
404: username not found


### /api/users

Creates a new User on backend and logs in returning authentication token. Also you can add other key-values on user info sent. 

Authentication token is an UUID (ver4) string.

**Method:** POST

**Input:**

```
{
	"username": "<username>",
	"password": "<password>",
	"key1": "value1",
	...
	"keyN": "valueN"
}
```

**Output:**

```
{
	"authToken": "..."
}
```

**HTTP Errors:**

500: DB not ready
409: username conflic

### /api/auth/login

Performs log in based on provided credential, returning authentication token.

**Method:** POST

**Input:**

```
{
	"username": "<username>", 
	"password": "<password>"
}
```

**Output:**

```
{
	"authToken": "...."
}
```

**HTTP Errors:**

500: DB not ready
404: username not found
403: Forbidden (Credentials not good)

### /api/auth/logout

Performs log out of provided authentication token.

**Method:** POST

**Input:**

```
{
	"authToken": "...."
}
```

**HTTP Errors:**

500: DB not ready


