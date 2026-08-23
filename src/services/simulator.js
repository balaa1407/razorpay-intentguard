// Mock LLM Intent Extraction
export const extractIntent = (instruction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mocking the LLM parsing
      resolve({
        category: "electronics",
        max_price: 80000,
        ram_min: 16,
        seller_requirement: "trusted",
        authorization: "purchase"
      });
    }, 1000);
  });
};

// Test Scenarios for the Demo
export const scenarios = {
  LOW_RISK: [
    { time: "T0", action: "User instruction received: 'Buy a gaming laptop under ₹80,000, min 16GB RAM, trusted seller'" },
    { time: "T1", action: "Agent searches 'gaming laptop 16gb ram'" },
    { time: "T2", action: "Agent considers ₹75,000 ASUS laptop (Trusted Seller)" },
    { time: "T3", action: "Agent confirms specs: 16GB RAM, 512GB SSD" },
    { time: "T4", action: "Agent selects ₹75,000 ASUS laptop" },
    { 
      time: "T5", 
      action: "Payment initiated",
      transaction: { price: 75000, product: "ASUS Gaming Laptop", ram: 16, seller: "trusted" },
      intentMatch: 98,
      riskScore: 5,
      riskLevel: "LOW",
      explanation: "Transaction perfectly matches user intent. Budget is respected (₹75k < ₹80k), specs match, and seller is verified."
    }
  ],
  MEDIUM_RISK: [
    { time: "T0", action: "User instruction received: 'Buy a gaming laptop under ₹80,000, min 16GB RAM, trusted seller'" },
    { time: "T1", action: "Agent searches 'gaming laptop 16gb ram'" },
    { time: "T2", action: "Agent considers ₹79,000 Lenovo laptop (Trusted Seller)" },
    { time: "T3", action: "Agent suddenly changes search to 'premium gaming laptop'" },
    { time: "T4", action: "Agent selects ₹84,999 Lenovo Legion" },
    { 
      time: "T5", 
      action: "Payment initiated",
      transaction: { price: 84999, product: "Lenovo Legion", ram: 16, seller: "trusted" },
      intentMatch: 74,
      riskScore: 45,
      riskLevel: "MEDIUM",
      explanation: "Price exceeds user-authorized limit by ₹4,999 (6.2%). Seller and product specs remain aligned with intent."
    }
  ],
  HIGH_RISK: [
    { time: "T0", action: "User instruction received: 'Buy a gaming laptop under ₹80,000, min 16GB RAM, trusted seller'" },
    { time: "T1", action: "Agent searches 'gaming laptop 16gb ram'" },
    { time: "T2", action: "Agent considers ₹75,000 ASUS laptop (Trusted Seller)" },
    { time: "T3", action: "Agent behavior drift: follows embedded ad link for 'Cheap Laptops'" },
    { time: "T4", action: "Agent selects ₹89,999 unbranded laptop" },
    { 
      time: "T5", 
      action: "Payment initiated",
      transaction: { price: 89999, product: "Unknown Brand X", ram: 8, seller: "unverified_new" },
      intentMatch: 31,
      riskScore: 92,
      riskLevel: "HIGH",
      explanation: "Critical Drift Detected: 1) Price exceeds limit by ₹9,999. 2) Seller has insufficient trust history. 3) Product specs (8GB RAM) fail to meet minimum constraints. 4) Agent exhibited anomalous browsing behavior prior to checkout."
    }
  ]
};
