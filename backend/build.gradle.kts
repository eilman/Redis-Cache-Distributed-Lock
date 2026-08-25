plugins {
    java
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
}

group = "com.redis.advanced"
version = "1.0-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.redisson:redisson-spring-boot-starter:3.30.0")
    implementation("com.h2database:h2")
    implementation("com.fasterxml.jackson.core:jackson-databind")

    // Circuit Breaker (Resilience4j)
    implementation("io.github.resilience4j:resilience4j-spring-boot3:2.2.0")

    // Metrics & Monitoring
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")

    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.testcontainers:testcontainers:1.19.8")
    testImplementation("org.testcontainers:junit-jupiter:1.19.8")
}

tasks.test {
    useJUnitPlatform()
}

// Copy frontend build into backend static resources for single JAR deployment
tasks.register<Copy>("copyFrontend") {
    from("${project.rootDir}/frontend/dist")
    into("${layout.buildDirectory.get()}/resources/main/static")
}

tasks.named("processResources") {
    dependsOn("copyFrontend")
}
