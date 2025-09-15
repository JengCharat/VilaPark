# MySQL + Spring + Next
## Files about Login and Register

### 1. com.vilapark.controller
#### 1.1 AuthController
- Handles authentication endpoints
  - `POST /api/auth/login`
  - `POST /api/auth/register`

### 2. com.vilapark.models
#### 2.1 ERole.java
- Enum for user roles

#### 2.2 Role.java
- Entity class for roles
- Fields:
  - `id`
  - `name`

#### 2.3 User.java
- Entity class for users
- Fields:
  - `id`
  - `username`
  - `email`
  - `password`
  - `roles`

### 3. com.vilapark.payload
#### 3.1 requests
- `LoginRequest.java` → Request body for login
- `SignupRequest.java` → Request body for register

#### 3.2 responses
- `MessageResponse.java` → Generic response messages
- `UserInfoResponse.java` → User info response after login

### 4. com.vilapark.repository
- `CatRepository.java` → CRUD for Cat entity
- `RoleRepository.java` → CRUD for Role entity
- `UserRepository.java` → CRUD for User entity

### 5. com.vilapark.security
#### 5.1 jwt
- `AuthEntryPointJwt.java` → Handles unauthorized access
- `AuthTokenFilter.java` → JWT filter for requests
- `JwtUtils.java` → JWT token utilities

#### 5.2 services
- `UserDetailsImpl.java` → Implements Spring Security UserDetails
- `UserDetailsServiceImpl.java` → Loads user-specific data

#### 5.3 WebSecurityConfig.java
- Security configuration for Spring Boot

### 6. DemoApplication.java
- Main Spring Boot application class

### 7. application.properties
- Don't forget to configure JWT token properties

#### App Properties
```properties
# Name of the JWT cookie
bezkoder.app.jwtCookieName=vilapark

# Secret key for signing JWT
bezkoder.app.jwtSecret========================vilapark=Spring===========================

# JWT expiration time in milliseconds
```

### 8. build.gradle should look like this
```
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    runtimeOnly 'com.mysql:mysql-connector-j'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'

    // Spring Data JPA
        implementation 'org.springframework.boot:spring-boot-starter-data-jpa'


            // Testing
                testImplementation 'org.springframework.boot:spring-boot-starter-test'







implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-impl:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-jackson:0.11.5'
implementation 'org.projectlombok:lombok'
 annotationProcessor 'org.projectlombok:lombok'
 testImplementation 'org.springframework.security:spring-security-test'





}

```


## API / Cat Feature

- com.vilapark.controller
  - AuthController.java
  - CatController.java
- com.vilapark.entity
  - Cat.java
- com.vilapark.repository
  - CatRepository.java









