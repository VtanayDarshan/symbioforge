import { Module } from '@nitrostack/core';
import { SymbioForgeTools } from './symbioforge.tools.js';

@Module({
  name: 'symbioforge',
  description: 'SymbioForge Autonomous Circular Manufacturing Intelligence Module',
  controllers: [SymbioForgeTools],
  providers: [SymbioForgeTools]
})
export class SymbioForgeModule {}
