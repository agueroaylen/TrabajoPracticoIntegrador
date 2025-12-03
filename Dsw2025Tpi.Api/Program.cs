using Microsoft.EntityFrameworkCore;
using Dsw2025Tpi.Application.Services;
using Dsw2025Tpi.Api.Middlewares;
using Dsw2025Tpi.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Identity;
using Dsw2025Tpi.Application.Exceptions;
using Dsw2025Tpi.Application.Constants;
using Dsw2025Tpi.Data.Seed;
using Dsw2025Tpi.Data;

namespace Dsw2025Tpi.Api;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddHealthChecks();

        // CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000", "http://localhost:3003", "http://localhost:3004")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
            });
        });

        // DbContext principal (Products, Orders, Customers)
        builder.Services.AddDbContext<Dsw2025TpiContext>(options =>
        {
            options.UseMySql(
                builder.Configuration.GetConnectionString("DefaultConnection"),
                new MySqlServerVersion(new Version(8, 0, 21))
            );
        });

        // DbContext para Identity (Users, Roles)
        builder.Services.AddDbContext<AuthenticateContext>(options =>
        {
            options.UseMySql(
                builder.Configuration.GetConnectionString("AuthConnection"),
                new MySqlServerVersion(new Version(8, 0, 21))
            );
        });

        // ASP.NET Identity
        builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
        {
            options.Password = new PasswordOptions { RequiredLength = 8 };
        })
        .AddEntityFrameworkStores<AuthenticateContext>()
        .AddDefaultTokenProviders();

        // Servicios
        builder.Services.AddScoped<IProductManagementService, ProductManagementService>();
        builder.Services.AddScoped<IOrderManagementService, OrderManagementService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddSingleton<JwtTokenService>();
        builder.Services.AddTransient<UserSeeder>();

        // JWT
        var jwtConfig = builder.Configuration.GetSection("Jwt");
        var keyText = jwtConfig["Key"] ?? throw new ArgumentNullException("JWT Key");
        var key = Encoding.UTF8.GetBytes(keyText);

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtConfig["Issuer"],
                ValidAudience = jwtConfig["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };

            options.Events = new JwtBearerEvents
            {
                OnChallenge = context =>
                {
                    context.HandleResponse();
                    throw new AuthenticationException(ErrorMessages.UnauthorizedAccess);
                },
                OnForbidden = context =>
                {
                    throw new AuthorizationException(ErrorMessages.ForbiddenAccess);
                }
            };
        });

        // Swagger
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Dsw2025Tpi API", Version = "v1" });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Ingrese un token JWT. Ej: Bearer {token}"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme {
                        Reference = new OpenApiReference {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        var app = builder.Build();

        app.UseMiddleware<ErrorHandlingMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors("AllowFrontend");
        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.MapHealthChecks("/healthcheck");

        // Inicialización de DB
        try
        {
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<Program>>();

            // DB Auth
            var authDb = services.GetRequiredService<AuthenticateContext>();
            await authDb.Database.EnsureCreatedAsync();
            logger.LogInformation("Base de datos de autenticación lista.");

            var userSeeder = services.GetRequiredService<UserSeeder>();
            await userSeeder.SeedAsync();

            // DB principal
            var mainDb = services.GetRequiredService<Dsw2025TpiContext>();
            await mainDb.Database.EnsureCreatedAsync();
            await mainDb.SeedCustomersAsync();
            await mainDb.SeedProductsAsync();

            logger.LogInformation("Base principal inicializada.");
        }
        catch (Exception ex)
        {
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Error al inicializar la base: {Error}", ex.Message);
            throw;
        }

        await app.RunAsync();
    }
}
