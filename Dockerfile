# Stage 1: Build the Quarkus app
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /build

# Copy POM first (cache dependencies)
COPY pom.xml ./
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src/main src/main
RUN mvn package -DskipTests -q

# Stage 2: Run
FROM eclipse-temurin:21-jre

WORKDIR /deployments

COPY --from=build /build/target/quarkus-app/lib/ lib/
COPY --from=build /build/target/quarkus-app/*.jar ./
COPY --from=build /build/target/quarkus-app/app/ app/
COPY --from=build /build/target/quarkus-app/quarkus/ quarkus/

EXPOSE 8080
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

CMD ["java", "-jar", "quarkus-run.jar"]
