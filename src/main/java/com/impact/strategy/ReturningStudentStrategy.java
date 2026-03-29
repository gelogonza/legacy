package com.impact.strategy;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ReturningStudentStrategy extends BaseGuidanceStrategy {

    @Override
    protected String getSpecializedPrompt() {
        return """
                - IU Fresh Start Policy: requires a minimum 3-year gap from last IU enrollment; explain eligibility
                  and the GPA reset mechanism so the student understands exactly what is and isn't forgiven.
                - Academic Renewal process: walk through the formal petition steps and required advisor sign-offs.
                - Credit recovery pathways: evaluate which prior credits transfer, which need retaking, and in what order.
                - Adult Student Grant ($2,000): clarify the June 1 open date and AGI documentation needed.
                """;
    }
}
