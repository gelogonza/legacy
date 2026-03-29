package com.impact.service;

import com.impact.rest.UnifiedChatRequest.Profile;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProfileContextBuilder {

    public String build(Profile profile) {
        if (profile == null) return "";
        if (isBlank(profile.name()) && isBlank(profile.grade()) && isBlank(profile.state())) return "";

        StringBuilder sb = new StringBuilder("Student profile:\n");

        if (!isBlank(profile.name()))
            sb.append("- Name: ").append(profile.name()).append("\n");
        if (!isBlank(profile.grade()))
            sb.append("- Grade/Year: ").append(profile.grade()).append("\n");
        if (!isBlank(profile.gpa()))
            sb.append("- GPA: ").append(profile.gpa()).append("\n");
        if (!isBlank(profile.state()))
            sb.append("- State: ").append(profile.state()).append("\n");
        if (!isBlank(profile.majorInterest()))
            sb.append("- Major interest: ").append(profile.majorInterest()).append("\n");
        sb.append("- First-generation student: ").append(profile.firstGen() ? "yes" : "no").append("\n");
        if (!isBlank(profile.householdIncome()))
            sb.append("- Household income: ").append(profile.householdIncome()).append("\n");
        if (!isBlank(profile.notes()))
            sb.append("- Additional context: ").append(profile.notes()).append("\n");

        sb.append("\nUse this context in all responses. Do not ask for info already in the profile.\n");
        return sb.toString();
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
