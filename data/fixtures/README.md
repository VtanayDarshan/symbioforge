# Mock Data Fixtures - Phase 1 Documentation

## Overview
Phase 1 Foundation establishes comprehensive mock data fixtures for the SymBioForge system. These fixtures support UI development, testing, and demonstration of the core symbiotic matching algorithm.

## Fixture Files

### 1. **factory-profiles.json** (15 factories)
Realistic factory profiles representing diverse Indian industries

**Key Data Points Per Factory:**
- Unique ID and name
- Industry type classification
- Geographic coordinates (latitude/longitude)
- Daily production capacity (kg)
- Raw materials consumed
- Declared waste streams with:
  - Waste stream ID and name
  - Material category
  - Physical form
  - Daily volume (kg)
  - Contamination level (clean → hazardous)
  - Seasonal variation flag

**Industries Covered:**
- Textile manufacturing
- Metal fabrication & machining
- Packaging (cardboard)
- Plastics/polymers
- Chemical processing
- Paper production
- Composite manufacturing
- Organic fertilizer production
- Ceramics
- Automotive parts
- Food processing
- Glass manufacturing
- Leather tanning
- Electronics recycling
- Pharmaceutical manufacturing

**Usage:**
```typescript
const factories = FixtureLoader.loadFactoryProfiles();
const textileFac = FixtureLoader.getFactoriesByIndustry('textile');
```

---

### 2. **materials-properties.json** (11 materials)
Physical, chemical, and economic properties of recyclable materials

**Properties Tracked:**
- Material ID and name
- Category classification
- Physical properties:
  - Density (kg/L)
  - Moisture content (%)
  - Melting/decomposition points (°C)
- Recycling potential (low/medium/high/very_high)
- Market value (USD/kg)
- Storage requirements
- Hazardous properties flag

**Materials Included:**
1. Cotton Lint - $0.45/kg
2. Steel Shavings - $0.12/kg
3. Aluminum Turnings - $1.85/kg (premium scrap)
4. Cardboard Trimmings - $0.08/kg
5. Polyethylene Scraps - $0.65/kg
6. Clay Trimmings - $0.02/kg
7. Organic Compostable Waste - $0.001/kg
8. Glass Cullet - $0.04/kg
9. Spent Catalyst Pellets - $12.50/kg (high value recovery)
10. Casting Sand - $0.005/kg
11. Copper Wire Scraps - $8.20/kg (premium metal)

**Usage:**
```typescript
const materials = FixtureLoader.loadMaterials();
const copper = FixtureLoader.getMaterialByName('Copper Wire Scraps');
const textileMats = FixtureLoader.getMaterialsByCategory('textile');
```

---

### 3. **compatibility-matrix.json** (12 rules + modifiers)
Defines waste stream matching between factories

**Compatibility Rule Structure:**
- Source material category
- Target industries (compatible receivers)
- Base compatibility score (0-100)
- Special requirements (e.g., "Oil-free, no rust")
- Volume range (min/max kg)

**Key Compatibility Rules:**
| Source | Target Industry | Score | Notes |
|--------|------------------|-------|-------|
| Cotton lint | Paper/fertilizer | 92% | High compatibility |
| Steel | Foundries/mills | 95% | Excellent reuse potential |
| Cardboard | Paper/packaging | 94% | Minimal contamination needed |
| Polyethylene | Recycling/molding | 88% | Type separation critical |
| Glass cullet | Glass mfg/aggregate | 92% | Color sorting important |

**Modifiers:**
- Distance factors (1.0 → 0.7 based on geographic distance)
- Contamination penalties (-10 to -40 points)
- Volume alignment scoring

**Usage:**
```typescript
const compat = FixtureLoader.loadCompatibilityMatrix();
```

---

### 4. **manufacturing-processes.json** (13 processes)
Manufacturing processes with resource consumption data

**Process Data Points:**
- Process ID and name
- Industry type
- Input materials
- Output waste streams
- Daily resource consumption:
  - Energy (MWh/day)
  - Water (m³/day)
  - Chemicals used (list)

**Energy-Intensive Processes:**
- Paper pulping: 52.3 MWh/day
- Metal casting: 45.2 MWh/day
- Automotive machining: 42.7 MWh/day

**Water-Intensive Processes:**
- Paper pulping: 650 m³/day
- Chemical synthesis: 500 m³/day
- Leather tanning: 400 m³/day

**Usage:**
```typescript
const processes = FixtureLoader.loadManufacturingProcesses();
const paperProcess = FixtureLoader.getProcessByIndustry('paper production');
```

---

### 5. **emission-factors.json** (14 factors)
Environmental impact coefficients for processes and waste treatments

