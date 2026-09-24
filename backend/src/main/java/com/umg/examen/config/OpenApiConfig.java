package com.umg.examen.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                // URL relativa: Swagger usa el mismo origen desde el que se abrió (BFF en :3000),
                // en lugar de la dirección interna que springdoc deduce del encabezado Host.
                .servers(List.of(new Server().url("/").description("Mismo origen (BFF)")))
                .info(new Info()
                        .title("API Examen Segundo Parcial - UMG")
                        .description("Documentación interactiva de la API REST para el sistema de gestión de productos con autenticación JWT y roles.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Ingeniería UMG")
                                .email("info@umg.edu.gt"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Ingresa el token JWT obtenido del endpoint /api/auth/login")));
    }
}
