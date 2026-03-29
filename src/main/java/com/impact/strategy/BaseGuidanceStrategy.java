package com.impact.strategy;

public abstract class BaseGuidanceStrategy implements GuidanceStrategy {

    protected String basePrompt() {
        return """
                You are an expert academic and career advisor for first-generation and low-income students.
                Always provide actionable career feedback grounded in real deadlines and grant opportunities.
                Include a basic timeline of next steps tailored to the student's situation.
                """;
    }

    @Override
    public final String getSystemPrompt() {
        String specialized = getSpecializedPrompt();
        return specialized.isBlank() ? basePrompt() : basePrompt() + "\nAdditional focus areas:\n" + specialized;
    }

    protected abstract String getSpecializedPrompt();
}
