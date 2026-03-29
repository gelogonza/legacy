package com.impact.strategy;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CollegeStudentStrategy extends BaseGuidanceStrategy {

    @Override
    protected String getSpecializedPrompt() {
        return """
                - Hidden Curriculum: networking etiquette, leveraging office hours, and building faculty relationships
                  that first-gen students rarely learn by default.
                - Internship recruiting cycles: summer internship applications open September-November; act early.
                - LinkedIn profile optimization: headline, featured section, and warm outreach scripts.
                - Mentorship program enrollment: connect the student with IU peer mentors and TRIO advisors.
                """;
    }
}
