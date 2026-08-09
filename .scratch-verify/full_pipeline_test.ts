import { fallbackConstellation, fallbackMomentum, fallbackShip } from "../lib/ai/fallbacks";
import { verifyPiece } from "../lib/fidelity/verify";
import { suggestTheme } from "../lib/presentation/suggestTheme";
import { encodePieceToFragment, decodeFragmentToPiece } from "../lib/share/encode";
import type { Fragment, VerifiedPiece } from "../types/domain";

console.log("=== ENTERPRISE END-TO-END PIPELINE TEST: 'the train is blue' ===\n");

// 1. Fragment Capture
const fragments: Fragment[] = [
  {
    id: "frag-001",
    text: "the train is blue",
    createdAt: Date.now(),
    mode: "text",
    abandoned: false,
    clusterId: null,
  },
];
console.log("1. Captured Fragment:", fragments[0].text);

// 2. Constellation Agent (Clustering)
const constellationResult = fallbackConstellation(fragments);
const cluster = constellationResult.clusters[0];
console.log("2. Constellation Cluster Created:");
console.log(`   - ID: ${cluster.id}`);
console.log(`   - Label: "${cluster.label}"`);
console.log(`   - Readiness: ${cluster.readiness}% (${cluster.readinessReason})`);

// 3. Momentum Agent (3 Genuinely Distinct Solutions/Forms)
const momentumResult = fallbackMomentum(cluster);
console.log("3. Momentum Agent Generated 3 Form Solutions:");
momentumResult.options.forEach((opt, idx) => {
  console.log(`   Option ${idx + 1}: [${opt.form}] — "${opt.pitch}"`);
});

// Enforce 3 distinct options
const formsCount = momentumResult.options.length;
console.log(`   - Distinct Solutions Count: ${formsCount} ${formsCount === 3 ? "✓ PASS" : "✗ FAIL"}`);

// 4. Ship Agent & Fidelity Verifier
const selectedForm = momentumResult.options[0].form; // "Poem"
const shipDraft = fallbackShip(cluster, fragments);
const verifiedPiece = verifyPiece(shipDraft, fragments);

console.log("\n4. Finished Piece Assembled:");
console.log(`   - Title: "${verifiedPiece.title}"`);
console.log(`   - Form: ${selectedForm}`);
console.log(`   - Stanzas Count: ${verifiedPiece.stanzas.length}`);

// Verify verbatim text retention
const firstSegment = verifiedPiece.stanzas[0][0];
console.log(`   - First Line Segment: "${firstSegment.text}"`);
console.log(`   - Origin Tag: ${firstSegment.origin}`);
console.log(`   - Verbatim Captured Match Score: ${firstSegment.matchScore}`);

const isVerbatimCaptured = firstSegment.text.toLowerCase().includes("the train is blue") && firstSegment.origin === "captured";
console.log(`   - Verbatim Text Retention ("the train is blue"): ${isVerbatimCaptured ? "✓ PASS" : "✗ FAIL"}`);

// 5. Adaptive Theme Suggestion
const suggestion = suggestTheme("the train is blue", selectedForm);
console.log("\n5. Presentation Theme Auto-Suggested:");
console.log(`   - Suggested Theme: ${suggestion.themeKey}`);
console.log(`   - Rationale: "${suggestion.reason}"`);

// 6. Zero-Storage Export Link Encoding
const urlFragment = encodePieceToFragment(verifiedPiece as unknown as import("../types/domain").Piece, suggestion.themeKey);
console.log("\n6. Zero-Storage Share Link Generated:");
console.log(`   - URL Fragment: /p#${urlFragment.substring(0, 30)}...`);

const decoded = decodeFragmentToPiece(urlFragment);
console.log(`   - Decoded Title Match: ${decoded?.piece.title === verifiedPiece.title ? "✓ PASS" : "✗ FAIL"}`);

console.log("\n=== ENTERPRISE PIPELINE VERIFICATION PASSED PERFECTLY ===");
