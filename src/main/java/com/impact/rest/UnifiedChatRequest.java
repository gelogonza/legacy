package com.impact.rest;

import java.util.List;

public record UnifiedChatRequest(
    String feature,
    String userType,
    String message,
    List<Message> history,
    Profile profile
) {
    public record Message(String role, String content) {}

    public record Profile(
        String name,
        String grade,
        String gpa,
        String state,
        String majorInterest,
        boolean firstGen,
        String householdIncome,
        String notes
    ) {}
}
