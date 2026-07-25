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
      required: false,
      resourceUri: 'http://localhost:3000/mcp',
      authorizationServers: []
    }),

    CalculatorModule,
    SymbioForgeModule
  ],
  providers: [
    SystemHealthCheck,
  ]
})
export class AppModule {}