**Emission Types:**
- CO₂ (kg per unit processed)
- CH₄ Methane (kg per unit)
- Water pollution (liters per kg)
- Water consumption (liters per kg)
- Particulates PM2.5 (kg per kg)
- Hazardous waste (kg per kg)

**Key Factors:**
| Process | Emission | Factor | Unit |
|---------|----------|--------|------|
| Metal recycling | CO₂ | 0.8 | kg CO₂/kg metal |
| Composting | CO₂ | 0.35 | kg CO₂/kg waste |
| Landfill | CH₄ | 0.05 | kg CH₄/kg waste |
| Grid electricity | CO₂ | 0.73 | kg CO₂/kWh (India) |
| Renewable energy | CO₂ | 0.05 | kg CO₂/kWh |

**Environmental Benefits:**
- Waste diversion: 0.6 kg CO₂-eq avoided per kg

**Usage:**
```typescript
const emissions = FixtureLoader.loadEmissionFactors();
const steelCO2 = FixtureLoader.getEmissionFactor('metal', 'CO2');
```

---

### 6. **market-pricing.json** (11 priced materials + factors)
Real market pricing for recyclable materials

**Pricing Data Points:**
- Material name
- Current price (USD/kg)
- Price range (historical min/max)
- Market trend (stable/volatile/upward/downward)
- Typical buyers
- Market notes

**Price Volatility:**
- High: Copper scrap ($6.50-$10.50/kg) - tied to LME
- Medium: Steel ($0.08-$0.18/kg) - commodity sensitive
- Stable: Cardboard ($0.05-$0.12/kg), Clay ($0.01-$0.04/kg)

**Market Factors:**
- Global commodity price indices
- Regional variations (India growth, Asia hub, Europe premium)
- Seasonal patterns (summer, monsoon, winter)
- Transportation costs (0.02 USD per ton-km)
- Minimum shipment size: 5,000 kg

**Usage:**
```typescript
const pricing = FixtureLoader.loadMarketPricing();
const copperPrice = FixtureLoader.getPriceForMaterial('Copper Wire Scraps');
```

---

## Data Statistics

| Metric | Count |
|--------|-------|
| Total Factories | 15 |
| Total Materials | 11 |
| Compatibility Rules | 12 |
| Manufacturing Processes | 13 |
| Emission Factors | 14 |
| Priced Materials | 11 |
| Industries Represented | 15 |
| Material Categories | 7 |

---

## Geographic Coverage

All factories are positioned in India with realistic coordinates for:
- Tier-1 metros (Delhi, Mumbai, Bangalore)
- Tier-2 cities (Pune, Ahmedabad, Nagpur)
- Industrial clusters (Indore, Surat, Aurangabad)

Distance-based matching is enabled for spatial waste stream analysis.

---

## Using FixtureLoader

### Setup
```typescript
import { FixtureLoader } from './utils/fixture-loader';
```

### Common Queries

**Get all data:**
```typescript
const allFixtures = FixtureLoader.loadAllFixtures();
```

**Find matching opportunities:**
```typescript
const sourceFactory = FixtureLoader.getFactoryById('FAC001');
const compatRules = FixtureLoader.loadCompatibilityMatrix();
const targetFactories = FixtureLoader.getFactoriesByIndustry('paper production');
```

**Calculate environmental impact:**
```typescript
const emissionFactor = FixtureLoader.getEmissionFactor('metal recycling', 'CO2');
const dailyWaste = sourceFactory.declaredWasteOutputs[0].estimatedDailyVolumeKg;
const co2Avoided = dailyWaste * emissionFactor.factorValue;
```

**Economic analysis:**
```typescript
const price = FixtureLoader.getPriceForMaterial('Copper Wire Scraps');
const revenue = dailyWaste * price.pricePerKg;
```

**Statistics:**
```typescript
const stats = FixtureLoader.getStatistics();
console.log(`Total factories: ${stats.totalFactories}`);
```

---

## Next Steps (Phase 2)

1. Integrate FixtureLoader with React components
2. Build UI components that consume this data:
   - Intake form (Clerk widget)
   - Interactive Symbiosis Graph (Matchmaker widget)
   - Dashboard with analytics
3. Connect to MCP server for real-time updates
4. Implement caching strategy for performance

---

## Data Quality Notes

- All factory profiles have realistic, internally consistent data
- Contamination levels correlate with waste type and industry
- Pricing reflects actual market conditions as of 2024-07-25
- Emission factors sourced from EPA, industry associations, and peer-reviewed sources
- Geographic distances can be calculated between any factory pair

---

## Version Control

- **Version**: 1.0
- **Last Updated**: 2024-07-25
- **Created for**: SymBioForge Phase 1
- **Maintained by**: Member 4 (Widget & Data Developer)
