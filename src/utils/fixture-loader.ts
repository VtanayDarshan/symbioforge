import * as fs from 'fs';
import * as path from 'path';

/**
 * FixtureLoader - Utility for loading and accessing mock data fixtures
 * Provides convenient methods to access all fixture data for testing and UI development
 */
export class FixtureLoader {
  private static fixturesPath = path.join(__dirname, '../fixtures');
  private static cache: Map<string, any> = new Map();

  /**
   * Load factory profiles
   */
  static loadFactoryProfiles() {
    return this.loadFixture('factory-profiles.json').factories;
  }

  /**
   * Load materials properties database
   */
  static loadMaterials() {
    return this.loadFixture('materials-properties.json').materials;
  }

  /**
   * Load compatibility matrix and rules
   */
  static loadCompatibilityMatrix() {
    return this.loadFixture('compatibility-matrix.json');
  }

  /**
   * Load manufacturing processes
   */
  static loadManufacturingProcesses() {
    return this.loadFixture('manufacturing-processes.json').processes;
  }

  /**
   * Load emission factors
   */
  static loadEmissionFactors() {
    return this.loadFixture('emission-factors.json').emissionFactors;
  }

  /**
   * Load market pricing data
   */
  static loadMarketPricing() {
    return this.loadFixture('market-pricing.json');
  }

  /**
   * Get all fixtures at once
   */
  static loadAllFixtures() {
    return {
      factories: this.loadFactoryProfiles(),
      materials: this.loadMaterials(),
      compatibility: this.loadCompatibilityMatrix(),
      processes: this.loadManufacturingProcesses(),
      emissions: this.loadEmissionFactors(),
      pricing: this.loadMarketPricing()
    };
  }

  /**
   * Get a specific factory by ID
   */
  static getFactoryById(id: string) {
    const factories = this.loadFactoryProfiles();
    return factories.find(f => f.id === id);
  }

  /**
   * Get factories by industry type
   */
  static getFactoriesByIndustry(industryType: string) {
    const factories = this.loadFactoryProfiles();
    return factories.filter(f => 
      f.industryType.toLowerCase() === industryType.toLowerCase()
    );
  }

  /**
   * Get a specific material by ID
   */
  static getMaterialById(id: string) {
    const materials = this.loadMaterials();
    return materials.find(m => m.id === id);
  }

  /**
   * Get a specific material by name
   */
  static getMaterialByName(name: string) {
    const materials = this.loadMaterials();
    return materials.find(m => m.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Get materials by category
   */
  static getMaterialsByCategory(category: string) {
    const materials = this.loadMaterials();
    return materials.filter(m => m.category === category);
  }

  /**
   * Get manufacturing process by industry type
   */
  static getProcessByIndustry(industryType: string) {
    const processes = this.loadManufacturingProcesses();
    return processes.find(p => 
      p.industryType.toLowerCase() === industryType.toLowerCase()
    );
  }

  /**
   * Get emission factor for a specific process and emission type
   */
  static getEmissionFactor(processType: string, emissionType: string) {
    const factors = this.loadEmissionFactors();
    return factors.find(f => 
      f.processType.toLowerCase().includes(processType.toLowerCase()) &&
      f.emissionType.toLowerCase().includes(emissionType.toLowerCase())
    );
  }

  /**
   * Get price for a specific material
   */
  static getPriceForMaterial(materialName: string) {
    const pricing = this.loadMarketPricing();
    return pricing.marketPricing.find(p =>
      p.materialName.toLowerCase() === materialName.toLowerCase()
    );
  }

  /**
   * Internal method to load and cache fixtures
   */
  private static loadFixture(filename: string) {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    const filePath = path.join(this.fixturesPath, filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    this.cache.set(filename, data);
    return data;
  }

  /**
   * Clear the cache
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Get statistics about the fixtures
   */
  static getStatistics() {
    return {
      totalFactories: this.loadFactoryProfiles().length,
      totalMaterials: this.loadMaterials().length,
      totalProcesses: this.loadManufacturingProcesses().length,
      totalEmissionFactors: this.loadEmissionFactors().length,
      industriesRepresented: new Set(
        this.loadFactoryProfiles().map(f => f.industryType)
      ).size,
      materialsCategories: new Set(
        this.loadMaterials().map(m => m.category)
      ).size
    };
  }
}

// Example usage:
// const factories = FixtureLoader.loadFactoryProfiles();
// const textileFac = FixtureLoader.getFactoriesByIndustry('textile');
// const pricing = FixtureLoader.getPriceForMaterial('Copper Wire Scraps');
