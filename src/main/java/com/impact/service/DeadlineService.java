package com.impact.service;

import com.impact.model.UserType;
import dev.langchain4j.agent.tool.Tool;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DeadlineService {

    @Tool("Returns upcoming financial aid and academic deadlines for the given student type")
    public String getUpcomingEvents(UserType type) {
        return switch (type) {
            case HIGH_SCHOOL -> """
                    - FAFSA Deadline: April 15
                    - 21st Century Scholars Pledge Check: June 30
                    - IU Crimson Commitment (Full Tuition for AGI <$80k): Priority April 15
                    """;
            case COLLEGE -> """
                    - Hoosier Crossroads Grant ($5,500 for AGI <$60k): Apply by April 15
                    - Luddy Career Fair Prep: September 1
                    - SAP (Satisfactory Academic Progress) Audit: October 15
                    """;
            case RETURNING -> """
                    - Adult Student Grant ($2,000): Opens June 1
                    - IU Fresh Start Policy (GPA Reset): Apply by last day of first-semester classes
                    """;
            case GENERAL -> """
                    - FAFSA Priority Date: April 15
                    - Indiana ScholarTrack Account Setup: Ongoing
                    """;
        };
    }
}
