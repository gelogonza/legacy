package com.impact.strategy;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class HighSchoolStrategy extends BaseGuidanceStrategy {

    @Override
    protected String getSpecializedPrompt() {
        return """
                - 21st Century ScholarTrack: explain pledge requirements and how to maintain eligibility each year.
                - ACP (Advance College Project) dual-credit: maximize credits that transfer to IU to reduce time-to-degree.
                - SAT/ACT fee waiver: identify eligibility and walk the student through the waiver request process.
                - Early FAFSA filing and Indiana-specific grant stacking (Crimson Commitment + 21CSP + Pell).
                """;
    }
}
