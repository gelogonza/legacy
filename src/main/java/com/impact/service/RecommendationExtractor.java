package com.impact.service;

import com.impact.rest.UnifiedChatResponse.Recommendation;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ApplicationScoped
public class RecommendationExtractor {

    private static final Pattern CHECKBOX = Pattern.compile("- \\[[ x]\\] (.+)");

    public List<Recommendation> extract(String text) {
        if (text == null || text.length() < 80) return List.of();

        List<Recommendation> recs = new ArrayList<>();
        Matcher matcher = CHECKBOX.matcher(text);

        while (matcher.find() && recs.size() < 3) {
            String title = matcher.group(1).trim();
            recs.add(new Recommendation(title, "", inferType(title)));
        }

        return recs;
    }

    private String inferType(String item) {
        String lower = item.toLowerCase();
        if (lower.contains("deadline") || lower.contains("by ") || lower.contains("date"))
            return "deadline";
        if (lower.contains("apply") || lower.contains("submit") || lower.contains("complete")
                || lower.contains("register") || lower.contains("sign"))
            return "action";
        return "resource";
    }
}
