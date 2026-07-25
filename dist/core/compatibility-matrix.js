"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompatibilityMatrix = void 0;
class CompatibilityMatrix {
    /**
     * Evaluates how compatible a specific waste stream is with a target industry type.
     * Returns a score from 0 to 100.
     */
    static evaluate(category, wasteName, targetIndustry) {
        let score = 0;
        for (const rule of this.rules) {
            if (rule.sourceCategory === category && targetIndustry.toLowerCase().includes(rule.targetIndustryType.toLowerCase())) {
                // If a specific name match is required
                if (rule.sourceNameContains) {
                    if (wasteName.toLowerCase().includes(rule.sourceNameContains.toLowerCase())) {
                        score = Math.max(score, rule.baseCompatibilityScore);
                    }
                }
                else {
                    score = Math.max(score, rule.baseCompatibilityScore);
                }
            }
        }
        return score;
    }
}
exports.CompatibilityMatrix = CompatibilityMatrix;
CompatibilityMatrix.rules = [
    {
        sourceCategory: 'organic',
        sourceNameContains: 'cotton lint',
        targetIndustryType: 'paper',
        baseCompatibilityScore: 90
    },
    {
        sourceCategory: 'polymeric',
        sourceNameContains: 'polyester',
        targetIndustryType: 'recycling',
        baseCompatibilityScore: 85
    },
    {
        sourceCategory: 'cellulosic',
        sourceNameContains: 'cardboard',
        targetIndustryType: 'packaging',
        baseCompatibilityScore: 95
    },
    {
        sourceCategory: 'metallic',
        targetIndustryType: 'metal fabrication',
        baseCompatibilityScore: 80
    }
];
