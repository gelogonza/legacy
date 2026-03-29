package com.impact.service;

import com.impact.model.FeatureType;
import com.impact.model.UserType;
import com.impact.rest.UnifiedChatRequest;
import com.impact.strategy.GuidanceStrategyFactory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class PromptAssembler {

    @Inject GuidanceStrategyFactory strategyFactory;
    @Inject ProfileContextBuilder profileContextBuilder;

    public String assemble(UnifiedChatRequest request) {
        String featurePrompt = FeatureType.fromString(request.feature()).getSystemPrompt();
        String strategyPrompt = strategyFactory.getStrategy(parseUserType(request.userType())).getSystemPrompt();
        String profileContext = profileContextBuilder.build(request.profile());

        return String.join("\n\n",
                featurePrompt.isBlank() ? "" : featurePrompt,
                strategyPrompt,
                profileContext.isBlank() ? "" : profileContext
        ).strip();
    }

    private UserType parseUserType(String value) {
        if (value == null || value.isBlank()) return UserType.GENERAL;
        return switch (value.toUpperCase()) {
            case "HIGH_SCHOOL", "HIGHSCHOOL" -> UserType.HIGH_SCHOOL;
            case "COLLEGE"                   -> UserType.COLLEGE;
            case "RETURNING"                 -> UserType.RETURNING;
            default                          -> UserType.GENERAL;
        };
    }
}
