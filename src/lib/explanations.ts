import type { Measure } from './scoring';

/** What each Green Calculator measure means, shown in its "i" info dialog. */
export const EXPLANATIONS: Record<Measure, string> = {
  "Waste Reduction":
    "Waste reduction assesses how actively a company minimises its total waste output through operational improvements, material efficiency, recycling programmes, and waste prevention strategies.\n\nExamples: Conducting annual waste audits, setting formal targets (5–10% per year), composting organic waste, eliminating single-use plastics, transitioning to digital documentation.\n\nImpact: Reduces landfill methane emissions, decreases environmental contamination, and lowers demand for raw material extraction.",
  "Renewable Energy Usage":
    "Evaluates the proportion of a company's energy supply that comes from sustainable sources such as solar, wind, hydro, or biomass.\n\nExamples: Installing solar panels, purchasing certified green electricity, entering renewable energy power purchase agreements (PPAs).\n\nImpact: Cuts CO₂ emissions from fossil fuel combustion, contributing to climate change mitigation.",
  "Water Conservation":
    "Measures how effectively a company reduces freshwater usage through technology upgrades, behaviour change, and reuse initiatives.\n\nExamples: Installing low-flow fixtures, rainwater harvesting, recycling greywater, fixing leaks promptly.\n\nImpact: Reduces energy and chemicals required for water treatment, preserving natural water ecosystems.",
  "Sustainable Supply Chain":
    "Evaluates how a company integrates environmental responsibility into supplier selection, purchasing policies, and logistics.\n\nExamples: Preferring local suppliers, sourcing certified sustainable materials, conducting supplier environmental audits.\n\nImpact: Reduces environmental impact across the entire product lifecycle.",
  "Eco-friendly Products/Services":
    "Measures the extent to which a company designs and offers products or services with reduced environmental impacts.\n\nExamples: Biodegradable packaging, energy-efficient devices, carbon-neutral services, designing for recyclability.\n\nImpact: Lowers total resource footprint and encourages responsible consumer choices.",
  "Energy-Efficient Infrastructure":
    "Assesses the extent to which company buildings are optimised to minimise energy use.\n\nExamples: LED lighting, upgraded insulation, energy management systems, LEED/BREEAM certifications.\n\nImpact: Reduces operational carbon emissions and supports net-zero building targets.",
  "Transportation Sustainability":
    "Measures efforts to minimise emissions from commuting, business travel, and logistics.\n\nExamples: Electrifying vehicle fleets, promoting public transport or cycling, offering remote work, carbon-neutral freight.\n\nImpact: Reduces emissions from transportation — a major source of greenhouse gases.",
  "Community Engagement":
    "Evaluates a company's efforts to raise environmental awareness and support local sustainability initiatives.\n\nExamples: Sponsoring tree-planting drives, employee volunteer days, public education campaigns.\n\nImpact: Multiplies positive environmental impacts and builds goodwill with stakeholders.",
  "Carbon Offsetting":
    "Assesses commitment to compensate for unavoidable greenhouse gas emissions by supporting certified climate projects.\n\nExamples: Purchasing carbon credits from reforestation projects, investing in renewable energy farms.\n\nImpact: Balances emissions while financing global climate mitigation.",
  "Transparency and Reporting":
    "Evaluates how openly a company communicates its environmental impact, targets, and progress.\n\nExamples: Annual sustainability reports (GRI, CDP standards), greenhouse gas inventories, science-based targets.\n\nImpact: Builds stakeholder trust and drives internal accountability.",
};
