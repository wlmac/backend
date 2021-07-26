# API Documentation

The following documents the current API endpoints

POST requests should be used, requests and responses should be JSON

If authentication is required, the access token should be included in the `Authorization` header in the format: `Authorization: Bearer accesstoken`

## user

### user/get

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


### user/login

This API returns authentication information based on login.

#### required fields
- email - user's email
- password - the password

#### response
- accessToken - the access token to authenticate on certain endpoints. expires in 20 minutes
- refreshToken - the refresh token to obtain new access tokens with. expires in 7 days or when a new login occurs