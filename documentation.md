# API Documentation


The following documents the current API endpoints

Requests should be JSON and responses will always be JSON

Please use the request method specified by the endpoint, otherwise, it will get rejected

If authentication is required, the access token should be included in the `Authorization` header in the format: `Authorization: Bearer accesstoken`


## user


### user/get GET

This API returns information about a user based on their userid.
This endpoint requires authentication. It should be noted that using this endpoint for the logged in user is redundant as the payload of the access token contains the same information. 

#### required fields
- userid - the user id of the target user

#### response
- userid - id of the user
- firstname - first name
- lastname - last name
- gradyear - year of graduation
- usertype - type of user. "student", "teacher", or "admin"
- profilepicture - link to profile picture, or "noimg"
- generalaccesslevel - access level. With -1 being suspended account, 0 as unverified, 1 as normal student, 2 as teacher, 3 as admin, and 4 as website devs


### user/login POST

This API returns authentication information based on login.

#### required fields
- email - user's email
- password - the password

#### response
- accessToken - the access token to authenticate on certain endpoints. expires in 20 minutes
- refreshToken - the refresh token to obtain new access tokens with. expires in 7 days or when a new login occurs


### user/logout POST

Logout endpoint. This API will delete the user's existing session. Note that the previous session is also wiped when a new login occurs

#### required fields
- token - the user's refresh token

#### response
`{ status: 200, message: 'Logout success' }`


### user/register POST

Register endpoint. This API creates an account with the information provided. When the endpoint is hit successfully, an email is sent to the email address prompting verification. This email could potentially end up in spam. If the email is not received, you can hit the user/verify/new endpoint. 

#### required fields
- email - user's email. TDSB email required
- password - user's password. Requirement is minimum eight characters, at least one uppercase letter, one lowercase letter, and one number
- firstname - user's first name
- lastname - user's last name
- gradyear - user's graduation year. should be current year or later

#### response
- id - the user's id


### user/tokenrefresh GET

This endpoint is for requesting a new access token with the valid session's refresh token

#### required fields
- token - the refresh token

#### response
- accessToken - the new access token


### user/verify POST

This endpoint is for verifying email with a code sent to the user's email

#### required fields
- code - the verification code

#### response
`{ status: 200, message: "You are verified!" }`


### user/verify/new POST

This endpoint is for sending a new verification email

#### required fields
- userid - the user's id

#### response
`{ status: 200, message: 'New email sent' }`