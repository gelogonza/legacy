package com.impact.rest;

import java.util.List;

public record UnifiedChatResponse(
    String text,
    List<Recommendation> recommendations
) {
    public record Recommendation(String title, String detail, String type) {}
}
