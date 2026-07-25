import { Module } from '@nitrostack/core';
import { ClerkTools } from './clerk.tools.js';
import { ScoutTools } from './scout.tools.js';
import { ProfilerTools } from './profiler.tools.js';
import { MatchmakerTools } from './matchmaker.tools.js';
import { InventorTools } from './inventor.tools.js';
import { AuditorTools } from './auditor.tools.js';
import { ArchitectTools } from './architect.tools.js';
import { SentinelTools } from './sentinel.tools.js';
import { SwarmTools } from './swarm.tools.js';
import { ClusterResources } from './cluster.resources.js';

@Module({
  name: 'symbioforge',
  description: 'SymbioForge — Autonomous Circular Manufacturing Intelligence. 8 AI agents that turn factory compliance data into circular economy intelligence.',
  controllers: [
    ClerkTools,
    ScoutTools,
    ProfilerTools,
    MatchmakerTools,
    InventorTools,
    AuditorTools,
    ArchitectTools,
    SentinelTools,
    SwarmTools,
    ClusterResources,
  ],
})
export class SymbioForgeModule {}
