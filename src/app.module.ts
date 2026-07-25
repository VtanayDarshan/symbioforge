import { McpApp, Module, ConfigModule, OAuthModule } from '@nitrostack/core';
import { CalculatorModule } from './modules/calculator/calculator.module.js';
import { SymbioForgeModule } from './modules/symbioforge.module.js';
import { SystemHealthCheck } from './health/system.health.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'symbioforge',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'SymbioForge — Autonomous Circular Manufacturing Intelligence. 8 AI agents for industrial symbiosis.',
  imports: [
    ConfigModule.forRoot(),
    OAuthModule.forRoot({
      required: process.env.OAUTH_REQUIRED === 'true',
      resourceUri: process.env.RESOURCE_URI || 'http://localhost:3000/mcp',
      authorizationServers: [
        process.env.AUTH_SERVER_URL || 'http://localhost:3000'
      ],
      scopesSupported: ['read', 'write', 'admin'],
      tokenIntrospectionEndpoint: process.env.INTROSPECTION_ENDPOINT,
      tokenIntrospectionClientId: process.env.INTROSPECTION_CLIENT_ID,
      tokenIntrospectionClientSecret: process.env.INTROSPECTION_CLIENT_SECRET,
      audience: process.env.TOKEN_AUDIENCE,
      issuer: process.env.TOKEN_ISSUER,
      jwksUri: process.env.JWKS_URI
    }),
    CalculatorModule,
    SymbioForgeModule
  ],
  providers: [
    SystemHealthCheck,
  ]
})
export class AppModule {}
